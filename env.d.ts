/**
 * TypeScript declarations for environment variables.
 *
 * This file extends the ProcessEnv interface to provide type safety
 * when accessing environment variables directly via process.env.
 *
 * Note: For validated access, prefer using the `env` and `serverEnv`
 * exports from `@/lib/env` which provide runtime validation.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // ===========================================
    // Client-side variables (NEXT_PUBLIC_*)
    // ===========================================

    // API Configuration
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_API_TIMEOUT?: string;
    NEXT_PUBLIC_ENVIRONMENT?: "development" | "staging" | "production";

    // Stripe (public key)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;

    // QNN Configuration
    NEXT_PUBLIC_QNN_API_URL?: string;
    NEXT_PUBLIC_QNN_API_TIMEOUT?: string;
    NEXT_PUBLIC_QNN_POLLING_INTERVAL?: string;
    NEXT_PUBLIC_QNN_MAX_RETRIES?: string;
    NEXT_PUBLIC_QNN_ENABLE_POLLING?: string;

    // Strapi CMS
    NEXT_PUBLIC_STRAPI_URL?: string;

    // GitHub OAuth
    NEXT_PUBLIC_GITHUB_CLIENT_ID?: string;

    // Luma Events
    NEXT_PUBLIC_LUMA_API_URL?: string;

    // Analytics & Monitoring
    NEXT_PUBLIC_ENABLE_ANALYTICS?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;

    // Feature Flags
    NEXT_PUBLIC_ENABLE_AI_FEATURES?: string;
    NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES?: string;
    NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES?: string;
    NEXT_PUBLIC_ENABLE_BETA_FEATURES?: string;

    // ===========================================
    // Server-side variables (no NEXT_PUBLIC_*)
    // ===========================================

    // Stripe secrets
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    // Database
    DATABASE_URL?: string;
    DATABASE_POOL_SIZE?: string;
    REDIS_URL?: string;

    // Authentication
    GITHUB_CLIENT_SECRET?: string;
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    REFRESH_TOKEN_SECRET?: string;
    REFRESH_TOKEN_EXPIRES_IN?: string;

    // External Services
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    ZERODB_API_URL?: string;
    ZERODB_API_KEY?: string;
    LUMA_API_KEY?: string;

    // Sentry
    SENTRY_AUTH_TOKEN?: string;

    // Email
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    FROM_EMAIL?: string;
    FROM_NAME?: string;

    // AWS S3
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;
    S3_BUCKET_NAME?: string;
  }
}
