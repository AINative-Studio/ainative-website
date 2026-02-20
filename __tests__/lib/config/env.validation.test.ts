/**
 * Environment Variable Validation Tests
 *
 * Tests for environment variable validation system
 *
 * @jest-environment node
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  validateEnv,
  getValidatedEnv,
  validateProductionRequirements,
  generateNextAuthSecret,
} from '@/lib/config/env.validation';

describe('Environment Variable Validation', () => {
  let mockEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Base valid configuration
    mockEnv = {
      NODE_ENV: 'development',
      NEXTAUTH_SECRET: 'test-secret-minimum-32-characters-long-abcdefgh',
      NEXTAUTH_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      NEXT_PUBLIC_API_BASE_URL: 'https://api.ainative.studio',
      NEXT_PUBLIC_API_URL: 'https://api.ainative.studio',
    };
  });

  describe('validateEnv', () => {
    it('should validate correct environment configuration', () => {
      const result = validateEnv(mockEnv);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    it('should reject NEXTAUTH_SECRET shorter than 32 characters', () => {
      mockEnv.NEXTAUTH_SECRET = 'short-secret';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].path).toContain('NEXTAUTH_SECRET');
    });

    it('should reject invalid NEXTAUTH_URL', () => {
      mockEnv.NEXTAUTH_URL = 'not-a-valid-url';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(e => e.path.includes('NEXTAUTH_URL'))).toBe(true);
    });

    it('should reject non-PostgreSQL DATABASE_URL', () => {
      mockEnv.DATABASE_URL = 'mysql://user:pass@localhost:3306/db';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(e => e.path.includes('DATABASE_URL'))).toBe(true);
    });

    it('should validate Stripe keys with correct prefixes', () => {
      mockEnv.STRIPE_SECRET_KEY = 'sk_test_1234567890';
      mockEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_1234567890';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(true);
    });

    it('should reject Stripe keys with incorrect prefixes', () => {
      mockEnv.STRIPE_SECRET_KEY = 'invalid_key';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.path.includes('STRIPE_SECRET_KEY'))).toBe(true);
    });

    it('should validate OpenAI API key format', () => {
      mockEnv.OPENAI_API_KEY = 'sk-1234567890';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(true);
    });

    it('should reject OpenAI API key without sk- prefix', () => {
      mockEnv.OPENAI_API_KEY = 'invalid-key';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
    });

    it('should validate Anthropic API key format', () => {
      mockEnv.ANTHROPIC_API_KEY = 'sk-ant-1234567890';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(true);
    });

    it('should reject Anthropic API key without sk-ant- prefix', () => {
      mockEnv.ANTHROPIC_API_KEY = 'sk-1234567890';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
    });

    it('should parse boolean feature flags correctly', () => {
      mockEnv.NEXT_PUBLIC_ENABLE_AI_FEATURES = 'true';
      mockEnv.NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES = 'false';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(true);
      expect(result.data?.NEXT_PUBLIC_ENABLE_AI_FEATURES).toBe(true);
      expect(result.data?.NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES).toBe(false);
    });

    it('should parse numeric configuration correctly', () => {
      mockEnv.DATABASE_POOL_SIZE = '20';
      mockEnv.NEXT_PUBLIC_API_TIMEOUT = '30000';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(true);
      expect(result.data?.DATABASE_POOL_SIZE).toBe(20);
      expect(result.data?.NEXT_PUBLIC_API_TIMEOUT).toBe(30000);
    });

    it('should reject invalid numeric values', () => {
      mockEnv.DATABASE_POOL_SIZE = '-5';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
    });

    it('should apply default values for optional fields', () => {
      const result = validateEnv(mockEnv);

      expect(result.success).toBe(true);
      expect(result.data?.NODE_ENV).toBe('development');
      expect(result.data?.NEXT_PUBLIC_ENABLE_AI_FEATURES).toBeDefined();
    });
  });

  describe('getValidatedEnv', () => {
    it('should return validated environment on success', () => {
      const env = getValidatedEnv(mockEnv);

      expect(env).toBeDefined();
      expect(env.NEXTAUTH_SECRET).toBe(mockEnv.NEXTAUTH_SECRET);
    });

    it('should throw error with detailed messages on failure', () => {
      mockEnv.NEXTAUTH_SECRET = 'short';

      expect(() => getValidatedEnv(mockEnv)).toThrow('Environment variable validation failed');
    });
  });

  describe('validateProductionRequirements', () => {
    beforeEach(() => {
      mockEnv.NODE_ENV = 'production';
      mockEnv.NEXTAUTH_URL = 'https://www.ainative.studio';
    });

    it('should return no warnings for valid production config', () => {
      mockEnv.GITHUB_CLIENT_ID = 'github-client-id';
      mockEnv.GITHUB_CLIENT_SECRET = 'github-client-secret';
      mockEnv.STRIPE_SECRET_KEY = 'sk_live_1234567890';

      const warnings = validateProductionRequirements(mockEnv);

      expect(warnings.length).toBe(0);
    });

    it('should warn if NEXTAUTH_SECRET is not set in production', () => {
      delete mockEnv.NEXTAUTH_SECRET;

      const warnings = validateProductionRequirements(mockEnv);

      expect(warnings.some(w => w.includes('NEXTAUTH_SECRET'))).toBe(true);
      expect(warnings.some(w => w.includes('CRITICAL'))).toBe(true);
    });

    it('should warn if DATABASE_URL is not set in production', () => {
      delete mockEnv.DATABASE_URL;

      const warnings = validateProductionRequirements(mockEnv);

      expect(warnings.some(w => w.includes('DATABASE_URL'))).toBe(true);
    });

    it('should warn if NEXTAUTH_URL contains localhost in production', () => {
      mockEnv.NEXTAUTH_URL = 'http://localhost:3000';

      const warnings = validateProductionRequirements(mockEnv);

      expect(warnings.some(w => w.includes('localhost'))).toBe(true);
    });

    it('should warn if NEXTAUTH_URL does not use HTTPS in production', () => {
      mockEnv.NEXTAUTH_URL = 'http://www.ainative.studio';

      const warnings = validateProductionRequirements(mockEnv);

      expect(warnings.some(w => w.includes('HTTPS'))).toBe(true);
    });

    it('should warn if GitHub OAuth is not configured', () => {
      delete mockEnv.GITHUB_CLIENT_ID;
      delete mockEnv.GITHUB_CLIENT_SECRET;

      const warnings = validateProductionRequirements(mockEnv);

      expect(warnings.some(w => w.includes('GitHub'))).toBe(true);
    });

    it('should warn if Stripe is not configured', () => {
      delete mockEnv.STRIPE_SECRET_KEY;

      const warnings = validateProductionRequirements(mockEnv);

      expect(warnings.some(w => w.includes('Stripe'))).toBe(true);
    });

    it('should not warn in development environment', () => {
      mockEnv.NODE_ENV = 'development';
      delete mockEnv.GITHUB_CLIENT_ID;
      delete mockEnv.STRIPE_SECRET_KEY;

      const warnings = validateProductionRequirements(mockEnv);

      expect(warnings.length).toBe(0);
    });
  });

  describe('generateNextAuthSecret', () => {
    it('should generate a secret of sufficient length', () => {
      const secret = generateNextAuthSecret();

      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThanOrEqual(32);
    });

    it('should generate unique secrets', () => {
      const secret1 = generateNextAuthSecret();
      const secret2 = generateNextAuthSecret();

      expect(secret1).not.toBe(secret2);
    });

    it('should generate base64-encoded strings', () => {
      const secret = generateNextAuthSecret();

      // Base64 characters: A-Z, a-z, 0-9, +, /, =
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;
      expect(base64Regex.test(secret)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional environment variables', () => {
      // Only required variables set
      const minimalEnv = {
        NODE_ENV: 'development',
        NEXTAUTH_SECRET: 'test-secret-minimum-32-characters-long-abcdefgh',
        NEXTAUTH_URL: 'http://localhost:3000',
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      };

      const result = validateEnv(minimalEnv);

      expect(result.success).toBe(true);
    });

    it('should handle empty string values', () => {
      mockEnv.GITHUB_CLIENT_ID = '';

      const result = validateEnv(mockEnv);

      // Empty strings should be treated as missing for optional fields
      expect(result.success).toBe(true);
    });

    it('should handle whitespace-only values', () => {
      mockEnv.NEXTAUTH_SECRET = '   ';

      const result = validateEnv(mockEnv);

      // Should fail minimum length validation
      expect(result.success).toBe(false);
    });

    it('should validate URL protocols strictly', () => {
      mockEnv.NEXTAUTH_URL = 'ftp://example.com';

      const result = validateEnv(mockEnv);

      // FTP is a valid URL but may not be suitable for NextAuth
      expect(result.success).toBe(true);
    });

    it('should handle extremely long configuration values', () => {
      mockEnv.NEXTAUTH_SECRET = 'a'.repeat(1000);

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(true);
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error message for short NEXTAUTH_SECRET', () => {
      mockEnv.NEXTAUTH_SECRET = 'short';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
      expect(result.errors![0].message).toContain('at least 32 characters');
      expect(result.errors![0].message).toContain('openssl rand -base64 32');
    });

    it('should provide helpful error message for invalid DATABASE_URL', () => {
      mockEnv.DATABASE_URL = 'mysql://localhost/db';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
      expect(
        result.errors!.some(e => e.message.includes('postgresql://'))
      ).toBe(true);
    });

    it('should provide helpful error for invalid Stripe key', () => {
      mockEnv.STRIPE_SECRET_KEY = 'wrong-prefix-key';

      const result = validateEnv(mockEnv);

      expect(result.success).toBe(false);
      expect(
        result.errors!.some(e => e.message.includes('sk_'))
      ).toBe(true);
    });
  });
});
