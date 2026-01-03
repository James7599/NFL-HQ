'use client';

import { TeamData } from '@/data/teams';
import { useState, useEffect } from 'react';

interface TransactionsTabProps {
  team: TeamData;
}

export default function TransactionsTab({ team }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all transactions (already grouped by month in API response)
        const response = await fetch(
          `/nfl-hq/api/nfl/transactions/${team.id}?season=2025`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          setTransactions(data.data);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [team.id]);

  // Get transaction type badge color
  const getTransactionColor = (type: string) => {
    if (type.includes('Signed') || type.includes('Acquired')) return 'bg-green-100 text-green-800';
    if (type.includes('Waived') || type.includes('Released')) return 'bg-red-100 text-red-800';
    if (type.includes('Traded')) return 'bg-blue-100 text-blue-800';
    if (type.includes('Contract')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Transactions</h2>
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
            <p className="text-gray-600 font-medium">Loading transactions...</p>
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
              <h3 className="text-red-800 font-semibold mb-1">Failed to load transactions</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Display */}
      {!loading && !error && (
        <>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No transactions found for the selected period.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {transactions.map((monthData) => (
                <div key={monthData.month}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2" style={{ borderColor: team.primaryColor }}>
                    {monthData.month}
                  </h3>

                  <div className="space-y-3">
                    {monthData.transactions.map((transaction: any) => {
                      const transactionDate = new Date(transaction.date_of_transaction);
                      const formattedDate = transactionDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });

                      return (
                        <div
                          key={transaction.transaction_id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            {/* Transaction Info */}
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">{transaction.player.name}</span>
                                    {transaction.positions && transaction.positions.length > 0 && (
                                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        {transaction.positions[0].abbr}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                                      {transaction.transaction_type}
                                    </span>
                                    {transaction.description && (
                                      <span className="text-xs text-gray-600">
                                        {transaction.description}
                                      </span>
                                    )}
                                  </div>

                                  {transaction.from_team && transaction.from_team.name && (
                                    <div className="mt-2 text-sm text-gray-600">
                                      From: <span className="font-medium">{transaction.from_team.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="text-sm text-gray-600 sm:text-right whitespace-nowrap">
                              {formattedDate}
                            </div>
                          </div>
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
