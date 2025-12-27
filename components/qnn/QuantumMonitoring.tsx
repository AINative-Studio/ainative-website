import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  Cpu,
  HardDrive,
  Zap,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Server,
} from 'lucide-react';
import { format } from 'date-fns';

// Type definitions
interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  quantum_job_queue_length: number;
  active_circuits: number;
  cpu_trend?: 'up' | 'down' | 'stable';
  memory_trend?: 'up' | 'down' | 'stable';
  queue_trend?: 'up' | 'down' | 'stable';
  circuits_trend?: 'up' | 'down' | 'stable';
}

interface QuantumMetrics {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  average_execution_time: number;
  resource_utilization: {
    [device: string]: number;
  };
}

interface CostMetrics {
  daily_cost_usd: number;
  monthly_cost_usd: number;
  projected_monthly_cost_usd: number;
  cost_by_device: {
    [device: string]: number;
  };
}

interface DeviceStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  queue_length: number;
  last_update: string;
  backend_version?: string;
  pending_jobs?: number;
}

interface SystemAlert {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  device?: string;
}

interface Anomaly {
  id: string;
  metric: string;
  value: number;
  expected_range: [number, number];
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  device?: string;
  description?: string;
}

interface AnomalyHistory {
  date: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface MonitoringData {
  timestamp: string;
  system_metrics: SystemMetrics;
  quantum_metrics: QuantumMetrics;
  cost_metrics: CostMetrics;
  device_status: DeviceStatus[];
  alerts: SystemAlert[];
}

interface AnomalyData {
  anomalies: Anomaly[];
  anomaly_history: AnomalyHistory[];
}

const COLORS = {
  primary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  chart: ['#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'],
};

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function QuantumMonitoring() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch monitoring data
  const fetchMonitoringData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }

    try {
      const response = await fetch('/api/v1/monitoring/metrics');
      if (!response.ok) {
        throw new Error(`Failed to fetch monitoring data: ${response.statusText}`);
      }
      const data = await response.json();
      setMonitoringData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch anomaly data
  const fetchAnomalyData = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/monitoring/anomalies');
      if (!response.ok) {
        throw new Error(`Failed to fetch anomaly data: ${response.statusText}`);
      }
      const data = await response.json();
      setAnomalyData(data);
    } catch (err) {
      console.error('Error fetching anomaly data:', err);
    }
  }, []);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchMonitoringData();
    fetchAnomalyData();

    const interval = setInterval(() => {
      fetchMonitoringData();
      fetchAnomalyData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchMonitoringData, fetchAnomalyData]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchMonitoringData(true);
    fetchAnomalyData();
  };

  // Handle alert dismissal
  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  // Export metrics report
  const handleExportReport = () => {
    if (!monitoringData) return;

    const report = {
      generated_at: new Date().toISOString(),
      monitoring_data: monitoringData,
      anomaly_data: anomalyData,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum-monitoring-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get trend icon
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return 'default';
      case 'offline':
        return 'destructive';
      case 'maintenance':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'error':
      case 'critical':
        return COLORS.danger;
      case 'warning':
      case 'high':
        return COLORS.warning;
      case 'medium':
        return COLORS.info;
      case 'info':
      case 'low':
        return COLORS.success;
      default:
        return COLORS.info;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Error Loading Monitoring Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!monitoringData) return null;

  const { system_metrics, quantum_metrics, cost_metrics, device_status, alerts } = monitoringData;

  // Prepare resource utilization data for pie chart
  const resourceData = Object.entries(quantum_metrics.resource_utilization || {}).map(([device, value]) => ({
    name: device,
    value,
  }));

  // Prepare cost by device data for bar chart
  const costByDeviceData = Object.entries(cost_metrics.cost_by_device || {}).map(([device, cost]) => ({
    device,
    cost,
  }));

  // Filter dismissed alerts
  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  // Auto-scroll to critical alerts
  useEffect(() => {
    const criticalAlert = activeAlerts.find(a => a.severity === 'error');
    if (criticalAlert) {
      const element = document.getElementById(`alert-${criticalAlert.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeAlerts]);

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Quantum System Monitoring</CardTitle>
                  <CardDescription>
                    Real-time monitoring of quantum computing resources and system health
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lastUpdate && (
                  <span className="text-sm text-muted-foreground">
                    Last updated: {format(lastUpdate, 'HH:mm:ss')}
                  </span>
                )}
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                >
                  <motion.div
                    animate={refreshing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                  </motion.div>
                  Refresh
                </Button>
                <Button onClick={handleExportReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* System Metrics Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU Usage */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold">{system_metrics.cpu_usage.toFixed(1)}%</div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(system_metrics.cpu_trend)}
                    <span className="text-xs text-muted-foreground">from last check</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold">{system_metrics.memory_usage.toFixed(1)}%</div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(system_metrics.memory_trend)}
                    <span className="text-xs text-muted-foreground">from last check</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantum Job Queue */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Job Queue</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold">{system_metrics.quantum_job_queue_length}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(system_metrics.queue_trend)}
                    <span className="text-xs text-muted-foreground">pending jobs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Circuits */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Active Circuits</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold">{system_metrics.active_circuits}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(system_metrics.circuits_trend)}
                    <span className="text-xs text-muted-foreground">running now</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Quantum Resource Usage & Cost Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantum Resource Usage */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quantum Resource Usage</CardTitle>
              <CardDescription>Resource distribution across quantum devices</CardDescription>
            </CardHeader>
            <CardContent>
              {resourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={resourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {resourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No resource data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Tracking */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Cost Tracking</CardTitle>
              <CardDescription>Monthly quantum computing expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cost Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Daily Cost</p>
                  <p className="text-2xl font-bold">${cost_metrics.daily_cost_usd.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold">${cost_metrics.monthly_cost_usd.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Projected Monthly</p>
                  <div>
                    <p className="text-2xl font-bold">${cost_metrics.projected_monthly_cost_usd.toFixed(2)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {cost_metrics.projected_monthly_cost_usd > cost_metrics.monthly_cost_usd ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500">
                            +${(cost_metrics.projected_monthly_cost_usd - cost_metrics.monthly_cost_usd).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">
                            -${(cost_metrics.monthly_cost_usd - cost_metrics.projected_monthly_cost_usd).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cost by Device Chart */}
              {costByDeviceData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Cost by Device</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={costByDeviceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="device" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                        formatter={(value?: number) => `$${(value ?? 0).toFixed(2)}`}
                      />
                      <Bar dataKey="cost" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quantum Device Status */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Quantum Device Status</CardTitle>
            <CardDescription>Real-time status of quantum computing devices</CardDescription>
          </CardHeader>
          <CardContent>
            {device_status.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {device_status.map((device, index) => (
                  <motion.div
                    key={device.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">{device.name}</CardTitle>
                          </div>
                          <Badge
                            variant={getStatusBadgeVariant(device.status)}
                            className={
                              device.status === 'online'
                                ? 'bg-green-500'
                                : device.status === 'offline'
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }
                          >
                            {device.status === 'online' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {device.status === 'offline' && <XCircle className="h-3 w-3 mr-1" />}
                            {device.status === 'maintenance' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {device.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Queue Length:</span>
                          <span className="font-medium">{device.queue_length}</span>
                        </div>
                        {device.pending_jobs !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pending Jobs:</span>
                            <span className="font-medium">{device.pending_jobs}</span>
                          </div>
                        )}
                        {device.backend_version && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Version:</span>
                            <span className="font-mono text-xs">{device.backend_version}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Last update: {format(new Date(device.last_update), 'HH:mm:ss')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No device status available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* System Alerts & Anomaly Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>
                    {activeAlerts.length > 0
                      ? `${activeAlerts.length} active alert${activeAlerts.length !== 1 ? 's' : ''}`
                      : 'No active alerts'}
                  </CardDescription>
                </div>
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive">{activeAlerts.length}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {activeAlerts.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {activeAlerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          id={`alert-${alert.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Alert
                            className="relative"
                            style={{ borderLeftColor: getSeverityColor(alert.severity), borderLeftWidth: 4 }}
                          >
                            <div className="flex items-start gap-3">
                              {alert.severity === 'error' && <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />}
                              {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                              {alert.severity === 'info' && <Info className="h-4 w-4 text-blue-500 mt-0.5" />}
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {alert.severity.toUpperCase()}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleDismissAlert(alert.id)}
                                  >
                                    ×
                                  </Button>
                                </div>
                                <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                                  {alert.device && (
                                    <>
                                      <span>•</span>
                                      <Server className="h-3 w-3" />
                                      {alert.device}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Alert>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                    <p className="text-sm font-medium">System Operating Normally</p>
                    <p className="text-xs text-muted-foreground">No active alerts detected</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Anomaly Detection */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
              <CardDescription>
                {anomalyData?.anomalies.length
                  ? `${anomalyData.anomalies.length} anomal${anomalyData.anomalies.length !== 1 ? 'ies' : 'y'} detected`
                  : 'No anomalies detected'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {anomalyData?.anomalies && anomalyData.anomalies.length > 0 ? (
                  <div className="space-y-3">
                    {anomalyData.anomalies.map((anomaly) => (
                      <Card key={anomaly.id} className="border-l-4" style={{ borderLeftColor: getSeverityColor(anomaly.severity) }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" style={{ color: getSeverityColor(anomaly.severity) }} />
                              <CardTitle className="text-sm">{anomaly.metric}</CardTitle>
                            </div>
                            <Badge
                              variant="outline"
                              style={{ borderColor: getSeverityColor(anomaly.severity), color: getSeverityColor(anomaly.severity) }}
                            >
                              {anomaly.severity}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Current Value:</span>
                              <p className="font-medium">{anomaly.value.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected Range:</span>
                              <p className="font-medium">
                                {anomaly.expected_range[0].toFixed(1)} - {anomaly.expected_range[1].toFixed(1)}
                              </p>
                            </div>
                          </div>
                          {anomaly.description && (
                            <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                            <Clock className="h-3 w-3" />
                            {format(new Date(anomaly.timestamp), 'MMM dd, HH:mm:ss')}
                            {anomaly.device && (
                              <>
                                <span>•</span>
                                <Server className="h-3 w-3" />
                                {anomaly.device}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                    <p className="text-sm font-medium">No Anomalies Detected</p>
                    <p className="text-xs text-muted-foreground">All metrics within expected ranges</p>
                  </div>
                )}
              </ScrollArea>

              {/* Anomaly History Chart */}
              {anomalyData?.anomaly_history && anomalyData.anomaly_history.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="text-sm font-medium mb-3">Anomaly Trend</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={anomalyData.anomaly_history}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="critical" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="high" stroke={COLORS.warning} strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="medium" stroke={COLORS.info} strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="low" stroke={COLORS.success} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
