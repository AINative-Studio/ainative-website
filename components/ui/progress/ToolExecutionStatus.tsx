'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Terminal,
  Code2,
  Database,
  FileText,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { ToolExecutionStatusProps, OperationProgress } from '@/types/progress';

/**
 * ToolExecutionStatus - Visual indicator for tool/command execution
 * Shows real-time status with auto-hide on success
 */
export const ToolExecutionStatus = React.forwardRef<HTMLDivElement, ToolExecutionStatusProps>(
  (
    {
      operationId,
      toolName,
      progress: externalProgress,
      showDetails = true,
      autoHideOnSuccess = true,
      autoHideDuration = 3000,
    },
    ref
  ) => {
    const progress = externalProgress;
    const [isVisible, setIsVisible] = React.useState(true);
    const [detailsExpanded, setDetailsExpanded] = React.useState(false);

    // Auto-hide on success
    React.useEffect(() => {
      if (progress?.status === 'success' && autoHideOnSuccess) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    }, [progress?.status, autoHideOnSuccess, autoHideDuration]);

    const getToolIcon = (type: OperationProgress['type']) => {
      switch (type) {
        case 'tool_execution':
          return <Terminal className="h-4 w-4" />;
        case 'api_call':
          return <Zap className="h-4 w-4" />;
        case 'file_operation':
          return <FileText className="h-4 w-4" />;
        case 'batch_processing':
          return <Database className="h-4 w-4" />;
        case 'model_inference':
          return <Code2 className="h-4 w-4" />;
        default:
          return <Terminal className="h-4 w-4" />;
      }
    };

    const getStatusIndicator = (status: OperationProgress['status']) => {
      switch (status) {
        case 'running':
          return (
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <div className="absolute inset-0 animate-ping">
                <div className="h-full w-full rounded-full bg-blue-500/30" />
              </div>
            </div>
          );
        case 'success':
          return (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </motion.div>
          );
        case 'error':
          return (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <XCircle className="h-5 w-5 text-red-500" />
            </motion.div>
          );
        case 'timeout':
          return <AlertCircle className="h-5 w-5 text-orange-500" />;
        case 'queued':
          return <div className="h-5 w-5 rounded-full bg-yellow-500/30 animate-pulse" />;
        default:
          return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
      }
    };

    const getStatusColor = (status: OperationProgress['status']) => {
      switch (status) {
        case 'running':
          return 'border-blue-500/50 bg-blue-950/30';
        case 'success':
          return 'border-green-500/50 bg-green-950/30';
        case 'error':
          return 'border-red-500/50 bg-red-950/30';
        case 'timeout':
          return 'border-orange-500/50 bg-orange-950/30';
        case 'queued':
          return 'border-yellow-500/50 bg-yellow-950/30';
        default:
          return 'border-gray-500/50 bg-gray-950/30';
      }
    };

    const getBackgroundAnimation = (status: OperationProgress['status']) => {
      if (status === 'running') {
        return 'animate-pulse';
      }
      return '';
    };

    if (!isVisible || !progress) {
      return null;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={cn(
            'rounded-lg border-2 p-3 shadow-lg transition-all duration-300',
            getStatusColor(progress.status),
            getBackgroundAnimation(progress.status)
          )}
          role="status"
          aria-live="polite"
          aria-label={`Tool ${toolName}: ${progress.status}`}
        >
          <div className="flex items-start gap-3">
            {/* Status Icon */}
            <div className="shrink-0 pt-0.5">{getStatusIndicator(progress.status)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getToolIcon(progress.type)}
                <h4 className="text-sm font-semibold text-gray-100 truncate">{toolName}</h4>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs capitalize ml-auto',
                    progress.status === 'running' && 'border-blue-500 text-blue-400',
                    progress.status === 'success' && 'border-green-500 text-green-400',
                    progress.status === 'error' && 'border-red-500 text-red-400'
                  )}
                >
                  {progress.status}
                </Badge>
              </div>

              <p className="text-sm text-gray-300 mb-2">{progress.message}</p>

              {/* Progress indicator for running state */}
              {progress.status === 'running' && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>
                      {progress.currentStep && progress.totalSteps
                        ? `Step ${progress.currentStep}/${progress.totalSteps}`
                        : `${Math.round(progress.progress)}%`}
                    </span>
                    {progress.estimatedTimeRemaining && (
                      <span>
                        ~{Math.round(progress.estimatedTimeRemaining / 1000)}s remaining
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Details section */}
              {showDetails && progress.logs.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setDetailsExpanded(!detailsExpanded)}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    aria-expanded={detailsExpanded}
                    aria-controls={`details-${operationId}`}
                  >
                    {detailsExpanded ? 'Hide' : 'Show'} details ({progress.logs.length})
                  </button>

                  <AnimatePresence>
                    {detailsExpanded && (
                      <motion.div
                        id={`details-${operationId}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 rounded bg-gray-950/50 border border-gray-800"
                      >
                        <div className="p-2 max-h-32 overflow-y-auto">
                          {progress.logs.slice(-5).map((log, index) => (
                            <div
                              key={index}
                              className="text-xs font-mono text-gray-400 py-0.5"
                            >
                              {log.message}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Error details */}
              {progress.status === 'error' && progress.error && (
                <div className="mt-2 p-2 rounded bg-red-950/50 border border-red-900/50">
                  <p className="text-xs text-red-300 font-medium">{progress.error.message}</p>
                  {progress.error.recoverable && (
                    <p className="text-xs text-gray-400 mt-1">This error may be recoverable</p>
                  )}
                </div>
              )}

              {/* Metadata */}
              {progress.metadata && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {progress.metadata.fileName && (
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-1.5 py-0.5 rounded">
                      {progress.metadata.fileName}
                    </span>
                  )}
                  {progress.metadata.endpoint && (
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-1.5 py-0.5 rounded">
                      {progress.metadata.endpoint}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

ToolExecutionStatus.displayName = 'ToolExecutionStatus';
