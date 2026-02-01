'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ArrowDownIcon, Clock, CheckCircle2, XCircle, Activity } from 'lucide-react';

// Sample data for demonstration
const generateCompletionTrends = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => ({
    day,
    completions: Math.floor(Math.random() * 100) + 50,
    successful: Math.floor(Math.random() * 80) + 40,
    failed: Math.floor(Math.random() * 20) + 5,
  }));
};

const generateCompletionDistribution = () => {
  return [
    { range: '0-100ms', count: 45 },
    { range: '100-500ms', count: 120 },
    { range: '500ms-1s', count: 85 },
    { range: '1-2s', count: 50 },
    { range: '2-5s', count: 30 },
    { range: '5s+', count: 10 },
  ];
};

const generateSuccessFailureData = () => {
  return [
    { name: 'Successful', value: 340, color: '#10b981' },
    { name: 'Failed', value: 25, color: '#ef4444' },
  ];
};

type TimePeriod = 'day' | 'week' | 'month';

export default function CompletionStatisticsClient() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  const completionTrends = useMemo(() => generateCompletionTrends(), [timePeriod]);
  const completionDistribution = useMemo(() => generateCompletionDistribution(), []);
  const successFailureData = useMemo(() => generateSuccessFailureData(), []);

  // Calculate metrics
  const totalCompletions = useMemo(() => {
    return completionTrends.reduce((sum, item) => sum + item.completions, 0);
  }, [completionTrends]);

  const successfulCompletions = useMemo(() => {
    return completionTrends.reduce((sum, item) => sum + item.successful, 0);
  }, [completionTrends]);

  const completionRate = useMemo(() => {
    return totalCompletions > 0 ? ((successfulCompletions / totalCompletions) * 100).toFixed(1) : 0;
  }, [totalCompletions, successfulCompletions]);

  const successRate = useMemo(() => {
    const total = successFailureData.reduce((sum, item) => sum + item.value, 0);
    const successful = successFailureData.find((item) => item.name === 'Successful')?.value || 0;
    return total > 0 ? ((successful / total) * 100).toFixed(1) : 0;
  }, [successFailureData]);

  const averageTime = useMemo(() => {
    // Calculate weighted average based on distribution
    const timeRanges = [
      { range: '0-100ms', midpoint: 50 },
      { range: '100-500ms', midpoint: 300 },
      { range: '500ms-1s', midpoint: 750 },
      { range: '1-2s', midpoint: 1500 },
      { range: '2-5s', midpoint: 3500 },
      { range: '5s+', midpoint: 6000 },
    ];

    const totalCount = completionDistribution.reduce((sum, item) => sum + item.count, 0);
    const weightedSum = completionDistribution.reduce((sum, item, index) => {
      return sum + item.count * timeRanges[index].midpoint;
    }, 0);

    const avgMs = totalCount > 0 ? weightedSum / totalCount : 0;
    return avgMs >= 1000 ? `${(avgMs / 1000).toFixed(2)}s` : `${avgMs.toFixed(0)}ms`;
  }, [completionDistribution]);

  const metrics = [
    {
      id: 'completion-rate',
      title: 'Completion Rate',
      value: `${completionRate}%`,
      trend: +2.5,
      icon: Activity,
      description: 'Overall completion performance',
    },
    {
      id: 'average-time',
      title: 'Average Time',
      value: averageTime,
      trend: -5.2,
      icon: Clock,
      description: 'Mean completion duration',
    },
    {
      id: 'success-rate',
      title: 'Success Rate',
      value: `${successRate}%`,
      trend: +1.8,
      icon: CheckCircle2,
      description: 'Successful vs failed ratio',
    },
    {
      id: 'total-completions',
      title: 'Total Completions',
      value: totalCompletions.toString(),
      trend: +12.3,
      icon: XCircle,
      description: 'Total processed requests',
    },
  ];

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-background to-muted/20"
      data-testid="completion-statistics-container"
    >
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Completion Statistics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time analytics and performance metrics for API completion tracking
          </p>
        </motion.div>

        {/* Time Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center gap-2"
        >
          {(['day', 'week', 'month'] as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? 'default' : 'outline'}
              onClick={() => setTimePeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          data-testid="metrics-grid"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const isPositiveTrend = metric.trend > 0;
            const TrendIcon = isPositiveTrend ? ArrowUpIcon : ArrowDownIcon;

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Card
                  className="hover:shadow-lg transition-shadow"
                  role="region"
                  aria-label={metric.title}
                  data-testid={`metric-${metric.id}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendIcon
                        className={`h-4 w-4 ${
                          isPositiveTrend ? 'text-green-500' : 'text-red-500'
                        }`}
                        data-testid={`trend-indicator-${metric.id}`}
                      />
                      <span
                        className={`text-xs ${
                          isPositiveTrend ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {Math.abs(metric.trend)}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last {timePeriod}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="charts-container">
          {/* Completion Trends Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card role="region" aria-label="Completion Trends Over Time">
              <CardHeader>
                <CardTitle>Completion Trends Over Time</CardTitle>
                <CardDescription>Daily completion statistics and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={completionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="completions"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Total"
                    />
                    <Line
                      type="monotone"
                      dataKey="successful"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Successful"
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Failed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Completion Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card role="region" aria-label="Completion Time Distribution">
              <CardHeader>
                <CardTitle>Completion Time Distribution</CardTitle>
                <CardDescription>Response time breakdown by time ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Completions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Success vs Failure Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card role="region" aria-label="Success vs Failure Distribution">
              <CardHeader>
                <CardTitle>Success vs Failure Distribution</CardTitle>
                <CardDescription>Overall success rate visualization</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={successFailureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {successFailureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>About Completion Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This demo showcases real-time completion statistics with interactive charts and
                performance metrics. The data visualization helps track API completion rates,
                response times, and success rates across different time periods.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Real-time metrics</li>
                    <li>Interactive charts</li>
                    <li>Time period filtering</li>
                    <li>Responsive design</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Metrics Tracked</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Completion rate</li>
                    <li>Average response time</li>
                    <li>Success/failure ratio</li>
                    <li>Total completions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Use Cases</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>API monitoring</li>
                    <li>Performance analysis</li>
                    <li>Quality assurance</li>
                    <li>Trend identification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Hidden live region for screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Statistics updated for {timePeriod} period
      </div>
    </main>
  );
}
