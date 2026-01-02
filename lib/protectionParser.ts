/**
 * Protection Parser - Parses and evaluates draft pick protections and swap rights
 */

export type ProtectionRuleType =
  | 'none'                    // No protection
  | 'protected_range'         // Protected 1-4, 1-14, etc.
  | 'inverse_range'           // 31-55, 56-60, etc.
  | 'inverse_conditional'     // Only conveys if team IS in range (e.g., "Only if HOU picks 1-4")
  | 'more_favorable_swap'     // Team gets better of 2 picks
  | 'less_favorable_swap'     // Team gets worse of 2 picks
  | 'most_favorable_multi'    // Team gets best of 3+ picks
  | 'least_favorable_multi'   // Team gets worst of 3+ picks
  | 'complex_manual';         // Too complex, requires manual rule

export interface ProtectionRule {
  type: ProtectionRuleType;

  // For range protections
  range?: { min: number; max: number };
  recipient?: string;  // Who gets it if protection fails

  // For swaps
  teams?: string[];
  beneficiary?: string;  // Who gets the favorable pick
  count?: number;        // For "two most favorable" scenarios

  // Manual override data
  manualEvaluation?: (projectedPositions: Map<string, number>) => string;
}

/**
 * Parse protection string into structured rule
 * Returns null if cannot parse (needs manual rule)
 */
export function parseProtectionString(protectionText: string, from: string): ProtectionRule | null {
  if (!protectionText || protectionText.trim() === '') {
    return { type: 'none' };
  }

  const lower = protectionText.toLowerCase().trim();

  // Pattern 1: "Protected X-Y only; if Z-W goes to TEAM"
  const rangeMatch = lower.match(/protected\s+(\d+)-(\d+)\s+only[;,]?\s*if\s+(\d+)-(\d+)\s+goes\s+to\s+(\w+)/);
  if (rangeMatch) {
    return {
      type: 'protected_range',
      range: { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) },
      recipient: rangeMatch[5].toUpperCase()
    };
  }

  // Pattern 2: Simple inverse range "TEAM X-Y; Y+1-Z to OTHER"
  const inverseMatch = lower.match(/(\w+)\s+(\d+)-(\d+)[;,]?\s*(\d+)-(\d+)\s+to\s+(\w+)/);
  if (inverseMatch) {
    return {
      type: 'inverse_range',
      range: { min: parseInt(inverseMatch[2]), max: parseInt(inverseMatch[3]) },
      recipient: inverseMatch[6].toUpperCase()
    };
  }

  // Pattern 3: "TEAM receives more favorable of TEAM/TEAM"
  const moreFavorableMatch = lower.match(/(\w+)\s+receives\s+more\s+favorable\s+of\s+(\w+)\/(\w+)/);
  if (moreFavorableMatch) {
    const team1 = moreFavorableMatch[2].toUpperCase();
    const team2 = moreFavorableMatch[3].toUpperCase();
    return {
      type: 'more_favorable_swap',
      teams: [team1, team2],
      beneficiary: moreFavorableMatch[1].toUpperCase()
    };
  }

  // Pattern 4: "Less favorable of TEAM or TEAM"
  const lessFavorableMatch = lower.match(/less\s+favorable\s+of\s+(\w+)\s+or\s+(\w+)/);
  if (lessFavorableMatch) {
    const team1 = lessFavorableMatch[1].toUpperCase();
    const team2 = lessFavorableMatch[2].toUpperCase();
    return {
      type: 'less_favorable_swap',
      teams: [team1, team2]
    };
  }

  // Pattern 5: "TEAM protected 1-8; more favorable of TEAM (1-8) or OTHER to TEAM"
  const protectedSwapMatch = lower.match(/(\w+)\s+protected\s+(\d+)-(\d+)[;,]?\s*more\s+favorable\s+of\s+(\w+)\s+\([\d-]+\)\s+or\s+(\w+)\s+to\s+(\w+)/);
  if (protectedSwapMatch) {
    const team1 = protectedSwapMatch[4].toUpperCase();
    const team2 = protectedSwapMatch[5].toUpperCase();
    return {
      type: 'more_favorable_swap',
      teams: [team1, team2],
      beneficiary: protectedSwapMatch[6].toUpperCase(),
      range: { min: parseInt(protectedSwapMatch[2]), max: parseInt(protectedSwapMatch[3]) }
    };
  }

  // Pattern 6: "Only if TEAM picks X-Y" - Inverse conditional
  // Pick only conveys to recipient if original team IS within range
  const inverseConditionalMatch = lower.match(/only\s+if\s+(\w+)\s+picks\s+(\d+)-(\d+)/);
  if (inverseConditionalMatch) {
    return {
      type: 'inverse_conditional',
      range: { min: parseInt(inverseConditionalMatch[2]), max: parseInt(inverseConditionalMatch[3]) }
      // Note: recipient is determined from the "from" field context
    };
  }

  // Check if it's descriptive only (trade history, not a protection)
  if (lower.startsWith('via ') && !lower.includes('swap') && !lower.includes('protected')) {
    return { type: 'none' };
  }

  // Cannot parse - needs manual rule
  return null;
}

/**
 * Evaluate protection rule based on current projected positions
 * Returns the team ID that owns the pick
 */
export function evaluateProtection(
  rule: ProtectionRule,
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  const originalPosition = projectedPositions.get(originalTeamId) || 30;

  switch (rule.type) {
    case 'none':
      return originalTeamId;

    case 'protected_range':
      if (!rule.range || !rule.recipient) return originalTeamId;
      const inProtectedRange = originalPosition >= rule.range.min && originalPosition <= rule.range.max;
      return inProtectedRange ? originalTeamId : convertAbbrevToId(rule.recipient);

    case 'inverse_range':
      if (!rule.range || !rule.recipient) return originalTeamId;
      const inInverseRange = originalPosition >= rule.range.min && originalPosition <= rule.range.max;
      return inInverseRange ? originalTeamId : convertAbbrevToId(rule.recipient);

    case 'inverse_conditional':
      // Pick only conveys if original team IS in range
      // If NOT in range, pick stays with original team
      if (!rule.range || !rule.recipient) return originalTeamId;
      const inConditionalRange = originalPosition >= rule.range.min && originalPosition <= rule.range.max;
      return inConditionalRange ? convertAbbrevToId(rule.recipient) : originalTeamId;

    case 'more_favorable_swap':
      if (!rule.teams || rule.teams.length !== 2) return originalTeamId;
      return executeMoreFavorableSwap(rule.teams, rule.beneficiary, projectedPositions, rule.range);

    case 'less_favorable_swap':
      if (!rule.teams || rule.teams.length !== 2) return originalTeamId;
      return executeLessFavorableSwap(rule.teams, projectedPositions);

    case 'complex_manual':
      if (rule.manualEvaluation) {
        return rule.manualEvaluation(projectedPositions);
      }
      return originalTeamId;

    default:
      return originalTeamId;
  }
}

/**
 * Execute "more favorable" swap between two teams
 * Lower pick number = more favorable (better draft position)
 */
function executeMoreFavorableSwap(
  teams: string[],
  beneficiary: string | undefined,
  projectedPositions: Map<string, number>,
  protectionRange?: { min: number; max: number }
): string {
  const positions = teams.map(team => {
    const teamId = convertAbbrevToId(team);
    return {
      team: teamId,
      position: projectedPositions.get(teamId) || 30
    };
  });

  // If there's a protection range, check if it applies
  if (protectionRange && beneficiary) {
    const beneficiaryId = convertAbbrevToId(beneficiary);
    const beneficiaryPos = positions.find(p => p.team === beneficiaryId);
    if (beneficiaryPos && beneficiaryPos.position >= protectionRange.min && beneficiaryPos.position <= protectionRange.max) {
      return beneficiaryId;
    }
  }

  // Sort by position (lower = better)
  positions.sort((a, b) => a.position - b.position);

  // If beneficiary specified, they get the better pick
  if (beneficiary) {
    return convertAbbrevToId(beneficiary);
  }

  // Otherwise return the team with better position
  return positions[0].team;
}

/**
 * Execute "less favorable" swap between two teams
 * Higher pick number = less favorable (worse draft position)
 */
function executeLessFavorableSwap(
  teams: string[],
  projectedPositions: Map<string, number>
): string {
  const positions = teams.map(team => {
    const teamId = convertAbbrevToId(team);
    return {
      team: teamId,
      position: projectedPositions.get(teamId) || 30
    };
  });

  // Sort by position (higher = worse)
  positions.sort((a, b) => b.position - a.position);

  return positions[0].team;
}

/**
 * Convert team abbreviation to team ID
 * Handles common variations and abbreviations
 */
function convertAbbrevToId(abbrev: string): string {
  const upper = abbrev.toUpperCase().trim();

  const mapping: Record<string, string> = {
    'ATL': 'atlanta-hawks',
    'BOS': 'boston-celtics',
    'BKN': 'brooklyn-nets',
    'CHA': 'charlotte-hornets',
    'CHI': 'chicago-bulls',
    'CLE': 'cleveland-cavaliers',
    'DAL': 'dallas-mavericks',
    'DEN': 'denver-nuggets',
    'DET': 'detroit-pistons',
    'GSW': 'golden-state-warriors',
    'HOU': 'houston-rockets',
    'IND': 'indiana-pacers',
    'LAC': 'los-angeles-clippers',
    'LAL': 'los-angeles-lakers',
    'MEM': 'memphis-grizzlies',
    'MIA': 'miami-heat',
    'MIL': 'milwaukee-bucks',
    'MIN': 'minnesota-timberwolves',
    'NOP': 'new-orleans-pelicans',
    'NYK': 'new-york-knicks',
    'OKC': 'oklahoma-city-thunder',
    'ORL': 'orlando-magic',
    'PHI': 'philadelphia-76ers',
    'PHX': 'phoenix-suns',
    'POR': 'portland-trail-blazers',
    'SAC': 'sacramento-kings',
    'SAS': 'san-antonio-spurs',
    'TOR': 'toronto-raptors',
    'UTA': 'utah-jazz',
    'WAS': 'washington-wizards'
  };

  return mapping[upper] || abbrev.toLowerCase().replace(/\s+/g, '-');
}
