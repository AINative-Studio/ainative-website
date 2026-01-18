'use client';

/**
 * Review Results Display Component
 * Displays detailed review results with inline annotations
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  Zap,
  Code2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Key,
  FileCode,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { ReviewResult } from '@/lib/types/review';

interface ReviewResultsDisplayProps {
  result: ReviewResult;
}

export function ReviewResultsDisplay({ result }: ReviewResultsDisplayProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'blocker':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high':
      case 'major':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
      case 'minor':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'blocker':
        return 'destructive';
      case 'high':
      case 'major':
        return 'destructive';
      case 'medium':
      case 'minor':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security" disabled={!result.security}>
            <Shield className="mr-2 h-4 w-4" />
            Security
            {result.security && (
              <Badge variant="outline" className="ml-2">
                {result.security.vulnerabilities.length + result.security.secrets.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance" disabled={!result.performance}>
            <Zap className="mr-2 h-4 w-4" />
            Performance
            {result.performance && (
              <Badge variant="outline" className="ml-2">
                {result.performance.issues.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="style" disabled={!result.style}>
            <Code2 className="mr-2 h-4 w-4" />
            Style
            {result.style && (
              <Badge variant="outline" className="ml-2">
                {result.style.violations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          {result.security && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {result.security.summary.critical}
                    </div>
                    <div className="text-sm text-muted-foreground">Critical</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.security.summary.high}
                    </div>
                    <div className="text-sm text-muted-foreground">High</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.security.summary.medium}
                    </div>
                    <div className="text-sm text-muted-foreground">Medium</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.security.summary.low}
                    </div>
                    <div className="text-sm text-muted-foreground">Low</div>
                  </CardContent>
                </Card>
              </div>

              {/* Vulnerabilities */}
              {result.security.vulnerabilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Vulnerabilities ({result.security.vulnerabilities.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <Accordion type="single" collapsible className="w-full">
                        {result.security.vulnerabilities.map((vuln, index) => (
                          <AccordionItem key={vuln.id} value={`vuln-${index}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3 w-full">
                                {getSeverityIcon(vuln.severity)}
                                <div className="flex-1 text-left">
                                  <div className="font-medium">{vuln.type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {vuln.location.file}:{vuln.location.line}
                                  </div>
                                </div>
                                <Badge variant={getSeverityColor(vuln.severity) as any}>
                                  {vuln.severity}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                              <div>
                                <div className="font-semibold mb-1">Description</div>
                                <div className="text-sm text-muted-foreground">
                                  {vuln.description}
                                </div>
                              </div>

                              {vuln.location.snippet && (
                                <div>
                                  <div className="font-semibold mb-1">Code Snippet</div>
                                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                                    <code>{vuln.location.snippet}</code>
                                  </pre>
                                </div>
                              )}

                              <div>
                                <div className="font-semibold mb-1">Recommendation</div>
                                <div className="text-sm text-muted-foreground">
                                  {vuln.recommendation}
                                </div>
                              </div>

                              <div className="flex gap-4 text-sm">
                                {vuln.cwe && (
                                  <div>
                                    <span className="font-semibold">CWE:</span> {vuln.cwe}
                                  </div>
                                )}
                                {vuln.owasp && (
                                  <div>
                                    <span className="font-semibold">OWASP:</span> {vuln.owasp}
                                  </div>
                                )}
                                <div>
                                  <span className="font-semibold">Fix Effort:</span>{' '}
                                  {vuln.effort}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Secrets */}
              {result.security.secrets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Hardcoded Secrets ({result.security.secrets.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {result.security.secrets.map((secret) => (
                          <Card key={secret.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge>{secret.type}</Badge>
                                    {secret.provider && (
                                      <Badge variant="outline">{secret.provider}</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {secret.location.file}:{secret.location.line}
                                  </div>
                                  <div className="font-mono text-sm">{secret.masked}</div>
                                </div>
                                <Badge variant="destructive">
                                  {secret.confidence}% confidence
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {result.security.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.security.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {result.performance && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {result.performance.summary.blocker}
                    </div>
                    <div className="text-sm text-muted-foreground">Blockers</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.performance.summary.major}
                    </div>
                    <div className="text-sm text-muted-foreground">Major</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.performance.summary.minor}
                    </div>
                    <div className="text-sm text-muted-foreground">Minor</div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Issues */}
              {result.performance.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Issues ({result.performance.issues.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <Accordion type="single" collapsible className="w-full">
                        {result.performance.issues.map((issue, index) => (
                          <AccordionItem key={issue.id} value={`perf-${index}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3 w-full">
                                {getSeverityIcon(issue.severity)}
                                <div className="flex-1 text-left">
                                  <div className="font-medium">{issue.type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {issue.location.file}:{issue.location.line}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {issue.autoFixable && (
                                    <Badge variant="outline" className="gap-1">
                                      <Wrench className="h-3 w-3" />
                                      Auto-fixable
                                    </Badge>
                                  )}
                                  <Badge variant={getSeverityColor(issue.severity) as any}>
                                    {issue.severity}
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                              <div>
                                <div className="font-semibold mb-1">Impact</div>
                                <div className="text-sm text-muted-foreground">
                                  {issue.impact}
                                </div>
                              </div>

                              {issue.location.snippet && (
                                <div>
                                  <div className="font-semibold mb-1">Code Snippet</div>
                                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                                    <code>{issue.location.snippet}</code>
                                  </pre>
                                </div>
                              )}

                              <div>
                                <div className="font-semibold mb-1">Suggestion</div>
                                <div className="text-sm text-muted-foreground">
                                  {issue.suggestion}
                                </div>
                              </div>

                              {issue.estimatedImprovement && (
                                <div className="flex items-center gap-2 text-sm">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold">
                                    Estimated Improvement:
                                  </span>
                                  <span className="text-green-600">
                                    {issue.estimatedImprovement}
                                  </span>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Metrics */}
              {result.performance.metrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {result.performance.metrics.bundleSize && (
                        <div>
                          <div className="text-sm text-muted-foreground">Bundle Size</div>
                          <div className="text-2xl font-bold">
                            {(result.performance.metrics.bundleSize / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      )}
                      {result.performance.metrics.estimatedLoadTime && (
                        <div>
                          <div className="text-sm text-muted-foreground">Load Time</div>
                          <div className="text-2xl font-bold">
                            {result.performance.metrics.estimatedLoadTime}ms
                          </div>
                        </div>
                      )}
                    </div>

                    {result.performance.metrics.recommendations && (
                      <div>
                        <div className="font-semibold mb-2">Recommendations</div>
                        <ul className="space-y-2">
                          {result.performance.metrics.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-4">
          {result.style && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {result.style.summary.errors}
                    </div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.style.summary.warnings}
                    </div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.style.summary.info}
                    </div>
                    <div className="text-sm text-muted-foreground">Info</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {result.style.summary.fixable}
                    </div>
                    <div className="text-sm text-muted-foreground">Auto-fixable</div>
                  </CardContent>
                </Card>
              </div>

              {/* Violations */}
              {result.style.violations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="h-5 w-5" />
                      Style Violations ({result.style.violations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <Accordion type="single" collapsible className="w-full">
                        {result.style.violations.map((violation, index) => (
                          <AccordionItem key={violation.id} value={`style-${index}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3 w-full">
                                {getSeverityIcon(violation.severity)}
                                <div className="flex-1 text-left">
                                  <div className="font-medium">{violation.rule}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {violation.location.file}:{violation.location.line}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {violation.autoFixable && (
                                    <Badge variant="outline" className="gap-1">
                                      <Wrench className="h-3 w-3" />
                                      Auto-fixable
                                    </Badge>
                                  )}
                                  <Badge variant="outline">{violation.category}</Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                              <div>
                                <div className="font-semibold mb-1">Message</div>
                                <div className="text-sm text-muted-foreground">
                                  {violation.message}
                                </div>
                              </div>

                              {violation.location.snippet && (
                                <div>
                                  <div className="font-semibold mb-1">Code Snippet</div>
                                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                                    <code>{violation.location.snippet}</code>
                                  </pre>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {result.style.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.style.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
