/**
 * AgentTypeBadge Component
 *
 * A color-coded badge component for displaying agent types with visual distinction.
 * Fully WCAG 2.1 AA compliant with 4.5:1+ contrast ratios.
 *
 * Features:
 * - Color-coded variants for different agent types (quantum, ML, general, etc.)
 * - Keyboard navigation support
 * - Proper ARIA labels for screen readers
 * - Optional icon display
 * - Multiple size variants
 * - Interactive mode with hover states
 *
 * @example
 * ```tsx
 * <AgentTypeBadge type="quantum" />
 * <AgentTypeBadge type="ml" showIcon />
 * <AgentTypeBadge type="general" interactive onClick={handleClick} />
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Zap, Bot, Workflow, MessageSquare, CheckCircle, Sparkles, Code } from 'lucide-react';

export type AgentType =
  | 'quantum'
  | 'ml'
  | 'general'
  | 'conversational'
  | 'task-based'
  | 'workflow'
  | 'custom';

export interface AgentTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The agent type to display
   */
  type: AgentType;

  /**
   * Whether to show an icon alongside the label
   * @default false
   */
  showIcon?: boolean;

  /**
   * Size variant
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the badge is interactive (clickable)
   * @default false
   */
  interactive?: boolean;

  /**
   * Custom aria-label (auto-generated if not provided)
   */
  'aria-label'?: string;

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * Get the display label for an agent type
 */
const getTypeLabel = (type: AgentType | string): string => {
  const labels: Record<string, string> = {
    quantum: 'Quantum',
    ml: 'ML',
    general: 'General',
    conversational: 'Conversational',
    'task-based': 'Task-Based',
    workflow: 'Workflow',
    custom: 'Custom',
  };

  return labels[type] || 'Unknown';
};

/**
 * Get the icon component for an agent type
 */
const getTypeIcon = (type: AgentType | string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    quantum: Zap,
    ml: Sparkles,
    general: Bot,
    conversational: MessageSquare,
    'task-based': CheckCircle,
    workflow: Workflow,
    custom: Code,
  };

  return icons[type] || Bot;
};

/**
 * Get color classes for an agent type
 */
const getTypeColorClasses = (type: AgentType | string): string => {
  const colorMap: Record<string, string> = {
    quantum: 'bg-agent-quantum text-white',
    ml: 'bg-agent-ml text-white',
    general: 'bg-agent-general text-white',
    conversational: 'bg-agent-conversational text-white',
    'task-based': 'bg-agent-task text-white',
    workflow: 'bg-agent-workflow text-white',
    custom: 'bg-agent-custom text-white',
  };

  return colorMap[type] || 'bg-neutral text-white';
};

/**
 * Get size classes for badge
 */
const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  const sizeMap = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  return sizeMap[size];
};

/**
 * AgentTypeBadge Component
 */
const AgentTypeBadge = React.forwardRef<HTMLSpanElement, AgentTypeBadgeProps>(
  (
    {
      type,
      showIcon = false,
      size = 'md',
      interactive = false,
      className,
      onClick,
      'aria-label': ariaLabel,
      'data-testid': dataTestId,
      ...props
    },
    ref
  ) => {
    const label = getTypeLabel(type);
    const colorClasses = getTypeColorClasses(type);
    const sizeClasses = getSizeClasses(size);
    const Icon = getTypeIcon(type);

    // Auto-generate aria-label if not provided
    const computedAriaLabel = ariaLabel || `${label} agent type`;

    // Handle keyboard events for interactive badges
    const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (interactive && onClick && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick(event as unknown as React.MouseEvent<HTMLSpanElement>);
      }
    };

    return (
      <span
        ref={ref}
        role="status"
        aria-label={computedAriaLabel}
        data-testid={dataTestId}
        tabIndex={interactive ? 0 : undefined}
        className={cn(
          // Base styles
          'inline-flex items-center rounded-full font-semibold transition-all duration-200',
          // Color classes
          colorClasses,
          // Size classes
          sizeClasses,
          // Interactive styles
          interactive && [
            'cursor-pointer',
            'hover:opacity-90',
            'hover:shadow-lg',
            'focus:outline-none',
            'focus:ring-2',
            'focus:ring-offset-2',
            'focus:ring-opacity-50',
            type === 'quantum' && 'focus:ring-agent-quantum',
            type === 'ml' && 'focus:ring-agent-ml',
            type === 'general' && 'focus:ring-agent-general',
            type === 'conversational' && 'focus:ring-agent-conversational',
            type === 'task-based' && 'focus:ring-agent-task',
            type === 'workflow' && 'focus:ring-agent-workflow',
            type === 'custom' && 'focus:ring-agent-custom',
          ],
          className
        )}
        onClick={interactive ? onClick : undefined}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />}
        <span>{label}</span>
      </span>
    );
  }
);

AgentTypeBadge.displayName = 'AgentTypeBadge';

export default AgentTypeBadge;
