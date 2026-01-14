/**
 * Environment Variable Validation Utility
 *
 * Validates all required environment variables and provides helpful error messages
 * when configuration is missing or invalid. This prevents runtime errors and
 * improves debugging experience.
 *
 * Adapted for Next.js environment patterns (NEXT_PUBLIC_ prefix for client-side vars)
 */

interface EnvironmentConfig {
  // API Configuration
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_API_TIMEOUT: string;

  // Authentication
  NEXT_PUBLIC_GITHUB_CLIENT_ID: string;

  // Payment Processing
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;

  // Environment
  NEXT_PUBLIC_ENVIRONMENT: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvironmentConfig>;
}

/**
 * Validates that all required environment variables are properly configured
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Partial<EnvironmentConfig> = {};

  // Required environment variables (only truly critical ones)
  const requiredVars: string[] = [
    // Only include truly critical vars that prevent the app from starting
    // 'NEXT_PUBLIC_GITHUB_CLIENT_ID', // Moving to optional with warning
  ];

  // Optional environment variables with defaults
  const optionalVars = [
    { key: 'NEXT_PUBLIC_API_URL', defaultValue: 'https://api.ainative.studio' },
    { key: 'NEXT_PUBLIC_API_BASE_URL', defaultValue: process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio' },
    { key: 'NEXT_PUBLIC_API_TIMEOUT', defaultValue: '10000' },
    { key: 'NEXT_PUBLIC_GITHUB_CLIENT_ID', defaultValue: 'Iv1.dev_placeholder_client_id' },
    { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', defaultValue: 'pk_test_placeholder' },
    { key: 'NEXT_PUBLIC_ENVIRONMENT', defaultValue: 'development' },
  ];

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    } else {
      config[varName as keyof EnvironmentConfig] = value;
    }
  }

  // Check optional variables and set defaults
  for (const { key, defaultValue } of optionalVars) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      config[key as keyof EnvironmentConfig] = defaultValue;
      warnings.push(`Using default value for ${key}: ${defaultValue}`);
    } else {
      config[key as keyof EnvironmentConfig] = value;
    }
  }

  // Validate specific values
  validateApiUrl(config.NEXT_PUBLIC_API_URL, errors);
  validateGitHubClientId(config.NEXT_PUBLIC_GITHUB_CLIENT_ID, errors);
  validateStripeKeys(config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, warnings);
  validateEnvironmentType(config.NEXT_PUBLIC_ENVIRONMENT, warnings);
  validateTimeout(config.NEXT_PUBLIC_API_TIMEOUT, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Validates API URL format
 */
export function validateApiUrl(url: string | undefined, errors: string[]): void {
  if (!url) return;

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      errors.push(`NEXT_PUBLIC_API_URL must use http or https protocol, got: ${parsedUrl.protocol}`);
    }
    if (parsedUrl.hostname === 'localhost' && process.env.NODE_ENV === 'production') {
      errors.push('NEXT_PUBLIC_API_URL should not use localhost in production');
    }
  } catch (error) {
    errors.push(`NEXT_PUBLIC_API_URL is not a valid URL: ${url}`);
  }
}

/**
 * Validates GitHub Client ID format
 */
function validateGitHubClientId(clientId: string | undefined, errors: string[]): void {
  if (!clientId) return;

  // Check for obvious placeholder values
  if (clientId.includes('placeholder') || clientId.includes('your_') || clientId.includes('here')) {
    // Use warning instead of error for placeholder values
    console.warn(`⚠️ NEXT_PUBLIC_GITHUB_CLIENT_ID appears to be a placeholder value: ${clientId}`);
    console.warn('   GitHub OAuth features may not work correctly. Update with a real GitHub client ID for production.');
    return;
  }

  // GitHub OAuth App client IDs typically start with specific patterns
  if (!/^(Iv|Ov)\w{16,}$/.test(clientId)) {
    console.warn(`⚠️ NEXT_PUBLIC_GITHUB_CLIENT_ID may be invalid: ${clientId}`);
    console.warn('   GitHub client IDs typically start with "Iv" or "Ov" and are 20+ characters long.');
    console.warn('   If this is a valid client ID, you can ignore this warning.');
  }
}

/**
 * Validates Stripe publishable key format
 */
export function validateStripeKeys(key: string | undefined, warnings: string[]): void {
  if (!key) return;

  if (key === 'pk_test_placeholder') {
    warnings.push('Using placeholder Stripe key - payment processing will not work');
    return;
  }

  if (!key.startsWith('pk_')) {
    warnings.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with "pk_"');
  }

  if (key.startsWith('pk_test_') && process.env.NODE_ENV === 'production') {
    warnings.push(`⚠️ WARNING: Using Stripe TEST key in production! Update Vercel env var NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to use a LIVE key (pk_live_...)\nCurrent key: ${key.substring(0, 20)}...`);
  } else if (key.startsWith('pk_live_') && process.env.NODE_ENV !== 'production') {
    warnings.push(`⚠️ WARNING: Using Stripe LIVE key in development! Consider using a TEST key (pk_test_...) for safety\nCurrent key: ${key.substring(0, 20)}...`);
  }
}

/**
 * Validates environment value
 */
function validateEnvironmentType(env: string | undefined, warnings: string[]): void {
  if (!env) return;

  const validEnvironments = ['development', 'staging', 'production'];
  const trimmedEnv = env.trim().toLowerCase();

  // Check if environment is valid (case-insensitive, trimmed)
  if (!validEnvironments.includes(trimmedEnv)) {
    warnings.push(`⚠️ NEXT_PUBLIC_ENVIRONMENT should be one of: ${validEnvironments.join(', ')}\nGot: "${env}" (with ${env.length - trimmedEnv.length} extra characters - check for whitespace)`);
  } else if (env !== trimmedEnv) {
    // Valid environment but has case or whitespace issues
    warnings.push(`⚠️ NEXT_PUBLIC_ENVIRONMENT has incorrect formatting. Got: "${env}"\nShould be: "${trimmedEnv}" (lowercase, no whitespace)`);
  }
}

/**
 * Validates API timeout value
 */
function validateTimeout(timeout: string | undefined, warnings: string[]): void {
  if (!timeout) return;

  const timeoutMs = parseInt(timeout, 10);
  if (isNaN(timeoutMs)) {
    warnings.push(`NEXT_PUBLIC_API_TIMEOUT should be a number in milliseconds, got: ${timeout}`);
  } else if (timeoutMs < 1000) {
    warnings.push('NEXT_PUBLIC_API_TIMEOUT is very low (< 1 second) - this may cause timeout errors');
  } else if (timeoutMs > 60000) {
    warnings.push('NEXT_PUBLIC_API_TIMEOUT is very high (> 60 seconds) - this may cause poor user experience');
  }
}

/**
 * Gets a required environment variable with type safety
 * Throws an error if the variable is not defined
 */
export function getRequiredEnvVar(key: keyof EnvironmentConfig): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

/**
 * Gets an optional environment variable with a fallback value
 */
export function getOptionalEnvVar(key: keyof EnvironmentConfig, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Logs the current environment status to the console
 * Useful for debugging and verifying configuration
 */
export function logEnvStatus(): void {
  const validation = validateEnv();

  if (!validation.isValid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (validation.isValid && validation.warnings.length === 0) {
    console.log('✅ Environment validation passed');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Environment configuration:', {
      API_URL: validation.config.NEXT_PUBLIC_API_URL,
      ENVIRONMENT: validation.config.NEXT_PUBLIC_ENVIRONMENT,
      GITHUB_CLIENT_ID: validation.config.NEXT_PUBLIC_GITHUB_CLIENT_ID?.substring(0, 10) + '...',
      STRIPE_KEY: validation.config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) + '...',
    });
  }
}

/**
 * Initialize and validate environment on application startup
 * This function should be called early in the application lifecycle
 */
export function initializeEnvironment(): void {
  const validation = validateEnv();

  if (!validation.isValid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));

    // In development, show helpful error message and throw
    if (process.env.NODE_ENV === 'development') {
      const errorMessage = `
Environment Configuration Error:

${validation.errors.join('\n')}

Please check your .env.local file and ensure all required variables are set.
See .env.example for required configuration.
      `.trim();

      throw new Error(errorMessage);
    }

    // In production, log errors but don't throw to prevent app from crashing
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Production app starting with environment validation errors. Some features may not work correctly.');
    }
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Environment validation passed');
    console.log('Environment configuration:', {
      API_URL: validation.config.NEXT_PUBLIC_API_URL,
      ENVIRONMENT: validation.config.NEXT_PUBLIC_ENVIRONMENT,
      GITHUB_CLIENT_ID: validation.config.NEXT_PUBLIC_GITHUB_CLIENT_ID?.substring(0, 10) + '...',
      STRIPE_KEY: validation.config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) + '...',
    });
  }
}
