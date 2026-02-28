/**
 * Luma API Service
 * Main entry point for all Luma API operations
 */

// Export client and error classes
export { lumaClient, LumaApiClient, LumaApiError } from './client';

// Export all types
export type {
  LumaEvent,
  LumaCalendar,
  LumaGuest,
  LumaGeoAddress,
  LumaRegistrationQuestion,
  LumaTicketType,
  LumaWebhook,
  LumaCoupon,
  LumaEventListResponse,
  LumaCalendarListResponse,
  LumaGuestListResponse,
  LumaEventListParams,
  LumaEventCreateParams,
  LumaGuestAddParams,
  LumaGuestUpdateParams,
  LumaTicketTypeCreateParams,
  LumaApiError as LumaApiErrorType,
  LumaRateLimitInfo,
} from './types';

// Export event endpoints
export {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventGuests,
  addEventGuest,
  updateEventGuest,
  deleteEventGuest,
  getEventAttendance,
  duplicateEvent,
  publishEvent,
  unpublishEvent,
  getAllEvents,
  getAllEventGuests,
  getUpcomingEvents,
  getPastEvents,
  getEventTicketTypes,
  hasEventPaidTickets,
} from './endpoints/events';

// Export calendar endpoints
export {
  listCalendars,
  getCalendar,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  getCalendarSubscribers,
  addCalendarSubscriber,
  removeCalendarSubscriber,
  getCalendarStats,
  getAllCalendars,
} from './endpoints/calendar';

export type {
  LumaCalendarCreateParams,
  LumaCalendarUpdateParams,
  LumaCalendarListParams,
} from './endpoints/calendar';
