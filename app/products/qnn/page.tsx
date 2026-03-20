import React from "react";

import type { Metadata } from 'next';
import QNNClient from './QNNClient';

export const metadata: Metadata = {
  title: 'Quantum Neural Networks (QNN) - AINative Labs Moonshot',
  description: 'An AINative Labs moonshot: Quantum Neural Networks for next-gen AI inference. Experimental quantum-accelerated embeddings, code intelligence, and hybrid quantum-classical AI research.',
  keywords: [
    // AINative Labs positioning
    'AINative Labs',
    'moonshot project',
    'AI research lab',
    'experimental AI',
    // Quantum AI keywords
    'quantum neural networks',
    'quantum machine learning',
    'quantum AI coding',
    'quantum computing IDE',
    'quantum code intelligence',
    // Performance keywords
    'AI acceleration',
    'fast embeddings',
    'quantum-enhanced inference',
    'parallel AI processing',
    // Technical keywords
    'variational quantum circuits',
    'quantum feature mapping',
    'hybrid quantum-classical AI',
    'quantum error correction',
    // Enterprise keywords
    'enterprise quantum AI',
    'quantum-ready development',
  ],
  openGraph: {
    title: 'Quantum Neural Networks (QNN) - AINative Labs Moonshot',
    description: 'An AINative Labs moonshot: experimental quantum-accelerated AI for next-gen code intelligence and inference.',
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
