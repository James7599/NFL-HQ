import { getAllTeams } from '../data/teams';
import * as fs from 'fs';
import * as path from 'path';

interface DraftPickData {
  year: number;
  round: number;
  pick?: string;
  from?: string;  // For incoming picks
  to?: string;    // For outgoing picks
  protections: string;
}

interface TeamDraftPicks {
  teamId: string;
  incomingPicks: DraftPickData[];
  outgoingPicks: DraftPickData[];
  historicalPicks: any[];
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  teamId: string;
  category: string;
  message: string;
  details?: any;
}

class DraftPickValidator {
  private allTeams = getAllTeams();
  private teamIdMap = new Map<string, string>();
  private teamAbbrMap = new Map<string, string>();
  private allTeamsPicks = new Map<string, TeamDraftPicks>();
  private issues: ValidationIssue[] = [];

  constructor() {
    // Build lookup maps for team validation
    this.allTeams.forEach(team => {
      this.teamIdMap.set(team.id, team.id);
      this.teamAbbrMap.set(team.abbreviation.toLowerCase(), team.id);
      this.teamAbbrMap.set(team.name.toLowerCase(), team.id);
      this.teamAbbrMap.set(team.fullName.toLowerCase(), team.id);
    });
  }

  async loadAllPicksData() {
    const dataDir = path.join(process.cwd(), 'public', 'data', 'draft-picks');

    for (const team of this.allTeams) {
      const filePath = path.join(dataDir, `${team.id}.json`);

      if (!fs.existsSync(filePath)) {
        this.issues.push({
          severity: 'error',
          teamId: team.id,
          category: 'missing-file',
          message: `Draft picks file missing for ${team.fullName}`,
          details: { expectedPath: filePath }
        });
        continue;
      }

      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data: TeamDraftPicks = JSON.parse(fileContent);
        this.allTeamsPicks.set(team.id, data);
      } catch (error) {
        this.issues.push({
          severity: 'error',
          teamId: team.id,
          category: 'invalid-json',
          message: `Failed to parse JSON for ${team.fullName}`,
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }
  }

  validateDataStructure() {
    console.log('\n🔍 Validating data structure...\n');

    for (const [teamId, teamPicks] of this.allTeamsPicks) {
      const team = this.allTeams.find(t => t.id === teamId);
      if (!team) continue;

      // Check required fields
      if (!Array.isArray(teamPicks.incomingPicks)) {
        this.issues.push({
          severity: 'error',
          teamId,
          category: 'missing-field',
          message: `Missing or invalid 'incomingPicks' array for ${team.fullName}`
        });
      }

      if (!Array.isArray(teamPicks.outgoingPicks)) {
        this.issues.push({
          severity: 'error',
          teamId,
          category: 'missing-field',
          message: `Missing or invalid 'outgoingPicks' array for ${team.fullName}`
        });
      }

      // Validate individual picks
      if (Array.isArray(teamPicks.incomingPicks)) {
        teamPicks.incomingPicks.forEach((pick, index) => {
          this.validatePick(teamId, pick, index, 'incoming');
        });
      }

      if (Array.isArray(teamPicks.outgoingPicks)) {
        teamPicks.outgoingPicks.forEach((pick, index) => {
          this.validatePick(teamId, pick, index, 'outgoing');
        });
      }
    }
  }

  validatePick(teamId: string, pick: any, index: number, type: 'incoming' | 'outgoing') {
    const team = this.allTeams.find(t => t.id === teamId);
    if (!team) return;

    // Check required fields
    if (typeof pick.year !== 'number') {
      this.issues.push({
        severity: 'error',
        teamId,
        category: 'invalid-field',
        message: `${type} pick #${index + 1}: Missing or invalid 'year' field`,
        details: { pick }
      });
    }

    if (typeof pick.round !== 'number' || (pick.round !== 1 && pick.round !== 2)) {
      this.issues.push({
        severity: 'error',
        teamId,
        category: 'invalid-field',
        message: `${type} pick #${index + 1}: Invalid 'round' (must be 1 or 2)`,
        details: { pick }
      });
    }

    // Check for correct field based on type
    if (type === 'incoming') {
      if (typeof pick.from !== 'string' || pick.from.trim() === '') {
        this.issues.push({
          severity: 'error',
          teamId,
          category: 'invalid-field',
          message: `${type} pick #${index + 1}: Missing or invalid 'from' field`,
          details: { pick }
        });
      }
    } else if (type === 'outgoing') {
      if (typeof pick.to !== 'string' || pick.to.trim() === '') {
        this.issues.push({
          severity: 'error',
          teamId,
          category: 'invalid-field',
          message: `${type} pick #${index + 1}: Missing or invalid 'to' field`,
          details: { pick }
        });
      }
    }

    // Validate year range
    if (pick.year && (pick.year < 2025 || pick.year > 2035)) {
      this.issues.push({
        severity: 'warning',
        teamId,
        category: 'unusual-data',
        message: `${type} pick #${index + 1}: Unusual year ${pick.year}`,
        details: { pick }
      });
    }
  }

  validateBidirectionalConsistency() {
    console.log('\n🔄 Validating bidirectional consistency...\n');

    // For each outgoing pick, check if there's a matching incoming pick
    for (const [teamId, teamPicks] of this.allTeamsPicks) {
      const team = this.allTeams.find(t => t.id === teamId);
      if (!team) continue;

      for (const outgoing of teamPicks.outgoingPicks) {
        // Skip if no 'to' field
        if (!outgoing.to) {
          this.issues.push({
            severity: 'error',
            teamId,
            category: 'invalid-field',
            message: `Outgoing pick missing 'to' field`,
            details: { year: outgoing.year, round: outgoing.round }
          });
          continue;
        }

        // Try to find the recipient team
        const recipientTeam = this.findTeamFromString(outgoing.to);

        if (!recipientTeam) {
          this.issues.push({
            severity: 'warning',
            teamId,
            category: 'unmatched-pick',
            message: `Outgoing pick to unknown team: "${outgoing.to}"`,
            details: { year: outgoing.year, round: outgoing.round }
          });
          continue;
        }

        // Check if recipient has matching incoming pick
        const recipientPicks = this.allTeamsPicks.get(recipientTeam);
        if (!recipientPicks) continue;

        const hasMatch = recipientPicks.incomingPicks.some(incoming =>
          incoming.year === outgoing.year &&
          incoming.round === outgoing.round &&
          incoming.from &&
          this.isPickFromTeam(incoming.from, team.abbreviation, team.name)
        );

        if (!hasMatch) {
          this.issues.push({
            severity: 'error',
            teamId,
            category: 'bidirectional-mismatch',
            message: `Outgoing pick to ${recipientTeam} not found in their incoming picks`,
            details: {
              year: outgoing.year,
              round: outgoing.round,
              to: outgoing.from,
              recipientTeamId: recipientTeam
            }
          });
        }
      }
    }
  }

  validateDuplicates() {
    console.log('\n🔍 Checking for duplicate picks...\n');

    for (const [teamId, teamPicks] of this.allTeamsPicks) {
      const team = this.allTeams.find(t => t.id === teamId);
      if (!team) continue;

      // Check for duplicate incoming picks
      const incomingKeys = new Set<string>();
      teamPicks.incomingPicks.forEach((pick, index) => {
        const key = `${pick.year}-R${pick.round}-${pick.from}`;
        if (incomingKeys.has(key)) {
          this.issues.push({
            severity: 'warning',
            teamId,
            category: 'duplicate-pick',
            message: `Duplicate incoming pick: ${pick.year} Round ${pick.round} from ${pick.from}`,
            details: { index, pick }
          });
        }
        incomingKeys.add(key);
      });

      // Check for duplicate outgoing picks
      const outgoingKeys = new Set<string>();
      teamPicks.outgoingPicks.forEach((pick, index) => {
        const key = `${pick.year}-R${pick.round}-${pick.to}`;
        if (outgoingKeys.has(key)) {
          this.issues.push({
            severity: 'warning',
            teamId,
            category: 'duplicate-pick',
            message: `Duplicate outgoing pick: ${pick.year} Round ${pick.round} to ${pick.to}`,
            details: { index, pick }
          });
        }
        outgoingKeys.add(key);
      });
    }
  }

  validateTeamReferences() {
    console.log('\n🏀 Validating team references...\n');

    for (const [teamId, teamPicks] of this.allTeamsPicks) {
      const team = this.allTeams.find(t => t.id === teamId);
      if (!team) continue;

      // Check incoming picks
      teamPicks.incomingPicks.forEach((pick, index) => {
        if (!pick.from) return; // Skip if no 'from' field

        if (pick.from !== 'Own' && !pick.from.toLowerCase().includes('swap')) {
          const referencedTeam = this.findTeamFromString(pick.from);
          if (!referencedTeam && !pick.from.includes(',') && !pick.from.toLowerCase().includes(' or ')) {
            this.issues.push({
              severity: 'warning',
              teamId,
              category: 'unknown-team-reference',
              message: `Incoming pick #${index + 1}: Unknown team reference "${pick.from}"`,
              details: { pick }
            });
          }
        }
      });

      // Check outgoing picks
      teamPicks.outgoingPicks.forEach((pick, index) => {
        if (!pick.to) return; // Skip if no 'to' field

        const referencedTeam = this.findTeamFromString(pick.to);
        if (!referencedTeam && !pick.to.includes(',') && !pick.to.toLowerCase().includes(' or ')) {
          this.issues.push({
            severity: 'warning',
            teamId,
            category: 'unknown-team-reference',
            message: `Outgoing pick #${index + 1}: Unknown team reference "${pick.to}"`,
            details: { pick }
          });
        }
      });
    }
  }

  validateUniqueIds() {
    console.log('\n🔑 Checking for unique pick IDs...\n');

    for (const [teamId, teamPicks] of this.allTeamsPicks) {
      // Check if picks have unique IDs (they won't initially, this is informational)
      const hasIds = teamPicks.incomingPicks.some((pick: any) => 'pickId' in pick);

      if (!hasIds) {
        this.issues.push({
          severity: 'info',
          teamId,
          category: 'missing-pick-ids',
          message: `No unique pickIds found - recommend adding in standardization phase`,
          details: { pickCount: teamPicks.incomingPicks.length + teamPicks.outgoingPicks.length }
        });
      }
    }
  }

  // Helper methods
  findTeamFromString(str: string | undefined): string | null {
    if (!str || typeof str !== 'string') return null;

    const lower = str.toLowerCase();

    // Check for "via TEAM" pattern
    const viaMatch = lower.match(/via\s+(\w+)/);
    if (viaMatch) {
      const teamRef = viaMatch[1];
      const teamId = this.teamAbbrMap.get(teamRef);
      if (teamId) return teamId;
    }

    // Check for direct team reference
    const teamId = this.teamAbbrMap.get(lower);
    if (teamId) return teamId;

    // Check if any team abbreviation/name is in the string
    for (const [key, id] of this.teamAbbrMap) {
      if (lower.includes(key)) {
        return id;
      }
    }

    return null;
  }

  isPickFromTeam(fromStr: string, teamAbbr: string, teamName: string): boolean {
    const lower = fromStr.toLowerCase();
    return lower.includes(teamAbbr.toLowerCase()) ||
           lower.includes(teamName.toLowerCase()) ||
           lower === 'own';
  }

  printReport() {
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('                    DRAFT PICKS VALIDATION REPORT');
    console.log('═'.repeat(80));
    console.log('\n');

    const errors = this.issues.filter(i => i.severity === 'error');
    const warnings = this.issues.filter(i => i.severity === 'warning');
    const infos = this.issues.filter(i => i.severity === 'info');

    console.log(`📊 Summary: ${this.allTeamsPicks.size} teams checked`);
    console.log(`   🔴 Errors: ${errors.length}`);
    console.log(`   🟡 Warnings: ${warnings.length}`);
    console.log(`   🔵 Info: ${infos.length}`);
    console.log('\n');

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ No critical issues found!\n');
      if (infos.length > 0) {
        console.log('ℹ️  Informational items:\n');
        this.printIssues(infos);
      }
      return;
    }

    if (errors.length > 0) {
      console.log('🔴 ERRORS (Must Fix):\n');
      console.log('─'.repeat(80));
      this.printIssues(errors);
      console.log('\n');
    }

    if (warnings.length > 0) {
      console.log('🟡 WARNINGS (Should Review):\n');
      console.log('─'.repeat(80));
      this.printIssues(warnings);
      console.log('\n');
    }

    if (infos.length > 0) {
      console.log('ℹ️  INFO (Recommendations):\n');
      console.log('─'.repeat(80));
      this.printIssues(infos);
      console.log('\n');
    }

    console.log('═'.repeat(80));
    console.log('\n');
  }

  printIssues(issues: ValidationIssue[]) {
    // Group by category
    const grouped = new Map<string, ValidationIssue[]>();
    issues.forEach(issue => {
      const existing = grouped.get(issue.category) || [];
      existing.push(issue);
      grouped.set(issue.category, existing);
    });

    for (const [category, categoryIssues] of grouped) {
      console.log(`\n  📁 ${category.toUpperCase().replace(/-/g, ' ')} (${categoryIssues.length})`);
      categoryIssues.forEach((issue, index) => {
        const team = this.allTeams.find(t => t.id === issue.teamId);
        console.log(`     ${index + 1}. [${team?.abbreviation || issue.teamId}] ${issue.message}`);
        if (issue.details && Object.keys(issue.details).length > 0) {
          console.log(`        Details: ${JSON.stringify(issue.details, null, 2).split('\n').join('\n        ')}`);
        }
      });
    }
  }

  getIssues() {
    return this.issues;
  }

  exportReport(outputPath: string) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        teamsChecked: this.allTeamsPicks.size,
        errors: this.issues.filter(i => i.severity === 'error').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
        infos: this.issues.filter(i => i.severity === 'info').length
      },
      issues: this.issues
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Full report exported to: ${outputPath}\n`);
  }
}

async function main() {
  console.log('\n🏀 NBA Draft Picks Data Validator\n');

  const validator = new DraftPickValidator();

  // Load all data
  console.log('📂 Loading draft picks data...');
  await validator.loadAllPicksData();

  // Run validation checks
  validator.validateDataStructure();
  validator.validateBidirectionalConsistency();
  validator.validateDuplicates();
  validator.validateTeamReferences();
  validator.validateUniqueIds();

  // Print report
  validator.printReport();

  // Export detailed report
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  validator.exportReport(reportPath);

  // Exit with error code if there are errors
  const errors = validator.getIssues().filter(i => i.severity === 'error');
  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});
