# Analytics Components

This directory contains analytics and monitoring components for the AINative Studio Next.js application.

## Components

### GoogleTagManager

Google Tag Manager integration for Next.js with proper SSR support.

**Features:**
- Automatic loading using Next.js Script component
- Noscript fallback for users with JavaScript disabled
- Environment variable configuration
- Strategy: `afterInteractive` for optimal performance

**Usage:**

```tsx
import GoogleTagManager, { GoogleTagManagerNoscript } from '@/components/analytics/GoogleTagManager';

// In your root layout:
<html>
  <head>
    <GoogleTagManager />
  </head>
  <body>
    <GoogleTagManagerNoscript />
    {/* ... */}
  </body>
</html>
```

**Environment Variables:**

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

If no GTM ID is configured, the component will not render (fail gracefully).

### SpeedInsights

Vercel Speed Insights wrapper component for real user monitoring (RUM).

**Features:**
- Optional dependency (won't break build if not installed)
- Tracks Web Vitals (LCP, FID, CLS, TTFB, INP)
- Automatic integration with Vercel deployments

**Setup:**

1. Install the package:
```bash
npm install @vercel/speed-insights
```

2. Uncomment the import and return statement in `SpeedInsights.tsx`

3. Add to your root layout:
```tsx
import SpeedInsights from '@/components/analytics/SpeedInsights';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**No Configuration Required** - Works automatically on Vercel deployments.

## Best Practices

### 1. Script Loading Strategy

- **GTM**: Uses `afterInteractive` strategy to load after page becomes interactive
- **Chatwoot**: Uses `lazyOnload` strategy to load after all critical resources
- **Speed Insights**: Client-side only, loaded with the bundle

### 2. Privacy & Performance

- All analytics scripts are loaded asynchronously
- No blocking of critical rendering path
- Graceful fallback if analytics services are unavailable
- Environment-based configuration for different deployments

### 3. Development vs Production

For development:
```env
# .env.local
NEXT_PUBLIC_GTM_ID=  # Leave empty to disable
```

For production:
```env
# .env.production
NEXT_PUBLIC_GTM_ID=GTM-ML0XEBP
```

## Analytics Stack

The complete analytics implementation includes:

1. **Google Tag Manager** - Marketing analytics, conversion tracking
2. **Vercel Speed Insights** - Real user monitoring, Web Vitals
3. **Chatwoot** - User engagement tracking (see `/components/support`)

## Troubleshooting

### GTM Not Loading

1. Check `NEXT_PUBLIC_GTM_ID` is set correctly
2. Verify format is `GTM-XXXXXXX` (7 characters after GTM-)
3. Check browser console for script errors
4. Verify GTM container is published

### Speed Insights Not Working

1. Ensure package is installed: `npm list @vercel/speed-insights`
2. Verify import is uncommented in `SpeedInsights.tsx`
3. Check Vercel dashboard for Speed Insights data (may take 24h to appear)
4. Only works on Vercel deployments (not localhost)

### Build Warnings

If you see module resolution warnings for `@vercel/speed-insights`:
- The component is designed to handle missing packages gracefully
- Either install the package or keep the import commented out
- Warning won't affect production builds

## Security

All environment variables prefixed with `NEXT_PUBLIC_` are safe to expose to the client.

**Safe:**
- `NEXT_PUBLIC_GTM_ID` - Public container ID
- `NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN` - Public website token
- `NEXT_PUBLIC_CHATWOOT_BASE_URL` - Public API endpoint

**Never expose:**
- GTM Server-Side API keys
- Chatwoot agent tokens
- Analytics admin tokens

## Related Documentation

- [Next.js Script Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/scripts)
- [Google Tag Manager Setup](https://developers.google.com/tag-platform/tag-manager/web)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Chatwoot Integration](/components/support/README.md)
