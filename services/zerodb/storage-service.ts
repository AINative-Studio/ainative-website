import apiClient from '../../utils/apiClient';

export interface StorageBucket {
  id: string;
  name: string;
  region: string;
  size_bytes: number;
  object_count: number;
  versioning_enabled: boolean;
  encryption_enabled: boolean;
  access_policy: 'private' | 'public-read' | 'public-read-write';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  status: string;
}

export interface BucketCreateRequest {
  name: string;
  region?: string;
  versioning_enabled?: boolean;
  encryption_enabled?: boolean;
  access_policy?: 'private' | 'public-read' | 'public-read-write';
  metadata?: Record<string, any>;
}

export interface StorageFile {
  id: string;
  name: string;
  bucket_name: string;
  size_bytes: number;
  content_type: string;
  etag: string;
  version_id?: string;
  is_latest: boolean;
  storage_class: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  tags?: Record<string, string>;
  url?: string;
  signed_url?: string;
}

export interface FileUploadRequest {
  bucket_name: string;
  file_name: string;
  file: File | Blob;
  content_type?: string;
  metadata?: Record<string, any>;
  tags?: Record<string, string>;
  storage_class?: string;
}

export interface FileUploadResponse {
  file_id: string;
  file_name: string;
  size_bytes: number;
  etag: string;
  version_id?: string;
  url: string;
  signed_url?: string;
  upload_time_ms: number;
}

export interface PresignedUrlRequest {
  bucket_name: string;
  file_name: string;
  expiry_seconds?: number;
  method?: 'GET' | 'PUT' | 'DELETE';
}

export interface PresignedUrlResponse {
  url: string;
  expiry: string;
  method: string;
}

export class StorageService {
  private static readonly BASE_PATH = '/v1/public/zerodb/storage';

  // Bucket Management
  static async getBuckets(): Promise<StorageBucket[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/buckets`);
      return response.data as StorageBucket[];
    } catch (error: any) {
      throw new Error(`Failed to fetch storage buckets: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createBucket(request: BucketCreateRequest): Promise<StorageBucket> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/buckets`, request);
      return response.data as StorageBucket;
    } catch (error: any) {
      throw new Error(`Failed to create storage bucket: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getBucket(bucketName: string): Promise<StorageBucket> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/buckets/${bucketName}`);
      return response.data as StorageBucket;
    } catch (error: any) {
      throw new Error(`Failed to fetch storage bucket: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateBucket(bucketName: string, updates: Partial<BucketCreateRequest>): Promise<StorageBucket> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/buckets/${bucketName}`, updates);
      return response.data as StorageBucket;
    } catch (error: any) {
      throw new Error(`Failed to update storage bucket: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteBucket(bucketName: string, force: boolean = false): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/buckets/${bucketName}`, {
        params: { force }
      } as any);
    } catch (error: any) {
      throw new Error(`Failed to delete storage bucket: ${error.response?.data?.detail || error.message}`);
    }
  }

  // File Management
  static async getFiles(bucketName?: string, prefix?: string, limit?: number): Promise<StorageFile[]> {
    try {
      const params: any = {};
      if (bucketName) params.bucket_name = bucketName;
      if (prefix) params.prefix = prefix;
      if (limit) params.limit = limit;

      const response = await apiClient.get(`${this.BASE_PATH}/files`, { params } as any);
      return response.data as StorageFile[];
    } catch (error: any) {
      throw new Error(`Failed to fetch storage files: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('bucket_name', request.bucket_name);
      formData.append('file_name', request.file_name);
      
      if (request.content_type) {
        formData.append('content_type', request.content_type);
      }
      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }
      if (request.tags) {
        formData.append('tags', JSON.stringify(request.tags));
      }
      if (request.storage_class) {
        formData.append('storage_class', request.storage_class);
      }

      const response = await apiClient.post(`${this.BASE_PATH}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as FileUploadResponse;
    } catch (error: any) {
      throw new Error(`File upload failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getFile(fileId: string): Promise<StorageFile> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/files/${fileId}`);
      return response.data as StorageFile;
    } catch (error: any) {
      throw new Error(`Failed to fetch storage file: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateFile(fileId: string, updates: {
    metadata?: Record<string, any>;
    tags?: Record<string, string>;
  }): Promise<StorageFile> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/files/${fileId}`, updates);
      return response.data as StorageFile;
    } catch (error: any) {
      throw new Error(`Failed to update storage file: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteFile(fileId: string, version?: string): Promise<void> {
    try {
      const params = version ? { version } : {};
      await apiClient.delete(`${this.BASE_PATH}/files/${fileId}`, { params } as any);
    } catch (error: any) {
      throw new Error(`Failed to delete storage file: ${error.response?.data?.detail || error.message}`);
    }
  }

  // File Download
  static async downloadFile(fileId: string, version?: string): Promise<Blob> {
    try {
      const params = version ? { version } : {};
      const response = await apiClient.get(`${this.BASE_PATH}/files/${fileId}/download`, {
        params,
        responseType: 'blob'
      } as any);
      return response.data as Blob;
    } catch (error: any) {
      throw new Error(`File download failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Presigned URLs
  static async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/presigned-url`, request);
      return response.data as PresignedUrlResponse;
    } catch (error: any) {
      throw new Error(`Failed to generate presigned URL: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Batch Operations
  static async deleteFiles(fileIds: string[]): Promise<{ deleted_count: number; failed_count: number }> {
    try {
      const response = await apiClient.delete(`${this.BASE_PATH}/files/batch`, {
        data: { file_ids: fileIds }
      } as any);
      return response.data as { deleted_count: number; failed_count: number };
    } catch (error: any) {
      throw new Error(`Batch file deletion failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async copyFile(
    sourceFileId: string,
    targetBucketName: string,
    targetFileName: string
  ): Promise<StorageFile> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/files/${sourceFileId}/copy`, {
        target_bucket_name: targetBucketName,
        target_file_name: targetFileName
      });
      return response.data as StorageFile;
    } catch (error: any) {
      throw new Error(`File copy failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async moveFile(
    fileId: string,
    targetBucketName: string,
    targetFileName: string
  ): Promise<StorageFile> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/files/${fileId}/move`, {
        target_bucket_name: targetBucketName,
        target_file_name: targetFileName
      });
      return response.data as StorageFile;
    } catch (error: any) {
      throw new Error(`File move failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Storage Statistics
  static async getStorageStats(): Promise<{
    total_buckets: number;
    total_files: number;
    total_size_bytes: number;
    storage_by_class: Record<string, { count: number; size_bytes: number }>;
    monthly_usage: Array<{ month: string; upload_bytes: number; download_bytes: number }>;
  }> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/stats`);
      return response.data as {
        total_buckets: number;
        total_files: number;
        total_size_bytes: number;
        storage_by_class: Record<string, { count: number; size_bytes: number }>;
        monthly_usage: Array<{ month: string; upload_bytes: number; download_bytes: number }>;
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch storage stats: ${error.response?.data?.detail || error.message}`);
    }
  }

  // File Versions (for versioned buckets)
  static async getFileVersions(fileId: string): Promise<StorageFile[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/files/${fileId}/versions`);
      return response.data as StorageFile[];
    } catch (error: any) {
      throw new Error(`Failed to fetch file versions: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async restoreFileVersion(fileId: string, versionId: string): Promise<StorageFile> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/files/${fileId}/versions/${versionId}/restore`);
      return response.data as StorageFile;
    } catch (error: any) {
      throw new Error(`Failed to restore file version: ${error.response?.data?.detail || error.message}`);
    }
  }
}