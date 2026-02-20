'use client';

/**
 * ControlPanel Component
 *
 * Provides project control functionality with:
 * - Stop button with confirmation dialog
 * - Restart button with confirmation dialog
 * - Project status indicator (running/stopped/completed/error)
 * - Smart button disabling based on project state
 *
 * Refs #1098
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ControlPanelProps {
  projectId: string;
  status: 'active' | 'completed' | 'error' | 'stopped';
  onStatusChange?: (newStatus: string) => void;
}

interface StatusConfig {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: string;
  label: string;
  className?: string;
}

const STATUS_CONFIGS: Record<ControlPanelProps['status'], StatusConfig> = {
  active: {
    variant: 'default',
    icon: '🟢',
    label: 'Running',
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  stopped: {
    variant: 'secondary',
    icon: '⏸️',
    label: 'Stopped',
    className: 'bg-gray-500 hover:bg-gray-600 text-white',
  },
  completed: {
    variant: 'outline',
    icon: '✅',
    label: 'Completed',
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  error: {
    variant: 'destructive',
    icon: '❌',
    label: 'Error',
    className: 'bg-red-500 hover:bg-red-600 text-white',
  },
};

export function ControlPanel({
  projectId,
  status,
  onStatusChange,
}: ControlPanelProps) {
  const [isStopLoading, setIsStopLoading] = useState(false);
  const [isRestartLoading, setIsRestartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusConfig = STATUS_CONFIGS[status];

  // Stop button is disabled when project is already stopped or completed
  const isStopDisabled = status === 'stopped' || status === 'completed';

  // Restart button is disabled when project is active or in error state
  const isRestartDisabled = status === 'active' || status === 'error';

  const handleStop = async () => {
    setIsStopLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/admin/agent-swarms/projects/${projectId}/stop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to stop project: ${response.statusText}`);
      }

      const data = await response.json();
      onStatusChange?.(data.status || 'stopped');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to stop project';
      setError(errorMessage);
      console.error('Error stopping project:', err);
    } finally {
      setIsStopLoading(false);
    }
  };

  const handleRestart = async () => {
    setIsRestartLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/admin/agent-swarms/projects/${projectId}/restart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to restart project: ${response.statusText}`);
      }

      const data = await response.json();
      onStatusChange?.(data.status || 'active');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to restart project';
      setError(errorMessage);
      console.error('Error restarting project:', err);
    } finally {
      setIsRestartLoading(false);
    }
  };

  return (
    <Card className="control-panel">
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Indicator */}
        <div
          className="flex items-center gap-2"
          data-testid="status-indicator"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <Badge
            variant={statusConfig.variant}
            className={cn(statusConfig.className)}
            data-testid="status-badge"
          >
            <span className="mr-1">{statusConfig.icon}</span>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200"
            role="alert"
            data-testid="error-message"
          >
            {error}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3" data-testid="button-group">
          {/* Stop Button with Confirmation Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isStopDisabled || isStopLoading}
                className="flex-1"
                data-testid="stop-button"
                aria-label="Stop project"
              >
                {isStopLoading ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Stopping...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🛑</span>
                    Stop Project
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-testid="stop-dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Stop All Agents?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will stop all agents working on this project. You can
                  restart later from the current stage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="stop-dialog-cancel">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleStop}
                  data-testid="stop-dialog-confirm"
                >
                  Stop Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Restart Button with Confirmation Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isRestartDisabled || isRestartLoading}
                className="flex-1"
                data-testid="restart-button"
                aria-label="Restart project"
              >
                {isRestartLoading ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Restarting...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔄</span>
                    Restart
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-testid="restart-dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Restart Project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will restart the agent swarm from the current stage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="restart-dialog-cancel">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRestart}
                  data-testid="restart-dialog-confirm"
                >
                  Restart Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default ControlPanel;
