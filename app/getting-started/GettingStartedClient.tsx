'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  ArrowRight,
  Book,
  Code,
  CheckCircle,
  ExternalLink,
  Download,
  Key,
  Database,
  Bot
} from 'lucide-react';
import Link from 'next/link';
import { appConfig } from '@/lib/config/app';

export default function GettingStartedClient() {
  const [copiedCode, setCopiedCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('python');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const installCommands = {
    python: 'pip install ainative-sdk',
    typescript: 'npm install @ainative/sdk',
    go: 'go get github.com/ainative/go-sdk/ainative'
  };

  const quickStartCode = {
    python: `import asyncio
from ainative import AINativeClient

async def main():
    # Initialize client
    client = AINativeClient(
        api_key="your-api-key",
        organization_id="your-org-id"
    )

    # Create a project
    project = await client.zerodb.projects.create(
        name="My First Project",
        description="Getting started with AINative"
    )
    print(f"Created project: {project.id}")

    # Store a memory
    memory = await client.zerodb.memory.create(
        content="AINative makes AI development simple and powerful",
        tags=["getting-started", "tutorial"]
    )
    print(f"Stored memory: {memory.id}")

    # Search memories
    results = await client.zerodb.memory.search(
        query="AI development",
        limit=10
    )
    print(f"Found {len(results)} memories")

if __name__ == "__main__":
    asyncio.run(main())`,

    typescript: `import { AINativeClient } from '@ainative/sdk';

const main = async () => {
  // Initialize client
  const client = new AINativeClient({
    apiKey: 'your-api-key',
    organizationId: 'your-org-id'
  });

  // Create a project
  const project = await client.zerodb.projects.create({
    name: 'My First Project',
    description: 'Getting started with AINative'
  });
  console.log(\`Created project: \${project.id}\`);

  // Store a memory
  const memory = await client.zerodb.memory.create({
    content: 'AINative makes AI development simple and powerful',
    tags: ['getting-started', 'tutorial']
  });
  console.log(\`Stored memory: \${memory.id}\`);

  // Search memories
  const results = await client.zerodb.memory.search({
    query: 'AI development',
    limit: 10
  });
  console.log(\`Found \${results.length} memories\`);
};

main().catch(console.error);`,

    go: `package main

import (
    "context"
    "fmt"
    "log"

    "github.com/ainative/go-sdk/ainative"
)

func main() {
    // Initialize client
    client, err := ainative.NewClient(&ainative.Config{
        APIKey: "your-api-key",
        OrganizationID: "your-org-id",
    })
    if err != nil {
        log.Fatal(err)
    }

    ctx := context.Background()

    // Create a project
    project, err := client.ZeroDB.Projects.Create(ctx, &ainative.CreateProjectRequest{
        Name: "My First Project",
        Description: "Getting started with AINative",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Created project: %s\\n", project.ID)

    // Store a memory
    memory, err := client.ZeroDB.Memory.Create(ctx, &ainative.CreateMemoryRequest{
        Content: "AINative makes AI development simple and powerful",
        Tags: []string{"getting-started", "tutorial"},
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Stored memory: %s\\n", memory.ID)

    // Search memories
    results, err := client.ZeroDB.Memory.Search(ctx, &ainative.SearchMemoryRequest{
        Query: "AI development",
        Limit: 10,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Found %d memories\\n", len(results.Results))
}`
  };

  const steps = [
    {
      number: 1,
      title: 'Create Account',
      description: 'Sign up for free and get your API keys',
      icon: <Key className="w-6 h-6" />,
      action: 'Sign Up',
      link: '/signup'
    },
    {
      number: 2,
      title: 'Install SDK',
      description: 'Choose your preferred language and install the SDK',
      icon: <Download className="w-6 h-6" />,
      action: 'View SDKs',
      link: '/community#sdks'
    },
    {
      number: 3,
      title: 'Create Project',
      description: 'Initialize your first project and start building',
      icon: <Database className="w-6 h-6" />,
      action: 'Try Example',
      link: '#quickstart'
    },
    {
      number: 4,
      title: 'Deploy & Scale',
      description: 'Deploy your application and scale with confidence',
      icon: <Bot className="w-6 h-6" />,
      action: 'Learn More',
      link: '/guides/deployment'
    }
  ];

  const features = [
    {
      title: 'Vector Database (ZeroDB)',
      description: 'Store and search high-dimensional vectors with semantic similarity',
      items: [
        'Billion-scale vector storage',
        'Sub-millisecond search',
        'Metadata filtering',
        'Automatic indexing'
      ]
    },
    {
      title: 'Memory System',
      description: 'Persistent memory for AI agents with intelligent retrieval',
      items: [
        'Long-term memory storage',
        'Semantic memory search',
        'Context-aware retrieval',
        'Memory consolidation'
      ]
    },
    {
      title: 'Agent Swarm',
      description: 'Orchestrate multiple AI agents for complex tasks',
      items: [
        'Multi-agent coordination',
        'Task distribution',
        'Real-time monitoring',
        'Fault tolerance'
      ]
    }
  ];

  const nextSteps = [
    {
      title: 'Explore Examples',
      description: 'Browse our comprehensive example library',
      link: '/examples',
      icon: <Code className="w-5 h-5" />
    },
    {
      title: 'API Reference',
      description: 'Detailed documentation for all endpoints',
      link: '/api-reference',
      icon: <Book className="w-5 h-5" />
    },
    {
      title: 'Join Community',
      description: 'Get help and share your projects',
      link: appConfig.links.discord,
      icon: <ExternalLink className="w-5 h-5" />,
      external: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6">
              Getting Started with AINative
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Build intelligent applications in minutes with our powerful AI infrastructure
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span>5 minutes to first API call</span>
              <span>-</span>
              <span>Production-ready</span>
              <span>-</span>
              <span>Comprehensive docs</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Steps */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              4 Steps to Success
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {step.number}
                  </div>
                  <div className="mb-4 text-cyan-400 flex justify-center">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{step.description}</p>
                  {step.link.startsWith('#') ? (
                    <a
                      href={step.link}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>{step.action}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      href={step.link}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>{step.action}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start Code */}
      <section id="quickstart" className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Quick Start Example
            </h2>

            {/* Language Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-800/50 rounded-lg p-1 flex space-x-1">
                {Object.keys(installCommands).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === lang
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Install Command */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-700 mb-6">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <span className="text-sm text-gray-400">Install</span>
                <button
                  onClick={() => copyToClipboard(installCommands[activeTab as keyof typeof installCommands], 'install')}
                  className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedCode === 'install' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copiedCode === 'install' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4">
                <code className="text-green-400 font-mono text-sm">
                  {installCommands[activeTab as keyof typeof installCommands]}
                </code>
              </div>
            </div>

            {/* Quick Start Code */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <span className="text-sm text-gray-400">Quick Start Example</span>
                <button
                  onClick={() => copyToClipboard(quickStartCode[activeTab as keyof typeof quickStartCode], 'quickstart')}
                  className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedCode === 'quickstart' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copiedCode === 'quickstart' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm">
                  <code className="text-gray-300 font-mono whitespace-pre">
                    {quickStartCode[activeTab as keyof typeof quickStartCode]}
                  </code>
                </pre>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-4">
                Replace <code className="bg-gray-700 px-2 py-1 rounded text-cyan-400">your-api-key</code> with your actual API key from the dashboard.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Key className="w-5 h-5" />
                <span>Get Your API Key</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-8">What&apos;s Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nextSteps.map((step, index) => (
                step.external ? (
                  <motion.a
                    key={step.title}
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-cyan-500 transition-all duration-200 group"
                  >
                    <div className="text-cyan-400 mb-4 flex justify-center">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </motion.a>
                ) : (
                  <Link key={step.title} href={step.link}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-cyan-500 transition-all duration-200 group h-full"
                    >
                      <div className="text-cyan-400 mb-4 flex justify-center">
                        {step.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </motion.div>
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support Section */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-8 md:p-12 border border-gray-700 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Help Getting Started?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Our community and support team are here to help you succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={appConfig.links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Join Discord Community
              </a>
              <Link
                href="/support"
                className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold border border-gray-700"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
