/**
 * Metrics Dashboard Component for ZeroDB
 * Real-time metrics, charts, and monitoring visualization
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Users,
  DollarSign,
  Eye,
  RefreshCw,
} from 'lucide-react';

import { MetricCard, TimeSeriesData, ChartDataPoint, ServiceHealth } from './types';

interface MetricCardComponentProps {
  metric: MetricCard;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface MetricsGridProps {
  metrics: MetricCard[];
  columns?: number;
  className?: string;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  height?: number;
  showLegend?: boolean;
  className?: string;
}

interface ServiceHealthCardProps {
  services: ServiceHealth[];
  className?: string;
}

interface PerformanceOverviewProps {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIO: { in: number; out: number };
  className?: string;
}

// Utility function to format numbers
const formatNumber = (value: number | string, unit?: string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return String(value);
  
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B${unit ? ` ${unit}` : ''}`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M${unit ? ` ${unit}` : ''}`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)}K${unit ? ` ${unit}` : ''}`;
  }
  
  return `${num.toFixed(num % 1 === 0 ? 0 : 1)}${unit ? ` ${unit}` : ''}`;
};

// Get icon for metric status
const getStatusIcon = (status?: 'good' | 'warning' | 'error') => {
  switch (status) {
    case 'good':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

// Get trend icon
const getTrendIcon = (change?: number, changeType?: 'increase' | 'decrease') => {
  if (change === undefined) return <Minus className="h-4 w-4 text-muted-foreground" />;
  
  const isPositive = changeType === 'increase' ? change > 0 : change < 0;
  
  if (change === 0) {
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
  
  return isPositive ? (
    <TrendingUp className="h-4 w-4 text-green-500" />
  ) : (
    <TrendingDown className="h-4 w-4 text-red-500" />
  );
};

// Metric Card Component
const MetricCardComponent: React.FC<MetricCardComponentProps> = ({
  metric,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className={cn('font-medium text-muted-foreground', titleSizeClasses[size])}>
                {metric.title}
              </p>
              {getStatusIcon(metric.status)}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className={cn('font-bold text-foreground', valueSizeClasses[size])}>
                {formatNumber(metric.value, metric.unit)}
              </span>
              
              {metric.change !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.change, metric.change_type)}
                  <span className={cn(
                    'text-sm font-medium',
                    metric.change > 0 
                      ? (metric.change_type === 'increase' ? 'text-green-600' : 'text-red-600')
                      : metric.change < 0
                      ? (metric.change_type === 'increase' ? 'text-red-600' : 'text-green-600')
                      : 'text-muted-foreground'
                  )}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              )}
            </div>
            
            {metric.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {metric.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Metrics Grid Component
export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  columns = 3,
  className
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[Math.min(columns, 6) as keyof typeof gridClasses], className)}>
      {metrics.map((metric, index) => (
        <MetricCardComponent key={index} metric={metric} />
      ))}
    </div>
  );
};

// Simple Time Series Chart Component
export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  height = 200,
  showLegend = true,
  className
}) => {
  // Simple SVG chart implementation
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height });

  React.useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setDimensions({
          width: chartRef.current.offsetWidth,
          height: height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Find min/max values for scaling
  const allValues = data.flatMap(series => series.data_points.map(point => point.value));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  // Chart colors
  const colors = ['#4B6FED', '#338585', '#FCAE39', '#22BCDE', '#E11D48', '#059669'];

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div ref={chartRef} className="w-full">
          <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Data series */}
            {data.map((series, seriesIndex) => {
              const color = series.color || colors[seriesIndex % colors.length];
              const points = series.data_points.map((point, pointIndex) => {
                const x = (pointIndex / (series.data_points.length - 1)) * dimensions.width;
                const y = dimensions.height - ((point.value - minValue) / valueRange) * dimensions.height;
                return `${x},${y}`;
              }).join(' ');

              return (
                <g key={seriesIndex}>
                  <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    className="transition-all duration-300"
                  />
                  {/* Data points */}
                  {series.data_points.map((point, pointIndex) => {
                    const x = (pointIndex / (series.data_points.length - 1)) * dimensions.width;
                    const y = dimensions.height - ((point.value - minValue) / valueRange) * dimensions.height;
                    return (
                      <circle
                        key={pointIndex}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={color}
                        className="transition-all duration-300 hover:r-4"
                      >
                        <title>{`${series.series_name}: ${point.value}${series.unit || ''}`}</title>
                      </circle>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        {showLegend && data.length > 1 && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            {data.map((series, index) => {
              const color = series.color || colors[index % colors.length];
              return (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {series.series_name}
                    {series.unit && ` (${series.unit})`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Service Health Card Component
export const ServiceHealthCard: React.FC<ServiceHealthCardProps> = ({ 
  services, 
  className 
}) => {
  const getHealthColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthBadgeVariant = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'unhealthy': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Service Health
        </CardTitle>
        <CardDescription>
          Current status of all ZeroDB services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={cn('w-3 h-3 rounded-full', getHealthColor(service.status))} />
                <div>
                  <p className="font-medium text-sm">{service.service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {service.response_time_ms}ms • {service.uptime_percentage.toFixed(1)}% uptime
                  </p>
                </div>
              </div>
              <Badge variant={getHealthBadgeVariant(service.status)}>
                {service.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Performance Overview Component
export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  cpuUsage,
  memoryUsage,
  diskUsage,
  networkIO,
  className
}) => {
  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          System Performance
        </CardTitle>
        <CardDescription>
          Real-time resource utilization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* CPU Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <span className="text-sm font-medium">{cpuUsage.toFixed(1)}%</span>
            </div>
            <Progress value={cpuUsage} className="h-2" />
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className="text-sm font-medium">{memoryUsage.toFixed(1)}%</span>
            </div>
            <Progress value={memoryUsage} className="h-2" />
          </div>

          {/* Disk Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Disk</span>
              </div>
              <span className="text-sm font-medium">{diskUsage.toFixed(1)}%</span>
            </div>
            <Progress value={diskUsage} className="h-2" />
          </div>

          <Separator />

          {/* Network I/O */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Network In</span>
              </div>
              <p className="text-lg font-bold">{formatNumber(networkIO.in, 'MB/s')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Network Out</span>
              </div>
              <p className="text-lg font-bold">{formatNumber(networkIO.out, 'MB/s')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Metrics Dashboard Component
interface MetricsDashboardProps {
  metrics: MetricCard[];
  timeSeriesData?: TimeSeriesData[];
  services?: ServiceHealth[];
  performance?: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: { in: number; out: number };
  };
  onRefresh?: () => void;
  className?: string;
  realTimeUpdates?: boolean;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  timeSeriesData,
  services,
  performance,
  onRefresh,
  className,
  realTimeUpdates = true
}) => {
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  React.useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Metrics Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Main Metrics */}
      <MetricsGrid metrics={metrics} columns={4} />

      {/* Charts and Additional Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time Series Chart */}
        {timeSeriesData && timeSeriesData.length > 0 && (
          <div className="lg:col-span-2">
            <TimeSeriesChart 
              data={timeSeriesData} 
              height={300} 
              showLegend={true}
            />
          </div>
        )}

        {/* Service Health */}
        {services && services.length > 0 && (
          <ServiceHealthCard services={services} />
        )}

        {/* Performance Overview */}
        {performance && (
          <PerformanceOverview {...performance} />
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard;