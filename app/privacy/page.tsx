import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy - AI Native Studio',
  description: 'Learn how AI Native Studio collects, uses, and protects your personal information. Our privacy policy explains your data rights and our commitment to transparency.',
  keywords: [
    'AINative privacy policy',
    'AI Native Studio privacy',
    'data protection',
    'user privacy',
    'GDPR compliance',
    'CCPA compliance',
    'data security',
    'personal information',
  ],
  openGraph: {
    title: 'Privacy Policy - AI Native Studio',
    description: 'Your privacy matters. Learn how we protect your data and respect your privacy rights.',
    type: 'website',
    url: 'https://www.ainative.studio/privacy',
    images: [
      {
        url: 'https://www.ainative.studio/og-privacy.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio Privacy Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - AI Native Studio',
    description: 'Your privacy matters. Learn how we protect your data.',
    images: ['https://www.ainative.studio/og-privacy.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
