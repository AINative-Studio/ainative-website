/**
 * Email Service
 * Handles all email-related API calls for template management, settings, sending, and analytics
 */

import apiClient from './api-client';

// Type definitions
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesResponse {
  templates: EmailTemplate[];
  total: number;
}

export interface CreateTemplateData {
  name: string;
  subject: string;
  body: string;
}

export interface UpdateTemplateData {
  name?: string;
  subject?: string;
  body?: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  updatedAt?: string;
}

export interface UpdateSettingsData {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  fromEmail?: string;
  fromName?: string;
}

export interface SendEmailData {
  to: string;
  subject: string;
  body: string;
  templateId?: number;
  variables?: Record<string, string>;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
  sentAt: string;
}

export interface EmailHistoryItem {
  id: number;
  to: string;
  subject: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  error?: string;
}

export interface EmailHistoryResponse {
  emails: EmailHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface HistoryParams {
  page: number;
  pageSize: number;
  status?: string;
}

export interface ActivityData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked?: number;
}

export interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  failureRate: number;
  recentActivity: ActivityData[];
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Email Service class
 */
class EmailService {
  /**
   * Get all email templates
   */
  async getTemplates(): Promise<TemplatesResponse> {
    const response = await apiClient.get<TemplatesResponse>('/v1/public/emails/templates');
    return response.data;
  }

  /**
   * Get a single email template by ID
   */
  async getTemplate(id: number): Promise<EmailTemplate> {
    const response = await apiClient.get<EmailTemplate>(`/v1/public/emails/templates/${id}`);
    return response.data;
  }

  /**
   * Create a new email template
   */
  async createTemplate(data: CreateTemplateData): Promise<EmailTemplate> {
    const response = await apiClient.post<EmailTemplate>('/v1/public/emails/templates', data);
    return response.data;
  }

  /**
   * Update an existing email template
   */
  async updateTemplate(id: number, data: UpdateTemplateData): Promise<EmailTemplate> {
    const response = await apiClient.put<EmailTemplate>(`/v1/public/emails/templates/${id}`, data);
    return response.data;
  }

  /**
   * Delete an email template
   */
  async deleteTemplate(id: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(`/v1/public/emails/templates/${id}`);
    return response.data;
  }

  /**
   * Get email settings
   */
  async getSettings(): Promise<EmailSettings> {
    const response = await apiClient.get<EmailSettings>('/v1/public/emails/settings');
    return response.data;
  }

  /**
   * Update email settings
   */
  async updateSettings(data: UpdateSettingsData): Promise<EmailSettings> {
    const response = await apiClient.put<EmailSettings>('/v1/public/emails/settings', data);
    return response.data;
  }

  /**
   * Send an email
   */
  async sendEmail(data: SendEmailData): Promise<SendEmailResponse> {
    const response = await apiClient.post<SendEmailResponse>('/v1/public/emails/send', data);
    return response.data;
  }

  /**
   * Get email history with pagination and optional status filter
   */
  async getHistory(params: HistoryParams): Promise<EmailHistoryResponse> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      ...(params.status && { status: params.status }),
    });

    const response = await apiClient.get<EmailHistoryResponse>(
      `/v1/public/emails/history?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get email analytics with optional date range
   */
  async getAnalytics(params?: AnalyticsParams): Promise<EmailAnalytics> {
    let endpoint = '/v1/public/emails/analytics';

    if (params?.startDate || params?.endDate) {
      const queryParams = new URLSearchParams({
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
      });
      endpoint += `?${queryParams.toString()}`;
    }

    const response = await apiClient.get<EmailAnalytics>(endpoint);
    return response.data;
  }
}

// Export singleton instance
export const emailService = new EmailService();
