import React from "react";

import type { Metadata } from 'next';
import ZeroDBClient from './ZeroDBClient';

export const metadata: Metadata = {
  title: 'ZeroDB — Persistent Knowledge Layer for AI Agents | Mem0 Alternative',
  description: 'The persistent knowledge layer for AI agents. Memory, search, storage, and free embeddings. Works with LangChain, LlamaIndex, and MCP. Mem0 + Pinecone alternative. Zero setup — npx zerodb-cli init.',
  keywords: [
    // Category-defining keywords
    'persistent knowledge layer',
    'ai agent memory',
    'agent knowledge base',
    'cognitive memory system',
    // Competitive keywords
    'mem0 alternative',
    'letta alternative',
    'pinecone alternative',
    'weaviate alternative',
    'qdrant alternative',
    'chromadb alternative',
    'milvus alternative',
    // Feature keywords
    'vector database',
    'semantic search',
    'free embeddings',
    'agent memory storage',
    'RAG database',
    'mcp server',
    'mcp memory',
    // Framework keywords
    'langchain vector store',
    'llamaindex vector store',
    'langchain memory',
    'llamaindex memory',
    // Technical keywords
    'vector embeddings api',
    'instant database provisioning',
    'zero auth database',
    'retrieval augmented generation',
    'knowledge management ai',
    'ai native database',
    'serverless vector database',
    'multi tenant vector db',
  ],
  openGraph: {
    title: 'ZeroDB — The Persistent Knowledge Layer for AI Agents',
    description: 'Memory, search, and storage — everything your agent needs to remember, learn, and reason. Free embeddings. Zero setup.',
    type: 'website',
    url: 'https://www.ainative.studio/products/zerodb',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZeroDB — Persistent Knowledge Layer for AI Agents',
    description: 'Memory + Search + Storage. One API. Zero setup. Free embeddings. npx zerodb-cli init',
  },
  alternates: {
    canonical: 'https://www.ainative.studio/products/zerodb',
  },
};

// JSON-LD Structured Data — Product + FAQ for AEO
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ZeroDB',
    applicationCategory: 'Database Software',
    applicationSubCategory: 'AI Agent Memory & Knowledge Infrastructure',
    operatingSystem: 'Cloud, Linux, macOS, Windows',
    description: 'The persistent knowledge layer for AI agents. Memory, semantic search, vector storage, file storage, and free embeddings. Framework-agnostic: works with LangChain, LlamaIndex, MCP, or raw API.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free tier: 10,000 vectors, 1,000 free embeddings/month, 1GB storage',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '29',
        priceCurrency: 'USD',
        description: 'Pro: 100,000 vectors, 100,000 embeddings/month, 10GB storage',
      },
      {
        '@type': 'Offer',
        name: 'Scale',
        price: '99',
        priceCurrency: 'USD',
        description: 'Scale: 1,000,000 vectors, 1,000,000 embeddings/month, 100GB storage',
      },
    ],
    author: {
      '@type': 'Organization',
      name: 'AINative Studio',
      url: 'https://www.ainative.studio',
    },
    featureList: [
      'Persistent Agent Memory',
      'Semantic Vector Search (HNSW, sub-millisecond)',
      'Free Embeddings (TEI-powered, BAAI/bge models)',
      'Zero-Auth Instant Database Provisioning',
      'LangChain Integration (pip install langchain-zerodb)',
      'LlamaIndex Integration (pip install llama-index-vector-stores-zerodb)',
      'MCP Servers (6 memory tools + 69 full database tools)',
      'File Storage (S3-compatible)',
      'Event Streaming',
      'Memory Consolidation with NousCoder LLM',
    ],
    installUrl: 'https://www.npmjs.com/package/zerodb-cli',
    downloadUrl: 'https://pypi.org/project/zerodb-mcp/',
    softwareHelp: {
      '@type': 'WebPage',
      url: 'https://docs.ainative.studio',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is ZeroDB?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ZeroDB is the persistent knowledge layer for AI agents. It provides memory, semantic search, vector storage, file storage, and free embeddings in one product. It works with LangChain, LlamaIndex, MCP, or raw API — framework-agnostic.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I add memory to my AI agent?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Run npx zerodb-cli init to set up a ZeroDB project with MCP server configuration in one command. Then use pip install langchain-zerodb for LangChain or pip install llama-index-vector-stores-zerodb for LlamaIndex. Free embeddings included — no OpenAI key required.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is ZeroDB different from Mem0?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mem0 is a memory feature layer. ZeroDB is full knowledge infrastructure — memory, vectors, files, tables, and events in one product with free embeddings, MCP servers, and zero-auth instant provisioning. ZeroDB works with any framework, not just Python.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is ZeroDB different from Pinecone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pinecone is a vector database. ZeroDB is a persistent knowledge layer — it includes vectors plus memory, file storage, event streaming, free embeddings, and MCP server integration. ZeroDB also offers zero-auth instant provisioning (one API call, no signup) and a generous free tier.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is ZeroDB free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. ZeroDB has a free tier with 10,000 vectors, 1,000 free embeddings per month, 1GB storage, and 3 projects. Embeddings are powered by TEI (HuggingFace Text Embeddings Inference) at zero cost. No credit card required. Get started with npx zerodb-cli init.',
        },
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to set up ZeroDB for your AI agent',
    description: 'Get a persistent knowledge layer for your AI agent in 30 seconds.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Install the CLI',
        text: 'Run: npx zerodb-cli init',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Install the Python SDK',
        text: 'Run: pip install langchain-zerodb or pip install llama-index-vector-stores-zerodb',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Add documents',
        text: 'Use store.add_texts(["Your content"]) to store and embed documents for free.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Search by meaning',
        text: 'Use store.similarity_search("your query") for semantic search across your knowledge base.',
      },
    ],
  },
];

export default function ZeroDBPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ZeroDBClient />
    </>
  );
}
