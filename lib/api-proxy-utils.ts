/**
 * API Proxy Utilities
 *
 * Provides shared utilities for proxying requests to external APIs
 * with retry logic, timeout handling, and error management.
 */

export interface ProxyConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  retries?: number;
  timeout?: number;
  retryDelay?: number;
}

export interface ProxyRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ProxyError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ProxyError';
  }
}

/**
 * Delays execution for a specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates exponential backoff delay
 */
function getBackoffDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000);
}

/**
 * Proxies a request to an external API with retry logic and timeout
 */
export async function proxyRequest(
  path: string,
  config: ProxyConfig,
  options: ProxyRequestOptions = {}
): Promise<Response> {
  const {
    baseUrl,
    headers: configHeaders = {},
    retries = 3,
    timeout = 10000,
    retryDelay = 1000,
  } = config;

  const {
    timeout: optionsTimeout = timeout,
    retries: optionsRetries = retries,
    retryDelay: optionsRetryDelay = retryDelay,
    ...fetchOptions
  } = options;

  const url = `${baseUrl}/${path.replace(/^\//, '')}`;
  let lastError: unknown;

  for (let attempt = 1; attempt <= optionsRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), optionsTimeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...configHeaders,
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If response is OK or client error (4xx), return immediately
      // Only retry on server errors (5xx) or network errors
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error - retry if we have attempts left
      if (attempt < optionsRetries) {
        const backoffDelay = getBackoffDelay(attempt, optionsRetryDelay);
        console.warn(
          `[Proxy] Server error ${response.status} for ${url}, retrying in ${backoffDelay}ms (attempt ${attempt}/${optionsRetries})`
        );
        await delay(backoffDelay);
        continue;
      }

      // Last attempt and still failed
      return response;
    } catch (error) {
      lastError = error;

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        if (attempt === optionsRetries) {
          throw new ProxyError(
            `Request timeout after ${optionsTimeout}ms`,
            504,
            error
          );
        }
        console.warn(
          `[Proxy] Timeout for ${url}, retrying (attempt ${attempt}/${optionsRetries})`
        );
      } else {
        // Network error or other fetch error
        if (attempt === optionsRetries) {
          throw new ProxyError(
            'Failed to connect to external service',
            503,
            error
          );
        }
        console.warn(
          `[Proxy] Network error for ${url}, retrying (attempt ${attempt}/${optionsRetries})`
        );
      }

      // Wait before retrying
      const backoffDelay = getBackoffDelay(attempt, optionsRetryDelay);
      await delay(backoffDelay);
    }
  }

  // Should never reach here, but just in case
  throw new ProxyError(
    `Failed after ${optionsRetries} retries`,
    503,
    lastError
  );
}

/**
 * Parses the response body safely, handling both JSON and text
 */
export async function parseResponseBody(
  response: Response
): Promise<unknown> {
  const contentType = response.headers.get('content-type');

  try {
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error('[Proxy] Failed to parse response body:', error);
    return null;
  }
}

/**
 * Creates a standardized error response for proxy endpoints
 */
export function createProxyErrorResponse(
  error: unknown,
  defaultMessage: string = 'Proxy request failed'
): Response {
  if (error instanceof ProxyError) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'PROXY_ERROR',
          message: error.message,
        },
      }),
      {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  console.error('[Proxy] Unexpected error:', error);

  return new Response(
    JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: defaultMessage,
      },
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Extracts and sanitizes query parameters from a URL
 */
export function extractQueryParams(url: URL): string {
  return url.search;
}

/**
 * Validates that required environment variables are present
 */
export function validateEnvVar(
  name: string,
  value: string | undefined
): string {
  if (!value) {
    throw new ProxyError(
      `${name} environment variable not configured`,
      500
    );
  }
  return value;
}

/**
 * Logs proxy request for debugging
 */
export function logProxyRequest(
  method: string,
  path: string,
  target: string
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Proxy] ${method} ${path} -> ${target}`);
  }
}

/**
 * Forwards request headers from client to proxied service
 */
export function forwardHeaders(
  request: Request,
  allowedHeaders: string[] = []
): Record<string, string> {
  const headers: Record<string, string> = {};

  allowedHeaders.forEach((header) => {
    const value = request.headers.get(header);
    if (value) {
      headers[header] = value;
    }
  });

  return headers;
}

/**
 * Rate limit error response helper
 */
export function createRateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter,
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}
