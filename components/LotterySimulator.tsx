'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import { lotterySimulator, LotteryTeam, SimulationResult, AggregatedResults } from '@/lib/lotterySimulator';

interface LotterySimulatorProps {
  teams: LotteryTeam[];
}

export default function LotterySimulator({ teams }: LotterySimulatorProps) {
  const [singleResult, setSingleResult] = useState<SimulationResult | null>(null);
  const [aggregatedResults, setAggregatedResults] = useState<AggregatedResults | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAggregated, setShowAggregated] = useState(false);

  const runSingleSimulation = () => {
    setIsSimulating(true);
    setShowAggregated(false);

    // Small delay for animation effect
    setTimeout(() => {
      const result = lotterySimulator.simulate(teams);
      setSingleResult(result);
      setAggregatedResults(null);
      setIsSimulating(false);
    }, 500);
  };

  const runMultipleSimulations = (count: number) => {
    setIsSimulating(true);
    setShowAggregated(true);

    // Run in next tick to allow UI to update
    setTimeout(() => {
      const results = lotterySimulator.runMultipleSimulations(teams, count);
      setAggregatedResults(results);
      setSingleResult(null);
      setIsSimulating(false);
    }, 100);
  };

  const clearResults = () => {
    setSingleResult(null);
    setAggregatedResults(null);
    setShowAggregated(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lottery Simulator</h2>
          <p className="text-sm text-gray-600">Simulate the draft lottery to see possible outcomes</p>
        </div>
        {(singleResult || aggregatedResults) && (
          <button
            onClick={clearResults}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear results"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={runSingleSimulation}
          disabled={isSimulating}
          className="px-4 py-2 bg-[#0050A0] text-white rounded-lg hover:bg-[#003d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSimulating && !showAggregated ? 'Running...' : 'Run Once'}
        </button>

        <button
          onClick={() => runMultipleSimulations(1000)}
          disabled={isSimulating}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSimulating && showAggregated ? 'Running...' : 'Run 1,000x'}
        </button>

        <button
          onClick={() => runMultipleSimulations(10000)}
          disabled={isSimulating}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSimulating && showAggregated ? 'Running...' : 'Run 10,000x'}
        </button>
      </div>

      {/* Loading State */}
      {isSimulating && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0050A0]"></div>
          <p className="mt-4 text-gray-600 font-medium">
            {showAggregated ? 'Running simulations...' : 'Simulating lottery...'}
          </p>
        </div>
      )}

      {/* Single Simulation Result */}
      {!isSimulating && singleResult && (
        <div>
          <div className="bg-blue-50 border-l-4 border-[#0050A0] p-4 mb-4">
            <p className="text-sm font-medium text-blue-800">
              Single simulation result - This is one possible outcome
            </p>
          </div>

          <div className="space-y-2">
            {singleResult.results.slice(0, 14).map((result, index) => (
              <div
                key={result.team.id}
                className={`flex items-center gap-4 p-3 rounded-lg border-2 ${
                  result.wonLottery
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded flex items-center justify-center text-xl font-bold ${
                  result.wonLottery ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-300 text-gray-700'
                }`}>
                  {result.finalPick}
                </div>

                <img
                  src={result.team.logoUrl}
                  alt={result.team.abbreviation}
                  
                  
                  className="w-10 h-10"
                />

                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {result.team.fullName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Original seed: #{result.originalSeed}
                    {result.droppedSlots && (
                      <span className="ml-2 text-red-600">
                        (Dropped {result.droppedSlots} {result.droppedSlots === 1 ? 'spot' : 'spots'})
                      </span>
                    )}
                  </div>
                </div>

                {result.wonLottery && (
                  <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                    WON LOTTERY
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aggregated Results */}
      {!isSimulating && aggregatedResults && (
        <div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm font-medium text-blue-800">
              Probability analysis from {aggregatedResults.simulationCount.toLocaleString()} simulations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="p-3 text-left font-bold">Team</th>
                  <th className="p-3 text-center font-bold">Seed</th>
                  <th className="p-3 text-center font-bold">Avg Pick</th>
                  <th className="p-3 text-center font-bold">Range</th>
                  <th className="p-3 text-center font-bold">Top 1</th>
                  <th className="p-3 text-center font-bold">Top 3</th>
                  <th className="p-3 text-center font-bold">Top 4</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedResults.teamStatistics
                  .sort((a, b) => a.originalSeed - b.originalSeed)
                  .map((stat) => (
                    <tr key={stat.team.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={stat.team.logoUrl}
                            alt={stat.team.abbreviation}
                            
                            
                            className="w-6 h-6"
                          />
                          <span className="font-medium">{stat.team.abbreviation}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-gray-700">#{stat.originalSeed}</td>
                      <td className="p-3 text-center font-semibold text-gray-900">
                        {stat.averagePick.toFixed(1)}
                      </td>
                      <td className="p-3 text-center text-gray-700">
                        {stat.bestPick}-{stat.worstPick}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-semibold ${
                          stat.top1Probability > 10 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {stat.top1Probability.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-semibold ${
                          stat.top3Probability > 30 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {stat.top3Probability.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-semibold ${
                          stat.top4Probability > 40 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {stat.top4Probability.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pick Distribution Chart (improved visual representation) */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Pick Distribution Heatmap</h3>
            <p className="text-xs text-gray-600 mb-4">
              Shows the probability of each team landing at each pick position
            </p>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Header row with pick numbers */}
                <div className="flex items-center mb-2">
                  <div className="w-32 text-xs font-semibold text-gray-700">Team</div>
                  <div className="flex-1 flex gap-1">
                    {Array.from({ length: 14 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 text-center text-[10px] font-semibold text-gray-700"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team rows */}
                {aggregatedResults.teamStatistics
                  .sort((a, b) => a.originalSeed - b.originalSeed)
                  .slice(0, 8)
                  .map((stat) => (
                    <div key={stat.team.id} className="flex items-center mb-1 group">
                      {/* Team name */}
                      <div className="w-32 flex items-center gap-2 pr-2">
                        <img
                          src={stat.team.logoUrl}
                          alt={stat.team.abbreviation}
                          
                          
                          className="w-5 h-5"
                        />
                        <div>
                          <div className="text-xs font-semibold text-gray-900">{stat.team.abbreviation}</div>
                          <div className="text-[10px] text-gray-500">#{stat.originalSeed}</div>
                        </div>
                      </div>

                      {/* Probability cells */}
                      <div className="flex-1 flex gap-1">
                        {stat.pickDistribution.map((prob, pickIndex) => {
                          const isLottery = pickIndex < 4;
                          const opacity = prob > 0 ? Math.min(prob / 50, 1) : 0;

                          // Determine cell color based on probability
                          let bgColorClass = '';
                          if (prob === 0) {
                            bgColorClass = 'bg-gray-100';
                          } else if (prob < 5) {
                            bgColorClass = isLottery ? 'bg-yellow-100' : 'bg-blue-100';
                          } else if (prob < 15) {
                            bgColorClass = isLottery ? 'bg-yellow-200' : 'bg-blue-200';
                          } else if (prob < 30) {
                            bgColorClass = isLottery ? 'bg-yellow-300' : 'bg-blue-300';
                          } else {
                            bgColorClass = isLottery ? 'bg-yellow-400' : 'bg-blue-400';
                          }

                          return (
                            <div
                              key={pickIndex}
                              className={`flex-1 h-12 flex items-center justify-center rounded ${bgColorClass}`}
                            >
                              {prob >= 0.1 && (
                                <span className={`text-[10px] font-bold ${
                                  prob > 25 ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {prob.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                {/* Legend */}
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-gray-600 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <span>Lottery picks (1-4)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded"></div>
                    <span>Non-lottery picks (5-14)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Darker color = Higher probability</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!singleResult && !aggregatedResults && !isSimulating && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li><strong>Run Once:</strong> See one possible lottery outcome</li>
            <li><strong>Run 1,000x:</strong> See probability analysis and average outcomes</li>
            <li><strong>Run 10,000x:</strong> Get more accurate probability distributions</li>
          </ul>
          <p className="text-xs text-gray-600 mt-3">
            The simulator uses official NBA lottery odds. Only the top 4 picks are determined by lottery;
            picks 5-14 are assigned in reverse order of regular season record.
          </p>
        </div>
      )}
    </div>
  );
}
