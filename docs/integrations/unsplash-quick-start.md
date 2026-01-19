# Unsplash Integration - Quick Start Guide

## 5-Minute Setup

### Basic Usage

Import and use in any React component:

```typescript
import { getUnsplashImageUrl } from '@/lib/unsplash';

export default function MyComponent() {
  const imageUrl = getUnsplashImageUrl(
    123,    // Content ID (use your content's unique ID)
    800,    // Width in pixels
    450     // Height in pixels
  );

  return (
    <img
      src={imageUrl}
      alt="Description"
      loading="lazy"
      className="w-full h-full object-cover"
    />
  );
}
```

### Common Dimensions

| Use Case | Width | Height | Code |
|----------|-------|--------|------|
| Featured Hero | 1200 | 675 | `getUnsplashImageUrl(id, 1200, 675)` |
| Card Thumbnail | 600 | 338 | `getUnsplashImageUrl(id, 600, 338)` |
| Medium Banner | 800 | 450 | `getUnsplashImageUrl(id, 800, 450)` |
| Small Thumbnail | 300 | 169 | `getUnsplashImageUrl(id, 300, 169)` |

All maintain 16:9 aspect ratio.

### Best Practices

1. **Use Content ID**: Pass unique content ID for consistent images
2. **Alt Text**: Always provide descriptive alt text
3. **Lazy Loading**: Use `loading="lazy"` for below-fold images
4. **Eager Loading**: Use `loading="eager"` for above-fold images
5. **Gradient Fallback**: Wrap in div with gradient background

### Complete Example

```typescript
<div className="aspect-video bg-gradient-to-br from-[#4B6FED]/20 to-[#8A63F4]/20 overflow-hidden rounded-lg">
  <img
    src={getUnsplashImageUrl(post.id, 800, 450)}
    alt={post.title}
    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
    loading="lazy"
  />
</div>
```

### Testing

Test the integration:
```bash
bash test/issue-366-unsplash-verification.test.sh
```

### Need Help?

See full documentation: [docs/integrations/unsplash-integration.md](./unsplash-integration.md)
