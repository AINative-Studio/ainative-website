/**
 * RLHF Mock Data Factory
 */
export interface RLHFFeedbackData {
  type: string;
  prompt: string;
  response: string;
  rating: number;
  stepNumber?: number;
  stepName?: string;
  workflowId?: string;
  agentId?: string;
  projectId?: string;
}

export class RLHFFactory {
  static createFeedback(overrides?: Partial<RLHFFeedbackData>): RLHFFeedbackData {
    return {
      type: 'agent_response',
      prompt: 'Test prompt',
      response: 'Test response',
      rating: 5,
      stepNumber: 1,
      stepName: 'Initial Step',
      workflowId: 'workflow_123',
      agentId: 'agent_456',
      projectId: 'proj_789',
      ...overrides,
    };
  }

  static createPositiveFeedback(): RLHFFeedbackData {
    return RLHFFactory.createFeedback({ rating: 5 });
  }

  static createNegativeFeedback(): RLHFFeedbackData {
    return RLHFFactory.createFeedback({ rating: 1 });
  }
}
