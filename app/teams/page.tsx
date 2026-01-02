import TeamsClient from './TeamsClient';

export const metadata = {
  title: 'NBA Teams - All 30 Teams | NBA Hub',
  description: 'Browse all 30 NBA teams organized by division and conference. View rosters, schedules, stats, injury reports, depth charts, and more for your favorite NBA teams.',
  keywords: [
    'NBA Teams',
    'NBA Standings',
    'Eastern Conference',
    'Western Conference',
    'Atlantic Division',
    'Central Division',
    'Southeast Division',
    'Northwest Division',
    'Pacific Division',
    'Southwest Division',
    'NBA Rosters',
    'NBA Schedules',
  ],
  openGraph: {
    title: 'NBA Teams - All 30 Teams | NBA Hub',
    description: 'Browse all 30 NBA teams organized by division and conference.',
    type: 'website',
    url: 'https://www.profootballnetwork.com/nba-hq/teams/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NBA Teams Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NBA Teams - All 30 Teams',
    description: 'Browse all 30 NBA teams organized by division and conference.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.profootballnetwork.com/nba-hq/teams/',
  },
};

export default function TeamsPage() {
  return <TeamsClient />;
}
