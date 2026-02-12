/**
 * ApiClient error message extraction tests
 * Issue #578: ZeroDB getStats throws [object Object] due to unhandled error shape
 */

// Mock dependencies before importing
jest.mock('../config/app', () => ({
  appConfig: {
    api: {
      baseUrl: 'https://api.test.com',
      timeout: 5000,
    },
  },
}));

jest.mock('@/utils/authCookies', () => ({
  getAuthToken: jest.fn(() => 'test-token'),
  clearAuthData: jest.fn(),
}));

jest.mock('@/services/authService', () => ({
  authService: {
    refreshAccessToken: jest.fn(),
  },
}));

describe('ApiClient', () => {
  let apiClient: typeof import('../api-client').default;

  beforeEach(() => {
    jest.resetModules();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const setupApiClient = async () => {
    const mod = await import('../api-client');
    apiClient = mod.default;
  };

  const mockFetchResponse = (status: number, data: unknown, statusText = 'Error') => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      statusText,
      json: async () => data,
    });
  };

  describe('error message extraction', () => {
    beforeEach(async () => {
      await setupApiClient();
    });

    it('extracts string message from { message: "string" }', async () => {
      mockFetchResponse(400, { message: 'Bad request error' });

      await expect(apiClient.get('/test')).rejects.toThrow('Bad request error');
    });

    it('extracts string detail from { detail: "string" }', async () => {
      mockFetchResponse(404, { detail: 'Not Found' });

      await expect(apiClient.get('/test')).rejects.toThrow('Not Found');
    });

    it('handles nested detail object with message field', async () => {
      mockFetchResponse(410, {
        detail: {
          warning: 'DEPRECATED',
          deprecated_path: '/zerodb/stats',
          canonical_path: '/v1/projects/{project_id}',
          message: 'This endpoint has been deprecated',
        },
      });

      await expect(apiClient.get('/test')).rejects.toThrow(
        'This endpoint has been deprecated'
      );
    });

    it('handles nested detail object without message field via JSON.stringify', async () => {
      mockFetchResponse(410, {
        detail: {
          warning: 'DEPRECATED',
          deprecated_path: '/zerodb/stats',
        },
      });

      const error = await apiClient.get('/test').catch((e: Error) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('DEPRECATED');
      expect(error.message).not.toBe('[object Object]');
    });

    it('does NOT produce [object Object] when message is an object', async () => {
      mockFetchResponse(500, {
        message: { code: 'ERR', text: 'nested error' },
      });

      const error = await apiClient.get('/test').catch((e: Error) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).not.toBe('[object Object]');
      expect(error.message).toContain('ERR');
    });

    it('handles array detail (FastAPI 422 validation errors)', async () => {
      mockFetchResponse(422, {
        detail: [
          { type: 'value_error', loc: ['body', 'email'], msg: 'Invalid email' },
          { type: 'value_error', loc: ['body', 'name'], msg: 'Required field' },
        ],
      });

      const error = await apiClient.get('/test').catch((e: Error) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Invalid email');
      expect(error.message).toContain('Required field');
      expect(error.message).not.toBe('[object Object]');
    });

    it('uses plain string data directly', async () => {
      mockFetchResponse(500, 'Internal Server Error');

      await expect(apiClient.get('/test')).rejects.toThrow('Internal Server Error');
    });

    it('falls back to HTTP status when data has no recognized fields', async () => {
      mockFetchResponse(503, { foo: 'bar' }, 'Service Unavailable');

      await expect(apiClient.get('/test')).rejects.toThrow('HTTP 503: Service Unavailable');
    });

    it('handles null data gracefully', async () => {
      mockFetchResponse(500, null, 'Internal Server Error');

      await expect(apiClient.get('/test')).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('successful responses', () => {
    beforeEach(async () => {
      await setupApiClient();
    });

    it('returns data for 200 responses', async () => {
      mockFetchResponse(200, { success: true, data: { id: 1 } });

      const result = await apiClient.get('/test');
      expect(result.data).toEqual({ success: true, data: { id: 1 } });
      expect(result.status).toBe(200);
    });
  });
});
