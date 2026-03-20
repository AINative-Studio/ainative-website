
'use client';
import React from "react";

import {
  Zap, Users, Shield, Brain, Bot,
  Network, ArrowRight, CheckCircle2, MapPin, Layers, Cpu, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { appConfig } from '@/lib/config/app';

const AGENCY_URL = 'https://agency.ainative.studio';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const Section = ({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) => (
  <section className="space-y-12">
    {title && (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="text-center space-y-3"
      >
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-gray-400 text-lg max-w-2xl mx-auto">{subtitle}</p>}
      </motion.div>
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
  const agencyContactUrl = `${AGENCY_URL}/contact`;

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
          <div className="inline-flex items-center gap-2 bg-[#4B6FED]/10 border border-[#4B6FED]/30 rounded-full px-4 py-1.5 text-sm text-[#4B6FED] font-medium mb-2">
            <Cpu className="h-4 w-4" />
            GTC 2026 — Jensen Huang
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] via-white to-white leading-tight">
            Every Enterprise Needs<br />an OpenClaw Strategy
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
            The agentic AI era is here. AINative is the partner that helps you design, build, and deploy your enterprise agentic AI strategy — from NemoClaw pipelines to ADE agent deployment experts embedded inside your teams.
          </p>
          <div className="flex justify-center gap-4 pt-2 flex-wrap">
            <a href={agencyContactUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white shadow-md">
                Get Your OpenClaw Strategy <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href={`${AGENCY_URL}/services`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/5">
                View Consulting Services
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Why OpenClaw Section */}
        <Section
          title="Why OpenClaw, Why Now"
          subtitle="At GTC 2026, Jensen Huang declared that every company must develop an agentic AI strategy or risk being left behind. OpenClaw is the framework — and AINative is the team that makes it real for your organization."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'The Moment is Now',
                desc: 'Agentic AI is no longer experimental. Enterprises that deploy AI agents across their workflows in 2025–2026 will define the competitive landscape for a decade.'
              },
              {
                icon: Network,
                title: 'NemoClaw Pipelines',
                desc: 'We architect NemoClaw-based agentic pipelines that coordinate multi-model reasoning, memory, and tool use across your existing infrastructure.'
              },
              {
                icon: Brain,
                title: 'ADE Agent Deployment Experts',
                desc: 'Our ADE-certified engineers know how to operationalize AI agents at enterprise scale — not just prototype them.'
              }
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} custom={i} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Card className="bg-[#1C2128]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#4B6FED]/50 hover:shadow-lg transition-all h-full">
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

        {/* What We Build Tags */}
        <Section title="What Your OpenClaw Strategy Covers">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Agentic Workflow Design', 'NemoClaw Orchestration', 'Multi-Agent Coordination',
              'Memory-Native Infrastructure', 'Tool & API Integration', 'Human-in-the-Loop Controls',
              'Agent Observability', 'Compliance & Governance', 'Model Selection & Fine-Tuning',
              'Enterprise AI Roadmap'
            ].map((text, i) => <FeatureTag key={i}>{text}</FeatureTag>)}
          </div>
        </Section>

        {/* Consulting Services Section */}
        <Section
          title="Consulting Services"
          subtitle="Everything you need to move from AI curiosity to AI-native operations."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Layers,
                title: 'Agentic Strategy & Roadmap',
                desc: 'We map your organization\'s AI readiness, identify the highest-impact agentic use cases, and build a 90-day activation plan.',
                href: `${AGENCY_URL}/services`
              },
              {
                icon: Users,
                title: 'Forward Deployed Engineers',
                desc: 'We embed experienced AI engineers directly inside your org. They work alongside your team, ship production agents, and transfer knowledge.',
                href: `${AGENCY_URL}/how-we-work`
              },
              {
                icon: Bot,
                title: 'Agent Development & Deployment',
                desc: 'From custom agent architectures to full ADE-certified deployment pipelines — we build and ship agents that work in your real environment.',
                href: `${AGENCY_URL}/services`
              },
              {
                icon: Shield,
                title: 'Governance & Risk Frameworks',
                desc: 'Enterprise AI requires guardrails. We design human-in-the-loop checkpoints, audit trails, and compliance frameworks for regulated industries.',
                href: `${AGENCY_URL}/services`
              }
            ].map(({ icon: Icon, title, desc, href }, i) => (
              <motion.div key={i} custom={i} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full group">
                  <Card className="bg-[#1C2128]/80 border border-white/10 rounded-xl p-6 hover:border-[#4B6FED] transition-all h-full cursor-pointer">
                    <CardHeader>
                      <Icon className="h-7 w-7 text-[#4B6FED] mb-3" />
                      <CardTitle className="group-hover:text-[#4B6FED] transition-colors">{title}</CardTitle>
                      <CardDescription className="text-gray-400">{desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-[#4B6FED] text-sm font-medium flex items-center gap-1">
                        Learn more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Forward Deployed Engineers Section */}
        <Section title="Forward Deployed Engineers">
          <Card className="bg-[#1C2128]/80 border border-[#4B6FED]/40 p-8 rounded-2xl shadow-sm backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <MapPin className="h-7 w-7 text-[#4B6FED]" />
                  <h3 className="text-xl font-bold text-white">We Embed Inside Your Org</h3>
                </div>
                <p className="text-gray-400">
                  Rather than handing over a deck, our forward deployed engineers sit with your teams. They pair with your developers, integrate with your existing systems, and build agents that reflect your actual workflows — not a generic template.
                </p>
                <ul className="space-y-3">
                  {[
                    'On-site or remote embed (weekly syncs + async)',
                    'Direct integration with your codebase and tooling',
                    'ADE-certified agent deployment from day one',
                    'Knowledge transfer and internal capability building',
                    'Ongoing support and iteration post-launch',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href={`${AGENCY_URL}/how-we-work`} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white mt-2">
                    See How We Work <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
              <div className="space-y-4">
                <div className="bg-[#0D1117] rounded-xl p-5 border border-white/10 space-y-3">
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Engagement Model</p>
                  {[
                    { label: 'Strategy Sprint', value: '2-week discovery + roadmap' },
                    { label: 'Build Phase', value: 'Agent development & deployment' },
                    { label: 'Embed Mode', value: 'Engineer(s) inside your org' },
                    { label: 'Scale', value: 'Ongoing ADE expert support' },
                  ].map(({ label, value }, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* About the Venture Studio */}
        <Section
          title="About AINative Agency"
          subtitle="We are an AI venture studio and consulting firm founded by engineers who have shipped AI products at scale. We don't just advise — we build."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: 'AI-Native by Design',
                desc: 'Every engagement starts with first-principles thinking about how AI agents change what\'s possible for your business — not retrofitting old processes.'
              },
              {
                icon: Users,
                title: 'Operator-Founders',
                desc: 'Our team has built and shipped AI products. We bring practitioner-level depth that pure consultancies cannot.'
              },
              {
                icon: MessageSquare,
                title: 'Transparent Process',
                desc: 'No black boxes. Our how-we-work guide is public — you know exactly what to expect from kickoff to deployment.'
              }
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} custom={i} variants={fadeIn} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Card className="bg-[#1C2128]/80 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-[#4B6FED]/50 transition-all h-full">
                  <CardHeader>
                    <Icon className="h-7 w-7 text-[#4B6FED] mb-3" />
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-gray-400">{desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center pt-4"
          >
            <a href={`${AGENCY_URL}/about`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/5">
                Learn About the Venture Studio <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </motion.div>
        </Section>

        {/* Final CTA */}
        <Section>
          <Card className="bg-gradient-to-br from-[#4B6FED]/15 to-[#4B6FED]/5 border border-[#4B6FED]/30 p-10 rounded-2xl shadow-sm backdrop-blur-md text-center">
            <CardHeader>
              <Network className="h-10 w-10 text-[#4B6FED] mx-auto mb-4" />
              <CardTitle className="text-3xl text-white">Ready to Build Your OpenClaw Strategy?</CardTitle>
              <CardDescription className="text-gray-400 text-lg max-w-xl mx-auto mt-3">
                Schedule a call with our team. We'll assess your current AI posture and map out a concrete path to agentic AI deployment inside your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a href={agencyContactUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white text-lg w-full sm:w-auto">
                    Schedule a Strategy Call <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href={`${AGENCY_URL}/services`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/5 text-lg w-full sm:w-auto">
                    View All Services
                  </Button>
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-6">
                Consulting services delivered through{' '}
                <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="text-[#4B6FED] hover:underline">
                  agency.ainative.studio
                </a>
              </p>
            </CardContent>
          </Card>
        </Section>

      </div>
    </div>
  );
}
