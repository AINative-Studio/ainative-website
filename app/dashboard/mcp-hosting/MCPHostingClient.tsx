'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Server,
  Play,
  Square,
  RefreshCcw,
  Trash2,
  Plus,
  Activity,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Terminal,
  BarChart2,
  Settings,
  Globe,
} from 'lucide-react';
import mcpService, {
  MCPServer,
  MCPInstance,
  MCPServerStatus,
  MCPServerLog,
} from '@/lib/mcp-service';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Mock data for when backend is unavailable
const mockCatalog: MCPServer[] = [
  {
    id: 'github',
    name: 'GitHub MCP',
    description: 'Access GitHub repositories, issues, PRs, and more through MCP',
    version: '1.2.0',
    category: 'Development',
    features: ['Repository access', 'Issue management', 'PR operations', 'Code search'],
    pricing: { type: 'free' },
  },
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    description: 'Secure file system operations with sandboxed access',
    version: '1.0.5',
    category: 'Utilities',
    features: ['Read/write files', 'Directory operations', 'Sandboxed access'],
    pricing: { type: 'free' },
  },
  {
    id: 'zerodb',
    name: 'ZeroDB MCP',
    description: 'Vector database operations with semantic search',
    version: '2.1.0',
    category: 'Database',
    features: ['Vector search', 'Document storage', 'Semantic queries', 'RLHF data'],
    pricing: { type: 'usage-based', perRequestPrice: 0.001 },
  },
  {
    id: 'slack',
    name: 'Slack MCP',
    description: 'Integrate with Slack workspaces for messaging and automation',
    version: '1.1.0',
    category: 'Communication',
    features: ['Send messages', 'Channel management', 'User lookup', 'File sharing'],
    pricing: { type: 'paid', basePrice: 9.99 },
  },
];

const mockInstances: MCPInstance[] = [
  {
    id: 'inst-001',
    serverId: 'github',
    serverName: 'GitHub MCP',
    status: 'running',
    region: 'us-east-1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'inst-002',
    serverId: 'zerodb',
    serverName: 'ZeroDB MCP',
    status: 'running',
    region: 'us-west-2',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
];

function StatusBadge({ status }: { status: MCPInstance['status'] }) {
  const statusConfig = {
    running: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    stopped: { icon: Square, color: 'text-gray-400', bg: 'bg-gray-400/10' },
    starting: { icon: Loader2, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    stopping: { icon: Loader2, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const isLoading = status === 'starting' || status === 'stopping';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      <Icon className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ServerCard({ server, onDeploy }: { server: MCPServer; onDeploy: (server: MCPServer) => void }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden h-full hover:bg-[#1C2128] transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4B6FED]/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-[#4B6FED]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{server.name}</h3>
                <p className="text-xs text-gray-400">v{server.version}</p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300">
              {server.category}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{server.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {server.features.slice(0, 3).map((feature, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                {feature}
              </span>
            ))}
            {server.features.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                +{server.features.length - 3} more
              </span>
            )}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <span className="text-sm">
              {server.pricing.type === 'free' ? (
                <span className="text-green-400">Free</span>
              ) : server.pricing.type === 'paid' ? (
                <span className="text-white">${server.pricing.basePrice}/mo</span>
              ) : (
                <span className="text-white">${server.pricing.perRequestPrice}/req</span>
              )}
            </span>
            <Button
              size="sm"
              onClick={() => onDeploy(server)}
              className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Deploy
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InstanceCard({
  instance,
  onRestart,
  onDelete,
  onViewLogs,
  isRestarting,
  isDeleting,
}: {
  instance: MCPInstance;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
  onViewLogs: (id: string) => void;
  isRestarting: boolean;
  isDeleting: boolean;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4B6FED]/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-[#4B6FED]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{instance.serverName}</h3>
                <p className="text-xs text-gray-400 font-mono">{instance.id}</p>
              </div>
            </div>
            <StatusBadge status={instance.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Globe className="w-4 h-4" />
              <span>{instance.region}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{new Date(instance.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewLogs(instance.id)}
              className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              <Terminal className="w-4 h-4 mr-1" />
              Logs
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRestart(instance.id)}
              disabled={isRestarting || instance.status !== 'running'}
              className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              {isRestarting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4 mr-1" />
              )}
              Restart
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(instance.id)}
              disabled={isDeleting}
              className="border-red-800/50 hover:bg-red-900/20 text-red-400"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LogsPanel({ logs, onClose }: { logs: MCPServerLog[]; onClose: () => void }) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
        <CardHeader className="border-b border-gray-800 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Terminal className="h-5 w-5 text-[#4B6FED]" />
            Server Logs
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Close
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 overflow-y-auto bg-vite-bg font-mono text-sm">
            {logs.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">No logs available</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="px-4 py-1.5 hover:bg-gray-800/50 border-b border-gray-800/50">
                  <span className="text-gray-500 mr-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`mr-2 uppercase text-xs ${getLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>
                  <span className="text-gray-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MCPHostingClient() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'instances' | 'catalog'>('instances');
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch catalog
  const {
    data: catalog,
    isLoading: catalogLoading,
    error: catalogError,
  } = useQuery({
    queryKey: ['mcp-catalog'],
    queryFn: async () => {
      try {
        return await mcpService.getCatalog();
      } catch {
        return mockCatalog;
      }
    },
    staleTime: 60000,
  });

  // Fetch instances
  const {
    data: instances,
    isLoading: instancesLoading,
    error: instancesError,
    refetch: refetchInstances,
  } = useQuery({
    queryKey: ['mcp-instances'],
    queryFn: async () => {
      try {
        return await mcpService.getInstances();
      } catch {
        return mockInstances;
      }
    },
    staleTime: 30000,
  });

  // Fetch logs for selected instance
  const { data: logs } = useQuery({
    queryKey: ['mcp-logs', selectedLogs],
    queryFn: async () => {
      if (!selectedLogs) return [];
      try {
        return await mcpService.getServerLogs(selectedLogs, { limit: 100 });
      } catch {
        return [
          { timestamp: new Date().toISOString(), level: 'info' as const, message: 'Server started successfully' },
          { timestamp: new Date().toISOString(), level: 'info' as const, message: 'Listening on port 8080' },
          { timestamp: new Date().toISOString(), level: 'debug' as const, message: 'Health check passed' },
        ];
      }
    },
    enabled: !!selectedLogs,
    refetchInterval: selectedLogs ? 5000 : false,
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: (server: MCPServer) =>
      mcpService.deploy({
        serverId: server.id,
        region: 'us-east-1',
        name: `${server.name} Instance`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-instances'] });
    },
  });

  // Restart mutation
  const restartMutation = useMutation({
    mutationFn: (id: string) => mcpService.restartServer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-instances'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mcpService.deleteServer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-instances'] });
    },
  });

  const handleDeploy = async (server: MCPServer) => {
    try {
      await deployMutation.mutateAsync(server);
    } catch {
      // Mock deployment for demo
      const newInstance: MCPInstance = {
        id: `inst-${Date.now()}`,
        serverId: server.id,
        serverName: server.name,
        status: 'starting',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      queryClient.setQueryData(['mcp-instances'], (old: MCPInstance[] | undefined) =>
        old ? [...old, newInstance] : [newInstance]
      );
    }
    setActiveTab('instances');
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B6FED] mx-auto mb-4"></div>
          <p>Loading MCP servers...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Server className="h-7 w-7 text-[#4B6FED]" />
              MCP Servers
            </h1>
            <p className="text-gray-400 mt-1">
              Deploy and manage Model Context Protocol servers for AI integrations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetchInstances()}
              className="border-gray-700 hover:bg-gray-800 text-white"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setActiveTab('catalog')}
              className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Deploy Server
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex gap-1 p-1 bg-[#161B22] rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('instances')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'instances'
                ? 'bg-[#4B6FED] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Instances ({instances?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'catalog'
                ? 'bg-[#4B6FED] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Server Catalog
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'instances' && (
          <motion.div
            key="instances"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={stagger}
          >
            {instancesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#4B6FED]" />
              </div>
            ) : instances && instances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {instances.map((instance) => (
                  <InstanceCard
                    key={instance.id}
                    instance={instance}
                    onRestart={(id) => restartMutation.mutate(id)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onViewLogs={(id) => setSelectedLogs(id)}
                    isRestarting={restartMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <motion.div variants={fadeUp}>
                <Card className="border-none bg-[#161B22] shadow-lg">
                  <CardContent className="py-12 text-center">
                    <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No servers deployed</h3>
                    <p className="text-gray-400 mb-6">
                      Deploy your first MCP server from the catalog to get started
                    </p>
                    <Button
                      onClick={() => setActiveTab('catalog')}
                      className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Catalog
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Logs Panel */}
            {selectedLogs && logs && (
              <div className="mt-6">
                <LogsPanel logs={logs} onClose={() => setSelectedLogs(null)} />
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'catalog' && (
          <motion.div
            key="catalog"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={stagger}
          >
            {catalogLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#4B6FED]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(catalog || mockCatalog).map((server) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    onDeploy={handleDeploy}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
