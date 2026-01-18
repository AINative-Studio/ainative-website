'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LongOperationIndicatorProps, OperationProgress } from '@/types/progress';

/**
 * LongOperationIndicator - Specialized component for operations taking 5+ seconds
 * Provides clear feedback that the system is still working, preventing user confusion
 */
export const LongOperationIndicator = React.forwardRef<
  HTMLDivElement,
  LongOperationIndicatorProps
>(
  (
    {
      operationId,
      progress: externalProgress,
      threshold = 5000,
      warningThreshold = 60000,
      showTimeElapsed = true,
      showCancel = true,
      onTimeout,
    },
    ref
  ) => {
    const progress = externalProgress;
    const [timeElapsed, setTimeElapsed] = React.useState(0);
    const [showWarning, setShowWarning] = React.useState(false);
    const [hasTimedOut, setHasTimedOut] = React.useState(false);
    const intervalRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    // Track elapsed time
    React.useEffect(() => {
      if (progress?.status === 'running' && progress.startTime) {
        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - progress.startTime;
          setTimeElapsed(elapsed);

          // Show warning at threshold
          if (elapsed >= warningThreshold && !showWarning) {
            setShowWarning(true);
          }

          // Trigger timeout callback if provided
          if (elapsed >= warningThreshold * 2 && !hasTimedOut) {
            setHasTimedOut(true);
            onTimeout?.();
          }
        }, 100);

        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      }
    }, [progress?.status, progress?.startTime, warningThreshold, showWarning, hasTimedOut, onTimeout]);

    const formatElapsedTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    };

    // Don't show until threshold is reached
    if (!progress || progress.status !== 'running' || timeElapsed < threshold) {
      return null;
    }

    const isWarningState = timeElapsed >= warningThreshold;

    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            'fixed bottom-4 right-4 z-50 max-w-md rounded-lg border-2 p-4 shadow-2xl backdrop-blur-sm',
            isWarningState
              ? 'border-orange-500/50 bg-orange-950/90'
              : 'border-blue-500/50 bg-blue-950/90'
          )}
          role="alert"
          aria-live="polite"
          aria-label={`Long operation in progress: ${formatElapsedTime(timeElapsed)} elapsed`}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 pt-0.5">
              {isWarningState ? (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </motion.div>
              ) : (
                <Clock className="h-6 w-6 text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1">
                {isWarningState ? 'Operation Taking Longer Than Expected' : 'Long Operation in Progress'}
              </h4>
              <p className="text-sm text-gray-300 mb-2">{progress.message}</p>

              {showTimeElapsed && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Elapsed time</span>
                      <span className="font-mono font-semibold text-white">
                        {formatElapsedTime(timeElapsed)}
                      </span>
                    </div>
                    {/* Animated progress bar for time */}
                    <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-full',
                          isWarningState ? 'bg-orange-500' : 'bg-blue-500'
                        )}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress percentage if available */}
              {progress.progress > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-semibold">{Math.round(progress.progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full',
                        isWarningState ? 'bg-orange-500' : 'bg-blue-500'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Warning message */}
              {isWarningState && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-md bg-orange-900/30 border border-orange-800/50 p-2 mb-3"
                >
                  <p className="text-xs text-orange-200">
                    This operation has exceeded the expected duration. The system is still working, but you may want to:
                  </p>
                  <ul className="mt-2 ml-4 text-xs text-orange-300 list-disc space-y-1">
                    <li>Check your network connection</li>
                    <li>Review the operation logs for errors</li>
                    <li>Consider canceling and retrying</li>
                  </ul>
                </motion.div>
              )}

              {/* Current step info */}
              {progress.currentStep && progress.totalSteps && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span>Step</span>
                    <div className="flex gap-1">
                      {Array.from({ length: progress.totalSteps }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1.5 w-4 rounded-full transition-colors',
                            i < progress.currentStep!
                              ? isWarningState
                                ? 'bg-orange-500'
                                : 'bg-blue-500'
                              : 'bg-gray-700'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-white font-semibold">
                      {progress.currentStep}/{progress.totalSteps}
                    </span>
                  </div>
                </div>
              )}

              {/* Estimated time remaining */}
              {progress.estimatedTimeRemaining && (
                <p className="text-xs text-gray-400">
                  Estimated time remaining: ~{formatElapsedTime(progress.estimatedTimeRemaining)}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3">
                {showCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'text-xs',
                      isWarningState
                        ? 'border-orange-700 text-orange-300 hover:bg-orange-900/50'
                        : 'border-blue-700 text-blue-300 hover:bg-blue-900/50'
                    )}
                    onClick={() => {
                      // Cancel operation logic
                      console.log('Canceling operation:', operationId);
                    }}
                  >
                    Cancel Operation
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-white ml-auto"
                  onClick={() => {
                    // Dismiss indicator (operation continues)
                    setShowWarning(false);
                  }}
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pulsing border animation */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-lg -z-10',
              isWarningState ? 'border-2 border-orange-500' : 'border-2 border-blue-500'
            )}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }
);

LongOperationIndicator.displayName = 'LongOperationIndicator';
