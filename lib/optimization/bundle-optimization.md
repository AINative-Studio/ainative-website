# Bundle Optimization Guide

This document describes the bundle optimization strategies implemented in the AINative Next.js application.

## Table of Contents

1. [Dynamic Imports](#dynamic-imports)
2. [Chunk Splitting Strategy](#chunk-splitting-strategy)
3. [Package Import Optimization](#package-import-optimization)
4. [Usage Guidelines](#usage-guidelines)

## Dynamic Imports

### Lazy-Loaded Components

All heavy components are lazily loaded using `next/dynamic` to reduce initial bundle size:

#### Charts (`components/lazy/LazyCharts.tsx`)
```typescript
import { LazyAreaChart, LazyBarChart, LazyLineChart, LazyPieChart } from '@/components/lazy';
```

- **Impact**: Reduces initial bundle by ~150KB (gzipped)
- **Use case**: Dashboard analytics, reporting pages
- **Trade-off**: Small delay on first render (skeleton shown)

#### Video Player (`components/lazy/LazyVideoPlayer.tsx`)
```typescript
import { LazyVideoPlayer } from '@/components/lazy';
```

- **Impact**: Reduces initial bundle by ~200KB (includes HLS.js)
- **Use case**: Tutorial watch pages, video content
- **Trade-off**: Brief loading state before video appears

#### Dialogs and Modals (`components/lazy/LazyDialogs.tsx`)
```typescript
import {
  LazyAgentDetailModal,
  LazySprintPlanReview,
  LazyDataModelReview,
  LazyBacklogReview,
  LazySwarmLaunchConfirmation,
  LazyAgentSwarmTerminal
} from '@/components/lazy';
```

- **Impact**: Reduces initial bundle by ~100KB
- **Use case**: Modal dialogs that appear on interaction
- **Trade-off**: None (modals are not visible on page load)

#### Markdown Rendering (`components/lazy/LazyMarkdown.tsx`)
```typescript
import { LazyReactMarkdown, LazySyntaxHighlighter } from '@/components/lazy';
```

- **Impact**: Reduces initial bundle by ~80KB
- **Use case**: Documentation pages, blog posts, code examples
- **Trade-off**: Content appears after markdown parser loads

### Framer Motion Optimization

Instead of importing the full `motion` component, use the lightweight `m` component:

```typescript
// Before
import { motion } from 'framer-motion';

// After
import { m as motion } from 'framer-motion';
// Or use LazyMotionProvider for even better optimization
import { LazyMotionProvider, m } from '@/components/lazy';
```

- **Impact**: Reduces framer-motion bundle by ~50%
- **Works best with**: Simple animations (opacity, position, scale)
- **Not recommended for**: Complex animations requiring 3D transforms or layout animations

## Chunk Splitting Strategy

### Vendor Chunks

The webpack configuration splits third-party libraries into separate chunks for better caching:

1. **react-vendor** (Priority: 40)
   - React and React DOM
   - Changes infrequently, excellent cache hit rate

2. **radix-ui** (Priority: 35)
   - All @radix-ui components
   - Shared across most pages

3. **charts** (Priority: 30)
   - Recharts library
   - Only loaded on pages with analytics

4. **animations** (Priority: 30)
   - Framer Motion
   - Loaded on most pages but separately cached

5. **icons** (Priority: 25)
   - lucide-react, react-icons, @radix-ui/react-icons
   - Large icon libraries split from main bundle

6. **utilities** (Priority: 20)
   - axios, date-fns, zod
   - Common utilities used across routes

7. **vendor** (Priority: 10)
   - Remaining node_modules
   - Fallback for unmatched dependencies

8. **common** (Priority: 5)
   - Code shared across 2+ pages
   - Automatically detected and split

### Benefits

- **Better Caching**: Vendor chunks rarely change between deploys
- **Parallel Loading**: Browser downloads multiple chunks simultaneously
- **Reduced Redundancy**: Shared code extracted to common chunks
- **Optimal Cache Invalidation**: Only changed chunks need re-download

## Package Import Optimization

### Next.js `optimizePackageImports`

The following packages are automatically tree-shaken by Next.js:

```typescript
experimental: {
  optimizePackageImports: [
    'lucide-react',        // Only imports used icons
    '@radix-ui/react-icons',
    'framer-motion',       // Only imports used features
    'recharts',           // Only imports used chart types
    'react-icons',        // Only imports used icon sets
    '@tanstack/react-query',
  ],
}
```

**Best Practice**: Always use named imports, never default imports:

```typescript
// Good - Tree-shakeable
import { Calendar, AlertCircle } from 'lucide-react';

// Bad - Imports entire library
import * as Icons from 'lucide-react';
```

## Usage Guidelines

### When to Use Dynamic Imports

Use dynamic imports for:
- Heavy charting libraries
- Video players and media components
- Modal dialogs and overlays
- Markdown renderers and syntax highlighters
- Components not visible on initial page load
- Route-specific components (dashboard pages)

### When NOT to Use Dynamic Imports

Avoid dynamic imports for:
- Above-the-fold content
- Navigation components (header, footer)
- Critical UI elements (buttons, inputs, cards)
- Small utility components (<10KB)

### Performance Monitoring

Monitor bundle sizes using:

```bash
# Generate bundle analysis
npm run build:analyze

# Check output in .next/analyze/
open .next/analyze/client.html
```

### Expected Bundle Sizes (Production)

Target sizes after optimization:

- **Main bundle**: <150KB (gzipped)
- **react-vendor**: ~130KB (gzipped)
- **radix-ui**: ~80KB (gzipped)
- **Page-specific chunks**: <50KB each (gzipped)
- **Total First Load JS**: <400KB (gzipped)

### Cache Strategy

```typescript
// Static assets (images, fonts)
Cache-Control: public, max-age=31536000, immutable

// JavaScript chunks
Cache-Control: public, max-age=31536000, immutable

// HTML pages
Cache-Control: public, max-age=0, must-revalidate

// API routes
Cache-Control: private, no-cache, no-store, max-age=0
```

## Troubleshooting

### Issue: Hydration Errors with Dynamic Components

**Solution**: Add `ssr: false` to dynamic imports:
```typescript
const LazyComponent = dynamic(() => import('./Component'), {
  ssr: false  // Disable server-side rendering
});
```

### Issue: Flash of Loading State

**Solution**: Add better loading skeletons:
```typescript
const LazyComponent = dynamic(() => import('./Component'), {
  loading: () => <Skeleton className="w-full h-64" />
});
```

### Issue: Large Vendor Chunks

**Solution**: Check for duplicate dependencies:
```bash
npm ls <package-name>
npm dedupe
```

## Future Optimizations

Potential improvements for future implementation:

1. **Route-based code splitting**: Automatically split by route patterns
2. **Prefetching**: Intelligently prefetch likely next pages
3. **Web Workers**: Offload heavy computations to background threads
4. **Image optimization**: Further optimize with next/image
5. **Font optimization**: Subset fonts to only used characters
6. **Critical CSS extraction**: Inline critical styles for faster FCP

## Monitoring and Metrics

Track these metrics to measure optimization success:

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

Use Lighthouse CI or Web Vitals for continuous monitoring.
