/**
 * Rate Limiting Tests
 *
 * Comprehensive test suite for rate limiting functionality
 */

import {
  checkRateLimit,
  getIdentifier,
  isWhitelisted,
  resetRateLimit,
  resetAbuse,
  getRateLimitStatus,
  clearAllRateLimits,
} from '../rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear all rate limits before each test
    clearAllRateLimits();
  });

  describe('getIdentifier', () => {
    it('should prefer user ID over IP', () => {
      const identifier = getIdentifier('192.168.1.1', 'user-123');
      expect(identifier).toBe('user:user-123');
    });

    it('should fall back to IP when no user ID', () => {
      const identifier = getIdentifier('192.168.1.1', null);
      expect(identifier).toBe('ip:192.168.1.1');
    });

    it('should handle unknown IP', () => {
      const identifier = getIdentifier(null, null);
      expect(identifier).toBe('ip:unknown');
    });
  });

  describe('isWhitelisted', () => {
    it('should whitelist localhost IPs', () => {
      expect(isWhitelisted('127.0.0.1')).toBe(true);
      expect(isWhitelisted('::1')).toBe(true);
      expect(isWhitelisted('localhost')).toBe(true);
    });

    it('should not whitelist random IPs', () => {
      expect(isWhitelisted('1.2.3.4')).toBe(false);
    });

    it('should handle null IP', () => {
      expect(isWhitelisted(null)).toBe(false);
    });
  });

  describe('checkRateLimit - Auth tier (5 requests/minute)', () => {
    const identifier = 'ip:192.168.1.100';

    it('should allow requests within limit', () => {
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(identifier, 'auth');
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests exceeding limit', () => {
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(identifier, 'auth');
      }

      // Next request should be blocked
      const result = checkRateLimit(identifier, 'auth');
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should include rate limit headers', () => {
      const result = checkRateLimit(identifier, 'auth');
      expect(result.limit).toBe(5);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should reset after window expires', async () => {
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(identifier, 'auth');
      }

      // Reset manually (simulating window expiration)
      resetRateLimit(identifier, 'auth');

      // Should allow requests again
      const result = checkRateLimit(identifier, 'auth');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });

  describe('checkRateLimit - Payment tier (10 requests/minute)', () => {
    const identifier = 'ip:192.168.1.101';

    it('should allow 10 requests', () => {
      for (let i = 0; i < 10; i++) {
        const result = checkRateLimit(identifier, 'payment');
        expect(result.success).toBe(true);
      }
    });

    it('should block 11th request', () => {
      for (let i = 0; i < 10; i++) {
        checkRateLimit(identifier, 'payment');
      }

      const result = checkRateLimit(identifier, 'payment');
      expect(result.success).toBe(false);
    });
  });

  describe('checkRateLimit - Whitelisted IP bypass', () => {
    const identifier = 'ip:127.0.0.1';

    it('should bypass rate limiting for whitelisted IP', () => {
      // Try many requests (way more than any limit)
      for (let i = 0; i < 100; i++) {
        const result = checkRateLimit(identifier, 'auth', '127.0.0.1');
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(999999);
      }
    });
  });

  describe('getRateLimitStatus', () => {
    const identifier = 'ip:192.168.1.107';

    it('should get status without incrementing count', () => {
      const status1 = getRateLimitStatus(identifier, 'auth');
      expect(status1.remaining).toBe(5);

      const status2 = getRateLimitStatus(identifier, 'auth');
      expect(status2.remaining).toBe(5);

      // Actual request should decrement
      checkRateLimit(identifier, 'auth');

      const status3 = getRateLimitStatus(identifier, 'auth');
      expect(status3.remaining).toBe(4);
    });
  });
});
