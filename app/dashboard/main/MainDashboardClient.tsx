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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

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

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    totalRequests: 15234,
    activeProjects: 12,
    creditsUsed: 7500,
    avgResponseTime: 1.2,
  };
};

const fetchUsageData = async (): Promise<UsageDataPoint[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { date: 'Mon', requests: 1200, tokens: 45000 },
    { date: 'Tue', requests: 1400, tokens: 52000 },
    { date: 'Wed', requests: 1100, tokens: 41000 },
    { date: 'Thu', requests: 1800, tokens: 67000 },
    { date: 'Fri', requests: 2100, tokens: 78000 },
    { date: 'Sat', requests: 900, tokens: 33000 },
    { date: 'Sun', requests: 750, tokens: 28000 },
  ];
};

const fetchModelUsage = async (): Promise<ModelUsageData[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    { name: 'GPT-4', value: 45, color: '#4B6FED' },
    { name: 'Claude', value: 35, color: '#10B981' },
    { name: 'Llama', value: 15, color: '#F59E0B' },
    { name: 'Custom', value: 5, color: '#8B5CF6' },
  ];
};

const fetchProjectActivity = async (): Promise<ProjectActivityData[]> => {
  await new Promise(resolve => setTimeout(resolve, 350));
  return [
    { name: 'Project A', codeGen: 450, reviews: 32, fixes: 18 },
    { name: 'Project B', codeGen: 380, reviews: 28, fixes: 12 },
    { name: 'Project C', codeGen: 290, reviews: 22, fixes: 8 },
    { name: 'Project D', codeGen: 180, reviews: 15, fixes: 5 },
    { name: 'Project E', codeGen: 120, reviews: 10, fixes: 3 },
  ];
};

const fetchPerformanceData = async (): Promise<PerformanceData[]> => {
  await new Promise(resolve => setTimeout(resolve, 450));
  return [
    { time: '00:00', latency: 120, throughput: 850 },
    { time: '04:00', latency: 95, throughput: 420 },
    { time: '08:00', latency: 180, throughput: 1200 },
    { time: '12:00', latency: 210, throughput: 1450 },
    { time: '16:00', latency: 165, throughput: 1100 },
    { time: '20:00', latency: 140, throughput: 920 },
    { time: '24:00', latency: 110, throughput: 780 },
  ];
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
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden h-full">
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
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
        <CardHeader className="border-b border-gray-800">
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
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
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
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ModelUsageChart({ data, isLoading }: { data?: ModelUsageData[]; isLoading: boolean }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden h-full">
        <CardHeader className="border-b border-gray-800">
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
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
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
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProjectActivityChart({ data, isLoading }: { data?: ProjectActivityData[]; isLoading: boolean }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden h-full">
        <CardHeader className="border-b border-gray-800">
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
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data} layout="vertical">
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
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PerformanceChart({ data, isLoading }: { data?: PerformanceData[]; isLoading: boolean }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
        <CardHeader className="border-b border-gray-800">
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
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
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
              </LineChart>
            </ResponsiveContainer>
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
  });

  const {
    data: usageData,
    isLoading: usageLoading,
    refetch: refetchUsage
  } = useQuery({
    queryKey: ['usageData'],
    queryFn: fetchUsageData,
    staleTime: 30000,
  });

  const {
    data: modelUsage,
    isLoading: modelLoading,
    refetch: refetchModel
  } = useQuery({
    queryKey: ['modelUsage'],
    queryFn: fetchModelUsage,
    staleTime: 30000,
  });

  const {
    data: projectActivity,
    isLoading: activityLoading,
    refetch: refetchActivity
  } = useQuery({
    queryKey: ['projectActivity'],
    queryFn: fetchProjectActivity,
    staleTime: 30000,
  });

  const {
    data: performanceData,
    isLoading: performanceLoading,
    refetch: refetchPerformance
  } = useQuery({
    queryKey: ['performanceData'],
    queryFn: fetchPerformanceData,
    staleTime: 30000,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchUsage();
    refetchModel();
    refetchActivity();
    refetchPerformance();
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
          trend={{ value: 12.5, isPositive: true }}
          isLoading={statsLoading}
        />
        <StatWidget
          title="Active Projects"
          value={stats?.activeProjects || 0}
          icon={Database}
          trend={{ value: 3, isPositive: true }}
          isLoading={statsLoading}
        />
        <StatWidget
          title="Credits Used"
          value={stats?.creditsUsed || 0}
          icon={Zap}
          trend={{ value: 8.2, isPositive: false }}
          isLoading={statsLoading}
        />
        <StatWidget
          title="Avg Response Time"
          value={stats ? `${stats.avgResponseTime}s` : '0s'}
          icon={Clock}
          trend={{ value: 5.1, isPositive: true }}
          isLoading={statsLoading}
        />
      </motion.div>

      {/* Usage Chart */}
      <div className="mb-8">
        <UsageChart data={usageData} isLoading={usageLoading} />
      </div>

      {/* Model & Project Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ModelUsageChart data={modelUsage} isLoading={modelLoading} />
        <ProjectActivityChart data={projectActivity} isLoading={activityLoading} />
      </div>

      {/* Performance Chart */}
      <div className="mb-8">
        <PerformanceChart data={performanceData} isLoading={performanceLoading} />
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
          <CardHeader className="border-b border-gray-800">
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
