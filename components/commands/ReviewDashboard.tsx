'use client';

/**
 * Review Dashboard Component
 * Displays review history, statistics, and trends
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Code2,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ReviewHistoryItem, ReviewStats } from '@/lib/types/review';

const COLORS = {
  security: '#ef4444',
  performance: '#f59e0b',
  style: '#3b82f6',
};

export function ReviewDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);

  useEffect(() => {
    // In production, fetch from API
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    // Mock data for demonstration
    const mockStats: ReviewStats = {
      totalReviews: 145,
      averageScore: 82,
      totalIssuesFound: 1234,
      totalIssuesFixed: 987,
      byType: {
        security: 45,
        performance: 52,
        style: 48,
      },
      trends: [
        { date: '2026-01-12', score: 75, issues: 45 },
        { date: '2026-01-13', score: 78, issues: 38 },
        { date: '2026-01-14', score: 80, issues: 32 },
        { date: '2026-01-15', score: 82, issues: 28 },
        { date: '2026-01-16', score: 85, issues: 22 },
        { date: '2026-01-17', score: 83, issues: 25 },
        { date: '2026-01-18', score: 87, issues: 18 },
      ],
    };

    const mockHistory: ReviewHistoryItem[] = [
      {
        id: 'rev-001',
        timestamp: new Date('2026-01-18T10:30:00'),
        type: 'all',
        score: 87,
        filesReviewed: 12,
        issuesFound: 18,
        status: 'completed',
      },
      {
        id: 'rev-002',
        timestamp: new Date('2026-01-17T14:20:00'),
        type: 'security',
        score: 92,
        filesReviewed: 8,
        issuesFound: 5,
        status: 'completed',
      },
      {
        id: 'rev-003',
        timestamp: new Date('2026-01-17T09:15:00'),
        type: 'performance',
        score: 78,
        filesReviewed: 15,
        issuesFound: 25,
        status: 'completed',
      },
      {
        id: 'rev-004',
        timestamp: new Date('2026-01-16T16:45:00'),
        type: 'style',
        score: 85,
        filesReviewed: 20,
        issuesFound: 22,
        status: 'completed',
      },
      {
        id: 'rev-005',
        timestamp: new Date('2026-01-16T11:00:00'),
        type: 'all',
        score: 82,
        filesReviewed: 18,
        issuesFound: 28,
        status: 'completed',
      },
    ];

    setStats(mockStats);
    setHistory(mockHistory);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-600' };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-600' };
    return { icon: TrendingUp, color: 'text-gray-600' };
  };

  const getReviewTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'style':
        return <Code2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReviewTypeColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'border-red-500';
      case 'performance':
        return 'border-yellow-500';
      case 'style':
        return 'border-blue-500';
      default:
        return 'border-gray-500';
    }
  };

  if (!stats) {
    return <div>Loading dashboard...</div>;
  }

  const pieData = [
    { name: 'Security', value: stats.byType.security, color: COLORS.security },
    { name: 'Performance', value: stats.byType.performance, color: COLORS.performance },
    { name: 'Style', value: stats.byType.style, color: COLORS.style },
  ];

  const fixRate = ((stats.totalIssuesFixed / stats.totalIssuesFound) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review Dashboard</h2>
          <p className="text-muted-foreground">
            Track code quality metrics and review history
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              Across all review types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore}
              <span className="text-sm">/100</span>
            </div>
            <p className="text-xs text-muted-foreground">
              +5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssuesFound}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalIssuesFixed} fixed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fix Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fixRate}%</div>
            <p className="text-xs text-muted-foreground">
              Of all issues detected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Trends Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Score Trends</CardTitle>
            <CardDescription>
              Review scores and issues over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Score"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="issues"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Issues"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Review Type Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Review Distribution</CardTitle>
            <CardDescription>
              Reviews by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} reviews</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
          <CardDescription>
            Your latest code reviews and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {history.map((review) => (
                <Card key={review.id} className={`border-l-4 ${getReviewTypeColor(review.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getReviewTypeIcon(review.type)}
                          <span className="font-medium">
                            {review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review
                          </span>
                          <Badge
                            variant={review.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {review.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {review.timestamp.toLocaleString()}
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span>{review.filesReviewed} files reviewed</span>
                          <span>•</span>
                          <span>{review.issuesFound} issues found</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(review.score)}`}>
                          {review.score}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Team Metrics (if applicable) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'XSS Vulnerabilities', count: 23, severity: 'critical' },
                { name: 'Memory Leaks', count: 18, severity: 'high' },
                { name: 'Console Statements', count: 45, severity: 'medium' },
                { name: 'Unused Variables', count: 32, severity: 'low' },
              ].map((issue, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{issue.name}</span>
                    <span className="text-sm text-muted-foreground">{issue.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        issue.severity === 'critical'
                          ? 'bg-red-600'
                          : issue.severity === 'high'
                          ? 'bg-orange-600'
                          : issue.severity === 'medium'
                          ? 'bg-yellow-600'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${(issue.count / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Run Security Review
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Run Performance Review
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Code2 className="mr-2 h-4 w-4" />
              Run Style Review
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Review Git Diff
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
