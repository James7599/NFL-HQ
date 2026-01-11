import { NextRequest, NextResponse } from 'next/server';
import {
  fetchPlayoffGames,
  fetchGamesByDate,
  fetchCurrentGames,
  fetchTickerGames,
  TransformedGame,
  TickerGame,
} from '@/lib/espn';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const playoffsOnly = searchParams.get('playoffs') === 'true';
    const ticker = searchParams.get('ticker') === 'true';

    let games: TransformedGame[] | TickerGame[];
    let hasLiveGames = false;

    if (ticker) {
      // Ticker format: lightweight data for scrolling ticker
      const tickerGames = await fetchTickerGames();
      hasLiveGames = tickerGames.some(g => g.isLive);

      // Sort games: Live first, then Final (if no live), then upcoming
      const sortedGames = [...tickerGames].sort((a, b) => {
        // Live games always first
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;

        // If no live games, Final games come before upcoming
        if (!hasLiveGames) {
          if (a.isFinal && !b.isFinal) return -1;
          if (!a.isFinal && b.isFinal) return 1;
        }

        return 0; // Keep original order within same category
      });

      games = sortedGames;
    } else if (playoffsOnly) {
      // Fetch all playoff games
      const playoffGames = await fetchPlayoffGames();
      games = playoffGames;
      hasLiveGames = playoffGames.some(g => g.is_live);
    } else if (date) {
      // Fetch games for specific date (YYYY-MM-DD format)
      const dateGames = await fetchGamesByDate(date);
      games = dateGames;
      hasLiveGames = dateGames.some(g => g.is_live);
    } else {
      // Default: fetch current/today's games
      const currentGames = await fetchCurrentGames();
      games = currentGames;
      hasLiveGames = currentGames.some(g => g.is_live);
    }

    // Determine cache time based on game status
    // Live games: 30 seconds, otherwise 5 minutes
    const revalidateTime = hasLiveGames ? 30 : 300;

    return NextResponse.json({
      games,
      totalGames: games.length,
      hasLiveGames,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': `s-maxage=${revalidateTime}, stale-while-revalidate`,
      },
    });
  } catch (error) {
    console.error('ESPN Scoreboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ESPN data' },
      { status: 500 }
    );
  }
}
