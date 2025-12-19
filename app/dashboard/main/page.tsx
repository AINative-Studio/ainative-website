import { Metadata } from 'next';
import MainDashboardClient from './MainDashboardClient';

export const metadata: Metadata = {
  title: 'Main Dashboard | AINative Studio',
  description: 'View your AI development metrics, usage analytics, and project insights with interactive charts and real-time data.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MainDashboardPage() {
  return <MainDashboardClient />;
}
