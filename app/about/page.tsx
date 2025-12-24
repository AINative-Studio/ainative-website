import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us - The Team Behind the Best AI Code Editor',
  description: 'Meet the team building the future of AI-native development. Learn about our mission to make every developer 10x more productive with quantum-enhanced AI tools.',
  keywords: [
    // Company keywords
    'about AINative Studio',
    'AI code editor company',
    'AI infrastructure company',
    'AI development tools startup',
    // Mission keywords
    'developer productivity',
    'AI for developers',
    'democratizing AI development',
    // Product keywords
    'ZeroDB creators',
    'Agent Swarm developers',
    'AI Kit maintainers',
    // Team keywords
    'AI startup team',
    'developer tools company',
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
