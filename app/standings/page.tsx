import { Metadata } from 'next';
import StandingsClient from './StandingsClient';

export const metadata: Metadata = {
  title: 'NFL Standings 2025-26 Season | Eastern & Western Conference',
  description: 'View current NBA standings for the 2025-26 season. Track team records, win percentages, games back, and playoff positioning for all 30 teams across both conferences.',
};

export default function StandingsPage() {
  return <StandingsClient />;
}
