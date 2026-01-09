/**
 * Shared team helper utilities for NFL HQ
 */

import { getAllTeams } from '@/data/teams';

/**
 * Get team info by team ID
 */
export const getTeamInfoById = (teamId: string) => {
  const allTeams = getAllTeams();
  return allTeams.find(t => t.id === teamId);
};

/**
 * Get team info by team abbreviation
 */
export const getTeamInfoByAbbr = (teamAbbr: string) => {
  const allTeams = getAllTeams();
  return allTeams.find(t => t.abbreviation === teamAbbr);
};

/**
 * Map team name to team ID for lookups
 */
export const mapTeamNameToId = (teamName: string): string | null => {
  if (!teamName) return null;

  const allTeams = getAllTeams();
  const teamNameLower = teamName.toLowerCase();

  const team = allTeams.find(
    t =>
      t.name.toLowerCase() === teamNameLower ||
      t.fullName.toLowerCase() === teamNameLower ||
      t.abbreviation.toLowerCase() === teamNameLower
  );

  return team ? team.id : null;
};
