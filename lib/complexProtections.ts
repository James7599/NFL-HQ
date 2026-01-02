/**
 * Complex Protection Evaluations - Manual functions for multi-team arrangements
 * These handle cases too complex for auto-parsing
 */

import { getAllTeams } from '@/data/teams';

/**
 * Helper to convert team abbreviation to team ID
 */
function abbrevToId(abbrev: string): string {
  const mapping: Record<string, string> = {
    'ATL': 'atlanta-hawks', 'BOS': 'boston-celtics', 'BKN': 'brooklyn-nets',
    'CHA': 'charlotte-hornets', 'CHI': 'chicago-bulls', 'CLE': 'cleveland-cavaliers',
    'DAL': 'dallas-mavericks', 'DEN': 'denver-nuggets', 'DET': 'detroit-pistons',
    'GSW': 'golden-state-warriors', 'HOU': 'houston-rockets', 'IND': 'indiana-pacers',
    'LAC': 'los-angeles-clippers', 'LAL': 'los-angeles-lakers', 'MEM': 'memphis-grizzlies',
    'MIA': 'miami-heat', 'MIL': 'milwaukee-bucks', 'MIN': 'minnesota-timberwolves',
    'NOP': 'new-orleans-pelicans', 'NYK': 'new-york-knicks', 'OKC': 'oklahoma-city-thunder',
    'ORL': 'orlando-magic', 'PHI': 'philadelphia-76ers', 'PHX': 'phoenix-suns',
    'POR': 'portland-trail-blazers', 'SAC': 'sacramento-kings', 'SAS': 'san-antonio-spurs',
    'TOR': 'toronto-raptors', 'UTA': 'utah-jazz', 'WAS': 'washington-wizards'
  };
  return mapping[abbrev.toUpperCase()] || abbrev.toLowerCase().replace(/\s+/g, '-');
}

/**
 * 1. OKC/HOU/LAC 3-way (Round 1, 2026)
 * - OKC gets 2 best picks from {OKC own, HOU (if 5-30), LAC}
 * - WAS gets the worst pick
 * - HOU keeps theirs if 1-4
 */
export function evaluateOkcHouLac2026R1(
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  const okcId = abbrevToId('OKC');
  const houId = abbrevToId('HOU');
  const lacId = abbrevToId('LAC');
  const wasId = abbrevToId('WAS');

  const okcPos = projectedPositions.get(okcId) || 30;
  const houPos = projectedPositions.get(houId) || 30;
  const lacPos = projectedPositions.get(lacId) || 30;

  // Houston protected 1-4: if HOU is 1-4, they keep it
  const houInPlay = houPos >= 5;

  // Build list of picks in play
  const picks = [
    { team: okcId, pos: okcPos, label: 'OKC' },
    { team: lacId, pos: lacPos, label: 'LAC' }
  ];

  if (houInPlay) {
    picks.push({ team: houId, pos: houPos, label: 'HOU' });
  }

  // Sort by position (lower = better)
  picks.sort((a, b) => a.pos - b.pos);

  // OKC gets the 2 best
  const okcGets = picks.slice(0, 2).map(p => p.team);

  // WAS gets the worst (if there are 3 picks) or doesn't get one (if only 2)
  const wasGets = picks.length === 3 ? picks[2].team : null;

  // Determine who owns this original team's pick
  if (originalTeamId === okcId) {
    // OKC's own pick - does OKC get to keep it?
    return okcGets.includes(okcId) ? okcId : wasId;
  } else if (originalTeamId === houId) {
    // HOU's pick
    if (!houInPlay) return houId; // Protected, HOU keeps
    return okcGets.includes(houId) ? okcId : wasId;
  } else if (originalTeamId === lacId) {
    // LAC's pick
    return okcGets.includes(lacId) ? okcId : wasId;
  }

  return originalTeamId;
}

/**
 * 2. UTA/MIN/CLE 3-way (Round 1, 2026)
 * - If UTA is 1-8: UTA keeps own pick, MIN gets better of MIN/CLE
 * - If UTA is 9-30: UTA chooses best of {UTA, MIN, CLE}, result goes to OKC; MIN gets second-best
 * - Per data: UTA outgoing "to OKC" if 9-30, OKC incoming "via UTA" with protection "9-30 only"
 */
export function evaluateUtaMinCle2026R1(
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  const utaId = abbrevToId('UTA');
  const minId = abbrevToId('MIN');
  const cleId = abbrevToId('CLE');
  const okcId = abbrevToId('OKC');

  const utaPos = projectedPositions.get(utaId) || 30;
  const minPos = projectedPositions.get(minId) || 30;
  const clePos = projectedPositions.get(cleId) || 30;

  // UTA protected 1-8: if UTA is 1-8, they keep their own pick
  const utaProtected = utaPos <= 8;

  if (utaProtected) {
    // UTA is 1-8, keeps their own pick
    // MIN gets better of MIN/CLE
    if (originalTeamId === utaId) return utaId;
    if (originalTeamId === minId) return minPos <= clePos ? minId : utaId; // UTA gets CLE's if better
    if (originalTeamId === cleId) return clePos <= minPos ? utaId : minId; // UTA or MIN gets it
  } else {
    // UTA is 9-30, swap is active
    const picks = [
      { team: utaId, pos: utaPos },
      { team: minId, pos: minPos },
      { team: cleId, pos: clePos }
    ];

    // Sort by position (lower = better)
    picks.sort((a, b) => a.pos - b.pos);

    // UTA gets best, but it goes to OKC
    const utaChooses = picks[0].team;
    const secondBest = picks[1].team;

    if (originalTeamId === utaId) {
      // UTA's own pick: if UTA chooses it, goes to OKC; otherwise UTA gets secondBest
      return utaChooses === utaId ? okcId : minId;
    } else if (originalTeamId === minId) {
      // MIN's pick: if UTA chooses it, goes to OKC; if not, MIN gets it or gives to MIN
      return utaChooses === minId ? okcId : minId;
    } else if (originalTeamId === cleId) {
      // CLE's pick: if UTA chooses it, goes to OKC; otherwise goes to MIN
      return utaChooses === cleId ? okcId : minId;
    }
  }

  return originalTeamId;
}

/**
 * 3. SAS/ATL swap (Round 1, 2026)
 * - SAS receives more favorable of SAS/ATL
 * - ATL may convey to CLE (secondary arrangement)
 */
export function evaluateSasAtl2026R1(
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  const sasId = abbrevToId('SAS');
  const atlId = abbrevToId('ATL');

  const sasPos = projectedPositions.get(sasId) || 30;
  const atlPos = projectedPositions.get(atlId) || 30;

  // SAS gets the more favorable (better pick)
  const sasGetsBetter = sasPos <= atlPos;

  if (originalTeamId === sasId) {
    return sasId; // SAS always gets the better one
  } else if (originalTeamId === atlId) {
    return sasGetsBetter ? atlId : sasId;
  }

  return originalTeamId;
}

/**
 * 4. MIL/NOP swap with ATL (Round 1, 2026)
 * - ATL gets MORE FAVORABLE of NOP/MIL - NO PROTECTION
 * - Per Atlanta's data: "More favorable of NOP or MIL (via NOP swap for MIL)"
 * - Per Tankathon: Shows "Atlanta (via NO)" at pick #1 even with NOP at position 1
 * - The "protected 1-4" mentioned applies to future years, not 2026
 */
export function evaluateMilNopAtl2026R1(
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  const milId = abbrevToId('MIL');
  const nopId = abbrevToId('NOP');
  const atlId = abbrevToId('ATL');

  const milPos = projectedPositions.get(milId) || 30;
  const nopPos = projectedPositions.get(nopId) || 30;

  // ATL gets the MORE FAVORABLE (better pick) of NOP/MIL
  // Lower position number = better pick
  const atlGetsBetter = nopPos <= milPos ? nopId : milId;

  if (originalTeamId === nopId) {
    // NOP's pick goes to ATL if ATL chose NOP's pick
    return atlGetsBetter === nopId ? atlId : nopId;
  } else if (originalTeamId === milId) {
    // MIL's pick goes to ATL if ATL chose MIL's pick
    return atlGetsBetter === milId ? atlId : milId;
  }

  return originalTeamId;
}

/**
 * 5. BKN/NYK/PHI/PHX/WAS multi-team (Round 1, 2026)
 * Complex arrangement with swap rights based on PHI's pick conveyability
 * This is extremely complex - for now, return original team
 * TODO: Need more details on exact conditions
 */
export function evaluateBknMultiTeam2026R1(
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  // Placeholder - needs detailed logic
  return originalTeamId;
}

/**
 * 6. MEM/ORL/PHX/CHA 4-way (Round 1, 2026)
 * - MEM gets 2 best from {MEM, ORL, PHX/WAS}
 * - CHA gets worst
 */
export function evaluateMemOrlPhxCha2026R1(
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  const memId = abbrevToId('MEM');
  const orlId = abbrevToId('ORL');
  const phxId = abbrevToId('PHX');
  const wasId = abbrevToId('WAS');
  const chaId = abbrevToId('CHA');

  const memPos = projectedPositions.get(memId) || 30;
  const orlPos = projectedPositions.get(orlId) || 30;
  const phxPos = projectedPositions.get(phxId) || 30;
  const wasPos = projectedPositions.get(wasId) || 30;

  // PHX/WAS - need to determine which one
  // For now, using more favorable of PHX/WAS
  const phxWasPos = Math.min(phxPos, wasPos);
  const phxWasId = phxPos <= wasPos ? phxId : wasId;

  const picks = [
    { team: memId, pos: memPos },
    { team: orlId, pos: orlPos },
    { team: phxWasId, pos: phxWasPos }
  ];

  // Sort by position (lower = better)
  picks.sort((a, b) => a.pos - b.pos);

  // MEM gets 2 best
  const memGets = picks.slice(0, 2).map(p => p.team);

  // CHA gets worst
  const chaGets = picks[2].team;

  if (originalTeamId === memId) {
    return memGets.includes(memId) ? memId : chaId;
  } else if (originalTeamId === orlId) {
    return memGets.includes(orlId) ? memId : chaId;
  } else if (originalTeamId === phxId || originalTeamId === wasId) {
    return memGets.includes(phxWasId) ? memId : chaId;
  }

  return originalTeamId;
}

/**
 * 7. OKC/DAL/PHI Round 2 3-way (2026)
 * - OKC gets most favorable
 * - PHX gets 2nd most favorable
 * - WAS gets least favorable
 */
export function evaluateOkcDalPhi2026R2(
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  const okcId = abbrevToId('OKC');
  const dalId = abbrevToId('DAL');
  const phiId = abbrevToId('PHI');
  const phxId = abbrevToId('PHX');
  const wasId = abbrevToId('WAS');

  const okcPos = projectedPositions.get(okcId) || 30;
  const dalPos = projectedPositions.get(dalId) || 30;
  const phiPos = projectedPositions.get(phiId) || 30;

  const picks = [
    { team: okcId, pos: okcPos },
    { team: dalId, pos: dalPos },
    { team: phiId, pos: phiPos }
  ];

  // Sort by position (lower = better in Round 2 as well)
  picks.sort((a, b) => a.pos - b.pos);

  const okcGets = picks[0].team;
  const phxGets = picks[1].team;
  const wasGets = picks[2].team;

  if (originalTeamId === okcId) {
    if (okcGets === okcId) return okcId;
    if (phxGets === okcId) return phxId;
    return wasId;
  } else if (originalTeamId === dalId) {
    if (okcGets === dalId) return okcId;
    if (phxGets === dalId) return phxId;
    return wasId;
  } else if (originalTeamId === phiId) {
    if (okcGets === phiId) return okcId;
    if (phxGets === phiId) return phxId;
    return wasId;
  }

  return originalTeamId;
}

/**
 * 8. ATL/SAS/CLE/UTH/MIN Mega-Swap (Round 1, 2026)
 * Complex 5-team arrangement with circular dependencies
 *
 * ATL gets: more favorable of (i) and (ii)
 *   - (i) = less favorable of ATL and SAS
 *   - (ii) = less favorable of CLE and (more favorable of UTH 1-8 and MIN) [or just CLE if UTH conveyable]
 * CLE gets: less favorable of (i) and (ii)
 * SAS gets: more favorable of ATL and SAS
 * OKC gets: UTH if 9-30
 * MIN gets: less favorable of MIN and UTH (if UTH 1-8)
 */
export function evaluateAtlSasCleMegaSwap2026R1(
  originalTeamId: string,
  projectedPositions: Map<string, number>
): string {
  const atlId = abbrevToId('ATL');
  const sasId = abbrevToId('SAS');
  const cleId = abbrevToId('CLE');
  const utaId = abbrevToId('UTA');
  const minId = abbrevToId('MIN');
  const okcId = abbrevToId('OKC');

  const atlPos = projectedPositions.get(atlId) || 30;
  const sasPos = projectedPositions.get(sasId) || 30;
  const clePos = projectedPositions.get(cleId) || 30;
  const utaPos = projectedPositions.get(utaId) || 30;
  const minPos = projectedPositions.get(minId) || 30;

  // UTH protected 1-8
  const utaProtected = utaPos <= 8;

  // Calculate Group (i): less favorable of ATL and SAS
  const groupI = atlPos <= sasPos ? sasPos : atlPos;
  const groupITeam = atlPos <= sasPos ? sasId : atlId;

  // Calculate Group (ii): less favorable of CLE and (more favorable of UTH/MIN if UTH 1-8, else just consider UTH)
  let groupII, groupIITeam;
  if (utaProtected) {
    // UTH is 1-8, so compare CLE with (more favorable of UTH and MIN)
    const moreFavUtaMin = utaPos <= minPos ? utaPos : minPos;
    const moreFavUtaMinTeam = utaPos <= minPos ? utaId : minId;
    groupII = clePos <= moreFavUtaMin ? moreFavUtaMin : clePos;
    groupIITeam = clePos <= moreFavUtaMin ? moreFavUtaMinTeam : cleId;
  } else {
    // UTH is 9-30 (conveyable), compare CLE with UTH
    groupII = clePos <= utaPos ? utaPos : clePos;
    groupIITeam = clePos <= utaPos ? utaId : cleId;
  }

  // Determine ownership based on original team
  if (originalTeamId === atlId) {
    // ATL gets more favorable (BETTER = LOWER position) of Group(i) and Group(ii)
    // If groupII is better (lower number), return groupIITeam, else return groupITeam
    return groupII <= groupI ? groupIITeam : groupITeam;
  } else if (originalTeamId === sasId) {
    // SAS gets more favorable (BETTER = LOWER position) of ATL and SAS
    return atlPos <= sasPos ? atlId : sasId;
  } else if (originalTeamId === cleId) {
    // CLE gets less favorable (WORSE = HIGHER position) of Group(i) and Group(ii)
    // If groupI is worse (higher number), return groupITeam, else return groupIITeam
    return groupI >= groupII ? groupITeam : groupIITeam;
  } else if (originalTeamId === utaId) {
    // UTH: if 9-30, goes to OKC; if 1-8, UTH keeps
    return utaProtected ? utaId : okcId;
  } else if (originalTeamId === minId) {
    // MIN gets less favorable (WORSE = HIGHER position) of MIN and UTH (if UTH 1-8)
    if (utaProtected) {
      return minPos >= utaPos ? minId : utaId;
    }
    return minId; // UTH not protected, MIN keeps own
  }

  return originalTeamId;
}

/**
 * Lookup table for complex protection functions
 */
export const COMPLEX_PROTECTIONS: Record<string, (originalTeamId: string, projectedPositions: Map<string, number>) => string> = {
  'okc-hou-lac-2026-r1': evaluateOkcHouLac2026R1,
  'uta-min-cle-2026-r1': evaluateUtaMinCle2026R1, // DEPRECATED - use atl-sas-cle-mega instead
  'sas-atl-2026-r1': evaluateSasAtl2026R1, // DEPRECATED - use atl-sas-cle-mega instead
  'atl-sas-cle-mega-2026-r1': evaluateAtlSasCleMegaSwap2026R1, // NEW mega-function
  'mil-nop-atl-2026-r1': evaluateMilNopAtl2026R1,
  'bkn-multi-2026-r1': evaluateBknMultiTeam2026R1,
  'mem-orl-phx-cha-2026-r1': evaluateMemOrlPhxCha2026R1,
  'okc-dal-phi-2026-r2': evaluateOkcDalPhi2026R2
};
