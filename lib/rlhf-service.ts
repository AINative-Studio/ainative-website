/**
 * RLHF Service
 * Handles Reinforcement Learning from Human Feedback API communication
 * Ported from Vite SPA ZeroDB RLHF service to Next.js
 */

import apiClient from './api-client';

// Types
export interface FeedbackSubmission {
  interaction_id: string;
  feedback_type: 'thumbs' | 'rating' | 'comparison';
  value: number | boolean;
  comment?: string;
  metadata?: Record<string, unknown>;
}

export interface ThumbsFeedback {
  interaction_id: string;
  thumbs_up: boolean;
  comment?: string;
}

export interface RatingFeedback {
  interaction_id: string;
  rating: number; // 1-5
  comment?: string;
}

export interface ComparisonFeedback {
  interaction_id: string;
  response_a_id: string;
  response_b_id: string;
  preferred: 'a' | 'b' | 'tie';
  confidence?: number; // 0-1
  comment?: string;
}

export interface FeedbackSummary {
  total_feedback: number;
  positive_rate: number;
  average_rating: number;
  feedback_by_type: {
    thumbs: number;
    rating: number;
    comparison: number;
  };
  recent_feedback: FeedbackItem[];
}

export interface FeedbackItem {
  id: string;
  interaction_id: string;
  feedback_type: 'thumbs' | 'rating' | 'comparison';
  value: number | boolean | string;
  comment?: string;
  created_at: string;
  user_id?: string;
}

export interface FeedbackListResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface FeedbackAnalytics {
  period: string;
  total_interactions: number;
  feedback_collected: number;
  feedback_rate: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trends: Array<{
    date: string;
    feedback_count: number;
    average_rating: number;
  }>;
}

const BASE_URL = '/v1/rlhf';

/**
 * Submit thumbs up/down feedback
 */
export async function submitThumbsFeedback(feedback: ThumbsFeedback): Promise<{ success: boolean; feedback_id: string }> {
  const response = await apiClient.post<{ success: boolean; feedback_id: string }>(`${BASE_URL}/feedback/thumbs`, {
    interaction_id: feedback.interaction_id,
    value: feedback.thumbs_up,
    comment: feedback.comment,
  });
  return response.data;
}

/**
 * Submit rating feedback (1-5 stars)
 */
export async function submitRatingFeedback(feedback: RatingFeedback): Promise<{ success: boolean; feedback_id: string }> {
  if (feedback.rating < 1 || feedback.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  const response = await apiClient.post<{ success: boolean; feedback_id: string }>(`${BASE_URL}/feedback/rating`, {
    interaction_id: feedback.interaction_id,
    value: feedback.rating,
    comment: feedback.comment,
  });
  return response.data;
}

/**
 * Submit comparison feedback (A/B preference)
 */
export async function submitComparisonFeedback(feedback: ComparisonFeedback): Promise<{ success: boolean; feedback_id: string }> {
  const response = await apiClient.post<{ success: boolean; feedback_id: string }>(`${BASE_URL}/feedback/comparison`, {
    interaction_id: feedback.interaction_id,
    response_a_id: feedback.response_a_id,
    response_b_id: feedback.response_b_id,
    preferred: feedback.preferred,
    confidence: feedback.confidence,
    comment: feedback.comment,
  });
  return response.data;
}

/**
 * Submit generic feedback
 */
export async function submitFeedback(feedback: FeedbackSubmission): Promise<{ success: boolean; feedback_id: string }> {
  const response = await apiClient.post<{ success: boolean; feedback_id: string }>(`${BASE_URL}/feedback`, feedback);
  return response.data;
}

/**
 * Get feedback summary for an agent or project
 */
export async function getFeedbackSummary(agentId?: string): Promise<FeedbackSummary> {
  const url = agentId ? `${BASE_URL}/summary?agent_id=${agentId}` : `${BASE_URL}/summary`;
  const response = await apiClient.get<FeedbackSummary>(url);
  return response.data;
}

/**
 * Get paginated list of feedback
 */
export async function getFeedbackList(options?: {
  page?: number;
  page_size?: number;
  agent_id?: string;
  feedback_type?: 'thumbs' | 'rating' | 'comparison';
  start_date?: string;
  end_date?: string;
}): Promise<FeedbackListResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.page_size) params.append('page_size', String(options.page_size));
  if (options?.agent_id) params.append('agent_id', options.agent_id);
  if (options?.feedback_type) params.append('feedback_type', options.feedback_type);
  if (options?.start_date) params.append('start_date', options.start_date);
  if (options?.end_date) params.append('end_date', options.end_date);

  const queryString = params.toString();
  const url = queryString ? `${BASE_URL}/feedback?${queryString}` : `${BASE_URL}/feedback`;
  const response = await apiClient.get<FeedbackListResponse>(url);
  return response.data;
}

/**
 * Export feedback data
 */
export async function exportFeedback(format: 'json' | 'csv' = 'json', options?: {
  agent_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ url: string; expires_at: string }> {
  const params = new URLSearchParams({ format });
  if (options?.agent_id) params.append('agent_id', options.agent_id);
  if (options?.start_date) params.append('start_date', options.start_date);
  if (options?.end_date) params.append('end_date', options.end_date);

  const response = await apiClient.get<{ url: string; expires_at: string }>(`${BASE_URL}/export?${params.toString()}`);
  return response.data;
}

/**
 * Delete feedback by ID
 */
export async function deleteFeedback(feedbackId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`${BASE_URL}/feedback/${feedbackId}`);
  return response.data;
}

/**
 * Get feedback analytics
 */
export async function getFeedbackAnalytics(options?: {
  period?: 'day' | 'week' | 'month';
  agent_id?: string;
}): Promise<FeedbackAnalytics> {
  const params = new URLSearchParams();
  if (options?.period) params.append('period', options.period);
  if (options?.agent_id) params.append('agent_id', options.agent_id);

  const queryString = params.toString();
  const url = queryString ? `${BASE_URL}/analytics?${queryString}` : `${BASE_URL}/analytics`;
  const response = await apiClient.get<FeedbackAnalytics>(url);
  return response.data;
}

// Default export as object
const rlhfService = {
  submitThumbsFeedback,
  submitRatingFeedback,
  submitComparisonFeedback,
  submitFeedback,
  getFeedbackSummary,
  getFeedbackList,
  exportFeedback,
  deleteFeedback,
  getFeedbackAnalytics,
};

export default rlhfService;
