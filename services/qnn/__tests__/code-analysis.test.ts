/**
 * Tests for QNN Code Analysis Service
 */

import {
  validateCode,
  validateLanguage,
  validateAnalysisRequest,
  formatApiError,
} from '../code-analysis';

describe('QNN Code Analysis Service', () => {
  describe('validateCode', () => {
    it('should accept valid code', () => {
      const result = validateCode('const x = 1;');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty code', () => {
      const result = validateCode('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject whitespace-only code', () => {
      const result = validateCode('   \n\t  ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject non-string code', () => {
      // Testing with null value
      const result = validateCode(null as unknown as string);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('string');
    });

    it('should reject code exceeding size limit', () => {
      const largeCode = 'x'.repeat(1024 * 1024 + 1); // Over 1MB
      const result = validateCode(largeCode);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum size');
    });
  });

  describe('validateLanguage', () => {
    it('should accept supported languages', () => {
      const languages = [
        'python',
        'javascript',
        'typescript',
        'java',
        'cpp',
        'c++',
        'go',
        'rust',
      ];

      languages.forEach((lang) => {
        const result = validateLanguage(lang);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject unsupported languages', () => {
      const result = validateLanguage('cobol');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported language');
    });

    it('should reject empty language', () => {
      const result = validateLanguage('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be specified');
    });

    it('should be case-insensitive', () => {
      const result = validateLanguage('PYTHON');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAnalysisRequest', () => {
    it('should validate complete request', () => {
      const result = validateAnalysisRequest({
        code: 'print("hello")',
        language: 'python',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect multiple validation errors', () => {
      const result = validateAnalysisRequest({
        code: '',
        language: 'invalid',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('formatApiError', () => {
    it('should format string errors', () => {
      const result = formatApiError('Network error');
      expect(result).toBe('Network error');
    });

    it('should format error objects with message', () => {
      const result = formatApiError({
        message: 'API timeout',
        code: 'TIMEOUT',
      });
      expect(result).toBe('API timeout');
    });

    it('should handle unknown errors', () => {
      const result = formatApiError({ unknown: 'error' });
      expect(result).toContain('unexpected error');
    });

    it('should handle null/undefined errors', () => {
      const result = formatApiError(undefined);
      expect(result).toContain('unexpected error');
    });
  });
});
