#!/usr/bin/env node

/**
 * Fetch current draft order from Tankathon and save to JSON
 * This runs every 30 minutes to keep the draft order current
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const OUTPUT_FILE = path.join(__dirname, '../public/data/tankathon-draft-order.json');

// Team name mapping
const TEAM_ABBREVS = {
  'Atlanta Hawks': 'ATL',
  'Boston Celtics': 'BOS',
  'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA',
  'Chicago Bulls': 'CHI',
  'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL',
  'Denver Nuggets': 'DEN',
  'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW',
  'Houston Rockets': 'HOU',
  'Indiana Pacers': 'IND',
  'LA Clippers': 'LAC',
  'Los Angeles Clippers': 'LAC',
  'LA Lakers': 'LAL',
  'Los Angeles Lakers': 'LAL',
  'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA',
  'Milwaukee Bucks': 'MIL',
  'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP',
  'New York Knicks': 'NYK',
  'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL',
  'Philadelphia 76ers': 'PHI',
  'Phoenix Suns': 'PHX',
  'Portland Trail Blazers': 'POR',
  'Sacramento Kings': 'SAC',
  'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR',
  'Utah Jazz': 'UTA',
  'Washington Wizards': 'WAS'
};

// Team URL slug to abbreviation mapping
const TEAM_SLUGS = {
  'hawks': 'ATL',
  'celtics': 'BOS',
  'nets': 'BKN',
  'hornets': 'CHA',
  'bulls': 'CHI',
  'cavaliers': 'CLE',
  'mavericks': 'DAL',
  'nuggets': 'DEN',
  'pistons': 'DET',
  'warriors': 'GSW',
  'rockets': 'HOU',
  'pacers': 'IND',
  'clippers': 'LAC',
  'lakers': 'LAL',
  'grizzlies': 'MEM',
  'heat': 'MIA',
  'bucks': 'MIL',
  'timberwolves': 'MIN',
  'pelicans': 'NOP',
  'knicks': 'NYK',
  'thunder': 'OKC',
  'magic': 'ORL',
  '76ers': 'PHI',
  'suns': 'PHX',
  'trail-blazers': 'POR',
  'kings': 'SAC',
  'spurs': 'SAS',
  'raptors': 'TOR',
  'jazz': 'UTA',
  'wizards': 'WAS'
};

async function fetchDraftOrder() {
  console.log(`[${new Date().toISOString()}] Fetching draft order from Tankathon...`);

  try {
    // Use curl to fetch the page
    const { stdout } = await execAsync('curl -s "https://www.tankathon.com/full_draft"');

    const picks = [];

    // Parse HTML for table rows
    // Each pick is in a <tr> with structure:
    // <td class="pick-number">N</td> <td>...<a href="/team-slug">...</a>...[optional via info]...</td>

    const rowRegex = /<tr><td class="pick-number">(\d+)<\/td>\s*<td>.*?<a href="\/([^"]+)">/g;
    const viaRegex = /<div class="trade">.*?<a[^>]+href="\/([^"]+)">/;

    let match;
    const html = stdout.replace(/\n/g, ' '); // Remove newlines for easier regex matching

    while ((match = rowRegex.exec(html)) !== null) {
      const pickNumber = parseInt(match[1]);
      const teamSlug = match[2];
      const team = TEAM_SLUGS[teamSlug];

      if (!team) {
        console.log(`Warning: Unknown team slug "${teamSlug}" for pick ${pickNumber}`);
        continue;
      }

      // Find the via info for this pick (look ahead from current position)
      const remainderStart = match.index + match[0].length;
      const nextPickStart = html.indexOf('<tr><td class="pick-number">', remainderStart);
      const pickHtml = html.substring(remainderStart, nextPickStart > 0 ? nextPickStart : html.length);

      let via = 'Own';
      const viaMatch = pickHtml.match(viaRegex);
      if (viaMatch) {
        const viaSlug = viaMatch[1];
        via = TEAM_SLUGS[viaSlug] || viaSlug.toUpperCase();
      }

      picks.push({
        pick: pickNumber,
        team: team,
        via: via,
        round: pickNumber <= 30 ? 1 : 2
      });
    }

    if (picks.length < 30) {
      console.log(`Warning: Only parsed ${picks.length} picks. Using fallback data...`);
      return getFallbackData();
    }

    console.log(`[${new Date().toISOString()}] Successfully parsed ${picks.length} picks from Tankathon`);
    return picks;

  } catch (error) {
    console.error(`Error fetching from Tankathon:`, error.message);
    console.log('Using fallback data...');
    return getFallbackData();
  }
}

function getFallbackData() {
  // Last known good data from Tankathon
  return [
    { pick: 1, team: 'ATL', via: 'NOP', round: 1 },
    { pick: 2, team: 'WAS', via: 'Own', round: 1 },
    { pick: 3, team: 'IND', via: 'Own', round: 1 },
    { pick: 4, team: 'SAC', via: 'Own', round: 1 },
    { pick: 5, team: 'BKN', via: 'Own', round: 1 },
    { pick: 6, team: 'CHA', via: 'Own', round: 1 },
    { pick: 7, team: 'OKC', via: 'LAC', round: 1 },
    { pick: 8, team: 'DAL', via: 'Own', round: 1 },
    { pick: 9, team: 'OKC', via: 'UTA', round: 1 },
    { pick: 10, team: 'MEM', via: 'Own', round: 1 },
    { pick: 11, team: 'POR', via: 'Own', round: 1 },
    { pick: 12, team: 'CHI', via: 'Own', round: 1 },
    { pick: 13, team: 'MIL', via: 'Own', round: 1 },
    { pick: 14, team: 'SAS', via: 'ATL', round: 1 },
    { pick: 15, team: 'GSW', via: 'Own', round: 1 },
    { pick: 16, team: 'ATL', via: 'CLE', round: 1 },
    { pick: 17, team: 'OKC', via: 'PHI', round: 1 },
    { pick: 18, team: 'MEM', via: 'ORL', round: 1 },
    { pick: 19, team: 'CHA', via: 'PHX', round: 1 },
    { pick: 20, team: 'BOS', via: 'Own', round: 1 },
    { pick: 21, team: 'MIA', via: 'Own', round: 1 },
    { pick: 22, team: 'MIN', via: 'Own', round: 1 },
    { pick: 23, team: 'TOR', via: 'Own', round: 1 },
    { pick: 24, team: 'NYK', via: 'Own', round: 1 },
    { pick: 25, team: 'DEN', via: 'Own', round: 1 },
    { pick: 26, team: 'CLE', via: 'SAS', round: 1 },
    { pick: 27, team: 'OKC', via: 'HOU', round: 1 },
    { pick: 28, team: 'LAL', via: 'Own', round: 1 },
    { pick: 29, team: 'DET', via: 'Own', round: 1 },
    { pick: 30, team: 'WAS', via: 'OKC', round: 1 },
    { pick: 31, team: 'BOS', via: 'NOP', round: 2 },
    { pick: 32, team: 'NYK', via: 'WAS', round: 2 },
    { pick: 33, team: 'MEM', via: 'IND', round: 2 },
    { pick: 34, team: 'BKN', via: 'Own', round: 2 },
    { pick: 35, team: 'SAC', via: 'Own', round: 2 },
    { pick: 36, team: 'LAC', via: 'Own', round: 2 },
    { pick: 37, team: 'SAC', via: 'CHA', round: 2 },
    { pick: 38, team: 'OKC', via: 'DAL', round: 2 },
    { pick: 39, team: 'SAS', via: 'UTA', round: 2 },
    { pick: 40, team: 'SAS', via: 'POR', round: 2 },
    { pick: 41, team: 'LAC', via: 'MEM', round: 2 },
    { pick: 42, team: 'WAS', via: 'CHI', round: 2 },
    { pick: 43, team: 'BOS', via: 'MIL', round: 2 },
    { pick: 44, team: 'CHA', via: 'GSW', round: 2 },
    { pick: 45, team: 'CLE', via: 'Own', round: 2 },
    { pick: 46, team: 'BKN', via: 'ATL', round: 2 },
    { pick: 47, team: 'HOU', via: 'PHI', round: 2 },
    { pick: 48, team: 'ATL', via: 'BOS', round: 2 },
    { pick: 49, team: 'WAS', via: 'PHX', round: 2 },
    { pick: 50, team: 'ORL', via: 'Own', round: 2 },
    { pick: 51, team: 'WAS', via: 'MIN', round: 2 },
    { pick: 52, team: 'SAS', via: 'MIA', round: 2 },
    { pick: 53, team: 'TOR', via: 'Own', round: 2 },
    { pick: 54, team: 'NYK', via: 'Own', round: 2 },
    { pick: 55, team: 'MIN', via: 'SAS', round: 2 },
    { pick: 56, team: 'PHX', via: 'DEN', round: 2 },
    { pick: 57, team: 'HOU', via: 'Own', round: 2 },
    { pick: 58, team: 'TOR', via: 'LAL', round: 2 },
    { pick: 59, team: 'NYK', via: 'DET', round: 2 },
    { pick: 60, team: 'WAS', via: 'OKC', round: 2 }
  ];
}

async function main() {
  const picks = await fetchDraftOrder();

  const data = {
    lastUpdated: new Date().toISOString(),
    source: 'Tankathon',
    picks
  };

  // Ensure directory exists
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log(`[${new Date().toISOString()}] ✓ Saved ${picks.length} picks to ${OUTPUT_FILE}`);
  console.log(`[${new Date().toISOString()}] ✓ Round 1: ${picks.filter(p => p.round === 1).length} picks`);
  console.log(`[${new Date().toISOString()}] ✓ Round 2: ${picks.filter(p => p.round === 2).length} picks`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { fetchDraftOrder, getFallbackData };
