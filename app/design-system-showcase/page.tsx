import type { Metadata } from 'next';
import DesignSystemShowcaseClient from './DesignSystemShowcaseClient';

export const metadata: Metadata = {
  title: 'Design System & AI Kit',
  description: 'Get access to 14 production-ready NPM packages, 57+ UI components, AINative Design MCP server, and premium UI components. Build stunning AI-native applications faster.',
  openGraph: {
    title: 'AINative Design System & AI Kit | Build Beautiful AI-Native Interfaces',
    description: 'Get access to 14 production-ready NPM packages, 57+ UI components, AINative Design MCP server, and premium UI components. Build stunning AI-native applications faster.',
    url: 'https://www.ainative.studio/design-system-showcase',
    images: [
      {
        url: 'https://www.ainative.studio/og-design-system.png',
        width: 1200,
        height: 630,
        alt: 'AINative Design System - 57+ UI Components for React, Vue, Svelte',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Design System & AI Kit | Build Beautiful AI-Native Interfaces',
    description: 'Get access to 14 production-ready NPM packages, 57+ UI components, AINative Design MCP server, and premium UI components.',
    images: ['https://www.ainative.studio/og-design-system.png'],
  },
};

export default function DesignSystemShowcasePage() {
  return <DesignSystemShowcaseClient />;
}
