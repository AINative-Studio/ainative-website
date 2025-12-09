import type { Metadata } from 'next';
import AgentSwarmClient from './AgentSwarmClient';

export const metadata: Metadata = {
  title: 'Agent Swarm - Multi-Agent Development Teams | AI Native Studio',
  description: 'Upload your PRD and let our specialized AI agent teams handle the rest. From architecture to deployment, orchestrated by intelligent microcontainers.',
  keywords: [
    'agent swarm',
    'AI development team',
    'multi-agent',
    'AI agents',
    'automated development',
    'PRD to production',
    'microcontainers',
    'AINative Studio'
  ],
  openGraph: {
    title: 'Agent Swarm - Multi-Agent Development Teams | AI Native Studio',
    description: 'Upload your PRD and let our specialized AI agent teams handle the rest. From architecture to deployment, orchestrated by intelligent microcontainers.',
    type: 'website',
    url: 'https://www.ainative.studio/agent-swarm',
    images: [
      {
        url: 'https://www.ainative.studio/og-agent-swarm.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Agent Swarm',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Swarm - Multi-Agent Development Teams | AI Native Studio',
    description: 'Upload your PRD and let our specialized AI agent teams handle the rest.',
    images: ['https://www.ainative.studio/og-agent-swarm.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/agent-swarm',
  },
};

export default function AgentSwarmPage() {
  return <AgentSwarmClient />;
}
