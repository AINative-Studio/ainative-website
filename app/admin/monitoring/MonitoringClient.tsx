'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Cpu,
  Database,
  Filter,
  HardDrive,
  Network,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/lib/admin-service';

export default function MonitoringClient() {
  const [logLevel, setLogLevel] = useState<string>('all');
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);

  // Poll metrics every 5 seconds
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const data = await adminService.getSystemMetrics();

      // Add to history for chart
      setMetricsHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            cpu: data.cpu.usage,
            memory: data.memory.percentage,
            disk: data.disk.percentage,
          },
        ];
        // Keep only last 20 data points
        return newHistory.slice(-20);
      });

      return data;
    },
    refetchInterval: 5000,
  });

  // Poll alerts every 10 seconds
  const { data: alertsData } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => adminService.getSystemAlerts(),
    refetchInterval: 10000,
  });

  // Fetch logs with filtering
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-logs', logLevel],
    queryFn: () =>
      adminService.getSystemLogs({
        page: 1,
        pageSize: 50,
        ...(logLevel !== 'all' && { level: logLevel }),
      }),
    refetchInterval: 15000,
  });

  const mockMetrics = {
    cpu: { usage: 42.5, cores: 8 },
    memory: { used: 11092, total: 16384, percentage: 67.7 },
    disk: { used: 542, total: 1000, percentage: 54.2 },
    network: { inbound: 1024, outbound: 2048 },
  };

  const displayMetrics = metrics || mockMetrics;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">System Monitoring</h1>
              <p className="text-gray-400 mt-1">Real-time system metrics and logs</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => refetchLogs()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </motion.button>
        </div>

        {/* Current Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-blue-400" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{displayMetrics.cpu.usage.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">{displayMetrics.cpu.cores} cores</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Database className="h-4 w-4 text-purple-400" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{displayMetrics.memory.percentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">
                  {displayMetrics.memory.used} MB / {displayMetrics.memory.total} MB
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <HardDrive className="h-4 w-4 text-green-400" />
                Disk Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{displayMetrics.disk.percentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">
                  {displayMetrics.disk.used} GB / {displayMetrics.disk.total} GB
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Network className="h-4 w-4 text-yellow-400" />
                Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">In: {displayMetrics.network.inbound} KB/s</p>
                <p className="text-sm text-gray-400">Out: {displayMetrics.network.outbound} KB/s</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Chart */}
        {metricsHistory.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Resource Usage Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="cpu" stroke="#3B82F6" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#A855F7" name="Memory %" />
                  <Line type="monotone" dataKey="disk" stroke="#10B981" name="Disk %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Active Alerts */}
        {alertsData && alertsData.alerts.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Active Alerts ({alertsData.total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertsData.alerts.map((alert) => (
                  <Alert key={alert.id} className="bg-gray-700/50 border-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{alert.title}</p>
                          <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getLevelColor(alert.severity)}>{alert.severity}</Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Logs */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="h-5 w-5" />
                System Logs
              </CardTitle>
              <Select value={logLevel} onValueChange={setLogLevel}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : logsData && logsData.logs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logsData.logs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-700/30 rounded-lg flex items-start gap-3">
                    <Badge className={getLevelColor(log.level)}>{log.level}</Badge>
                    <div className="flex-1">
                      <p className="text-white font-mono text-sm">{log.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No logs found for the selected filter</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
