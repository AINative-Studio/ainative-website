'use client';

import { useState, useSyncExternalStore } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Zap,
  Play,
  Square,
  RefreshCcw,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart2,
  Target,
  Timer,
  Users,
  TrendingUp,
  Globe,
  ChevronRight,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import loadTestingService, {
  LoadTestScenario,
  LoadTest,
  LoadTestMetrics,
} from '@/lib/load-testing-service';

const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

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


// API Endpoints from OpenAPI spec at api.ainative.studio
interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
}

interface APIEndpointCategory {
  name: string;
  endpoints: APIEndpoint[];
}

const API_ENDPOINTS: APIEndpointCategory[] = [
  {
    name: 'Authentication',
    endpoints: [
      { method: 'POST', path: '/v1/auth/auth/login', description: 'Login user with email/password', requiresAuth: false },
      { method: 'POST', path: '/v1/auth/auth/register', description: 'Register new user with email verification', requiresAuth: false },
      { method: 'POST', path: '/v1/auth/auth/refresh', description: 'Refresh access token', requiresAuth: false },
      { method: 'GET', path: '/v1/auth/auth/me', description: 'Get current authenticated user', requiresAuth: true },
      { method: 'POST', path: '/v1/auth/auth/logout', description: 'Logout user by blacklisting token', requiresAuth: true },
    ],
  },
  {
    name: 'Chat & Conversations',
    endpoints: [
      { method: 'GET', path: '/v1/chat/health', description: 'Health check for chat service', requiresAuth: false },
      { method: 'GET', path: '/v1/chat/sessions', description: "Get user's chat sessions", requiresAuth: false },
      { method: 'POST', path: '/v1/chat/sessions', description: 'Create a new chat session', requiresAuth: false },
      { method: 'POST', path: '/v1/chat/completions', description: 'Chat completion with agentic tool calling', requiresAuth: false },
      { method: 'GET', path: '/v1/chat/sessions/{session_id}/messages', description: 'Get messages from a chat session', requiresAuth: false },
    ],
  },
  {
    name: 'Dashboard',
    endpoints: [
      { method: 'GET', path: '/v1/dashboard', description: 'Get dashboard overview and metrics', requiresAuth: true },
      { method: 'GET', path: '/v1/dashboard/overview', description: 'Get aggregated platform metrics', requiresAuth: true },
      { method: 'GET', path: '/v1/dashboard/quick-stats', description: 'Get key metrics for widgets', requiresAuth: true },
      { method: 'GET', path: '/v1/dashboard/activity', description: 'Get recent activity feed', requiresAuth: true },
    ],
  },
  {
    name: 'Gift Campaigns',
    endpoints: [
      { method: 'POST', path: '/v1/campaigns/redeem', description: 'Redeem gift code for campaign access', requiresAuth: true },
      { method: 'POST', path: '/v1/campaigns/info', description: 'Get public information about gift code', requiresAuth: false },
      { method: 'GET', path: '/v1/campaigns/my-campaigns', description: "Get user's active campaigns", requiresAuth: true },
    ],
  },
  {
    name: 'Live Streaming - Core',
    endpoints: [
      { method: 'GET', path: '/v1/streams/test-deployment', description: 'Test endpoint to verify deployment', requiresAuth: false },
      { method: 'POST', path: '/v1/streams/', description: 'Create livestream with RTMPS credentials', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/', description: 'Browse and discover livestreams', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/id/{stream_id}', description: 'Get detailed stream information', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/trending', description: 'Get trending streams by growth rate', requiresAuth: false },
    ],
  },
  {
    name: 'Live Streaming - Categories',
    endpoints: [
      { method: 'GET', path: '/v1/streams/categories', description: 'List available stream categories', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/categories/trending', description: 'Get trending categories by viewer count', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/categories/tree', description: 'Get hierarchical category tree', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/categories/popular', description: 'Get popular categories ranked by viewers', requiresAuth: false },
    ],
  },
  {
    name: 'Live Streaming - Search',
    endpoints: [
      { method: 'GET', path: '/v1/streams/search', description: 'Search streams by title, description, username', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/search/suggestions', description: 'Get autocomplete suggestions', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/search/popular', description: 'Get popular search terms', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/search/trending', description: 'Get trending search terms', requiresAuth: false },
    ],
  },
  {
    name: 'VODs',
    endpoints: [
      { method: 'GET', path: '/v1/streams/vods', description: 'Browse VOD content with filters', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/vods/search', description: 'Search VOD content by title', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/vods/{vod_id}', description: 'Get VOD details', requiresAuth: false },
      { method: 'GET', path: '/v1/streams/vods/{vod_id}/playback', description: 'Get VOD playback URL', requiresAuth: false },
    ],
  },
];

function AddScenarioDialog({
  open,
  onOpenChange,
  onCreateScenario,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateScenario: (scenario: LoadTestScenario) => void;
}) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [scenarioName, setScenarioName] = useState('');
  const [description, setDescription] = useState('');
  const [virtualUsers, setVirtualUsers] = useState(50);
  const [duration, setDuration] = useState(60);
  const [rampUp, setRampUp] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredEndpoints = API_ENDPOINTS.map(category => ({
    ...category,
    endpoints: category.endpoints.filter(endpoint =>
      (selectedCategory === 'all' || category.name === selectedCategory) &&
      (searchQuery === '' ||
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  })).filter(category => category.endpoints.length > 0);

  const selectedEndpointData = API_ENDPOINTS
    .flatMap(cat => cat.endpoints)
    .find(e => `${e.method}:${e.path}` === selectedEndpoint);

  const handleCreate = () => {
    if (!selectedEndpointData) return;

    const scenarioId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const newScenario: LoadTestScenario = {
      id: scenarioId,
      name: scenarioName || `Load Test: ${selectedEndpointData.path}`,
      description: description || selectedEndpointData.description,
      type: 'api',
      config: {
        targetUrl: `https://api.ainative.studio${selectedEndpointData.path}`,
        method: selectedEndpointData.method,
        duration,
        virtualUsers,
        rampUp,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    onCreateScenario(newScenario);
    onOpenChange(false);

    // Reset form
    setSelectedEndpoint('');
    setScenarioName('');
    setDescription('');
    setVirtualUsers(50);
    setDuration(60);
    setRampUp(10);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/20 text-green-400';
      case 'POST': return 'bg-blue-500/20 text-blue-400';
      case 'PUT': return 'bg-orange-500/20 text-orange-400';
      case 'PATCH': return 'bg-yellow-500/20 text-yellow-400';
      case 'DELETE': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-surface-secondary border-border max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#4B6FED]" />
            Add Load Test Scenario
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select an API endpoint to load test and configure the test parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-2">
          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-surface-primary border-gray-700 text-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-surface-primary border-gray-700 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-surface-secondary border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-gray-800">All Categories</SelectItem>
                {API_ENDPOINTS.map(cat => (
                  <SelectItem key={cat.name} value={cat.name} className="text-white hover:bg-gray-800">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Endpoint Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Select Endpoint</Label>
            <div className="border border-gray-700 rounded-lg max-h-48 overflow-y-auto bg-surface-primary">
              {filteredEndpoints.map(category => (
                <div key={category.name}>
                  <div className="px-3 py-2 bg-gray-800/50 text-xs font-semibold text-gray-400 sticky top-0">
                    {category.name}
                  </div>
                  {category.endpoints.map(endpoint => {
                    const endpointKey = `${endpoint.method}:${endpoint.path}`;
                    const isSelected = selectedEndpoint === endpointKey;
                    return (
                      <button
                        key={endpointKey}
                        onClick={() => setSelectedEndpoint(endpointKey)}
                        className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-gray-800/50 transition-colors ${
                          isSelected ? 'bg-[#4B6FED]/20 border-l-2 border-[#4B6FED]' : ''
                        }`}
                      >
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <span className="text-sm text-gray-300 flex-1 truncate font-mono">{endpoint.path}</span>
                        {endpoint.requiresAuth && (
                          <span className="text-xs text-yellow-500">Auth</span>
                        )}
                        {isSelected && <ChevronRight className="w-4 h-4 text-[#4B6FED]" />}
                      </button>
                    );
                  })}
                </div>
              ))}
              {filteredEndpoints.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No endpoints match your search.
                </div>
              )}
            </div>
          </div>

          {selectedEndpointData && (
            <>
              {/* Selected Endpoint Info */}
              <div className="p-3 rounded-lg bg-[#4B6FED]/10 border border-[#4B6FED]/30">
                <p className="text-sm text-gray-300 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium mr-2 ${getMethodColor(selectedEndpointData.method)}`}>
                    {selectedEndpointData.method}
                  </span>
                  <span className="font-mono">{selectedEndpointData.path}</span>
                </p>
                <p className="text-xs text-gray-400">{selectedEndpointData.description}</p>
              </div>

              {/* Scenario Name */}
              <div className="space-y-2">
                <Label htmlFor="scenario-name" className="text-gray-300">Scenario Name (optional)</Label>
                <Input
                  id="scenario-name"
                  placeholder={`Load Test: ${selectedEndpointData.path}`}
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="bg-surface-primary border-gray-700 text-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder={selectedEndpointData.description}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-surface-primary border-gray-700 text-white"
                />
              </div>

              {/* Test Configuration */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="virtual-users" className="text-gray-300">Virtual Users</Label>
                  <Input
                    id="virtual-users"
                    type="number"
                    min={1}
                    max={1000}
                    value={virtualUsers}
                    onChange={(e) => setVirtualUsers(Number(e.target.value))}
                    className="bg-surface-primary border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-300">Duration (s)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={10}
                    max={3600}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="bg-surface-primary border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ramp-up" className="text-gray-300">Ramp Up (s)</Label>
                  <Input
                    id="ramp-up"
                    type="number"
                    min={0}
                    max={300}
                    value={rampUp}
                    onChange={(e) => setRampUp(Number(e.target.value))}
                    className="bg-surface-primary border-gray-700 text-white"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedEndpointData}
            className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Scenario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: LoadTest['status'] }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-400/10' },
    running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    cancelled: { icon: Square, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const isLoading = status === 'running';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      <Icon className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ScenarioCard({
  scenario,
  onRunTest,
  isRunning,
  runError
}: {
  scenario: LoadTestScenario;
  onRunTest: (scenario: LoadTestScenario) => void;
  isRunning?: boolean;
  runError?: Error | null;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden h-full hover:bg-surface-accent transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4B6FED]/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#4B6FED]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{scenario.name}</h3>
                <p className="text-xs text-gray-400">{scenario.type.toUpperCase()}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">{scenario.description}</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-300">{scenario.config.virtualUsers} users</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Timer className="w-4 h-4 text-gray-500" />
              <span className="text-gray-300">{scenario.config.duration}s</span>
            </div>
          </div>
          {runError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
              <p className="text-xs text-red-400">
                {runError.message || 'Failed to run test'}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-gray-500">
              Updated {new Date(scenario.updatedAt).toLocaleDateString()}
            </span>
            <Button
              size="sm"
              onClick={() => onRunTest(scenario)}
              disabled={isRunning}
              className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TestCard({
  test,
  onViewMetrics,
  onCancel,
  isCancelling,
}: {
  test: LoadTest;
  onViewMetrics: (testId: string) => void;
  onCancel: (testId: string) => void;
  isCancelling: boolean;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4B6FED]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#4B6FED]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{test.scenarioName}</h3>
                <p className="text-xs text-gray-400 font-mono">{test.id}</p>
              </div>
            </div>
            <StatusBadge status={test.status} />
          </div>

          {test.status === 'running' && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{test.progress}%</span>
              </div>
              <Progress value={test.progress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{test.config.virtualUsers}</p>
              <p className="text-xs text-gray-500">Users</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{test.config.duration}s</p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{test.config.rampUp || 0}s</p>
              <p className="text-xs text-gray-500">Ramp Up</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewMetrics(test.id)}
              disabled={test.status === 'pending'}
              className="flex-1 border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              <BarChart2 className="w-4 h-4 mr-1" />
              Metrics
            </Button>
            {test.status === 'running' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel(test.id)}
                disabled={isCancelling}
                className="border-red-800/50 hover:bg-red-900/20 text-red-400"
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricsPanel({
  metrics,
  onClose
}: {
  metrics: LoadTestMetrics;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      {/* Performance Chart */}
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-[#4B6FED]" />
            Performance Metrics
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
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="requestsPerSecond"
                stroke="#4B6FED"
                strokeWidth={2}
                dot={{ fill: '#4B6FED', strokeWidth: 2 }}
                name="Requests/s"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgResponseTime"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2 }}
                name="Avg Response (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Users Chart */}
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Users className="h-5 w-5 text-[#4B6FED]" />
            Active Users & Error Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metrics.dataPoints}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4B6FED" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4B6FED" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke="#4B6FED"
                fillOpacity={1}
                fill="url(#colorUsers)"
                name="Active Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latency Distribution */}
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-[#4B6FED]" />
            Latency Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {metrics.latencyDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-24 text-sm text-gray-400">{item.range}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4B6FED] to-[#10B981] rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-16 text-sm text-gray-300 text-right">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LoadTestingClient() {
  const queryClient = useQueryClient();
  const mounted = useHydrated();
  const [activeTab, setActiveTab] = useState<'tests' | 'scenarios'>('tests');
  const [selectedMetrics, setSelectedMetrics] = useState<string | null>(null);
  const [addScenarioOpen, setAddScenarioOpen] = useState(false);
  const [localScenarios, setLocalScenarios] = useState<LoadTestScenario[]>([]);

  // Fetch scenarios
  const {
    data: scenarios,
    isLoading: scenariosLoading,
    error: scenariosError,
    isError: isScenariosError
  } = useQuery({
    queryKey: ['load-testing-scenarios'],
    queryFn: loadTestingService.getScenarios,
    staleTime: 60000,
    retry: 2,
  });

  // Fetch test history
  const {
    data: tests,
    isLoading: testsLoading,
    refetch: refetchTests,
    error: testsError,
    isError: isTestsError,
  } = useQuery({
    queryKey: ['load-testing-tests'],
    queryFn: loadTestingService.getTestHistory,
    staleTime: 10000,
    refetchInterval: 5000,
    retry: 2,
  });

  // Fetch metrics for selected test
  const {
    data: metrics,
    error: metricsError,
    isError: isMetricsError
  } = useQuery({
    queryKey: ['load-testing-metrics', selectedMetrics],
    queryFn: () => {
      if (!selectedMetrics) return null;
      return loadTestingService.getTestMetrics(selectedMetrics);
    },
    enabled: !!selectedMetrics,
    retry: 2,
  });

  // Run test mutation
  const runTestMutation = useMutation({
    mutationFn: async (scenario: LoadTestScenario) => {
      const test = await loadTestingService.createTest({ scenarioId: scenario.id });
      await loadTestingService.runTest({ testId: test.id });
      return test;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load-testing-tests'] });
    },
    onError: (error) => {
      console.error('Failed to run test:', error);
    },
  });

  // Cancel test mutation
  const cancelMutation = useMutation({
    mutationFn: (testId: string) => loadTestingService.cancelTest(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load-testing-tests'] });
    },
    onError: (error) => {
      console.error('Failed to cancel test:', error);
    },
  });

  const handleRunTest = async (scenario: LoadTestScenario) => {
    await runTestMutation.mutateAsync(scenario);
    setActiveTab('tests');
  };

  const handleCreateScenario = (newScenario: LoadTestScenario) => {
    setLocalScenarios(prev => [newScenario, ...prev]);
  };

  // Combine fetched scenarios with locally created ones
  const allScenarios = [...localScenarios, ...(scenarios || [])];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B6FED] mx-auto mb-4"></div>
          <p>Loading load testing...</p>
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
              <Zap className="h-7 w-7 text-[#4B6FED]" />
              Load Testing
            </h1>
            <p className="text-gray-400 mt-1">
              Run performance tests and analyze results for your AI applications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetchTests()}
              className="border-gray-700 hover:bg-gray-800 text-white"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setActiveTab('scenarios')}
              className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex gap-1 p-1 bg-surface-secondary rounded-lg w-fit">
          <button
            onClick={() => { setActiveTab('tests'); setSelectedMetrics(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tests'
                ? 'bg-[#4B6FED] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Test Runs ({tests?.length || 0})
          </button>
          <button
            onClick={() => { setActiveTab('scenarios'); setSelectedMetrics(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scenarios'
                ? 'bg-[#4B6FED] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Scenarios
          </button>
        </div>
      </motion.div>

      {/* Metrics Panel (if selected) */}
      {selectedMetrics && (
        <div className="mb-6">
          {isMetricsError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Card className="border-none bg-surface-secondary shadow-lg">
                <CardHeader className="border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <XCircle className="h-5 w-5 text-red-500" />
                    Failed to Load Metrics
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedMetrics(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-400 mb-4">
                    {metricsError instanceof Error ? metricsError.message : 'An error occurred while fetching test metrics'}
                  </p>
                  <Button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['load-testing-metrics', selectedMetrics] })}
                    className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : metrics ? (
            <MetricsPanel metrics={metrics} onClose={() => setSelectedMetrics(null)} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none bg-surface-secondary shadow-lg">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4B6FED] mx-auto mb-4" />
                  <p className="text-gray-400">Loading metrics...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Content */}
      {!selectedMetrics && (
        <AnimatePresence mode="wait">
          {activeTab === 'tests' && (
            <motion.div
              key="tests"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={stagger}
            >
              {testsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4B6FED]" />
                </div>
              ) : isTestsError ? (
                <motion.div variants={fadeUp}>
                  <Card className="border-none bg-surface-secondary shadow-lg">
                    <CardContent className="py-12 text-center">
                      <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Failed to load test history</h3>
                      <p className="text-gray-400 mb-6">
                        {testsError instanceof Error ? testsError.message : 'An error occurred while fetching test history'}
                      </p>
                      <Button
                        onClick={() => refetchTests()}
                        className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : tests && tests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onViewMetrics={(id) => setSelectedMetrics(id)}
                      onCancel={(id) => cancelMutation.mutate(id)}
                      isCancelling={cancelMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <motion.div variants={fadeUp}>
                  <Card className="border-none bg-surface-secondary shadow-lg">
                    <CardContent className="py-12 text-center">
                      <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No tests yet</h3>
                      <p className="text-gray-400 mb-6">
                        Run your first load test from the scenarios
                      </p>
                      <Button
                        onClick={() => setActiveTab('scenarios')}
                        className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Browse Scenarios
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'scenarios' && (
            <motion.div
              key="scenarios"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={stagger}
            >
              {scenariosLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4B6FED]" />
                </div>
              ) : isScenariosError ? (
                <motion.div variants={fadeUp}>
                  <Card className="border-none bg-surface-secondary shadow-lg">
                    <CardContent className="py-12 text-center">
                      <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">Failed to load scenarios</h3>
                      <p className="text-gray-400 mb-6">
                        {scenariosError instanceof Error ? scenariosError.message : 'An error occurred while fetching scenarios'}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={() => queryClient.invalidateQueries({ queryKey: ['load-testing-scenarios'] })}
                          className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                        <Button
                          onClick={() => setAddScenarioOpen(true)}
                          variant="outline"
                          className="border-gray-700 hover:bg-gray-800 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Scenario Manually
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Add Scenario Button */}
                  <motion.div variants={fadeUp}>
                    <Button
                      onClick={() => setAddScenarioOpen(true)}
                      className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Scenario
                    </Button>
                  </motion.div>

                  {/* Scenarios Grid */}
                  {allScenarios.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allScenarios.map((scenario) => (
                        <ScenarioCard
                          key={scenario.id}
                          scenario={scenario}
                          onRunTest={handleRunTest}
                          isRunning={runTestMutation.isPending}
                          runError={runTestMutation.error}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.div variants={fadeUp}>
                      <Card className="border-none bg-surface-secondary shadow-lg">
                        <CardContent className="py-12 text-center">
                          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-white mb-2">No scenarios available</h3>
                          <p className="text-gray-400 mb-6">
                            Create your first load test scenario to get started
                          </p>
                          <Button
                            onClick={() => setAddScenarioOpen(true)}
                            className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Scenario
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Add Scenario Dialog */}
      <AddScenarioDialog
        open={addScenarioOpen}
        onOpenChange={setAddScenarioOpen}
        onCreateScenario={handleCreateScenario}
      />
    </motion.div>
  );
}
