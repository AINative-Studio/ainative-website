/**
 * Environment Variable Validation Tests
 *
 * These tests ensure all required environment variables are:
 * - Defined in .env.example
 * - Have correct format/pattern
 * - Are validated before deployment
 * - Meet security requirements
 *
 * Prevents: "Environment variable X is not defined" errors in production
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface EnvVariable {
  name: string;
  required: boolean;
  pattern?: RegExp;
  description: string;
  serverSideOnly?: boolean;
}

/**
 * Registry of all environment variables with validation rules
 */
const ENV_REGISTRY: EnvVariable[] = [
  // API Configuration
  {
    name: 'NEXT_PUBLIC_API_BASE_URL',
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'Main API endpoint URL'
  },
  {
    name: 'NEXT_PUBLIC_API_URL',
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'API URL (alias)'
  },

  // NextAuth Configuration
  {
    name: 'NEXTAUTH_URL',
    required: true,
    pattern: /^https?:\/\/.+/,
    description: 'NextAuth callback URL'
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    pattern: /.{32,}/,
    description: 'NextAuth JWT secret (min 32 chars)',
    serverSideOnly: true
  },

  // OAuth Providers
  {
    name: 'GITHUB_CLIENT_ID',
    required: false,
    description: 'GitHub OAuth client ID'
  },
  {
    name: 'GITHUB_CLIENT_SECRET',
    required: false,
    pattern: /.{20,}/,
    description: 'GitHub OAuth client secret',
    serverSideOnly: true
  },

  // Stripe Configuration
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    pattern: /^pk_(test|live)_.+/,
    description: 'Stripe publishable key'
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    pattern: /^sk_(test|live)_.+/,
    description: 'Stripe secret key',
    serverSideOnly: true
  },

  // Database
  {
    name: 'DATABASE_URL',
    required: true,
    pattern: /^postgresql:\/\/.+/,
    description: 'PostgreSQL connection string',
    serverSideOnly: true
  },

  // External Services
  {
    name: 'NEXT_PUBLIC_STRAPI_URL',
    required: false,
    pattern: /^https?:\/\/.+/,
    description: 'Strapi CMS URL'
  },

  // Analytics
  {
    name: 'NEXT_PUBLIC_GA_ID',
    required: false,
    pattern: /^G-.+/,
    description: 'Google Analytics ID'
  }
];

describe('Environment Validation - Example File', () => {
  const envExamplePath = join(__dirname, '../../.env.example');
  let envExampleContent: string;

  beforeAll(() => {
    envExampleContent = readFileSync(envExamplePath, 'utf-8');
  });

  it('should have .env.example file', () => {
    expect(envExampleContent).toBeTruthy();
  });

  describe('Required Variables in .env.example', () => {
    ENV_REGISTRY.filter(v => v.required).forEach(envVar => {
      it(`should document ${envVar.name}`, () => {
        expect(envExampleContent).toContain(envVar.name);
      });
    });
  });

  it('should not contain real secrets in .env.example', () => {
    const suspiciousPatterns = [
      /sk_live_[a-zA-Z0-9]{24,}/,  // Live Stripe key
      /sk_test_[a-zA-Z0-9]{24,}(?!your)/,  // Real test Stripe key
      /ghp_[a-zA-Z0-9]{36}/,  // GitHub personal access token
      /AKIA[0-9A-Z]{16}/,  // AWS access key
      /postgres:\/\/.*:.*@.*postgresql/  // Real DB credentials
    ];

    suspiciousPatterns.forEach(pattern => {
      expect(envExampleContent).not.toMatch(pattern);
    });
  });
});

describe('Environment Validation - Format Validation', () => {
  /**
   * Validates environment variable format
   */
  function validateEnvVar(envVar: EnvVariable, value: string | undefined): {
    valid: boolean;
    error?: string;
  } {
    if (!value) {
      if (envVar.required) {
        return { valid: false, error: `${envVar.name} is required but not set` };
      }
      return { valid: true };
    }

    if (envVar.pattern && !envVar.pattern.test(value)) {
      return {
        valid: false,
        error: `${envVar.name} has invalid format. Expected: ${envVar.description}`
      };
    }

    return { valid: true };
  }

  describe('URL Format Validation', () => {
    it('should validate API URL format', () => {
      const validUrls = [
        'https://api.ainative.studio',
        'http://localhost:3000',
        'https://staging-api.example.com'
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://invalid.com',
        'api.example.com',  // Missing protocol
        ''
      ];

      const envVar = ENV_REGISTRY.find(v => v.name === 'NEXT_PUBLIC_API_URL')!;

      validUrls.forEach(url => {
        const result = validateEnvVar(envVar, url);
        expect(result.valid).toBe(true);
      });

      invalidUrls.forEach(url => {
        const result = validateEnvVar(envVar, url);
        expect(result.valid).toBe(false);
      });
    });

    it('should validate NextAuth secret length', () => {
      const envVar = ENV_REGISTRY.find(v => v.name === 'NEXTAUTH_SECRET')!;

      // Valid: 32+ characters
      expect(validateEnvVar(envVar, 'a'.repeat(32)).valid).toBe(true);
      expect(validateEnvVar(envVar, 'a'.repeat(64)).valid).toBe(true);

      // Invalid: < 32 characters
      expect(validateEnvVar(envVar, 'short').valid).toBe(false);
      expect(validateEnvVar(envVar, 'a'.repeat(31)).valid).toBe(false);
    });

    it('should validate Stripe key format', () => {
      const pubKeyVar = ENV_REGISTRY.find(v => v.name === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')!;
      const secretKeyVar = ENV_REGISTRY.find(v => v.name === 'STRIPE_SECRET_KEY')!;

      // Valid publishable keys
      expect(validateEnvVar(pubKeyVar, 'pk_test_51234567890abcdef').valid).toBe(true);
      expect(validateEnvVar(pubKeyVar, 'pk_live_51234567890abcdef').valid).toBe(true);

      // Invalid publishable keys
      expect(validateEnvVar(pubKeyVar, 'sk_test_51234567890abcdef').valid).toBe(false);
      expect(validateEnvVar(pubKeyVar, 'invalid_key').valid).toBe(false);

      // Valid secret keys
      expect(validateEnvVar(secretKeyVar, 'sk_test_51234567890abcdef').valid).toBe(true);
      expect(validateEnvVar(secretKeyVar, 'sk_live_51234567890abcdef').valid).toBe(true);

      // Invalid secret keys
      expect(validateEnvVar(secretKeyVar, 'pk_test_51234567890abcdef').valid).toBe(false);
    });
  });
});

describe('Environment Validation - Production Requirements', () => {
  /**
   * Validates environment for production deployment
   */
  function validateProductionEnvironment(env: Record<string, string | undefined>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check all required variables
    ENV_REGISTRY.filter(v => v.required).forEach(envVar => {
      const result = validateEnvVar(envVar, env[envVar.name]);
      if (!result.valid) {
        errors.push(result.error!);
      }
    });

    // Production-specific checks
    if (env.NODE_ENV === 'production') {
      // Must use HTTPS for API URLs in production
      if (env.NEXT_PUBLIC_API_URL && !env.NEXT_PUBLIC_API_URL.startsWith('https://')) {
        errors.push('NEXT_PUBLIC_API_URL must use HTTPS in production');
      }

      if (env.NEXTAUTH_URL && !env.NEXTAUTH_URL.startsWith('https://')) {
        errors.push('NEXTAUTH_URL must use HTTPS in production');
      }

      // Must use live Stripe keys in production
      if (env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
        warnings.push('Using Stripe test key in production');
      }

      // Should have monitoring configured
      if (!env.NEXT_PUBLIC_SENTRY_DSN) {
        warnings.push('Sentry error monitoring not configured');
      }

      // Should have analytics
      if (!env.NEXT_PUBLIC_GA_ID) {
        warnings.push('Google Analytics not configured');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  it('should validate production environment', () => {
    const validProdEnv = {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://api.ainative.studio',
      NEXT_PUBLIC_API_BASE_URL: 'https://api.ainative.studio',
      NEXTAUTH_URL: 'https://www.ainative.studio',
      NEXTAUTH_SECRET: 'a'.repeat(32),
      DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      NEXT_PUBLIC_GA_ID: 'G-XXXXXXXXXX'
    };

    const result = validateProductionEnvironment(validProdEnv);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject production environment with HTTP URLs', () => {
    const invalidProdEnv = {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'http://api.ainative.studio',  // HTTP not HTTPS
      NEXT_PUBLIC_API_BASE_URL: 'https://api.ainative.studio',
      NEXTAUTH_URL: 'https://www.ainative.studio',
      NEXTAUTH_SECRET: 'a'.repeat(32),
      DATABASE_URL: 'postgresql://user:pass@host:5432/db'
    };

    const result = validateProductionEnvironment(invalidProdEnv);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('NEXT_PUBLIC_API_URL must use HTTPS in production');
  });

  it('should reject production environment with missing required vars', () => {
    const invalidProdEnv = {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://api.ainative.studio',
      // Missing NEXTAUTH_SECRET
      DATABASE_URL: 'postgresql://user:pass@host:5432/db'
    };

    const result = validateProductionEnvironment(invalidProdEnv);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('NEXTAUTH_SECRET'))).toBe(true);
  });

  it('should warn about test keys in production', () => {
    const envWithTestKeys = {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://api.ainative.studio',
      NEXT_PUBLIC_API_BASE_URL: 'https://api.ainative.studio',
      NEXTAUTH_URL: 'https://www.ainative.studio',
      NEXTAUTH_SECRET: 'a'.repeat(32),
      DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_1234567890'  // Test key
    };

    const result = validateProductionEnvironment(envWithTestKeys);
    expect(result.warnings).toContain('Using Stripe test key in production');
  });
});

describe('Environment Validation - Security', () => {
  it('should not expose server-side variables to client', () => {
    const serverSideVars = ENV_REGISTRY
      .filter(v => v.serverSideOnly)
      .map(v => v.name);

    serverSideVars.forEach(varName => {
      expect(varName).not.toMatch(/^NEXT_PUBLIC_/);
    });
  });

  it('should flag weak secrets', () => {
    const weakSecrets = [
      'password',
      '12345678',
      'secret',
      'test',
      'default'
    ];

    weakSecrets.forEach(secret => {
      const result = validateEnvVar(
        { name: 'NEXTAUTH_SECRET', required: true, pattern: /.{32,}/, description: 'NextAuth secret' },
        secret
      );
      expect(result.valid).toBe(false);
    });
  });
});

/**
 * Export validation function for use in deployment scripts
 */
export { validateEnvVar, ENV_REGISTRY };
