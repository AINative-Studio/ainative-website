/**
 * Rate limiter for Unsplash API requests
 * Prevents overwhelming the CDN and potential blocking
 */

import type { RateLimiterState } from './types/unsplash.types';

/**
 * Rate limiter configuration
 */
const RATE_LIMIT_CONFIG = {
  /** Maximum requests per window */
  MAX_REQUESTS: 100,
  /** Time window in milliseconds (1 minute) */
  WINDOW_MS: 60 * 1000,
  /** Maximum queue size */
  MAX_QUEUE_SIZE: 50,
};

/**
 * Rate limiter for Unsplash requests
 */
class UnsplashRateLimiter {
  private state: RateLimiterState = {
    requestCount: 0,
    windowStart: Date.now(),
    queue: [],
  };

  private stats = {
    totalRequests: 0,
    rateLimited: 0,
    queuedRequests: 0,
  };

  /**
   * Check if we're within rate limits
   */
  private checkWindow(): void {
    const now = Date.now();
    const windowElapsed = now - this.state.windowStart;

    // Reset window if expired
    if (windowElapsed >= RATE_LIMIT_CONFIG.WINDOW_MS) {
      this.state.requestCount = 0;
      this.state.windowStart = now;
    }
  }

  /**
   * Check if a request can proceed
   */
  canProceed(): boolean {
    this.checkWindow();
    return this.state.requestCount < RATE_LIMIT_CONFIG.MAX_REQUESTS;
  }

  /**
   * Increment request count
   */
  incrementCount(): void {
    this.checkWindow();
    this.state.requestCount++;
    this.stats.totalRequests++;
  }

  /**
   * Get time until next window
   */
  getTimeUntilReset(): number {
    const now = Date.now();
    const elapsed = now - this.state.windowStart;
    return Math.max(0, RATE_LIMIT_CONFIG.WINDOW_MS - elapsed);
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => T | Promise<T>): Promise<T> {
    // Check if we can proceed immediately
    if (this.canProceed()) {
      this.incrementCount();
      return await fn();
    }

    // Queue is full, reject
    if (this.state.queue.length >= RATE_LIMIT_CONFIG.MAX_QUEUE_SIZE) {
      this.stats.rateLimited++;
      throw new Error('Rate limit exceeded - queue is full');
    }

    // Queue the request
    return new Promise<T>((resolve, reject) => {
      const timeUntilReset = this.getTimeUntilReset();

      // Schedule execution after window reset
      const timer = setTimeout(async () => {
        try {
          this.incrementCount();
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, timeUntilReset);

      // Store cleanup function in queue
      this.state.queue.push(() => clearTimeout(timer));
      this.stats.queuedRequests++;
    });
  }

  /**
   * Execute function without rate limiting (for cached responses)
   */
  bypass<T>(fn: () => T): T {
    return fn();
  }

  /**
   * Get current rate limiter state
   */
  getState() {
    this.checkWindow();
    return {
      requestCount: this.state.requestCount,
      maxRequests: RATE_LIMIT_CONFIG.MAX_REQUESTS,
      windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
      timeUntilReset: this.getTimeUntilReset(),
      queueSize: this.state.queue.length,
      maxQueueSize: RATE_LIMIT_CONFIG.MAX_QUEUE_SIZE,
    };
  }

  /**
   * Get rate limiter statistics
   */
  getStats() {
    return {
      ...this.stats,
      rateLimitRate: this.stats.rateLimited / this.stats.totalRequests || 0,
    };
  }

  /**
   * Clear the queue
   */
  clearQueue(): void {
    // Execute all cleanup functions
    this.state.queue.forEach(cleanup => cleanup());
    this.state.queue = [];
  }

  /**
   * Reset rate limiter
   */
  reset(): void {
    this.clearQueue();
    this.state = {
      requestCount: 0,
      windowStart: Date.now(),
      queue: [],
    };
    this.stats = {
      totalRequests: 0,
      rateLimited: 0,
      queuedRequests: 0,
    };
  }
}

// Export singleton instance
export const unsplashRateLimiter = new UnsplashRateLimiter();
