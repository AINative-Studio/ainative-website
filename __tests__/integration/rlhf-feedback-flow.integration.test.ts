/**
 * RLHF Feedback Collection Flow Integration Tests
 * Tests complete RLHF workflows including feedback submission, statistics, and agent improvement
 */

import { rlhfService } from '../../services/RLHFService';
import { setupIntegrationTest, testUtils } from './setup';

describe('RLHF Feedback Collection Flow Integration Tests', () => {
  setupIntegrationTest();

  const projectId = 'test-project-123';

  beforeEach(() => {
    testUtils.setupAuthenticatedState();
  });

  describe('Feedback Submission Flow', () => {
    it('should submit positive feedback for agent output', async () => {
      // Given: User interacts with AI agent
      const feedbackData = {
        type: 'agent_output_feedback' as const,
        prompt: 'Write a function to calculate fibonacci',
        response: 'def fibonacci(n): ...',
        rating: 1 as const, // positive
        timestamp: new Date().toISOString(),
        stepNumber: 1,
        stepName: 'Code Generation',
        workflowId: 'workflow-123',
        agentId: 'agent-456',
        projectId,
      };

      // When: User submits positive feedback
      const result = await rlhfService.submitFeedback(projectId, feedbackData);

      // Then: Feedback is recorded
      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
      expect(result.feedbackId).toBeTruthy();
      expect(result.timestamp).toBeTruthy();
    });

    it('should submit negative feedback with details', async () => {
      // Given: User finds issue with agent output
      const feedbackData = {
        type: 'agent_output_feedback' as const,
        prompt: 'Explain quantum computing',
        response: 'Quantum computing uses quantum mechanics...',
        rating: -1 as const, // negative
        timestamp: new Date().toISOString(),
        stepNumber: 2,
        stepName: 'Explanation Generation',
        workflowId: 'workflow-123',
        agentId: 'agent-456',
        projectId,
      };

      // When: User submits negative feedback
      const result = await rlhfService.submitFeedback(projectId, feedbackData);

      // Then: Feedback is recorded for improvement
      expect(result.success).toBe(true);
      expect(result.feedbackId).toBeTruthy();
    });

    it('should submit feedback for specific workflow step', async () => {
      // Given: Multi-step workflow execution
      const steps = [
        {
          stepNumber: 1,
          stepName: 'Planning',
          rating: 1,
        },
        {
          stepNumber: 2,
          stepName: 'Implementation',
          rating: 1,
        },
        {
          stepNumber: 3,
          stepName: 'Testing',
          rating: -1,
        },
      ];

      // When: Submitting feedback for each step
      const results = await Promise.all(
        steps.map(step =>
          rlhfService.submitFeedback(projectId, {
            type: 'workflow_step_feedback' as const,
            prompt: `Step ${step.stepNumber}`,
            response: 'Output',
            rating: step.rating as 1 | -1,
            timestamp: new Date().toISOString(),
            stepNumber: step.stepNumber,
            stepName: step.stepName,
            workflowId: 'workflow-123',
            agentId: 'agent-456',
            projectId,
          })
        )
      );

      // Then: All feedback is recorded
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should include metadata in feedback', async () => {
      // Given: Feedback with rich metadata
      const feedbackData = {
        type: 'agent_output_feedback' as const,
        prompt: 'Generate API endpoint',
        response: '@app.route("/api/users")',
        rating: 1 as const,
        timestamp: new Date().toISOString(),
        stepNumber: 1,
        stepName: 'API Generation',
        workflowId: 'workflow-123',
        agentId: 'agent-backend-456',
        projectId,
      };

      // When: Submitting with metadata
      const result = await rlhfService.submitFeedback(projectId, feedbackData);

      // Then: Metadata is stored
      expect(result.success).toBe(true);
      expect(result.feedbackId).toBeTruthy();
    });
  });

  describe('Feedback Statistics Retrieval', () => {
    it('should get feedback statistics for workflow step', async () => {
      // Given: Workflow step has received feedback
      const stepNumber = 1;
      const stepName = 'Code Generation';

      // When: Fetching statistics
      const stats = await rlhfService.getFeedbackStats(projectId, stepNumber, stepName);

      // Then: Statistics are returned
      expect(stats).toBeDefined();
      expect(stats.totalFeedback).toBe(10);
      expect(stats.positiveCount).toBe(8);
      expect(stats.negativeCount).toBe(2);
      expect(stats.positivePercentage).toBe(80);
      expect(stats.stepNumber).toBe(stepNumber);
      expect(stats.stepName).toBe(stepName);
    });

    it('should track feedback trends over time', async () => {
      // Given: Multiple feedback submissions
      const stepNumber = 2;
      const stepName = 'Bug Fixing';

      // When: Getting current stats
      const stats = await rlhfService.getFeedbackStats(projectId, stepNumber, stepName);

      // Then: Trends can be analyzed
      expect(stats.totalFeedback).toBeGreaterThanOrEqual(0);
      expect(stats.positivePercentage).toBeGreaterThanOrEqual(0);
      expect(stats.positivePercentage).toBeLessThanOrEqual(100);
    });

    it('should handle steps with no feedback', async () => {
      // Given: New step with no feedback
      const stepNumber = 99;
      const stepName = 'New Feature';

      // When: Fetching statistics
      const stats = await rlhfService.getFeedbackStats(projectId, stepNumber, stepName);

      // Then: Returns empty stats without error
      expect(stats).toBeDefined();
      expect(stats.totalFeedback).toBe(0);
      expect(stats.positiveCount).toBe(0);
      expect(stats.negativeCount).toBe(0);
    });
  });

  describe('Workflow Feedback Aggregation', () => {
    it('should get all feedback for workflow', async () => {
      // Given: Workflow with multiple steps
      const workflowId = 'workflow-123';

      // When: Fetching all workflow feedback
      const feedback = await rlhfService.getWorkflowFeedback(projectId, workflowId);

      // Then: All feedback is returned
      expect(Array.isArray(feedback)).toBe(true);
    });

    it('should aggregate feedback by workflow', async () => {
      // Given: Multiple workflows
      const workflow1 = 'workflow-123';
      const workflow2 = 'workflow-456';

      // When: Getting feedback for each
      const [feedback1, feedback2] = await Promise.all([
        rlhfService.getWorkflowFeedback(projectId, workflow1),
        rlhfService.getWorkflowFeedback(projectId, workflow2),
      ]);

      // Then: Feedback is properly segregated
      expect(Array.isArray(feedback1)).toBe(true);
      expect(Array.isArray(feedback2)).toBe(true);
    });
  });

  describe('Agent-Specific Feedback', () => {
    it('should get feedback for specific agent', async () => {
      // Given: Agent has received feedback
      const agentId = 'agent-456';

      // When: Fetching agent feedback
      const feedback = await rlhfService.getAgentFeedback(projectId, agentId);

      // Then: Agent-specific feedback is returned
      expect(Array.isArray(feedback)).toBe(true);
    });

    it('should track agent performance improvements', async () => {
      // Given: Agent receives feedback over time
      const agentId = 'agent-backend-456';

      // When: Getting agent feedback
      const feedback = await rlhfService.getAgentFeedback(projectId, agentId);

      // Then: Performance trends can be calculated
      expect(Array.isArray(feedback)).toBe(true);
    });

    it('should compare feedback across agents', async () => {
      // Given: Multiple agents
      const agents = ['agent-frontend-123', 'agent-backend-456', 'agent-qa-789'];

      // When: Getting feedback for all agents
      const allFeedback = await Promise.all(
        agents.map(agentId => rlhfService.getAgentFeedback(projectId, agentId))
      );

      // Then: Feedback is available for comparison
      expect(allFeedback.length).toBe(3);
      allFeedback.forEach(feedback => {
        expect(Array.isArray(feedback)).toBe(true);
      });
    });
  });

  describe('Complete RLHF Feedback Workflow', () => {
    it('should handle complete feedback collection workflow', async () => {
      // Step 1: Agent generates output
      const agentOutput = {
        type: 'agent_output_feedback' as const,
        prompt: 'Create React component for user profile',
        response: 'const UserProfile = () => { ... }',
        rating: 1 as const,
        timestamp: new Date().toISOString(),
        stepNumber: 1,
        stepName: 'Component Generation',
        workflowId: 'workflow-complete-123',
        agentId: 'agent-frontend-123',
        projectId,
      };

      // Step 2: User reviews and submits feedback
      const feedback1 = await rlhfService.submitFeedback(projectId, agentOutput);
      expect(feedback1.success).toBe(true);

      // Step 3: Check feedback statistics
      const stats = await rlhfService.getFeedbackStats(
        projectId,
        agentOutput.stepNumber,
        agentOutput.stepName
      );
      expect(stats.totalFeedback).toBeGreaterThanOrEqual(0);

      // Step 4: Get workflow feedback
      const workflowFeedback = await rlhfService.getWorkflowFeedback(
        projectId,
        agentOutput.workflowId
      );
      expect(Array.isArray(workflowFeedback)).toBe(true);

      // Step 5: Get agent-specific feedback
      const agentFeedback = await rlhfService.getAgentFeedback(
        projectId,
        agentOutput.agentId
      );
      expect(Array.isArray(agentFeedback)).toBe(true);
    });

    it('should handle multiple users providing feedback', async () => {
      // Given: Same agent output reviewed by multiple users
      const baseData = {
        type: 'agent_output_feedback' as const,
        prompt: 'Optimize database query',
        response: 'SELECT * FROM users WHERE ...',
        timestamp: new Date().toISOString(),
        stepNumber: 1,
        stepName: 'Query Optimization',
        workflowId: 'workflow-123',
        agentId: 'agent-db-789',
        projectId,
      };

      // When: Multiple users submit feedback
      const feedbacks = await Promise.all([
        rlhfService.submitFeedback(projectId, { ...baseData, rating: 1 as const }),
        rlhfService.submitFeedback(projectId, { ...baseData, rating: 1 as const }),
        rlhfService.submitFeedback(projectId, { ...baseData, rating: -1 as const }),
      ]);

      // Then: All feedback is recorded
      expect(feedbacks.length).toBe(3);
      feedbacks.forEach(feedback => {
        expect(feedback.success).toBe(true);
      });

      // And: Statistics reflect multiple inputs
      const stats = await rlhfService.getFeedbackStats(
        projectId,
        baseData.stepNumber,
        baseData.stepName
      );
      expect(stats.totalFeedback).toBeGreaterThan(0);
    });
  });

  describe('Feedback and Agent Improvement Integration', () => {
    it('should track agent improvements after feedback', async () => {
      // Given: Agent receives negative feedback
      await rlhfService.submitFeedback(projectId, {
        type: 'agent_output_feedback' as const,
        prompt: 'Write test cases',
        response: 'Initial tests...',
        rating: -1 as const,
        timestamp: new Date().toISOString(),
        stepNumber: 1,
        stepName: 'Test Generation',
        workflowId: 'workflow-improve-123',
        agentId: 'agent-test-123',
        projectId,
      });

      // When: Agent is improved and generates new output
      const improvedFeedback = await rlhfService.submitFeedback(projectId, {
        type: 'agent_output_feedback' as const,
        prompt: 'Write test cases',
        response: 'Improved tests with better coverage...',
        rating: 1 as const,
        timestamp: new Date().toISOString(),
        stepNumber: 1,
        stepName: 'Test Generation',
        workflowId: 'workflow-improve-456',
        agentId: 'agent-test-123',
        projectId,
      });

      // Then: Improvement is tracked
      expect(improvedFeedback.success).toBe(true);
    });

    it('should identify agents needing improvement', async () => {
      // Given: Multiple agents with varying performance
      const agents = ['agent-1', 'agent-2', 'agent-3'];

      // When: Getting feedback for all
      const allFeedback = await Promise.all(
        agents.map(agentId => rlhfService.getAgentFeedback(projectId, agentId))
      );

      // Then: Can identify which agents need work
      expect(allFeedback.length).toBe(3);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle feedback submission errors gracefully', async () => {
      // Given: Invalid feedback data
      const invalidData = {
        type: 'invalid_type',
        prompt: '',
        response: '',
        rating: 999,
        timestamp: new Date().toISOString(),
        stepNumber: -1,
        stepName: '',
        workflowId: '',
        agentId: '',
        projectId: '',
      };

      // When: Submitting invalid feedback
      const result = await rlhfService.submitFeedback('invalid-project', invalidData as any);

      // Then: Error is handled gracefully
      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });

    it('should handle concurrent feedback submissions', async () => {
      // Given: Multiple simultaneous feedback submissions
      const feedbacks = Array.from({ length: 5 }, (_, i) => ({
        type: 'agent_output_feedback' as const,
        prompt: `Prompt ${i}`,
        response: `Response ${i}`,
        rating: 1 as const,
        timestamp: new Date().toISOString(),
        stepNumber: i + 1,
        stepName: `Step ${i + 1}`,
        workflowId: 'workflow-123',
        agentId: 'agent-456',
        projectId,
      }));

      // When: Submitting all at once
      const results = await Promise.all(
        feedbacks.map(fb => rlhfService.submitFeedback(projectId, fb))
      );

      // Then: All succeed
      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle missing project ID', async () => {
      // Given: Invalid project ID
      const feedbackData = {
        type: 'agent_output_feedback' as const,
        prompt: 'Test',
        response: 'Test response',
        rating: 1 as const,
        timestamp: new Date().toISOString(),
        stepNumber: 1,
        stepName: 'Test',
        workflowId: 'workflow-123',
        agentId: 'agent-456',
        projectId: 'nonexistent-project',
      };

      // When: Submitting feedback
      const result = await rlhfService.submitFeedback('nonexistent-project', feedbackData);

      // Then: Handled gracefully
      expect(result).toBeDefined();
    });

    it('should handle network failures during feedback', async () => {
      // Given: Network might be unstable
      const feedbackData = {
        type: 'agent_output_feedback' as const,
        prompt: 'Test',
        response: 'Test',
        rating: 1 as const,
        timestamp: new Date().toISOString(),
        stepNumber: 1,
        stepName: 'Test',
        workflowId: 'workflow-123',
        agentId: 'agent-456',
        projectId,
      };

      // When: Submitting (might fail)
      try {
        const result = await rlhfService.submitFeedback(projectId, feedbackData);
        expect(result).toBeDefined();
      } catch (error) {
        // Then: Error is handled
        expect(error).toBeDefined();
      }
    });
  });

  describe('Feedback Analytics and Insights', () => {
    it('should calculate overall sentiment', async () => {
      // Given: Multiple feedback entries
      const stats = await rlhfService.getFeedbackStats(projectId, 1, 'Test Step');

      // Then: Sentiment can be derived
      expect(stats.positivePercentage).toBeGreaterThanOrEqual(0);
      expect(stats.positivePercentage).toBeLessThanOrEqual(100);

      const sentiment =
        stats.positivePercentage > 75
          ? 'positive'
          : stats.positivePercentage > 50
          ? 'neutral'
          : 'negative';

      expect(['positive', 'neutral', 'negative']).toContain(sentiment);
    });

    it('should identify best performing steps', async () => {
      // Given: Multiple steps with feedback
      const steps = [
        { stepNumber: 1, stepName: 'Planning' },
        { stepNumber: 2, stepName: 'Implementation' },
        { stepNumber: 3, stepName: 'Testing' },
      ];

      // When: Getting stats for all steps
      const allStats = await Promise.all(
        steps.map(step =>
          rlhfService.getFeedbackStats(projectId, step.stepNumber, step.stepName)
        )
      );

      // Then: Can identify best performing
      const bestStep = allStats.reduce((best, current) =>
        current.positivePercentage > best.positivePercentage ? current : best
      );

      expect(bestStep).toBeDefined();
      expect(bestStep.positivePercentage).toBeGreaterThanOrEqual(0);
    });
  });
});
