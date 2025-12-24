import { Metadata } from 'next';
import DocsClient from './DocsClient';

export const metadata: Metadata = {
  title: 'Documentation - AI Code Editor Guides & API Reference',
  description: 'Complete documentation for AI Native Studio. Getting started in 5 minutes, API reference, tutorials, SDK guides, and CLI documentation for the best AI coding platform.',
  keywords: [
    // Documentation keywords
    'AI code editor documentation',
    'AI IDE docs',
    'API reference',
    'SDK documentation',
    // Getting started keywords
    'getting started AI coding',
    'AI IDE tutorial',
    'code completion setup',
    'AI coding quickstart',
    // Technical docs
    'ZeroDB API docs',
    'AI Kit documentation',
    'CLI reference',
    'integration guides',
  ],
  openGraph: {
    title: 'Documentation | AINative Studio',
    description: 'Complete documentation for AINative Studio. Getting started guides, API reference, tutorials, and CLI documentation.',
    url: 'https://www.ainative.studio/docs',
    siteName: 'AINative Studio',
    type: 'website',
    images: [
      {
        url: 'https://www.ainative.studio/og-docs.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Documentation | AINative Studio',
    description: 'Complete documentation for AI-powered development tools.',
    images: ['https://www.ainative.studio/og-docs.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/docs',
  },
};

// JSON-LD structured data for documentation
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'AINative Studio Documentation',
  description: 'Complete documentation for AINative Studio including getting started guides, API reference, tutorials, and CLI documentation.',
  url: 'https://www.ainative.studio/docs',
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
    '@id': 'https://www.ainative.studio/docs',
  },
  about: [
    {
      '@type': 'Thing',
      name: 'Getting Started',
      description: 'Quick start guides and installation instructions',
    },
    {
      '@type': 'Thing',
      name: 'API Reference',
      description: 'Detailed API endpoint documentation',
    },
    {
      '@type': 'Thing',
      name: 'Tutorials',
      description: 'Step-by-step guides for common use cases',
    },
    {
      '@type': 'Thing',
      name: 'CLI Documentation',
      description: 'Command-line interface documentation',
    },
  ],
};

export default function DocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DocsClient />
    </>
  );
}
