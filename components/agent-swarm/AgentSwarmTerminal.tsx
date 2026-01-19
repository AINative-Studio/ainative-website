'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, XCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExecutionTimer from './ExecutionTimer';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning' | 'agent_status';
  message: string;
  emoji?: string;
  agent?: string;
  progress?: number;
  status?: string;
}

interface AgentStatus {
  name: string;
  status: 'idle' | 'working' | 'completed' | 'failed';
  progress: number;
  currentTask?: string;
}

interface AgentSwarmTerminalProps {
  projectId: string;
  projectStatus?: 'analyzing' | 'building' | 'completed' | 'failed' | 'paused';
  projectStartedAt?: Date;
  estimatedDurationSeconds?: number;
  onConnectionStatusChange?: (connected: boolean) => void;
  onTimerComplete?: () => void;
}

const STATUS_ICONS = {
  idle: <Clock className="w-4 h-4 text-gray-400" />,
  working: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  completed: <CheckCircle className="w-4 h-4 text-green-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
};

const LOG_TYPE_COLORS = {
  info: 'text-blue-300',
  success: 'text-green-300',
  error: 'text-red-300',
  warning: 'text-yellow-300',
  agent_status: 'text-purple-300',
};

export default function AgentSwarmTerminal({
  projectId,
  projectStatus,
  projectStartedAt,
  estimatedDurationSeconds = 300,
  onConnectionStatusChange,
  onTimerComplete,
}: AgentSwarmTerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agents, setAgents] = useState<Map<string, AgentStatus>>(new Map());
  const [connected, setConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setLogs((prev) => [...prev, newEntry].slice(-100));
  };

  const updateAgentStatus = (agentName: string, status: string, progress: number, task?: string) => {
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
  };

  const connectWebSocket = () => {
    try {
      const token = localStorage.getItem('access_token');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/admin/agent-swarm/${projectId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;

      addLog({
        type: 'info',
        message: `Connecting to Agent Swarm WebSocket...`,
        emoji: '',
      });

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setWsError(null);
        onConnectionStatusChange?.(true);
        addLog({
          type: 'success',
          message: `Connected to real-time agent monitoring`,
          emoji: '',
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'connection_established':
              addLog({
                type: 'success',
                message: `Real-time updates active for project: ${data.project_id}`,
                emoji: '',
              });
              break;

            case 'project_started':
              addLog({
                type: 'info',
                message: `Agent Swarm project started`,
                emoji: '',
              });
              break;

            case 'project_progress':
              addLog({
                type: 'info',
                message: `Progress: ${data.progress}% - ${data.message}`,
                emoji: '',
              });
              break;

            case 'agent_status_update':
              updateAgentStatus(data.agent, data.status, data.progress, data.task);
              addLog({
                type: 'agent_status',
                message: `${data.agent}: ${data.task || data.status} (${data.progress}%)`,
                emoji: '',
                agent: data.agent,
                progress: data.progress,
                status: data.status,
              });
              break;

            case 'workflow_stage_update':
              addLog({
                type: 'info',
                message: `${data.stage}: ${data.message}`,
                emoji: '',
              });
              break;

            case 'workflow_log':
              addLog({
                type: data.level as LogEntry['type'],
                message: `${data.emoji || ''} ${data.message}`,
                emoji: data.emoji,
              });
              break;

            case 'project_completed':
              addLog({
                type: 'success',
                message: `Project completed successfully! ${data.deployment_url ? `Deployed at: ${data.deployment_url}` : ''}`,
                emoji: '',
              });
              break;

            case 'project_error':
              addLog({
                type: 'error',
                message: `Error: ${data.error}`,
                emoji: '',
              });
              break;

            default:
              console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsError('Connection error occurred');
        addLog({
          type: 'error',
          message: `WebSocket connection error`,
          emoji: '',
        });
      };

      ws.onclose = () => {
        setConnected(false);
        onConnectionStatusChange?.(false);
        addLog({
          type: 'warning',
          message: `Disconnected from real-time monitoring. Reconnecting...`,
          emoji: '',
        });

        reconnectTimeoutRef.current = setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            connectWebSocket();
          }
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setWsError('Failed to establish connection');
      addLog({
        type: 'error',
        message: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        emoji: '',
      });
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-vite-bg border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400" />
            <span>Agent Swarm Terminal</span>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Connecting...
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 pb-0">
          <ExecutionTimer
            status={projectStatus || 'paused'}
            startedAt={projectStartedAt}
            estimatedDurationSeconds={estimatedDurationSeconds}
            onComplete={onTimerComplete}
          />
        </div>

        {agents.size > 0 && (
          <div className="border-b border-gray-800 p-4 bg-[#161B22]">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Active Agents</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from(agents.values()).map((agent) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-2 bg-vite-bg rounded border border-gray-800"
                >
                  {STATUS_ICONS[agent.status]}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-200 truncate">
                      {agent.name}
                    </div>
                    {agent.currentTask && (
                      <div className="text-xs text-gray-500 truncate">
                        {agent.currentTask}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 bg-gray-800 rounded-full h-1">
                        <motion.div
                          className="bg-blue-400 h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{agent.progress}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="font-mono text-xs h-[400px] overflow-y-auto p-4 bg-black/50">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 mb-1 ${LOG_TYPE_COLORS[log.type]}`}
              >
                <span className="text-gray-500">[{formatTime(log.timestamp)}]</span>
                <span className="flex-1">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>

        {wsError && (
          <div className="border-t border-gray-800 p-3 bg-red-900/20">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{wsError}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
