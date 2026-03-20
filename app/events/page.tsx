import React from "react";

import { Metadata } from 'next';
import EventsCalendarClient from './EventsCalendarClient';

export const metadata: Metadata = {
  title: 'Events & Workshops | AINative Studio – AI Developer Meetups & Conferences',
  description: 'Attend AI developer events, agentic AI meetups, OpenClaw strategy workshops, ZeroDB deep-dives, and enterprise AI conferences hosted by AINative Studio. Join the community building the next generation of AI-native applications.',
  keywords: [
    // Core event keywords
    'AI developer events',
    'agentic AI meetups',
    'OpenClaw strategy workshops',
    'AI Native Studio events',
    'developer conferences',
    'AI workshops',
    'enterprise AI events',
    'ZeroDB workshops',
    // Community & learning keywords
    'AI community events',
    'machine learning meetups',
    'AI office hours',
    'AI developer webinars',
    'AI Native Studio meetup',
    'AI agent workshops',
    // Location/format keywords
    'online AI events',
    'in-person AI conferences',
    'AI developer bootcamp',
    'AI hackathon',
    'AI Native Camp',
    'vibe coding workshop',
    // Product-specific keywords
    'ZeroDB memory API workshop',
    'agentic AI development',
    'AI SDK developer events',
    'multi-agent AI conference',
  ],
  openGraph: {
    title: 'AI Developer Events & Workshops | AINative Studio',
    description: 'Join AI developer meetups, OpenClaw strategy workshops, ZeroDB deep-dives, and enterprise AI conferences. Build alongside the AINative Studio community.',
    type: 'website',
    url: 'https://ainative.studio/events',
    siteName: 'AINative Studio',
    images: [
      {
        url: '/og-events.jpg',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Events & Workshops – AI Developer Meetups and Conferences',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Developer Events & Workshops | AINative Studio',
    description: 'Join AI meetups, OpenClaw workshops, ZeroDB deep-dives, and enterprise AI conferences hosted by AINative Studio.',
    images: ['/og-events.jpg'],
  },
  alternates: {
    canonical: 'https://ainative.studio/events',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data – EventSeries + ItemList of known recurring events
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AINative Studio Events & Workshops',
  description: 'Upcoming and past AI developer events, workshops, meetups, and conferences hosted by AINative Studio.',
  url: 'https://ainative.studio/events',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Event',
        name: 'Local AI Starter Lab',
        description: 'Hands-on workshop for developers getting started with AI-native application development using AINative Studio tools.',
        organizer: {
          '@type': 'Organization',
          name: 'AINative Studio',
          url: 'https://ainative.studio',
        },
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: 'Various Locations',
        },
        image: 'https://ainative.studio/og-events.jpg',
        url: 'https://ainative.studio/events',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Event',
        name: 'AI Native Camp – Santa Cruz',
        description: 'Immersive multi-day AI developer camp covering agentic AI, ZeroDB memory APIs, and enterprise AI architectures.',
        organizer: {
          '@type': 'Organization',
          name: 'AINative Studio',
          url: 'https://ainative.studio',
        },
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: 'Santa Cruz, CA',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Santa Cruz',
            addressRegion: 'CA',
            addressCountry: 'US',
          },
        },
        image: 'https://ainative.studio/og-events.jpg',
        url: 'https://ainative.studio/events',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Event',
        name: 'Vibe Coding Camp SF',
        description: 'Creative AI coding workshop in San Francisco. Build, collaborate, and ship AI-native projects with the community.',
        organizer: {
          '@type': 'Organization',
          name: 'AINative Studio',
          url: 'https://ainative.studio',
        },
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: 'San Francisco, CA',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'San Francisco',
            addressRegion: 'CA',
            addressCountry: 'US',
          },
        },
        image: 'https://ainative.studio/og-events.jpg',
        url: 'https://ainative.studio/events',
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Event',
        name: 'Proof of Fiesta',
        description: 'AINative Studio community celebration and showcase – demo your AI-native projects and connect with fellow builders.',
        organizer: {
          '@type': 'Organization',
          name: 'AINative Studio',
          url: 'https://ainative.studio',
        },
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        image: 'https://ainative.studio/og-events.jpg',
        url: 'https://ainative.studio/events',
      },
    },
  ],
  publisher: {
    '@type': 'Organization',
    name: 'AINative Studio',
    url: 'https://ainative.studio',
    logo: {
      '@type': 'ImageObject',
      url: 'https://ainative.studio/icon.svg',
    },
  },
};

export default function EventsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventsCalendarClient />
    </>
  );
}
