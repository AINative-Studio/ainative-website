'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, Variants, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  ArrowRight,
  ChevronRight,
  Star,
  Sparkles,
  Database,
  Users,
  BrainCog,
  GitBranch,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef, useEffect, useState } from 'react';

// Configuration constants (migrated from Vite app.config.ts)
const appConfig = {
  statistics: {
    totalUsers: '10,000+',
    rating: '4.9/5',
    reviewCount: '500+'
  },
  links: {
    github: 'https://github.com/AINative-Studio',
    blog: '/blog',
    zerodb: 'https://zerodb.ainative.studio'
  }
};

// Animated text cycling component
const AnimatedTargetText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const targets = ['Founders', 'Developers', 'Builders', 'Data Scientists', 'Vibe Coders'];

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Start animation after initial delay
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % targets.length);
      }, 2500);
    }, 2000);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <span className="inline-block" style={{ width: '320px', minHeight: '1em' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={targets[currentIndex]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#8AB4FF] to-[#4B6FED] font-bold whitespace-nowrap"
        >
          {targets[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

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

export default function HomeClient() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only scroll animations
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: isMounted ? targetRef : undefined,
    offset: ["start start", "end start"]
  });

  // Using scrollYProgress for animations - only when mounted
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={targetRef} className="relative flex flex-col min-h-screen bg-[#0D1117] text-white overflow-hidden">
      {/* Enhanced Animated Background */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden"
        style={{ y: isMounted ? y : 0 }}
      >
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#1A1B2E]" />

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(75, 111, 237, 0.35) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(138, 99, 244, 0.35) 0%, transparent 30%)',
            animation: 'pulse 15s ease-in-out infinite alternate',
          }} />

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Animated Particles - using static positions to avoid hydration mismatch */}
          {[
            { left: '10%', top: '20%', size: 3, delay: 0 },
            { left: '25%', top: '40%', size: 4, delay: 1 },
            { left: '40%', top: '15%', size: 2, delay: 2 },
            { left: '55%', top: '60%', size: 5, delay: 0.5 },
            { left: '70%', top: '30%', size: 3, delay: 1.5 },
            { left: '85%', top: '50%', size: 4, delay: 2.5 },
            { left: '15%', top: '70%', size: 2, delay: 3 },
            { left: '45%', top: '80%', size: 3, delay: 0.8 },
            { left: '75%', top: '75%', size: 4, delay: 1.8 },
            { left: '90%', top: '10%', size: 2, delay: 2.8 },
          ].map((particle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]"
              style={{
                width: particle.size + 'px',
                height: particle.size + 'px',
                left: particle.left,
                top: particle.top,
                opacity: 0.6,
                filter: 'blur(1px)',
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
            />
          ))}

          {/* Glowing Orbs */}
          <div className="absolute w-64 h-64 rounded-full bg-[#4B6FED]/10 blur-3xl -left-32 -top-32" />
          <div className="absolute w-96 h-96 rounded-full bg-[#8A63F4]/10 blur-3xl -right-48 -bottom-48" />
        </div>

        {/* CSS Animation Keyframes */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0% { opacity: 0.3; transform: scale(1); }
              100% { opacity: 0.6; transform: scale(1.1); }
            }
          `
        }} />
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20 pb-12 z-10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/80 via-[#0D1117]/90 to-[#0D1117]/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#4B6FED]/10 via-transparent to-transparent w-full h-full"></div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 relative z-10">
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
              <span>AI Native Development Platform</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6 leading-tight"
            >
              The <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#8AB4FF] to-[#4B6FED]">
                  AI Native
                </span>
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] rounded-full"
                  initial={{ scaleX: 0, opacity: 0.7 }}
                  animate={{
                    scaleX: 1,
                    opacity: 0.7,
                    transition: {
                      duration: 0.8,
                      delay: 0.3,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  }}
                />
              </span> Studio
              <br />
              <span className="text-3xl md:text-5xl lg:text-6xl">
                For <AnimatedTargetText />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Empower your team with memory-powered agents, blazing-fast infrastructure, and a quantum-accelerated IDE experience.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.35 }}
            >
              <Link href="/download" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB] text-white shadow-lg hover:shadow-xl hover:shadow-[#4B6FED]/20 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Download AI Native IDE</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
              <a
                href={appConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full group border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5 text-white transition-all duration-300"
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  <span className="relative z-10">View on GitHub</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </a>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-6 opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="flex items-center text-sm text-gray-400">
                <div className="flex -space-x-2 mr-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4B6FED] to-[#8A63F4] border-2 border-[#161B22]" />
                  ))}
                </div>
                <span>Trusted by {appConfig.statistics.totalUsers} developers</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Star className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" />
                <span>{appConfig.statistics.rating} from {appConfig.statistics.reviewCount} reviews</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FREE Embeddings API Promotion */}
      <section className="py-12 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#4B6FED]/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#8A63F4]/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-[#4B6FED]/20 to-[#8A63F4]/20 border-2 border-[#4B6FED]/40 text-[#8AB4FF] text-sm font-bold mb-8 shadow-lg shadow-[#4B6FED]/20">
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
              <span>LIMITED TIME OFFER</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Get Started with
              </span>
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#4B6FED] via-[#8A63F4] to-[#D04BF4]">
                  FREE Embeddings API
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-[#4B6FED] via-[#8A63F4] to-[#D04BF4] rounded-full blur-sm"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.98, 1.02, 0.98]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </span>
            </h2>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Build powerful AI applications with our production-ready embeddings API.
              <span className="text-[#8AB4FF] font-semibold"> No credit card required.</span>
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                'OpenAI-compatible',
                'Sub-second latency',
                'Unlimited queries'
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="px-4 py-2 rounded-full bg-[#1C2128] border border-[#4B6FED]/30 text-gray-300 text-sm font-medium"
                >
                  {feature}
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-[#4B6FED] via-[#8A63F4] to-[#D04BF4] hover:shadow-2xl hover:shadow-[#4B6FED]/40 text-white text-lg px-8 py-6 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Start Building Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
              <a
                href="https://zerodb.ainative.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full group border-2 border-[#4B6FED]/40 hover:border-[#4B6FED] bg-transparent hover:bg-[#4B6FED]/10 text-white text-lg px-8 py-6 transition-all duration-300"
                >
                  <Database className="mr-2 h-5 w-5" />
                  <span>Explore ZeroDB</span>
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-2" fill="currentColor" />
                <span>Production-ready</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-[#8AB4FF] mr-2" />
                <span>Trusted by developers</span>
              </div>
              <div className="flex items-center">
                <Database className="w-4 h-4 text-[#8A63F4] mr-2" />
                <span>Enterprise-grade</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ZeroDB Platform Promotion */}
      <section className="py-12 bg-[#161B22] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4B6FED]/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8A63F4]/50 to-transparent"></div>
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#4B6FED]/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#D04BF4]/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#8A63F4]/10 border border-[#8A63F4]/30 text-[#D4B4FF] text-sm font-medium mb-4">
              <Database className="w-4 h-4 mr-2" />
              <span>ZeroDB Platform</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                The AI-Native Database
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8A63F4] to-[#D04BF4]">
                Built for Modern AI Apps
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Vector search, embeddings, and quantum-accelerated operations in one unified platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Database,
                title: 'Vector Database',
                desc: 'Store and search embeddings with sub-second semantic similarity queries at scale.',
                gradient: 'from-[#4B6FED] to-[#8A63F4]',
              },
              {
                icon: Sparkles,
                title: 'Embeddings API',
                desc: 'OpenAI-compatible embeddings API with 1536 dimensions and unlimited queries.',
                gradient: 'from-[#8A63F4] to-[#D04BF4]',
              },
              {
                icon: BrainCog,
                title: 'Agent Memory',
                desc: 'Persistent context storage for AI agents with automatic memory management.',
                gradient: 'from-[#D04BF4] to-[#4B6FED]',
              },
            ].map(({ icon: Icon, title, desc, gradient }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-[#0D1117] rounded-2xl p-8 border border-[#2D333B]/50 hover:border-[#8A63F4]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#8A63F4]/20"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradient} rounded-t-2xl`}></div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}/10 w-fit mb-6`}>
                  <Icon className="h-8 w-8" style={{ color: '#8A63F4' }} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* ZeroDB CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <a
              href="https://zerodb.ainative.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-[#8A63F4] to-[#D04BF4] hover:shadow-2xl hover:shadow-[#8A63F4]/40 text-white text-lg px-10 py-6 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <Database className="mr-2 h-5 w-5" />
                  Learn More About ZeroDB
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-12 bg-[#0D1117] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#4B6FED]/5 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Everything You Need</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Platform Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools and infrastructure for next-gen AI development
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Cpu,
                title: 'AI-Powered IDE',
                desc: 'Context-aware code suggestions, refactoring, and test generation in real-time with intelligent auto-completion and error detection.',
                gradient: 'from-[#4B6FED] to-[#8A63F4]',
                link: '/download',
              },
              {
                icon: Database,
                title: 'ZeroDB',
                desc: 'AI-native vector database with semantic search, embeddings API, and quantum-accelerated operations. Store and query embeddings at scale.',
                gradient: 'from-[#8A63F4] to-[#D04BF4]',
                link: 'https://zerodb.ainative.studio',
              },
              {
                icon: Sparkles,
                title: 'AI Kit - NPM Packages',
                desc: '14 production-ready NPM packages for building AI applications with React, Vue, Svelte, and more. Type-safe and framework-agnostic.',
                gradient: 'from-[#D04BF4] to-[#4B6FED]',
                link: '/ai-kit',
              },
              {
                icon: Users,
                title: 'AINative Community',
                desc: 'Join our vibrant community with tutorials, blog posts, project showcases, events, and resources. Connect, learn, and share with fellow AI developers.',
                gradient: 'from-[#4B6FED] to-[#8A63F4]',
                link: '/community',
              },
            ].map(({ icon: Icon, title, desc, gradient, link }, i) => {
              const isExternal = link.startsWith('http');
              const card = (
                <motion.div
                  key={title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{
                    y: -5,
                    boxShadow: '0 20px 25px -5px rgba(75, 111, 237, 0.1), 0 10px 10px -5px rgba(75, 111, 237, 0.04)'
                  }}
                  className={`group relative bg-[#161B22] rounded-2xl p-8 border border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all duration-300 overflow-hidden ${link ? 'cursor-pointer' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#4B6FED]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}/10 w-fit mb-6`}>
                      <Icon className="h-6 w-6 text-[#4B6FED]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white flex items-center">
                      {title}
                      {link && <ChevronRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                    </h3>
                    <p className="text-gray-400">{desc}</p>
                  </div>
                </motion.div>
              );

              if (isExternal) {
                return (
                  <a key={title} href={link} target="_blank" rel="noopener noreferrer">
                    {card}
                  </a>
                );
              }
              return <Link key={title} href={link}>{card}</Link>;
            })}
          </div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/products" className="inline-block">
              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5 text-white transition-all duration-300 px-8 py-6 text-lg"
              >
                <span className="relative z-10">Explore All Features</span>
                <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Our Platform */}
      <section className="py-12 bg-gradient-to-b from-[#0D1117] to-[#161B22] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#4B6FED]/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#8A63F4]/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 relative">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Why Choose Our Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of AI development with our cutting-edge platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BrainCog,
                title: 'Memory-Powered Agents',
                desc: 'Context-aware agents that remember your workflow and accelerate productivity.',
                link: '/blog',
                gradient: 'from-[#4B6FED] to-[#8A63F4]',
              },
              {
                icon: GitBranch,
                title: 'Multi-Agent Collaboration',
                desc: 'Chain expert LLM agents to complete advanced software tasks together.',
                link: '/agent-swarm',
                gradient: 'from-[#8A63F4] to-[#D04BF4]',
              },
              {
                icon: BarChart2,
                title: 'Quantum Speed Scaling',
                desc: 'Experience near-instant inference and execution with enterprise scaling.',
                link: '/blog',
                gradient: 'from-[#D04BF4] to-[#4B6FED]',
              },
            ].map(({ icon: Icon, title, desc, link, gradient }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -10 }}
                className="group relative bg-[#1C2128]/70 backdrop-blur-sm rounded-2xl p-8 border border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4B6FED]/10"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} rounded-t-2xl`}></div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}/10 w-fit mb-6`}>
                  <Icon className="h-8 w-8 text-[#4B6FED]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
                <p className="text-gray-400 mb-6">{desc}</p>
                <Link
                  href={link}
                  className="inline-flex items-center group-hover:text-[#4B6FED] text-sm font-medium transition-colors duration-300"
                >
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
