# Performance Monitoring & Testing

Comprehensive performance monitoring and testing setup for AINative Studio Next.js application.

## Table of Contents

- [Overview](#overview)
- [Core Web Vitals](#core-web-vitals)
- [Performance Budgets](#performance-budgets)
- [Lighthouse CI](#lighthouse-ci)
- [Real User Monitoring (RUM)](#real-user-monitoring-rum)
- [Bundle Analysis](#bundle-analysis)
- [CI/CD Integration](#cicd-integration)
- [Local Testing](#local-testing)
- [Troubleshooting](#troubleshooting)

## Overview

Our performance monitoring strategy includes:

1. **Automated Lighthouse CI** - Runs on every PR to catch regressions
2. **Real User Monitoring (RUM)** - Tracks actual user experience via Vercel Analytics
3. **Web Vitals Tracking** - Custom monitoring of Core Web Vitals
4. **Bundle Analysis** - Track JavaScript bundle sizes
5. **Performance Budgets** - Enforce resource size and timing limits

## Core Web Vitals

We track the following Core Web Vitals:

### Largest Contentful Paint (LCP)
- **Good:** ≤ 2.5s
- **Needs Improvement:** 2.5s - 4.0s
- **Poor:** > 4.0s

Measures loading performance. Should occur within 2.5 seconds of when the page first starts loading.

### First Input Delay (FID) / Interaction to Next Paint (INP)
- **Good:** ≤ 100ms (FID) / ≤ 200ms (INP)
- **Needs Improvement:** 100-300ms (FID) / 200-500ms (INP)
- **Poor:** > 300ms (FID) / > 500ms (INP)

Measures interactivity. Pages should respond to user interactions within 100ms.

### Cumulative Layout Shift (CLS)
- **Good:** ≤ 0.1
- **Needs Improvement:** 0.1 - 0.25
- **Poor:** > 0.25

Measures visual stability. Pages should maintain a CLS of less than 0.1.

### Additional Metrics

- **First Contentful Paint (FCP):** Target ≤ 1.8s
- **Time to Interactive (TTI):** Target ≤ 3.8s
- **Total Blocking Time (TBT):** Target ≤ 300ms
- **Speed Index:** Target ≤ 3.0s

## Performance Budgets

Performance budgets are defined in `performance-budget.json` and enforced by Lighthouse CI.

### Resource Size Budgets

| Resource Type | Budget (KB) |
|--------------|-------------|
| Document     | 100         |
| Scripts      | 400         |
| Stylesheets  | 100         |
| Images       | 500         |
| Fonts        | 200         |
| Total        | 2000        |

### Timing Budgets

| Metric | Budget |
|--------|--------|
| FCP    | 1800ms |
| LCP    | 2500ms |
| CLS    | 0.1    |
| TBT    | 300ms  |
| SI     | 3000ms |
| TTI    | 3800ms |

## Lighthouse CI

Lighthouse CI runs automatically on every push and pull request to the `main` branch.

### Configuration

See `lighthouserc.js` for the full configuration. Key settings:

- **URLs tested:** Home, AI Kit, Pricing, About, Blog, Contact, Dashboard
- **Runs per URL:** 3 (median score used)
- **Minimum scores:**
  - Performance: 85%
  - Accessibility: 95%
  - Best Practices: 90%
  - SEO: 95%

### Viewing Results

1. **In Pull Requests:** Lighthouse CI posts a comment with scores for each page
2. **GitHub Actions:** View detailed reports in workflow artifacts
3. **Temporary Storage:** Click the link in PR comments for interactive reports

## Real User Monitoring (RUM)

### Vercel Analytics

Vercel Speed Insights provides Real User Monitoring automatically when deployed to Vercel.

**Features:**
- Core Web Vitals from real users
- Geographic distribution
- Device/browser breakdown
- Performance trends over time

**Access:** Visit your Vercel dashboard → Select project → Analytics tab

### Custom Web Vitals Tracking

We also collect Web Vitals client-side using `components/analytics/WebVitalsMonitor.tsx`:

```typescript
import WebVitalsMonitor from '@/components/analytics/WebVitalsMonitor';

// In root layout
<WebVitalsMonitor />
```

This component:
- Tracks all Core Web Vitals
- Logs metrics to console in development
- Sends metrics to custom analytics endpoint
- Integrates with Vercel Analytics

### Custom Analytics Endpoint

Web Vitals are sent to `/api/analytics/vitals` (to be implemented) for custom tracking:

```typescript
// Expected payload
{
  metric: 'LCP' | 'FCP' | 'CLS' | 'INP' | 'TTFB',
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor',
  delta: number,
  id: string,
  navigationType: string,
  url: string,
  userAgent: string,
  timestamp: number
}
```

## Bundle Analysis

### Analyzing Bundle Size

Run the bundle analyzer to visualize bundle composition:

```bash
npm run build:analyze
```

This will:
1. Build the production bundle
2. Generate interactive HTML reports
3. Open reports in your browser:
   - `./analyze/client.html` - Client-side bundle
   - `./analyze/server.html` - Server-side bundle

### Optimization Checklist

- [ ] Use dynamic imports for large components
- [ ] Enable tree-shaking for unused code
- [ ] Optimize package imports (configured in `next.config.ts`)
- [ ] Use `next/image` for automatic image optimization
- [ ] Lazy load below-the-fold content
- [ ] Code-split routes automatically via App Router

### Package Optimizations

Configured in `next.config.ts`:

```typescript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    'framer-motion',
    'recharts',
  ],
}
```

## CI/CD Integration

### GitHub Actions Workflow

The Lighthouse CI workflow runs on:
- Push to `main` branch
- Pull requests targeting `main`

**Workflow steps:**
1. Checkout code
2. Install dependencies
3. Build production bundle
4. Run Lighthouse CI on all configured URLs
5. Upload artifacts
6. Check for regressions
7. Comment on PR with results

### Manual Workflow Trigger

```bash
# From GitHub Actions UI:
# 1. Go to Actions tab
# 2. Select "Lighthouse CI" workflow
# 3. Click "Run workflow"
```

## Local Testing

### Run Lighthouse Locally

```bash
# Build and run Lighthouse CI
npm run lighthouse

# View detailed report
npm run perf:report
```

### Manual Lighthouse Audit

```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run audit on local dev server
npm run dev
lighthouse http://localhost:3000 --view

# Run audit on production build
npm run build
npm run start
lighthouse http://localhost:3000 --view
```

### Test Specific Pages

Modify `lighthouserc.js` to add/remove URLs:

```javascript
url: [
  'http://localhost:3000/',
  'http://localhost:3000/your-page',
],
```

## Troubleshooting

### Lighthouse CI Fails to Start Server

**Problem:** Server doesn't start or times out

**Solutions:**
- Check that `npm run build` completes successfully
- Verify port 3000 is available
- Increase timeout in `lighthouserc.js`:

```javascript
collect: {
  startServerCommand: 'npm run start',
  startServerReadyPattern: 'Ready in',
  startServerReadyTimeout: 30000, // Increase to 30s
}
```

### Low Performance Scores

**Common causes:**
1. Large JavaScript bundles → Run `npm run build:analyze`
2. Unoptimized images → Use `next/image`
3. Missing compression → Check server configuration
4. Blocking resources → Defer non-critical JS/CSS
5. Excessive third-party scripts → Audit tracking scripts

### Web Vitals Not Appearing

**Check:**
1. `WebVitalsMonitor` component is in root layout
2. Browser console for errors
3. Network tab for `/api/analytics/vitals` requests
4. Vercel Analytics is enabled in deployment

### Bundle Analyzer Not Opening

**Problem:** Report doesn't open in browser

**Solution:**
```bash
# Set ANALYZE env variable explicitly
ANALYZE=true npm run build

# Or manually open reports
open .next/analyze/client.html
```

## Performance Optimization Tips

### Images
- Use `next/image` with `priority` for above-the-fold images
- Specify width/height to prevent CLS
- Use WebP/AVIF formats
- Implement lazy loading for below-the-fold images

### Fonts
- Use `next/font` for automatic font optimization
- Set `display: 'swap'` to prevent FOIT
- Preload critical fonts
- Limit font variants

### JavaScript
- Code-split using dynamic imports
- Defer non-critical scripts
- Use React Server Components where possible
- Minimize client-side state

### CSS
- Use Tailwind's JIT mode (already enabled)
- Purge unused styles in production
- Critical CSS inline for above-the-fold content
- Avoid large CSS-in-JS bundles

### Caching
- Configure proper cache headers
- Use ISR (Incremental Static Regeneration) where appropriate
- Implement service workers for offline support
- Use SWR/React Query for data caching

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Core Web Vitals Report](https://support.google.com/webmasters/answer/9205520)
