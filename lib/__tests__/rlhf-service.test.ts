/**
 * RLHF Service Tests
 * Following TDD methodology - Tests written FIRST
 */

import apiClient from '../api-client';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Import service after mock is set up
import { rlhfService, RLHFFeedback, RLHFSummary } from '../rlhf-service';

describe('RLHFService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should submit user feedback for an interaction', async () => {
      const feedbackRequest: RLHFFeedback = {
        prompt: 'Create a login form',
        response: 'Here is a React login component...',
        feedback: 1, // thumbs up
        comment: 'Great response, very helpful!',
      };

      const mockResponse = {
        id: 'feedback-123',
        prompt: feedbackRequest.prompt,
        response: feedbackRequest.response,
        feedback: feedbackRequest.feedback,
        comment: feedbackRequest.comment,
        created_at: '2025-12-23T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await rlhfService.submitFeedback(feedbackRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/rlhf/feedback', feedbackRequest);
      expect(result.id).toBe('feedback-123');
      expect(result.feedback).toBe(1);
    });

    it('should submit negative feedback', async () => {
      const feedbackRequest: RLHFFeedback = {
        prompt: 'Fix this bug',
        response: 'I cannot help with that',
        feedback: -1, // thumbs down
        comment: 'Not helpful at all',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: { ...feedbackRequest, id: 'feedback-456', created_at: '2025-12-23T10:05:00Z' },
        status: 201,
        statusText: 'Created',
      });

      const result = await rlhfService.submitFeedback(feedbackRequest);

      expect(result.feedback).toBe(-1);
      expect(result.comment).toBe('Not helpful at all');
    });

    it('should submit feedback without comment', async () => {
      const feedbackRequest: RLHFFeedback = {
        prompt: 'Test prompt',
        response: 'Test response',
        feedback: 1,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: { ...feedbackRequest, id: 'feedback-789', created_at: '2025-12-23T10:10:00Z' },
        status: 201,
        statusText: 'Created',
      });

      const result = await rlhfService.submitFeedback(feedbackRequest);

      expect(result.comment).toBeUndefined();
    });

    it('should handle feedback submission errors', async () => {
      const feedbackRequest: RLHFFeedback = {
        prompt: 'Test',
        response: 'Test',
        feedback: 1,
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Failed to save feedback'));

      await expect(rlhfService.submitFeedback(feedbackRequest)).rejects.toThrow(
        'Failed to save feedback'
      );
    });
  });

  describe('submitRating', () => {
    it('should submit numerical rating (1-5)', async () => {
      const ratingRequest = {
        prompt: 'Generate API endpoints',
        response: 'Here are the REST API endpoints...',
        rating: 5 as const,
        comment: 'Perfect!',
      };

      const mockResponse = {
        id: 'rating-123',
        ...ratingRequest,
        created_at: '2025-12-23T10:15:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await rlhfService.submitRating(ratingRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/rlhf/rating', ratingRequest);
      expect(result.rating).toBe(5);
    });

    it('should validate rating range', async () => {
      const invalidRating = {
        prompt: 'Test',
        response: 'Test',
        rating: 6, // Invalid: out of range
      };

      await expect(rlhfService.submitRating(invalidRating)).rejects.toThrow(
        'Rating must be between 1 and 5'
      );

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it('should allow ratings from 1 to 5', async () => {
      const ratings: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];
      for (const rating of ratings) {
        mockApiClient.post.mockResolvedValueOnce({
          data: { id: `rating-${rating}`, rating, created_at: '2025-12-23T10:00:00Z' },
          status: 201,
          statusText: 'Created',
        });

        const result = await rlhfService.submitRating({
          prompt: 'Test',
          response: 'Test',
          rating,
        });

        expect(result.rating).toBe(rating);
      }
    });
  });

  describe('submitComparison', () => {
    it('should submit preference between two responses', async () => {
      const comparisonRequest = {
        prompt: 'Explain recursion',
        response_a: 'Recursion is when a function calls itself...',
        response_b: 'Recursion means calling the same function again...',
        preference: 'a' as const,
        confidence: 0.8,
      };

      const mockResponse = {
        id: 'comparison-123',
        ...comparisonRequest,
        created_at: '2025-12-23T10:20:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await rlhfService.submitComparison(comparisonRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/v1/public/rlhf/comparison',
        comparisonRequest
      );
      expect(result.preference).toBe('a');
      expect(result.confidence).toBe(0.8);
    });

    it('should handle tie preference', async () => {
      const comparisonRequest = {
        prompt: 'Test',
        response_a: 'Response A',
        response_b: 'Response B',
        preference: 'tie' as const,
        confidence: 0.5,
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: { ...comparisonRequest, id: 'comparison-456', created_at: '2025-12-23T10:25:00Z' },
        status: 201,
        statusText: 'Created',
      });

      const result = await rlhfService.submitComparison(comparisonRequest);

      expect(result.preference).toBe('tie');
    });

    it('should validate confidence range', async () => {
      const invalidComparison = {
        prompt: 'Test',
        response_a: 'A',
        response_b: 'B',
        preference: 'a' as const,
        confidence: 1.5, // Invalid: > 1.0
      };

      await expect(rlhfService.submitComparison(invalidComparison)).rejects.toThrow(
        'Confidence must be between 0 and 1'
      );

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should fetch RLHF feedback summary', async () => {
      const mockSummary: RLHFSummary = {
        total_feedback: 150,
        positive_feedback: 120,
        negative_feedback: 30,
        average_rating: 4.2,
        total_comparisons: 50,
        preference_distribution: {
          a: 25,
          b: 15,
          tie: 10,
        },
        feedback_by_date: [
          { date: '2025-12-20', count: 30 },
          { date: '2025-12-21', count: 45 },
          { date: '2025-12-22', count: 50 },
          { date: '2025-12-23', count: 25 },
        ],
        top_issues: [
          { issue: 'Incorrect code formatting', count: 12 },
          { issue: 'Missing error handling', count: 8 },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSummary,
        status: 200,
        statusText: 'OK',
      });

      const result = await rlhfService.getSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/rlhf/summary');
      expect(result.total_feedback).toBe(150);
      expect(result.average_rating).toBe(4.2);
      expect(result.feedback_by_date).toHaveLength(4);
    });

    it('should fetch summary for specific time range', async () => {
      const mockSummary: RLHFSummary = {
        total_feedback: 50,
        positive_feedback: 40,
        negative_feedback: 10,
        average_rating: 4.5,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSummary,
        status: 200,
        statusText: 'OK',
      });

      const result = await rlhfService.getSummary('7d');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/rlhf/summary?time_range=7d');
      expect(result.total_feedback).toBe(50);
    });

    it('should handle summary fetch errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Summary unavailable'));

      await expect(rlhfService.getSummary()).rejects.toThrow('Summary unavailable');
    });
  });

  describe('getFeedbackList', () => {
    it('should fetch paginated feedback list', async () => {
      const mockFeedback = {
        items: [
          {
            id: 'feedback-1',
            prompt: 'Test 1',
            response: 'Response 1',
            feedback: 1,
            created_at: '2025-12-23T10:00:00Z',
          },
          {
            id: 'feedback-2',
            prompt: 'Test 2',
            response: 'Response 2',
            feedback: -1,
            comment: 'Not helpful',
            created_at: '2025-12-23T09:00:00Z',
          },
        ],
        total: 2,
        page: 1,
        page_size: 10,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockFeedback,
        status: 200,
        statusText: 'OK',
      });

      const result = await rlhfService.getFeedbackList({ page: 1, page_size: 10 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/rlhf/feedback?page=1&page_size=10');
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter feedback by type', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { items: [], total: 0, page: 1, page_size: 10 },
        status: 200,
        statusText: 'OK',
      });

      await rlhfService.getFeedbackList({ page: 1, page_size: 10, feedback_type: 'positive' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/rlhf/feedback?page=1&page_size=10&feedback_type=positive');
    });
  });

  describe('exportFeedback', () => {
    it('should export feedback as JSON', async () => {
      const mockExportData = {
        format: 'json',
        data: [
          { id: 'feedback-1', prompt: 'Test', feedback: 1 },
          { id: 'feedback-2', prompt: 'Test 2', feedback: -1 },
        ],
        exported_at: '2025-12-23T10:30:00Z',
        total_records: 2,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockExportData,
        status: 200,
        statusText: 'OK',
      });

      const result = await rlhfService.exportFeedback('json');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/rlhf/export?format=json');
      expect(result.format).toBe('json');
      expect(result.total_records).toBe(2);
    });

    it('should export feedback as CSV', async () => {
      const mockCSVData = {
        format: 'csv',
        data: 'id,prompt,feedback\nfeedback-1,Test,1\n',
        exported_at: '2025-12-23T10:35:00Z',
        total_records: 1,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockCSVData,
        status: 200,
        statusText: 'OK',
      });

      const result = await rlhfService.exportFeedback('csv');

      expect(result.format).toBe('csv');
    });

    it('should apply date filters on export', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { format: 'json', data: [], exported_at: '2025-12-23T10:00:00Z', total_records: 0 },
        status: 200,
        statusText: 'OK',
      });

      await rlhfService.exportFeedback('json', {
        start_date: '2025-12-01',
        end_date: '2025-12-23',
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/rlhf/export?format=json&start_date=2025-12-01&end_date=2025-12-23');
    });
  });

  describe('deleteFeedback', () => {
    it('should delete a specific feedback entry', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: { success: true, message: 'Feedback deleted' },
        status: 200,
        statusText: 'OK',
      });

      const result = await rlhfService.deleteFeedback('feedback-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/public/rlhf/feedback/feedback-123');
      expect(result.success).toBe(true);
    });

    it('should handle deletion errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Feedback not found'));

      await expect(rlhfService.deleteFeedback('invalid-id')).rejects.toThrow(
        'Feedback not found'
      );
    });
  });
});
