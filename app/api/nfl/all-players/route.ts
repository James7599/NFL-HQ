import { NextResponse } from 'next/server';
import { getAllTeams } from '@/data/teams';

interface SportsKeedaPlayer {
  name: string;
  slug: string;
  jersey_no: string;
  is_active: boolean;
  is_practice_squad: boolean;
  positions: Array<{
    name: string;
    abbreviation: string;
  }>;
}

interface SportsKeedaResponse {
  squad: SportsKeedaPlayer[];
}

// Team ID to Sportskeeda slug mapping
const teamSlugMap: Record<string, string> = {
  'arizona-cardinals': 'arizona-cardinals',
  'atlanta-falcons': 'atlanta-falcons',
  'baltimore-ravens': 'baltimore-ravens',
  'buffalo-bills': 'buffalo-bills',
  'carolina-panthers': 'carolina-panthers',
  'chicago-bears': 'chicago-bears',
  'cincinnati-bengals': 'cincinnati-bengals',
  'cleveland-browns': 'cleveland-browns',
  'dallas-cowboys': 'dallas-cowboys',
  'denver-broncos': 'denver-broncos',
  'detroit-lions': 'detroit-lions',
  'green-bay-packers': 'green-bay-packers',
  'houston-texans': 'houston-texans',
  'indianapolis-colts': 'indianapolis-colts',
  'jacksonville-jaguars': 'jacksonville-jaguars',
  'kansas-city-chiefs': 'kansas-city-chiefs',
  'las-vegas-raiders': 'las-vegas-raiders',
  'los-angeles-chargers': 'los-angeles-chargers',
  'los-angeles-rams': 'los-angeles-rams',
  'miami-dolphins': 'miami-dolphins',
  'minnesota-vikings': 'minnesota-vikings',
  'new-england-patriots': 'new-england-patriots',
  'new-orleans-saints': 'new-orleans-saints',
  'new-york-giants': 'new-york-giants',
  'new-york-jets': 'new-york-jets',
  'philadelphia-eagles': 'philadelphia-eagles',
  'pittsburgh-steelers': 'pittsburgh-steelers',
  'san-francisco-49ers': 'san-francisco-49ers',
  'seattle-seahawks': 'seattle-seahawks',
  'tampa-bay-buccaneers': 'tampa-bay-buccaneers',
  'tennessee-titans': 'tennessee-titans',
  'washington-commanders': 'washington-commanders'
};

async function fetchTeamRoster(teamId: string, teamName: string): Promise<Array<{
  id: string;
  name: string;
  position: string;
  team: string;
  teamId: string;
}>> {
  try {
    const sportsKeedaSlug = teamSlugMap[teamId];
    if (!sportsKeedaSlug) return [];

    const response = await fetch(
      `https://api.sportskeeda.com/v1/taxonomy/${sportsKeedaSlug}?include=squad`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NFL-HQ/1.0)',
        },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    );

    if (!response.ok) return [];

    const data: SportsKeedaResponse = await response.json();

    if (!data.squad || !Array.isArray(data.squad)) return [];

    // Transform roster data - only include active roster players (not practice squad)
    return data.squad
      .filter(player => player.is_active && !player.is_practice_squad)
      .map(player => ({
        id: player.slug || player.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: player.name,
        position: player.positions?.[0]?.abbreviation || 'N/A',
        team: teamName,
        teamId: teamId
      }));
  } catch (error) {
    console.error(`Error fetching roster for ${teamId}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    const allTeams = getAllTeams();

    // Fetch all team rosters in parallel
    const rosterPromises = allTeams.map(team =>
      fetchTeamRoster(team.id, team.fullName)
    );

    const allRosters = await Promise.all(rosterPromises);

    // Flatten all rosters into a single array
    const allPlayers = allRosters.flat();

    // Sort alphabetically by name
    allPlayers.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      players: allPlayers,
      totalPlayers: allPlayers.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('All players API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players data' },
      { status: 500 }
    );
  }
}
