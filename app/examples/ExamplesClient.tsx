
'use client';
import React from "react";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Search,
  Star,
  Eye,
  Clock,
  Copy,
  Check,
  Database,
  Bot,
  MessageSquare,
  BarChart3,
  Shield,
  Smartphone,
  PlayCircle,
} from 'lucide-react';

interface Example {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  framework?: string;
  useCase: string;
  stars: number;
  views: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: string;
  features: string[];
  preview?: string;
  codeUrl?: string;
  demoUrl?: string;
  tags: string[];
  icon: React.ReactNode;
}

const examples: Example[] = [
  {
    id: 'simple-chat',
    title: 'Simple AI Chat',
    description: 'Build a basic AI chat interface with memory persistence',
    category: 'beginner',
    language: 'TypeScript',
    framework: 'Next.js',
    useCase: 'Chat Applications',
    stars: 456,
    views: 12500,
    difficulty: 2,
    estimatedTime: '30 minutes',
    features: ['Real-time chat', 'Memory storage', 'Message history'],
    preview: `import { AINativeClient } from '@ainative/sdk';

const client = new AINativeClient({
  apiKey: process.env.AINATIVE_API_KEY
});

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    await client.zerodb.memory.create({
      content: input,
      tags: ['chat', 'user-message']
    });
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
  };

  return <div className="chat-container">{/* Chat UI */}</div>;
}`,
    codeUrl: 'https://github.com/ainative/examples/tree/main/simple-chat',
    demoUrl: 'https://simple-chat-demo.ainative.app',
    tags: ['chat', 'nextjs', 'memory', 'beginner'],
    icon: <MessageSquare className="w-6 h-6" />,
  },
  {
    id: 'vector-search-basic',
    title: 'Document Search Engine',
    description: 'Semantic document search using vector embeddings',
    category: 'beginner',
    language: 'Python',
    framework: 'FastAPI',
    useCase: 'Search & Discovery',
    stars: 324,
    views: 8900,
    difficulty: 2,
    estimatedTime: '45 minutes',
    features: ['Document indexing', 'Semantic search', 'REST API'],
    preview: `from ainative import AINativeClient
from fastapi import FastAPI, UploadFile

app = FastAPI()
client = AINativeClient(api_key="your-key")

@app.post("/upload")
async def upload_document(file: UploadFile):
    content = await file.read()
    await client.zerodb.vectors.upsert(
        vectors=[{
            "id": file.filename,
            "vector": generate_embeddings(content),
            "metadata": {"filename": file.filename}
        }],
        namespace="documents"
    )
    return {"status": "uploaded"}`,
    codeUrl: 'https://github.com/ainative/examples/tree/main/document-search',
    demoUrl: 'https://doc-search-demo.ainative.app',
    tags: ['search', 'vectors', 'fastapi', 'python'],
    icon: <Database className="w-6 h-6" />,
  },
  {
    id: 'agent-task-planner',
    title: 'AI Task Planning System',
    description: 'Multi-agent system for breaking down and executing complex tasks',
    category: 'intermediate',
    language: 'TypeScript',
    framework: 'Node.js',
    useCase: 'Agent Systems',
    stars: 567,
    views: 15200,
    difficulty: 4,
    estimatedTime: '2 hours',
    features: ['Task decomposition', 'Agent orchestration', 'Progress tracking'],
    preview: `import { AINativeClient } from '@ainative/sdk';

class TaskPlannerAgent {
  constructor(private client: AINativeClient) {}

  async planTask(objective: string) {
    const swarm = await this.client.agentSwarm.start({
      name: "Task Planner",
      objective,
      agents: [
        { type: "analyzer", count: 1 },
        { type: "executor", count: 2 }
      ]
    });

    const planningTask = await this.client.agentSwarm.orchestrate({
      swarmId: swarm.id,
      task: "create_detailed_plan",
      context: { objective }
    });

    return this.monitorTask(planningTask.taskId);
  }
}`,
    codeUrl: 'https://github.com/ainative/examples/tree/main/task-planner',
    demoUrl: 'https://task-planner-demo.ainative.app',
    tags: ['agents', 'planning', 'orchestration', 'nodejs'],
    icon: <Bot className="w-6 h-6" />,
  },
  {
    id: 'realtime-analytics',
    title: 'Real-time Analytics Dashboard',
    description: 'Live analytics dashboard with AI-powered insights',
    category: 'intermediate',
    language: 'TypeScript',
    framework: 'React',
    useCase: 'Analytics & Insights',
    stars: 432,
    views: 11800,
    difficulty: 3,
    estimatedTime: '1.5 hours',
    features: ['Real-time data', 'AI insights', 'Interactive charts'],
    preview: `import { AINativeClient } from '@ainative/sdk';
import { useEffect, useState } from 'react';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [insights, setInsights] = useState([]);
  const client = new AINativeClient({ apiKey: 'your-key' });

  useEffect(() => {
    const fetchInsights = async () => {
      await client.zerodb.memory.create({
        content: JSON.stringify(metrics),
        tags: ['analytics', 'metrics']
      });

      const aiInsights = await client.agentSwarm.orchestrate({
        task: 'analyze_metrics',
        context: { metrics, timeframe: 'last_24h' }
      });
      setInsights(aiInsights);
    };

    if (metrics.length > 0) fetchInsights();
  }, [metrics]);

  return <div className="dashboard">{/* Dashboard UI */}</div>;
}`,
    codeUrl: 'https://github.com/ainative/examples/tree/main/analytics-dashboard',
    demoUrl: 'https://analytics-demo.ainative.app',
    tags: ['analytics', 'dashboard', 'react', 'insights'],
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    id: 'enterprise-rag',
    title: 'Enterprise RAG System',
    description: 'Production-ready RAG with security, caching, and monitoring',
    category: 'advanced',
    language: 'Python',
    framework: 'FastAPI',
    useCase: 'Enterprise AI',
    stars: 789,
    views: 23400,
    difficulty: 5,
    estimatedTime: '4 hours',
    features: ['Document processing', 'Security layers', 'Performance monitoring'],
    preview: `from ainative import AINativeClient
from dataclasses import dataclass

@dataclass
class RAGConfig:
    chunk_size: int = 1000
    overlap: int = 100
    top_k: int = 5
    security_level: str = "enterprise"

class EnterpriseRAGSystem:
    def __init__(self, config: RAGConfig):
        self.client = AINativeClient(api_key=os.getenv("AINATIVE_API_KEY"))
        self.config = config

    async def query(self, question: str, user_context: dict) -> str:
        # Log query for audit
        await self.client.zerodb.memory.create(
            content=f"Query: {question}",
            metadata={"user": user_context.get("user_id")},
            tags=["audit", "query"]
        )

        # Semantic search with user permissions
        results = await self.client.zerodb.vectors.search(
            vector=await self.embed_query(question),
            top_k=self.config.top_k
        )

        return results`,
    codeUrl: 'https://github.com/ainative/examples/tree/main/enterprise-rag',
    tags: ['rag', 'enterprise', 'security', 'python', 'fastapi'],
    icon: <Shield className="w-6 h-6" />,
  },
  {
    id: 'mobile-ai-app',
    title: 'Mobile AI Assistant',
    description: 'Cross-platform mobile app with offline AI capabilities',
    category: 'advanced',
    language: 'TypeScript',
    framework: 'React Native',
    useCase: 'Mobile Applications',
    stars: 645,
    views: 18900,
    difficulty: 4,
    estimatedTime: '3 hours',
    features: ['Offline mode', 'Voice input', 'Push notifications'],
    preview: `import { AINativeClient } from '@ainative/sdk';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AIAssistantScreen() {
  const [client, setClient] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    initializeClient();
  }, []);

  const initializeClient = async () => {
    const apiKey = await AsyncStorage.getItem('ainative_api_key');
    const clientInstance = new AINativeClient({
      apiKey,
      enableOfflineMode: true
    });
    setClient(clientInstance);
  };

  const handleVoiceInput = async (audioData) => {
    if (!client) return;

    const memory = await client.zerodb.memory.create({
      content: transcription,
      tags: ['voice_input', 'mobile']
    });

    const response = await client.agentSwarm.orchestrate({
      task: 'voice_assistant_response',
      context: { query: transcription }
    });

    return response;
  };

  return <View>{/* Mobile UI */}</View>;
}`,
    codeUrl: 'https://github.com/ainative/examples/tree/main/mobile-ai-app',
    demoUrl: 'https://apps.apple.com/app/ainative-assistant',
    tags: ['mobile', 'react-native', 'voice', 'offline'],
    icon: <Smartphone className="w-6 h-6" />,
  },
];

const categories = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const languages = [
  { id: 'all', label: 'All Languages' },
  { id: 'python', label: 'Python' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'go', label: 'Go' },
];

const useCases = [
  { id: 'all', label: 'All Use Cases' },
  { id: 'Chat Applications', label: 'Chat Applications' },
  { id: 'Search & Discovery', label: 'Search & Discovery' },
  { id: 'Agent Systems', label: 'Agent Systems' },
  { id: 'Analytics & Insights', label: 'Analytics & Insights' },
  { id: 'Enterprise AI', label: 'Enterprise AI' },
  { id: 'Mobile Applications', label: 'Mobile Applications' },
];

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 2) return 'text-green-400';
  if (difficulty <= 3) return 'text-yellow-400';
  return 'text-red-400';
};

const getDifficultyLabel = (difficulty: number) => {
  if (difficulty <= 2) return 'Easy';
  if (difficulty <= 3) return 'Medium';
  return 'Hard';
};

const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case 'beginner':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'intermediate':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'advanced':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default:
      return 'bg-white/5 text-gray-400 border border-white/10';
  }
};

export default function ExamplesClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedUseCase, setSelectedUseCase] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string>('');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredExamples = examples.filter((example) => {
    const matchesSearch =
      searchQuery === '' ||
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory;
    const matchesLanguage =
      selectedLanguage === 'all' ||
      example.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesUseCase = selectedUseCase === 'all' || example.useCase === selectedUseCase;

    return matchesSearch && matchesCategory && matchesLanguage && matchesUseCase;
  });

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/20 text-[#4B6FED] text-sm font-medium mb-4">
              <Code className="h-4 w-4 mr-2" />
              Production-Ready Examples
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
              Code Examples Gallery
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Explore production-ready examples and learn how to build amazing AI applications with
              AINative
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span>Production-ready code</span>
              <span className="hidden md:inline text-gray-600">|</span>
              <span>Cross-platform examples</span>
              <span className="hidden md:inline text-gray-600">|</span>
              <span>Multiple frameworks</span>
              <span className="hidden md:inline text-gray-600">|</span>
              <span>Step-by-step guides</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search examples..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0D1117] border border-white/5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#4B6FED]/50 focus:ring-1 focus:ring-[#4B6FED]/30 transition-colors"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-[#0D1117] border border-white/5 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#4B6FED]/50 focus:ring-1 focus:ring-[#4B6FED]/30 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#161B22] text-gray-300">
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Language Filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 bg-[#0D1117] border border-white/5 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#4B6FED]/50 focus:ring-1 focus:ring-[#4B6FED]/30 transition-colors"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-[#161B22] text-gray-300">
                    {lang.label}
                  </option>
                ))}
              </select>

              {/* Use Case Filter */}
              <select
                value={selectedUseCase}
                onChange={(e) => setSelectedUseCase(e.target.value)}
                className="px-4 py-2 bg-[#0D1117] border border-white/5 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#4B6FED]/50 focus:ring-1 focus:ring-[#4B6FED]/30 transition-colors"
              >
                {useCases.map((useCase) => (
                  <option key={useCase.id} value={useCase.id} className="bg-[#161B22] text-gray-300">
                    {useCase.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Found {filteredExamples.length} example{filteredExamples.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExamples.map((example, index) => (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group"
              >
                <div className="h-full bg-[#161B22] border border-white/5 rounded-xl hover:border-[#4B6FED]/30 transition-all duration-200 hover:shadow-lg hover:shadow-[#4B6FED]/5 flex flex-col">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-[#4B6FED]/20 to-[#8A63F4]/20 rounded-lg text-[#4B6FED]">
                          {example.icon}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{example.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{example.language}</span>
                            {example.framework && (
                              <>
                                <span className="text-gray-600">|</span>
                                <span>{example.framework}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getCategoryBadgeClass(example.category)}`}>
                        {example.category}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{example.description}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5" />
                          <span>{example.stars}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{example.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{example.estimatedTime}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${getDifficultyColor(example.difficulty)}`}>
                        {getDifficultyLabel(example.difficulty)}
                      </span>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {example.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-gray-400"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Code Preview */}
                  {example.preview && (
                    <div className="border-t border-white/5 flex-1">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</span>
                          <button
                            onClick={() => copyToClipboard(example.preview!, example.id)}
                            className="flex items-center space-x-1 text-[#4B6FED] hover:text-[#6B88F0] transition-colors text-sm"
                          >
                            {copiedCode === example.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-xs">{copiedCode === example.id ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="bg-[#0D1117] border border-white/5 rounded-lg p-3 overflow-x-auto">
                          <pre className="text-xs text-gray-400 font-mono leading-relaxed">
                            <code>{example.preview.substring(0, 300)}...</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 pt-3 border-t border-white/5 mt-auto">
                    <div className="flex space-x-3">
                      {example.codeUrl && (
                        <a
                          href={example.codeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-150"
                        >
                          <Code className="w-4 h-4" />
                          View Code
                        </a>
                      )}
                      {example.demoUrl && (
                        <a
                          href={example.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#4B6FED] rounded-lg hover:bg-[#3A56D3] transition-all duration-150"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredExamples.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#161B22] border border-white/5 mb-4">
                <Search className="h-7 w-7 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No examples found</h3>
              <p className="text-gray-400 mb-6">
                No examples found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLanguage('all');
                  setSelectedUseCase('all');
                }}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-150"
              >
                Clear Filters
              </button>
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
          >
            <div className="bg-[#161B22] border border-white/5 rounded-xl p-8 md:p-12 text-center relative overflow-hidden">
              {/* Subtle gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#4B6FED]/5 via-transparent to-[#8A63F4]/5 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">Don&apos;t See What You&apos;re Looking For?</h2>
                <p className="text-lg text-gray-400 mb-8">
                  Request an example or contribute your own to help the community
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://github.com/ainative/examples/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[#4B6FED] rounded-lg hover:bg-[#3A56D3] transition-all duration-150"
                  >
                    Request Example
                  </a>
                  <a
                    href="https://github.com/ainative/examples"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-150"
                  >
                    Contribute Example
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
