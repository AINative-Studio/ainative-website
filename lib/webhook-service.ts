/**
 * Webhook service for managing webhooks
 * Handles all webhook-related API operations
 *
 * Backend API Base Path: /v1/public/webhooks/
 */

import apiClient from './api-client';

// Base path for webhook API endpoints
const WEBHOOK_BASE_PATH = '/v1/public/webhooks';

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
    const response = await apiClient.get<{ webhooks: Webhook[] }>(`${WEBHOOK_BASE_PATH}/`);
    return response.data.webhooks;
  },

  /**
   * Create a new webhook
   */
  async createWebhook(data: CreateWebhookInput): Promise<Webhook> {
    // Validate input
    validateWebhookInput(data);

    const response = await apiClient.post<{ webhook: Webhook }>(`${WEBHOOK_BASE_PATH}/`, data);
    return response.data.webhook;
  },

  /**
   * Get a specific webhook by ID
   */
  async getWebhook(id: string): Promise<Webhook> {
    const response = await apiClient.get<{ webhook: Webhook }>(`${WEBHOOK_BASE_PATH}/${id}`);

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

    const response = await apiClient.put<{ webhook: Webhook }>(`${WEBHOOK_BASE_PATH}/${id}`, data);
    return response.data.webhook;
  },

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    const response = await apiClient.delete<{ message?: string; error?: string }>(
      `${WEBHOOK_BASE_PATH}/${id}`
    );

    if (response.status === 404) {
      throw new Error('Webhook not found');
    }
  },

  /**
   * Test a webhook by sending a test event
   *
   * TODO: Backend endpoint not yet implemented at /v1/public/webhooks/{id}/test
   * Currently only Stripe webhook testing is available at /v1/webhooks/stripe/payment-intent/test
   * This method signature is preserved for future backend implementation.
   */
  async testWebhook(id: string): Promise<WebhookTestResult> {
    // TODO: Update endpoint once backend implements /v1/public/webhooks/{id}/test
    const response = await apiClient.post<{ test_result: WebhookTestResult }>(
      `${WEBHOOK_BASE_PATH}/${id}/test`
    );
    return response.data.test_result;
  },

  /**
   * Get delivery history for a webhook
   *
   * TODO: Backend endpoint not yet implemented at /v1/public/webhooks/{id}/deliveries
   * This method signature is preserved for future backend implementation.
   */
  async getWebhookDeliveries(id: string): Promise<WebhookDelivery[]> {
    // TODO: Update endpoint once backend implements /v1/public/webhooks/{id}/deliveries
    const response = await apiClient.get<{ deliveries: WebhookDelivery[] }>(
      `${WEBHOOK_BASE_PATH}/${id}/deliveries`
    );
    return response.data.deliveries;
  },

  /**
   * Enable or disable a webhook
   *
   * TODO: Backend endpoint not yet implemented at /v1/public/webhooks/{id}/toggle
   * This method signature is preserved for future backend implementation.
   */
  async toggleWebhook(id: string, active: boolean): Promise<Webhook> {
    // TODO: Update endpoint once backend implements /v1/public/webhooks/{id}/toggle
    const response = await apiClient.post<{ webhook: Webhook }>(
      `${WEBHOOK_BASE_PATH}/${id}/toggle`,
      { active }
    );
    return response.data.webhook;
  },
};
