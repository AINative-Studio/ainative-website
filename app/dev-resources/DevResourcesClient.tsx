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
  Image,
  Volume2,
  BarChart2,
  FileCode,
  GraduationCap
} from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string;
  path: string;
  description: string;
}

// Developer tools are defined in the developerTools array below

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
    name: 'API Explorer',
    icon: Code2,
    description: 'Interactive API documentation with live testing capabilities and request building',
    link: '/api-explorer',
    category: 'development'
  },
  {
    name: 'SDK Library',
    icon: Code,
    description: 'Client libraries for Python, JavaScript, Java, C#, and other popular languages',
    link: '/sdk',
    category: 'development'
  },
  {
    name: 'CLI Tool',
    icon: TerminalIcon,
    description: 'Command line interface for interacting with the platform and managing resources',
    link: '/cli',
    category: 'development'
  },
  {
    name: 'VS Code Extension',
    icon: Code2,
    description: 'Official VS Code extension for AI-assisted development',
    link: '/vscode',
    category: 'development'
  },

  // Testing Tools
  {
    name: 'Testing Sandbox',
    icon: TestTube2Icon,
    description: 'Safe environment to test API calls with sample data and mock responses',
    link: '/sandbox',
    category: 'testing'
  },
  {
    name: 'API Fuzzer',
    icon: Bug,
    description: 'Test your API endpoints with generated test cases',
    link: '/fuzzer',
    category: 'testing'
  },

  // Deployment Tools
  {
    name: 'Webhooks',
    icon: Zap,
    description: 'Set up real-time notifications and event-driven workflows',
    link: '/webhooks',
    category: 'deployment'
  },
  {
    name: 'GitHub Action',
    icon: GitBranch,
    description: 'Automate your CI/CD pipeline with our GitHub Action',
    link: '/github-action',
    category: 'deployment'
  },

  // Monitoring & Analytics
  {
    name: 'Status Dashboard',
    icon: ActivityIcon,
    description: 'Real-time status and incident reports for all platform services',
    link: 'https://status.ainative.tech',
    category: 'monitoring'
  },
  {
    name: 'API Analytics',
    icon: BarChart2,
    description: 'Monitor API usage, performance metrics, and error rates',
    link: '/analytics',
    category: 'monitoring'
  },

  // Integration Tools
  {
    name: 'Zapier Integration',
    icon: Zap,
    description: 'Connect with 5,000+ apps through Zapier',
    link: '/zapier',
    category: 'integrations'
  },
  {
    name: 'Slack Bot',
    icon: MessageSquare,
    description: 'Integrate AI capabilities directly into your Slack workspace',
    link: '/slack',
    category: 'integrations'
  },

  // Learning Resources
  {
    name: 'Interactive Tutorials',
    icon: GraduationCap,
    description: 'Step-by-step tutorials to get started with the platform',
    link: '/tutorials',
    category: 'learning'
  },
  {
    name: 'Code Samples',
    icon: FileCode,
    description: 'Ready-to-use code snippets for common use cases',
    link: '/samples',
    category: 'learning'
  }
];

const apiEndpoints = {
  core: {
    title: "Core API",
    description: "Core endpoints for interacting with the platform's main features",
    icon: Cpu,
    endpoints: [
      {
        method: 'GET',
        path: '/v1/models',
        description: 'List all available models with their capabilities and status'
      },
      {
        method: 'GET',
        path: '/v1/models/{model_id}',
        description: 'Retrieve specific model details and configuration'
      },
      {
        method: 'POST',
        path: '/v1/chat/completions',
        description: 'Generate chat completions with conversation history support'
      },
      {
        method: 'POST',
        path: '/v1/completions',
        description: 'Generate text completions for a given prompt'
      },
      {
        method: 'POST',
        path: '/v1/embeddings',
        description: 'Create embeddings for text input'
      },
      {
        method: 'POST',
        path: '/v1/moderations',
        description: 'Check if text violates content policy'
      }
    ]
  },
  files: {
    title: "Files",
    description: "Endpoints for file operations and document processing",
    icon: FileText,
    endpoints: [
      {
        method: 'POST',
        path: '/v1/files',
        description: 'Upload a file for processing or fine-tuning'
      },
      {
        method: 'GET',
        path: '/v1/files',
        description: 'List all files belonging to the user'
      },
      {
        method: 'GET',
        path: '/v1/files/{file_id}',
        description: 'Retrieve a specific file'
      },
      {
        method: 'DELETE',
        path: '/v1/files/{file_id}',
        description: 'Delete a file'
      },
      {
        method: 'GET',
        path: '/v1/files/{file_id}/content',
        description: 'Download the content of a specific file'
      }
    ]
  },
  fineTuning: {
    title: "Fine-tuning",
    description: "Endpoints for fine-tuning models on custom data",
    icon: Brain,
    endpoints: [
      {
        method: 'POST',
        path: '/v1/fine_tuning/jobs',
        description: 'Create a fine-tuning job'
      },
      {
        method: 'GET',
        path: '/v1/fine_tuning/jobs',
        description: 'List all fine-tuning jobs'
      },
      {
        method: 'GET',
        path: '/v1/fine_tuning/jobs/{job_id}',
        description: 'Retrieve a specific fine-tuning job'
      },
      {
        method: 'POST',
        path: '/v1/fine_tuning/jobs/{job_id}/cancel',
        description: 'Cancel a running fine-tuning job'
      },
      {
        method: 'GET',
        path: '/v1/fine_tuning/jobs/{job_id}/events',
        description: 'List events for a fine-tuning job'
      }
    ]
  },
  assistants: {
    title: "Assistants",
    description: "Endpoints for creating and managing AI assistants",
    icon: MessageSquare,
    endpoints: [
      {
        method: 'POST',
        path: '/v1/assistants',
        description: 'Create an assistant with specific instructions and capabilities'
      },
      {
        method: 'GET',
        path: '/v1/assistants',
        description: 'List all assistants'
      },
      {
        method: 'GET',
        path: '/v1/assistants/{assistant_id}',
        description: 'Retrieve a specific assistant'
      },
      {
        method: 'POST',
        path: '/v1/assistants/{assistant_id}',
        description: 'Modify an existing assistant'
      },
      {
        method: 'DELETE',
        path: '/v1/assistants/{assistant_id}',
        description: 'Delete an assistant'
      },
      {
        method: 'POST',
        path: '/v1/threads',
        description: 'Create a thread for conversation'
      },
      {
        method: 'POST',
        path: '/v1/threads/{thread_id}/runs',
        description: 'Create a run in a thread'
      },
      {
        method: 'GET',
        path: '/v1/threads/{thread_id}/runs/{run_id}',
        description: 'Retrieve a run'
      },
      {
        method: 'POST',
        path: '/v1/threads/{thread_id}/runs/{run_id}/submit_tool_outputs',
        description: 'Submit tool outputs for a run'
      }
    ]
  },
  audio: {
    title: "Audio",
    description: "Endpoints for audio processing and generation",
    icon: Volume2,
    endpoints: [
      {
        method: 'POST',
        path: '/v1/audio/transcriptions',
        description: 'Transcribe audio into the input language'
      },
      {
        method: 'POST',
        path: '/v1/audio/translations',
        description: 'Translate audio into English'
      },
      {
        method: 'POST',
        path: '/v1/audio/speech',
        description: 'Generate audio from text input'
      }
    ]
  },
  images: {
    title: "Images",
    description: "Endpoints for image generation and editing",
    icon: Image,
    endpoints: [
      {
        method: 'POST',
        path: '/v1/images/generations',
        description: 'Generate images from text prompts'
      },
      {
        method: 'POST',
        path: '/v1/images/edits',
        description: 'Edit an image based on a prompt'
      },
      {
        method: 'POST',
        path: '/v1/images/variations',
        description: 'Create variations of an image'
      }
    ]
  },
  users: {
    title: "User Management",
    icon: Users,
    description: "Endpoints for user management",
    endpoints: [
      { method: 'GET', path: '/api/v1/users', description: 'Get all users' },
      { method: 'POST', path: '/api/v1/users', description: 'Create a new user' },
      { method: 'GET', path: '/api/v1/users/{user_id}', description: 'Get user by ID' },
      { method: 'PUT', path: '/api/v1/users/{user_id}', description: 'Update user by ID' },
      { method: 'DELETE', path: '/api/v1/users/{user_id}', description: 'Delete user by ID' }
    ]
  },
  auth: {
    title: "Authentication",
    icon: Shield,
    description: "User authentication and session management",
    endpoints: [
      { method: 'POST', path: '/api/v1/auth/login', description: 'User login' },
      { method: 'POST', path: '/api/v1/auth/register', description: 'User registration' },
      { method: 'POST', path: '/api/v1/auth/logout', description: 'User logout' },
      { method: 'GET', path: '/api/v1/auth/me', description: 'Get current user info' }
    ]
  },
  // UI Design Resources section is defined below
  ai: {
    title: "AI Services",
    icon: Brain,
    description: "AI model and chat endpoints",
    endpoints: [
      { method: 'GET', path: '/api/v1/ai/models', description: 'Get available AI models' },
      { method: 'POST', path: '/api/v1/ai/chat', description: 'Chat with AI' },
      { method: 'POST', path: '/api/v1/ai/analyze', description: 'Analyze code with AI' },
      { method: 'POST', path: '/api/v1/ai/generate', description: 'Generate content with AI' },
      { method: 'GET', path: '/api/v1/ai/status', description: 'Get AI service status' }
    ]
  },
  quantum: {
    title: "Quantum Computing",
    icon: Zap,
    description: "Quantum computing endpoints",
    endpoints: [
      { method: 'GET', path: '/api/v1/quantum/info', description: 'Get quantum computing info' },
      { method: 'POST', path: '/api/v1/quantum/execute', description: 'Execute quantum circuit' },
      { method: 'GET', path: '/api/v1/quantum/jobs/{job_id}', description: 'Get quantum job status' },
      { method: 'GET', path: '/api/v1/quantum/backends', description: 'List available quantum backends' },
      { method: 'GET', path: '/api/v1/quantum/benchmarks', description: 'Get quantum benchmark results' }
    ]
  },
  memory: {
    title: "Memory Management",
    icon: Database,
    description: "Memory and session management",
    endpoints: [
      { method: 'GET', path: '/api/v1/memory/sessions', description: 'Get memory sessions' },
      { method: 'POST', path: '/api/v1/memory/store', description: 'Store memory' },
      { method: 'GET', path: '/api/v1/memory', description: 'Get memory info' },
      { method: 'GET', path: '/api/v1/memory/{session_id}', description: 'Get memory session by ID' },
      { method: 'POST', path: '/api/v1/memory/search', description: 'Search memory' }
    ]
  },
  deployment: {
    title: "Deployment",
    icon: Code,
    description: "Deployment templates and management",
    endpoints: [
      { method: 'GET', path: '/api/v1/deployment-templates', description: 'Get deployment templates' },
      { method: 'POST', path: '/api/v1/deployment-templates', description: 'Create deployment template' },
      { method: 'GET', path: '/api/v1/deployment-templates/{template_id}', description: 'Get deployment template by ID' },
      { method: 'PUT', path: '/api/v1/deployment-templates/{template_id}', description: 'Update deployment template' },
      { method: 'DELETE', path: '/api/v1/deployment-templates/{template_id}', description: 'Delete deployment template' }
    ]
  },
  webhooks: {
    title: "Webhooks",
    icon: Network,
    description: "Webhook management",
    endpoints: [
      { method: 'GET', path: '/api/v1/webhooks', description: 'List webhooks' },
      { method: 'POST', path: '/api/v1/webhooks', description: 'Create webhook' },
      { method: 'GET', path: '/api/v1/webhooks/{webhook_id}', description: 'Get webhook' },
      { method: 'PUT', path: '/api/v1/webhooks/{webhook_id}', description: 'Update webhook' },
      { method: 'DELETE', path: '/api/v1/webhooks/{webhook_id}', description: 'Delete webhook' },
      { method: 'POST', path: '/api/v1/webhooks/test', description: 'Test webhook' },
      { method: 'GET', path: '/api/v1/webhooks/events', description: 'List webhook events' }
    ]
  },
  tasks: {
    title: "Tasks",
    icon: CheckCircle,
    description: "Task management",
    endpoints: [
      { method: 'GET', path: '/api/v1/tasks', description: 'Get tasks' },
      { method: 'POST', path: '/api/v1/tasks', description: 'Create task' },
      { method: 'GET', path: '/api/v1/tasks/{task_id}', description: 'Get task by ID' },
      { method: 'PUT', path: '/api/v1/tasks/{task_id}', description: 'Update task' },
      { method: 'DELETE', path: '/api/v1/tasks/{task_id}', description: 'Delete task' }
    ]
  },
  git: {
    title: "Git Integration",
    icon: GitBranch,
    description: "Git repository management",
    endpoints: [
      { method: 'GET', path: '/api/v1/git/repositories', description: 'Get git repositories' },
      { method: 'POST', path: '/api/v1/git/analyze', description: 'Analyze git repository' },
      { method: 'GET', path: '/api/v1/git/commits', description: 'Get repository commits' },
      { method: 'GET', path: '/api/v1/git/branches', description: 'Get repository branches' },
      { method: 'GET', path: '/api/v1/git/status', description: 'Get repository status' }
    ]
  },
  code: {
    title: "Code Tools",
    icon: Code2,
    description: "Code analysis and refactoring",
    endpoints: [
      { method: 'POST', path: '/api/v1/code/refactor', description: 'Refactor code' },
      { method: 'POST', path: '/api/v1/code/format', description: 'Format code' },
      { method: 'POST', path: '/api/v1/code/analyze', description: 'Analyze code' },
      { method: 'POST', path: '/api/v1/code/validate', description: 'Validate code' },
      { method: 'POST', path: '/api/v1/code/test', description: 'Test code' }
    ]
  },
  agents: {
    title: "AI Agents",
    icon: Cpu,
    description: "AI agent management",
    endpoints: [
      { method: 'GET', path: '/api/v1/agents', description: 'Get agents' },
      { method: 'POST', path: '/api/v1/agents', description: 'Create agent' },
      { method: 'GET', path: '/api/v1/agents/{agent_id}', description: 'Get agent by ID' },
      { method: 'PUT', path: '/api/v1/agents/{agent_id}', description: 'Update agent' },
      { method: 'DELETE', path: '/api/v1/agents/{agent_id}', description: 'Delete agent' },
      { method: 'GET', path: '/api/v1/agents/{agent_id}/state', description: 'Get agent state' },
      { method: 'PUT', path: '/api/v1/agents/{agent_id}/state', description: 'Update agent state' },
      { method: 'GET', path: '/api/v1/agents/{agent_id}/logs', description: 'Get agent logs' },
      { method: 'POST', path: '/api/v1/agents/{agent_id}/start', description: 'Start agent' },
      { method: 'POST', path: '/api/v1/agents/{agent_id}/stop', description: 'Stop agent' }
    ]
  },
  chat: {
    title: "Chat",
    icon: MessageSquare,
    description: "Chat and messaging endpoints",
    endpoints: [
      { method: 'GET', path: '/api/v1/chat/sessions', description: 'Get chat sessions' },
      { method: 'POST', path: '/api/v1/chat/sessions', description: 'Create chat session' },
      { method: 'GET', path: '/api/v1/chat/sessions/{session_id}', description: 'Get chat session by ID' },
      { method: 'POST', path: '/api/v1/chat/messages', description: 'Send message' },
      { method: 'GET', path: '/api/v1/chat/messages/{message_id}', description: 'Get message by ID' }
    ]
  },
  codeQuality: {
    title: "Code Quality",
    icon: Code,
    description: "Endpoints for code analysis and improvements",
    endpoints: [
      { method: 'GET', path: '/api/v1/code-quality', description: 'Get code quality overview' },
      { method: 'GET', path: '/api/v1/code-quality/agent', description: 'Get code quality agent status' },
      { method: 'POST', path: '/api/v1/code-quality/fixes', description: 'Get suggested code fixes' },
      { method: 'POST', path: '/api/v1/code-quality/fixes/direct', description: 'Apply code fixes directly' },
      { method: 'GET', path: '/api/v1/code-quality/{analysis_id}', description: 'Get specific analysis results' }
    ]
  },
  debugging: {
    title: "Debugging",
    icon: Bug,
    description: "Endpoints for debugging sessions and analysis",
    endpoints: [
      { method: 'POST', path: '/api/v1/debugging/analyze', description: 'Analyze code for debugging' },
      { method: 'GET', path: '/api/v1/debugging/sessions', description: 'List debugging sessions' },
      { method: 'GET', path: '/api/v1/debugging/sessions/{session_id}', description: 'Get session details' },
      { method: 'GET', path: '/api/v1/debugging/sessions/{session_id}/details', description: 'Get detailed session info' },
      { method: 'GET', path: '/api/v1/debugging/sessions/{session_id}/steps', description: 'Get debugging steps' },
      { method: 'GET', path: '/api/v1/debugging/sessions/{session_id}/suggestions', description: 'Get debugging suggestions' },
      { method: 'GET', path: '/api/v1/debugging/sessions/{session_id}/test-cases', description: 'Get test cases' },
      { method: 'GET', path: '/api/v1/debugging/steps', description: 'List all debugging steps' },
      { method: 'GET', path: '/api/v1/debugging/steps/{step_id}', description: 'Get specific step details' },
      { method: 'GET', path: '/api/v1/debugging/suggestions', description: 'List all debugging suggestions' },
      { method: 'GET', path: '/api/v1/debugging/test-cases', description: 'List all test cases' }
    ]
  },
  documents: {
    title: "Documents",
    icon: FileText,
    description: "Endpoints for document management and search",
    endpoints: [
      { method: 'GET', path: '/api/v1/documents', description: 'List all documents' },
      { method: 'POST', path: '/api/v1/documents', description: 'Create document' },
      { method: 'GET', path: '/api/v1/documents/{document_id}', description: 'Get document' },
      { method: 'PUT', path: '/api/v1/documents/{document_id}', description: 'Update document' },
      { method: 'DELETE', path: '/api/v1/documents/{document_id}', description: 'Delete document' },
      { method: 'POST', path: '/api/v1/documents/search', description: 'Search documents' }
    ]
  },
  errorAnalysis: {
    title: "Error Analysis",
    icon: Bug,
    description: "Endpoints for error analysis and metrics",
    endpoints: [
      { method: 'GET', path: '/api/v1/error-analysis/errors', description: 'List errors' },
      { method: 'POST', path: '/api/v1/error-analysis/errors', description: 'Report error' },
      { method: 'GET', path: '/api/v1/error-analysis/errors/{error_id}', description: 'Get error details' },
      { method: 'PUT', path: '/api/v1/error-analysis/errors/{error_id}', description: 'Update error' },
      { method: 'DELETE', path: '/api/v1/error-analysis/errors/{error_id}', description: 'Delete error' },
      { method: 'POST', path: '/api/v1/error-analysis/analyze', description: 'Analyze errors' },
      { method: 'GET', path: '/api/v1/error-analysis/metrics', description: 'Get error metrics' }
    ]
  },
  health: {
    title: "Health Checks",
    icon: Shield,
    description: "Endpoints for system health monitoring",
    endpoints: [
      { method: 'GET', path: '/api/v1/health', description: 'Check system health' },
      { method: 'GET', path: '/api/v1/health/', description: 'Detailed health check' }
    ]
  },
  organizations: {
    title: "Organizations",
    icon: Users,
    description: "Endpoints for organization management",
    endpoints: [
      { method: 'GET', path: '/api/v1/organizations', description: 'List all organizations' },
      { method: 'POST', path: '/api/v1/organizations', description: 'Create organization' },
      { method: 'GET', path: '/api/v1/organizations/{organization_id}', description: 'Get organization details' },
      { method: 'PUT', path: '/api/v1/organizations/{organization_id}', description: 'Update organization' },
      { method: 'DELETE', path: '/api/v1/organizations/{organization_id}', description: 'Delete organization' },
      { method: 'GET', path: '/api/v1/organizations/{organization_id}/members', description: 'List organization members' },
      { method: 'GET', path: '/api/v1/organizations/{organization_id}/members/{user_id}', description: 'Get member details' }
    ]
  },
  projects: {
    title: "Projects",
    icon: Folder,
    description: "Endpoints for project management",
    endpoints: [
      { method: 'GET', path: '/api/v1/projects/', description: 'List all projects' },
      { method: 'GET', path: '/api/v1/projects/{project_id}', description: 'Get project details' }
    ]
  },
  // User management is already defined in the 'users' section above
};

// UI Design Resources
const uiDesignResources: Record<string, Section> = {
  designTokens: {
    title: "Design Tokens",
    icon: Code2,
    description: "Design tokens for consistent theming",
    endpoints: [
      { method: 'GET', path: '/api/v1/design-tokens', description: 'Get all design tokens' },
      { method: 'GET', path: '/api/v1/design-tokens/{token}', description: 'Get specific design token' },
    ]
  },
  components: {
    title: "UI Components",
    icon: Code2,
    description: "Reusable UI components",
    endpoints: [
      { method: 'GET', path: '/api/v1/ui/components', description: 'List all UI components' },
      { method: 'GET', path: '/api/v1/ui/components/{component}', description: 'Get component details' },
    ]
  },
  themes: {
    title: "Themes",
    icon: CheckCircle,
    description: "UI theme configurations",
    endpoints: [
      { method: 'GET', path: '/api/v1/ui/themes', description: 'List available themes' },
      { method: 'GET', path: '/api/v1/ui/themes/{theme}', description: 'Get theme details' },
    ]
  }
};

// API Key modal component (outside of render)
interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal = ({ onClose }: ApiKeyModalProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Get Your API Key</h3>
        <button
          onClick={onClose}
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
          <Link href="/signup">
            <Button className="bg-primary text-white hover:bg-primary/90 w-full">
              Sign Up
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default function DevResourcesClient() {
  const [activeTab, setActiveTab] = useState('api');
  const [searchQuery, setSearchQuery] = useState('');
  // API Key modal state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const renderSections = (sections: SectionsRecord): React.ReactNode[] => {
    return Object.entries(sections)
      .filter(([key]) => key !== 'uiDesignResources')
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
              <TabsTrigger value="ui" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                UI Design
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {Object.keys(uiDesignResources).length}
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

          <TabsContent value="ui">
            <AnimatePresence mode="wait">
              <motion.div
                key={`ui-${searchQuery}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {renderSections(uiDesignResources)}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-12"
                >
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
                    <div className="max-w-2xl mx-auto">
                      <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Need help with implementation?</h3>
                      <p className="text-muted-foreground mb-6">
                        Our developer support team is here to help you integrate our components and APIs into your project.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Contact Support
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <FileText className="h-4 w-4" />
                          View Documentation
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="tools" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Developer Tools</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Essential tools and resources to help you build with our platform
              </p>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold text-lg">{tool.name}</h3>
                        </div>
                        <Badge variant="outline" className="mt-2 w-fit">
                          {tool.category}
                        </Badge>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-muted-foreground mb-4 flex-1">{tool.description}</p>
                        <Link href={tool.link} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full mt-auto">
                            Learn more <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
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
              <Link href="/docs" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="px-8">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && <ApiKeyModal onClose={() => setShowApiKeyModal(false)} />}
    </div>
  );
}
