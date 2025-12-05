import type { Metadata } from 'next';
import PricingClient from './PricingClient';

// SSR metadata for SEO
export const metadata: Metadata = {
  title: 'Pricing - AINative Studio',
  description: 'Simple, transparent pricing for AI Native Studio. Choose from Free, Pro, Teams, or Enterprise plans tailored for your team size and development stage.',
  keywords: ['AI pricing', 'developer tools pricing', 'AI assistant plans', 'team pricing', 'enterprise AI'],
  openGraph: {
    title: 'Pricing - AINative Studio',
    description: 'Simple, transparent pricing for AI Native Studio. Pick a plan tailored for your team size and development stage.',
    type: 'website',
    url: 'https://www.ainative.studio/pricing',
    images: [
      {
        url: 'https://www.ainative.studio/og-pricing.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Pricing Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - AINative Studio',
    description: 'Simple, transparent pricing for AI Native Studio. Choose the plan that fits your needs.',
    images: ['https://www.ainative.studio/og-pricing.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/pricing',
  },
};

// Server component wrapper - renders client component with 'use client' for interactivity
export default function PricingPage() {
  return <PricingClient />;
}
