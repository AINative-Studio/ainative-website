/**
 * NextAuth Configuration Type Validation
 *
 * Provides compile-time and runtime validation for NextAuth.js configuration
 * to ensure all required fields are present and correctly typed.
 */

import { NextAuthOptions } from 'next-auth';
import { z } from 'zod';

/**
 * Required NextAuth Environment Variables
 */
export const NextAuthEnvSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  DATABASE_URL: z.string().url(),
});

export type NextAuthEnv = z.infer<typeof NextAuthEnvSchema>;

/**
 * NextAuth Configuration Validator
 *
 * Validates NextAuth configuration at runtime to catch
 * misconfigurations before they cause production failures.
 */
export class NextAuthConfigValidator {
  /**
   * Validates that the secret is properly configured
   */
  static validateSecret(options: NextAuthOptions, env: NodeJS.ProcessEnv): void {
    const secret = options.secret || env.NEXTAUTH_SECRET;

    if (!secret) {
      throw new Error(
        'NextAuth secret is not configured. Set NEXTAUTH_SECRET environment variable or pass secret option.'
      );
    }

    if (secret.length < 32) {
      throw new Error(
        `NextAuth secret must be at least 32 characters long. Current length: ${secret.length}. ` +
        'Generate a secure secret with: openssl rand -base64 32'
      );
    }

    if (env.NODE_ENV === 'production' && !env.NEXTAUTH_SECRET) {
      throw new Error(
        'NEXTAUTH_SECRET environment variable must be explicitly set in production. ' +
        'Do not rely on generated secrets.'
      );
    }
  }

  /**
   * Validates that NEXTAUTH_URL is properly configured
   */
  static validateUrl(env: NodeJS.ProcessEnv): void {
    const url = env.NEXTAUTH_URL;

    if (!url) {
      throw new Error(
        'NEXTAUTH_URL is not configured. Set this environment variable to your application URL. ' +
        'Example: https://www.ainative.studio or http://localhost:3000'
      );
    }

    try {
      const urlObj = new URL(url);

      if (env.NODE_ENV === 'production') {
        if (urlObj.protocol !== 'https:') {
          throw new Error(
            `NEXTAUTH_URL must use HTTPS in production. Current: ${urlObj.protocol}//`
          );
        }

        if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
          throw new Error(
            'NEXTAUTH_URL cannot be localhost in production. Use your production domain.'
          );
        }
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`NEXTAUTH_URL is not a valid URL: ${url}`);
      }
      throw error;
    }
  }

  /**
   * Validates provider configuration
   */
  static validateProviders(options: NextAuthOptions, env: NodeJS.ProcessEnv): void {
    if (!options.providers || options.providers.length === 0) {
      throw new Error('NextAuth must have at least one provider configured');
    }

    // Check GitHub provider configuration
    const hasGitHubProvider = options.providers.some(
      (provider) => provider.id === 'github'
    );

    if (hasGitHubProvider) {
      if (!env.GITHUB_CLIENT_ID) {
        throw new Error(
          'GitHub provider is configured but GITHUB_CLIENT_ID is not set'
        );
      }

      if (!env.GITHUB_CLIENT_SECRET) {
        throw new Error(
          'GitHub provider is configured but GITHUB_CLIENT_SECRET is not set'
        );
      }

      // Check for empty string fallbacks
      if (env.GITHUB_CLIENT_ID === '' || env.GITHUB_CLIENT_SECRET === '') {
        throw new Error(
          'GitHub OAuth credentials cannot be empty strings. Remove the provider or set valid credentials.'
        );
      }
    }

    // Check for credentials provider in production without proper validation
    const hasCredentialsProvider = options.providers.some(
      (provider) => provider.id === 'credentials'
    );

    if (hasCredentialsProvider && env.NODE_ENV === 'production') {
      console.warn(
        'WARNING: Credentials provider is enabled in production. ' +
        'Ensure proper authentication validation is implemented.'
      );
    }
  }

  /**
   * Validates session configuration
   */
  static validateSession(options: NextAuthOptions, env: NodeJS.ProcessEnv): void {
    const sessionStrategy = options.session?.strategy;

    if (sessionStrategy === 'database') {
      if (!env.DATABASE_URL) {
        throw new Error(
          'Session strategy is set to "database" but DATABASE_URL is not configured'
        );
      }

      if (!options.adapter) {
        throw new Error(
          'Session strategy is set to "database" but no adapter is configured. ' +
          'Add a database adapter (e.g., PrismaAdapter)'
        );
      }
    }

    if (sessionStrategy === 'jwt' && !options.secret && !env.NEXTAUTH_SECRET) {
      throw new Error(
        'JWT session strategy requires NEXTAUTH_SECRET to be configured'
      );
    }
  }

  /**
   * Validates adapter configuration
   */
  static validateAdapter(options: NextAuthOptions, env: NodeJS.ProcessEnv): void {
    if (options.adapter) {
      if (!env.DATABASE_URL) {
        throw new Error(
          'Database adapter is configured but DATABASE_URL is not set'
        );
      }

      // Validate Prisma-specific requirements
      if (options.adapter.constructor.name.includes('Prisma')) {
        const dbUrl = env.DATABASE_URL;
        if (!dbUrl?.startsWith('postgresql://') && !dbUrl?.startsWith('postgres://')) {
          throw new Error(
            'PrismaAdapter requires PostgreSQL. DATABASE_URL must start with postgresql:// or postgres://'
          );
        }
      }
    }
  }

  /**
   * Validates cookie configuration
   */
  static validateCookies(options: NextAuthOptions, env: NodeJS.ProcessEnv): void {
    const isProd = env.NODE_ENV === 'production';
    const cookies = options.cookies;

    if (cookies) {
      // Check session token cookie
      if (cookies.sessionToken) {
        const sessionCookie = cookies.sessionToken;

        if (isProd && sessionCookie.name && !sessionCookie.name.startsWith('__Secure-')) {
          console.warn(
            'WARNING: Session cookie in production should use __Secure- prefix for enhanced security'
          );
        }

        if (isProd && sessionCookie.options?.secure === false) {
          throw new Error(
            'Session cookie must have secure flag enabled in production'
          );
        }

        if (sessionCookie.options?.httpOnly === false) {
          console.warn(
            'WARNING: Session cookie should have httpOnly flag enabled to prevent XSS attacks'
          );
        }
      }

      // Check CSRF token cookie
      if (cookies.csrfToken) {
        const csrfCookie = cookies.csrfToken;

        if (isProd && csrfCookie.name && !csrfCookie.name.startsWith('__Host-')) {
          console.warn(
            'WARNING: CSRF cookie in production should use __Host- prefix for maximum security'
          );
        }
      }
    }

    // Validate useSecureCookies setting
    if (options.useSecureCookies !== undefined) {
      if (isProd && options.useSecureCookies === false) {
        throw new Error(
          'useSecureCookies must be true in production to ensure secure cookie transmission'
        );
      }
    }
  }

  /**
   * Validates JWT configuration
   */
  static validateJWT(options: NextAuthOptions): void {
    if (options.jwt) {
      const maxAge = options.jwt.maxAge;

      if (maxAge !== undefined) {
        if (maxAge < 60) {
          console.warn(
            `WARNING: JWT maxAge is very short (${maxAge}s). This may cause frequent re-authentication.`
          );
        }

        if (maxAge > 30 * 24 * 60 * 60) {
          console.warn(
            `WARNING: JWT maxAge is very long (${maxAge}s / ${Math.floor(maxAge / 86400)} days). ` +
            'Consider shorter expiration for better security.'
          );
        }
      }
    }

    // Check session maxAge vs JWT maxAge consistency
    if (options.session?.maxAge && options.jwt?.maxAge) {
      if (options.session.maxAge !== options.jwt.maxAge) {
        console.warn(
          'WARNING: Session maxAge and JWT maxAge are different. ' +
          `Session: ${options.session.maxAge}s, JWT: ${options.jwt.maxAge}s. ` +
          'This may cause inconsistent expiration behavior.'
        );
      }
    }
  }

  /**
   * Validates pages configuration
   */
  static validatePages(options: NextAuthOptions): void {
    if (options.pages) {
      const requiredPages = ['signIn', 'error'] as const;

      for (const page of requiredPages) {
        if (options.pages[page]) {
          const pagePath = options.pages[page];

          if (!pagePath?.startsWith('/')) {
            throw new Error(
              `Custom ${page} page path must start with /. Current: ${pagePath}`
            );
          }
        }
      }
    }
  }

  /**
   * Validates callbacks configuration
   */
  static validateCallbacks(options: NextAuthOptions): void {
    if (options.callbacks) {
      // Check for common callback issues
      if (options.callbacks.redirect) {
        console.info('✓ Custom redirect callback configured');
      }

      if (options.callbacks.jwt && options.session?.strategy === 'database') {
        console.warn(
          'WARNING: JWT callback is configured but session strategy is "database". ' +
          'JWT callback will not be called with database sessions.'
        );
      }
    }
  }

  /**
   * Comprehensive validation of NextAuth configuration
   *
   * @param options - NextAuth configuration options
   * @param env - Environment variables
   * @throws Error if validation fails
   */
  static validateConfig(
    options: NextAuthOptions,
    env: NodeJS.ProcessEnv = process.env
  ): void {
    console.log('🔍 Validating NextAuth configuration...');

    try {
      this.validateSecret(options, env);
      this.validateUrl(env);
      this.validateProviders(options, env);
      this.validateSession(options, env);
      this.validateAdapter(options, env);
      this.validateCookies(options, env);
      this.validateJWT(options);
      this.validatePages(options);
      this.validateCallbacks(options);

      console.log('✅ NextAuth configuration is valid');
    } catch (error) {
      console.error('❌ NextAuth configuration validation failed');
      throw error;
    }
  }

  /**
   * Validates configuration and returns warnings (non-throwing)
   *
   * @param options - NextAuth configuration options
   * @param env - Environment variables
   * @returns Array of validation warnings
   */
  static getConfigWarnings(
    options: NextAuthOptions,
    env: NodeJS.ProcessEnv = process.env
  ): string[] {
    const warnings: string[] = [];

    // Capture console.warn calls
    const originalWarn = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };

    try {
      this.validateConfig(options, env);
    } catch (error) {
      // Validation errors are thrown, we only want warnings here
      if (error instanceof Error) {
        warnings.push(`ERROR: ${error.message}`);
      }
    } finally {
      console.warn = originalWarn;
    }

    return warnings;
  }
}

/**
 * Type guard to check if NextAuth configuration is valid
 */
export function isValidNextAuthConfig(
  options: NextAuthOptions,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  try {
    NextAuthConfigValidator.validateConfig(options, env);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to get required environment variables for NextAuth
 */
export function getRequiredNextAuthEnvVars(): string[] {
  return [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
  ];
}

/**
 * Helper to get optional environment variables for NextAuth
 */
export function getOptionalNextAuthEnvVars(): string[] {
  return [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
  ];
}

/**
 * Prints NextAuth configuration summary
 */
export function printNextAuthConfigSummary(
  options: NextAuthOptions,
  env: NodeJS.ProcessEnv = process.env
): void {
  console.log('\n=== NextAuth Configuration Summary ===\n');

  console.log('Environment:');
  console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  - NEXTAUTH_URL: ${env.NEXTAUTH_URL || 'NOT SET'}`);
  console.log(`  - NEXTAUTH_SECRET: ${env.NEXTAUTH_SECRET ? 'SET (length: ' + env.NEXTAUTH_SECRET.length + ')' : 'NOT SET'}`);
  console.log(`  - DATABASE_URL: ${env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
  console.log('');

  console.log('Configuration:');
  console.log(`  - Providers: ${options.providers.length} configured`);
  options.providers.forEach((provider) => {
    console.log(`    - ${provider.name} (${provider.id})`);
  });
  console.log(`  - Session Strategy: ${options.session?.strategy || 'jwt (default)'}`);
  console.log(`  - Session Max Age: ${options.session?.maxAge || 2592000}s (${Math.floor((options.session?.maxAge || 2592000) / 86400)} days)`);
  console.log(`  - Adapter: ${options.adapter ? 'Configured' : 'None (using JWT)'}`);
  console.log(`  - Debug Mode: ${options.debug ? 'Enabled' : 'Disabled'}`);
  console.log(`  - Secure Cookies: ${options.useSecureCookies !== false ? 'Enabled' : 'Disabled'}`);
  console.log('');

  const warnings = NextAuthConfigValidator.getConfigWarnings(options, env);
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach((warning) => console.log(`  ${warning}`));
    console.log('');
  } else {
    console.log('✅ No warnings\n');
  }
}
