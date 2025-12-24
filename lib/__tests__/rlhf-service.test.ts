/**
 * RLHF Service Tests
 * TDD tests for Reinforcement Learning from Human Feedback
 */

import apiClient from '../api-client';
import rlhfService, {
  submitThumbsFeedback,
  submitRatingFeedback,
  submitComparisonFeedback,
  submitFeedback,
  getFeedbackSummary,
  getFeedbackList,
  exportFeedback,
  deleteFeedback,
  getFeedbackAnalytics,
} from '../rlhf-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('RLHF Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitThumbsFeedback', () => {
    it('should submit thumbs up feedback', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true, feedback_id: 'fb-123' }, status: 200, statusText: 'OK' });

      const result = await submitThumbsFeedback({
        interaction_id: 'int-1',
        thumbs_up: true,
        comment: 'Great response!',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/rlhf/feedback/thumbs', {
        interaction_id: 'int-1',
        value: true,
        comment: 'Great response!',
      });
      expect(result.success).toBe(true);
      expect(result.feedback_id).toBe('fb-123');
    });

    it('should submit thumbs down feedback', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true, feedback_id: 'fb-124' }, status: 200, statusText: 'OK' });

      const result = await submitThumbsFeedback({
        interaction_id: 'int-2',
        thumbs_up: false,
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/rlhf/feedback/thumbs', {
        interaction_id: 'int-2',
        value: false,
        comment: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('submitRatingFeedback', () => {
    it('should submit rating feedback', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true, feedback_id: 'fb-125' }, status: 200, statusText: 'OK' });

      const result = await submitRatingFeedback({
        interaction_id: 'int-3',
        rating: 5,
        comment: 'Excellent!',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/rlhf/feedback/rating', {
        interaction_id: 'int-3',
        value: 5,
        comment: 'Excellent!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject rating below 1', async () => {
      await expect(submitRatingFeedback({
        interaction_id: 'int-4',
        rating: 0,
      })).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should reject rating above 5', async () => {
      await expect(submitRatingFeedback({
        interaction_id: 'int-5',
        rating: 6,
      })).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('submitComparisonFeedback', () => {
    it('should submit comparison feedback preferring A', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true, feedback_id: 'fb-126' }, status: 200, statusText: 'OK' });

      const result = await submitComparisonFeedback({
        interaction_id: 'int-6',
        response_a_id: 'resp-a',
        response_b_id: 'resp-b',
        preferred: 'a',
        confidence: 0.9,
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/rlhf/feedback/comparison', {
        interaction_id: 'int-6',
        response_a_id: 'resp-a',
        response_b_id: 'resp-b',
        preferred: 'a',
        confidence: 0.9,
        comment: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('should submit tie comparison feedback', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true, feedback_id: 'fb-127' }, status: 200, statusText: 'OK' });

      const result = await submitComparisonFeedback({
        interaction_id: 'int-7',
        response_a_id: 'resp-c',
        response_b_id: 'resp-d',
        preferred: 'tie',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('submitFeedback', () => {
    it('should submit generic feedback', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true, feedback_id: 'fb-128' }, status: 200, statusText: 'OK' });

      const result = await submitFeedback({
        interaction_id: 'int-8',
        feedback_type: 'thumbs',
        value: true,
        metadata: { source: 'dashboard' },
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/rlhf/feedback', {
        interaction_id: 'int-8',
        feedback_type: 'thumbs',
        value: true,
        metadata: { source: 'dashboard' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getFeedbackSummary', () => {
    it('should get global feedback summary', async () => {
      const mockSummary = {
        total_feedback: 100,
        positive_rate: 0.85,
        average_rating: 4.2,
        feedback_by_type: { thumbs: 60, rating: 30, comparison: 10 },
        recent_feedback: [],
      };

      mockApiClient.get.mockResolvedValue({ data: mockSummary, status: 200, statusText: 'OK' });

      const result = await getFeedbackSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/summary');
      expect(result.total_feedback).toBe(100);
      expect(result.positive_rate).toBe(0.85);
    });

    it('should get agent-specific feedback summary', async () => {
      mockApiClient.get.mockResolvedValue({ data: { total_feedback: 50 }, status: 200, statusText: 'OK' });

      await getFeedbackSummary('agent-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/summary?agent_id=agent-123');
    });
  });

  describe('getFeedbackList', () => {
    it('should get paginated feedback list', async () => {
      const mockResponse = {
        items: [{ id: 'fb-1', interaction_id: 'int-1', feedback_type: 'thumbs', value: true }],
        total: 100,
        page: 1,
        page_size: 20,
        has_more: true,
      };

      mockApiClient.get.mockResolvedValue({ data: mockResponse, status: 200, statusText: 'OK' });

      const result = await getFeedbackList({ page: 1, page_size: 20 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/feedback?page=1&page_size=20');
      expect(result.items).toHaveLength(1);
      expect(result.has_more).toBe(true);
    });

    it('should filter by feedback type', async () => {
      mockApiClient.get.mockResolvedValue({ data: { items: [], total: 0, page: 1, page_size: 20, has_more: false }, status: 200, statusText: 'OK' });

      await getFeedbackList({ feedback_type: 'rating' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/feedback?feedback_type=rating');
    });

    it('should filter by date range', async () => {
      mockApiClient.get.mockResolvedValue({ data: { items: [], total: 0, page: 1, page_size: 20, has_more: false }, status: 200, statusText: 'OK' });

      await getFeedbackList({ start_date: '2025-01-01', end_date: '2025-01-31' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/feedback?start_date=2025-01-01&end_date=2025-01-31');
    });
  });

  describe('exportFeedback', () => {
    it('should export feedback as JSON', async () => {
      mockApiClient.get.mockResolvedValue({ data: { url: 'https://export.url/data.json', expires_at: '2025-01-02' }, status: 200, statusText: 'OK' });

      const result = await exportFeedback('json');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/export?format=json');
      expect(result.url).toContain('json');
    });

    it('should export feedback as CSV', async () => {
      mockApiClient.get.mockResolvedValue({ data: { url: 'https://export.url/data.csv', expires_at: '2025-01-02' }, status: 200, statusText: 'OK' });

      const result = await exportFeedback('csv');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/export?format=csv');
      expect(result.url).toContain('csv');
    });

    it('should export with filters', async () => {
      mockApiClient.get.mockResolvedValue({ data: { url: 'https://export.url/data.json', expires_at: '2025-01-02' }, status: 200, statusText: 'OK' });

      await exportFeedback('json', { agent_id: 'agent-1', start_date: '2025-01-01' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/export?format=json&agent_id=agent-1&start_date=2025-01-01');
    });
  });

  describe('deleteFeedback', () => {
    it('should delete feedback by ID', async () => {
      mockApiClient.delete.mockResolvedValue({ data: { success: true }, status: 200, statusText: 'OK' });

      const result = await deleteFeedback('fb-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/rlhf/feedback/fb-123');
      expect(result.success).toBe(true);
    });
  });

  describe('getFeedbackAnalytics', () => {
    it('should get feedback analytics', async () => {
      const mockAnalytics = {
        period: 'week',
        total_interactions: 1000,
        feedback_collected: 200,
        feedback_rate: 0.2,
        sentiment_breakdown: { positive: 150, neutral: 30, negative: 20 },
        trends: [{ date: '2025-01-01', feedback_count: 30, average_rating: 4.1 }],
      };

      mockApiClient.get.mockResolvedValue({ data: mockAnalytics, status: 200, statusText: 'OK' });

      const result = await getFeedbackAnalytics({ period: 'week' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/analytics?period=week');
      expect(result.feedback_rate).toBe(0.2);
    });

    it('should get analytics for specific agent', async () => {
      mockApiClient.get.mockResolvedValue({ data: { period: 'day', total_interactions: 100 }, status: 200, statusText: 'OK' });

      await getFeedbackAnalytics({ period: 'day', agent_id: 'agent-1' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/rlhf/analytics?period=day&agent_id=agent-1');
    });
  });

  describe('default export', () => {
    it('should export all methods', () => {
      expect(rlhfService.submitThumbsFeedback).toBe(submitThumbsFeedback);
      expect(rlhfService.submitRatingFeedback).toBe(submitRatingFeedback);
      expect(rlhfService.submitComparisonFeedback).toBe(submitComparisonFeedback);
      expect(rlhfService.submitFeedback).toBe(submitFeedback);
      expect(rlhfService.getFeedbackSummary).toBe(getFeedbackSummary);
      expect(rlhfService.getFeedbackList).toBe(getFeedbackList);
      expect(rlhfService.exportFeedback).toBe(exportFeedback);
      expect(rlhfService.deleteFeedback).toBe(deleteFeedback);
      expect(rlhfService.getFeedbackAnalytics).toBe(getFeedbackAnalytics);
    });
  });
});
