import { NextRequest, NextResponse } from 'next/server';

// All 30 NBA team slugs
const TEAM_SLUGS = [
  'atlanta-hawks',
  'boston-celtics',
  'brooklyn-nets',
  'charlotte-hornets',
  'chicago-bulls',
  'cleveland-cavaliers',
  'dallas-mavericks',
  'denver-nuggets',
  'detroit-pistons',
  'golden-state-warriors',
  'houston-rockets',
  'indiana-pacers',
  'la-clippers',
  'los-angeles-lakers',
  'memphis-grizzlies',
  'miami-heat',
  'milwaukee-bucks',
  'minnesota-timberwolves',
  'new-orleans-pelicans',
  'new-york-knicks',
  'oklahoma-city-thunder',
  'orlando-magic',
  'philadelphia-76ers',
  'phoenix-suns',
  'portland-trailblazers',
  'sacramento-kings',
  'san-antonio-spurs',
  'toronto-raptors',
  'utah-jazz',
  'washington-wizards',
];

// Map API slugs to our team IDs
const SLUG_TO_TEAM_ID: Record<string, string> = {
  'la-clippers': 'los-angeles-clippers',
  'portland-trailblazers': 'portland-trail-blazers',
};

interface PlayerStat {
  player_id: number;
  slug: string;
  name: string;
  games_played: number;
  minutes_per_game: string;
  points_per_game: string;
  rebounds_per_game: string;
  offensive_rebounds_per_game: string;
  defensive_rebounds_per_game: string;
  assists_per_game: string;
  steals_per_game: string;
  blocks_per_game: string;
  turnovers_per_game: string;
  fields_goal_percentage: string;
  free_throws_percentage: string;
  three_point_field_goals: number;
  teamId: string;
  teamSlug: string;
  position?: string;
}

interface RosterPlayer {
  name: string;
  slug: string;
  positions: Array<{
    name: string;
    abbreviation: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || '2025';
    const event = searchParams.get('event') || 'regular';
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const includeAllStats = searchParams.get('includeAllStats') === 'true';

    // Fetch player stats from all teams in parallel (limited batch to avoid rate limiting)
    const allPlayerStats: PlayerStat[] = [];

    // Process in batches of 10 to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < TEAM_SLUGS.length; i += batchSize) {
      const batch = TEAM_SLUGS.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map(async (teamSlug) => {
          // Fetch both stats and roster data
          const [statsResponse, rosterResponse] = await Promise.all([
            fetch(
              `https://cf-gotham.sportskeeda.com/taxonomy/event/nba/team-stats/${teamSlug}?season=${season}&event=${event}`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; NBA-Hub/1.0)',
                },
                next: { revalidate: 1800 }
              }
            ),
            fetch(
              `https://api.sportskeeda.com/v1/taxonomy/${teamSlug}?subpage=roster&squad_v2=true`,
              {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; NBA-Hub/1.0)',
                },
                next: { revalidate: 1800 }
              }
            ).catch(() => null)
          ]);

          if (!statsResponse.ok) {
            return [];
          }

          const statsData = await statsResponse.json();
          const playerStats = statsData?.data?.player_stats || [];

          // Get roster data for positions
          let rosterPlayers: RosterPlayer[] = [];
          if (rosterResponse && rosterResponse.ok) {
            const rosterData = await rosterResponse.json();
            rosterPlayers = rosterData?.squad || [];
          }

          // Create a map of player slug to position
          const positionMap: Record<string, string> = {};
          for (const player of rosterPlayers) {
            if (player.positions && player.positions.length > 0) {
              positionMap[player.slug] = player.positions[0].abbreviation;
            }
          }

          // Add team info and position to each player
          const teamId = SLUG_TO_TEAM_ID[teamSlug] || teamSlug;
          return playerStats.map((player: any) => ({
            ...player,
            teamId,
            teamSlug,
            position: positionMap[player.slug] || 'N/A',
          }));
        })
      );

      // Collect successful results
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          allPlayerStats.push(...result.value);
        }
      }
    }

    // Sort and get top N for each category
    const getTopN = (stats: PlayerStat[], key: keyof PlayerStat, n: number) => {
      return [...stats]
        .filter(p => p.games_played >= 5) // Minimum games played filter
        .sort((a, b) => parseFloat(String(b[key]) || '0') - parseFloat(String(a[key]) || '0'))
        .slice(0, n)
        .map(p => ({
          playerId: p.player_id,
          playerSlug: p.slug,
          name: p.name,
          value: String(p[key]),
          teamId: p.teamId,
          gamesPlayed: p.games_played,
          position: p.position || 'N/A',
        }));
    };

    const statLeaders = {
      points: getTopN(allPlayerStats, 'points_per_game', limit),
      rebounds: getTopN(allPlayerStats, 'rebounds_per_game', limit),
      assists: getTopN(allPlayerStats, 'assists_per_game', limit),
      steals: getTopN(allPlayerStats, 'steals_per_game', limit),
      blocks: getTopN(allPlayerStats, 'blocks_per_game', limit),
      minutes: getTopN(allPlayerStats, 'minutes_per_game', limit),
      fieldGoalPct: getTopN(allPlayerStats, 'fields_goal_percentage', limit),
      freeThrowPct: getTopN(allPlayerStats, 'free_throws_percentage', limit),
      threePointers: getTopN(allPlayerStats, 'three_point_field_goals', limit),
    };

    // Format full player stats for modal display
    const formattedAllPlayerStats = includeAllStats
      ? allPlayerStats
          .filter(p => p.games_played >= 5)
          .map(p => ({
            playerId: p.player_id,
            name: p.name,
            teamId: p.teamId,
            gamesPlayed: p.games_played,
            minutesPerGame: p.minutes_per_game,
            pointsPerGame: p.points_per_game,
            reboundsPerGame: p.rebounds_per_game,
            offensiveReboundsPerGame: p.offensive_rebounds_per_game || '0.0',
            defensiveReboundsPerGame: p.defensive_rebounds_per_game || '0.0',
            assistsPerGame: p.assists_per_game,
            stealsPerGame: p.steals_per_game,
            blocksPerGame: p.blocks_per_game,
            turnoversPerGame: p.turnovers_per_game || '0.0',
            fieldGoalPct: p.fields_goal_percentage,
            freeThrowPct: p.free_throws_percentage,
            threePointersMade: p.three_point_field_goals,
            position: p.position || 'N/A',
          }))
      : undefined;

    return NextResponse.json({
      data: statLeaders,
      allPlayerStats: formattedAllPlayerStats,
      totalPlayers: allPlayerStats.length,
      season,
    });

  } catch (error) {
    console.error('Stat Leaders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stat leaders' },
      { status: 500 }
    );
  }
}
