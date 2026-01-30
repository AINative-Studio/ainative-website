/**
 * QNN Code Analysis Service
 *
 * Connects to the QNN API for code quality analysis using real ML-powered
 * feature extraction and quality assessment.
 *
 * Refs #435
 */

import { QNNApiClient, QNNError, QNNValidationError, QNNNetworkError, QNNTimeoutError } from '@/services/QNNApiClient';
import type { RepositoryAnalysis } from '@/types/qnn.types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CodeMetrics {
    fileSizeBytes: number;
    lineCount: number;
    commentCount: number;
    functionCount: number;
    classCount: number;
    avgFunctionLength: number;
    cyclomaticComplexity?: number;
    commentRatio?: number;
}

export interface AnalysisResult {
    qualityScore: number;
    features: CodeMetrics;
    normalizedFeatures?: number[];
    suggestions?: string[];
    language: string;
    timestamp: string;
    repositoryId?: string;
}

export interface AnalyzeCodeRequest {
    code: string;
    language: string;
    repositoryId?: string;
}

export interface RepositoryAnalyzeRequest {
    repositoryId: string;
}

export interface CodeAnalysisApiError {
    message: string;
    code: string;
    details?: Record<string, unknown>;
}

// API Response types for code analysis endpoint
interface CodeAnalysisApiResponse {
    quality_score: number;
    features: {
        file_size_bytes: number;
        line_count: number;
        comment_count: number;
        function_count: number;
        class_count: number;
        avg_function_length: number;
        cyclomatic_complexity?: number;
        comment_ratio?: number;
    };
    normalized_features?: number[];
    suggestions?: string[];
    language: string;
    timestamp: string;
    repository_id?: string;
}

// ============================================================================
// Supported Languages
// ============================================================================

const SUPPORTED_LANGUAGES = [
    'python',
    'javascript',
    'typescript',
    'java',
    'cpp',
    'c++',
    'go',
    'rust',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// ============================================================================
// Code Analysis Service Class
// ============================================================================

/**
 * Code Analysis Service
 *
 * Provides methods for analyzing code quality using the QNN API.
 * Uses the QNNApiClient for proper authentication, retries, and error handling.
 */
export class CodeAnalysisService {
    private readonly apiClient: QNNApiClient;
    private readonly maxCodeSize: number = 1024 * 1024; // 1MB limit

    constructor(apiClient?: QNNApiClient) {
        this.apiClient = apiClient || new QNNApiClient();
    }

    /**
     * Analyze code quality using QNN API
     *
     * @param request - The code analysis request containing code and language
     * @returns Promise resolving to analysis results
     * @throws QNNValidationError if input validation fails
     * @throws QNNNetworkError if network request fails
     * @throws QNNTimeoutError if request times out
     */
    async analyzeCode(request: AnalyzeCodeRequest): Promise<AnalysisResult> {
        // Validate request before sending to API
        const validation = this.validateAnalysisRequest(request);
        if (!validation.valid) {
            throw new QNNValidationError(
                `Invalid request: ${validation.errors.join(', ')}`,
                { errors: validation.errors }
            );
        }

        try {
            // Call the QNN API to analyze code
            const response = await this.callCodeAnalysisApi(request);

            // Transform API response to our internal format
            return this.transformApiResponse(response);
        } catch (error) {
            // Re-throw QNN errors as-is
            if (error instanceof QNNError) {
                throw error;
            }

            // Wrap unknown errors
            throw new QNNNetworkError(
                'Code analysis request failed',
                { originalError: String(error) }
            );
        }
    }

    /**
     * Analyze repository code quality
     *
     * Triggers a full repository analysis using the QNN API.
     *
     * @param repositoryId - The repository ID to analyze
     * @returns Promise resolving to repository analysis
     */
    async analyzeRepository(repositoryId: string): Promise<RepositoryAnalysis> {
        if (!repositoryId || typeof repositoryId !== 'string') {
            throw new QNNValidationError('Repository ID must be a non-empty string');
        }

        const response = await this.apiClient.analyzeRepository(repositoryId);
        return response.data;
    }

    /**
     * Get existing repository analysis
     *
     * @param repositoryId - The repository ID
     * @returns Promise resolving to repository analysis
     */
    async getRepositoryAnalysis(repositoryId: string): Promise<RepositoryAnalysis> {
        if (!repositoryId || typeof repositoryId !== 'string') {
            throw new QNNValidationError('Repository ID must be a non-empty string');
        }

        return this.apiClient.getRepositoryAnalysis(repositoryId);
    }

    /**
     * Validate code input
     *
     * @param code - The code string to validate
     * @returns Validation result
     */
    validateCode(code: string): { valid: boolean; error?: string } {
        if (!code || typeof code !== 'string') {
            return { valid: false, error: 'Code must be a non-empty string' };
        }

        const trimmedCode = code.trim();
        if (trimmedCode.length === 0) {
            return { valid: false, error: 'Code cannot be empty or whitespace only' };
        }

        if (code.length > this.maxCodeSize) {
            return { valid: false, error: 'Code exceeds maximum size of 1MB' };
        }

        return { valid: true };
    }

    /**
     * Validate language parameter
     *
     * @param language - The programming language
     * @returns Validation result
     */
    validateLanguage(language: string): { valid: boolean; error?: string } {
        if (!language || typeof language !== 'string') {
            return { valid: false, error: 'Language must be specified' };
        }

        const normalizedLang = language.toLowerCase();
        if (!SUPPORTED_LANGUAGES.includes(normalizedLang as SupportedLanguage)) {
            return {
                valid: false,
                error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
            };
        }

        return { valid: true };
    }

    /**
     * Comprehensive validation for analysis request
     *
     * @param request - The analysis request to validate
     * @returns Validation result with all errors
     */
    validateAnalysisRequest(
        request: AnalyzeCodeRequest
    ): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        const codeValidation = this.validateCode(request.code);
        if (!codeValidation.valid && codeValidation.error) {
            errors.push(codeValidation.error);
        }

        const langValidation = this.validateLanguage(request.language);
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
     *
     * @param error - The error to format
     * @returns Human-readable error message
     */
    formatApiError(error: unknown): string {
        if (typeof error === 'string') {
            return error;
        }

        if (error instanceof QNNError) {
            return error.message;
        }

        if (error && typeof error === 'object' && 'message' in error) {
            return (error as CodeAnalysisApiError).message;
        }

        return 'An unexpected error occurred during analysis';
    }

    /**
     * Get list of supported languages
     *
     * @returns Array of supported language names
     */
    getSupportedLanguages(): readonly string[] {
        return SUPPORTED_LANGUAGES;
    }

    // =========================================================================
    // Private Methods
    // =========================================================================

    /**
     * Call the QNN code analysis API endpoint
     */
    private async callCodeAnalysisApi(
        request: AnalyzeCodeRequest
    ): Promise<CodeAnalysisApiResponse> {
        // The QNN API expects snake_case for the request body
        const apiRequest = {
            code: request.code,
            language: request.language.toLowerCase(),
            repository_id: request.repositoryId,
        };

        // Use the underlying axios client from QNNApiClient
        // We access the client directly for custom endpoints
        const client = (this.apiClient as unknown as { client: import('axios').AxiosInstance }).client;

        if (!client) {
            // Fallback: use fetch if client is not accessible
            return this.callCodeAnalysisApiFetch(apiRequest);
        }

        const response = await client.post<CodeAnalysisApiResponse>(
            '/v1/code/analyze',
            apiRequest
        );

        return response.data;
    }

    /**
     * Fallback fetch implementation for code analysis API
     */
    private async callCodeAnalysisApiFetch(
        request: { code: string; language: string; repository_id?: string }
    ): Promise<CodeAnalysisApiResponse> {
        const baseUrl = process.env.NEXT_PUBLIC_QNN_API_URL || 'https://qnn-api.ainative.studio';
        const token = typeof window !== 'undefined'
            ? localStorage.getItem('access_token')
            : null;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(`${baseUrl}/v1/code/analyze`, {
                method: 'POST',
                headers,
                body: JSON.stringify(request),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    code: 'HTTP_ERROR',
                }));

                throw new QNNValidationError(
                    error.message || 'API request failed',
                    error.details
                );
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new QNNTimeoutError('Request timeout - analysis took too long');
            }

            if (error instanceof QNNError) {
                throw error;
            }

            throw new QNNNetworkError(
                'Network error - unable to reach API server',
                { originalError: String(error) }
            );
        }
    }

    /**
     * Transform API response from snake_case to camelCase
     */
    private transformApiResponse(response: CodeAnalysisApiResponse): AnalysisResult {
        return {
            qualityScore: response.quality_score,
            features: {
                fileSizeBytes: response.features.file_size_bytes,
                lineCount: response.features.line_count,
                commentCount: response.features.comment_count,
                functionCount: response.features.function_count,
                classCount: response.features.class_count,
                avgFunctionLength: response.features.avg_function_length,
                cyclomaticComplexity: response.features.cyclomatic_complexity,
                commentRatio: response.features.comment_ratio,
            },
            normalizedFeatures: response.normalized_features,
            suggestions: response.suggestions,
            language: response.language,
            timestamp: response.timestamp,
            repositoryId: response.repository_id,
        };
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Default code analysis service instance
 * Use this for most cases throughout the application
 */
export const codeAnalysisService = new CodeAnalysisService();

// ============================================================================
// Convenience Functions (Backward Compatibility)
// ============================================================================

/**
 * Analyze code quality using QNN API
 *
 * @param request - The code analysis request
 * @returns Promise resolving to analysis results
 */
export async function analyzeCode(request: AnalyzeCodeRequest): Promise<AnalysisResult> {
    return codeAnalysisService.analyzeCode(request);
}

/**
 * Validate code before analysis
 *
 * @param code - The code string to validate
 * @returns Validation result
 */
export function validateCode(code: string): { valid: boolean; error?: string } {
    return codeAnalysisService.validateCode(code);
}

/**
 * Validate language parameter
 *
 * @param language - The programming language
 * @returns Validation result
 */
export function validateLanguage(language: string): { valid: boolean; error?: string } {
    return codeAnalysisService.validateLanguage(language);
}

/**
 * Comprehensive validation for analysis request
 *
 * @param request - The analysis request to validate
 * @returns Validation result with all errors
 */
export function validateAnalysisRequest(
    request: AnalyzeCodeRequest
): { valid: boolean; errors: string[] } {
    return codeAnalysisService.validateAnalysisRequest(request);
}

/**
 * Format API error for display
 *
 * @param error - The error to format
 * @returns Human-readable error message
 */
export function formatApiError(error: unknown): string {
    return codeAnalysisService.formatApiError(error);
}

// ============================================================================
// Export Configuration
// ============================================================================

export const config = {
    supportedLanguages: SUPPORTED_LANGUAGES,
    maxCodeSize: 1024 * 1024,
    apiEndpoint: '/v1/code/analyze',
};
