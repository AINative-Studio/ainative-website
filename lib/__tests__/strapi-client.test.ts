/**
 * Strapi Client Service Tests
 * TDD tests for Strapi CMS integration
 */

import strapiClient, {
  getBlogPosts,
  getBlogPost,
  getTutorials,
  getTutorial,
  getShowcases,
  getShowcase,
  getVideos,
  getVideo,
  updateVideoViews,
  updateVideoLikes,
  getWebinars,
  getWebinar,
  updateWebinarViews,
  updateWebinarAttendees,
  getEvents,
  getResources,
  subscribeNewsletter,
} from '../strapi-client';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Strapi Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Blog Posts', () => {
    describe('getBlogPosts', () => {
      it('should fetch all blog posts', async () => {
        const mockResponse = {
          data: [
            { id: 1, title: 'Post 1', slug: 'post-1' },
            { id: 2, title: 'Post 2', slug: 'post-2' },
          ],
          meta: { pagination: { page: 1, pageSize: 25, total: 2 } },
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getBlogPosts();

        expect(mockFetch).toHaveBeenCalled();
        expect(result.data).toHaveLength(2);
      });

      it('should throw error on API failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });

        await expect(getBlogPosts()).rejects.toThrow('Strapi API error');
      });
    });

    describe('getBlogPost', () => {
      it('should fetch a single blog post by slug', async () => {
        const mockResponse = {
          data: [{ id: 1, title: 'Test Post', slug: 'test-post', content: 'Content here' }],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getBlogPost('test-post');

        expect(result).not.toBeNull();
        expect(result?.slug).toBe('test-post');
      });

      it('should return null when post not found', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });

        const result = await getBlogPost('non-existent');

        expect(result).toBeNull();
      });
    });
  });

  describe('Tutorials', () => {
    describe('getTutorials', () => {
      it('should fetch all tutorials', async () => {
        const mockResponse = {
          data: [
            { id: 1, title: 'Tutorial 1', slug: 'tutorial-1', difficulty: 'beginner' },
          ],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getTutorials();

        expect(result.data).toHaveLength(1);
      });
    });

    describe('getTutorial', () => {
      it('should fetch a single tutorial by slug', async () => {
        const mockResponse = {
          data: [{ id: 1, title: 'Getting Started', slug: 'getting-started' }],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getTutorial('getting-started');

        expect(result?.title).toBe('Getting Started');
      });
    });
  });

  describe('Showcases', () => {
    describe('getShowcases', () => {
      it('should fetch all showcases', async () => {
        const mockResponse = {
          data: [
            { id: 1, title: 'Showcase 1', slug: 'showcase-1' },
          ],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getShowcases();

        expect(result.data).toHaveLength(1);
      });
    });

    describe('getShowcase', () => {
      it('should fetch a single showcase by slug', async () => {
        const mockResponse = {
          data: [{ id: 1, title: 'Amazing Project', slug: 'amazing-project' }],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getShowcase('amazing-project');

        expect(result?.title).toBe('Amazing Project');
      });
    });
  });

  describe('Videos', () => {
    describe('getVideos', () => {
      it('should fetch all videos sorted by featured and date', async () => {
        const mockResponse = {
          data: [
            { id: 1, title: 'Video 1', slug: 'video-1', featured: true, views: 100, likes: 10 },
          ],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getVideos();

        expect(result.data).toHaveLength(1);
        expect(result.data[0].featured).toBe(true);
      });
    });

    describe('getVideo', () => {
      it('should fetch a single video by slug', async () => {
        const mockResponse = {
          data: [{ id: 1, title: 'Tutorial Video', slug: 'tutorial-video', views: 500 }],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getVideo('tutorial-video');

        expect(result?.views).toBe(500);
      });
    });

    describe('updateVideoViews', () => {
      it('should update video view count', async () => {
        const mockResponse = {
          data: { id: 1, views: 501 },
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await updateVideoViews(1, 501);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/videos/1'),
          expect.objectContaining({ method: 'PUT' })
        );
        expect(result.data.views).toBe(501);
      });
    });

    describe('updateVideoLikes', () => {
      it('should update video like count', async () => {
        const mockResponse = {
          data: { id: 1, likes: 11 },
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await updateVideoLikes(1, 11);

        expect(result.data.likes).toBe(11);
      });
    });
  });

  describe('Webinars', () => {
    describe('getWebinars', () => {
      it('should fetch all webinars with populated fields', async () => {
        const mockResponse = {
          data: [
            {
              id: 1,
              title: 'AI Workshop',
              slug: 'ai-workshop',
              speaker: { name: 'John Doe' },
            },
          ],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getWebinars();

        expect(result.data).toHaveLength(1);
        expect(result.data[0].speaker?.name).toBe('John Doe');
      });
    });

    describe('getWebinar', () => {
      it('should fetch a single webinar by slug', async () => {
        const mockResponse = {
          data: [{ id: 1, title: 'Deep Dive Webinar', slug: 'deep-dive' }],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getWebinar('deep-dive');

        expect(result?.title).toBe('Deep Dive Webinar');
      });
    });

    describe('updateWebinarViews', () => {
      it('should update webinar view count', async () => {
        const mockResponse = {
          data: { id: 1, views: 200 },
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await updateWebinarViews(1, 200);

        expect(result.data.views).toBe(200);
      });
    });

    describe('updateWebinarAttendees', () => {
      it('should update webinar attendee count', async () => {
        const mockResponse = {
          data: { id: 1, current_attendees: 50 },
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await updateWebinarAttendees(1, 50);

        expect(result.data.current_attendees).toBe(50);
      });
    });
  });

  describe('Events', () => {
    describe('getEvents', () => {
      it('should fetch all events sorted by start date', async () => {
        const mockResponse = {
          data: [
            { id: 1, title: 'Conference', slug: 'conference', start_date: '2025-06-01' },
          ],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getEvents();

        expect(result.data).toHaveLength(1);
      });
    });
  });

  describe('Resources', () => {
    describe('getResources', () => {
      it('should fetch all resources', async () => {
        const mockResponse = {
          data: [
            { id: 1, title: 'Resource 1' },
          ],
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await getResources();

        expect(result.data).toHaveLength(1);
      });
    });
  });

  describe('Newsletter', () => {
    describe('subscribeNewsletter', () => {
      it('should subscribe email to newsletter', async () => {
        const mockResponse = {
          data: { id: 1, email: 'test@example.com' },
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await subscribeNewsletter('test@example.com');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/newsletters'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ data: { email: 'test@example.com' } }),
          })
        );
        expect(result.data).toBeDefined();
      });
    });
  });

  describe('Default export', () => {
    it('should export all methods', () => {
      expect(strapiClient.getBlogPosts).toBe(getBlogPosts);
      expect(strapiClient.getBlogPost).toBe(getBlogPost);
      expect(strapiClient.getTutorials).toBe(getTutorials);
      expect(strapiClient.getTutorial).toBe(getTutorial);
      expect(strapiClient.getShowcases).toBe(getShowcases);
      expect(strapiClient.getShowcase).toBe(getShowcase);
      expect(strapiClient.getVideos).toBe(getVideos);
      expect(strapiClient.getVideo).toBe(getVideo);
      expect(strapiClient.updateVideoViews).toBe(updateVideoViews);
      expect(strapiClient.updateVideoLikes).toBe(updateVideoLikes);
      expect(strapiClient.getWebinars).toBe(getWebinars);
      expect(strapiClient.getWebinar).toBe(getWebinar);
      expect(strapiClient.updateWebinarViews).toBe(updateWebinarViews);
      expect(strapiClient.updateWebinarAttendees).toBe(updateWebinarAttendees);
      expect(strapiClient.getEvents).toBe(getEvents);
      expect(strapiClient.getResources).toBe(getResources);
      expect(strapiClient.subscribeNewsletter).toBe(subscribeNewsletter);
    });
  });
});
