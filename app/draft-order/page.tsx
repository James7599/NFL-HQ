import { Metadata } from 'next';
import DraftOrderClient from './DraftOrderClient';

export const metadata: Metadata = {
  title: '2026 NBA Draft Order - Complete Draft Order | NBA Hub',
  description: 'View the complete 2026 NBA Draft order for all rounds. Track draft picks by team with up-to-date standings and projections.',
  keywords: [
    'NBA Draft Order',
    '2026 NBA Draft',
    'NBA Draft Picks',
    'NBA Lottery',
    'NBA Draft Prospects',
    'Draft Order',
    'NBA Teams',
  ],
  openGraph: {
    title: '2026 NBA Draft Order - Complete Draft Order',
    description: 'View the complete 2026 NBA Draft order for all rounds. Track draft picks by team with up-to-date standings.',
    type: 'website',
    url: 'https://www.profootballnetwork.com/nba-hq/draft-order/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '2026 NBA Draft Order',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 NBA Draft Order - Complete Draft Order',
    description: 'View the complete 2026 NBA Draft order for all rounds.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.profootballnetwork.com/nba-hq/draft-order/',
  },
};

export default function DraftOrderPage() {
  return <DraftOrderClient />;
}
