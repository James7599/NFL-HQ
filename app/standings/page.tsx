import { Metadata } from 'next';
import StandingsClient from './StandingsClient';

export const metadata: Metadata = {
  title: 'NFL Standings 2025 Season | AFC & NFC Conference',
  description: 'View current NFL standings for the 2025 season. Track team records, win percentages, division rankings, and playoff positioning for all 32 teams across both conferences.',
};

export default function StandingsPage() {
  return <StandingsClient />;
}
