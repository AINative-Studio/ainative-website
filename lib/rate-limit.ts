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
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  blocked?: boolean;
  blockReason?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface AbuseEntry {
  violations: number;
  resetAt: number;
}

interface BlockEntry {
  expiresAt: number;
  reason: string;
}

const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 10000,
  ttl: 60 * 1000,
});

const abuseCache = new LRUCache<string, AbuseEntry>({
  max: 1000,
  ttl: ABUSE_DETECTION_WINDOW_MS,
});

const blockCache = new LRUCache<string, BlockEntry>({
  max: 1000,
  ttl: IP_BLOCK_DURATION_MS,
});

export function getIdentifier(
  ip: string | null,
  userId?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip || 'unknown'}`;
}

export function isWhitelisted(ip: string | null): boolean {
  if (!ip) return false;
  return WHITELISTED_IPS.includes(ip);
}

function isBlocked(identifier: string): { blocked: boolean; reason?: string } {
  const blockEntry = blockCache.get(identifier);

  if (!blockEntry) {
    return { blocked: false };
  }

  const now = Date.now();
  if (now >= blockEntry.expiresAt) {
    blockCache.delete(identifier);
    return { blocked: false };
  }

  return { blocked: true, reason: blockEntry.reason };
}

function recordViolation(identifier: string): void {
  const now = Date.now();
  const abuseEntry = abuseCache.get(identifier);

  if (!abuseEntry) {
    abuseCache.set(identifier, {
      violations: 1,
      resetAt: now + ABUSE_DETECTION_WINDOW_MS,
    });
    return;
  }

  if (now >= abuseEntry.resetAt) {
    abuseCache.set(identifier, {
      violations: 1,
      resetAt: now + ABUSE_DETECTION_WINDOW_MS,
    });
    return;
  }

  const violations = abuseEntry.violations + 1;
  abuseCache.set(identifier, {
    violations,
    resetAt: abuseEntry.resetAt,
  });

  if (violations >= ABUSE_DETECTION_THRESHOLD) {
    blockCache.set(identifier, {
      expiresAt: now + IP_BLOCK_DURATION_MS,
      reason: `Exceeded rate limit ${violations} times in ${ABUSE_DETECTION_WINDOW_MS / 1000}s`,
    });
  }
}

export function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'default',
  ip?: string | null
): RateLimitResult {
  if (!RATE_LIMITING_ENABLED) {
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    };
  }

  if (ip && isWhitelisted(ip)) {
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    };
  }

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

  if (entry.count >= config.limit) {
    recordViolation(identifier);

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

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

export function resetRateLimit(identifier: string, tier?: RateLimitTier): void {
  if (tier) {
    const key = `${tier}:${identifier}`;
    rateLimitCache.delete(key);
  } else {
    const tiers: RateLimitTier[] = ['auth', 'payment', 'apiKey', 'search', 'readonly', 'default'];
    tiers.forEach(t => {
      const key = `${t}:${identifier}`;
      rateLimitCache.delete(key);
    });
  }
}

export function resetAbuse(identifier: string): void {
  abuseCache.delete(identifier);
  blockCache.delete(identifier);
}

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

export function clearAllRateLimits(): void {
  rateLimitCache.clear();
  abuseCache.clear();
  blockCache.clear();
}
