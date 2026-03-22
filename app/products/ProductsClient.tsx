
'use client';
import React from "react";

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Rocket,
  Database,
  Package,
  Bot,
  Server,
  Terminal,
  Cpu,
  Search,
  FileText,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/lib/config/app';

interface Product {
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  borderGradient: string;
  href: string;
  cta: string;
  installCmd?: string;
  stats: { label: string; value: string }[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

const products: Product[] = [
  {
    title: 'ZeroDB',
    tagline: 'The persistent knowledge layer for AI agents',
    description:
      'Memory, semantic search, vector storage, file storage, and free embeddings — one API, zero setup. The database your agents actually remember with.',
    icon: Database,
    gradient: 'from-purple-500 to-indigo-600',
    borderGradient: 'border-purple-500/20 hover:border-purple-500/50',
    href: '/products/zerodb',
    cta: 'Explore ZeroDB',
    installCmd: 'npx zerodb-cli init',
    stats: [
      { label: 'Vectors', value: '500K free' },
      { label: 'Latency', value: '<1ms' },
      { label: 'Uptime', value: '99.99%' },
    ],
  },
  {
    title: 'AI Kit',
    tagline: '32 production-ready NPM packages',
    description:
      'Drop-in React components, hooks, and utilities for AI-native apps. Authentication, dashboards, agent UIs, and more — all typed, tested, and tree-shakeable.',
    icon: Package,
    gradient: 'from-orange-500 to-amber-500',
    borderGradient: 'border-orange-500/20 hover:border-orange-500/50',
    href: 'https://aikit.ainative.studio',
    cta: 'Browse Packages',
    installCmd: 'npm i @ainative/ai-kit',
    stats: [
      { label: 'Packages', value: '32' },
      { label: 'Components', value: '100+' },
      { label: 'Bundle', value: 'Tree-shake' },
    ],
  },
  {
    title: 'Agent Swarm',
    tagline: 'Multi-agent orchestration platform',
    description:
      'Deploy agent teams that collaborate on complex tasks. Stage-based workflows, tool calling, memory sharing, and real-time monitoring out of the box.',
    icon: Bot,
    gradient: 'from-emerald-500 to-teal-500',
    borderGradient: 'border-emerald-500/20 hover:border-emerald-500/50',
    href: '/agent-swarm',
    cta: 'Try Agent Swarm',
    stats: [
      { label: 'Stages', value: '9' },
      { label: 'Tools', value: '50+' },
      { label: 'Agents', value: 'Unlimited' },
    ],
  },
  {
    title: 'MCP Server Hosting',
    tagline: 'Deploy AI agent tools in under 60 seconds',
    description:
      'Host Model Context Protocol servers with zero config. 14+ pre-built servers (GitHub, Slack, PostgreSQL, and more) with auto-scaling and health monitoring.',
    icon: Server,
    gradient: 'from-cyan-500 to-blue-500',
    borderGradient: 'border-cyan-500/20 hover:border-cyan-500/50',
    href: '/products/mcp',
    cta: 'Deploy a Server',
    stats: [
      { label: 'Servers', value: '14+' },
      { label: 'Deploy', value: '<60s' },
      { label: 'Uptime', value: '99.9%' },
    ],
  },
];

const platformStats = [
  { value: '5,000+', label: 'Developers', description: 'Building with AINative' },
  { value: '32', label: 'NPM Packages', description: 'Production-ready components' },
  { value: '99.9%', label: 'Uptime', description: 'Enterprise-grade reliability' },
];

export default function ProductsClient() {
  return (
    <div className="bg-vite-bg text-white font-sans min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0A0D14] to-[#0D1117]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 space-y-24 md:space-y-32">
        {/* Hero Section */}
        <motion.div
          className="text-center max-w-4xl mx-auto pt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Infrastructure for the Agentic Era
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            The AI-Native Developer Platform
          </motion.h1>

          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Ship agents that remember, search, and learn. From persistent memory to multi-agent orchestration — everything you need to build production AI.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link href="/signup" className="relative inline-flex items-center justify-center group">
              <Button
                className="relative z-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-lg px-8 py-6 rounded-xl font-medium transition-all duration-300 transform group-hover:scale-105 shadow-lg group-hover:shadow-purple-500/30"
                size="lg"
              >
                <span className="flex items-center">
                  Start Free
                  <ArrowRight
                    className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Button>
            </Link>
            <Link href="https://docs.ainative.studio" className="relative inline-flex items-center justify-center group">
              <Button
                variant="outline"
                className="text-white text-lg px-8 py-6 rounded-xl border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300"
                size="lg"
              >
                <span className="flex items-center">
                  Read the Docs
                  <FileText className="ml-2 h-5 w-5" aria-hidden="true" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeIn}
        >
          {platformStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-gradient-to-br from-[#1C2128] to-[#0F1319] p-8 rounded-2xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group"
              variants={fadeIn}
              custom={index}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                {stat.value}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{stat.label}</h3>
              <p className="text-gray-400">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Product Cards */}
        <div className="space-y-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
              Four Products. One Platform.
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything your AI agents need — from persistent memory to production deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.title}
                className="group relative h-full"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeIn}
                custom={index}
              >
                <Link href={product.href} className="block h-full">
                  <Card className={`h-full bg-[#1C2128]/70 backdrop-blur-sm border ${product.borderGradient} transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-purple-500/5`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${product.gradient}`}
                        >
                          <product.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <CardTitle className="text-2xl text-white mb-1">{product.title}</CardTitle>
                      <p className={`text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r ${product.gradient}`}>
                        {product.tagline}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <p className="text-gray-400 leading-relaxed">{product.description}</p>

                      {/* Install command */}
                      {product.installCmd && (
                        <div className="bg-[#0D1117] rounded-lg px-4 py-3 font-mono text-sm text-gray-300 border border-gray-800/50">
                          <span className="text-gray-500">$ </span>{product.installCmd}
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        {product.stats.map((stat) => (
                          <div key={stat.label} className="text-center">
                            <div className="text-lg font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Agent-First / API Section */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
              Built for Agents First
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Every product exposes a clean API. Your agents can provision databases, deploy servers, and manage memory programmatically.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-[#0D1117] rounded-2xl border border-gray-800/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/50">
                <Terminal className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Instant database — no signup required</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-4">
                <div>
                  <span className="text-gray-500"># Provision a database in one request</span>
                </div>
                <div className="text-green-400">
                  curl -X POST https://api.ainative.studio/api/v1/public/instant-db
                </div>
                <div className="text-gray-500 mt-4"># Response:</div>
                <div className="text-amber-300/80">
                  {`{`}
                </div>
                <div className="text-amber-300/80 pl-4">
                  {`"project_id": "proj_abc123",`}
                </div>
                <div className="text-amber-300/80 pl-4">
                  {`"api_key": "zdb_live_...",`}
                </div>
                <div className="text-amber-300/80 pl-4">
                  {`"expires": "72h",`}
                </div>
                <div className="text-amber-300/80 pl-4">
                  {`"endpoints": { "vectors": "/v1/vectors", "memory": "/v1/memory", "files": "/v1/files" }`}
                </div>
                <div className="text-amber-300/80">
                  {`}`}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-[#1C2128]/70 rounded-xl p-6 border border-gray-800/50 text-center">
              <Cpu className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">RESTful APIs</h3>
              <p className="text-sm text-gray-400">Every feature accessible via clean REST endpoints with OpenAPI specs</p>
            </div>
            <div className="bg-[#1C2128]/70 rounded-xl p-6 border border-gray-800/50 text-center">
              <Search className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">LLM Discoverable</h3>
              <p className="text-sm text-gray-400">Structured metadata and llms.txt for AI agents to find and use your tools</p>
            </div>
            <div className="bg-[#1C2128]/70 rounded-xl p-6 border border-gray-800/50 text-center">
              <Package className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">SDK Support</h3>
              <p className="text-sm text-gray-400">Python, TypeScript, Go, LangChain, and LlamaIndex integrations</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="relative rounded-2xl overflow-hidden p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Build?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Start with a free ZeroDB instance. No credit card, no signup wall — just an API call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-white text-[#0D1117] hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href="/signup">
                  Get Started Free
                  <Rocket className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="text-white text-lg px-8 py-6 rounded-xl border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <Link href={appConfig.links.calendly} target="_blank" rel="noopener noreferrer">
                  Schedule a Demo
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
