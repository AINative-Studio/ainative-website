/**
 * Environment Variable Schema Validation
 *
 * This file defines the schema for environment variables across all environments.
 * It uses Zod for runtime validation to catch configuration errors early.
 *
 * Usage:
 *   import { validateEnvironment } from '@/config/environment.schema';
 *   validateEnvironment(); // Throws if validation fails
 */

import { z } from 'zod';

// Helper schemas for common patterns
const UrlSchema = z.string().url();
const PositiveIntSchema = z.coerce.number().int().positive();
const BooleanSchema = z.coerce.boolean();
const EmailSchema = z.string().email();

// Base schema shared across all environments
const BaseEnvironmentSchema = z.object({
  // ============================================
  // Node Environment
  // ============================================
  NODE_ENV: z.enum(['development', 'test', 'production']),

  // ============================================
  // API Configuration
  // ============================================
  NEXT_PUBLIC_API_BASE_URL: UrlSchema.describe('Main API endpoint'),
  NEXT_PUBLIC_API_URL: UrlSchema.describe('API URL (legacy compatibility)'),
  NEXT_PUBLIC_API_TIMEOUT: PositiveIntSchema
    .min(1000)
    .max(60000)
    .default(15000)
    .describe('API request timeout in milliseconds'),
  NEXT_PUBLIC_ENVIRONMENT: z
    .enum(['development', 'staging', 'production'])
    .describe('Environment identifier'),

  // ============================================
  // Stripe Payment Configuration
  // ============================================
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .startsWith('pk_')
    .describe('Stripe publishable key (client-side safe)'),
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_')
    .optional()
    .describe('Stripe secret key (server-side only)'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_')
    .optional()
    .describe('Stripe webhook secret (server-side only)'),

  // ============================================
  // QNN Configuration
  // ============================================
  NEXT_PUBLIC_QNN_API_URL: UrlSchema.optional().describe('QNN API endpoint'),
  NEXT_PUBLIC_QNN_API_TIMEOUT: PositiveIntSchema.default(30000).optional(),
  NEXT_PUBLIC_QNN_POLLING_INTERVAL: PositiveIntSchema.default(5000).optional(),
  NEXT_PUBLIC_QNN_MAX_RETRIES: PositiveIntSchema.default(3).optional(),
  NEXT_PUBLIC_QNN_ENABLE_POLLING: BooleanSchema.default(true).optional(),

  // ============================================
  // Strapi CMS Configuration
  // ============================================
  NEXT_PUBLIC_STRAPI_URL: UrlSchema.optional().describe('Strapi CMS API endpoint'),

  // ============================================
  // Authentication Configuration (NextAuth.js)
  // ============================================
  NEXTAUTH_URL: UrlSchema.describe('NextAuth callback URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32)
    .describe('NextAuth secret (minimum 32 characters)'),

  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().optional().describe('GitHub OAuth client ID'),
  GITHUB_CLIENT_SECRET: z.string().optional().describe('GitHub OAuth client secret'),

  // Legacy JWT Configuration
  JWT_SECRET: z
    .string()
    .min(32)
    .optional()
    .describe('JWT secret (legacy, minimum 32 characters)'),
  JWT_EXPIRES_IN: z.string().default('15m').optional(),
  REFRESH_TOKEN_SECRET: z.string().min(32).optional(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d').optional(),

  // ============================================
  // Database Configuration
  // ============================================
  DATABASE_URL: z
    .string()
    .startsWith('postgresql://')
    .optional()
    .describe('PostgreSQL connection string'),
  DATABASE_POOL_SIZE: PositiveIntSchema.min(5).max(50).default(10).optional(),

  // Redis Configuration
  REDIS_URL: z
    .string()
    .startsWith('redis://')
    .optional()
    .describe('Redis connection string'),

  // ============================================
  // External Services
  // ============================================
  OPENAI_API_KEY: z
    .string()
    .startsWith('sk-')
    .optional()
    .describe('OpenAI API key'),
  ANTHROPIC_API_KEY: z
    .string()
    .startsWith('sk-ant-')
    .optional()
    .describe('Anthropic Claude API key'),
  ZERODB_API_URL: UrlSchema.optional().describe('ZeroDB API endpoint'),
  ZERODB_API_KEY: z.string().optional().describe('ZeroDB API key'),

  // ============================================
  // Luma Events API
  // ============================================
  NEXT_PUBLIC_LUMA_API_URL: UrlSchema.optional(),
  LUMA_API_KEY: z.string().optional(),

  // ============================================
  // Analytics & Monitoring
  // ============================================
  NEXT_PUBLIC_ENABLE_ANALYTICS: BooleanSchema.default(true).optional(),
  NEXT_PUBLIC_GA_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/)
    .optional()
    .describe('Google Analytics 4 ID'),
  NEXT_PUBLIC_GTM_ID: z
    .string()
    .regex(/^GTM-[A-Z0-9]+$/)
    .optional()
    .describe('Google Tag Manager ID'),
  NEXT_PUBLIC_META_PIXEL_ID: z
    .string()
    .regex(/^\d{15,16}$/)
    .optional()
    .describe('Meta (Facebook) Pixel ID'),
  NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN: z.string().optional(),
  NEXT_PUBLIC_CHATWOOT_BASE_URL: UrlSchema.optional(),
  NEXT_PUBLIC_SENTRY_DSN: UrlSchema.optional().describe('Sentry error tracking DSN'),
  SENTRY_AUTH_TOKEN: z.string().optional().describe('Sentry auth token for uploads'),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // ============================================
  // Feature Flags
  // ============================================
  NEXT_PUBLIC_ENABLE_AI_FEATURES: BooleanSchema.default(true).optional(),
  NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES: BooleanSchema.default(false).optional(),
  NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES: BooleanSchema.default(false).optional(),
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: BooleanSchema.default(false).optional(),

  // ============================================
  // Email Configuration
  // ============================================
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: PositiveIntSchema.optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: EmailSchema.optional(),
  FROM_NAME: z.string().optional(),

  // ============================================
  // AWS S3 Storage
  // ============================================
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1').optional(),
  S3_BUCKET_NAME: z.string().optional(),

  // ============================================
  // Rate Limiting Configuration
  // ============================================
  RATE_LIMITING_ENABLED: BooleanSchema.default(true).optional(),
  RATE_LIMIT_WHITELIST_IPS: z.string().default('127.0.0.1,::1,localhost').optional(),
  RATE_LIMIT_ABUSE_THRESHOLD: PositiveIntSchema.default(10).optional(),
  RATE_LIMIT_ABUSE_WINDOW_MS: PositiveIntSchema.default(3600000).optional(),
  RATE_LIMIT_BLOCK_DURATION_MS: PositiveIntSchema.default(86400000).optional(),

  // ============================================
  // Redis for Rate Limiting (Upstash)
  // ============================================
  UPSTASH_REDIS_REST_URL: UrlSchema.optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// Development environment schema (most relaxed)
const DevelopmentEnvironmentSchema = BaseEnvironmentSchema.partial({
  // In development, most external services are optional
  OPENAI_API_KEY: true,
  ANTHROPIC_API_KEY: true,
  DATABASE_URL: true,
  REDIS_URL: true,
  STRIPE_SECRET_KEY: true,
  STRIPE_WEBHOOK_SECRET: true,
});

// Staging environment schema (moderate requirements)
const StagingEnvironmentSchema = BaseEnvironmentSchema.extend({
  NEXT_PUBLIC_ENVIRONMENT: z.literal('staging'),
  // Staging should have database and redis
  DATABASE_URL: z.string().startsWith('postgresql://'),
  REDIS_URL: z.string().startsWith('redis://'),
  // Staging should use test Stripe keys
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_test_'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_test_'),
  // Monitoring is optional in staging
  NEXT_PUBLIC_SENTRY_DSN: UrlSchema.optional(),
});

// Production environment schema (strictest requirements)
const ProductionEnvironmentSchema = BaseEnvironmentSchema.extend({
  NODE_ENV: z.literal('production'),
  NEXT_PUBLIC_ENVIRONMENT: z.literal('production'),

  // Production requires all critical services
  DATABASE_URL: z.string().startsWith('postgresql://'),
  REDIS_URL: z.string().startsWith('redis://'),

  // Production requires live Stripe keys
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_live_'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_live_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Production requires AI API keys
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),

  // Production requires monitoring
  NEXT_PUBLIC_SENTRY_DSN: UrlSchema.describe('Sentry is required in production'),
  NEXT_PUBLIC_GA_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/)
    .describe('Google Analytics is required in production'),

  // Production requires email configuration
  SMTP_HOST: z.string(),
  SMTP_PORT: PositiveIntSchema,
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  FROM_EMAIL: EmailSchema,
});

// Export schema map
export const EnvironmentSchemas = {
  development: DevelopmentEnvironmentSchema,
  staging: StagingEnvironmentSchema,
  production: ProductionEnvironmentSchema,
  test: DevelopmentEnvironmentSchema, // Test uses same as development
} as const;

// Type exports for TypeScript
export type Environment = keyof typeof EnvironmentSchemas;
export type ValidatedEnvironment = z.infer<typeof ProductionEnvironmentSchema>;

/**
 * Validate environment variables against the appropriate schema
 *
 * @param env - Environment to validate (defaults to NEXT_PUBLIC_ENVIRONMENT or NODE_ENV)
 * @throws {Error} If validation fails
 * @returns Validated and typed environment object
 */
export function validateEnvironment(
  env?: Environment
): ValidatedEnvironment {
  const environment = (
    env ||
    process.env.NEXT_PUBLIC_ENVIRONMENT ||
    process.env.NODE_ENV ||
    'development'
  ) as Environment;

  const schema = EnvironmentSchemas[environment];

  if (!schema) {
    throw new Error(
      `Unknown environment: ${environment}. Must be one of: ${Object.keys(EnvironmentSchemas).join(', ')}`
    );
  }

  try {
    const validated = schema.parse(process.env);
    console.log(`✓ Environment validation passed for: ${environment}`);
    return validated as ValidatedEnvironment;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`✗ Environment validation failed for: ${environment}`);
      console.error('\nValidation errors:');

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  - ${path}: ${err.message}`);
      });

      throw new Error(
        `Environment validation failed. Please fix the configuration errors above.`
      );
    }

    throw error;
  }
}

/**
 * Get a typed environment variable
 * Throws if validation fails
 */
export function getValidatedEnv(): ValidatedEnvironment {
  return validateEnvironment();
}

/**
 * Check if an environment variable is defined (without validation)
 */
export function hasEnvVar(key: string): boolean {
  return process.env[key] !== undefined && process.env[key] !== '';
}

/**
 * Compare .env.example structure with current environment
 * Returns missing and extra variables
 */
export function detectConfigurationDrift(): {
  missing: string[];
  extra: string[];
  mismatched: Array<{ key: string; expected: string; actual: string }>;
} {
  // This would be implemented to read .env.example and compare with process.env
  // For now, returning empty arrays as placeholder
  return {
    missing: [],
    extra: [],
    mismatched: [],
  };
}

// Validate on module load in production
if (process.env.NODE_ENV === 'production') {
  validateEnvironment('production');
}
