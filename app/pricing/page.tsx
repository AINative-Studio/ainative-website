import { Metadata } from 'next';
import PricingClient from './PricingClient';

// Enable ISR with 5-minute revalidation for pricing page (time-sensitive)
export const revalidate = 300; // 5 minutes

export const metadata: Metadata = {
  title: 'Pricing - Free AI Code Editor & Pro Plans',
  description: 'Start free with AI Native Studio. Get unlimited AI code completions, multi-agent development, and quantum-enhanced features. Pro from $10/mo, Teams from $60/mo.',
  keywords: [
    // Competitive pricing keywords
    'AI code editor pricing',
    'free AI coding assistant',
    'AI IDE pricing',
    'cursor alternative pricing',
    'windsurf alternative',
    'AI development tools pricing',
    // Plan keywords
    'free AI tools',
    'pro AI coding plan',
    'enterprise AI solutions',
    'team AI development',
    // Feature keywords
    'unlimited code completions',
    'AI agent pricing',
    'quantum IDE pricing',
  ],
  openGraph: {
    title: 'Pricing - Simple, Transparent Pricing | AINative Studio',
    description: 'Choose a plan tailored for your team size and development stage. From free tier for hobbyists to enterprise solutions for large organizations.',
    type: 'website',
    url: 'https://ainative.studio/pricing',
    siteName: 'AINative Studio',
    images: [
      {
        url: '/og-pricing.jpg',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Pricing Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - Simple, Transparent Pricing | AINative Studio',
    description: 'Choose a plan tailored for your team size. From free to enterprise.',
    images: ['/og-pricing.jpg'],
  },
  alternates: {
    canonical: 'https://ainative.studio/pricing',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data for Pricing
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'AI Native Studio',
  description: 'AI-powered development platform with memory-powered agents and quantum-accelerated IDE experience',
  brand: {
    '@type': 'Brand',
    name: 'AINative Studio',
  },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'USD',
      description: '50 completions/month, community support, basic AI assistance',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Pro Plan',
      price: '10',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      description: 'Unlimited completions, hosted models and memory, 5 custom agents',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Teams Plan',
      price: '60',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      description: 'Everything in Pro plus admin dashboard, usage analytics, private VPC hosting, SSO integration',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise Plan',
      description: 'Custom solutions for large organizations with RBAC, hybrid deployments, and dedicated support',
      availability: 'https://schema.org/InStock',
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingClient />
    </>
  );
}
