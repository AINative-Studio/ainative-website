'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  earningsService,
  EarningsOverview,
  Transaction,
  EarningsBreakdown,
  PayoutSchedule,
  TransactionSource,
} from '@/services/earningsService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface EarningsState {
  overview: EarningsOverview | null;
  transactions: Transaction[];
  breakdown: EarningsBreakdown | null;
  payoutSchedule: PayoutSchedule | null;
  loading: boolean;
  error: string | null;
  totalTransactions: number;
  currentPage: number;
  pageSize: number;
  filterSource: TransactionSource | 'all';
  exportLoading: boolean;
  exportSuccess: boolean;
}

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4'];

export default function EarningsClient() {
  const [state, setState] = useState<EarningsState>({
    overview: null,
    transactions: [],
    breakdown: null,
    payoutSchedule: null,
    loading: true,
    error: null,
    totalTransactions: 0,
    currentPage: 1,
    pageSize: 10,
    filterSource: 'all',
    exportLoading: false,
    exportSuccess: false,
  });

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [overview, transactionsData, breakdown, payoutSchedule] = await Promise.all([
        earningsService.getEarningsOverview(),
        earningsService.getTransactions({
          page: state.currentPage,
          pageSize: state.pageSize,
          source: state.filterSource !== 'all' ? state.filterSource : undefined,
        }),
        earningsService.getEarningsBreakdown(),
        earningsService.getPayoutSchedule(),
      ]);

      setState((prev) => ({
        ...prev,
        overview,
        transactions: transactionsData.items,
        breakdown,
        payoutSchedule,
        totalTransactions: transactionsData.total,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load earnings data',
        loading: false,
      }));
    }
  }, [state.currentPage, state.pageSize, state.filterSource]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleExport = async () => {
    setState((prev) => ({ ...prev, exportLoading: true, exportSuccess: false }));

    try {
      await earningsService.exportTransactions('csv', {
        source: state.filterSource !== 'all' ? state.filterSource : undefined,
      });
      setState((prev) => ({ ...prev, exportLoading: false, exportSuccess: true }));
      setTimeout(() => {
        setState((prev) => ({ ...prev, exportSuccess: false }));
      }, 3000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        exportLoading: false,
        error: error instanceof Error ? error.message : 'Export failed',
      }));
    }
  };

  const handlePageChange = (newPage: number) => {
    setState((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleFilterChange = (source: string) => {
    setState((prev) => ({
      ...prev,
      filterSource: source as TransactionSource | 'all',
      currentPage: 1,
    }));
  };

  const handleRetry = () => {
    loadData();
  };

  const calculateGrowthPercentage = () => {
    if (!state.overview) return 0;
    const growth = earningsService.calculateGrowthPercentage(
      state.overview.thisMonth,
      state.overview.lastMonth
    );
    return isNaN(growth) ? 0 : growth;
  };

  const getChartData = () => {
    if (!state.breakdown) return [];

    const total = state.breakdown.api + state.breakdown.marketplace + state.breakdown.referrals;

    return [
      {
        name: 'API Earnings',
        value: state.breakdown.api,
        percentage: earningsService.calculatePercentage(state.breakdown.api, total),
      },
      {
        name: 'Marketplace Earnings',
        value: state.breakdown.marketplace,
        percentage: earningsService.calculatePercentage(state.breakdown.marketplace, total),
      },
      {
        name: 'Referral Earnings',
        value: state.breakdown.referrals,
        percentage: earningsService.calculatePercentage(state.breakdown.referrals, total),
      },
    ];
  };

  const isEligibleForPayout = () => {
    if (!state.overview || !state.payoutSchedule) return false;
    return state.overview.pendingPayout >= state.payoutSchedule.payoutThreshold;
  };

  const totalPages = Math.ceil(state.totalTransactions / state.pageSize);

  if (state.loading && !state.overview) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="earnings-loading">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (state.error && !state.overview) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load earnings data. {state.error}
            <Button onClick={handleRetry} variant="outline" size="sm" className="ml-4">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Earnings Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track your revenue, transactions, and payout schedule
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              disabled={state.loading}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="default"
              size="sm"
              disabled={state.exportLoading}
              aria-label="Export to CSV"
            >
              {state.exportLoading ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" data-testid="export-loading" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export to CSV
            </Button>
          </div>
        </div>

        {/* Success message */}
        <AnimatePresence>
          {state.exportSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert>
                <AlertDescription role="status">
                  Export successful! Your file has been downloaded.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overview Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          data-testid="earnings-overview"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {state.overview
                      ? earningsService.formatCurrency(state.overview.totalEarnings)
                      : '$0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {state.overview
                      ? earningsService.formatCurrency(state.overview.thisMonth)
                      : '$0.00'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">
                      {calculateGrowthPercentage().toFixed(1)}%
                    </p>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {state.overview
                      ? earningsService.formatCurrency(state.overview.pendingPayout)
                      : '$0.00'}
                  </p>
                  {isEligibleForPayout() ? (
                    <p className="text-xs text-green-600 mt-1">Eligible for payout</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Below threshold</p>
                  )}
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown and Payout Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>Revenue by source</CardDescription>
            </CardHeader>
            <CardContent>
              {state.breakdown ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={250} data-testid="earnings-chart">
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${String(name).split(' ')[0]}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value?: number) => earningsService.formatCurrency(value ?? 0)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">API Earnings</span>
                      <span className="font-semibold">
                        {earningsService.formatCurrency(state.breakdown.api)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Marketplace Earnings</span>
                      <span className="font-semibold">
                        {earningsService.formatCurrency(state.breakdown.marketplace)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Referral Earnings</span>
                      <span className="font-semibold">
                        {earningsService.formatCurrency(state.breakdown.referrals)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Skeleton className="h-64" />
              )}
            </CardContent>
          </Card>

          {/* Payout Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Schedule</CardTitle>
              <CardDescription>Next payout information</CardDescription>
            </CardHeader>
            <CardContent>
              {state.payoutSchedule ? (
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <p className="text-sm text-muted-foreground">Next Payout</p>
                    <p className="text-2xl font-bold">
                      {earningsService.formatDate(state.payoutSchedule.nextPayoutDate)}
                    </p>
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Minimum Payout</span>
                      <span className="font-semibold">
                        {earningsService.formatCurrency(state.payoutSchedule.minimumPayout)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Payout Threshold</span>
                      <span className="font-semibold">
                        {earningsService.formatCurrency(state.payoutSchedule.payoutThreshold)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Balance</span>
                      <span className="font-semibold">
                        {state.overview
                          ? earningsService.formatCurrency(state.overview.pendingPayout)
                          : '$0.00'}
                      </span>
                    </div>
                  </div>
                  {isEligibleForPayout() && (
                    <Alert>
                      <AlertDescription>
                        You are eligible for payout! Your earnings will be processed on{' '}
                        {earningsService.formatDate(state.payoutSchedule.nextPayoutDate)}.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Skeleton className="h-64" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent earnings transactions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={state.filterSource} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[180px]" aria-label="Filter by source">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="api">API Usage</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="referral">Referrals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {state.transactions.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table role="table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {earningsService.formatDate(transaction.date)}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {earningsService.getSourceDisplayText(transaction.source)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={earningsService.getStatusColorClass(transaction.status)}
                            >
                              {earningsService.getStatusDisplayText(transaction.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {earningsService.formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile List */}
                <div className="md:hidden space-y-4" data-testid="mobile-transaction-list">
                  {state.transactions.map((transaction) => (
                    <Card key={transaction.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {earningsService.formatDate(transaction.date)}
                            </p>
                          </div>
                          <p className="text-lg font-bold">
                            {earningsService.formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="outline">
                            {earningsService.getSourceDisplayText(transaction.source)}
                          </Badge>
                          <Badge
                            className={earningsService.getStatusColorClass(transaction.status)}
                          >
                            {earningsService.getStatusDisplayText(transaction.status)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {(state.currentPage - 1) * state.pageSize + 1} to{' '}
                      {Math.min(state.currentPage * state.pageSize, state.totalTransactions)} of{' '}
                      {state.totalTransactions} transactions
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(state.currentPage - 1)}
                        disabled={state.currentPage === 1}
                        aria-label="Previous"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(state.currentPage + 1)}
                        disabled={state.currentPage === totalPages}
                        aria-label="Next"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {state.error ? 'Failed to load transactions' : 'No transactions found'}
                </p>
                {state.error && (
                  <Button onClick={handleRetry} variant="outline" size="sm" className="mt-4">
                    Retry
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
