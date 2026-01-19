/**
 * Backend API Proxy Route
 * Proxies requests to AINative backend services
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/middleware/rateLimit';
import {
  proxyRequest,
  parseResponseBody,
  createProxyErrorResponse,
  logProxyRequest,
  extractQueryParams,
  forwardHeaders,
} from '@/lib/api-proxy-utils';

const BACKEND_BASE_URL =
  process.env.AINATIVE_BACKEND_URL || 'https://api.ainative.studio';

// Headers to forward from client to backend
const FORWARDED_HEADERS = ['Authorization', 'X-Request-ID', 'X-Session-ID'];

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[]
) {
  // Apply rate limiting (API tier: 60 requests/minute)
  const rateLimitResult = await applyRateLimit(request, { tier: 'api' });
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const queryParams = extractQueryParams(url);
    const targetPath = `${path}${queryParams}`;

    // Log request in development
    logProxyRequest(request.method, path, BACKEND_BASE_URL);

    // Forward authorization and tracking headers
    const forwardedHeaders = forwardHeaders(request, FORWARDED_HEADERS);

    // Prepare request body for non-GET requests
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    // Make proxied request with retry logic
    const response = await proxyRequest(
      targetPath,
      {
        baseUrl: BACKEND_BASE_URL,
        headers: forwardedHeaders,
        retries: 3,
        timeout: 30000, // 30s timeout for backend API
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

    // Add rate limit headers to response
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      jsonResponse.headers.set(key, value);
    });

    // Forward response headers from backend
    const headersToForward = ['X-Request-ID', 'X-RateLimit-Remaining'];
    headersToForward.forEach((header) => {
      const value = response.headers.get(header);
      if (value) {
        jsonResponse.headers.set(header, value);
      }
    });

    return jsonResponse;
  } catch (error) {
    console.error('[Backend Proxy Error]', error);
    return createProxyErrorResponse(
      error,
      'Failed to proxy request to backend API'
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
