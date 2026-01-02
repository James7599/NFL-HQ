'use client';

import { TeamData } from '@/data/teams';
import { getTeamInfo } from '@/data/teamInfo';

interface TeamInfoTabProps {
  team: TeamData;
}

export default function TeamInfoTab({ team }: TeamInfoTabProps) {
  const teamInfoData = getTeamInfo(team.id);

  if (!teamInfoData) {
    return <div>Team information not found</div>;
  }

  const teamInfo = {
    founded: teamInfoData.founded,
    arena: team.homeVenue,
    capacity: teamInfoData.capacity,
    location: team.location,
    owner: teamInfoData.owner,
    championships: teamInfoData.championships,
    conferenceChampionships: teamInfoData.conferenceChampionships,
    divisionTitles: teamInfoData.divisionTitles,
    playoffAppearances: teamInfoData.playoffAppearances
  };

  const retiredNumbers = teamInfoData.retiredNumbers;

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 min-h-[600px]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Team Information</h2>
          <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '320px' }}></div>
        </div>
      </div>

      {/* Team Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: team.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamInfo.founded}</p>
              <p className="text-sm text-gray-600">Founded</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: team.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900">{teamInfo.arena}</p>
              <p className="text-sm text-gray-600">Home Arena</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: team.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{teamInfo.capacity}</p>
              <p className="text-sm text-gray-600">Arena Capacity</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: team.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{team.division}</p>
              <p className="text-sm text-gray-600">Division</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: team.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{teamInfo.location}</p>
              <p className="text-sm text-gray-600">Location</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: team.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{teamInfo.owner}</p>
              <p className="text-sm text-gray-600">Owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Team Achievements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* NBA Championships */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg" style={{ backgroundColor: team.primaryColor }}>
              {teamInfo.championships}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900">NBA Championships</div>
              <div className="text-sm text-gray-600">
                {teamInfoData.championshipYears && teamInfoData.championshipYears.length > 0
                  ? teamInfoData.championshipYears.join(', ')
                  : 'No championships yet'}
              </div>
            </div>
          </div>

          {/* Division Titles */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg" style={{ backgroundColor: team.primaryColor }}>
              {teamInfo.divisionTitles}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900">Division Titles</div>
              <div className="text-sm text-gray-600">
                {teamInfoData.mostRecentDivisionTitle
                  ? `Most Recent: ${teamInfoData.mostRecentDivisionTitle}`
                  : 'No division titles yet'}
              </div>
            </div>
          </div>

          {/* Conference Championships */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg" style={{ backgroundColor: team.primaryColor }}>
              {teamInfo.conferenceChampionships}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900">Conference Championships</div>
              <div className="text-sm text-gray-600">
                {teamInfoData.mostRecentConferenceChampionship
                  ? `Most Recent: ${teamInfoData.mostRecentConferenceChampionship}`
                  : 'No conference championships yet'}
              </div>
            </div>
          </div>

          {/* Playoff Appearances */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg" style={{ backgroundColor: team.primaryColor }}>
              {teamInfo.playoffAppearances}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-900">Playoff Appearances</div>
              <div className="text-sm text-gray-600">
                {teamInfoData.mostRecentPlayoffAppearance
                  ? `Most Recent: ${teamInfoData.mostRecentPlayoffAppearance}`
                  : 'No playoff appearances yet'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Retired Numbers */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Retired Numbers</h3>
        {retiredNumbers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {retiredNumbers.map((player, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 h-16 text-white rounded-lg flex items-center justify-center font-bold text-xl" style={{ backgroundColor: team.primaryColor }}>
                  {player.number}
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">{player.name}</div>
                  <div className="text-base text-gray-600">{player.position} {player.years && `(${player.years})`}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No retired numbers yet for {team.fullName}
          </div>
        )}
      </div>

      {/* Hall of Fame Players */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Hall of Famers ({teamInfoData.hallOfFamers.length})</h3>
        {teamInfoData.hallOfFamers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {teamInfoData.hallOfFamers.map((hofMember, index) => (
              <div
                key={index}
                className="px-3 py-2 rounded-lg border-4 border-yellow-400 text-white"
                style={{ backgroundColor: team.primaryColor }}
              >
                <div className="font-semibold text-white text-sm leading-tight">{hofMember.name}</div>
                <div className="text-xs text-gray-200 leading-snug">
                  {hofMember.role}{hofMember.yearsWithTeam && ` (${hofMember.yearsWithTeam})`}
                </div>
                <div className="text-xs text-yellow-200 leading-snug">
                  Inducted: {hofMember.yearInducted}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No Hall of Famers yet for {team.fullName}
          </div>
        )}
      </div>
    </div>
  );
}
