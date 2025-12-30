/**
 * Luma API Proxy Route
 * Proxies requests to Luma API to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

const LUMA_API_BASE = 'https://api.lu.ma';
const LUMA_API_KEY = process.env.LUMA_API_KEY;

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  if (!LUMA_API_KEY) {
    return NextResponse.json(
      { error: { code: 'CONFIG_ERROR', message: 'Luma API key not configured' } },
      { status: 500 }
    );
  }

  const path = pathSegments.join('/');
  const url = new URL(request.url);
  const targetUrl = `${LUMA_API_BASE}/${path}${url.search}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-luma-api-key': LUMA_API_KEY,
  };

  try {
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Luma Proxy Error]', error);
    return NextResponse.json(
      { error: { code: 'PROXY_ERROR', message: 'Failed to proxy request to Luma API' } },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
