/**
 * Credit Usage Chart Component
 * Displays credit usage breakdown by category using a pie chart
 *
 * @module CreditUsageChart
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Database, Brain, HardDrive, Server, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useCreditUsage } from '@/hooks/useBilling';

/**
 * Credit Usage Chart Props
 */
export interface CreditUsageChartProps {
  projectId: string;
  timeRange?: string;
  className?: string;
}

/**
 * Chart Data Item Interface
 */
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  icon: React.ElementType;
  [key: string]: string | number | React.ElementType;
}

/**
 * Custom Tooltip Component
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-foreground mb-1">
          {data.name}
        </p>
        <p className="text-lg font-bold text-primary">
          {data.value?.toLocaleString() || 0} credits
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Custom Legend Component
 */
const CustomLegend: React.FC<{ payload?: Array<{ value: string; color: string; payload: ChartDataItem }> }> = ({ payload }) => {
  if (!payload) return null;

  return (
    <div className="grid grid-cols-1 gap-2 mt-4">
      {payload.map((entry, index) => {
        const Icon = entry.payload.icon;
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground flex-1">{entry.value}</span>
            <span className="font-medium text-foreground">
              {entry.payload.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Credit Usage Chart Component
 * Displays a pie chart with credit usage breakdown across 5 categories
 *
 * @example
 * ```tsx
 * <CreditUsageChart projectId="abc123" timeRange="last_30_days" />
 * ```
 */
export function CreditUsageChart({
  projectId,
  timeRange = 'last_30_days',
  className
}: CreditUsageChartProps) {
  const { data, isLoading, error } = useCreditUsage(projectId, timeRange);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Credit Usage by Category</CardTitle>
          <CardDescription>Loading usage breakdown...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
          <div className="space-y-2 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Credit Usage by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load credit usage data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.breakdown) {
    return null;
  }

  // Define colors for each category
  const colors = {
    vector_operations: '#4B6FED',
    memory_operations: '#338585',
    storage_operations: '#FCAE39',
    database_operations: '#22BCDE',
    postgres_queries: '#E11D48'
  };

  // Define icons for each category
  const icons = {
    vector_operations: Search,
    memory_operations: Brain,
    storage_operations: HardDrive,
    database_operations: Database,
    postgres_queries: Server
  };

  // Prepare chart data - only include categories with usage > 0
  const chartData: ChartDataItem[] = [
    {
      name: 'Vector Operations',
      value: data.breakdown.vector_operations || 0,
      color: colors.vector_operations,
      icon: icons.vector_operations
    },
    {
      name: 'Memory Operations',
      value: data.breakdown.memory_operations || 0,
      color: colors.memory_operations,
      icon: icons.memory_operations
    },
    {
      name: 'Storage Operations',
      value: data.breakdown.storage_operations || 0,
      color: colors.storage_operations,
      icon: icons.storage_operations
    },
    {
      name: 'Database Operations',
      value: data.breakdown.database_operations || 0,
      color: colors.database_operations,
      icon: icons.database_operations
    },
    {
      name: 'PostgreSQL Queries',
      value: data.breakdown.postgres_queries || 0,
      color: colors.postgres_queries,
      icon: icons.postgres_queries
    }
  ].filter(item => item.value > 0);

  // If no usage data, show empty state
  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Credit Usage by Category</CardTitle>
          <CardDescription>No credit usage in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Database className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">No operations performed yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCredits = data.total_credits_used || 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Credit Usage by Category</CardTitle>
        <CardDescription>
          Total: {totalCredits.toLocaleString()} credits used ({data.usage_percentage.toFixed(1)}% of limit)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default CreditUsageChart;
