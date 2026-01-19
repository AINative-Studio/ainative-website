/**
 * Authentication Debugging Utilities
 *
 * This module provides debugging tools for troubleshooting OAuth
 * and session issues across subdomains.
 *
 * Features:
 * - Cookie inspection
 * - Session validation
 * - Token decoding
 * - Cross-subdomain testing
 */

import { Session } from 'next-auth';

export interface CookieInfo {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  expires?: string;
}

export interface SessionDebugInfo {
  hasSession: boolean;
  session: Session | null;
  cookies: CookieInfo[];
  storage: {
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
  };
  environment: {
    hostname: string;
    origin: string;
    protocol: string;
    isProduction: boolean;
    isSecure: boolean;
  };
  timestamps: {
    now: string;
    sessionExpiry?: string;
  };
}

/**
 * Get all authentication-related cookies
 */
export function getAuthCookies(): CookieInfo[] {
  if (typeof document === 'undefined') return [];

  const cookies = document.cookie.split(';').map((cookie) => {
    const [name, value] = cookie.trim().split('=');
    return { name, value };
  });

  // Filter for NextAuth cookies
  return cookies.filter(
    (cookie) =>
      cookie.name.includes('next-auth') ||
      cookie.name.includes('__Secure-next-auth') ||
      cookie.name.includes('__Host-next-auth')
  );
}

/**
 * Get localStorage items related to auth
 */
export function getAuthLocalStorage(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const authKeys = [
    'next-auth.session-sync',
    'next-auth.heartbeat',
    'next-auth.callback-url',
  ];

  const result: Record<string, string> = {};

  authKeys.forEach((key) => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        result[key] = value;
      }
    } catch (error) {
      result[key] = `Error: ${error}`;
    }
  });

  return result;
}

/**
 * Get sessionStorage items related to auth
 */
export function getAuthSessionStorage(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const authKeys = ['next-auth.message'];

  const result: Record<string, string> = {};

  authKeys.forEach((key) => {
    try {
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        result[key] = value;
      }
    } catch (error) {
      result[key] = `Error: ${error}`;
    }
  });

  return result;
}

/**
 * Get comprehensive debug information
 */
export async function getDebugInfo(session: Session | null): Promise<SessionDebugInfo> {
  const info: SessionDebugInfo = {
    hasSession: !!session,
    session,
    cookies: getAuthCookies(),
    storage: {
      localStorage: getAuthLocalStorage(),
      sessionStorage: getAuthSessionStorage(),
    },
    environment: {
      hostname: typeof window !== 'undefined' ? window.location.hostname : '',
      origin: typeof window !== 'undefined' ? window.location.origin : '',
      protocol: typeof window !== 'undefined' ? window.location.protocol : '',
      isProduction: process.env.NODE_ENV === 'production',
      isSecure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
    },
    timestamps: {
      now: new Date().toISOString(),
    },
  };

  // Add session expiry if available
  if (session) {
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    info.timestamps.sessionExpiry = expiry.toISOString();
  }

  return info;
}

/**
 * Print debug information to console
 */
export async function printDebugInfo(session: Session | null) {
  const info = await getDebugInfo(session);

  console.group('🔐 NextAuth Debug Information');

  console.group('Session Status');
  console.log('Has Session:', info.hasSession);
  if (info.session) {
    console.log('User:', {
      id: info.session.user?.id,
      email: info.session.user?.email,
      name: info.session.user?.name,
      role: info.session.user?.role,
    });
    console.log('Access Token:', info.session.accessToken ? 'Present' : 'Missing');
    console.log('Error:', info.session.error || 'None');
  }
  console.groupEnd();

  console.group('Cookies');
  if (info.cookies.length === 0) {
    console.log('No NextAuth cookies found');
  } else {
    info.cookies.forEach((cookie) => {
      console.log(`${cookie.name}:`, cookie.value.substring(0, 50) + '...');
    });
  }
  console.groupEnd();

  console.group('Storage');
  console.log('localStorage:', info.storage.localStorage);
  console.log('sessionStorage:', info.storage.sessionStorage);
  console.groupEnd();

  console.group('Environment');
  console.log('Hostname:', info.environment.hostname);
  console.log('Origin:', info.environment.origin);
  console.log('Protocol:', info.environment.protocol);
  console.log('Is Production:', info.environment.isProduction);
  console.log('Is Secure:', info.environment.isSecure);
  console.groupEnd();

  console.group('Timestamps');
  console.log('Current Time:', info.timestamps.now);
  console.log('Session Expiry:', info.timestamps.sessionExpiry || 'N/A');
  console.groupEnd();

  console.groupEnd();

  return info;
}

/**
 * Test cross-subdomain cookie access
 */
export function testCrossSubdomainCookies(): {
  canSetCrossDomainCookie: boolean;
  currentDomain: string;
  parentDomain: string | null;
} {
  if (typeof document === 'undefined') {
    return {
      canSetCrossDomainCookie: false,
      currentDomain: '',
      parentDomain: null,
    };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  let parentDomain: string | null = null;
  if (parts.length >= 2) {
    parentDomain = `.${parts.slice(-2).join('.')}`;
  }

  // Try to set a test cookie with parent domain
  const testCookieName = 'next-auth-test';
  let canSetCrossDomainCookie = false;

  if (parentDomain) {
    try {
      // Set test cookie with parent domain
      document.cookie = `${testCookieName}=test; domain=${parentDomain}; path=/; max-age=60`;

      // Check if it was set
      canSetCrossDomainCookie = document.cookie.includes(testCookieName);

      // Clean up test cookie
      document.cookie = `${testCookieName}=; domain=${parentDomain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    } catch (error) {
      console.error('Error testing cross-domain cookies:', error);
    }
  }

  return {
    canSetCrossDomainCookie,
    currentDomain: hostname,
    parentDomain,
  };
}

/**
 * Validate session cookie configuration
 */
export function validateCookieConfiguration(): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (typeof window === 'undefined') {
    return { isValid: true, issues, recommendations };
  }

  const cookies = getAuthCookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = window.location.protocol === 'https:';

  // Check if cookies exist
  if (cookies.length === 0) {
    issues.push('No NextAuth cookies found. User may not be authenticated.');
  }

  // Check secure flag in production
  if (isProduction && !isSecure) {
    issues.push('Production environment should use HTTPS for secure cookies');
    recommendations.push('Ensure NEXTAUTH_URL uses https://');
  }

  // Check cookie naming convention
  if (isProduction) {
    const hasSecureCookies = cookies.some((c) =>
      c.name.startsWith('__Secure-') || c.name.startsWith('__Host-')
    );

    if (!hasSecureCookies) {
      issues.push('Production should use __Secure- or __Host- cookie prefixes');
      recommendations.push('Set useSecureCookies: true in NextAuth config');
    }
  }

  // Check domain configuration
  const hostname = window.location.hostname;
  if (hostname.includes('ainative.studio')) {
    const testResult = testCrossSubdomainCookies();

    if (!testResult.canSetCrossDomainCookie) {
      issues.push('Cross-subdomain cookies may not be working correctly');
      recommendations.push('Verify cookie domain is set to .ainative.studio');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
  };
}

/**
 * Export debug report as JSON
 */
export async function exportDebugReport(session: Session | null): Promise<string> {
  const info = await getDebugInfo(session);
  const cookieValidation = validateCookieConfiguration();
  const crossDomainTest = testCrossSubdomainCookies();

  const report = {
    ...info,
    validation: cookieValidation,
    crossDomainTest,
    generatedAt: new Date().toISOString(),
  };

  return JSON.stringify(report, null, 2);
}

/**
 * Download debug report as file
 */
export async function downloadDebugReport(session: Session | null) {
  const report = await exportDebugReport(session);
  const blob = new Blob([report], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `nextauth-debug-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Enable debug mode (logs all auth events)
 */
export function enableDebugMode() {
  if (typeof window === 'undefined') return;

  // Listen to session events
  window.addEventListener('session-update', ((event: CustomEvent) => {
    console.log('[AUTH DEBUG] Session updated:', event.detail);
  }) as EventListener);

  window.addEventListener('session-logout', () => {
    console.log('[AUTH DEBUG] Session logged out');
  });

  console.log('[AUTH DEBUG] Debug mode enabled');
}
