import { NextResponse } from 'next/server';

interface SalaryCapTeamData {
  cap_space: string;
  salary_cap_current_year: string;
  active_cap_spend: string;
  dead_money: string;
}

interface SportsKeedaSalaryCapResponse {
  salary_cap_for_team: SalaryCapTeamData;
}

interface TeamSalarySummary {
  teamId: string;
  capSpace: number;
  salaryCap: number;
  activeCapSpend: number;
  deadMoney: number;
}

// Team ID to Sportskeeda abbreviation mapping
const teamIdMap: Record<string, string> = {
  'arizona-cardinals': 'ari',
  'atlanta-falcons': 'atl',
  'baltimore-ravens': 'bal',
  'buffalo-bills': 'buf',
  'carolina-panthers': 'car',
  'chicago-bears': 'chi',
  'cincinnati-bengals': 'cin',
  'cleveland-browns': 'cle',
  'dallas-cowboys': 'dal',
  'denver-broncos': 'den',
  'detroit-lions': 'det',
  'green-bay-packers': 'gb',
  'houston-texans': 'hou',
  'indianapolis-colts': 'ind',
  'jacksonville-jaguars': 'jax',
  'kansas-city-chiefs': 'kc',
  'las-vegas-raiders': 'lv',
  'los-angeles-chargers': 'lac',
  'los-angeles-rams': 'lar',
  'miami-dolphins': 'mia',
  'minnesota-vikings': 'min',
  'new-england-patriots': 'ne',
  'new-orleans-saints': 'no',
  'new-york-giants': 'nyg',
  'new-york-jets': 'nyj',
  'philadelphia-eagles': 'phi',
  'pittsburgh-steelers': 'pit',
  'san-francisco-49ers': 'sf',
  'seattle-seahawks': 'sea',
  'tampa-bay-buccaneers': 'tb',
  'tennessee-titans': 'ten',
  'washington-commanders': 'was',
};

// Helper function to parse currency strings
function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[,$]/g, ''));
}

// Fetch salary cap for a single team
async function fetchTeamSalaryCap(teamId: string, teamAbbr: string): Promise<TeamSalarySummary> {
  try {
    const response = await fetch(
      `https://statics.sportskeeda.com/assets/sheets/static/nfl/team/subpage/salary-cap/${teamAbbr}.json`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NFL-Team-Pages/1.0)',
        },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data: SportsKeedaSalaryCapResponse = await response.json();

    if (!data.salary_cap_for_team) {
      throw new Error('No salary cap data found');
    }

    return {
      teamId,
      capSpace: parseCurrency(data.salary_cap_for_team.cap_space),
      salaryCap: parseCurrency(data.salary_cap_for_team.salary_cap_current_year),
      activeCapSpend: parseCurrency(data.salary_cap_for_team.active_cap_spend),
      deadMoney: parseCurrency(data.salary_cap_for_team.dead_money),
    };
  } catch (error) {
    console.error(`Error fetching salary cap for ${teamId}:`, error);
    // Return fallback data with NaN to indicate unavailable
    return {
      teamId,
      capSpace: NaN,
      salaryCap: 255400000, // 2025 NFL salary cap
      activeCapSpend: NaN,
      deadMoney: NaN,
    };
  }
}

export async function GET() {
  try {
    // Fetch all teams in parallel
    const teamPromises = Object.entries(teamIdMap).map(([teamId, teamAbbr]) =>
      fetchTeamSalaryCap(teamId, teamAbbr)
    );

    const teams = await Promise.all(teamPromises);

    return NextResponse.json({
      teams,
      lastUpdated: new Date().toISOString(),
      season: 2025,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Bulk Salary Cap API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch salary cap data' },
      { status: 500 }
    );
  }
}
