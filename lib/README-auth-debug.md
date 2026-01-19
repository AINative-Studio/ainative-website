# Authentication Debugging Utilities

Comprehensive debugging tools for troubleshooting OAuth, session management, and cross-subdomain SSO issues.

## Overview

This module provides a complete suite of debugging utilities for diagnosing authentication problems in development and production environments. Created in Issue #328 and verified in Issue #363, these utilities include tools for inspecting cookies, validating sessions, testing cross-subdomain functionality, and exporting debug reports.

## Quick Start

### Browser Console Debugging

The simplest way to debug auth issues is using the browser console:

```typescript
// In browser console
debugAuth();
```

This global function (from `/utils/authDebug.ts`) provides a quick overview of:
- Access token status and expiration
- Token payload (user ID, email, issued/expires times)
- API connection test
- CORS header validation

### Comprehensive Debug Info

For detailed debugging, use the full debug suite from `/lib/auth-debug.ts`:

```typescript
import { printDebugInfo } from '@/lib/auth-debug';
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
await printDebugInfo(session);
```

This prints a structured debug report including:
- Session status and user information
- All NextAuth cookies with values
- LocalStorage and SessionStorage data
- Environment details (hostname, protocol, security)
- Timestamps and session expiry

## Available Functions

### Cookie Inspection

#### `getAuthCookies(): CookieInfo[]`

Returns all authentication-related cookies with detailed information:

```typescript
import { getAuthCookies } from '@/lib/auth-debug';

const cookies = getAuthCookies();
// Returns array of:
// {
//   name: string,
//   value: string,
//   domain?: string,
//   path?: string,
//   secure?: boolean,
//   httpOnly?: boolean,
//   sameSite?: string,
//   expires?: string
// }
```

Filters for NextAuth cookies:
- `next-auth.*`
- `__Secure-next-auth.*`
- `__Host-next-auth.*`

### Storage Inspection

#### `getAuthLocalStorage(): Record<string, string>`

Returns auth-related localStorage items:

```typescript
import { getAuthLocalStorage } from '@/lib/auth-debug';

const storage = getAuthLocalStorage();
// Returns:
// {
//   'next-auth.session-sync': '...',
//   'next-auth.heartbeat': '...',
//   'next-auth.callback-url': '...'
// }
```

#### `getAuthSessionStorage(): Record<string, string>`

Returns auth-related sessionStorage items:

```typescript
import { getAuthSessionStorage } from '@/lib/auth-debug';

const storage = getAuthSessionStorage();
// Returns:
// {
//   'next-auth.message': '...'
// }
```

### Session Validation

#### `getDebugInfo(session): Promise<SessionDebugInfo>`

Generates comprehensive debug information:

```typescript
import { getDebugInfo } from '@/lib/auth-debug';
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
const info = await getDebugInfo(session);

console.log(info);
// Returns:
// {
//   hasSession: boolean,
//   session: Session | null,
//   cookies: CookieInfo[],
//   storage: {
//     localStorage: Record<string, string>,
//     sessionStorage: Record<string, string>
//   },
//   environment: {
//     hostname: string,
//     origin: string,
//     protocol: string,
//     isProduction: boolean,
//     isSecure: boolean
//   },
//   timestamps: {
//     now: string,
//     sessionExpiry?: string
//   }
// }
```

#### `printDebugInfo(session): Promise<SessionDebugInfo>`

Pretty-prints debug info to console:

```typescript
import { printDebugInfo } from '@/lib/auth-debug';

await printDebugInfo(session);
// Outputs structured console groups:
// 🔐 NextAuth Debug Information
//   Session Status
//   Cookies
//   Storage
//   Environment
//   Timestamps
```

### Cookie Configuration Validation

#### `validateCookieConfiguration(): ValidationResult`

Validates cookie security and configuration:

```typescript
import { validateCookieConfiguration } from '@/lib/auth-debug';

const validation = validateCookieConfiguration();
console.log(validation);
// Returns:
// {
//   isValid: boolean,
//   issues: string[],        // List of problems found
//   recommendations: string[] // Suggested fixes
// }
```

Checks for:
- Cookie existence
- Secure flag in production
- Cookie prefix usage (`__Secure-`, `__Host-`)
- Cross-subdomain configuration
- HTTPS requirements

### Cross-Subdomain Testing

#### `testCrossSubdomainCookies(): CrossDomainTestResult`

Tests ability to set cross-subdomain cookies:

```typescript
import { testCrossSubdomainCookies } from '@/lib/auth-debug';

const result = testCrossSubdomainCookies();
console.log(result);
// Returns:
// {
//   canSetCrossDomainCookie: boolean,
//   currentDomain: string,
//   parentDomain: string | null
// }
```

Automatically:
- Determines parent domain (e.g., `.ainative.studio`)
- Attempts to set test cookie with parent domain
- Validates cookie was set correctly
- Cleans up test cookie

### Debug Reports

#### `exportDebugReport(session): Promise<string>`

Generates JSON debug report:

```typescript
import { exportDebugReport } from '@/lib/auth-debug';

const report = await exportDebugReport(session);
console.log(report); // JSON string with all debug info
```

Report includes:
- All debug info from `getDebugInfo()`
- Cookie configuration validation
- Cross-domain test results
- Generation timestamp

#### `downloadDebugReport(session): Promise<void>`

Downloads debug report as JSON file:

```typescript
import { downloadDebugReport } from '@/lib/auth-debug';

// User clicks debug button
await downloadDebugReport(session);
// Downloads: nextauth-debug-1234567890.json
```

### Event Monitoring

#### `enableDebugMode(): void`

Enables real-time auth event logging:

```typescript
import { enableDebugMode } from '@/lib/auth-debug';

// Enable at app startup (development only)
if (process.env.NODE_ENV === 'development') {
  enableDebugMode();
}
```

Monitors:
- Session updates (`session-update` event)
- Logout events (`session-logout` event)
- Logs all auth events to console

## Common Use Cases

### Diagnosing Login Issues

```typescript
import { printDebugInfo, validateCookieConfiguration } from '@/lib/auth-debug';
import { useSession } from 'next-auth/react';

function DiagnosePage() {
  const { data: session } = useSession();

  const diagnose = async () => {
    // 1. Print comprehensive debug info
    await printDebugInfo(session);

    // 2. Validate cookie configuration
    const validation = validateCookieConfiguration();
    if (!validation.isValid) {
      console.error('Cookie Issues:', validation.issues);
      console.log('Recommendations:', validation.recommendations);
    }

    // 3. Test cross-subdomain cookies
    const crossDomain = testCrossSubdomainCookies();
    if (!crossDomain.canSetCrossDomainCookie) {
      console.error('Cross-subdomain cookies not working!');
    }
  };

  return (
    <button onClick={diagnose}>
      Run Auth Diagnostics
    </button>
  );
}
```

### Debugging Session Persistence

```typescript
import { getAuthCookies, getAuthLocalStorage } from '@/lib/auth-debug';

function checkSessionPersistence() {
  // Check if session cookies exist
  const cookies = getAuthCookies();
  if (cookies.length === 0) {
    console.error('No auth cookies found - session not persisted');
    return;
  }

  // Check localStorage sync
  const storage = getAuthLocalStorage();
  console.log('Session sync:', storage['next-auth.session-sync']);
  console.log('Heartbeat:', storage['next-auth.heartbeat']);
}
```

### Production Issue Troubleshooting

```typescript
import { downloadDebugReport } from '@/lib/auth-debug';
import { useSession } from 'next-auth/react';

// Add debug button to user settings page
function DebugButton() {
  const { data: session } = useSession();

  const handleDownload = async () => {
    // User can download and send debug report
    await downloadDebugReport(session);
    alert('Debug report downloaded. Please send to support@ainative.studio');
  };

  return (
    <button onClick={handleDownload}>
      Download Debug Report
    </button>
  );
}
```

## Related Files

- `/lib/auth-debug.ts` - Core debugging utilities (370 lines)
- `/utils/authDebug.ts` - Simple console helper (78 lines)
- `/utils/authCookies.ts` - SSO cookie utilities (237 lines)
- `/lib/__tests__/auth-debug.test.ts` - Test suite (186 lines)
- `/docs/oauth-sso-setup.md` - Complete OAuth and SSO guide (420 lines)

## Related Issues

- Issue #328: Initial implementation
- Issue #363: Verification and documentation

## License

Copyright 2025 AI Native Studio. All rights reserved.
