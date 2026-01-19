'use client';

/**
 * AgentTeamOverview Component
 *
 * Displays all 6 agents in a responsive grid layout showing:
 * - Agent name and role
 * - Avatar/icon for agent type
 * - Current status (Working, Idle, Blocked, Completed, Error)
 * - Current task summary (1-line)
 * - Progress indicator for current task
 */

import { motion } from 'framer-motion';
import { Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentCard } from './AgentCard';
import type { AgentTeamOverviewProps, AgentStatus } from '@/types/agent-team.types';
import { STATUS_CONFIGS } from '@/types/agent-team.types';

/**
 * Animation variants for staggered grid entry
 */
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut' as const,
        },
    },
};

/**
 * Calculate summary statistics for the team
 */
function getTeamStats(agents: AgentTeamOverviewProps['agents']) {
    const statusCounts: Record<AgentStatus, number> = {
        working: 0,
        idle: 0,
        blocked: 0,
        completed: 0,
        error: 0,
    };

    agents.forEach((agent) => {
        statusCounts[agent.runtime.status]++;
    });

    const totalProgress = agents.reduce(
        (sum, agent) => sum + agent.runtime.progress,
        0
    );
    const averageProgress = agents.length > 0 ? Math.round(totalProgress / agents.length) : 0;

    return { statusCounts, averageProgress };
}

/**
 * Loading skeleton for the agent grid
 */
function AgentGridSkeleton() {
    return (
        <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            data-testid="agent-grid-skeleton"
        >
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="p-4 rounded-xl bg-[#161B22] border border-gray-800 animate-pulse"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-700" />
                        <div className="flex-1">
                            <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
                            <div className="h-3 w-32 bg-gray-800 rounded" />
                        </div>
                        <div className="w-3 h-3 rounded-full bg-gray-700" />
                    </div>
                    <div className="h-4 w-full bg-gray-800 rounded mb-3" />
                    <div className="h-1.5 w-full bg-gray-800 rounded" />
                </div>
            ))}
        </div>
    );
}

/**
 * AgentTeamOverview displays all agents in a grid with their current status
 */
export function AgentTeamOverview({
    agents,
    onAgentClick,
    className,
    isLoading = false,
}: AgentTeamOverviewProps) {
    const { statusCounts, averageProgress } = getTeamStats(agents);

    if (isLoading) {
        return (
            <Card className={cn('bg-vite-bg border-gray-800', className)}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Users className="w-5 h-5 text-[#8AB4FF]" />
                            Your Agent Team
                        </CardTitle>
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <AgentGridSkeleton />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn('bg-vite-bg border-gray-800', className)}
            data-testid="agent-team-overview"
        >
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Users className="w-5 h-5 text-[#8AB4FF]" />
                        Your Agent Team
                    </CardTitle>

                    {/* Team status summary */}
                    <div
                        className="flex items-center gap-4 text-sm"
                        role="status"
                        aria-label="Team status summary"
                    >
                        {Object.entries(statusCounts).map(([status, count]) => {
                            if (count === 0) return null;
                            const config = STATUS_CONFIGS[status as AgentStatus];
                            return (
                                <div
                                    key={status}
                                    className="flex items-center gap-1.5"
                                    data-testid={`status-count-${status}`}
                                >
                                    <div
                                        className={cn(
                                            'w-2 h-2 rounded-full',
                                            config.bgColor
                                        )}
                                    />
                                    <span className="text-gray-400">
                                        {count} {config.label}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="h-4 w-px bg-gray-700" aria-hidden="true" />
                        <span className="text-gray-400">
                            Avg: <span className="text-white font-medium">{averageProgress}%</span>
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    data-testid="agent-grid"
                >
                    {agents.map((agent) => (
                        <motion.div
                            key={agent.role.id}
                            variants={itemVariants}
                        >
                            <AgentCard
                                agent={agent}
                                onClick={() => onAgentClick(agent)}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {agents.length === 0 && (
                    <div
                        className="text-center py-12 text-gray-500"
                        data-testid="agent-grid-empty"
                    >
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No agents assigned to this project yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default AgentTeamOverview;
