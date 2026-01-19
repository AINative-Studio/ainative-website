/**
 * Rate Limiting Middleware
 *
 * Provides middleware for Next.js API routes to enforce rate limits,
 * prevent abuse, and ensure fair usage.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  getIdentifier,
  RateLimitResult,
} from '@/lib/rate-limit';
import { RateLimitTier } from '@/lib/rate-limit-config';

export interface RateLimitOptions {
  /**
   * Rate limit tier to apply
   */
  tier: RateLimitTier;

  /**
   * User ID for authenticated requests (optional)
   */
  userId?: string | null;

  /**
   * Custom error message (optional)
   */
  errorMessage?: string;
}

/**
 * Extract IP address from Next.js request
 */
export function getIpAddress(request: NextRequest): string | null {
  // Check x-forwarded-for header (set by proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    const ips = forwardedFor.split(',');
    return ips[0]?.trim() || null;
  }

  // Check x-real-ip header (set by some proxies)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fall back to request.ip (may not be available in all environments)
  return request.ip || null;
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  // Add Retry-After header if rate limited
  if (!result.success) {
    const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000);
    headers['Retry-After'] = Math.max(0, retryAfterSeconds).toString();
  }

  return headers;
}

/**
 * Create rate limit error response
 */
export function createRateLimitErrorResponse(
  result: RateLimitResult,
  customMessage?: string
): NextResponse {
  const headers = createRateLimitHeaders(result);

  let message = customMessage || 'Rate limit exceeded. Please try again later.';

  // Add block information if blocked
  if (result.blocked && result.blockReason) {
    message = `Access blocked due to repeated violations: ${result.blockReason}`;
  }

  return NextResponse.json(
    {
      error: {
        code: result.blocked ? 'IP_BLOCKED' : 'RATE_LIMIT_EXCEEDED',
        message,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: headers['Retry-After'],
      },
    },
    {
      status: result.blocked ? 403 : 429,
      headers,
    }
  );
}

/**
 * Rate limiting middleware for API routes
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await applyRateLimit(request, { tier: 'auth' });
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *
 *   // Your API logic here
 *   return NextResponse.json({ success: true });
 * }
 * ```
 */
export async function applyRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<{
  success: boolean;
  response?: NextResponse;
  headers: Record<string, string>;
  result: RateLimitResult;
}> {
  const { tier, userId, errorMessage } = options;

  // Extract IP address
  const ip = getIpAddress(request);

  // Get identifier (user ID or IP)
  const identifier = getIdentifier(ip, userId);

  // Check rate limit
  const result = checkRateLimit(identifier, tier, ip);

  // Create headers
  const headers = createRateLimitHeaders(result);

  // If rate limit exceeded, return error response
  if (!result.success) {
    return {
      success: false,
      response: createRateLimitErrorResponse(result, errorMessage),
      headers,
      result,
    };
  }

  // Rate limit passed
  return {
    success: true,
    headers,
    result,
  };
}

/**
 * Wrapper function to apply rate limiting to API route handlers
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (request: NextRequest) => {
 *     // Your API logic here
 *     return NextResponse.json({ success: true });
 *   },
 *   { tier: 'auth' }
 * );
 * ```
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: RateLimitOptions
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, options);

    // If rate limited, return error response
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    // Call the actual handler
    const response = await handler(request, ...args);

    // Add rate limit headers to response
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Helper to create a response with rate limit headers
 */
export function createResponseWithRateLimitHeaders(
  response: NextResponse,
  headers: Record<string, string>
): NextResponse {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
