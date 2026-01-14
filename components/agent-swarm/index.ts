/**
 * Agent Swarm Components
 *
 * This module exports all Agent Swarm UI components for the dashboard.
 */

export { AgentStatusIndicator } from './AgentStatusIndicator';
export { AgentCard } from './AgentCard';
export { AgentTeamOverview } from './AgentTeamOverview';
export { AgentDetailModal } from './AgentDetailModal';
export { default as AgentSwarmTerminal } from './AgentSwarmTerminal';
export { default as ExecutionTimer } from './ExecutionTimer';
export { AgentSwarmRulesUpload } from './AgentSwarmRulesUpload';
export { SwarmLaunchConfirmation } from './SwarmLaunchConfirmation';
export { default as DataModelReview } from './DataModelReview';
export { default as SprintPlanReview } from './SprintPlanReview';
export { default as BacklogReview } from './BacklogReview';
export { default as TimeComparisonCard } from './TimeComparisonCard';
export { StageIndicator } from './StageIndicator';
export { default as CompletionStatistics } from './CompletionStatistics';
export { default as TDDProgressDisplay } from './TDDProgressDisplay';

// Re-export types for convenience
export type {
    AgentStatus,
    AgentRole,
    AgentRuntimeData,
    AgentTeamMember,
    AgentTeamOverviewProps,
    AgentDetailModalProps,
    AgentCardProps,
    AgentStatusIndicatorProps,
    CompletedTask,
    FileModification,
    AgentCurrentActivity,
    AgentPerformanceMetrics,
} from '@/types/agent-team.types';

export { STATUS_CONFIGS } from '@/types/agent-team.types';

// Re-export SwarmLaunchConfirmation types
export type {
    ProjectSummary,
    AgentInfo,
    BacklogSummary,
    RulesConfig,
    SwarmLaunchConfirmationProps,
} from './SwarmLaunchConfirmation';

// Re-export SprintPlanReview types
export type {
    SprintIssue,
    Sprint,
    SprintPlanDraft,
    SprintPlanReviewProps,
} from './SprintPlanReview';

// Re-export BacklogReview types
export type {
    BacklogIssue,
    Epic,
    PRDRequirement,
} from './BacklogReview';

// Re-export StageIndicator types
export type {
    StageStatus,
    StageIndicatorProps,
} from './StageIndicator';

// Re-export CompletionStatistics types
export type {
    CompletionStats,
    CompletionStatisticsProps,
} from './CompletionStatistics';

// Re-export TDDProgressDisplay types
export type {
    Feature,
    TDDProgressDisplayProps,
} from './TDDProgressDisplay';
