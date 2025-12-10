import type { Metadata } from 'next';
import DownloadClient from './DownloadClient';

export const metadata: Metadata = {
  title: 'Download AI Native Studio - IDE for macOS, Windows & Linux',
  description: 'Download AI Native Studio IDE for your platform. Available for macOS (Silicon & Intel), Windows, and Linux (DEB, RPM, AppImage). Free and open source.',
  keywords: [
    'download AI Native Studio',
    'AI IDE download',
    'macOS AI IDE',
    'Windows AI IDE',
    'Linux AI IDE',
    'AI code editor',
    'AI development environment',
    'open source IDE',
    'AINative Studio'
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
