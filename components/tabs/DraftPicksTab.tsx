'use client';

import { TeamData } from '@/data/teams';
import { useState, useEffect, useMemo } from 'react';

interface DraftPicksTabProps {
  team: TeamData;
}

interface IncomingPick {
  year: number;
  round: number;
  pick: string;
  from: string;
  protections: string;
}

interface OutgoingPick {
  year: number;
  round: number;
  pick: string;
  to: string;
  protections: string;
}

interface HistoricalPick {
  year: number;
  round: number;
  pick: number;
  player: string;
  from: string;
}

interface DraftData {
  teamId: string;
  incomingPicks: IncomingPick[];
  outgoingPicks: OutgoingPick[];
  historicalPicks: HistoricalPick[];
}

export default function DraftPicksTab({ team }: DraftPicksTabProps) {
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadDraftData() {
      try {
        const response = await fetch(`/data/draft-picks/${team.id}.json`);
        if (response.ok) {
          const data = await response.json();
          setDraftData(data);
        }
      } catch (error) {
        console.error('Error loading draft data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDraftData();
  }, [team.id]);

  // Get unique years for filter
  const availableYears = useMemo(() => {
    if (!draftData) return [];
    const years = Array.from(new Set(draftData.historicalPicks.map(p => p.year)));
    return years.sort((a, b) => b - a);
  }, [draftData]);

  // Filter historical picks
  const filteredPicks = useMemo(() => {
    if (!draftData) return [];

    return draftData.historicalPicks.filter(pick => {
      const matchesYear = selectedYear === 'all' || pick.year === parseInt(selectedYear);
      const matchesRound = selectedRound === 'all' || pick.round === parseInt(selectedRound);
      const matchesSearch = searchQuery === '' ||
        pick.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pick.from.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesYear && matchesRound && matchesSearch;
    });
  }, [draftData, selectedYear, selectedRound, searchQuery]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading draft data...</div>
        </div>
      </div>
    );
  }

  if (!draftData) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Draft Picks</h2>
            <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '320px' }}></div>
          </div>
        </div>
        <p className="text-center text-gray-500 py-12">Draft pick data not available for this team yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Incoming Draft Picks */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Incoming Draft Picks</h2>
            <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '260px' }}></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white" style={{ backgroundColor: team.primaryColor }}>
                <th className="text-left p-3 font-medium">YEAR</th>
                <th className="text-left p-3 font-medium">ROUND</th>
                <th className="text-left p-3 font-medium">PICK NO.</th>
                <th className="text-left p-3 font-medium">FROM</th>
                <th className="text-left p-3 font-medium">PROTECTIONS</th>
              </tr>
            </thead>
            <tbody>
              {draftData.incomingPicks.length > 0 ? (
                draftData.incomingPicks.map((pick, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900">{pick.year}</td>
                    <td className="p-3">{pick.round}</td>
                    <td className="p-3">{pick.pick}</td>
                    <td className="p-3 text-gray-600">{pick.from}</td>
                    <td className="p-3 text-gray-600 text-xs">{pick.protections}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No incoming draft picks on record
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outgoing Draft Picks */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Outgoing Draft Picks</h2>
            <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '260px' }}></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white" style={{ backgroundColor: team.primaryColor }}>
                <th className="text-left p-3 font-medium">YEAR</th>
                <th className="text-left p-3 font-medium">ROUND</th>
                <th className="text-left p-3 font-medium">PICK NO.</th>
                <th className="text-left p-3 font-medium">TO</th>
                <th className="text-left p-3 font-medium">PROTECTIONS</th>
              </tr>
            </thead>
            <tbody>
              {draftData.outgoingPicks.length > 0 ? (
                draftData.outgoingPicks.map((pick, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900">{pick.year}</td>
                    <td className="p-3">{pick.round}</td>
                    <td className="p-3">{pick.pick}</td>
                    <td className="p-3 text-gray-600">{pick.to}</td>
                    <td className="p-3 text-gray-600 text-xs">{pick.protections}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No outgoing draft picks on record
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Picks with Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Draft History</h2>
            <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '180px' }}></div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Round Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Round</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
            >
              <option value="all">All Rounds</option>
              <option value="1">Round 1</option>
              <option value="2">Round 2</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Player</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white" style={{ backgroundColor: team.primaryColor }}>
                <th className="text-left p-3 font-medium">YEAR</th>
                <th className="text-left p-3 font-medium">RD</th>
                <th className="text-left p-3 font-medium">PICK</th>
                <th className="text-left p-3 font-medium">PLAYER</th>
                <th className="text-left p-3 font-medium">FROM</th>
              </tr>
            </thead>
            <tbody>
              {filteredPicks.length > 0 ? (
                filteredPicks.map((pick, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900">{pick.year}</td>
                    <td className="p-3">{pick.round}</td>
                    <td className="p-3 font-semibold" style={{ color: team.primaryColor }}>{pick.pick}</td>
                    <td className="p-3 font-medium text-gray-900">{pick.player}</td>
                    <td className="p-3 text-gray-600">{pick.from}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    {draftData.historicalPicks.length === 0
                      ? 'No historical draft picks on record'
                      : 'No draft picks found matching your filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
