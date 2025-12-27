import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Alert, AlertDescription } from '../../ui/alert';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';

import { 
  AnalyticsService,
  type UsageMetrics,
  type ServiceHealth,
  type BillingUsage,
  type SystemMetrics
} from '../../../services/zerodb';

interface AnalyticsMonitoringProps {
  className?: string;
}

export const AnalyticsMonitoring: React.FC<AnalyticsMonitoringProps> = ({ className }) => {
  const [selectedTab, setSelectedTab] = useState('usage');
  const [timeRange, setTimeRange] = useState('7d');
  const [realtimeMetrics, setRealtimeMetrics] = useState<SystemMetrics | null>(null);

  // Queries with error handling
  const { data: usageData = [], isLoading: isLoadingUsage, error: usageError } = useQuery({
    queryKey: ['usage-analytics', timeRange],
    queryFn: () => AnalyticsService.getUsageAnalytics(timeRange),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: healthData = [], isLoading: isLoadingHealth, error: healthError } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => AnalyticsService.getSystemHealth(),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: billingData, isLoading: isLoadingBilling, error: billingError } = useQuery({
    queryKey: ['billing-usage'],
    queryFn: () => AnalyticsService.getBillingUsage(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: performanceData, isLoading: isLoadingPerformance, error: performanceError } = useQuery({
    queryKey: ['performance-metrics', timeRange],
    queryFn: () => AnalyticsService.getPerformanceMetrics(undefined, timeRange),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: errorData, isLoading: isLoadingErrors, error: errorAnalyticsError } = useQuery({
    queryKey: ['error-analytics', timeRange],
    queryFn: () => AnalyticsService.getErrorAnalytics(timeRange),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: alerts = [], error: alertsError } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => AnalyticsService.getAlerts('active'),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refetch every minute
  });

  // Real-time metrics subscription with error handling
  useEffect(() => {
    let subscription: Promise<{ unsubscribe: () => void }> | null = null;
    
    const startSubscription = async () => {
      try {
        subscription = AnalyticsService.subscribeToMetrics(
          (metrics) => setRealtimeMetrics(metrics),
          5000
        );
      } catch (error) {
        console.error('Failed to start real-time metrics subscription:', error);
      }
    };

    startSubscription();

    return () => {
      if (subscription) {
        subscription.then(sub => sub.unsubscribe()).catch(console.error);
      }
    };
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Test content to ensure visibility */}
      <div className="p-4 bg-blue-100 border border-blue-300 rounded">
        <h2 className="text-xl font-bold">Analytics & Monitoring Dashboard</h2>
        <p>Real-time metrics and performance monitoring</p>
      </div>
      {/* Real-time System Overview */}
      {realtimeMetrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold">{(realtimeMetrics.cpu_usage_percent || 0).toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Memory</p>
                <p className="text-2xl font-bold">{(realtimeMetrics.memory_usage_mb || 0).toFixed(0)} MB</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-bold">{realtimeMetrics.active_connections || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                <p className="text-2xl font-bold">{((realtimeMetrics.disk_usage_mb || 0) / 1024).toFixed(1)} GB</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Activity className="h-8 w-8 text-gray-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Loading metrics...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {alerts.length} active alert{alerts.length > 1 ? 's' : ''} requiring attention
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Usage Analytics */}
        <TabsContent value="usage" className="space-y-4">
          <h3 className="text-lg font-semibold">Usage Analytics</h3>
          {isLoadingUsage ? (
            <div>Loading usage data...</div>
          ) : usageData && Array.isArray(usageData) && usageData.length > 0 ? (
            <div className="grid gap-4">
              {usageData.map((metric: UsageMetrics, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{metric.period}</CardTitle>
                    <CardDescription>API Usage Statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">API Calls</p>
                        <p className="text-2xl font-bold">{metric.api_calls.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Data Processed</p>
                        <p className="text-2xl font-bold">{metric.data_processed_mb}MB</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold">{((metric.success_rate || 0) * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Errors</p>
                        <p className="text-2xl font-bold text-red-600">{metric.error_count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">No usage data available for the selected time range.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Health */}
        <TabsContent value="health" className="space-y-4">
          <h3 className="text-lg font-semibold">System Health</h3>
          {isLoadingHealth ? (
            <div>Loading health data...</div>
          ) : (
            <div className="grid gap-4">
              {healthData.map((service: ServiceHealth, index: number) => (
                <Card key={service.service_name || `service-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getHealthIcon(service.status)}
                        <CardTitle>{service.service_name}</CardTitle>
                      </div>
                      <Badge 
                        variant={service.status === 'healthy' ? 'default' : 
                               service.status === 'degraded' ? 'secondary' : 'destructive'}
                      >
                        {service.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="text-lg font-semibold">{(service.uptime_percentage || 0).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Response Time</p>
                        <p className="text-lg font-semibold">{service.response_time_ms}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Check</p>
                        <p className="text-lg font-semibold">{new Date(service.last_check).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    {service.issues && service.issues.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-red-600 mb-2">Issues:</p>
                        <ul className="text-sm space-y-1">
                          {(service.issues || []).map((issue, index) => (
                            <li key={index} className="text-red-600">• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <h3 className="text-lg font-semibold">Performance Metrics</h3>
          {isLoadingPerformance ? (
            <div>Loading performance data...</div>
          ) : performanceData ? (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                  <CardDescription>API response time statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Average</p>
                      <p className="text-2xl font-bold">{performanceData.average_response_time_ms}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">95th Percentile</p>
                      <p className="text-2xl font-bold">{performanceData.p95_response_time_ms}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">99th Percentile</p>
                      <p className="text-2xl font-bold">{performanceData.p99_response_time_ms}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Throughput & Reliability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Throughput</p>
                      <p className="text-2xl font-bold">{performanceData.throughput_rps} RPS</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Error Rate</p>
                      <p className="text-2xl font-bold text-red-600">{((performanceData.error_rate || 0) * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="text-2xl font-bold">{(performanceData.uptime_percentage || 0).toFixed(2)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <h3 className="text-lg font-semibold">Billing & Usage</h3>
          {isLoadingBilling ? (
            <div>Loading billing data...</div>
          ) : billingData ? (
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Period: {billingData.period}</CardTitle>
                  <CardDescription>Usage and cost breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="text-2xl font-bold">${(billingData.total_cost || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Projected Monthly</p>
                      <p className="text-2xl font-bold">${(billingData.projected_monthly_cost || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Credits Used</p>
                      <p className="text-2xl font-bold">{billingData.credits_used}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Credits Remaining</p>
                      <p className="text-2xl font-bold">{billingData.credits_remaining}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Cost by Service</h4>
                    <div className="space-y-2">
                      {Object.entries(billingData?.cost_by_service || {}).map(([service, cost]) => (
                        <div key={service} className="flex justify-between items-center">
                          <span className="capitalize">{service}</span>
                          <span className="font-medium">${(cost as number).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* Errors */}
        <TabsContent value="errors" className="space-y-4">
          <h3 className="text-lg font-semibold">Error Analytics</h3>
          {isLoadingErrors ? (
            <div>Loading error data...</div>
          ) : errorData ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="flex items-center p-6">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Errors</p>
                      <p className="text-2xl font-bold text-red-600">{errorData.total_errors}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-6">
                    <TrendingUp className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Error Rate</p>
                      <p className="text-2xl font-bold text-red-600">{((errorData.error_rate || 0) * 100).toFixed(2)}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Errors by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(errorData?.errors_by_type || {}).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span>{type}</span>
                          <Badge variant="destructive">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(errorData?.top_errors || []).map((error, index) => (
                        <div key={index} className="p-2 border rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{error.error_type}</span>
                            <Badge variant="destructive">{error.count}</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Last seen: {new Date(error.last_seen).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};