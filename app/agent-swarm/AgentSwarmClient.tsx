'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Upload,
  Bot,
  GitBranch,
  Shield,
  Zap,
  Code,
  Database,
  TestTube,
  Rocket,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Container,
  Lock,
  Cpu,
  Activity,
  FileCode,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingService } from '@/services/pricingService';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

// Real pricing tiers from backend
const pricingTiers = [
  {
    id: 'cody',
    name: 'Cody Agent',
    price: '$499',
    period: '/month',
    desc: 'AI-native full-stack engineer',
    subtitle: 'Cody is your autonomous AI developer: write, refactor, test, and deploy code using TDD/BDD practices. Local or hosted.',
    features: [
      'Full IDE or VS Code plugin',
      'Code context engine',
      'Integrated testing + debugging tools',
      'Hosted model orchestration or local LLMs',
      'Quantum Boost compatible',
      'Memory snapshots + checkpoints',
      'Works with all AINative APIs'
    ],
    cta: 'Subscribe to Cody',
    stripeId: 'cody',
    popular: false,
  },
  {
    id: 'swarm',
    name: 'Agent Swarm',
    price: '$1,199',
    period: '/month',
    desc: 'Multi-agent dev team on demand',
    subtitle: 'A full-stack AI dev team with 6 production-grade agents trained in Semantic Seed Coding Standards. Build autonomously or co-pilot with human devs.',
    features: [
      'CTO/Architect Agent',
      'Frontend, Backend, DevOps, QA & Testing Agents',
      'Built on Cody + Agent Orchestration Layer',
      'Deterministic, test-driven agent workflows',
      'Semantic memory across agents',
      'Multi-agent task routing',
      'All features from Dev Teams and QNN APIs'
    ],
    cta: 'Subscribe to Agent Swarm',
    stripeId: 'swarm',
    popular: true,
  },
];

export default function AgentSwarmClient() {
  const handleSubscribe = async (planId: string, planName: string) => {
    try {
      console.log(`Creating checkout session for: ${planName}`);

      const checkoutSession = await pricingService.createCheckoutSession(planId, {
        successUrl: `${window.location.origin}/billing/success`,
        cancelUrl: `${window.location.origin}/agent-swarm`,
        metadata: {
          plan_name: planName,
          plan_id: planId
        }
      });

      console.log('Checkout session created:', checkoutSession.sessionId);

      // Redirect to Stripe checkout
      window.location.href = checkoutSession.sessionUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
      alert(`Unable to start subscription: ${errorMessage}\n\nPlease try again or contact support.`);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-vite-bg text-white overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#1A1B2E]" />
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(75, 111, 237, 0.35) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(138, 99, 244, 0.35) 0%, transparent 30%)',
        }} />
      </div>

      {/* Hero Section */}
      <section className="full-width-section relative min-h-[80vh] flex items-center justify-center pt-20 pb-12 z-10">
        <div className="container-custom max-w-6xl mx-auto px-4 relative z-10">
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
              <GitBranch className="w-4 h-4 mr-2" />
              <span>Multi-Agent Development Platform</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6 leading-tight"
            >
              Upload Your PRD.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#8AB4FF] to-[#4B6FED]">
                  Let Agent Swarms Build It.
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Specialized AI agents collaborate in isolated microcontainers to transform your requirements into production-ready applications. From architecture to deployment, fully automated.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.35 }}
            >
              <Button
                size="lg"
                onClick={() => handleSubscribe('swarm', 'Agent Swarm')}
                className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB] text-white shadow-lg hover:shadow-xl hover:shadow-[#4B6FED]/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Upload className="mr-2 h-5 w-5" />
                <span className="relative z-10">Subscribe to Agent Swarm</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
              <Link href="/api-reference" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full group border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5 text-white transition-all duration-300"
                >
                  <FileCode className="mr-2 h-4 w-4" />
                  <span>View API Docs</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="full-width-section-md bg-[#161B22]">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Simple Workflow</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              How Agent Swarms Work
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              A streamlined process from requirements to deployment, powered by specialized AI agents
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            {[
              {
                step: '1',
                icon: Upload,
                title: 'Upload PRD',
                desc: 'Submit your Product Requirements Document in any format (PDF, Markdown, Word)',
                color: 'from-[#4B6FED] to-[#8A63F4]',
              },
              {
                step: '2',
                icon: Bot,
                title: 'Agent Analysis',
                desc: 'AI agents parse requirements, identify architecture patterns, and create task breakdown',
                color: 'from-[#8A63F4] to-[#D04BF4]',
              },
              {
                step: '3',
                icon: Container,
                title: 'Team Assembly',
                desc: 'Specialized agents are deployed in isolated microcontainers with role-based permissions',
                color: 'from-[#D04BF4] to-[#4B6FED]',
              },
              {
                step: '4',
                icon: Rocket,
                title: 'Build & Deploy',
                desc: 'Agents collaborate through APIs and tools to build, test, and deploy your application',
                color: 'from-[#4B6FED] to-[#8A63F4]',
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                <div className="relative bg-vite-bg rounded-2xl p-6 border border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all duration-300">
                  <div className={`absolute -top-4 left-6 px-3 py-1 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-sm`}>
                    Step {step.step}
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color}/10 w-fit mb-4 mt-4`}>
                    <step.icon className="h-6 w-6 text-[#8AB4FF]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-[#4B6FED]/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Agents */}
      <section className="full-width-section-md bg-vite-bg">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Meet Your AI Development Team
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Six specialized agents working in harmony, each an expert in their domain
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                name: 'Architect Agent',
                role: 'architect_1',
                desc: 'Designs system architecture, microservices patterns, and technology stack decisions',
                capabilities: ['System Design', 'Tech Stack Selection', 'Scalability Planning'],
                color: 'from-[#4B6FED] to-[#8A63F4]',
              },
              {
                icon: Code,
                name: 'Frontend Agent',
                role: 'frontend_1',
                desc: 'Builds modern UI with React, Vue, or Angular. Handles responsive design and accessibility',
                capabilities: ['React/Vue/Angular', 'Responsive Design', 'Component Libraries'],
                color: 'from-[#8A63F4] to-[#D04BF4]',
              },
              {
                icon: Database,
                name: 'Backend Agent',
                role: 'backend_1',
                desc: 'Creates robust APIs with FastAPI, Express, or Django. Database design and integration',
                capabilities: ['REST/GraphQL APIs', 'Database Design', 'Authentication'],
                color: 'from-[#D04BF4] to-[#4B6FED]',
              },
              {
                icon: Shield,
                name: 'Security Agent',
                role: 'security_1',
                desc: 'Implements security best practices, vulnerability scanning, and compliance checks',
                capabilities: ['Security Audits', 'Vulnerability Scanning', 'Compliance'],
                color: 'from-[#4B6FED] to-[#8A63F4]',
              },
              {
                icon: TestTube,
                name: 'QA Agent',
                role: 'qa_1',
                desc: 'Writes comprehensive tests using Playwright. BDD scenarios and integration testing',
                capabilities: ['E2E Testing', 'BDD Scenarios', 'Performance Testing'],
                color: 'from-[#8A63F4] to-[#D04BF4]',
              },
              {
                icon: Rocket,
                name: 'DevOps Agent',
                role: 'devops_1',
                desc: 'Sets up CI/CD pipelines, containerization, and cloud deployment infrastructure',
                capabilities: ['CI/CD Pipelines', 'Docker/K8s', 'Cloud Deployment'],
                color: 'from-[#D04BF4] to-[#4B6FED]',
              },
            ].map((agent, i) => (
              <motion.div
                key={agent.role}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -10 }}
                className="group relative bg-[#161B22] rounded-2xl p-6 border border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4B6FED]/10"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${agent.color} rounded-t-2xl`}></div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.color}/10 w-fit mb-4`}>
                  <agent.icon className="h-6 w-6 text-[#8AB4FF]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{agent.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{agent.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap) => (
                    <span key={cap} className="px-2 py-1 rounded-full bg-vite-bg text-[#8AB4FF] text-xs">
                      {cap}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="full-width-section-md bg-[#161B22]">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#8A63F4]/10 border border-[#8A63F4]/30 text-[#D4B4FF] text-sm font-medium mb-4">
              <Settings className="w-4 h-4 mr-2" />
              <span>Enterprise Architecture</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Built for Scale & Security
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Production-grade infrastructure with isolation, monitoring, and compliance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Container,
                title: 'Microcontainer Isolation',
                desc: 'Each agent swarm project runs in isolated Docker containers with resource limits and network policies. Complete project isolation ensures security and prevents interference.',
                features: ['Resource Limits', 'Network Isolation', 'Secure Workspaces'],
              },
              {
                icon: Activity,
                title: 'Agent APIs & Tools',
                desc: 'Agents communicate through well-defined REST APIs with 46+ specialized tools including project scaffolding, design tokens, and auto-layout generation.',
                features: ['46+ Tools', 'REST APIs', 'Tool Registry'],
              },
              {
                icon: Lock,
                title: 'MCP Server Integration',
                desc: 'Model Context Protocol servers provide agents with secure access to external services, databases, and APIs with permission-based access control.',
                features: ['Permission-Based', 'Secure Access', 'MCP Protocol'],
              },
              {
                icon: Zap,
                title: 'Real-Time Monitoring',
                desc: 'Track agent performance, task completion, code quality scores, and resource usage in real-time with comprehensive analytics and RLHF feedback.',
                features: ['Live Metrics', 'RLHF Learning', 'Analytics'],
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-vite-bg rounded-2xl p-6 border border-[#2D333B]/50 hover:border-[#8A63F4]/40 transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-[#8A63F4]/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-[#8AB4FF]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((feat) => (
                    <div key={feat} className="flex items-center text-sm text-[#8AB4FF]">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {feat}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="full-width-section-md bg-vite-bg">
        <div className="container-custom max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Choose Your AI Development Partner
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From single agent assistance to full development swarms
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className={`relative bg-[#161B22] rounded-2xl p-8 border ${
                  tier.popular ? 'border-[#4B6FED] shadow-2xl shadow-[#4B6FED]/20' : 'border-[#2D333B]/50'
                } transition-all duration-300 hover:border-[#4B6FED]/60`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] text-white text-sm font-bold">
                    Recommended
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-white">{tier.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8AB4FF] to-[#4B6FED]">
                      {tier.price}
                    </span>
                    <span className="text-gray-400 ml-2">{tier.period}</span>
                  </div>
                  <p className="text-gray-400 text-lg mb-2">{tier.desc}</p>
                  <p className="text-gray-500 text-sm">{tier.subtitle}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-[#4B6FED] mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(tier.stripeId, tier.name)}
                  className={`w-full ${
                    tier.popular
                      ? 'bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]'
                      : 'bg-[#2D3748] hover:bg-[#4B6FED]'
                  } text-white transition-all duration-300`}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="full-width-section-md bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#4B6FED]/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#8A63F4]/20 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container-custom max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Ready to Build with
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] via-[#8A63F4] to-[#D04BF4]">
                AI Agent Swarms?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Subscribe today and start uploading PRDs. Watch specialized AI agents transform your vision into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => handleSubscribe('swarm', 'Agent Swarm')}
                className="group relative overflow-hidden bg-gradient-to-r from-[#4B6FED] via-[#8A63F4] to-[#D04BF4] hover:shadow-2xl hover:shadow-[#4B6FED]/40 text-white text-lg px-10 py-6 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <Users className="mr-2 h-5 w-5" />
                  Subscribe to Agent Swarm - $1,199/mo
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                </span>
              </Button>
              <Link href="/api-reference">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#4B6FED]/40 hover:border-[#4B6FED] bg-transparent hover:bg-[#4B6FED]/10 text-white text-lg px-10 py-6 transition-all duration-300"
                >
                  <FileCode className="mr-2 h-5 w-5" />
                  View Documentation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
