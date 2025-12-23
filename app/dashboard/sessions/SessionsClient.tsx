'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Clock, Database, Trash2, Search, RefreshCw,
  ChevronRight, AlertCircle, Brain, Layers, Filter, X,
  Plus, Eye, Activity, Archive, CheckCircle
} from 'lucide-react';
import {
  sessionService,
  Session,
  SessionDetail,
  MemorySearchResult,
  MemoryStats,
  MemoryEntry,
} from '@/lib/session-service';

// Mock data for development
const mockSessions: Session[] = [
  {
    id: 'session-1',
    agent_id: 'agent-1',
    created_at: '2025-12-21T10:00:00Z',
    updated_at: '2025-12-21T14:30:00Z',
    status: 'active',
    message_count: 45,
    context_size: 12500,
  },
  {
    id: 'session-2',
    agent_id: 'agent-1',
    created_at: '2025-12-20T09:00:00Z',
    updated_at: '2025-12-20T18:00:00Z',
    status: 'completed',
    message_count: 128,
    context_size: 35000,
  },
  {
    id: 'session-3',
    agent_id: 'agent-2',
    created_at: '2025-12-19T14:00:00Z',
    updated_at: '2025-12-19T16:30:00Z',
    status: 'archived',
    message_count: 32,
    context_size: 8500,
  },
];

const mockMemoryStats: MemoryStats = {
  session_id: 'session-1',
  total_memories: 150,
  total_tokens: 25000,
  by_role: {
    user: { count: 50, tokens: 8000 },
    assistant: { count: 80, tokens: 15000 },
    system: { count: 20, tokens: 2000 },
  },
  context_window_usage: 0.31,
  created_at: '2025-12-21T10:00:00Z',
  last_updated: '2025-12-21T14:30:00Z',
};

const mockMemoryEntries: MemoryEntry[] = [
  {
    id: 'mem-1',
    content: 'Discussion about React hooks including useState, useEffect, and custom hooks patterns',
    role: 'assistant',
    timestamp: '2025-12-21T14:00:00Z',
    relevance_score: 0.95,
  },
  {
    id: 'mem-2',
    content: 'User asked about best practices for state management in large React applications',
    role: 'user',
    timestamp: '2025-12-21T13:55:00Z',
    relevance_score: 0.92,
  },
  {
    id: 'mem-3',
    content: 'System context: User preferences include TypeScript, functional components, and TDD',
    role: 'system',
    timestamp: '2025-12-21T10:00:00Z',
    relevance_score: 0.88,
  },
];

type SessionStatus = 'active' | 'completed' | 'archived';
type Tab = 'sessions' | 'memory' | 'stats';

export default function SessionsClient() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>(mockMemoryEntries);
  const [memoryStats, setMemoryStats] = useState<MemoryStats>(mockMemoryStats);
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusColors: Record<SessionStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    active: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Activity className="w-3 h-3" /> },
    completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <CheckCircle className="w-3 h-3" /> },
    archived: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <Archive className="w-3 h-3" /> },
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    user: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    assistant: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    system: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
    return tokens.toString();
  };

  const filteredSessions = sessions.filter((session) => {
    if (statusFilter !== 'all' && session.status !== statusFilter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        session.id.toLowerCase().includes(query) ||
        session.agent_id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // In production: await sessionService.deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } catch (err) {
      setError('Failed to delete session');
    }
  };

  const handleClearMemory = async (sessionId: string) => {
    try {
      // In production: await sessionService.clearSessionMemory(sessionId);
      setMemoryEntries([]);
      setMemoryStats({
        ...memoryStats,
        total_memories: 0,
        total_tokens: 0,
        by_role: {
          user: { count: 0, tokens: 0 },
          assistant: { count: 0, tokens: 0 },
          system: { count: 0, tokens: 0 },
        },
        context_window_usage: 0,
      });
    } catch (err) {
      setError('Failed to clear memory');
    }
  };

  const handleSearchMemory = async () => {
    if (!searchQuery) return;
    try {
      setIsLoading(true);
      // In production: const results = await sessionService.searchMemory({ query: searchQuery, limit: 20 });
      // For now, filter mock data
      const filtered = mockMemoryEntries.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setMemoryEntries(filtered);
    } catch (err) {
      setError('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Session & Memory Management</h1>
          <p className="text-gray-400 mt-1">
            Manage AI sessions and memory context for persistent conversations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {/* Refresh logic */}}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded-lg w-fit">
        {(['sessions', 'memory', 'stats'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab === 'sessions' && <MessageSquare className="w-4 h-4 inline-block mr-2" />}
            {tab === 'memory' && <Brain className="w-4 h-4 inline-block mr-2" />}
            {tab === 'stats' && <Activity className="w-4 h-4 inline-block mr-2" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SessionStatus | 'all')}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Sessions List */}
          <div className="grid gap-4">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 bg-gray-800/50 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                  selectedSession?.id === session.id ? 'border-primary' : 'border-gray-700'
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{session.id}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                          statusColors[session.status].bg
                        } ${statusColors[session.status].text}`}>
                          {statusColors[session.status].icon}
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Agent: {session.agent_id}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.updated_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {session.message_count} messages
                        </span>
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {formatTokens(session.context_size)} tokens
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSession(session);
                        setActiveTab('memory');
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="View Memory"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredSessions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sessions found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === 'memory' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search memory entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchMemory()}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearchMemory}
              disabled={isLoading}
              className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Search
            </motion.button>
          </div>

          {/* Session Context */}
          {selectedSession && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-400">Viewing memory for:</span>
                  <span className="ml-2 text-white font-medium">{selectedSession.id}</span>
                </div>
                <button
                  onClick={() => handleClearMemory(selectedSession.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Memory
                </button>
              </div>
            </div>
          )}

          {/* Memory Entries */}
          <div className="space-y-3">
            {memoryEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      roleColors[entry.role].bg
                    } ${roleColors[entry.role].text}`}>
                      {entry.role}
                    </span>
                    <div>
                      <p className="text-white text-sm">{entry.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.timestamp)}
                        </span>
                        {entry.relevance_score && (
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {(entry.relevance_score * 100).toFixed(0)}% relevance
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {/* Delete memory entry */}}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            {memoryEntries.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No memory entries found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Layers className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{memoryStats.total_memories}</p>
                  <p className="text-sm text-gray-400">Total Memories</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Database className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{formatTokens(memoryStats.total_tokens)}</p>
                  <p className="text-sm text-gray-400">Total Tokens</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {(memoryStats.context_window_usage * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-400">Context Usage</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{sessions.length}</p>
                  <p className="text-sm text-gray-400">Total Sessions</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Memory Breakdown by Role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Memory Breakdown by Role</h3>
            <div className="space-y-4">
              {Object.entries(memoryStats.by_role).map(([role, stats]) => {
                const percentage = memoryStats.total_memories > 0
                  ? (stats.count / memoryStats.total_memories) * 100
                  : 0;
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          roleColors[role].bg
                        } ${roleColors[role].text}`}>
                          {role}
                        </span>
                        <span className="text-sm text-gray-400">
                          {stats.count} memories ({formatTokens(stats.tokens)} tokens)
                        </span>
                      </div>
                      <span className="text-sm text-white font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          role === 'user' ? 'bg-blue-500' :
                          role === 'assistant' ? 'bg-purple-500' : 'bg-yellow-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Context Window Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Context Window Usage</h3>
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {formatTokens(memoryStats.total_tokens)} / 80,000 tokens
                </span>
                <span className={`text-sm font-medium ${
                  memoryStats.context_window_usage > 0.8 ? 'text-red-400' :
                  memoryStats.context_window_usage > 0.6 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {(memoryStats.context_window_usage * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${memoryStats.context_window_usage * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    memoryStats.context_window_usage > 0.8 ? 'bg-red-500' :
                    memoryStats.context_window_usage > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
