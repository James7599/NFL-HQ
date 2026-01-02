/**
 * NBA Draft Lottery Simulator
 * Simulates the NBA draft lottery based on official odds
 */

import { TeamData } from '@/data/teams';

// Official NBA lottery odds (2025-26 format)
// Odds are represented as number of combinations out of 1000
const LOTTERY_ODDS: { [seed: number]: number } = {
  1: 140,   // 14.0%
  2: 140,   // 14.0%
  3: 140,   // 14.0%
  4: 125,   // 12.5%
  5: 105,   // 10.5%
  6: 90,    // 9.0%
  7: 75,    // 7.5%
  8: 60,    // 6.0%
  9: 45,    // 4.5%
  10: 30,   // 3.0%
  11: 20,   // 2.0%
  12: 15,   // 1.5%
  13: 10,   // 1.0%
  14: 5     // 0.5%
};

export interface LotteryTeam {
  team: TeamData;
  seed: number;           // Pre-lottery seed (1-14)
  record: string;
  odds: number;           // Percentage chance
  combinations: number;   // Number of combinations
}

export interface LotteryResult {
  team: TeamData;
  originalSeed: number;
  finalPick: number;
  droppedSlots?: number;  // How many spots they fell (if any)
  wonLottery?: boolean;   // Top 4 pick
}

export interface SimulationResult {
  results: LotteryResult[];
  timestamp: number;
  simulationId: string;
}

export class LotterySimulator {
  /**
   * Run a single lottery simulation
   */
  simulate(teams: LotteryTeam[]): SimulationResult {
    if (teams.length !== 14) {
      throw new Error('Lottery requires exactly 14 teams');
    }

    // Sort teams by seed
    const sortedTeams = [...teams].sort((a, b) => a.seed - b.seed);

    // Track which teams have been assigned picks
    const assignedPicks = new Set<number>();
    const results: LotteryResult[] = [];

    // Draw top 4 picks using lottery odds
    for (let pickNum = 1; pickNum <= 4; pickNum++) {
      const availableTeams = sortedTeams.filter(t => !assignedPicks.has(t.seed));
      const winner = this.drawLotteryPick(availableTeams);

      results.push({
        team: winner.team,
        originalSeed: winner.seed,
        finalPick: pickNum,
        wonLottery: true,
        droppedSlots: 0
      });

      assignedPicks.add(winner.seed);
    }

    // Assign remaining picks (5-14) in reverse standings order
    let currentPick = 5;
    for (const team of sortedTeams) {
      if (!assignedPicks.has(team.seed)) {
        const droppedSlots = currentPick - team.seed;

        results.push({
          team: team.team,
          originalSeed: team.seed,
          finalPick: currentPick,
          wonLottery: false,
          droppedSlots: droppedSlots > 0 ? droppedSlots : undefined
        });

        currentPick++;
      }
    }

    // Sort results by final pick order
    results.sort((a, b) => a.finalPick - b.finalPick);

    return {
      results,
      timestamp: Date.now(),
      simulationId: this.generateSimulationId()
    };
  }

  /**
   * Draw a single lottery pick based on odds
   */
  private drawLotteryPick(teams: LotteryTeam[]): LotteryTeam {
    // Calculate total combinations
    const totalCombinations = teams.reduce((sum, team) => sum + team.combinations, 0);

    // Generate random number
    const random = Math.floor(Math.random() * totalCombinations);

    // Find which team's range the random number falls into
    let cumulative = 0;
    for (const team of teams) {
      cumulative += team.combinations;
      if (random < cumulative) {
        return team;
      }
    }

    // Fallback (should never happen)
    return teams[0];
  }

  /**
   * Run multiple simulations and aggregate results
   */
  runMultipleSimulations(teams: LotteryTeam[], count: number): AggregatedResults {
    const allResults: SimulationResult[] = [];

    for (let i = 0; i < count; i++) {
      allResults.push(this.simulate(teams));
    }

    return this.aggregateResults(allResults, teams);
  }

  /**
   * Aggregate multiple simulation results into statistics
   */
  private aggregateResults(simulations: SimulationResult[], teams: LotteryTeam[]): AggregatedResults {
    const teamStats = new Map<string, TeamStatistics>();

    // Initialize statistics for each team
    teams.forEach(team => {
      teamStats.set(team.team.id, {
        team: team.team,
        originalSeed: team.seed,
        pickDistribution: Array(14).fill(0),
        averagePick: 0,
        bestPick: 14,
        worstPick: 1,
        top1Probability: 0,
        top3Probability: 0,
        top4Probability: 0
      });
    });

    // Process each simulation
    simulations.forEach(sim => {
      sim.results.forEach(result => {
        const stats = teamStats.get(result.team.id);
        if (!stats) return;

        // Update pick distribution
        stats.pickDistribution[result.finalPick - 1]++;

        // Update best/worst picks
        stats.bestPick = Math.min(stats.bestPick, result.finalPick);
        stats.worstPick = Math.max(stats.worstPick, result.finalPick);

        // Count top picks
        if (result.finalPick === 1) stats.top1Count = (stats.top1Count || 0) + 1;
        if (result.finalPick <= 3) stats.top3Count = (stats.top3Count || 0) + 1;
        if (result.finalPick <= 4) stats.top4Count = (stats.top4Count || 0) + 1;
      });
    });

    // Calculate probabilities and averages
    const totalSims = simulations.length;
    teamStats.forEach(stats => {
      // Convert counts to probabilities
      stats.pickDistribution = stats.pickDistribution.map(count => (count / totalSims) * 100);

      stats.top1Probability = ((stats.top1Count || 0) / totalSims) * 100;
      stats.top3Probability = ((stats.top3Count || 0) / totalSims) * 100;
      stats.top4Probability = ((stats.top4Count || 0) / totalSims) * 100;

      // Calculate average pick
      let weightedSum = 0;
      stats.pickDistribution.forEach((prob, index) => {
        weightedSum += (index + 1) * (prob / 100);
      });
      stats.averagePick = weightedSum;
    });

    return {
      simulationCount: totalSims,
      teamStatistics: Array.from(teamStats.values())
    };
  }

  /**
   * Get official lottery odds for a seed
   */
  getOddsForSeed(seed: number): { combinations: number; percentage: number } {
    const combinations = LOTTERY_ODDS[seed] || 0;
    return {
      combinations,
      percentage: (combinations / 1000) * 100
    };
  }

  /**
   * Create lottery teams from standings
   */
  createLotteryTeams(teams: TeamData[], records: Map<string, string>): LotteryTeam[] {
    // Sort teams by record (worst to best)
    const sortedTeams = [...teams].sort((a, b) => {
      const aRecord = records.get(a.id) || a.record || '0-0';
      const bRecord = records.get(b.id) || b.record || '0-0';
      const [aWins] = aRecord.split('-').map(Number);
      const [bWins] = bRecord.split('-').map(Number);
      return aWins - bWins;
    });

    // Take bottom 14 teams
    const lotteryTeams = sortedTeams.slice(0, 14);

    // Assign seeds and odds
    return lotteryTeams.map((team, index) => {
      const seed = index + 1;
      const odds = this.getOddsForSeed(seed);
      const record = records.get(team.id) || team.record || '0-0';

      return {
        team,
        seed,
        record,
        odds: odds.percentage,
        combinations: odds.combinations
      };
    });
  }

  private generateSimulationId(): string {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface TeamStatistics {
  team: TeamData;
  originalSeed: number;
  pickDistribution: number[];  // Probability of landing at each pick (1-14)
  averagePick: number;
  bestPick: number;
  worstPick: number;
  top1Probability: number;
  top3Probability: number;
  top4Probability: number;
  top1Count?: number;          // Raw count (used internally)
  top3Count?: number;
  top4Count?: number;
}

export interface AggregatedResults {
  simulationCount: number;
  teamStatistics: TeamStatistics[];
}

// Export singleton instance
export const lotterySimulator = new LotterySimulator();
