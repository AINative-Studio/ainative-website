import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';

// SSR metadata for SEO
export const metadata: Metadata = {
  title: 'Products - AINative Studio',
  description: 'Discover AI-powered development tools that supercharge your workflow. Code search, refactoring, debugging, and more - all powered by advanced AI.',
  keywords: ['AI developer tools', 'code search', 'AI refactoring', 'automated debugging', 'CI/CD integration', 'development workflow'],
  openGraph: {
    title: 'Products - AINative Studio',
    description: 'Supercharge your development workflow with AI-powered tools. 10x faster development with 99.9% accuracy.',
    type: 'website',
    url: 'https://www.ainative.studio/products',
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
    title: 'Products - AINative Studio',
    description: 'AI-powered development tools that help you write better code, faster.',
    images: ['https://www.ainative.studio/og-products.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/products',
  },
};

// Server component wrapper - renders client component for interactivity
export default function ProductsPage() {
  return <ProductsClient />;
}
