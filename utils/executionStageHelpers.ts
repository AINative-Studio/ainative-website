/**
 * Execution Stage Helper Functions
 * Utilities for managing execution stages 7-11 in Agent Swarm Dashboard
 */

import type { ExecutionStagesState, StageStatus } from '@/types/executionStages';

/**
 * Map stage number to state key
 */
export function stageKeyFromNumber(stageNum: number): keyof ExecutionStagesState {
  const map: Record<number, keyof ExecutionStagesState> = {
    7: 'launchSwarm',
    8: 'createRepo',
    9: 'publishBacklog',
    10: 'featureDev',
    11: 'validation'
  };
  return map[stageNum];
}

/**
 * Map stage key to stage number
 */
export function stageNumberFromKey(key: keyof ExecutionStagesState): number {
  const map: Record<keyof ExecutionStagesState, number> = {
    launchSwarm: 7,
    createRepo: 8,
    publishBacklog: 9,
    featureDev: 10,
    validation: 11
  };
  return map[key];
}

/**
 * Get the visual status for a stage indicator
 * Maps stage data to UI presentation states
 */
export function getStageStatus(
  stageNumber: number,
  executionStages: ExecutionStagesState
): StageStatus {
  const stageKey = stageKeyFromNumber(stageNumber);
  return executionStages[stageKey]?.status || 'pending';
}

/**
 * Check if execution accordion should be visible
 */
export function shouldShowExecutionAccordion(projectStatus: string): boolean {
  return ['building', 'completed'].includes(projectStatus);
}

/**
 * Determine which execution stage should be expanded
 * Returns the accordion value for the current active stage
 */
export function getCurrentExecutionStageAccordion(
  executionStages: ExecutionStagesState
): string | undefined {
  const stages = Object.entries(executionStages);

  // Prioritize in_progress
  const inProgress = stages.find(([_, data]) => data.status === 'in_progress');
  if (inProgress) {
    return `stage-${stageNumberFromKey(inProgress[0] as keyof ExecutionStagesState)}`;
  }

  // Fallback to last completed + 1
  const lastCompleted = [...stages].reverse().find(([_, data]) => data.status === 'completed');
  if (lastCompleted) {
    const nextStage = stageNumberFromKey(lastCompleted[0] as keyof ExecutionStagesState) + 1;
    return nextStage <= 11 ? `stage-${nextStage}` : undefined;
  }

  return 'stage-7'; // Default to first stage
}

/**
 * Check if a stage is the currently active one
 */
export function isCurrentStage(
  stageNumber: number,
  executionStages: ExecutionStagesState
): boolean {
  const status = getStageStatus(stageNumber, executionStages);
  return status === 'in_progress';
}

/**
 * Get the total progress percentage across all execution stages
 */
export function getTotalExecutionProgress(executionStages: ExecutionStagesState): number {
  const stages = Object.values(executionStages);
  const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0);
  return Math.round(totalProgress / stages.length);
}

/**
 * Create initial execution stages state
 */
export function createInitialExecutionStages(): ExecutionStagesState {
  return {
    launchSwarm: { status: 'pending', progress: 0, data: null },
    createRepo: { status: 'pending', progress: 0, data: null },
    publishBacklog: { status: 'pending', progress: 0, data: null },
    featureDev: { status: 'pending', progress: 0, data: null },
    validation: { status: 'pending', progress: 0, data: null }
  };
}

/**
 * Get progress visualization data
 */
export function getProgressVisualization(executionStages: ExecutionStagesState) {
  const stages = [
    { key: 'launchSwarm', number: 7, label: 'Launch Swarm' },
    { key: 'createRepo', number: 8, label: 'Create Repository' },
    { key: 'publishBacklog', number: 9, label: 'Publish Backlog' },
    { key: 'featureDev', number: 10, label: 'Feature Development' },
    { key: 'validation', number: 11, label: 'Validation' },
  ] as const;

  return stages.map((stage) => {
    const stageData = executionStages[stage.key as keyof ExecutionStagesState];
    return {
      number: stage.number,
      label: stage.label,
      status: stageData.status,
      progress: stageData.progress,
      isActive: stageData.status === 'in_progress',
      isCompleted: stageData.status === 'completed',
      isFailed: stageData.status === 'failed',
    };
  });
}

/**
 * Calculate overall execution progress percentage
 */
export function calculateOverallProgress(executionStages: ExecutionStagesState): number {
  const stages = Object.values(executionStages);
  const completedStages = stages.filter((s) => s.status === 'completed').length;
  const totalStages = stages.length;

  const inProgressStage = stages.find((s) => s.status === 'in_progress');
  const partialProgress = inProgressStage ? inProgressStage.progress / 100 : 0;

  return Math.round(((completedStages + partialProgress) / totalStages) * 100);
}

/**
 * Get stage status icon
 */
export function getStageStatusIcon(status: StageStatus): string {
  const icons: Record<StageStatus, string> = {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    failed: '❌',
  };
  return icons[status];
}

/**
 * Get stage status color
 */
export function getStageStatusColor(status: StageStatus): string {
  const colors: Record<StageStatus, string> = {
    pending: 'gray',
    in_progress: 'blue',
    completed: 'green',
    failed: 'red',
  };
  return colors[status];
}

/**
 * Format stage duration for display
 */
export function formatStageDuration(durationMs?: number): string {
  if (!durationMs) return 'N/A';

  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}
