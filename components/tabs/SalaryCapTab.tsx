'use client';

import { useEffect, useState } from 'react';
import { TeamData } from '@/data/teams';

interface SalaryCapTabProps {
  team: TeamData;
}

interface PlayerSalary {
  name: string;
  age: number;
  salaries: {
    '2025-26': number;
    '2026-27': number;
    '2027-28': number;
    '2028-29': number;
    '2029-30': number;
    '2030-31': number;
    guaranteed: number;
  };
}

interface TeamSalaryData {
  lastUpdated: string;
  source: string;
  team: string;
  slug: string;
  totalPayroll: number;
  salaryCap: number;
  capSpace: number;
  players: PlayerSalary[];
}

export default function SalaryCapTab({ team }: SalaryCapTabProps) {
  const [salaryData, setSalaryData] = useState<TeamSalaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2025-26');

  useEffect(() => {
    async function fetchSalaryData() {
      try {
        setLoading(true);
        // Map team ID to file name (team IDs use full names, files use abbreviations)
        const teamAbbrev = team.abbreviation.toLowerCase();
        const response = await fetch(`/data/salary-cap/${teamAbbrev}.json`);

        if (!response.ok) {
          throw new Error('Salary data not available');
        }

        const data: TeamSalaryData = await response.json();
        setSalaryData(data);
      } catch (err) {
        console.error('Error loading salary data:', err);
        setError('Salary cap data is currently unavailable for this team.');
      } finally {
        setLoading(false);
      }
    }

    fetchSalaryData();
  }, [team]);

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const luxuryTaxThreshold = 187895000; // 2025-26 luxury tax threshold
  const firstApron = 195945000; // First apron
  const secondApron = 207824000; // Second apron

  const isOverLuxuryTax = salaryData && salaryData.totalPayroll > luxuryTaxThreshold;
  const isOverFirstApron = salaryData && salaryData.totalPayroll > firstApron;
  const isOverSecondApron = salaryData && salaryData.totalPayroll > secondApron;

  // Calculate year totals
  const getYearTotal = (year: string): number => {
    if (!salaryData) return 0;
    return salaryData.players.reduce((sum, player) => {
      return sum + (player.salaries[year as keyof typeof player.salaries] as number || 0);
    }, 0);
  };

  // Sort players by selected year salary
  const sortedPlayers = salaryData?.players ?
    [...salaryData.players].sort((a, b) => {
      const aSalary = a.salaries[selectedYear as keyof typeof a.salaries] as number || 0;
      const bSalary = b.salaries[selectedYear as keyof typeof b.salaries] as number || 0;
      return bSalary - aSalary;
    }).filter(player => {
      // Only show players with salary in selected year
      return (player.salaries[selectedYear as keyof typeof player.salaries] as number || 0) > 0;
    }) : [];

  const years = ['2025-26', '2026-27', '2027-28', '2028-29', '2029-30', '2030-31'];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading salary cap data...</p>
        </div>
      </div>
    );
  }

  if (error || !salaryData) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Salary Cap</h2>
            <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '320px' }}></div>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-2">{error || 'Salary cap data is not available for this team yet.'}</p>
          <p className="text-sm text-gray-500">Data will be available soon via automated updates from Basketball Reference.</p>
        </div>
      </div>
    );
  }

  const currentYearTotal = getYearTotal(selectedYear);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Salary Cap</h2>
          <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '320px' }}></div>
        </div>
      </div>

      {/* Cap Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: team.primaryColor }}>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentYearTotal)}</p>
            <p className="text-sm text-gray-600">Total Payroll</p>
            <p className="text-xs text-gray-500 mt-1">{sortedPlayers.length} players</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-300">
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(salaryData.salaryCap)}</p>
            <p className="text-sm text-gray-600">Salary Cap</p>
            <p className="text-xs text-gray-500 mt-1">2025-26 Season</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: salaryData.capSpace >= 0 ? '#10b981' : '#ef4444' }}>
          <div>
            <p className={`text-2xl font-bold ${salaryData.capSpace >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(salaryData.capSpace))}
            </p>
            <p className="text-sm text-gray-600">{salaryData.capSpace >= 0 ? 'Cap Space' : 'Over Cap'}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((Math.abs(salaryData.capSpace) / salaryData.salaryCap) * 100).toFixed(1)}% of cap
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: isOverLuxuryTax ? '#ef4444' : '#10b981' }}>
          <div>
            <p className={`text-2xl font-bold ${isOverLuxuryTax ? 'text-red-600' : 'text-green-600'}`}>
              {isOverLuxuryTax ? formatCurrency(salaryData.totalPayroll - luxuryTaxThreshold) : 'Under'}
            </p>
            <p className="text-sm text-gray-600">Luxury Tax</p>
            <p className="text-xs text-gray-500 mt-1">
              {isOverLuxuryTax ? 'Over threshold' : `${formatCurrency(luxuryTaxThreshold - salaryData.totalPayroll)} below`}
            </p>
          </div>
        </div>
      </div>

      {/* Luxury Tax & Apron Status */}
      {isOverLuxuryTax && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h3 className="font-semibold text-red-900 mb-2">Luxury Tax Status</h3>
          <div className="text-sm text-red-800 space-y-1">
            <p>• Over luxury tax threshold ({formatCurrency(luxuryTaxThreshold)})</p>
            {isOverFirstApron && <p>• Over first apron ({formatCurrency(firstApron)}) - Limited trade flexibility</p>}
            {isOverSecondApron && <p>• Over second apron ({formatCurrency(secondApron)}) - Significant restrictions</p>}
          </div>
        </div>
      )}

      {/* Player Contracts Table */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Player Salaries</h3>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white border-2 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
              style={{
                borderColor: team.primaryColor
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white" style={{ backgroundColor: team.primaryColor }}>
                <th className="text-left p-3 font-medium">Player</th>
                <th className="text-center p-3 font-medium">Age</th>
                <th className="text-right p-3 font-medium">{selectedYear}</th>
                <th className="text-right p-3 font-medium hidden sm:table-cell">Guaranteed</th>
                <th className="text-center p-3 font-medium hidden md:table-cell">% of Cap</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => {
                const salary = player.salaries[selectedYear as keyof typeof player.salaries] as number;
                const capPercentage = (salary / salaryData.salaryCap) * 100;

                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900">{player.name}</td>
                    <td className="p-3 text-center text-gray-600">{player.age}</td>
                    <td className="p-3 text-right font-semibold text-gray-900">{formatCurrency(salary)}</td>
                    <td className="p-3 text-right text-gray-600 hidden sm:table-cell">
                      {formatCurrency(player.salaries.guaranteed)}
                    </td>
                    <td className="p-3 text-center text-gray-600 hidden md:table-cell">
                      {capPercentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="font-bold border-t-2 border-gray-300">
                <td className="p-3 text-gray-900" colSpan={2}>Total</td>
                <td className="p-3 text-right text-gray-900">{formatCurrency(currentYearTotal)}</td>
                <td className="p-3 text-right text-gray-600 hidden sm:table-cell">-</td>
                <td className="p-3 text-center text-gray-600 hidden md:table-cell">
                  {((currentYearTotal / salaryData.salaryCap) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Year Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Multi-Year Payroll Projection</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 font-medium text-gray-700">Season</th>
                <th className="text-right p-3 font-medium text-gray-700">Total Payroll</th>
                <th className="text-right p-3 font-medium text-gray-700 hidden sm:table-cell">Active Players</th>
              </tr>
            </thead>
            <tbody>
              {years.map((year, index) => {
                const yearTotal = getYearTotal(year);
                const playerCount = salaryData.players.filter(p =>
                  (p.salaries[year as keyof typeof p.salaries] as number || 0) > 0
                ).length;

                return (
                  <tr key={year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 font-medium text-gray-900">{year}</td>
                    <td className="p-3 text-right font-semibold text-gray-900">{formatCurrency(yearTotal)}</td>
                    <td className="p-3 text-right text-gray-600 hidden sm:table-cell">{playerCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-500 border-t pt-4">
        <p>Note: Salaries include base salary and do not reflect bonuses, incentives, or other compensation. Player/team options may affect actual payroll.</p>
      </div>
    </div>
  );
}
