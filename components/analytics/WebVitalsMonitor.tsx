'use client';

/**
 * Web Vitals Monitor Component
 *
 * Automatically tracks Core Web Vitals and sends them to analytics.
 * This component should be included in the root layout to monitor all pages.
 */

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';
import { formatMetric, logMetric, sendToAnalytics } from '@/lib/performance/web-vitals';

export default function WebVitalsMonitor() {
  useEffect(() => {
    // Handler for all metrics
    const handleMetric = (metric: Metric) => {
      const formattedMetric = formatMetric(metric);

      // Log in development
      logMetric(formattedMetric);

      // Send to analytics
      sendToAnalytics(formattedMetric);

      // Send to Vercel Analytics if available
      if (window.va) {
        window.va('event', {
          name: 'web-vitals',
          data: {
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            page: window.location.pathname,
          },
        });
      }
    };

    // Observe all Core Web Vitals (FID removed in web-vitals v4, replaced by INP)
    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    // Report initial page load time
    if ('performance' in window && 'timing' in window.performance) {
      const timing = window.performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

      if (pageLoadTime > 0) {
        console.log(`Page Load Time: ${pageLoadTime}ms`);
      }
    }
  }, []);

  // This component renders nothing
  return null;
}

// Extend Window interface for Vercel Analytics
declare global {
  interface Window {
    va?: (event: string, data: Record<string, any>) => void;
  }
}
