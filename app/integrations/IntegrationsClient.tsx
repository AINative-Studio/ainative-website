'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Search,
  Star,
  Download,
  ArrowRight,
  ExternalLink,
  Package,
  Zap,
  Users,
  Rocket,
  Shield,
  Globe,
  Database,
  Cloud,
  Smartphone,
  Terminal
} from 'lucide-react';
import Link from 'next/link';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'frameworks' | 'databases' | 'deployment' | 'monitoring' | 'mobile' | 'ai-tools';
  provider: string;
  status: 'official' | 'community' | 'verified';
  popularity: 'high' | 'medium' | 'low';
  difficulty: 1 | 2 | 3;
  features: string[];
  documentation: string;
  repository?: string;
  demo?: string;
  installation: string;
  codeExample: string;
  tags: string[];
  stats: {
    downloads?: number;
    stars?: number;
    users?: string;
    maintainers?: number;
  };
  icon?: React.ReactNode;
  logo?: string;
}

export default function IntegrationsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const integrations: Integration[] = [
    // Frameworks
    {
      id: 'nextjs',
      name: 'Next.js',
      description: 'Full-stack React framework with Server Components and App Router support',
      category: 'frameworks',
      provider: 'Vercel',
      status: 'official',
      popularity: 'high',
      difficulty: 2,
      features: ['Server Components', 'App Router', 'API Routes', 'Edge Runtime', 'Streaming'],
      documentation: '/docs/integrations/nextjs',
      repository: 'https://github.com/AINative-Studio/nextjs-integration',
      demo: 'https://nextjs-demo.ainative.app',
      installation: 'npm install @ainative/nextjs-adapter',
      codeExample: `import { AINativeAdapter } from '@ainative/nextjs-adapter';

export default function Page() {
  const client = AINativeAdapter({
    apiKey: process.env.AINATIVE_API_KEY
  });

  return <ChatInterface client={client} />;
}`,
      tags: ['react', 'ssr', 'fullstack'],
      stats: {
        downloads: 25000,
        stars: 1200,
        users: '5k+',
        maintainers: 8
      },
      icon: <Globe className="w-6 h-6" />
    },
    {
      id: 'fastapi',
      name: 'FastAPI',
      description: 'High-performance Python API framework with automatic OpenAPI generation',
      category: 'frameworks',
      provider: 'Sebastian Ramirez',
      status: 'official',
      popularity: 'high',
      difficulty: 2,
      features: ['Async Support', 'Auto Documentation', 'Type Hints', 'WebSocket Support'],
      documentation: '/docs/integrations/fastapi',
      repository: 'https://github.com/AINative-Studio/fastapi-integration',
      demo: 'https://fastapi-demo.ainative.app',
      installation: 'pip install ainative-fastapi',
      codeExample: `from fastapi import FastAPI
from ainative_fastapi import AINativeMiddleware

app = FastAPI()
app.add_middleware(AINativeMiddleware, api_key="your-key")

@app.post("/chat")
async def chat(message: str):
    return await ainative.memory.search(query=message)`,
      tags: ['python', 'async', 'api'],
      stats: {
        downloads: 18000,
        stars: 890,
        users: '3k+',
        maintainers: 5
      },
      icon: <Rocket className="w-6 h-6" />
    },

    // Databases
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Open-source Firebase alternative with PostgreSQL and vector embeddings',
      category: 'databases',
      provider: 'Supabase Inc.',
      status: 'verified',
      popularity: 'high',
      difficulty: 2,
      features: ['Vector Embeddings', 'Real-time Subscriptions', 'Auth Integration', 'Edge Functions'],
      documentation: '/docs/integrations/supabase',
      repository: 'https://github.com/AINative-Studio/supabase-integration',
      demo: 'https://supabase-demo.ainative.app',
      installation: 'npm install @ainative/supabase-adapter',
      codeExample: `import { createClient } from '@supabase/supabase-js';
import { AINativeSupabaseAdapter } from '@ainative/supabase-adapter';

const supabase = createClient(url, key);
const ainative = new AINativeSupabaseAdapter({
  supabase,
  vectorTable: 'embeddings'
});

// Automatic vector storage and retrieval
const results = await ainative.similarity_search(query, 10);`,
      tags: ['postgresql', 'vectors', 'realtime'],
      stats: {
        downloads: 15000,
        stars: 750,
        users: '4k+',
        maintainers: 6
      },
      icon: <Database className="w-6 h-6" />
    },
    {
      id: 'qdrant',
      name: 'Qdrant',
      description: 'High-performance vector database optimized for neural search',
      category: 'databases',
      provider: 'Qdrant',
      status: 'official',
      popularity: 'medium',
      difficulty: 3,
      features: ['Neural Search', 'Similarity Filtering', 'Distributed Architecture', 'High Performance'],
      documentation: '/docs/integrations/qdrant',
      repository: 'https://github.com/AINative-Studio/qdrant-integration',
      installation: 'pip install ainative-qdrant',
      codeExample: `from ainative_qdrant import QdrantAdapter
from qdrant_client import QdrantClient

client = QdrantClient("localhost", port=6333)
adapter = QdrantAdapter(client, collection_name="my_vectors")

# Seamless integration with AINative
await adapter.upsert_vectors(vectors, metadata)
results = await adapter.search(query_vector, top_k=10)`,
      tags: ['vectors', 'neural-search', 'performance'],
      stats: {
        downloads: 8500,
        stars: 420,
        users: '2k+',
        maintainers: 4
      },
      icon: <Zap className="w-6 h-6" />
    },

    // Deployment
    {
      id: 'railway',
      name: 'Railway',
      description: 'Modern deployment platform with one-click AINative project setup',
      category: 'deployment',
      provider: 'Railway Corp.',
      status: 'verified',
      popularity: 'medium',
      difficulty: 1,
      features: ['One-Click Deploy', 'Auto Scaling', 'Database Provisioning', 'Custom Domains'],
      documentation: '/docs/integrations/railway',
      repository: 'https://github.com/AINative-Studio/railway-template',
      demo: 'https://railway-demo.ainative.app',
      installation: 'railway add ainative',
      codeExample: `# railway.toml
[build]
  builder = "NIXPACKS"

[deploy]
  template = "ainative-fullstack"

[variables]
  AINATIVE_API_KEY = "\${AINATIVE_API_KEY}"
  RAILWAY_ENVIRONMENT = "production"`,
      tags: ['deployment', 'hosting', 'scaling'],
      stats: {
        downloads: 12000,
        users: '3k+',
        maintainers: 3
      },
      icon: <Cloud className="w-6 h-6" />
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Edge deployment platform optimized for Next.js and AINative apps',
      category: 'deployment',
      provider: 'Vercel Inc.',
      status: 'official',
      popularity: 'high',
      difficulty: 1,
      features: ['Edge Functions', 'Serverless', 'Global CDN', 'Preview Deployments'],
      documentation: '/docs/integrations/vercel',
      repository: 'https://github.com/AINative-Studio/vercel-integration',
      demo: 'https://vercel-demo.ainative.app',
      installation: 'npm install @ainative/vercel-edge',
      codeExample: `import { AINativeEdge } from '@ainative/vercel-edge';

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const client = AINativeEdge({ apiKey: process.env.AINATIVE_API_KEY });
  const response = await client.chat(await req.json());
  return new Response(JSON.stringify(response));
}`,
      tags: ['edge', 'serverless', 'nextjs'],
      stats: {
        downloads: 22000,
        stars: 980,
        users: '8k+',
        maintainers: 12
      },
      icon: <Globe className="w-6 h-6" />
    },

    // AI Tools
    {
      id: 'langchain',
      name: 'LangChain',
      description: 'Framework for developing applications with large language models',
      category: 'ai-tools',
      provider: 'LangChain Inc.',
      status: 'verified',
      popularity: 'high',
      difficulty: 2,
      features: ['LLM Integration', 'Vector Stores', 'Memory Management', 'Agent Orchestration'],
      documentation: '/docs/integrations/langchain',
      repository: 'https://github.com/AINative-Studio/langchain-integration',
      installation: 'pip install langchain-ainative',
      codeExample: `from langchain_ainative import AINativeVectorStore, AINativeMemory
from langchain.agents import initialize_agent

vectorstore = AINativeVectorStore(api_key="your-key")
memory = AINativeMemory(api_key="your-key")

agent = initialize_agent(
    tools=[...],
    memory=memory,
    vectorstore=vectorstore
)

response = agent.run("Find relevant documents about AI")`,
      tags: ['llm', 'agents', 'vectorstore'],
      stats: {
        downloads: 35000,
        stars: 1500,
        users: '12k+',
        maintainers: 15
      },
      icon: <Zap className="w-6 h-6" />
    },

    // Mobile
    {
      id: 'react-native',
      name: 'React Native',
      description: 'Cross-platform mobile development with native AINative SDK',
      category: 'mobile',
      provider: 'Meta',
      status: 'community',
      popularity: 'medium',
      difficulty: 3,
      features: ['Cross-Platform', 'Native Performance', 'Offline Support', 'Push Notifications'],
      documentation: '/docs/integrations/react-native',
      repository: 'https://github.com/AINative-Studio/react-native-integration',
      demo: 'https://apps.apple.com/app/ainative-demo',
      installation: 'npm install @ainative/react-native',
      codeExample: `import { AINativeProvider, useAINative } from '@ainative/react-native';

function App() {
  return (
    <AINativeProvider apiKey="your-key" offlineMode>
      <ChatScreen />
    </AINativeProvider>
  );
}

function ChatScreen() {
  const { client, isOnline } = useAINative();
  // Handle online/offline scenarios automatically
}`,
      tags: ['mobile', 'ios', 'android', 'offline'],
      stats: {
        downloads: 5500,
        stars: 280,
        users: '1k+',
        maintainers: 8
      },
      icon: <Smartphone className="w-6 h-6" />
    }
  ];

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = searchQuery === '' ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || integration.status === selectedStatus;
    const matchesDifficulty = selectedDifficulty === 'all' || integration.difficulty.toString() === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
  });

  const categories = [
    { id: 'all', label: 'All Categories', icon: <Package className="w-4 h-4" /> },
    { id: 'frameworks', label: 'Frameworks', icon: <Code className="w-4 h-4" /> },
    { id: 'databases', label: 'Databases', icon: <Database className="w-4 h-4" /> },
    { id: 'deployment', label: 'Deployment', icon: <Cloud className="w-4 h-4" /> },
    { id: 'ai-tools', label: 'AI Tools', icon: <Zap className="w-4 h-4" /> },
    { id: 'mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <Shield className="w-4 h-4" /> }
  ];

  const statusOptions = [
    { id: 'all', label: 'All Status' },
    { id: 'official', label: 'Official' },
    { id: 'verified', label: 'Verified' },
    { id: 'community', label: 'Community' }
  ];

  const difficultyOptions = [
    { id: 'all', label: 'All Difficulty' },
    { id: '1', label: 'Easy' },
    { id: '2', label: 'Medium' },
    { id: '3', label: 'Advanced' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      official: 'bg-blue-500/20 text-blue-400',
      verified: 'bg-green-500/20 text-green-400',
      community: 'bg-purple-500/20 text-purple-400'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = { 1: 'Easy', 2: 'Medium', 3: 'Advanced' };
    return labels[difficulty as keyof typeof labels];
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'text-green-500',
      2: 'text-yellow-500',
      3: 'text-red-500'
    };
    return colors[difficulty as keyof typeof colors];
  };

  const featuredIntegrations = integrations
    .filter(i => i.status === 'official' && i.popularity === 'high')
    .slice(0, 3);

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
              Integrations & Partnerships
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Seamlessly integrate AINative with your favorite frameworks, databases, and deployment platforms
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span>{integrations.length}+ Integrations</span>
              <span>-</span>
              <span>One-click setup</span>
              <span>-</span>
              <span>Comprehensive docs</span>
              <span>-</span>
              <span>Community driven</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Integrations */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Featured Integrations</h2>
            <p className="text-gray-400">Popular integrations trusted by thousands of developers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {featuredIntegrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-6 border border-gray-700 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
                  {integration.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{integration.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{integration.description}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-4">
                  {integration.stats.users && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{integration.stats.users}</span>
                    </div>
                  )}
                  {integration.stats.stars && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{integration.stats.stars}</span>
                    </div>
                  )}
                </div>
                <Link
                  href={integration.documentation}
                  className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm space-x-2"
                >
                  <span>View Docs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
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

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {difficultyOptions.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>{difficulty.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              Found {filteredIntegrations.length} integrations
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredIntegrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden hover:border-cyan-500 transition-all duration-200"
              >
                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>by {integration.provider}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(integration.status)}`}>
                        {integration.status}
                      </span>
                      <span className={`text-xs ${getDifficultyColor(integration.difficulty)}`}>
                        {getDifficultyLabel(integration.difficulty)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{integration.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      {integration.stats.downloads && (
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{integration.stats.downloads.toLocaleString()}</span>
                        </div>
                      )}
                      {integration.stats.stars && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>{integration.stats.stars}</span>
                        </div>
                      )}
                      {integration.stats.users && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{integration.stats.users}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {integration.features.slice(0, 3).map(feature => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {integration.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                        +{integration.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Installation */}
                <div className="border-t border-gray-700 p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Installation:</span>
                  </div>
                  <div className="bg-gray-900/50 rounded p-2">
                    <code className="text-cyan-400 text-xs font-mono">{integration.installation}</code>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-4 border-t border-gray-700">
                  <div className="flex space-x-3">
                    <Link
                      href={integration.documentation}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center space-x-2"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>Documentation</span>
                    </Link>
                    {integration.demo && (
                      <a
                        href={integration.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No integrations found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-8 md:p-12 border border-gray-700 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Build Your Own Integration
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Create custom integrations and share them with the community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/getting-started"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Integration Guide
              </Link>
              <a
                href="https://github.com/AINative-Studio/integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold border border-gray-700"
              >
                Submit Integration
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
