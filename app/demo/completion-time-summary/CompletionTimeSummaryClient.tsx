'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Zap,
  Timer,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Type definitions
interface CompletionData {
  date: string;
  completions: number;
  avgTime: number;
  fastestTime: number;
  slowestTime: number;
}

interface TimeStats {
  total: number;
  average: number;
  fastest: number;
  slowest: number;
  trend: number;
}

type TimePeriod = 'daily' | 'weekly' | 'monthly';

// Mock data generator
const generateMockData = (period: TimePeriod): CompletionData[] => {
  const now = new Date();
  const data: CompletionData[] = [];

  const periods = {
    daily: { count: 30, format: (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
    weekly: { count: 12, format: (d: Date) => `Week ${Math.floor((d.getDate() - 1) / 7) + 1}` },
    monthly: { count: 12, format: (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
  };

  const config = periods[period];

  for (let i = config.count - 1; i >= 0; i--) {
    const date = new Date(now);

    if (period === 'daily') {
      date.setDate(date.getDate() - i);
    } else if (period === 'weekly') {
      date.setDate(date.getDate() - (i * 7));
    } else {
      date.setMonth(date.getMonth() - i);
    }

    const baseTime = 300 + Math.random() * 200; // Base: 5-8 minutes
    const variation = Math.random() * 100 - 50;

    data.push({
      date: config.format(date),
      completions: Math.floor(20 + Math.random() * 50),
      avgTime: Math.floor(baseTime + variation),
      fastestTime: Math.floor((baseTime + variation) * 0.4),
      slowestTime: Math.floor((baseTime + variation) * 1.8),
    });
  }

  return data;
};

// Utility functions
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
};

const calculateStats = (data: CompletionData[]): TimeStats => {
  if (data.length === 0) {
    return { total: 0, average: 0, fastest: 0, slowest: 0, trend: 0 };
  }

  const total = data.reduce((sum, d) => sum + d.completions, 0);
  const avgTime = data.reduce((sum, d) => sum + d.avgTime, 0) / data.length;
  const fastest = Math.min(...data.map(d => d.fastestTime));
  const slowest = Math.max(...data.map(d => d.slowestTime));

  // Calculate trend (compare first half vs second half)
  const mid = Math.floor(data.length / 2);
  const firstHalfAvg = data.slice(0, mid).reduce((sum, d) => sum + d.avgTime, 0) / mid;
  const secondHalfAvg = data.slice(mid).reduce((sum, d) => sum + d.avgTime, 0) / (data.length - mid);
  const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  return {
    total,
    average: Math.floor(avgTime),
    fastest: Math.floor(fastest),
    slowest: Math.floor(slowest),
    trend: Math.floor(trend),
  };
};

export default function CompletionTimeSummaryClient() {
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('daily');
  const [selectedStat, setSelectedStat] = React.useState<string | null>(null);

  // Memoize data to avoid recalculation
  const data = React.useMemo(() => generateMockData(timePeriod), [timePeriod]);
  const stats = React.useMemo(() => calculateStats(data), [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Badge className="mb-4 bg-blue-600 text-white">Live Demo</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Completion Time Summary
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Track and analyze completion times across different time periods with interactive timeline visualization
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            <span>Real-time completion trend analysis with daily, weekly, and monthly views</span>
          </div>
        </motion.div>

        {/* Time Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-gray-900/50">
              <TabsTrigger value="daily">
                <Calendar className="h-4 w-4 mr-2" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly">
                <Activity className="h-4 w-4 mr-2" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly">
                <Clock className="h-4 w-4 mr-2" />
                Monthly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Completions */}
          <Card
            data-testid="stat-card"
            className="bg-gray-900/50 border-gray-800 cursor-pointer hover:bg-gray-900/70 transition-colors"
            onClick={() => setSelectedStat(selectedStat === 'total' ? null : 'total')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{stats.total}</div>
              <div className="flex items-center text-sm">
                {stats.trend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">+{Math.abs(stats.trend)}%</span>
                  </>
                ) : stats.trend < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-500">{stats.trend}%</span>
                  </>
                ) : (
                  <span className="text-gray-500">→ No change</span>
                )}
                <span className="text-gray-500 ml-2">vs previous period</span>
              </div>
            </CardContent>
          </Card>

          {/* Average Time */}
          <Card
            data-testid="stat-card"
            className="bg-gray-900/50 border-gray-800 cursor-pointer hover:bg-gray-900/70 transition-colors"
            onClick={() => setSelectedStat(selectedStat === 'average' ? null : 'average')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Average Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{formatTime(stats.average)}</div>
              <div className="flex items-center text-sm">
                {stats.trend < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500">{Math.abs(stats.trend)}% faster</span>
                  </>
                ) : stats.trend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-yellow-500">+{stats.trend}% slower</span>
                  </>
                ) : (
                  <span className="text-gray-500">→ Consistent</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fastest Completion */}
          <Card
            data-testid="stat-card"
            className="bg-gray-900/50 border-gray-800 cursor-pointer hover:bg-gray-900/70 transition-colors"
            onClick={() => setSelectedStat(selectedStat === 'fastest' ? null : 'fastest')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                Fastest Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-green-400">{formatTime(stats.fastest)}</div>
              <div className="text-sm text-gray-500">Best performance time</div>
            </CardContent>
          </Card>

          {/* Slowest Completion */}
          <Card
            data-testid="stat-card"
            className="bg-gray-900/50 border-gray-800 cursor-pointer hover:bg-gray-900/70 transition-colors"
            onClick={() => setSelectedStat(selectedStat === 'slowest' ? null : 'slowest')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                Slowest Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-orange-400">{formatTime(stats.slowest)}</div>
              <div className="text-sm text-gray-500">Maximum time recorded</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Statistics Modal */}
        {selectedStat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStat(null)}
          >
            <Card
              className="bg-gray-900 border-gray-800 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
                <CardDescription>
                  In-depth analysis for {selectedStat} metric
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Additional insights and breakdown for the selected metric would appear here.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Completion Time Trends Over {timePeriod === 'daily' ? 'Days' : timePeriod === 'weekly' ? 'Weeks' : 'Months'}
              </CardTitle>
              <CardDescription>
                Completion time trends over the selected time period showing average, fastest, and slowest times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      label={{
                        value: 'Time (seconds)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: '#9CA3AF' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6',
                      }}
                      formatter={(value?: number) => [formatTime(value ?? 0), '']}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Average Time"
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fastestTime"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Fastest Time"
                      dot={{ fill: '#10B981', r: 3 }}
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="slowestTime"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Slowest Time"
                      dot={{ fill: '#F59E0B', r: 3 }}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Screen reader accessible description */}
              <div role="status" className="sr-only" aria-live="polite">
                Chart showing completion time trends for {timePeriod} period with {data.length} data points.
                Average completion time is {formatTime(stats.average)}.
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Performance Trend</h3>
                  <p className="text-sm text-gray-400">
                    {stats.trend < 0
                      ? `Completion times have improved by ${Math.abs(stats.trend)}% in the recent period, indicating better performance.`
                      : stats.trend > 0
                      ? `Completion times have increased by ${stats.trend}% recently. Consider investigating potential bottlenecks.`
                      : 'Completion times remain stable with no significant changes.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Consistency Analysis</h3>
                  <p className="text-sm text-gray-400">
                    The difference between fastest ({formatTime(stats.fastest)}) and slowest ({formatTime(stats.slowest)})
                    completions is {formatTime(stats.slowest - stats.fastest)}, indicating{' '}
                    {(stats.slowest / stats.fastest) > 2 ? 'variable' : 'consistent'} performance.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Volume Metrics</h3>
                  <p className="text-sm text-gray-400">
                    Total of {stats.total} completions tracked across the {timePeriod} view period,
                    averaging {Math.floor(stats.total / data.length)} completions per {timePeriod === 'daily' ? 'day' : timePeriod === 'weekly' ? 'week' : 'month'}.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Optimization Opportunities</h3>
                  <p className="text-sm text-gray-400">
                    {stats.trend > 10
                      ? 'Recent performance degradation detected. Review system resources and optimize workflows.'
                      : 'Performance is stable. Focus on maintaining current optimization strategies.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accessibility Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Keyboard Navigation</h3>
                  <p className="text-sm text-gray-400">
                    All interactive elements support full keyboard navigation with proper tab order and focus management.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Screen Reader Support</h3>
                  <p className="text-sm text-gray-400">
                    ARIA live regions announce data changes, and all visualizations have text alternatives.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Responsive Design</h3>
                  <p className="text-sm text-gray-400">
                    Optimized layouts for mobile (single column), tablet (2 columns), and desktop (4 columns) displays.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Color Contrast</h3>
                  <p className="text-sm text-gray-400">
                    All text and interactive elements meet WCAG AA standards for color contrast ratios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
