/**
 * Tests for LinkedIn OAuth Provider Configuration
 * Issue #431: Add LinkedIn OAuth Provider
 * @jest-environment node
 */

// Mock dependencies before importing authOptions
jest.mock(
  '@next-auth/prisma-adapter',
  () => ({
    PrismaAdapter: jest.fn(() => ({})),
  }),
  { virtual: true }
);

jest.mock('@/lib/prisma', () => ({
  prisma: {},
}));

import { authOptions } from '@/lib/auth/options';

describe('LinkedIn OAuth Provider Configuration', () => {
  describe('authOptions providers', () => {
    it('should include LinkedIn provider in the providers array', () => {
      const providerIds = authOptions.providers.map((provider) => provider.id);
      expect(providerIds).toContain('linkedin');
    });

    it('should have GitHub provider alongside LinkedIn', () => {
      const providerIds = authOptions.providers.map((provider) => provider.id);
      expect(providerIds).toContain('github');
      expect(providerIds).toContain('linkedin');
    });

    it('should have credentials provider alongside OAuth providers', () => {
      const providerIds = authOptions.providers.map((provider) => provider.id);
      expect(providerIds).toContain('credentials');
      expect(providerIds).toContain('linkedin');
    });

    it('should have at least 3 providers configured', () => {
      expect(authOptions.providers.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('LinkedIn provider configuration', () => {
    it('should configure LinkedIn provider with correct name', () => {
      const linkedInProvider = authOptions.providers.find(
        (provider) => provider.id === 'linkedin'
      );
      expect(linkedInProvider).toBeDefined();
      expect(linkedInProvider?.name).toBe('LinkedIn');
    });
  });

  describe('session configuration', () => {
    it('should use database strategy for sessions', () => {
      expect(authOptions.session?.strategy).toBe('database');
    });

    it('should have 30 day session max age', () => {
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60);
    });
  });

  describe('callbacks', () => {
    it('should have jwt callback defined', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
    });

    it('should have session callback defined', () => {
      expect(authOptions.callbacks?.session).toBeDefined();
    });
  });
});
