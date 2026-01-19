# OAuth and Cross-Subdomain SSO Setup Guide

This guide explains how to configure and use OAuth authentication with cross-subdomain Single Sign-On (SSO) in the AINative Studio Next.js application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GitHub OAuth Setup](#github-oauth-setup)
4. [Environment Configuration](#environment-configuration)
5. [Cross-Subdomain SSO](#cross-subdomain-sso)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Overview

The AINative Studio authentication system provides:

- **GitHub OAuth**: Secure sign-in with GitHub accounts
- **Cross-Subdomain SSO**: Single sign-on across all `*.ainative.studio` subdomains
- **Automatic Token Refresh**: OAuth tokens refresh automatically before expiration
- **Session Synchronization**: Sessions sync across tabs and windows
- **CSRF Protection**: Built-in CSRF token validation
- **Secure Cookies**: HttpOnly, Secure, and SameSite cookie attributes

## Prerequisites

- Next.js 16.1.1 or later
- NextAuth.js 4.24.13 or later
- Node.js 18 or later
- A GitHub account (for OAuth)
- HTTPS in production (required for secure cookies)

## GitHub OAuth Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the application details:
   - **Application name**: `AINative Studio (Development)` or `AINative Studio (Production)`
   - **Homepage URL**:
     - Development: `http://localhost:3000`
     - Production: `https://www.ainative.studio`
   - **Authorization callback URL**:
     - Development: `http://localhost:3000/api/auth/callback/github`
     - Production: `https://www.ainative.studio/api/auth/callback/github`
4. Click **Register application**
5. Save the **Client ID** and **Client Secret**

### 2. Configure Multiple Environments

For production, you may want separate OAuth apps for different environments:

- **Development**: `http://localhost:3000`
- **Staging**: `https://staging.ainative.studio`
- **Production**: `https://www.ainative.studio`

Each environment requires its own GitHub OAuth app with the corresponding callback URL.

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Required Variables

Edit `.env.local` and set the following required variables:

```bash
# NextAuth URL - REQUIRED
# Development
NEXTAUTH_URL=http://localhost:3000
# Production
# NEXTAUTH_URL=https://www.ainative.studio

# NextAuth Secret - REQUIRED (minimum 32 characters)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_generated_secret_here

# GitHub OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Generate NextAuth Secret

Use OpenSSL to generate a secure random secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

## Cross-Subdomain SSO

### How It Works

Cross-subdomain SSO allows users to sign in once and stay authenticated across all subdomains:

- `www.ainative.studio`
- `app.ainative.studio`
- `api.ainative.studio`
- `qnn.ainative.studio`

This is achieved through:

1. **Domain-scoped cookies**: Cookies set with `domain=.ainative.studio`
2. **Session synchronization**: BroadcastChannel API and localStorage events
3. **Shared session storage**: JWT tokens shared across subdomains

### Cookie Configuration

In production, NextAuth automatically sets cookies with:

```javascript
{
  domain: '.ainative.studio',  // Works for all subdomains
  httpOnly: true,               // Prevents XSS attacks
  secure: true,                 // HTTPS only
  sameSite: 'lax',             // CSRF protection
  path: '/'                    // Available site-wide
}
```

### Session Synchronization

The `SessionSyncManager` utility provides:

```typescript
import { getSessionSyncManager, syncSessionOnLogin, syncLogoutAcrossSubdomains } from '@/lib/session-sync';

// Sync session after login
await syncSessionOnLogin(session);

// Sync logout across all subdomains
await syncLogoutAcrossSubdomains();
```

## Testing

### Local Development Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test sign-in flow**:
   - Navigate to `http://localhost:3000/auth/signin`
   - Click "Continue with GitHub"
   - Authorize the application
   - Verify redirect to `/dashboard`

3. **Verify session**:
   ```typescript
   import { useSession } from 'next-auth/react';

   const { data: session, status } = useSession();
   console.log('Session:', session);
   ```

### Cross-Subdomain Testing (Production)

1. **Deploy to production** with proper DNS configuration

2. **Test login on www subdomain**:
   - Go to `https://www.ainative.studio/auth/signin`
   - Sign in with GitHub
   - Verify session cookie with domain `.ainative.studio`

3. **Test session on different subdomain**:
   - Navigate to `https://app.ainative.studio`
   - Verify you're still authenticated
   - Check session in browser DevTools

4. **Test logout propagation**:
   - Sign out from any subdomain
   - Verify you're logged out on all subdomains

## Debugging

### Enable Debug Mode

```typescript
import { enableDebugMode, printDebugInfo } from '@/lib/auth-debug';

// Enable debug logging
enableDebugMode();

// Print debug information
await printDebugInfo(session);
```

### Debug Tools

1. **Print session info**:
   ```typescript
   import { printDebugInfo } from '@/lib/auth-debug';
   await printDebugInfo(session);
   ```

2. **Export debug report**:
   ```typescript
   import { downloadDebugReport } from '@/lib/auth-debug';
   await downloadDebugReport(session);
   ```

3. **Validate cookie configuration**:
   ```typescript
   import { validateCookieConfiguration } from '@/lib/auth-debug';
   const validation = validateCookieConfiguration();
   console.log(validation);
   ```

4. **Test cross-subdomain cookies**:
   ```typescript
   import { testCrossSubdomainCookies } from '@/lib/auth-debug';
   const result = testCrossSubdomainCookies();
   console.log(result);
   ```

### Browser DevTools

1. **Inspect cookies**:
   - Open DevTools (F12)
   - Go to Application > Cookies
   - Look for `next-auth.session-token` or `__Secure-next-auth.session-token`
   - Verify domain is `.ainative.studio` in production

2. **Monitor network requests**:
   - Go to Network tab
   - Filter by "auth"
   - Check OAuth callback requests
   - Verify session API calls

3. **Check localStorage**:
   - Application > Local Storage
   - Look for `next-auth.session-sync` and `next-auth.heartbeat`

## Security Considerations

### Cookie Security

- **HttpOnly**: Cookies are not accessible via JavaScript (prevents XSS)
- **Secure**: Cookies only sent over HTTPS in production
- **SameSite**: CSRF protection via `lax` setting
- **Cookie Prefixes**: `__Secure-` and `__Host-` prefixes in production

### Token Management

- **Token Refresh**: OAuth tokens refresh 5 minutes before expiration
- **Token Rotation**: Refresh tokens rotate on each use
- **Error Handling**: Failed refreshes trigger re-authentication

### CSRF Protection

- NextAuth includes built-in CSRF token validation
- CSRF tokens are HttpOnly and path-restricted
- Tokens validated on all state-changing requests

### Best Practices

1. **Always use HTTPS in production**
2. **Keep NEXTAUTH_SECRET secure** (never commit to git)
3. **Rotate secrets regularly** (at least every 90 days)
4. **Monitor failed auth attempts** (check logs)
5. **Implement rate limiting** (on auth endpoints)
6. **Use strong GitHub OAuth scopes** (only request what you need)

## Troubleshooting

### Issue: "Configuration Error"

**Cause**: Missing or invalid environment variables

**Solution**:
1. Verify `NEXTAUTH_URL` matches your domain
2. Ensure `NEXTAUTH_SECRET` is at least 32 characters
3. Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct

### Issue: "OAuth Callback Error"

**Cause**: Callback URL mismatch

**Solution**:
1. Verify GitHub OAuth app callback URL matches `${NEXTAUTH_URL}/api/auth/callback/github`
2. Check for trailing slashes (remove them)
3. Ensure protocol matches (http vs https)

### Issue: "Session not persisting across subdomains"

**Cause**: Cookie domain not configured correctly

**Solution**:
1. Verify you're in production mode (`NODE_ENV=production`)
2. Check cookie domain is `.ainative.studio` in browser DevTools
3. Ensure HTTPS is enabled (required for secure cookies)
4. Verify browser allows third-party cookies

### Issue: "Access Denied"

**Cause**: User not authorized or GitHub permissions denied

**Solution**:
1. Check GitHub OAuth app permissions
2. Verify user granted required scopes
3. Implement custom `signIn` callback for authorization logic

### Issue: "Token Refresh Error"

**Cause**: GitHub OAuth token expired or revoked

**Solution**:
1. User needs to re-authenticate
2. Check GitHub OAuth app is still active
3. Verify network connectivity to GitHub

### Issue: "Session lost after page refresh"

**Cause**: Cookie not being sent with requests

**Solution**:
1. Check browser cookie settings
2. Verify cookie domain and path are correct
3. Ensure secure flag matches protocol (HTTPS)
4. Check browser console for cookie warnings

## Advanced Configuration

### Custom Session Duration

Edit `lib/auth/options.ts`:

```typescript
session: {
  strategy: 'jwt',
  maxAge: 7 * 24 * 60 * 60, // 7 days instead of 30
  updateAge: 24 * 60 * 60,   // Update every 24 hours
}
```

### Custom Redirect Logic

```typescript
callbacks: {
  async redirect({ url, baseUrl }) {
    // Custom redirect logic
    if (url.includes('/admin')) {
      return `${baseUrl}/admin/dashboard`;
    }
    return url;
  }
}
```

### Role-Based Access Control

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Check user role
    const isAllowed = await checkUserRole(user.email);
    return isAllowed;
  }
}
```

## API Reference

### Session Sync Functions

```typescript
// Get session sync manager
const manager = getSessionSyncManager();

// Sync login
await syncSessionOnLogin(session);

// Sync logout
await syncLogoutAcrossSubdomains();

// Check if session is alive
const isAlive = manager.isSessionAlive();
```

### Debug Functions

```typescript
// Print debug info
await printDebugInfo(session);

// Download debug report
await downloadDebugReport(session);

// Validate cookies
const validation = validateCookieConfiguration();

// Test cross-domain cookies
const test = testCrossSubdomainCookies();
```

## Support

For additional help:

- **Documentation**: [NextAuth.js Docs](https://next-auth.js.org)
- **GitHub Issues**: [AINative Studio Issues](https://github.com/ainative-studio/ainative-website-nextjs-staging/issues)
- **Email Support**: support@ainative.studio

## License

Copyright 2025 AI Native Studio. All rights reserved.
