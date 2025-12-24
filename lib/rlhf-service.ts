/**
 * RLHF (Reinforcement Learning from Human Feedback) Service
 * Handles feedback collection, ratings, and comparisons for AI responses
 */

import apiClient from './api-client';

// Types
export interface RLHFFeedback {
  prompt: string;
  response: string;
  feedback: -1 | 0 | 1; // -1 = thumbs down, 0 = neutral, 1 = thumbs up
  comment?: string;
  metadata?: Record<string, unknown>;
}

export interface RLHFFeedbackResponse extends RLHFFeedback {
  id: string;
  created_at: string;
  user_id?: string;
}

export interface RLHFRating {
  prompt: string;
  response: string;
  rating: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  comment?: string;
  metadata?: Record<string, unknown>;
}

export interface RLHFRatingResponse extends RLHFRating {
  id: string;
  created_at: string;
  user_id?: string;
}

export interface RLHFComparison {
  prompt: string;
  response_a: string;
  response_b: string;
  preference: 'a' | 'b' | 'tie';
  confidence: number; // 0.0 to 1.0
  comment?: string;
  metadata?: Record<string, unknown>;
}

export interface RLHFComparisonResponse extends RLHFComparison {
  id: string;
  created_at: string;
  user_id?: string;
}

export interface RLHFSummary {
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  average_rating?: number;
  total_comparisons?: number;
  preference_distribution?: {
    a: number;
    b: number;
    tie: number;
  };
  feedback_by_date?: Array<{
    date: string;
    count: number;
  }>;
  top_issues?: Array<{
    issue: string;
    count: number;
  }>;
}

export interface FeedbackListResponse {
  items: RLHFFeedbackResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface FeedbackListParams {
  page: number;
  page_size: number;
  feedback_type?: 'positive' | 'negative' | 'neutral';
  start_date?: string;
  end_date?: string;
}

export interface ExportParams {
  start_date?: string;
  end_date?: string;
  feedback_type?: 'positive' | 'negative' | 'neutral';
}

/**
 * RLHF Service
 * Handles all API communication for feedback collection
 */
export class RLHFService {
  private readonly baseUrl = '/v1/public/rlhf';

  /**
   * Submit thumbs up/down feedback
   */
  async submitFeedback(feedback: RLHFFeedback): Promise<RLHFFeedbackResponse> {
    try {
      const response = await apiClient.post<RLHFFeedbackResponse>(`${this.baseUrl}/feedback`, feedback);
      return response.data;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  /**
   * Submit numerical rating (1-5 stars)
   */
  async submitRating(rating: RLHFRating): Promise<RLHFRatingResponse> {
    // Validate rating range
    if (rating.rating < 1 || rating.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    try {
      const response = await apiClient.post<RLHFRatingResponse>(`${this.baseUrl}/rating`, rating);
      return response.data;
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  }

  /**
   * Submit comparison between two responses
   */
  async submitComparison(comparison: RLHFComparison): Promise<RLHFComparisonResponse> {
    // Validate confidence range
    if (comparison.confidence < 0 || comparison.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }

    try {
      const response = await apiClient.post<RLHFComparisonResponse>(`${this.baseUrl}/comparison`, comparison);
      return response.data;
    } catch (error) {
      console.error('Failed to submit comparison:', error);
      throw error;
    }
  }

  /**
   * Get RLHF feedback summary
   */
  async getSummary(timeRange?: string): Promise<RLHFSummary> {
    try {
      const endpoint = timeRange
        ? `${this.baseUrl}/summary?time_range=${encodeURIComponent(timeRange)}`
        : `${this.baseUrl}/summary`;
      const response = await apiClient.get<RLHFSummary>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch RLHF summary:', error);
      throw error;
    }
  }

  /**
   * Get paginated feedback list
   */
  async getFeedbackList(params: FeedbackListParams): Promise<FeedbackListResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('page_size', params.page_size.toString());
      if (params.feedback_type) queryParams.append('feedback_type', params.feedback_type);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const endpoint = `${this.baseUrl}/feedback?${queryParams.toString()}`;
      const response = await apiClient.get<FeedbackListResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch feedback list:', error);
      throw error;
    }
  }

  /**
   * Export feedback data
   */
  async exportFeedback(
    format: 'json' | 'csv',
    filters?: ExportParams
  ): Promise<{
    format: string;
    data: unknown;
    exported_at: string;
    total_records: number;
  }> {
    try {
      const queryParams = new URLSearchParams({ format });
      if (filters?.start_date) queryParams.append('start_date', filters.start_date);
      if (filters?.end_date) queryParams.append('end_date', filters.end_date);
      if (filters?.feedback_type) queryParams.append('feedback_type', filters.feedback_type);

      const endpoint = `${this.baseUrl}/export?${queryParams.toString()}`;
      const response = await apiClient.get<{
        format: string;
        data: unknown;
        exported_at: string;
        total_records: number;
      }>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to export feedback:', error);
      throw error;
    }
  }

  /**
   * Delete a specific feedback entry
   */
  async deleteFeedback(feedbackId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete feedback ${feedbackId}:`, error);
      throw error;
    }
  }

  /**
   * Get feedback analytics
   */
  async getAnalytics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<{
    feedback_trend: Array<{ date: string; positive: number; negative: number }>;
    rating_distribution: Record<number, number>;
    common_issues: Array<{ issue: string; frequency: number }>;
    improvement_suggestions: string[];
  }> {
    try {
      const endpoint = `${this.baseUrl}/analytics?time_range=${encodeURIComponent(timeRange)}`;
      const response = await apiClient.get<{
        feedback_trend: Array<{ date: string; positive: number; negative: number }>;
        rating_distribution: Record<number, number>;
        common_issues: Array<{ issue: string; frequency: number }>;
        improvement_suggestions: string[];
      }>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const rlhfService = new RLHFService();
