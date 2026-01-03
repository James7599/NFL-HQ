'use client';

import { TeamData } from '@/data/teams';
import { useState, useEffect } from 'react';

interface DepthChartTabProps {
  team: TeamData;
}

interface Player {
  name: string;
  slug: string;
  jersey_no: string;
  is_active: boolean;
  positions: Array<{
    name: string;
    abbreviation: string;
  }>;
}

export default function DepthChartTab({ team }: DepthChartTabProps) {
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch roster
  useEffect(() => {
    async function fetchRoster() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/nfl-hq/api/nfl/roster/${team.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch roster');
        }

        const data = await response.json();

        if (data.squad) {
          const activePlayers = data.squad.filter((player: Player) => player.is_active);
          setRoster(activePlayers);
        }
      } catch (err) {
        console.error('Error fetching depth chart:', err);
        setError(err instanceof Error ? err.message : 'Failed to load depth chart');
      } finally {
        setLoading(false);
      }
    }

    fetchRoster();
  }, [team.id]);

  // Organize players by position
  const positionGroups = {
    'PG': { name: 'Point Guard', players: [] as Player[] },
    'SG': { name: 'Shooting Guard', players: [] as Player[] },
    'SF': { name: 'Small Forward', players: [] as Player[] },
    'PF': { name: 'Power Forward', players: [] as Player[] },
    'C': { name: 'Center', players: [] as Player[] },
  };

  // Group players by their primary position
  roster.forEach(player => {
    if (player.positions && player.positions.length > 0) {
      const primaryPos = player.positions[0].abbreviation;
      if (primaryPos in positionGroups) {
        positionGroups[primaryPos as keyof typeof positionGroups].players.push(player);
      }
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Depth Chart</h2>
          <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '320px' }}></div>
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
            <p className="text-gray-600 font-medium">Loading depth chart...</p>
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
              <h3 className="text-red-800 font-semibold mb-1">Failed to load depth chart</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Depth Chart */}
      {!loading && !error && (
        <div className="space-y-6">
          {(Object.keys(positionGroups) as Array<keyof typeof positionGroups>).map((posKey) => {
            const position = positionGroups[posKey];
            if (position.players.length === 0) return null;

            return (
              <div key={posKey} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Position Header */}
                <div className="text-white px-4 py-3 font-bold flex items-center justify-between" style={{ backgroundColor: team.primaryColor }}>
                  <span>{posKey} - {position.name}</span>
                  <span className="text-sm font-normal opacity-90">{position.players.length} player{position.players.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Players in Position */}
                <div className="bg-white">
                  {position.players.map((player, index) => (
                    <div
                      key={player.slug}
                      className={`px-4 py-3 flex items-center justify-between ${
                        index < position.players.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: team.primaryColor }}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{player.name}</div>
                          <div className="text-sm text-gray-600">#{player.jersey_no}</div>
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: `${team.primaryColor}20`, color: team.primaryColor }}>
                          STARTER
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {roster.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No depth chart data available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
