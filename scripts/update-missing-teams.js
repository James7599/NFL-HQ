#!/usr/bin/env node

/**
 * Fetch salary data for teams that failed in the initial scrape
 * Useful for retrying after rate limits
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const OUTPUT_DIR = path.join(__dirname, '../public/data/salary-cap');

// Team abbreviation to Basketball Reference slug mapping
const TEAM_SLUGS = {
  'BKN': 'BRK',
  'CHA': 'CHO',
  'CHI': 'CHI',
  'DET': 'DET',
  'UTA': 'UTA',
  'WAS': 'WAS'
};

// Parse dollar amount from string like "$231,123,456"
function parseDollarAmount(str) {
  if (!str || str === '-') return 0;
  return parseInt(str.replace(/[$,]/g, ''));
}

// Fetch detailed player salaries for a specific team
async function fetchTeamPlayers(slug) {
  console.log(`[${new Date().toISOString()}] Fetching player data for ${slug}...`);

  try {
    const { stdout } = await execAsync(`curl -s "https://www.basketball-reference.com/contracts/${slug}.html"`);

    const players = [];
    const html = stdout.replace(/\n/g, ' ');

    // Extract player rows from the payroll table
    const rowRegex = /<tr[^>]*><th[^>]*data-stat="player"[^>]*>.*?<a[^>]*>([^<]+)<\/a><\/th><td[^>]*data-stat="age_today"[^>]*>(\d+)<\/td><td[^>]*data-stat="y1"[^>]*>([^<]*)<\/td><td[^>]*data-stat="y2"[^>]*>([^<]*)<\/td><td[^>]*data-stat="y3"[^>]*>([^<]*)<\/td><td[^>]*data-stat="y4"[^>]*>([^<]*)<\/td><td[^>]*data-stat="y5"[^>]*>([^<]*)<\/td><td[^>]*data-stat="y6"[^>]*>([^<]*)<\/td><td[^>]*data-stat="remain_gtd"[^>]*>([^<]*)<\/td>/g;

    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const playerName = match[1];
      const age = parseInt(match[2]);
      const y1 = match[3].trim();
      const y2 = match[4].trim();
      const y3 = match[5].trim();
      const y4 = match[6].trim();
      const y5 = match[7].trim();
      const y6 = match[8].trim();
      const guaranteed = match[9].trim();

      players.push({
        name: playerName,
        age: age,
        salaries: {
          '2025-26': parseDollarAmount(y1),
          '2026-27': parseDollarAmount(y2),
          '2027-28': parseDollarAmount(y3),
          '2028-29': parseDollarAmount(y4),
          '2029-30': parseDollarAmount(y5),
          '2030-31': parseDollarAmount(y6),
          guaranteed: parseDollarAmount(guaranteed)
        }
      });
    }

    console.log(`[${new Date().toISOString()}] Fetched ${players.length} players for ${slug}`);
    return players;

  } catch (error) {
    console.error(`Error fetching players for ${slug}:`, error.message);
    return [];
  }
}

// Get team info from summary file
function getTeamInfo(slug) {
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  return summary.teams.find(t => t.slug === slug);
}

// Main function
async function main() {
  console.log(`[${new Date().toISOString()}] Fetching missing teams...`);

  let successCount = 0;
  let failCount = 0;

  for (const [abbrev, slug] of Object.entries(TEAM_SLUGS)) {
    const teamInfo = getTeamInfo(slug);

    if (!teamInfo) {
      console.log(`[${new Date().toISOString()}] Warning: Team info not found for ${slug}`);
      failCount++;
      continue;
    }

    const players = await fetchTeamPlayers(slug);

    if (players.length === 0) {
      console.log(`[${new Date().toISOString()}] ✗ Failed to fetch players for ${teamInfo.name}`);
      failCount++;
    } else {
      const teamData = {
        lastUpdated: new Date().toISOString(),
        source: 'Basketball Reference',
        team: teamInfo.name,
        slug: slug,
        totalPayroll: teamInfo.payroll,
        salaryCap: 154647000,
        capSpace: 154647000 - teamInfo.payroll,
        players: players
      };

      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${abbrev.toLowerCase()}.json`),
        JSON.stringify(teamData, null, 2)
      );

      console.log(`[${new Date().toISOString()}] ✓ Saved data for ${teamInfo.name}`);
      successCount++;
    }

    // Longer delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`[${new Date().toISOString()}] ✓ Completed: ${successCount} succeeded, ${failCount} failed`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fetchTeamPlayers };
