import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://statics.sportskeeda.com/assets/sheets/tools/free-agents/freeAgentsData.json',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error fetching free agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch free agents data' },
      { status: 500 }
    );
  }
}
