/**
 * Agent Swarm Dashboard - Server Component
 * Metadata and SEO configuration for Agent Swarm feature
 */

import type { Metadata } from 'next';
import AgentSwarmClient from './AgentSwarmClient';

export const metadata: Metadata = {
  title: 'Agent Swarm Dashboard | AINative Studio',
  description: 'Upload your PRD and let AI agents build your application with collaborative swarm intelligence',
  keywords: ['AI agents', 'agent swarm', 'PRD', 'automated development', 'TDD', 'code generation'],
};

export default function AgentSwarmDashboard() {
  return <AgentSwarmClient />;
}
