import type { Metadata } from 'next';
import WorkflowDemoClient from './WorkflowDemoClient';

export const metadata: Metadata = {
  title: 'Agent Swarm Workflow Demo',
  description: 'Interactive demo of Agent Swarm workflow with RLHF feedback collection at strategic points',
  openGraph: {
    title: 'Agent Swarm Workflow Demo | AI Native Studio',
    description: 'Experience the 9-step Agent Swarm workflow with real-time feedback collection',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Swarm Workflow Demo | AI Native Studio',
    description: 'Experience the 9-step Agent Swarm workflow with real-time feedback collection',
  },
};

export default function AgentSwarmWorkflowDemoPage() {
  return <WorkflowDemoClient />;
}
