import { Metadata } from 'next';
import AgentsClient from './AgentsClient';

export const metadata: Metadata = {
  title: 'Agent Framework - AI Native Studio',
  description: 'Create, configure, and manage AI agents with advanced capabilities',
};

export default function AgentsPage() {
  return <AgentsClient />;
}
