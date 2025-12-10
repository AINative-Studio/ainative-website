import type { Metadata } from 'next';
import IntegrationsClient from './IntegrationsClient';

export const metadata: Metadata = {
  title: 'Integrations & Partnerships - Connect with Your Favorite Tools | AI Native Studio',
  description: 'Seamlessly integrate AINative with popular frameworks, databases, and deployment platforms. Official integrations for Next.js, FastAPI, Supabase, LangChain, and more.',
  keywords: [
    'AINative integrations',
    'AI SDK integrations',
    'Next.js AI integration',
    'FastAPI AI integration',
    'Supabase integration',
    'LangChain integration',
    'vector database integration',
    'Vercel AI integration',
    'Railway deployment',
    'AINative Studio'
  ],
  openGraph: {
    title: 'AINative Integrations & Partnerships',
    description: 'Connect AINative with your favorite frameworks, databases, and deployment platforms.',
    type: 'website',
    url: 'https://www.ainative.studio/integrations',
    images: [
      {
        url: 'https://www.ainative.studio/og-integrations.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Integrations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Integrations & Partnerships',
    description: 'Seamlessly integrate with popular frameworks and platforms.',
    images: ['https://www.ainative.studio/og-integrations.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/integrations',
  },
};

export default function IntegrationsPage() {
  return <IntegrationsClient />;
}
