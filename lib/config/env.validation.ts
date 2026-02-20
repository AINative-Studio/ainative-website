/**
 * Environment Variable Validation System
 *
 * Validates all required environment variables at application startup
 * to fail fast and provide clear error messages before runtime failures.
 *
 * Based on Zod schema validation for type safety and comprehensive error reporting.
 */

import { z } from 'zod';

/**
 * Node Environment Schema
 */
const nodeEnvSchema = z.enum(['development', 'production', 'test']).default('development');

/**
 * NextAuth Configuration Schema
 *
 * All required fields for NextAuth.js to function properly
 */
const nextAuthSchema = z.object({
  // REQUIRED: NextAuth secret for JWT encryption (min 32 chars recommended)
  NEXTAUTH_SECRET: z.string().min(32, {
    message: 'NEXTAUTH_SECRET must be at least 32 characters long. Generate with: openssl rand -base64 32'
  }),

  // REQUIRED: Base URL for OAuth callbacks
  NEXTAUTH_URL: z.string().url({
    message: 'NEXTAUTH_URL must be a valid URL (e.g., https://www.ainative.studio or http://localhost:3000)'
  }),

  // GitHub OAuth (optional but required if GitHub provider is enabled)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});

/**
 * Database Configuration Schema
 *
 * Required for Prisma and NextAuth database adapter
 */
const databaseSchema = z.object({
  // REQUIRED: PostgreSQL connection string
  DATABASE_URL: z.string().url({
    message: 'DATABASE_URL must be a valid PostgreSQL connection string (postgresql://...)'
  }).refine((url) => url.startsWith('postgresql://'), {
    message: 'DATABASE_URL must use postgresql:// protocol'
  }),

  // Optional: Database pool configuration
  DATABASE_POOL_SIZE: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().min(1).max(100)
  ).default('10'),
});

/**
 * API Configuration Schema
 */
const apiSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('https://api.ainative.studio'),
  NEXT_PUBLIC_API_URL: z.string().url().default('https://api.ainative.studio'),
  NEXT_PUBLIC_API_TIMEOUT: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().min(1000).max(60000)
  ).default('15000'),
});

/**
 * Stripe Configuration Schema
 *
 * Required for payment processing
 */
const stripeSchema = z.object({
  // Client-side publishable key
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', {
    message: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_'
  }).optional(),

  // Server-side secret key
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', {
    message: 'STRIPE_SECRET_KEY must start with sk_'
  }).optional(),

  // Webhook secret
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', {
    message: 'STRIPE_WEBHOOK_SECRET must start with whsec_'
  }).optional(),
});

/**
 * External Services Configuration Schema
 */
const servicesSchema = z.object({
  // Strapi CMS
  NEXT_PUBLIC_STRAPI_URL: z.string().url().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-', {
    message: 'OPENAI_API_KEY must start with sk-'
  }).optional(),

  // Anthropic Claude
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', {
    message: 'ANTHROPIC_API_KEY must start with sk-ant-'
  }).optional(),

  // ZeroDB
  ZERODB_API_URL: z.string().url().optional(),
  ZERODB_API_KEY: z.string().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Luma Events
  NEXT_PUBLIC_LUMA_API_URL: z.string().url().optional(),
  LUMA_API_KEY: z.string().optional(),
});

/**
 * Analytics Configuration Schema
 */
const analyticsSchema = z.object({
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN: z.string().optional(),
  NEXT_PUBLIC_CHATWOOT_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
});

/**
 * Feature Flags Schema
 */
const featureFlagsSchema = z.object({
  NEXT_PUBLIC_ENABLE_AI_FEATURES: z.string().transform((val) => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES: z.string().transform((val) => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: z.string().transform((val) => val === 'true').default('false'),
});

/**
 * Rate Limiting Configuration Schema
 */
const rateLimitingSchema = z.object({
  RATE_LIMITING_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  RATE_LIMIT_WHITELIST_IPS: z.string().default('127.0.0.1,::1,localhost'),
  RATE_LIMIT_ABUSE_THRESHOLD: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().min(1)
  ).default('10'),
  RATE_LIMIT_ABUSE_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().min(1000)
  ).default('3600000'),
  RATE_LIMIT_BLOCK_DURATION_MS: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().min(1000)
  ).default('86400000'),
});

/**
 * Complete Environment Schema
 *
 * Combines all configuration schemas into a single validation schema
 */
export const envSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  ...nextAuthSchema.shape,
  ...databaseSchema.shape,
  ...apiSchema.shape,
  ...stripeSchema.shape,
  ...servicesSchema.shape,
  ...analyticsSchema.shape,
  ...featureFlagsSchema.shape,
  ...rateLimitingSchema.shape,
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validation Result Type
 */
export interface ValidationResult {
  success: boolean;
  data?: Env;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

/**
 * Validates environment variables against the schema
 *
 * @param env - Environment variables object (defaults to process.env)
 * @returns Validation result with typed data or detailed errors
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): ValidationResult {
  const result = envSchema.safeParse(env);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error.errors.map((err) => ({
      path: err.path.map(String),
      message: err.message,
    })),
  };
}

/**
 * Validates and returns environment variables, throwing on failure
 *
 * Use this at application startup to fail fast with clear error messages
 *
 * @param env - Environment variables object (defaults to process.env)
 * @returns Typed and validated environment variables
 * @throws Error with detailed validation errors
 */
export function getValidatedEnv(env: NodeJS.ProcessEnv = process.env): Env {
  const result = validateEnv(env);

  if (!result.success) {
    const errorMessages = result.errors!.map(
      (err) => `  - ${err.path.join('.')}: ${err.message}`
    ).join('\n');

    throw new Error(
      `Environment variable validation failed:\n\n${errorMessages}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.\n` +
      `Refer to .env.example for the complete list of configuration options.`
    );
  }

  return result.data!;
}

/**
 * Validates critical production-only requirements
 *
 * @param env - Environment variables object
 * @returns Array of critical warnings/errors
 */
export function validateProductionRequirements(env: NodeJS.ProcessEnv = process.env): string[] {
  const warnings: string[] = [];

  if (env.NODE_ENV === 'production') {
    // NextAuth secret must be explicitly set (not generated)
    if (!env.NEXTAUTH_SECRET) {
      warnings.push('CRITICAL: NEXTAUTH_SECRET is not set. This will cause authentication to fail in production.');
    }

    // Database must be configured
    if (!env.DATABASE_URL) {
      warnings.push('CRITICAL: DATABASE_URL is not set. Database sessions will not work.');
    }

    // NextAuth URL must be production URL
    if (env.NEXTAUTH_URL?.includes('localhost')) {
      warnings.push('WARNING: NEXTAUTH_URL contains localhost. OAuth callbacks will fail in production.');
    }

    // GitHub OAuth should be configured if provider is enabled
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      warnings.push('WARNING: GitHub OAuth credentials not set. GitHub login will not work.');
    }

    // Stripe should be configured for payments
    if (!env.STRIPE_SECRET_KEY) {
      warnings.push('WARNING: Stripe is not configured. Payment features will not work.');
    }

    // HTTPS check for secure cookies
    if (env.NEXTAUTH_URL && !env.NEXTAUTH_URL.startsWith('https://')) {
      warnings.push('WARNING: NEXTAUTH_URL does not use HTTPS. Secure cookies will not work properly.');
    }
  }

  return warnings;
}

/**
 * Generates a secure random secret for NextAuth
 *
 * Use this only for local development. Production secrets should be
 * generated offline and stored securely.
 *
 * @returns Base64-encoded random secret (32 bytes)
 */
export function generateNextAuthSecret(): string {
  if (typeof window !== 'undefined') {
    throw new Error('generateNextAuthSecret() can only be called server-side');
  }

  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Prints environment configuration status to console
 *
 * Useful for debugging and verifying configuration at startup
 */
export function printEnvStatus(): void {
  console.log('\n=== Environment Configuration Status ===\n');

  const result = validateEnv();

  if (result.success) {
    console.log('✓ All required environment variables are valid\n');

    // Print production warnings if any
    const warnings = validateProductionRequirements();
    if (warnings.length > 0) {
      console.log('⚠️  Production Warnings:\n');
      warnings.forEach((warning) => console.log(`  ${warning}`));
      console.log('');
    }

    // Print configuration summary
    console.log('Configuration Summary:');
    console.log(`  - Environment: ${process.env.NODE_ENV}`);
    console.log(`  - NextAuth URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`);
    console.log(`  - Database: ${process.env.DATABASE_URL ? 'CONFIGURED' : 'NOT SET'}`);
    console.log(`  - GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? 'ENABLED' : 'DISABLED'}`);
    console.log(`  - Stripe: ${process.env.STRIPE_SECRET_KEY ? 'ENABLED' : 'DISABLED'}`);
    console.log('');
  } else {
    console.error('✗ Environment validation failed:\n');
    result.errors!.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\nPlease fix these errors before starting the application.\n');
    process.exit(1);
  }
}
