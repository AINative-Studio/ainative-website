'use client';

import {
  Zap, Users, Shield, Terminal, Code, Brain, Bot,
  Network, ArrowRight, CheckCircle2, PenTool as Tool, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { appConfig } from '@/lib/config/app';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const Section = ({ children, title }: { children: React.ReactNode; title?: string }) => (
  <section className="space-y-12">
    {title && (
      <motion.h2
        variants={fadeIn}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="text-3xl font-bold text-center text-white"
      >
        {title}
      </motion.h2>
    )}
    {children}
  </section>
);

const FeatureTag = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={fadeIn}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="bg-[#4B6FED]/10 text-[#4B6FED] px-4 py-2 rounded-full text-sm font-medium"
  >
    {children}
  </motion.div>
);

export default function EnterpriseClient() {
  const calendlyUrl = appConfig.links.calendly;

  return (
    <div className="full-width-section bg-vite-bg text-white pt-36 pb-28">
      <div className="max-w-6xl mx-auto px-4 space-y-28">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-6"
        >
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-white">
            Quantum-Enabled AI for Enterprise Teams
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Accelerate software delivery with secure, memory-native AI that works across your SDLC.
          </p>
          <div className="flex justify-center gap-4 pt-2 flex-wrap">
            <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white shadow-md">
                Schedule a Demo
              </Button>
            </a>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/5">
                View Plans
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Outcome Benefits */}
        <Section title="Business Impact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Boost Output', desc: 'Accelerate PRs and reduce delivery lag by 40%+' },
              { icon: Users, title: 'Faster Onboarding', desc: 'Ramp new engineers with contextual agents' },
              { icon: Shield, title: 'Built for Compliance', desc: 'Full audit trails, RBAC, and hybrid deployment' }
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} custom={i} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Card className="bg-[#1C2128]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:shadow-lg transition-all">
                  <CardHeader>
                    <Icon className="h-7 w-7 text-[#4B6FED] mb-3" />
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-gray-400">{desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Cody Can Handle Tags */}
        <Section title="Cody Can Handle">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Code Reviews', 'Refactoring', 'Task Planning', 'Test Generation',
              'Debugging', 'Language Translation', 'Code Docs', 'Semantic Search',
              'Enforce Standards', 'Agent Reasoning'
            ].map((text, i) => <FeatureTag key={i}>{text}</FeatureTag>)}
          </div>
        </Section>

        {/* Deployment Options */}
        <Section title="Deployment Options">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Terminal, title: 'Cody IDE', desc: 'Full-featured AI IDE with memory & coordination' },
              { icon: Code, title: 'Plugin Mode', desc: 'Lightweight VS Code plugin (JetBrains coming)' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Card className="bg-[#1C2128]/80 border border-white/10 rounded-xl p-6 hover:border-[#4B6FED] transition-all">
                  <CardHeader>
                    <Icon className="h-7 w-7 text-[#4B6FED] mb-3" />
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-gray-400">{desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Security Note */}
        <Section title="Enterprise-Grade Security">
          <Card className="bg-[#1C2128]/80 border border-[#4B6FED]/50 p-6 rounded-xl shadow-sm backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-7 w-7 text-[#4B6FED]" />
                <CardTitle>Self-hosted & Secure</CardTitle>
              </div>
              <CardDescription className="text-gray-400 space-y-2 mt-2">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    Self-hosted or hybrid deployment (air-gapped optional)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    No third-party data sharing or vendor lock-in
                  </li>
                </ul>
              </CardDescription>
            </CardHeader>
          </Card>
        </Section>

        {/* Platform Capabilities */}
        <Section title="Platform Capabilities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Brain, title: 'Context Engine', desc: 'Semantic memory + quantum reasoning' },
              { icon: Bot, title: 'Purpose-Trained Agents', desc: 'Agents tuned to your codebase structure' },
              { icon: Tool, title: 'Tool Orchestration', desc: 'Attach autonomous workflows via modular tools' },
              { icon: Eye, title: 'Human Intent Tracking', desc: 'Adapt to dev actions and patterns in real-time' }
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Card className="bg-[#1C2128]/80 border border-white/10 p-6 rounded-xl hover:border-[#4B6FED] transition-all">
                  <CardHeader>
                    <Icon className="h-7 w-7 text-[#4B6FED] mb-3" />
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-gray-400">{desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <Section>
          <Card className="bg-gradient-to-br from-[#4B6FED]/10 to-[#4B6FED]/5 border border-white/10 p-10 rounded-2xl shadow-sm backdrop-blur-md text-center">
            <CardHeader>
              <Network className="h-10 w-10 text-[#4B6FED] mx-auto mb-4" />
              <CardTitle className="text-2xl">Quantum Infrastructure</CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Cody AI orchestrates agents with QNN context resolution and real-time collaborative memory sync.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-[#4B6FED] hover:bg-[#3A56D3] mt-6 text-white text-lg">
                  Book Your Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </Section>

      </div>
    </div>
  );
}
