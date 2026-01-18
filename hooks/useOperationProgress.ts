'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  OperationProgress,
  ProgressMessage,
  OperationContext,
} from '@/types/progress';

/**
 * useOperationProgress - Hook for subscribing to real-time operation progress
 * Supports SSE (Server-Sent Events) and WebSocket connections
 *
 * In production, this would connect to your backend SSE/WebSocket endpoint.
 * For now, it includes mock functionality for demo purposes.
 */

interface UseOperationProgressOptions {
  operationId: string;
  endpoint?: string;
  protocol?: 'sse' | 'websocket';
  autoConnect?: boolean;
  onUpdate?: (progress: OperationProgress) => void;
  onComplete?: (progress: OperationProgress) => void;
  onError?: (error: OperationProgress['error']) => void;
  context?: OperationContext;
}

interface UseOperationProgressReturn {
  progress: OperationProgress | null;
  isConnected: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  retry: () => void;
}

export const useOperationProgress = ({
  operationId,
  endpoint = '/api/operations/progress',
  protocol = 'sse',
  autoConnect = true,
  onUpdate,
  onComplete,
  onError,
  context,
}: UseOperationProgressOptions): UseOperationProgressReturn => {
  const [progress, setProgress] = useState<OperationProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const handleProgressUpdate = useCallback(
    (data: OperationProgress) => {
      setProgress(data);
      onUpdate?.(data);

      if (data.status === 'success' || data.status === 'error') {
        onComplete?.(data);
        if (data.status === 'error' && data.error) {
          onError?.(data.error);
        }
        // Auto-disconnect on completion
        disconnect();
      }
    },
    [onUpdate, onComplete, onError]
  );

  const connectSSE = useCallback(() => {
    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('operationId', operationId);

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (value) {
            url.searchParams.set(key, String(value));
          }
        });
      }

      const eventSource = new EventSource(url.toString());
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const message: ProgressMessage = JSON.parse(event.data);
          handleProgressUpdate(message.data);
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        setIsConnected(false);

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectSSE();
          }, delay);
        } else {
          setError(new Error('Max reconnection attempts reached'));
        }
      };

      // Custom event listeners
      eventSource.addEventListener('progress_update', (event) => {
        try {
          const data: OperationProgress = JSON.parse((event as MessageEvent).data);
          handleProgressUpdate(data);
        } catch (err) {
          console.error('Failed to parse progress_update event:', err);
        }
      });

      eventSource.addEventListener('progress_complete', (event) => {
        try {
          const data: OperationProgress = JSON.parse((event as MessageEvent).data);
          handleProgressUpdate(data);
        } catch (err) {
          console.error('Failed to parse progress_complete event:', err);
        }
      });

      eventSource.addEventListener('progress_error', (event) => {
        try {
          const data: OperationProgress = JSON.parse((event as MessageEvent).data);
          handleProgressUpdate(data);
        } catch (err) {
          console.error('Failed to parse progress_error event:', err);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect to SSE'));
      setIsConnected(false);
    }
  }, [endpoint, operationId, context, handleProgressUpdate]);

  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = new URL(endpoint, `${protocol}//${window.location.host}`);
      url.searchParams.set('operationId', operationId);

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (value) {
            url.searchParams.set(key, String(value));
          }
        });
      }

      const ws = new WebSocket(url.toString());
      webSocketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // Send subscription message
        ws.send(JSON.stringify({
          type: 'subscribe',
          operationId,
          context,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message: ProgressMessage = JSON.parse(event.data);
          handleProgressUpdate(message.data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError(new Error('WebSocket connection failed'));
      };

      ws.onclose = () => {
        setIsConnected(false);

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        } else {
          setError(new Error('Max reconnection attempts reached'));
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect to WebSocket'));
      setIsConnected(false);
    }
  }, [endpoint, operationId, context, handleProgressUpdate]);

  const connect = useCallback(() => {
    if (protocol === 'sse') {
      connectSSE();
    } else {
      connectWebSocket();
    }
  }, [protocol, connectSSE, connectWebSocket]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const retry = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    setError(null);
    connect();
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    progress,
    isConnected,
    error,
    connect,
    disconnect,
    retry,
  };
};

/**
 * Mock progress simulator for demo purposes
 * In production, remove this and use real backend connection
 */
export const useMockOperationProgress = (
  operationId: string,
  type: OperationProgress['type'] = 'tool_execution',
  totalSteps: number = 5,
  duration: number = 10000
): OperationProgress | null => {
  const [progress, setProgress] = useState<OperationProgress | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    let currentStep = 0;

    const initialProgress: OperationProgress = {
      operationId,
      type,
      status: 'running',
      progress: 0,
      message: 'Starting operation...',
      startTime,
      totalSteps,
      currentStep: 0,
      logs: [
        {
          timestamp: startTime,
          level: 'info',
          message: 'Operation initialized',
        },
      ],
    };

    setProgress(initialProgress);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);
      const newStep = Math.min(Math.floor((elapsed / duration) * totalSteps), totalSteps);

      if (newStep > currentStep) {
        currentStep = newStep;
      }

      setProgress((prev) => {
        if (!prev) return prev;

        const newLogs = [...prev.logs];
        if (newStep > prev.currentStep!) {
          newLogs.push({
            timestamp: Date.now(),
            level: 'info',
            message: `Completed step ${newStep} of ${totalSteps}`,
          });
        }

        return {
          ...prev,
          progress: progressPercent,
          currentStep: newStep,
          message: `Processing step ${newStep} of ${totalSteps}...`,
          estimatedTimeRemaining: duration - elapsed,
          logs: newLogs,
        };
      });

      if (elapsed >= duration) {
        clearInterval(interval);
        setProgress((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'success',
            progress: 100,
            currentStep: totalSteps,
            message: 'Operation completed successfully',
            endTime: Date.now(),
            logs: [
              ...prev.logs,
              {
                timestamp: Date.now(),
                level: 'info',
                message: 'Operation completed',
              },
            ],
          };
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [operationId, type, totalSteps, duration]);

  return progress;
};
