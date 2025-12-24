'use client';

import { useEffect, useCallback, useRef } from 'react';

interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'INP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

interface SpeedInsightsProps {
  route?: string;
  debug?: boolean;
  beforeSend?: (metric: WebVitalsMetric) => WebVitalsMetric | null;
  onMetric?: (metric: WebVitalsMetric) => void;
}

/**
 * Speed Insights component
 * Tracks Core Web Vitals and performance metrics
 *
 * Usage: Add to app/layout.tsx:
 * <SpeedInsights debug={process.env.NODE_ENV === 'development'} />
 */
export default function SpeedInsights({
  route,
  debug = false,
  beforeSend,
  onMetric,
}: SpeedInsightsProps) {
  const metricsReported = useRef<Set<string>>(new Set());

  const reportMetric = useCallback(
    (metric: WebVitalsMetric) => {
      // Avoid duplicate reports
      if (metricsReported.current.has(metric.id)) {
        return;
      }
      metricsReported.current.add(metric.id);

      // Apply beforeSend filter
      let processedMetric = metric;
      if (beforeSend) {
        const result = beforeSend(metric);
        if (result === null) return;
        processedMetric = result;
      }

      // Call onMetric callback
      if (onMetric) {
        onMetric(processedMetric);
      }

      // Debug logging
      if (debug) {
        const ratingColor =
          processedMetric.rating === 'good'
            ? '\x1b[32m'
            : processedMetric.rating === 'needs-improvement'
            ? '\x1b[33m'
            : '\x1b[31m';
        console.log(
          `[Speed Insights] ${processedMetric.name}: ${ratingColor}${processedMetric.value.toFixed(2)}ms (${processedMetric.rating})\x1b[0m`
        );
      }

      // Send to analytics endpoint (if configured)
      const analyticsEndpoint = process.env.NEXT_PUBLIC_SPEED_INSIGHTS_ENDPOINT;
      if (analyticsEndpoint) {
        const body = JSON.stringify({
          metric: processedMetric.name,
          value: processedMetric.value,
          rating: processedMetric.rating,
          delta: processedMetric.delta,
          id: processedMetric.id,
          navigationType: processedMetric.navigationType,
          route: route || window.location.pathname,
          url: window.location.href,
          timestamp: Date.now(),
        });

        // Use sendBeacon for reliability
        if (navigator.sendBeacon) {
          navigator.sendBeacon(analyticsEndpoint, body);
        } else {
          fetch(analyticsEndpoint, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          }).catch(() => {
            // Silently fail if request fails
          });
        }
      }

      // Push to GTM dataLayer if available
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'web_vitals',
          webVitalsMeasurement: {
            name: processedMetric.name,
            value: processedMetric.value,
            rating: processedMetric.rating,
            id: processedMetric.id,
          },
        });
      }
    },
    [beforeSend, debug, onMetric, route]
  );

  useEffect(() => {
    // Dynamic import of web-vitals for code splitting
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      // Largest Contentful Paint
      onLCP((metric) => {
        reportMetric({
          name: 'LCP',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType as WebVitalsMetric['navigationType'],
        });
      });

      // First Contentful Paint
      onFCP((metric) => {
        reportMetric({
          name: 'FCP',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType as WebVitalsMetric['navigationType'],
        });
      });

      // Cumulative Layout Shift
      onCLS((metric) => {
        reportMetric({
          name: 'CLS',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType as WebVitalsMetric['navigationType'],
        });
      });

      // Interaction to Next Paint (replaces FID)
      onINP((metric) => {
        reportMetric({
          name: 'INP',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType as WebVitalsMetric['navigationType'],
        });
      });

      // Time to First Byte
      onTTFB((metric) => {
        reportMetric({
          name: 'TTFB',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType as WebVitalsMetric['navigationType'],
        });
      });
    }).catch((err) => {
      if (debug) {
        console.error('[Speed Insights] Failed to load web-vitals:', err);
      }
    });
  }, [reportMetric, debug]);

  return null;
}

/**
 * Get Web Vitals thresholds for reference
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FCP: { good: 1800, needsImprovement: 3000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  INP: { good: 200, needsImprovement: 500 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

/**
 * Rate a metric value based on Web Vitals thresholds
 */
export function rateMetric(
  name: keyof typeof WEB_VITALS_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}
