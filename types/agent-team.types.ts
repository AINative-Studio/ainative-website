/**
 * Type definitions for Agent Team components
 *
 * These types define the data structures for the Agent Team Overview
 * and Agent Detail Modal components.
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Agent status values with clear semantics:
 * - working: Agent is actively processing a task (green pulse animation)
 * - idle: Agent is available but not currently active (gray)
 * - blocked: Agent is waiting on dependencies or external input (yellow)
 * - completed: Agent has finished all assigned tasks (blue)
 * - error: Agent encountered an error and needs attention (red)
 */
export type AgentStatus = 'working' | 'idle' | 'blocked' | 'completed' | 'error';

/**
 * Base agent role configuration - static data about agent capabilities
 */
export interface AgentRole {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    specialization: string;
    description: string;
    capabilities: string[];
}

/**
 * Runtime data for an agent - dynamic data about current state
 */
export interface AgentRuntimeData {
    status: AgentStatus;
    currentTask: string | null;
    completedTasks: number;
    totalTasks: number;
    progress: number;
    lastActive: Date;
}

/**
 * Completed task record for task history
 */
export interface CompletedTask {
    id: string;
    name: string;
    completedAt: Date;
    durationMinutes: number;
    pullRequestUrl?: string;
    filesModified: number;
    linesOfCode: number;
}

/**
 * File modification record for current activity
 */
export interface FileModification {
    path: string;
    type: 'create' | 'modify' | 'delete';
    timestamp: Date;
}

/**
 * Performance metrics for an agent
 */
export interface AgentPerformanceMetrics {
    averageTaskTimeMinutes: number;
    successRate: number;
    totalLinesOfCode: number;
    totalFilesModified: number;
    totalPullRequestsCreated: number;
    tasksCompletedToday: number;
    tasksCompletedThisWeek: number;
}

/**
 * Current activity details for an agent
 */
export interface AgentCurrentActivity {
    issueNumber: number | null;
    issueTitle: string | null;
    issueUrl: string | null;
    filesBeingModified: FileModification[];
    timeOnTaskMinutes: number;
    estimatedRemainingMinutes: number | null;
}

/**
 * Complete agent data including role, runtime, and detailed information
 */
export interface AgentTeamMember {
    role: AgentRole;
    runtime: AgentRuntimeData;
    activity: AgentCurrentActivity;
    taskHistory: CompletedTask[];
    performance: AgentPerformanceMetrics;
}

/**
 * Props for the AgentTeamOverview component
 */
export interface AgentTeamOverviewProps {
    projectId: string;
    agents: AgentTeamMember[];
    onAgentClick: (agent: AgentTeamMember) => void;
    className?: string;
    isLoading?: boolean;
}

/**
 * Props for the AgentStatusIndicator component
 */
export interface AgentStatusIndicatorProps {
    status: AgentStatus;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    animate?: boolean;
}

/**
 * Props for the AgentDetailModal component
 */
export interface AgentDetailModalProps {
    agent: AgentTeamMember | null;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Props for individual AgentCard component
 */
export interface AgentCardProps {
    agent: AgentTeamMember;
    onClick: () => void;
    className?: string;
}

/**
 * Status configuration for visual styling
 */
export interface StatusConfig {
    bgColor: string;
    pulseColor: string;
    textColor: string;
    borderColor: string;
    label: string;
}

/**
 * Map of status to configuration
 */
export const STATUS_CONFIGS: Record<AgentStatus, StatusConfig> = {
    working: {
        bgColor: 'bg-green-500',
        pulseColor: 'bg-green-400',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/40',
        label: 'Working',
    },
    idle: {
        bgColor: 'bg-gray-500',
        pulseColor: 'bg-gray-400',
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500/40',
        label: 'Idle',
    },
    blocked: {
        bgColor: 'bg-yellow-500',
        pulseColor: 'bg-yellow-400',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500/40',
        label: 'Blocked',
    },
    completed: {
        bgColor: 'bg-blue-500',
        pulseColor: 'bg-blue-400',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/40',
        label: 'Completed',
    },
    error: {
        bgColor: 'bg-red-500',
        pulseColor: 'bg-red-400',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/40',
        label: 'Error',
    },
};
