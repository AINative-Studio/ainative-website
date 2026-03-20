import React from "react";

import { Metadata } from 'next';
import ResourcesClient from './ResourcesClient';

export const metadata: Metadata = {
  title: 'Developer Resources | AINative Studio',
  description: 'SDKs, MCP servers, templates, code examples, and tools to accelerate your AI development with AINative.',
  keywords: [
    'AI developer resources',
    'MCP servers',
    'AI SDKs',
    'agentic AI templates',
    'AI code examples',
    'AINative SDK',
    'AI development tools',
    'model context protocol',
    'AI starter templates',
    'developer tools AI',
  ],
  openGraph: {
    title: 'AINative Developer Resources',
    description: 'SDKs, MCP servers, templates, and tools for AI development',
    type: 'website',
    url: 'https://www.ainative.studio/resources',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative Developer Resources',
    description: 'SDKs, MCP servers, templates, code examples, and tools to accelerate your AI development with AINative.',
  },
  alternates: {
    canonical: 'https://www.ainative.studio/resources',
  },
};

export default function ResourcesPage() {
  return <ResourcesClient />;
}
