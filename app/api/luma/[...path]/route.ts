/**
 * Luma API Proxy Route
 * Proxies requests to Luma API to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/middleware/rateLimit';
import {
  proxyRequest,
  parseResponseBody,
  createProxyErrorResponse,
  logProxyRequest,
  extractQueryParams,
} from '@/lib/api-proxy-utils';

const LUMA_API_BASE = 'https://api.lu.ma';
const LUMA_API_KEY = process.env.LUMA_API_KEY;

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[]
) {
  // Apply rate limiting (search tier: 30 requests/minute)
  const rateLimitResult = await applyRateLimit(request, { tier: 'search' });
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  if (!LUMA_API_KEY) {
    // Return empty successful response when API key not configured (dev mode)
    console.warn('[Luma Proxy] API key not configured, returning empty response');
    return NextResponse.json(
      {
        entries: [],
        has_more: false,
        next_cursor: null,
      },
      { status: 200 }
    );
  }

  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const queryParams = extractQueryParams(url);
    const targetPath = `${path}${queryParams}`;

    // Log request in development
    logProxyRequest(request.method, path, LUMA_API_BASE);

    // Prepare Luma API headers
    const lumaHeaders: Record<string, string> = {
      'x-luma-api-key': LUMA_API_KEY,
    };

    // Prepare request body for non-GET requests
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    // Make proxied request with retry logic
    const response = await proxyRequest(
      targetPath,
      {
        baseUrl: LUMA_API_BASE,
        headers: lumaHeaders,
        retries: 3,
        timeout: 20000, // 20s timeout for Luma API
      },
      {
        method: request.method,
        body,
      }
    );

    // Parse response body
    const data = await parseResponseBody(response);

    // Create response with rate limit headers
    const jsonResponse = NextResponse.json(data, { status: response.status });

    // Add our rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      jsonResponse.headers.set(key, value);
    });

    return jsonResponse;
  } catch (error) {
    console.error('[Luma Proxy Error]', error);
    return createProxyErrorResponse(
      error,
      'Failed to proxy request to Luma API'
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path);
}
