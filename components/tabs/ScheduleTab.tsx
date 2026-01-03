'use client';

import { TeamData, getAllTeams } from '@/data/teams';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface ScheduleTabProps {
  team: TeamData;
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
  'sacramento-kings': 'sacramento-kings',
  'san-antonio-spurs': 'san-antonio-spurs',
  'toronto-raptors': 'toronto-raptors',
  'utah-jazz': 'utah-jazz',
  'washington-wizards': 'washington-wizards',
};

export default function ScheduleTab({ team }: ScheduleTabProps) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'home' | 'away'>('all');
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const toggleGameExpand = (gameId: string) => {
    setExpandedGame(expandedGame === gameId ? null : gameId);
  };

  // Fetch team schedule
  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/nfl-hq/api/nfl/schedule/${team.id}?season=2025`);

        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();

        if (data.schedule) {
          setSchedule(data.schedule);
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [team.id]);

  // Filter and format games
  const filteredGames = useMemo(() => {
    let games = schedule;

    // Apply filter
    if (filter === 'home') {
      games = games.filter(game =>
        game.home_team.team_slug === team.id || teamSlugMapping[game.home_team.team_slug] === team.id
      );
    } else if (filter === 'away') {
      games = games.filter(game =>
        game.away_team.team_slug === team.id || teamSlugMapping[game.away_team.team_slug] === team.id
      );
    }

    // Format for display
    return games.map(game => {
      const isHome = game.home_team.team_slug === team.id || teamSlugMapping[game.home_team.team_slug] === team.id;
      const opponent = isHome ? game.away_team : game.home_team;
      const allTeams = getAllTeams();
      const opponentTeam = allTeams.find(t => t.id === teamSlugMapping[opponent.team_slug] || t.id === opponent.team_slug);

      const gameDate = new Date(game.start_date);

      return {
        ...game,
        isHome,
        opponent,
        opponentTeam,
        gameDate,
        formattedDate: gameDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        gameTime: gameDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
      };
    });
  }, [schedule, filter, team.id]);

  // Group by month
  const gamesByMonth = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    filteredGames.forEach(game => {
      const monthKey = game.gameDate.toLocaleDateString('en-US', { month: 'long' });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(game);
    });

    return grouped;
  }, [filteredGames]);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} 2025 Schedule</h2>
          <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '320px' }}></div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'home', 'away'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={filter === filterOption ? { backgroundColor: team.primaryColor } : {}}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 mx-auto mb-4"
              style={{ color: team.primaryColor }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600 font-medium">Loading schedule...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold mb-1">Failed to load schedule</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Display */}
      {!loading && !error && (
        <>
          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No games found for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(gamesByMonth).map(([month, games]) => (
                <div key={month}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2" style={{ borderColor: team.primaryColor }}>
                    {month}
                  </h3>
                  <div className="space-y-2">
                    {games.map((game) => {
                      const isExpanded = expandedGame === game.event_id;
                      const hasDetails = game.venue || game.tv_stations?.length || game.winner_high || game.loser_high;
                      const isFinal = game.status === 'Final';

                      // Determine which team's high scorer is which
                      const awayIsWinner = game.away_team.is_winner;
                      const awayHighScorer = awayIsWinner ? game.winner_high : game.loser_high;
                      const homeHighScorer = awayIsWinner ? game.loser_high : game.winner_high;

                      const allTeams = getAllTeams();
                      const awayTeam = allTeams.find(t => t.id === teamSlugMapping[game.away_team.team_slug] || t.id === game.away_team.team_slug);
                      const homeTeam = allTeams.find(t => t.id === teamSlugMapping[game.home_team.team_slug] || t.id === game.home_team.team_slug);

                      return (
                        <div
                          key={game.event_id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                        >
                          {/* Main Card - Clickable */}
                          <div
                            onClick={() => hasDetails && toggleGameExpand(game.event_id)}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          >
                            {/* Date & Time */}
                            <div className="flex items-center gap-4 mb-3 sm:mb-0 sm:w-1/4">
                              <div className="text-sm">
                                <div className="font-semibold text-gray-900">{game.formattedDate}</div>
                                <div className="text-gray-600 text-xs">{game.gameTime}</div>
                              </div>
                            </div>

                            {/* Matchup */}
                            <div className="flex items-center gap-3 mb-3 sm:mb-0 sm:w-2/4">
                              <div className="flex items-center gap-2">
                                {game.opponentTeam && (
                                  <img
                                    src={game.opponentTeam.logoUrl}
                                    alt={game.opponent.abbr}
                                    className="w-8 h-8"
                                  />
                                )}
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {game.isHome ? 'vs' : '@'} {game.opponent.abbr}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {game.opponentTeam?.name || game.opponent.location}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Result/Status */}
                            <div className="flex items-center gap-2 sm:w-1/4 justify-end">
                              <div className="text-right">
                                {game.has_score ? (
                                  <div>
                                    <div className="font-bold text-lg text-gray-900">
                                      {game.isHome ? game.home_team.score : game.away_team.score}
                                      {' - '}
                                      {game.isHome ? game.away_team.score : game.home_team.score}
                                    </div>
                                    {/* Show W/L for final games, status for in-progress */}
                                    {game.status === 'Final' ? (
                                      <div className={`text-sm font-semibold ${
                                        (game.home_team.is_winner && game.isHome) || (game.away_team.is_winner && !game.isHome)
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}>
                                        {(game.home_team.is_winner && game.isHome) || (game.away_team.is_winner && !game.isHome) ? 'W' : 'L'}
                                      </div>
                                    ) : (
                                      <div className="text-sm font-semibold text-green-600 animate-pulse">
                                        {game.status}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm font-semibold" style={{ color: team.primaryColor }}>
                                    {game.status}
                                  </div>
                                )}
                              </div>

                              {/* Expand Arrow */}
                              {hasDetails && (
                                <svg
                                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && hasDetails && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* High Scorers */}
                                {isFinal && (awayHighScorer || homeHighScorer) && (
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Top Scorers</h4>
                                    <div className="space-y-2">
                                      {awayHighScorer && (
                                        <div className="flex items-center gap-2">
                                          {awayTeam && (
                                            <img
                                              src={awayTeam.logoUrl}
                                              alt={awayTeam.abbreviation}
                                              className="w-5 h-5"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-900">{awayHighScorer.player_name}</div>
                                            <div className="text-xs text-gray-500">{awayTeam?.abbreviation || game.away_team.abbr}</div>
                                          </div>
                                          <div className="text-sm font-bold" style={{ color: team.primaryColor }}>{awayHighScorer.value} PTS</div>
                                        </div>
                                      )}
                                      {homeHighScorer && (
                                        <div className="flex items-center gap-2">
                                          {homeTeam && (
                                            <img
                                              src={homeTeam.logoUrl}
                                              alt={homeTeam.abbreviation}
                                              className="w-5 h-5"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-900">{homeHighScorer.player_name}</div>
                                            <div className="text-xs text-gray-500">{homeTeam?.abbreviation || game.home_team.abbr}</div>
                                          </div>
                                          <div className="text-sm font-bold" style={{ color: team.primaryColor }}>{homeHighScorer.value} PTS</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Venue */}
                                {game.venue && (
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Venue</h4>
                                    <div className="flex items-start gap-2">
                                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <div>
                                        <div className="text-sm font-semibold text-gray-900">{game.venue.name}</div>
                                        <div className="text-xs text-gray-500">
                                          {game.venue.city}{game.venue.state ? `, ${game.venue.state.abbreviation}` : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* TV Broadcast */}
                                {game.tv_stations && game.tv_stations.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Broadcast</h4>
                                    <div className="flex items-start gap-2">
                                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      <div className="flex flex-wrap gap-1">
                                        {game.tv_stations.map((station: any, idx: number) => (
                                          <span
                                            key={idx}
                                            className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded"
                                            title={station.name}
                                          >
                                            {station.call_letters}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Opponent Team Link */}
                              {game.opponentTeam && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                  <Link
                                    href={`/teams/${game.opponentTeam.id}`}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    View {game.opponentTeam.abbreviation}
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
