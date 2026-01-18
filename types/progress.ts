/**
 * Types for streaming progress indicators and long-running operations
 * Addresses "silent hanging" user experience from Gemini CLI issues #16985, #16982
 */

export type OperationStatus = 'queued' | 'running' | 'success' | 'error' | 'cancelled' | 'timeout';
export type OperationType = 'tool_execution' | 'api_call' | 'file_operation' | 'batch_processing' | 'model_inference';
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface OperationLog {
  timestamp: number;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface OperationProgress {
  operationId: string;
  type: OperationType;
  status: OperationStatus;
  progress: number; // 0-100
  message: string;
  startTime: number;
  endTime?: number;
  estimatedTimeRemaining?: number;
  totalSteps?: number;
  currentStep?: number;
  logs: OperationLog[];
  error?: {
    code: string;
    message: string;
    details?: string;
    stack?: string;
    recoverable: boolean;
  };
  metadata?: {
    fileName?: string;
    fileCount?: number;
    bytesProcessed?: number;
    totalBytes?: number;
    modelName?: string;
    endpoint?: string;
  };
}

export interface StreamingProgressProps {
  operationId: string;
  progress?: OperationProgress | null;
  showLogs?: boolean;
  showEstimate?: boolean;
  compact?: boolean;
  onComplete?: (result: OperationProgress) => void;
  onError?: (error: OperationProgress['error']) => void;
  onCancel?: () => void;
}

export interface ToolExecutionStatusProps {
  operationId: string;
  toolName: string;
  progress?: OperationProgress | null;
  showDetails?: boolean;
  autoHideOnSuccess?: boolean;
  autoHideDuration?: number;
}

export interface LongOperationIndicatorProps {
  operationId: string;
  progress?: OperationProgress | null;
  threshold?: number; // milliseconds, default 5000
  warningThreshold?: number; // milliseconds, default 60000
  showTimeElapsed?: boolean;
  showCancel?: boolean;
  onTimeout?: () => void;
}

export interface ErrorDisplayProps {
  error: NonNullable<OperationProgress['error']>;
  operation: Pick<OperationProgress, 'operationId' | 'type' | 'message'>;
  showStack?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export interface ProgressToastOptions {
  type: 'success' | 'error' | 'warning' | 'info' | 'progress';
  operationId: string;
  title: string;
  description?: string;
  duration?: number;
  progress?: number;
  showProgress?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Helper type for operation context
export interface OperationContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  parentOperationId?: string;
  tags?: string[];
}

// WebSocket/SSE message types
export interface ProgressUpdateMessage {
  type: 'progress_update';
  data: OperationProgress;
}

export interface ProgressCompleteMessage {
  type: 'progress_complete';
  data: OperationProgress;
}

export interface ProgressErrorMessage {
  type: 'progress_error';
  data: OperationProgress;
}

export type ProgressMessage =
  | ProgressUpdateMessage
  | ProgressCompleteMessage
  | ProgressErrorMessage;
