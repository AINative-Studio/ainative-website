"use client"

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  agent: string;
  emoji: string;
  message: string;
  step_name?: string;
}

interface LogViewerProps {
  projectId: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ projectId }) => {
  const [selectedAgent, setSelectedAgent] = React.useState<string>('all');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useQuery({
    queryKey: ['agent-swarm-logs', projectId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `/api/v1/admin/agent-swarms/projects/${projectId}/logs?limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const result = await response.json();
      return result.logs as LogEntry[];
    },
    refetchInterval: 5000,
  });

  const logs = data || [];

  const filteredLogs = React.useMemo(() => {
    let filtered = [...logs];

    if (selectedAgent !== 'all') {
      filtered = filtered.filter(log => log.agent === selectedAgent);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(query) ||
        log.agent.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [logs, selectedAgent, selectedLevel, searchQuery]);

  const uniqueAgents = React.useMemo(() => {
    const agents = new Set(logs.map(log => log.agent));
    return Array.from(agents).sort();
  }, [logs]);

  React.useEffect(() => {
    if (scrollContainerRef.current && scrollContainerRef.current.lastElementChild) {
      const lastChild = scrollContainerRef.current.lastElementChild;
      if (typeof lastChild.scrollIntoView === 'function') {
        lastChild.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [filteredLogs.length]);

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return timestamp;
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
      default:
        return 'text-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="log-viewer flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="log-viewer flex items-center justify-center p-8">
        <p className="text-destructive">Error loading logs. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="log-viewer flex flex-col h-full space-y-4">
      <div className="log-controls flex flex-col sm:flex-row gap-3">
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger
            className="w-full sm:w-[200px]"
            aria-label="Filter by agent"
          >
            <SelectValue placeholder="Filter: All Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {uniqueAgents.map(agent => (
              <SelectItem key={agent} value={agent}>
                {agent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger
            className="w-full sm:w-[200px]"
            aria-label="Level filter"
          >
            <SelectValue placeholder="Level: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="search"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <ScrollArea className="log-container flex-1 h-[600px] rounded-md border p-4">
        <div
          ref={scrollContainerRef}
          data-testid="log-scroll-container"
          className="space-y-2"
        >
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No logs available for the selected filters.
            </div>
          )}

          {filteredLogs.map((log, idx) => (
            <div
              key={`${log.timestamp}-${idx}`}
              data-testid={`log-entry-${idx}`}
              className={cn(
                'log-entry flex flex-wrap items-start gap-2 p-2 rounded text-sm hover:bg-accent/50 transition-colors',
                `log-${log.level}`
              )}
            >
              <span className="log-timestamp text-muted-foreground font-mono text-xs shrink-0">
                {formatTime(log.timestamp)}
              </span>

              <Badge
                variant={log.level === 'error' ? 'destructive' : log.level === 'warning' ? 'outline' : 'secondary'}
                className="shrink-0"
              >
                {log.level.toUpperCase()}
              </Badge>

              <span className="log-emoji shrink-0">
                {log.emoji}
              </span>

              <span className="log-agent font-medium shrink-0">
                {log.agent}:
              </span>

              <span className={cn('log-message flex-1', getLevelColor(log.level))}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LogViewer;
