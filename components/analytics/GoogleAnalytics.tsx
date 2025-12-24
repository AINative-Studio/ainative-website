'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  gaId?: string;
}

/**
 * Google Analytics 4 (GA4) component for Next.js
 * Uses gtag.js for modern analytics tracking
 *
 * @param gaId - Google Analytics Measurement ID (format: G-XXXXXXXXXX)
 */
export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  // Use environment variable if gaId prop is not provided
  // Default to production GA ID if not configured
  const id = gaId || process.env.NEXT_PUBLIC_GA_ID || 'G-ML0XEBPZV2';

  return (
    <>
      {/* Google Analytics 4 Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${id}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Track custom events with Google Analytics
 * Use this for button clicks, form submissions, etc.
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Track page views manually (useful for SPA navigation)
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'G-ML0XEBPZV2', {
      page_path: url,
      page_title: title || document.title,
    });
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
