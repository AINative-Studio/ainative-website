module.exports = {
  ci: {
    collect: {
      // Build the production bundle before collecting
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
      numberOfRuns: 3,
      url: [
        'http://localhost:3000',
        'http://localhost:3000/pricing',
        'http://localhost:3000/solutions',
        'http://localhost:3000/documentation',
        'http://localhost:3000/ai-kit',
      ],
      settings: {
        // Use desktop preset for baseline
        preset: 'desktop',
        // Throttling settings for consistent results
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      // Performance budgets - fail if these thresholds are not met
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],

        // Core Web Vitals thresholds (values in milliseconds)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'speed-index': ['error', { maxNumericValue: 3400 }],
        'interactive': ['error', { maxNumericValue: 3800 }],

        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 100000 }], // 100KB
        'resource-summary:image:size': ['error', { maxNumericValue: 1000000 }], // 1MB
        'resource-summary:font:size': ['error', { maxNumericValue: 200000 }], // 200KB
        'resource-summary:third-party:size': ['error', { maxNumericValue: 500000 }], // 500KB

        // Network requests
        'resource-summary:script:count': ['warn', { maxNumericValue: 20 }],
        'resource-summary:total:count': ['warn', { maxNumericValue: 50 }],

        // Image optimization
        'modern-image-formats': 'warn',
        'offscreen-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-responsive-images': 'warn',
        'uses-webp-images': 'warn',

        // Performance best practices
        'uses-long-cache-ttl': 'warn',
        'uses-text-compression': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'duplicated-javascript': 'warn',
        'legacy-javascript': 'warn',

        // Next.js specific
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'render-blocking-resources': 'warn',

        // Accessibility
        'color-contrast': 'error',
        'button-name': 'error',
        'link-name': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',

        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'crawlable-anchors': 'error',
        'robots-txt': 'warn',
        'hreflang': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
