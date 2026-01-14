'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  BarChart2,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Zap,
  DollarSign,
  Server,
  Clock,
  Database
} from 'lucide-react';
import Link from 'next/link';

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

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  disk_usage: number;
  uptime: number;
}

interface UsageMetrics {
  period: string;
  api_calls: number;
  data_processed_mb: number;
  success_rate: number;
  error_count: number;
}

interface ServiceHealth {
  service_name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime_percentage: number;
  response_time_ms: number;
  last_check: string;
  issues?: string[];
}

export default function AnalyticsClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_usage: 45.2,
    memory_usage: 62.8,
    active_connections: 127,
    disk_usage: 34.5,
    uptime: 99.97
  });

  const [usageMetrics] = useState<UsageMetrics[]>([
    {
      period: 'Last 7 Days',
      api_calls: 45230,
      data_processed_mb: 1250,
      success_rate: 0.9876,
      error_count: 124
    }
  ]);

  const [serviceHealth] = useState<ServiceHealth[]>([
    {
      service_name: 'API Gateway',
      status: 'healthy',
      uptime_percentage: 99.98,
      response_time_ms: 42,
      last_check: new Date().toISOString()
    },
    {
      service_name: 'ZeroDB',
      status: 'healthy',
      uptime_percentage: 99.95,
      response_time_ms: 28,
      last_check: new Date().toISOString()
    },
    {
      service_name: 'QNN Service',
      status: 'healthy',
      uptime_percentage: 99.92,
      response_time_ms: 156,
      last_check: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    setMounted(true);

    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu_usage: Math.max(20, Math.min(80, prev.cpu_usage + (Math.random() - 0.5) * 10)),
        memory_usage: Math.max(40, Math.min(80, prev.memory_usage + (Math.random() - 0.5) * 5)),
        active_connections: Math.max(50, Math.min(200, prev.active_connections + Math.floor((Math.random() - 0.5) * 20))),
        disk_usage: prev.disk_usage,
        uptime: prev.uptime
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time monitoring and analytics for your AINative services
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/dashboard/usage">
              <Button variant="outline" className="gap-2">
                View Usage
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Real-time System Metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardContent className="flex items-center p-6">
              <Activity className="h-8 w-8 text-[#4B6FED]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">CPU Usage</p>
                <p className="text-2xl font-bold">{systemMetrics.cpu_usage.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardContent className="flex items-center p-6">
              <Database className="h-8 w-8 text-[#4B6FED]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Memory</p>
                <p className="text-2xl font-bold">{systemMetrics.memory_usage.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardContent className="flex items-center p-6">
              <Server className="h-8 w-8 text-[#4B6FED]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Connections</p>
                <p className="text-2xl font-bold">{systemMetrics.active_connections}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardContent className="flex items-center p-6">
              <BarChart2 className="h-8 w-8 text-[#4B6FED]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Disk Usage</p>
                <p className="text-2xl font-bold">{systemMetrics.disk_usage.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-[#4B6FED]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Uptime</p>
                <p className="text-2xl font-bold">{systemMetrics.uptime.toFixed(2)}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-[#161B22] border border-[#2D333B]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="health">System Health</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 bg-[#161B22] border-[#2D333B]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161B22] border-[#2D333B]">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    API Usage Overview
                  </CardTitle>
                  <CardDescription>Total API calls and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total API Calls</span>
                      <span className="text-2xl font-bold">45,230</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Success Rate</span>
                      <span className="text-lg font-semibold text-green-500">98.76%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Avg Response Time</span>
                      <span className="text-lg font-semibold">42ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Resource Usage
                  </CardTitle>
                  <CardDescription>Current resource consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">CPU</span>
                        <span className="text-sm font-semibold">{systemMetrics.cpu_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.cpu_usage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Memory</span>
                        <span className="text-sm font-semibold">{systemMetrics.memory_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.memory_usage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Storage</span>
                        <span className="text-sm font-semibold">{systemMetrics.disk_usage.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemMetrics.disk_usage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 border-[#4B6FED]/30">
              <CardContent className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#4B6FED]/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-[#4B6FED]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">All Systems Operational</h3>
                    <p className="text-gray-400 text-sm">
                      Your services are running smoothly with 99.97% uptime
                    </p>
                  </div>
                </div>
                <Link href="/dashboard">
                  <Button className="bg-[#4B6FED] hover:bg-[#4B6FED]/80">
                    View Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            {usageMetrics.map((metric, index) => (
              <Card key={index} className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle>{metric.period}</CardTitle>
                  <CardDescription>API Usage Statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">API Calls</p>
                      <p className="text-2xl font-bold">{metric.api_calls.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Data Processed</p>
                      <p className="text-2xl font-bold">{metric.data_processed_mb}MB</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Success Rate</p>
                      <p className="text-2xl font-bold text-green-500">
                        {(metric.success_rate * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Errors</p>
                      <p className="text-2xl font-bold text-red-500">{metric.error_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health" className="space-y-6">
            {serviceHealth.map((service, index) => (
              <Card key={index} className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getHealthIcon(service.status)}
                      <CardTitle>{service.service_name}</CardTitle>
                    </div>
                    <Badge
                      variant={service.status === 'healthy' ? 'default' :
                             service.status === 'degraded' ? 'secondary' : 'destructive'}
                      className={service.status === 'healthy' ? 'bg-green-500/20 text-green-500 border-green-500/50' : ''}
                    >
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Uptime</p>
                      <p className="text-lg font-semibold">{service.uptime_percentage.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Response Time</p>
                      <p className="text-lg font-semibold">{service.response_time_ms}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Last Check</p>
                      <p className="text-lg font-semibold">
                        {new Date(service.last_check).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {service.issues && service.issues.length > 0 && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm font-medium text-red-500 mb-2">Issues:</p>
                      <ul className="text-sm space-y-1">
                        {service.issues.map((issue, idx) => (
                          <li key={idx} className="text-red-400">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                  <CardDescription>API response time statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Average</span>
                      <span className="text-2xl font-bold">42ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">95th Percentile</span>
                      <span className="text-2xl font-bold">156ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">99th Percentile</span>
                      <span className="text-2xl font-bold">298ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle>Throughput & Reliability</CardTitle>
                  <CardDescription>Current performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Throughput</span>
                      <span className="text-2xl font-bold">856 RPS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Error Rate</span>
                      <span className="text-2xl font-bold text-yellow-500">1.24%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Availability</span>
                      <span className="text-2xl font-bold text-green-500">99.97%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
