import React from "react";

import { Metadata } from 'next';
import HomeClient from './HomeClient';

// Enable ISR with 10-minute revalidation for home page
export const revalidate = 600; // 10 minutes

export const metadata: Metadata = {
  title: 'AI Native Studio - The Best AI Code Editor | Cursor & Windsurf Alternative',
  description: 'The AI-native IDE with multi-agent development, quantum acceleration, and memory-powered coding. Free forever. Build 10x faster with AI.',
  keywords: [
    // Primary competitive keywords
    'AI code editor',
    'best AI IDE',
    'cursor alternative',
    'windsurf alternative',
    'github copilot alternative',
    'codeium alternative',
    // Agent & Enterprise keywords
    'ADE agent deployment expert',
    'OpenClaw strategy',
    'agentic AI platform',
    'enterprise AI agents',
    'NemoClaw',
    // Action keywords
    'AI coding assistant',
    'AI pair programming',
    'code completion AI',
    'intelligent code generation',
    'prompt to code',
    'natural language coding',
    // Feature keywords
    'agentic IDE',
    'multi-agent development',
    'AI agent swarm',
    'codebase understanding',
    'context-aware coding',
    // Product keywords
    'ZeroDB vector database',
    'AI Kit NPM packages',
    'MCP server hosting',
    // Workflow & automation keywords (from market demand)
    'AI workflow automation',
    'AI-driven solutions',
    'production-ready AI systems',
    'end-to-end automation pipelines',
    'AI integration engineer',
    'business process automation AI',
    // Industry vertical keywords
    'healthcare AI platform',
    'retail AI agents',
    'AI-powered SaaS platform',
    // Role-based keywords (buyer intent)
    'AI solutions architect',
    'AI ecosystem architect',
    'AI systems architect',
    'ETL data pipeline AI',
    'chatbot development platform',
    // Consulting & services keywords
    'AI consulting services',
    'AI venture studio',
    'forward deployed AI engineers',
    'fractional CTO AI',
    'AI strategy consultant',
    'AI business analysis',
    'AI transformation expert',
    // AI architecture keywords (from Upwork market demand batch 2)
    'generative AI workflows',
    'multi-agent architectures',
    'RAG system builder',
    'retrieval augmented generation platform',
    'MLOps pipeline architect',
    'vector database architecture',
    'AI-powered SaaS MVP',
    // Industry-specific AI keywords
    'legal document AI',
    'real estate AI automation',
    'AI for small business',
    'AI voice automation',
    'AI chatbot development',
    'NLP chatbot platform',
    // Competitor framework keywords
    'LangChain alternative',
    'CrewAI alternative',
    'AutoGen alternative',
    // Batch 3: high-intent keywords (3 Upwork jobs explicitly search "OpenClaw")
    'agentic AI developer',
    'AI tech lead',
    'local-first AI solutions',
    'AI invoice processing OCR',
    'AI phone system doctors',
    'medical AI platform',
    'AI tender intelligence SaaS',
    'AI content generation platform',
    'vibe coded apps',
    'sales call transcript AI',
    'AI discovery calls consulting',
    'AI workflow optimization',
    'AI automation specialist',
    'AI SaaS security solution',
    // Free/pricing keywords
    'free AI code editor',
    'AI IDE free tier',
  ],
  openGraph: {
    title: 'AI Native Studio - The AI-Powered Development Platform',
    description: 'Build AI applications with memory-powered agents, ZeroDB vector database, and 14 production-ready AI Kit NPM packages.',
    type: 'website',
    url: 'https://ainative.studio',
    siteName: 'AI Native Studio',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio - AI Development Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Native Studio - AI-Powered Development Platform',
    description: 'Build AI applications with memory-powered agents, ZeroDB, and AI Kit NPM packages.',
    images: ['/og-home.png'],
  },
  alternates: {
    canonical: 'https://ainative.studio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function HomePage() {
  return <HomeClient />;
}
