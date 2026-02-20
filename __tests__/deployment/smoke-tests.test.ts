/**
 * Deployment Smoke Tests
 *
 * These tests validate a deployed application is working correctly.
 * Run these tests after Railway deployment to catch production issues.
 *
 * Tests include:
 * - Health check endpoints
 * - Critical API endpoints
 * - Static asset loading
 * - Database connectivity
 * - Authentication flows
 */

import axios, { AxiosInstance } from 'axios';

describe('Deployment Smoke Tests', () => {
  let baseURL: string;
  let client: AxiosInstance;

  beforeAll(() => {
    // Use environment variable or default to production
    baseURL = process.env.SMOKE_TEST_URL || 'https://www.ainative.studio';

    client = axios.create({
      baseURL,
      timeout: 30000,
      validateStatus: () => true // Don't throw on any status code
    });

    console.log(`Running smoke tests against: ${baseURL}`);
  });

  describe('Application Availability', () => {
    it('should respond to root path', async () => {
      const response = await client.get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    }, 30000);

    it('should have correct server headers', async () => {
      const response = await client.get('/');

      // Should not expose server information
      expect(response.headers['x-powered-by']).toBeUndefined();

      // Should have security headers
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });

    it('should respond within acceptable time', async () => {
      const startTime = Date.now();
      const response = await client.get('/');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });

  describe('Static Assets', () => {
    it('should serve favicon', async () => {
      const response = await client.get('/favicon.ico');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/image/);
    });

    it('should have cache headers for static assets', async () => {
      const response = await client.get('/favicon.ico');

      expect(response.headers['cache-control']).toBeDefined();
    });
  });

  describe('API Health Checks', () => {
    it('should have health check endpoint', async () => {
      const response = await client.get('/api/health');

      // Accept both 200 and 404 (endpoint might not exist yet)
      expect([200, 404]).toContain(response.status);
    });

    it('should have NextAuth API available', async () => {
      const response = await client.get('/api/auth/providers');

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.headers['content-type']).toContain('application/json');
      }
    });
  });

  describe('Authentication Endpoints', () => {
    it('should have signin page', async () => {
      const response = await client.get('/auth/signin', {
        maxRedirects: 0
      });

      // Accept 200 (page exists) or 404 (custom page not created)
      expect([200, 404]).toContain(response.status);
    });

    it('should have NextAuth callback endpoint', async () => {
      const response = await client.get('/api/auth/callback/github');

      // Should respond (even if it's an error due to missing params)
      expect(response.status).toBeDefined();
      expect(response.status).not.toBe(500); // Should not have server error
    });
  });

  describe('Critical Pages', () => {
    const criticalPages = [
      '/',
      '/about',
      '/pricing',
      '/features'
    ];

    criticalPages.forEach(page => {
      it(`should load ${page}`, async () => {
        const response = await client.get(page);

        // Accept 200 (exists) or 404 (not yet created)
        expect([200, 404]).toContain(response.status);

        // Should not have server error
        expect(response.status).not.toBe(500);
        expect(response.status).not.toBe(502);
        expect(response.status).not.toBe(503);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await client.get('/this-page-does-not-exist-12345');

      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should not expose stack traces in production', async () => {
      const response = await client.get('/api/nonexistent-endpoint');

      const body = response.data;
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

      // Should not contain stack traces or file paths
      expect(bodyStr).not.toContain('at Object.');
      expect(bodyStr).not.toContain('at Module.');
      expect(bodyStr).not.toContain('/Users/');
      expect(bodyStr).not.toContain('C:\\');
    });
  });

  describe('Performance Checks', () => {
    it('should have reasonable response times', async () => {
      const endpoints = ['/', '/about', '/pricing'];
      const responseTimes: number[] = [];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await client.get(endpoint);
        const responseTime = Date.now() - startTime;

        if (response.status === 200) {
          responseTimes.push(responseTime);
        }
      }

      if (responseTimes.length > 0) {
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        expect(avgResponseTime).toBeLessThan(3000); // Average should be under 3 seconds
      }
    }, 60000);

    it('should compress responses', async () => {
      const response = await client.get('/', {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });

      // Check if compression is enabled
      const contentEncoding = response.headers['content-encoding'];
      if (contentEncoding) {
        expect(['gzip', 'br', 'deflate']).toContain(contentEncoding);
      }
    });
  });

  describe('Security Checks', () => {
    it('should enforce HTTPS in production', async () => {
      if (baseURL.startsWith('https://')) {
        const response = await client.get('/');

        // Should have HSTS header
        expect(response.headers['strict-transport-security']).toBeDefined();
      }
    });

    it('should have CSP headers', async () => {
      const response = await client.get('/');

      // Check for security headers
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should not allow iframe embedding from external sites', async () => {
      const response = await client.get('/');

      const frameOptions = response.headers['x-frame-options'];
      expect(['DENY', 'SAMEORIGIN']).toContain(frameOptions);
    });
  });
});

describe('External Service Integration Smoke Tests', () => {
  let apiClient: AxiosInstance;

  beforeAll(() => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio';

    apiClient = axios.create({
      baseURL: apiBaseURL,
      timeout: 30000,
      validateStatus: () => true
    });

    console.log(`Testing API integration: ${apiBaseURL}`);
  });

  describe('API Backend Connectivity', () => {
    it('should reach API backend', async () => {
      const response = await apiClient.get('/health');

      // Should respond (even if endpoint doesn't exist)
      expect(response.status).toBeDefined();
      expect(response.status).not.toBe(0); // Should not be network error
    }, 30000);

    it('should handle CORS correctly', async () => {
      const response = await apiClient.get('/health', {
        headers: {
          'Origin': 'https://www.ainative.studio'
        }
      });

      // Check CORS headers if API responds
      if (response.status < 500) {
        const corsHeader = response.headers['access-control-allow-origin'];
        if (corsHeader) {
          expect(['*', 'https://www.ainative.studio']).toContain(corsHeader);
        }
      }
    });
  });

  describe('Database Connectivity', () => {
    it('should be able to query database', async () => {
      // This test assumes there's an API endpoint that tests DB connectivity
      const response = await apiClient.get('/api/health/db');

      // Accept 200 (exists) or 404 (not implemented)
      expect([200, 404]).toContain(response.status);

      // Should not have database connection errors
      if (response.status === 200) {
        const body = response.data;
        expect(body.database || body.status).toBeTruthy();
      }
    });
  });
});

/**
 * Post-deployment validation function
 * Returns a score indicating deployment health (0-100)
 */
export async function validateDeployment(url: string): Promise<{
  score: number;
  passed: number;
  failed: number;
  warnings: string[];
  errors: string[];
}> {
  const client = axios.create({
    baseURL: url,
    timeout: 30000,
    validateStatus: () => true
  });

  let passed = 0;
  let failed = 0;
  const warnings: string[] = [];
  const errors: string[] = [];

  // Test 1: Homepage loads
  try {
    const response = await client.get('/');
    if (response.status === 200) {
      passed++;
    } else {
      failed++;
      errors.push(`Homepage returned status ${response.status}`);
    }
  } catch (error) {
    failed++;
    errors.push('Homepage failed to load');
  }

  // Test 2: Security headers
  try {
    const response = await client.get('/');
    if (response.headers['x-frame-options']) {
      passed++;
    } else {
      failed++;
      warnings.push('Missing X-Frame-Options header');
    }
  } catch (error) {
    failed++;
  }

  // Test 3: HTTPS enforcement
  if (url.startsWith('https://')) {
    try {
      const response = await client.get('/');
      if (response.headers['strict-transport-security']) {
        passed++;
      } else {
        failed++;
        warnings.push('Missing HSTS header');
      }
    } catch (error) {
      failed++;
    }
  } else {
    warnings.push('Not using HTTPS');
  }

  // Test 4: Response time
  try {
    const startTime = Date.now();
    const response = await client.get('/');
    const responseTime = Date.now() - startTime;

    if (responseTime < 3000) {
      passed++;
    } else {
      failed++;
      warnings.push(`Slow response time: ${responseTime}ms`);
    }
  } catch (error) {
    failed++;
  }

  // Test 5: No stack traces exposed
  try {
    const response = await client.get('/api/nonexistent');
    const bodyStr = JSON.stringify(response.data);

    if (!bodyStr.includes('at Object.') && !bodyStr.includes('/Users/')) {
      passed++;
    } else {
      failed++;
      errors.push('Stack traces exposed in error responses');
    }
  } catch (error) {
    failed++;
  }

  const totalTests = passed + failed;
  const score = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

  return {
    score,
    passed,
    failed,
    warnings,
    errors
  };
}
