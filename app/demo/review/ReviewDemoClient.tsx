'use client';

/**
 * Review Demo Client Component
 * Interactive demonstration of code review features
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReviewCommand } from '@/components/commands/ReviewCommand';
import { ReviewDashboard } from '@/components/commands/ReviewDashboard';
import {
  Code2,
  Shield,
  Zap,
  BarChart3,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';

export function ReviewDemoClient() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Code Review Command
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              AI-powered security, performance, and style analysis
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Inspired by Gemini CLI #16947
          </Badge>
        </div>

        {/* Feature Highlights */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Review</CardTitle>
              <Shield className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">OWASP Top 10</div>
              <p className="text-xs text-muted-foreground">
                Detect vulnerabilities and hardcoded secrets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Performance Review
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Real-time</div>
              <p className="text-xs text-muted-foreground">
                Identify bottlenecks and optimize code
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Style Review</CardTitle>
              <Code2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Auto-fix</div>
              <p className="text-xs text-muted-foreground">
                Enforce coding standards and best practices
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="review" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Run Review
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-6">
          <ReviewCommand />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <ReviewDashboard />
        </TabsContent>
      </Tabs>

      {/* Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation & Resources</CardTitle>
          <CardDescription>
            Learn more about the code review command feature
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quick Start Guide
              </h3>
              <p className="text-sm text-muted-foreground">
                Get started with code reviews in minutes. Learn the basics and run
                your first review.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-3 w-3" />
                View Guide
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                API Reference
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete API documentation for integrating reviews into your
                workflow.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-3 w-3" />
                View API Docs
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Best Practices
              </h3>
              <p className="text-sm text-muted-foreground">
                Learn about security patterns detected and how to fix vulnerabilities.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-3 w-3" />
                Security Guide
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Options
              </h3>
              <p className="text-sm text-muted-foreground">
                Export review reports in PDF, Markdown, JSON, or HTML formats.
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-3 w-3" />
                Export Guide
              </Button>
            </div>
          </div>

          {/* Command Examples */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Command Examples</h3>
            <div className="space-y-2 font-mono text-sm bg-muted p-4 rounded-lg">
              <div># Review single file</div>
              <div className="text-blue-600">/review src/components/App.tsx</div>
              <div className="mt-2"># Security-focused review</div>
              <div className="text-blue-600">/review --type security src/lib/api.ts</div>
              <div className="mt-2"># Review uncommitted changes</div>
              <div className="text-blue-600">/review --git-diff</div>
              <div className="mt-2"># Review changes since commit</div>
              <div className="text-blue-600">/review --since HEAD~1</div>
              <div className="mt-2"># Export review report</div>
              <div className="text-blue-600">/review --export pdf</div>
            </div>
          </div>

          {/* Integration Examples */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Integration Examples</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">GitHub Actions</CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-mono">
                  <pre className="bg-muted p-2 rounded overflow-x-auto">
{`name: Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run review`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pre-commit Hook</CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-mono">
                  <pre className="bg-muted p-2 rounded overflow-x-auto">
{`#!/bin/sh
npm run review -- --git-diff
if [ $? -ne 0 ]; then
  echo "Review failed"
  exit 1
fi`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Built with Next.js, TypeScript, and Tailwind CSS
        </p>
        <p className="mt-1">
          Inspired by{' '}
          <a
            href="https://github.com/google/generative-ai-cli/issues/16947"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Gemini CLI Feature Request #16947
          </a>
        </p>
      </div>
    </div>
  );
}
