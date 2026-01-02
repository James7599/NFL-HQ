import { NextRequest, NextResponse } from 'next/server';

// Map our team IDs to API slugs where they differ
const API_SLUG_MAP: Record<string, string> = {
  'portland-trail-blazers': 'portland-trailblazers',
  'los-angeles-clippers': 'la-clippers',
};

interface APIPlayer {
  name: string;
  slug: string;
  jersey_no: string;
  is_active: boolean;
  height_in_inch?: number;
  height_in_cm?: number;
  weight_in_lbs?: number;
  weight_in_kg?: number;
  college?: string;
  age?: number;
  experience?: {
    year_first: number;
    experience: number;
  };
  birth_date?: string;
  positions: Array<{
    name: string;
    abbreviation: string;
  }>;
}

interface RosterResponse {
  squad: APIPlayer[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    // Convert our team ID to API slug if needed
    const apiSlug = API_SLUG_MAP[teamId] || teamId;

    // Fetch data from Sportskeeda API
    const response = await fetch(
      `https://api.sportskeeda.com/v1/taxonomy/${apiSlug}?subpage=roster&squad_v2=true`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NBA-Hub/1.0)',
        },
        next: { revalidate: 1800 } // Cache for 30 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: RosterResponse = await response.json();

    if (!data.squad || !Array.isArray(data.squad)) {
      return NextResponse.json(
        { error: 'No roster data found' },
        { status: 404 }
      );
    }

    // Filter only active players and return
    const activePlayers = data.squad
      .filter(player => player.is_active)
      .sort((a, b) => parseInt(a.jersey_no) - parseInt(b.jersey_no));

    return NextResponse.json({
      squad: activePlayers,
      totalPlayers: activePlayers.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Roster API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roster data' },
      { status: 500 }
    );
  }
}
