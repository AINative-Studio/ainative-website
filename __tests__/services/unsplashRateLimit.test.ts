/**
 * Unit tests for Unsplash Rate Limiter
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { unsplashRateLimiter } from '@/services/unsplashRateLimit';

describe('UnsplashRateLimiter', () => {
  beforeEach(() => {
    unsplashRateLimiter.reset();
  });

  describe('canProceed', () => {
    it('should allow requests within limit', () => {
      for (let i = 0; i < 50; i++) {
        expect(unsplashRateLimiter.canProceed()).toBe(true);
        unsplashRateLimiter.incrementCount();
      }
    });

    it('should block requests over limit', () => {
      // Max out the limit
      for (let i = 0; i < 100; i++) {
        unsplashRateLimiter.incrementCount();
      }

      expect(unsplashRateLimiter.canProceed()).toBe(false);
    });

    it('should reset after window expires', (done) => {
      // Max out the limit
      for (let i = 0; i < 100; i++) {
        unsplashRateLimiter.incrementCount();
      }

      expect(unsplashRateLimiter.canProceed()).toBe(false);

      // Wait for window to expire (61 seconds)
      setTimeout(() => {
        expect(unsplashRateLimiter.canProceed()).toBe(true);
        done();
      }, 61000);
    }, 65000);
  });

  describe('execute', () => {
    it('should execute function immediately when under limit', async () => {
      let executed = false;

      await unsplashRateLimiter.execute(() => {
        executed = true;
      });

      expect(executed).toBe(true);
    });

    it('should return function result', async () => {
      const result = await unsplashRateLimiter.execute(() => {
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('should handle async functions', async () => {
      const result = await unsplashRateLimiter.execute(async () => {
        return Promise.resolve('async-result');
      });

      expect(result).toBe('async-result');
    });

    it('should queue requests when over limit', async () => {
      // Max out the limit
      for (let i = 0; i < 100; i++) {
        unsplashRateLimiter.incrementCount();
      }

      let executed = false;
      const promise = unsplashRateLimiter.execute(() => {
        executed = true;
        return 'queued-result';
      });

      // Should not execute immediately
      expect(executed).toBe(false);

      // Should eventually execute
      const result = await promise;
      expect(result).toBe('queued-result');
      expect(executed).toBe(true);
    }, 65000);

    it('should throw error if queue is full', async () => {
      // Max out the limit
      for (let i = 0; i < 100; i++) {
        unsplashRateLimiter.incrementCount();
      }

      // Fill the queue
      const promises: Promise<unknown>[] = [];
      for (let i = 0; i < 50; i++) {
        promises.push(unsplashRateLimiter.execute(() => 'queued'));
      }

      // Next request should fail
      await expect(unsplashRateLimiter.execute(() => 'fail')).rejects.toThrow(
        'Rate limit exceeded - queue is full'
      );
    }, 65000);
  });

  describe('bypass', () => {
    it('should execute without rate limiting', () => {
      // Max out the limit
      for (let i = 0; i < 100; i++) {
        unsplashRateLimiter.incrementCount();
      }

      let executed = false;
      unsplashRateLimiter.bypass(() => {
        executed = true;
      });

      expect(executed).toBe(true);
    });

    it('should not increment request count', () => {
      unsplashRateLimiter.bypass(() => 'test');

      const state = unsplashRateLimiter.getState();
      expect(state.requestCount).toBe(0);
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      unsplashRateLimiter.incrementCount();
      unsplashRateLimiter.incrementCount();

      const state = unsplashRateLimiter.getState();

      expect(state.requestCount).toBe(2);
      expect(state.maxRequests).toBe(100);
      expect(state.windowMs).toBe(60000);
      expect(state.timeUntilReset).toBeLessThanOrEqual(60000);
      expect(state.queueSize).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should track total requests', async () => {
      await unsplashRateLimiter.execute(() => 'test1');
      await unsplashRateLimiter.execute(() => 'test2');

      const stats = unsplashRateLimiter.getStats();

      expect(stats.totalRequests).toBe(2);
    });

    it('should track rate limited requests', async () => {
      // Max out the limit
      for (let i = 0; i < 100; i++) {
        unsplashRateLimiter.incrementCount();
      }

      // Try to execute (will be queued or rejected)
      try {
        // Fill queue
        for (let i = 0; i < 51; i++) {
          unsplashRateLimiter.execute(() => 'test').catch(() => {});
        }
      } catch (error) {
        // Expected
      }

      const stats = unsplashRateLimiter.getStats();
      expect(stats.rateLimited).toBeGreaterThan(0);
    });
  });

  describe('clearQueue', () => {
    it('should clear pending requests', async () => {
      // Max out the limit
      for (let i = 0; i < 100; i++) {
        unsplashRateLimiter.incrementCount();
      }

      // Queue some requests
      for (let i = 0; i < 5; i++) {
        unsplashRateLimiter.execute(() => 'test').catch(() => {});
      }

      const stateBefore = unsplashRateLimiter.getState();
      expect(stateBefore.queueSize).toBe(5);

      unsplashRateLimiter.clearQueue();

      const stateAfter = unsplashRateLimiter.getState();
      expect(stateAfter.queueSize).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset all state and stats', async () => {
      await unsplashRateLimiter.execute(() => 'test1');
      await unsplashRateLimiter.execute(() => 'test2');

      unsplashRateLimiter.reset();

      const state = unsplashRateLimiter.getState();
      const stats = unsplashRateLimiter.getStats();

      expect(state.requestCount).toBe(0);
      expect(state.queueSize).toBe(0);
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return time remaining in window', () => {
      unsplashRateLimiter.incrementCount();

      const time = unsplashRateLimiter.getState().timeUntilReset;

      expect(time).toBeGreaterThan(0);
      expect(time).toBeLessThanOrEqual(60000);
    });
  });
});
