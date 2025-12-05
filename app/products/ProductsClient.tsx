'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Workflow, Zap, Rocket,
  CheckCircle2 as CheckCircle, GitBranch as GitBranchIcon,
  Code as CodeIcon, Search as SearchIcon, Bug as BugIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
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

const features = [
  {
    title: 'Code Search',
    description: 'Semantic search powered by quantum-enhanced neural networks that understands your intent, not just syntax.',
    icon: SearchIcon,
    gradient: 'from-blue-500 to-cyan-500',
    completed: true
  },
  {
    title: 'Refactoring',
    description: 'Intelligent code restructuring with deep context awareness and dependency mapping.',
    icon: GitBranchIcon,
    gradient: 'from-purple-500 to-pink-500',
    completed: true
  },
  {
    title: 'Debugging',
    description: 'Advanced error detection, root cause analysis, and automated fixes powered by AI.',
    icon: BugIcon,
    gradient: 'from-rose-500 to-pink-500',
    completed: true
  },
  {
    title: 'Repo Understanding',
    description: 'Deep codebase analysis, documentation, and visualization of complex architectures.',
    icon: CodeIcon,
    gradient: 'from-emerald-500 to-teal-500',
    completed: true
  },
  {
    title: 'Checkpoints',
    description: 'Automated versioning, rollback, and experiment tracking for your development workflow.',
    icon: CheckCircle,
    gradient: 'from-amber-500 to-orange-500',
    completed: true
  },
  {
    title: 'CI/CD Integration',
    description: 'Seamless integration with your deployment pipeline for automated testing and deployment.',
    icon: Workflow,
    gradient: 'from-indigo-500 to-blue-500',
    completed: true
  },
];

const stats = [
  { value: '10x', label: 'Faster Development', description: 'Accelerate your coding workflow' },
  { value: '99.9%', label: 'Accuracy', description: 'Precise code suggestions' },
  { value: '24/7', label: 'AI Assistance', description: 'Always available to help' },
];

export default function ProductsClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-[#0D1117] text-white font-sans min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0A0D14] to-[#0D1117]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]" />
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
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Zap className="h-4 w-4 mr-2" />
            Introducing AI-Powered Development Tools
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Supercharge Your Development Workflow
          </motion.h1>

          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Harness the power of AI to write better code, faster. Our suite of developer tools helps you focus on what matters most - building amazing products.
          </motion.p>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href="/signup"
              className="relative inline-flex items-center justify-center group"
            >
              <Button
                className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg px-8 py-6 rounded-xl font-medium transition-all duration-300 transform group-hover:scale-105 shadow-lg group-hover:shadow-blue-500/30"
                size="lg"
              >
                <span className="flex items-center">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Button>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10"></span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-gradient-to-br from-[#1C2128] to-[#0F1319] p-8 rounded-2xl border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
              variants={fadeIn}
              custom={index}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                {stat.value}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{stat.label}</h3>
              <p className="text-gray-400">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
              Powerful Features for Modern Developers
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to build, test, and deploy better software, faster.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group relative h-full"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                custom={index}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                <Card className="h-full bg-[#1C2128]/70 backdrop-blur-sm border border-gray-800/50 group-hover:border-blue-500/30 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-blue-500/10">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient} bg-opacity-10`}>
                      <feature.icon className={`h-6 w-6 text-current ${feature.gradient.replace('from-', 'text-').replace(' to-', '-to-')}`} aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{feature.description}</p>
                    {feature.completed && (
                      <div className="mt-4 flex items-center text-sm text-green-400">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Available Now
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          className="relative rounded-2xl overflow-hidden p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />

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
                variant="outline"
                className="text-lg px-8 py-6 rounded-xl border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1"
                asChild
              >
                <a href="https://calendly.com/seedlingstudio/" target="_blank" rel="noopener noreferrer">
                  Schedule a Demo
                </a>
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
