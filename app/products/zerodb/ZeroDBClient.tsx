'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  Database,
  Search,
  Zap,
  Shield,
  Code,
  Cloud,
  ArrowRight,
  Check,
  Copy,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const features = [
  {
    icon: Database,
    title: 'Vector Storage',
    description:
      'Store billions of high-dimensional vectors with automatic indexing and compression for optimal performance.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description:
      'Find similar content using meaning, not keywords. Perfect for RAG applications and recommendation systems.',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    description:
      'Sub-millisecond query latency with intelligent caching and optimized similarity algorithms.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'SOC 2 compliant with encryption at rest, in transit, and fine-grained access controls.',
  },
  {
    icon: Code,
    title: 'Developer-First API',
    description:
      'RESTful API and TypeScript SDK designed for seamless integration with modern AI applications.',
  },
  {
    icon: Cloud,
    title: 'Fully Managed',
    description:
      'No infrastructure to manage. Automatic scaling, backups, and 99.99% uptime SLA.',
  },
];

const codeExample = `import { ZeroDB } from '@ainative/zerodb';

const db = new ZeroDB({
  apiKey: process.env.ZERODB_API_KEY,
});

// Store embeddings
await db.vectors.upsert({
  namespace: 'documents',
  vectors: [
    {
      id: 'doc-1',
      values: embedding, // 1536-dim vector
      metadata: { title: 'Getting Started' },
    },
  ],
});

// Semantic search
const results = await db.vectors.query({
  namespace: 'documents',
  vector: queryEmbedding,
  topK: 10,
  includeMetadata: true,
});`;

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'For hobbyists and experimentation',
    features: [
      '100K embeddings',
      '1M queries/month',
      'Community support',
      '1 project',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing applications',
    features: [
      '10M embeddings',
      'Unlimited queries',
      'Priority support',
      '10 projects',
      'Real-time sync',
    ],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Scale',
    price: '$199',
    period: '/month',
    description: 'For production workloads',
    features: [
      '100M embeddings',
      'Unlimited queries',
      'Dedicated support',
      'Unlimited projects',
      'Custom SLA',
      'SSO & RBAC',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function ZeroDBClient() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-vite-bg text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4B6FED]/10 via-transparent to-[#8A63F5]/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4B6FED]/20 rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8A63F5]/20 rounded-full filter blur-3xl" />

        <div className="max-w-screen-xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4B6FED]/10 border border-[#4B6FED]/30 rounded-full mb-6">
              <Database className="h-4 w-4 text-[#4B6FED]" />
              <span className="text-sm text-[#4B6FED]">AI-Native Vector Database</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] bg-clip-text text-transparent">
                ZeroDB
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
              The vector database built for AI. Store embeddings, power semantic
              search, and build intelligent applications at scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] text-white hover:opacity-90 text-lg px-8"
              >
                <Link href="/signup">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 hover:bg-white/5 text-lg px-8"
              >
                <Link href="/docs/zerodb">View Documentation</Link>
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              custom={2}
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#4B6FED]">
                  &lt;1ms
                </div>
                <div className="text-sm text-gray-400 mt-1">Query Latency</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#4B6FED]">
                  99.99%
                </div>
                <div className="text-sm text-gray-400 mt-1">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#4B6FED]">
                  10B+
                </div>
                <div className="text-sm text-gray-400 mt-1">Vectors Stored</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Modern AI Applications
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to store, search, and manage vector embeddings
              at any scale.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={i}
                className="bg-[#1C2128] rounded-xl p-6 border border-white/10 hover:border-[#4B6FED]/40 transition-all duration-300"
              >
                <div className="p-3 bg-[#4B6FED]/10 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-[#4B6FED]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 px-6 bg-[#0A0D14]">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Developer-First SDK
              </h2>
              <p className="text-gray-400 text-lg mb-6">
                Get started in minutes with our intuitive TypeScript SDK. Store
                embeddings and query with semantic search in just a few lines of
                code.
              </p>
              <ul className="space-y-3">
                {[
                  'TypeScript-first with full type safety',
                  'Auto-batching for bulk operations',
                  'Built-in retry and error handling',
                  'Streaming support for large responses',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#4B6FED]" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#4B6FED] text-[#4B6FED] hover:bg-[#4B6FED]/10"
                >
                  <Link href="/docs/zerodb/sdk">
                    <Terminal className="mr-2 h-4 w-4" />
                    SDK Documentation
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              custom={1}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] rounded-xl opacity-20 blur-xl" />
              <div className="relative bg-[#1C2128] rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-vite-bg border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code className="text-gray-300">{codeExample}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={i}
                className={`
                  relative rounded-2xl p-8
                  ${
                    tier.highlight
                      ? 'bg-gradient-to-b from-[#4B6FED]/20 to-[#1C2128] border-2 border-[#4B6FED]'
                      : 'bg-[#1C2128] border border-white/10'
                  }
                `}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#4B6FED] text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-gray-400 ml-1">{tier.period}</span>
                  )}
                </div>
                <p className="text-gray-400 mb-6">{tier.description}</p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#4B6FED]" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full ${
                    tier.highlight
                      ? 'bg-[#4B6FED] hover:bg-[#3A56D3] text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Link href={tier.name === 'Scale' ? '/contact' : '/signup'}>
                    {tier.cta}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F5]/10 rounded-2xl p-12 border border-[#4B6FED]/20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build with ZeroDB?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of developers building the next generation of AI
            applications with ZeroDB.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] text-white hover:opacity-90"
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 hover:bg-white/5"
            >
              <Link href="/docs/zerodb">Read the Docs</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
