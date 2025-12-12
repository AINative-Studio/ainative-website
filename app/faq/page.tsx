import type { Metadata } from 'next';
import FAQClient from './FAQClient';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | AI Native Studio',
  description: 'Find answers to common questions about AI Native Studio, pricing, features, security, and technical support. Get the help you need to build AI-powered applications.',
  keywords: [
    'AINative FAQ',
    'AI Native Studio help',
    'AINative support',
    'AI development questions',
    'AINative pricing',
    'AI SDK help',
    'AINative security',
    'technical support',
    'AI Native Studio'
  ],
  openGraph: {
    title: 'AINative FAQ - Get Your Questions Answered',
    description: 'Find answers to common questions about AI Native Studio, pricing, features, security, and support.',
    type: 'website',
    url: 'https://www.ainative.studio/faq',
    images: [
      {
        url: 'https://www.ainative.studio/og-faq.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio FAQ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative FAQ - Frequently Asked Questions',
    description: 'Find answers to common questions about AI Native Studio.',
    images: ['https://www.ainative.studio/og-faq.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/faq',
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
