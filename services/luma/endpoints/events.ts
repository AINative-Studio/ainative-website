/**
 * Luma Events API Endpoints
 * Handles all event-related operations
 */

import { lumaClient } from '../client';
import type {
  LumaEvent,
  LumaEventListResponse,
  LumaEventListParams,
  LumaEventCreateParams,
  LumaGuest,
  LumaGuestListResponse,
  LumaGuestAddParams,
  LumaGuestUpdateParams,
  LumaTicketType,
  LumaTicketTypeListResponse,
} from '../types';

/**
 * List events from calendar(s)
 * GET /v1/calendar/list-events
 */
export async function listEvents(params?: LumaEventListParams): Promise<LumaEventListResponse> {
  return lumaClient.get<LumaEventListResponse>('/calendar/list-events', {
    params,
  });
}

/**
 * Get a specific event by ID
 * GET /v1/event/get
 */
export async function getEvent(eventApiId: string): Promise<LumaEvent> {
  return lumaClient.get<LumaEvent>('/event/get', {
    params: { event_api_id: eventApiId },
  });
}

/**
 * Create a new event
 * POST /v1/event/create
 */
export async function createEvent(params: LumaEventCreateParams): Promise<LumaEvent> {
  return lumaClient.post<LumaEvent>('/event/create', params);
}

/**
 * Update an existing event
 * PATCH /v1/event/update
 */
export async function updateEvent(
  eventApiId: string,
  updates: Partial<LumaEventCreateParams>
): Promise<LumaEvent> {
  return lumaClient.patch<LumaEvent>('/event/update', {
    event_api_id: eventApiId,
    ...updates,
  });
}

/**
 * Delete an event
 * DELETE /v1/event/delete
 */
export async function deleteEvent(eventApiId: string): Promise<{ success: boolean }> {
  return lumaClient.delete<{ success: boolean }>('/event/delete', {
    params: { event_api_id: eventApiId },
  });
}

/**
 * Get guests for an event
 * GET /v1/event/get-guests
 */
export async function getEventGuests(
  eventApiId: string,
  paginationCursor?: string
): Promise<LumaGuestListResponse> {
  return lumaClient.get<LumaGuestListResponse>('/event/get-guests', {
    params: {
      event_api_id: eventApiId,
      pagination_cursor: paginationCursor,
    },
  });
}

/**
 * Add a guest to an event (register)
 * POST /v1/event/add-guests
 */
export async function addEventGuest(params: LumaGuestAddParams): Promise<LumaGuest> {
  return lumaClient.post<LumaGuest>('/event/add-guests', params);
}

/**
 * Update a guest's information
 * PATCH /v1/event/update-guest
 */
export async function updateEventGuest(
  guestId: string,
  updates: LumaGuestUpdateParams
): Promise<LumaGuest> {
  return lumaClient.patch<LumaGuest>('/event/update-guest', {
    guest_id: guestId,
    ...updates,
  });
}

/**
 * Remove a guest from an event
 * DELETE /v1/event/delete-guest
 */
export async function deleteEventGuest(guestId: string): Promise<{ success: boolean }> {
  return lumaClient.delete<{ success: boolean }>('/event/delete-guest', {
    params: { guest_id: guestId },
  });
}

/**
 * Get event attendance statistics
 * GET /v1/event/get-attendance
 */
export async function getEventAttendance(eventApiId: string): Promise<{
  total_guests: number;
  checked_in: number;
  approved: number;
  pending: number;
  declined: number;
}> {
  return lumaClient.get('/event/get-attendance', {
    params: { event_api_id: eventApiId },
  });
}

/**
 * Duplicate an event
 * POST /v1/event/duplicate
 */
export async function duplicateEvent(
  eventApiId: string,
  newStartAt: string,
  newEndAt: string
): Promise<LumaEvent> {
  return lumaClient.post<LumaEvent>('/event/duplicate', {
    event_api_id: eventApiId,
    start_at: newStartAt,
    end_at: newEndAt,
  });
}

/**
 * Publish an event (make it visible)
 * POST /v1/event/publish
 */
export async function publishEvent(eventApiId: string): Promise<LumaEvent> {
  return lumaClient.post<LumaEvent>('/event/publish', {
    event_api_id: eventApiId,
  });
}

/**
 * Unpublish an event (make it hidden)
 * POST /v1/event/unpublish
 */
export async function unpublishEvent(eventApiId: string): Promise<LumaEvent> {
  return lumaClient.post<LumaEvent>('/event/unpublish', {
    event_api_id: eventApiId,
  });
}

/**
 * Helper function to get all events (handles pagination)
 */
export async function getAllEvents(
  params?: Omit<LumaEventListParams, 'pagination_cursor'>
): Promise<LumaEvent[]> {
  const allEvents: LumaEvent[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await listEvents({
      ...params,
      pagination_cursor: cursor,
      pagination_limit: 100, // Max per request
    });

    allEvents.push(...response.entries);
    hasMore = response.has_more;
    cursor = response.next_cursor;
  }

  return allEvents;
}

/**
 * Helper function to get all guests for an event (handles pagination)
 */
export async function getAllEventGuests(eventApiId: string): Promise<LumaGuest[]> {
  const allGuests: LumaGuest[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await getEventGuests(eventApiId, cursor);

    allGuests.push(...response.entries);
    hasMore = response.has_more;
    cursor = response.next_cursor;
  }

  return allGuests;
}

/**
 * Helper function to get upcoming events
 */
export async function getUpcomingEvents(calendarApiId?: string): Promise<LumaEvent[]> {
  const now = new Date().toISOString();

  const allEvents = await getAllEvents({
    calendar_api_id: calendarApiId,
  });

  // Filter on client side since API doesn't properly filter by dates
  return allEvents.filter(event => event.event.start_at >= now);
}

/**
 * Helper function to get past events
 */
export async function getPastEvents(calendarApiId?: string): Promise<LumaEvent[]> {
  const now = new Date().toISOString();

  const allEvents = await getAllEvents({
    calendar_api_id: calendarApiId,
  });

  // Filter on client side since API doesn't properly filter by dates
  return allEvents.filter(event => event.event.start_at < now);
}

/**
 * Get ticket types for an event
 * GET /v1/event/ticket-types/list
 */
export async function getEventTicketTypes(eventApiId: string): Promise<LumaTicketType[]> {
  try {
    const response = await lumaClient.get<LumaTicketTypeListResponse>('/event/ticket-types/list', {
      params: { event_api_id: eventApiId },
    });
    return response.ticket_types || [];
  } catch (error) {
    console.error(`Failed to fetch ticket types for event ${eventApiId}:`, error);
    return [];
  }
}

/**
 * Helper to check if an event has paid tickets
 */
export async function hasEventPaidTickets(eventApiId: string): Promise<boolean> {
  const ticketTypes = await getEventTicketTypes(eventApiId);
  return ticketTypes.some(ticket => ticket.price && ticket.price.amount > 0);
}
