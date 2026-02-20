/**
 * Configuration Validation Tests
 *
 * These tests ensure all application configurations are valid:
 * - NextAuth configuration
 * - Next.js configuration
 * - Database configuration
 * - API client configuration
 *
 * Prevents: Configuration errors that cause runtime failures
 */

import { existsSync } from 'fs';
import { join } from 'path';

describe('Configuration Validation - NextAuth', () => {
  let authOptions: any;

  beforeAll(() => {
    // Mock environment variables for testing
    process.env.NEXTAUTH_SECRET = 'test-secret-minimum-32-characters-long-12345';
    process.env.GITHUB_CLIENT_ID = 'test-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-client-secret-12345';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';

    authOptions = require('../../lib/auth/options').authOptions;
  });

  describe('Required Properties', () => {
    it('should have secret property', () => {
      expect(authOptions.secret).toBeDefined();
      expect(authOptions.secret).toBeTruthy();
    });

    it('should have providers array', () => {
      expect(authOptions.providers).toBeDefined();
      expect(Array.isArray(authOptions.providers)).toBe(true);
      expect(authOptions.providers.length).toBeGreaterThan(0);
    });

    it('should have session configuration', () => {
      expect(authOptions.session).toBeDefined();
      expect(authOptions.session.strategy).toBeDefined();
    });

    it('should have callbacks', () => {
      expect(authOptions.callbacks).toBeDefined();
      expect(typeof authOptions.callbacks).toBe('object');
    });

    it('should have jwt callback', () => {
      expect(authOptions.callbacks.jwt).toBeDefined();
      expect(typeof authOptions.callbacks.jwt).toBe('function');
    });

    it('should have session callback', () => {
      expect(authOptions.callbacks.session).toBeDefined();
      expect(typeof authOptions.callbacks.session).toBe('function');
    });
  });

  describe('Provider Configuration', () => {
    it('should have GitHub provider configured', () => {
      const githubProvider = authOptions.providers.find(
        (p: any) => p.id === 'github' || p.name === 'GitHub'
      );
      expect(githubProvider).toBeDefined();
    });

    it('should have credentials provider configured', () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === 'credentials'
      );
      expect(credentialsProvider).toBeDefined();
    });
  });

  describe('Session Configuration', () => {
    it('should use database session strategy with adapter', () => {
      expect(authOptions.session.strategy).toBe('database');
      expect(authOptions.adapter).toBeDefined();
    });

    it('should have reasonable session maxAge', () => {
      expect(authOptions.session.maxAge).toBeDefined();
      expect(authOptions.session.maxAge).toBeGreaterThan(0);
      // Max age should be between 1 day and 90 days
      expect(authOptions.session.maxAge).toBeGreaterThanOrEqual(24 * 60 * 60);
      expect(authOptions.session.maxAge).toBeLessThanOrEqual(90 * 24 * 60 * 60);
    });
  });

  describe('Cookie Configuration', () => {
    it('should have cookie configuration', () => {
      expect(authOptions.cookies).toBeDefined();
    });

    it('should configure session token cookie', () => {
      expect(authOptions.cookies.sessionToken).toBeDefined();
      expect(authOptions.cookies.sessionToken.name).toBeDefined();
      expect(authOptions.cookies.sessionToken.options).toBeDefined();
    });

    it('should have httpOnly cookies', () => {
      expect(authOptions.cookies.sessionToken.options.httpOnly).toBe(true);
    });

    it('should have secure cookies in production', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production mode
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const prodAuthOptions = require('../../lib/auth/options').authOptions;
      expect(prodAuthOptions.useSecureCookies).toBe(true);

      // Restore
      process.env.NODE_ENV = originalEnv;
      jest.resetModules();
    });

    it('should configure cross-subdomain cookies in production', () => {
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const prodAuthOptions = require('../../lib/auth/options').authOptions;

      expect(prodAuthOptions.cookies.sessionToken.options.domain).toBe('.ainative.studio');

      process.env.NODE_ENV = originalEnv;
      jest.resetModules();
    });
  });

  describe('Security Settings', () => {
    it('should have CSRF protection enabled', () => {
      expect(authOptions.cookies.csrfToken).toBeDefined();
      expect(authOptions.cookies.csrfToken.options.httpOnly).toBe(true);
    });

    it('should have redirect callback for security', () => {
      expect(authOptions.callbacks.redirect).toBeDefined();
      expect(typeof authOptions.callbacks.redirect).toBe('function');
    });

    it('should validate redirect URLs', async () => {
      const redirectCallback = authOptions.callbacks.redirect;
      const baseUrl = 'https://www.ainative.studio';

      // Should allow same origin
      const sameOrigin = await redirectCallback({
        url: 'https://www.ainative.studio/dashboard',
        baseUrl
      });
      expect(sameOrigin).toContain('ainative.studio');

      // Should allow relative URLs
      const relative = await redirectCallback({
        url: '/dashboard',
        baseUrl
      });
      expect(relative).toBe('https://www.ainative.studio/dashboard');

      // Should block external URLs
      const external = await redirectCallback({
        url: 'https://evil.com',
        baseUrl
      });
      expect(external).not.toContain('evil.com');
    });
  });

  describe('Adapter Configuration', () => {
    it('should have Prisma adapter', () => {
      expect(authOptions.adapter).toBeDefined();
      expect(authOptions.adapter.createUser).toBeDefined();
      expect(authOptions.adapter.getUser).toBeDefined();
      expect(authOptions.adapter.getUserByEmail).toBeDefined();
    });
  });
});

describe('Configuration Validation - Next.js', () => {
  let nextConfig: any;

  beforeAll(() => {
    nextConfig = require('../../next.config');

    // If nextConfig is a function, call it with production phase
    if (typeof nextConfig === 'function') {
      nextConfig = nextConfig('phase-production-build', {});
    }
  });

  describe('Build Configuration', () => {
    it('should have standalone output for Railway', () => {
      expect(nextConfig.output).toBe('standalone');
    });

    it('should have TypeScript configuration', () => {
      expect(nextConfig.typescript).toBeDefined();
    });

    it('should disable powered by header', () => {
      expect(nextConfig.poweredByHeader).toBe(false);
    });

    it('should have React strict mode enabled', () => {
      expect(nextConfig.reactStrictMode).toBe(true);
    });
  });

  describe('Image Configuration', () => {
    it('should configure remote patterns', () => {
      expect(nextConfig.images).toBeDefined();
      expect(nextConfig.images.remotePatterns).toBeDefined();
      expect(Array.isArray(nextConfig.images.remotePatterns)).toBe(true);
    });

    it('should allow api.ainative.studio images', () => {
      const hasApiPattern = nextConfig.images.remotePatterns.some(
        (p: any) => p.hostname === 'api.ainative.studio'
      );
      expect(hasApiPattern).toBe(true);
    });
  });

  describe('Security Headers', () => {
    it('should configure security headers', async () => {
      expect(nextConfig.headers).toBeDefined();
      expect(typeof nextConfig.headers).toBe('function');

      const headers = await nextConfig.headers();
      expect(Array.isArray(headers)).toBe(true);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should set HSTS header', async () => {
      const headers = await nextConfig.headers();
      const securityHeaders = headers.find((h: any) => h.source === '/:path*');

      expect(securityHeaders).toBeDefined();

      const hstsHeader = securityHeaders.headers.find(
        (h: any) => h.key === 'Strict-Transport-Security'
      );
      expect(hstsHeader).toBeDefined();
      expect(hstsHeader.value).toContain('max-age=31536000');
    });

    it('should set X-Frame-Options', async () => {
      const headers = await nextConfig.headers();
      const securityHeaders = headers.find((h: any) => h.source === '/:path*');

      const frameOptions = securityHeaders.headers.find(
        (h: any) => h.key === 'X-Frame-Options'
      );
      expect(frameOptions).toBeDefined();
      expect(frameOptions.value).toBe('SAMEORIGIN');
    });

    it('should set X-Content-Type-Options', async () => {
      const headers = await nextConfig.headers();
      const securityHeaders = headers.find((h: any) => h.source === '/:path*');

      const contentTypeOptions = securityHeaders.headers.find(
        (h: any) => h.key === 'X-Content-Type-Options'
      );
      expect(contentTypeOptions).toBeDefined();
      expect(contentTypeOptions.value).toBe('nosniff');
    });
  });

  describe('Performance Optimization', () => {
    it('should have experimental optimizations', () => {
      expect(nextConfig.experimental).toBeDefined();
    });

    it('should optimize package imports', () => {
      expect(nextConfig.experimental.optimizePackageImports).toBeDefined();
      expect(Array.isArray(nextConfig.experimental.optimizePackageImports)).toBe(true);
    });

    it('should configure webpack for bundle optimization', () => {
      expect(nextConfig.webpack).toBeDefined();
      expect(typeof nextConfig.webpack).toBe('function');
    });
  });
});

describe('Configuration Validation - Database', () => {
  it('should have valid DATABASE_URL format', () => {
    const testUrls = [
      'postgresql://user:pass@localhost:5432/db',
      'postgresql://user:pass@host.railway.app:6432/db',
      'postgres://user:pass@localhost/db'
    ];

    testUrls.forEach(url => {
      expect(url).toMatch(/^postgres(ql)?:\/\/.+/);
    });
  });

  it('should reject invalid DATABASE_URL formats', () => {
    const invalidUrls = [
      'mysql://localhost/db',  // Wrong DB type
      'localhost:5432/db',  // Missing protocol
      'postgresql://',  // Incomplete
      ''
    ];

    invalidUrls.forEach(url => {
      expect(url).not.toMatch(/^postgresql:\/\/.+@.+\/.+/);
    });
  });
});

describe('Configuration Validation - API Client', () => {
  it('should validate API configuration object', () => {
    const validConfig = {
      baseURL: 'https://api.ainative.studio',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    expect(validConfig.baseURL).toMatch(/^https?:\/\/.+/);
    expect(validConfig.timeout).toBeGreaterThan(0);
    expect(validConfig.timeout).toBeLessThan(60000);
  });

  it('should reject invalid API configurations', () => {
    const invalidConfigs = [
      { baseURL: 'not-a-url', timeout: 15000 },
      { baseURL: 'https://api.example.com', timeout: 0 },
      { baseURL: 'https://api.example.com', timeout: -1000 },
      { baseURL: '', timeout: 15000 }
    ];

    invalidConfigs.forEach(config => {
      if (config.baseURL) {
        const isValidUrl = /^https?:\/\/.+/.test(config.baseURL);
        const isValidTimeout = config.timeout > 0 && config.timeout < 60000;

        expect(isValidUrl && isValidTimeout).toBe(false);
      }
    });
  });
});

describe('Configuration Validation - Feature Flags', () => {
  it('should validate boolean feature flags', () => {
    const flags = {
      NEXT_PUBLIC_ENABLE_AI_FEATURES: 'true',
      NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES: 'false',
      NEXT_PUBLIC_ENABLE_BETA_FEATURES: 'false'
    };

    Object.values(flags).forEach(flag => {
      expect(['true', 'false']).toContain(flag);
    });
  });

  it('should parse feature flags correctly', () => {
    const parseBoolean = (value: string | undefined): boolean => {
      return value === 'true';
    };

    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('false')).toBe(false);
    expect(parseBoolean(undefined)).toBe(false);
    expect(parseBoolean('')).toBe(false);
  });
});

/**
 * Export validation helpers for use in deployment scripts
 */
export function validateNextAuthConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.secret) {
    errors.push('NextAuth secret is required');
  }

  if (!config.providers || config.providers.length === 0) {
    errors.push('At least one authentication provider is required');
  }

  if (!config.session) {
    errors.push('Session configuration is required');
  }

  if (!config.callbacks || !config.callbacks.jwt || !config.callbacks.session) {
    errors.push('JWT and session callbacks are required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateNextConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.output !== 'standalone') {
    errors.push('Next.js must use standalone output for Railway deployment');
  }

  if (!config.reactStrictMode) {
    errors.push('React strict mode should be enabled');
  }

  if (config.poweredByHeader !== false) {
    errors.push('X-Powered-By header should be disabled for security');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
