import { getAllTeams } from '../data/teams';
import * as fs from 'fs';
import * as path from 'path';

interface DraftPickData {
  pickId?: string;
  year: number;
  round: number;
  pick?: string;
  from?: string;
  to?: string;
  protections: string;
}

interface TeamDraftPicks {
  teamId: string;
  incomingPicks: DraftPickData[];
  outgoingPicks: DraftPickData[];
  historicalPicks: any[];
}

/**
 * Generate a unique pick ID
 * Format: YEAR-R#-TEAM-TYPE-INDEX
 * Example: 2026-R1-BKN-IN-001
 */
function generatePickId(year: number, round: number, teamId: string, type: 'IN' | 'OUT', index: number): string {
  const teamAbbr = teamId.split('-').map(part => part[0].toUpperCase()).join('');
  const paddedIndex = String(index).padStart(3, '0');
  return `${year}-R${round}-${teamAbbr}-${type}-${paddedIndex}`;
}

async function addPickIds() {
  const allTeams = getAllTeams();
  const dataDir = path.join(process.cwd(), 'public', 'data', 'draft-picks');

  let totalUpdated = 0;
  let totalPicks = 0;

  console.log('\n🔑 Adding unique pick IDs to all draft pick files\n');
  console.log('─'.repeat(80));

  for (const team of allTeams) {
    const filePath = path.join(dataDir, `${team.id}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${team.abbreviation}: File not found`);
      continue;
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data: TeamDraftPicks = JSON.parse(fileContent);

      let updated = false;

      // Add IDs to incoming picks
      data.incomingPicks.forEach((pick, index) => {
        if (!pick.pickId) {
          pick.pickId = generatePickId(pick.year, pick.round, team.id, 'IN', index + 1);
          updated = true;
          totalPicks++;
        }
      });

      // Add IDs to outgoing picks
      data.outgoingPicks.forEach((pick, index) => {
        if (!pick.pickId) {
          pick.pickId = generatePickId(pick.year, pick.round, team.id, 'OUT', index + 1);
          updated = true;
          totalPicks++;
        }
      });

      if (updated) {
        // Write back to file with formatting
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ ${team.abbreviation.padEnd(4)} - Added ${data.incomingPicks.length + data.outgoingPicks.length} pick IDs`);
        totalUpdated++;
      } else {
        console.log(`✓  ${team.abbreviation.padEnd(4)} - Already has pick IDs`);
      }

    } catch (error) {
      console.log(`❌ ${team.abbreviation.padEnd(4)} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('─'.repeat(80));
  console.log(`\n✨ Complete! Updated ${totalUpdated} teams, added ${totalPicks} pick IDs\n`);
}

addPickIds().catch(error => {
  console.error('❌ Failed to add pick IDs:', error);
  process.exit(1);
});
