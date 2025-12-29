'use client';

import { useState, useEffect } from 'react';
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
  Trash2,
  Plus,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart2,
  Target,
  Timer,
  Users,
  TrendingUp,
} from 'lucide-react';
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

// Mock data
const mockScenarios: LoadTestScenario[] = [
  {
    id: 'scenario-1',
    name: 'API Endpoint Stress Test',
    description: 'High-load test for main API endpoints',
    type: 'api',
    config: {
      targetUrl: 'https://api.ainative.studio/v1/completions',
      method: 'POST',
      duration: 300,
      virtualUsers: 100,
      rampUp: 60,
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scenario-2',
    name: 'WebSocket Connection Test',
    description: 'Test WebSocket connection stability under load',
    type: 'websocket',
    config: {
      targetUrl: 'wss://api.ainative.studio/ws',
      method: 'CONNECT',
      duration: 600,
      virtualUsers: 500,
      rampUp: 120,
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'scenario-3',
    name: 'Mixed Workload Test',
    description: 'Simulate realistic mixed API usage patterns',
    type: 'mixed',
    config: {
      targetUrl: 'https://api.ainative.studio/v1',
      method: 'MIXED',
      duration: 900,
      virtualUsers: 200,
      rampUp: 180,
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTests: LoadTest[] = [
  {
    id: 'test-001',
    scenarioId: 'scenario-1',
    scenarioName: 'API Endpoint Stress Test',
    status: 'completed',
    progress: 100,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user@example.com',
    config: { duration: 300, virtualUsers: 100, rampUp: 60 },
  },
  {
    id: 'test-002',
    scenarioId: 'scenario-2',
    scenarioName: 'WebSocket Connection Test',
    status: 'running',
    progress: 45,
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdBy: 'user@example.com',
    config: { duration: 600, virtualUsers: 500, rampUp: 120 },
  },
];

const mockMetrics = {
  testId: 'test-001',
  dataPoints: [
    { timestamp: '00:00', activeUsers: 10, requestsPerSecond: 50, avgResponseTime: 120, errorRate: 0.1, throughput: 1200 },
    { timestamp: '01:00', activeUsers: 30, requestsPerSecond: 150, avgResponseTime: 135, errorRate: 0.2, throughput: 3500 },
    { timestamp: '02:00', activeUsers: 60, requestsPerSecond: 320, avgResponseTime: 145, errorRate: 0.3, throughput: 7200 },
    { timestamp: '03:00', activeUsers: 80, requestsPerSecond: 420, avgResponseTime: 160, errorRate: 0.5, throughput: 9500 },
    { timestamp: '04:00', activeUsers: 100, requestsPerSecond: 480, avgResponseTime: 180, errorRate: 0.8, throughput: 11000 },
    { timestamp: '05:00', activeUsers: 100, requestsPerSecond: 450, avgResponseTime: 175, errorRate: 0.6, throughput: 10500 },
  ],
  latencyDistribution: [
    { range: '0-100ms', count: 4500, percentage: 45 },
    { range: '100-200ms', count: 3000, percentage: 30 },
    { range: '200-500ms', count: 1500, percentage: 15 },
    { range: '500ms+', count: 1000, percentage: 10 },
  ],
};

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
  onRunTest
}: {
  scenario: LoadTestScenario;
  onRunTest: (scenario: LoadTestScenario) => void;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden h-full hover:bg-[#1C2128] transition-colors">
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
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <span className="text-xs text-gray-500">
              Updated {new Date(scenario.updatedAt).toLocaleDateString()}
            </span>
            <Button
              size="sm"
              onClick={() => onRunTest(scenario)}
              className="bg-[#4B6FED] hover:bg-[#3D5BD9] text-white"
            >
              <Play className="w-4 h-4 mr-1" />
              Run Test
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
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
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

          <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
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
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
        <CardHeader className="border-b border-gray-800 flex flex-row items-center justify-between">
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
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
        <CardHeader className="border-b border-gray-800">
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
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
        <CardHeader className="border-b border-gray-800">
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
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'scenarios'>('tests');
  const [selectedMetrics, setSelectedMetrics] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch scenarios
  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['load-testing-scenarios'],
    queryFn: async () => {
      try {
        return await loadTestingService.getScenarios();
      } catch {
        return mockScenarios;
      }
    },
    staleTime: 60000,
  });

  // Fetch test history
  const {
    data: tests,
    isLoading: testsLoading,
    refetch: refetchTests,
  } = useQuery({
    queryKey: ['load-testing-tests'],
    queryFn: async () => {
      try {
        return await loadTestingService.getTestHistory();
      } catch {
        return mockTests;
      }
    },
    staleTime: 10000,
    refetchInterval: 5000,
  });

  // Fetch metrics for selected test
  const { data: metrics } = useQuery({
    queryKey: ['load-testing-metrics', selectedMetrics],
    queryFn: async () => {
      if (!selectedMetrics) return null;
      try {
        return await loadTestingService.getTestMetrics(selectedMetrics);
      } catch {
        return mockMetrics;
      }
    },
    enabled: !!selectedMetrics,
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
  });

  // Cancel test mutation
  const cancelMutation = useMutation({
    mutationFn: (testId: string) => loadTestingService.cancelTest(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load-testing-tests'] });
    },
  });

  const handleRunTest = async (scenario: LoadTestScenario) => {
    try {
      await runTestMutation.mutateAsync(scenario);
    } catch {
      // Mock test creation
      const newTest: LoadTest = {
        id: `test-${Date.now()}`,
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        status: 'running',
        progress: 0,
        startedAt: new Date().toISOString(),
        createdBy: 'user@example.com',
        config: scenario.config,
      };
      queryClient.setQueryData(['load-testing-tests'], (old: LoadTest[] | undefined) =>
        old ? [newTest, ...old] : [newTest]
      );
    }
    setActiveTab('tests');
  };

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
        <div className="flex gap-1 p-1 bg-[#161B22] rounded-lg w-fit">
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
      {selectedMetrics && metrics && (
        <div className="mb-6">
          <MetricsPanel metrics={metrics} onClose={() => setSelectedMetrics(null)} />
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
                  <Card className="border-none bg-[#161B22] shadow-lg">
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
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(scenarios || mockScenarios).map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onRunTest={handleRunTest}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
