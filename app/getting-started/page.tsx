import type { Metadata } from 'next';
import GettingStartedClient from './GettingStartedClient';

export const metadata: Metadata = {
  title: 'Getting Started Guide - Build AI Applications in Minutes | AI Native Studio',
  description: 'Learn how to build intelligent applications with AINative in minutes. Step-by-step guide with code examples for Python, TypeScript, and Go SDKs.',
  keywords: [
    'getting started',
    'AI development tutorial',
    'AINative SDK',
    'Python AI SDK',
    'TypeScript AI SDK',
    'Go AI SDK',
    'vector database tutorial',
    'AI agent tutorial',
    'ZeroDB quickstart',
    'AINative Studio'
  ],
  openGraph: {
    title: 'Getting Started with AINative Studio',
    description: 'Build intelligent applications in minutes with our powerful AI infrastructure. Step-by-step guide with code examples.',
    type: 'website',
    url: 'https://www.ainative.studio/getting-started',
    images: [
      {
        url: 'https://www.ainative.studio/og-getting-started.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Getting Started Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Getting Started with AINative Studio',
    description: 'Build intelligent applications in minutes. 5 minutes to first API call.',
    images: ['https://www.ainative.studio/og-getting-started.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/getting-started',
  },
};

export default function GettingStartedPage() {
  return <GettingStartedClient />;
}
