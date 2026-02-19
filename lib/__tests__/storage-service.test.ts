/**
 * Unit tests for Storage Service
 * Tests all storage API methods with proper mocking
 *
 * Refs #579
 *
 * @jest-environment node
 */

import { storageService } from '../storage-service';
import apiClient from '../api-client';

// Mock the api-client
jest.mock('../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Polyfill File for Node environment
class MockFile {
  public name: string;
  public type: string;
  public size: number;
  private content: string[];

  constructor(content: string[], name: string, options?: { type?: string }) {
    this.content = content;
    this.name = name;
    this.type = options?.type || '';
    this.size = content.join('').length;
  }
}

// Polyfill FormData for Node environment
class MockFormData {
  private data: Map<string, any> = new Map();

  append(key: string, value: any) {
    this.data.set(key, value);
  }

  get(key: string) {
    return this.data.get(key);
  }
}

// @ts-ignore
global.File = MockFile;
// @ts-ignore
global.FormData = MockFormData;

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storageService.setProjectId('test-project-id');
  });

  describe('Project ID Management', () => {
    it('should set and get project ID', () => {
      storageService.setProjectId('my-project');
      expect(storageService.getProjectId()).toBe('my-project');
    });

    it('should use default project ID if not set', () => {
      const service = new (storageService.constructor as any)();
      expect(service.getProjectId()).toBe('default');
    });
  });

  describe('Bucket Operations', () => {
    it('should list storage buckets', async () => {
      const mockBuckets = {
        buckets: [
          {
            id: 'bucket-1',
            name: 'test-bucket',
            project_id: 'test-project',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            file_count: 10,
            total_size_bytes: 1024000,
          },
        ],
        total: 1,
      };

      mockedApiClient.get.mockResolvedValue({
        data: mockBuckets,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.listBuckets();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/storage/buckets');
      expect(result).toEqual(mockBuckets);
    });

    it('should handle bucket list errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(storageService.listBuckets()).rejects.toThrow('Network error');
    });
  });

  describe('File Operations', () => {
    it('should list files with pagination', async () => {
      const mockFiles = {
        files: [
          {
            id: 'file-1',
            project_id: 'test-project-id',
            name: 'test.txt',
            size_bytes: 1024,
            content_type: 'text/plain',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
        has_more: false,
      };

      mockedApiClient.get.mockResolvedValue({
        data: mockFiles,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.listFiles({ page: 1, page_size: 20 });

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/files?page=1&page_size=20'
      );
      expect(result).toEqual(mockFiles);
    });

    it('should list files without pagination params', async () => {
      const mockFiles = {
        files: [],
        total: 0,
        page: 1,
        page_size: 20,
        has_more: false,
      };

      mockedApiClient.get.mockResolvedValue({
        data: mockFiles,
        status: 200,
        statusText: 'OK',
      });

      await storageService.listFiles();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/v1/public/zerodb/test-project-id/files');
    });

    it('should upload a file', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        file_id: 'file-1',
        name: 'test.txt',
        size_bytes: 12,
        url: 'https://example.com/file-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockedApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await storageService.uploadFile(mockFile);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/files/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should upload a file with metadata', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const metadata = { description: 'Test file', tags: ['test'] };
      const mockResponse = {
        file_id: 'file-1',
        name: 'test.txt',
        size_bytes: 12,
        url: 'https://example.com/file-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockedApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await storageService.uploadFile(mockFile, metadata);

      const callArgs = mockedApiClient.post.mock.calls[0];
      const formData = callArgs[1] as FormData;

      expect(formData.get('file')).toBe(mockFile);
      expect(formData.get('metadata')).toBe(JSON.stringify(metadata));
      expect(result).toEqual(mockResponse);
    });

    it('should get file statistics', async () => {
      const mockStats = {
        total_files: 100,
        total_size_bytes: 1024000,
        total_size_mb: 1.024,
        average_file_size_bytes: 10240,
        largest_file_bytes: 51200,
        by_content_type: [
          { content_type: 'image/png', count: 50, total_bytes: 512000 },
          { content_type: 'text/plain', count: 50, total_bytes: 512000 },
        ],
      };

      mockedApiClient.get.mockResolvedValue({
        data: mockStats,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.getFileStats();

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/files/stats/summary'
      );
      expect(result).toEqual(mockStats);
    });

    it('should update file metadata', async () => {
      const mockResponse = {
        file_id: 'file-1',
        metadata: { description: 'Updated' },
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockedApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.updateFileMetadata('file-1', { description: 'Updated' });

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/files/metadata',
        {
          file_id: 'file-1',
          metadata: { description: 'Updated' },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get a specific file', async () => {
      const mockFile = {
        id: 'file-1',
        project_id: 'test-project-id',
        name: 'test.txt',
        size_bytes: 1024,
        content_type: 'text/plain',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockedApiClient.get.mockResolvedValue({
        data: mockFile,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.getFile('file-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/files/file-1'
      );
      expect(result).toEqual(mockFile);
    });

    it('should delete a file', async () => {
      const mockResponse = {
        message: 'File deleted successfully',
        file_id: 'file-1',
      };

      mockedApiClient.delete.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.deleteFile('file-1');

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/files/file-1'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Database File Operations', () => {
    it('should list database files', async () => {
      const mockFiles = {
        files: [],
        total: 0,
        page: 1,
        page_size: 20,
        has_more: false,
      };

      mockedApiClient.get.mockResolvedValue({
        data: mockFiles,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.listDatabaseFiles();

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/database/files'
      );
      expect(result).toEqual(mockFiles);
    });

    it('should create a database file', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        file_id: 'db-file-1',
        name: 'test.txt',
        size_bytes: 4,
        url: 'https://example.com/db-file-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockedApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await storageService.createDatabaseFile(mockFile);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/database/files',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get database file statistics', async () => {
      const mockStats = {
        total_files: 50,
        total_size_bytes: 512000,
        total_size_mb: 0.512,
        average_file_size_bytes: 10240,
        largest_file_bytes: 25600,
        by_content_type: [],
      };

      mockedApiClient.get.mockResolvedValue({
        data: mockStats,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.getDatabaseFileStats();

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/database/files/stats'
      );
      expect(result).toEqual(mockStats);
    });

    it('should get a database file', async () => {
      const mockFile = {
        id: 'db-file-1',
        project_id: 'test-project-id',
        name: 'test.db',
        size_bytes: 4096,
        content_type: 'application/octet-stream',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockedApiClient.get.mockResolvedValue({
        data: mockFile,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.getDatabaseFile('db-file-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/database/files/db-file-1'
      );
      expect(result).toEqual(mockFile);
    });

    it('should delete a database file', async () => {
      const mockResponse = {
        message: 'Database file deleted successfully',
        file_id: 'db-file-1',
      };

      mockedApiClient.delete.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.deleteDatabaseFile('db-file-1');

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/database/files/db-file-1'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should generate a presigned URL', async () => {
      const mockResponse = {
        url: 'https://example.com/presigned-url',
        expires_at: '2024-01-01T01:00:00Z',
        file_id: 'db-file-1',
      };

      mockedApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await storageService.getPresignedUrl('db-file-1', 7200);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/database/files/db-file-1/presigned-url',
        {
          expires_in: 7200,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should use default expiration for presigned URL', async () => {
      const mockResponse = {
        url: 'https://example.com/presigned-url',
        expires_at: '2024-01-01T01:00:00Z',
        file_id: 'db-file-1',
      };

      mockedApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      await storageService.getPresignedUrl('db-file-1');

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/database/files/db-file-1/presigned-url',
        {
          expires_in: 3600, // Default 1 hour
        }
      );
    });

    it('should upload file to database storage', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        file_id: 'db-file-1',
        name: 'test.txt',
        size_bytes: 4,
        url: 'https://example.com/db-file-1',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockedApiClient.post.mockResolvedValue({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await storageService.uploadDatabaseFile(mockFile);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/v1/public/zerodb/test-project-id/database/storage/upload',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Utility Functions', () => {
    it('should format bytes correctly', () => {
      expect(storageService.formatBytes(0)).toBe('0 Bytes');
      expect(storageService.formatBytes(1024)).toBe('1 KB');
      expect(storageService.formatBytes(1048576)).toBe('1 MB');
      expect(storageService.formatBytes(1073741824)).toBe('1 GB');
      expect(storageService.formatBytes(1099511627776)).toBe('1 TB');
      expect(storageService.formatBytes(1536)).toBe('1.5 KB');
    });

    it('should get correct file icon based on content type', () => {
      expect(storageService.getFileIcon('image/png')).toBe('image');
      expect(storageService.getFileIcon('video/mp4')).toBe('video');
      expect(storageService.getFileIcon('audio/mp3')).toBe('audio');
      expect(storageService.getFileIcon('application/pdf')).toBe('file-text');
      expect(storageService.getFileIcon('application/zip')).toBe('archive');
      expect(storageService.getFileIcon('application/json')).toBe('code');
      expect(storageService.getFileIcon('application/xml')).toBe('code');
      expect(storageService.getFileIcon('text/plain')).toBe('file');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('API Error'));

      await expect(storageService.listFiles()).rejects.toThrow('API Error');
      await expect(storageService.getFileStats()).rejects.toThrow('API Error');
      await expect(storageService.listBuckets()).rejects.toThrow('API Error');
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      mockedApiClient.post.mockRejectedValue(new Error('Upload failed'));

      await expect(storageService.uploadFile(mockFile)).rejects.toThrow('Upload failed');
    });

    it('should handle delete errors', async () => {
      mockedApiClient.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(storageService.deleteFile('file-1')).rejects.toThrow('Delete failed');
    });
  });
});
