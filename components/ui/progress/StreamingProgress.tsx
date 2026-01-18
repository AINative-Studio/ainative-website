'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { StreamingProgressProps, OperationProgress, LogLevel } from '@/types/progress';

/**
 * StreamingProgress - Real-time operation progress display
 * Prevents "silent hanging" by showing live updates during long operations
 */
export const StreamingProgress = React.forwardRef<HTMLDivElement, StreamingProgressProps>(
  (
    {
      operationId,
      progress: externalProgress,
      showLogs = true,
      showEstimate = true,
      compact = false,
      onComplete,
      onError,
      onCancel,
    },
    ref
  ) => {
    const progress = externalProgress;
    const [isLogsExpanded, setIsLogsExpanded] = React.useState(false);
    const [timeElapsed, setTimeElapsed] = React.useState(0);

    // Update time elapsed
    React.useEffect(() => {
      const interval = setInterval(() => {
        if (progress?.startTime) {
          setTimeElapsed(Date.now() - progress.startTime);
        }
      }, 100);

      return () => clearInterval(interval);
    }, [progress?.startTime]);

    const getStatusIcon = (status: OperationProgress['status']) => {
      switch (status) {
        case 'running':
          return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        case 'success':
          return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'error':
          return <XCircle className="h-4 w-4 text-red-500" />;
        case 'queued':
          return <Clock className="h-4 w-4 text-yellow-500" />;
        default:
          return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
      }
    };

    const getStatusColor = (status: OperationProgress['status']) => {
      switch (status) {
        case 'running':
          return 'bg-blue-500';
        case 'success':
          return 'bg-green-500';
        case 'error':
          return 'bg-red-500';
        case 'queued':
          return 'bg-yellow-500';
        case 'timeout':
          return 'bg-orange-500';
        default:
          return 'bg-gray-500';
      }
    };

    const getLogLevelColor = (level: LogLevel) => {
      switch (level) {
        case 'error':
          return 'text-red-400 bg-red-950/30';
        case 'warn':
          return 'text-yellow-400 bg-yellow-950/30';
        case 'info':
          return 'text-blue-400 bg-blue-950/30';
        case 'debug':
          return 'text-gray-400 bg-gray-950/30';
      }
    };

    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${seconds}s`;
    };

    const formatEstimate = (ms?: number) => {
      if (!ms) return 'Calculating...';
      return formatTime(ms);
    };

    if (!progress) {
      return (
        <div
          ref={ref}
          className="rounded-lg border border-gray-800 bg-gray-900/50 p-4"
          role="status"
          aria-live="polite"
          aria-label="Operation initializing"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">Initializing operation...</p>
              <p className="text-xs text-gray-500">ID: {operationId}</p>
            </div>
          </div>
        </div>
      );
    }

    if (compact) {
      return (
        <div
          ref={ref}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900/50 px-3 py-1.5"
          role="status"
          aria-live="polite"
          aria-label={`Operation ${progress.status}: ${progress.message}`}
        >
          {getStatusIcon(progress.status)}
          <span className="text-xs text-gray-300">{progress.message}</span>
          {progress.status === 'running' && (
            <span className="text-xs text-gray-500">{Math.round(progress.progress)}%</span>
          )}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-4 shadow-lg"
        role="status"
        aria-live="polite"
        aria-label={`Operation ${progress.status}: ${progress.message}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {getStatusIcon(progress.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-100 truncate">
                  {progress.message}
                </h4>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs capitalize',
                    getStatusColor(progress.status),
                    'text-white border-0'
                  )}
                >
                  {progress.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {progress.type.replace(/_/g, ' ')} • {formatTime(timeElapsed)}
                {showEstimate && progress.estimatedTimeRemaining && progress.status === 'running' && (
                  <> • Est. {formatEstimate(progress.estimatedTimeRemaining)} remaining</>
                )}
              </p>
            </div>
          </div>

          {onCancel && progress.status === 'running' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-400 hover:text-red-400"
              aria-label="Cancel operation"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {progress.status === 'running' && (
          <div className="mt-4 space-y-2">
            <Progress
              value={progress.progress}
              className="h-2 bg-gray-800"
              aria-label={`Progress: ${Math.round(progress.progress)}%`}
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {progress.currentStep && progress.totalSteps
                  ? `Step ${progress.currentStep} of ${progress.totalSteps}`
                  : `${Math.round(progress.progress)}%`}
              </span>
              {progress.metadata?.bytesProcessed && progress.metadata?.totalBytes && (
                <span className="text-gray-500">
                  {Math.round((progress.metadata.bytesProcessed / progress.metadata.totalBytes) * 100)}% transferred
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        {progress.metadata && Object.keys(progress.metadata).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {progress.metadata.fileName && (
              <Badge variant="secondary" className="text-xs">
                {progress.metadata.fileName}
              </Badge>
            )}
            {progress.metadata.fileCount !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {progress.metadata.fileCount} files
              </Badge>
            )}
            {progress.metadata.modelName && (
              <Badge variant="secondary" className="text-xs">
                {progress.metadata.modelName}
              </Badge>
            )}
          </div>
        )}

        {/* Logs */}
        {showLogs && progress.logs.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setIsLogsExpanded(!isLogsExpanded)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
              aria-expanded={isLogsExpanded}
              aria-controls={`logs-${operationId}`}
            >
              {isLogsExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              <span>{progress.logs.length} log entries</span>
            </button>

            <AnimatePresence>
              {isLogsExpanded && (
                <motion.div
                  id={`logs-${operationId}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 max-h-48 overflow-y-auto rounded-md bg-gray-950 border border-gray-800"
                  role="log"
                  aria-label="Operation logs"
                >
                  <div className="p-2 space-y-1 font-mono text-xs">
                    {progress.logs.map((log, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-start gap-2 p-1.5 rounded',
                          getLogLevelColor(log.level)
                        )}
                      >
                        <span className="text-gray-600 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="uppercase shrink-0 font-semibold">{log.level}</span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Still Working Warning */}
        {progress.status === 'running' && timeElapsed > 10000 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 rounded-md bg-blue-950/30 border border-blue-900/50 p-2"
            role="alert"
            aria-live="polite"
          >
            <p className="text-xs text-blue-300">
              Still working on this... Complex operations may take longer than usual.
            </p>
          </motion.div>
        )}

        {/* Timeout Warning */}
        {progress.status === 'running' && timeElapsed > 60000 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 rounded-md bg-orange-950/30 border border-orange-900/50 p-2"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-xs text-orange-300">
              This operation is taking longer than expected. You may want to check the logs or cancel if needed.
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

StreamingProgress.displayName = 'StreamingProgress';
