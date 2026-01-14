'use client';

/**
 * AgentStatusIndicator Component
 *
 * Displays a visual status indicator for an agent with animated states:
 * - Green pulse: actively working
 * - Yellow: waiting/blocked
 * - Gray: idle
 * - Blue: completed
 * - Red: error state
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AgentStatusIndicatorProps } from '@/types/agent-team.types';
import { STATUS_CONFIGS } from '@/types/agent-team.types';

const SIZE_CLASSES = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
};

const TEXT_SIZE_CLASSES = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
};

/**
 * AgentStatusIndicator displays a colored dot with optional animation
 * to indicate the current status of an agent.
 */
export function AgentStatusIndicator({
    status,
    size = 'md',
    showLabel = true,
    animate = true,
}: AgentStatusIndicatorProps) {
    const config = STATUS_CONFIGS[status];
    const sizeClass = SIZE_CLASSES[size];
    const textSizeClass = TEXT_SIZE_CLASSES[size];

    return (
        <div
            className="flex items-center gap-2"
            role="status"
            aria-label={`Agent status: ${config.label}`}
        >
            <div className="relative">
                {/* Base indicator dot */}
                <div
                    className={cn(
                        'rounded-full',
                        sizeClass,
                        config.bgColor
                    )}
                    data-testid="status-indicator-dot"
                />

                {/* Pulse animation for working status */}
                {status === 'working' && animate && (
                    <motion.div
                        className={cn(
                            'absolute inset-0 rounded-full',
                            sizeClass,
                            config.pulseColor
                        )}
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{
                            opacity: [0.8, 0],
                            scale: [1, 2],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                        data-testid="status-indicator-pulse"
                    />
                )}

                {/* Error pulse animation */}
                {status === 'error' && animate && (
                    <motion.div
                        className={cn(
                            'absolute inset-0 rounded-full',
                            sizeClass,
                            config.pulseColor
                        )}
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: [0.6, 0.2, 0.6] }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        data-testid="status-indicator-error-pulse"
                    />
                )}
            </div>

            {/* Status label */}
            {showLabel && (
                <span
                    className={cn('text-gray-400', textSizeClass)}
                    data-testid="status-indicator-label"
                >
                    {config.label}
                </span>
            )}
        </div>
    );
}

export default AgentStatusIndicator;
