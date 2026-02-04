import { Metadata } from 'next';
import ProductsClient from './ProductsClient';

// Enable ISR with 30-minute revalidation for products page
export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: 'Products | AINative Studio - AI-Powered Developer Tools',
  description: 'Discover AINative Studio\'s suite of AI-powered developer tools. Code search, refactoring, debugging, repo understanding, checkpoints, and CI/CD integration.',
  keywords: ['developer tools', 'AI coding', 'code search', 'refactoring', 'debugging', 'CI/CD', 'AINative Studio'],
  openGraph: {
    title: 'Products | AINative Studio',
    description: 'AI-powered developer tools to supercharge your development workflow. 10x faster development with 99.9% accuracy.',
    url: 'https://www.ainative.studio/products',
    siteName: 'AINative Studio',
    type: 'website',
    images: [
      {
        url: 'https://www.ainative.studio/og-products.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | AINative Studio',
    description: 'AI-powered developer tools for 10x faster development.',
    images: ['https://www.ainative.studio/og-products.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/products',
  },
};

// JSON-LD structured data for products page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AINative Studio Products',
  description: 'AI-powered developer tools suite',
  url: 'https://www.ainative.studio/products',
  numberOfItems: 6,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Code Search',
        description: 'Semantic search powered by quantum-enhanced neural networks',
        applicationCategory: 'DeveloperApplication',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Refactoring',
        description: 'Intelligent code restructuring with deep context awareness',
        applicationCategory: 'DeveloperApplication',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Debugging',
        description: 'Advanced error detection and automated fixes',
        applicationCategory: 'DeveloperApplication',
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Repo Understanding',
        description: 'Deep codebase analysis and visualization',
        applicationCategory: 'DeveloperApplication',
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Checkpoints',
        description: 'Automated versioning and rollback',
        applicationCategory: 'DeveloperApplication',
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'SoftwareApplication',
        name: 'CI/CD Integration',
        description: 'Seamless deployment pipeline integration',
        applicationCategory: 'DeveloperApplication',
      },
    },
  ],
};

export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductsClient />
    </>
  );
}
