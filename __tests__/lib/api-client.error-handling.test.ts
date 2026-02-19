/**
 * Tests for API Client Error Handling
 *
 * Tests the fix for issue #578: [BUG] ZeroDB getStats throws [object Object]
 *
 * Verifies that:
 * 1. Error messages are always human-readable strings, never [object Object]
 * 2. ApiClient properly extracts error messages from various response shapes
 * 3. Nested error objects are handled correctly
 * 4. Error logging works for debugging
 *
 * Refs #578
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('ApiClient Error Handling - Issue #578', () => {
  // Mock fetch before importing apiClient
  const mockFetch = jest.fn();
  global.fetch = mockFetch as any;

  // Import after mocking
  const apiClientModule = require('@/lib/api-client');
  const apiClient = apiClientModule.default;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('String validation for error messages', () => {
    it('should validate that extracted error message is a string before using it', async () => {
      // Mock response with nested object message (the bug scenario from issue #578)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          message: {
            code: 'ERR_DATABASE',
            text: 'Connection failed',
          },
        }),
      } as Response);

      try {
        await apiClient.get('/v1/public/zerodb/stats');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Error message should NOT be [object Object]
        expect(error.message).not.toBe('[object Object]');

        // Error message should be a string
        expect(typeof error.message).toBe('string');

        // Error message should be meaningful (either extracted or fallback)
        expect(error.message.length).toBeGreaterThan(0);
      }
    });

    it('should extract string message from data.message when it is a string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Invalid request parameters',
        }),
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Invalid request parameters');
      }
    });

    it('should extract string detail from data.detail when message is not available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: 'Validation error occurred',
        }),
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Validation error occurred');
      }
    });

    it('should use plain string data when it is the response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => 'Server error occurred',
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Server error occurred');
      }
    });

    it('should fall back to HTTP status text when no valid error message found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({
          code: 'SERVICE_DOWN',
          timestamp: '2025-01-15T10:00:00Z',
        }),
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('HTTP 503: Service Unavailable');
      }
    });
  });

  describe('Nested error object handling', () => {
    it('should handle message as nested object and extract meaningful text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          message: {
            error_message: 'Database connection failed',
            code: 'ERR_001',
          },
        }),
      } as Response);

      try {
        await apiClient.get('/v1/public/zerodb/stats');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Should NOT be [object Object]
        expect(error.message).not.toContain('[object Object]');

        // Should extract the error_message field
        expect(error.message).toContain('Database connection failed');
      }
    });

    it('should handle deeply nested error structures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: {
            text: 'Validation failed',
            details: {
              field: 'namespace',
              reason: 'required',
            },
          },
        }),
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).not.toBe('[object Object]');
        expect(typeof error.message).toBe('string');
      }
    });

    it('should handle error response with no message or detail fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error_code: 'INTERNAL_ERROR',
          timestamp: Date.now(),
        }),
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Should fall back to HTTP status
        expect(error.message).toBe('HTTP 500: Internal Server Error');
      }
    });
  });

  describe('FastAPI/Pydantic validation error format', () => {
    it('should handle FastAPI 422 validation errors with detail array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: [
            {
              loc: ['body', 'namespace'],
              msg: 'field required',
              type: 'value_error.missing',
            },
            {
              loc: ['body', 'dimensions'],
              msg: 'value is not a valid integer',
              type: 'type_error.integer',
            },
          ],
        }),
      } as Response);

      try {
        await apiClient.post('/v1/public/zerodb/namespaces', {});
        fail('Should have thrown an error');
      } catch (error: any) {
        // Should handle array detail properly
        expect(error.message).not.toBe('[object Object]');
        expect(typeof error.message).toBe('string');
        expect(error.message).toContain('Validation error');
        expect(error.message).toContain('field required');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle null response data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => null,
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('HTTP 500: Internal Server Error');
      }
    });

    it('should handle empty object response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('HTTP 500: Internal Server Error');
      }
    });

    it('should handle error message that is an empty string', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: '',
        }),
      } as Response);

      try {
        await apiClient.get('/test');
        fail('Should have thrown an error');
      } catch (error: any) {
        // Empty string should fall back to HTTP status
        expect(error.message).toBe('HTTP 400: Bad Request');
      }
    });
  });

  describe('ZeroDB getStats specific scenarios', () => {
    it('should handle getStats error without throwing [object Object]', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch statistics',
          },
        }),
      } as Response);

      try {
        await apiClient.get('/v1/public/zerodb/stats');
        fail('Should have thrown an error');
      } catch (error: any) {
        // This is the exact scenario from issue #578
        expect(error.message).not.toBe('[object Object]');
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
      }
    });

    it('should handle backend returning error with nested structure', async () => {
      // Simulate the exact error structure that was causing [object Object]
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          message: {
            error_type: 'DatabaseConnectionError',
            error_message: 'Connection to vector DB failed',
            traceback: ['line 1', 'line 2'],
          },
        }),
      } as Response);

      try {
        await apiClient.get('/v1/public/zerodb/stats');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).not.toBe('[object Object]');
        expect(typeof error.message).toBe('string');
        // Should extract error_message
        expect(error.message).toContain('Connection to vector DB failed');
      }
    });
  });
});
