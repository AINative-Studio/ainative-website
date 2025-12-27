/**
 * RLHF (Reinforcement Learning from Human Feedback) Service
 *
 * Service for submitting user feedback to ZeroDB RLHF API
 * to improve AI agent performance through human feedback.
 */

import apiClient from '@/utils/apiClient';
import type {
  RLHFFeedbackData,
  RLHFFeedbackResponse,
  RLHFFeedbackStats,
  RLHFInteractionPayload,
} from '@/types/rlhf';

class RLHFService {
  private baseUrl = '/v1/public';

  /**
   * Submit feedback for a workflow step or agent output
   */
  async submitFeedback(
    projectId: string,
    feedbackData: RLHFFeedbackData
  ): Promise<RLHFFeedbackResponse> {
    try {
      const payload: RLHFInteractionPayload = {
        type: feedbackData.type,
        prompt: feedbackData.prompt,
        response: feedbackData.response,
        rating: feedbackData.rating,
        metadata: {
          stepNumber: feedbackData.stepNumber,
          stepName: feedbackData.stepName,
          workflowId: feedbackData.workflowId,
          agentId: feedbackData.agentId,
          projectId: feedbackData.projectId,
        },
      };

      const response = await apiClient.post(
        `${this.baseUrl}/${projectId}/database/rlhf/interactions`,
        payload
      );

      const data = response.data as { id?: string; timestamp?: string };
      return {
        success: true,
        message: 'Feedback submitted successfully',
        feedbackId: data?.id,
        timestamp: data?.timestamp || new Date().toISOString(),
      };
    } catch (error: unknown) {
      console.error('Failed to submit RLHF feedback:', error);

      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Failed to submit feedback',
      };
    }
  }

  /**
   * Get feedback statistics for a specific step
   */
  async getFeedbackStats(
    projectId: string,
    stepNumber: number,
    stepName: string
  ): Promise<RLHFFeedbackStats> {
    try {
      const queryParams = new URLSearchParams({
        stepNumber: stepNumber.toString(),
        stepName,
      });
      const response = await apiClient.get(
        `${this.baseUrl}/${projectId}/database/rlhf/stats?${queryParams}`
      );

      const data = response.data as { total?: number; positive?: number; negative?: number; positivePercentage?: number };

      return {
        totalFeedback: data.total || 0,
        positiveCount: data.positive || 0,
        negativeCount: data.negative || 0,
        positivePercentage: data.positivePercentage || 0,
        stepNumber,
        stepName,
      };
    } catch (error: unknown) {
      console.error('Failed to fetch RLHF stats:', error);

      // Return default stats on error
      return {
        totalFeedback: 0,
        positiveCount: 0,
        negativeCount: 0,
        positivePercentage: 0,
        stepNumber,
        stepName,
      };
    }
  }

  /**
   * Get all feedback for a specific workflow
   */
  async getWorkflowFeedback(
    projectId: string,
    workflowId: string
  ): Promise<RLHFFeedbackData[]> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${projectId}/database/rlhf/workflow/${workflowId}`
      );

      const data = response.data as { feedback?: RLHFFeedbackData[] };
      return data?.feedback || [];
    } catch (error: unknown) {
      console.error('Failed to fetch workflow feedback:', error);
      return [];
    }
  }

  /**
   * Get all feedback for a specific agent
   */
  async getAgentFeedback(
    projectId: string,
    agentId: string
  ): Promise<RLHFFeedbackData[]> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${projectId}/database/rlhf/agent/${agentId}`
      );

      const data = response.data as { feedback?: RLHFFeedbackData[] };
      return data?.feedback || [];
    } catch (error: unknown) {
      console.error('Failed to fetch agent feedback:', error);
      return [];
    }
  }
}

export const rlhfService = new RLHFService();
export default rlhfService;
