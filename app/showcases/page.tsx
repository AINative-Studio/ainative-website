import React from "react";

import { Metadata } from 'next';
import ShowcaseListingClient from './ShowcaseListingClient';

export const metadata: Metadata = {
  title: 'AI Application Showcases - Built with AINative Studio',
  description: 'Explore real-world AI applications built with AINative Studio. Browse production examples using ZeroDB, Agent Swarm, MCP servers, AI Kit, and OpenClaw strategy. See what developers are shipping with AI-native tooling.',
  keywords: [
    'AI application showcase',
    'AI project examples',
    'built with AINative',
    'ZeroDB showcase',
    'Agent Swarm examples',
    'MCP server examples',
    'AI-native applications',
    'production AI examples',
    'OpenClaw strategy examples',
    'agentic AI showcase',
    'AI developer community',
    'AI Kit examples',
    'AINative Studio projects',
  ],
  openGraph: {
    title: 'AI Application Showcases - Built with AINative Studio',
    description: 'Explore real-world AI applications built with AINative Studio. Browse production examples using ZeroDB, Agent Swarm, MCP servers, and AI Kit.',
    type: 'website',
    url: 'https://www.ainative.studio/showcases',
    images: [
      {
        url: '/og-showcases.png',
        width: 1200,
        height: 630,
        alt: 'AI Application Showcases - AINative Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Application Showcases - Built with AINative Studio',
    description: 'Explore real-world AI applications built with AINative Studio using ZeroDB, Agent Swarm, MCP servers, and AI Kit.',
    images: ['/og-showcases.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/showcases',
  },
};

export default function ShowcasesPage() {
  return <ShowcaseListingClient />;
}
