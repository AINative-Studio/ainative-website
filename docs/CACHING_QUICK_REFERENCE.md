# Caching Quick Reference Guide

## Quick Start

### Adding ISR to a New Page

```typescript
// app/my-page/page.tsx
import { getRevalidateTime, getCacheTags } from '@/lib/cache-config';

// Add these exports at the top level
export const revalidate = getRevalidateTime('content', 'blog'); // or 'marketing', 'products' etc.
export const tags = getCacheTags('blog'); // for on-demand revalidation

export default function MyPage() {
  // Your component
}
```

### Using SWR for Client-Side Fetching

```typescript
'use client';
import { useAPI } from '@/lib/swr-config';

function MyComponent() {
  const { data, error, isLoading, mutate } = useAPI('/api/my-data');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  );
}
```

### Triggering On-Demand Revalidation

```bash
# Revalidate specific content
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type":"blog","slug":"my-post","secret":"your-secret"}'

# Revalidate all content
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"type":"all","secret":"your-secret"}'
```

## Revalidation Times Reference

| Content Type | Time | Use Case |
|--------------|------|----------|
| 300s (5 min) | Blog, Webinar, Pricing | Time-sensitive or frequently updated |
| 600s (10 min) | Tutorial, Home | Moderate update frequency |
| 900s (15 min) | Video | Less time-sensitive content |
| 1800s (30 min) | Products, FAQ | Stable content |
| 3600s (1 hour) | About, Terms, Privacy | Rarely changes |

## Common Patterns

### Pattern 1: Static Page with ISR
```typescript
// For marketing pages that rarely change
export const revalidate = 3600; // 1 hour
```

### Pattern 2: Dynamic Content with ISR
```typescript
// For blog posts, tutorials
export const revalidate = 600; // 10 minutes
export const tags = ['blog', 'content'];
```

### Pattern 3: Real-Time Data with SWR
```typescript
// For user dashboards, live stats
const { data } = useAPI('/api/stats', {
  refreshInterval: 30000, // 30 seconds
  revalidateOnFocus: true
});
```

### Pattern 4: Optimistic Updates
```typescript
const { data, mutate } = useAPI('/api/user/settings');

const updateSettings = async (newSettings) => {
  // Optimistically update UI
  mutate({ ...data, ...newSettings }, false);

  // Update on server
  await fetch('/api/user/settings', {
    method: 'PUT',
    body: JSON.stringify(newSettings)
  });

  // Revalidate to get fresh data
  mutate();
};
```

## Cache Tags

Use cache tags for bulk revalidation:

```typescript
// In your page
export const tags = ['blog', 'content'];

// Revalidate all blog posts at once
await revalidateByTag('blog');
```

## Environment Setup

```bash
# .env.local
REVALIDATE_SECRET=your-random-secret-token
```

## Verification

```bash
# Run verification script
./scripts/verify-caching.sh

# Check if page has ISR
npm run build | grep "●"
```

## Troubleshooting

### Cache Not Working
1. Check revalidate export is present
2. Verify build output shows ● (ISR) not λ (Dynamic)
3. Check CDN isn't overriding headers

### SWR Not Updating
1. Check key is consistent
2. Verify network requests in DevTools
3. Try manual revalidation with mutate()

### Revalidation API Fails
1. Check REVALIDATE_SECRET is set
2. Verify edge runtime is supported
3. Check API route logs

## Best Practices

1. **Choose Right Revalidation Time**: Balance freshness vs. performance
2. **Use Cache Tags**: Enable bulk revalidation
3. **Test Locally**: Use verification script
4. **Monitor Production**: Track cache hit rates
5. **Document Changes**: Update cache config when adding pages

## More Information

- Full documentation: `/docs/CACHING_STRATEGY.md`
- Config file: `/lib/cache-config.ts`
- SWR hooks: `/lib/swr-config.ts`
- Revalidation utilities: `/lib/cache-revalidation.ts`
