'use client';

import { TeamData } from '@/data/teams';
import { useState, useEffect } from 'react';

interface RosterTabProps {
  team: TeamData;
}

interface Player {
  name: string;
  slug: string;
  jersey_no: string;
  is_active: boolean;
  height_in_inch: number;
  height_in_cm: number;
  weight_in_lbs: number;
  weight_in_kg: number;
  college: string;
  experience: {
    year_first: number;
    experience: number;
  };
  age: number;
  birth_date: string;
  positions: Array<{
    name: string;
    abbreviation: string;
  }>;
}

export default function RosterTab({ team }: RosterTabProps) {
  const [roster, setRoster] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>('all');

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
          // Filter only active players and sort by jersey number
          const activePlayers = data.squad
            .filter((player: Player) => player.is_active)
            .sort((a: Player, b: Player) => parseInt(a.jersey_no) - parseInt(b.jersey_no));

          setRoster(activePlayers);
        }
      } catch (err) {
        console.error('Error fetching roster:', err);
        setError(err instanceof Error ? err.message : 'Failed to load roster');
      } finally {
        setLoading(false);
      }
    }

    fetchRoster();
  }, [team.id]);

  // Filter roster by position
  const filteredRoster = filterPosition === 'all'
    ? roster
    : roster.filter(player => player.positions.some(pos => pos.abbreviation === filterPosition));

  // Get unique positions for filter (in preferred order)
  const positionOrder = ['all', 'PG', 'SG', 'SF', 'PF', 'C'];
  const availablePositions = new Set(roster.flatMap(player => player.positions.map(pos => pos.abbreviation)));
  const positions = positionOrder.filter(pos => pos === 'all' || availablePositions.has(pos));

  // Format height
  const formatHeight = (inches: number) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Roster</h2>
          <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '250px' }}></div>
        </div>

        {/* Position Filter */}
        {!loading && roster.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setFilterPosition(pos)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterPosition === pos
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={filterPosition === pos ? { backgroundColor: team.primaryColor } : {}}
              >
                {pos === 'all' ? 'All' : pos}
              </button>
            ))}
          </div>
        )}
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
            <p className="text-gray-600 font-medium">Loading roster...</p>
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
              <h3 className="text-red-800 font-semibold mb-1">Failed to load roster</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Roster Table */}
      {!loading && !error && (
        <>
          {filteredRoster.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No players found for the selected position.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white" style={{ backgroundColor: team.primaryColor }}>
                    <th className="text-left p-3 font-medium">NO</th>
                    <th className="text-left p-3 font-medium">PLAYER</th>
                    <th className="text-left p-3 font-medium">POS</th>
                    <th className="text-left p-3 font-medium">HT</th>
                    <th className="text-left p-3 font-medium">WT</th>
                    <th className="text-left p-3 font-medium">AGE</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">COLLEGE</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">EXP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoster.map((player, index) => (
                    <tr key={player.slug} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 font-bold text-gray-900">#{player.jersey_no}</td>
                      <td className="p-3">
                        <span className="font-semibold" style={{ color: team.primaryColor }}>
                          {player.name}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700">
                        {player.positions.map(pos => pos.abbreviation).join(', ')}
                      </td>
                      <td className="p-3 text-gray-700 whitespace-nowrap">{formatHeight(player.height_in_inch)}</td>
                      <td className="p-3 text-gray-700">{player.weight_in_lbs}</td>
                      <td className="p-3 text-gray-700">{player.age}</td>
                      <td className="p-3 text-gray-600 text-xs hidden md:table-cell">
                        {player.college || 'N/A'}
                      </td>
                      <td className="p-3 text-gray-700 hidden lg:table-cell">
                        {player.experience.experience === 0 ? 'R' : player.experience.experience}
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
  );
}
