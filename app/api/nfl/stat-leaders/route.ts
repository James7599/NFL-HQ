import { NextRequest, NextResponse } from 'next/server';

interface StatLeader {
  playerId: number;
  playerSlug: string;
  name: string;
  value: string;
  teamId: string;
  gamesPlayed: number;
  position: string;
}

interface PlayerFullStats {
  playerId: number;
  name: string;
  teamId: string;
  gamesPlayed: number;
  position: string;
  // Passing
  passingYards: string;
  passingTDs: string;
  interceptions: string;
  completionPct: string;
  passerRating: string;
  // Rushing
  rushingYards: string;
  rushingTDs: string;
  yardsPerCarry: string;
  rushingAttempts: string;
  // Receiving
  receivingYards: string;
  receptions: string;
  receivingTDs: string;
  yardsPerReception: string;
  // Defense
  tackles: string;
  sacks: string;
  defensiveInterceptions: string;
  forcedFumbles: string;
}

interface StatLeaders {
  passingYards: StatLeader[];
  passingTDs: StatLeader[];
  rushingYards: StatLeader[];
  rushingTDs: StatLeader[];
  receivingYards: StatLeader[];
  receptions: StatLeader[];
  tackles: StatLeader[];
  sacks: StatLeader[];
  interceptions: StatLeader[];
}

// Sportskeeda API interfaces
interface SportsKeedaPlayerStat {
  player_id: number;
  player_name: string;
  player_slug: string;
  team_id: number;
  team_slug: string;
  position: string;
  games_played: number;
  // Passing stats
  passing_yards?: number;
  passing_touchdowns?: number;
  passing_interceptions?: number;
  pass_completions?: number;
  pass_attempts?: number;
  passer_rating?: number;
  // Rushing stats
  rushing_yards?: number;
  rushing_touchdowns?: number;
  rushing_attempts?: number;
  // Receiving stats
  receiving_yards?: number;
  receptions?: number;
  receiving_touchdowns?: number;
  receiving_targets?: number;
  // Defensive stats
  total_tackles?: number;
  sacks?: number;
  interceptions?: number;
  forced_fumbles?: number;
}

// Team ID to team slug mapping
const teamIdMap: Record<number, string> = {
  355: 'arizona-cardinals',
  323: 'atlanta-falcons',
  366: 'baltimore-ravens',
  324: 'buffalo-bills',
  364: 'carolina-panthers',
  326: 'chicago-bears',
  327: 'cincinnati-bengals',
  329: 'cleveland-browns',
  331: 'dallas-cowboys',
  332: 'denver-broncos',
  334: 'detroit-lions',
  335: 'green-bay-packers',
  325: 'houston-texans',
  338: 'indianapolis-colts',
  365: 'jacksonville-jaguars',
  339: 'kansas-city-chiefs',
  341: 'las-vegas-raiders',
  357: 'los-angeles-chargers',
  343: 'los-angeles-rams',
  345: 'miami-dolphins',
  347: 'minnesota-vikings',
  348: 'new-england-patriots',
  350: 'new-orleans-saints',
  351: 'new-york-giants',
  352: 'new-york-jets',
  354: 'philadelphia-eagles',
  356: 'pittsburgh-steelers',
  359: 'san-francisco-49ers',
  361: 'seattle-seahawks',
  362: 'tampa-bay-buccaneers',
  336: 'tennessee-titans',
  363: 'washington-commanders',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get('season') || '2025';
    const limit = parseInt(searchParams.get('limit') || '100');
    const includeAllStats = searchParams.get('includeAllStats') === 'true';

    // Fetch player stats from Sportskeeda
    const response = await fetch(
      `https://cf-gotham.sportskeeda.com/taxonomy/sport/nfl/player-stats/${season}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NFL-Team-Pages/1.0)',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Sportskeeda API error: ${response.status}`);
    }

    const data = await response.json();
    const players: SportsKeedaPlayerStat[] = data.players || [];

    // Transform and sort players by each category
    const allPlayerStats: PlayerFullStats[] = players.map(player => ({
      playerId: player.player_id,
      name: player.player_name,
      teamId: teamIdMap[player.team_id] || `team-${player.team_id}`,
      gamesPlayed: player.games_played || 0,
      position: player.position || 'N/A',
      // Passing
      passingYards: String(player.passing_yards || 0),
      passingTDs: String(player.passing_touchdowns || 0),
      interceptions: String(player.passing_interceptions || 0),
      completionPct: player.pass_attempts ? String(((player.pass_completions || 0) / player.pass_attempts * 100).toFixed(1)) : '0',
      passerRating: String(player.passer_rating?.toFixed(1) || '0'),
      // Rushing
      rushingYards: String(player.rushing_yards || 0),
      rushingTDs: String(player.rushing_touchdowns || 0),
      yardsPerCarry: player.rushing_attempts ? ((player.rushing_yards || 0) / player.rushing_attempts).toFixed(1) : '0',
      rushingAttempts: String(player.rushing_attempts || 0),
      // Receiving
      receivingYards: String(player.receiving_yards || 0),
      receptions: String(player.receptions || 0),
      receivingTDs: String(player.receiving_touchdowns || 0),
      yardsPerReception: player.receptions ? ((player.receiving_yards || 0) / player.receptions).toFixed(1) : '0',
      // Defense
      tackles: String(player.total_tackles || 0),
      sacks: String(player.sacks || 0),
      defensiveInterceptions: String(player.interceptions || 0),
      forcedFumbles: String(player.forced_fumbles || 0),
    }));

    // Helper function to create stat leaders array
    const createStatLeaders = (
      statKey: keyof SportsKeedaPlayerStat,
      outputKey: keyof PlayerFullStats
    ): StatLeader[] => {
      return players
        .filter(p => (p[statKey] as number || 0) > 0)
        .sort((a, b) => ((b[statKey] as number) || 0) - ((a[statKey] as number) || 0))
        .slice(0, limit)
        .map(player => {
          const fullStats = allPlayerStats.find(p => p.playerId === player.player_id)!;
          return {
            playerId: player.player_id,
            playerSlug: player.player_slug,
            name: player.player_name,
            value: fullStats[outputKey] as string,
            teamId: teamIdMap[player.team_id] || `team-${player.team_id}`,
            gamesPlayed: player.games_played || 0,
            position: player.position || 'N/A',
          };
        });
    };

    const statLeaders: StatLeaders = {
      passingYards: createStatLeaders('passing_yards', 'passingYards'),
      passingTDs: createStatLeaders('passing_touchdowns', 'passingTDs'),
      rushingYards: createStatLeaders('rushing_yards', 'rushingYards'),
      rushingTDs: createStatLeaders('rushing_touchdowns', 'rushingTDs'),
      receivingYards: createStatLeaders('receiving_yards', 'receivingYards'),
      receptions: createStatLeaders('receptions', 'receptions'),
      tackles: createStatLeaders('total_tackles', 'tackles'),
      sacks: createStatLeaders('sacks', 'sacks'),
      interceptions: createStatLeaders('interceptions', 'defensiveInterceptions'),
    };

    return NextResponse.json({
      data: statLeaders,
      allPlayerStats: includeAllStats ? allPlayerStats : undefined,
      season: parseInt(season),
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Stat Leaders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stat leaders data' },
      { status: 500 }
    );
  }
}
