import { Metadata } from 'next';
import ProductsEnhancedClient from './ProductsEnhancedClient';

export const metadata: Metadata = {
  title: 'Cody IDE - AI-Native Development Environment',
  description: "The world's first AI-native development environment powered by quantum neural networks. Experience revolutionary multi-agent orchestration, context-aware memory, and quantum-enhanced hooks.",
  openGraph: {
    title: 'Cody IDE - AI-Native Development Environment | AINative Studio',
    description: "The world's first AI-native development environment powered by quantum neural networks. Experience revolutionary multi-agent orchestration, context-aware memory, and quantum-enhanced hooks.",
    type: 'website',
    images: [
      {
        url: '/card.png',
        width: 1200,
        height: 630,
        alt: 'Cody IDE - AI-Native Development Environment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cody IDE - AI-Native Development Environment | AINative Studio',
    description: "The world's first AI-native development environment powered by quantum neural networks.",
    images: ['/card.png'],
  },
};

export default function ProductsEnhancedPage() {
  return <ProductsEnhancedClient />;
}
