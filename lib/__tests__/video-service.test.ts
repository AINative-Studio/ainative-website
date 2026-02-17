import apiClient from '../api-client';
import videoService from '../video-service';

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

describe('VideoService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadVideo', () => {
    it('uploads a video file', async () => {
      const mockFile = new File(['video content'], 'test-video.mp4', { type: 'video/mp4' });
      const uploadRequest = {
        file: mockFile,
        name: 'My Test Video',
        description: 'A test video description',
      };

      const mockVideo = {
        id: 'video-1',
        name: 'My Test Video',
        originalName: 'test-video.mp4',
        description: 'A test video description',
        status: 'uploading',
        format: 'mp4',
        resolution: '1080p',
        duration: 0,
        fileSize: 1024000,
        createdAt: '2025-12-21T10:00:00Z',
        updatedAt: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockVideo,
        status: 201,
        statusText: 'Created',
      });

      const result = await videoService.uploadVideo(uploadRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/video/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result).toEqual(mockVideo);
    });

    it('handles upload errors', async () => {
      const mockFile = new File(['content'], 'test.mp4', { type: 'video/mp4' });
      mockApiClient.post.mockRejectedValueOnce(new Error('File too large'));

      await expect(
        videoService.uploadVideo({ file: mockFile, name: 'Test' })
      ).rejects.toThrow('File too large');
    });
  });

  describe('getVideo', () => {
    it('fetches video details', async () => {
      const mockVideo = {
        id: 'video-1',
        name: 'My Video',
        originalName: 'original.mp4',
        status: 'completed',
        format: 'mp4',
        resolution: '1080p',
        duration: 120,
        fileSize: 50000000,
        thumbnailUrl: 'https://cdn.example.com/thumb-1.jpg',
        videoUrl: 'https://cdn.example.com/video-1.mp4',
        createdAt: '2025-12-21T10:00:00Z',
        updatedAt: '2025-12-21T10:05:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockVideo,
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.getVideo('video-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/video/video-1');
      expect(result).toEqual(mockVideo);
    });

    it('handles errors when fetching video', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Video not found'));

      await expect(videoService.getVideo('invalid-id')).rejects.toThrow('Video not found');
    });
  });

  describe('processVideo', () => {
    it('processes video with options', async () => {
      const processRequest = {
        options: {
          resolution: '720p' as const,
          format: 'webm' as const,
          extractThumbnail: true,
          quality: 'high' as const,
          codec: 'vp9' as const,
        },
      };

      const mockStatus = {
        videoId: 'video-1',
        status: 'processing',
        progress: 0,
        stage: 'initializing',
        estimatedTimeRemaining: 120,
        startedAt: '2025-12-21T10:10:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockStatus,
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.processVideo('video-1', processRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/video/video-1/process', processRequest);
      expect(result).toEqual(mockStatus);
    });

    it('handles processing errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invalid video format'));

      await expect(
        videoService.processVideo('video-1', { options: {} })
      ).rejects.toThrow('Invalid video format');
    });
  });

  describe('getProcessingStatus', () => {
    it('fetches processing status', async () => {
      const mockStatus = {
        videoId: 'video-1',
        status: 'processing',
        progress: 45,
        stage: 'encoding',
        estimatedTimeRemaining: 60,
        startedAt: '2025-12-21T10:10:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStatus,
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.getProcessingStatus('video-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/video/video-1/status');
      expect(result).toEqual(mockStatus);
    });

    it('returns completed status', async () => {
      const mockStatus = {
        videoId: 'video-1',
        status: 'completed',
        progress: 100,
        stage: 'done',
        startedAt: '2025-12-21T10:10:00Z',
        completedAt: '2025-12-21T10:15:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStatus,
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.getProcessingStatus('video-1');

      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('getVideoLibrary', () => {
    it('fetches video library', async () => {
      const mockLibrary = {
        videos: [
          {
            id: 'video-1',
            name: 'Video 1',
            originalName: 'v1.mp4',
            status: 'completed',
            format: 'mp4',
            resolution: '1080p',
            duration: 120,
            fileSize: 50000000,
            createdAt: '2025-12-21T10:00:00Z',
            updatedAt: '2025-12-21T10:05:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockLibrary,
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.getVideoLibrary();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/video/library');
      expect(result).toEqual(mockLibrary);
    });

    it('fetches video library with params', async () => {
      const mockLibrary = {
        videos: [],
        total: 0,
        page: 2,
        pageSize: 10,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockLibrary,
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.getVideoLibrary({
        page: 2,
        pageSize: 10,
        status: 'completed',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/video/library?page=2&pageSize=10&status=completed&sortBy=createdAt&sortOrder=desc'
      );
      expect(result).toEqual(mockLibrary);
    });
  });

  describe('deleteVideo', () => {
    it('deletes a video', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.deleteVideo('video-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/public/video/video-1');
      expect(result.success).toBe(true);
    });

    it('handles delete errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Video not found'));

      await expect(videoService.deleteVideo('invalid-id')).rejects.toThrow('Video not found');
    });
  });

  describe('batchProcess', () => {
    it('batch processes multiple videos', async () => {
      const videoIds = ['video-1', 'video-2', 'video-3'];
      const options = {
        resolution: '720p' as const,
        format: 'mp4' as const,
        quality: 'medium' as const,
      };

      const mockResult = {
        jobId: 'batch-job-1',
        videos: videoIds,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResult,
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.batchProcess(videoIds, options);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/video/batch-process', {
        videoIds,
        options,
      });
      expect(result).toEqual(mockResult);
    });

    it('handles batch processing errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Too many videos'));

      await expect(
        videoService.batchProcess(['v1', 'v2'], {})
      ).rejects.toThrow('Too many videos');
    });
  });

  describe('getVideoAnalytics', () => {
    it('fetches video analytics', async () => {
      const mockAnalytics = {
        views: 1500,
        averageWatchTime: 85,
        completionRate: 0.72,
        engagementScore: 8.5,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockAnalytics,
        status: 200,
        statusText: 'OK',
      });

      const result = await videoService.getVideoAnalytics('video-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/video/video-1/analytics');
      expect(result).toEqual(mockAnalytics);
    });

    it('handles analytics errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Analytics not available'));

      await expect(videoService.getVideoAnalytics('video-1')).rejects.toThrow('Analytics not available');
    });
  });
});
