/**
 * QNN Code Analysis API Service
 *
 * This service handles communication with the QNN API for code quality analysis.
 * Replace the mock implementation with actual API calls when backend is ready.
 */

export interface CodeMetrics {
  file_size_bytes: number;
  line_count: number;
  comment_count: number;
  function_count: number;
  class_count: number;
  avg_function_length: number;
  cyclomatic_complexity?: number;
  comment_ratio?: number;
}

export interface AnalysisResult {
  quality_score: number;
  features: CodeMetrics;
  normalized_features?: number[];
  suggestions?: string[];
  language: string;
  timestamp: string;
}

export interface AnalyzeCodeRequest {
  code: string;
  language: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

/**
 * QNN API configuration
 */
const API_CONFIG = {
  baseUrl: process.env.VITE_QNN_API_URL || 'http://localhost:8000',
  endpoints: {
    extractFeatures: '/api/v1/features/extract-from-code',
    analyzeQuality: '/api/v1/quality/analyze',
  },
  timeout: 30000, // 30 seconds
};

/**
 * Get authorization token from storage or environment
 */
const getAuthToken = (): string | null => {
  // Check localStorage first
  const token = localStorage.getItem('qnn_api_token');
  if (token) return token;

  // Fallback to environment variable for development
  return process.env.VITE_QNN_API_TOKEN || null;
};

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add authorization if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
        code: 'HTTP_ERROR',
      }));

      throw {
        message: error.message || 'API request failed',
        code: error.code || `HTTP_${response.status}`,
        details: error,
      } as ApiError;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        message: 'Request timeout - analysis took too long',
        code: 'TIMEOUT',
      } as ApiError;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw {
        message: 'Network error - unable to reach API server',
        code: 'NETWORK_ERROR',
        details: { originalError: error.message },
      } as ApiError;
    }

    // Re-throw API errors
    throw error;
  }
}

/**
 * Analyze code quality using QNN API
 */
export async function analyzeCode(
  request: AnalyzeCodeRequest
): Promise<AnalysisResult> {
  try {
    const result = await apiRequest<AnalysisResult>(
      API_CONFIG.endpoints.extractFeatures,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return result;
  } catch (error) {
    console.error('Code analysis failed:', error);
    throw error;
  }
}

/**
 * Mock implementation for development/testing
 * Remove this when connecting to real API
 */
export async function analyzeCodeMock(
  code: string,
  language: string
): Promise<AnalysisResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Calculate basic metrics
  const lines = code.split('\n');
  const lineCount = lines.filter(line => line.trim().length > 0).length;

  // Count comments (basic pattern matching)
  const commentCount = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('//') ||
           trimmed.startsWith('#') ||
           trimmed.startsWith('/*') ||
           trimmed.startsWith('*');
  }).length;

  // Count functions (basic pattern matching)
  const functionPatterns = {
    python: /def\s+\w+/g,
    javascript: /function\s+\w+/g,
    typescript: /function\s+\w+/g,
    java: /(public|private|protected)?\s*(static)?\s*\w+\s+\w+\s*\(/g,
    cpp: /\w+\s+\w+\s*\(/g,
    go: /func\s+\w+/g,
    rust: /fn\s+\w+/g,
  };

  const functionPattern = functionPatterns[language as keyof typeof functionPatterns] || /function\s+\w+/g;
  const functionMatches = code.match(functionPattern);
  const functionCount = functionMatches ? functionMatches.length : 0;

  // Count classes
  const classMatches = code.match(/class\s+\w+/g);
  const classCount = classMatches ? classMatches.length : 0;

  // Calculate average function length
  const avgFunctionLength = functionCount > 0 ? lineCount / functionCount : 0;

  // Calculate comment ratio
  const commentRatio = commentCount / Math.max(lineCount, 1);

  // Calculate quality score (0-1 scale)
  let qualityScore = 0.5; // Base score

  // Adjust based on comment ratio (ideal: 10-30%)
  if (commentRatio >= 0.1 && commentRatio <= 0.3) {
    qualityScore += 0.15;
  } else if (commentRatio > 0) {
    qualityScore += 0.05;
  }

  // Adjust based on function length (ideal: 5-20 lines)
  if (avgFunctionLength > 5 && avgFunctionLength < 20) {
    qualityScore += 0.15;
  } else if (avgFunctionLength > 0 && avgFunctionLength <= 30) {
    qualityScore += 0.08;
  }

  // Bonus for having functions
  if (functionCount > 0) qualityScore += 0.1;

  // Bonus for having classes
  if (classCount > 0) qualityScore += 0.05;

  // Bonus for reasonable file size
  if (lineCount > 10 && lineCount < 500) qualityScore += 0.05;

  // Cap at 1.0
  qualityScore = Math.min(qualityScore, 1.0);

  // Normalize features for radar chart (0-1 scale)
  const normalizedFeatures = [
    Math.min(lineCount / 100, 1),      // Code size (0-100 lines as reference)
    Math.min(commentRatio * 10, 1),    // Comments (0-10% as reference)
    Math.min(functionCount / 10, 1),   // Functions (0-10 as reference)
    Math.min(classCount / 5, 1),       // Classes (0-5 as reference)
    Math.min(avgFunctionLength / 30, 1), // Structure (0-30 lines as reference)
    qualityScore,                      // Overall quality
  ];

  // Generate suggestions
  const suggestions: string[] = [];

  if (commentRatio < 0.1) {
    suggestions.push('Add more comments to improve code readability and maintainability');
  }

  if (avgFunctionLength > 20) {
    suggestions.push('Consider breaking down long functions into smaller, more focused functions');
  }

  if (functionCount === 0 && lineCount > 50) {
    suggestions.push('Organize code into functions for better structure and reusability');
  }

  if (classCount === 0 && lineCount > 100) {
    suggestions.push('Consider using classes or modules to organize related functionality');
  }

  if (commentRatio > 0.5) {
    suggestions.push('Review excessive comments - ensure code is self-documenting where possible');
  }

  if (avgFunctionLength < 3 && functionCount > 10) {
    suggestions.push('Some functions may be too granular - consider consolidating related logic');
  }

  if (lineCount > 500) {
    suggestions.push('Large file detected - consider splitting into multiple modules');
  }

  // Build metrics object
  const metrics: CodeMetrics = {
    file_size_bytes: code.length,
    line_count: lineCount,
    comment_count: commentCount,
    function_count: functionCount,
    class_count: classCount,
    avg_function_length: parseFloat(avgFunctionLength.toFixed(1)),
    comment_ratio: parseFloat(commentRatio.toFixed(3)),
  };

  return {
    quality_score: parseFloat(qualityScore.toFixed(2)),
    features: metrics,
    normalized_features: normalizedFeatures,
    suggestions,
    language,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate code before analysis
 */
export function validateCode(code: string): { valid: boolean; error?: string } {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Code must be a non-empty string' };
  }

  const trimmedCode = code.trim();
  if (trimmedCode.length === 0) {
    return { valid: false, error: 'Code cannot be empty or whitespace only' };
  }

  if (code.length > 1024 * 1024) { // 1MB limit
    return { valid: false, error: 'Code exceeds maximum size of 1MB' };
  }

  return { valid: true };
}

/**
 * Validate language parameter
 */
export function validateLanguage(language: string): { valid: boolean; error?: string } {
  const supportedLanguages = [
    'python',
    'javascript',
    'typescript',
    'java',
    'cpp',
    'c++',
    'go',
    'rust',
  ];

  if (!language || typeof language !== 'string') {
    return { valid: false, error: 'Language must be specified' };
  }

  const normalizedLang = language.toLowerCase();
  if (!supportedLanguages.includes(normalizedLang)) {
    return {
      valid: false,
      error: `Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Comprehensive validation for analysis request
 */
export function validateAnalysisRequest(
  request: AnalyzeCodeRequest
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const codeValidation = validateCode(request.code);
  if (!codeValidation.valid && codeValidation.error) {
    errors.push(codeValidation.error);
  }

  const langValidation = validateLanguage(request.language);
  if (!langValidation.valid && langValidation.error) {
    errors.push(langValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format API error for display
 */
export function formatApiError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message;
  }

  return 'An unexpected error occurred during analysis';
}

/**
 * Export configuration for external use
 */
export const config = API_CONFIG;
