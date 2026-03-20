import React from "react";

import type { Metadata } from 'next';
import EnterpriseClient from './EnterpriseClient';

export const metadata: Metadata = {
  title: 'Enterprise OpenClaw Strategy | Agentic AI Consulting - AINative Studio',
  description: 'Every enterprise needs an OpenClaw strategy. AINative helps organizations design and deploy agentic AI at scale — from NemoClaw pipelines to ADE agent deployment experts embedded inside your engineering org.',
  keywords: [
    // Core OpenClaw / GTC 2026 messaging
    'OpenClaw strategy',
    'enterprise agentic AI',
    'NemoClaw',
    'ADE agent deployment expert',
    'agentic AI strategy',
    // Consulting
    'AI consulting',
    'agentic strategy consulting',
    'forward deployed engineers',
    'enterprise AI transformation',
    'AI-native development',
    // Platform
    'enterprise AI development',
    'AI agent orchestration',
    'agentic workflow automation',
    'enterprise AI platform',
    // Competitive alternatives
    'enterprise AI consulting firm',
    'AI transformation partner',
    'AI venture studio',
    // High-value buyer-intent keywords (from Upwork market demand)
    'fractional CTO AI',
    'AI strategy consultant',
    'AI business analysis consultant',
    'AI transformation expert',
    'AI solutions architect consulting',
    'AI for small business',
    'real estate AI automation',
    'legal AI solutions',
    'healthcare AI consulting',
    'AI-powered SaaS development',
    'multi-agent AI architecture',
    'RAG implementation consulting',
    'MLOps consulting',
  ],
  openGraph: {
    title: 'Every Enterprise Needs an OpenClaw Strategy | AINative Studio',
    description: 'From Jensen Huang\'s GTC 2026 keynote to your production roadmap — AINative is the partner that builds your agentic AI strategy. Consulting, forward deployed engineers, and a platform built for scale.',
    type: 'website',
    url: 'https://www.ainative.studio/enterprise',
    images: [
      {
        url: 'https://www.ainative.studio/og-enterprise.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio - Enterprise OpenClaw Strategy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Every Enterprise Needs an OpenClaw Strategy | AINative Studio',
    description: 'AINative helps enterprises design and deploy agentic AI at scale. NemoClaw, ADE experts, forward deployed engineers.',
    images: ['https://www.ainative.studio/og-enterprise.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/enterprise',
  },
};

export default function EnterprisePage() {
  return <EnterpriseClient />;
}
