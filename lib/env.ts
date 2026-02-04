import { z } from "zod";

/**
 * Environment variable validation using Zod schemas.
 *
 * This module validates environment variables at build time and runtime,
 * ensuring all required variables are present and correctly typed.
 *
 * Usage:
 * - Import `env` for validated client-side variables
 * - Import `serverEnv` for server-side only variables (API routes, server components)
 */

// ===========================================
// Client-side Environment Variables Schema
// ===========================================
// These are exposed to the browser (NEXT_PUBLIC_* prefix)

const clientEnvSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("https://api.ainative.studio"),
  NEXT_PUBLIC_API_URL: z.string().url().default("https://api.ainative.studio"),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().default(15000),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(["development", "staging", "production"]).default("development"),

  // Stripe (public key only)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),

  // QNN Configuration
  NEXT_PUBLIC_QNN_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_QNN_API_TIMEOUT: z.coerce.number().default(30000),
  NEXT_PUBLIC_QNN_POLLING_INTERVAL: z.coerce.number().default(5000),
  NEXT_PUBLIC_QNN_MAX_RETRIES: z.coerce.number().default(3),
  NEXT_PUBLIC_QNN_ENABLE_POLLING: z.coerce.boolean().default(true),

  // Strapi CMS
  NEXT_PUBLIC_STRAPI_URL: z.string().url().optional(),

  // GitHub OAuth (client ID only)
  NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string().optional(),

  // Luma Events
  NEXT_PUBLIC_LUMA_API_URL: z.string().url().optional(),

  // Analytics & Monitoring
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_AI_FEATURES: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API: z.coerce.boolean().default(false),
});

// ===========================================
// Server-side Environment Variables Schema
// ===========================================
// These are NEVER exposed to the browser (no NEXT_PUBLIC_* prefix)

const serverEnvSchema = z.object({
  // Stripe secrets (preprocess to handle empty strings)
  STRIPE_SECRET_KEY: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().startsWith("sk_").optional()
  ),
  STRIPE_WEBHOOK_SECRET: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().startsWith("whsec_").optional()
  ),

  // Database
  DATABASE_URL: z.string().optional(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  REDIS_URL: z.string().optional(),

  // Authentication
  GITHUB_CLIENT_SECRET: z.string().optional(),
  JWT_SECRET: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().min(32).optional()
  ),
  JWT_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().min(32).optional()
  ),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),

  // External Services
  // Skip validation if not set or is placeholder - actual validation happens when key is used
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ZERODB_API_URL: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().url().optional()
  ),
  ZERODB_API_KEY: z.string().optional(),
  LUMA_API_KEY: z.string().optional(),

  // Sentry
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : val),
    z.string().email().optional()
  ),
  FROM_NAME: z.string().optional(),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  S3_BUCKET_NAME: z.string().optional(),
});

// ===========================================
// Environment Parsing
// ===========================================

/**
 * Validated client-side environment variables.
 * Safe to use in client components and browser code.
 */
export const env = clientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_QNN_API_URL: process.env.NEXT_PUBLIC_QNN_API_URL,
  NEXT_PUBLIC_QNN_API_TIMEOUT: process.env.NEXT_PUBLIC_QNN_API_TIMEOUT,
  NEXT_PUBLIC_QNN_POLLING_INTERVAL: process.env.NEXT_PUBLIC_QNN_POLLING_INTERVAL,
  NEXT_PUBLIC_QNN_MAX_RETRIES: process.env.NEXT_PUBLIC_QNN_MAX_RETRIES,
  NEXT_PUBLIC_QNN_ENABLE_POLLING: process.env.NEXT_PUBLIC_QNN_ENABLE_POLLING,
  NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
  NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  NEXT_PUBLIC_LUMA_API_URL: process.env.NEXT_PUBLIC_LUMA_API_URL,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_ENABLE_AI_FEATURES: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES,
  NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES: process.env.NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES,
  NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES: process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES,
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES,
  NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS_API,
});

/**
 * Validated server-side environment variables.
 * Only use in API routes, server components, or server actions.
 * These will throw if accessed on the client side.
 */
export const serverEnv = (() => {
  // Only parse server env on the server side
  if (typeof window !== "undefined") {
    throw new Error(
      "serverEnv should only be used on the server side. " +
      "Use `env` for client-side environment variables."
    );
  }

  return serverEnvSchema.parse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_POOL_SIZE: process.env.DATABASE_POOL_SIZE,
    REDIS_URL: process.env.REDIS_URL,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ZERODB_API_URL: process.env.ZERODB_API_URL,
    ZERODB_API_KEY: process.env.ZERODB_API_KEY,
    LUMA_API_KEY: process.env.LUMA_API_KEY,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL,
    FROM_NAME: process.env.FROM_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  });
})();

// ===========================================
// Type Exports
// ===========================================

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
