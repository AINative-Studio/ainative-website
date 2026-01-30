'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, XCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExecutionTimer from './ExecutionTimer';
import { useAgentSwarmWebSocket, type LogEntry, type AgentStatus } from '@/hooks/useAgentSwarmWebSocket';

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
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Use the custom WebSocket hook
  const { logs, agents, connected, error: wsError } = useAgentSwarmWebSocket({
    projectId,
    enabled: true,
    onConnectionChange: onConnectionStatusChange,
  });

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

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
