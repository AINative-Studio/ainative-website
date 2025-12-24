import type { Metadata } from 'next';
import DownloadClient from './DownloadClient';

export const metadata: Metadata = {
  title: 'Download - Free AI Code Editor for Mac, Windows & Linux',
  description: 'Download the best AI code editor. Free forever with quantum-enhanced AI, multi-agent development, and VS Code compatibility. macOS (Apple Silicon & Intel), Windows, Linux.',
  keywords: [
    // Competitive download keywords
    'download AI code editor',
    'free AI IDE',
    'cursor alternative download',
    'windsurf alternative',
    'best AI code editor',
    // Platform keywords
    'macOS AI IDE',
    'Windows AI code editor',
    'Linux AI IDE',
    'Apple Silicon IDE',
    // Feature keywords
    'VS Code alternative',
    'AI coding assistant',
    'quantum IDE download',
    'agentic IDE',
  ],
  openGraph: {
    title: 'Download AI Native Studio IDE',
    description: 'Your powerful AI-native development environment. Available for macOS, Windows, and Linux.',
    type: 'website',
    url: 'https://www.ainative.studio/download',
    images: [
      {
        url: 'https://www.ainative.studio/og-download.png',
        width: 1200,
        height: 630,
        alt: 'Download AI Native Studio IDE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download AI Native Studio IDE',
    description: 'AI-native development environment for macOS, Windows, and Linux.',
    images: ['https://www.ainative.studio/og-download.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/download',
  },
};

export default function DownloadPage() {
  return <DownloadClient />;
}
