import { Metadata } from 'next';
import SalaryCapTrackerClient from './SalaryCapTrackerClient';

export const metadata: Metadata = {
  title: 'NFL Salary Cap Tracker by Team | NBA Hub',
  description: 'Track NBA salary cap space by team. View cap space, salary cap, active cap spend, and dead money for all 30 NBA teams in real-time.',
};

export default function SalaryCapTrackerPage() {
  return <SalaryCapTrackerClient />;
}
