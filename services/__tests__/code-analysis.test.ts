/**
 * Code Analysis Service Tests
 * Comprehensive tests for QNN code analysis API integration
 *
 * Tests cover:
 * - API calls to QNN backend for code analysis
 * - Feature extraction from ML model
 * - Quality scoring
 * - Validation of inputs
 * - Error handling
 */

import {
  analyzeCode,
  extractFeatures,
  getQualityScore,
  validateCode,
  validateLanguage,
  validateAnalysisRequest,
  formatAnalysisError,
  checkAnalysisServiceHealth,
  SUPPORTED_LANGUAGES,
  MAX_CODE_SIZE,
  type AnalyzeCodeRequest,
  type AnalysisResult,
  type CodeMetrics,
} from '../qnn/code-analysis';

// Mock the QNNApiClient
jest.mock('@/services/QNNApiClient', () => {
  const mockPost = jest.fn();
  const mockGet = jest.fn();

  return {
    qnnApiClient: {
      client: {
        post: mockPost,
        get: mockGet,
      },
      healthCheck: jest.fn(),
    },
    QNNError: class QNNError extends Error {
      code: string;
      statusCode?: number;
      constructor(message: string, code = 'QNN_ERROR', statusCode?: number) {
        super(message);
        this.name = 'QNNError';
        this.code = code;
        this.statusCode = statusCode;
      }
      toJSON() {
        return { name: this.name, message: this.message, code: this.code };
      }
    },
    QNNNetworkError: class QNNNetworkError extends Error {
      code = 'QNN_NETWORK_ERROR';
      constructor(message = 'Network error') {
        super(message);
        this.name = 'QNNNetworkError';
      }
    },
    QNNTimeoutError: class QNNTimeoutError extends Error {
      code = 'QNN_TIMEOUT_ERROR';
      constructor(message = 'Timeout error') {
        super(message);
        this.name = 'QNNTimeoutError';
      }
    },
  };
});

// Mock appConfig
jest.mock('@/lib/config/app', () => ({
  appConfig: {
    qnn: {
      apiUrl: 'https://qnn-api.ainative.studio',
      timeout: 30000,
    },
  },
}));

// Get mocked functions - using import for mocked module
import { qnnApiClient } from '@/services/QNNApiClient';

const getMockedClient = () => {
  return {
    post: (qnnApiClient as unknown as { client: { post: jest.Mock; get: jest.Mock } }).client.post,
    get: (qnnApiClient as unknown as { client: { post: jest.Mock; get: jest.Mock } }).client.get,
    healthCheck: qnnApiClient.healthCheck as jest.Mock,
  };
};

describe('Code Analysis Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // analyzeCode() Tests
  // =========================================================================
  describe('analyzeCode()', () => {
    const mockAnalysisResult: AnalysisResult = {
      quality_score: 0.85,
      features: {
        file_size_bytes: 1500,
        line_count: 50,
        comment_count: 10,
        function_count: 5,
        class_count: 2,
        avg_function_length: 8,
        cyclomatic_complexity: 3,
        comment_ratio: 0.2,
      },
      normalized_features: [0.5, 0.2, 0.5, 0.4, 0.27, 0.85],
      suggestions: ['Consider adding more unit tests'],
      language: 'python',
      timestamp: '2025-01-22T10:00:00Z',
      model_version: '1.0.0',
      analysis_id: 'analysis-123',
    };

    const validRequest: AnalyzeCodeRequest = {
      code: 'def hello():\n    print("Hello, World!")',
      language: 'python',
    };

    it('should analyze code successfully', async () => {
      const { post } = getMockedClient();
      post.mockResolvedValue({ data: { data: mockAnalysisResult } });

      const result = await analyzeCode(validRequest);

      expect(post).toHaveBeenCalledWith('/v1/code/analyze', expect.objectContaining({
        code: validRequest.code,
        language: 'python',
        options: expect.objectContaining({
          include_suggestions: true,
          include_normalized_features: true,
        }),
      }));
      expect(result.quality_score).toBe(0.85);
      expect(result.features.function_count).toBe(5);
      expect(result.suggestions).toContain('Consider adding more unit tests');
    });

    it('should handle direct response data format', async () => {
      const { post } = getMockedClient();
      post.mockResolvedValue({ data: mockAnalysisResult });

      const result = await analyzeCode(validRequest);

      expect(result.quality_score).toBe(0.85);
    });

    it('should add timestamp if missing from response', async () => {
      const { post } = getMockedClient();
      const resultWithoutTimestamp = { ...mockAnalysisResult };
      delete (resultWithoutTimestamp as Partial<AnalysisResult>).timestamp;
      post.mockResolvedValue({ data: { data: resultWithoutTimestamp } });

      const result = await analyzeCode(validRequest);

      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should normalize language variations', async () => {
      const { post } = getMockedClient();
      post.mockResolvedValue({ data: { data: mockAnalysisResult } });

      await analyzeCode({ code: 'int main() {}', language: 'C++' });

      expect(post).toHaveBeenCalledWith('/v1/code/analyze', expect.objectContaining({
        language: 'cpp',
      }));
    });

    it('should merge custom options with defaults', async () => {
      const { post } = getMockedClient();
      post.mockResolvedValue({ data: { data: mockAnalysisResult } });

      await analyzeCode({
        ...validRequest,
        options: { detailed_metrics: true },
      });

      expect(post).toHaveBeenCalledWith('/v1/code/analyze', expect.objectContaining({
        options: expect.objectContaining({
          include_suggestions: true,
          include_normalized_features: true,
          detailed_metrics: true,
        }),
      }));
    });

    it('should throw validation error for empty code', async () => {
      await expect(analyzeCode({ code: '', language: 'python' }))
        .rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });
    });

    it('should throw validation error for whitespace-only code', async () => {
      await expect(analyzeCode({ code: '   \n\t  ', language: 'python' }))
        .rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });
    });

    it('should throw validation error for unsupported language', async () => {
      await expect(analyzeCode({ code: 'code', language: 'unsupported' }))
        .rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });
    });

    it('should throw error for invalid API response (missing quality_score)', async () => {
      const { post } = getMockedClient();
      post.mockResolvedValue({ data: { data: { features: {} } } });

      await expect(analyzeCode(validRequest))
        .rejects.toMatchObject({
          code: 'INVALID_RESPONSE',
        });
    });

    it('should re-throw QNN errors with context', async () => {
      const { post } = getMockedClient();
      const { QNNError } = jest.requireMock('@/services/QNNApiClient');
      const qnnError = new QNNError('API error', 'QNN_ERROR', 500);
      post.mockRejectedValue(qnnError);

      await expect(analyzeCode(validRequest)).rejects.toThrow('API error');
    });

    it('should wrap unexpected errors', async () => {
      const { post } = getMockedClient();
      post.mockRejectedValue(new Error('Unexpected error'));

      await expect(analyzeCode(validRequest))
        .rejects.toMatchObject({
          code: 'ANALYSIS_FAILED',
          message: 'Unexpected error',
        });
    });
  });

  // =========================================================================
  // extractFeatures() Tests
  // =========================================================================
  describe('extractFeatures()', () => {
    const mockFeatures: CodeMetrics = {
      file_size_bytes: 1000,
      line_count: 30,
      comment_count: 5,
      function_count: 3,
      class_count: 1,
      avg_function_length: 10,
      cyclomatic_complexity: 2,
      comment_ratio: 0.17,
    };

    it('should extract features successfully', async () => {
      const { post } = getMockedClient();
      post.mockResolvedValue({ data: { data: mockFeatures } });

      const result = await extractFeatures('def test(): pass', 'python');

      expect(post).toHaveBeenCalledWith('/v1/code/features', {
        code: 'def test(): pass',
        language: 'python',
      });
      expect(result.line_count).toBe(30);
      expect(result.function_count).toBe(3);
    });

    it('should handle direct response format', async () => {
      const { post } = getMockedClient();
      post.mockResolvedValue({ data: mockFeatures });

      const result = await extractFeatures('code', 'javascript');

      expect(result.file_size_bytes).toBe(1000);
    });

    it('should throw validation error for empty code', async () => {
      await expect(extractFeatures('', 'python'))
        .rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });
    });

    it('should throw validation error for unsupported language', async () => {
      await expect(extractFeatures('code', 'cobol'))
        .rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });
    });

    it('should re-throw QNN errors', async () => {
      const { post } = getMockedClient();
      const { QNNError } = jest.requireMock('@/services/QNNApiClient');
      post.mockRejectedValue(new QNNError('Feature extraction failed', 'QNN_ERROR'));

      await expect(extractFeatures('code', 'python'))
        .rejects.toThrow('Feature extraction failed');
    });

    it('should wrap non-QNN errors', async () => {
      const { post } = getMockedClient();
      post.mockRejectedValue(new Error('Random error'));

      await expect(extractFeatures('code', 'python'))
        .rejects.toMatchObject({
          code: 'EXTRACTION_FAILED',
        });
    });
  });

  // =========================================================================
  // getQualityScore() Tests
  // =========================================================================
  describe('getQualityScore()', () => {
    it('should return quality score from analysis', async () => {
      const { post } = getMockedClient();
      post.mockResolvedValue({
        data: {
          data: {
            quality_score: 0.92,
            features: {},
            language: 'typescript',
            timestamp: new Date().toISOString(),
          },
        },
      });

      const score = await getQualityScore('const x = 1;', 'typescript');

      expect(score).toBe(0.92);
    });

    it('should propagate validation errors', async () => {
      await expect(getQualityScore('', 'python'))
        .rejects.toMatchObject({
          code: 'VALIDATION_ERROR',
        });
    });
  });

  // =========================================================================
  // Validation Tests
  // =========================================================================
  describe('validateCode()', () => {
    it('should return valid for non-empty code', () => {
      expect(validateCode('const x = 1;')).toEqual({ valid: true });
    });

    it('should reject null/undefined', () => {
      expect(validateCode(null as unknown as string)).toEqual({
        valid: false,
        error: 'Code must be a non-empty string',
      });
      expect(validateCode(undefined as unknown as string)).toEqual({
        valid: false,
        error: 'Code must be a non-empty string',
      });
    });

    it('should reject empty string', () => {
      expect(validateCode('')).toEqual({
        valid: false,
        error: 'Code must be a non-empty string',
      });
    });

    it('should reject whitespace-only code', () => {
      expect(validateCode('   \n\t  ')).toEqual({
        valid: false,
        error: 'Code cannot be empty or whitespace only',
      });
    });

    it('should reject code exceeding max size', () => {
      const largeCode = 'x'.repeat(MAX_CODE_SIZE + 1);
      expect(validateCode(largeCode)).toEqual({
        valid: false,
        error: 'Code exceeds maximum size of 1MB',
      });
    });

    it('should accept code at max size', () => {
      const maxCode = 'x'.repeat(MAX_CODE_SIZE);
      expect(validateCode(maxCode)).toEqual({ valid: true });
    });
  });

  describe('validateLanguage()', () => {
    it('should accept all supported languages', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(validateLanguage(lang)).toEqual({ valid: true });
      });
    });

    it('should accept language variations', () => {
      expect(validateLanguage('Python')).toEqual({ valid: true });
      expect(validateLanguage('JAVASCRIPT')).toEqual({ valid: true });
      expect(validateLanguage('TypeScript')).toEqual({ valid: true });
    });

    it('should reject null/undefined', () => {
      expect(validateLanguage(null as unknown as string)).toEqual({
        valid: false,
        error: 'Language must be specified',
      });
    });

    it('should reject unsupported languages', () => {
      const result = validateLanguage('cobol');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported language');
      expect(result.error).toContain('cobol');
    });
  });

  describe('validateAnalysisRequest()', () => {
    it('should validate complete request', () => {
      expect(validateAnalysisRequest({
        code: 'console.log("test")',
        language: 'javascript',
      })).toEqual({ valid: true, errors: [] });
    });

    it('should reject null request', () => {
      expect(validateAnalysisRequest(null as unknown as AnalyzeCodeRequest)).toEqual({
        valid: false,
        errors: ['Request is required'],
      });
    });

    it('should collect multiple validation errors', () => {
      const result = validateAnalysisRequest({
        code: '',
        language: 'unsupported',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
    });
  });

  // =========================================================================
  // Error Formatting Tests
  // =========================================================================
  describe('formatAnalysisError()', () => {
    it('should return string errors as-is', () => {
      expect(formatAnalysisError('Simple error')).toBe('Simple error');
    });

    it('should format QNNNetworkError', () => {
      const { QNNNetworkError } = jest.requireMock('@/services/QNNApiClient');
      const error = new QNNNetworkError('Network failed');
      expect(formatAnalysisError(error)).toContain('Unable to connect');
    });

    it('should format QNNTimeoutError', () => {
      const { QNNTimeoutError } = jest.requireMock('@/services/QNNApiClient');
      const error = new QNNTimeoutError('Timeout');
      expect(formatAnalysisError(error)).toContain('taking longer than expected');
    });

    it('should format QNNError', () => {
      const { QNNError } = jest.requireMock('@/services/QNNApiClient');
      const error = new QNNError('Custom QNN error');
      expect(formatAnalysisError(error)).toBe('Custom QNN error');
    });

    it('should extract message from error objects', () => {
      expect(formatAnalysisError({ message: 'Object error' })).toBe('Object error');
    });

    it('should extract error property from objects', () => {
      expect(formatAnalysisError({ error: 'Error property' })).toBe('Error property');
    });

    it('should return default message for unknown errors', () => {
      expect(formatAnalysisError(12345)).toBe('An unexpected error occurred during analysis');
      expect(formatAnalysisError(null)).toBe('An unexpected error occurred during analysis');
    });
  });

  // =========================================================================
  // Health Check Tests
  // =========================================================================
  describe('checkAnalysisServiceHealth()', () => {
    it('should return true for healthy status', async () => {
      const { healthCheck } = getMockedClient();
      healthCheck.mockResolvedValue({ status: 'healthy', timestamp: '2025-01-22T10:00:00Z' });

      const result = await checkAnalysisServiceHealth();

      expect(result).toBe(true);
    });

    it('should return true for ok status', async () => {
      const { healthCheck } = getMockedClient();
      healthCheck.mockResolvedValue({ status: 'ok', timestamp: '2025-01-22T10:00:00Z' });

      const result = await checkAnalysisServiceHealth();

      expect(result).toBe(true);
    });

    it('should return false for unhealthy status', async () => {
      const { healthCheck } = getMockedClient();
      healthCheck.mockResolvedValue({ status: 'unhealthy', timestamp: '2025-01-22T10:00:00Z' });

      const result = await checkAnalysisServiceHealth();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      const { healthCheck } = getMockedClient();
      healthCheck.mockRejectedValue(new Error('Connection refused'));

      const result = await checkAnalysisServiceHealth();

      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // Configuration Tests
  // =========================================================================
  describe('Configuration', () => {
    it('should export supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toContain('python');
      expect(SUPPORTED_LANGUAGES).toContain('javascript');
      expect(SUPPORTED_LANGUAGES).toContain('typescript');
      expect(SUPPORTED_LANGUAGES).toContain('java');
      expect(SUPPORTED_LANGUAGES).toContain('go');
      expect(SUPPORTED_LANGUAGES).toContain('rust');
    });

    it('should export max code size constant', () => {
      expect(MAX_CODE_SIZE).toBe(1024 * 1024); // 1MB
    });
  });
});
