/**
 * NextAuth Configuration Validation Tests
 *
 * Tests for NextAuth-specific configuration validation
 *
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import {
  NextAuthConfigValidator,
  isValidNextAuthConfig,
  getRequiredNextAuthEnvVars,
  getOptionalNextAuthEnvVars,
} from '@/lib/config/nextauth.validation';

// Mock Prisma client
const mockPrisma = {} as any;

describe('NextAuth Configuration Validation', () => {
  let mockEnv: NodeJS.ProcessEnv;
  let baseConfig: NextAuthOptions;

  beforeEach(() => {
    // Mock environment
    mockEnv = {
      NODE_ENV: 'development',
      NEXTAUTH_SECRET: 'test-secret-minimum-32-characters-long-abcdefgh',
      NEXTAUTH_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      GITHUB_CLIENT_ID: 'test-github-client-id',
      GITHUB_CLIENT_SECRET: 'test-github-client-secret',
    };

    // Base valid configuration
    baseConfig = {
      secret: mockEnv.NEXTAUTH_SECRET,
      providers: [
        GitHubProvider({
          clientId: mockEnv.GITHUB_CLIENT_ID!,
          clientSecret: mockEnv.GITHUB_CLIENT_SECRET!,
        }),
      ],
      adapter: PrismaAdapter(mockPrisma),
      session: {
        strategy: 'database',
        maxAge: 30 * 24 * 60 * 60,
      },
      useSecureCookies: false,
      debug: true,
    };

    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  describe('validateSecret', () => {
    it('should validate correct secret configuration', () => {
      expect(() => {
        NextAuthConfigValidator.validateSecret(baseConfig, mockEnv);
      }).not.toThrow();
    });

    it('should throw if secret is missing', () => {
      const config = { ...baseConfig, secret: undefined };
      delete mockEnv.NEXTAUTH_SECRET;

      expect(() => {
        NextAuthConfigValidator.validateSecret(config, mockEnv);
      }).toThrow('NextAuth secret is not configured');
    });

    it('should throw if secret is too short', () => {
      const config = { ...baseConfig, secret: 'short' };

      expect(() => {
        NextAuthConfigValidator.validateSecret(config, mockEnv);
      }).toThrow('must be at least 32 characters long');
    });

    it('should throw if NEXTAUTH_SECRET not set in production', () => {
      mockEnv.NODE_ENV = 'production';
      const config = { ...baseConfig, secret: 'a'.repeat(32) };
      delete mockEnv.NEXTAUTH_SECRET;

      expect(() => {
        NextAuthConfigValidator.validateSecret(config, mockEnv);
      }).toThrow('must be explicitly set in production');
    });

    it('should accept secret from environment variable', () => {
      const config = { ...baseConfig, secret: undefined };
      mockEnv.NEXTAUTH_SECRET = 'env-secret-minimum-32-characters-long-abcd';

      expect(() => {
        NextAuthConfigValidator.validateSecret(config, mockEnv);
      }).not.toThrow();
    });
  });

  describe('validateUrl', () => {
    it('should validate correct NEXTAUTH_URL', () => {
      expect(() => {
        NextAuthConfigValidator.validateUrl(mockEnv);
      }).not.toThrow();
    });

    it('should throw if NEXTAUTH_URL is missing', () => {
      delete mockEnv.NEXTAUTH_URL;

      expect(() => {
        NextAuthConfigValidator.validateUrl(mockEnv);
      }).toThrow('NEXTAUTH_URL is not configured');
    });

    it('should throw if NEXTAUTH_URL is not a valid URL', () => {
      mockEnv.NEXTAUTH_URL = 'not-a-valid-url';

      expect(() => {
        NextAuthConfigValidator.validateUrl(mockEnv);
      }).toThrow('not a valid URL');
    });

    it('should throw if production URL is not HTTPS', () => {
      mockEnv.NODE_ENV = 'production';
      mockEnv.NEXTAUTH_URL = 'http://www.ainative.studio';

      expect(() => {
        NextAuthConfigValidator.validateUrl(mockEnv);
      }).toThrow('must use HTTPS in production');
    });

    it('should throw if production URL is localhost', () => {
      mockEnv.NODE_ENV = 'production';
      mockEnv.NEXTAUTH_URL = 'https://localhost:3000';

      expect(() => {
        NextAuthConfigValidator.validateUrl(mockEnv);
      }).toThrow('cannot be localhost in production');
    });

    it('should allow localhost in development', () => {
      mockEnv.NODE_ENV = 'development';
      mockEnv.NEXTAUTH_URL = 'http://localhost:3000';

      expect(() => {
        NextAuthConfigValidator.validateUrl(mockEnv);
      }).not.toThrow();
    });
  });

  describe('validateProviders', () => {
    it('should validate providers configuration', () => {
      expect(() => {
        NextAuthConfigValidator.validateProviders(baseConfig, mockEnv);
      }).not.toThrow();
    });

    it('should throw if no providers configured', () => {
      const config = { ...baseConfig, providers: [] };

      expect(() => {
        NextAuthConfigValidator.validateProviders(config, mockEnv);
      }).toThrow('at least one provider');
    });

    it('should throw if GitHub provider missing CLIENT_ID', () => {
      delete mockEnv.GITHUB_CLIENT_ID;

      expect(() => {
        NextAuthConfigValidator.validateProviders(baseConfig, mockEnv);
      }).toThrow('GITHUB_CLIENT_ID is not set');
    });

    it('should throw if GitHub provider missing CLIENT_SECRET', () => {
      delete mockEnv.GITHUB_CLIENT_SECRET;

      expect(() => {
        NextAuthConfigValidator.validateProviders(baseConfig, mockEnv);
      }).toThrow('GITHUB_CLIENT_SECRET is not set');
    });

    it('should throw if GitHub credentials are empty strings', () => {
      mockEnv.GITHUB_CLIENT_ID = '';

      expect(() => {
        NextAuthConfigValidator.validateProviders(baseConfig, mockEnv);
      }).toThrow('cannot be empty strings');
    });

    it('should warn about credentials provider in production', () => {
      mockEnv.NODE_ENV = 'production';
      const config = {
        ...baseConfig,
        providers: [
          ...baseConfig.providers,
          CredentialsProvider({
            name: 'Credentials',
            credentials: {
              email: { label: 'Email', type: 'email' },
              password: { label: 'Password', type: 'password' },
            },
            authorize: async () => null,
          }),
        ],
      };

      const warnSpy = jest.spyOn(console, 'warn');
      NextAuthConfigValidator.validateProviders(config, mockEnv);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Credentials provider')
      );
    });
  });

  describe('validateSession', () => {
    it('should validate database session strategy', () => {
      expect(() => {
        NextAuthConfigValidator.validateSession(baseConfig, mockEnv);
      }).not.toThrow();
    });

    it('should throw if database strategy without DATABASE_URL', () => {
      delete mockEnv.DATABASE_URL;

      expect(() => {
        NextAuthConfigValidator.validateSession(baseConfig, mockEnv);
      }).toThrow('DATABASE_URL is not configured');
    });

    it('should throw if database strategy without adapter', () => {
      const config = { ...baseConfig, adapter: undefined };

      expect(() => {
        NextAuthConfigValidator.validateSession(config, mockEnv);
      }).toThrow('no adapter is configured');
    });

    it('should validate JWT session strategy', () => {
      const config = {
        ...baseConfig,
        session: { strategy: 'jwt' as const },
        adapter: undefined,
      };

      expect(() => {
        NextAuthConfigValidator.validateSession(config, mockEnv);
      }).not.toThrow();
    });

    it('should throw if JWT strategy without secret', () => {
      const config = {
        ...baseConfig,
        secret: undefined,
        session: { strategy: 'jwt' as const },
        adapter: undefined,
      };
      delete mockEnv.NEXTAUTH_SECRET;

      expect(() => {
        NextAuthConfigValidator.validateSession(config, mockEnv);
      }).toThrow('JWT session strategy requires NEXTAUTH_SECRET');
    });
  });

  describe('validateAdapter', () => {
    it('should validate adapter configuration', () => {
      expect(() => {
        NextAuthConfigValidator.validateAdapter(baseConfig, mockEnv);
      }).not.toThrow();
    });

    it('should throw if adapter configured without DATABASE_URL', () => {
      delete mockEnv.DATABASE_URL;

      expect(() => {
        NextAuthConfigValidator.validateAdapter(baseConfig, mockEnv);
      }).toThrow('DATABASE_URL is not set');
    });

    it('should validate Prisma adapter requires PostgreSQL', () => {
      mockEnv.DATABASE_URL = 'mysql://user:pass@localhost:3306/db';

      expect(() => {
        NextAuthConfigValidator.validateAdapter(baseConfig, mockEnv);
      }).toThrow('PrismaAdapter requires PostgreSQL');
    });

    it('should allow config without adapter', () => {
      const config = { ...baseConfig, adapter: undefined };
      delete mockEnv.DATABASE_URL;

      expect(() => {
        NextAuthConfigValidator.validateAdapter(config, mockEnv);
      }).not.toThrow();
    });
  });

  describe('validateCookies', () => {
    it('should validate secure cookie configuration', () => {
      expect(() => {
        NextAuthConfigValidator.validateCookies(baseConfig, mockEnv);
      }).not.toThrow();
    });

    it('should warn about session cookie without __Secure- prefix in production', () => {
      mockEnv.NODE_ENV = 'production';
      const config = {
        ...baseConfig,
        cookies: {
          sessionToken: {
            name: 'next-auth.session-token',
            options: { secure: true, httpOnly: true },
          },
        },
      };

      const warnSpy = jest.spyOn(console, 'warn');
      NextAuthConfigValidator.validateCookies(config, mockEnv);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('__Secure-')
      );
    });

    it('should throw if session cookie not secure in production', () => {
      mockEnv.NODE_ENV = 'production';
      const config = {
        ...baseConfig,
        cookies: {
          sessionToken: {
            name: '__Secure-next-auth.session-token',
            options: { secure: false, httpOnly: true },
          },
        },
      };

      expect(() => {
        NextAuthConfigValidator.validateCookies(config, mockEnv);
      }).toThrow('must have secure flag enabled');
    });

    it('should warn if session cookie not httpOnly', () => {
      const config = {
        ...baseConfig,
        cookies: {
          sessionToken: {
            name: 'next-auth.session-token',
            options: { secure: true, httpOnly: false },
          },
        },
      };

      const warnSpy = jest.spyOn(console, 'warn');
      NextAuthConfigValidator.validateCookies(config, mockEnv);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('httpOnly')
      );
    });

    it('should throw if useSecureCookies is false in production', () => {
      mockEnv.NODE_ENV = 'production';
      const config = { ...baseConfig, useSecureCookies: false };

      expect(() => {
        NextAuthConfigValidator.validateCookies(config, mockEnv);
      }).toThrow('useSecureCookies must be true in production');
    });
  });

  describe('validateJWT', () => {
    it('should validate JWT configuration', () => {
      const config = {
        ...baseConfig,
        jwt: { maxAge: 30 * 24 * 60 * 60 },
      };

      expect(() => {
        NextAuthConfigValidator.validateJWT(config);
      }).not.toThrow();
    });

    it('should warn about very short JWT maxAge', () => {
      const config = {
        ...baseConfig,
        jwt: { maxAge: 30 },
      };

      const warnSpy = jest.spyOn(console, 'warn');
      NextAuthConfigValidator.validateJWT(config);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('very short')
      );
    });

    it('should warn about very long JWT maxAge', () => {
      const config = {
        ...baseConfig,
        jwt: { maxAge: 365 * 24 * 60 * 60 },
      };

      const warnSpy = jest.spyOn(console, 'warn');
      NextAuthConfigValidator.validateJWT(config);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('very long')
      );
    });

    it('should warn about mismatched session and JWT maxAge', () => {
      const config = {
        ...baseConfig,
        session: { strategy: 'jwt' as const, maxAge: 7 * 24 * 60 * 60 },
        jwt: { maxAge: 30 * 24 * 60 * 60 },
      };

      const warnSpy = jest.spyOn(console, 'warn');
      NextAuthConfigValidator.validateJWT(config);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('different')
      );
    });
  });

  describe('validatePages', () => {
    it('should validate custom pages configuration', () => {
      const config = {
        ...baseConfig,
        pages: {
          signIn: '/auth/signin',
          error: '/auth/error',
        },
      };

      expect(() => {
        NextAuthConfigValidator.validatePages(config);
      }).not.toThrow();
    });

    it('should throw if page path does not start with /', () => {
      const config = {
        ...baseConfig,
        pages: {
          signIn: 'auth/signin',
        },
      };

      expect(() => {
        NextAuthConfigValidator.validatePages(config);
      }).toThrow('must start with /');
    });
  });

  describe('validateCallbacks', () => {
    it('should validate callbacks configuration', () => {
      const config = {
        ...baseConfig,
        callbacks: {
          redirect: async ({ url, baseUrl }) => url,
        },
      };

      const infoSpy = jest.spyOn(console, 'info');
      NextAuthConfigValidator.validateCallbacks(config);

      expect(infoSpy).toHaveBeenCalledWith(
        expect.stringContaining('redirect callback')
      );
    });

    it('should warn about JWT callback with database sessions', () => {
      const config = {
        ...baseConfig,
        callbacks: {
          jwt: async ({ token }) => token,
        },
      };

      const warnSpy = jest.spyOn(console, 'warn');
      NextAuthConfigValidator.validateCallbacks(config);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('JWT callback')
      );
    });
  });

  describe('validateConfig', () => {
    it('should validate complete valid configuration', () => {
      expect(() => {
        NextAuthConfigValidator.validateConfig(baseConfig, mockEnv);
      }).not.toThrow();
    });

    it('should throw on invalid configuration', () => {
      const config = { ...baseConfig, secret: 'short' };

      expect(() => {
        NextAuthConfigValidator.validateConfig(config, mockEnv);
      }).toThrow();
    });
  });

  describe('isValidNextAuthConfig', () => {
    it('should return true for valid configuration', () => {
      expect(isValidNextAuthConfig(baseConfig, mockEnv)).toBe(true);
    });

    it('should return false for invalid configuration', () => {
      const config = { ...baseConfig, secret: 'short' };

      expect(isValidNextAuthConfig(config, mockEnv)).toBe(false);
    });
  });

  describe('getRequiredNextAuthEnvVars', () => {
    it('should return list of required environment variables', () => {
      const required = getRequiredNextAuthEnvVars();

      expect(required).toContain('NEXTAUTH_SECRET');
      expect(required).toContain('NEXTAUTH_URL');
      expect(required).toContain('DATABASE_URL');
    });
  });

  describe('getOptionalNextAuthEnvVars', () => {
    it('should return list of optional environment variables', () => {
      const optional = getOptionalNextAuthEnvVars();

      expect(optional).toContain('GITHUB_CLIENT_ID');
      expect(optional).toContain('GITHUB_CLIENT_SECRET');
    });
  });

  describe('Edge Cases', () => {
    it('should handle config without session strategy (defaults to JWT)', () => {
      const config = {
        ...baseConfig,
        session: undefined,
        adapter: undefined,
      };

      expect(() => {
        NextAuthConfigValidator.validateSession(config, mockEnv);
      }).not.toThrow();
    });

    it('should handle config with multiple providers', () => {
      const config = {
        ...baseConfig,
        providers: [
          ...baseConfig.providers,
          CredentialsProvider({
            name: 'Credentials',
            credentials: {
              email: { label: 'Email', type: 'email' },
            },
            authorize: async () => null,
          }),
        ],
      };

      expect(() => {
        NextAuthConfigValidator.validateProviders(config, mockEnv);
      }).not.toThrow();
    });

    it('should handle production environment with all checks', () => {
      mockEnv.NODE_ENV = 'production';
      mockEnv.NEXTAUTH_URL = 'https://www.ainative.studio';
      const config = {
        ...baseConfig,
        useSecureCookies: true,
      };

      expect(() => {
        NextAuthConfigValidator.validateConfig(config, mockEnv);
      }).not.toThrow();
    });
  });
});
