/**
 * Agent Swarm Dashboard - Server Component
 * Multi-step wizard for creating and launching agent swarm projects
 */

import type { Metadata } from 'next';
import AgentSwarmWizard from '@/components/agent-swarm/AgentSwarmWizard';

export const metadata: Metadata = {
  title: 'Agent Swarm | AINative Studio',
  description: 'Build your application with AI-powered agent swarms. Follow our step-by-step wizard to create, review, and launch your project.',
  keywords: ['AI agents', 'agent swarm', 'PRD', 'automated development', 'TDD', 'code generation'],
};

export default function AgentSwarmDashboard() {
  return <AgentSwarmWizard />;
}
