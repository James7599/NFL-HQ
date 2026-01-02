'use client';

import { TeamData } from '@/data/teams';
import { useState, useEffect, useMemo } from 'react';

interface StatsTabProps {
  team: TeamData;
}

interface TeamStat {
  name: string;
  own: string;
  opponent: string;
  diff: string;
}

interface PlayerStat {
  player_id: number;
  slug: string;
  name: string;
  games_played: number;
  minutes: number;
  minutes_per_game: string;
  points: number;
  points_per_game: string;
  fields_goal_percentage: string;
  free_throws_percentage: string;
  three_point_field_goals: number;
  rebounds: number;
  rebounds_per_game: string;
  offensive_rebounds: number;
  offensive_rebounds_per_game: string;
  defensive_rebounds: number;
  defensive_rebounds_per_game: string;
  assists: number;
  assists_per_game: string;
  steals: number;
  steals_per_game: string;
  blocks: number;
  blocks_per_game: string;
  turnovers: number;
  turnovers_per_game: string;
  personal_fouls: number;
  disqualifications: number;
}

type SortKey = 'name' | 'games_played' | 'points_per_game' | 'rebounds_per_game' | 'assists_per_game' | 'steals_per_game' | 'blocks_per_game' | 'fields_goal_percentage' | 'minutes_per_game';

export default function StatsTab({ team }: StatsTabProps) {
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState('2025');
  const [eventType, setEventType] = useState<'pre' | 'regular' | 'post'>('regular');
  const [sortKey, setSortKey] = useState<SortKey>('points_per_game');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statsView, setStatsView] = useState<'player' | 'team'>('player');

  // Generate season options (current year and previous 5 years)
  // Current season is 2025-26, so we use 2025
  const currentYear = new Date().getFullYear() + 1;
  const seasonOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Fetch team stats
  useEffect(() => {
    async function fetchTeamStats() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/nba-hq/api/nba/team-stats/${team.id}?season=${season}&event=${eventType}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch team stats');
        }

        const response_data = await response.json();

        // API returns { data: { team_stats: { key: { name, own, opponent, diff } }, player_stats: [...] } }
        const teamStatsObj = response_data?.data?.team_stats;
        if (teamStatsObj && typeof teamStatsObj === 'object') {
          // Convert object to array
          const statsArray = Object.entries(teamStatsObj).map(([key, stat]: [string, any]) => ({
            name: stat.name || key,
            own: String(stat.own ?? ''),
            opponent: String(stat.opponent ?? ''),
            diff: String(stat.diff ?? ''),
          }));
          setTeamStats(statsArray);
        }

        // Get player stats
        const playerStatsArr = response_data?.data?.player_stats;
        if (playerStatsArr && Array.isArray(playerStatsArr)) {
          setPlayerStats(playerStatsArr);
        } else {
          setPlayerStats([]);
        }
      } catch (err) {
        console.error('Error fetching team stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load team stats');
      } finally {
        setLoading(false);
      }
    }

    fetchTeamStats();
  }, [team.id, season, eventType]);

  // Format stat values for display
  const formatStatValue = (value: string | null) => {
    if (!value || value === '') return '-';
    return value;
  };

  // Get event type label
  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'pre':
        return 'Preseason';
      case 'regular':
        return 'Regular Season';
      case 'post':
        return 'Postseason';
      default:
        return type;
    }
  };

  // Sort player stats
  const sortedPlayerStats = useMemo(() => {
    return [...playerStats].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortKey) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'games_played':
          aValue = a.games_played;
          bValue = b.games_played;
          break;
        case 'points_per_game':
          aValue = parseFloat(a.points_per_game) || 0;
          bValue = parseFloat(b.points_per_game) || 0;
          break;
        case 'rebounds_per_game':
          aValue = parseFloat(a.rebounds_per_game) || 0;
          bValue = parseFloat(b.rebounds_per_game) || 0;
          break;
        case 'assists_per_game':
          aValue = parseFloat(a.assists_per_game) || 0;
          bValue = parseFloat(b.assists_per_game) || 0;
          break;
        case 'steals_per_game':
          aValue = parseFloat(a.steals_per_game) || 0;
          bValue = parseFloat(b.steals_per_game) || 0;
          break;
        case 'blocks_per_game':
          aValue = parseFloat(a.blocks_per_game) || 0;
          bValue = parseFloat(b.blocks_per_game) || 0;
          break;
        case 'fields_goal_percentage':
          aValue = parseFloat(a.fields_goal_percentage) || 0;
          bValue = parseFloat(b.fields_goal_percentage) || 0;
          break;
        case 'minutes_per_game':
          aValue = parseFloat(a.minutes_per_game) || 0;
          bValue = parseFloat(b.minutes_per_game) || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [playerStats, sortKey, sortDirection]);

  // Handle sort click
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Sort indicator component
  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return (
        <svg className="w-3 h-3 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'desc' ? (
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Stats</h2>
            <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '150px' }}></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Season Selector */}
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all"
            >
              {seasonOptions.map((year) => (
                <option key={year} value={year - 1}>
                  {year - 1}-{year.toString().slice(-2)} Season
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats View Toggle */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setStatsView('player')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statsView === 'player'
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={statsView === 'player' ? { backgroundColor: team.primaryColor } : {}}
          >
            Player Stats
          </button>
          <button
            onClick={() => setStatsView('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statsView === 'team'
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={statsView === 'team' ? { backgroundColor: team.primaryColor } : {}}
          >
            Team Stats
          </button>
        </div>

        {/* Event Type Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['regular', 'pre', 'post'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setEventType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                eventType === type
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={eventType === type ? { backgroundColor: team.primaryColor } : {}}
            >
              {getEventTypeLabel(type)}
            </button>
          ))}
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
              <p className="text-gray-600 font-medium">Loading stats...</p>
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
                <h3 className="text-red-800 font-semibold mb-1">Failed to load stats</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Player Stats Display */}
        {!loading && !error && statsView === 'player' && (
          <>
            {playerStats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No player stats available for the selected period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white" style={{ backgroundColor: team.primaryColor }}>
                      <th
                        className="text-left p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          PLAYER
                          <SortIndicator column="name" />
                        </div>
                      </th>
                      <th
                        className="text-center p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('games_played')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          GP
                          <SortIndicator column="games_played" />
                        </div>
                      </th>
                      <th
                        className="text-center p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('minutes_per_game')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          MPG
                          <SortIndicator column="minutes_per_game" />
                        </div>
                      </th>
                      <th
                        className="text-center p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('points_per_game')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          PPG
                          <SortIndicator column="points_per_game" />
                        </div>
                      </th>
                      <th
                        className="text-center p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('rebounds_per_game')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          RPG
                          <SortIndicator column="rebounds_per_game" />
                        </div>
                      </th>
                      <th
                        className="text-center p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('assists_per_game')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          APG
                          <SortIndicator column="assists_per_game" />
                        </div>
                      </th>
                      <th
                        className="text-center p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('steals_per_game')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          SPG
                          <SortIndicator column="steals_per_game" />
                        </div>
                      </th>
                      <th
                        className="text-center p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('blocks_per_game')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          BPG
                          <SortIndicator column="blocks_per_game" />
                        </div>
                      </th>
                      <th
                        className="text-center p-3 font-medium cursor-pointer hover:bg-black/10 transition-colors"
                        onClick={() => handleSort('fields_goal_percentage')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          FG%
                          <SortIndicator column="fields_goal_percentage" />
                        </div>
                      </th>
                      <th className="text-center p-3 font-medium">FT%</th>
                      <th className="text-center p-3 font-medium">3PM</th>
                      <th className="text-center p-3 font-medium">TO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayerStats.map((player, index) => (
                      <tr key={player.player_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">
                          {player.name}
                        </td>
                        <td className="p-3 text-center text-gray-700">{player.games_played}</td>
                        <td className="p-3 text-center text-gray-700">{player.minutes_per_game}</td>
                        <td className="p-3 text-center text-gray-900 font-bold">{player.points_per_game}</td>
                        <td className="p-3 text-center text-gray-700">{player.rebounds_per_game}</td>
                        <td className="p-3 text-center text-gray-700">{player.assists_per_game}</td>
                        <td className="p-3 text-center text-gray-700">{player.steals_per_game}</td>
                        <td className="p-3 text-center text-gray-700">{player.blocks_per_game}</td>
                        <td className="p-3 text-center text-gray-700">{player.fields_goal_percentage}</td>
                        <td className="p-3 text-center text-gray-700">{player.free_throws_percentage}</td>
                        <td className="p-3 text-center text-gray-700">{player.three_point_field_goals}</td>
                        <td className="p-3 text-center text-gray-700">{player.turnovers_per_game}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Team Stats Display */}
        {!loading && !error && statsView === 'team' && (
          <>
            {teamStats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No team stats available for the selected period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white" style={{ backgroundColor: team.primaryColor }}>
                      <th className="text-left p-3 font-medium">STAT</th>
                      <th className="text-center p-3 font-medium">TEAM</th>
                      <th className="text-center p-3 font-medium">OPP</th>
                      <th className="text-center p-3 font-medium">DIFF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats.map((stat, index) => (
                      <tr key={stat.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 font-semibold text-gray-900 capitalize">
                          {stat.name.replace(/_/g, ' ')}
                        </td>
                        <td className="p-3 text-center text-gray-700 font-medium">
                          {formatStatValue(stat.own)}
                        </td>
                        <td className="p-3 text-center text-gray-700">
                          {formatStatValue(stat.opponent)}
                        </td>
                        <td className="p-3 text-center">
                          {stat.diff && stat.diff !== '' ? (
                            <span
                              className={`font-bold ${
                                parseFloat(stat.diff) > 0
                                  ? 'text-green-600'
                                  : parseFloat(stat.diff) < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {parseFloat(stat.diff) > 0 ? '+' : ''}
                              {formatStatValue(stat.diff)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
