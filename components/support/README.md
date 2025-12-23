# Support Components

This directory contains customer support and engagement components for the AINative Studio application.

## Components

### ChatwootWidget

Live chat widget powered by Chatwoot for real-time customer support.

**Features:**
- Lazy loading for optimal performance
- Environment variable configuration
- Automatic SDK initialization
- Mobile-responsive chat interface
- Visitor tracking and analytics
- Team inbox integration

**Usage:**

```tsx
import ChatwootWidget from '@/components/support/ChatwootWidget';

// In your root layout:
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatwootWidget />
      </body>
    </html>
  );
}
```

**Environment Variables:**

```env
# Chatwoot Configuration
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=XfqwZwqj9pcjyrFe4gsPRCff
NEXT_PUBLIC_CHATWOOT_BASE_URL=https://chat.ainative.studio
```

**Default Configuration:**

If environment variables are not set, the component uses these defaults:
- Website Token: `XfqwZwqj9pcjyrFe4gsPRCff`
- Base URL: `https://chat.ainative.studio`

**Props:**

```tsx
interface ChatwootWidgetProps {
  websiteToken?: string;  // Override env var
  baseUrl?: string;       // Override env var
}
```

## Configuration

### 1. Self-Hosted Chatwoot

If you're running your own Chatwoot instance:

```env
NEXT_PUBLIC_CHATWOOT_BASE_URL=https://your-chatwoot.example.com
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=your-website-token
```

### 2. Chatwoot Cloud

Using Chatwoot's cloud service:

```env
NEXT_PUBLIC_CHATWOOT_BASE_URL=https://app.chatwoot.com
NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=your-website-token
```

## Features

### Visitor Tracking

Chatwoot automatically tracks:
- Page views
- User sessions
- Geographic location
- Device information
- Browser details

### Custom Attributes

You can pass custom user attributes to Chatwoot:

```tsx
// After widget loads
window.chatwootSDK?.setUser('user-id', {
  email: 'user@example.com',
  name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  // Custom attributes
  plan: 'pro',
  signup_date: '2025-01-01'
});
```

### Custom Events

Track custom events:

```tsx
window.chatwootSDK?.track('feature_used', {
  feature_name: 'quantum_search',
  timestamp: new Date().toISOString()
});
```

## Loading Strategy

The widget uses Next.js Script with `lazyOnload` strategy:
- Loads after all critical resources
- Non-blocking for initial page load
- Automatically deferred until page interactive
- Minimal impact on Core Web Vitals

## Styling & Customization

### Widget Position

The widget appears in the bottom-right corner by default. Customize via Chatwoot dashboard:

1. Go to Settings > Inboxes > [Your Inbox] > Configuration
2. Adjust widget appearance and position
3. Changes apply automatically without code changes

### Custom Colors

Match your brand colors in Chatwoot dashboard:
- Primary color
- Secondary color
- Widget button color
- Header background

### Widget Behavior

Configure in Chatwoot dashboard:
- Auto-show after delay
- Show on specific pages
- Hide on mobile
- Welcome message
- Away message

## Integration with Auth

Link Chatwoot conversations to authenticated users:

```tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function ChatwootUserSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user && window.chatwootSDK) {
      window.chatwootSDK.setUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
        avatar_url: session.user.image,
      });
    }
  }, [session]);

  return null;
}
```

Add to your root layout after ChatwootWidget.

## Performance Metrics

Expected performance impact:
- **Script Size**: ~45KB (gzipped)
- **Load Time**: 200-400ms (after page load)
- **LCP Impact**: None (loads after interactive)
- **CLS Impact**: Minimal (fixed position)

## Troubleshooting

### Widget Not Appearing

1. Check environment variables are set correctly
2. Verify website token is active in Chatwoot dashboard
3. Check browser console for errors
4. Ensure base URL is accessible (no CORS issues)
5. Verify inbox is online in Chatwoot dashboard

### Widget Loading Slowly

1. Check Chatwoot server response time
2. Verify CDN is serving SDK files
3. Consider self-hosting SDK files
4. Check network conditions

### Messages Not Sending

1. Verify inbox is assigned to agents
2. Check Chatwoot inbox status (online/offline)
3. Verify websocket connection in browser DevTools
4. Check Chatwoot server logs

### CORS Errors

If you see CORS errors:
1. Verify `NEXT_PUBLIC_CHATWOOT_BASE_URL` is correct
2. Check Chatwoot allowed domains configuration
3. Ensure website domain is whitelisted in Chatwoot

## Security

### Website Token

The website token (`NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN`) is:
- ✅ Safe to expose in client-side code
- ✅ Used only for widget initialization
- ✅ Read-only access to inbox
- ❌ Cannot access other inboxes
- ❌ Cannot access admin features

### User Privacy

Chatwoot respects user privacy:
- GDPR compliant
- Data retention policies
- User data deletion
- Privacy controls

Configure in Chatwoot dashboard under Settings > Account > Privacy.

## Advanced Usage

### Programmatic Control

```tsx
// Open widget
window.chatwootSDK?.toggle('open');

// Close widget
window.chatwootSDK?.toggle('close');

// Reset session (logout)
window.chatwootSDK?.reset();

// Set language
window.chatwootSDK?.setLocale('es'); // Spanish
```

### Event Listeners

```tsx
window.addEventListener('chatwoot:ready', () => {
  console.log('Chatwoot loaded');
});

window.addEventListener('chatwoot:on-message', (event) => {
  console.log('New message:', event.detail);
});
```

## Related Documentation

- [Chatwoot Official Docs](https://www.chatwoot.com/docs)
- [Web Widget Setup](https://www.chatwoot.com/docs/product/channels/live-chat/create-website-channel)
- [SDK Reference](https://www.chatwoot.com/docs/product/channels/live-chat/sdk/setup)
- [Analytics Integration](/components/analytics/README.md)

## Support

For issues with:
- **Widget Configuration**: Check Chatwoot documentation
- **Integration Issues**: Create issue in this repository
- **Chatwoot Server**: Contact Chatwoot support
