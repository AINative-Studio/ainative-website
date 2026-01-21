/**
 * useAgentSwarmWebSocket Hook
 * Real-time WebSocket connection for Agent Swarm Terminal
 * Provides automatic reconnection with exponential backoff and fallback to polling
 *
 * Issue #430 - Agent Swarm Terminal WebSocket Implementation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createWebSocketClient,
  WebSocketClient,
  WebSocketState,
  buildAgentSwarmWebSocketUrl,
} from '@/lib/websocket-client';
import { agentSwarmService, ProjectLog } from '@/lib/agent-swarm-service';

/**
 * Log entry for terminal display
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning' | 'agent_status';
  message: string;
  agent?: string;
  progress?: number;
  status?: string;
}

/**
 * Agent status for tracking individual agent progress
 */
export interface AgentStatus {
  name: string;
  status: 'idle' | 'working' | 'completed' | 'failed';
  progress: number;
  currentTask?: string;
}

/**
 * Hook configuration options
 */
export interface UseAgentSwarmWebSocketOptions {
  /** Project ID to monitor */
  projectId: string;

  /** Callback when connection status changes */
  onConnectionStatusChange?: (connected: boolean) => void;

  /** Enable fallback to polling when WebSocket fails (default: true) */
  enableFallback?: boolean;

  /** Maximum reconnect attempts before fallback (default: 5) */
  maxReconnectAttempts?: number;

  /** Polling interval when in fallback mode (default: 5000ms) */
  pollingInterval?: number;

  /** Maximum number of logs to retain (default: 100) */
  maxLogs?: number;

  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;
}

/**
 * Hook return type
 */
export interface UseAgentSwarmWebSocketReturn {
  /** Whether WebSocket is currently connected */
  isConnected: boolean;

  /** Whether WebSocket is connecting */
  isConnecting: boolean;

  /** Whether using fallback polling mode */
  isUsingFallback: boolean;

  /** Current error if any */
  error: string | null;

  /** Log entries for terminal display */
  logs: LogEntry[];

  /** Map of agent statuses */
  agents: Map<string, AgentStatus>;

  /** Manually trigger reconnection */
  reconnect: () => void;

  /** Manually disconnect */
  disconnect: () => void;

  /** Clear all logs */
  clearLogs: () => void;
}

/**
 * WebSocket message types from backend
 */
interface WebSocketMessage {
  type: string;
  project_id?: string;
  progress?: number;
  message?: string;
  agent?: string;
  status?: string;
  task?: string;
  stage?: string;
  level?: 'info' | 'success' | 'error' | 'warning';
  emoji?: string;
  deployment_url?: string;
  error?: string;
}

/**
 * Generate unique log entry ID
 */
function generateLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * useAgentSwarmWebSocket Hook
 * Manages WebSocket connection for real-time Agent Swarm monitoring
 */
export function useAgentSwarmWebSocket(
  options: UseAgentSwarmWebSocketOptions
): UseAgentSwarmWebSocketReturn {
  const {
    projectId,
    onConnectionStatusChange,
    enableFallback = true,
    maxReconnectAttempts = 5,
    pollingInterval = 5000,
    maxLogs = 100,
    autoConnect = true,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(autoConnect);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState<Map<string, AgentStatus>>(new Map());

  // Refs
  const wsClientRef = useRef<WebSocketClient | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLogIdRef = useRef<string | null>(null);

  /**
   * Add a log entry
   */
  const addLog = useCallback(
    (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
      const newEntry: LogEntry = {
        ...entry,
        id: generateLogId(),
        timestamp: new Date(),
      };

      setLogs((prev) => [...prev, newEntry].slice(-maxLogs));
    },
    [maxLogs]
  );

  /**
   * Update agent status
   */
  const updateAgentStatus = useCallback(
    (agentName: string, status: string, progress: number, task?: string) => {
      setAgents((prev) => {
        const newMap = new Map(prev);
        newMap.set(agentName, {
          name: agentName,
          status: status as AgentStatus['status'],
          progress,
          currentTask: task,
        });
        return newMap;
      });
    },
    []
  );

  /**
   * Handle incoming WebSocket message
   */
  const handleMessage = useCallback(
    (data: unknown) => {
      const message = data as WebSocketMessage;

      switch (message.type) {
        case 'connection_established':
          addLog({
            type: 'success',
            message: `Real-time updates active for project: ${message.project_id}`,
          });
          break;

        case 'project_started':
          addLog({
            type: 'info',
            message: 'Agent Swarm project started',
          });
          break;

        case 'project_progress':
          addLog({
            type: 'info',
            message: `Progress: ${message.progress}% - ${message.message}`,
          });
          break;

        case 'agent_status_update':
          if (message.agent) {
            updateAgentStatus(
              message.agent,
              message.status || 'working',
              message.progress || 0,
              message.task
            );
            addLog({
              type: 'agent_status',
              message: `${message.agent}: ${message.task || message.status} (${message.progress}%)`,
              agent: message.agent,
              progress: message.progress,
              status: message.status,
            });
          }
          break;

        case 'workflow_stage_update':
          addLog({
            type: 'info',
            message: `${message.stage}: ${message.message}`,
          });
          break;

        case 'workflow_log':
          addLog({
            type: (message.level as LogEntry['type']) || 'info',
            message: message.emoji
              ? `${message.emoji} ${message.message}`
              : message.message || '',
          });
          break;

        case 'project_completed':
          addLog({
            type: 'success',
            message: `Project completed successfully!${message.deployment_url ? ` Deployed at: ${message.deployment_url}` : ''}`,
          });
          break;

        case 'project_error':
          addLog({
            type: 'error',
            message: `Error: ${message.error}`,
          });
          break;

        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    },
    [addLog, updateAgentStatus]
  );

  /**
   * Poll for logs (fallback mode)
   */
  const pollLogs = useCallback(async () => {
    try {
      const [logsResponse] = await Promise.all([
        agentSwarmService.getProjectLogs(projectId, 50),
      ]);

      // Convert API logs to LogEntries
      const newLogs = logsResponse
        .filter((log: ProjectLog) => log.id !== lastLogIdRef.current)
        .map((log: ProjectLog) => ({
          id: log.id,
          timestamp: new Date(log.timestamp),
          type: log.level as LogEntry['type'],
          message: log.message,
          agent: log.agent,
        }));

      if (newLogs.length > 0) {
        setLogs((prev) => [...prev, ...newLogs].slice(-maxLogs));
        lastLogIdRef.current = newLogs[newLogs.length - 1].id;
      }
    } catch (err) {
      console.error('Failed to poll logs:', err);
    }
  }, [projectId, maxLogs]);

  /**
   * Start polling (fallback mode)
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return;
    }

    pollLogs(); // Initial poll
    pollingIntervalRef.current = setInterval(pollLogs, pollingInterval);
  }, [pollLogs, pollingInterval]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Create and connect WebSocket client
   */
  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
    }

    // Stop polling if active
    stopPolling();

    // Get auth token
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token') || localStorage.getItem('accessToken')
        : null;

    // Build WebSocket URL
    const wsUrl = buildAgentSwarmWebSocketUrl(projectId, token || undefined);

    if (!wsUrl) {
      setError('Failed to build WebSocket URL');
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Create WebSocket client
    const client = createWebSocketClient({
      url: wsUrl,
      reconnect: true,
      maxReconnectAttempts,
      initialReconnectDelay: 1000,
      maxReconnectDelay: 30000,
      reconnectBackoffMultiplier: 2,
      enableFallback,

      onConnect: () => {
        setIsConnected(true);
        setIsConnecting(false);
        setIsUsingFallback(false);
        setError(null);
        onConnectionStatusChange?.(true);

        addLog({
          type: 'success',
          message: 'Connected to real-time agent monitoring',
        });
      },

      onDisconnect: () => {
        setIsConnected(false);
        onConnectionStatusChange?.(false);

        if (client.getState() === WebSocketState.RECONNECTING) {
          addLog({
            type: 'warning',
            message: 'Disconnected from real-time monitoring. Reconnecting...',
          });
        }
      },

      onMessage: handleMessage,

      onError: (err) => {
        const errorMessage =
          err instanceof Error ? err.message : 'WebSocket connection error';
        setError(errorMessage);

        addLog({
          type: 'error',
          message: `WebSocket error: ${errorMessage}`,
        });
      },

      onFallbackToPolling: () => {
        setIsUsingFallback(true);
        setIsConnecting(false);

        addLog({
          type: 'warning',
          message: 'WebSocket unavailable. Switching to polling mode.',
        });

        // Start polling for logs
        startPolling();
      },

      onMaxReconnectAttemptsReached: () => {
        if (!enableFallback) {
          setIsConnecting(false);
          setError('Failed to establish connection after multiple attempts');
        }
      },
    });

    wsClientRef.current = client;
    client.connect();

    addLog({
      type: 'info',
      message: 'Connecting to Agent Swarm WebSocket...',
    });
  }, [
    projectId,
    maxReconnectAttempts,
    enableFallback,
    onConnectionStatusChange,
    addLog,
    handleMessage,
    startPolling,
    stopPolling,
  ]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    stopPolling();

    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsUsingFallback(false);
  }, [stopPolling]);

  /**
   * Reconnect to WebSocket
   */
  const reconnect = useCallback(() => {
    disconnect();
    // Reset fallback state
    setIsUsingFallback(false);
    connect();
  }, [disconnect, connect]);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
    lastLogIdRef.current = null;
  }, []);

  // Connect on mount and when projectId changes
  useEffect(() => {
    if (!autoConnect) {
      return;
    }

    // Clear agents when project changes
    setAgents(new Map());
    setLogs([]);
    lastLogIdRef.current = null;

    connect();

    return () => {
      disconnect();
    };
  }, [projectId, autoConnect]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isConnected,
    isConnecting,
    isUsingFallback,
    error,
    logs,
    agents,
    reconnect,
    disconnect,
    clearLogs,
  };
}

export default useAgentSwarmWebSocket;
