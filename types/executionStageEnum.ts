/**
 * Execution Stage Enum and Supporting Types
 * For Issue #362 - Agent Swarm Execution Stages (7-11)
 */

export enum ExecutionStage {
  PLANNING = 1,
  REQUIREMENTS_ANALYSIS = 2,
  ARCHITECTURE_DESIGN = 3,
  TASK_DECOMPOSITION = 4,
  TEAM_FORMATION = 5,
  RESOURCE_ALLOCATION = 6,
  AGENT_DEPLOYMENT = 7,
  PARALLEL_EXECUTION = 8,
  RESULT_AGGREGATION = 9,
  VALIDATION = 10,
  COMPLETION = 11,
}

export const EXECUTION_STAGE_NAMES: Record<ExecutionStage, string> = {
  [ExecutionStage.PLANNING]: 'Planning',
  [ExecutionStage.REQUIREMENTS_ANALYSIS]: 'Requirements Analysis',
  [ExecutionStage.ARCHITECTURE_DESIGN]: 'Architecture Design',
  [ExecutionStage.TASK_DECOMPOSITION]: 'Task Decomposition',
  [ExecutionStage.TEAM_FORMATION]: 'Team Formation',
  [ExecutionStage.RESOURCE_ALLOCATION]: 'Resource Allocation',
  [ExecutionStage.AGENT_DEPLOYMENT]: 'Agent Deployment',
  [ExecutionStage.PARALLEL_EXECUTION]: 'Parallel Execution',
  [ExecutionStage.RESULT_AGGREGATION]: 'Result Aggregation',
  [ExecutionStage.VALIDATION]: 'Validation',
  [ExecutionStage.COMPLETION]: 'Completion',
};

export interface StageTransition {
  fromStage: ExecutionStage;
  toStage: ExecutionStage;
  timestamp: string;
  triggeredBy?: string;
  metadata?: Record<string, unknown>;
}

export interface StageEvent {
  stage: ExecutionStage;
  eventType: 'started' | 'progress' | 'completed' | 'failed' | 'paused' | 'resumed';
  timestamp: string;
  progress: number;
  message?: string;
  data?: unknown;
}

export interface StageMetrics {
  stage: ExecutionStage;
  startTime?: string;
  endTime?: string;
  duration?: number;
  resourcesUsed?: {
    cpu?: number;
    memory?: number;
    apiCalls?: number;
  };
  successRate?: number;
  errorCount?: number;
}
