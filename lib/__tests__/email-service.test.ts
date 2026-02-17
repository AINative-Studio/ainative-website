import apiClient from '../api-client';
import { emailService } from '../email-service';

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

describe('EmailService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplates', () => {
    it('fetches email templates from correct endpoint', async () => {
      const mockTemplates = {
        templates: [
          {
            id: 1,
            name: 'Welcome Email',
            subject: 'Welcome to AINative Studio',
            body: 'Hello {{name}}, welcome to our platform!',
            createdAt: '2025-12-21T10:00:00Z',
            updatedAt: '2025-12-21T10:00:00Z',
          },
          {
            id: 2,
            name: 'Password Reset',
            subject: 'Reset Your Password',
            body: 'Click here to reset: {{resetLink}}',
            createdAt: '2025-12-21T09:00:00Z',
            updatedAt: '2025-12-21T09:00:00Z',
          },
        ],
        total: 2,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockTemplates,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.getTemplates();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/email/templates');
      expect(result).toEqual(mockTemplates);
    });

    it('handles errors when fetching templates', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(emailService.getTemplates()).rejects.toThrow('Network error');
    });
  });

  describe('createTemplate', () => {
    it('creates a new email template', async () => {
      const templateData = {
        name: 'New Template',
        subject: 'Test Subject',
        body: 'Test Body with {{variable}}',
      };

      const mockResponse = {
        id: 3,
        ...templateData,
        createdAt: '2025-12-21T11:00:00Z',
        updatedAt: '2025-12-21T11:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await emailService.createTemplate(templateData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/email/templates', templateData);
      expect(result).toEqual(mockResponse);
    });

    it('handles validation errors', async () => {
      const invalidData = {
        name: '',
        subject: '',
        body: '',
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(emailService.createTemplate(invalidData)).rejects.toThrow('Validation failed');
    });
  });

  describe('updateTemplate', () => {
    it('updates an existing template', async () => {
      const templateId = 1;
      const updateData = {
        name: 'Updated Template',
        subject: 'Updated Subject',
        body: 'Updated body',
      };

      const mockResponse = {
        id: templateId,
        ...updateData,
        createdAt: '2025-12-21T10:00:00Z',
        updatedAt: '2025-12-21T11:30:00Z',
      };

      mockApiClient.put.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.updateTemplate(templateId, updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/v1/public/email/templates/${templateId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('handles not found errors', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Template not found'));

      await expect(emailService.updateTemplate(999, { name: 'Test' })).rejects.toThrow(
        'Template not found'
      );
    });
  });

  describe('deleteTemplate', () => {
    it('deletes a template successfully', async () => {
      const templateId = 1;

      mockApiClient.delete.mockResolvedValueOnce({
        data: { success: true, message: 'Template deleted' },
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.deleteTemplate(templateId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/public/email/templates/${templateId}`);
      expect(result).toEqual({ success: true, message: 'Template deleted' });
    });

    it('handles deletion errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot delete template in use'));

      await expect(emailService.deleteTemplate(1)).rejects.toThrow('Cannot delete template in use');
    });
  });

  describe('getSettings', () => {
    it('fetches email settings from correct endpoint', async () => {
      const mockSettings = {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'noreply@ainative.studio',
        smtpSecure: true,
        fromEmail: 'noreply@ainative.studio',
        fromName: 'AINative Studio',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSettings,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.getSettings();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/email/settings');
      expect(result).toEqual(mockSettings);
    });

    it('handles errors when fetching settings', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(emailService.getSettings()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateSettings', () => {
    it('updates email settings', async () => {
      const settingsData = {
        smtpHost: 'smtp.sendgrid.net',
        smtpPort: 587,
        smtpUser: 'apikey',
        smtpPassword: 'SG.xxxxxxxxxxxx',
        smtpSecure: true,
        fromEmail: 'hello@ainative.studio',
        fromName: 'AINative Team',
      };

      const mockResponse = {
        ...settingsData,
        updatedAt: '2025-12-21T12:00:00Z',
      };

      mockApiClient.put.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.updateSettings(settingsData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/v1/public/email/settings', settingsData);
      expect(result).toEqual(mockResponse);
    });

    it('handles validation errors for settings', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Invalid SMTP configuration'));

      await expect(
        emailService.updateSettings({ smtpHost: '', smtpPort: 0 })
      ).rejects.toThrow('Invalid SMTP configuration');
    });
  });

  describe('sendEmail', () => {
    it('sends email successfully', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Test Email',
        body: 'This is a test email',
        templateId: 1,
        variables: { name: 'John Doe' },
      };

      const mockResponse = {
        success: true,
        messageId: 'msg-123456',
        sentAt: '2025-12-21T12:30:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.sendEmail(emailData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/email/send', emailData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when sending email', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('SMTP connection failed'));

      await expect(
        emailService.sendEmail({ to: 'test@example.com', subject: 'Test', body: 'Test' })
      ).rejects.toThrow('SMTP connection failed');
    });
  });

  describe('getHistory', () => {
    it('fetches email history with pagination', async () => {
      const mockHistory = {
        emails: [
          {
            id: 1,
            to: 'user1@example.com',
            subject: 'Welcome Email',
            status: 'delivered',
            sentAt: '2025-12-21T10:00:00Z',
            deliveredAt: '2025-12-21T10:01:00Z',
          },
          {
            id: 2,
            to: 'user2@example.com',
            subject: 'Password Reset',
            status: 'sent',
            sentAt: '2025-12-21T11:00:00Z',
          },
        ],
        total: 150,
        page: 1,
        pageSize: 50,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockHistory,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.getHistory({ page: 1, pageSize: 50 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/email/history?page=1&pageSize=50');
      expect(result).toEqual(mockHistory);
    });

    it('fetches history with status filter', async () => {
      const mockFilteredHistory = {
        emails: [
          {
            id: 3,
            to: 'user3@example.com',
            subject: 'Failed Email',
            status: 'failed',
            sentAt: '2025-12-21T12:00:00Z',
            error: 'Invalid email address',
          },
        ],
        total: 5,
        page: 1,
        pageSize: 50,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockFilteredHistory,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.getHistory({ page: 1, pageSize: 50, status: 'failed' });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/email/history?page=1&pageSize=50&status=failed'
      );
      expect(result).toEqual(mockFilteredHistory);
    });
  });

  describe('getAnalytics', () => {
    it('fetches email analytics', async () => {
      const mockAnalytics = {
        totalSent: 10000,
        totalDelivered: 9500,
        totalOpened: 7200,
        totalClicked: 3400,
        totalFailed: 500,
        deliveryRate: 95.0,
        openRate: 75.8,
        clickRate: 47.2,
        failureRate: 5.0,
        recentActivity: [
          { date: '2025-12-21', sent: 150, delivered: 145, opened: 110 },
          { date: '2025-12-20', sent: 200, delivered: 195, opened: 150 },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockAnalytics,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.getAnalytics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/email/analytics');
      expect(result).toEqual(mockAnalytics);
    });

    it('fetches analytics with date range', async () => {
      const startDate = '2025-12-01';
      const endDate = '2025-12-21';

      const mockAnalytics = {
        totalSent: 5000,
        totalDelivered: 4750,
        totalOpened: 3600,
        totalClicked: 1700,
        totalFailed: 250,
        deliveryRate: 95.0,
        openRate: 75.8,
        clickRate: 47.2,
        failureRate: 5.0,
        recentActivity: [],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockAnalytics,
        status: 200,
        statusText: 'OK',
      });

      const result = await emailService.getAnalytics({ startDate, endDate });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/v1/public/email/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      expect(result).toEqual(mockAnalytics);
    });

    it('handles errors when fetching analytics', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Analytics service unavailable'));

      await expect(emailService.getAnalytics()).rejects.toThrow('Analytics service unavailable');
    });
  });
});
