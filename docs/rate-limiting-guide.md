# Rate Limiting Guide

Comprehensive documentation for the API rate limiting implementation in AINative Studio.

## Overview

Rate limiting is implemented to prevent API abuse, DDoS attacks, and ensure fair usage across all API endpoints. The implementation uses an in-memory LRU cache with support for:

- IP-based rate limiting
- User-based rate limiting (for authenticated requests)
- Abuse detection and automatic IP blocking
- Whitelisted IPs (for development and monitoring)
- Configurable limits per endpoint type

## Rate Limit Tiers

Different endpoint types have different rate limits optimized for their use cases:

| Tier | Limit | Use Case | Example Endpoints |
|------|-------|----------|-------------------|
| **auth** | 5 requests/minute | Authentication operations | `/api/auth/*` |
| **payment** | 10 requests/minute | Payment and billing operations | `/api/stripe/*`, `/api/billing/*` |
| **apiKey** | 20 requests/minute | API key management | `/api/keys/*` |
| **search** | 30 requests/minute | Search and query operations | `/api/luma/*`, `/api/search/*` |
| **readonly** | 60 requests/minute | Read-only operations | `/api/data/*`, `/api/stats/*` |
| **default** | 30 requests/minute | Fallback for uncategorized endpoints | Any unlabeled endpoint |

## Implementation

### Basic Usage

#### Option 1: Using `withRateLimit` wrapper (Recommended)

```typescript
// app/api/auth/[...nextauth]/route.ts
import { withRateLimit } from '@/middleware/rateLimit';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/options';

const handler = NextAuth(authOptions);

// Apply rate limiting to auth endpoints (5 requests/minute)
export const GET = withRateLimit(handler, { tier: 'auth' });
export const POST = withRateLimit(handler, { tier: 'auth' });
```

#### Option 2: Using `applyRateLimit` manually

```typescript
// app/api/custom/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/middleware/rateLimit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, { tier: 'search' });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  // Your API logic here
  const response = NextResponse.json({ success: true });

  // Add rate limit headers to response
  Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
```

### User-Based Rate Limiting

For authenticated requests, you can use user ID instead of IP:

```typescript
import { applyRateLimit } from '@/middleware/rateLimit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function POST(request: NextRequest) {
  // Get user session
  const session = await getServerSession(authOptions);

  // Apply rate limiting with user ID
  const rateLimitResult = await applyRateLimit(request, {
    tier: 'payment',
    userId: session?.user?.id,
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  // Your API logic here
  // ...
}
```

## Rate Limit Headers

All API responses include rate limit headers:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1705512000000
```

When rate limited (429 status):

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705512000000
Retry-After: 45

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "limit": 5,
    "remaining": 0,
    "reset": 1705512000000,
    "retryAfter": "45"
  }
}
```

## Abuse Detection

The system automatically detects and blocks abusive behavior:

1. **Violation Tracking**: Each time a rate limit is exceeded, a violation is recorded
2. **Threshold**: After 10 violations within 1 hour (configurable), the IP is blocked
3. **Block Duration**: Blocked IPs are banned for 24 hours (configurable)
4. **Block Response**: Returns 403 Forbidden instead of 429 Too Many Requests

When blocked (403 status):

```http
HTTP/1.1 403 Forbidden

{
  "error": {
    "code": "IP_BLOCKED",
    "message": "Access blocked due to repeated violations: Exceeded rate limit 10 times in 3600s",
    "limit": 0,
    "remaining": 0,
    "reset": 1705598400000
  }
}
```

## Whitelisted IPs

Certain IPs bypass rate limiting entirely (useful for development and monitoring):

**Default Whitelisted IPs:**
- `127.0.0.1` (localhost IPv4)
- `::1` (localhost IPv6)
- `localhost`

**Custom Whitelisted IPs:**

Add to `.env`:

```env
RATE_LIMIT_WHITELIST_IPS=10.0.0.1,192.168.1.100,2001:db8::1
```

## Configuration

### Environment Variables

Add to `.env`:

```env
# Enable/disable rate limiting globally (default: true)
RATE_LIMITING_ENABLED=true

# Whitelisted IPs (comma-separated)
RATE_LIMIT_WHITELIST_IPS=127.0.0.1,::1,localhost

# Abuse detection threshold (default: 10 violations)
RATE_LIMIT_ABUSE_THRESHOLD=10

# Abuse detection window in milliseconds (default: 1 hour)
RATE_LIMIT_ABUSE_WINDOW_MS=3600000

# IP block duration in milliseconds (default: 24 hours)
RATE_LIMIT_BLOCK_DURATION_MS=86400000
```

### Customizing Rate Limits

Edit `lib/rate-limit-config.ts`:

```typescript
export const RATE_LIMIT_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
  auth: {
    limit: 10, // Increase to 10 requests/minute
    windowMs: 60 * 1000,
    description: '10 requests per minute',
  },
  // ... other tiers
};
```

## Testing

### Running Tests

```bash
npm test -- lib/__tests__/rate-limit.test.ts
```

### Test Coverage

The test suite covers:
- Basic rate limiting per tier
- Whitelisted IP bypass
- User-based vs IP-based limiting
- Abuse detection and blocking
- Rate limit header accuracy
- Window expiration and reset
- Multiple tiers for same identifier

### Manual Testing

#### Test Rate Limiting

```bash
# Install httpie or use curl
brew install httpie

# Make requests to auth endpoint (limit: 5/minute)
for i in {1..10}; do
  http POST http://localhost:3000/api/auth/signin
  sleep 1
done

# Check for 429 responses after 5 requests
```

#### Test Rate Limit Headers

```bash
http POST http://localhost:3000/api/auth/signin -v
```

Look for headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1705512000000
```

#### Test Abuse Detection

```bash
# Repeatedly trigger rate limits to test blocking
for i in {1..15}; do
  for j in {1..6}; do
    http POST http://localhost:3000/api/auth/signin
  done
  sleep 1
done

# Should eventually return 403 Forbidden
```

## Production Considerations

### Redis Integration (Future Enhancement)

For production environments with multiple server instances, consider using Redis:

1. Install `@upstash/ratelimit` and `@upstash/redis`:

```bash
npm install @upstash/ratelimit @upstash/redis
```

2. Update `lib/rate-limit.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiters = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
  }),
  // ... other tiers
};
```

3. Add environment variables:

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Load Testing

Use tools like Artillery or k6 to test rate limiting under load:

**Artillery Example:**

```yaml
# rate-limit-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - post:
          url: "/api/auth/signin"
```

```bash
artillery run rate-limit-test.yml
```

**k6 Example:**

```javascript
// rate-limit-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  let res = http.post('http://localhost:3000/api/auth/signin');
  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
  });
  sleep(1);
}
```

```bash
k6 run rate-limit-test.js
```

## Monitoring

### Logging Rate Limit Events

Add logging to track rate limit violations:

```typescript
// middleware/rateLimit.ts
export async function applyRateLimit(...) {
  const result = checkRateLimit(identifier, tier, ip);

  if (!result.success) {
    console.warn('[Rate Limit]', {
      tier,
      identifier,
      ip,
      blocked: result.blocked,
      timestamp: new Date().toISOString(),
    });
  }

  // ... rest of implementation
}
```

### Metrics to Track

- Rate limit violations per endpoint
- Number of blocked IPs
- Average requests per user/IP
- 429 response rate
- 403 (blocked) response rate

## Troubleshooting

### Issue: Rate limiting not working

**Check:**
1. `RATE_LIMITING_ENABLED` is not set to `false`
2. IP is not whitelisted
3. Cache is not being cleared between requests

### Issue: All requests blocked

**Check:**
1. IP might be in the blocked list
2. Abuse threshold might be too low
3. Try resetting abuse tracking (in development only)

```typescript
import { resetAbuse } from '@/lib/rate-limit';
resetAbuse('ip:YOUR_IP');
```

### Issue: Headers not appearing in response

**Check:**
1. Using `withRateLimit` wrapper or manually adding headers
2. CORS configuration allowing headers
3. Response type (some responses don't support headers)

## Security Best Practices

1. **Never disable rate limiting in production**
2. **Keep whitelisted IPs minimal** - only trusted services
3. **Monitor blocked IPs** - could indicate attacks
4. **Adjust limits based on usage patterns** - review analytics
5. **Use user-based limiting for authenticated endpoints** - more accurate tracking
6. **Implement proper logging** - track violations and blocks
7. **Consider geographic rate limiting** - different limits per region
8. **Add CAPTCHA for repeated violations** - before permanent blocking

## Support

For issues or questions:
- Review this guide
- Check test suite for examples
- Review implementation in `lib/rate-limit.ts` and `middleware/rateLimit.ts`
- Contact the development team

## Changelog

### v1.0.0 (2026-01-18)
- Initial implementation
- In-memory LRU cache
- IP and user-based rate limiting
- Abuse detection and blocking
- Whitelisted IPs
- Comprehensive test suite
