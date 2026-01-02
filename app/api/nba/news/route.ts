import { NextRequest, NextResponse } from 'next/server';

// Map team abbreviations to our team IDs
const TEAM_ABBR_MAP: Record<string, string> = {
  'ATL': 'atlanta-hawks',
  'BOS': 'boston-celtics',
  'BKN': 'brooklyn-nets',
  'BRK': 'brooklyn-nets',
  'CHA': 'charlotte-hornets',
  'CHI': 'chicago-bulls',
  'CLE': 'cleveland-cavaliers',
  'DAL': 'dallas-mavericks',
  'DEN': 'denver-nuggets',
  'DET': 'detroit-pistons',
  'GS': 'golden-state-warriors',
  'GSW': 'golden-state-warriors',
  'HOU': 'houston-rockets',
  'IND': 'indiana-pacers',
  'LAC': 'los-angeles-clippers',
  'LAL': 'los-angeles-lakers',
  'MEM': 'memphis-grizzlies',
  'MIA': 'miami-heat',
  'MIL': 'milwaukee-bucks',
  'MIN': 'minnesota-timberwolves',
  'NO': 'new-orleans-pelicans',
  'NOP': 'new-orleans-pelicans',
  'NY': 'new-york-knicks',
  'NYK': 'new-york-knicks',
  'OKC': 'oklahoma-city-thunder',
  'ORL': 'orlando-magic',
  'PHI': 'philadelphia-76ers',
  'PHO': 'phoenix-suns',
  'PHX': 'phoenix-suns',
  'POR': 'portland-trail-blazers',
  'SAC': 'sacramento-kings',
  'SA': 'san-antonio-spurs',
  'SAS': 'san-antonio-spurs',
  'TOR': 'toronto-raptors',
  'UTA': 'utah-jazz',
  'WAS': 'washington-wizards',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    const response = await fetch(
      'https://www.rotoballer.com/partner-rssxml?partner=prosportsnetwork&key=x63sLHVNR4a37LvBetiiBXvmEs6XKpVQS1scgVoYf3kxXZ4Kl8bC2BahiSsP&sport=nba&format=json',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NBA-Hub/1.0)',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const articles = await response.json();

    // Filter by team if teamId provided
    let filteredArticles = articles;
    if (teamId) {
      filteredArticles = articles.filter((article: any) => {
        if (!article.players || article.players.length === 0) return false;

        return article.players.some((player: any) => {
          const playerTeamId = TEAM_ABBR_MAP[player.team];
          return playerTeamId === teamId;
        });
      });
    }

    // Return up to 20 articles
    return NextResponse.json({
      articles: filteredArticles.slice(0, 20),
      total: filteredArticles.length,
    });

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', articles: [] },
      { status: 500 }
    );
  }
}
