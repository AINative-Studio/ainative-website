import { Metadata } from 'next';
import ActiveProjectsClient from './ActiveProjectsClient';

export const metadata: Metadata = {
  title: 'Active Projects',
  description: 'Monitor and manage your active AI projects',
};

export default function ActiveProjectsPage() {
  return <ActiveProjectsClient />;
}
