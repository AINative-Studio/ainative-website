/**
 * Cache Configuration for Next.js Application
 *
 * This module defines ISR revalidation times and cache strategies
 * for different content types across the application.
 */

export const CacheConfig = {
  /**
   * Content Pages (Blog, Tutorials, Webinars, Videos)
   * These are semi-static pages that change occasionally
   */
  content: {
    // Blog posts - revalidate every 5 minutes
    blog: {
      revalidate: 300, // 5 minutes
      tags: ['blog', 'content'],
    },

    // Tutorials - revalidate every 10 minutes
    tutorial: {
      revalidate: 600, // 10 minutes
      tags: ['tutorial', 'content'],
    },

    // Webinars - revalidate every 5 minutes (time-sensitive)
    webinar: {
      revalidate: 300, // 5 minutes
      tags: ['webinar', 'content'],
    },

    // Community videos - revalidate every 15 minutes
    video: {
      revalidate: 900, // 15 minutes
      tags: ['video', 'community', 'content'],
    },

    // Showcase pages - revalidate every 10 minutes
    showcase: {
      revalidate: 600, // 10 minutes
      tags: ['showcase', 'content'],
    },
  },

  /**
   * Marketing Pages (Home, Pricing, Products, About)
   * These pages change infrequently but should stay fresh
   */
  marketing: {
    // Home page - revalidate every 10 minutes
    home: {
      revalidate: 600, // 10 minutes
      tags: ['home', 'marketing'],
    },

    // Pricing page - revalidate every 5 minutes (price changes need to be visible quickly)
    pricing: {
      revalidate: 300, // 5 minutes
      tags: ['pricing', 'marketing'],
    },

    // Product pages - revalidate every 30 minutes
    products: {
      revalidate: 1800, // 30 minutes
      tags: ['products', 'marketing'],
    },

    // About, Terms, Privacy - revalidate every hour
    static: {
      revalidate: 3600, // 1 hour
      tags: ['static', 'marketing'],
    },

    // FAQ page - revalidate every 30 minutes
    faq: {
      revalidate: 1800, // 30 minutes
      tags: ['faq', 'marketing'],
    },
  },

  /**
   * API and Dynamic Content
   * For client-side data fetching with SWR
   */
  api: {
    // User-specific data - refresh frequently
    userSettings: {
      refreshInterval: 30000, // 30 seconds
      dedupingInterval: 10000, // 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },

    // Usage data - refresh moderately
    usage: {
      refreshInterval: 60000, // 1 minute
      dedupingInterval: 30000, // 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },

    // Dashboard data - refresh infrequently
    dashboard: {
      refreshInterval: 120000, // 2 minutes
      dedupingInterval: 60000, // 1 minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },

    // Public data (pricing, plans) - can be stale longer
    public: {
      refreshInterval: 300000, // 5 minutes
      dedupingInterval: 60000, // 1 minute
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  },

  /**
   * Static Assets
   * CDN and browser cache headers
   */
  assets: {
    // Images, fonts - cache for 1 year
    immutable: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },

    // JS/CSS with versioning - cache for 1 year
    versioned: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },

    // Other static files - cache for 1 hour
    static: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  },

  /**
   * Edge Runtime Configuration
   * Pages that benefit from edge runtime
   */
  edge: {
    // Public API routes that can run on edge
    apiRoutes: [
      '/api/public/pricing',
      '/api/public/plans',
      '/api/public/features',
    ],

    // Pages suitable for edge runtime
    pages: [
      '/pricing',
      '/products',
      '/about',
      '/faq',
    ],
  },
} as const;

/**
 * Helper function to get cache tags for a content type
 */
export function getCacheTags(type: keyof typeof CacheConfig.content): readonly string[] {
  return CacheConfig.content[type]?.tags || [];
}

/**
 * Helper function to get revalidation time for a content type
 */
export function getRevalidateTime(
  category: 'content' | 'marketing',
  type: string
): number {
  const config = CacheConfig[category] as Record<string, { revalidate: number }>;
  return config[type]?.revalidate || 60; // Default to 1 minute
}

/**
 * Helper function to get SWR config for API calls
 */
export function getSWRConfig(type: keyof typeof CacheConfig.api) {
  return CacheConfig.api[type];
}

/**
 * Cache control headers for different scenarios
 */
export const CacheHeaders = {
  // No caching - for dynamic, user-specific pages
  noCache: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },

  // Short cache - for semi-dynamic content (5 minutes)
  short: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
  },

  // Medium cache - for content pages (1 hour)
  medium: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },

  // Long cache - for static content (1 day)
  long: {
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
  },

  // Immutable - for versioned assets (1 year)
  immutable: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
} as const;

/**
 * Export types for TypeScript
 */
export type CacheConfigType = typeof CacheConfig;
export type ContentCacheType = keyof typeof CacheConfig.content;
export type MarketingCacheType = keyof typeof CacheConfig.marketing;
export type APICacheType = keyof typeof CacheConfig.api;
