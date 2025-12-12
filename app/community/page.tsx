import type { Metadata } from 'next';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Community - AI Native Studio Developer Hub',
  description: 'Join the AI Native Studio community. Access tutorials, blog posts, events, showcases, and connect with thousands of developers building AI-powered applications.',
  keywords: [
    'AINative community',
    'AI Native Studio developers',
    'AI development tutorials',
    'developer community',
    'AI programming resources',
    'AINative SDK',
    'AI development blog',
    'developer events',
  ],
  openGraph: {
    title: 'AINative Community Hub',
    description: 'Join thousands of developers building the future of AI-powered applications.',
    type: 'website',
    url: 'https://www.ainative.studio/community',
    images: [
      {
        url: 'https://www.ainative.studio/og-community.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio Community',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Community Hub',
    description: 'Join thousands of developers building AI-powered applications.',
    images: ['https://www.ainative.studio/og-community.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/community',
  },
};

export default function CommunityPage() {
  return <CommunityClient />;
}
