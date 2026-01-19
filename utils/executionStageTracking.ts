/**
 * Execution Stage Tracking Module
 * Implements trackStage() and transitionStage() for Issue #362
 */

import type {
  ExecutionStage,
  StageTransition,
  StageEvent,
  StageMetrics,
} from '@/types/executionStages';

// Stage tracking state
interface StageTracker {
  currentStage: ExecutionStage | null;
  stageHistory: StageTransition[];
  stageEvents: StageEvent[];
  stageMetrics: Map<ExecutionStage, StageMetrics>;
}

const stageTracker: StageTracker = {
  currentStage: null,
  stageHistory: [],
  stageEvents: [],
  stageMetrics: new Map(),
};

/**
 * Track stage progress and emit events
 */
export function trackStage(
  stage: ExecutionStage,
  progress: number,
  message?: string,
  data?: unknown
): StageEvent {
  const event: StageEvent = {
    stage,
    eventType: 'progress',
    timestamp: new Date().toISOString(),
    progress,
    message,
    data,
  };

  stageTracker.stageEvents.push(event);

  const metrics = stageTracker.stageMetrics.get(stage) || {
    stage,
    startTime: new Date().toISOString(),
    errorCount: 0,
  };

  stageTracker.stageMetrics.set(stage, metrics);
  emitStageEvent(event);

  return event;
}

/**
 * Transition from one stage to another with validation
 */
export function transitionStage(
  from: ExecutionStage,
  to: ExecutionStage,
  triggeredBy?: string,
  metadata?: Record<string, unknown>
): StageTransition | Error {
  const validationError = validateStageTransition(from, to);
  if (validationError) {
    return validationError;
  }

  const transition: StageTransition = {
    fromStage: from,
    toStage: to,
    timestamp: new Date().toISOString(),
    triggeredBy,
    metadata,
  };

  stageTracker.currentStage = to;
  stageTracker.stageHistory.push(transition);

  const fromMetrics = stageTracker.stageMetrics.get(from);
  if (fromMetrics && !fromMetrics.endTime) {
    fromMetrics.endTime = new Date().toISOString();
    if (fromMetrics.startTime) {
      fromMetrics.duration =
        new Date(fromMetrics.endTime).getTime() -
        new Date(fromMetrics.startTime).getTime();
    }
  }

  if (!stageTracker.stageMetrics.has(to)) {
    stageTracker.stageMetrics.set(to, {
      stage: to,
      startTime: new Date().toISOString(),
      errorCount: 0,
    });
  }

  emitStageEvent({
    stage: from,
    eventType: 'completed',
    timestamp: transition.timestamp,
    progress: 100,
  });

  emitStageEvent({
    stage: to,
    eventType: 'started',
    timestamp: transition.timestamp,
    progress: 0,
  });

  return transition;
}

function validateStageTransition(
  from: ExecutionStage,
  to: ExecutionStage
): Error | null {
  if (to < from && to !== 1) {
    return new Error(
      `Invalid transition: Cannot go backwards from stage ${from} to ${to} unless returning to PLANNING`
    );
  }

  if (to > from + 1 && from !== 1 && to !== 1) {
    return new Error(
      `Invalid transition: Cannot skip from stage ${from} to ${to}. Must progress sequentially.`
    );
  }

  if (from === to) {
    return new Error(`Invalid transition: Already in stage ${to}`);
  }

  return null;
}

function emitStageEvent(event: StageEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Stage Event]', event);
  }
}

export function getCurrentStage(): ExecutionStage | null {
  return stageTracker.currentStage;
}

export function getStageHistory(): StageTransition[] {
  return [...stageTracker.stageHistory];
}

export function getStageEvents(stage?: ExecutionStage): StageEvent[] {
  if (stage) {
    return stageTracker.stageEvents.filter((e) => e.stage === stage);
  }
  return [...stageTracker.stageEvents];
}

export function getStageMetrics(stage: ExecutionStage): StageMetrics | undefined {
  return stageTracker.stageMetrics.get(stage);
}

export function getAllStageMetrics(): Map<ExecutionStage, StageMetrics> {
  return new Map(stageTracker.stageMetrics);
}

export function resetStageTracker(): void {
  stageTracker.currentStage = null;
  stageTracker.stageHistory = [];
  stageTracker.stageEvents = [];
  stageTracker.stageMetrics.clear();
}

export function failStage(
  stage: ExecutionStage,
  error: string,
  errorData?: unknown
): StageEvent {
  const event: StageEvent = {
    stage,
    eventType: 'failed',
    timestamp: new Date().toISOString(),
    progress: 0,
    message: error,
    data: errorData,
  };

  stageTracker.stageEvents.push(event);

  const metrics = stageTracker.stageMetrics.get(stage);
  if (metrics) {
    metrics.errorCount = (metrics.errorCount || 0) + 1;
    metrics.endTime = new Date().toISOString();
    if (metrics.startTime) {
      metrics.duration =
        new Date(metrics.endTime).getTime() -
        new Date(metrics.startTime).getTime();
    }
  }

  emitStageEvent(event);

  return event;
}
