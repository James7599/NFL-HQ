import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || '2025';
    const level = searchParams.get('level') || 'conference';

    const response = await fetch(
      `https://cf-gotham.sportskeeda.com/taxonomy/event/nba/standings?season=${season}&level=${level}`,
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

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Standings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings data' },
      { status: 500 }
    );
  }
}
