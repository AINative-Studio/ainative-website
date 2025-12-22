/**
 * Video Service - Backend integration for Video Processing Dashboard
 * Integrates with all backend video processing endpoints
 */

import apiClient from './api-client';

// Types
export interface Video {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  format: string;
  resolution: string;
  duration: number;
  fileSize: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  processingProgress?: number;
  processingStage?: string;
}

export interface ProcessingOptions {
  resolution?: '480p' | '720p' | '1080p' | '4k' | 'original';
  format?: 'mp4' | 'webm' | 'mov' | 'avi';
  extractThumbnail?: boolean;
  thumbnailTimestamp?: number;
  quality?: 'low' | 'medium' | 'high';
  codec?: 'h264' | 'h265' | 'vp9' | 'av1';
}

export interface ProcessingStatus {
  videoId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  estimatedTimeRemaining?: number;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface UploadVideoRequest {
  file: File;
  name: string;
  description?: string;
  onProgress?: (progress: number) => void;
}

export interface ProcessVideoRequest {
  options: ProcessingOptions;
}

export interface VideoLibraryResponse {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VideoLibraryParams {
  page?: number;
  pageSize?: number;
  status?: Video['status'];
  sortBy?: 'createdAt' | 'name' | 'duration' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

// Video Service
const videoService = {
  /**
   * Upload a video file
   */
  async uploadVideo(request: UploadVideoRequest): Promise<Video> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('name', request.name);
    if (request.description) {
      formData.append('description', request.description);
    }

    const response = await apiClient.post<Video>('/v1/video/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get video details
   */
  async getVideo(videoId: string): Promise<Video> {
    const response = await apiClient.get<Video>(`/v1/video/${videoId}`);
    return response.data;
  },

  /**
   * Process a video with specific options
   */
  async processVideo(videoId: string, request: ProcessVideoRequest): Promise<ProcessingStatus> {
    const response = await apiClient.post<ProcessingStatus>(
      `/v1/video/${videoId}/process`,
      request
    );
    return response.data;
  },

  /**
   * Get video processing status
   */
  async getProcessingStatus(videoId: string): Promise<ProcessingStatus> {
    const response = await apiClient.get<ProcessingStatus>(`/v1/video/${videoId}/status`);
    return response.data;
  },

  /**
   * Get video library with pagination and filtering
   */
  async getVideoLibrary(params?: VideoLibraryParams): Promise<VideoLibraryResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `/v1/video/library${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<VideoLibraryResponse>(endpoint);
    return response.data;
  },

  /**
   * Delete a video
   */
  async deleteVideo(videoId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/v1/video/${videoId}`);
    return response.data;
  },

  /**
   * Batch process multiple videos
   */
  async batchProcess(videoIds: string[], options: ProcessingOptions): Promise<{ jobId: string; videos: string[] }> {
    const response = await apiClient.post<{ jobId: string; videos: string[] }>(
      '/v1/video/batch-process',
      { videoIds, options }
    );
    return response.data;
  },

  /**
   * Get video analytics
   */
  async getVideoAnalytics(videoId: string): Promise<{
    views: number;
    averageWatchTime: number;
    completionRate: number;
    engagementScore: number;
  }> {
    const response = await apiClient.get<{
      views: number;
      averageWatchTime: number;
      completionRate: number;
      engagementScore: number;
    }>(`/v1/video/${videoId}/analytics`);
    return response.data;
  },
};

export default videoService;
