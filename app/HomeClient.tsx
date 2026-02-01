'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, Variants, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  ArrowRight,
  Sparkles,
  GitBranch
} from 'lucide-react';
import {
  DatabaseIcon,
  UsersIcon,
  CodeIcon,
  ChevronRightIcon
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/lib/config/app';
import { useRef, useEffect, useState } from 'react';

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
          className="inline-block text-[#4B6FED] font-bold whitespace-nowrap"
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
    <div ref={targetRef} className="relative flex flex-col min-h-screen bg-vite-bg text-white overflow-hidden pt-24 md:pt-32">
      {/* Enhanced Animated Background */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden"
        style={{ y: isMounted ? y : 0 }}
      >
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#1A1B2E]" />

        {/* Simple Background */}
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Subtle Accent */}
          <div className="absolute w-64 h-64 rounded-full bg-[#4B6FED]/5 blur-3xl -left-32 -top-32" />
          <div className="absolute w-96 h-96 rounded-full bg-[#4B6FED]/5 blur-3xl -right-48 -bottom-48" />
        </div>

        {/* CSS Animation Keyframes */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0% { opacity: 0.3; transform: scale(1); }
              100% { opacity: 0.6; transform: scale(1.1); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
          `
        }} />
      </motion.div>

      {/* Hero Section */}
      <section className="full-width-section relative min-h-[70vh] flex items-center justify-center pb-12 z-10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/80 via-[#0D1117]/90 to-[#0D1117]/80"></div>
          {/* Center glow effect - matching Vite design */}
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
                  className="absolute bottom-0 left-0 w-full h-1 bg-[#4B6FED] rounded-full"
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
                  className="w-full group relative overflow-hidden bg-[#4B6FED] hover:bg-[#3A56D3] text-white shadow-lg hover:shadow-xl hover:shadow-[#4B6FED]/20 transition-all duration-300 transform hover:-translate-y-0.5"
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
                  <ChevronRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </a>
            </motion.div>

          </motion.div>
        </div>

        {/* Animated Grid Background */}
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmZmZmYwMyI+PC9yZWN0PjxwYXRoIGQ9Ik0yMCAxMGMwLTUuNTIzIDQuNDc3LTEwIDEwLTEwczEwIDQuNDc3IDEwIDEwLTQuNDc3IDEwLTEwIDEwLTEwLTQuNDc3LTEwLTEweiIgZmlsbD0iIzRCN0ZFOCI+PC9wYXRoPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSI+PC9yZWN0Pjwvc3ZnPg==')] opacity-[0.03]"></div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section - Clean & Simple */}
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
              Everything you need to build AI-powered applications
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Production-ready tools and infrastructure for modern AI development
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Cpu,
                title: 'AI Native IDE',
                desc: 'Context-aware code editor with intelligent suggestions and real-time refactoring',
                link: '/download',
                isLucideIcon: true,
              },
              {
                icon: DatabaseIcon,
                title: 'Vector Database',
                desc: 'Store and search embeddings with semantic similarity at scale',
                link: '/products/zerodb',
                isLucideIcon: false,
              },
              {
                icon: CodeIcon,
                title: 'AI Kit Packages',
                desc: '14 NPM packages for React, Vue, Svelte, and framework-agnostic development',
                link: '/ai-kit',
                isLucideIcon: false,
              },
              {
                icon: UsersIcon,
                title: 'Community',
                desc: 'Tutorials, showcases, events, and resources from AI developers worldwide',
                link: '/community',
                isLucideIcon: false,
              },
            ].map(({ icon: Icon, title, desc, link, isLucideIcon }, i) => (
              <Link href={link} key={title}>
                <motion.div
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-[#161B22] rounded-xl p-6 border border-[#2D333B]/50 hover:border-[#4B6FED]/30 transition-all duration-300 cursor-pointer h-full"
                >
                  <div className="mb-4">
                    {isLucideIcon ? (
                      <Icon className="h-8 w-8 text-[#4B6FED]" />
                    ) : (
                      <Icon className="h-8 w-8 text-[#4B6FED]" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="full-width-section-sm bg-gradient-to-b from-[#0D1117] to-[#161B22]">
        <div className="container-custom max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join developers building the next generation of AI applications
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-[#4B6FED] hover:bg-[#3A56D3] text-white shadow-lg hover:shadow-xl hover:shadow-[#4B6FED]/20 transition-all duration-300 px-8 py-6 text-lg"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform duration-300 group-hover:translate-x-1" />
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
