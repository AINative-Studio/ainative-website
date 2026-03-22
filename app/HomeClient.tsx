
'use client';
import React from "react";

import Link from 'next/link';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Bot,
  Database,
  Package,
  Server,
  Terminal,
} from 'lucide-react';
import {
  ChevronRightIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState, startTransition } from 'react';

// Animation variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const products = [
  {
    icon: Database,
    title: 'ZeroDB',
    desc: 'Persistent memory, semantic search, vector storage, and free embeddings for AI agents',
    link: '/products/zerodb',
    gradient: 'from-purple-500 to-indigo-600',
    cmd: 'npx zerodb-cli init',
  },
  {
    icon: Package,
    title: 'AI Kit',
    desc: '32 production-ready NPM packages — React components, hooks, and utilities for AI-native apps',
    link: '/ai-kit',
    gradient: 'from-orange-500 to-amber-500',
    cmd: 'npm i @ainative/ai-kit',
  },
  {
    icon: Bot,
    title: 'Agent Swarm',
    desc: 'Multi-agent orchestration with stage-based workflows, tool calling, and shared memory',
    link: '/agent-swarm',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Server,
    title: 'MCP Server Hosting',
    desc: '14+ pre-built Model Context Protocol servers. Deploy in under 60 seconds with auto-scaling',
    link: '/products/mcp',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

export default function HomeClient() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });
  }, []);

  return (
    <div ref={targetRef} className="relative flex flex-col min-h-screen bg-vite-bg text-white overflow-hidden pt-24 md:pt-32">
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#1A1B2E]" />
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          <div className="absolute w-64 h-64 rounded-full bg-[#4B6FED]/5 blur-3xl -left-32 -top-32" />
          <div className="absolute w-96 h-96 rounded-full bg-[#4B6FED]/5 blur-3xl -right-48 -bottom-48" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="full-width-section relative min-h-[70vh] flex items-center justify-center pb-12 z-10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/80 via-[#0D1117]/90 to-[#0D1117]/80"></div>
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(75, 111, 237, 0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(138, 99, 244, 0.3) 0%, transparent 30%)',
          }} />
        </div>

        <div className="container-custom max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-8"
          >
            <motion.div
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Infrastructure for the Agentic Era</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6 leading-tight"
            >
              Ship Agents That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8AB4FF] to-[#4B6FED]">
                Remember
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Persistent memory, semantic search, multi-agent orchestration, and MCP hosting — everything you need to build production AI. One platform, zero setup.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.35 }}
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full group relative overflow-hidden bg-[#4B6FED] hover:bg-[#3A56D3] text-white shadow-lg hover:shadow-xl hover:shadow-[#4B6FED]/20 transition-all duration-300 transform hover:-translate-y-0.5 px-8 py-6 text-lg"
                >
                  <span className="relative z-10">Start Free</span>
                  <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/products" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full group border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5 text-white transition-all duration-300 px-8 py-6 text-lg"
                >
                  <span className="relative z-10">Explore Products</span>
                  <ChevronRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Instant Try Section */}
      <section className="full-width-section-md bg-vite-bg">
        <div className="container-custom max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Try it now — no signup required
              </h2>
              <p className="text-gray-400">
                Provision a ZeroDB instance with a single API call. 72-hour free trial, instant access.
              </p>
            </div>

            <div className="bg-[#0D1117] rounded-2xl border border-[#2D333B]/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2D333B]/50">
                <Terminal className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Zero-auth instant database</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-3">
                <div className="text-green-400">
                  curl -X POST https://api.ainative.studio/api/v1/public/instant-db
                </div>
                <div className="text-gray-500 mt-3"># Response:</div>
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
                  {`"endpoints": { "vectors": "/v1/vectors", "memory": "/v1/memory", "files": "/v1/files" }`}
                </div>
                <div className="text-amber-300/80">
                  {`}`}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="full-width-section-md bg-vite-bg">
        <div className="container-custom max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Four products. One platform.
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything your AI agents need — from persistent memory to production deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(({ icon: Icon, title, desc, link, gradient, cmd }, i) => (
              <Link href={link} key={title}>
                <motion.div
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-[#161B22] rounded-xl p-6 border border-[#2D333B]/50 hover:border-[#4B6FED]/30 transition-all duration-300 cursor-pointer h-full group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{desc}</p>
                  {cmd && (
                    <div className="bg-[#0D1117] rounded-lg px-3 py-2 font-mono text-xs text-gray-400 border border-[#2D333B]/50 inline-block">
                      <span className="text-gray-600">$ </span>{cmd}
                    </div>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="full-width-section-sm bg-[#0D1117] border-y border-[#2D333B]/40">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '5,000+', label: 'Developers' },
              { value: '32', label: 'NPM Packages' },
              { value: '99.9%', label: 'Uptime' },
            ].map(({ value, label }, i) => (
              <motion.div
                key={label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
              >
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-gray-400 uppercase tracking-wide">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="full-width-section-sm bg-gradient-to-b from-[#0D1117] to-[#161B22]">
        <div className="container-custom max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to build?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Start with a free ZeroDB instance. No credit card, no signup wall — just an API call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-[#4B6FED] hover:bg-[#3A56D3] text-white shadow-lg hover:shadow-xl hover:shadow-[#4B6FED]/20 transition-all duration-300 px-8 py-6 text-lg"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="https://docs.ainative.studio" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5 text-white transition-all duration-300 px-8 py-6 text-lg"
                >
                  <span className="relative z-10">Read the Docs</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
