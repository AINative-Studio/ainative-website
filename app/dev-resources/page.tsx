import type { Metadata } from 'next';
import DevResourcesClient from './DevResourcesClient';

export const metadata: Metadata = {
  title: 'Developer Resources - API Reference, Tools & Documentation | AI Native Studio',
  description: 'Comprehensive developer resources including API documentation, UI design resources, and development tools. Everything you need to build with AINative Studio.',
  keywords: [
    'developer resources',
    'API documentation',
    'API reference',
    'developer tools',
    'UI design',
    'design tokens',
    'SDK',
    'CLI tools',
    'VS Code extension',
    'testing sandbox',
    'webhooks',
    'API analytics',
    'AINative Studio'
  ],
  openGraph: {
    title: 'Developer Resources - API Reference, Tools & Documentation | AI Native Studio',
    description: 'Comprehensive developer resources including API documentation, UI design resources, and development tools. Everything you need to build with AINative Studio.',
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
    title: 'Developer Resources - API Reference, Tools & Documentation | AI Native Studio',
    description: 'Comprehensive developer resources including API documentation, UI design resources, and development tools.',
    images: ['https://www.ainative.studio/og-dev-resources.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/dev-resources',
  },
};

export default function DevResourcesPage() {
  return <DevResourcesClient />;
}
