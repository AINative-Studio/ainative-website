/**
 * Webinar API Types and Functions
 */

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface SpeakerAvatar {
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
  };
}

export interface WebinarSpeaker {
  id?: string;
  name: string;
  title: string;
  avatar?: string | SpeakerAvatar;
  bio?: string;
  company?: string;
  social_links?: SocialLinks;
}

// Alias for backward compatibility
export type Speaker = WebinarSpeaker;

export interface WebinarImage {
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
}

export interface Webinar {
  id: string;
  slug?: string;
  title: string;
  description: string;
  date: string;
  duration: number; // in minutes
  status: 'upcoming' | 'live' | 'completed';
  meeting_url?: string;
  recording_url?: string;
  thumbnail?: string | WebinarImage;
  category?: string;
  speakers?: WebinarSpeaker[];
  speaker?: WebinarSpeaker;
  tags?: string[];
  registration_required?: boolean;
  current_attendees?: number;
  max_attendees?: number;
}

export interface WebinarListResponse {
  webinars: Webinar[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WebinarQuestion {
  id: string;
  question: string;
  askedBy: string;
  asker: string; // Alias for askedBy
  askedAt: Date | string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: Date | string;
  upvotes?: number;
  votes?: number; // Alias for upvotes
  isAnswered?: boolean;
  timestamp?: Date | string; // Alias for askedAt
}

export interface WebinarPoll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  isActive: boolean;
  totalVotes: number;
}

export interface WebinarChat {
  id: string;
  message: string;
  sender: string;
  timestamp: Date | string;
  isHost?: boolean;
}

export interface WebinarResource {
  id: string;
  name: string;
  title: string; // Alias for name
  type: 'pdf' | 'video' | 'link' | 'code' | 'slides' | 'other';
  url: string;
  description?: string;
  size?: string;
  fileSize?: string; // Alias for size
  downloadable?: boolean;
}

export interface WebinarAttendee {
  id: string;
  name: string;
  email: string;
  registeredAt: Date | string;
  attendedAt?: Date | string;
  watchTime?: number;
  certificateId?: string;
}

export async function getWebinars(): Promise<Webinar[]> {
  // This would fetch from the actual API
  return [];
}

export async function getWebinar(id: string): Promise<Webinar | null> {
  // This would fetch from the actual API
  console.log('Fetching webinar:', id);
  return null;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
}

export interface RegistrationResult {
  success: boolean;
  message?: string;
  confirmationNumber?: string;
}

export async function registerForWebinar(webinarId: string, formData: RegistrationFormData): Promise<RegistrationResult> {
  // This would register the user for the webinar
  console.log('Registering for webinar:', webinarId, formData);
  return { success: true, confirmationNumber: `CONF-${Date.now()}` };
}
