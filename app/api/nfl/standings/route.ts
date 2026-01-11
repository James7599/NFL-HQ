import { NextResponse } from 'next/server';

interface ESPNStandingsEntry {
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    location: string;
    name: string;
  };
  stats: Array<{
    name: string;
    displayName?: string;
    description?: string;
    value?: number;
    displayValue?: string;
    summary?: string;
  }>;
}

interface ESPNStandingsGroup {
  uid: string;
  id: string;
  name: string;
  abbreviation: string;
  isConference?: boolean;
  standings?: {
    entries: ESPNStandingsEntry[];
  };
  children?: ESPNStandingsGroup[];
}

interface ESPNStandingsResponse {
  children: ESPNStandingsGroup[];
}

// ESPN abbreviation to our team ID mapping
const espnToTeamId: Record<string, string> = {
  'ARI': 'arizona-cardinals',
  'ATL': 'atlanta-falcons',
  'BAL': 'baltimore-ravens',
  'BUF': 'buffalo-bills',
  'CAR': 'carolina-panthers',
  'CHI': 'chicago-bears',
  'CIN': 'cincinnati-bengals',
  'CLE': 'cleveland-browns',
  'DAL': 'dallas-cowboys',
  'DEN': 'denver-broncos',
  'DET': 'detroit-lions',
  'GB': 'green-bay-packers',
  'HOU': 'houston-texans',
  'IND': 'indianapolis-colts',
  'JAX': 'jacksonville-jaguars',
  'KC': 'kansas-city-chiefs',
  'LAC': 'los-angeles-chargers',
  'LAR': 'los-angeles-rams',
  'LV': 'las-vegas-raiders',
  'MIA': 'miami-dolphins',
  'MIN': 'minnesota-vikings',
  'NE': 'new-england-patriots',
  'NO': 'new-orleans-saints',
  'NYG': 'new-york-giants',
  'NYJ': 'new-york-jets',
  'PHI': 'philadelphia-eagles',
  'PIT': 'pittsburgh-steelers',
  'SEA': 'seattle-seahawks',
  'SF': 'san-francisco-49ers',
  'TB': 'tampa-bay-buccaneers',
  'TEN': 'tennessee-titans',
  'WSH': 'washington-commanders',
};

// Division ID to division name mapping
const divisionIdToName: Record<string, string> = {
  '1': 'AFC East',
  '4': 'AFC North',
  '3': 'AFC South',
  '2': 'AFC West',
  '10': 'NFC East',
  '12': 'NFC North',
  '11': 'NFC South',
  '13': 'NFC West',
};

function getStatValue(stats: ESPNStandingsEntry['stats'], name: string): string | number | undefined {
  const stat = stats.find(s => s.name === name);
  if (!stat) return undefined;
  return stat.displayValue ?? stat.summary ?? stat.value;
}

function getStatNumericValue(stats: ESPNStandingsEntry['stats'], name: string): number {
  const stat = stats.find(s => s.name === name);
  return stat?.value ?? 0;
}

interface TransformedTeam {
  teamId: string;
  abbreviation: string;
  fullName: string;
  shortName: string;
  conference: 'AFC' | 'NFC';
  division: string;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  gamesBack: number;
  homeRecord: string;
  awayRecord: string;
  confRecord: string;
  divRecord: string;
  streak: string;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: string;
  playoffSeed: number;
  clincher: {
    code: string;
    description: string;
  } | null;
}

export async function GET() {
  try {
    const response = await fetch(
      'https://site.api.espn.com/apis/v2/sports/football/nfl/standings',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NFL-Standings/1.0)',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: ESPNStandingsResponse = await response.json();
    const standings: TransformedTeam[] = [];

    // Process each conference
    for (const conference of data.children) {
      const conferenceName = conference.abbreviation as 'AFC' | 'NFC';

      if (!conference.standings?.entries) continue;

      for (const entry of conference.standings.entries) {
        const abbr = entry.team.abbreviation;
        const teamId = espnToTeamId[abbr];

        if (!teamId) {
          console.warn(`Unknown team abbreviation: ${abbr}`);
          continue;
        }

        // Get clincher info
        const clincherStat = entry.stats.find(s => s.name === 'clincher');
        let clincher: TransformedTeam['clincher'] = null;

        if (clincherStat?.displayValue && clincherStat.description) {
          clincher = {
            code: clincherStat.displayValue,
            description: clincherStat.description,
          };
        }

        // Determine division from team's group
        // ESPN returns teams sorted by conference, we need to figure out divisions
        // For now, we'll need to infer from the division record or use a lookup
        const divRecord = getStatValue(entry.stats, 'divisionRecord') as string || '0-0';

        // Get playoff seed to help determine division
        const playoffSeed = getStatNumericValue(entry.stats, 'playoffSeed');

        const team: TransformedTeam = {
          teamId,
          abbreviation: abbr,
          fullName: entry.team.displayName,
          shortName: entry.team.shortDisplayName,
          conference: conferenceName,
          division: '', // Will be filled in below
          wins: getStatNumericValue(entry.stats, 'wins'),
          losses: getStatNumericValue(entry.stats, 'losses'),
          ties: getStatNumericValue(entry.stats, 'ties'),
          winPct: getStatNumericValue(entry.stats, 'winPercent'),
          gamesBack: getStatNumericValue(entry.stats, 'gamesBehind'),
          homeRecord: getStatValue(entry.stats, 'Home') as string || '0-0',
          awayRecord: getStatValue(entry.stats, 'Road') as string || '0-0',
          confRecord: getStatValue(entry.stats, 'vs. Conf.') as string || '0-0',
          divRecord,
          streak: getStatValue(entry.stats, 'streak') as string || '-',
          pointsFor: getStatNumericValue(entry.stats, 'pointsFor'),
          pointsAgainst: getStatNumericValue(entry.stats, 'pointsAgainst'),
          pointDiff: getStatValue(entry.stats, 'differential') as string || '0',
          playoffSeed,
          clincher,
        };

        standings.push(team);
      }
    }

    // Now we need to get division info - fetch from a different endpoint or use team data
    // For now, let's make a second call to get division-level standings
    const divResponse = await fetch(
      'https://site.api.espn.com/apis/v2/sports/football/nfl/standings?level=3',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NFL-Standings/1.0)',
        },
        next: { revalidate: 300 }
      }
    );

    if (divResponse.ok) {
      const divData = await divResponse.json();

      // Process division data to get team divisions
      const teamDivisions: Record<string, string> = {};

      for (const conference of divData.children || []) {
        for (const division of conference.children || []) {
          const divName = `${conference.abbreviation} ${division.name.replace(conference.abbreviation + ' ', '')}`;

          if (division.standings?.entries) {
            for (const entry of division.standings.entries) {
              teamDivisions[entry.team.abbreviation] = divName;
            }
          }
        }
      }

      // Update standings with division info
      for (const team of standings) {
        team.division = teamDivisions[team.abbreviation] || `${team.conference} Unknown`;
      }
    }

    return NextResponse.json({
      standings,
      lastUpdated: new Date().toISOString(),
      season: 2025,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('ESPN Standings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings', standings: [] },
      { status: 500 }
    );
  }
}
