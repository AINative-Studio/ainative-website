import type { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms of Service - AI Native Studio',
  description: 'Read the Terms of Service for AI Native Studio. Understand your rights and responsibilities when using our AI development platform and services.',
  keywords: [
    'AINative terms of service',
    'AI Native Studio terms',
    'user agreement',
    'service terms',
    'legal terms',
    'acceptable use',
    'licensing terms',
    'user responsibilities',
  ],
  openGraph: {
    title: 'Terms of Service - AI Native Studio',
    description: 'Read our terms of service to understand your rights and responsibilities when using AI Native Studio.',
    type: 'website',
    url: 'https://www.ainative.studio/terms',
    images: [
      {
        url: 'https://www.ainative.studio/og-terms.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio Terms of Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - AI Native Studio',
    description: 'Read our terms of service for AI Native Studio.',
    images: ['https://www.ainative.studio/og-terms.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/terms',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
