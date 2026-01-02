import { TeamData } from '@/data/teams';

interface StructuredDataProps {
  team: TeamData;
}

export default function StructuredData({ team }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "name": team.fullName,
    "sport": "Basketball",
    "url": `https://www.profootballnetwork.com/nba-hq/teams/${team.id}/`,
    "logo": team.logoUrl,
    "memberOf": {
      "@type": "SportsOrganization",
      "name": "National Basketball Association",
      "sport": "Basketball"
    },
    "location": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": team.city,
        "addressRegion": team.location
      }
    },
    "coach": {
      "@type": "Person",
      "name": team.headCoach,
      "jobTitle": "Head Coach"
    },
    "homeLocation": {
      "@type": "StadiumOrArena",
      "name": team.homeVenue
    },
    "description": `Official ${team.fullName} team page featuring roster, schedule, stats, news, and more. ${team.headCoach} leads the team as head coach, with ${team.generalManager} as general manager.`
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
