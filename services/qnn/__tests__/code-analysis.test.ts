/**
 * Code Analysis Service Test Suite
 *
 * Comprehensive tests for the QNN code analysis service.
 * Tests cover API integration, validation, error handling, and data transformation.
 *
 * Refs #435
 */

import {
    CodeAnalysisService,
    codeAnalysisService,
    analyzeCode,
    validateCode,
    validateLanguage,
    validateAnalysisRequest,
    formatApiError,
    config,
    type AnalyzeCodeRequest,
} from '../code-analysis';
import { QNNApiClient, QNNValidationError, QNNNetworkError, QNNTimeoutError } from '@/services/QNNApiClient';

// Mock the QNNApiClient
jest.mock('@/services/QNNApiClient', () => {
    const actualModule = jest.requireActual('@/services/QNNApiClient');
    return {
        ...actualModule,
        QNNApiClient: jest.fn().mockImplementation(() => ({
            analyzeRepository: jest.fn(),
            getRepositoryAnalysis: jest.fn(),
        })),
    };
});

// Mock fetch for fallback implementation
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

describe('CodeAnalysisService', () => {
    let service: CodeAnalysisService;
    let mockApiClient: jest.Mocked<QNNApiClient>;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        localStorageMock.setItem('access_token', 'test-token-123');

        mockApiClient = new QNNApiClient() as jest.Mocked<QNNApiClient>;
        service = new CodeAnalysisService(mockApiClient);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ==========================================================================
    // Validation Tests
    // ==========================================================================
    describe('Code Validation', () => {
        it('should validate valid code successfully', () => {
            const result = service.validateCode('function test() { return 1; }');
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should reject null code', () => {
            const result = service.validateCode(null as unknown as string);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Code must be a non-empty string');
        });

        it('should reject undefined code', () => {
            const result = service.validateCode(undefined as unknown as string);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Code must be a non-empty string');
        });

        it('should reject empty string code', () => {
            const result = service.validateCode('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Code must be a non-empty string');
        });

        it('should reject whitespace-only code', () => {
            const result = service.validateCode('   \n\t  ');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Code cannot be empty or whitespace only');
        });

        it('should reject code exceeding 1MB', () => {
            const largeCode = 'x'.repeat(1024 * 1024 + 1);
            const result = service.validateCode(largeCode);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Code exceeds maximum size of 1MB');
        });

        it('should accept code exactly at 1MB limit', () => {
            const maxCode = 'x'.repeat(1024 * 1024);
            const result = service.validateCode(maxCode);
            expect(result.valid).toBe(true);
        });
    });

    describe('Language Validation', () => {
        it('should validate python language', () => {
            const result = service.validateLanguage('python');
            expect(result.valid).toBe(true);
        });

        it('should validate javascript language', () => {
            const result = service.validateLanguage('javascript');
            expect(result.valid).toBe(true);
        });

        it('should validate typescript language', () => {
            const result = service.validateLanguage('typescript');
            expect(result.valid).toBe(true);
        });

        it('should validate java language', () => {
            const result = service.validateLanguage('java');
            expect(result.valid).toBe(true);
        });

        it('should validate cpp language', () => {
            const result = service.validateLanguage('cpp');
            expect(result.valid).toBe(true);
        });

        it('should validate c++ language', () => {
            const result = service.validateLanguage('c++');
            expect(result.valid).toBe(true);
        });

        it('should validate go language', () => {
            const result = service.validateLanguage('go');
            expect(result.valid).toBe(true);
        });

        it('should validate rust language', () => {
            const result = service.validateLanguage('rust');
            expect(result.valid).toBe(true);
        });

        it('should be case-insensitive for languages', () => {
            expect(service.validateLanguage('Python').valid).toBe(true);
            expect(service.validateLanguage('JAVASCRIPT').valid).toBe(true);
            expect(service.validateLanguage('TypeScript').valid).toBe(true);
        });

        it('should reject unsupported languages', () => {
            const result = service.validateLanguage('cobol');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Unsupported language: cobol');
            expect(result.error).toContain('Supported:');
        });

        it('should reject null language', () => {
            const result = service.validateLanguage(null as unknown as string);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Language must be specified');
        });

        it('should reject empty language', () => {
            const result = service.validateLanguage('');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Language must be specified');
        });
    });

    describe('Analysis Request Validation', () => {
        it('should validate a valid request', () => {
            const request: AnalyzeCodeRequest = {
                code: 'def test(): pass',
                language: 'python',
            };
            const result = service.validateAnalysisRequest(request);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should collect multiple validation errors', () => {
            const request: AnalyzeCodeRequest = {
                code: '',
                language: 'invalid',
            };
            const result = service.validateAnalysisRequest(request);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThanOrEqual(2);
        });

        it('should validate request with repositoryId', () => {
            const request: AnalyzeCodeRequest = {
                code: 'console.log("test");',
                language: 'javascript',
                repositoryId: 'repo-123',
            };
            const result = service.validateAnalysisRequest(request);
            expect(result.valid).toBe(true);
        });
    });

    // ==========================================================================
    // API Call Tests
    // ==========================================================================
    describe('analyzeCode', () => {
        const mockApiResponse = {
            quality_score: 0.85,
            features: {
                file_size_bytes: 256,
                line_count: 15,
                comment_count: 3,
                function_count: 2,
                class_count: 1,
                avg_function_length: 5.5,
                cyclomatic_complexity: 3,
                comment_ratio: 0.2,
            },
            normalized_features: [0.3, 0.4, 0.5, 0.6, 0.7, 0.85],
            suggestions: ['Add more comments', 'Consider splitting long functions'],
            language: 'python',
            timestamp: '2024-01-15T10:30:00Z',
            repository_id: 'repo-123',
        };

        it('should call API and transform response correctly', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponse,
            });

            const request: AnalyzeCodeRequest = {
                code: 'def test(): pass',
                language: 'python',
            };

            const result = await service.analyzeCode(request);

            expect(result.qualityScore).toBe(0.85);
            expect(result.features.fileSizeBytes).toBe(256);
            expect(result.features.lineCount).toBe(15);
            expect(result.features.commentCount).toBe(3);
            expect(result.features.functionCount).toBe(2);
            expect(result.features.classCount).toBe(1);
            expect(result.features.avgFunctionLength).toBe(5.5);
            expect(result.features.cyclomaticComplexity).toBe(3);
            expect(result.features.commentRatio).toBe(0.2);
            expect(result.normalizedFeatures).toEqual([0.3, 0.4, 0.5, 0.6, 0.7, 0.85]);
            expect(result.suggestions).toHaveLength(2);
            expect(result.language).toBe('python');
            expect(result.timestamp).toBe('2024-01-15T10:30:00Z');
        });

        it('should include authorization header when token exists', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiResponse,
            });

            await service.analyzeCode({
                code: 'test code',
                language: 'python',
            });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token-123',
                    }),
                })
            );
        });

        it('should throw QNNValidationError for invalid code', async () => {
            await expect(
                service.analyzeCode({
                    code: '',
                    language: 'python',
                })
            ).rejects.toThrow(QNNValidationError);
        });

        it('should throw QNNValidationError for invalid language', async () => {
            await expect(
                service.analyzeCode({
                    code: 'valid code',
                    language: 'invalid',
                })
            ).rejects.toThrow(QNNValidationError);
        });

        it('should handle API error responses', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: async () => ({
                    message: 'Invalid request format',
                    code: 'VALIDATION_ERROR',
                }),
            });

            await expect(
                service.analyzeCode({
                    code: 'test code',
                    language: 'python',
                })
            ).rejects.toThrow('Invalid request format');
        });

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new TypeError('Failed to fetch')
            );

            await expect(
                service.analyzeCode({
                    code: 'test code',
                    language: 'python',
                })
            ).rejects.toThrow(QNNNetworkError);
        });

        it('should handle timeout errors', async () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

            await expect(
                service.analyzeCode({
                    code: 'test code',
                    language: 'python',
                })
            ).rejects.toThrow(QNNTimeoutError);
        });
    });

    // ==========================================================================
    // Repository Analysis Tests
    // ==========================================================================
    describe('analyzeRepository', () => {
        it('should call analyzeRepository on API client', async () => {
            const mockResponse = {
                success: true,
                data: {
                    repositoryId: 'repo-123',
                    totalFiles: 50,
                    totalLines: 5000,
                    languages: { python: 3000, javascript: 2000 },
                    complexity: {
                        average: 5.2,
                        max: 15,
                        files: [],
                    },
                    dependencies: ['numpy', 'pandas'],
                    structure: {
                        directories: 10,
                        files: 50,
                        depth: 4,
                    },
                    analyzedAt: '2024-01-15T10:30:00Z',
                },
                timestamp: '2024-01-15T10:30:00Z',
            };

            mockApiClient.analyzeRepository = jest.fn().mockResolvedValue(mockResponse);

            const result = await service.analyzeRepository('repo-123');

            expect(mockApiClient.analyzeRepository).toHaveBeenCalledWith('repo-123');
            expect(result.repositoryId).toBe('repo-123');
            expect(result.totalFiles).toBe(50);
        });

        it('should throw QNNValidationError for empty repository ID', async () => {
            await expect(service.analyzeRepository('')).rejects.toThrow(QNNValidationError);
        });

        it('should throw QNNValidationError for null repository ID', async () => {
            await expect(
                service.analyzeRepository(null as unknown as string)
            ).rejects.toThrow(QNNValidationError);
        });
    });

    describe('getRepositoryAnalysis', () => {
        it('should call getRepositoryAnalysis on API client', async () => {
            const mockAnalysis = {
                repositoryId: 'repo-123',
                totalFiles: 50,
                totalLines: 5000,
                languages: { python: 3000 },
                complexity: { average: 5, max: 10, files: [] },
                dependencies: [],
                structure: { directories: 5, files: 50, depth: 3 },
                analyzedAt: '2024-01-15T10:30:00Z',
            };

            mockApiClient.getRepositoryAnalysis = jest.fn().mockResolvedValue(mockAnalysis);

            const result = await service.getRepositoryAnalysis('repo-123');

            expect(mockApiClient.getRepositoryAnalysis).toHaveBeenCalledWith('repo-123');
            expect(result.repositoryId).toBe('repo-123');
        });

        it('should throw QNNValidationError for invalid repository ID', async () => {
            await expect(service.getRepositoryAnalysis('')).rejects.toThrow(QNNValidationError);
        });
    });

    // ==========================================================================
    // Error Formatting Tests
    // ==========================================================================
    describe('formatApiError', () => {
        it('should format string errors', () => {
            expect(service.formatApiError('Simple error')).toBe('Simple error');
        });

        it('should format QNNError instances', () => {
            const error = new QNNValidationError('Validation failed');
            expect(service.formatApiError(error)).toBe('Validation failed');
        });

        it('should format error objects with message property', () => {
            const error = { message: 'Error message', code: 'ERR_CODE' };
            expect(service.formatApiError(error)).toBe('Error message');
        });

        it('should return default message for unknown errors', () => {
            expect(service.formatApiError(null)).toBe(
                'An unexpected error occurred during analysis'
            );
            expect(service.formatApiError(undefined)).toBe(
                'An unexpected error occurred during analysis'
            );
            expect(service.formatApiError(123)).toBe(
                'An unexpected error occurred during analysis'
            );
        });
    });

    // ==========================================================================
    // Utility Method Tests
    // ==========================================================================
    describe('getSupportedLanguages', () => {
        it('should return all supported languages', () => {
            const languages = service.getSupportedLanguages();
            expect(languages).toContain('python');
            expect(languages).toContain('javascript');
            expect(languages).toContain('typescript');
            expect(languages).toContain('java');
            expect(languages).toContain('cpp');
            expect(languages).toContain('c++');
            expect(languages).toContain('go');
            expect(languages).toContain('rust');
            expect(languages.length).toBe(8);
        });
    });
});

// ==========================================================================
// Module Export Tests
// ==========================================================================
describe('Module Exports', () => {
    describe('Singleton Instance', () => {
        it('should export codeAnalysisService singleton', () => {
            expect(codeAnalysisService).toBeInstanceOf(CodeAnalysisService);
        });
    });

    describe('Convenience Functions', () => {
        beforeEach(() => {
            localStorageMock.setItem('access_token', 'test-token');
        });

        it('should export analyzeCode function', () => {
            expect(typeof analyzeCode).toBe('function');
        });

        it('should export validateCode function', () => {
            expect(typeof validateCode).toBe('function');
            const result = validateCode('test code');
            expect(result.valid).toBe(true);
        });

        it('should export validateLanguage function', () => {
            expect(typeof validateLanguage).toBe('function');
            const result = validateLanguage('python');
            expect(result.valid).toBe(true);
        });

        it('should export validateAnalysisRequest function', () => {
            expect(typeof validateAnalysisRequest).toBe('function');
            const result = validateAnalysisRequest({
                code: 'test',
                language: 'python',
            });
            expect(result.valid).toBe(true);
        });

        it('should export formatApiError function', () => {
            expect(typeof formatApiError).toBe('function');
            expect(formatApiError('error')).toBe('error');
        });
    });

    describe('Configuration Export', () => {
        it('should export config with supportedLanguages', () => {
            expect(config.supportedLanguages).toBeDefined();
            expect(Array.isArray(config.supportedLanguages)).toBe(true);
        });

        it('should export config with maxCodeSize', () => {
            expect(config.maxCodeSize).toBe(1024 * 1024);
        });

        it('should export config with apiEndpoint', () => {
            expect(config.apiEndpoint).toBe('/v1/code/analyze');
        });
    });
});

// ==========================================================================
// Integration-style Tests
// ==========================================================================
describe('Code Analysis Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.setItem('access_token', 'test-token');
    });

    it('should handle complete analysis workflow', async () => {
        const mockResponse = {
            quality_score: 0.92,
            features: {
                file_size_bytes: 512,
                line_count: 30,
                comment_count: 8,
                function_count: 4,
                class_count: 1,
                avg_function_length: 6.25,
                cyclomatic_complexity: 4,
                comment_ratio: 0.267,
            },
            normalized_features: [0.5, 0.8, 0.6, 0.3, 0.5, 0.92],
            suggestions: [],
            language: 'typescript',
            timestamp: new Date().toISOString(),
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const service = new CodeAnalysisService();
        const code = `
            class Calculator {
                // Add two numbers
                add(a: number, b: number): number {
                    return a + b;
                }

                // Subtract two numbers
                subtract(a: number, b: number): number {
                    return a - b;
                }

                // Multiply two numbers
                multiply(a: number, b: number): number {
                    return a * b;
                }

                // Divide two numbers
                divide(a: number, b: number): number {
                    if (b === 0) throw new Error('Division by zero');
                    return a / b;
                }
            }
        `;

        const result = await service.analyzeCode({
            code,
            language: 'typescript',
        });

        expect(result.qualityScore).toBe(0.92);
        expect(result.features.classCount).toBe(1);
        expect(result.features.functionCount).toBe(4);
        expect(result.language).toBe('typescript');
    });

    it('should validate before making API call', async () => {
        const service = new CodeAnalysisService();

        // This should fail validation before any API call
        await expect(
            service.analyzeCode({
                code: '',
                language: 'python',
            })
        ).rejects.toThrow('Invalid request');

        // Fetch should not have been called
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
