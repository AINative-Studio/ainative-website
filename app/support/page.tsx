import type { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Support Center - Get Help with AI Native Studio',
  description: 'Get help with AI Native Studio. Contact our support team, join our Discord community, browse documentation, or submit a support request.',
  keywords: [
    'AINative support',
    'AI Native Studio help',
    'technical support',
    'contact support',
    'AINative help center',
    'AI development support',
    'AINative documentation',
    'customer support'
  ],
  openGraph: {
    title: 'AINative Support Center',
    description: 'Get help with AI Native Studio. Contact support, join Discord, or browse documentation.',
    type: 'website',
    url: 'https://www.ainative.studio/support',
    images: [
      {
        url: 'https://www.ainative.studio/og-support.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio Support',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Support Center',
    description: 'Get help with AI Native Studio.',
    images: ['https://www.ainative.studio/og-support.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/support',
  },
};

export default function SupportPage() {
  return <SupportClient />;
}
