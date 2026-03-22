import React from "react";

import { Metadata } from 'next';
import ProductsClient from './ProductsClient';

// Enable ISR with 30-minute revalidation for products page
export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: 'Products | AINative Studio - The AI-Native Developer Platform',
  description: 'ZeroDB persistent memory, AI Kit components, Agent Swarm orchestration, and MCP Server Hosting. Infrastructure for building production AI agents.',
  keywords: [
    'AI agent infrastructure', 'ZeroDB', 'vector database', 'AI Kit', 'NPM packages',
    'Agent Swarm', 'multi-agent orchestration', 'MCP server hosting',
    'Model Context Protocol', 'AI developer tools', 'semantic search',
    'agent memory', 'LangChain integration', 'LlamaIndex integration',
  ],
  openGraph: {
    title: 'Products | AINative Studio',
    description: 'Ship agents that remember, search, and learn. ZeroDB, AI Kit, Agent Swarm, and MCP Server Hosting.',
    url: 'https://www.ainative.studio/products',
    siteName: 'AINative Studio',
    type: 'website',
    images: [
      {
        url: 'https://www.ainative.studio/og-products.png',
        width: 1200,
        height: 630,
        alt: 'AINative Studio Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | AINative Studio',
    description: 'Infrastructure for the agentic era. ZeroDB, AI Kit, Agent Swarm, MCP Hosting.',
    images: ['https://www.ainative.studio/og-products.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/products',
  },
};

// JSON-LD structured data for products page
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'AINative Studio Products',
  description: 'AI-native developer platform: persistent memory, components, orchestration, and hosting for AI agents',
  url: 'https://www.ainative.studio/products',
  numberOfItems: 4,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'SoftwareApplication',
        name: 'ZeroDB',
        description: 'The persistent knowledge layer for AI agents. Memory, semantic search, vector storage, file storage, and free embeddings.',
        applicationCategory: 'DeveloperApplication',
        url: 'https://www.ainative.studio/products/zerodb',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free tier: 500K vectors, 2GB storage' },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'SoftwareApplication',
        name: 'AI Kit',
        description: '32 production-ready NPM packages for AI-native applications. React components, hooks, and utilities.',
        applicationCategory: 'DeveloperApplication',
        url: 'https://aikit.ainative.studio',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'SoftwareApplication',
        name: 'Agent Swarm',
        description: 'Multi-agent orchestration platform with stage-based workflows, tool calling, and memory sharing.',
        applicationCategory: 'DeveloperApplication',
        url: 'https://www.ainative.studio/agent-swarm',
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'SoftwareApplication',
        name: 'MCP Server Hosting',
        description: 'Deploy Model Context Protocol servers in under 60 seconds. 14+ pre-built servers with auto-scaling.',
        applicationCategory: 'DeveloperApplication',
        url: 'https://www.ainative.studio/products/mcp',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Credit-based billing starting at 1 credit/hour' },
      },
    },
  ],
};

export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductsClient />
    </>
  );
}
