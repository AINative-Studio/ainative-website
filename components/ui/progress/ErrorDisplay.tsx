'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { ErrorDisplayProps } from '@/types/progress';

/**
 * ErrorDisplay - User-friendly error message display with actionable feedback
 * Helps users understand what went wrong and what they can do about it
 */
export const ErrorDisplay = React.forwardRef<HTMLDivElement, ErrorDisplayProps>(
  (
    {
      error,
      operation,
      showStack = false,
      showRetry = true,
      onRetry,
      onDismiss,
    },
    ref
  ) => {
    const [isStackExpanded, setIsStackExpanded] = React.useState(false);
    const [isCopied, setIsCopied] = React.useState(false);
    const { toast } = useToast();

    const handleCopyError = () => {
      const errorText = `
Operation: ${operation.type} - ${operation.message}
Error Code: ${error.code}
Error Message: ${error.message}
${error.details ? `Details: ${error.details}` : ''}
${error.stack && showStack ? `Stack Trace:\n${error.stack}` : ''}
Operation ID: ${operation.operationId}
      `.trim();

      navigator.clipboard.writeText(errorText).then(() => {
        setIsCopied(true);
        toast({
          title: 'Error details copied',
          description: 'Error information has been copied to your clipboard.',
          variant: 'default',
        });
        setTimeout(() => setIsCopied(false), 2000);
      });
    };

    const getErrorSeverity = (): 'critical' | 'warning' | 'recoverable' => {
      if (error.recoverable) return 'recoverable';
      if (error.code.startsWith('WARN')) return 'warning';
      return 'critical';
    };

    const getSeverityStyles = (severity: 'critical' | 'warning' | 'recoverable') => {
      switch (severity) {
        case 'critical':
          return {
            border: 'border-red-500/50',
            bg: 'bg-gradient-to-br from-red-950/90 to-red-900/50',
            icon: 'text-red-400',
            badge: 'bg-red-600 text-white',
          };
        case 'warning':
          return {
            border: 'border-yellow-500/50',
            bg: 'bg-gradient-to-br from-yellow-950/90 to-yellow-900/50',
            icon: 'text-yellow-400',
            badge: 'bg-yellow-600 text-white',
          };
        case 'recoverable':
          return {
            border: 'border-orange-500/50',
            bg: 'bg-gradient-to-br from-orange-950/90 to-orange-900/50',
            icon: 'text-orange-400',
            badge: 'bg-orange-600 text-white',
          };
      }
    };

    const getErrorIcon = (severity: 'critical' | 'warning' | 'recoverable') => {
      switch (severity) {
        case 'critical':
          return <XCircle className="h-6 w-6" />;
        case 'warning':
        case 'recoverable':
          return <AlertTriangle className="h-6 w-6" />;
      }
    };

    const getSuggestedActions = (): string[] => {
      const actions: string[] = [];

      if (error.code.includes('NETWORK') || error.code.includes('TIMEOUT')) {
        actions.push('Check your internet connection');
        actions.push('Verify the service is accessible');
        actions.push('Try again in a few moments');
      }

      if (error.code.includes('AUTH') || error.code.includes('PERMISSION')) {
        actions.push('Verify your credentials are correct');
        actions.push('Check if your session has expired');
        actions.push('Ensure you have the necessary permissions');
      }

      if (error.code.includes('RATE_LIMIT')) {
        actions.push('Wait a few minutes before retrying');
        actions.push('Consider upgrading your plan for higher limits');
      }

      if (error.code.includes('VALIDATION') || error.code.includes('INPUT')) {
        actions.push('Review your input data for errors');
        actions.push('Check the API documentation for requirements');
      }

      if (error.recoverable && actions.length === 0) {
        actions.push('Try the operation again');
        actions.push('Contact support if the problem persists');
      }

      if (!error.recoverable) {
        actions.push('Contact support with the error details');
        actions.push('Include the operation ID in your report');
      }

      return actions;
    };

    const severity = getErrorSeverity();
    const styles = getSeverityStyles(severity);
    const suggestedActions = getSuggestedActions();

    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className={cn(
            'rounded-lg border-2 p-4 shadow-2xl backdrop-blur-sm',
            styles.border,
            styles.bg
          )}
          role="alert"
          aria-live="assertive"
          aria-labelledby={`error-title-${operation.operationId}`}
          aria-describedby={`error-description-${operation.operationId}`}
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className={cn('shrink-0 pt-0.5', styles.icon)}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                {getErrorIcon(severity)}
              </motion.div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      id={`error-title-${operation.operationId}`}
                      className="text-lg font-semibold text-white"
                    >
                      Operation Failed
                    </h3>
                    <Badge className={styles.badge}>
                      {error.code}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300">{operation.message}</p>
                </div>

                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    className="text-gray-400 hover:text-white shrink-0"
                    aria-label="Dismiss error"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-4">
            <div className="rounded-md bg-black/30 border border-white/10 p-3">
              <p
                id={`error-description-${operation.operationId}`}
                className="text-sm text-gray-200 font-medium mb-1"
              >
                {error.message}
              </p>
              {error.details && (
                <p className="text-xs text-gray-400 mt-2">{error.details}</p>
              )}
            </div>
          </div>

          {/* Suggested Actions */}
          {suggestedActions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">What you can do:</h4>
              <ul className="space-y-1.5">
                {suggestedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-gray-500 shrink-0 mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stack Trace (if available) */}
          {showStack && error.stack && (
            <div className="mb-4">
              <button
                onClick={() => setIsStackExpanded(!isStackExpanded)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors mb-2"
                aria-expanded={isStackExpanded}
                aria-controls={`stack-${operation.operationId}`}
              >
                {isStackExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span>Technical Details</span>
              </button>

              <AnimatePresence>
                {isStackExpanded && (
                  <motion.div
                    id={`stack-${operation.operationId}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-md bg-black/50 border border-white/10 p-3 max-h-48 overflow-y-auto">
                      <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
            <span>Operation ID: {operation.operationId}</span>
            <span>•</span>
            <span className="capitalize">{operation.type.replace(/_/g, ' ')}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {showRetry && onRetry && error.recoverable && (
              <Button
                variant="default"
                size="sm"
                onClick={onRetry}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Operation
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyError}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              {isCopied ? 'Copied!' : 'Copy Error'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-300 ml-auto"
              asChild
            >
              <a
                href="https://docs.ainative.studio/troubleshooting"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Help
              </a>
            </Button>
          </div>

          {/* Recovery indicator */}
          {error.recoverable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="flex items-center gap-2 text-xs text-green-400">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>This error is recoverable - you can retry the operation</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

ErrorDisplay.displayName = 'ErrorDisplay';
