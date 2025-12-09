import type { Metadata } from 'next';
import QNNClient from './QNNClient';

export const metadata: Metadata = {
  title: 'Quantum Neural Networks (QNN) - Next-Level AI Performance | AI Native Studio',
  description: 'Unlock next-level AI performance with Quantum Neural Networks. Quantum-enhanced speed, precision, and seamless integration for enterprise AI applications.',
  keywords: [
    'quantum neural networks',
    'QNN',
    'quantum AI',
    'quantum computing',
    'AI acceleration',
    'quantum machine learning',
    'enterprise AI',
    'quantum-enhanced AI',
    'AINative Studio'
  ],
  openGraph: {
    title: 'Quantum Neural Networks (QNN) | AI Native Studio',
    description: 'Empower your AI with quantum-enhanced capabilities for unmatched speed and precision.',
    type: 'website',
    url: 'https://www.ainative.studio/products/qnn',
    images: [
      {
        url: 'https://www.ainative.studio/og-qnn.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Quantum Neural Networks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quantum Neural Networks (QNN) | AI Native Studio',
    description: 'Quantum-enhanced AI for unmatched speed and precision.',
    images: ['https://www.ainative.studio/og-qnn.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/products/qnn',
  },
};

export default function QNNPage() {
  return <QNNClient />;
}
