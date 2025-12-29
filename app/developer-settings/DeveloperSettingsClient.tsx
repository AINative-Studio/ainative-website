'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Webhook,
  Code,
  Terminal,
  Shield,
  Settings,
  ExternalLink,
  ChevronRight,
  Copy,
  CheckCircle2
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const quickLinks: QuickLink[] = [
  {
    title: 'API Keys',
    description: 'Manage authentication credentials for AINative services',
    href: '/dashboard/api-keys',
    icon: Key,
    badge: 'Essential'
  },
  {
    title: 'Webhooks',
    description: 'Configure webhook endpoints for real-time event notifications',
    href: '/dashboard/webhooks',
    icon: Webhook
  },
  {
    title: 'API Sandbox',
    description: 'Test API endpoints in an interactive sandbox environment',
    href: '/dashboard/api-sandbox',
    icon: Terminal
  },
  {
    title: 'Load Testing',
    description: 'Run performance tests against your API integrations',
    href: '/dashboard/load-testing',
    icon: Settings
  }
];

export default function DeveloperSettingsClient() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Developer Settings</h1>
          <p className="text-muted-foreground">
            Configure API access, webhooks, and integration settings for your applications
          </p>
        </div>
      </motion.div>

      {/* Quick Links Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {quickLinks.map((link) => (
          <motion.div key={link.href} variants={fadeUp}>
            <Link href={link.href}>
              <Card className="bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/50 transition-all duration-200 cursor-pointer group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#4B6FED]/10 rounded-lg">
                      <link.icon className="h-5 w-5 text-[#4B6FED]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {link.title}
                        {link.badge && (
                          <Badge variant="outline" className="text-xs border-[#4B6FED] text-[#4B6FED]">
                            {link.badge}
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#4B6FED] transition-colors" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    {link.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* API Base URL */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="bg-[#161B22] border-[#2D333B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Base URL and endpoints for AINative API integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                API Base URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#0D1117] px-4 py-3 rounded-lg text-[#8AB4FF] font-mono text-sm border border-[#2D333B]">
                  https://api.ainative.studio/v1
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard('https://api.ainative.studio/v1')}
                  className="border-[#2D333B]"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-[#0D1117] rounded-lg border border-[#2D333B]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Production</span>
                </div>
                <code className="text-xs text-gray-400">api.ainative.studio</code>
              </div>
              <div className="p-4 bg-[#0D1117] rounded-lg border border-[#2D333B]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Staging</span>
                </div>
                <code className="text-xs text-gray-400">staging-api.ainative.studio</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Best Practices */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="bg-[#161B22] border-[#2D333B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#4B6FED] mt-0.5 flex-shrink-0" />
                <span>Never expose API keys in client-side code or public repositories</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#4B6FED] mt-0.5 flex-shrink-0" />
                <span>Use environment variables to store sensitive credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#4B6FED] mt-0.5 flex-shrink-0" />
                <span>Rotate API keys regularly and revoke unused keys</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#4B6FED] mt-0.5 flex-shrink-0" />
                <span>Validate webhook signatures to ensure request authenticity</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#4B6FED] mt-0.5 flex-shrink-0" />
                <span>Use HTTPS for all API communications</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documentation Link */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 border-[#4B6FED]/30">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#4B6FED]/20 rounded-lg">
                <Code className="h-6 w-6 text-[#4B6FED]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">API Documentation</h3>
                <p className="text-gray-400 text-sm">
                  Explore complete API reference, guides, and code examples
                </p>
              </div>
            </div>
            <Link href="/docs">
              <Button className="bg-[#4B6FED] hover:bg-[#4B6FED]/80 gap-2">
                View Docs
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
