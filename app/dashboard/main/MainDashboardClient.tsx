'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart2,
  TrendingUp,
  Activity,
  Zap,
  RefreshCcw,
  Code2,
  Brain,
  Database,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  LazyAreaChart,
  LazyBarChart,
  LazyPieChart,
  LazyLineChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Pie,
  Cell,
  Line,
  Legend,
} from '@/components/lazy';
import { dashboardService } from '@/services/dashboardService';
import { creditService } from '@/services/creditService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface DashboardStats {
  totalRequests: number;
  activeProjects: number;
  creditsUsed: number;
  avgResponseTime: number;
  trends?: {
    requestsChange?: number;
    projectsChange?: number;
    creditsChange?: number;
    responseTimeChange?: number;
  };
}

interface UsageDataPoint {
  date: string;
  requests: number;
  tokens: number;
}

interface ModelUsageData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface ProjectActivityData {
  name: string;
  codeGen: number;
  reviews: number;
  fixes: number;
}

interface PerformanceData {
  time: string;
  latency: number;
  throughput: number;
}

const PIE_COLORS = ['#4B6FED', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Try quick-stats endpoint first, fall back to credits balance
  const [quickStats, creditsBalance] = await Promise.allSettled([
    dashboardService.getQuickStats(),
    creditService.getCreditBalance()
  ]);

  const stats: DashboardStats = {
    totalRequests: 0,
    activeProjects: 0,
    creditsUsed: 0,
    avgResponseTime: 0,
  };

  if (quickStats.status === 'fulfilled' && quickStats.value) {
    stats.totalRequests = quickStats.value.total_requests;
    stats.activeProjects = quickStats.value.active_projects;
    stats.creditsUsed = quickStats.value.credits_used;
    stats.avgResponseTime = quickStats.value.avg_response_time;
    if (quickStats.value.trends) {
      stats.trends = {
        requestsChange: quickStats.value.trends.requests_change,
        projectsChange: quickStats.value.trends.projects_change,
        creditsChange: quickStats.value.trends.credits_change,
        responseTimeChange: quickStats.value.trends.response_time_change,
      };
    }
  }

  if (creditsBalance.status === 'fulfilled' && creditsBalance.value) {
    stats.creditsUsed = creditsBalance.value.used || stats.creditsUsed;
  }

  return stats;
};

const fetchDashboardData = async (): Promise<{
  usage: UsageDataPoint[];
  modelUsage: ModelUsageData[];
  projectActivity: ProjectActivityData[];
  performance: PerformanceData[];
}> => {
  // Fire all three endpoints in parallel, pick the best available result
  const [overviewResult, analyticsResult, aiUsageResult] = await Promise.allSettled([
    dashboardService.getOverview(),
    dashboardService.getAnalytics(),
    dashboardService.getAiUsageAggregate('7d')
  ]);

  const overview = overviewResult.status === 'fulfilled' ? overviewResult.value : null;
  if (overview) {
    return {
      usage: overview.usage || [],
      modelUsage: (overview.model_usage || []).map((m, i) => ({
        name: m.name,
        value: m.value,
        color: m.color || PIE_COLORS[i % PIE_COLORS.length]
      })),
      projectActivity: overview.project_activity || [],
      performance: overview.performance || []
    };
  }

  const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value : null;
  if (analytics) {
    return {
      usage: analytics.usage_trends || [],
      modelUsage: (analytics.model_distribution || []).map((m, i) => ({
        name: m.name,
        value: m.value,
        color: m.color || PIE_COLORS[i % PIE_COLORS.length]
      })),
      projectActivity: analytics.project_activity || [],
      performance: analytics.performance_metrics || []
    };
  }

  const aiUsage = aiUsageResult.status === 'fulfilled' ? aiUsageResult.value : null;
  if (aiUsage) {
    return {
      usage: (aiUsage.daily_usage || []).map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        requests: d.credits_used,
        tokens: 0
      })),
      modelUsage: (aiUsage.by_model || []).map((m, i) => ({
        name: m.model,
        value: Math.round(m.percentage),
        color: PIE_COLORS[i % PIE_COLORS.length]
      })),
      projectActivity: [],
      performance: []
    };
  }

  return { usage: [], modelUsage: [], projectActivity: [], performance: [] };
};

function StatWidget({
  title,
  value,
  icon: Icon,
  trend,
  isLoading
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden h-full">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">{title}</span>
                <Icon className="h-5 w-5 text-[#4B6FED]" />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
                {trend && (
                  <span className={`text-sm flex items-center gap-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingUp className={`h-4 w-4 ${!trend.isPositive && 'rotate-180'}`} />
                    {trend.value}%
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UsageChart({ data, isLoading }: { data?: UsageDataPoint[]; isLoading: boolean }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Activity className="h-5 w-5 text-[#4B6FED]" />
            Weekly Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B6FED]"></div>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LazyAreaChart data={data}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B6FED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4B6FED" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#4B6FED"
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                  name="API Requests"
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorTokens)"
                  name="Tokens Used"
                />
              </LazyAreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No usage data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ModelUsageChart({ data, isLoading }: { data?: ModelUsageData[]; isLoading: boolean }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden h-full">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-[#4B6FED]" />
            Model Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B6FED]"></div>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LazyPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value}%`, 'Usage']}
                />
                <Legend
                  formatter={(value) => <span className="text-gray-300">{value}</span>}
                />
              </LazyPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No model usage data yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProjectActivityChart({ data, isLoading }: { data?: ProjectActivityData[]; isLoading: boolean }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden h-full">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Code2 className="h-5 w-5 text-[#4B6FED]" />
            Project Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B6FED]"></div>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LazyBarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="codeGen" fill="#4B6FED" name="Code Generated" radius={[0, 4, 4, 0]} />
                <Bar dataKey="reviews" fill="#10B981" name="Reviews" radius={[0, 4, 4, 0]} />
                <Bar dataKey="fixes" fill="#F59E0B" name="Bug Fixes" radius={[0, 4, 4, 0]} />
              </LazyBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No project activity data yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PerformanceChart({ data, isLoading }: { data?: PerformanceData[]; isLoading: boolean }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-[#4B6FED]" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B6FED]"></div>
            </div>
          ) : data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LazyLineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
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
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="latency"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                  name="Latency (ms)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="throughput"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                  name="Throughput (req/s)"
                />
              </LazyLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No performance data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MainDashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.email || null);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 30000,
    enabled: mounted,
  });

  const {
    data: dashboardData,
    isLoading: dataLoading,
    refetch: refetchData
  } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    staleTime: 30000,
    enabled: mounted,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchData();
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B6FED] mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
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
              <BarChart2 className="h-7 w-7 text-[#4B6FED]" />
              Main Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome back{userName ? `, ${userName}` : ''}! Here's your AI development overview.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            className="border-gray-700 hover:bg-gray-800 text-white"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={stagger}
      >
        <StatWidget
          title="Total API Requests"
          value={stats?.totalRequests || 0}
          icon={Activity}
          trend={stats?.trends?.requestsChange != null
            ? { value: Math.abs(stats.trends.requestsChange), isPositive: stats.trends.requestsChange >= 0 }
            : undefined}
          isLoading={statsLoading}
        />
        <StatWidget
          title="Active Projects"
          value={stats?.activeProjects || 0}
          icon={Database}
          trend={stats?.trends?.projectsChange != null
            ? { value: Math.abs(stats.trends.projectsChange), isPositive: stats.trends.projectsChange >= 0 }
            : undefined}
          isLoading={statsLoading}
        />
        <StatWidget
          title="Credits Used"
          value={stats?.creditsUsed || 0}
          icon={Zap}
          trend={stats?.trends?.creditsChange != null
            ? { value: Math.abs(stats.trends.creditsChange), isPositive: stats.trends.creditsChange <= 0 }
            : undefined}
          isLoading={statsLoading}
        />
        <StatWidget
          title="Avg Response Time"
          value={stats ? `${stats.avgResponseTime}s` : '0s'}
          icon={Clock}
          trend={stats?.trends?.responseTimeChange != null
            ? { value: Math.abs(stats.trends.responseTimeChange), isPositive: stats.trends.responseTimeChange <= 0 }
            : undefined}
          isLoading={statsLoading}
        />
      </motion.div>

      {/* Usage Chart */}
      <div className="mb-8">
        <UsageChart data={dashboardData?.usage} isLoading={dataLoading} />
      </div>

      {/* Model & Project Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ModelUsageChart data={dashboardData?.modelUsage} isLoading={dataLoading} />
        <ProjectActivityChart data={dashboardData?.projectActivity} isLoading={dataLoading} />
      </div>

      {/* Performance Chart */}
      <div className="mb-8">
        <PerformanceChart data={dashboardData?.performance} isLoading={dataLoading} />
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5 text-[#4B6FED]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-white justify-start h-auto py-4"
              >
                <Code2 className="h-5 w-5 mr-3 text-[#4B6FED]" />
                <div className="text-left">
                  <div className="font-medium">New Project</div>
                  <div className="text-xs text-gray-400">Create a new AI project</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-white justify-start h-auto py-4"
              >
                <Brain className="h-5 w-5 mr-3 text-[#10B981]" />
                <div className="text-left">
                  <div className="font-medium">Configure Models</div>
                  <div className="text-xs text-gray-400">Manage AI model settings</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-white justify-start h-auto py-4"
              >
                <Database className="h-5 w-5 mr-3 text-[#F59E0B]" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-gray-400">Detailed usage reports</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
