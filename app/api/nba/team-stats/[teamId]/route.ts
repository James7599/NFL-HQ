import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || '2025';
    const event = searchParams.get('event') || 'regular';

    const response = await fetch(
      `https://cf-gotham.sportskeeda.com/taxonomy/event/nba/team-stats/${teamId}?season=${season}&event=${event}`,
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
    console.error('Team Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team stats data' },
      { status: 500 }
    );
  }
}
