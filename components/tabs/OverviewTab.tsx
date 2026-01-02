'use client';

import { TeamData, getAllTeams } from '@/data/teams';
import { useState, useEffect } from 'react';

interface OverviewTabProps {
  team: TeamData;
  onTabChange?: (tab: string) => void;
}

// Map API team slugs to our team IDs
const teamSlugMapping: Record<string, string> = {
  'atlanta-hawks': 'atlanta-hawks',
  'boston-celtics': 'boston-celtics',
  'brooklyn-nets': 'brooklyn-nets',
  'charlotte-hornets': 'charlotte-hornets',
  'chicago-bulls': 'chicago-bulls',
  'cleveland-cavaliers': 'cleveland-cavaliers',
  'dallas-mavericks': 'dallas-mavericks',
  'denver-nuggets': 'denver-nuggets',
  'detroit-pistons': 'detroit-pistons',
  'golden-state-warriors': 'golden-state-warriors',
  'houston-rockets': 'houston-rockets',
  'indiana-pacers': 'indiana-pacers',
  'la-clippers': 'los-angeles-clippers',
  'los-angeles-clippers': 'los-angeles-clippers',
  'lakers': 'los-angeles-lakers',
  'los-angeles-lakers': 'los-angeles-lakers',
  'memphis-grizzlies': 'memphis-grizzlies',
  'miami-heat': 'miami-heat',
  'milwaukee-bucks': 'milwaukee-bucks',
  'minnesota-timberwolves': 'minnesota-timberwolves',
  'new-orleans-pelicans': 'new-orleans-pelicans',
  'new-york-knicks': 'new-york-knicks',
  'oklahoma-city-thunder': 'oklahoma-city-thunder',
  'orlando-magic': 'orlando-magic',
  'philadelphia-76ers': 'philadelphia-76ers',
  'phoenix-suns': 'phoenix-suns',
  'portland-trail-blazers': 'portland-trail-blazers',
  'portland-trailblazers': 'portland-trail-blazers',
  'sacramento-kings': 'sacramento-kings',
  'san-antonio-spurs': 'san-antonio-spurs',
  'toronto-raptors': 'toronto-raptors',
  'utah-jazz': 'utah-jazz',
  'washington-wizards': 'washington-wizards',
};

interface StatLeader {
  name: string;
  stat: string;
}

interface StatLeaders {
  points: StatLeader;
  rebounds: StatLeader;
  assists: StatLeader;
  steals: StatLeader;
  blocks: StatLeader;
  fieldGoalPct: StatLeader;
}

export default function OverviewTab({ team, onTabChange }: OverviewTabProps) {
  const [divisionStandings, setDivisionStandings] = useState<any[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);

  // Team schedule state
  const [teamSchedule, setTeamSchedule] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Stat leaders state
  const [statLeaders, setStatLeaders] = useState<StatLeaders>({
    points: { name: '-', stat: '-' },
    rebounds: { name: '-', stat: '-' },
    assists: { name: '-', stat: '-' },
    steals: { name: '-', stat: '-' },
    blocks: { name: '-', stat: '-' },
    fieldGoalPct: { name: '-', stat: '-' },
  });
  const [statLeadersLoading, setStatLeadersLoading] = useState(true);

  // NBA articles state
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [visibleArticles, setVisibleArticles] = useState(3);

  // Fetch team schedule
  useEffect(() => {
    async function fetchTeamSchedule() {
      try {
        const response = await fetch(`/nba-hq/api/nba/schedule/${team.id}?season=2025`);

        if (!response.ok) return;

        const data = await response.json();

        if (data.schedule) {
          // Get next 5 games (upcoming + recent)
          const now = new Date();
          const relevantGames = data.schedule
            .filter((game: any) => {
              const gameDate = new Date(game.start_date);
              const daysDiff = (gameDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
              return daysDiff >= -3; // Include games from last 3 days and all future
            })
            .slice(0, 5);

          setTeamSchedule(relevantGames);
        }
      } catch (err) {
        console.error('Error fetching team schedule:', err);
      } finally {
        setScheduleLoading(false);
      }
    }

    fetchTeamSchedule();
  }, [team.id]);

  // Fetch live standings for division
  useEffect(() => {
    async function fetchDivisionStandings() {
      try {
        const response = await fetch('/nba-hq/api/nba/standings?season=2025&level=conference');

        if (!response.ok) return;

        const data = await response.json();

        // Find teams in this team's division
        // API returns { data: { standings: { conferences: [...] } } }
        const ourDivisionTeams: any[] = [];
        const allTeams = getAllTeams();
        const conferences = data.data?.standings?.conferences;

        if (conferences) {
          for (const conf of conferences) {
            for (const apiTeam of conf.teams) {
              // API uses sk_slug for team identifiers
              const teamId = teamSlugMapping[apiTeam.sk_slug] || apiTeam.sk_slug;
              const ourTeam = allTeams.find(t => t.id === teamId);

              if (ourTeam && ourTeam.division === team.division) {
                ourDivisionTeams.push({
                  id: teamId,
                  abbreviation: ourTeam.abbreviation,
                  logoUrl: ourTeam.logoUrl,
                  wins: apiTeam.wins || 0,
                  losses: apiTeam.losses || 0,
                  winPct: parseFloat(apiTeam.percentage || '0'),
                });
              }
            }
          }
        }

        // Sort by win percentage
        ourDivisionTeams.sort((a, b) => b.winPct - a.winPct);
        setDivisionStandings(ourDivisionTeams);
      } catch (err) {
        console.error('Error fetching division standings:', err);
      } finally {
        setStandingsLoading(false);
      }
    }

    fetchDivisionStandings();
  }, [team.division]);

  // Fetch stat leaders
  useEffect(() => {
    async function fetchStatLeaders() {
      try {
        const response = await fetch(`/nba-hq/api/nba/team-stats/${team.id}?season=2025&event=regular`);

        if (!response.ok) return;

        const data = await response.json();
        const playerStats = data?.data?.player_stats;

        if (playerStats && Array.isArray(playerStats) && playerStats.length > 0) {
          // Find leaders for each category
          const getLeader = (stats: any[], key: string): StatLeader => {
            const sorted = [...stats].sort((a, b) =>
              parseFloat(b[key] || '0') - parseFloat(a[key] || '0')
            );
            const leader = sorted[0];
            return leader ? { name: leader.name, stat: leader[key] } : { name: '-', stat: '-' };
          };

          setStatLeaders({
            points: getLeader(playerStats, 'points_per_game'),
            rebounds: getLeader(playerStats, 'rebounds_per_game'),
            assists: getLeader(playerStats, 'assists_per_game'),
            steals: getLeader(playerStats, 'steals_per_game'),
            blocks: getLeader(playerStats, 'blocks_per_game'),
            fieldGoalPct: getLeader(playerStats, 'fields_goal_percentage'),
          });
        }
      } catch (err) {
        console.error('Error fetching stat leaders:', err);
      } finally {
        setStatLeadersLoading(false);
      }
    }

    fetchStatLeaders();
  }, [team.id]);

  // Fetch NBA articles
  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/nba-hq/api/nba/overview-articles');

        if (!response.ok) return;

        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setArticlesLoading(false);
      }
    }

    fetchArticles();
  }, []);

  // Format schedule for display
  const displaySchedule = teamSchedule.map(game => {
    const isHome = game.home_team.team_slug === team.id || teamSlugMapping[game.home_team.team_slug] === team.id;
    const opponent = isHome ? game.away_team : game.home_team;
    const allTeams = getAllTeams();
    const opponentTeam = allTeams.find(t => t.id === teamSlugMapping[opponent.team_slug] || t.id === opponent.team_slug);

    const gameDate = new Date(game.start_date);
    const formattedDate = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const gameTime = gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return {
      date: formattedDate,
      opponent: opponent.abbr,
      opponentLogo: opponentTeam?.logoUrl || '',
      isHome,
      result: game.has_score ? (game.home_team.is_winner ? (isHome ? 'W' : 'L') : (isHome ? 'L' : 'W')) : null,
      score: game.has_score ? `${game.home_team.score}-${game.away_team.score}` : null,
      time: !game.has_score ? gameTime : null,
      status: game.status
    };
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get relative time (e.g., "2h ago", "3d ago")
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return formatDate(dateString);
    }
  };

  // Use live division standings or fallback to static
  const displayTeams = divisionStandings.length > 0
    ? divisionStandings
    : getAllTeams()
        .filter(t => t.division === team.division)
        .map(t => ({
          id: t.id,
          abbreviation: t.abbreviation,
          logoUrl: t.logoUrl,
          wins: parseInt(t.record.split('-')[0]),
          losses: parseInt(t.record.split('-')[1]),
          winPct: 0.500
        }));

  return (
    <div className="space-y-6">
      {/* Row 1 - Three columns with key widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {/* Column 1 - Schedule Widget */}
        <div className="flex">
          <div className="bg-white rounded-lg shadow p-6 min-h-[400px] flex flex-col w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2025-26 Schedule</h2>

            <div className="space-y-3 flex-grow">
              {!scheduleLoading && displaySchedule.length > 0 ? (
                displaySchedule.map((game, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-gray-600 w-12">{game.date}</div>
                      <div className="flex items-center space-x-2">
                        {!game.isHome && <span className="text-xs text-gray-500">@</span>}
                        <img
                          src={game.opponentLogo}
                          alt={game.opponent}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">{game.opponent}</span>
                      </div>
                    </div>
                    <div className="text-right">
                    {game.result ? (
                      <>
                        <span className={`font-bold text-xs ${game.result === 'W' ? 'text-green-600' : 'text-red-600'}`}>
                          {game.result}
                        </span>
                        <div className="text-xs text-gray-500">{game.score}</div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-600">{game.time}</div>
                    )}
                  </div>
                </div>
                ))
              ) : scheduleLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">Loading schedule...</div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">No upcoming games</div>
                </div>
              )}
            </div>

            {onTabChange && (
              <button
                onClick={() => onTabChange('schedule')}
                className="w-full mt-4 px-4 py-3 text-sm sm:text-base font-medium text-white rounded-lg hover:opacity-90 transition-opacity min-h-[48px]"
                style={{ backgroundColor: team.primaryColor }}
              >
                View Full Schedule
              </button>
            )}
          </div>
        </div>

        {/* Column 2 - Division Standings */}
        <div className="flex">
          <div className="bg-white rounded-lg shadow p-6 min-h-[400px] flex flex-col w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">{team.division} Division Standings</h2>
            </div>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">W</th>
                    <th className="pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">L</th>
                    <th className="pb-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">PCT</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTeams.map((t, index) => (
                    <tr
                      key={t.id}
                      className={`${t.id === team.id ? 'font-bold' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      style={t.id === team.id ? { backgroundColor: team.primaryColor + '10' } : {}}
                    >
                      <td className="py-2 pr-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={t.logoUrl}
                            alt={t.abbreviation}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{t.abbreviation}</span>
                        </div>
                      </td>
                      <td className="py-2 text-center">{t.wins}</td>
                      <td className="py-2 text-center">{t.losses}</td>
                      <td className="py-2 text-center">{t.winPct.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a
              href="/standings"
              className="block w-full mt-4 px-4 py-3 text-sm sm:text-base font-medium text-white rounded-lg hover:opacity-90 transition-opacity text-center min-h-[48px] flex items-center justify-center"
              style={{ backgroundColor: team.primaryColor }}
            >
              View All NBA Standings
            </a>
          </div>
        </div>

        {/* Column 3 - Team Stat Leaders */}
        <div className="flex">
          <div className="bg-white rounded-lg shadow p-6 min-h-[400px] flex flex-col w-full">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">{team.name} Leaders</h2>
            </div>
            {statLeadersLoading ? (
              <div className="flex items-center justify-center py-8 flex-grow">
                <div className="text-gray-500 text-sm">Loading stats...</div>
              </div>
            ) : (
              <div className="space-y-3 flex-grow">
                {/* Points & Rebounds */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-center py-2 text-xs font-medium rounded mb-2 bg-gray-100 text-gray-700">
                      POINTS
                    </div>
                    <div className="font-medium text-xs truncate px-1" style={{ color: team.primaryColor }}>
                      {statLeaders.points.name}
                    </div>
                    <div className="text-sm font-bold">{statLeaders.points.stat}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-center py-2 text-xs font-medium rounded mb-2 bg-gray-100 text-gray-700">
                      REBOUNDS
                    </div>
                    <div className="font-medium text-xs truncate px-1" style={{ color: team.primaryColor }}>
                      {statLeaders.rebounds.name}
                    </div>
                    <div className="text-sm font-bold">{statLeaders.rebounds.stat}</div>
                  </div>
                </div>

                {/* Assists & Steals */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-center py-2 text-xs font-medium rounded mb-2 bg-gray-100 text-gray-700">
                      ASSISTS
                    </div>
                    <div className="font-medium text-xs truncate px-1" style={{ color: team.primaryColor }}>
                      {statLeaders.assists.name}
                    </div>
                    <div className="text-sm font-bold">{statLeaders.assists.stat}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-center py-2 text-xs font-medium rounded mb-2 bg-gray-100 text-gray-700">
                      STEALS
                    </div>
                    <div className="font-medium text-xs truncate px-1" style={{ color: team.primaryColor }}>
                      {statLeaders.steals.name}
                    </div>
                    <div className="text-sm font-bold">{statLeaders.steals.stat}</div>
                  </div>
                </div>

                {/* Blocks & FG% */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-center py-2 text-xs font-medium rounded mb-2 bg-gray-100 text-gray-700">
                      BLOCKS
                    </div>
                    <div className="font-medium text-xs truncate px-1" style={{ color: team.primaryColor }}>
                      {statLeaders.blocks.name}
                    </div>
                    <div className="text-sm font-bold">{statLeaders.blocks.stat}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-center py-2 text-xs font-medium rounded mb-2 bg-gray-100 text-gray-700">
                      FG%
                    </div>
                    <div className="font-medium text-xs truncate px-1" style={{ color: team.primaryColor }}>
                      {statLeaders.fieldGoalPct.name}
                    </div>
                    <div className="text-sm font-bold">{statLeaders.fieldGoalPct.stat}</div>
                  </div>
                </div>
              </div>
            )}
            {onTabChange && (
              <button
                onClick={() => onTabChange('stats')}
                className="w-full mt-4 px-4 py-3 text-sm sm:text-base font-medium text-white rounded-lg hover:opacity-90 transition-opacity min-h-[48px]"
                style={{ backgroundColor: team.primaryColor }}
              >
                View Full Team Stats
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 - Full width articles section */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Latest NBA Articles</h2>
          </div>
          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="w-full aspect-video bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(0, visibleArticles).map((article, index) => (
                  <a
                    key={index}
                    href={article.link || article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Featured Image */}
                    {article.featuredImage && (
                      <div className="w-full aspect-video overflow-hidden bg-gray-200">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" style={{ color: team.primaryColor }}>
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {article.description || article.excerpt || ''}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {article.pubDate ? getRelativeTime(article.pubDate) : ''}
                        </span>
                        <span className="font-medium" style={{ color: team.primaryColor }}>
                          Read More →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Show More Button */}
              {visibleArticles < articles.length && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleArticles(prev => Math.min(prev + 3, articles.length))}
                    className="text-white px-8 py-4 rounded-lg font-medium transition-colors hover:opacity-90 text-base min-h-[48px]"
                    style={{ backgroundColor: team.primaryColor }}
                  >
                    Show More Articles
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No articles available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
