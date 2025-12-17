import { Metadata } from 'next';
import APIReferenceClient from './APIReferenceClient';

export const metadata: Metadata = {
  title: 'API Reference | AINative Studio',
  description: 'Complete API documentation for AINative Studio. Explore ZeroDB, Agent Swarm, and Memory System endpoints with interactive examples in Python, TypeScript, and Go.',
  keywords: ['API', 'documentation', 'REST API', 'ZeroDB', 'Agent Swarm', 'vector database', 'SDK', 'AINative'],
  openGraph: {
    title: 'API Reference | AINative Studio',
    description: 'Complete API documentation with interactive examples and comprehensive guides for ZeroDB, Agent Swarm, and Memory System.',
    url: 'https://www.ainative.studio/api-reference',
    siteName: 'AINative Studio',
    type: 'website',
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
    title: 'API Reference | AINative Studio',
    description: 'Complete API documentation with interactive examples for ZeroDB, Agent Swarm, and Memory System.',
    images: ['https://www.ainative.studio/og-api-reference.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/api-reference',
  },
};

// JSON-LD structured data for API documentation
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'AINative Studio API Reference',
  description: 'Complete API documentation for AINative Studio including ZeroDB, Agent Swarm, and Memory System endpoints.',
  url: 'https://www.ainative.studio/api-reference',
  author: {
    '@type': 'Organization',
    name: 'AINative Studio',
  },
  publisher: {
    '@type': 'Organization',
    name: 'AINative Studio',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.ainative.studio/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://www.ainative.studio/api-reference',
  },
  about: [
    {
      '@type': 'APIReference',
      name: 'ZeroDB API',
      description: 'Vector database API for semantic search and storage',
    },
    {
      '@type': 'APIReference',
      name: 'Agent Swarm API',
      description: 'Multi-agent orchestration and task execution API',
    },
    {
      '@type': 'APIReference',
      name: 'Memory System API',
      description: 'Persistent memory storage and retrieval API',
    },
  ],
};

export default function APIReferencePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <APIReferenceClient />
    </>
  );
}
