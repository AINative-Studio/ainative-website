'use client';

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ProgressToastOptions } from '@/types/progress';

/**
 * useProgressToast - Enhanced toast notifications for operation progress
 * Provides specialized toast messages for different progress states
 */
export const useProgressToast = () => {
  const { toast, dismiss } = useToast();

  const showProgressToast = useCallback(
    (options: ProgressToastOptions) => {
      const {
        type,
        operationId,
        title,
        description,
        duration = 5000,
        progress,
        showProgress = false,
        action,
      } = options;

      const toastConfig = getToastConfig(type, {
        title,
        description,
        duration,
        progress,
        showProgress,
        action,
      });

      return toast(toastConfig);
    },
    [toast]
  );

  const showSuccessToast = useCallback(
    (operationId: string, title: string, description?: string, elapsedTime?: number) => {
      const desc = description || (elapsedTime ? `Completed in ${formatDuration(elapsedTime)}` : undefined);

      return showProgressToast({
        type: 'success',
        operationId,
        title,
        description: desc,
        duration: 4000,
      });
    },
    [showProgressToast]
  );

  const showErrorToast = useCallback(
    (operationId: string, title: string, description: string, onRetry?: () => void) => {
      return showProgressToast({
        type: 'error',
        operationId,
        title,
        description,
        duration: 10000,
        action: onRetry
          ? {
              label: 'Retry',
              onClick: onRetry,
            }
          : undefined,
      });
    },
    [showProgressToast]
  );

  const showWarningToast = useCallback(
    (operationId: string, title: string, description?: string) => {
      return showProgressToast({
        type: 'warning',
        operationId,
        title,
        description,
        duration: 7000,
      });
    },
    [showProgressToast]
  );

  const showInfoToast = useCallback(
    (operationId: string, title: string, description?: string) => {
      return showProgressToast({
        type: 'info',
        operationId,
        title,
        description,
        duration: 5000,
      });
    },
    [showProgressToast]
  );

  const showProgressUpdateToast = useCallback(
    (
      operationId: string,
      title: string,
      progressPercent: number,
      description?: string
    ) => {
      return showProgressToast({
        type: 'progress',
        operationId,
        title,
        description,
        progress: progressPercent,
        showProgress: true,
        duration: 999999, // Don't auto-dismiss progress toasts
      });
    },
    [showProgressToast]
  );

  const dismissProgressToast = useCallback(
    (operationId: string) => {
      dismiss(operationId);
    },
    [dismiss]
  );

  return {
    showProgressToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showProgressUpdateToast,
    dismissProgressToast,
  };
};

function getToastConfig(
  type: ProgressToastOptions['type'],
  options: Partial<ProgressToastOptions>
) {
  const baseConfig = {
    title: options.title || '',
    description: options.description,
    duration: options.duration,
  };

  switch (type) {
    case 'success':
      return {
        ...baseConfig,
        variant: 'default' as const,
        className: 'border-green-500/50 bg-green-950/90 text-green-50',
      };

    case 'error':
      return {
        ...baseConfig,
        variant: 'destructive' as const,
        className: 'border-red-500/50 bg-red-950/90 text-red-50',
      };

    case 'warning':
      return {
        ...baseConfig,
        variant: 'default' as const,
        className: 'border-yellow-500/50 bg-yellow-950/90 text-yellow-50',
      };

    case 'info':
      return {
        ...baseConfig,
        variant: 'default' as const,
        className: 'border-blue-500/50 bg-blue-950/90 text-blue-50',
      };

    case 'progress':
      const progressDesc = options.showProgress && options.progress !== undefined
        ? `${options.description || ''}\n${Math.round(options.progress)}% complete`
        : options.description;

      return {
        ...baseConfig,
        variant: 'default' as const,
        className: 'border-blue-500/50 bg-blue-950/90 text-blue-50',
        description: progressDesc,
      };

    default:
      return baseConfig;
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  if (seconds > 0) {
    return `${seconds}s`;
  }
  return `${ms}ms`;
}
