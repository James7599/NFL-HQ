import { getAllTeams } from '../data/teams';
import * as fs from 'fs';
import * as path from 'path';

interface TeamDraftPicks {
  teamId: string;
  lastUpdated?: string;
  incomingPicks: any[];
  outgoingPicks: any[];
  historicalPicks: any[];
}

/**
 * Add or update lastUpdated timestamp to all team draft pick files
 */
async function addTimestamps() {
  const allTeams = getAllTeams();
  const dataDir = path.join(process.cwd(), 'public', 'data', 'draft-picks');

  let totalUpdated = 0;
  const timestamp = new Date().toISOString();

  console.log('\n📅 Adding lastUpdated timestamps to all draft pick files\n');
  console.log('─'.repeat(80));
  console.log(`Timestamp: ${timestamp}\n`);

  for (const team of allTeams) {
    const filePath = path.join(dataDir, `${team.id}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${team.abbreviation}: File not found`);
      continue;
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data: TeamDraftPicks = JSON.parse(fileContent);

      // Add or update lastUpdated field
      const hadTimestamp = !!data.lastUpdated;
      data.lastUpdated = timestamp;

      // Write back to file with formatting
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      if (hadTimestamp) {
        console.log(`🔄 ${team.abbreviation.padEnd(4)} - Updated timestamp`);
      } else {
        console.log(`✅ ${team.abbreviation.padEnd(4)} - Added timestamp`);
      }
      totalUpdated++;

    } catch (error) {
      console.log(`❌ ${team.abbreviation.padEnd(4)} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('─'.repeat(80));
  console.log(`\n✨ Complete! Updated ${totalUpdated} team files\n`);
}

addTimestamps().catch(error => {
  console.error('❌ Failed to add timestamps:', error);
  process.exit(1);
});
