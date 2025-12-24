import { Metadata } from 'next';
import AgentSwarmClient from './AgentSwarmClient';

export const metadata: Metadata = {
  title: 'Agent Swarm Dashboard | AINative Studio',
  description: 'Orchestrate and monitor multi-agent AI projects with real-time status tracking and RLHF feedback collection',
};

export default function AgentSwarmPage() {
  return <AgentSwarmClient />;
}
