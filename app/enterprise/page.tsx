import type { Metadata } from 'next';
import EnterpriseClient from './EnterpriseClient';

export const metadata: Metadata = {
  title: 'Enterprise AI Development Platform | AI Native Studio',
  description: 'Quantum-enabled AI for enterprise teams. Accelerate software delivery with secure, memory-native AI that works across your SDLC. Self-hosted, compliant, and built for scale.',
  keywords: [
    'enterprise AI',
    'AI development platform',
    'enterprise software development',
    'quantum AI',
    'secure AI',
    'SDLC automation',
    'code review automation',
    'enterprise compliance',
    'self-hosted AI',
    'AINative Studio'
  ],
  openGraph: {
    title: 'Enterprise AI Development Platform | AI Native Studio',
    description: 'Quantum-enabled AI for enterprise teams. Accelerate software delivery with secure, memory-native AI across your SDLC.',
    type: 'website',
    url: 'https://www.ainative.studio/enterprise',
    images: [
      {
        url: 'https://www.ainative.studio/og-enterprise.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Enterprise Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enterprise AI Development Platform | AI Native Studio',
    description: 'Quantum-enabled AI for enterprise teams. Secure, compliant, and built for scale.',
    images: ['https://www.ainative.studio/og-enterprise.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/enterprise',
  },
};

export default function EnterprisePage() {
  return <EnterpriseClient />;
}
