# Unsplash Integration Documentation

## Overview

The AINative Studio Next.js application integrates with Unsplash for stock imagery across blog posts, tutorials, webinars, and showcase content. This integration provides high-quality, royalty-free images without requiring an API key by using Unsplash's public CDN.

**Issue**: #366 - Unsplash Integration Verification
**Implementation Date**: January 2026
**Status**: Verified and Active

---

## Architecture

### Core Implementation

**File**: `/lib/unsplash.ts`

The integration uses a simple, efficient approach:
- Pre-selected photo IDs from Unsplash's business/tech categories
- Direct CDN access via `images.unsplash.com`
- No API key required
- Deterministic image selection based on content ID

### Key Functions

#### `getUnsplashImageUrl(id: number, width: number, height: number): string`

Generates an optimized Unsplash image URL for a given content ID.

**Parameters:**
- `id` - Content ID (blog post ID, tutorial ID, etc.) for consistent image selection
- `width` - Desired image width in pixels
- `height` - Desired image height in pixels

**Returns:** Fully qualified Unsplash CDN URL with optimization parameters

**Example:**
```typescript
import { getUnsplashImageUrl } from '@/lib/unsplash';

// Generate URL for blog post with ID 5, size 800x450
const imageUrl = getUnsplashImageUrl(5, 800, 450);
// Returns: https://images.unsplash.com/photo-1497366412874-3415097a27e7?ixlib=rb-4.0.3&w=800&h=450&fit=crop&q=80&fm=jpg
```

#### `getImageKeywords(id: number): string`

Returns keyword sets for potential future search-based image selection.

**Parameters:**
- `id` - Content ID for keyword selection

**Returns:** Comma-separated keywords (e.g., "business,office,workspace")

---

## Photo Collection

The integration uses 9 carefully curated photo IDs from Unsplash's business and technology categories:

1. `1497366216548-37526070297c` - Office workspace
2. `1498050108023-c5249f4df085` - Coding on laptop
3. `1522071820081-009f0129c71c` - Team collaboration
4. `1484480974693-6ca0a78fb36b` - Laptop and coffee
5. `1497366412874-3415097a27e7` - Startup office
6. `1460925895917-afdab827c52f` - Data visualization
7. `1504384308090-c894fdcc538d` - Modern workspace
8. `1519389950473-47ba0277781c` - Technology
9. `1517245386807-bb43f82c33c4` - Business meeting

Images are selected using modulo operation: `PHOTO_IDS[id % PHOTO_IDS.length]`

This ensures:
- Consistent images for the same content ID
- Varied images across different content
- No random selection that changes on refresh

---

## URL Parameters

The generated URLs use Unsplash's imgix CDN with the following parameters:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `ixlib` | `rb-4.0.3` | Imgix library version |
| `w` | Dynamic | Image width |
| `h` | Dynamic | Image height |
| `fit` | `crop` | Fit mode (maintains aspect ratio) |
| `q` | `80` | JPEG quality (balance of quality/size) |
| `fm` | `jpg` | Output format |

**Example URL:**
```
https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&w=800&h=450&fit=crop&q=80&fm=jpg
```

---

## Integration Points

### Blog Pages

**Files:**
- `app/blog/BlogListingClient.tsx` - Blog listing page
- `app/blog/[slug]/BlogDetailClient.tsx` - Individual blog post page

**Usage:**
```typescript
// Featured post (800x450)
<img src={getUnsplashImageUrl(featuredPost.id, 800, 450)} alt={featuredPost.title} loading="eager" />

// List cards (600x338)
<img src={getUnsplashImageUrl(post.id, 600, 338)} alt={post.title} loading="lazy" />

// Detail page (1200x675)
<img src={getUnsplashImageUrl(post.id, 1200, 675)} alt={post.title} loading="eager" />
```

### Tutorial Pages

**Files:**
- `app/tutorials/TutorialListingClient.tsx`
- `app/tutorials/[slug]/TutorialDetailClient.tsx`

Similar image dimensions as blog pages.

### Webinar Pages

**Files:**
- `app/webinars/WebinarListingClient.tsx`
- `app/webinars/[slug]/WebinarDetailClient.tsx`

Uses same pattern for featured images.

### Showcase Pages

**Files:**
- `app/showcases/ShowcaseListingClient.tsx`
- `app/showcases/[slug]/ShowcaseDetailClient.tsx`

Integrates for showcase featured images.

---

## Next.js Configuration

The integration requires adding Unsplash's domain to Next.js image optimization config.

**File**: `next.config.ts`

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    // ... other domains
  ],
}
```

This enables:
- Next.js Image component support (if used in future)
- Security validation of external image sources
- Proper CORS handling

---

## Image Loading Strategy

### Performance Optimization

1. **Featured Images**: `loading="eager"`
   - Above-the-fold content
   - Critical for initial page render
   - Used on detail pages and first card

2. **List Images**: `loading="lazy"`
   - Below-the-fold content
   - Deferred loading as user scrolls
   - Improves initial page load time

### Responsive Dimensions

| Context | Dimensions | Aspect Ratio | Use Case |
|---------|------------|--------------|----------|
| Featured Post | 800x450 | 16:9 | Hero images on listing pages |
| Card Thumbnails | 600x338 | 16:9 | Grid/list view thumbnails |
| Detail Hero | 1200x675 | 16:9 | Full-width hero on detail pages |

All dimensions maintain 16:9 aspect ratio for consistency.

---

## Accessibility

### Alt Text

All images include descriptive alt text:
```typescript
<img
  src={getUnsplashImageUrl(post.id, 800, 450)}
  alt={post.title}  // Content title as alt text
  loading="eager"
/>
```

### Image Attribution

While Unsplash's license doesn't require attribution for CDN usage, best practice would be to include attribution in a footer or image metadata when feasible.

**Unsplash License Summary:**
- Free to use for commercial and non-commercial purposes
- No permission needed
- Attribution appreciated but not required
- Cannot be compiled into a competing service

---

## Testing

### Test Script

**File**: `test/issue-366-unsplash-verification.test.sh`

Comprehensive test suite verifying:
1. File existence and structure
2. Function exports and signatures
3. Photo IDs array completeness
4. CDN URL format correctness
5. Blog integration presence
6. Next.js configuration
7. Other content page integrations
8. TypeScript type safety
9. Documentation completeness
10. Image usage patterns (eager/lazy loading)
11. Optimal dimension usage
12. Accessibility attributes

**Run Tests:**
```bash
bash test/issue-366-unsplash-verification.test.sh
```

### Manual Testing

1. **Visual Verification**: Visit `/blog`, `/tutorials`, `/webinars`, `/showcases`
2. **Image Loading**: Verify images load correctly and quickly
3. **Responsive Behavior**: Test on different screen sizes
4. **Network Tab**: Verify correct URLs and response codes (200)
5. **Lazy Loading**: Scroll down and verify below-fold images load

---

## Error Handling

### Missing Images

If an Unsplash photo becomes unavailable:
- Unsplash returns a placeholder or 404
- Browser displays broken image icon
- Consider fallback gradient backgrounds (already implemented)

**Current Fallback Pattern:**
```typescript
<div className="aspect-video bg-gradient-to-br from-[#4B6FED]/20 to-[#8A63F4]/20 overflow-hidden">
  <img src={getUnsplashImageUrl(post.id, 800, 450)} alt={post.title} />
</div>
```

The gradient background displays while image loads or if image fails.

### Network Failures

- Browser native retry mechanisms handle temporary failures
- Lazy loading prevents initial load blocking
- No special error handling needed for network issues

---

## Maintenance

### Adding New Photos

To expand the photo collection:

1. Browse Unsplash for business/tech photos
2. Extract photo ID from URL (e.g., `photo-{ID}`)
3. Add to `PHOTO_IDS` array in `lib/unsplash.ts`
4. Test with various content IDs

**Photo Selection Criteria:**
- Professional business/tech aesthetic
- Neutral, non-distracting backgrounds
- High resolution (minimum 1920x1080)
- Horizontal orientation (16:9 aspect ratio works best)
- Good color balance with site theme (dark backgrounds preferred)

### Updating URLs

If Unsplash changes CDN format:
1. Update `getUnsplashImageUrl()` function
2. Test across all integration points
3. Run test suite to verify
4. Update documentation

---

## Performance Metrics

### Expected Behavior

- **Image Size**: 50-150KB per image (depending on dimensions)
- **Load Time**: < 500ms on good connection
- **CDN Response**: < 200ms
- **Format**: JPEG (optimal for photos)
- **Compression**: Quality 80 (good balance)

### Optimization Benefits

1. **CDN Delivery**: Global edge network for fast delivery
2. **Dynamic Resizing**: Exact dimensions prevent over-fetching
3. **Format Optimization**: Automatic format selection (JPEG for photos)
4. **Caching**: Aggressive browser and CDN caching
5. **Lazy Loading**: Deferred loading for below-fold content

---

## Troubleshooting

### Images Not Loading

**Symptom**: Broken image icons or 404 errors

**Solutions:**
1. Verify Next.js config includes `images.unsplash.com`
2. Check network tab for actual URL being requested
3. Test photo ID directly in browser
4. Verify no ad blockers blocking Unsplash
5. Check CORS headers (should be open)

### Images Loading Slowly

**Symptom**: Long load times or lazy loading issues

**Solutions:**
1. Verify image dimensions aren't excessively large
2. Check network connection quality
3. Review lazy loading implementation
4. Consider image preloading for critical images
5. Monitor Unsplash CDN status

### Wrong Images Displayed

**Symptom**: Unexpected or mismatched images

**Solutions:**
1. Verify content ID being passed is correct
2. Check `PHOTO_IDS` array integrity
3. Ensure no duplicate IDs in different content
4. Review modulo operation logic
5. Clear browser cache

---

## Future Enhancements

### Potential Improvements

1. **Search API Integration**
   - Use `getImageKeywords()` for dynamic search
   - Requires Unsplash API key
   - More relevant images per content

2. **Custom Image Upload**
   - Allow authors to upload custom featured images
   - Fallback to Unsplash if no custom image
   - Store in S3 or similar service

3. **Image Attribution Display**
   - Add photographer credits
   - Link to Unsplash profile
   - Requires API or manual mapping

4. **Blurhash Placeholders**
   - Generate blurhash for each photo
   - Show blurred preview while loading
   - Improves perceived performance

5. **Next.js Image Component**
   - Migrate from `<img>` to `<Image>`
   - Automatic optimization
   - Built-in lazy loading

---

## API Key Configuration (Not Required)

While the current implementation doesn't require an API key, if you need to use Unsplash's search API in the future:

### Setup

1. Create account at [Unsplash Developers](https://unsplash.com/developers)
2. Create new application
3. Copy Access Key
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_access_key_here
   ```
5. Update `lib/unsplash.ts` to use API

### API Endpoints

- Search Photos: `https://api.unsplash.com/search/photos`
- Get Photo: `https://api.unsplash.com/photos/{id}`
- Random Photo: `https://api.unsplash.com/photos/random`

### Rate Limits

- Free tier: 50 requests/hour
- Production (after approval): 5,000 requests/hour
- Consider caching responses to stay within limits

---

## Related Documentation

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Unsplash License](https://unsplash.com/license)
- [imgix API Reference](https://docs.imgix.com/apis/rendering)

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-18 | 1.0.0 | Initial integration verification and documentation |

---

## Contact

For questions or issues with the Unsplash integration:
- Create issue on GitHub: [ainative-website-nextjs-staging](https://github.com/your-repo)
- Review test results: `test/issue-366-unsplash-verification.test.sh`
- Check implementation: `lib/unsplash.ts`
