import { NextRequest, NextResponse } from 'next/server';

// Map API team slugs to our team IDs
const API_SLUG_MAP: Record<string, string> = {
  'portland-trail-blazers': 'portland-trailblazers',
  'los-angeles-clippers': 'la-clippers',
};

// All team slugs for roster fetching
const TEAM_SLUGS = [
  'atlanta-hawks', 'boston-celtics', 'brooklyn-nets', 'charlotte-hornets',
  'chicago-bulls', 'cleveland-cavaliers', 'dallas-mavericks', 'denver-nuggets',
  'detroit-pistons', 'golden-state-warriors', 'houston-rockets', 'indiana-pacers',
  'la-clippers', 'los-angeles-lakers', 'memphis-grizzlies', 'miami-heat',
  'milwaukee-bucks', 'minnesota-timberwolves', 'new-orleans-pelicans', 'new-york-knicks',
  'oklahoma-city-thunder', 'orlando-magic', 'philadelphia-76ers', 'phoenix-suns',
  'portland-trailblazers', 'sacramento-kings', 'san-antonio-spurs', 'toronto-raptors',
  'utah-jazz', 'washington-wizards',
];

// Reverse map for our IDs
const SLUG_TO_TEAM_ID: Record<string, string> = {
  'la-clippers': 'los-angeles-clippers',
  'portland-trailblazers': 'portland-trail-blazers',
};

interface InjuryData {
  Name: string;
  Status: string;
  Part: string;
  Position: string;
  PlayerID: number;
}

interface PlayerWithTeam extends InjuryData {
  teamId: string;
  teamSlug: string;
}

// Cache for player-team mapping
let playerTeamCache: Map<string, string> = new Map();
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function buildPlayerTeamMapping(): Promise<Map<string, string>> {
  const now = Date.now();

  // Return cached data if valid
  if (playerTeamCache.size > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return playerTeamCache;
  }

  const newCache = new Map<string, string>();

  // Fetch rosters from all teams in parallel batches
  const batchSize = 10;
  for (let i = 0; i < TEAM_SLUGS.length; i += batchSize) {
    const batch = TEAM_SLUGS.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (teamSlug) => {
        try {
          const response = await fetch(
            `https://api.sportskeeda.com/v1/taxonomy/${teamSlug}?subpage=roster&squad_v2=true`,
            {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NBA-Hub/1.0)' },
            }
          );

          if (!response.ok) return null;

          const data = await response.json();
          const players = data?.squad || [];
          const teamId = SLUG_TO_TEAM_ID[teamSlug] || teamSlug;

          return { players, teamId };
        } catch {
          return null;
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const { players, teamId } = result.value;
        for (const player of players) {
          // Use lowercase name for matching
          const normalizedName = player.name?.toLowerCase().trim();
          if (normalizedName) {
            newCache.set(normalizedName, teamId);
          }
        }
      }
    }
  }

  playerTeamCache = newCache;
  cacheTimestamp = now;

  return newCache;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    // Fetch injuries
    const injuriesResponse = await fetch(
      'https://www.rotoballer.com/api/rbapps/nba-injuries.php?partner=prosportsnetwork&key=x63sLHVNR4a37LvBetiiBXvmEs6XKpVQS1scgVoYf3kxXZ4Kl8bC2BahiSsP',
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NBA-Hub/1.0)' },
        next: { revalidate: 1800 } // Cache for 30 minutes
      }
    );

    if (!injuriesResponse.ok) {
      throw new Error(`Injuries API error: ${injuriesResponse.status}`);
    }

    const injuriesData = await injuriesResponse.json();

    // Build player-team mapping
    const playerTeamMap = await buildPlayerTeamMapping();

    // Convert injuries object to array with team info
    const injuries: PlayerWithTeam[] = [];

    for (const [, injury] of Object.entries(injuriesData) as [string, InjuryData][]) {
      const normalizedName = injury.Name?.toLowerCase().trim();
      const playerTeamId = playerTeamMap.get(normalizedName);

      if (playerTeamId) {
        injuries.push({
          ...injury,
          teamId: playerTeamId,
          teamSlug: playerTeamId,
        });
      }
    }

    // Filter by team if requested
    let filteredInjuries = injuries;
    if (teamId) {
      filteredInjuries = injuries.filter(injury => injury.teamId === teamId);
    }

    // Sort by status priority (Out > Doubtful > Questionable > Probable)
    const statusOrder: Record<string, number> = {
      'Out': 0,
      'Doubtful': 1,
      'Questionable': 2,
      'Probable': 3,
    };

    filteredInjuries.sort((a, b) => {
      const orderA = statusOrder[a.Status] ?? 4;
      const orderB = statusOrder[b.Status] ?? 4;
      return orderA - orderB;
    });

    return NextResponse.json({
      injuries: filteredInjuries,
      total: filteredInjuries.length,
    });

  } catch (error) {
    console.error('Injuries API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch injuries', injuries: [] },
      { status: 500 }
    );
  }
}
