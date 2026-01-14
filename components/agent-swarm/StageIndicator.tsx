'use client';

import * as React from 'react';
import { Circle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Stage status types for execution workflow
 */
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'error';

/**
 * Size variants for the stage indicator
 */
const stageIndicatorVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-all duration-300',
  {
    variants: {
      size: {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
      },
      status: {
        pending: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600',
        in_progress: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        completed: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'pending',
    },
  }
);

/**
 * Icon size mapping for different component sizes
 */
const iconSizes = {
  sm: 14,
  md: 18,
  lg: 22,
} as const;

export interface StageIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stageIndicatorVariants> {
  /**
   * The stage number to display
   */
  stageNumber: number;
  /**
   * The current status of the stage
   */
  status: StageStatus;
  /**
   * Size variant of the indicator
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * StageIndicator - A reusable component for displaying execution stage status
 *
 * Displays the appropriate icon based on the stage status:
 * - Pending: Gray circle
 * - In Progress: Animated blue spinner
 * - Completed: Green checkmark
 * - Error: Red X circle
 *
 * @example
 * ```tsx
 * <StageIndicator stageNumber={1} status="in_progress" size="md" />
 * ```
 */
export function StageIndicator({
  stageNumber,
  status,
  size = 'md',
  className,
  ...props
}: StageIndicatorProps) {
  const iconSize = iconSizes[size];

  // Status to label mapping for accessibility
  const statusLabels: Record<StageStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    error: 'Error',
  };

  // Render the appropriate icon based on status
  const renderIcon = () => {
    switch (status) {
      case 'pending':
        return <Circle size={iconSize} fill="currentColor" opacity={0.3} />;

      case 'in_progress':
        return (
          <Loader2
            size={iconSize}
            className="animate-spin"
            strokeWidth={2.5}
          />
        );

      case 'completed':
        return <CheckCircle size={iconSize} fill="currentColor" />;

      case 'error':
        return <XCircle size={iconSize} fill="currentColor" />;

      default:
        return <Circle size={iconSize} fill="currentColor" opacity={0.3} />;
    }
  };

  return (
    <div
      className={cn(stageIndicatorVariants({ size, status }), className)}
      role="status"
      aria-label={`Stage ${stageNumber}: ${statusLabels[status]}`}
      aria-live={status === 'in_progress' ? 'polite' : 'off'}
      {...props}
    >
      {renderIcon()}
    </div>
  );
}

export default StageIndicator;
