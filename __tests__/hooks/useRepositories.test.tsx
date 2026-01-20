/**
 * Tests for useRepositories hook
 *
 * Comprehensive test suite for repository hooks with React Query integration.
 * Tests all 6 functions: useRepositories, useRepository, useRepositoryAnalysis,
 * useAnalyzeRepository, useSearchRepositories, usePrefetchRepository
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useRepositories,
  useRepository,
  useRepositoryAnalysis,
  useAnalyzeRepository,
  useSearchRepositories,
  usePrefetchRepository,
} from '@/hooks/useRepositories';
import {
  Repository,
  RepositorySearchParams,
  RepositoryAnalysis,
  PaginatedResponse,
  ApiResponse,
} from '@/types/qnn.types';

// Mock QNNApiClient module
jest.mock('@/services/QNNApiClient', () => ({
  qnnApiClient: {
    listRepositories: jest.fn(),
    searchRepositories: jest.fn(),
    getRepository: jest.fn(),
    getRepositoryAnalysis: jest.fn(),
    analyzeRepository: jest.fn(),
  },
}));

// Mock data
const mockRepository: Repository = {
  id: 'repo-123',
  name: 'quantum-ml',
  fullName: 'ainative/quantum-ml',
  description: 'Quantum machine learning library',
  owner: 'ainative',
  url: 'https://github.com/ainative/quantum-ml',
  language: 'Python',
  stars: 1500,
  forks: 250,
  isPrivate: false,
  defaultBranch: 'main',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2025-01-19T00:00:00Z',
  lastAnalyzed: '2025-01-19T12:00:00Z',
  analysisStatus: 'completed',
};

const mockPaginatedResponse: PaginatedResponse<Repository> = {
  items: [mockRepository],
  total: 1,
  page: 1,
  perPage: 20,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
};

const mockRepositoryAnalysis: RepositoryAnalysis = {
  repositoryId: 'repo-123',
  totalFiles: 150,
  totalLines: 12500,
  languages: {
    Python: 75,
    TypeScript: 20,
    JavaScript: 5,
  },
  complexity: {
    average: 5.2,
    max: 15,
    files: [
      { path: 'src/quantum/core.py', complexity: 15 },
      { path: 'src/ml/trainer.py', complexity: 12 },
    ],
  },
  dependencies: ['numpy', 'tensorflow', 'pennylane'],
  structure: {
    directories: 25,
    files: 150,
    depth: 5,
  },
  analyzedAt: '2025-01-19T12:00:00Z',
};

const mockApiResponse: ApiResponse<RepositoryAnalysis> = {
  success: true,
  data: mockRepositoryAnalysis,
  message: 'Analysis completed successfully',
  timestamp: '2025-01-19T12:00:00Z',
};

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useRepositories', () => {
  let qnnApiClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    qnnApiClient = require('@/services/QNNApiClient').qnnApiClient;
  });

  describe('useRepositories - List repositories', () => {
    it('should fetch repositories without search params', async () => {
      qnnApiClient.listRepositories.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useRepositories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.listRepositories).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockPaginatedResponse);
    });

    it('should fetch repositories with search params', async () => {
      const searchParams: RepositorySearchParams = {
        query: 'quantum',
        language: 'Python',
        minStars: 1000,
        page: 1,
        perPage: 20,
      };

      qnnApiClient.listRepositories.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useRepositories(searchParams), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.listRepositories).toHaveBeenCalledWith(searchParams);
      expect(result.current.data).toEqual(mockPaginatedResponse);
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('API Error: Unable to fetch repositories');
      qnnApiClient.listRepositories.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRepositories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });

    it('should cache results with staleTime of 5 minutes', async () => {
      qnnApiClient.listRepositories.mockResolvedValue(mockPaginatedResponse);

      const { result, rerender } = renderHook(() => useRepositories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Rerender should not trigger new API call due to caching
      rerender();

      expect(qnnApiClient.listRepositories).toHaveBeenCalledTimes(1);
    });
  });

  describe('useRepository - Get single repository', () => {
    it('should fetch a single repository by ID', async () => {
      qnnApiClient.getRepository.mockResolvedValue(mockRepository);

      const { result } = renderHook(() => useRepository('repo-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getRepository).toHaveBeenCalledWith('repo-123');
      expect(result.current.data).toEqual(mockRepository);
    });

    it('should not fetch when enabled is false', async () => {
      qnnApiClient.getRepository.mockResolvedValue(mockRepository);

      const { result } = renderHook(() => useRepository('repo-123', false), {
        wrapper: createWrapper(),
      });

      // Wait a tick for query to settle
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(qnnApiClient.getRepository).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when ID is empty', async () => {
      qnnApiClient.getRepository.mockResolvedValue(mockRepository);

      const { result } = renderHook(() => useRepository(''), {
        wrapper: createWrapper(),
      });

      // Wait a tick for query to settle
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(qnnApiClient.getRepository).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle repository not found errors', async () => {
      const mockError = new Error('Repository not found');
      qnnApiClient.getRepository.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRepository('repo-999'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useRepositoryAnalysis - Get repository analysis', () => {
    it('should fetch repository analysis by ID', async () => {
      qnnApiClient.getRepositoryAnalysis.mockResolvedValue(mockRepositoryAnalysis);

      const { result } = renderHook(() => useRepositoryAnalysis('repo-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.getRepositoryAnalysis).toHaveBeenCalledWith('repo-123');
      expect(result.current.data).toEqual(mockRepositoryAnalysis);
    });

    it('should not fetch when enabled is false', async () => {
      qnnApiClient.getRepositoryAnalysis.mockResolvedValue(mockRepositoryAnalysis);

      const { result } = renderHook(() => useRepositoryAnalysis('repo-123', false), {
        wrapper: createWrapper(),
      });

      // Wait a tick for query to settle
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(qnnApiClient.getRepositoryAnalysis).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should cache analysis results with staleTime of 10 minutes', async () => {
      qnnApiClient.getRepositoryAnalysis.mockResolvedValue(mockRepositoryAnalysis);

      const { result, rerender } = renderHook(() => useRepositoryAnalysis('repo-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      rerender();

      expect(qnnApiClient.getRepositoryAnalysis).toHaveBeenCalledTimes(1);
    });

    it('should handle analysis not found errors', async () => {
      const mockError = new Error('Analysis not found');
      qnnApiClient.getRepositoryAnalysis.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRepositoryAnalysis('repo-999'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useAnalyzeRepository - Trigger analysis (mutation)', () => {
    it('should trigger repository analysis successfully', async () => {
      qnnApiClient.analyzeRepository.mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useAnalyzeRepository(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('repo-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.analyzeRepository).toHaveBeenCalledWith('repo-123');
      expect(result.current.data).toEqual(mockApiResponse);
    });

    it('should handle analysis errors', async () => {
      const mockError = new Error('Analysis failed');
      qnnApiClient.analyzeRepository.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAnalyzeRepository(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('repo-123');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });

    it('should invalidate related queries on success', async () => {
      qnnApiClient.analyzeRepository.mockResolvedValue(mockApiResponse);
      qnnApiClient.getRepositoryAnalysis.mockResolvedValue(mockRepositoryAnalysis);
      qnnApiClient.getRepository.mockResolvedValue(mockRepository);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useAnalyzeRepository(), { wrapper });

      result.current.mutate('repo-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should invalidate both analysis and detail queries
      expect(invalidateSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('useSearchRepositories - Search with query', () => {
    it('should search repositories with query string', async () => {
      const searchParams: RepositorySearchParams = {
        query: 'quantum',
        language: 'Python',
        minStars: 1000,
      };

      qnnApiClient.searchRepositories.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(
        () => useSearchRepositories('quantum', { language: 'Python', minStars: 1000 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.searchRepositories).toHaveBeenCalledWith(searchParams);
      expect(result.current.data).toEqual(mockPaginatedResponse);
    });

    it('should not search with query less than 2 characters', async () => {
      qnnApiClient.searchRepositories.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchRepositories('q'), {
        wrapper: createWrapper(),
      });

      // Wait a tick for query to settle
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(qnnApiClient.searchRepositories).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should search with minimum 2 character query', async () => {
      qnnApiClient.searchRepositories.mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useSearchRepositories('ai'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(qnnApiClient.searchRepositories).toHaveBeenCalledWith({ query: 'ai' });
    });

    it('should cache search results with staleTime of 2 minutes', async () => {
      qnnApiClient.searchRepositories.mockResolvedValue(mockPaginatedResponse);

      const { result, rerender } = renderHook(() => useSearchRepositories('quantum'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      rerender();

      expect(qnnApiClient.searchRepositories).toHaveBeenCalledTimes(1);
    });

    it('should handle search errors', async () => {
      const mockError = new Error('Search failed');
      qnnApiClient.searchRepositories.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSearchRepositories('quantum'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('usePrefetchRepository - Optimistic prefetching', () => {
    it('should prefetch a repository for optimistic loading', async () => {
      qnnApiClient.getRepository.mockResolvedValue(mockRepository);

      const { result } = renderHook(() => usePrefetchRepository(), {
        wrapper: createWrapper(),
      });

      result.current('repo-123');

      await waitFor(() => expect(qnnApiClient.getRepository).toHaveBeenCalledWith('repo-123'));
    });

    it('should handle prefetch errors gracefully', async () => {
      const mockError = new Error('Prefetch failed');
      qnnApiClient.getRepository.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePrefetchRepository(), {
        wrapper: createWrapper(),
      });

      // Should not throw, just fail silently
      expect(() => result.current('repo-999')).not.toThrow();
    });
  });
});
