# API Proxy Configuration

This document describes the API proxy system implemented for the AINative Studio Next.js website. The proxy system allows secure, rate-limited access to external APIs without exposing sensitive credentials to the client.

## Overview

The API proxy system provides three proxy endpoints:

1. **Backend API Proxy** (`/api/backend/*`) - Proxies requests to AINative backend services
2. **GitHub API Proxy** (`/api/github/*`) - Proxies requests to GitHub API
3. **Luma API Proxy** (`/api/luma/*`) - Proxies requests to Luma Events API

## Features

- **Automatic Retry Logic**: Retries failed requests with exponential backoff
- **Timeout Handling**: Configurable timeouts per service
- **Rate Limiting**: Per-tier rate limits to prevent abuse
- **Error Handling**: Standardized error responses
- **Request/Response Logging**: Debug logging in development mode
- **CORS Handling**: Proper CORS headers for cross-origin requests
- **Header Forwarding**: Selective header forwarding to upstream services

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Next.js API       │
│   Route Handler     │
│   (/api/*/[...path])│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Rate Limiting      │
│  Middleware         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Proxy Utilities    │
│  (retry, timeout)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  External API       │
│  (Backend, GitHub,  │
│   Luma)             │
└─────────────────────┘
```

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# AINative Backend API
AINATIVE_BACKEND_URL=https://api.ainative.studio

# GitHub API Token
# Create at: https://github.com/settings/tokens
# Required scopes: repo, read:user
GITHUB_TOKEN=ghp_your_github_personal_access_token_here

# Luma Events API
# Sign up at: https://lu.ma/api
LUMA_API_KEY=your_luma_api_key_here
```

### Rate Limit Configuration

Rate limits are configured in `/lib/rate-limit-config.ts`:

| Tier     | Limit | Window    | Use Case                |
|----------|-------|-----------|-------------------------|
| auth     | 5     | 1 minute  | Authentication          |
| payment  | 10    | 1 minute  | Payment operations      |
| apiKey   | 20    | 1 minute  | API key management      |
| api      | 60    | 1 minute  | API proxy endpoints     |
| search   | 30    | 1 minute  | Search operations       |
| readonly | 60    | 1 minute  | Read-only operations    |
| default  | 30    | 1 minute  | Fallback                |

## Usage

### Backend API Proxy

Proxy requests to the AINative backend:

```typescript
// Client-side code
const response = await fetch('/api/backend/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const data = await response.json();
```

This will proxy the request to:
```
https://api.ainative.studio/users/me
```

**Features:**
- Forwards `Authorization`, `X-Request-ID`, `X-Session-ID` headers
- 60 requests/minute rate limit
- 3 retry attempts with exponential backoff
- 30 second timeout

### GitHub API Proxy

Proxy requests to GitHub API:

```typescript
// Client-side code
const response = await fetch('/api/github/repos/AINative-Studio/repo-name');
const repo = await response.json();
```

This will proxy the request to:
```
https://api.github.com/repos/AINative-Studio/repo-name
```

**Features:**
- Automatic GitHub token authentication
- Includes GitHub API headers (Accept, User-Agent)
- 60 requests/minute rate limit (our limit, not GitHub's)
- 2 retry attempts
- 15 second timeout
- Forwards GitHub rate limit headers as `X-GitHub-*` headers

### Luma API Proxy

Proxy requests to Luma Events API:

```typescript
// Client-side code
const response = await fetch('/api/luma/calendar/events?calendar_id=cal-abc123');
const events = await response.json();
```

This will proxy the request to:
```
https://api.lu.ma/calendar/events?calendar_id=cal-abc123
```

**Features:**
- Automatic Luma API key authentication
- 30 requests/minute rate limit
- 3 retry attempts
- 20 second timeout

## Error Handling

All proxy endpoints return standardized error responses:

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": {
    "code": "PROXY_ERROR",
    "message": "Failed to proxy request"
  }
}
```

### Rate Limit Error
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "limit": 60,
    "remaining": 0,
    "reset": 1705680000000,
    "retryAfter": "45"
  }
}
```

**Response Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705680000000
Retry-After: 45
```

### Timeout Error
```json
{
  "error": {
    "code": "PROXY_ERROR",
    "message": "Request timeout after 30000ms"
  }
}
```
HTTP Status: `504 Gateway Timeout`

### Configuration Error
```json
{
  "error": {
    "code": "CONFIG_ERROR",
    "message": "GitHub token not configured"
  }
}
```
HTTP Status: `500 Internal Server Error`

## Retry Logic

The proxy utilities implement exponential backoff for retries:

```typescript
// Retry strategy
Attempt 1: Immediate
Attempt 2: 1 second delay
Attempt 3: 2 seconds delay
Attempt 4: 4 seconds delay
Max delay: 30 seconds
```

**Retry Conditions:**
- ✅ Retry on server errors (5xx)
- ✅ Retry on network errors
- ✅ Retry on timeouts
- ❌ Don't retry on client errors (4xx)
- ❌ Don't retry on success (2xx)

## Request Logging

In development mode, all proxy requests are logged:

```
[Proxy] GET users/me -> https://api.ainative.studio
[Proxy] Server error 503 for https://api.lu.ma/events, retrying in 1000ms (attempt 1/3)
[Proxy] Timeout for https://api.github.com/repos/..., retrying (attempt 1/2)
```

Set `NODE_ENV=production` to disable logging.

## Testing

### Unit Tests

Run the test suite:

```bash
npm test lib/__tests__/api-proxy-utils.test.ts
```

Tests cover:
- ✅ Successful proxy requests
- ✅ Retry logic on server errors
- ✅ No retry on client errors
- ✅ Timeout handling
- ✅ Exponential backoff
- ✅ Response parsing (JSON/text)
- ✅ Error response creation
- ✅ Header forwarding
- ✅ Query parameter extraction

### Manual Testing

#### Test Backend Proxy

```bash
# Test with curl
curl -X GET http://localhost:3000/api/backend/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test GitHub Proxy

```bash
# Test with curl
curl -X GET http://localhost:3000/api/github/users/AINative-Studio
```

#### Test Luma Proxy

```bash
# Test with curl
curl -X GET http://localhost:3000/api/luma/calendar/events?calendar_id=YOUR_CALENDAR_ID
```

#### Test Rate Limiting

```bash
# Spam requests to trigger rate limit
for i in {1..70}; do
  curl http://localhost:3000/api/backend/health
done
```

You should receive a `429 Too Many Requests` response after 60 requests.

## Security Considerations

1. **Never expose API keys to client**: All API keys are server-side only
2. **Validate input**: All inputs are sanitized before proxying
3. **Rate limiting**: Prevents abuse and DDoS attacks
4. **IP blocking**: Repeated violations trigger IP blocks
5. **Header filtering**: Only allowed headers are forwarded
6. **Error messages**: Don't expose sensitive information in errors

## Performance

- **Cold start**: ~100-200ms (Next.js serverless function)
- **Warm request**: ~10-50ms (excluding upstream API latency)
- **Retry overhead**: Exponential backoff (1s, 2s, 4s)
- **Memory usage**: Minimal (~10MB per request)

## Monitoring

Monitor proxy performance using:

1. **Server logs**: Check `/api/*` routes in production logs
2. **Rate limit headers**: Monitor `X-RateLimit-*` headers
3. **Error rates**: Track `PROXY_ERROR` and `RATE_LIMIT_EXCEEDED` codes
4. **Response times**: Measure P50, P95, P99 latencies

## Troubleshooting

### Problem: "API key not configured" error

**Solution:** Ensure environment variables are set in `.env.local`:
```bash
GITHUB_TOKEN=ghp_...
LUMA_API_KEY=...
AINATIVE_BACKEND_URL=https://api.ainative.studio
```

### Problem: Rate limit errors in development

**Solution:** Add localhost to whitelist in `.env.local`:
```bash
RATE_LIMIT_WHITELIST_IPS=127.0.0.1,::1,localhost
```

### Problem: Timeout errors

**Solution:** Increase timeout in proxy configuration:
```typescript
const response = await proxyRequest(path, {
  baseUrl: API_BASE,
  timeout: 60000, // Increase to 60s
});
```

### Problem: CORS errors

**Solution:** Ensure Next.js API routes are handling CORS. The proxy handles this automatically.

## Migration from Vite

The Next.js proxy replaces the Vite proxy configuration:

### Vite (Old)
```javascript
// vite.config.ts
export default {
  server: {
    proxy: {
      '/api/luma': 'https://api.lu.ma',
      '/api/backend': 'https://api.ainative.studio',
      '/api/github': 'https://api.github.com',
    }
  }
}
```

### Next.js (New)
```typescript
// app/api/luma/[...path]/route.ts
// app/api/backend/[...path]/route.ts
// app/api/github/[...path]/route.ts
```

**Benefits:**
- Works in production (Vite proxy is dev-only)
- Rate limiting built-in
- Retry logic for reliability
- Server-side API key management
- Better error handling

## Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Luma API Documentation](https://lu.ma/api)
- [Rate Limiting Best Practices](https://www.rfc-editor.org/rfc/rfc6585#section-4)

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: hello@ainative.studio
- Check logs in development mode
