/**
 * Web Vitals Monitoring Utilities
 *
 * Comprehensive performance tracking for Core Web Vitals and custom metrics.
 * Integrates with Vercel Analytics and custom analytics solutions.
 */

import type { Metric } from 'web-vitals';

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  attribution?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  FID?: number; // First Input Delay
  INP?: number; // Interaction to Next Paint
  LCP?: number; // Largest Contentful Paint
  TTFB?: number; // Time to First Byte

  // Custom metrics
  pageLoadTime?: number;
  domContentLoaded?: number;
  resourcesLoaded?: number;

  // Navigation
  navigationType?: string;
  effectiveConnectionType?: string;
}

/**
 * Rating thresholds for Core Web Vitals
 * Based on Google's recommendations: https://web.dev/vitals/
 */
export const THRESHOLDS = {
  CLS: {
    good: 0.1,
    poor: 0.25,
  },
  FCP: {
    good: 1800, // ms
    poor: 3000,
  },
  FID: {
    good: 100, // ms
    poor: 300,
  },
  INP: {
    good: 200, // ms
    poor: 500,
  },
  LCP: {
    good: 2500, // ms
    poor: 4000,
  },
  TTFB: {
    good: 800, // ms
    poor: 1800,
  },
};

/**
 * Get rating based on metric value and thresholds
 */
export function getRating(
  metricName: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Format metric for logging/display
 */
export function formatMetric(metric: Metric): WebVitalsMetric {
  return {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    attribution: (metric as any).attribution as Record<string, unknown>,
  };
}

/**
 * Send metric to analytics endpoint
 */
export async function sendToAnalytics(metric: WebVitalsMetric): Promise<void> {
  // Send to custom analytics endpoint
  const body = JSON.stringify({
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  });

  try {
    // Use sendBeacon for reliability (doesn't block page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/vitals', blob);
    } else {
      // Fallback to fetch
      await fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('Failed to send metric to analytics:', error);
  }
}

/**
 * Log metric to console in development
 */
export function logMetric(metric: WebVitalsMetric): void {
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `${emoji} ${metric.name}:`,
      `${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`,
      `(${metric.rating})`
    );
  }
}

/**
 * Get performance navigation timing
 */
export function getNavigationTiming(): PerformanceMetrics {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!navigation) return {};

  return {
    pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    resourcesLoaded: navigation.loadEventEnd - navigation.responseEnd,
    navigationType: navigation.type,
  };
}

/**
 * Get network information
 */
export function getNetworkInfo(): { effectiveType?: string; downlink?: number; rtt?: number } {
  if (typeof window === 'undefined') return {};

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) return {};

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
  };
}

/**
 * Get resource timing metrics
 */
export function getResourceMetrics(): {
  totalResources: number;
  totalSize: number;
  resourcesByType: Record<string, { count: number; size: number }>;
} {
  if (typeof window === 'undefined' || !window.performance) {
    return { totalResources: 0, totalSize: 0, resourcesByType: {} };
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const resourcesByType: Record<string, { count: number; size: number }> = {};
  let totalSize = 0;

  resources.forEach((resource) => {
    const type = resource.initiatorType;
    const size = resource.transferSize || 0;

    if (!resourcesByType[type]) {
      resourcesByType[type] = { count: 0, size: 0 };
    }

    resourcesByType[type].count++;
    resourcesByType[type].size += size;
    totalSize += size;
  });

  return {
    totalResources: resources.length,
    totalSize,
    resourcesByType,
  };
}

/**
 * Report all performance metrics
 */
export function reportAllMetrics(): void {
  if (typeof window === 'undefined') return;

  const navigationTiming = getNavigationTiming();
  const networkInfo = getNetworkInfo();
  const resourceMetrics = getResourceMetrics();

  console.group('Performance Report');
  console.log('Navigation Timing:', navigationTiming);
  console.log('Network Info:', networkInfo);
  console.log('Resource Metrics:', resourceMetrics);
  console.groupEnd();
}

/**
 * Monitor Long Tasks (tasks > 50ms)
 */
export function observeLongTasks(callback: (entries: PerformanceEntryList) => void): PerformanceObserver | null {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return null;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      callback(entries);
    });

    observer.observe({ entryTypes: ['longtask'] });
    return observer;
  } catch (error) {
    console.error('Failed to observe long tasks:', error);
    return null;
  }
}

/**
 * Monitor Layout Shifts
 */
export function observeLayoutShifts(callback: (entries: PerformanceEntryList) => void): PerformanceObserver | null {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return null;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      callback(entries);
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    return observer;
  } catch (error) {
    console.error('Failed to observe layout shifts:', error);
    return null;
  }
}
