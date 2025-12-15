'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Download,
  Star,
  Github,
  BookOpen,
  Code2,
  Terminal,
  Shield,
  Zap,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Cpu,
  Database,
  TestTube2,
  Eye,
  Lock,
  Palette,
  Globe,
  ChevronRight,
  Box,
  Workflow,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// AI Kit packages data
interface AIKitPackage {
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  gradient: string;
  features: string[];
}

const aiKitPackages: AIKitPackage[] = [
  {
    name: '@ainative-studio/aikit-core',
    description: 'Core utilities and shared types for AI Kit ecosystem',
    icon: Cpu,
    category: 'Core',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Type safety', 'Base utilities', 'Common interfaces']
  },
  {
    name: '@ainative/ai-kit-auth',
    description: 'Authentication and authorization utilities for AI applications',
    icon: Lock,
    category: 'Security',
    gradient: 'from-purple-500 to-pink-500',
    features: ['JWT handling', 'OAuth flows', 'Session management']
  },
  {
    name: '@ainative/ai-kit',
    description: 'React hooks and components for AI-powered applications',
    icon: Code2,
    category: 'Framework',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Custom hooks', 'AI components', 'State management']
  },
  {
    name: '@ainative/ai-kit-vue',
    description: 'Vue composables and components for AI integration',
    icon: Code2,
    category: 'Framework',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Composables', 'Vue 3 support', 'Reactive AI']
  },
  {
    name: '@ainative/ai-kit-svelte',
    description: 'Svelte stores and components for AI applications',
    icon: Code2,
    category: 'Framework',
    gradient: 'from-orange-500 to-red-500',
    features: ['Svelte stores', 'Components', 'Reactive patterns']
  },
  {
    name: '@ainative/ai-kit-nextjs',
    description: 'Next.js utilities and middleware for AI integration',
    icon: Globe,
    category: 'Framework',
    gradient: 'from-slate-700 to-slate-900',
    features: ['Server actions', 'API routes', 'Edge runtime']
  },
  {
    name: '@ainative/ai-kit-design-system',
    description: 'Pre-built UI components and design tokens for AI interfaces',
    icon: Palette,
    category: 'UI/UX',
    gradient: 'from-pink-500 to-rose-500',
    features: ['Design tokens', 'Components', 'Themes']
  },
  {
    name: '@ainative/ai-kit-zerodb',
    description: 'ZeroDB client SDK for vector search and AI-native storage',
    icon: Database,
    category: 'Data',
    gradient: 'from-violet-500 to-purple-500',
    features: ['Vector search', 'AI storage', 'Real-time sync']
  },
  {
    name: '@ainative/ai-kit-cli',
    description: 'Command-line tools for AI Kit development and deployment',
    icon: Terminal,
    category: 'DevTools',
    gradient: 'from-gray-600 to-gray-800',
    features: ['Project scaffolding', 'Deploy tools', 'Code generation']
  },
  {
    name: '@ainative/ai-kit-testing',
    description: 'Testing utilities and mocks for AI applications',
    icon: TestTube2,
    category: 'DevTools',
    gradient: 'from-yellow-500 to-amber-500',
    features: ['AI mocks', 'Test helpers', 'Fixtures']
  },
  {
    name: '@ainative/ai-kit-observability',
    description: 'Monitoring, logging, and observability tools for AI systems',
    icon: Eye,
    category: 'DevTools',
    gradient: 'from-indigo-500 to-blue-500',
    features: ['Metrics', 'Tracing', 'Logging']
  },
  {
    name: '@ainative/ai-kit-safety',
    description: 'Safety guardrails and content moderation utilities',
    icon: Shield,
    category: 'Security',
    gradient: 'from-emerald-500 to-teal-500',
    features: ['Content filtering', 'Rate limiting', 'Guardrails']
  },
  {
    name: '@ainative/ai-kit-rlhf',
    description: 'Reinforcement Learning from Human Feedback utilities',
    icon: Workflow,
    category: 'ML',
    gradient: 'from-fuchsia-500 to-purple-500',
    features: ['Feedback collection', 'Model training', 'A/B testing']
  },
  {
    name: '@ainative/ai-kit-tools',
    description: 'Function calling and tool integration utilities',
    icon: Box,
    category: 'Core',
    gradient: 'from-sky-500 to-blue-500',
    features: ['Function schemas', 'Tool execution', 'Type validation']
  }
];

// Code examples
const codeExamples = {
  react: `import { useAIChat, useAICompletion } from '@ainative/ai-kit';

function ChatComponent() {
  const { messages, sendMessage, isLoading } = useAIChat({
    model: 'gpt-4',
    systemPrompt: 'You are a helpful assistant'
  });

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>
        Send
      </button>
    </div>
  );
}`,
  vue: `<script setup>
import { useAIChat } from '@ainative/ai-kit-vue';

const { messages, sendMessage, isLoading } = useAIChat({
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant'
});
</script>

<template>
  <div>
    <div v-for="msg in messages" :key="msg.id">
      {{ msg.content }}
    </div>
    <button @click="sendMessage('Hello!')">
      Send
    </button>
  </div>
</template>`,
  cli: `# Install AI Kit CLI globally
npm install -g @ainative/ai-kit-cli

# Create new AI Kit project
ai-kit create my-app --template react

# Add AI capabilities to existing project
ai-kit add chat --framework react

# Deploy to production
ai-kit deploy --env production`
};

// Feature highlights
const features = [
  {
    icon: Zap,
    title: 'Production Ready',
    description: 'Battle-tested packages used in production by thousands of developers'
  },
  {
    icon: Shield,
    title: 'Type Safe',
    description: 'Full TypeScript support with comprehensive type definitions'
  },
  {
    icon: Layers,
    title: 'Framework Agnostic',
    description: 'Works with React, Vue, Svelte, Next.js, and vanilla JavaScript'
  },
  {
    icon: Sparkles,
    title: 'AI Native',
    description: 'Purpose-built for modern AI application development'
  },
  {
    icon: Database,
    title: 'Vector Storage',
    description: 'Integrated with ZeroDB for seamless vector search'
  },
  {
    icon: Eye,
    title: 'Observable',
    description: 'Built-in monitoring, logging, and debugging tools'
  }
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AIKitClient() {
  const [copiedPackage, setCopiedPackage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const copyToClipboard = (text: string, packageName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPackage(packageName);
    setTimeout(() => setCopiedPackage(null), 2000);
  };

  const categories = ['All', ...Array.from(new Set(aiKitPackages.map(pkg => pkg.category)))];

  const filteredPackages = selectedCategory === 'All'
    ? aiKitPackages
    : aiKitPackages.filter(pkg => pkg.category === selectedCategory);

  return (
    <main className="min-h-screen bg-[#0D1117] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#1A1B2E]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(75, 111, 237, 0.3) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(138, 99, 244, 0.3) 0%, transparent 30%)',
          }} />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="container mx-auto max-w-7xl px-4 pt-8">
        <ol className="flex gap-2 text-sm text-gray-400">
          <li>
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">
            <span className="text-white font-medium">AI Kit</span>
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-12 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Package className="w-4 h-4 mr-2" />
              <span>14 Production-Ready Packages</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                AI Kit
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8AB4FF] via-[#4B6FED] to-[#8A63F4]">
                Build AI Apps Faster
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
              A comprehensive suite of NPM packages for building production-ready AI applications.
              Framework-agnostic, type-safe, and battle-tested.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://github.com/AINative-Studio/ai-kit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Github className="mr-2 h-5 w-5" />
                  <span>View on GitHub</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </a>
              <a
                href="https://www.npmjs.com/~ainative-studio"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5 text-white"
                >
                  <Download className="mr-2 h-5 w-5" />
                  <span>Browse Packages</span>
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Link href="/resources">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  <span>Documentation</span>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-[#4B6FED]" />
                <span>14 Packages</span>
              </div>
              <div className="flex items-center">
                <Download className="w-4 h-4 mr-2 text-[#8A63F4]" />
                <span>50K+ Downloads</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" />
                <span>1.2K+ Stars</span>
              </div>
              <div className="flex items-center">
                <Github className="w-4 h-4 mr-2 text-gray-400" />
                <span>Open Source</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#161B22]/30">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Choose AI Kit
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to build AI-powered applications, from authentication to deployment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-[#1C2128]/70 backdrop-blur-sm border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#4B6FED]/10">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#4B6FED]/10 to-[#8A63F4]/10 w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-[#4B6FED]" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 px-4" aria-labelledby="packages-heading">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Complete Toolkit</span>
            </div>
            <h2 id="packages-heading" className="text-3xl md:text-5xl font-bold mb-4">
              Browse All Packages
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              14 specialized packages covering every aspect of AI application development
            </p>

            {/* Category Filter */}
            <nav aria-label="Package categories" className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category
                    ? 'bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]'
                    : 'border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent'
                  }
                >
                  {category}
                </Button>
              ))}
            </nav>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {filteredPackages.map((pkg, index) => (
                <motion.article
                  key={pkg.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full bg-[#161B22] border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all duration-300 group hover:shadow-xl hover:shadow-[#4B6FED]/10 overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${pkg.gradient}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${pkg.gradient} bg-opacity-10`}>
                          <pkg.icon className="h-5 w-5 text-white" aria-hidden="true" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {pkg.category}
                        </Badge>
                      </div>
                      <h3 className="text-lg text-white group-hover:text-[#8AB4FF] transition-colors font-semibold">
                        {pkg.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {pkg.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Features */}
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.features.map((feature) => (
                            <Badge
                              key={feature}
                              variant="outline"
                              className="text-xs border-[#2D333B] text-gray-400"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        {/* Install Command */}
                        <div className="relative group/install">
                          <div className="bg-[#0D1117] rounded-lg p-3 pr-12 font-mono text-xs text-gray-300 border border-[#2D333B]">
                            npm install {pkg.name}
                          </div>
                          <button
                            onClick={() => copyToClipboard(`npm install ${pkg.name}`, pkg.name)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#1C2128] border border-[#2D333B] hover:border-[#4B6FED]/40 transition-all"
                          >
                            {copiedPackage === pkg.name ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-400" />
                            )}
                          </button>
                        </div>

                        {/* Links */}
                        <div className="flex gap-2 pt-2">
                          <a
                            href={`https://www.npmjs.com/package/${pkg.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-[#2D3748] hover:border-[#4B6FED]/40 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              NPM
                            </Button>
                          </a>
                          <a
                            href={`https://github.com/AINative-Studio/ai-kit/tree/main/packages/${pkg.name.split('/')[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-[#2D3748] hover:border-[#4B6FED]/40 text-xs"
                            >
                              <Github className="h-3 w-3 mr-1" />
                              Docs
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#161B22]/30 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-400">
              Choose your framework and start building
            </p>
          </motion.div>

          <Tabs defaultValue="react" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#1C2128]">
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="vue">Vue</TabsTrigger>
              <TabsTrigger value="cli">CLI</TabsTrigger>
            </TabsList>

            <TabsContent value="react">
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Code2 className="mr-2 h-5 w-5 text-[#4B6FED]" />
                    React Example
                  </CardTitle>
                  <CardDescription>
                    Build AI chat interfaces with React hooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-[#0D1117] rounded-lg p-4 overflow-x-auto border border-[#2D333B]">
                    <code className="text-sm text-gray-300 font-mono">
                      {codeExamples.react}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vue">
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Code2 className="mr-2 h-5 w-5 text-[#4B6FED]" />
                    Vue Example
                  </CardTitle>
                  <CardDescription>
                    Integrate AI with Vue composables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-[#0D1117] rounded-lg p-4 overflow-x-auto border border-[#2D333B]">
                    <code className="text-sm text-gray-300 font-mono">
                      {codeExamples.vue}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cli">
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Terminal className="mr-2 h-5 w-5 text-[#4B6FED]" />
                    CLI Commands
                  </CardTitle>
                  <CardDescription>
                    Scaffold and deploy with AI Kit CLI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-[#0D1117] rounded-lg p-4 overflow-x-auto border border-[#2D333B]">
                    <code className="text-sm text-gray-300 font-mono">
                      {codeExamples.cli}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Integration Examples */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              AI Kit works perfectly with your existing tech stack
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['React', 'Vue', 'Svelte', 'Next.js', 'TypeScript', 'Tailwind', 'Vercel', 'ZeroDB'].map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#161B22] border border-[#2D333B] rounded-xl p-6 text-center hover:border-[#4B6FED]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#4B6FED]/10"
              >
                <p className="text-lg font-semibold text-white">{tech}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 rounded-2xl border border-[#4B6FED]/30 p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers using AI Kit to build the next generation of AI applications
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/AINative-Studio/ai-kit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB] text-white"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <Link href="/resources">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Documentation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
