'use client';

import React, { useState } from 'react';
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
  example?: string | number | boolean;
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
  schema?: Record<string, unknown>;
  example?: Record<string, unknown>;
}

interface CodeExample {
  language: string;
  code: string;
  title: string;
}

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

  const endpoints: APIEndpoint[] = [
    // ZeroDB Endpoints
    {
      id: 'projects-create',
      method: 'POST',
      path: '/v1/projects',
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
            settings: { type: 'object' }
          }
        },
        example: {
          name: "My AI Project",
          description: "A project for AI-powered applications",
          settings: {
            vector_dimension: 1536,
            similarity_metric: "cosine"
          }
        }
      },
      responses: [
        {
          status: 201,
          description: 'Project created successfully',
          example: {
            id: "proj_abc123",
            name: "My AI Project",
            created_at: "2024-01-15T10:30:00Z",
            status: "active"
          }
        }
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
print(f"Created project: {project.id}")`
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
console.log('Created project:', project.id);`
        }
      ],
      tags: ['projects', 'create', 'zerodb']
    },
    {
      id: 'vectors-search',
      method: 'POST',
      path: '/v1/vectors/search',
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
            filter: { type: 'object' }
          }
        },
        example: {
          vector: [0.1, 0.2, 0.3],
          top_k: 10,
          namespace: "documents",
          filter: { category: "technical" }
        }
      },
      responses: [
        {
          status: 200,
          description: 'Search results',
          example: {
            results: [
              {
                id: "vec_123",
                score: 0.95,
                metadata: { title: "AI Documentation", category: "technical" }
              }
            ],
            total: 1
          }
        }
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
    print(f"Score: {result.score}, Title: {result.metadata['title']}")`
        }
      ],
      tags: ['vectors', 'search', 'similarity']
    },
    {
      id: 'memory-create',
      method: 'POST',
      path: '/v1/memory',
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
            priority: { type: 'string', enum: ['low', 'medium', 'high'] }
          }
        },
        example: {
          content: "User prefers technical documentation with code examples",
          tags: ["user-preference", "documentation"],
          metadata: { user_id: "user_123", timestamp: "2024-01-15T10:30:00Z" },
          priority: "medium"
        }
      },
      responses: [
        {
          status: 201,
          description: 'Memory created successfully',
          example: {
            id: "mem_abc123",
            content: "User prefers technical documentation with code examples",
            created_at: "2024-01-15T10:30:00Z",
            embedding_id: "emb_xyz789"
          }
        }
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
console.log('Memory created:', memory.id);`
        }
      ],
      tags: ['memory', 'create', 'storage']
    },
    {
      id: 'swarm-start',
      method: 'POST',
      path: '/v1/agent-swarm/swarms',
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
            agents: { type: 'array' }
          }
        },
        example: {
          name: "Data Analysis Swarm",
          objective: "Analyze customer feedback and generate insights",
          agents: [
            {
              type: "analyzer",
              count: 2,
              capabilities: ["data_analysis", "sentiment_analysis"]
            }
          ]
        }
      },
      responses: [
        {
          status: 201,
          description: 'Swarm started successfully',
          example: {
            id: "swarm_abc123",
            name: "Data Analysis Swarm",
            status: "active",
            agents: [
              { id: "agent_123", type: "analyzer", status: "ready" }
            ]
          }
        }
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
fmt.Printf("Started swarm: %s\\n", swarm.ID)`
        }
      ],
      tags: ['agent-swarm', 'start', 'orchestration']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Endpoints', icon: <Terminal className="w-4 h-4" /> },
    { id: 'ZeroDB Projects', label: 'ZeroDB Projects', icon: <Database className="w-4 h-4" /> },
    { id: 'ZeroDB Vectors', label: 'ZeroDB Vectors', icon: <Zap className="w-4 h-4" /> },
    { id: 'Memory System', label: 'Memory System', icon: <Brain className="w-4 h-4" /> },
    { id: 'Agent Swarm', label: 'Agent Swarm', icon: <Bot className="w-4 h-4" /> },
    { id: 'Authentication', label: 'Authentication', icon: <Shield className="w-4 h-4" /> }
  ];

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = searchQuery === '' ||
      endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || endpoint.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'text-green-400 bg-green-400/20',
      POST: 'text-blue-400 bg-blue-400/20',
      PUT: 'text-yellow-400 bg-yellow-400/20',
      DELETE: 'text-red-400 bg-red-400/20',
      PATCH: 'text-purple-400 bg-purple-400/20'
    };
    return colors[method as keyof typeof colors] || 'text-gray-400 bg-gray-400/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
              API Reference
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Complete API documentation with interactive examples and comprehensive guides
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span>📚 Complete documentation</span>
              <span>•</span>
              <span>🔧 Interactive examples</span>
              <span>•</span>
              <span>⚡ Real-time testing</span>
              <span>•</span>
              <span>🛡️ Authentication guides</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search endpoints, methods, descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              Found {filteredEndpoints.length} endpoints
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint, index) => (
              <motion.div
                key={endpoint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden"
              >
                {/* Endpoint Header */}
                <button
                  onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? '' : endpoint.id)}
                  className="w-full p-6 text-left hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-cyan-400 font-mono">{endpoint.path}</code>
                      <span className="text-white font-medium">{endpoint.summary}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{endpoint.category}</span>
                      {expandedEndpoint === endpoint.id ?
                        <ChevronDown className="w-5 h-5 text-gray-400" /> :
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mt-2">{endpoint.description}</p>
                </button>

                {/* Expanded Content */}
                {expandedEndpoint === endpoint.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-700"
                  >
                    <div className="p-6 space-y-6">
                      {/* Parameters */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Parameters
                          </h4>
                          <div className="space-y-2">
                            {endpoint.parameters.map(param => (
                              <div key={param.name} className="bg-gray-900/30 p-3 rounded">
                                <div className="flex items-center space-x-2 mb-1">
                                  <code className="text-cyan-400">{param.name}</code>
                                  <span className="text-xs text-gray-500">({param.in})</span>
                                  {param.required && (
                                    <span className="text-xs bg-red-500/20 text-red-400 px-1 rounded">required</span>
                                  )}
                                  <span className="text-xs text-gray-400">{param.type}</span>
                                </div>
                                <p className="text-gray-300 text-sm">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {endpoint.requestBody && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center">
                            <Code className="w-4 h-4 mr-2" />
                            Request Body
                          </h4>
                          <div className="bg-gray-900/30 rounded p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">
                                {endpoint.requestBody.contentType}
                                {endpoint.requestBody.required && (
                                  <span className="text-red-400 ml-2">(required)</span>
                                )}
                              </span>
                              <button
                                onClick={() => copyToClipboard(JSON.stringify(endpoint.requestBody!.example, null, 2), `${endpoint.id}-request`)}
                                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-sm"
                              >
                                {copiedCode === `${endpoint.id}-request` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span>{copiedCode === `${endpoint.id}-request` ? 'Copied!' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre className="text-sm text-gray-300 overflow-x-auto">
                              <code>{JSON.stringify(endpoint.requestBody.example, null, 2)}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Responses */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                          <Terminal className="w-4 h-4 mr-2" />
                          Responses
                        </h4>
                        <div className="space-y-3">
                          {endpoint.responses.map(response => (
                            <div key={response.status} className="bg-gray-900/30 rounded p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    response.status < 300 ? 'bg-green-500/20 text-green-400' :
                                    response.status < 400 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    {response.status}
                                  </span>
                                  <span className="text-gray-300 text-sm">{response.description}</span>
                                </div>
                                {response.example && (
                                  <button
                                    onClick={() => copyToClipboard(JSON.stringify(response.example, null, 2), `${endpoint.id}-response-${response.status}`)}
                                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-sm"
                                  >
                                    {copiedCode === `${endpoint.id}-response-${response.status}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    <span>{copiedCode === `${endpoint.id}-response-${response.status}` ? 'Copied!' : 'Copy'}</span>
                                  </button>
                                )}
                              </div>
                              {response.example && (
                                <pre className="text-sm text-gray-300 overflow-x-auto mt-2">
                                  <code>{JSON.stringify(response.example, null, 2)}</code>
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Code Examples */}
                      <div>
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                          <Code className="w-4 h-4 mr-2" />
                          Code Examples
                        </h4>
                        <div className="space-y-4">
                          {endpoint.examples.map(example => (
                            <div key={`${example.language}-${example.title}`} className="bg-gray-900/30 rounded">
                              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                                <span className="text-sm text-gray-400">{example.title} ({example.language})</span>
                                <button
                                  onClick={() => copyToClipboard(example.code, `${endpoint.id}-example-${example.language}`)}
                                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-sm"
                                >
                                  {copiedCode === `${endpoint.id}-example-${example.language}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  <span>{copiedCode === `${endpoint.id}-example-${example.language}` ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>
                              <div className="p-4">
                                <pre className="text-sm text-gray-300 overflow-x-auto">
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
            <div className="text-center py-12">
              <p className="text-gray-400">No endpoints found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-8 md:p-12 border border-gray-700 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Need More Help?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Explore our comprehensive guides and examples to get the most out of the AINative API
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/getting-started"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Getting Started Guide
              </Link>
              <Link
                href="/examples"
                className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold border border-gray-700"
              >
                View Examples
              </Link>
              <a
                href="https://discord.gg/paipalooza"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold border border-gray-700 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Join Community</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
