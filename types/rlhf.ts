/**
 * RLHF (Reinforcement Learning from Human Feedback) Types
 *
 * Types for collecting user feedback on workflow steps and agent outputs
 * to improve AI agent performance through human feedback.
 */

export interface RLHFFeedbackProps {
  stepNumber: number;
  stepName: string;
  prompt: string;
  response: string;
  projectId: string;
  workflowId?: string;
  agentId?: string;
  className?: string;
  onFeedbackSubmit?: (feedback: RLHFFeedbackData) => void;
}

export interface RLHFFeedbackData {
  type: 'workflow_step_feedback' | 'agent_output_feedback';
  stepNumber: number;
  stepName: string;
  prompt: string;
  response: string;
  rating: 1 | -1; // 1 = thumbs up, -1 = thumbs down
  timestamp: string;
  projectId: string;
  workflowId?: string;
  agentId?: string;
  comment?: string;
}

export interface RLHFFeedbackResponse {
  success: boolean;
  message: string;
  feedbackId?: string;
  timestamp?: string;
}

export interface RLHFFeedbackStats {
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  positivePercentage: number;
  stepNumber: number;
  stepName: string;
}

export type FeedbackState = 'idle' | 'thumbs-up' | 'thumbs-down' | 'loading' | 'success' | 'error';

export interface RLHFInteractionPayload {
  type: string;
  prompt: string;
  response: string;
  rating: number;
  metadata?: {
    stepNumber?: number;
    stepName?: string;
    workflowId?: string;
    agentId?: string;
    projectId?: string;
  };
}
