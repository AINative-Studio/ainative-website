'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Brain, Cpu, Code, GitBranch,
  Database, Network, CheckCircle2,
  ChevronLeft, ChevronRight, Star, Rocket,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePageViewTracking } from '@/hooks/useConversionTracking';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

const testimonials = [
  {
    quote: "AINative Studio has revolutionized our development workflow. The quantum-powered features are game-changing.",
    author: "Sarah Johnson",
    role: "CTO at TechCorp",
    rating: 5
  },
  {
    quote: "The multi-agent collaboration is unlike anything we've used before. It's like having an entire team of senior developers.",
    author: "Michael Chen",
    role: "Lead Developer at InnovateX",
    rating: 5
  },
  {
    quote: "The speed and accuracy of the code suggestions have cut our development time in half.",
    author: "Emma Davis",
    role: "Engineering Manager at DevSquad",
    rating: 5
  }
];

const techStack = [
  { name: 'Quantum Neural Networks', icon: Brain },
  { name: 'Multi-Agent Systems', icon: GitBranch },
  { name: 'Context-Aware AI', icon: Code },
  { name: 'Real-time Collaboration', icon: Network },
  { name: 'Automated Testing', icon: CheckCircle2 },
];

export default function ProductsEnhancedClient() {
  // Conversion tracking
  usePageViewTracking();

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [stats, setStats] = useState([
    { value: 0, max: 98, label: 'Code Completion Accuracy' },
    { value: 0, max: 10, label: 'Development Speed' },
    { value: 0, max: 99, label: 'Bug Detection' },
  ]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setActiveTestimonial(prev => (prev + 1) % 3);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Animate stats
  useEffect(() => {
    const timers = stats.map((stat, i) => {
      return setTimeout(() => {
        setStats(prev => {
          const newStats = [...prev];
          newStats[i] = { ...newStats[i], value: stat.max };
          return newStats;
        });
      }, i * 200);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [stats]);

  return (
    <div className="bg-vite-bg text-white font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0A0D14] to-[#0D1117]">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#4B6FED]/10"
              initial={{
                x: Math.random() * 100 + 'vw',
                y: Math.random() * 100 + 'vh',
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                opacity: 0.1 + Math.random() * 0.3,
              }}
              animate={{
                x: ['0%', '50%', '0%'],
                y: ['0%', '30%', '0%'],
                rotate: [0, 360],
              }}
              transition={{
                duration: 20 + Math.random() * 20,
                repeat: Infinity,
                ease: 'linear',
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-32 space-y-32">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          <motion.div
            className="absolute -top-20 -left-20 w-40 h-40 bg-[#4B6FED]/20 rounded-full filter blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
            Cody IDE
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The world's first AI-native development environment powered by quantum neural networks.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#4B6FED]/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl border-gray-700 hover:bg-gray-800/50 hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Link href="/contact?subject=demo">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch Demo
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group relative bg-gradient-to-br from-[#1C2128] to-[#0F1319] p-8 rounded-2xl border border-gray-800/50 hover:border-[#4B6FED]/50 transition-all duration-500 h-full flex flex-col"
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#4B6FED]/5 to-[#8A63F4]/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="text-5xl md:text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
                    {stat.value}
                    <span className="text-3xl md:text-4xl text-[#4B6FED]">%</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold text-white mb-4">
                    {stat.label}
                  </h3>

                  <div className="mt-auto pt-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>0%</span>
                      <span>{stat.max}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-800/80 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] rounded-full shadow-[0_0_10px_rgba(75,111,237,0.4)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.15,
                          type: 'spring',
                          damping: 10,
                          stiffness: 100
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Core Capabilities */}
        <section className="space-y-14 relative z-10">
          <motion.h2
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            Core Capabilities
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Multi-Agent Orchestration',
                desc: 'Coordinate multiple AI agents for complex development tasks with shared context and memory.',
                gradient: 'from-[#4B6FED] to-[#8A63F4]'
              },
              {
                icon: Database,
                title: 'Context-Aware Memory',
                desc: 'Persistent memory system that understands your codebase and development patterns.',
                gradient: 'from-[#8A63F4] to-[#D04BF4]'
              },
              {
                icon: Cpu,
                title: 'Quantum-Enhanced Hooks',
                desc: 'React hooks supercharged with quantum computing capabilities for unprecedented performance.',
                gradient: 'from-[#D04BF4] to-[#4B6FED]'
              },
            ].map(({ icon: Icon, title, desc, gradient }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                <Card className="bg-[#1C2128]/70 backdrop-blur-sm border border-white/10 hover:border-[#4B6FED]/40 transition-all duration-300 h-full flex flex-col">
                  <CardHeader className="space-y-4 flex-1">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}/10 w-fit`}>
                      <Icon className={`h-8 w-8 text-gradient ${gradient}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                    <CardDescription className="text-gray-400">{desc}</CardDescription>
                    <div className="mt-auto pt-4">
                      <Button variant="ghost" className="group-hover:text-[#4B6FED] p-0 h-auto" asChild>
                        <Link href="/features">
                          Learn more
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack Visualization */}
        <section className="relative z-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-2xl h-64 mx-auto rounded-full bg-gradient-to-r from-[#4B6FED] via-[#8A63F4] to-[#D04BF4] opacity-20 blur-3xl" />
            </div>
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
                  Powered by Cutting-Edge Technology
                </h2>
                <p className="text-gray-400 text-lg">
                  Our platform leverages the latest advancements in AI and quantum computing to deliver unparalleled performance and capabilities.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {techStack.map((tech, i) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-3 p-4 bg-[#1C2128]/50 backdrop-blur-sm rounded-lg border border-white/5 hover:border-[#4B6FED]/30 transition-colors"
                    >
                      <tech.icon className="h-5 w-5 text-[#4B6FED]" />
                      <span className="text-sm font-medium">{tech.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-[#4B6FED] to-[#D04BF4] rounded-2xl opacity-20 blur-xl" />
                <div className="relative bg-[#1C2128] p-1 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="h-6 bg-vite-bg flex items-center px-3">
                    <div className="flex space-x-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="p-4 font-mono text-sm text-gray-300">
                    <div className="text-purple-400">import</div>
                    <div className="text-blue-400">const</div>
                    <div className="text-green-400">function</div>
                    <div className="text-yellow-400">return</div>
                    <div className="text-pink-400">class</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative z-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Developers</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Join thousands of developers who have transformed their workflow with AINative Studio</p>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-between z-10 px-4">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
                }}
                className="p-2 rounded-full bg-[#1C2128] border border-white/10 hover:bg-[#4B6FED]/20 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-[#4B6FED] hover:bg-[#3A5BD9] transition-colors"
                aria-label={isPlaying ? 'Pause rotation' : 'Play rotation'}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveTestimonial(prev => (prev + 1) % testimonials.length);
                }}
                className="p-2 rounded-full bg-[#1C2128] border border-white/10 hover:bg-[#4B6FED]/20 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="relative h-64 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="max-w-3xl mx-auto bg-[#1C2128]/70 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonials[activeTestimonial].rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <blockquote className="text-xl md:text-2xl font-medium text-center mb-6">
                      "{testimonials[activeTestimonial].quote}"
                    </blockquote>
                    <div className="text-center">
                      <div className="font-semibold">{testimonials[activeTestimonial].author}</div>
                      <div className="text-sm text-gray-400">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveTestimonial(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-colors ${index === activeTestimonial ? 'bg-[#4B6FED] w-6' : 'bg-gray-700'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeIn}
          className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] opacity-10" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#4B6FED] opacity-20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-[#8A63F4] opacity-20 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Development Workflow?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of developers who are building the future with AINative Studio.
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
                asChild
                variant="outline"
                className="text-lg px-8 py-6 rounded-xl border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link href="/contact?subject=demo">
                  Schedule a Demo
                </Link>
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
