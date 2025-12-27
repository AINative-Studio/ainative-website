/**
 * Strapi CMS API Client
 * Typed client for AINative Community CMS hosted on Railway
 */

import axios, { type AxiosInstance } from 'axios';

const DEFAULT_STRAPI_URL = 'https://ainative-community-production.up.railway.app/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Strapi Response Wrapper
 */
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Author/Speaker Interface
 */
export interface Author {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar?: unknown;
}

/**
 * Tag Interface
 */
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

/**
 * Category Interface
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
}

/**
 * Blog Post Interface
 */
export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  published_date: string;
  author?: Author;
  category?: Category;
  tags?: Tag[];
  thumbnail_url?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

/**
 * Video Interface
 */
export interface Video {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  category: 'tutorial' | 'webinar' | 'showcase' | 'demo';
  duration: number;
  video_url: string;
  thumbnail_url: string;
  poster_url?: string;
  views: number;
  likes: number;
  featured: boolean;
  publishedAt: string;
  author?: Author;
  tags?: Tag[];
}

/**
 * Tutorial Interface
 */
export interface Tutorial {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  author?: Author;
  category?: Category;
  tags?: Tag[];
  publishedAt?: string;
}

/**
 * Webinar Interface
 */
export interface Webinar {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  date: string;
  duration?: number;
  speaker?: Author;
  co_speakers?: Author[];
  video?: unknown;
  thumbnail?: unknown;
  tags?: Tag[];
  category?: Category;
  views?: number;
  current_attendees?: number;
  max_attendees?: number;
  registration_url?: string;
}

/**
 * Showcase Interface
 */
export interface Showcase {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  author?: Author;
  tags?: Tag[];
  thumbnail_url?: string;
  demo_url?: string;
  github_url?: string;
}

/**
 * Event Interface
 */
export interface Event {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  event_type: 'webinar' | 'workshop' | 'meetup' | 'conference';
  start_date: string;
  end_date?: string;
  location?: string;
  max_attendees?: number;
  registration_url?: string;
}

/**
 * Query Parameters Interface
 */
export interface QueryParams {
  populate?: string | string[];
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
}

/**
 * Strapi Client Class
 */
export default class StrapiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = DEFAULT_STRAPI_URL) {
    this.client = axios.create({
      baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch all blog posts
   */
  async getBlogPosts(params: QueryParams = {}): Promise<StrapiResponse<BlogPost[]>> {
    try {
      const { data } = await this.client.get<StrapiResponse<BlogPost[]>>('/blog-posts', {
        params: {
          populate: '*',
          sort: 'published_date:desc',
          ...params,
        },
      });
      return data;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  }

  /**
   * Fetch a single blog post by slug
   */
  async getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
      const { data } = await this.client.get<StrapiResponse<BlogPost[]>>('/blog-posts', {
        params: {
          filters: { slug: { $eq: slug } },
          populate: '*',
        },
      });
      return data.data[0] || null;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  }

  /**
   * Fetch all tutorials
   */
  async getTutorials(params: QueryParams = {}): Promise<StrapiResponse<Tutorial[]>> {
    try {
      const { data } = await this.client.get<StrapiResponse<Tutorial[]>>('/tutorials', {
        params: { populate: '*', ...params },
      });
      return data;
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      throw error;
    }
  }

  /**
   * Fetch a single tutorial by slug
   */
  async getTutorial(slug: string): Promise<Tutorial | null> {
    try {
      const { data } = await this.client.get<StrapiResponse<Tutorial[]>>('/tutorials', {
        params: {
          filters: { slug: { $eq: slug } },
          populate: '*',
        },
      });
      return data.data[0] || null;
    } catch (error) {
      console.error('Error fetching tutorial:', error);
      throw error;
    }
  }

  /**
   * Fetch all showcases
   */
  async getShowcases(params: QueryParams = {}): Promise<StrapiResponse<Showcase[]>> {
    try {
      const { data } = await this.client.get<StrapiResponse<Showcase[]>>('/showcases', {
        params: { populate: '*', ...params },
      });
      return data;
    } catch (error) {
      console.error('Error fetching showcases:', error);
      throw error;
    }
  }

  /**
   * Fetch a single showcase by slug
   */
  async getShowcase(slug: string): Promise<Showcase | null> {
    try {
      const { data } = await this.client.get<StrapiResponse<Showcase[]>>('/showcases', {
        params: {
          filters: { slug: { $eq: slug } },
          populate: '*',
        },
      });
      return data.data[0] || null;
    } catch (error) {
      console.error('Error fetching showcase:', error);
      throw error;
    }
  }

  /**
   * Fetch all events
   */
  async getEvents(params: QueryParams = {}): Promise<StrapiResponse<Event[]>> {
    try {
      const { data } = await this.client.get<StrapiResponse<Event[]>>('/events', {
        params: {
          populate: '*',
          sort: 'start_date:asc',
          ...params,
        },
      });
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Fetch all videos
   */
  async getVideos(params: QueryParams = {}): Promise<StrapiResponse<Video[]>> {
    try {
      const { data } = await this.client.get<StrapiResponse<Video[]>>('/videos', {
        params: {
          populate: '*',
          sort: ['featured:desc', 'publishedAt:desc'],
          ...params,
        },
      });
      return data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  /**
   * Fetch a single video by slug
   */
  async getVideo(slug: string): Promise<Video | null> {
    try {
      const { data } = await this.client.get<StrapiResponse<Video[]>>('/videos', {
        params: {
          filters: { slug: { $eq: slug } },
          populate: '*',
        },
      });
      return data.data[0] || null;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  /**
   * Update video view count
   */
  async updateVideoViews(videoId: number, views: number): Promise<Video> {
    try {
      const { data } = await this.client.put<StrapiResponse<Video>>(`/videos/${videoId}`, {
        data: { views },
      });
      return data.data;
    } catch (error) {
      console.error('Error updating video views:', error);
      throw error;
    }
  }

  /**
   * Update video like count
   */
  async updateVideoLikes(videoId: number, likes: number): Promise<Video> {
    try {
      const { data } = await this.client.put<StrapiResponse<Video>>(`/videos/${videoId}`, {
        data: { likes },
      });
      return data.data;
    } catch (error) {
      console.error('Error updating video likes:', error);
      throw error;
    }
  }

  /**
   * Fetch all webinars
   */
  async getWebinars(params: QueryParams = {}): Promise<StrapiResponse<Webinar[]>> {
    try {
      const { data } = await this.client.get<StrapiResponse<Webinar[]>>('/webinars', {
        params: {
          populate: ['speaker', 'co_speakers', 'video', 'thumbnail', 'tags', 'category'],
          sort: ['date:desc'],
          ...params,
        },
      });
      return data;
    } catch (error) {
      console.error('Error fetching webinars:', error);
      throw error;
    }
  }

  /**
   * Fetch a single webinar by slug
   */
  async getWebinar(slug: string): Promise<Webinar | null> {
    try {
      const { data } = await this.client.get<StrapiResponse<Webinar[]>>('/webinars', {
        params: {
          filters: { slug: { $eq: slug } },
          populate: ['speaker', 'co_speakers', 'video', 'thumbnail', 'tags', 'category'],
        },
      });
      return data.data[0] || null;
    } catch (error) {
      console.error('Error fetching webinar:', error);
      throw error;
    }
  }

  /**
   * Update webinar view count
   */
  async updateWebinarViews(webinarId: number, views: number): Promise<Webinar> {
    try {
      const { data } = await this.client.put<StrapiResponse<Webinar>>(
        `/webinars/${webinarId}`,
        {
          data: { views },
        }
      );
      return data.data;
    } catch (error) {
      console.error('Error updating webinar views:', error);
      throw error;
    }
  }

  /**
   * Update webinar attendee count
   */
  async updateWebinarAttendees(webinarId: number, attendees: number): Promise<Webinar> {
    try {
      const { data } = await this.client.put<StrapiResponse<Webinar>>(
        `/webinars/${webinarId}`,
        {
          data: { current_attendees: attendees },
        }
      );
      return data.data;
    } catch (error) {
      console.error('Error updating webinar attendees:', error);
      throw error;
    }
  }

  /**
   * Subscribe to newsletter
   */
  async subscribeNewsletter(email: string): Promise<unknown> {
    try {
      const { data } = await this.client.post('/newsletters', {
        data: { email },
      });
      return data;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const strapiClient = new StrapiClient();
