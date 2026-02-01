import { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DeveloperToolsClient from './DeveloperToolsClient';

export const metadata: Metadata = {
  title: 'Developer Tools',
  description: 'Everything you need to build, test, and deploy with AINative - API testing, code examples, SDK downloads, and comprehensive documentation',
  openGraph: {
    title: 'Developer Tools | AI Native Studio',
    description: 'Complete developer toolkit with API testing, code examples, SDKs, and documentation for building with AINative',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Tools | AI Native Studio',
    description: 'Complete developer toolkit with API testing, code examples, SDKs, and documentation for building with AINative',
  },
};

export default function DeveloperToolsPage() {
  return (
    <DashboardLayout>
      <DeveloperToolsClient />
    </DashboardLayout>
  );
}
