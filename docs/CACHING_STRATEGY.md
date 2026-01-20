# Caching Strategy - AINative Studio Next.js

## Overview

This document outlines the comprehensive caching strategy implemented for optimal performance, reduced server load, and improved user experience.

## Table of Contents

- [Caching Layers](#caching-layers)
- [ISR Configuration](#isr-configuration)
- [SWR Implementation](#swr-implementation)
- [Cache Headers](#cache-headers)
- [On-Demand Revalidation](#on-demand-revalidation)
- [Edge Runtime](#edge-runtime)
- [Best Practices](#best-practices)

---

## Caching Layers

The application uses multiple caching layers for optimal performance:

### 1. Static Generation + ISR (Server-Side)
- Pages are pre-rendered at build time
- Automatically revalidated after specified time intervals
- Stale pages served while revalidating in background

### 2. Client-Side Data Fetching (SWR)
- Smart client-side caching with automatic revalidation
- Optimistic UI updates
- Request deduplication

### 3. HTTP Cache Headers
- CDN and browser caching
- Static assets cached immutably
- Dynamic content with stale-while-revalidate

### 4. Edge Runtime
- Fast global response times
- Reduced cold start latency
- Geographic distribution

---

## ISR Configuration

### Content Pages

All content pages use Incremental Static Regeneration with different revalidation times based on content freshness requirements.

#### Blog Posts
```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 300; // 5 minutes
export const tags = ['blog', 'content'];
```
- **Revalidation**: 5 minutes
- **Reason**: Blog content changes relatively frequently, needs fresh SEO

#### Tutorials
```typescript
// app/tutorials/[slug]/page.tsx
export const revalidate = 600; // 10 minutes
export const tags = ['tutorial', 'content'];
```
- **Revalidation**: 10 minutes
- **Reason**: Tutorial content is more stable than blog posts

#### Webinars
```typescript
// app/webinars/[slug]/page.tsx
export const revalidate = 300; // 5 minutes
export const tags = ['webinar', 'content'];
```
- **Revalidation**: 5 minutes
- **Reason**: Time-sensitive content (registration deadlines, live events)

#### Community Videos
```typescript
// app/community/videos/[slug]/page.tsx
export const revalidate = 900; // 15 minutes
export const tags = ['video', 'community', 'content'];
```
- **Revalidation**: 15 minutes
- **Reason**: User-generated content, less time-sensitive

### Marketing Pages

Marketing pages have longer revalidation times as they change infrequently.

#### Home Page
```typescript
// app/page.tsx
export const revalidate = 600; // 10 minutes
```
- **Revalidation**: 10 minutes
- **Reason**: Landing page with dynamic content (featured items)

#### Pricing Page
```typescript
// app/pricing/page.tsx
export const revalidate = 300; // 5 minutes
```
- **Revalidation**: 5 minutes
- **Reason**: Price changes need to be visible quickly

#### Products Page
```typescript
// app/products/page.tsx
export const revalidate = 1800; // 30 minutes
```
- **Revalidation**: 30 minutes
- **Reason**: Product information changes infrequently

#### Static Pages (About, Terms, Privacy)
```typescript
export const revalidate = 3600; // 1 hour
```
- **Revalidation**: 1 hour
- **Reason**: Rarely changing content

---

## SWR Implementation

### Custom Hooks

We've implemented custom SWR hooks for different data types with optimized configurations.

#### Usage Data
```typescript
import { useUsageData } from '@/lib/swr-config';

const { data, error, isLoading, mutate } = useUsageData(userId, timeRange);
```
- **Refresh Interval**: 60 seconds
- **Revalidate on Focus**: Yes
- **Use Case**: Dashboard metrics, real-time usage stats

#### User Settings
```typescript
import { useUserSettings } from '@/lib/swr-config';

const { data, error, isLoading } = useUserSettings(userId);
```
- **Refresh Interval**: 30 seconds
- **Revalidate on Focus**: Yes
- **Use Case**: User preferences, account settings

#### Pricing Plans
```typescript
import { usePricingPlans } from '@/lib/swr-config';

const { data, error, isLoading } = usePricingPlans();
```
- **Refresh Interval**: 5 minutes
- **Revalidate on Focus**: No
- **Use Case**: Public pricing data (rarely changes)

### SWR Configuration Options

```typescript
// lib/swr-config.ts
export const defaultSWRConfig = {
  dedupingInterval: 2000,        // Dedupe requests within 2 seconds
  revalidateOnFocus: true,        // Revalidate when window regains focus
  revalidateOnReconnect: true,    // Revalidate on network reconnection
  errorRetryCount: 3,             // Retry failed requests 3 times
  errorRetryInterval: 5000,       // Wait 5 seconds between retries
  keepPreviousData: true,         // Show stale data while revalidating
};
```

---

## Cache Headers

### Static Assets

Configured in `next.config.ts` for optimal CDN and browser caching.

#### Images and Fonts
```typescript
{
  source: '/images/:path*',
  headers: [{
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable'
  }]
}
```
- **Duration**: 1 year
- **Immutable**: Yes
- **Reason**: Content-addressed assets never change

#### Public Assets
```typescript
{
  source: '/(favicon.ico|robots.txt|sitemap.xml)',
  headers: [{
    key: 'Cache-Control',
    value: 'public, max-age=86400, stale-while-revalidate=604800'
  }]
}
```
- **Duration**: 1 day
- **SWR**: 7 days
- **Reason**: Infrequently changing metadata files

### Security Headers

All routes include security headers:
- `X-DNS-Prefetch-Control: on`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: origin-when-cross-origin`

---

## On-Demand Revalidation

### API Endpoint

Use the revalidation API to manually clear cache:

```bash
# Revalidate specific content
POST /api/revalidate
{
  "type": "blog",
  "slug": "my-blog-post",
  "secret": "your-secret-token"
}

# Revalidate all content
POST /api/revalidate
{
  "type": "all",
  "secret": "your-secret-token"
}

# Revalidate by tag
POST /api/revalidate
{
  "tag": "blog",
  "secret": "your-secret-token"
}
```

### Environment Variable

Set `REVALIDATE_SECRET` in your environment to secure the revalidation endpoint:

```bash
REVALIDATE_SECRET=your-random-secret-token
```

### Webhook Integration

Configure your CMS (Strapi, Contentful, etc.) to trigger revalidation:

1. Create webhook in CMS admin
2. Set URL: `https://your-domain.com/api/revalidate`
3. Add secret header: `{ "secret": "your-secret-token" }`
4. Configure payload:
   ```json
   {
     "type": "blog",
     "slug": "{{entry.slug}}"
   }
   ```

### Programmatic Revalidation

Use revalidation utilities in your code:

```typescript
import {
  revalidateContent,
  revalidateByTag,
  revalidateByPath
} from '@/lib/cache-revalidation';

// Revalidate specific content
await revalidateContent('blog', 'my-slug');

// Revalidate by tag
await revalidateByTag('blog');

// Revalidate by path
await revalidateByPath('/blog/my-slug');
```

---

## Edge Runtime

### Revalidation API

The revalidation API uses Edge Runtime for fast global response:

```typescript
// app/api/revalidate/route.ts
export const runtime = 'edge';
export const maxDuration = 5;
```

**Benefits:**
- Sub-100ms response times globally
- No cold starts
- Reduced infrastructure costs

### When to Use Edge Runtime

Use Edge Runtime for:
- ✅ Simple API routes without Node.js dependencies
- ✅ Revalidation endpoints
- ✅ Middleware and redirects
- ✅ Public data endpoints

Avoid Edge Runtime for:
- ❌ Database connections
- ❌ File system operations
- ❌ Complex computations
- ❌ Node.js-specific APIs

---

## Best Practices

### 1. Choose the Right Revalidation Time

| Content Type | Revalidation | Reason |
|--------------|--------------|--------|
| Real-time data | Use SWR client-side | Needs immediate updates |
| Time-sensitive content | 5 minutes | Balance freshness and performance |
| Regular updates | 10-15 minutes | Good balance for most content |
| Stable content | 30-60 minutes | Rarely changes, maximize cache hits |
| Static content | 1+ hours | Almost never changes |

### 2. Use Cache Tags

Always add cache tags to enable bulk revalidation:

```typescript
export const tags = ['blog', 'content'];
```

### 3. Monitor Cache Hit Rates

Check build output for ISR status:
- ○ (Static) - Fully static page
- ● (SSG) - Pre-rendered with ISR
- λ (Dynamic) - Server-rendered per request

### 4. Test Revalidation

Test your revalidation strategy:

```bash
# Test specific page
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type":"blog","slug":"test-post","secret":"xxx"}'

# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/blog/test-post
```

### 5. SWR Best Practices

```typescript
// ✅ Good - Conditional fetching
const { data } = useAPI(userId ? `/api/users/${userId}` : null);

// ✅ Good - Manual revalidation
const { data, mutate } = useAPI('/api/data');
await mutate(); // Revalidate manually

// ❌ Avoid - Fetching without conditions
const { data } = useAPI(`/api/users/${userId}`); // Fetches even if userId is undefined
```

### 6. Optimize for CDN

Structure your cache strategy for CDN effectiveness:
- Use consistent URLs (no timestamps in URLs)
- Set appropriate cache headers
- Leverage stale-while-revalidate
- Use versioned static assets

---

## Cache Configuration Reference

All cache configurations are centralized in `/lib/cache-config.ts`:

```typescript
import { CacheConfig, getRevalidateTime, getCacheTags } from '@/lib/cache-config';

// Get revalidation time
const revalidate = getRevalidateTime('content', 'blog'); // 300

// Get cache tags
const tags = getCacheTags('blog'); // ['blog', 'content']

// Get SWR config
import { getSWRConfig } from '@/lib/cache-config';
const config = getSWRConfig('userSettings');
```

---

## Monitoring and Debugging

### Check Build Output

```bash
npm run build

# Look for route indicators:
# ○ Static   - /about
# ● SSG      - /blog/[slug] (revalidate: 300s)
# λ Dynamic  - /api/user/[id]
```

### Debug Cache Headers

```bash
# Check response headers
curl -I https://your-domain.com/blog/my-post

# Should see:
# Cache-Control: s-maxage=300, stale-while-revalidate=600
# X-Next-Cache: HIT (or MISS, STALE)
```

### SWR DevTools

SWR DevTools are automatically available in development:

```typescript
import { SWRConfig } from 'swr';
import { SWRDevTools } from '@/lib/swr-devtools';

<SWRConfig>
  <SWRDevTools />
  {children}
</SWRConfig>
```

---

## Performance Metrics

### Expected Improvements

With this caching strategy, you should see:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Time to First Byte (TTFB) | 500-1000ms | 50-150ms | 80-90% |
| Server Load | High | Low | 70-80% reduction |
| CDN Hit Rate | Low | 80-90% | Significant |
| API Calls | Every request | Cached | 60-80% reduction |

### Monitoring

Monitor these metrics:
- Cache hit rate (via CDN analytics)
- TTFB and page load times
- Server CPU/memory usage
- API request volume
- Build time for ISR pages

---

## Troubleshooting

### Page Not Revalidating

1. Check revalidation time is set correctly
2. Verify cache tags are applied
3. Test revalidation API manually
4. Check CDN cache settings

### SWR Not Updating

1. Verify key is correct and consistent
2. Check network tab for deduplication
3. Test manual revalidation with `mutate()`
4. Review SWR config options

### Cache Headers Not Applied

1. Check `next.config.ts` headers configuration
2. Verify CDN isn't overriding headers
3. Test with `curl -I` to see raw headers
4. Clear CDN cache if necessary

---

## Further Reading

- [Next.js ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [SWR Documentation](https://swr.vercel.app/)
- [HTTP Caching - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Edge Runtime - Vercel](https://vercel.com/docs/functions/edge-functions)
