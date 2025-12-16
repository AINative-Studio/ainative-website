import type { Metadata } from 'next';
import ZeroDBClient from './ZeroDBClient';

export const metadata: Metadata = {
  title: 'ZeroDB - AI-Native Vector Database | AINative Studio',
  description: 'High-performance vector database built for AI applications. Semantic search, embeddings storage, and real-time similarity matching with enterprise-grade security.',
  keywords: [
    'vector database',
    'ZeroDB',
    'semantic search',
    'embeddings',
    'AI database',
    'similarity search',
    'vector storage',
    'RAG database',
    'AI-native database',
    'AINative Studio',
  ],
  openGraph: {
    title: 'ZeroDB - AI-Native Vector Database | AINative Studio',
    description: 'High-performance vector database built for AI. Semantic search, embeddings storage, and real-time similarity matching.',
    type: 'website',
    url: 'https://www.ainative.studio/products/zerodb',
    images: [
      {
        url: 'https://www.ainative.studio/og-zerodb.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio ZeroDB Vector Database',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZeroDB - AI-Native Vector Database | AINative Studio',
    description: 'High-performance vector database for AI applications.',
    images: ['https://www.ainative.studio/og-zerodb.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/products/zerodb',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ZeroDB',
  applicationCategory: 'Database Software',
  operatingSystem: 'Cloud',
  description: 'AI-Native vector database for semantic search, embeddings storage, and real-time similarity matching',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier with 100K embeddings included',
  },
  author: {
    '@type': 'Organization',
    name: 'AINative Studio',
    url: 'https://www.ainative.studio',
  },
  featureList: [
    'Vector Embeddings Storage',
    'Semantic Search',
    'Real-time Similarity Matching',
    'RESTful API',
    'TypeScript SDK',
    'Enterprise Security',
  ],
};

export default function ZeroDBPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ZeroDBClient />
    </>
  );
}
