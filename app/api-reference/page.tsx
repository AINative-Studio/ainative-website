import type { Metadata } from 'next';
import APIReferenceClient from './APIReferenceClient';

export const metadata: Metadata = {
  title: 'API Reference - AINative Studio',
  description: 'Complete API documentation with interactive examples and comprehensive guides. Explore ZeroDB, Agent Swarm, Memory System, and more endpoints.',
  keywords: [
    'API reference',
    'API documentation',
    'ZeroDB API',
    'Agent Swarm API',
    'Memory System API',
    'REST API',
    'code examples',
    'AINative Studio'
  ],
  openGraph: {
    title: 'API Reference - AINative Studio',
    description: 'Complete API documentation with interactive examples and comprehensive guides.',
    type: 'website',
    url: 'https://www.ainative.studio/api-reference',
    images: [
      {
        url: 'https://www.ainative.studio/og-api-reference.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio API Reference',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Reference - AINative Studio',
    description: 'Complete API documentation with interactive examples and comprehensive guides.',
    images: ['https://www.ainative.studio/og-api-reference.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/api-reference',
  },
};

export default function APIReferencePage() {
  return <APIReferenceClient />;
}
