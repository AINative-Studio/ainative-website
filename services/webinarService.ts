/**
 * Webinar Service - API calls for webinar management
 */

import { Webinar, StrapiResponse, StrapiSingleResponse } from '@/types/strapi';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ainative-community-production.up.railway.app';

export interface WebinarFilters {
  status?: 'upcoming' | 'live' | 'completed' | 'cancelled';
  category?: string;
  tag?: string;
  speaker?: string;
  featured?: boolean;
  search?: string;
}

export interface WebinarSortOptions {
  sortBy?: 'date' | 'views' | 'attendees';
  order?: 'asc' | 'desc';
}

/**
 * Fetch all webinars with optional filters and sorting
 */
export async function fetchWebinars(
  filters?: WebinarFilters,
  sort?: WebinarSortOptions,
  pagination?: { page?: number; pageSize?: number }
): Promise<StrapiResponse<Webinar>> {
  const params = new URLSearchParams();

  // Add population
  params.append('populate', '*');

  // Add filters
  if (filters?.status) {
    params.append('filters[status][$eq]', filters.status);
  }
  if (filters?.category) {
    params.append('filters[category][slug][$eq]', filters.category);
  }
  if (filters?.tag) {
    params.append('filters[tags][slug][$eq]', filters.tag);
  }
  if (filters?.speaker) {
    params.append('filters[speaker][slug][$eq]', filters.speaker);
  }
  if (filters?.featured !== undefined) {
    params.append('filters[featured][$eq]', String(filters.featured));
  }
  if (filters?.search) {
    params.append('filters[$or][0][title][$containsi]', filters.search);
    params.append('filters[$or][1][description][$containsi]', filters.search);
  }

  // Add sorting
  const sortField = sort?.sortBy || 'date';
  const sortOrder = sort?.order || 'desc';
  params.append('sort', `${sortField}:${sortOrder}`);

  // Add pagination
  if (pagination?.page) {
    params.append('pagination[page]', String(pagination.page));
  }
  if (pagination?.pageSize) {
    params.append('pagination[pageSize]', String(pagination.pageSize));
  }

  const response = await fetch(`${STRAPI_URL}/api/webinars?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch webinars');
  }

  return response.json();
}

/**
 * Fetch a single webinar by slug
 */
export async function fetchWebinarBySlug(slug: string): Promise<Webinar | null> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    populate: '*',
  });

  const response = await fetch(`${STRAPI_URL}/api/webinars?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch webinar');
  }

  const data: StrapiResponse<Webinar> = await response.json();
  return data.data && data.data.length > 0 ? data.data[0] : null;
}

/**
 * Fetch a single webinar by ID
 */
export async function fetchWebinarById(id: number): Promise<Webinar | null> {
  const params = new URLSearchParams({
    populate: '*',
  });

  const response = await fetch(`${STRAPI_URL}/api/webinars/${id}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch webinar');
  }

  const data: StrapiSingleResponse<Webinar> = await response.json();
  return data.data;
}

/**
 * Fetch upcoming webinars
 */
export async function fetchUpcomingWebinars(limit = 6): Promise<Webinar[]> {
  const params = new URLSearchParams({
    'filters[status][$in][0]': 'upcoming',
    'filters[status][$in][1]': 'live',
    'filters[date][$gte]': new Date().toISOString(),
    populate: '*',
    sort: 'date:asc',
    'pagination[limit]': String(limit),
  });

  const response = await fetch(`${STRAPI_URL}/api/webinars?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming webinars');
  }

  const data: StrapiResponse<Webinar> = await response.json();
  return data.data || [];
}

/**
 * Fetch featured webinars
 */
export async function fetchFeaturedWebinars(limit = 3): Promise<Webinar[]> {
  const params = new URLSearchParams({
    'filters[featured][$eq]': 'true',
    populate: '*',
    sort: 'date:desc',
    'pagination[limit]': String(limit),
  });

  const response = await fetch(`${STRAPI_URL}/api/webinars?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch featured webinars');
  }

  const data: StrapiResponse<Webinar> = await response.json();
  return data.data || [];
}

/**
 * Fetch related webinars by category or tags
 */
export async function fetchRelatedWebinars(
  webinar: Webinar,
  limit = 3
): Promise<Webinar[]> {
  const params = new URLSearchParams();

  // Exclude current webinar
  params.append('filters[id][$ne]', String(webinar.id));

  // Match by category if available
  if (webinar.category?.id) {
    params.append('filters[category][id][$eq]', String(webinar.category.id));
  } else if (webinar.tags && webinar.tags.length > 0) {
    // Otherwise match by tags
    webinar.tags.forEach((tag, index) => {
      params.append(`filters[tags][id][$in][${index}]`, String(tag.id));
    });
  }

  params.append('populate', '*');
  params.append('sort', 'date:desc');
  params.append('pagination[limit]', String(limit));

  const response = await fetch(`${STRAPI_URL}/api/webinars?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch related webinars');
  }

  const data: StrapiResponse<Webinar> = await response.json();
  return data.data || [];
}

/**
 * Register for a webinar
 */
export async function registerForWebinar(
  webinarId: number,
  registrationData: {
    name: string;
    email: string;
    company?: string;
  }
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/webinars/${webinarId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Registration failed');
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Registration successful',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get webinar statistics
 */
export async function getWebinarStats(): Promise<{
  total: number;
  upcoming: number;
  completed: number;
  totalViews: number;
}> {
  try {
    const [allResponse, upcomingResponse] = await Promise.all([
      fetch(`${STRAPI_URL}/api/webinars?pagination[limit]=1`),
      fetch(`${STRAPI_URL}/api/webinars?filters[status][$in][0]=upcoming&filters[status][$in][1]=live&pagination[limit]=1`),
    ]);

    const allData: StrapiResponse<Webinar> = await allResponse.json();
    const upcomingData: StrapiResponse<Webinar> = await upcomingResponse.json();

    return {
      total: allData.meta?.pagination?.total || 0,
      upcoming: upcomingData.meta?.pagination?.total || 0,
      completed: (allData.meta?.pagination?.total || 0) - (upcomingData.meta?.pagination?.total || 0),
      totalViews: 0, // Would need aggregation endpoint
    };
  } catch (error) {
    console.error('Failed to fetch webinar stats:', error);
    return { total: 0, upcoming: 0, completed: 0, totalViews: 0 };
  }
}
