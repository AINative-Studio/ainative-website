import apiClient from '../api-client';
import { zerodbService } from '../zerodb-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ZeroDBService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== Namespace Endpoints =====
  describe('listNamespaces', () => {
    it('fetches all namespaces', async () => {
      const mockNamespaces = {
        namespaces: [
          {
            name: 'default',
            vector_count: 1500,
            dimensions: 1536,
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-12-21T10:00:00Z',
          },
          {
            name: 'embeddings',
            vector_count: 5000,
            dimensions: 768,
            created_at: '2025-06-15T00:00:00Z',
            updated_at: '2025-12-20T15:00:00Z',
          },
        ],
        total: 2,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockNamespaces,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.listNamespaces();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/namespaces');
      expect(result).toEqual(mockNamespaces);
    });

    it('handles errors when listing namespaces', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(zerodbService.listNamespaces()).rejects.toThrow('Connection failed');
    });
  });

  describe('createNamespace', () => {
    it('creates a new namespace', async () => {
      const namespaceData = {
        name: 'documents',
        dimensions: 1536,
        description: 'Document embeddings namespace',
      };

      const mockResponse = {
        name: 'documents',
        vector_count: 0,
        dimensions: 1536,
        description: 'Document embeddings namespace',
        created_at: '2025-12-21T12:00:00Z',
        updated_at: '2025-12-21T12:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await zerodbService.createNamespace(namespaceData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/zerodb/namespaces', namespaceData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when creating namespace', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Namespace already exists'));

      await expect(
        zerodbService.createNamespace({ name: 'default', dimensions: 1536 })
      ).rejects.toThrow('Namespace already exists');
    });
  });

  describe('deleteNamespace', () => {
    it('deletes a namespace', async () => {
      const mockResponse = {
        message: 'Namespace deleted successfully',
        namespace: 'documents',
        vectors_deleted: 100,
      };

      mockApiClient.delete.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.deleteNamespace('documents');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/public/zerodb/namespaces/documents');
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when deleting namespace', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Namespace not found'));

      await expect(zerodbService.deleteNamespace('unknown')).rejects.toThrow('Namespace not found');
    });
  });

  // ===== Stats Endpoints =====
  describe('getStats', () => {
    it('fetches database statistics', async () => {
      const mockStats = {
        total_vectors: 15000,
        total_namespaces: 5,
        total_storage_mb: 250.5,
        avg_query_latency_ms: 12.3,
        queries_last_24h: 5000,
        writes_last_24h: 500,
        by_namespace: [
          { name: 'default', vector_count: 10000, storage_mb: 180 },
          { name: 'embeddings', vector_count: 5000, storage_mb: 70.5 },
        ],
        index_health: 'optimal',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStats,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.getStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/stats');
      expect(result).toEqual(mockStats);
    });

    it('fetches stats for specific namespace', async () => {
      const mockStats = {
        namespace: 'default',
        vector_count: 10000,
        storage_mb: 180,
        dimensions: 1536,
        index_type: 'hnsw',
        avg_query_latency_ms: 8.5,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStats,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.getStats('default');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/stats?namespace=default');
      expect(result).toEqual(mockStats);
    });

    it('handles errors when fetching stats', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Database unavailable'));

      await expect(zerodbService.getStats()).rejects.toThrow('Database unavailable');
    });
  });

  // ===== Query Endpoints =====
  describe('executeQuery', () => {
    it('executes a vector similarity query', async () => {
      const query = {
        namespace: 'default',
        vector: [0.1, 0.2, 0.3], // simplified
        top_k: 10,
        include_metadata: true,
      };

      const mockResults = {
        results: [
          {
            id: 'vec-1',
            score: 0.95,
            metadata: { source: 'document.pdf', page: 1 },
          },
          {
            id: 'vec-2',
            score: 0.88,
            metadata: { source: 'document.pdf', page: 3 },
          },
        ],
        query_time_ms: 15.2,
        total_scanned: 10000,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResults,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.executeQuery(query);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/zerodb/query', query);
      expect(result).toEqual(mockResults);
    });

    it('executes query with filter', async () => {
      const query = {
        namespace: 'default',
        vector: [0.1, 0.2, 0.3],
        top_k: 5,
        filter: {
          source: 'document.pdf',
        },
      };

      const mockResults = {
        results: [
          {
            id: 'vec-1',
            score: 0.95,
            metadata: { source: 'document.pdf', page: 1 },
          },
        ],
        query_time_ms: 8.5,
        total_scanned: 500,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResults,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.executeQuery(query);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/zerodb/query', query);
      expect(result).toEqual(mockResults);
    });

    it('handles errors during query execution', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid vector dimensions'));

      await expect(
        zerodbService.executeQuery({
          namespace: 'default',
          vector: [0.1],
          top_k: 10,
        })
      ).rejects.toThrow('Invalid vector dimensions');
    });
  });

  // ===== Vector Browser Endpoints =====
  describe('listVectors', () => {
    it('fetches vectors from namespace', async () => {
      const mockVectors = {
        vectors: [
          {
            id: 'vec-1',
            namespace: 'default',
            metadata: { source: 'file1.pdf' },
            created_at: '2025-12-21T10:00:00Z',
          },
          {
            id: 'vec-2',
            namespace: 'default',
            metadata: { source: 'file2.pdf' },
            created_at: '2025-12-21T10:05:00Z',
          },
        ],
        total: 10000,
        page: 1,
        page_size: 50,
        has_more: true,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockVectors,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.listVectors({ namespace: 'default' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/vectors?namespace=default');
      expect(result).toEqual(mockVectors);
    });

    it('fetches vectors with pagination', async () => {
      const params = {
        namespace: 'default',
        page: 2,
        page_size: 100,
      };

      const mockVectors = {
        vectors: [],
        total: 10000,
        page: 2,
        page_size: 100,
        has_more: true,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockVectors,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.listVectors(params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/zerodb/vectors?namespace=default&page=2&page_size=100'
      );
      expect(result).toEqual(mockVectors);
    });

    it('handles errors when listing vectors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Namespace not found'));

      await expect(zerodbService.listVectors({ namespace: 'unknown' })).rejects.toThrow(
        'Namespace not found'
      );
    });
  });

  describe('getVector', () => {
    it('fetches a specific vector by ID', async () => {
      const mockVector = {
        id: 'vec-1',
        namespace: 'default',
        vector: [0.1, 0.2, 0.3, 0.4],
        metadata: {
          source: 'document.pdf',
          page: 1,
          content: 'Sample text content',
        },
        created_at: '2025-12-21T10:00:00Z',
        updated_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockVector,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.getVector('vec-1', 'default');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/vectors/vec-1?namespace=default');
      expect(result).toEqual(mockVector);
    });

    it('handles errors when fetching vector', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Vector not found'));

      await expect(zerodbService.getVector('unknown', 'default')).rejects.toThrow('Vector not found');
    });
  });

  describe('deleteVector', () => {
    it('deletes a vector by ID', async () => {
      const mockResponse = {
        message: 'Vector deleted successfully',
        vector_id: 'vec-1',
      };

      mockApiClient.delete.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.deleteVector('vec-1', 'default');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/public/zerodb/vectors/vec-1?namespace=default');
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when deleting vector', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Vector not found'));

      await expect(zerodbService.deleteVector('unknown', 'default')).rejects.toThrow('Vector not found');
    });
  });

  // ===== Import/Export Endpoints =====
  describe('importData', () => {
    it('imports data into namespace', async () => {
      const importRequest = {
        namespace: 'default',
        format: 'json' as const,
        data: JSON.stringify([
          { id: 'vec-1', vector: [0.1, 0.2], metadata: { source: 'test' } },
        ]),
      };

      const mockResponse = {
        import_id: 'import-123',
        status: 'completed',
        vectors_imported: 1,
        errors: 0,
        duration_ms: 150,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.importData(importRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/zerodb/import', importRequest);
      expect(result).toEqual(mockResponse);
    });

    it('imports data from URL', async () => {
      const importRequest = {
        namespace: 'default',
        format: 'parquet' as const,
        source_url: 'https://storage.example.com/data.parquet',
      };

      const mockResponse = {
        import_id: 'import-456',
        status: 'processing',
        vectors_imported: 0,
        errors: 0,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 202,
        statusText: 'Accepted',
      });

      const result = await zerodbService.importData(importRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/zerodb/import', importRequest);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors during import', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid data format'));

      await expect(
        zerodbService.importData({
          namespace: 'default',
          format: 'json',
          data: 'invalid',
        })
      ).rejects.toThrow('Invalid data format');
    });
  });

  describe('exportData', () => {
    it('exports data from namespace', async () => {
      const exportRequest = {
        namespace: 'default',
        format: 'json' as const,
        include_vectors: true,
      };

      const mockResponse = {
        export_id: 'export-789',
        download_url: 'https://storage.example.com/exports/export-789.json',
        format: 'json',
        vectors_exported: 10000,
        size_mb: 45.5,
        expires_at: '2025-12-22T12:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.exportData(exportRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/zerodb/export', exportRequest);
      expect(result).toEqual(mockResponse);
    });

    it('exports data with filter', async () => {
      const exportRequest = {
        namespace: 'default',
        format: 'parquet' as const,
        filter: {
          source: 'document.pdf',
        },
        include_vectors: false,
      };

      const mockResponse = {
        export_id: 'export-101',
        download_url: 'https://storage.example.com/exports/export-101.parquet',
        format: 'parquet',
        vectors_exported: 500,
        size_mb: 2.3,
        expires_at: '2025-12-22T12:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.exportData(exportRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/zerodb/export', exportRequest);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors during export', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Export quota exceeded'));

      await expect(
        zerodbService.exportData({
          namespace: 'default',
          format: 'json',
        })
      ).rejects.toThrow('Export quota exceeded');
    });
  });

  // ===== Index Management =====
  describe('createIndex', () => {
    it('creates an index for namespace', async () => {
      const indexRequest = {
        namespace: 'default',
        index_type: 'hnsw' as const,
        metric: 'cosine' as const,
        params: {
          ef_construction: 200,
          m: 16,
        },
      };

      const mockResponse = {
        index_id: 'idx-123',
        namespace: 'default',
        index_type: 'hnsw',
        metric: 'cosine',
        status: 'building',
        progress: 0,
        created_at: '2025-12-21T12:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 202,
        statusText: 'Accepted',
      });

      const result = await zerodbService.createIndex(indexRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/zerodb/index', indexRequest);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when creating index', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Index already exists'));

      await expect(
        zerodbService.createIndex({
          namespace: 'default',
          index_type: 'hnsw',
          metric: 'cosine',
        })
      ).rejects.toThrow('Index already exists');
    });
  });

  describe('getIndexStatus', () => {
    it('fetches index status', async () => {
      const mockStatus = {
        index_id: 'idx-123',
        namespace: 'default',
        status: 'ready',
        progress: 100,
        vectors_indexed: 10000,
        build_time_ms: 5000,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStatus,
        status: 200,
        statusText: 'OK',
      });

      const result = await zerodbService.getIndexStatus('default');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/index/status?namespace=default');
      expect(result).toEqual(mockStatus);
    });

    it('handles errors when fetching index status', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Index not found'));

      await expect(zerodbService.getIndexStatus('unknown')).rejects.toThrow('Index not found');
    });
  });
});
