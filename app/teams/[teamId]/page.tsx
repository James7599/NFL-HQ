import { notFound } from 'next/navigation';
import { getTeam, getAllTeamIds } from '@/data/teams';
import TeamPageSimple from '@/components/TeamPageSimple';

interface PageProps {
  params: Promise<{ teamId: string }>;
}

export async function generateStaticParams() {
  return getAllTeamIds().map((teamId) => ({
    teamId,
  }));
}

export default async function TeamPageRoute({ params }: PageProps) {
  const { teamId } = await params;
  const team = getTeam(teamId);

  if (!team) {
    notFound();
  }

  return <TeamPageSimple team={team} initialTab="overview" />;
}

export async function generateMetadata({ params }: PageProps) {
  const { teamId } = await params;
  const team = getTeam(teamId);

  if (!team) {
    return {
      title: 'Team Not Found',
    };
  }

  const canonicalUrl = `https://www.profootballnetwork.com/nfl-hq/teams/${teamId}/`;

  return {
    title: `${team.fullName} - NBA Team Page`,
    description: `${team.fullName} roster, schedule, stats, and more. ${team.generalManager} (GM), ${team.headCoach} (HC). ${team.record} record in the ${team.division}.`,
    keywords: [
      team.fullName,
      team.name,
      team.city,
      'NBA',
      team.conference,
      team.division,
      'roster',
      'schedule',
      'stats'
    ].join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${team.fullName} - NBA Team Page`,
      description: `${team.fullName} roster, schedule, stats, and more.`,
      images: [team.logoUrl],
      url: canonicalUrl,
    },
  };
}
