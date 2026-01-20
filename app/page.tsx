import { Metadata } from 'next';
import HomeClient from './HomeClient';
import { getRevalidateTime } from '@/lib/cache-config';

// Enable ISR with 10-minute revalidation for home page
export const revalidate = getRevalidateTime('marketing', 'home'); // 600 seconds (10 minutes)

export const metadata: Metadata = {
  title: 'AI Native Studio - The Best AI Code Editor | Cursor & Windsurf Alternative',
  description: 'The AI-native IDE with multi-agent development, quantum acceleration, and memory-powered coding. Free forever. Build 10x faster with intelligent code completion, codebase understanding, and agentic workflows.',
  keywords: [
    // Primary competitive keywords
    'AI code editor',
    'best AI IDE',
    'cursor alternative',
    'windsurf alternative',
    'github copilot alternative',
    'codeium alternative',
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
    'quantum-enhanced IDE',
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
