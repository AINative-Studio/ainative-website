# Build Optimization Guide

## Overview

This guide covers Next.js build optimization strategies for the AINative Studio application, including bundle size reduction, code splitting, caching strategies, and performance monitoring.

## Current Build Configuration

### Next.js Configuration

The application uses advanced build optimizations in `next.config.ts`:

1. **Output Mode**: `standalone` for Railway deployment
2. **Package Imports Optimization**: Tree-shaking for large libraries
3. **Chunk Splitting**: Custom webpack configuration for optimal code splitting
4. **Cache Headers**: Aggressive caching for static assets

### Optimized Libraries

```typescript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    'framer-motion',
    'recharts',
    'react-icons',
    '@tanstack/react-query',
  ],
}
```

## Bundle Analysis

### Running Bundle Analysis

```bash
# Generate bundle analysis report
npm run build:analyze

# This will:
# 1. Build the application
# 2. Open webpack bundle analyzer in browser
# 3. Generate reports in .next/analyze/ directory
```

### Custom Bundle Analysis Script

```bash
# Run custom bundle analysis
node scripts/analyze-bundle.js

# This provides:
# - Top 10 largest chunks
# - Total JavaScript size
# - Page size analysis
# - Duplicate dependency detection
# - Optimization recommendations
```

### Understanding Bundle Report

The bundle analyzer shows:
- **Client bundle**: JavaScript sent to browser
- **Server bundle**: Server-side code (not sent to client)
- **Chunk sizes**: Individual file sizes
- **Dependencies**: Which packages contribute to bundle size

## Size Thresholds

### Current Thresholds

| Metric | Threshold | Current | Status |
|--------|-----------|---------|--------|
| Total JS Size | 500 KB | Check with analysis | Monitor |
| First Load JS | 300 KB | Check with analysis | Monitor |
| Route Size | 50 KB | Per route | Target |
| Shared Chunk | 100 KB | Per chunk | Target |

### Lighthouse Scores

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Performance | 90+ | Check CI | Monitor |
| Accessibility | 95+ | Check CI | Monitor |
| Best Practices | 95+ | Check CI | Monitor |
| SEO | 100 | Check CI | Monitor |

## Optimization Strategies

### 1. Code Splitting

#### Dynamic Imports

```typescript
// Instead of static import
import HeavyComponent from './HeavyComponent';

// Use dynamic import
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false, // Disable SSR if not needed
});
```

#### Route-based Splitting

Next.js automatically splits code by route. Ensure large components are only loaded on routes where they're needed.

#### Component-level Splitting

```typescript
// Split large libraries into separate chunks
const Chart = dynamic(() => import('recharts').then(mod => mod.LineChart));
const Editor = dynamic(() => import('react-monaco-editor'));
```

### 2. Tree Shaking

#### Import Only What You Need

```typescript
// Bad: Imports entire library
import _ from 'lodash';
import * as Icons from 'lucide-react';

// Good: Import specific functions
import { debounce } from 'lodash-es';
import { Home, Settings } from 'lucide-react';
```

#### Configure in package.json

```json
{
  "sideEffects": false
}
```

### 3. Image Optimization

#### Use Next.js Image Component

```typescript
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // Blur-up effect
  blurDataURL="data:image/..." // Low-quality placeholder
/>
```

#### Image Formats

- Use WebP format when possible
- Provide multiple sizes with `srcset`
- Enable lazy loading for below-fold images

#### Image CDN

Configure remote patterns in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.ainative.studio',
    },
  ],
  formats: ['image/webp', 'image/avif'],
}
```

### 4. Font Optimization

#### Use next/font

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

// In component
<body className={inter.className}>
```

#### Subset Fonts

Only include character sets you need:

```typescript
const font = Inter({
  subsets: ['latin'], // Only Latin characters
  weight: ['400', '700'], // Only needed weights
});
```

### 5. Dependency Optimization

#### Audit Dependencies

```bash
# Check for unused dependencies
npx depcheck

# Check bundle size impact
npx bundlephobia [package-name]

# Find duplicate dependencies
npm dedupe
```

#### Replace Heavy Dependencies

| Heavy | Lightweight Alternative |
|-------|------------------------|
| moment.js (70KB) | date-fns (2KB per function) |
| lodash (72KB) | lodash-es + tree shaking |
| axios (13KB) | native fetch API |

#### Externalize Large Libraries

For libraries that rarely change, consider loading from CDN:

```typescript
// next.config.ts
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = {
        // Load from CDN instead
        react: 'React',
        'react-dom': 'ReactDOM',
      };
    }
    return config;
  },
};
```

### 6. CSS Optimization

#### Use Tailwind CSS Purging

Already configured in `tailwind.config.ts`:

```typescript
content: [
  './app/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}',
],
```

#### Critical CSS

Extract critical CSS for above-the-fold content:

```bash
npm install -D critters
```

```typescript
// next.config.ts
experimental: {
  optimizeCss: true,
}
```

### 7. Caching Strategy

#### Static Assets (Immutable)

Already configured in `next.config.ts`:

```typescript
{
  source: '/images/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
}
```

#### API Responses

Use SWR or React Query for client-side caching:

```typescript
import useSWR from 'swr';

const { data, error } = useSWR('/api/data', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
});
```

#### Build Cache

Enable build cache for faster rebuilds:

```bash
# Railway automatically caches .next folder
# For local development, .next is cached by default
```

### 8. Runtime Performance

#### Memoization

```typescript
import { useMemo, useCallback, memo } from 'react';

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(input);
}, [input]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(input);
}, [input]);

// Memoize components
const MemoizedComponent = memo(Component);
```

#### Virtual Scrolling

For long lists, use virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

## Monitoring

### Build Size Monitoring

Track bundle size in CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Check bundle size
  run: |
    npm run build
    node scripts/analyze-bundle.js
```

### Performance Monitoring

#### Lighthouse CI

Already configured in `.github/workflows/lighthouse.yml`:

```bash
# Run locally
npm run lighthouse

# Run in CI
npm run lighthouse:ci
```

#### Real User Monitoring (RUM)

Using Vercel Analytics and Sentry:

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Core Web Vitals

Monitor these metrics:

1. **LCP (Largest Contentful Paint)**: < 2.5s
2. **FID (First Input Delay)**: < 100ms
3. **CLS (Cumulative Layout Shift)**: < 0.1

## Optimization Checklist

### Pre-Deploy Checklist

- [ ] Run bundle analysis: `npm run build:analyze`
- [ ] Check total bundle size < 500KB
- [ ] Verify no duplicate dependencies
- [ ] Run Lighthouse audit: `npm run lighthouse`
- [ ] Check Core Web Vitals
- [ ] Test on slow 3G connection
- [ ] Verify image optimization
- [ ] Check font loading performance
- [ ] Test code splitting effectiveness
- [ ] Verify caching headers

### Monthly Optimization Tasks

- [ ] Review bundle analyzer report
- [ ] Update dependencies
- [ ] Remove unused dependencies
- [ ] Check for new optimization opportunities
- [ ] Review Lighthouse CI trends
- [ ] Analyze Real User Monitoring data
- [ ] Update optimization thresholds

## Performance Budget

Set and enforce performance budgets:

```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
  },
};
```

## Troubleshooting

### Large Bundle Size

1. Run bundle analyzer: `npm run build:analyze`
2. Identify largest chunks
3. Check for:
   - Duplicate dependencies
   - Unused imports
   - Heavy libraries
   - Missing code splitting

### Slow Build Times

1. Enable build cache
2. Use SWC compiler (default in Next.js)
3. Reduce TypeScript strictness during development
4. Use incremental builds

### Cache Issues

```bash
# Clear all caches
rm -rf .next node_modules/.cache

# Rebuild
npm ci
npm run build
```

## Resources

- [Next.js Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Webpack Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web.dev Performance](https://web.dev/performance/)
- [Bundle Phobia](https://bundlephobia.com/)
