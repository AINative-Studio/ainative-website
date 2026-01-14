'use client';

/**
 * AgentCard Component
 *
 * Displays a clickable card for an agent in the team overview grid.
 * Shows agent name, role, current status, current task summary, and progress.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgentStatusIndicator } from './AgentStatusIndicator';
import type { AgentCardProps } from '@/types/agent-team.types';
import { STATUS_CONFIGS } from '@/types/agent-team.types';

/**
 * AgentCard displays a summary of an agent's current state
 * in a clickable card format for the team overview grid.
 */
export function AgentCard({ agent, onClick, className }: AgentCardProps) {
    const { role, runtime } = agent;
    const Icon = role.icon;
    const statusConfig = STATUS_CONFIGS[runtime.status];

    // Truncate task to a single line
    const truncatedTask = runtime.currentTask
        ? runtime.currentTask.length > 50
            ? `${runtime.currentTask.slice(0, 47)}...`
            : runtime.currentTask
        : 'No active task';

    return (
        <motion.div
            className={cn(
                'relative p-4 rounded-xl cursor-pointer transition-all duration-200',
                'bg-[#161B22] border border-gray-800',
                'hover:border-[#4B6FED]/40 hover:shadow-lg hover:shadow-[#4B6FED]/10',
                'focus:outline-none focus:ring-2 focus:ring-[#4B6FED] focus:ring-offset-2 focus:ring-offset-[#0D1117]',
                statusConfig.borderColor,
                className
            )}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${role.name}`}
            data-testid={`agent-card-${role.id}`}
        >
            {/* Top gradient bar based on agent color */}
            <div
                className={cn(
                    'absolute top-0 left-0 right-0 h-1 rounded-t-xl',
                    `bg-gradient-to-r ${role.color}`
                )}
                aria-hidden="true"
            />

            {/* Agent header with icon and name */}
            <div className="flex items-start justify-between mb-3 mt-1">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'p-2 rounded-lg',
                            `bg-gradient-to-br ${role.color}/10`
                        )}
                    >
                        <Icon className="w-5 h-5 text-[#8AB4FF]" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">
                            {role.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {role.specialization}
                        </p>
                    </div>
                </div>
                <AgentStatusIndicator
                    status={runtime.status}
                    size="sm"
                    showLabel={false}
                />
            </div>

            {/* Current task summary */}
            <div className="mb-3">
                <p
                    className={cn(
                        'text-sm leading-snug',
                        runtime.currentTask ? 'text-gray-300' : 'text-gray-500 italic'
                    )}
                    data-testid="agent-card-task"
                >
                    {truncatedTask}
                </p>
            </div>

            {/* Progress indicator */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                        Tasks: {runtime.completedTasks}/{runtime.totalTasks}
                    </span>
                    <span className={cn('font-medium', statusConfig.textColor)}>
                        {runtime.progress}%
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                        className={cn(
                            'h-full rounded-full',
                            `bg-gradient-to-r ${role.color}`
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${runtime.progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        data-testid="agent-card-progress"
                    />
                </div>
            </div>

            {/* Status badge at bottom */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800/50">
                <AgentStatusIndicator
                    status={runtime.status}
                    size="sm"
                    showLabel={true}
                    animate={true}
                />
                <span className="text-xs text-gray-500">
                    Click for details
                </span>
            </div>
        </motion.div>
    );
}

export default AgentCard;
