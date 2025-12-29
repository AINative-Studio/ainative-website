/**
 * Cross-Subdomain SSO Cookie Utilities
 *
 * Enables single sign-on between ainative.studio and zerodb.ainative.studio
 * by sharing auth cookies across subdomains.
 *
 * Cookie Configuration:
 * - domain: .ainative.studio (parent domain for subdomain sharing)
 * - SameSite: Lax (allows cookies on top-level navigation)
 * - Secure: true (required for production HTTPS)
 * - path: / (available on all paths)
 */

// Cookie names - must match exactly between ainative.studio and zerodb.ainative.studio
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'ainative_access_token',
  USER: 'ainative_user',
} as const;

// Cookie expiration: 7 days
const COOKIE_EXPIRY_DAYS = 7;

// Determine if we're in production (ainative.studio domain)
const isProduction = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('ainative.studio');
};

// Get the cookie domain - use parent domain for subdomain sharing
const getCookieDomain = (): string => {
  if (isProduction()) {
    return '.ainative.studio'; // Parent domain for cross-subdomain sharing
  }
  // For localhost development, don't set domain (browser handles it)
  return '';
};

/**
 * Get the cookie options string for setting cookies
 */
const getCookieOptions = (expires: Date): string => {
  const domain = getCookieDomain();
  const domainPart = domain ? `domain=${domain}; ` : '';
  const securePart = isProduction() ? 'Secure; ' : '';

  return `expires=${expires.toUTCString()}; path=/; ${domainPart}SameSite=Lax; ${securePart}`;
};

/**
 * Get the cookie options string for clearing cookies
 */
const getClearCookieOptions = (): string => {
  const domain = getCookieDomain();
  const domainPart = domain ? `domain=${domain}; ` : '';

  return `expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domainPart}`;
};

/**
 * Set the access token cookie and localStorage (for backward compatibility)
 * @param token - JWT access token
 */
export function setAuthToken(token: string): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // Set cookie for cross-subdomain SSO
  document.cookie = `${COOKIE_NAMES.ACCESS_TOKEN}=${encodeURIComponent(token)}; ${getCookieOptions(expires)}`;

  // Also set localStorage for backward compatibility
  localStorage.setItem('access_token', token);
}

/**
 * Set the user info cookie and localStorage (for backward compatibility)
 * @param user - User object to store
 */
export function setAuthUser(user: Record<string, unknown>): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const userJson = JSON.stringify(user);

  // Set cookie for cross-subdomain SSO
  document.cookie = `${COOKIE_NAMES.USER}=${encodeURIComponent(userJson)}; ${getCookieOptions(expires)}`;

  // Also set localStorage for backward compatibility
  localStorage.setItem('user', userJson);
  localStorage.setItem('authenticated', 'true');
}

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

/**
 * Get the access token (checks cookie first, then localStorage)
 * @returns Access token or null if not found
 */
export function getAuthToken(): string | null {
  // Check cookie first (for SSO)
  const cookieToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  if (cookieToken) {
    return cookieToken;
  }

  // Fall back to localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

/**
 * Get the user info (checks cookie first, then localStorage)
 * @returns User object or null if not found
 */
export function getAuthUser(): Record<string, unknown> | null {
  // Check cookie first (for SSO)
  const cookieUser = getCookie(COOKIE_NAMES.USER);
  if (cookieUser) {
    try {
      return JSON.parse(cookieUser);
    } catch {
      // Invalid JSON in cookie
    }
  }

  // Fall back to localStorage
  if (typeof window !== 'undefined') {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        return JSON.parse(localUser);
      } catch {
        // Invalid JSON in localStorage
      }
    }
  }

  return null;
}

/**
 * Clear all auth data (cookies and localStorage)
 * Used during logout to ensure both sites are logged out
 */
export function clearAuthData(): void {
  // Clear cookies with parent domain
  document.cookie = `${COOKIE_NAMES.ACCESS_TOKEN}=; ${getClearCookieOptions()}`;
  document.cookie = `${COOKIE_NAMES.USER}=; ${getClearCookieOptions()}`;

  // Also clear without domain (for localhost development)
  document.cookie = `${COOKIE_NAMES.ACCESS_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  document.cookie = `${COOKIE_NAMES.USER}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;

  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('user_session');
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_code');
    localStorage.removeItem('login_pending');
  }
}

/**
 * Sync auth data from cookie to localStorage
 * Call this on app initialization to restore session from SSO cookie
 */
export function syncAuthFromCookie(): boolean {
  if (typeof window === 'undefined') return false;

  const cookieToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
  const cookieUser = getCookie(COOKIE_NAMES.USER);

  if (cookieToken) {
    // Sync token to localStorage if not already there
    if (!localStorage.getItem('access_token')) {
      localStorage.setItem('access_token', cookieToken);
    }

    // Sync user to localStorage if available
    if (cookieUser && !localStorage.getItem('user')) {
      localStorage.setItem('user', cookieUser);
      localStorage.setItem('authenticated', 'true');
    }

    return true; // Session restored from cookie
  }

  return false; // No SSO session found
}

/**
 * Check if user is authenticated (from cookie or localStorage)
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Set complete auth data (token and user) in both cookies and localStorage
 * Convenience function for login flows
 */
export function setAuthData(token: string, user?: Record<string, unknown>): void {
  setAuthToken(token);
  if (user) {
    setAuthUser(user);
  }
}

// Export cookie names for reference
export { COOKIE_NAMES };
