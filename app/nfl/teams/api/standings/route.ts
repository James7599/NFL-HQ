import { NextResponse } from 'next/server';
import { teams } from '@/data/teams';

// Team ID to Sportskeeda team ID mapping
const teamIdToSportsKeedaId: Record<string, number> = {
  'arizona-cardinals': 355,
  'atlanta-falcons': 323,
  'baltimore-ravens': 366,
  'buffalo-bills': 324,
  'carolina-panthers': 364,
  'chicago-bears': 326,
  'cincinnati-bengals': 327,
  'cleveland-browns': 329,
  'dallas-cowboys': 331,
  'denver-broncos': 332,
  'detroit-lions': 334,
  'green-bay-packers': 335,
  'houston-texans': 325,
  'indianapolis-colts': 338,
  'jacksonville-jaguars': 365,
  'kansas-city-chiefs': 339,
  'las-vegas-raiders': 341,
  'los-angeles-chargers': 357,
  'los-angeles-rams': 343,
  'miami-dolphins': 345,
  'minnesota-vikings': 347,
  'new-england-patriots': 348,
  'new-orleans-saints': 350,
  'new-york-giants': 351,
  'new-york-jets': 352,
  'philadelphia-eagles': 354,
  'pittsburgh-steelers': 356,
  'san-francisco-49ers': 359,
  'seattle-seahawks': 361,
  'tampa-bay-buccaneers': 362,
  'tennessee-titans': 336,
  'washington-commanders': 363,
};

interface ScheduleGame {
  week: string | number;
  date: string;
  opponent: string;
  opponentAbbr?: string;
  isHome: boolean | null;
  time: string;
  tv: string;
  venue: string;
  result?: 'W' | 'L' | 'T' | null;
  score?: { home: number; away: number };
  eventType: string;
}

interface TeamRecord {
  wins: number;
  losses: number;
  ties: number;
}

interface TeamStanding {
  teamId: string;
  fullName: string;
  abbreviation: string;
  conference: string;
  division: string;
  record: TeamRecord;
  recordString: string;
  divisionRank: string;
  winPercentage: number;
}

interface StandingsResponse {
  standings: TeamStanding[];
  divisions: {
    [division: string]: TeamStanding[];
  };
  lastUpdated: string;
}

// Sportskeeda schedule interfaces
interface SportsKeedaGame {
  event_id: number;
  event_type: number; // 1 = regular season
  status: string;
  teams: Array<{
    team_id: number;
    score?: number;
    is_winner?: boolean;
  }>;
}

interface SportsKeedaScheduleResponse {
  schedule: SportsKeedaGame[];
}

// Function to calculate team record from Sportskeeda API directly
async function calculateTeamRecord(teamId: string, retries = 2): Promise<TeamRecord> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const sportsKeedaTeamId = teamIdToSportsKeedaId[teamId];

      if (!sportsKeedaTeamId) {
        console.error(`No Sportskeeda ID for team: ${teamId}`);
        return { wins: 0, losses: 0, ties: 0 };
      }

      // Fetch directly from Sportskeeda
      const response = await fetch(
        `https://cf-gotham.sportskeeda.com/taxonomy/sport/nfl/schedule/2025?team=${sportsKeedaTeamId}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NFL-Team-Pages/1.0)',
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`Sportskeeda API error: ${response.status}`);
      }

      const data: SportsKeedaScheduleResponse = await response.json();

      // Only count regular season games (event_type === 1) that are Final
      const completedRegularSeasonGames = data.schedule.filter(
        game => game.event_type === 1 && game.status === 'Final'
      );

      let wins = 0;
      let losses = 0;
      let ties = 0;

      for (const game of completedRegularSeasonGames) {
        const team = game.teams.find(t => t.team_id === sportsKeedaTeamId);
        if (team && typeof team.score === 'number') {
          if (team.is_winner) {
            wins++;
          } else {
            // Check if it's a tie (both teams have same score)
            const opponent = game.teams.find(t => t.team_id !== sportsKeedaTeamId);
            if (opponent && team.score === opponent.score) {
              ties++;
            } else {
              losses++;
            }
          }
        }
      }

      return { wins, losses, ties };
    } catch (error) {
      console.error(`Error calculating record for ${teamId} (attempt ${attempt + 1}):`, error);

      // If this is the last attempt, return 0-0-0
      if (attempt === retries) {
        return { wins: 0, losses: 0, ties: 0 };
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  // This shouldn't be reached, but return 0-0-0 as fallback
  return { wins: 0, losses: 0, ties: 0 };
}

// Function to format record as string
function formatRecord(record: TeamRecord): string {
  return `${record.wins}-${record.losses}-${record.ties}`;
}

// Function to calculate win percentage
function calculateWinPercentage(record: TeamRecord): number {
  const totalGames = record.wins + record.losses + record.ties;
  if (totalGames === 0) return 0;

  // Ties count as 0.5 wins for percentage calculation
  const adjustedWins = record.wins + (record.ties * 0.5);
  return adjustedWins / totalGames;
}

// Function to determine division rank
function getDivisionRank(rank: number): string {
  switch (rank) {
    case 1: return '1st';
    case 2: return '2nd';
    case 3: return '3rd';
    case 4: return '4th';
    default: return `${rank}th`;
  }
}

// Process teams in batches to reduce server load
async function processTeamsInBatches(teamsList: any[], batchSize = 8) {
  const results = [];

  for (let i = 0; i < teamsList.length; i += batchSize) {
    const batch = teamsList.slice(i, i + batchSize);

    const batchPromises = batch.map(async (team) => {
      const record = await calculateTeamRecord(team.id);
      const winPercentage = calculateWinPercentage(record);

      return {
        teamId: team.id,
        fullName: team.fullName,
        abbreviation: team.abbreviation,
        conference: team.conference,
        division: team.division,
        record,
        recordString: formatRecord(record),
        divisionRank: '', // Will be calculated after sorting
        winPercentage
      };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Small delay between batches to prevent overwhelming the server
    if (i + batchSize < teamsList.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

export async function GET() {
  try {
    const teamsList = Object.values(teams);

    // Calculate records for all teams in batches
    const standings = await processTeamsInBatches(teamsList);

    // Group by division and sort by win percentage
    const divisions: { [division: string]: TeamStanding[] } = {};

    standings.forEach(team => {
      if (!divisions[team.division]) {
        divisions[team.division] = [];
      }
      divisions[team.division].push(team);
    });

    // Sort each division and assign ranks
    Object.keys(divisions).forEach(division => {
      divisions[division].sort((a, b) => {
        // Primary sort: win percentage (descending)
        if (b.winPercentage !== a.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }

        // Secondary sort: wins (descending)
        if (b.record.wins !== a.record.wins) {
          return b.record.wins - a.record.wins;
        }

        // Tertiary sort: losses (ascending)
        return a.record.losses - b.record.losses;
      });

      // Assign division ranks
      divisions[division].forEach((team, index) => {
        team.divisionRank = getDivisionRank(index + 1);
      });
    });

    // Flatten standings with updated ranks
    const finalStandings: TeamStanding[] = [];
    Object.values(divisions).forEach(divisionTeams => {
      finalStandings.push(...divisionTeams);
    });

    const response: StandingsResponse = {
      standings: finalStandings,
      divisions,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Standings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings data' },
      { status: 500 }
    );
  }
}