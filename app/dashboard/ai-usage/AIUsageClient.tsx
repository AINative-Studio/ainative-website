'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { aiRegistryService, type ExportUsageParams, type UsageQueryParams, type ProviderUsage, type ModelUsage, type DailyUsageEntry } from '@/lib/ai-registry-service';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Zap, Download, Calendar, Brain } from 'lucide-react';

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

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AIUsageClient() {
  const [mounted, setMounted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateRange, setDateRange] = useState({});

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch usage summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['ai-usage-summary', dateRange],
    queryFn: () => aiRegistryService.getUsageSummary(dateRange),
  });

  // Fetch usage by model
  const { data: byModelData, isLoading: modelLoading } = useQuery({
    queryKey: ['ai-usage-by-model', dateRange],
    queryFn: () => aiRegistryService.getUsageByModel(dateRange),
  });

  // Fetch daily usage
  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ['ai-usage-daily', dateRange],
    queryFn: () => aiRegistryService.getDailyUsage(dateRange),
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (params: ExportUsageParams) => aiRegistryService.exportUsageData(params),
    onSuccess: (data) => {
      window.open(data.download_url, '_blank');
    },
  });

  const handleDateRangeChange = () => {
    const params: UsageQueryParams = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    setDateRange(params);
  };

  const handleExport = (format: string) => {
    exportMutation.mutate({
      ...dateRange,
      format,
      include_models: true,
    });
  };

  const isLoading = !mounted || summaryLoading || modelLoading || dailyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const summary = {
    total_requests: summaryData?.total_requests ?? 0,
    total_tokens: summaryData?.total_tokens ?? 0,
    total_cost: summaryData?.total_cost ?? 0,
    by_provider: summaryData?.by_provider ?? [],
  };
  const modelUsage = byModelData?.usage || [];
  const dailyUsage = dailyData?.daily_usage || [];

  // Format data for charts
  const providerChartData = (summary.by_provider || []).map((p: ProviderUsage) => ({
    name: p.provider,
    requests: p.requests,
    tokens: p.tokens,
    cost: p.cost,
  }));

  const modelChartData = modelUsage.map((m: ModelUsage) => ({
    name: m.model_name,
    requests: m.requests,
    tokens: m.tokens,
    cost: m.cost,
  }));

  const dailyChartData = dailyUsage.map((d: DailyUsageEntry) => {
    // Use consistent date format to avoid hydration mismatch
    const date = new Date(d.date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[date.getMonth()]} ${date.getDate()}`;
    return {
      date: formattedDate,
      requests: d.requests,
      tokens: d.tokens,
      cost: d.cost,
    };
  });

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
            <h1 className="text-4xl font-bold mb-2">AI Usage Analytics</h1>
            <p className="text-muted-foreground">
              Track your AI model usage, costs, and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={exportMutation.isPending}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('json')}
              disabled={exportMutation.isPending}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Range Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="grid gap-2 flex-1">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2 flex-1">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleDateRangeChange}>Apply Filter</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_requests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                AI model API calls
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_tokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Tokens processed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.total_cost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total spending
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Usage by Provider */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle>Usage by Provider</CardTitle>
              <CardDescription>Distribution of requests across AI providers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={providerChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="requests"
                  >
                    {providerChartData.map((_entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usage by Model */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader>
              <CardTitle>Usage by Model</CardTitle>
              <CardDescription>Request count per AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill="#8b5cf6" name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Usage Trend */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Usage Trend</CardTitle>
              <CardDescription>API requests and token usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="requests"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Requests"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="tokens"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Tokens"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost by Model */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cost by Model</CardTitle>
              <CardDescription>Spending breakdown per AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cost" fill="#10b981" name="Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Detailed Model Usage Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Detailed Model Usage
            </CardTitle>
            <CardDescription>Complete breakdown of usage metrics by model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Model</th>
                    <th className="text-left py-3 px-4">Provider</th>
                    <th className="text-right py-3 px-4">Requests</th>
                    <th className="text-right py-3 px-4">Tokens</th>
                    <th className="text-right py-3 px-4">Avg Tokens</th>
                    <th className="text-right py-3 px-4">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {modelUsage.map((model: ModelUsage) => (
                    <tr key={model.model_id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{model.model_name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                          {model.provider}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{model.requests.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{model.tokens.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{model.avg_tokens_per_request.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-semibold">${model.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {modelUsage.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No usage data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
