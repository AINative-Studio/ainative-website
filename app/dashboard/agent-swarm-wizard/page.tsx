import { Metadata } from 'next';
import AgentSwarmWizard from '@/components/agent-swarm/AgentSwarmWizard';

export const metadata: Metadata = {
  title: 'Agent Swarm Setup Wizard',
  description: 'Build your application with AI-powered agent swarms. Follow our step-by-step wizard to create, review, and launch your project.',
};

export default function AgentSwarmWizardPage() {
  return <AgentSwarmWizard />;
}
