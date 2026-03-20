import React from "react";

import type { Metadata } from 'next';
import AgentSwarmClient from './AgentSwarmClient';

export const metadata: Metadata = {
  title: 'Agent Swarm - Your OpenClaw Agentic AI Development Team',
  description: 'Deploy autonomous AI agent teams that implement your OpenClaw strategy. From PRD to production — Cody Jackson (CTO), Forrest Kinkade (SRE), and specialized agents handle architecture, coding, testing, and deployment with ZeroDB memory.',
  keywords: [
    // Strategic positioning
    'OpenClaw strategy',
    'agent deployment expert',
    'ADE platform',
    'agentic AI platform',
    'NemoClaw enterprise',
    'forward deployed engineers',
    // Competitive agentic keywords
    'agentic IDE',
    'AI agent swarm',
    'multi-agent AI',
    'AI development team',
    'automated coding agents',
    'cursor alternative',
    'windsurf alternative',
    'copilot alternative',
    // Action keywords
    'PRD to production',
    'prompt to code',
    'AI pair programming',
    'autonomous coding',
    // Feature keywords
    'AI code generation',
    'intelligent microcontainers',
    'agent orchestration',
    'cascade AI alternative',
    'semantic memory agents',
    'ZeroDB agent memory',
    // Market demand keywords (from Upwork analysis)
    'autonomous AI agents retail',
    'AI ecosystem architect',
    'AI workflow automation',
    'AI-driven solutions implementation',
    'production-ready AI systems',
    'LLM agent frameworks',
    'AI venture studio platform',
    'healthcare AI agents',
    'end-to-end automation pipeline',
  ],
  openGraph: {
    title: 'Agent Swarm - Your OpenClaw Agentic AI Strategy | AINative Studio',
    description: 'Deploy autonomous AI agent teams with ZeroDB memory. Cody Jackson (CTO), Forrest Kinkade (SRE), and specialized agents handle architecture to deployment.',
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
