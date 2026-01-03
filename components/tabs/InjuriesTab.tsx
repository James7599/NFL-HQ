'use client';

import { TeamData } from '@/data/teams';
import { useState, useEffect } from 'react';

interface InjuriesTabProps {
  team: TeamData;
}

interface Injury {
  Name: string;
  Status: string;
  Part: string;
  Position: string;
  PlayerID: number;
  teamId: string;
}

export default function InjuriesTab({ team }: InjuriesTabProps) {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInjuries() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/nfl-hq/api/nfl/injuries?teamId=${team.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch injuries');
        }

        const data = await response.json();
        setInjuries(data.injuries || []);
      } catch (err) {
        console.error('Error fetching injuries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load injuries');
      } finally {
        setLoading(false);
      }
    }

    fetchInjuries();
  }, [team.id]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'out':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'doubtful':
        return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
      case 'questionable':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'probable':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Injury Report</h2>
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
            <p className="text-gray-600 font-medium">Loading injury report...</p>
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
              <h3 className="text-red-800 font-semibold mb-1">Failed to load injury report</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* No Injuries State */}
      {!loading && !error && injuries.length === 0 && (
        <div className="text-center py-12">
                    <p className="text-gray-700 font-medium mb-2">No injuries to report!</p>
          <p className="text-sm text-gray-500">
            The {team.fullName} currently have a clean bill of health.
          </p>
        </div>
      )}

      {/* Injuries Table */}
      {!loading && !error && injuries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white" style={{ backgroundColor: team.primaryColor }}>
                <th className="text-left p-3 font-medium">PLAYER</th>
                <th className="text-left p-3 font-medium">POS</th>
                <th className="text-left p-3 font-medium">INJURY</th>
                <th className="text-left p-3 font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {injuries.map((injury, index) => {
                const statusColors = getStatusColor(injury.Status);
                return (
                  <tr key={injury.PlayerID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-semibold text-gray-900">
                      {injury.Name}
                    </td>
                    <td className="p-3 text-gray-600">
                      {injury.Position}
                    </td>
                    <td className="p-3 text-gray-600">
                      {injury.Part}
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}>
                        {injury.Status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Legend */}
      {!loading && !error && injuries.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
              <span>Out - Will not play</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
              <span>Doubtful - Unlikely to play</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
              <span>Questionable - May play</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span>Probable - Likely to play</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
