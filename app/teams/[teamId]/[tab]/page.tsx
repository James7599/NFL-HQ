import { notFound } from 'next/navigation';
import { getTeam, getAllTeamIds } from '@/data/teams';
import TeamPageSimple from '@/components/TeamPageSimple';

interface PageProps {
  params: Promise<{ teamId: string; tab: string }>;
}

const validTabs = [
  'overview',
  'news',
  'schedule',
  'depth-chart',
  'roster',
  'injury-report',
  'stats',
  'transactions',
  'draft-picks',
  'salary-cap',
  'team-info'
];

export async function generateStaticParams() {
  const teamIds = getAllTeamIds();
  const params: { teamId: string; tab: string }[] = [];

  teamIds.forEach(teamId => {
    validTabs.forEach(tab => {
      params.push({ teamId, tab });
    });
  });

  return params;
}

export default async function TeamTabPageRoute({ params }: PageProps) {
  const { teamId, tab } = await params;
  const team = getTeam(teamId);

  if (!team || !validTabs.includes(tab)) {
    notFound();
  }

  return <TeamPageSimple team={team} initialTab={tab} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { teamId, tab } = await params;
  const team = getTeam(teamId);

  if (!team) {
    return {
      title: 'Team Not Found',
    };
  }

  const tabTitles: Record<string, string> = {
    overview: 'Overview',
    news: 'News',
    schedule: 'Schedule',
    'depth-chart': 'Depth Chart',
    roster: 'Roster',
    'injury-report': 'Injury Report',
    stats: 'Stats',
    transactions: 'Transactions',
    'draft-picks': 'Draft Picks',
    'salary-cap': 'Salary Cap',
    'team-info': 'Team Info'
  };

  const tabTitle = tabTitles[tab] || 'Team Page';
  const canonicalUrl = `https://www.profootballnetwork.com/nba-hq/teams/${teamId}/${tab}/`;

  return {
    title: `${team.fullName} ${tabTitle}`,
    description: `View ${team.fullName} ${tabTitle.toLowerCase()} including detailed information, statistics, and updates.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${team.fullName} ${tabTitle}`,
      description: `View ${team.fullName} ${tabTitle.toLowerCase()}.`,
      images: [team.logoUrl],
      url: canonicalUrl,
    },
  };
}
