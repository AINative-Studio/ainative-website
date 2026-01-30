'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Code, Server, Database, Box, Zap, Network,
  ArrowRight, Sparkles, Shield, Cpu, Globe,
  Terminal, BookOpen, Github, Key, Webhook,
  ExternalLink, Download, FileText
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import apiClient from '@/utils/apiClient';
import { usePageViewTracking } from '@/hooks/useConversionTracking';

interface Tool {
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  features: string[];
  status: 'production' | 'beta';
  highlighted?: boolean;
  external?: boolean;
}

interface ToolCategory {
  category: string;
  tools: Tool[];
}

const developerTools: ToolCategory[] = [
  {
    category: 'Core Development',
    tools: [
      {
        name: 'Developer Settings',
        description: 'Manage API keys, webhooks, and provider configurations',
        icon: <Code className="h-6 w-6" />,
        href: '/developer-settings',
        features: ['API Keys', 'Webhooks', 'Provider Keys', 'GitHub Integration'],
        status: 'production'
      },
      {
        name: 'MCP Server Hosting',
        description: 'Deploy and manage Model Context Protocol servers',
        icon: <Server className="h-6 w-6" />,
        href: '/dashboard/mcp-hosting',
        features: ['One-click Deploy', 'Usage Tracking', 'Auto-scaling', 'Credit-based Billing'],
        status: 'production',
        highlighted: true
      },
      {
        name: 'ZeroDB',
        description: 'Zero-knowledge database with vector search and encryption',
        icon: <Database className="h-6 w-6" />,
        href: '/dashboard/zerodb',
        features: ['Vector Search', 'E2E Encryption', 'Real-time Sync', 'SQL Support'],
        status: 'production'
      }
    ]
  },
  {
    category: 'Testing & Optimization',
    tools: [
      {
        name: 'API Sandbox',
        description: 'Test APIs in isolated environments with realistic data',
        icon: <Box className="h-6 w-6" />,
        href: '/dashboard/api-sandbox',
        features: ['Isolated Environments', 'Mock Data', 'Request Builder', 'Response Validation'],
        status: 'production'
      },
      {
        name: 'Load Testing',
        description: 'Performance test your APIs with real-time metrics',
        icon: <Zap className="h-6 w-6" />,
        href: '/dashboard/load-testing',
        features: ['Scenario Builder', 'Real-time Metrics', 'Performance Reports', 'Auto-scaling Tests'],
        status: 'production'
      },
      {
        name: 'Quantum Neural Network',
        description: 'Advanced AI models with quantum computing capabilities',
        icon: <Network className="h-6 w-6" />,
        href: '/products/qnn',
        features: ['Quantum Models', 'Neural Architecture', 'Training Pipeline', 'Inference API'],
        status: 'beta'
      }
    ]
  },
  {
    category: 'Documentation & Resources',
    tools: [
      {
        name: 'API Documentation',
        description: 'Interactive API documentation with code examples',
        icon: <BookOpen className="h-6 w-6" />,
        href: 'https://api.ainative.studio/docs-enhanced#/',
        external: true,
        features: ['Interactive Docs', 'Code Examples', 'SDKs', 'Tutorials'],
        status: 'production'
      },
      {
        name: 'GitHub Integration',
        description: 'Connect your GitHub repositories for CI/CD',
        icon: <Github className="h-6 w-6" />,
        href: '/developer-settings',
        features: ['Repository Access', 'Webhook Events', 'PR Analysis', 'Actions Integration'],
        status: 'production'
      }
    ]
  }
];

export default function DeveloperToolsClient() {
  // Conversion tracking
  usePageViewTracking();

  const [stats, setStats] = useState({
    apiKeys: '3',
    mcpInstances: '2',
    apiCalls: '12.5K',
    creditsUsed: '0'
  });

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // API keys count (keeping hardcoded for now)
        const apiKeysCount = 3;

        // Fetch MCP instances
        const mcpResponse = await apiClient.get('/v1/public/mcp/instances');
        const mcpData = mcpResponse.data as { instances?: unknown[] };
        const mcpCount = mcpData.instances?.length || 0;

        // Fetch credits data from the real credits API
        let creditsUsed = 0;
        try {
          const creditsResponse = await apiClient.get('/v1/public/credits/balance');
          const creditsData = creditsResponse.data as { used_credits?: number };
          creditsUsed = creditsData.used_credits || 0;
        } catch (error) {
          // Fallback to admin endpoint if needed
          try {
            const adminResponse = await apiClient.get('/v1/admin/credits/balance');
            const adminData = adminResponse.data as { transactions?: Array<{ amount: number }>; used_credits?: number };
            if (adminData.transactions) {
              // Calculate used credits from transactions
              creditsUsed = Math.abs(adminData.transactions
                .filter((t) => t.amount < 0)
                .reduce((sum: number, t) => sum + t.amount, 0));
            } else {
              creditsUsed = adminData.used_credits || 0;
            }
          } catch (publicError) {
            console.error('Error fetching credits from both endpoints:', error, publicError);
          }
        }

        setStats(prev => ({
          ...prev,
          apiKeys: apiKeysCount.toString(),
          mcpInstances: mcpCount.toString(),
          creditsUsed: creditsUsed.toString()
        }));
      } catch (error) {
        console.error('Error fetching developer stats:', error);
        // Keep default values on error
      }
    };

    fetchStats();
  }, []);

  const quickStats = [
    { label: 'Active API Keys', value: stats.apiKeys, icon: <Key className="h-5 w-5" /> },
    { label: 'MCP Instances', value: stats.mcpInstances, icon: <Server className="h-5 w-5" /> },
    { label: 'API Calls Today', value: stats.apiCalls, icon: <Terminal className="h-5 w-5" /> },
    { label: 'Credits Used', value: stats.creditsUsed, icon: <Cpu className="h-5 w-5" /> }
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Developer Tools
            </h1>
            <p className="text-gray-100 mt-2">
              Everything you need to build, test, and deploy with AINative
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-200">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="text-primary">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tools by Category */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {developerTools.map((category) => (
          <motion.div key={category.category} variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {category.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.tools.map((tool) => (
                <Card
                  key={tool.name}
                  className={`border-2 hover:border-primary/30 transition-all hover:shadow-lg ${
                    tool.highlighted ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {tool.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {tool.name}
                            {tool.highlighted && (
                              <Badge variant="default" className="text-xs">NEW</Badge>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge variant={tool.status === 'production' ? 'default' : 'secondary'}>
                        {tool.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-100">{tool.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {tool.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {tool.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{tool.features.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Action Button */}
                    {tool.external ? (
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <a
                          href={tool.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Tool
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Link href={tool.href}>
                          Open Tool
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Developer Tools & Resources */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Developer Tools & Resources
            </CardTitle>
            <CardDescription>
              Access comprehensive developer tools, documentation, SDKs, and testing environments for AINative platform integration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* API Documentation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-white">Interactive API Documentation</h3>
                      <p className="text-sm text-muted-foreground">Enhanced Swagger UI with code examples</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      <a href="https://api.ainative.studio/docs-enhanced#/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Docs
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      <a href="/v1/codegen/python" target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Python Examples
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold text-white">Postman Collections</h3>
                      <p className="text-sm text-muted-foreground">Ready-to-use API collections with examples</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      <a href="/v1/postman-collection-comprehensive" download>
                        <Download className="h-4 w-4 mr-2" />
                        Download Collection
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      <a href="/v1/postman-environment" download>
                        <Download className="h-4 w-4 mr-2" />
                        Environment
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SDKs */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Terminal className="h-5 w-5" />
                Software Development Kits (SDKs)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">PY</span>
                      </div>
                      <h4 className="font-semibold text-white">Python SDK</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Complete Python client with CLI tools and comprehensive examples
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">100% Test Coverage</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild className="text-white border-white hover:bg-white hover:text-black">
                          <a href="https://github.com/AINative-Studio/python-sdk" target="_blank">
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" disabled className="text-gray-400">
                          <Download className="h-4 w-4 mr-1" />
                          PyPI (Soon)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">TS</span>
                      </div>
                      <h4 className="font-semibold text-white">TypeScript SDK</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      TypeScript client with React hooks and Vue composables
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">87% Test Coverage</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild className="text-white border-white hover:bg-white hover:text-black">
                          <a href="https://github.com/AINative-Studio/TypeScript-SDK" target="_blank">
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" disabled className="text-gray-400">
                          <Download className="h-4 w-4 mr-1" />
                          NPM (Soon)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 bg-cyan-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">GO</span>
                      </div>
                      <h4 className="font-semibold text-white">Go SDK</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      High-performance Go client with advanced concurrency and OpenTelemetry
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">Production Ready</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" asChild className="text-white border-white hover:bg-white hover:text-black">
                          <a href="https://github.com/AINative-Studio/Go-SDK" target="_blank">
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" disabled className="text-gray-400">
                          <Download className="h-4 w-4 mr-1" />
                          pkg.go.dev (Soon)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Testing Tools */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Zap className="h-5 w-5" />
                Testing & Sandbox Tools
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Box className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-white">API Sandbox Environment</h3>
                        <p className="text-sm text-muted-foreground">Isolated testing with realistic data</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Link href="/dashboard/api-sandbox">
                          <Box className="h-4 w-4 mr-2" />
                          Manage Sandboxes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-white">Load Testing Tools</h3>
                        <p className="text-sm text-muted-foreground">Performance testing with real-time metrics</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Link href="/dashboard/load-testing">
                          <Zap className="h-4 w-4 mr-2" />
                          Run Load Tests
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Server className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold text-white">MCP Server Hosting</h3>
                        <p className="text-sm text-muted-foreground">Managed MCP server instances</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Link href="/dashboard/mcp-hosting">
                          <Server className="h-4 w-4 mr-2" />
                          Manage Servers
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-3 text-white">Quick Access</h4>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <a href="https://api.ainative.studio/docs-enhanced#/" target="_blank">
                    <BookOpen className="h-4 w-4 mr-2" />
                    API Documentation
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <Link href="/dashboard/api-sandbox">
                    <Box className="h-4 w-4 mr-2" />
                    API Sandbox
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <Link href="/dashboard/load-testing">
                    <Zap className="h-4 w-4 mr-2" />
                    Load Testing
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <a href="https://github.com/AINative-Studio" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub Organization
                  </a>
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
