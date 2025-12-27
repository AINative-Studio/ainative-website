/**
 * Luma API Base Client
 * Handles authentication, rate limiting, and error handling
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import type { LumaApiError as LumaApiErrorResponse, LumaRateLimitInfo } from './types';

// Environment configuration for Next.js
const isServer = typeof window === 'undefined';
const isDev = process.env.NODE_ENV !== 'production';

// API URL configuration - uses Next.js API route as proxy
const LUMA_API_URL = process.env.NEXT_PUBLIC_LUMA_API_URL || '/api/luma';

// API Key - only available server-side
const LUMA_API_KEY = isServer ? process.env.LUMA_API_KEY : undefined;


// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS: 300,
  WINDOW_MS: 60000, // 1 minute
};

class LumaRateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = RATE_LIMIT.MAX_REQUESTS, windowMs: number = RATE_LIMIT.WINDOW_MS) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();

    // Remove requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);

      console.warn(`Rate limit reached. Waiting ${waitTime}ms before next request.`);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Recursively check again after waiting
      return this.checkLimit();
    }

    this.requests.push(now);
  }

  getRateLimitInfo(): LumaRateLimitInfo {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    const oldestRequest = this.requests[0];
    const resetTime = oldestRequest ? oldestRequest + this.windowMs : now + this.windowMs;

    return {
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - this.requests.length),
      reset: Math.floor(resetTime / 1000),
    };
  }
}

export class LumaApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LumaApiError';
  }
}

export class LumaApiClient {
  private client: AxiosInstance;
  private rateLimiter: LumaRateLimiter;

  constructor(apiKey?: string, baseURL?: string) {
    const key = apiKey || LUMA_API_KEY;
    const url = baseURL || LUMA_API_URL;

    // In development with proxy, we don't need the API key (proxy adds it)
    const isProxyMode = url === '/api/luma' || url.startsWith('/api/luma');

    if (!key && !isProxyMode) {
      throw new Error('Luma API key is required. Set LUMA_API_KEY in your .env file.');
    }

    this.rateLimiter = new LumaRateLimiter();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only add API key header if not using proxy
    if (!isProxyMode && key) {
      headers['x-luma-api-key'] = key;
    }

    this.client = axios.create({
      baseURL: `${url}/public/v1`,
      headers,
      timeout: 30000, // 30 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - rate limiting and logging
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        await this.rateLimiter.checkLimit();

        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) {
          console.log(`[Luma API] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - error handling
    this.client.interceptors.response.use(
      (response) => {
        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) {
          console.log(`[Luma API] Response:`, response.status);
        }
        return response;
      },
      (error: AxiosError<LumaApiErrorResponse>) => {
        return this.handleError(error);
      }
    );
  }

  private handleError(error: AxiosError<LumaApiErrorResponse>): Promise<never> {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const errorMessage = data?.error?.message || error.message;
      const errorCode = data?.error?.code;
      const errorDetails = data?.error?.details;

      console.error(`[Luma API Error] ${status}: ${errorMessage}`);

      throw new LumaApiError(errorMessage, status, errorCode, errorDetails);
    } else if (error.request) {
      // Request made but no response
      console.error('[Luma API Error] No response from server');
      throw new LumaApiError('No response from Luma API server', undefined, 'NO_RESPONSE');
    } else {
      // Error setting up request
      console.error('[Luma API Error]', error.message);
      throw new LumaApiError(error.message, undefined, 'REQUEST_SETUP_ERROR');
    }
  }

  public getRateLimitInfo(): LumaRateLimitInfo {
    return this.rateLimiter.getRateLimitInfo();
  }

  public async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  public async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  public async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  public async patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  public async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }
}

// Create and export a singleton instance
export const lumaClient = new LumaApiClient();
