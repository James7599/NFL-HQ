import { TeamData } from '@/data/teams';

interface InjuryReportTabProps {
  team: TeamData;
}

export default function InjuryReportTab({ team }: InjuryReportTabProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} Injury Report</h2>
          <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '320px' }}></div>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Injury report will be available soon.</p>
        <p className="text-sm text-gray-400">
          Check back later for the latest {team.fullName} injury updates and player availability.
        </p>
      </div>
    </div>
  );
}
