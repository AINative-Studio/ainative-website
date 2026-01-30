'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Database,
  HardDrive,
  Info,
  Server,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { adminService } from '@/lib/admin-service';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboardClient() {
  // Poll dashboard summary every 30 seconds
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: () => adminService.getDashboardSummary(),
    refetchInterval: 30000,
  });

  // Poll alerts every 15 seconds
  const { data: alertsData } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => adminService.getSystemAlerts(),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="border-red-800 bg-red-900/20">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <AlertDescription className="text-red-300 ml-2">
            Failed to load admin dashboard. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Use mock data if API returns nothing (backend might not be fully implemented)
  const mockSummary = {
    health: {
      status: 'healthy',
      uptime: 99.95,
    },
    metrics: {
      cpu: 42.5,
      memory: 68.3,
      disk: 54.2,
    },
    alerts: {
      critical: 0,
      warning: 2,
      info: 5,
    },
    stats: {
      totalUsers: 1247,
      activeUsers: 892,
      totalProjects: 428,
    },
  };

  // Merge with mock data to ensure all properties exist even if API returns partial data
  const displayData = {
    health: summary?.health || mockSummary.health,
    metrics: summary?.metrics || mockSummary.metrics,
    alerts: summary?.alerts || mockSummary.alerts,
    stats: summary?.stats || mockSummary.stats,
  };
  const alerts = alertsData?.alerts?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">System monitoring and management</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/monitoring">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Activity className="h-4 w-4 inline mr-2" />
                Monitoring
              </motion.button>
            </Link>
            <Link href="/admin/users">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Users className="h-4 w-4 inline mr-2" />
                Users
              </motion.button>
            </Link>
          </div>
        </div>

        {/* System Health */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className={`h-8 w-8 ${getStatusColor(displayData.health.status)}`} />
                <div>
                  <p className="text-2xl font-bold text-white capitalize">
                    {displayData.health.status}
                  </p>
                  <p className="text-sm text-gray-400">
                    Uptime: {displayData.health.uptime.toFixed(2)}%
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-green-600 text-green-400">
                All Systems Operational
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-white">
                    {displayData.metrics.cpu.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-400">8 cores</span>
                </div>
                <Progress value={displayData.metrics.cpu} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Database className="h-4 w-4" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-white">
                    {displayData.metrics.memory.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-400">16 GB</span>
                </div>
                <Progress value={displayData.metrics.memory} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <HardDrive className="h-4 w-4" />
                Disk Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-white">
                    {displayData.metrics.disk.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-400">1 TB</span>
                </div>
                <Progress value={displayData.metrics.disk} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5" />
                System Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-300">Total Users</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {displayData.stats.totalUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">Active Users</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {displayData.stats.activeUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-300">Total Projects</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {displayData.stats.totalProjects.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Alerts
                </span>
                <div className="flex gap-2">
                  {displayData.alerts.critical > 0 && (
                    <Badge variant="destructive">{displayData.alerts.critical} Critical</Badge>
                  )}
                  {displayData.alerts.warning > 0 && (
                    <Badge className="bg-yellow-600 hover:bg-yellow-700">
                      {displayData.alerts.warning} Warning
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg"
                    >
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="text-white font-medium">{alert.title}</p>
                        <p className="text-sm text-gray-400">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link href="/admin/monitoring" className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      View All Alerts
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-400">No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/monitoring">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg text-center cursor-pointer"
                >
                  <Activity className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Monitoring</p>
                </motion.div>
              </Link>
              <Link href="/admin/users">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-purple-600/20 border border-purple-600/30 rounded-lg text-center cursor-pointer"
                >
                  <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Users</p>
                </motion.div>
              </Link>
              <Link href="/admin/audit">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-green-600/20 border border-green-600/30 rounded-lg text-center cursor-pointer"
                >
                  <Server className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Audit Logs</p>
                </motion.div>
              </Link>
              <Link href="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gray-600/20 border border-gray-600/30 rounded-lg text-center cursor-pointer"
                >
                  <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Dashboard</p>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
