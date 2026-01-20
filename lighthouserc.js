module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/ai-kit',
        'http://localhost:3000/pricing',
        'http://localhost:3000/about',
        'http://localhost:3000/blog',
        'http://localhost:3000/contact',
        'http://localhost:3000/dashboard',
      ],
      numberOfRuns: 3,
      settings: {
        // Chrome flags for consistent testing
        chromeFlags: '--no-sandbox --disable-gpu --disable-dev-shm-usage',
        // Throttling to simulate real-world conditions
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Disable storage clearing for more realistic cache testing
        disableStorageReset: false,
        // Only desktop for now (can add mobile separately)
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance - Core Web Vitals
        'categories:performance': ['warn', { minScore: 0.85 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],

        // Resource Optimization
        'unused-javascript': ['warn', { maxLength: 2 }],
        'unused-css-rules': ['warn', { maxLength: 2 }],
        'modern-image-formats': ['warn', { maxLength: 0 }],
        'uses-optimized-images': ['warn', { maxLength: 0 }],
        'uses-text-compression': ['error', { maxLength: 0 }],
        'uses-responsive-images': ['warn', { maxLength: 2 }],

        // Caching & Network
        'uses-long-cache-ttl': ['warn', { maxLength: 5 }],
        'efficient-animated-content': ['warn', { maxLength: 0 }],
        'offscreen-images': ['warn', { maxLength: 2 }],

        // JavaScript Performance
        'bootup-time': ['warn', { maxNumericValue: 3000 }],
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],
        'dom-size': ['warn', { maxNumericValue: 1500 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'color-contrast': ['error', { minScore: 1 }],
        'document-title': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'meta-viewport': ['error', { minScore: 1 }],

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'errors-in-console': ['warn', { maxLength: 0 }],
        'no-vulnerable-libraries': ['error', { minScore: 1 }],

        // SEO
        'categories:seo': ['error', { minScore: 0.95 }],
        'meta-description': ['error', { minScore: 1 }],
        'link-text': ['warn', { minScore: 1 }],
        'crawlable-anchors': ['warn', { minScore: 1 }],
        'robots-txt': ['warn', { minScore: 1 }],
        'hreflang': ['warn', { minScore: 1 }],

        // PWA (Optional)
        'viewport': ['warn', { minScore: 1 }],
        'themed-omnibox': ['warn', { minScore: 1 }],

        // Network & Server
        'server-response-time': ['warn', { maxNumericValue: 600 }],
        'redirects': ['warn', { maxLength: 0 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
      // If you have LHCI server, configure here:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-lhci-token',
    },
  },
};
