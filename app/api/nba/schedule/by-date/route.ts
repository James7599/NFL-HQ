import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || '2025';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const response = await fetch(
      `https://cf-gotham.sportskeeda.com/taxonomy/event/nba/schedule/by-date?season=${season}&date=${date}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NBA-Hub/1.0)',
        },
        cache: 'no-store' // Always fetch fresh data for live scores
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Schedule by date API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule data' },
      { status: 500 }
    );
  }
}
