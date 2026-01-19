/**
 * Tests for Execution Stage Helper Functions
 */

import {
  trackStage,
  transitionStage,
  getCurrentStage,
  getStageHistory,
  getStageEvents,
  getStageMetrics,
  getAllStageMetrics,
  resetStageTracker,
  failStage,
} from '../executionStageTracking';

import {
  getProgressVisualization,
  calculateOverallProgress,
  getStageStatusIcon,
  getStageStatusColor,
  formatStageDuration,
  createInitialExecutionStages,
  getTotalExecutionProgress,
  stageKeyFromNumber,
  stageNumberFromKey,
  getStageStatus,
  getCurrentExecutionStageAccordion,
  isCurrentStage,
} from '../executionStageHelpers';

import { ExecutionStage } from '@/types/executionStages';
import type { ExecutionStagesState } from '@/types/executionStages';

describe('executionStageHelpers', () => {
  beforeEach(() => {
    resetStageTracker();
  });

  describe('createInitialExecutionStages', () => {
    it('should create initial execution stages state', () => {
      const stages = createInitialExecutionStages();

      expect(stages).toEqual({
        launchSwarm: { status: 'pending', progress: 0, data: null },
        createRepo: { status: 'pending', progress: 0, data: null },
        publishBacklog: { status: 'pending', progress: 0, data: null },
        featureDev: { status: 'pending', progress: 0, data: null },
        validation: { status: 'pending', progress: 0, data: null },
      });
    });

    it('should have all stages with pending status', () => {
      const stages = createInitialExecutionStages();
      const allStages = Object.values(stages);

      expect(allStages.every(s => s.status === 'pending')).toBe(true);
    });

    it('should have all stages with zero progress', () => {
      const stages = createInitialExecutionStages();
      const allStages = Object.values(stages);

      expect(allStages.every(s => s.progress === 0)).toBe(true);
    });
  });

  describe('stageKeyFromNumber', () => {
    it('should map stage 7 to launchSwarm', () => {
      expect(stageKeyFromNumber(7)).toBe('launchSwarm');
    });

    it('should map stage 8 to createRepo', () => {
      expect(stageKeyFromNumber(8)).toBe('createRepo');
    });

    it('should map stage 9 to publishBacklog', () => {
      expect(stageKeyFromNumber(9)).toBe('publishBacklog');
    });

    it('should map stage 10 to featureDev', () => {
      expect(stageKeyFromNumber(10)).toBe('featureDev');
    });

    it('should map stage 11 to validation', () => {
      expect(stageKeyFromNumber(11)).toBe('validation');
    });
  });

  describe('stageNumberFromKey', () => {
    it('should map launchSwarm to 7', () => {
      expect(stageNumberFromKey('launchSwarm')).toBe(7);
    });

    it('should map createRepo to 8', () => {
      expect(stageNumberFromKey('createRepo')).toBe(8);
    });

    it('should map publishBacklog to 9', () => {
      expect(stageNumberFromKey('publishBacklog')).toBe(9);
    });

    it('should map featureDev to 10', () => {
      expect(stageNumberFromKey('featureDev')).toBe(10);
    });

    it('should map validation to 11', () => {
      expect(stageNumberFromKey('validation')).toBe(11);
    });
  });

  describe('trackStage', () => {
    it('should track stage progress', () => {
      const event = trackStage(ExecutionStage.AGENT_DEPLOYMENT, 50, 'Deploying agents');

      expect(event.stage).toBe(ExecutionStage.AGENT_DEPLOYMENT);
      expect(event.eventType).toBe('progress');
      expect(event.progress).toBe(50);
      expect(event.message).toBe('Deploying agents');
    });

    it('should store events in stage tracker', () => {
      trackStage(ExecutionStage.AGENT_DEPLOYMENT, 25);
      trackStage(ExecutionStage.AGENT_DEPLOYMENT, 50);

      const events = getStageEvents(ExecutionStage.AGENT_DEPLOYMENT);
      expect(events).toHaveLength(2);
      expect(events[0].progress).toBe(25);
      expect(events[1].progress).toBe(50);
    });

    it('should create metrics for tracked stage', () => {
      trackStage(ExecutionStage.PARALLEL_EXECUTION, 30);

      const metrics = getStageMetrics(ExecutionStage.PARALLEL_EXECUTION);
      expect(metrics).toBeDefined();
      expect(metrics?.stage).toBe(ExecutionStage.PARALLEL_EXECUTION);
      expect(metrics?.startTime).toBeDefined();
    });

    it('should include custom data in event', () => {
      const customData = { agentId: 'agent-123', taskId: 'task-456' };
      const event = trackStage(ExecutionStage.AGENT_DEPLOYMENT, 75, 'Processing', customData);

      expect(event.data).toEqual(customData);
    });
  });

  describe('transitionStage', () => {
    it('should transition from one stage to next', () => {
      const transition = transitionStage(
        ExecutionStage.AGENT_DEPLOYMENT,
        ExecutionStage.PARALLEL_EXECUTION
      );

      expect(transition).not.toBeInstanceOf(Error);
      if (!(transition instanceof Error)) {
        expect(transition.fromStage).toBe(ExecutionStage.AGENT_DEPLOYMENT);
        expect(transition.toStage).toBe(ExecutionStage.PARALLEL_EXECUTION);
      }
    });

    it('should update current stage', () => {
      transitionStage(ExecutionStage.AGENT_DEPLOYMENT, ExecutionStage.PARALLEL_EXECUTION);

      expect(getCurrentStage()).toBe(ExecutionStage.PARALLEL_EXECUTION);
    });

    it('should record transition in history', () => {
      transitionStage(ExecutionStage.AGENT_DEPLOYMENT, ExecutionStage.PARALLEL_EXECUTION);

      const history = getStageHistory();
      expect(history).toHaveLength(1);
      expect(history[0].fromStage).toBe(ExecutionStage.AGENT_DEPLOYMENT);
      expect(history[0].toStage).toBe(ExecutionStage.PARALLEL_EXECUTION);
    });

    it('should emit completed and started events', () => {
      transitionStage(ExecutionStage.AGENT_DEPLOYMENT, ExecutionStage.PARALLEL_EXECUTION);

      const events = getStageEvents();
      const completedEvent = events.find(e => e.eventType === 'completed');
      const startedEvent = events.find(e => e.eventType === 'started');

      expect(completedEvent).toBeDefined();
      expect(completedEvent?.stage).toBe(ExecutionStage.AGENT_DEPLOYMENT);

      expect(startedEvent).toBeDefined();
      expect(startedEvent?.stage).toBe(ExecutionStage.PARALLEL_EXECUTION);
    });

    it('should prevent backward transitions (except to PLANNING)', () => {
      const result = transitionStage(
        ExecutionStage.PARALLEL_EXECUTION,
        ExecutionStage.AGENT_DEPLOYMENT
      );

      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toContain('Cannot go backwards');
      }
    });

    it('should allow transition back to PLANNING', () => {
      const result = transitionStage(ExecutionStage.PARALLEL_EXECUTION, ExecutionStage.PLANNING);

      expect(result).not.toBeInstanceOf(Error);
    });

    it('should prevent skipping stages', () => {
      const result = transitionStage(
        ExecutionStage.AGENT_DEPLOYMENT,
        ExecutionStage.VALIDATION
      );

      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toContain('Cannot skip');
      }
    });

    it('should prevent transition to same stage', () => {
      const result = transitionStage(
        ExecutionStage.AGENT_DEPLOYMENT,
        ExecutionStage.AGENT_DEPLOYMENT
      );

      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toContain('Already in stage');
      }
    });

    it('should include triggeredBy metadata', () => {
      const transition = transitionStage(
        ExecutionStage.AGENT_DEPLOYMENT,
        ExecutionStage.PARALLEL_EXECUTION,
        'orchestrator-service'
      );

      expect(transition).not.toBeInstanceOf(Error);
      if (!(transition instanceof Error)) {
        expect(transition.triggeredBy).toBe('orchestrator-service');
      }
    });
  });

  describe('failStage', () => {
    it('should mark stage as failed', () => {
      const event = failStage(ExecutionStage.PARALLEL_EXECUTION, 'Connection timeout');

      expect(event.eventType).toBe('failed');
      expect(event.message).toBe('Connection timeout');
      expect(event.stage).toBe(ExecutionStage.PARALLEL_EXECUTION);
    });

    it('should increment error count in metrics', () => {
      trackStage(ExecutionStage.PARALLEL_EXECUTION, 50);
      failStage(ExecutionStage.PARALLEL_EXECUTION, 'Error 1');
      failStage(ExecutionStage.PARALLEL_EXECUTION, 'Error 2');

      const metrics = getStageMetrics(ExecutionStage.PARALLEL_EXECUTION);
      expect(metrics?.errorCount).toBe(2);
    });

    it('should include error data', () => {
      const errorData = { code: 'ERR_TIMEOUT', details: 'Agent unresponsive' };
      const event = failStage(ExecutionStage.AGENT_DEPLOYMENT, 'Timeout', errorData);

      expect(event.data).toEqual(errorData);
    });
  });

  describe('getProgressVisualization', () => {
    it('should return visualization data for all stages', () => {
      const stages = createInitialExecutionStages();
      const viz = getProgressVisualization(stages);

      expect(viz).toHaveLength(5);
      expect(viz[0].number).toBe(7);
      expect(viz[0].label).toBe('Launch Swarm');
    });

    it('should mark in-progress stage as active', () => {
      const stages = createInitialExecutionStages();
      stages.featureDev.status = 'in_progress';

      const viz = getProgressVisualization(stages);
      const featureDevViz = viz.find(v => v.number === 10);

      expect(featureDevViz?.isActive).toBe(true);
    });

    it('should mark completed stages', () => {
      const stages = createInitialExecutionStages();
      stages.launchSwarm.status = 'completed';

      const viz = getProgressVisualization(stages);
      const launchSwarmViz = viz.find(v => v.number === 7);

      expect(launchSwarmViz?.isCompleted).toBe(true);
    });

    it('should mark failed stages', () => {
      const stages = createInitialExecutionStages();
      stages.createRepo.status = 'failed';

      const viz = getProgressVisualization(stages);
      const createRepoViz = viz.find(v => v.number === 8);

      expect(createRepoViz?.isFailed).toBe(true);
    });
  });

  describe('calculateOverallProgress', () => {
    it('should return 0 for all pending stages', () => {
      const stages = createInitialExecutionStages();
      expect(calculateOverallProgress(stages)).toBe(0);
    });

    it('should return 100 for all completed stages', () => {
      const stages = createInitialExecutionStages();
      Object.keys(stages).forEach(key => {
        stages[key as keyof ExecutionStagesState].status = 'completed';
      });

      expect(calculateOverallProgress(stages)).toBe(100);
    });

    it('should calculate partial progress', () => {
      const stages = createInitialExecutionStages();
      stages.launchSwarm.status = 'completed';
      stages.createRepo.status = 'completed';

      const progress = calculateOverallProgress(stages);
      expect(progress).toBe(40); // 2 out of 5 = 40%
    });

    it('should include in-progress stage partial progress', () => {
      const stages = createInitialExecutionStages();
      stages.launchSwarm.status = 'completed';
      stages.createRepo.status = 'in_progress';
      stages.createRepo.progress = 50;

      const progress = calculateOverallProgress(stages);
      expect(progress).toBe(30); // (1 + 0.5) / 5 = 30%
    });
  });

  describe('getStageStatusIcon', () => {
    it('should return correct icon for pending', () => {
      expect(getStageStatusIcon('pending')).toBe('⏳');
    });

    it('should return correct icon for in_progress', () => {
      expect(getStageStatusIcon('in_progress')).toBe('🔄');
    });

    it('should return correct icon for completed', () => {
      expect(getStageStatusIcon('completed')).toBe('✅');
    });

    it('should return correct icon for failed', () => {
      expect(getStageStatusIcon('failed')).toBe('❌');
    });
  });

  describe('getStageStatusColor', () => {
    it('should return correct color for pending', () => {
      expect(getStageStatusColor('pending')).toBe('gray');
    });

    it('should return correct color for in_progress', () => {
      expect(getStageStatusColor('in_progress')).toBe('blue');
    });

    it('should return correct color for completed', () => {
      expect(getStageStatusColor('completed')).toBe('green');
    });

    it('should return correct color for failed', () => {
      expect(getStageStatusColor('failed')).toBe('red');
    });
  });

  describe('formatStageDuration', () => {
    it('should return N/A for undefined', () => {
      expect(formatStageDuration()).toBe('N/A');
    });

    it('should format seconds', () => {
      expect(formatStageDuration(5000)).toBe('5s');
    });

    it('should format minutes and seconds', () => {
      expect(formatStageDuration(125000)).toBe('2m 5s');
    });

    it('should format hours and minutes', () => {
      expect(formatStageDuration(3665000)).toBe('1h 1m');
    });

    it('should handle zero duration', () => {
      expect(formatStageDuration(0)).toBe('0s');
    });
  });

  describe('getStageStatus', () => {
    it('should return status from execution stages', () => {
      const stages = createInitialExecutionStages();
      stages.launchSwarm.status = 'in_progress';

      expect(getStageStatus(7, stages)).toBe('in_progress');
    });

    it('should return pending for non-existent stage', () => {
      const stages = createInitialExecutionStages();

      expect(getStageStatus(99, stages)).toBe('pending');
    });
  });

  describe('getCurrentExecutionStageAccordion', () => {
    it('should return in-progress stage', () => {
      const stages = createInitialExecutionStages();
      stages.publishBacklog.status = 'in_progress';

      expect(getCurrentExecutionStageAccordion(stages)).toBe('stage-9');
    });

    it('should return next stage after last completed', () => {
      const stages = createInitialExecutionStages();
      stages.launchSwarm.status = 'completed';

      expect(getCurrentExecutionStageAccordion(stages)).toBe('stage-8');
    });

    it('should return first stage by default', () => {
      const stages = createInitialExecutionStages();

      expect(getCurrentExecutionStageAccordion(stages)).toBe('stage-7');
    });
  });

  describe('isCurrentStage', () => {
    it('should return true for in-progress stage', () => {
      const stages = createInitialExecutionStages();
      stages.featureDev.status = 'in_progress';

      expect(isCurrentStage(10, stages)).toBe(true);
    });

    it('should return false for non-current stage', () => {
      const stages = createInitialExecutionStages();
      stages.featureDev.status = 'in_progress';

      expect(isCurrentStage(7, stages)).toBe(false);
    });
  });

  describe('getTotalExecutionProgress', () => {
    it('should calculate average progress across all stages', () => {
      const stages = createInitialExecutionStages();
      stages.launchSwarm.progress = 100;
      stages.createRepo.progress = 100;
      stages.publishBacklog.progress = 50;
      stages.featureDev.progress = 0;
      stages.validation.progress = 0;

      const total = getTotalExecutionProgress(stages);
      expect(total).toBe(50); // (100 + 100 + 50 + 0 + 0) / 5 = 50
    });
  });

  describe('resetStageTracker', () => {
    it('should clear all tracking data', () => {
      trackStage(ExecutionStage.AGENT_DEPLOYMENT, 50);
      transitionStage(ExecutionStage.AGENT_DEPLOYMENT, ExecutionStage.PARALLEL_EXECUTION);

      resetStageTracker();

      expect(getCurrentStage()).toBeNull();
      expect(getStageHistory()).toHaveLength(0);
      expect(getStageEvents()).toHaveLength(0);
      expect(getAllStageMetrics().size).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should track complete workflow', () => {
      // Stage 7: Start agent deployment
      trackStage(ExecutionStage.AGENT_DEPLOYMENT, 0, 'Starting deployment');
      trackStage(ExecutionStage.AGENT_DEPLOYMENT, 50, 'Deploying agents');
      trackStage(ExecutionStage.AGENT_DEPLOYMENT, 100, 'Deployment complete');

      // Transition to stage 8
      transitionStage(ExecutionStage.AGENT_DEPLOYMENT, ExecutionStage.PARALLEL_EXECUTION);

      // Stage 8: Parallel execution
      trackStage(ExecutionStage.PARALLEL_EXECUTION, 25, 'Processing tasks');

      expect(getCurrentStage()).toBe(ExecutionStage.PARALLEL_EXECUTION);
      expect(getStageEvents(ExecutionStage.AGENT_DEPLOYMENT)).toHaveLength(4); // 3 progress + 1 completed
      expect(getStageEvents(ExecutionStage.PARALLEL_EXECUTION)).toHaveLength(2); // 1 started + 1 progress
    });

    it('should handle failure and recovery', () => {
      trackStage(ExecutionStage.PARALLEL_EXECUTION, 50);
      failStage(ExecutionStage.PARALLEL_EXECUTION, 'Task failed');

      // Retry by going back to planning
      const transition = transitionStage(ExecutionStage.PARALLEL_EXECUTION, ExecutionStage.PLANNING);

      expect(transition).not.toBeInstanceOf(Error);

      const metrics = getStageMetrics(ExecutionStage.PARALLEL_EXECUTION);
      expect(metrics?.errorCount).toBeGreaterThan(0);
    });
  });
});
