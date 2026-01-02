#!/usr/bin/env node

/**
 * Fetch current NBA salary cap data from Basketball Reference and save to JSON
 * This runs daily to keep salary cap information current
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const OUTPUT_DIR = path.join(__dirname, '../public/data/salary-cap');

// Team abbreviation to Basketball Reference slug mapping
const TEAM_SLUGS = {
  'ATL': 'ATL',
  'BOS': 'BOS',
  'BKN': 'BRK',
  'CHA': 'CHO',
  'CHI': 'CHI',
  'CLE': 'CLE',
  'DAL': 'DAL',
  'DEN': 'DEN',
  'DET': 'DET',
  'GSW': 'GSW',
  'HOU': 'HOU',
  'IND': 'IND',
  'LAC': 'LAC',
  'LAL': 'LAL',
  'MEM': 'MEM',
  'MIA': 'MIA',
  'MIL': 'MIL',
  'MIN': 'MIN',
  'NOP': 'NOP',
  'NYK': 'NYK',
  'OKC': 'OKC',
  'ORL': 'ORL',
  'PHI': 'PHI',
  'PHX': 'PHO',
  'POR': 'POR',
  'SAC': 'SAC',
  'SAS': 'SAS',
  'TOR': 'TOR',
  'UTA': 'UTA',
  'WAS': 'WAS'
};

// Parse dollar amount from string like "$231,123,456"
function parseDollarAmount(str) {
  if (!str || str === '-') return 0;
  return parseInt(str.replace(/[$,]/g, ''));
}

// Fetch team totals from main contracts page
async function fetchTeamTotals() {
  console.log(`[${new Date().toISOString()}] Fetching team salary totals...`);

  try {
    const { stdout } = await execAsync('curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "https://www.basketball-reference.com/contracts/"');

    const teams = [];
    const html = stdout.replace(/\n/g, ' ');

    // Match table rows with team data
    // Format: <tr><th data-stat="ranker">1</th><td data-stat="team_name"><a href="/contracts/TEAM.html">Team Name</a></td><td data-stat="y1">$amount</td>...
    const rowRegex = /<tr[^>]*>.*?data-stat="ranker"[^>]*>(\d+)<\/th>.*?<a href="\/contracts\/([A-Z]{3})\.html">([^<]+)<\/a>.*?data-stat="y1"[^>]*>([^<]+)<\/td>/g;

    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const rank = parseInt(match[1]);
      const slug = match[2];
      const teamName = match[3];
      const payroll = match[4];

      teams.push({
        rank,
        slug,
        name: teamName,
        payroll: parseDollarAmount(payroll)
      });
    }

    console.log(`[${new Date().toISOString()}] Fetched ${teams.length} team totals`);
    return teams;

  } catch (error) {
    console.error(`Error fetching team totals:`, error.message);
    return [];
  }
}

// Fetch detailed player salaries for a specific team
async function fetchTeamPlayers(slug) {
  console.log(`[${new Date().toISOString()}] Fetching player data for ${slug}...`);

  try {
    const { stdout } = await execAsync(`curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "https://www.basketball-reference.com/contracts/${slug}.html"`);

    const players = [];
    const html = stdout.replace(/\n/g, ' ');

    // Extract player rows from the payroll table
    // Format: <tr><th data-stat="player"><a>Player Name</a></th><td data-stat="age_today">Age</td><td data-stat="y1">$amt</td>...<td data-stat="remain_gtd">$amt</td>
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

// Main function
async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Fetch team totals
  const teams = await fetchTeamTotals();

  if (teams.length === 0) {
    console.error('Failed to fetch team data - this may be due to rate limiting or network issues');
    console.error('The workflow will retry automatically if this is a temporary issue');
    process.exit(1);
  }

  if (teams.length < 30) {
    console.warn(`Warning: Only fetched ${teams.length} teams out of 30 expected`);
  }

  // Save team totals
  const summaryData = {
    lastUpdated: new Date().toISOString(),
    source: 'Basketball Reference',
    salaryCap: 154647000, // 2025-26 salary cap
    teams: teams
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'summary.json'),
    JSON.stringify(summaryData, null, 2)
  );

  console.log(`[${new Date().toISOString()}] ✓ Saved team summary`);

  // Fetch detailed player data for each team
  for (const team of teams) {
    const players = await fetchTeamPlayers(team.slug);

    const teamData = {
      lastUpdated: new Date().toISOString(),
      source: 'Basketball Reference',
      team: team.name,
      slug: team.slug,
      totalPayroll: team.payroll,
      salaryCap: 154647000,
      capSpace: 154647000 - team.payroll,
      players: players
    };

    // Convert slug to our team abbreviation
    const ourAbbrev = Object.entries(TEAM_SLUGS).find(([k, v]) => v === team.slug)?.[0] || team.slug;

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${ourAbbrev.toLowerCase()}.json`),
      JSON.stringify(teamData, null, 2)
    );

    console.log(`[${new Date().toISOString()}] ✓ Saved data for ${team.name}`);

    // Longer delay to avoid rate limiting (Basketball Reference has strict limits)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`[${new Date().toISOString()}] ✓ Successfully updated salary data for all teams`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fetchTeamTotals, fetchTeamPlayers };
