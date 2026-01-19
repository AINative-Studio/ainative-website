/**
 * Rate Limiting Implementation
 *
 * Implements in-memory rate limiting using LRU cache with support for:
 * - IP-based rate limiting
 * - User-based rate limiting (for authenticated requests)
 * - Abuse detection and IP blocking
 * - Whitelisted IPs
 */

import { LRUCache } from 'lru-cache';
import {
  RateLimitConfig,
  RateLimitTier,
  RATE_LIMIT_CONFIGS,
  WHITELISTED_IPS,
  RATE_LIMITING_ENABLED,
  ABUSE_DETECTION_THRESHOLD,
  ABUSE_DETECTION_WINDOW_MS,
  IP_BLOCK_DURATION_MS,
} from './rate-limit-config';

export interface RateLimitResult {
  /**
   * Whether the request is allowed (true) or rate limited (false)
   */
  success: boolean;

  /**
   * Maximum number of requests allowed in the window
   */
  limit: number;

  /**
   * Number of requests remaining in the current window
   */
  remaining: number;

  /**
   * Timestamp when the rate limit window resets
   */
  reset: number;

  /**
   * Whether the request was blocked due to abuse detection
   */
  blocked?: boolean;

  /**
   * Reason for blocking (if blocked)
   */
  blockReason?: string;
}

interface RateLimitEntry {
  /**
   * Number of requests made in the current window
   */
  count: number;

  /**
   * Timestamp when the window expires
   */
  resetAt: number;
}

interface AbuseEntry {
  /**
   * Number of times rate limit was exceeded
   */
  violations: number;

  /**
   * Timestamp when the abuse detection window expires
   */
  resetAt: number;
}

interface BlockEntry {
  /**
   * Timestamp when the block expires
   */
  expiresAt: number;

  /**
   * Reason for blocking
   */
  reason: string;
}

/**
 * LRU cache for storing rate limit data
 * Max 10,000 entries to prevent memory issues
 */
const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 10000,
  ttl: 60 * 1000, // 1 minute TTL
});

/**
 * LRU cache for tracking abuse violations
 */
const abuseCache = new LRUCache<string, AbuseEntry>({
  max: 1000,
  ttl: ABUSE_DETECTION_WINDOW_MS,
});

/**
 * LRU cache for blocked IPs
 */
const blockCache = new LRUCache<string, BlockEntry>({
  max: 1000,
  ttl: IP_BLOCK_DURATION_MS,
});

/**
 * Extract identifier from request
 * Prefers user ID for authenticated requests, falls back to IP
 */
export function getIdentifier(
  ip: string | null,
  userId?: string | null
): string {
  // Use user ID if available for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP
  return `ip:${ip || 'unknown'}`;
}

/**
 * Check if an IP is whitelisted
 */
export function isWhitelisted(ip: string | null): boolean {
  if (!ip) return false;
  return WHITELISTED_IPS.includes(ip);
}

/**
 * Check if an identifier is blocked
 */
function isBlocked(identifier: string): { blocked: boolean; reason?: string } {
  const blockEntry = blockCache.get(identifier);

  if (!blockEntry) {
    return { blocked: false };
  }

  const now = Date.now();
  if (now >= blockEntry.expiresAt) {
    // Block expired
    blockCache.delete(identifier);
    return { blocked: false };
  }

  return { blocked: true, reason: blockEntry.reason };
}

/**
 * Record a rate limit violation and check for abuse
 */
function recordViolation(identifier: string): void {
  const now = Date.now();
  const abuseEntry = abuseCache.get(identifier);

  if (!abuseEntry) {
    // First violation in this window
    abuseCache.set(identifier, {
      violations: 1,
      resetAt: now + ABUSE_DETECTION_WINDOW_MS,
    });
    return;
  }

  // Check if window expired
  if (now >= abuseEntry.resetAt) {
    // Reset violations
    abuseCache.set(identifier, {
      violations: 1,
      resetAt: now + ABUSE_DETECTION_WINDOW_MS,
    });
    return;
  }

  // Increment violations
  const violations = abuseEntry.violations + 1;
  abuseCache.set(identifier, {
    violations,
    resetAt: abuseEntry.resetAt,
  });

  // Check if threshold exceeded
  if (violations >= ABUSE_DETECTION_THRESHOLD) {
    // Block the identifier
    blockCache.set(identifier, {
      expiresAt: now + IP_BLOCK_DURATION_MS,
      reason: `Exceeded rate limit ${violations} times in ${ABUSE_DETECTION_WINDOW_MS / 1000}s`,
    });
  }
}

/**
 * Check rate limit for a given identifier and tier
 */
export function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'default',
  ip?: string | null
): RateLimitResult {
  // Check if rate limiting is enabled
  if (!RATE_LIMITING_ENABLED) {
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    };
  }

  // Check if IP is whitelisted
  if (ip && isWhitelisted(ip)) {
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    };
  }

  // Check if identifier is blocked
  const blockCheck = isBlocked(identifier);
  if (blockCheck.blocked) {
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: Date.now() + IP_BLOCK_DURATION_MS,
      blocked: true,
      blockReason: blockCheck.reason,
    };
  }

  const config = RATE_LIMIT_CONFIGS[tier];
  const now = Date.now();
  const key = `${tier}:${identifier}`;

  const entry = rateLimitCache.get(key);

  // No entry or window expired - create new window
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + config.windowMs;
    rateLimitCache.set(key, {
      count: 1,
      resetAt,
    });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    // Record violation for abuse detection
    recordViolation(identifier);

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  // Increment count
  const count = entry.count + 1;
  rateLimitCache.set(key, {
    count,
    resetAt: entry.resetAt,
  });

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - count,
    reset: entry.resetAt,
  };
}

/**
 * Reset rate limit for a specific identifier (useful for testing)
 */
export function resetRateLimit(identifier: string, tier?: RateLimitTier): void {
  if (tier) {
    const key = `${tier}:${identifier}`;
    rateLimitCache.delete(key);
  } else {
    // Reset all tiers for this identifier
    const tiers: RateLimitTier[] = ['auth', 'payment', 'apiKey', 'search', 'readonly', 'default'];
    tiers.forEach(t => {
      const key = `${t}:${identifier}`;
      rateLimitCache.delete(key);
    });
  }
}

/**
 * Reset abuse tracking for an identifier (useful for unblocking)
 */
export function resetAbuse(identifier: string): void {
  abuseCache.delete(identifier);
  blockCache.delete(identifier);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  tier: RateLimitTier = 'default'
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[tier];
  const now = Date.now();
  const key = `${tier}:${identifier}`;

  const entry = rateLimitCache.get(key);

  if (!entry || now >= entry.resetAt) {
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: now + config.windowMs,
    };
  }

  return {
    success: entry.count < config.limit,
    limit: config.limit,
    remaining: Math.max(0, config.limit - entry.count),
    reset: entry.resetAt,
  };
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitCache.clear();
  abuseCache.clear();
  blockCache.clear();
}
