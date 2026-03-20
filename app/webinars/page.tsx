import React from "react";

import { Metadata } from 'next';
import WebinarListingClient from './WebinarListingClient';

export const metadata: Metadata = {
  title: 'Webinars | AINative Studio',
  description: 'Join live webinars or watch recordings to master AI/ML, quantum computing, and cutting-edge technology.',
  keywords: [
    'AI webinars',
    'machine learning webinars',
    'quantum computing webinars',
    'agentic AI training',
    'AI development tutorials',
    'live AI workshops',
    'on-demand AI recordings',
    'AINative Studio webinars',
  ],
  openGraph: {
    title: 'AINative Webinars',
    description: 'Learn from the experts through live webinars and on-demand recordings',
    type: 'website',
    url: 'https://www.ainative.studio/webinars',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Webinars',
    description: 'Join live webinars or watch recordings to master AI/ML, quantum computing, and cutting-edge technology.',
  },
  alternates: {
    canonical: 'https://www.ainative.studio/webinars',
  },
};

export default function WebinarsPage() {
  return <WebinarListingClient />;
}
