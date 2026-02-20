/**
 * Prisma Configuration Validation
 *
 * Validates Prisma client configuration and database connectivity
 * to ensure proper database setup before runtime operations.
 */

import { z } from 'zod';

/**
 * Prisma Environment Schema
 */
export const PrismaEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().min(1).max(100)
  ).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export type PrismaEnv = z.infer<typeof PrismaEnvSchema>;

/**
 * Database Connection String Parser
 */
export interface ParsedDatabaseUrl {
  protocol: string;
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
  params: Record<string, string>;
}

/**
 * Prisma Configuration Validator
 */
export class PrismaConfigValidator {
  /**
   * Parses a PostgreSQL connection string
   */
  static parseDatabaseUrl(url: string): ParsedDatabaseUrl {
    try {
      const urlObj = new URL(url);

      // Parse query parameters
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return {
        protocol: urlObj.protocol.replace(':', ''),
        username: decodeURIComponent(urlObj.username),
        password: decodeURIComponent(urlObj.password),
        host: urlObj.hostname,
        port: urlObj.port ? parseInt(urlObj.port, 10) : 5432,
        database: urlObj.pathname.substring(1),
        params,
      };
    } catch (error) {
      throw new Error(`Failed to parse DATABASE_URL: ${error instanceof Error ? error.message : 'Invalid URL format'}`);
    }
  }

  /**
   * Validates DATABASE_URL format and content
   */
  static validateDatabaseUrl(env: NodeJS.ProcessEnv = process.env): void {
    const dbUrl = env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error('DATABASE_URL is not configured');
    }

    // Parse the URL
    const parsed = this.parseDatabaseUrl(dbUrl);

    // Validate protocol
    if (!['postgres', 'postgresql'].includes(parsed.protocol)) {
      throw new Error(
        `Invalid database protocol: ${parsed.protocol}. ` +
        'Prisma requires PostgreSQL (postgresql:// or postgres://)'
      );
    }

    // Validate credentials
    if (!parsed.username) {
      throw new Error('DATABASE_URL missing username');
    }

    if (!parsed.password) {
      console.warn('⚠️  DATABASE_URL missing password. This may cause connection failures.');
    }

    // Validate host
    if (!parsed.host) {
      throw new Error('DATABASE_URL missing host');
    }

    // Validate database name
    if (!parsed.database) {
      throw new Error('DATABASE_URL missing database name');
    }

    // Check for Railway/PgBouncer-specific requirements (from CLAUDE.md)
    if (env.NODE_ENV === 'production') {
      if (parsed.port === 5432) {
        console.warn(
          '⚠️  Using port 5432 (direct PostgreSQL). ' +
          'For Railway deployments, use port 6432 (PgBouncer) for connection pooling.'
        );
      } else if (parsed.port === 6432) {
        console.log('✓ Using PgBouncer port (6432) for connection pooling');
      }

      // Check for SSL requirement
      if (!parsed.params.sslmode && !parsed.params.ssl) {
        console.warn(
          '⚠️  No SSL configuration detected in DATABASE_URL. ' +
          'Production databases should use SSL. Add ?sslmode=require to the connection string.'
        );
      }
    }

    // Validate connection parameters
    if (parsed.params.schema) {
      console.log(`✓ Using schema: ${parsed.params.schema}`);
    }

    if (parsed.params.connection_limit) {
      const limit = parseInt(parsed.params.connection_limit, 10);
      if (isNaN(limit) || limit < 1) {
        throw new Error('Invalid connection_limit parameter in DATABASE_URL');
      }
      console.log(`✓ Connection limit: ${limit}`);
    }
  }

  /**
   * Validates connection pool configuration
   */
  static validateConnectionPool(env: NodeJS.ProcessEnv = process.env): void {
    const poolSize = env.DATABASE_POOL_SIZE;

    if (poolSize) {
      const size = parseInt(poolSize, 10);

      if (isNaN(size) || size < 1) {
        throw new Error(`Invalid DATABASE_POOL_SIZE: ${poolSize}. Must be a positive integer.`);
      }

      if (size > 100) {
        console.warn(
          `⚠️  DATABASE_POOL_SIZE is very large (${size}). ` +
          'This may exhaust database connection limits.'
        );
      }

      if (env.NODE_ENV === 'production' && size < 5) {
        console.warn(
          `⚠️  DATABASE_POOL_SIZE is very small (${size}) for production. ` +
          'Consider increasing for better performance.'
        );
      }

      console.log(`✓ Connection pool size: ${size}`);
    } else {
      console.log('ℹ️  DATABASE_POOL_SIZE not set, using default');
    }
  }

  /**
   * Validates Prisma schema compatibility
   */
  static validateSchemaCompatibility(env: NodeJS.ProcessEnv = process.env): void {
    const dbUrl = env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error('DATABASE_URL is not configured');
    }

    const parsed = this.parseDatabaseUrl(dbUrl);

    // Check for relationMode compatibility
    if (parsed.params.relationMode === 'prisma') {
      console.log('✓ Using Prisma relation mode (emulated foreign keys)');
    } else {
      console.log('✓ Using database relation mode (native foreign keys)');
    }

    // Check for pgBouncer transaction mode compatibility
    if (parsed.port === 6432) {
      console.warn(
        'ℹ️  Using PgBouncer. Ensure transaction pooling mode is compatible with Prisma migrations. ' +
        'For migrations, use direct connection on port 5432.'
      );
    }
  }

  /**
   * Validates Prisma client configuration
   */
  static validatePrismaClient(env: NodeJS.ProcessEnv = process.env): void {
    // Check if Prisma Client is properly generated
    try {
      // This will throw if Prisma Client is not generated
      require('@prisma/client');
      console.log('✓ Prisma Client is generated');
    } catch (error) {
      throw new Error(
        'Prisma Client is not generated. Run: npx prisma generate'
      );
    }

    // Validate logging configuration
    const isDev = env.NODE_ENV === 'development';
    console.log(`✓ Prisma logging: ${isDev ? 'Verbose (query, error, warn)' : 'Errors only'}`);
  }

  /**
   * Validates shadow database for migrations (development only)
   */
  static validateShadowDatabase(env: NodeJS.ProcessEnv = process.env): void {
    const shadowDbUrl = env.SHADOW_DATABASE_URL;

    if (shadowDbUrl) {
      console.log('✓ Shadow database configured for migrations');
      try {
        this.parseDatabaseUrl(shadowDbUrl);
      } catch (error) {
        throw new Error(`Invalid SHADOW_DATABASE_URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (env.NODE_ENV === 'development') {
      console.log('ℹ️  No shadow database configured. Prisma will create temporary databases for migrations.');
    }
  }

  /**
   * Comprehensive Prisma configuration validation
   */
  static validateConfig(env: NodeJS.ProcessEnv = process.env): void {
    console.log('🔍 Validating Prisma configuration...');

    try {
      this.validateDatabaseUrl(env);
      this.validateConnectionPool(env);
      this.validateSchemaCompatibility(env);
      this.validatePrismaClient(env);
      this.validateShadowDatabase(env);

      console.log('✅ Prisma configuration is valid');
    } catch (error) {
      console.error('❌ Prisma configuration validation failed');
      throw error;
    }
  }

  /**
   * Gets configuration warnings (non-throwing)
   */
  static getConfigWarnings(env: NodeJS.ProcessEnv = process.env): string[] {
    const warnings: string[] = [];

    // Capture console.warn calls
    const originalWarn = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };

    try {
      this.validateConfig(env);
    } catch (error) {
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
 * Type guard for valid Prisma configuration
 */
export function isValidPrismaConfig(env: NodeJS.ProcessEnv = process.env): boolean {
  try {
    PrismaConfigValidator.validateConfig(env);
    return true;
  } catch {
    return false;
  }
}

/**
 * Prints Prisma configuration summary
 */
export function printPrismaConfigSummary(env: NodeJS.ProcessEnv = process.env): void {
  console.log('\n=== Prisma Configuration Summary ===\n');

  try {
    const dbUrl = env.DATABASE_URL;
    if (dbUrl) {
      const parsed = PrismaConfigValidator.parseDatabaseUrl(dbUrl);

      console.log('Database Connection:');
      console.log(`  - Protocol: ${parsed.protocol}`);
      console.log(`  - Host: ${parsed.host}`);
      console.log(`  - Port: ${parsed.port}${parsed.port === 6432 ? ' (PgBouncer)' : ''}`);
      console.log(`  - Database: ${parsed.database}`);
      console.log(`  - Username: ${parsed.username}`);
      console.log(`  - Password: ${parsed.password ? '[REDACTED]' : 'NOT SET'}`);

      if (Object.keys(parsed.params).length > 0) {
        console.log('  - Parameters:');
        Object.entries(parsed.params).forEach(([key, value]) => {
          console.log(`    - ${key}: ${value}`);
        });
      }
    }

    console.log('');
    const warnings = PrismaConfigValidator.getConfigWarnings(env);
    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach((warning) => console.log(`  ${warning}`));
      console.log('');
    } else {
      console.log('✅ No warnings\n');
    }
  } catch (error) {
    console.error('❌ Failed to generate summary');
    if (error instanceof Error) {
      console.error(`Error: ${error.message}\n`);
    }
  }
}

/**
 * Generates a development DATABASE_URL template
 */
export function generateDevelopmentDatabaseUrl(
  username = 'postgres',
  password = 'postgres',
  host = 'localhost',
  port = 5432,
  database = 'ainative_dev'
): string {
  return `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
}

/**
 * Validates production-specific database requirements
 */
export function validateProductionDatabase(env: NodeJS.ProcessEnv = process.env): string[] {
  const issues: string[] = [];

  if (env.NODE_ENV !== 'production') {
    return issues;
  }

  try {
    const dbUrl = env.DATABASE_URL;
    if (!dbUrl) {
      issues.push('CRITICAL: DATABASE_URL not configured in production');
      return issues;
    }

    const parsed = PrismaConfigValidator.parseDatabaseUrl(dbUrl);

    // Check for localhost in production
    if (parsed.host === 'localhost' || parsed.host === '127.0.0.1') {
      issues.push('CRITICAL: DATABASE_URL uses localhost in production');
    }

    // Check for weak passwords
    if (parsed.password && parsed.password.length < 16) {
      issues.push('WARNING: Database password is shorter than 16 characters');
    }

    // Check for SSL
    if (!parsed.params.sslmode && !parsed.params.ssl) {
      issues.push('WARNING: SSL not configured for production database');
    }

    // Check for connection pooling
    if (parsed.port !== 6432) {
      issues.push('WARNING: Not using PgBouncer (port 6432) for connection pooling');
    }
  } catch (error) {
    issues.push(`ERROR: Failed to validate database URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return issues;
}
