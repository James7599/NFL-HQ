'use client';

import { useState, useEffect } from 'react';
import NFLTeamsSidebar from '@/components/NFLTeamsSidebar';
import { getAllTeams } from '@/data/teams';
import { getApiPath } from '@/utils/api';
import SkeletonLoader from '@/components/SkeletonLoader';

interface Transaction {
  id: number;
  date: string;
  dateTimestamp: string;
  player: string;
  playerSlug: string;
  position: string;
  transaction: string;
  teamId: string;
  teamName: string;
  teamAbbr: string;
  fromTeam?: string;
  toTeam?: string;
}

interface GroupedTransactions {
  [date: string]: Transaction[];
}

export default function TransactionsClient() {
  const allTeams = getAllTeams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const url = selectedTeam === 'all'
          ? getApiPath('api/nfl/transactions?limit=200')
          : getApiPath(`api/nfl/transactions?team=${selectedTeam}&limit=200`);

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch transactions');

        const data = await response.json();
        setTransactions(data.transactions || []);
        setLastUpdated(new Date(data.lastUpdated).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }));
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [selectedTeam]);

  // Group transactions by date
  const groupedTransactions: GroupedTransactions = {};
  transactions.forEach(transaction => {
    const date = transaction.date;
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });

  const dates = Object.keys(groupedTransactions);

  const getTeamInfo = (teamId: string) => {
    return allTeams.find(t => t.id === teamId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:block lg:w-64 flex-shrink-0">
        <NFLTeamsSidebar />
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <NFLTeamsSidebar isMobile={true} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        {/* Header Section */}
        <div className="bg-[#0050A0] text-white py-8 px-4 sm:px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">
              NFL Transactions
            </h1>
            <p className="text-base sm:text-lg lg:text-xl opacity-90">
              Latest signings, releases, trades, and roster moves
            </p>
          </div>
        </div>

        {/* Raptive Header Ad */}
        <div className="container mx-auto px-4 min-h-[150px]">
          <div className="raptive-pfn-header"></div>
        </div>

        {/* Content */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          {/* Filter and Last Updated */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <label htmlFor="team-filter" className="text-sm font-semibold text-gray-700">
                  Filter by Team:
                </label>
                <select
                  id="team-filter"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0050A0] bg-white text-sm"
                >
                  <option value="all">All Teams</option>
                  {allTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Last Updated:</strong> {lastUpdated || 'Loading...'}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <SkeletonLoader type="table" rows={20} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600">No transactions found for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dates.map(date => (
                <div key={date} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Date Header */}
                  <div className="bg-gray-100 border-b border-gray-200 px-4 sm:px-6 py-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      {date}
                    </h2>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                      <thead className="bg-[#0050A0] text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold w-24">TEAM</th>
                          <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold">PLAYER</th>
                          <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold w-20">POS</th>
                          <th className="px-4 py-3 text-left text-xs sm:text-sm font-bold">TRANSACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedTransactions[date].map((transaction, index) => {
                          const team = getTeamInfo(transaction.teamId);
                          return (
                            <tr
                              key={transaction.id}
                              className={`border-b border-gray-200 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              } hover:bg-blue-50 transition-colors`}
                            >
                              {/* Team */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {team && (
                                    <img
                                      src={team.logoUrl}
                                      alt={team.abbreviation}
                                      className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                                    />
                                  )}
                                  <span className="font-semibold text-[#0050A0] text-xs sm:text-sm">
                                    {transaction.teamAbbr}
                                  </span>
                                </div>
                              </td>

                              {/* Player */}
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-900 text-sm">
                                  {transaction.player}
                                </span>
                              </td>

                              {/* Position */}
                              <td className="px-4 py-3">
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                  {transaction.position}
                                </span>
                              </td>

                              {/* Transaction */}
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-700">
                                  {transaction.transaction}
                                  {transaction.fromTeam && transaction.toTeam && (
                                    <span className="text-gray-500 ml-1">
                                      (from {transaction.fromTeam} to {transaction.toTeam})
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
