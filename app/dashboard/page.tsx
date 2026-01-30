import { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | AINative Studio',
  description: 'View your usage, credits, and AI development metrics. Manage your AINative Studio subscription and monitor your development activity.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardClient />
    </DashboardLayout>
  );
}
