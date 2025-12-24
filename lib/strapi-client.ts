/**
 * Strapi CMS Client
 * Handles all API communication with Strapi CMS for content management
 * Ported from Vite SPA to Next.js
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ainative-community-production.up.railway.app';

// Types
export interface StrapiResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  published_date: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    bio?: string;
    avatar?: StrapiMedia;
  };
  category?: {
    name: string;
    slug: string;
  };
  tags?: Array<{ name: string; slug: string }>;
  cover_image?: StrapiMedia;
}

export interface Tutorial {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    name: string;
    slug: string;
  };
  cover_image?: StrapiMedia;
}

export interface Showcase {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  demo_url?: string;
  github_url?: string;
  createdAt: string;
  updatedAt: string;
  cover_image?: StrapiMedia;
  technologies?: Array<{ name: string }>;
}

export interface Video {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  video_url?: string;
  hls_url?: string;
  duration?: number;
  views: number;
  likes: number;
  featured?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: StrapiMedia;
  category?: {
    name: string;
    slug: string;
  };
}

export interface Webinar {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  date: string;
  time?: string;
  duration?: number;
  registration_url?: string;
  video_url?: string;
  views?: number;
  current_attendees?: number;
  max_attendees?: number;
  createdAt: string;
  updatedAt: string;
  speaker?: {
    name: string;
    title?: string;
    bio?: string;
    avatar?: StrapiMedia;
  };
  co_speakers?: Array<{
    name: string;
    title?: string;
  }>;
  thumbnail?: StrapiMedia;
  tags?: Array<{ name: string }>;
  category?: {
    name: string;
    slug: string;
  };
}

export interface Event {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  registration_url?: string;
  createdAt: string;
  updatedAt: string;
  cover_image?: StrapiMedia;
}

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

interface FetchOptions {
  params?: Record<string, string | number | boolean | string[]>;
}

/**
 * Build query string from params
 */
function buildQueryString(params: Record<string, string | number | boolean | string[]>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v, i) => searchParams.append(`${key}[${i}]`, v));
    } else if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Fetch from Strapi API
 */
async function strapiGet<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  let url = `${STRAPI_URL}/api${endpoint}`;

  if (options?.params) {
    const queryString = buildQueryString(options.params);
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * POST to Strapi API
 */
async function strapiPost<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * PUT to Strapi API
 */
async function strapiPut<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Blog Posts
export async function getBlogPosts(params: Record<string, unknown> = {}): Promise<StrapiResponse<BlogPost>> {
  return strapiGet<StrapiResponse<BlogPost>>('/blog-posts', {
    params: {
      'populate': '*',
      'sort': 'published_date:desc',
      ...params as Record<string, string | number | boolean | string[]>,
    },
  });
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const response = await strapiGet<StrapiResponse<BlogPost>>('/blog-posts', {
    params: {
      'filters[slug][$eq]': slug,
      'populate': '*',
    },
  });
  return response.data?.[0] || null;
}

// Tutorials
export async function getTutorials(params: Record<string, unknown> = {}): Promise<StrapiResponse<Tutorial>> {
  return strapiGet<StrapiResponse<Tutorial>>('/tutorials', {
    params: {
      'populate': '*',
      ...params as Record<string, string | number | boolean | string[]>,
    },
  });
}

export async function getTutorial(slug: string): Promise<Tutorial | null> {
  const response = await strapiGet<StrapiResponse<Tutorial>>('/tutorials', {
    params: {
      'filters[slug][$eq]': slug,
      'populate': '*',
    },
  });
  return response.data?.[0] || null;
}

// Showcases
export async function getShowcases(params: Record<string, unknown> = {}): Promise<StrapiResponse<Showcase>> {
  return strapiGet<StrapiResponse<Showcase>>('/showcases', {
    params: {
      'populate': '*',
      ...params as Record<string, string | number | boolean | string[]>,
    },
  });
}

export async function getShowcase(slug: string): Promise<Showcase | null> {
  const response = await strapiGet<StrapiResponse<Showcase>>('/showcases', {
    params: {
      'filters[slug][$eq]': slug,
      'populate': '*',
    },
  });
  return response.data?.[0] || null;
}

// Videos
export async function getVideos(params: Record<string, unknown> = {}): Promise<StrapiResponse<Video>> {
  return strapiGet<StrapiResponse<Video>>('/videos', {
    params: {
      'populate': '*',
      'sort[0]': 'featured:desc',
      'sort[1]': 'publishedAt:desc',
      ...params as Record<string, string | number | boolean | string[]>,
    },
  });
}

export async function getVideo(slug: string): Promise<Video | null> {
  const response = await strapiGet<StrapiResponse<Video>>('/videos', {
    params: {
      'filters[slug][$eq]': slug,
      'populate': '*',
    },
  });
  return response.data?.[0] || null;
}

export async function updateVideoViews(videoId: number, views: number): Promise<StrapiSingleResponse<Video>> {
  return strapiPut<StrapiSingleResponse<Video>>(`/videos/${videoId}`, {
    data: { views },
  });
}

export async function updateVideoLikes(videoId: number, likes: number): Promise<StrapiSingleResponse<Video>> {
  return strapiPut<StrapiSingleResponse<Video>>(`/videos/${videoId}`, {
    data: { likes },
  });
}

// Webinars
export async function getWebinars(params: Record<string, unknown> = {}): Promise<StrapiResponse<Webinar>> {
  return strapiGet<StrapiResponse<Webinar>>('/webinars', {
    params: {
      'populate[0]': 'speaker',
      'populate[1]': 'co_speakers',
      'populate[2]': 'video',
      'populate[3]': 'thumbnail',
      'populate[4]': 'tags',
      'populate[5]': 'category',
      'sort': 'date:desc',
      ...params as Record<string, string | number | boolean | string[]>,
    },
  });
}

export async function getWebinar(slug: string): Promise<Webinar | null> {
  const response = await strapiGet<StrapiResponse<Webinar>>('/webinars', {
    params: {
      'filters[slug][$eq]': slug,
      'populate[0]': 'speaker',
      'populate[1]': 'co_speakers',
      'populate[2]': 'video',
      'populate[3]': 'thumbnail',
      'populate[4]': 'tags',
      'populate[5]': 'category',
    },
  });
  return response.data?.[0] || null;
}

export async function updateWebinarViews(webinarId: number, views: number): Promise<StrapiSingleResponse<Webinar>> {
  return strapiPut<StrapiSingleResponse<Webinar>>(`/webinars/${webinarId}`, {
    data: { views },
  });
}

export async function updateWebinarAttendees(webinarId: number, attendees: number): Promise<StrapiSingleResponse<Webinar>> {
  return strapiPut<StrapiSingleResponse<Webinar>>(`/webinars/${webinarId}`, {
    data: { current_attendees: attendees },
  });
}

// Events
export async function getEvents(params: Record<string, unknown> = {}): Promise<StrapiResponse<Event>> {
  return strapiGet<StrapiResponse<Event>>('/events', {
    params: {
      'populate': '*',
      'sort': 'start_date:asc',
      ...params as Record<string, string | number | boolean | string[]>,
    },
  });
}

// Resources
export async function getResources(params: Record<string, unknown> = {}): Promise<StrapiResponse<unknown>> {
  return strapiGet<StrapiResponse<unknown>>('/resources', {
    params: {
      'populate': '*',
      ...params as Record<string, string | number | boolean | string[]>,
    },
  });
}

// Newsletter
export async function subscribeNewsletter(email: string): Promise<StrapiSingleResponse<unknown>> {
  return strapiPost<StrapiSingleResponse<unknown>>('/newsletters', {
    data: { email },
  });
}

// Default export as object
const strapiClient = {
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
};

export default strapiClient;
