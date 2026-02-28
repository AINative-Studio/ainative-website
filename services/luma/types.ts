/**
 * Luma API TypeScript Type Definitions
 * Based on Luma API v1 documentation
 */

export interface LumaGeoAddress {
  address: string;
  city: string;
  region: string;
  country?: string;
  full_address: string;
  google_maps_place_id?: string;
  latitude?: number;
  longitude?: number;
}

export interface LumaRegistrationQuestion {
  id: string;
  label: string;
  required: boolean;
  question_type: 'text' | 'url' | 'dropdown' | 'company' | 'email' | 'phone';
  options?: string[];
  placeholder?: string;
}

export interface LumaTicketType {
  ticket_type_id: string;
  name: string;
  description?: string;
  price?: {
    amount: number;
    currency: string;
  };
  quantity_total?: number;
  quantity_sold?: number;
}

export interface LumaTicketTypeListResponse {
  ticket_types: LumaTicketType[];
}

// Actual event data structure from Luma API
export interface LumaEventData {
  id: string;
  calendar_id: string;
  user_id: string;
  created_at: string;
  cover_url: string;
  name: string;
  description: string;
  description_md: string;
  start_at: string;
  duration_interval: string;
  end_at: string;
  timezone: string;
  url: string;
  visibility: 'public' | 'private' | 'unlisted';
  geo_address_json?: LumaGeoAddress | null;
  geo_latitude?: number | null;
  geo_longitude?: number | null;
  meeting_url?: string;
  zoom_meeting_url?: string;
  registration_questions?: LumaRegistrationQuestion[];
  api_id: string;
  calendar_api_id: string;
  user_api_id: string;
}

// API response wraps the event data
export interface LumaEvent {
  api_id: string;
  event: LumaEventData;
  tags?: Array<{
    id: string;
    api_id: string;
    name: string;
  }>;
}

export interface LumaCalendar {
  api_id: string;
  name: string;
  description?: string;
  cover_url?: string;
  url: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface LumaGuest {
  guest_id: string;
  event_api_id: string;
  name: string;
  email: string;
  approval_status: 'approved' | 'pending' | 'declined';
  registration_answers?: Record<string, string>;
  ticket_type_id?: string;
  checked_in_at?: string;
  created_at: string;
}

export interface LumaWebhook {
  webhook_id: string;
  url: string;
  event_types: string[];
  created_at: string;
}

export interface LumaCoupon {
  coupon_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  uses_count?: number;
  expires_at?: string;
  created_at: string;
}

// API Response Types
export interface LumaListResponse<T> {
  entries: T[];
  has_more: boolean;
  next_cursor?: string;
}

export type LumaEventListResponse = LumaListResponse<LumaEvent>;
export type LumaCalendarListResponse = LumaListResponse<LumaCalendar>;
export type LumaGuestListResponse = LumaListResponse<LumaGuest>;

// API Request Types
export interface LumaEventListParams {
  calendar_api_id?: string;
  series_api_id?: string;
  after?: string; // ISO date
  before?: string; // ISO date
  pagination_cursor?: string;
  pagination_limit?: number; // max 100
}

export interface LumaEventCreateParams {
  calendar_api_id: string;
  name: string;
  description?: string;
  start_at: string; // ISO date
  end_at: string; // ISO date
  timezone: string;
  event_type?: 'online' | 'in-person' | 'hybrid';
  geo_address_json?: Partial<LumaGeoAddress>;
  meeting_url?: string;
  cover_url?: string;
  requires_approval?: boolean;
  max_capacity?: number;
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface LumaGuestAddParams {
  event_api_id: string;
  name: string;
  email: string;
  registration_answers?: Record<string, string>;
  ticket_type_id?: string;
  approval_status?: 'approved' | 'pending';
}

export interface LumaGuestUpdateParams {
  approval_status?: 'approved' | 'declined';
  checked_in_at?: string;
}

export interface LumaTicketTypeCreateParams {
  event_api_id: string;
  name: string;
  description?: string;
  price?: {
    amount: number;
    currency: string;
  };
  quantity_total?: number;
}

// Error Types
export interface LumaApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Rate Limit Info
export interface LumaRateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}
