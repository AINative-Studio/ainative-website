'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Users,
  Shield,
  Folder,
  Zap,
  Brain,
  Database,
  Code,
  CheckCircle,
  GitBranch,
  Code2,
  Cpu,
  Search,
  FileText,
  Network,
  Bug,
  ArrowRight,
  Sparkles,
  Terminal as TerminalIcon,
  TestTube2 as TestTube2Icon,
  Activity as ActivityIcon,
  Key as KeyIcon,
  BarChart2,
  FileCode,
  GraduationCap
} from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string;
  path: string;
  description: string;
}

interface Section {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  endpoints: Endpoint[];
}

type SectionsRecord = Record<string, Section>;

interface ApiSectionProps {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  endpoints: Endpoint[];
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
}

const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h3 className={`text-lg font-semibold leading-tight tracking-tight ${className || ''}`} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${className || ''}`} {...props} />
);

const ApiSection = ({ title, icon: Icon, description, endpoints }: ApiSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const visibleEndpoints = expanded ? endpoints : endpoints.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group h-full"
    >
      <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 hover:border-primary/20 dark:hover:border-primary/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden group-hover:shadow-primary/20 group-hover:shadow-xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500 border border-gray-100 dark:border-gray-700/50">
        {/* Animated gradient border */}
        <div className="absolute inset-0 p-px rounded-xl bg-gradient-to-br from-primary/20 via-blue-500/30 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute inset-0.5 bg-white dark:bg-gray-900/95 rounded-[11px]" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <CardHeader className="pb-4 px-6 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl shadow-inner border border-white/20 dark:border-white/5 flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200">
                    {title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700/50">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-500 opacity-75"></span>
                </span>
                {endpoints.length} {endpoints.length === 1 ? 'endpoint' : 'endpoints'}
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visibleEndpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2, ease: "easeOut" }}
                className="p-4 bg-white/70 dark:bg-gray-800/50 rounded-xl border border-gray-100/90 dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800/70 transition-all duration-200 backdrop-blur-sm relative overflow-hidden hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600/70 hover:-translate-y-0.5"
                whileHover={{ scale: 1.01 }}
              >

                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                    endpoint.method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {endpoint.description}
                </p>
              </motion.div>
            ))}
            {endpoints.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-primary hover:bg-primary/10"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show less' : `Show ${endpoints.length - 3} more`}
                <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </Button>
            )}
          </div>
        </CardContent>
      </div>
      </Card>
    </motion.div>
  );
};

const developerTools = [
  // Development Tools
  {
    name: 'AI Kit - NPM Packages',
    icon: Code2,
    description: '14 production-ready NPM packages for building AI applications with React, Vue, Svelte, Next.js and more. Framework-agnostic, type-safe, and battle-tested.',
    category: 'development',
    link: '/ai-kit',
    external: false
  },
  {
    name: 'ZeroDB MCP Server',
    icon: Database,
    description: 'Model Context Protocol server with 60 operations for vector search, quantum compression, NoSQL, files, events, RLHF, and persistent memory for AI agents. Production-ready integration for Claude Desktop, Claude Code, Windsurf, and other MCP clients.',
    category: 'development',
    link: 'https://github.com/AINative-Studio/ainative-zerodb-mcp-server',
    external: true
  },
  {
    name: 'Design System MCP Server',
    icon: Code2,
    description: 'MCP server for design systems - extract design tokens, analyze components, generate themes, and validate design consistency. Supports CSS, SCSS, Tailwind, Material-UI, and more.',
    category: 'development',
    link: 'https://github.com/ainative/ainative-design-system-mcp-server',
    external: true
  },
  {
    name: 'API Explorer',
    icon: Code2,
    description: 'Interactive API documentation with live testing capabilities and request building. Test endpoints in real-time with your API key.',
    category: 'development',
  },
  {
    name: 'Python SDK',
    icon: Code,
    description: 'Official Python client library with async support, type hints, and comprehensive error handling',
    category: 'development',
    link: 'https://github.com/AINative-Studio/python-sdk',
    external: true
  },
  {
    name: 'JavaScript SDK',
    icon: Code,
    description: 'TypeScript-first JavaScript SDK for Node.js and browsers with modern ES6+ features',
    category: 'development',
    link: 'https://github.com/AINative-Studio/TypeScript-SDK',
    external: true
  },
  {
    name: 'Go SDK',
    icon: Code,
    description: 'High-performance Go SDK with native concurrency support, type safety, and minimal dependencies',
    category: 'development',
    link: 'https://github.com/AINative-Studio/Go-SDK',
    external: true
  },
  {
    name: 'CLI Tool - AI Kit CLI',
    icon: TerminalIcon,
    description: 'Command line interface for managing API keys, testing endpoints, project scaffolding, and automating workflows. Part of @ainative/ai-kit-cli NPM package',
    category: 'development',
    link: 'https://www.npmjs.com/package/@ainative/ai-kit-cli',
    external: true
  },
  {
    name: 'VS Code Extension',
    icon: Code2,
    description: 'Official VS Code extension with AI code completion, debugging assistance, and API integration',
    category: 'development'
  },
  {
    name: 'Postman Collection',
    icon: Code2,
    description: 'Comprehensive collection suite with 1,330+ endpoints across 50+ categories. Includes automatic authentication, test scripts, and response examples. Import all 3 collections (Complete API v2, ZeroDB, Agent Swarm) for full coverage.',
    category: 'development'
  },

  // Testing Tools
  {
    name: 'API Sandbox',
    icon: TestTube2Icon,
    description: 'Safe testing environment with sample data, mock responses, and rate limit simulation',
    category: 'testing',
  },
  {
    name: 'Load Testing',
    icon: ActivityIcon,
    description: 'Test your integration under load with automated performance benchmarking',
    category: 'testing'
  },
  {
    name: 'API Validator',
    icon: Bug,
    description: 'Validate your API requests and responses against our OpenAPI specification',
    category: 'testing'
  },

  // Deployment Tools
  {
    name: 'Webhook Manager',
    icon: Zap,
    description: 'Configure, test, and monitor webhooks for real-time event notifications',
    category: 'deployment'
  },
  {
    name: 'GitHub Actions',
    icon: GitBranch,
    description: 'Pre-built GitHub Actions for automated testing, deployment, and API monitoring',
    category: 'deployment'
  },
  {
    name: 'Docker Images',
    icon: Code,
    description: 'Official Docker images for containerized deployments and microservices',
    category: 'deployment'
  },

  // Monitoring & Analytics
  {
    name: 'System Status',
    icon: ActivityIcon,
    description: 'Real-time status dashboard with uptime metrics and incident reports',
    category: 'monitoring',
    external: true
  },
  {
    name: 'Usage Analytics',
    icon: BarChart2,
    description: 'Detailed analytics dashboard with API usage, performance metrics, and cost tracking',
    category: 'monitoring'
  },
  {
    name: 'Error Tracking',
    icon: Bug,
    description: 'Advanced error tracking with AI-powered insights and resolution suggestions',
    category: 'monitoring'
  },

  // Integration Tools
  {
    name: 'Zapier App',
    icon: Zap,
    description: 'Connect AINative with 5,000+ apps through our official Zapier integration',
    category: 'integrations',
    external: true
  },
  {
    name: 'Slack App',
    icon: MessageSquare,
    description: 'Bring AI capabilities directly into Slack with slash commands and interactive features',
    category: 'integrations'
  },
  {
    name: 'Microsoft Teams',
    icon: MessageSquare,
    description: 'Integrate AI-powered assistance into your Microsoft Teams workflow',
    category: 'integrations'
  },
  {
    name: 'REST API',
    icon: Network,
    description: 'Standard REST API with OpenAPI 3.0 specification and comprehensive documentation',
    category: 'integrations'
  },

  // Learning Resources
  {
    name: 'Quick Start Guide',
    icon: GraduationCap,
    description: 'Get up and running in 5 minutes with our comprehensive quick start tutorial',
    category: 'learning',
  },
  {
    name: 'Code Examples',
    icon: FileCode,
    description: 'Production-ready code samples in Python, JavaScript, cURL, and more',
    category: 'learning'
  },
  {
    name: 'Video Tutorials',
    icon: GraduationCap,
    description: 'Step-by-step video guides covering common use cases and advanced features',
    category: 'learning'
  },
  {
    name: 'Best Practices',
    icon: FileText,
    description: 'Comprehensive guide to API best practices, optimization tips, and security guidelines',
    category: 'learning'
  }
];

const apiEndpoints = {
  authentication: {
    title: "Authentication",
    description: "User authentication and account management",
    icon: Shield,
    endpoints: [
      {
        method: 'POST',
        path: '/v1/public/auth/',
        description: 'User login with email and password (form data) - Public'
      },
      {
        method: 'POST',
        path: '/v1/public/auth/register',
        description: 'Register a new user account - Public'
      },
      {
        method: 'GET',
        path: '/v1/public/auth/me',
        description: 'Get current authenticated user information - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/auth/change-password',
        description: 'Change user password - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/auth/refresh-token',
        description: 'Refresh authentication token - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/auth/logout',
        description: 'Log out current user - Requires Auth'
      },
      {
        method: 'DELETE',
        path: '/v1/public/auth/account',
        description: 'Delete user account - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/auth/verify-token',
        description: 'Verify JWT token validity - Requires Auth'
      }
    ]
  },
  userManagement: {
    title: "User Management",
    description: "User profile and settings management",
    icon: Users,
    endpoints: [
      {
        method: 'GET',
        path: '/v1/public/profile',
        description: 'Get user profile information - Requires Auth'
      },
      {
        method: 'PUT',
        path: '/v1/public/profile',
        description: 'Update user profile - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/users/*',
        description: 'User management endpoints - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/settings/*',
        description: 'User settings management - Requires Auth'
      }
    ]
  },
  agentSystem: {
    title: "Agent System",
    icon: Cpu,
    description: "AI agent coordination, management, and memory systems (90+ endpoints)",
    endpoints: [
      {
        method: 'GET',
        path: '/v1/public/agent-bridge/*',
        description: 'Agent bridge communication endpoints - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-bridge/*',
        description: 'Create and manage agent bridges - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/agent-coordination/*',
        description: 'Agent coordination and orchestration - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-coordination/*',
        description: 'Coordinate agent workflows - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/agent-swarms/*',
        description: 'Agent swarm management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-swarms/*',
        description: 'Create and control agent swarms - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/agent-orchestration/*',
        description: 'Agent orchestration workflows - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-orchestration/*',
        description: 'Orchestrate complex agent tasks - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/agent-tasks/*',
        description: 'Agent task management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-tasks/*',
        description: 'Create and assign agent tasks - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/agent-learning/*',
        description: 'Agent learning and adaptation - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-learning/*',
        description: 'Configure agent learning parameters - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/agent-state/*',
        description: 'Agent state management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-state/*',
        description: 'Update agent states - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/agent-framework/*',
        description: 'Agent framework configuration - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-framework/*',
        description: 'Configure agent frameworks - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/agent-resources/*',
        description: 'Agent resource management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/agent-resources/*',
        description: 'Allocate agent resources - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/memory/*',
        description: 'Agent memory management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/memory/*',
        description: 'Store and retrieve agent memories - Requires Auth'
      }
    ]
  },
  aiInfrastructure: {
    title: "AI/ML Infrastructure",
    icon: Brain,
    description: "AI model management and orchestration (60+ endpoints)",
    endpoints: [
      {
        method: 'GET',
        path: '/v1/public/ai-context/*',
        description: 'AI context management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/ai-context/*',
        description: 'Create and manage AI contexts - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/ai-orchestration/*',
        description: 'AI model orchestration - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/ai-orchestration/*',
        description: 'Orchestrate AI model workflows - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/ai-registry/*',
        description: 'AI model registry - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/ai-registry/*',
        description: 'Register and manage AI models - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/ai-usage/*',
        description: 'AI usage analytics - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/ai-usage/*',
        description: 'Track AI usage metrics - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/multi-model/*',
        description: 'Multi-model AI operations - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/multi-model/*',
        description: 'Execute multi-model AI workflows - Requires Auth'
      }
    ]
  },
  developmentTools: {
    title: "Development Tools",
    icon: Code2,
    description: "Code analysis, development assistance, checkpoints, and webhooks (60+ endpoints)",
    endpoints: [
      {
        method: 'GET',
        path: '/v1/public/code-quality/*',
        description: 'Code quality analysis - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/code-quality/*',
        description: 'Analyze and improve code quality - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/code-context-engine/*',
        description: 'Code context analysis engine - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/code-context-engine/*',
        description: 'Generate code context insights - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/refactoring/*',
        description: 'Code refactoring suggestions - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/refactoring/*',
        description: 'Apply code refactoring - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/pr-analysis/*',
        description: 'Pull request analysis - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/pr-analysis/*',
        description: 'Analyze pull requests - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/debugging/*',
        description: 'Debugging assistance - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/debugging/*',
        description: 'Debug code issues - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/chat/*',
        description: 'Chat functionality - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/chat/*',
        description: 'Chat with AI assistants - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/v1/checkpoints/*',
        description: 'Development checkpoint management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/v1/checkpoints/*',
        description: 'Create and manage development checkpoints - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/webhooks/*',
        description: 'Webhook management for development workflows - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/webhooks/*',
        description: 'Create and manage development webhooks - Requires Auth'
      }
    ]
  },
  zerodbManagement: {
    title: "ZeroDB Management",
    icon: Database,
    description: "Complete AI-native database platform with 25 production-ready endpoints",
    endpoints: [
      // Project Database Management (3 endpoints)
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database',
        description: 'Get database status and statistics - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database',
        description: 'Enable ZeroDB for existing project - Requires Auth'
      },
      {
        method: 'PUT',
        path: '/v1/projects/{project_id}/database',
        description: 'Update database configuration - Requires Auth'
      },
      // Table Management (2 endpoints)
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database/tables',
        description: 'List all project tables - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/tables',
        description: 'Create dynamic table schema - Requires Auth'
      },
      // Vector Operations (4 endpoints)
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database/vectors',
        description: 'List vectors with namespace filtering - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/vectors/upsert',
        description: 'Single vector upsert operation - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/vectors/upsert-batch',
        description: 'Batch vector operations - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/vectors/search',
        description: 'Vector similarity search - Requires Auth'
      },
      // Memory Operations (3 endpoints)
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database/memory',
        description: 'List memory records with filtering - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/memory/store',
        description: 'Store agent memory record - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/memory/search',
        description: 'Search memory records - Requires Auth'
      },
      // Event Streaming (3 endpoints)
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database/events',
        description: 'List historical events - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/events/publish',
        description: 'Publish event to audit log - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database/events/stream',
        description: 'Stream events (fallback mode) - Requires Auth'
      },
      // File Management (2 endpoints)
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database/files',
        description: 'List file metadata - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/files/upload',
        description: 'Register file metadata - Requires Auth'
      },
      // RLHF Dataset Management (2 endpoints)
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database/rlhf',
        description: 'List RLHF data with filtering - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/rlhf/log',
        description: 'Log training data for model improvement - Requires Auth'
      },
      // Agent Logging (2 endpoints)
      {
        method: 'GET',
        path: '/v1/projects/{project_id}/database/agent/logs',
        description: 'List agent logs with filtering - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/{project_id}/database/agent/log',
        description: 'Store agent activity logs - Requires Auth'
      },
      // Admin Management (4 endpoints)
      {
        method: 'GET',
        path: '/v1/public/zerodb/projects',
        description: 'List all ZeroDB projects (Admin) - Requires Admin Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/zerodb/projects/{project_id}',
        description: 'Get project details (Admin) - Requires Admin Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/zerodb/stats',
        description: 'System-wide statistics (Admin) - Requires Admin Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/zerodb/usage/analytics',
        description: 'Usage analytics (Admin) - Requires Admin Auth'
      }
    ]
  },
  projectManagement: {
    title: "Project & Data Management",
    icon: Folder,
    description: "General project and data management (30+ endpoints)",
    endpoints: [
      {
        method: 'GET',
        path: '/v1/projects/*',
        description: 'General project management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/projects/*',
        description: 'Create and manage general projects - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/organizations/*',
        description: 'Organization management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/organizations/*',
        description: 'Create and manage organizations - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/teams/*',
        description: 'Team management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/teams/*',
        description: 'Create and manage teams - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/documents/*',
        description: 'Document management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/documents/*',
        description: 'Create and manage documents - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/sessions/*',
        description: 'Session management - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/sessions/*',
        description: 'Create and manage sessions - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/search/*',
        description: 'Search functionality - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/search/*',
        description: 'Search across data sources - Requires Auth'
      }
    ]
  },
  evalsAndPromptManagement: {
    title: "Evals and Prompt Management",
    icon: Sparkles,
    description: "AI evaluation, prompt management, and feedback systems (30+ endpoints)",
    endpoints: [
      {
        method: 'GET',
        path: '/v1/public/collaboration/*',
        description: 'Real-time collaboration features - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/collaboration/*',
        description: 'Enable collaborative workflows - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/prompt-versioning/*',
        description: 'Prompt versioning system - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/prompt-versioning/*',
        description: 'Version and manage prompts - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/ab-testing/*',
        description: 'A/B testing framework for AI models - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/ab-testing/*',
        description: 'Run A/B tests on AI outputs - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/realtime-feedback/*',
        description: 'Real-time AI evaluation feedback - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/realtime-feedback/*',
        description: 'Provide real-time evaluation feedback - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/user-feedback/*',
        description: 'User feedback collection for AI outputs - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/user-feedback/*',
        description: 'Submit user feedback on AI performance - Requires Auth'
      }
    ]
  },
  specializedApis: {
    title: "Specialized APIs",
    icon: Database,
    description: "UI integration and quantum computing (experimental) endpoints",
    endpoints: [
      {
        method: 'GET',
        path: '/v1/public/ui/*',
        description: 'UI integration endpoints - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/ui/*',
        description: 'UI component integration - Requires Auth'
      },
      {
        method: 'GET',
        path: '/v1/public/quantum/*',
        description: 'Quantum computing integration (experimental) - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/quantum/*',
        description: 'Execute quantum algorithms (experimental) - Requires Auth'
      }
    ]
  },
  githubIntegration: {
    title: "GitHub Integration",
    icon: GitBranch,
    description: "GitHub repository and webhook integration",
    endpoints: [
      {
        method: 'GET',
        path: '/v1/public/github/*',
        description: 'GitHub integration endpoints - Requires Auth'
      },
      {
        method: 'POST',
        path: '/v1/public/github/*',
        description: 'GitHub repository operations - Requires Auth'
      }
    ]
  },
  systemStatus: {
    title: "System Status & Health",
    icon: ActivityIcon,
    description: "System monitoring and health checks",
    endpoints: [
      {
        method: 'GET',
        path: '/v1/health',
        description: 'API health check for monitoring systems - Public'
      },
      {
        method: 'GET',
        path: '/v1/status',
        description: 'System status endpoint - Public'
      }
    ]
  },
};

type CategoryKey = 'development' | 'testing' | 'deployment' | 'monitoring' | 'integrations' | 'learning';

const categoryNames: Record<CategoryKey, string> = {
  development: 'Development Tools',
  testing: 'Testing & Validation',
  deployment: 'Deployment & DevOps',
  monitoring: 'Monitoring & Analytics',
  integrations: 'Integrations & Extensions',
  learning: 'Learning Resources'
};

export default function DevResourcesClient() {
  const [activeTab, setActiveTab] = useState('api');
  const [searchQuery, setSearchQuery] = useState('');
  // API Key modal state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // API Key modal component
  const ApiKeyModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Get Your API Key</h3>
          <button
            onClick={() => setShowApiKeyModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Sign up or log in to generate your API key and start integrating with our platform.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild className="bg-primary text-white hover:bg-primary/90">
              <Link href="/signup" className="w-full text-center">
                Sign Up
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login" className="w-full text-center">
                Log In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSections = (sections: SectionsRecord): React.ReactElement[] => {
    return Object.entries(sections)
      .map(([key, section]) => (
        <ApiSection
          key={key}
          title={section.title}
          icon={section.icon}
          description={section.description}
          endpoints={section.endpoints}
        />
      ));
  };

  const filteredSections = (sections: SectionsRecord): SectionsRecord => {
    if (!searchQuery.trim()) return sections;

    const filtered: SectionsRecord = {};
    const query = searchQuery.toLowerCase();

    Object.entries(sections).forEach(([key, section]) => {
      const sectionTitle = section.title.toLowerCase();
      const sectionDesc = section.description.toLowerCase();

      const hasMatchingEndpoint = section.endpoints.some((endpoint) =>
        endpoint.path.toLowerCase().includes(query) ||
        endpoint.description.toLowerCase().includes(query)
      );

      if (
        sectionTitle.includes(query) ||
        sectionDesc.includes(query) ||
        hasMatchingEndpoint
      ) {
        filtered[key] = section;
      }
    });

    return filtered;
  };

  const filteredTools = developerTools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Search Bar */}
      <header className="sticky top-20 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search APIs, components, or resources..."
              className="pl-10 w-full bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 text-sm h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-8 pb-12 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            Developer Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Build with Confidence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to integrate with our platform and build amazing applications
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 mb-4 sm:mb-0">
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                API Reference
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {Object.keys(apiEndpoints).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <TerminalIcon className="h-4 w-4" />
                Developer Tools
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {developerTools.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Powered by AINative</span>
            </div>
          </div>

          <TabsContent value="api">
            <AnimatePresence mode="wait">
              <motion.div
                key={searchQuery || 'api'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {Object.keys(filteredSections(apiEndpoints)).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderSections(filteredSections(apiEndpoints))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No results found</h3>
                    <p className="mt-1 text-muted-foreground">
                      We couldn&apos;t find any API endpoints matching your search.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>


          <TabsContent value="tools" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <TerminalIcon className="h-4 w-4 mr-2" />
                Developer Toolkit
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Everything You Need to Build
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
                From SDKs and testing tools to monitoring and integrations - our comprehensive developer toolkit
                helps you build, deploy, and scale AI-powered applications with confidence.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Production Ready
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Open Source
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Well Documented
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Community Supported
                </span>
              </div>
            </motion.div>

            {/* SDK Quick Start Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-16"
            >
              <h3 className="text-2xl font-semibold mb-6 text-center">
                SDK Quick Start
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Python SDK */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-b">
                    <div className="flex items-center gap-3">
                      <Code className="h-6 w-6 text-blue-600" />
                      <CardTitle>Python SDK</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Installation</h4>
                      <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                        pip install ainative
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Basic Usage</h4>
                      <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                        <pre className="text-xs leading-relaxed">{`from ainative import AINative

client = AINative(api_key="your_api_key")

# Chat completion
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`}</pre>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open('https://github.com/AINative-Studio/python-sdk', '_blank', 'noopener,noreferrer')}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View on GitHub
                    </Button>
                  </CardContent>
                </Card>

                {/* TypeScript SDK */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-b">
                    <div className="flex items-center gap-3">
                      <Code className="h-6 w-6 text-blue-600" />
                      <CardTitle>TypeScript SDK</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Installation</h4>
                      <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                        npm install @ainative/sdk
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Basic Usage</h4>
                      <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                        <pre className="text-xs leading-relaxed">{`import { AINative } from '@ainative/sdk';

const client = new AINative({
    apiKey: 'your_api_key'
});

// Chat completion
const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);`}</pre>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open('https://github.com/AINative-Studio/TypeScript-SDK', '_blank', 'noopener,noreferrer')}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View on GitHub
                    </Button>
                  </CardContent>
                </Card>

                {/* Go SDK */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-b">
                    <div className="flex items-center gap-3">
                      <Code className="h-6 w-6 text-cyan-600" />
                      <CardTitle>Go SDK</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Installation</h4>
                      <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                        go get github.com/AINative-Studio/Go-SDK
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Basic Usage</h4>
                      <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-x-auto">
                        <pre className="text-xs leading-relaxed">{`package main

import (
    "fmt"
    "github.com/AINative-Studio/Go-SDK/ainative"
)

func main() {
    client := ainative.NewClient("your_api_key")

    response, err := client.Chat.Completions.Create(&ainative.ChatRequest{
        Model: "gpt-4",
        Messages: []ainative.Message{{Role: "user", Content: "Hello!"}},
    })

    fmt.Println(response.Choices[0].Message.Content)
}`}</pre>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open('https://github.com/AINative-Studio/Go-SDK', '_blank', 'noopener,noreferrer')}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View on GitHub
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {filteredTools.length > 0 ? (
              <>
                {/* All Tools by Category */}
                <div className="space-y-12">
                  {(['development', 'testing', 'deployment', 'monitoring', 'integrations', 'learning'] as CategoryKey[]).map(category => {
                    const categoryTools = filteredTools.filter(tool => tool.category === category);
                    if (categoryTools.length === 0) return null;

                    return (
                      <div key={category}>
                        <h3 className="text-xl font-semibold mb-6 flex items-center">
                          <div className="h-px bg-gradient-to-r from-primary/50 to-transparent flex-1 mr-4" />
                          {categoryNames[category]}
                          <div className="h-px bg-gradient-to-l from-primary/50 to-transparent flex-1 ml-4" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {categoryTools.map((tool, index) => {
                            const Icon = tool.icon;
                            return (
                              <Card key={`${category}-${index}`} className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                                      {tool.external && (
                                        <span className="inline-flex items-center text-xs text-muted-foreground">
                                          <Network className="h-3 w-3 mr-1" />
                                          External
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                  <p className="text-muted-foreground flex-1">{tool.description}</p>
                                  {tool.link && (
                                    tool.external ? (
                                      <Button
                                        variant="outline"
                                        className="mt-4 w-full"
                                        onClick={() => window.open(tool.link, '_blank', 'noopener,noreferrer')}
                                      >
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        View on GitHub
                                      </Button>
                                    ) : (
                                      <Link href={tool.link} className="mt-4">
                                        <Button
                                          variant="outline"
                                          className="w-full"
                                        >
                                          <ArrowRight className="h-4 w-4 mr-2" />
                                          View Details
                                        </Button>
                                      </Link>
                                    )
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No tools found</h3>
                <p className="mt-1 text-muted-foreground">
                  We couldn&apos;t find any tools matching your search.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* API Key CTA Section */}
        <div className="mt-16 p-8 rounded-xl bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800/50 border border-primary/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4">
              <KeyIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Ready to start building?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get your API key and start integrating our powerful AI capabilities into your applications today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="px-8"
                onClick={() => setShowApiKeyModal(true)}
              >
                Get Your API Key
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                asChild
              >
                <a href="https://api.ainative.studio/docs-enhanced#/" target="_blank" rel="noopener noreferrer">
                  View Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && <ApiKeyModal />}
    </div>
  );
}
