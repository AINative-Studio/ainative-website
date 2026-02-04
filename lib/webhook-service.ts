/**
 * Webhook service for managing webhooks
 * Handles all webhook-related API operations
 */

import apiClient from './api-client';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookInput {
  url: string;
  events: string[];
  secret?: string;
}

export interface UpdateWebhookInput {
  url?: string;
  events?: string[];
  secret?: string;
}

export interface WebhookTestResult {
  success: boolean;
  status_code: number;
  response_time_ms: number;
  response_body?: string;
  error?: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status_code: number;
  response_time_ms: number;
  success: boolean;
  error?: string;
  created_at: string;
}

/**
 * Validates a URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates webhook input data
 */
function validateWebhookInput(data: CreateWebhookInput | UpdateWebhookInput): void {
  if ('url' in data && data.url !== undefined) {
    if (!data.url || !isValidUrl(data.url)) {
      throw new Error('Invalid URL format. Must be a valid HTTP/HTTPS URL.');
    }
  }

  if ('events' in data && data.events !== undefined) {
    if (!Array.isArray(data.events) || data.events.length === 0) {
      throw new Error('Events must be a non-empty array.');
    }
  }
}

export const webhookService = {
  /**
   * List all webhooks
   */
  async listWebhooks(): Promise<Webhook[]> {
    try {
      const response = await apiClient.get<{ webhooks: Webhook[] }>('/v1/public/webhooks');
      if (response.status >= 400 || !response.data?.webhooks) {
        return [];
      }
      return response.data.webhooks;
    } catch {
      return [];
    }
  },

  /**
   * Create a new webhook
   */
  async createWebhook(data: CreateWebhookInput): Promise<Webhook> {
    // Validate input
    validateWebhookInput(data);

    const response = await apiClient.post<{ webhook: Webhook }>('/v1/public/webhooks', data);
    return response.data.webhook;
  },

  /**
   * Get a specific webhook by ID
   */
  async getWebhook(id: string): Promise<Webhook> {
    const response = await apiClient.get<{ webhook: Webhook }>(`/v1/public/webhooks/${id}`);

    if (response.status === 404) {
      throw new Error('Webhook not found');
    }

    return response.data.webhook;
  },

  /**
   * Update an existing webhook
   */
  async updateWebhook(id: string, data: UpdateWebhookInput): Promise<Webhook> {
    // Validate input
    validateWebhookInput(data);

    const response = await apiClient.put<{ webhook: Webhook }>(`/v1/public/webhooks/${id}`, data);
    return response.data.webhook;
  },

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    const response = await apiClient.delete<{ message?: string; error?: string }>(
      `/v1/public/webhooks/${id}`
    );

    if (response.status === 404) {
      throw new Error('Webhook not found');
    }
  },

  /**
   * Test a webhook by sending a test event
   */
  async testWebhook(id: string): Promise<WebhookTestResult> {
    const response = await apiClient.post<{ test_result: WebhookTestResult }>(
      `/v1/public/webhooks/${id}/test`
    );
    return response.data.test_result;
  },

  /**
   * Get delivery history for a webhook
   */
  async getWebhookDeliveries(id: string): Promise<WebhookDelivery[]> {
    try {
      const response = await apiClient.get<{ deliveries: WebhookDelivery[] }>(
        `/v1/public/webhooks/${id}/deliveries`
      );
      if (response.status >= 400 || !response.data?.deliveries) {
        return [];
      }
      return response.data.deliveries;
    } catch {
      return [];
    }
  },

  /**
   * Enable or disable a webhook
   */
  async toggleWebhook(id: string, active: boolean): Promise<Webhook> {
    const response = await apiClient.post<{ webhook: Webhook }>(
      `/v1/public/webhooks/${id}/toggle`,
      { active }
    );
    return response.data.webhook;
  },
};
