/**
 * Agent Swarm WebSocket Hook
 * Custom React hook for managing WebSocket connections to Agent Swarm projects
 * Refs #430
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketClient, WebSocketMessage } from '@/lib/websocket-client';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning' | 'agent_status';
  message: string;
  emoji?: string;
  agent?: string;
  progress?: number;
  status?: string;
}

export interface AgentStatus {
  name: string;
  status: 'idle' | 'working' | 'completed' | 'failed';
  progress: number;
  currentTask?: string;
}

export interface UseAgentSwarmWebSocketConfig {
  projectId: string;
  enabled?: boolean;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

export interface UseAgentSwarmWebSocketReturn {
  logs: LogEntry[];
  agents: Map<string, AgentStatus>;
  connected: boolean;
  error: string | null;
  reconnectAttempts: number;
  clearLogs: () => void;
  disconnect: () => void;
}

export function useAgentSwarmWebSocket({
  projectId,
  enabled = true,
  onConnectionChange,
  onError,
}: UseAgentSwarmWebSocketConfig): UseAgentSwarmWebSocketReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState<Map<string, AgentStatus>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsClientRef = useRef<WebSocketClient | null>(null);

  /**
   * Add a log entry
   */
  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setLogs((prev) => [...prev, newEntry].slice(-100)); // Keep last 100 logs
  }, []);

  /**
   * Update agent status
   */
  const updateAgentStatus = useCallback((agentName: string, status: string, progress: number, task?: string) => {
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
  }, []);

  /**
   * Handle WebSocket messages
   */
  const handleMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
      case 'connection_established':
        addLog({
          type: 'success',
          message: `Real-time updates active for project: ${data.project_id}`,
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
          message: `Progress: ${data.progress}% - ${data.message}`,
        });
        break;

      case 'agent_status_update':
        updateAgentStatus(
          data.agent as string,
          data.status as string,
          data.progress as number,
          data.task as string | undefined
        );
        addLog({
          type: 'agent_status',
          message: `${data.agent}: ${data.task || data.status} (${data.progress}%)`,
          agent: data.agent as string,
          progress: data.progress as number,
          status: data.status as string,
        });
        break;

      case 'workflow_stage_update':
        addLog({
          type: 'info',
          message: `${data.stage}: ${data.message}`,
        });
        break;

      case 'workflow_log':
        addLog({
          type: data.level as LogEntry['type'],
          message: `${data.emoji || ''} ${data.message}`,
          emoji: data.emoji as string | undefined,
        });
        break;

      case 'project_completed':
        addLog({
          type: 'success',
          message: `Project completed successfully! ${data.deployment_url ? `Deployed at: ${data.deployment_url}` : ''}`,
        });
        break;

      case 'project_error':
        addLog({
          type: 'error',
          message: `Error: ${data.error}`,
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, [addLog, updateAgentStatus]);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsClientRef.current) {
      wsClientRef.current.close();
      wsClientRef.current = null;
    }
  }, []);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    if (!enabled || !projectId) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const wsUrl = `${protocol}//${hostname}:8000/ws/admin/agent-swarm/${projectId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    addLog({
      type: 'info',
      message: 'Connecting to Agent Swarm WebSocket...',
    });

    const wsClient = new WebSocketClient({
      url: wsUrl,
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      reconnectBackoffMultiplier: 1.5,
      maxReconnectInterval: 30000,
      onOpen: () => {
        setConnected(true);
        setError(null);
        setReconnectAttempts(0);
        onConnectionChange?.(true);
        addLog({
          type: 'success',
          message: 'Connected to real-time agent monitoring',
        });
      },
      onClose: () => {
        setConnected(false);
        onConnectionChange?.(false);
        addLog({
          type: 'warning',
          message: 'Disconnected from real-time monitoring',
        });
      },
      onError: (event) => {
        const errorMsg = 'WebSocket connection error';
        setError(errorMsg);
        onError?.(errorMsg);
        addLog({
          type: 'error',
          message: errorMsg,
        });
      },
      onMessage: handleMessage,
      onReconnect: (attempt) => {
        setReconnectAttempts(attempt);
        addLog({
          type: 'warning',
          message: `Reconnecting... (attempt ${attempt})`,
        });
      },
    });

    wsClient.connect();
    wsClientRef.current = wsClient;

    return () => {
      wsClient.close();
    };
  }, [projectId, enabled, addLog, handleMessage, onConnectionChange, onError]);

  return {
    logs,
    agents,
    connected,
    error,
    reconnectAttempts,
    clearLogs,
    disconnect,
  };
}
