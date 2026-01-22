/**
 * QNN Code Analysis API Service
 *
 * This service handles communication with the QNN API for code quality analysis.
 * Connected to real QNN API endpoints for ML-based feature extraction and quality scoring.
 */

import { qnnApiClient, QNNError, QNNNetworkError, QNNTimeoutError } from '@/services/QNNApiClient';
import { appConfig } from '@/lib/config/app';

// ============================================================================
// Type Definitions
// ============================================================================

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
  model_version?: string;
  analysis_id?: string;
}

export interface AnalyzeCodeRequest {
  code: string;
  language: string;
  options?: CodeAnalysisOptions;
}

export interface CodeAnalysisOptions {
  include_suggestions?: boolean;
  include_normalized_features?: boolean;
  detailed_metrics?: boolean;
}

export interface CodeAnalysisError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

export interface AnalysisResponse {
  data: AnalysisResult | null;
  error: CodeAnalysisError | null;
  state: AnalysisState;
}

// ============================================================================
// API Configuration
// ============================================================================

const API_CONFIG = {
  endpoints: {
    analyzeCode: '/v1/code/analyze',
    extractFeatures: '/v1/code/features',
    qualityScore: '/v1/code/quality',
  },
  defaultOptions: {
    include_suggestions: true,
    include_normalized_features: true,
    detailed_metrics: false,
  } as CodeAnalysisOptions,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a standardized analysis error
 */
function createAnalysisError(message: string, code: string): CodeAnalysisError {
  return {
    message,
    code,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Normalize language string to supported format
 */
function normalizeLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    'c++': 'cpp',
    'c#': 'csharp',
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
  };

  const normalized = language.toLowerCase().trim();
  return languageMap[normalized] || normalized;
}

// ============================================================================
// Code Analysis API Functions
// ============================================================================

/**
 * Analyze code quality using QNN ML model
 *
 * Sends code to the QNN API for feature extraction and quality analysis
 * using trained ML models.
 *
 * @param request - Code analysis request with code and language
 * @returns Promise resolving to analysis results from ML model
 * @throws QNNError on API failures
 */
export async function analyzeCode(
  request: AnalyzeCodeRequest
): Promise<AnalysisResult> {
  // Validate request before sending
  const validation = validateAnalysisRequest(request);
  if (!validation.valid) {
    throw createAnalysisError(
      validation.errors.join('; '),
      'VALIDATION_ERROR'
    );
  }

  try {
    // Use QNNApiClient for code analysis
    const result = await qnnApiClient.analyzeCode(
      request.code,
      normalizeLanguage(request.language),
      {
        ...API_CONFIG.defaultOptions,
        ...request.options,
      }
    );

    // Ensure timestamp is present
    return {
      ...result,
      timestamp: result.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    // Re-throw QNN errors with context
    if (error instanceof QNNError) {
      console.error('QNN API error during code analysis:', error.toJSON());
      throw error;
    }

    // Handle unexpected errors
    console.error('Unexpected error during code analysis:', error);
    throw createAnalysisError(
      error instanceof Error ? error.message : 'Unknown error during analysis',
      'ANALYSIS_FAILED'
    );
  }
}

/**
 * Extract code features using QNN ML model
 *
 * Performs feature extraction without full quality analysis.
 * Useful for getting raw metrics quickly.
 *
 * @param code - Source code to analyze
 * @param language - Programming language
 * @returns Promise resolving to extracted code metrics
 */
export async function extractFeatures(
  code: string,
  language: string
): Promise<CodeMetrics> {
  const validation = validateCode(code);
  if (!validation.valid) {
    throw createAnalysisError(validation.error!, 'VALIDATION_ERROR');
  }

  const langValidation = validateLanguage(language);
  if (!langValidation.valid) {
    throw createAnalysisError(langValidation.error!, 'VALIDATION_ERROR');
  }

  try {
    return await qnnApiClient.extractCodeFeatures(code, normalizeLanguage(language));
  } catch (error) {
    if (error instanceof QNNError) {
      throw error;
    }
    throw createAnalysisError(
      'Feature extraction failed',
      'EXTRACTION_FAILED'
    );
  }
}

/**
 * Get quality score from trained QNN model
 *
 * Evaluates code quality using the trained model and returns
 * a score between 0 and 1.
 *
 * @param code - Source code to evaluate
 * @param language - Programming language
 * @returns Promise resolving to quality score (0-1)
 */
export async function getQualityScore(
  code: string,
  language: string
): Promise<number> {
  const result = await analyzeCode({ code, language });
  return result.quality_score;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Supported programming languages for analysis
 */
export const SUPPORTED_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'java',
  'cpp',
  'c++',
  'csharp',
  'c#',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Maximum code size in bytes (1MB)
 */
export const MAX_CODE_SIZE = 1024 * 1024;

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

  if (code.length > MAX_CODE_SIZE) {
    return { valid: false, error: `Code exceeds maximum size of ${MAX_CODE_SIZE / 1024 / 1024}MB` };
  }

  return { valid: true };
}

/**
 * Validate language parameter
 */
export function validateLanguage(language: string): { valid: boolean; error?: string } {
  if (!language || typeof language !== 'string') {
    return { valid: false, error: 'Language must be specified' };
  }

  const normalizedLang = normalizeLanguage(language);
  const supported = SUPPORTED_LANGUAGES.map(l => normalizeLanguage(l));

  if (!supported.includes(normalizedLang)) {
    return {
      valid: false,
      error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
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

  if (!request) {
    return { valid: false, errors: ['Request is required'] };
  }

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
export function formatAnalysisError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof QNNNetworkError) {
    return 'Unable to connect to analysis service. Please check your internet connection.';
  }

  if (error instanceof QNNTimeoutError) {
    return 'Analysis is taking longer than expected. Please try again with smaller code.';
  }

  if (error instanceof QNNError) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    if ('message' in error) {
      return (error as { message: string }).message;
    }
    if ('error' in error && typeof (error as Record<string, unknown>).error === 'string') {
      return (error as { error: string }).error;
    }
  }

  return 'An unexpected error occurred during analysis';
}

/**
 * Check if the analysis service is available
 */
export async function checkAnalysisServiceHealth(): Promise<boolean> {
  try {
    const health = await qnnApiClient.healthCheck();
    return health.status === 'healthy' || health.status === 'ok';
  } catch {
    return false;
  }
}

// ============================================================================
// Export Configuration
// ============================================================================

/**
 * Export configuration for external use
 */
export const config = {
  ...API_CONFIG,
  supportedLanguages: SUPPORTED_LANGUAGES,
  maxCodeSize: MAX_CODE_SIZE,
  qnnApiUrl: appConfig.qnn.apiUrl,
};
