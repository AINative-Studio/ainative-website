import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us - Building the Future of AI Infrastructure | AINative Studio',
  description: 'Learn about AINative Studio mission to democratize AI development with powerful, accessible tools that empower developers worldwide.',
  keywords: [
    'about AINative Studio',
    'AI infrastructure company',
    'AI development tools',
    'developer platform',
    'AI startup',
    'ZeroDB',
    'Agent Swarm',
  ],
  openGraph: {
    title: 'About Us | AINative Studio',
    description: 'Building the future of AI infrastructure with powerful, accessible tools for developers.',
    type: 'website',
    url: 'https://www.ainative.studio/about',
    images: [
      {
        url: 'https://www.ainative.studio/og-about.png',
        width: 1200,
        height: 630,
        alt: 'About AINative Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | AINative Studio',
    description: 'Building the future of AI infrastructure.',
    images: ['https://www.ainative.studio/og-about.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/about',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AINative Studio',
  url: 'https://www.ainative.studio',
  logo: 'https://www.ainative.studio/logo.png',
  description: 'AI-powered development platform with memory-powered agents and quantum-accelerated IDE experience',
  foundingDate: '2023',
  sameAs: [
    'https://github.com/AINative-Studio',
    'https://twitter.com/ainativestudio',
    'https://discord.gg/paipalooza',
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
