import { Metadata } from 'next';
import DashboardLandingClient from './DashboardLandingClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your AI services, monitor performance, and access powerful tools in one place. AI-powered platform with ZeroDB, Agent Swarm, Quantum Neural Network, and comprehensive analytics.',
  openGraph: {
    title: 'AINative Dashboard - AI Services Management',
    description: 'Manage your AI services, monitor performance, and access powerful tools in one place.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Dashboard - AI Services Management',
    description: 'Manage your AI services, monitor performance, and access powerful tools in one place.',
  },
};

export default function DashboardLandingPage() {
  return <DashboardLandingClient />;
}
