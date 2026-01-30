/**
 * Test suite for webhook service
 * Tests all webhook management operations
 */

import { webhookService } from '../webhook-service';
import apiClient from '../api-client';

// Mock the API client
jest.mock('../api-client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('WebhookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listWebhooks', () => {
    it('should fetch all webhooks successfully', async () => {
      const mockWebhooks = [
        {
          id: '1',
          url: 'https://example.com/webhook1',
          events: ['api_key.created', 'api_key.deleted'],
          active: true,
          secret: 'secret123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          url: 'https://example.com/webhook2',
          events: ['vector.upserted'],
          active: false,
          secret: 'secret456',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { webhooks: mockWebhooks },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.listWebhooks();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/webhooks');
      expect(result).toEqual(mockWebhooks);
    });

    it('should handle empty webhook list', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { webhooks: [] },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.listWebhooks();

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(webhookService.listWebhooks()).rejects.toThrow('Network error');
    });
  });

  describe('createWebhook', () => {
    it('should create a new webhook successfully', async () => {
      const newWebhook = {
        url: 'https://example.com/webhook',
        events: ['api_key.created', 'api_key.deleted'],
        secret: 'my-secret-key',
      };

      const createdWebhook = {
        id: '123',
        ...newWebhook,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue({
        data: { webhook: createdWebhook },
        status: 201,
        statusText: 'Created',
      });

      const result = await webhookService.createWebhook(newWebhook);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/webhooks', newWebhook);
      expect(result).toEqual(createdWebhook);
    });

    it('should validate required fields', async () => {
      const invalidWebhook = {
        url: '',
        events: [],
      };

      await expect(webhookService.createWebhook(invalidWebhook as any)).rejects.toThrow();
    });

    it('should validate URL format', async () => {
      const invalidWebhook = {
        url: 'not-a-valid-url',
        events: ['api_key.created'],
        secret: 'secret',
      };

      await expect(webhookService.createWebhook(invalidWebhook)).rejects.toThrow();
    });
  });

  describe('getWebhook', () => {
    it('should fetch a specific webhook by id', async () => {
      const mockWebhook = {
        id: '123',
        url: 'https://example.com/webhook',
        events: ['api_key.created'],
        active: true,
        secret: 'secret123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue({
        data: { webhook: mockWebhook },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.getWebhook('123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/webhooks/123');
      expect(result).toEqual(mockWebhook);
    });

    it('should handle webhook not found', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { error: 'Webhook not found' },
        status: 404,
        statusText: 'Not Found',
      });

      await expect(webhookService.getWebhook('999')).rejects.toThrow();
    });
  });

  describe('updateWebhook', () => {
    it('should update webhook successfully', async () => {
      const updateData = {
        url: 'https://example.com/new-webhook',
        events: ['vector.upserted', 'vector.deleted'],
      };

      const updatedWebhook = {
        id: '123',
        ...updateData,
        active: true,
        secret: 'secret123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockApiClient.put.mockResolvedValue({
        data: { webhook: updatedWebhook },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.updateWebhook('123', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/v1/public/webhooks/123', updateData);
      expect(result).toEqual(updatedWebhook);
    });

    it('should validate URL on update', async () => {
      const invalidUpdate = {
        url: 'invalid-url',
      };

      await expect(webhookService.updateWebhook('123', invalidUpdate)).rejects.toThrow();
    });
  });

  describe('deleteWebhook', () => {
    it('should delete webhook successfully', async () => {
      mockApiClient.delete.mockResolvedValue({
        data: { message: 'Webhook deleted successfully' },
        status: 200,
        statusText: 'OK',
      });

      await webhookService.deleteWebhook('123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/v1/public/webhooks/123');
    });

    it('should handle deletion of non-existent webhook', async () => {
      mockApiClient.delete.mockResolvedValue({
        data: { error: 'Webhook not found' },
        status: 404,
        statusText: 'Not Found',
      });

      await expect(webhookService.deleteWebhook('999')).rejects.toThrow();
    });
  });

  describe('testWebhook', () => {
    it('should send test webhook successfully', async () => {
      const testResult = {
        success: true,
        status_code: 200,
        response_time_ms: 123,
        response_body: 'OK',
      };

      mockApiClient.post.mockResolvedValue({
        data: { test_result: testResult },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.testWebhook('123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/webhooks/123/test');
      expect(result).toEqual(testResult);
    });

    it('should handle test failure', async () => {
      const testResult = {
        success: false,
        status_code: 500,
        response_time_ms: 5000,
        error: 'Connection timeout',
      };

      mockApiClient.post.mockResolvedValue({
        data: { test_result: testResult },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.testWebhook('123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });
  });

  describe('getWebhookDeliveries', () => {
    it('should fetch delivery history successfully', async () => {
      const mockDeliveries = [
        {
          id: 'd1',
          webhook_id: '123',
          event_type: 'api_key.created',
          payload: { key_id: 'key1' },
          status_code: 200,
          response_time_ms: 150,
          success: true,
          created_at: '2024-01-01T12:00:00Z',
        },
        {
          id: 'd2',
          webhook_id: '123',
          event_type: 'api_key.deleted',
          payload: { key_id: 'key2' },
          status_code: 500,
          response_time_ms: 2000,
          success: false,
          error: 'Internal server error',
          created_at: '2024-01-01T13:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { deliveries: mockDeliveries },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.getWebhookDeliveries('123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/webhooks/123/deliveries');
      expect(result).toEqual(mockDeliveries);
    });

    it('should handle empty delivery history', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { deliveries: [] },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.getWebhookDeliveries('123');

      expect(result).toEqual([]);
    });
  });

  describe('toggleWebhook', () => {
    it('should enable webhook successfully', async () => {
      const updatedWebhook = {
        id: '123',
        url: 'https://example.com/webhook',
        events: ['api_key.created'],
        active: true,
        secret: 'secret123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue({
        data: { webhook: updatedWebhook },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.toggleWebhook('123', true);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/webhooks/123/toggle', { active: true });
      expect(result.active).toBe(true);
    });

    it('should disable webhook successfully', async () => {
      const updatedWebhook = {
        id: '123',
        url: 'https://example.com/webhook',
        events: ['api_key.created'],
        active: false,
        secret: 'secret123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue({
        data: { webhook: updatedWebhook },
        status: 200,
        statusText: 'OK',
      });

      const result = await webhookService.toggleWebhook('123', false);

      expect(result.active).toBe(false);
    });
  });
});
