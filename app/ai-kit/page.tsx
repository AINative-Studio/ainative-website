import { Metadata } from 'next';
import AIKitClient from './AIKitClient';

export const metadata: Metadata = {
  title: 'AI Kit - 14 Production-Ready NPM Packages | AINative Studio',
  description: 'Build AI applications faster with AI Kit - 14 production-ready NPM packages for React, Vue, Svelte & more. Type-safe, framework-agnostic, with built-in observability & vector storage.',
  keywords: [
    'ai kit',
    'npm packages',
    'react ai',
    'vue ai',
    'svelte ai',
    'typescript ai',
    'ai development',
    'llm framework',
    'vector database',
    'ai observability',
    'ai safety',
    'ai authentication',
    'ai testing',
  ],
  openGraph: {
    title: 'AI Kit - 14 Production-Ready NPM Packages | AINative Studio',
    description: 'Build AI applications faster with AI Kit - 14 production-ready NPM packages for React, Vue, Svelte & more. Type-safe, framework-agnostic, with built-in observability & vector storage.',
    type: 'website',
    url: 'https://ainative.studio/ai-kit',
    siteName: 'AINative Studio',
    images: [
      {
        url: '/og-ai-kit.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Kit - 14 Production-Ready NPM Packages',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Kit - 14 Production-Ready NPM Packages | AINative Studio',
    description: 'Build AI applications faster with AI Kit - 14 production-ready NPM packages for React, Vue, Svelte & more.',
    images: ['/og-ai-kit.jpg'],
    site: '@ainativestudio',
    creator: '@ainativestudio',
  },
  alternates: {
    canonical: 'https://ainative.studio/ai-kit',
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

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Kit',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cross-platform',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1200',
  },
  description: '14 production-ready NPM packages for building AI applications with React, Vue, Svelte and other frameworks',
  softwareVersion: '1.0.0',
  publisher: {
    '@type': 'Organization',
    name: 'AINative Studio',
    url: 'https://ainative.studio',
  },
  downloadUrl: 'https://www.npmjs.com/~ainative-studio',
};

export default function AIKitPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AIKitClient />
    </>
  );
}
