import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'AI Native Studio - AI-Powered Development Platform for Founders, Developers & Builders',
  description: 'Empower your team with memory-powered agents, blazing-fast infrastructure, and a quantum-accelerated IDE experience. Build AI applications with ZeroDB, AI Kit NPM packages, and enterprise-grade tools.',
  keywords: [
    'AI development platform',
    'AI Native Studio',
    'AI IDE',
    'vector database',
    'ZeroDB',
    'AI Kit',
    'NPM packages',
    'embeddings API',
    'AI agents',
    'quantum computing',
    'developer tools',
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
