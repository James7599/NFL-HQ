import { NextRequest, NextResponse } from 'next/server';
import { wildCardGames2026, StaticPlayoffGame } from '@/data/playoffGames2026';
import { getAllTeams } from '@/data/teams';
import { isPlayoffDate, fetchGamesByDate as fetchESPNGamesByDate, TransformedGame as ESPNTransformedGame } from '@/lib/espn';

// Function to determine cache revalidation time based on NFL game schedule
function getRevalidationTime(): number {
  // Off-season: cache for 24 hours since season is over
  return 86400; // 24 hours

  // During season, uncomment below for dynamic caching:
  // const now = new Date();
  // const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  // const dayOfWeek = pacificTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // const hour = pacificTime.getHours();
  //
  // // Saturday (6) or Sunday (0): Update every hour all day
  // if (dayOfWeek === 0 || dayOfWeek === 6) {
  //   return 3600; // 1 hour
  // }
  //
  // // Monday (1) or Thursday (4): Update every hour from 6 PM to midnight PT (game window)
  // if ((dayOfWeek === 1 || dayOfWeek === 4) && hour >= 18 && hour <= 23) {
  //   return 3600; // 1 hour
  // }
  //
  // // All other times: Update every 6 hours (less frequent)
  // return 21600; // 6 hours
}

// Function to convert ESPN games to local TransformedGame format
function convertESPNGameToLocalFormat(game: ESPNTransformedGame): TransformedGame {
  return {
    event_id: game.event_id,
    start_date: game.start_date,
    status: game.status,
    has_score: game.has_score,
    is_live: game.is_live,
    away_team: {
      team_slug: game.away_team.team_slug,
      abbr: game.away_team.abbr,
      team_name: game.away_team.team_name,
      wins: game.away_team.wins,
      losses: game.away_team.losses,
      score: game.away_team.score,
      is_winner: game.away_team.is_winner,
      has_possession: game.away_team.has_possession,
    },
    home_team: {
      team_slug: game.home_team.team_slug,
      abbr: game.home_team.abbr,
      team_name: game.home_team.team_name,
      wins: game.home_team.wins,
      losses: game.home_team.losses,
      score: game.home_team.score,
      is_winner: game.home_team.is_winner,
      has_possession: game.home_team.has_possession,
    },
    situation: game.situation,
    venue: game.venue,
    tv_stations: game.tv_stations,
    hi_pass: game.hi_pass ? {
      player_id: 0,
      player_name: game.hi_pass.player_name,
      player_slug: game.hi_pass.player_name.toLowerCase().replace(/\s+/g, '-'),
      value: game.hi_pass.value,
    } : undefined,
    hi_rush: game.hi_rush ? {
      player_id: 0,
      player_name: game.hi_rush.player_name,
      player_slug: game.hi_rush.player_name.toLowerCase().replace(/\s+/g, '-'),
      value: game.hi_rush.value,
    } : undefined,
    hi_rec: game.hi_rec ? {
      player_id: 0,
      player_name: game.hi_rec.player_name,
      player_slug: game.hi_rec.player_name.toLowerCase().replace(/\s+/g, '-'),
      value: game.hi_rec.value,
    } : undefined,
  };
}

// Function to convert static playoff games to API format
function convertStaticGameToAPIFormat(game: StaticPlayoffGame): TransformedGame {
  const allTeams = getAllTeams();
  const awayTeam = allTeams.find(t => t.id === game.awayTeam);
  const homeTeam = allTeams.find(t => t.id === game.homeTeam);

  // Convert date and time to ISO format
  // Parse time like "1:30 PM ET" and convert to 24-hour format for ISO
  const timeMatch = game.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let isoTime = '12:00:00';
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const period = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    isoTime = `${String(hours).padStart(2, '0')}:${minutes}:00`;
  }

  return {
    event_id: `playoff-${game.date}-${game.awayTeam}-${game.homeTeam}`,
    start_date: `${game.date}T${isoTime}`,
    status: 'Pre-Game',
    has_score: false,
    away_team: {
      team_slug: game.awayTeam,
      abbr: awayTeam?.abbreviation || '',
      team_name: awayTeam?.fullName || '',
      wins: 0,
      losses: 0,
    },
    home_team: {
      team_slug: game.homeTeam,
      abbr: homeTeam?.abbreviation || '',
      team_name: homeTeam?.fullName || '',
      wins: 0,
      losses: 0,
    },
    venue: {
      name: game.venue,
      city: game.city,
      state: {
        name: game.state,
        abbreviation: game.state,
      },
    },
    tv_stations: game.tv.split('/').map(station => ({
      name: station.trim(),
      call_letters: station.trim(),
    })),
  };
}

interface SportsKeedaTeam {
  team_id: number;
  location: string;
  nickname: string;
  team_slug: string;
  abbr: string;
  location_type: 'home' | 'away';
  wins: number;
  losses: number;
  score?: number;
  is_winner?: boolean;
}

interface SportsKeedaGame {
  event_id: number;
  event_type: number; // 0 = preseason, 1 = regular season, 2 = postseason
  week: number;
  week_name: string;
  week_short_name: string;
  week_slug: string;
  start_date: {
    full: string;
    formatted: string;
  };
  end_date: {
    full: string;
    formatted: string;
  };
  status: string;
  has_score: boolean;
  teams: SportsKeedaTeam[];
  venue_name: string;
  venue_city: string;
  venue_state_abbr?: string;
  tv_stations: string[];
  hi_pass?: {
    player_id: number;
    player_name: string;
    player_slug: string;
    value: number;
  };
  hi_rec?: {
    player_id: number;
    player_name: string;
    player_slug: string;
    value: number;
  };
  hi_rush?: {
    player_id: number;
    player_name: string;
    player_slug: string;
    value: number;
  };
}

interface SportsKeedaScheduleResponse {
  season: number;
  season_name: string;
  schedule: SportsKeedaGame[];
}

// Transform to format expected by schedule page
interface TransformedGame {
  event_id: string;
  start_date: string;
  status: string;
  has_score: boolean;
  is_live?: boolean;
  away_team: {
    team_slug: string;
    abbr: string;
    team_name: string;
    wins: number;
    losses: number;
    score?: number;
    is_winner?: boolean;
    has_possession?: boolean;
  };
  home_team: {
    team_slug: string;
    abbr: string;
    team_name: string;
    wins: number;
    losses: number;
    score?: number;
    is_winner?: boolean;
    has_possession?: boolean;
  };
  situation?: {
    down_distance?: string;
    is_red_zone?: boolean;
  };
  venue?: {
    name: string;
    city: string;
    state?: {
      name: string;
      abbreviation: string;
    };
  };
  tv_stations?: Array<{
    name: string;
    call_letters: string;
  }>;
  hi_pass?: {
    player_id: number;
    player_name: string;
    player_slug: string;
    value: number;
  };
  hi_rush?: {
    player_id: number;
    player_name: string;
    player_slug: string;
    value: number;
  };
  hi_rec?: {
    player_id: number;
    player_name: string;
    player_slug: string;
    value: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const seasonParam = searchParams.get('season') || '2025';
    const requestedDate = searchParams.get('date');

    // Validate season parameter (must be a 4-digit year between 2020-2030)
    const seasonYear = parseInt(seasonParam, 10);
    if (isNaN(seasonYear) || seasonYear < 2020 || seasonYear > 2030) {
      return NextResponse.json(
        { error: 'Invalid season parameter. Must be a year between 2020-2030.' },
        { status: 400 }
      );
    }
    const season = seasonParam;

    if (!requestedDate) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(requestedDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Validate it's a real date
    const parsedDate = new Date(requestedDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date value.' },
        { status: 400 }
      );
    }

    // Check if this is a playoff date - use ESPN API for live/accurate data
    if (isPlayoffDate(requestedDate)) {
      try {
        const espnGames = await fetchESPNGamesByDate(requestedDate);

        if (espnGames.length > 0) {
          // Convert ESPN games to local format
          const transformedGames = espnGames.map(convertESPNGameToLocalFormat);

          // Determine cache time based on date and time, not response content
          // This avoids stale cache issues when game status changes
          const now = new Date();
          const gameDate = new Date(requestedDate + 'T23:59:59-05:00'); // End of game day in ET
          const hoursSinceGameDay = (now.getTime() - gameDate.getTime()) / (1000 * 60 * 60);

          let revalidateTime: number;
          if (hoursSinceGameDay > 6) {
            // Game day was more than 6 hours ago - games should be final, cache longer
            revalidateTime = 3600; // 1 hour
          } else if (hoursSinceGameDay > 0) {
            // Within 6 hours after game day ends - games might have just finished
            revalidateTime = 60; // 1 minute - refresh frequently to catch final scores
          } else {
            // Game day is today or in future - could be live
            revalidateTime = 30; // 30 seconds for live game updates
          }

          return NextResponse.json({
            schedule: transformedGames,
            date: requestedDate,
            season: parseInt(season),
            totalGames: transformedGames.length,
            source: 'espn',
          }, {
            headers: {
              'Cache-Control': `s-maxage=${revalidateTime}, stale-while-revalidate=${revalidateTime}`,
            },
          });
        }
      } catch (error) {
        console.error('ESPN API error, falling back to static data:', error);
      }

      // Fall back to static playoff games if ESPN fails or returns no games
      const staticPlayoffGames = wildCardGames2026.filter(game => game.date === requestedDate);
      if (staticPlayoffGames.length > 0) {
        const staticGames = staticPlayoffGames.map(convertStaticGameToAPIFormat);
        return NextResponse.json({
          schedule: staticGames,
          date: requestedDate,
          season: parseInt(season),
          totalGames: staticGames.length,
          source: 'static',
        });
      }
    }

    // For non-playoff dates, use cached SportsKeeda data
    // Determine if requested date is in the past
    const requestedDateObj = new Date(requestedDate + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isHistoricalDate = requestedDateObj < today;

    // For historical dates: Use longer cache and fetch from team APIs (comprehensive data)
    // For current/future dates: Use dynamic cache and general API (faster, current data)
    let revalidateTime: number;
    let allGames = new Map<number, SportsKeedaGame>();

    if (isHistoricalDate) {
      // Historical games - cache for 1 week since data won't change
      revalidateTime = 604800; // 1 week

      // Fetch from ALL 32 teams to ensure complete historical coverage
      // This runs once per week per historical date, so it's worth being comprehensive
      const allTeamIds = [
        355, 323, 366, 324, 364, 326, 327, 329, 331, 332, // ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE, DAL, DEN
        334, 335, 325, 338, 365, 339, 341, 357, 343, 345, // DET, GB, HOU, IND, JAX, KC, LV, LAC, LAR, MIA
        347, 348, 350, 351, 352, 354, 356, 359, 361, 362, // MIN, NE, NO, NYG, NYJ, PHI, PIT, SF, SEA, TB
        336, 363 // TEN, WAS
      ];

      for (const teamId of allTeamIds) {
        try {
          const response = await fetch(
            `https://cf-gotham.sportskeeda.com/taxonomy/sport/nfl/schedule/${season}?team=${teamId}`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NFL-Team-Pages/1.0)',
              },
              next: { revalidate: revalidateTime }
            }
          );

          if (response.ok) {
            const data: SportsKeedaScheduleResponse = await response.json();
            if (data.schedule && Array.isArray(data.schedule)) {
              data.schedule.forEach(game => {
                allGames.set(game.event_id, game);
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching schedule for team ${teamId}:`, error);
          // Continue with other teams
        }
      }
    } else {
      // Current/upcoming games - use dynamic cache based on game schedule
      revalidateTime = getRevalidationTime();

      // General API is fine for current/upcoming games
      try {
        const response = await fetch(
          `https://cf-gotham.sportskeeda.com/taxonomy/sport/nfl/schedule/${season}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; NFL-Team-Pages/1.0)',
            },
            next: { revalidate: revalidateTime }
          }
        );

        if (response.ok) {
          const data: SportsKeedaScheduleResponse = await response.json();
          if (data.schedule && Array.isArray(data.schedule)) {
            data.schedule.forEach(game => {
              allGames.set(game.event_id, game);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching current schedule:', error);
      }
    }

    if (allGames.size === 0) {
      return NextResponse.json(
        { error: 'No schedule data found' },
        { status: 404 }
      );
    }

    // Filter games by the requested date
    // The API returns times in UTC (e.g. "2025-12-01T01:20:00" means 1:20 AM UTC)
    // We need to convert to US Eastern Time to get the correct game date
    const filteredGames = Array.from(allGames.values()).filter((game) => {
      try {
        // Parse as UTC by appending 'Z'
        const utcDate = new Date(game.start_date.full + 'Z');

        // Convert to US Eastern Time to get the correct game date
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });

        const parts = formatter.formatToParts(utcDate);
        const year = parts.find(p => p.type === 'year')?.value;
        const month = parts.find(p => p.type === 'month')?.value;
        const day = parts.find(p => p.type === 'day')?.value;

        const easternDateStr = `${year}-${month}-${day}`;
        return easternDateStr === requestedDate;
      } catch (error) {
        console.error('Error parsing game date:', game.start_date.full, error);
        return false;
      }
    });

    // Transform to expected format
    let transformedGames: TransformedGame[] = filteredGames.map((game) => {
      const awayTeam = game.teams.find(t => t.location_type === 'away');
      const homeTeam = game.teams.find(t => t.location_type === 'home');

      if (!awayTeam || !homeTeam) {
        console.warn('Missing team data for game:', game.event_id);
        return null;
      }

      return {
        event_id: String(game.event_id),
        start_date: game.start_date.full,
        status: game.status,
        has_score: game.has_score,
        away_team: {
          team_slug: awayTeam.team_slug,
          abbr: awayTeam.abbr,
          team_name: `${awayTeam.location} ${awayTeam.nickname}`,
          wins: awayTeam.wins,
          losses: awayTeam.losses,
          score: awayTeam.score,
          is_winner: awayTeam.is_winner,
        },
        home_team: {
          team_slug: homeTeam.team_slug,
          abbr: homeTeam.abbr,
          team_name: `${homeTeam.location} ${homeTeam.nickname}`,
          wins: homeTeam.wins,
          losses: homeTeam.losses,
          score: homeTeam.score,
          is_winner: homeTeam.is_winner,
        },
        venue: game.venue_name ? {
          name: game.venue_name,
          city: game.venue_city,
          state: game.venue_state_abbr ? {
            name: '', // Not provided by API
            abbreviation: game.venue_state_abbr,
          } : undefined,
        } : undefined,
        tv_stations: game.tv_stations?.map(station => ({
          name: station,
          call_letters: station,
        })),
        hi_pass: game.hi_pass,
        hi_rush: game.hi_rush,
        hi_rec: game.hi_rec,
      };
    }).filter(Boolean) as TransformedGame[];

    // Note: Playoff games are now handled at the beginning of this function using ESPN API

    return NextResponse.json({
      schedule: transformedGames,
      date: requestedDate,
      season: parseInt(season),
      totalGames: transformedGames.length,
    });

  } catch (error) {
    console.error('Schedule by-date API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule data' },
      { status: 500 }
    );
  }
}
