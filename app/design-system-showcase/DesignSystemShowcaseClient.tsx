'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  Palette,
  Code2,
  Download,
  Terminal,
  Rocket,
  Zap,
  Box,
  Eye,
  Copy,
  Check,
  AlertCircle,
  Info,
  ChevronRight,
  Home,
  User,
  Settings,
  Bell,
  Cpu,
  Lock,
  Globe,
  Database,
  TestTube2,
  Workflow,
  Shield,
  Package,
  Server,
  Layers,
  Video,
  Wrench,
  BookOpen,
} from 'lucide-react';
import {
  CardAdvanced,
  CardAdvancedHeader,
  CardAdvancedTitle,
  CardAdvancedDescription,
  CardAdvancedContent,
} from '@/components/ui/card-advanced';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  SkeletonBranded,
  BlogPostCardSkeleton,
  DashboardStatCardSkeleton,
} from '@/components/ui/skeleton-branded';
import {
  Spinner,
  SpinnerDots,
  SpinnerPulse,
} from '@/components/ui/spinner-branded';
import { GradientText, GradientBorder } from '@/components/ui/gradient-text';
import RLHFFeedback from '@/components/RLHFFeedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputBranded } from '@/components/ui/input-branded';
import { Textarea } from '@/components/ui/textarea';
import { TextareaBranded } from '@/components/ui/textarea-branded';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

// All published NPM packages under ainative-studio profile
const AI_KIT_PACKAGES = [
  // SDKs
  {
    name: '@ainative/sdk',
    description: 'Official TypeScript/JavaScript SDK for AINative Studio APIs',
    icon: Package,
    category: 'SDK',
  },
  {
    name: '@ainative/react-sdk',
    description: 'Official React SDK - hooks for chat completions and credit management',
    icon: Code2,
    category: 'SDK',
  },
  {
    name: '@ainative/next-sdk',
    description: 'Official Next.js SDK - server and client utilities for App Router and Pages Router',
    icon: Globe,
    category: 'SDK',
  },
  {
    name: '@ainative/vue-sdk',
    description: 'Official Vue SDK - composables for chat completions and credit management',
    icon: Code2,
    category: 'SDK',
  },
  {
    name: '@ainative/svelte-sdk',
    description: 'Official Svelte SDK - stores and actions for chat completions and credit management',
    icon: Code2,
    category: 'SDK',
  },
  // MCP Servers
  {
    name: 'ainative-zerodb-mcp-server',
    description: '69 operations for vector search, free embeddings, quantum compression, NoSQL, PostgreSQL, files, events, RLHF, and persistent memory for AI agents',
    icon: Server,
    category: 'MCP',
  },
  {
    name: 'ainative-zerodb-memory-mcp',
    description: '6 optimized tools for agent memory with smart context management, semantic search, and automatic pruning. 92% smaller than monolithic server',
    icon: Server,
    category: 'MCP',
  },
  {
    name: 'ainative-strapi-mcp-server',
    description: 'MCP server for Strapi CMS - AI-powered content management with natural language. Create, manage, and publish blog posts through AI agents',
    icon: Server,
    category: 'MCP',
  },
  {
    name: 'ainative-design-system-mcp-server',
    description: 'AINative Design System MCP Server for Claude Code - extract design tokens, analyze components, and generate themes',
    icon: Server,
    category: 'MCP',
  },
  // AI Kit Core
  {
    name: '@ainative/ai-kit-core',
    description: 'Framework-agnostic core for AI Kit - streaming, agents, state management, and LLM primitives',
    icon: Cpu,
    category: 'Core',
  },
  {
    name: '@ainative-studio/aikit-core',
    description: 'Core AI agent orchestration framework with tool calling and streaming support',
    icon: Cpu,
    category: 'Core',
  },
  {
    name: '@ainative/ai-kit-tools',
    description: 'Built-in tools for agents including web search, calculator, code interpreter, and more',
    icon: Box,
    category: 'Core',
  },
  // AI Kit Frameworks
  {
    name: '@ainative/ai-kit',
    description: 'AI Kit - React hooks and components for building AI-powered applications',
    icon: Code2,
    category: 'Framework',
  },
  {
    name: '@ainative/aikit-react',
    description: 'React components for AI-powered streaming interfaces',
    icon: Code2,
    category: 'Framework',
  },
  {
    name: '@ainative/ai-kit-vue',
    description: 'Vue 3 composables for building AI-powered applications',
    icon: Code2,
    category: 'Framework',
  },
  {
    name: '@ainative/ai-kit-svelte',
    description: 'Svelte stores and actions for building AI-powered applications',
    icon: Code2,
    category: 'Framework',
  },
  {
    name: '@ainative/ai-kit-nextjs',
    description: 'Next.js utilities and helpers for AI-powered applications',
    icon: Globe,
    category: 'Framework',
  },
  // UI/UX
  {
    name: '@ainative/ai-kit-design-system',
    description: 'AI Kit - Design System MCP integration with pre-built UI components and design tokens',
    icon: Palette,
    category: 'UI/UX',
  },
  // Data
  {
    name: '@ainative/ai-kit-zerodb',
    description: 'AI Kit - AINative ZeroDB integration for vector storage and memory',
    icon: Database,
    category: 'Data',
  },
  {
    name: '@ainative/zerodb-mcp-client',
    description: 'Production-ready TypeScript/JavaScript client for ZeroDB MCP Bridge',
    icon: Database,
    category: 'Data',
  },
  // Security
  {
    name: '@ainative/ai-kit-auth',
    description: 'AINative authentication integration for AI applications',
    icon: Lock,
    category: 'Security',
  },
  {
    name: '@ainative/ai-kit-safety',
    description: 'Safety features: prompt injection detection, PII filtering, content moderation',
    icon: Shield,
    category: 'Security',
  },
  // DevTools
  {
    name: '@ainative/ai-kit-cli',
    description: 'CLI tool for scaffolding and managing AI-powered applications',
    icon: Terminal,
    category: 'DevTools',
  },
  {
    name: '@ainative/ai-kit-testing',
    description: 'Testing utilities and fixtures for AI applications',
    icon: TestTube2,
    category: 'DevTools',
  },
  {
    name: '@ainative/ai-kit-observability',
    description: 'Usage tracking, monitoring, cost alerts, and observability for LLM applications',
    icon: Eye,
    category: 'DevTools',
  },
  {
    name: '@ainative/ai-kit-video',
    description: 'Video processing utilities including recording and transcription',
    icon: Video,
    category: 'DevTools',
  },
  // ML
  {
    name: '@ainative/ai-kit-rlhf',
    description: 'AINative RLHF (Reinforcement Learning from Human Feedback) integration',
    icon: Workflow,
    category: 'ML',
  },
  // Skills
  {
    name: '@ainative/skill-mcp-development',
    description: 'MCP server development patterns extending Anthropic\'s mcp-builder with AINative-specific conventions for building tool-based AI systems',
    icon: BookOpen,
    category: 'Skills',
  },
  {
    name: '@ainative/skill-testing-patterns',
    description: 'TDD/BDD workflows for FastAPI + React stack with pytest, vitest, and integration testing',
    icon: TestTube2,
    category: 'Skills',
  },
  {
    name: '@ainative/skill-railway-deployment',
    description: 'Railway deployment workflows, nixpacks configuration, environment management, and production troubleshooting',
    icon: Rocket,
    category: 'Skills',
  },
  {
    name: '@ainative/skill-api-design',
    description: 'FastAPI best practices, Pydantic models, RESTful endpoint design, error handling, and authentication patterns',
    icon: Wrench,
    category: 'Skills',
  },
  {
    name: '@ainative/skill-zerodb-workflows',
    description: 'ZeroDB vector database best practices, semantic search patterns, RLHF workflows, and memory management',
    icon: Layers,
    category: 'Skills',
  },
];

const COMPONENT_EXAMPLES = [
  {
    title: 'Advanced Cards',
    component: 'CardAdvanced',
    code: `<CardAdvanced variant="glassmorphism" hoverEffect="lift">
  <CardAdvancedHeader>
    <CardAdvancedTitle>Your Title</CardAdvancedTitle>
    <CardAdvancedDescription>Description here</CardAdvancedDescription>
  </CardAdvancedHeader>
  <CardAdvancedContent>
    Content goes here...
  </CardAdvancedContent>
</CardAdvanced>`,
  },
  {
    title: 'Gradient Text',
    component: 'GradientText',
    code: `<GradientText
  variant="rainbow"
  size="4xl"
  animated
>
  Awesome Gradient Text
</GradientText>`,
  },
  {
    title: 'Loading Spinners',
    component: 'Spinner',
    code: `<Spinner size="lg" variant="primary" />
<SpinnerDots variant="accent" />
<SpinnerPulse size="md" />`,
  },
  {
    title: 'Skeleton Loaders',
    component: 'SkeletonBranded',
    code: `<BlogPostCardSkeleton />
<DashboardStatCardSkeleton />
<TableRowSkeleton columns={4} />`,
  },
];

export default function DesignSystemShowcaseClient() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [progress] = useState(66);
  const [selectedFramework, setSelectedFramework] = useState('react');

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // All categories from published NPM packages
  // All categories from published NPM packages
  const categories = ['All', 'SDK', 'MCP', 'Core', 'Framework', 'UI/UX', 'Data', 'Security', 'DevTools', 'ML', 'Skills'];
  const filteredPackages = selectedCategory === 'All'
    ? AI_KIT_PACKAGES
    : AI_KIT_PACKAGES.filter(pkg => pkg.category === selectedCategory);

  const getGitHubUrl = (pkgName: string) => {
    if (pkgName.startsWith('ainative-zerodb-mcp-server') || pkgName === 'ainative-zerodb-memory-mcp') {
      return 'https://github.com/AINative-Studio/zerodb-mcp-server';
    }
    if (pkgName === 'ainative-strapi-mcp-server') {
      return 'https://github.com/AINative-Studio/strapi-mcp-server';
    }
    if (pkgName === 'ainative-design-system-mcp-server') {
      return 'https://github.com/AINative-Studio/design-system-mcp';
    }
    if (pkgName.startsWith('@ainative/sdk') || pkgName.startsWith('@ainative/react-sdk') || pkgName.startsWith('@ainative/next-sdk') || pkgName.startsWith('@ainative/vue-sdk') || pkgName.startsWith('@ainative/svelte-sdk')) {
      return 'https://github.com/AINative-Studio/ainative-sdk';
    }
    if (pkgName.startsWith('@ainative/zerodb-mcp-client')) {
      return 'https://github.com/AINative-Studio/zerodb-mcp-client';
    }
    if (pkgName.startsWith('@ainative/skill-')) {
      const slug = pkgName.replace('@ainative/skill-', '');
      return `https://github.com/AINative-Studio/skills/tree/main/${slug}`;
    }
    if (pkgName.startsWith('@ainative/aikit-react') || pkgName === '@ainative-studio/aikit-core') {
      return 'https://github.com/AINative-Studio/aikit-react';
    }
    // Default: ai-kit monorepo
    const slug = pkgName.includes('/') ? pkgName.split('/')[1] : pkgName;
    return `https://github.com/AINative-Studio/ai-kit/tree/main/packages/${slug}`;
  };

  return (
    <div className="min-h-screen bg-vite-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0D1117] via-[#161B22] to-[#0D1117] py-28 pt-36">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8 max-w-5xl mx-auto"
          >
            <GradientText variant="rainbow" size="display-2" as="h1" animated className="font-bold leading-tight">
              Build Stunning AI-Native Interfaces
            </GradientText>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Production-ready design system with <strong className="text-foreground">AINative Design MCP server</strong>,
              <strong className="text-foreground"> NPM packages</strong>, <strong className="text-foreground">UI components</strong>, and premium AI primitives.
              Ship beautiful AI applications 10x faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/ai-kit">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#5867EF] to-[#8A63F4] hover:opacity-90 text-foreground px-8 gap-2"
                >
                  <Download className="w-5 h-5" />
                  Explore AI Kit
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-[#5867EF]/30 text-foreground hover:bg-[#5867EF]/10 px-8 gap-2"
                onClick={() => {
                  const mcpSection = document.getElementById('mcp-server');
                  mcpSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Terminal className="w-5 h-5" />
                Install MCP Server
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MCP Server Section */}
      <section id="mcp-server" className="py-20 bg-[#161B22]/50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <GradientText variant="primary" size="display-3" as="h2" className="font-bold">
                AINative Design MCP Server
              </GradientText>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Instant access to design tokens, components, and AI-powered design assistance through Claude Desktop
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Installation */}
              <CardAdvanced variant="glassmorphism" hoverEffect="lift">
                <CardAdvancedHeader>
                  <CardAdvancedTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#5867EF]" />
                    Quick Installation
                  </CardAdvancedTitle>
                  <CardAdvancedDescription>
                    Get started in seconds with NPM
                  </CardAdvancedDescription>
                </CardAdvancedHeader>
                <CardAdvancedContent>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                    <div className="text-muted-foreground"># Install globally</div>
                    <div className="text-green-400">npm install -g @ainative/design-mcp</div>
                    <div className="mt-3 text-muted-foreground"># Or with Claude Desktop</div>
                    <div className="text-green-400">claude mcp add @ainative/design-mcp</div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Auto-syncs with Claude Desktop</span>
                  </div>
                </CardAdvancedContent>
              </CardAdvanced>

              {/* Features */}
              <CardAdvanced variant="gradient-border" hoverEffect="glow">
                <CardAdvancedHeader>
                  <CardAdvancedTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#8A63F4]" />
                    MCP Features
                  </CardAdvancedTitle>
                  <CardAdvancedDescription>
                    Powerful design assistance at your fingertips
                  </CardAdvancedDescription>
                </CardAdvancedHeader>
                <CardAdvancedContent>
                  <div className="space-y-3">
                    {[
                      'Extract design tokens from Figma, Sketch, CSS',
                      'Generate component code from designs',
                      'AI-powered color palette generation',
                      'Accessibility compliance checking',
                      'Real-time design system validation',
                      'Component library analysis',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-[#5867EF] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardAdvancedContent>
              </CardAdvanced>
            </div>
          </div>
        </div>
      </section>

      {/* AI Kit Packages */}
      <section className="py-20 bg-vite-bg">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <GradientText variant="secondary" size="display-3" as="h2" className="font-bold">
              32 Production-Ready NPM Packages
            </GradientText>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              SDKs, MCP servers, AI Kit frameworks for React, Vue, Svelte, Next.js, and developer skill packs
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category
                  ? 'bg-[#5867EF] text-foreground'
                  : 'border-vite-border text-muted-foreground hover:border-[#5867EF]/50'
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredPackages.map((pkg, index) => {
              const Icon = pkg.icon;
              return (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CardAdvanced variant="default" hoverEffect="lift-glow" interactive>
                    <CardAdvancedHeader>
                      <div className="flex items-start justify-between">
                        <div className="bg-[#5867EF]/10 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-[#5867EF]" />
                        </div>
                        <Badge className="bg-[#0D1117] border border-white/10 text-muted-foreground text-xs">
                          {pkg.category}
                        </Badge>
                      </div>
                      <CardAdvancedTitle className="text-base mt-3">
                        {pkg.name}
                      </CardAdvancedTitle>
                      <CardAdvancedDescription className="text-xs">
                        {pkg.description}
                      </CardAdvancedDescription>
                    </CardAdvancedHeader>
                    <CardAdvancedContent>
                      <div className="flex gap-2 pt-2">
                        <a
                          href={`https://www.npmjs.com/package/${pkg.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs border-vite-border hover:border-[#5867EF]"
                          >
                            NPM
                          </Button>
                        </a>
                        <a
                          href={getGitHubUrl(pkg.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs border-vite-border hover:border-[#5867EF]"
                          >
                            GitHub
                          </Button>
                        </a>
                      </div>
                    </CardAdvancedContent>
                  </CardAdvanced>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Component Library Showcase */}
      <section className="py-20 bg-[#161B22]/50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <GradientText variant="rainbow" size="display-3" as="h2" className="font-bold">
                Complete Component Library
              </GradientText>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                57+ production-ready components with live demos and copy-paste code
              </p>
            </div>

            <Tabs defaultValue="forms" className="w-full">
              <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full max-w-4xl mx-auto mb-12 bg-vite-bg">
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="navigation" className="hidden md:block">Navigation</TabsTrigger>
                <TabsTrigger value="overlay" className="hidden md:block">Overlay</TabsTrigger>
                <TabsTrigger value="branded" className="hidden md:block">Branded</TabsTrigger>
              </TabsList>

              {/* FORMS TAB */}
              <TabsContent value="forms" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Input */}
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Input & Input Branded</CardTitle>
                      <CardDescription>Text input fields with variants</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Standard Input</Label>
                        <Input placeholder="Enter your name..." className="bg-vite-bg text-foreground border-vite-border" />
                      </div>
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Branded Input</Label>
                        <InputBranded placeholder="Enhanced input with branding..." />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Textarea */}
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Textarea & Textarea Branded</CardTitle>
                      <CardDescription>Multi-line text input areas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Standard Textarea</Label>
                        <Textarea placeholder="Enter your message..." className="bg-vite-bg text-foreground border-vite-border" />
                      </div>
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Branded Textarea</Label>
                        <TextareaBranded placeholder="Enhanced textarea..." />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Select */}
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Select Dropdown</CardTitle>
                      <CardDescription>Dropdown selection component</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Label className="text-muted-foreground mb-2 block">Choose Framework</Label>
                      <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                        <SelectTrigger className="bg-vite-bg text-foreground border-vite-border">
                          <SelectValue placeholder="Select framework" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="vue">Vue</SelectItem>
                          <SelectItem value="svelte">Svelte</SelectItem>
                          <SelectItem value="angular">Angular</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Switch & Slider */}
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Switch & Slider</CardTitle>
                      <CardDescription>Toggle and range inputs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground">Enable notifications</Label>
                        <Switch checked={switchChecked} onCheckedChange={setSwitchChecked} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-foreground">Volume</Label>
                          <span className="text-sm text-muted-foreground">{sliderValue[0]}%</span>
                        </div>
                        <Slider
                          value={sliderValue}
                          onValueChange={setSliderValue}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* FEEDBACK TAB */}
              <TabsContent value="feedback" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Alerts */}
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Alert</CardTitle>
                      <CardDescription>Contextual alert messages</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert variant="default" className="bg-vite-bg border-vite-border">
                        <Info className="h-4 w-4 text-[#5867EF]" />
                        <AlertTitle className="text-foreground">Information</AlertTitle>
                        <AlertDescription className="text-muted-foreground">
                          This is an informational alert message.
                        </AlertDescription>
                      </Alert>
                      <Alert variant="destructive" className="bg-red-950/20 border-red-900">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          Something went wrong with your request.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Progress */}
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Progress</CardTitle>
                      <CardDescription>Progress bar indicators</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Upload progress</span>
                          <span className="text-sm text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Spinners */}
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Spinner Variants</CardTitle>
                      <CardDescription>Loading state indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-8 justify-center py-4">
                        <div className="text-center">
                          <Spinner size="md" variant="primary" />
                          <p className="text-xs text-muted-foreground mt-2">Spinner</p>
                        </div>
                        <div className="text-center">
                          <SpinnerDots variant="primary" />
                          <p className="text-xs text-muted-foreground mt-2">Dots</p>
                        </div>
                        <div className="text-center">
                          <SpinnerPulse size="md" />
                          <p className="text-xs text-muted-foreground mt-2">Pulse</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skeletons */}
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Skeleton Loaders</CardTitle>
                      <CardDescription>Content loading placeholders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <BlogPostCardSkeleton />
                      <DashboardStatCardSkeleton />
                    </CardContent>
                  </Card>
                </div>

                {/* RLHF Feedback Component */}
                <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">RLHF Feedback Component</CardTitle>
                    <CardDescription>Reinforcement Learning from Human Feedback UI</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-vite-bg rounded-lg p-6 border border-vite-border">
                      <h4 className="text-foreground font-medium mb-2">Agent Output Example</h4>
                      <p className="text-muted-foreground text-sm mb-4">
                        The code refactoring was completed using TypeScript strict mode.
                      </p>
                      <RLHFFeedback
                        stepNumber={1}
                        stepName="Code Refactoring"
                        prompt="Refactor the component to use TypeScript"
                        response="Successfully refactored to TypeScript with strict typing"
                        projectId="demo-project"
                        workflowId="demo-workflow"
                        agentId="agent-001"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* LAYOUT TAB */}
              <TabsContent value="layout" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Accordion</CardTitle>
                      <CardDescription>Collapsible content sections</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-vite-border">
                          <AccordionTrigger className="text-foreground hover:text-foreground">
                            What is AINative Studio?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            AINative Studio is a comprehensive platform for building AI-native applications.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-vite-border">
                          <AccordionTrigger className="text-foreground hover:text-foreground">
                            How many components are included?
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            The AI Kit includes 57+ production-ready UI components across 14 NPM packages.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Separator</CardTitle>
                      <CardDescription>Divider lines for content sections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Section 1</p>
                      <Separator className="bg-[#2D333B]" />
                      <p className="text-sm text-muted-foreground">Section 2</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* DATA TAB */}
              <TabsContent value="data" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Badge</CardTitle>
                      <CardDescription>Labels and status indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge className="bg-[#5867EF] text-foreground">Custom</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Avatar</CardTitle>
                      <CardDescription>User profile images with fallbacks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback className="bg-[#5867EF] text-foreground">JD</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#8A63F4] text-foreground">AI</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-foreground">Table</CardTitle>
                      <CardDescription>Data tables with styling</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-vite-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-vite-border hover:bg-vite-bg">
                              <TableHead className="text-muted-foreground">Package</TableHead>
                              <TableHead className="text-muted-foreground">Downloads</TableHead>
                              <TableHead className="text-muted-foreground">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-vite-border hover:bg-vite-bg">
                              <TableCell className="text-foreground">@ainative/ai-kit</TableCell>
                              <TableCell className="text-muted-foreground">12.5K</TableCell>
                              <TableCell>
                                <Badge className="bg-green-900/20 text-green-400 border-green-800">Active</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow className="border-vite-border hover:bg-vite-bg">
                              <TableCell className="text-foreground">@ainative/ai-kit-nextjs</TableCell>
                              <TableCell className="text-muted-foreground">8.3K</TableCell>
                              <TableCell>
                                <Badge className="bg-green-900/20 text-green-400 border-green-800">Active</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* NAVIGATION TAB */}
              <TabsContent value="navigation" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Breadcrumb</CardTitle>
                      <CardDescription>Navigation hierarchy indicator</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <nav className="flex items-center space-x-2 text-sm">
                        <a href="#" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          Home
                        </a>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                        <a href="#" className="text-muted-foreground hover:text-foreground">Documentation</a>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                        <span className="text-foreground">Components</span>
                      </nav>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Button</CardTitle>
                      <CardDescription>Interactive button components</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Button>Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* OVERLAY TAB */}
              <TabsContent value="overlay" className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Tooltip</CardTitle>
                      <CardDescription>Hover information popups</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline">Hover me</Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This is a helpful tooltip!</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-foreground">Dropdown Menu</CardTitle>
                      <CardDescription>Contextual action menus</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">Open Menu</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1C2128] border-vite-border">
                          <DropdownMenuItem className="text-foreground hover:bg-vite-bg">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground hover:bg-vite-bg">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* BRANDED TAB */}
              <TabsContent value="branded" className="space-y-8">
                <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">Gradient Text</CardTitle>
                    <CardDescription>Animated gradient text effects</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-center">
                    <GradientText variant="primary" size="title-1">Primary Gradient</GradientText>
                    <GradientText variant="secondary" size="title-1">Secondary Gradient</GradientText>
                    <GradientText variant="rainbow" size="title-1" animated>Animated Rainbow</GradientText>
                  </CardContent>
                </Card>

                <Card className="bg-[#161B22] border border-white/5 shadow-sm shadow-black/20 hover:border-[#4B6FED]/30 transition-all rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">CardAdvanced Variants</CardTitle>
                    <CardDescription>All card styles and hover effects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <CardAdvanced variant="glassmorphism" hoverEffect="lift">
                        <CardAdvancedHeader>
                          <CardAdvancedTitle className="text-sm">Glassmorphism</CardAdvancedTitle>
                          <CardAdvancedDescription className="text-xs">Frosted glass</CardAdvancedDescription>
                        </CardAdvancedHeader>
                      </CardAdvanced>

                      <CardAdvanced variant="gradient-border" hoverEffect="glow">
                        <CardAdvancedHeader>
                          <CardAdvancedTitle className="text-sm">Gradient Border</CardAdvancedTitle>
                          <CardAdvancedDescription className="text-xs">Animated outline</CardAdvancedDescription>
                        </CardAdvancedHeader>
                      </CardAdvanced>

                      <CardAdvanced variant="default" hoverEffect="lift-glow" interactive>
                        <CardAdvancedHeader>
                          <CardAdvancedTitle className="text-sm">Lift + Glow</CardAdvancedTitle>
                          <CardAdvancedDescription className="text-xs">Combined effects</CardAdvancedDescription>
                        </CardAdvancedHeader>
                      </CardAdvanced>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-20 bg-vite-bg">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <GradientText variant="accent" size="display-3" as="h2" className="font-bold">
                Copy-Paste Ready Examples
              </GradientText>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Start building immediately with production-ready code snippets
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {COMPONENT_EXAMPLES.map((example, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{example.title}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(example.code, index)}
                      className="gap-2"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-foreground">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#0D1117] to-[#161B22]">
        <div className="container mx-auto px-6">
          <GradientBorder variant="rainbow" borderWidth="2" className="max-w-4xl mx-auto">
            <div className="bg-vite-bg p-12 text-center space-y-6">
              <GradientText variant="rainbow" size="display-3" as="h2" className="font-bold">
                Ready to Build?
              </GradientText>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of developers building beautiful AI-native applications
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/ai-kit">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#5867EF] to-[#8A63F4] hover:opacity-90 text-foreground px-8 gap-2"
                  >
                    <Rocket className="w-5 h-5" />
                    Get Started with AI Kit
                  </Button>
                </Link>
                <a
                  href="https://github.com/AINative-Studio/design-system"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-vite-border text-foreground hover:bg-white/5 px-8 gap-2"
                  >
                    <Code2 className="w-5 h-5" />
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </GradientBorder>
        </div>
      </section>
    </div>
  );
}
