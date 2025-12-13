/**
 * Strapi TypeScript Definitions
 * Type definitions for Strapi content types
 */

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
}

export interface StrapiTag {
  id: number;
  name: string;
  slug: string;
}

export interface StrapiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface StrapiAuthor {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  title?: string;
  bio?: string;
  avatar?: StrapiImage;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface WebinarQuestion {
  id?: string;
  question: string;
  asker: string;
  timestamp: number;
  answer?: string;
  upvotes: number;
}

export interface WebinarResource {
  id?: string;
  title: string;
  type?: string;
  file_type?: string;
  file_url?: string;
  file_size?: number;
  description?: string;
  url?: string;
}

export interface StrapiVideo {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  description?: string;
  video_url?: string;
  poster_url?: string;
  thumbnail_url?: string;
  duration?: number;
  views?: number;
}

export interface Webinar {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  date: string;
  duration: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  speaker?: StrapiAuthor;
  co_speakers?: StrapiAuthor[];
  video?: StrapiVideo;
  thumbnail?: StrapiImage;
  questions: WebinarQuestion[];
  resources: WebinarResource[];
  registration_required: boolean;
  max_attendees: number;
  current_attendees: number;
  tags?: StrapiTag[];
  category?: StrapiCategory;
  featured: boolean;
  views: number;
  meeting_url?: string;
  prerequisites?: string;
  learning_outcomes?: string[];
  certificate_template?: string;
  allow_certificates: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
