import type { Metadata } from 'next';
import DevResourcesClient from './DevResourcesClient';

export const metadata: Metadata = {
  title: 'Developer Resources - AINative Studio',
  description: 'Everything you need to integrate with our platform. Access API documentation, SDKs, developer tools, code examples, and comprehensive guides to build AI-powered applications.',
  keywords: [
    'API documentation',
    'developer tools',
    'SDK',
    'Python SDK',
    'TypeScript SDK',
    'Go SDK',
    'REST API',
    'AI integration',
    'developer resources',
    'code examples',
    'AINative Studio'
  ],
  openGraph: {
    title: 'Developer Resources - AINative Studio',
    description: 'Everything you need to integrate with our platform. Access API documentation, SDKs, developer tools, and comprehensive guides.',
    type: 'website',
    url: 'https://www.ainative.studio/dev-resources',
    images: [
      {
        url: 'https://www.ainative.studio/og-dev-resources.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Developer Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Resources - AINative Studio',
    description: 'Everything you need to integrate with our platform. Access API documentation, SDKs, and developer tools.',
    images: ['https://www.ainative.studio/og-dev-resources.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/dev-resources',
  },
};

export default function DevResourcesPage() {
  return <DevResourcesClient />;
}
