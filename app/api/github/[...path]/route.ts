/**
 * GitHub API Proxy Route
 * Proxies requests to GitHub API to avoid exposing tokens and CORS issues
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

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[]
) {
  // Apply rate limiting (API tier: 60 requests/minute)
  const rateLimitResult = await applyRateLimit(request, { tier: 'api' });
  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      {
        error: {
          code: 'CONFIG_ERROR',
          message: 'GitHub token not configured',
        },
      },
      { status: 500 }
    );
  }

  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const queryParams = extractQueryParams(url);
    const targetPath = `${path}${queryParams}`;

    // Log request in development
    logProxyRequest(request.method, path, GITHUB_API_BASE);

    // Prepare GitHub API headers
    const githubHeaders: Record<string, string> = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'AINative-Studio-Website',
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
        baseUrl: GITHUB_API_BASE,
        headers: githubHeaders,
        retries: 2, // GitHub has good uptime, 2 retries should be enough
        timeout: 15000, // 15s timeout for GitHub API
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

    // Forward GitHub's rate limit headers
    const githubRateLimitHeaders = [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-RateLimit-Used',
    ];
    githubRateLimitHeaders.forEach((header) => {
      const value = response.headers.get(header);
      if (value) {
        jsonResponse.headers.set(`X-GitHub-${header}`, value);
      }
    });

    return jsonResponse;
  } catch (error) {
    console.error('[GitHub Proxy Error]', error);
    return createProxyErrorResponse(
      error,
      'Failed to proxy request to GitHub API'
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
