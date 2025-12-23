/**
 * Strapi Client Tests (TDD)
 * Test-first implementation for Strapi CMS API client
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('StrapiClient', () => {
  let strapiClient: any;
  const MOCK_BASE_URL = 'https://ainative-community-production.up.railway.app/api';

  beforeEach(async () => {
    // Dynamic import to ensure mocks are set up first
    const { default: StrapiClient } = await import('../strapi-client');
    strapiClient = new StrapiClient();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Client Initialization', () => {
    it('should create an axios instance with correct base URL', async () => {
      jest.clearAllMocks();
      const { default: StrapiClient } = await import('../strapi-client');
      new StrapiClient();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('/api'),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should have configurable timeout', async () => {
      jest.clearAllMocks();
      const { default: StrapiClient } = await import('../strapi-client');
      new StrapiClient();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: expect.any(Number),
        })
      );
    });
  });

  describe('getBlogPosts()', () => {
    const mockBlogPosts = {
      data: [
        {
          id: 1,
          documentId: 'abc123',
          title: 'Test Blog Post',
          slug: 'test-blog-post',
          content: 'Blog content...',
          published_date: '2025-01-01',
          author: { id: 1, name: 'John Doe' },
        },
      ],
      meta: {
        pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 },
      },
    };

    it('should fetch blog posts with default parameters', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockBlogPosts }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      const result = await client.getBlogPosts();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/blog-posts', {
        params: {
          populate: '*',
          sort: 'published_date:desc',
        },
      });
      expect(result).toEqual(mockBlogPosts);
    });

    it('should accept custom parameters', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockBlogPosts }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      await client.getBlogPosts({
        pagination: { page: 2, pageSize: 10 },
        filters: { category: { $eq: 'tutorial' } },
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/blog-posts', {
        params: expect.objectContaining({
          pagination: { page: 2, pageSize: 10 },
          filters: { category: { $eq: 'tutorial' } },
        }),
      });
    });

    it('should handle errors gracefully', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue(new Error('Network error')),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      await expect(client.getBlogPosts()).rejects.toThrow('Network error');
    });
  });

  describe('getBlogPost(slug)', () => {
    const mockBlogPost = {
      id: 1,
      documentId: 'abc123',
      title: 'Test Blog Post',
      slug: 'test-blog-post',
      content: 'Blog content...',
    };

    it('should fetch a single blog post by slug', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: { data: [mockBlogPost] } }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      const result = await client.getBlogPost('test-blog-post');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/blog-posts', {
        params: {
          filters: { slug: { $eq: 'test-blog-post' } },
          populate: '*',
        },
      });
      expect(result).toEqual(mockBlogPost);
    });

    it('should return null if blog post not found', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: { data: [] } }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      const result = await client.getBlogPost('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getVideos()', () => {
    const mockVideos = {
      data: [
        {
          id: 1,
          documentId: 'vid123',
          title: 'Test Video',
          slug: 'test-video',
          category: 'tutorial',
          duration: 300,
          video_url: 'https://cdn.example.com/video.m3u8',
          thumbnail_url: 'https://cdn.example.com/thumb.jpg',
          views: 1000,
          likes: 50,
          featured: true,
        },
      ],
      meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 } },
    };

    it('should fetch videos with featured first sorting', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockVideos }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      const result = await client.getVideos();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/videos', {
        params: {
          populate: '*',
          sort: ['featured:desc', 'publishedAt:desc'],
        },
      });
      expect(result).toEqual(mockVideos);
    });

    it('should support category filtering', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockVideos }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      await client.getVideos({
        filters: { category: { $eq: 'webinar' } },
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/videos', {
        params: expect.objectContaining({
          filters: { category: { $eq: 'webinar' } },
        }),
      });
    });
  });

  describe('getVideo(slug)', () => {
    const mockVideo = {
      id: 1,
      documentId: 'vid123',
      title: 'Test Video',
      slug: 'test-video',
      video_url: 'https://cdn.example.com/video.m3u8',
    };

    it('should fetch a single video by slug', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: { data: [mockVideo] } }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      const result = await client.getVideo('test-video');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/videos', {
        params: {
          filters: { slug: { $eq: 'test-video' } },
          populate: '*',
        },
      });
      expect(result).toEqual(mockVideo);
    });
  });

  describe('updateVideoViews()', () => {
    it('should increment video view count', async () => {
      const mockAxiosInstance = {
        put: jest.fn().mockResolvedValue({ data: { data: { id: 1, views: 101 } } }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      await client.updateVideoViews(1, 101);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/videos/1', {
        data: { views: 101 },
      });
    });
  });

  describe('updateVideoLikes()', () => {
    it('should update video like count', async () => {
      const mockAxiosInstance = {
        put: jest.fn().mockResolvedValue({ data: { data: { id: 1, likes: 51 } } }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      await client.updateVideoLikes(1, 51);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/videos/1', {
        data: { likes: 51 },
      });
    });
  });

  describe('getTutorials()', () => {
    it('should fetch tutorials', async () => {
      const mockTutorials = {
        data: [
          {
            id: 1,
            title: 'Test Tutorial',
            slug: 'test-tutorial',
            difficulty: 'beginner',
          },
        ],
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockTutorials }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      const result = await client.getTutorials();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tutorials', {
        params: { populate: '*' },
      });
      expect(result).toEqual(mockTutorials);
    });
  });

  describe('getWebinars()', () => {
    it('should fetch webinars with speaker population', async () => {
      const mockWebinars = {
        data: [
          {
            id: 1,
            title: 'Test Webinar',
            slug: 'test-webinar',
            date: '2025-02-01',
            speaker: { id: 1, name: 'Jane Doe' },
          },
        ],
      };

      const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({ data: mockWebinars }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      const result = await client.getWebinars();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/webinars', {
        params: {
          populate: ['speaker', 'co_speakers', 'video', 'thumbnail', 'tags', 'category'],
          sort: ['date:desc'],
        },
      });
      expect(result).toEqual(mockWebinars);
    });
  });

  describe('TypeScript Types', () => {
    it('should export proper TypeScript interfaces', async () => {
      const {
        StrapiResponse,
        BlogPost,
        Video,
        Tutorial,
        Webinar,
      } = await import('../strapi-client');

      // Type checking - these should not throw TypeScript errors
      const blogPost: BlogPost = {
        id: 1,
        documentId: 'test',
        title: 'Test',
        slug: 'test',
        content: 'Content',
        published_date: '2025-01-01',
      };

      const video: Video = {
        id: 1,
        documentId: 'test',
        title: 'Test Video',
        slug: 'test-video',
        category: 'tutorial',
        duration: 300,
        video_url: 'https://example.com/video.m3u8',
        thumbnail_url: 'https://example.com/thumb.jpg',
        views: 0,
        likes: 0,
        featured: false,
        publishedAt: '2025-01-01',
      };

      expect(blogPost).toBeDefined();
      expect(video).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should log errors and re-throw them', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue(new Error('API Error')),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      await expect(client.getBlogPosts()).rejects.toThrow('API Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle network timeouts', async () => {
      const mockAxiosInstance = {
        get: jest.fn().mockRejectedValue({ code: 'ECONNABORTED', message: 'timeout' }),
      } as unknown as AxiosInstance;

      mockedAxios.create.mockReturnValue(mockAxiosInstance);
      const { default: StrapiClient } = await import('../strapi-client');
      const client = new StrapiClient();

      await expect(client.getBlogPosts()).rejects.toMatchObject({
        code: 'ECONNABORTED',
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should use production URL by default', async () => {
      const { default: StrapiClient } = await import('../strapi-client');
      new StrapiClient();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('ainative-community-production'),
        })
      );
    });

    it('should allow custom base URL override', async () => {
      const { default: StrapiClient } = await import('../strapi-client');
      const customUrl = 'https://custom-strapi.example.com/api';
      new StrapiClient(customUrl);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: customUrl,
        })
      );
    });
  });
});
