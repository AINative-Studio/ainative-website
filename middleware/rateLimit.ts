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
  tier: RateLimitTier;
  userId?: string | null;
  errorMessage?: string;
}

export function getIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0]?.trim() || null;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return request.ip || null;
}

export function createRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  if (!result.success) {
    const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000);
    headers['Retry-After'] = Math.max(0, retryAfterSeconds).toString();
  }

  return headers;
}

export function createRateLimitErrorResponse(
  result: RateLimitResult,
  customMessage?: string
): NextResponse {
  const headers = createRateLimitHeaders(result);

  let message = customMessage || 'Rate limit exceeded. Please try again later.';

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

  const ip = getIpAddress(request);
  const identifier = getIdentifier(ip, userId);
  const result = checkRateLimit(identifier, tier, ip);
  const headers = createRateLimitHeaders(result);

  if (!result.success) {
    return {
      success: false,
      response: createRateLimitErrorResponse(result, errorMessage),
      headers,
      result,
    };
  }

  return {
    success: true,
    headers,
    result,
  };
}

export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: RateLimitOptions
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const rateLimitResult = await applyRateLimit(request, options);

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const response = await handler(request, ...args);

    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

export function createResponseWithRateLimitHeaders(
  response: NextResponse,
  headers: Record<string, string>
): NextResponse {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
