import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | AINative Studio',
  description: 'Get in touch with AINative Studio. Contact our team for sales inquiries, technical support, partnerships, or enterprise solutions.',
  keywords: ['contact', 'support', 'AINative Studio', 'enterprise sales', 'technical support', 'AI development'],
  openGraph: {
    title: 'Contact Us | AINative Studio',
    description: 'Get in touch with AINative Studio. Contact our team for sales inquiries, technical support, partnerships, or enterprise solutions.',
    url: 'https://www.ainative.studio/contact',
    siteName: 'AINative Studio',
    type: 'website',
    images: [
      {
        url: 'https://www.ainative.studio/og-contact.png',
        width: 1200,
        height: 630,
        alt: 'Contact AINative Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | AINative Studio',
    description: 'Get in touch with AINative Studio for sales, support, or partnerships.',
    images: ['https://www.ainative.studio/og-contact.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/contact',
  },
};

// JSON-LD structured data for contact page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact AINative Studio',
  description: 'Get in touch with AINative Studio for sales, support, or partnerships.',
  url: 'https://www.ainative.studio/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'AINative Studio',
    email: 'hello@ainative.studio',
    telephone: '+1-831-295-1482',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1101 Pacific Avenue',
      addressLocality: 'Santa Cruz',
      addressRegion: 'CA',
      postalCode: '95060',
      addressCountry: 'US',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hello@ainative.studio',
        telephone: '+1-831-295-1482',
        availableLanguage: ['English'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'hello@ainative.studio',
        url: 'https://calendly.com/seedlingstudio/',
        availableLanguage: ['English'],
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
