/**
 * Execution Stages Types (Stages 7-11)
 * Used for tracking agent swarm execution progress
 */

// Re-export new execution stage enum and types
export {
  ExecutionStage,
  EXECUTION_STAGE_NAMES,
  type StageTransition,
  type StageEvent,
  type StageMetrics,
} from './executionStageEnum';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface ExecutionStageData {
  status: StageStatus;
  progress: number; // 0-100
  data: unknown; // Stage-specific data
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface ExecutionStagesState {
  launchSwarm: ExecutionStageData;
  createRepo: ExecutionStageData;
  publishBacklog: ExecutionStageData;
  featureDev: ExecutionStageData;
  validation: ExecutionStageData;
}

// Stage 7: Launch Swarm
export interface LaunchSwarmData {
  agents: Array<{
    name: string;
    role: string;
    status: 'initializing' | 'ready' | 'failed';
    startedAt: string;
  }>;
  swarmId: string;
  orchestratorStatus: 'starting' | 'running' | 'failed';
}

// Stage 8: Create GitHub Repository
export interface CreateRepoData {
  repoUrl: string;
  repoName: string;
  defaultBranch: string;
  visibility: 'public' | 'private';
  createdAt: string;
  branchesInitialized: string[];
}

// Stage 9: Publish Backlog as Issues
export interface PublishBacklogData {
  totalIssues: number;
  createdIssues: number;
  issues: Array<{
    id: string;
    number: number;
    title: string;
    url: string;
    epic: string;
  }>;
}

// Stage 10: Feature Development
export interface FeatureDevelopmentData {
  currentPhase: 'red' | 'green' | 'refactor';
  epics: Array<{
    id: string;
    title: string;
    progress: number;
    status: 'pending' | 'in_progress' | 'completed';
    testsWritten: number;
    testsPassing: number;
  }>;
  agentActivities: Array<{
    agentName: string;
    activity: string;
    timestamp: string;
  }>;
}

// Stage 11: Validation & Completion
export interface ValidationData {
  testResults: {
    total: number;
    passed: number;
    failed: number;
    coverage: number;
  };
  codeQuality: {
    lintErrors: number;
    lintWarnings: number;
    codeSmells: number;
    technicalDebt: string;
  };
  deploymentStatus: 'pending' | 'deploying' | 'deployed' | 'failed';
  completionStats: {
    totalFeatures: number;
    completedFeatures: number;
    totalTime: string;
    linesOfCode: number;
  };
}

export interface WebSocketMessage {
  type: 'stage_started' | 'stage_progress' | 'stage_completed' | 'stage_failed';
  stage: number;
  status?: StageStatus;
  progress?: number;
  data?: unknown;
  error?: string;
}
