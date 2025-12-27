/**
 * Kong Metrics Component
 * Displays real-time Kong API Gateway metrics with 4 key performance indicators
 *
 * @module KongMetrics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { useRealtimeMetrics, formatMetricValue, getMetricStatusColor } from '@/hooks/useDashboardStats';
import { cn } from '@/lib/utils';

/**
 * Metric Card Props
 */
interface MetricCardProps {
  title: string;
  value: number;
  unit: 'ms' | 'req/min' | '%' | 'count';
  icon: React.ElementType;
  status?: 'green' | 'yellow' | 'red';
  description?: string;
}

/**
 * Individual Metric Card Component
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  status = 'green',
  description
}) => {
  const statusColors = {
    green: 'text-green-500 bg-green-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    red: 'text-red-500 bg-red-500/10'
  };

  const statusBorderColors = {
    green: 'border-green-500/20',
    yellow: 'border-yellow-500/20',
    red: 'border-red-500/20'
  };

  return (
    <Card className={cn(
      'border-2 transition-all duration-200 hover:shadow-md',
      statusBorderColors[status]
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn('p-2 rounded-full', statusColors[status])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {formatMetricValue(value, unit)}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Skeleton Cards for Loading State
 */
const SkeletonCards: React.FC<{ count: number }> = ({ count }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    ))}
  </>
);

/**
 * Error Card Component
 */
const ErrorCard: React.FC<{ message: string }> = ({ message }) => (
  <div className="col-span-full">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Loading Metrics</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  </div>
);

/**
 * Kong Metrics Props
 */
export interface KongMetricsProps {
  projectId?: string;
  refreshInterval?: number;
  className?: string;
}

/**
 * Kong Metrics Component
 * Displays 4 key metrics: Request Rate, Avg Latency, Error Rate, Active Connections
 *
 * @example
 * ```tsx
 * <KongMetrics projectId="abc123" refreshInterval={5000} />
 * ```
 */
export function KongMetrics({
  projectId,
  refreshInterval = 5000,
  className
}: KongMetricsProps) {
  const { data: metrics, isLoading, error } = useRealtimeMetrics(projectId, refreshInterval);

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        <SkeletonCards count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('grid grid-cols-1', className)}>
        <ErrorCard message="Unable to load Kong metrics. The API gateway may be unavailable." />
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const { kong } = metrics;

  // Calculate status colors based on thresholds
  const latencyStatus = getMetricStatusColor(kong.avg_latency_ms, 200, 500);
  const errorRateStatus = getMetricStatusColor(kong.error_rate_percentage, 1, 5);

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {/* Request Rate */}
      <MetricCard
        title="Request Rate"
        value={kong.throughput_per_min}
        unit="req/min"
        icon={Activity}
        status="green"
        description="Requests per minute"
      />

      {/* Average Latency */}
      <MetricCard
        title="Avg Latency"
        value={kong.avg_latency_ms}
        unit="ms"
        icon={Zap}
        status={latencyStatus}
        description={latencyStatus === 'red' ? 'High latency detected' : 'Response time'}
      />

      {/* Error Rate */}
      <MetricCard
        title="Error Rate"
        value={kong.error_rate_percentage}
        unit="%"
        icon={AlertCircle}
        status={errorRateStatus}
        description={errorRateStatus === 'red' ? 'Error threshold exceeded' : 'Failed requests'}
      />

      {/* Active Connections */}
      <MetricCard
        title="Active Connections"
        value={kong.active_connections}
        unit="count"
        icon={TrendingUp}
        status="green"
        description="Current connections"
      />
    </div>
  );
}

export default KongMetrics;
