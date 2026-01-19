'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Book, Code, Terminal, ArrowRight, LucideIcon } from 'lucide-react';

interface DocSection {
  title: string;
  description: string;
  icon: LucideIcon;
  links: { title: string; href: string }[];
}

const sections: DocSection[] = [
  {
    title: 'Getting Started',
    description: 'Learn the basics and get up and running quickly',
    icon: FileText,
    links: [
      { title: 'Quick Start Guide', href: '/getting-started' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Basic Concepts', href: '/docs/concepts' },
    ],
  },
  {
    title: 'API Reference',
    description: 'Detailed documentation of our API endpoints',
    icon: Code,
    links: [
      { title: 'Authentication', href: '/api-reference#authentication' },
      { title: 'Endpoints', href: '/api-reference' },
      { title: 'Rate Limits', href: '/docs/rate-limits' },
    ],
  },
  {
    title: 'Tutorials',
    description: 'Step-by-step guides for common use cases',
    icon: Book,
    links: [
      { title: 'Basic Tutorial', href: '/tutorials' },
      { title: 'Advanced Features', href: '/tutorials#advanced' },
      { title: 'Best Practices', href: '/docs/best-practices' },
    ],
  },
  {
    title: 'CLI Documentation',
    description: 'Command-line interface documentation',
    icon: Terminal,
    links: [
      { title: 'Commands', href: '/docs/cli/commands' },
      { title: 'Configuration', href: '/docs/cli/config' },
      { title: 'Plugins', href: '/docs/cli/plugins' },
    ],
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function DocsClient() {
  return (
    <div className="min-h-screen bg-vite-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Documentation
            </h1>
            <p className="text-xl text-gray-400">
              Everything you need to know about AINative Studio
            </p>
          </motion.div>

          {/* Documentation Sections */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {sections.map((section, index) => (
              <motion.div key={section.title} variants={fadeInUp}>
                <Card className="h-full border-[#2D333B] bg-[#161B22] backdrop-blur-sm hover:border-[#4B6FED]/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#4B6FED]/10 text-[#4B6FED]">
                        <section.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl text-white">
                        {section.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.title}>
                          <Link href={link.href}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-gray-300 hover:text-[#8AB4FF] hover:bg-[#2D333B] p-2 h-auto font-normal"
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              {link.title}
                            </Button>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Implementation Section */}
          <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
            <Card className="border-[#2D333B] bg-gradient-to-br from-[#4B6FED]/10 to-[#8A63F4]/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Quick Implementation
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get started with just a few lines of code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-vite-bg border border-[#2D333B] rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{`import { AINativeClient } from '@ainative/sdk';

// Initialize the client
const client = new AINativeClient({
  apiKey: 'your_api_key',
  options: {
    enableAutocompletion: true,
    enableSemanticSearch: true
  }
});

// Use the AI-powered features
async function main() {
  const results = await client.search({
    query: 'implement authentication',
    topK: 10
  });

  console.log('Search results:', results);
}

main();`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Section */}
          <motion.div
            className="mt-12 text-center"
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-400 mb-6">
              Need help getting started?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button className="bg-[#4B6FED] hover:bg-[#4B6FED]/80 text-white">
                  Contact Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/community/videos">
                <Button variant="outline" className="border-[#2D333B] text-gray-300 hover:bg-[#2D333B]">Watch Tutorials</Button>
              </Link>
            </div>
          </motion.div>

          {/* Popular Topics Section */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Popular Topics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'ZeroDB Setup', href: '/products/zerodb' },
                { title: 'AI Kit Packages', href: '/ai-kit' },
                { title: 'API Reference', href: '/api-reference' },
                { title: 'Pricing Plans', href: '/pricing' },
              ].map((topic) => (
                <Link key={topic.title} href={topic.href}>
                  <Card className="bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <span className="text-gray-300 hover:text-[#8AB4FF]">
                        {topic.title}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
