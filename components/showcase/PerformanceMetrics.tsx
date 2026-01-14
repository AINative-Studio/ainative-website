'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Zap,
  Gauge,
  Clock,
  TrendingUp,
  Package,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PerformanceMetrics {
  loadTime?: number;
  lighthouseScore?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  uptime?: number;
  responseTime?: number;
  bundleSize?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  totalBlockingTime?: number;
}

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
  compact?: boolean;
  className?: string;
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

export function PerformanceMetrics({ metrics, compact = false, className }: PerformanceMetricsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle2;
    if (score >= 50) return AlertCircle;
    return XCircle;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${Math.round(kb)}KB`;
    return `${(kb / 1024).toFixed(2)}MB`;
  };

  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {metrics.lighthouseScore && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1">
                  <Gauge className="h-3 w-3" />
                  {metrics.lighthouseScore.performance}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Lighthouse Performance Score</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {metrics.loadTime && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(metrics.loadTime)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Load Time</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {metrics.bundleSize && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1">
                  <Package className="h-3 w-3" />
                  {formatSize(metrics.bundleSize)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Bundle Size</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {metrics.uptime !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" />
                  {metrics.uptime.toFixed(2)}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Uptime</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lighthouse Scores */}
        {metrics.lighthouseScore && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Lighthouse Scores
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(metrics.lighthouseScore).map(([key, value]) => {
                const Icon = getScoreIcon(value);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-muted-foreground">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={cn('font-semibold flex items-center gap-1', getScoreColor(value))}>
                        <Icon className="h-3 w-3" />
                        {value}
                      </span>
                    </div>
                    <Progress value={value} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Core Web Vitals */}
        {(metrics.firstContentfulPaint || metrics.largestContentfulPaint || metrics.cumulativeLayoutShift || metrics.totalBlockingTime) && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Core Web Vitals
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {metrics.firstContentfulPaint && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">FCP</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold">{formatTime(metrics.firstContentfulPaint)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">First Contentful Paint</p>
                        <p className="text-xs text-muted-foreground">Good: &lt; 1.8s</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {metrics.largestContentfulPaint && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">LCP</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold">{formatTime(metrics.largestContentfulPaint)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Largest Contentful Paint</p>
                        <p className="text-xs text-muted-foreground">Good: &lt; 2.5s</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {metrics.cumulativeLayoutShift !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CLS</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold">{metrics.cumulativeLayoutShift.toFixed(3)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Cumulative Layout Shift</p>
                        <p className="text-xs text-muted-foreground">Good: &lt; 0.1</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {metrics.totalBlockingTime && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">TBT</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold">{formatTime(metrics.totalBlockingTime)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Total Blocking Time</p>
                        <p className="text-xs text-muted-foreground">Good: &lt; 200ms</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {metrics.loadTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Load Time</div>
                <div className="font-semibold">{formatTime(metrics.loadTime)}</div>
              </div>
            </div>
          )}

          {metrics.responseTime && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Response Time</div>
                <div className="font-semibold">{formatTime(metrics.responseTime)}</div>
              </div>
            </div>
          )}

          {metrics.bundleSize && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Bundle Size</div>
                <div className="font-semibold">{formatSize(metrics.bundleSize)}</div>
              </div>
            </div>
          )}

          {metrics.uptime !== undefined && (
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <div>
                <div className="text-muted-foreground text-xs">Uptime</div>
                <div className="font-semibold">{metrics.uptime.toFixed(2)}%</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
