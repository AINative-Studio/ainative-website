# Performance Testing Guidelines

**Issue:** #193 - Document Manual QA Testing Procedures

## Overview

This document outlines performance testing procedures and targets for the AINative Studio application.

---

## Performance Targets

### Core Web Vitals (CWV)

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Additional Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| TTFB | < 200ms | Time to First Byte |
| FCP | < 1.8s | First Contentful Paint |
| TTI | < 3.8s | Time to Interactive |
| TBT | < 200ms | Total Blocking Time |
| Speed Index | < 3.4s | Visual completeness |

### Page-Specific Targets

| Page | LCP Target | TTI Target |
|------|------------|------------|
| Homepage | < 2.5s | < 3.5s |
| Login | < 1.5s | < 2.0s |
| Dashboard | < 3.0s | < 4.0s |
| Blog listing | < 2.5s | < 3.5s |

---

## Testing Tools

### Lighthouse

**Built into Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select categories: Performance, Accessibility, Best Practices, SEO
4. Click "Analyze page load"

**CLI:**
```bash
# Install
npm install -g lighthouse

# Run audit
lighthouse https://ainative.studio --view

# Run with specific config
lighthouse https://ainative.studio \
  --output=json \
  --output-path=./lighthouse-report.json
```

### WebPageTest

**URL:** https://www.webpagetest.org/

**Recommended Settings:**
- Location: Multiple (US, EU, Asia)
- Browser: Chrome
- Connection: Cable/4G
- Runs: 3 (for consistency)

### Chrome DevTools Performance

1. Open DevTools → Performance tab
2. Click Record
3. Reload page
4. Stop recording
5. Analyze timeline

### Real User Monitoring (RUM)

```typescript
// lib/performance.ts
export function reportWebVitals(metric: {
  name: string;
  value: number;
  id: string;
}) {
  // Send to analytics
  if (process.env.NEXT_PUBLIC_ANALYTICS_ID) {
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}
```

---

## Performance Testing Checklist

### Before Testing

- [ ] Clear browser cache
- [ ] Disable browser extensions
- [ ] Use incognito mode
- [ ] Use consistent network conditions
- [ ] Test on production-like environment

### Test Scenarios

#### 1. Initial Page Load

| Page | Cold Cache | Warm Cache | Pass |
|------|------------|------------|------|
| Homepage | [ ] < 2.5s | [ ] < 1.5s | [ ] |
| Login | [ ] < 1.5s | [ ] < 1.0s | [ ] |
| Dashboard | [ ] < 3.0s | [ ] < 2.0s | [ ] |
| Pricing | [ ] < 2.5s | [ ] < 1.5s | [ ] |

#### 2. Navigation Performance

| Test | Target | Pass |
|------|--------|------|
| Client-side navigation | < 300ms | [ ] |
| Route prefetching | Working | [ ] |
| No full page reloads | Confirmed | [ ] |

#### 3. Interaction Performance

| Test | Target | Pass |
|------|--------|------|
| Button click response | < 100ms | [ ] |
| Form submission | < 500ms | [ ] |
| Modal open/close | < 200ms | [ ] |
| Dropdown toggle | < 100ms | [ ] |
| Search input | < 100ms | [ ] |

#### 4. Data Loading

| Test | Target | Pass |
|------|--------|------|
| API response time | < 500ms | [ ] |
| List pagination | < 300ms | [ ] |
| Search results | < 500ms | [ ] |
| Chart rendering | < 1s | [ ] |

---

## Bundle Analysis

### Analyze Bundle Size

```bash
# Build with analyzer
ANALYZE=true npm run build

# Or use next-bundle-analyzer
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});
```

### Bundle Size Targets

| Bundle | Target | Critical |
|--------|--------|----------|
| First Load JS | < 100KB | < 150KB |
| Page-specific JS | < 50KB | < 75KB |
| Total JS | < 500KB | < 750KB |
| CSS | < 50KB | < 75KB |

### Large Dependencies to Watch

| Library | Size | Alternatives |
|---------|------|--------------|
| moment.js | ~300KB | date-fns (~30KB) |
| lodash | ~70KB | lodash-es (tree-shake) |
| charts | varies | lightweight alternatives |

---

## Image Optimization

### Checklist

- [ ] Use Next.js `<Image>` component
- [ ] Implement responsive images
- [ ] Use WebP format where supported
- [ ] Lazy load below-fold images
- [ ] Properly size images

### Image Size Targets

| Image Type | Max Size | Format |
|------------|----------|--------|
| Hero/Banner | < 200KB | WebP/AVIF |
| Thumbnails | < 50KB | WebP |
| Icons | < 5KB | SVG |
| Logos | < 20KB | SVG/PNG |

### Implementation

```tsx
import Image from 'next/image';

// Optimized image
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // Above fold
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>

// Below fold (lazy loaded by default)
<Image
  src="/feature.jpg"
  alt="Feature"
  width={600}
  height={400}
/>
```

---

## Network Optimization

### Caching Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};
```

### Preloading Critical Resources

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Preload critical font */}
        <link
          rel="preload"
          href="/fonts/inter.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preconnect to API */}
        <link rel="preconnect" href="https://api.ainative.studio" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Rendering Performance

### Component Optimization

```tsx
// Memoize expensive components
import { memo } from 'react';

const ExpensiveList = memo(function ExpensiveList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// Use dynamic imports for code splitting
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

### Virtual Scrolling for Long Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Load Testing

### Tools

| Tool | Use Case |
|------|----------|
| k6 | Load testing |
| Artillery | API load testing |
| Playwright | E2E performance |

### k6 Example

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at peak
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://staging.ainative.studio/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

```bash
# Run load test
k6 run load-test.js
```

---

## Performance Budget

### Budget Definition

```json
// budgets.json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "document", "budget": 50 },
        { "resourceType": "script", "budget": 300 },
        { "resourceType": "stylesheet", "budget": 50 },
        { "resourceType": "image", "budget": 500 },
        { "resourceType": "font", "budget": 100 },
        { "resourceType": "total", "budget": 1000 }
      ],
      "resourceCounts": [
        { "resourceType": "script", "budget": 30 },
        { "resourceType": "stylesheet", "budget": 5 }
      ]
    }
  ]
}
```

### Lighthouse CI Budget

```yaml
# lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
  },
};
```

---

## Monitoring & Alerting

### Real User Metrics

| Metric | Good | Alert Threshold |
|--------|------|-----------------|
| LCP p75 | < 2.5s | > 4.0s |
| INP p75 | < 200ms | > 500ms |
| CLS p75 | < 0.1 | > 0.25 |
| Error rate | < 1% | > 5% |

### Synthetic Monitoring

- Run Lighthouse CI on every deployment
- Schedule WebPageTest runs daily
- Monitor trends over time

---

## Testing Log

| Date | Tool | Page | LCP | INP | CLS | Score | Notes |
|------|------|------|-----|-----|-----|-------|-------|
| | | | | | | | |
| | | | | | | | |

---

## Quick Performance Checklist

```
□ Core Web Vitals passing
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1

□ Bundle size optimized
  - First Load JS < 100KB
  - No unused code

□ Images optimized
  - Using Next.js Image
  - Proper sizing
  - Lazy loading

□ Caching configured
  - Static assets cached
  - API responses cached

□ No layout shifts
  - Images have dimensions
  - Fonts preloaded
  - No CLS during load
```
