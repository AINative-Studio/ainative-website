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

  describe('checkRateLimit - API Key tier (20 requests/minute)', () => {
    const identifier = 'ip:192.168.1.102';

    it('should allow 20 requests', () => {
      for (let i = 0; i < 20; i++) {
        const result = checkRateLimit(identifier, 'apiKey');
        expect(result.success).toBe(true);
      }
    });

    it('should block 21st request', () => {
      for (let i = 0; i < 20; i++) {
        checkRateLimit(identifier, 'apiKey');
      }

      const result = checkRateLimit(identifier, 'apiKey');
      expect(result.success).toBe(false);
    });
  });

  describe('checkRateLimit - Search tier (30 requests/minute)', () => {
    const identifier = 'ip:192.168.1.103';

    it('should allow 30 requests', () => {
      for (let i = 0; i < 30; i++) {
        const result = checkRateLimit(identifier, 'search');
        expect(result.success).toBe(true);
      }
    });

    it('should block 31st request', () => {
      for (let i = 0; i < 30; i++) {
        checkRateLimit(identifier, 'search');
      }

      const result = checkRateLimit(identifier, 'search');
      expect(result.success).toBe(false);
    });
  });

  describe('checkRateLimit - Read-only tier (60 requests/minute)', () => {
    const identifier = 'ip:192.168.1.104';

    it('should allow 60 requests', () => {
      for (let i = 0; i < 60; i++) {
        const result = checkRateLimit(identifier, 'readonly');
        expect(result.success).toBe(true);
      }
    });

    it('should block 61st request', () => {
      for (let i = 0; i < 60; i++) {
        checkRateLimit(identifier, 'readonly');
      }

      const result = checkRateLimit(identifier, 'readonly');
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

  describe('checkRateLimit - Different tiers for same identifier', () => {
    const identifier = 'ip:192.168.1.105';

    it('should track limits separately per tier', () => {
      // Use up auth limit (5)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(identifier, 'auth');
      }

      // Auth should be blocked
      expect(checkRateLimit(identifier, 'auth').success).toBe(false);

      // But payment should still work (different tier)
      expect(checkRateLimit(identifier, 'payment').success).toBe(true);
    });
  });

  describe('Abuse Detection', () => {
    const identifier = 'ip:192.168.1.106';

    it('should block IP after repeated violations', () => {
      // Exceed rate limit multiple times to trigger abuse detection
      // Default threshold is 10 violations
      for (let violation = 0; violation < 10; violation++) {
        // Use up the auth limit (5 requests)
        for (let i = 0; i < 5; i++) {
          checkRateLimit(identifier, 'auth');
        }

        // Trigger a violation
        const result = checkRateLimit(identifier, 'auth');
        expect(result.success).toBe(false);

        // Reset for next violation
        resetRateLimit(identifier, 'auth');
      }

      // After 10 violations, IP should be blocked
      const result = checkRateLimit(identifier, 'auth');
      expect(result.blocked).toBe(true);
      expect(result.blockReason).toBeDefined();
    });

    it('should unblock IP after resetting abuse', () => {
      // Trigger abuse detection (simplified)
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 6; j++) {
          checkRateLimit(identifier, 'auth');
        }
        resetRateLimit(identifier, 'auth');
      }

      // Reset abuse tracking
      resetAbuse(identifier);

      // Should work again
      const result = checkRateLimit(identifier, 'auth');
      expect(result.blocked).toBeFalsy();
      expect(result.success).toBe(true);
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

  describe('User-based rate limiting', () => {
    it('should track different users separately', () => {
      const user1 = getIdentifier('192.168.1.1', 'user-1');
      const user2 = getIdentifier('192.168.1.1', 'user-2'); // same IP, different user

      // Use up user1's limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(user1, 'auth');
      }

      // user1 should be blocked
      expect(checkRateLimit(user1, 'auth').success).toBe(false);

      // user2 should still work (different identifier)
      expect(checkRateLimit(user2, 'auth').success).toBe(true);
    });
  });

  describe('Remaining count accuracy', () => {
    const identifier = 'ip:192.168.1.108';

    it('should accurately track remaining requests', () => {
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(checkRateLimit(identifier, 'auth'));
      }

      expect(results[0].remaining).toBe(4);
      expect(results[1].remaining).toBe(3);
      expect(results[2].remaining).toBe(2);
      expect(results[3].remaining).toBe(1);
      expect(results[4].remaining).toBe(0);
    });
  });
});
