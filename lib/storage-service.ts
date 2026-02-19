/**
 * Storage Service
 * Handles all ZeroDB file storage API calls
 *
 * Refs #579
 */

import apiClient from './api-client';

// ===== Storage Bucket Types =====
export interface StorageBucket {
  id: string;
  name: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  file_count: number;
  total_size_bytes: number;
}

export interface BucketsListResponse {
  buckets: StorageBucket[];
  total: number;
}

// ===== File Types =====
export interface StorageFile {
  id: string;
  project_id: string;
  name: string;
  size_bytes: number;
  content_type: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  url?: string;
}

export interface FilesListResponse {
  files: StorageFile[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface ListFilesParams {
  page?: number;
  page_size?: number;
  filter?: Record<string, unknown>;
}

export interface FileUploadResponse {
  file_id: string;
  name: string;
  size_bytes: number;
  url: string;
  created_at: string;
}

export interface FileMetadataResponse {
  file_id: string;
  metadata: Record<string, unknown>;
  updated_at: string;
}

export interface FileStatsResponse {
  total_files: number;
  total_size_bytes: number;
  total_size_mb: number;
  average_file_size_bytes: number;
  largest_file_bytes: number;
  by_content_type: {
    content_type: string;
    count: number;
    total_bytes: number;
  }[];
}

export interface DeleteFileResponse {
  message: string;
  file_id: string;
}

export interface PresignedUrlResponse {
  url: string;
  expires_at: string;
  file_id: string;
}

/**
 * Storage Service class
 * All endpoints are project-scoped and require a project_id
 */
class StorageService {
  private defaultProjectId = 'default'; // Fallback project ID

  /**
   * Set the default project ID for storage operations
   */
  setProjectId(projectId: string): void {
    this.defaultProjectId = projectId;
  }

  /**
   * Get the current project ID
   */
  getProjectId(): string {
    return this.defaultProjectId;
  }

  // ===== Storage Bucket Endpoints =====

  /**
   * List all storage buckets
   */
  async listBuckets(): Promise<BucketsListResponse> {
    const response = await apiClient.get<BucketsListResponse>(
      '/v1/public/zerodb/storage/buckets'
    );
    return response.data;
  }

  // ===== File Management Endpoints =====

  /**
   * List files in the current project
   */
  async listFiles(params: ListFilesParams = {}): Promise<FilesListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) {
      queryParams.set('page', String(params.page));
    }
    if (params.page_size !== undefined) {
      queryParams.set('page_size', String(params.page_size));
    }

    const endpoint = `/v1/public/zerodb/${this.defaultProjectId}/files${
      queryParams.toString() ? '?' + queryParams.toString() : ''
    }`;
    const response = await apiClient.get<FilesListResponse>(endpoint);
    return response.data;
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(file: File, metadata?: Record<string, unknown>): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiClient.post<FileUploadResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/files/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Get file statistics
   */
  async getFileStats(): Promise<FileStatsResponse> {
    const response = await apiClient.get<FileStatsResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/files/stats/summary`
    );
    return response.data;
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    fileId: string,
    metadata: Record<string, unknown>
  ): Promise<FileMetadataResponse> {
    const response = await apiClient.post<FileMetadataResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/files/metadata`,
      {
        file_id: fileId,
        metadata,
      }
    );
    return response.data;
  }

  /**
   * Get a specific file by ID
   */
  async getFile(fileId: string): Promise<StorageFile> {
    const response = await apiClient.get<StorageFile>(
      `/v1/public/zerodb/${this.defaultProjectId}/files/${fileId}`
    );
    return response.data;
  }

  /**
   * Delete a file by ID
   */
  async deleteFile(fileId: string): Promise<DeleteFileResponse> {
    const response = await apiClient.delete<DeleteFileResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/files/${fileId}`
    );
    return response.data;
  }

  /**
   * Get file content URL
   */
  async getFileContent(fileId: string): Promise<string> {
    const response = await apiClient.get<Blob>(
      `/v1/public/zerodb/${this.defaultProjectId}/files/${fileId}/content`,
      {
        headers: {
          Accept: '*/*',
        },
      }
    );
    return URL.createObjectURL(response.data as unknown as Blob);
  }

  /**
   * Download a file
   */
  async downloadFile(fileId: string, filename?: string): Promise<void> {
    const response = await apiClient.get<Blob>(
      `/v1/public/zerodb/${this.defaultProjectId}/files/${fileId}/download`,
      {
        headers: {
          Accept: '*/*',
        },
      }
    );

    // Create a download link
    const url = URL.createObjectURL(response.data as unknown as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `file-${fileId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ===== Database-level File Storage Endpoints =====

  /**
   * List files at database level
   */
  async listDatabaseFiles(params: ListFilesParams = {}): Promise<FilesListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) {
      queryParams.set('page', String(params.page));
    }
    if (params.page_size !== undefined) {
      queryParams.set('page_size', String(params.page_size));
    }

    const endpoint = `/v1/public/zerodb/${this.defaultProjectId}/database/files${
      queryParams.toString() ? '?' + queryParams.toString() : ''
    }`;
    const response = await apiClient.get<FilesListResponse>(endpoint);
    return response.data;
  }

  /**
   * Create a file at database level
   */
  async createDatabaseFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FileUploadResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/database/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Get database file statistics
   */
  async getDatabaseFileStats(): Promise<FileStatsResponse> {
    const response = await apiClient.get<FileStatsResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/database/files/stats`
    );
    return response.data;
  }

  /**
   * Get a database file by ID
   */
  async getDatabaseFile(fileId: string): Promise<StorageFile> {
    const response = await apiClient.get<StorageFile>(
      `/v1/public/zerodb/${this.defaultProjectId}/database/files/${fileId}`
    );
    return response.data;
  }

  /**
   * Delete a database file by ID
   */
  async deleteDatabaseFile(fileId: string): Promise<DeleteFileResponse> {
    const response = await apiClient.delete<DeleteFileResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/database/files/${fileId}`
    );
    return response.data;
  }

  /**
   * Download a database file
   */
  async downloadDatabaseFile(fileId: string, filename?: string): Promise<void> {
    const response = await apiClient.get<Blob>(
      `/v1/public/zerodb/${this.defaultProjectId}/database/files/${fileId}/download`,
      {
        headers: {
          Accept: '*/*',
        },
      }
    );

    const url = URL.createObjectURL(response.data as unknown as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `file-${fileId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate a presigned URL for file access
   */
  async getPresignedUrl(fileId: string, expiresIn?: number): Promise<PresignedUrlResponse> {
    const response = await apiClient.post<PresignedUrlResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/database/files/${fileId}/presigned-url`,
      {
        expires_in: expiresIn || 3600, // Default 1 hour
      }
    );
    return response.data;
  }

  /**
   * Upload file to database storage
   */
  async uploadDatabaseFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FileUploadResponse>(
      `/v1/public/zerodb/${this.defaultProjectId}/database/storage/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // ===== Utility Functions =====

  /**
   * Format bytes to human-readable size
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Get file icon based on content type
   */
  getFileIcon(contentType: string): string {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.includes('pdf')) return 'file-text';
    if (contentType.includes('zip') || contentType.includes('archive')) return 'archive';
    if (contentType.includes('json') || contentType.includes('xml')) return 'code';
    return 'file';
  }
}

// Export singleton instance
export const storageService = new StorageService();
