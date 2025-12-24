import type { Metadata } from 'next';
import EnterpriseClient from './EnterpriseClient';

export const metadata: Metadata = {
  title: 'Enterprise AI Development Platform - Secure AI Code Editor for Teams',
  description: 'Enterprise-grade AI development platform with SOC2 compliance, SSO, and on-premise deployment. Accelerate software delivery with secure, memory-native AI across your SDLC.',
  keywords: [
    // Competitive enterprise keywords
    'enterprise AI development',
    'enterprise AI code editor',
    'secure AI coding platform',
    'AI development platform',
    'enterprise code completion',
    // Security & compliance
    'SOC2 compliant AI',
    'on-premise AI IDE',
    'self-hosted AI coding',
    'enterprise SSO integration',
    'air-gapped AI development',
    // Feature keywords
    'SDLC automation',
    'code review automation',
    'enterprise compliance',
    'team AI coding',
    'private cloud AI',
    // Competitive alternatives
    'cursor enterprise alternative',
    'github copilot enterprise',
    'enterprise codeium alternative',
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
