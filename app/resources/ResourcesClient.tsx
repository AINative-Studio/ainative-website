'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Github, FileCode, Folder, ExternalLink } from 'lucide-react';

const mockResources = [
  {
    id: 1,
    title: 'Python SDK',
    description: 'Official Python client library with async support and type hints',
    resource_type: 'sdk',
    download_url: null,
    github_url: 'https://github.com/AINative-Studio/python-sdk',
    npm_url: null,
    version: 'v1.2.0',
    downloads_count: 12500,
    compatibility: ['Python 3.8+'],
    slug: 'python-sdk'
  },
  {
    id: 2,
    title: 'JavaScript/TypeScript SDK',
    description: 'TypeScript-first SDK for Node.js and browsers',
    resource_type: 'sdk',
    download_url: null,
    github_url: 'https://github.com/AINative-Studio/TypeScript-SDK',
    npm_url: null,
    version: 'v2.0.1',
    downloads_count: 8900,
    compatibility: ['Node.js 16+', 'Browsers'],
    slug: 'typescript-sdk'
  },
  {
    id: 3,
    title: 'Go SDK',
    description: 'High-performance Go SDK with native concurrency support and type safety',
    resource_type: 'sdk',
    download_url: null,
    github_url: 'https://github.com/AINative-Studio/Go-SDK',
    npm_url: null,
    version: 'v1.0.0',
    downloads_count: 6500,
    compatibility: ['Go 1.20+'],
    slug: 'go-sdk'
  },
  {
    id: 4,
    title: 'ZeroDB MCP Server',
    description: 'Model Context Protocol server with 60 operations for vector search, quantum compression, NoSQL, files, events, RLHF, and persistent memory for AI agents',
    resource_type: 'mcp_server',
    download_url: null,
    github_url: 'https://github.com/AINative-Studio/ainative-zerodb-mcp-server',
    npm_url: 'https://www.npmjs.com/package/ainative-zerodb-mcp-server',
    version: 'v2.0.8',
    downloads_count: 4200,
    compatibility: ['Claude Desktop', 'Claude Code', 'Windsurf', 'MCP Clients'],
    slug: 'zerodb-mcp-server'
  },
  {
    id: 5,
    title: 'Design System MCP Server',
    description: 'MCP server for design token extraction, component analysis, theme generation, and design system validation',
    resource_type: 'mcp_server',
    download_url: null,
    github_url: 'https://github.com/ainative/ainative-design-system-mcp-server',
    npm_url: 'https://www.npmjs.com/package/ainative-design-system-mcp-server',
    version: 'v1.0.0',
    downloads_count: 1850,
    compatibility: ['Claude Code', 'MCP Clients'],
    slug: 'design-mcp-server'
  },
  {
    id: 6,
    title: 'AI Kit - NPM Package Suite',
    description: '14 production-ready NPM packages for building AI applications with React, Vue, Svelte, Next.js. Includes components, hooks, utilities, CLI tools, and testing framework',
    resource_type: 'npm_package',
    download_url: null,
    github_url: 'https://github.com/AINative-Studio/ai-kit',
    npm_url: 'https://www.npmjs.com/package/@ainative/ai-kit',
    version: 'v2.0.0',
    downloads_count: 18500,
    compatibility: ['React 18+', 'Vue 3+', 'Svelte 4+', 'Next.js 14+'],
    slug: 'ai-kit'
  },
  {
    id: 7,
    title: 'Postman Collection - Complete API',
    description: 'Comprehensive collection with 1,330+ endpoints and automated auth',
    resource_type: 'postman_collection',
    download_url: 'https://api.ainative.studio/postman/complete-api.json',
    github_url: null,
    npm_url: null,
    version: 'v2.0',
    downloads_count: 5600,
    compatibility: ['Postman', 'Insomnia'],
    slug: 'postman-complete'
  },
  {
    id: 8,
    title: 'CLI Tool - AI Kit CLI',
    description: 'Command-line interface for managing API keys, testing endpoints, and project scaffolding - Part of @ainative/ai-kit-cli package',
    resource_type: 'tool',
    download_url: null,
    github_url: null,
    npm_url: 'https://www.npmjs.com/package/@ainative/ai-kit-cli',
    version: 'v0.9.0',
    downloads_count: 2800,
    compatibility: ['macOS', 'Linux', 'Windows'],
    slug: 'cli-tool'
  }
];

const resourceTypes = ['All', 'sdk', 'mcp_server', 'npm_package', 'tool', 'postman_collection'];

const resourceTypeLabels: Record<string, string> = {
  sdk: 'SDK',
  mcp_server: 'MCP Server',
  npm_package: 'NPM Package',
  tool: 'CLI Tool',
  postman_collection: 'Postman Collection'
};

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

export default function ResourcesClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || resource.resource_type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-20 mt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Folder className="h-4 w-4 mr-2" />Developer Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Tools & Resources
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            SDKs, templates, code examples, and more to accelerate your development
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium mr-2 flex items-center">Type:</span>
            {resourceTypes.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type === 'All' ? type : resourceTypeLabels[type]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                  <FileCode className="h-16 w-16 text-primary" />
                </div>
                <CardHeader className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{resourceTypeLabels[resource.resource_type]}</Badge>
                    <span className="text-xs text-muted-foreground">{resource.version}</span>
                  </div>
                  <CardTitle className="mb-2">{resource.title}</CardTitle>
                  <CardDescription className="mb-4">{resource.description}</CardDescription>

                  <div className="text-xs text-muted-foreground mb-3">
                    <div className="font-medium mb-1">Compatible with:</div>
                    <div className="flex flex-wrap gap-1">
                      {resource.compatibility.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <Download className="inline h-3 w-3 mr-1" />
                    {resource.downloads_count.toLocaleString()} downloads
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    {resource.github_url && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={resource.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-1" />GitHub
                        </a>
                      </Button>
                    )}
                    {resource.npm_url && (
                      <Button variant="default" size="sm" asChild className="flex-1 text-white">
                        <a href={resource.npm_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />NPM
                        </a>
                      </Button>
                    )}
                    {resource.download_url && (
                      <Button variant="default" size="sm" asChild className="flex-1 text-white">
                        <a href={resource.download_url} download>
                          <Download className="h-4 w-4 mr-1" />Download
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedType('All'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
