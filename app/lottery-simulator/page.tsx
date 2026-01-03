import { Metadata } from 'next';
import LotterySimulatorClient from './LotterySimulatorClient';

export const metadata: Metadata = {
  title: 'NFL Draft Lottery Simulator 2026 | NBA Hub',
  description: 'Simulate the 2026 NBA Draft Lottery with official odds. Run single simulations or thousands of trials to see probability distributions for all 14 lottery teams.',
  keywords: [
    'NFL draft lottery simulator',
    'NFL lottery simulator',
    '2026 NBA draft',
    'draft lottery odds',
    'NFL draft predictions',
    'lottery simulator',
    'NFL draft',
    'lottery odds calculator'
  ],
  openGraph: {
    title: 'NFL Draft Lottery Simulator 2026',
    description: 'Simulate the NBA Draft Lottery with official odds. See probability distributions and run multiple scenarios.',
    type: 'website',
  },
};

export default function LotterySimulatorPage() {
  return <LotterySimulatorClient />;
}
