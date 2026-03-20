
'use client';
import React from "react";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Code,
  Search,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Database,
  Bot,
  Brain,
  Zap,
  Shield,
  FileText,
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  category: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Response[];
  examples: CodeExample[];
  tags: string[];
}

interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  type: string;
  description: string;
}

interface RequestBody {
  required: boolean;
  contentType: string;
  schema: Record<string, unknown>;
  example: Record<string, unknown>;
}

interface Response {
  status: number;
  description: string;
  example?: Record<string, unknown>;
}

interface CodeExample {
  language: string;
  code: string;
  title: string;
}

const endpoints: APIEndpoint[] = [
  // ZeroDB Endpoints
  {
    id: 'projects-create',
    method: 'POST',
    path: '/api/v1/projects',
    summary: 'Create Project',
    description: 'Create a new ZeroDB project with vector storage capabilities',
    category: 'ZeroDB Projects',
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          settings: { type: 'object' },
        },
      },
      example: {
        name: 'My AI Project',
        description: 'A project for AI-powered applications',
        settings: {
          vector_dimension: 1536,
          similarity_metric: 'cosine',
        },
      },
    },
    responses: [
      {
        status: 201,
        description: 'Project created successfully',
        example: {
          id: 'proj_abc123',
          name: 'My AI Project',
          created_at: '2024-01-15T10:30:00Z',
          status: 'active',
        },
      },
    ],
    examples: [
      {
        language: 'python',
        title: 'Python SDK',
        code: `from ainative import AINativeClient

client = AINativeClient(api_key="your-key")

project = await client.zerodb.projects.create(
    name="My AI Project",
    description="A project for AI-powered applications",
    settings={
        "vector_dimension": 1536,
        "similarity_metric": "cosine"
    }
)
print(f"Created project: {project.id}")`,
      },
      {
        language: 'typescript',
        title: 'TypeScript SDK',
        code: `import { AINativeClient } from '@ainative/sdk';

const client = new AINativeClient({ apiKey: 'your-key' });

const project = await client.zerodb.projects.create({
  name: 'My AI Project',
  description: 'A project for AI-powered applications',
  settings: {
    vector_dimension: 1536,
    similarity_metric: 'cosine'
  }
});
console.log('Created project:', project.id);`,
      },
    ],
    tags: ['projects', 'create', 'zerodb'],
  },
  {
    id: 'vectors-search',
    method: 'POST',
    path: '/api/v1/vectors/search',
    summary: 'Vector Search',
    description: 'Perform semantic similarity search on stored vectors',
    category: 'ZeroDB Vectors',
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          vector: { type: 'array', items: { type: 'number' } },
          top_k: { type: 'integer' },
          namespace: { type: 'string' },
          filter: { type: 'object' },
        },
      },
      example: {
        vector: [0.1, 0.2, 0.3],
        top_k: 10,
        namespace: 'documents',
        filter: { category: 'technical' },
      },
    },
    responses: [
      {
        status: 200,
        description: 'Search results',
        example: {
          results: [
            {
              id: 'vec_123',
              score: 0.95,
              metadata: { title: 'AI Documentation', category: 'technical' },
            },
          ],
          total: 1,
        },
      },
    ],
    examples: [
      {
        language: 'python',
        title: 'Python SDK',
        code: `results = await client.zerodb.vectors.search(
    vector=[0.1, 0.2, 0.3],
    top_k=10,
    namespace="documents",
    filter={"category": "technical"}
)

for result in results.results:
    print(f"Score: {result.score}, Title: {result.metadata['title']}")`,
      },
    ],
    tags: ['vectors', 'search', 'similarity'],
  },
  {
    id: 'memory-create',
    method: 'POST',
    path: '/api/v1/memory',
    summary: 'Create Memory',
    description: 'Store a memory entry with content and metadata',
    category: 'Memory System',
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          metadata: { type: 'object' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
      example: {
        content: 'User prefers technical documentation with code examples',
        tags: ['user-preference', 'documentation'],
        metadata: { user_id: 'user_123', timestamp: '2024-01-15T10:30:00Z' },
        priority: 'medium',
      },
    },
    responses: [
      {
        status: 201,
        description: 'Memory created successfully',
        example: {
          id: 'mem_abc123',
          content: 'User prefers technical documentation with code examples',
          created_at: '2024-01-15T10:30:00Z',
          embedding_id: 'emb_xyz789',
        },
      },
    ],
    examples: [
      {
        language: 'typescript',
        title: 'TypeScript SDK',
        code: `const memory = await client.zerodb.memory.create({
  content: 'User prefers technical documentation with code examples',
  tags: ['user-preference', 'documentation'],
  metadata: {
    user_id: 'user_123',
    timestamp: new Date().toISOString()
  },
  priority: 'medium'
});
console.log('Memory created:', memory.id);`,
      },
    ],
    tags: ['memory', 'create', 'storage'],
  },
  {
    id: 'swarm-start',
    method: 'POST',
    path: '/api/v1/agent-swarm/swarms',
    summary: 'Start Agent Swarm',
    description: 'Initialize a new agent swarm for task execution',
    category: 'Agent Swarm',
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          objective: { type: 'string' },
          agents: { type: 'array' },
        },
      },
      example: {
        name: 'Data Analysis Swarm',
        objective: 'Analyze customer feedback and generate insights',
        agents: [
          {
            type: 'analyzer',
            count: 2,
            capabilities: ['data_analysis', 'sentiment_analysis'],
          },
        ],
      },
    },
    responses: [
      {
        status: 201,
        description: 'Swarm started successfully',
        example: {
          id: 'swarm_abc123',
          name: 'Data Analysis Swarm',
          status: 'active',
          agents: [{ id: 'agent_123', type: 'analyzer', status: 'ready' }],
        },
      },
    ],
    examples: [
      {
        language: 'go',
        title: 'Go SDK',
        code: `swarm, err := client.AgentSwarm.Start(ctx, &ainative.StartSwarmRequest{
    Name: "Data Analysis Swarm",
    Objective: "Analyze customer feedback and generate insights",
    Agents: []ainative.AgentConfig{
        {
            Type:         "analyzer",
            Count:        2,
            Capabilities: []string{"data_analysis", "sentiment_analysis"},
        },
    },
})
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Started swarm: %s\\n", swarm.ID)`,
      },
    ],
    tags: ['agent-swarm', 'start', 'orchestration'],
  },
];

const categories = [
  { id: 'all', label: 'All Endpoints', icon: Terminal },
  { id: 'ZeroDB Projects', label: 'ZeroDB Projects', icon: Database },
  { id: 'ZeroDB Vectors', label: 'ZeroDB Vectors', icon: Zap },
  { id: 'Memory System', label: 'Memory System', icon: Brain },
  { id: 'Agent Swarm', label: 'Agent Swarm', icon: Bot },
  { id: 'Authentication', label: 'Authentication', icon: Shield },
];

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'text-green-400 bg-green-400/10 border border-green-400/20',
    POST: 'text-[#4B6FED] bg-[#4B6FED]/10 border border-[#4B6FED]/20',
    PUT: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20',
    DELETE: 'text-red-400 bg-red-400/10 border border-red-400/20',
    PATCH: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
  };
  return colors[method] || 'text-gray-400 bg-gray-400/10 border border-gray-400/20';
};

export default function APIReferenceClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string>('');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      searchQuery === '' ||
      endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4B6FED]/5 via-transparent to-[#8A63F5]/5 pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#4B6FED]/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#8A63F5]/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B6FED]/10 border border-[#4B6FED]/30 rounded-full mb-6">
              <Code className="h-4 w-4 text-[#4B6FED]" />
              <span className="text-sm text-[#4B6FED] font-medium">REST API Documentation</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              API{' '}
              <span className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] bg-clip-text text-transparent">
                Reference
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Complete API documentation with interactive examples and comprehensive guides
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
              <span className="px-3 py-1 bg-[#161B22] border border-white/5 rounded-full">Complete documentation</span>
              <span className="px-3 py-1 bg-[#161B22] border border-white/5 rounded-full">Interactive examples</span>
              <span className="px-3 py-1 bg-[#161B22] border border-white/5 rounded-full">Real-time testing</span>
              <span className="px-3 py-1 bg-[#161B22] border border-white/5 rounded-full">Authentication guides</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search endpoints, methods, descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0D1117] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4B6FED]/50 transition-colors"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-[#0D1117] border border-white/5 rounded-lg text-white focus:outline-none focus:border-[#4B6FED]/50 transition-colors appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#0D1117] text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Found{' '}
              <span className="text-[#4B6FED] font-medium">{filteredEndpoints.length}</span>{' '}
              endpoints
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#4B6FED]/10 border-[#4B6FED]/40 text-[#4B6FED]'
                      : 'bg-[#161B22] border-white/5 text-gray-400 hover:border-[#4B6FED]/30 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-3">
            {filteredEndpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-[#161B22] rounded-xl border overflow-hidden transition-all duration-200 ${
                  expandedEndpoint === endpoint.id
                    ? 'border-[#4B6FED]/30'
                    : 'border-white/5 hover:border-[#4B6FED]/30'
                }`}
              >
                {/* Endpoint Header */}
                <button
                  onClick={() =>
                    setExpandedEndpoint(expandedEndpoint === endpoint.id ? '' : endpoint.id)
                  }
                  className="w-full p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${getMethodColor(endpoint.method)}`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-[#4B6FED] font-mono text-sm">{endpoint.path}</code>
                      <span className="text-white font-medium text-sm">{endpoint.summary}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs text-gray-500 hidden md:inline px-2 py-1 bg-[#0D1117] border border-white/5 rounded">
                        {endpoint.category}
                      </span>
                      {expandedEndpoint === endpoint.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">{endpoint.description}</p>
                </button>

                {/* Expanded Content */}
                {expandedEndpoint === endpoint.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/5"
                  >
                    <div className="p-5 space-y-6">
                      {/* Parameters */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-[#4B6FED]" />
                            Parameters
                          </h4>
                          <div className="space-y-2">
                            {endpoint.parameters.map((param) => (
                              <div
                                key={param.name}
                                className="bg-[#0D1117] border border-white/5 p-3 rounded-lg"
                              >
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <code className="text-[#4B6FED] font-mono text-sm">{param.name}</code>
                                  <span className="text-xs text-gray-500 bg-[#161B22] border border-white/5 px-1.5 py-0.5 rounded">
                                    {param.in}
                                  </span>
                                  {param.required && (
                                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">
                                      required
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">{param.type}</span>
                                </div>
                                <p className="text-gray-400 text-sm">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {endpoint.requestBody && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                            <Code className="w-4 h-4 text-[#4B6FED]" />
                            Request Body
                          </h4>
                          <div className="bg-[#0A0D14] border border-white/10 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#161B22]">
                              <span className="text-sm text-gray-400 font-mono">
                                {endpoint.requestBody.contentType}
                                {endpoint.requestBody.required && (
                                  <span className="text-red-400 ml-2 text-xs">(required)</span>
                                )}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    JSON.stringify(endpoint.requestBody?.example, null, 2),
                                    `${endpoint.id}-request`
                                  )
                                }
                                className="flex items-center gap-1.5 text-gray-400 hover:text-[#4B6FED] text-sm transition-colors"
                              >
                                {copiedCode === `${endpoint.id}-request` ? (
                                  <Check className="w-3.5 h-3.5 text-green-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span className="text-xs">
                                  {copiedCode === `${endpoint.id}-request` ? 'Copied!' : 'Copy'}
                                </span>
                              </button>
                            </div>
                            <div className="p-4">
                              <pre className="text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                                <code>{JSON.stringify(endpoint.requestBody.example, null, 2)}</code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Responses */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                          <Terminal className="w-4 h-4 text-[#4B6FED]" />
                          Responses
                        </h4>
                        <div className="space-y-3">
                          {endpoint.responses.map((response) => (
                            <div
                              key={response.status}
                              className="bg-[#0A0D14] border border-white/10 rounded-lg overflow-hidden"
                            >
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#161B22]">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                                      response.status < 300
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : response.status < 400
                                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}
                                  >
                                    {response.status}
                                  </span>
                                  <span className="text-gray-400 text-sm">
                                    {response.description}
                                  </span>
                                </div>
                                {response.example && (
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        JSON.stringify(response.example, null, 2),
                                        `${endpoint.id}-response-${response.status}`
                                      )
                                    }
                                    className="flex items-center gap-1.5 text-gray-400 hover:text-[#4B6FED] text-sm transition-colors"
                                  >
                                    {copiedCode === `${endpoint.id}-response-${response.status}` ? (
                                      <Check className="w-3.5 h-3.5 text-green-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                    <span className="text-xs">
                                      {copiedCode === `${endpoint.id}-response-${response.status}`
                                        ? 'Copied!'
                                        : 'Copy'}
                                    </span>
                                  </button>
                                )}
                              </div>
                              {response.example && (
                                <div className="p-4">
                                  <pre className="text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                                    <code>{JSON.stringify(response.example, null, 2)}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Code Examples */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                          <Code className="w-4 h-4 text-[#4B6FED]" />
                          Code Examples
                        </h4>
                        <div className="space-y-4">
                          {endpoint.examples.map((example) => (
                            <div
                              key={`${example.language}-${example.title}`}
                              className="bg-[#0A0D14] border border-white/10 rounded-lg overflow-hidden"
                            >
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-[#161B22]">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-400">
                                    {example.title}
                                  </span>
                                  <span className="text-xs text-gray-600 bg-[#0D1117] border border-white/5 px-1.5 py-0.5 rounded font-mono">
                                    {example.language}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      example.code,
                                      `${endpoint.id}-example-${example.language}`
                                    )
                                  }
                                  className="flex items-center gap-1.5 text-gray-400 hover:text-[#4B6FED] text-sm transition-colors"
                                >
                                  {copiedCode === `${endpoint.id}-example-${example.language}` ? (
                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span className="text-xs">
                                    {copiedCode === `${endpoint.id}-example-${example.language}`
                                      ? 'Copied!'
                                      : 'Copy'}
                                  </span>
                                </button>
                              </div>
                              <div className="p-4">
                                <pre className="text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                                  <code>{example.code}</code>
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredEndpoints.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#161B22] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg font-medium mb-1">No endpoints found</p>
              <p className="text-gray-600 text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F5]/10 rounded-2xl p-8 md:p-12 border border-[#4B6FED]/20 text-center relative overflow-hidden"
          >
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4B6FED]/5 via-transparent to-[#8A63F5]/5 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Need More Help?</h2>
              <p className="text-lg text-gray-400 mb-8">
                Explore our comprehensive guides and examples to get the most out of the AINative API
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/getting-started"
                  className="px-8 py-3.5 bg-[#4B6FED] hover:bg-[#3A56D3] text-white rounded-lg transition-all duration-200 font-semibold text-sm"
                >
                  Getting Started Guide
                </Link>
                <Link
                  href="/examples"
                  className="px-8 py-3.5 bg-[#161B22] text-white rounded-lg hover:border-[#4B6FED]/30 transition-all duration-200 font-semibold border border-white/5 text-sm"
                >
                  View Examples
                </Link>
                <Link
                  href="https://discord.gg/paipalooza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-[#161B22] text-white rounded-lg hover:border-[#4B6FED]/30 transition-all duration-200 font-semibold border border-white/5 flex items-center justify-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Join Community</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
