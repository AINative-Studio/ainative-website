/**
 * Luma Calendar API Endpoints
 * Handles calendar-related operations
 */

import { lumaClient } from '../client';
import type { LumaCalendar, LumaCalendarListResponse } from '../types';

export interface LumaCalendarCreateParams {
  name: string;
  description?: string;
  cover_url?: string;
  timezone: string;
}

export interface LumaCalendarUpdateParams {
  name?: string;
  description?: string;
  cover_url?: string;
  timezone?: string;
}

export interface LumaCalendarListParams {
  pagination_cursor?: string;
  pagination_limit?: number;
}

/**
 * List all calendars
 * GET /v1/calendar/list
 */
export async function listCalendars(
  params?: LumaCalendarListParams
): Promise<LumaCalendarListResponse> {
  return lumaClient.get<LumaCalendarListResponse>('/calendar/list', {
    params,
  });
}

/**
 * Get a specific calendar by ID
 * GET /v1/calendar/get
 */
export async function getCalendar(calendarApiId: string): Promise<LumaCalendar> {
  return lumaClient.get<LumaCalendar>('/calendar/get', {
    params: { calendar_api_id: calendarApiId },
  });
}

/**
 * Create a new calendar
 * POST /v1/calendar/create
 */
export async function createCalendar(params: LumaCalendarCreateParams): Promise<LumaCalendar> {
  return lumaClient.post<LumaCalendar>('/calendar/create', params);
}

/**
 * Update an existing calendar
 * PATCH /v1/calendar/update
 */
export async function updateCalendar(
  calendarApiId: string,
  updates: LumaCalendarUpdateParams
): Promise<LumaCalendar> {
  return lumaClient.patch<LumaCalendar>('/calendar/update', {
    calendar_api_id: calendarApiId,
    ...updates,
  });
}

/**
 * Delete a calendar
 * DELETE /v1/calendar/delete
 */
export async function deleteCalendar(calendarApiId: string): Promise<{ success: boolean }> {
  return lumaClient.delete<{ success: boolean }>('/calendar/delete', {
    params: { calendar_api_id: calendarApiId },
  });
}

/**
 * Get calendar subscribers
 * GET /v1/calendar/get-subscribers
 */
export async function getCalendarSubscribers(
  calendarApiId: string,
  paginationCursor?: string
): Promise<{
  entries: Array<{
    subscriber_id: string;
    email: string;
    subscribed_at: string;
  }>;
  has_more: boolean;
  next_cursor?: string;
}> {
  return lumaClient.get('/calendar/get-subscribers', {
    params: {
      calendar_api_id: calendarApiId,
      pagination_cursor: paginationCursor,
    },
  });
}

/**
 * Add a subscriber to a calendar
 * POST /v1/calendar/add-subscriber
 */
export async function addCalendarSubscriber(
  calendarApiId: string,
  email: string
): Promise<{
  subscriber_id: string;
  email: string;
  subscribed_at: string;
}> {
  return lumaClient.post('/calendar/add-subscriber', {
    calendar_api_id: calendarApiId,
    email,
  });
}

/**
 * Remove a subscriber from a calendar
 * DELETE /v1/calendar/remove-subscriber
 */
export async function removeCalendarSubscriber(
  subscriberId: string
): Promise<{ success: boolean }> {
  return lumaClient.delete<{ success: boolean }>('/calendar/remove-subscriber', {
    params: { subscriber_id: subscriberId },
  });
}

/**
 * Get calendar statistics
 * GET /v1/calendar/get-stats
 */
export async function getCalendarStats(calendarApiId: string): Promise<{
  total_events: number;
  upcoming_events: number;
  past_events: number;
  total_subscribers: number;
  total_guests: number;
}> {
  return lumaClient.get('/calendar/get-stats', {
    params: { calendar_api_id: calendarApiId },
  });
}

/**
 * Helper function to get all calendars (handles pagination)
 */
export async function getAllCalendars(): Promise<LumaCalendar[]> {
  const allCalendars: LumaCalendar[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await listCalendars({
      pagination_cursor: cursor,
      pagination_limit: 100,
    });

    allCalendars.push(...response.entries);
    hasMore = response.has_more;
    cursor = response.next_cursor;
  }

  return allCalendars;
}
