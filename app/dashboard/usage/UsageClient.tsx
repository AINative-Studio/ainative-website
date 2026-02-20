'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart2,
  Zap,
  CreditCard,
  TrendingUp,
  Calendar,
  Download,
  RefreshCcw,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { creditService } from '@/services/creditService';
import { subscriptionService } from '@/services/subscriptionService';
import { usageService } from '@/services/usageService';

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

interface UsageData {
  credits: {
    used: number;
    total: number;
    nextRefresh: string;
  };
  apiCalls: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
  storage: {
    used: number;
    total: number;
  };
  billing: {
    currentPlan: string;
    monthlySpend: number;
    billingDate: string;
  };
}

export default function UsageClient() {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const [creditsResult, planResult, usageLimitsResult, metricsResult] =
        await Promise.allSettled([
          creditService.getCreditBalance(),
          subscriptionService.getCurrentPlan(),
          usageService.getUsageLimits(),
          usageService.getUsageMetrics('30d')
        ]);

      // Build credits section
      let creditsUsed = 0;
      let creditsTotal = 0;
      let nextRefresh = '';

      if (creditsResult.status === 'fulfilled' && creditsResult.value) {
        creditsUsed = creditsResult.value.used_credits;
        creditsTotal = creditsResult.value.total_credits;
        nextRefresh = creditsResult.value.period_end || '';
      }

      if (usageLimitsResult.status === 'fulfilled' && usageLimitsResult.value) {
        const limits = usageLimitsResult.value;
        if (limits.credits_used != null) creditsUsed = limits.credits_used;
        if (limits.monthly_credits != null) creditsTotal = limits.monthly_credits;
        if (limits.reset_date) nextRefresh = limits.reset_date;
      }

      // Build API calls section from usage metrics
      let totalApiCalls = 0;
      let thisMonthCalls = 0;
      let lastMonthCalls = 0;

      if (metricsResult.status === 'fulfilled' && metricsResult.value) {
        const metrics = metricsResult.value;
        const dailyUsage = metrics.daily_usage || [];
        totalApiCalls = dailyUsage.reduce((sum, d) => sum + d.credits_used, 0);

        // Calculate this month vs last month from daily data
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        dailyUsage.forEach((d) => {
          const date = new Date(d.date);
          if (date >= thisMonthStart) {
            thisMonthCalls += d.credits_used;
          } else if (date >= lastMonthStart && date < thisMonthStart) {
            lastMonthCalls += d.credits_used;
          }
        });
      }

      // Build billing section from plan
      let currentPlan = 'Free';
      let monthlySpend = 0;
      let billingDate = '';

      if (planResult.status === 'fulfilled' && planResult.value) {
        currentPlan = planResult.value.name;
        monthlySpend = planResult.value.price;
        billingDate = planResult.value.current_period_end || '';
      }

      // Build storage from usage limits features
      let storageUsed = 0;
      let storageTotal = 0;

      if (usageLimitsResult.status === 'fulfilled' && usageLimitsResult.value) {
        const storageFeature = usageLimitsResult.value.features?.find(
          (f) => f.name.toLowerCase().includes('storage')
        );
        if (storageFeature) {
          storageUsed = storageFeature.used;
          storageTotal = storageFeature.limit;
        }
      }

      setUsageData({
        credits: { used: creditsUsed, total: creditsTotal, nextRefresh },
        apiCalls: { total: totalApiCalls, thisMonth: thisMonthCalls, lastMonth: lastMonthCalls },
        storage: { used: storageUsed, total: storageTotal || 10 },
        billing: { currentPlan, monthlySpend, billingDate }
      });
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      setError('Unable to load usage data. Please try refreshing.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUsageData();
    }
  }, [mounted, fetchUsageData]);

  const handleRefresh = () => {
    fetchUsageData();
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!usageData && !error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (error && !usageData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const creditsPercentage = usageData && usageData.credits.total > 0
    ? (usageData.credits.used / usageData.credits.total) * 100
    : 0;
  const storagePercentage = usageData && usageData.storage.total > 0
    ? (usageData.storage.used / usageData.storage.total) * 100
    : 0;
  const apiGrowth = usageData && usageData.apiCalls.lastMonth > 0
    ? ((usageData.apiCalls.thisMonth - usageData.apiCalls.lastMonth) / usageData.apiCalls.lastMonth) * 100
    : 0;

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
            <h1 className="text-4xl font-bold mb-2">Usage Overview</h1>
            <p className="text-muted-foreground">
              Monitor your account usage, credits, and billing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && usageData && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <p className="text-sm text-yellow-200">{error}</p>
        </div>
      )}

      {/* Usage Cards */}
      {usageData && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={fadeUp}>
              <Card className="bg-surface-secondary border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                  <Zap className="h-4 w-4 text-[#4B6FED]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.credits.used.toLocaleString()} / {usageData.credits.total.toLocaleString()}
                  </div>
                  <Progress value={creditsPercentage} className="mt-3 h-2" />
                  {usageData.credits.nextRefresh && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Refreshes on {new Date(usageData.credits.nextRefresh).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="bg-surface-secondary border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                  <BarChart2 className="h-4 w-4 text-[#4B6FED]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.apiCalls.thisMonth.toLocaleString()}
                  </div>
                  {usageData.apiCalls.lastMonth > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`h-3 w-3 ${apiGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-xs ${apiGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {apiGrowth >= 0 ? '+' : ''}{apiGrowth.toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="bg-surface-secondary border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <BarChart2 className="h-4 w-4 text-[#4B6FED]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usageData.storage.used} GB / {usageData.storage.total} GB
                  </div>
                  <Progress value={storagePercentage} className="mt-3 h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {(usageData.storage.total - usageData.storage.used).toFixed(1)} GB remaining
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="bg-surface-secondary border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
                  <CreditCard className="h-4 w-4 text-[#4B6FED]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${usageData.billing.monthlySpend.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="border-[#4B6FED] text-[#4B6FED]">
                      {usageData.billing.currentPlan}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Credit Details */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Card className="bg-surface-secondary border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Credit Details
                </CardTitle>
                <CardDescription>
                  Your current credit usage and allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Base Plan Credits</p>
                      <p className="text-sm text-muted-foreground">Monthly allocation from your plan</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{usageData.credits.total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">credits/month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Used This Period</p>
                      <p className="text-sm text-muted-foreground">Credits consumed since billing cycle start</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-500">{usageData.credits.used.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{creditsPercentage.toFixed(0)}% used</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Remaining</p>
                      <p className="text-sm text-muted-foreground">Credits available until refresh</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">
                        {(usageData.credits.total - usageData.credits.used).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">credits left</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {usageData.credits.nextRefresh ? (
                            <>Next refresh: {new Date(usageData.credits.nextRefresh).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</>
                          ) : (
                            'Next refresh date not available'
                          )}
                        </span>
                      </div>
                      <Link href="/purchase-credits">
                        <Button size="sm" className="bg-[#4B6FED] hover:bg-[#4B6FED]/80 gap-1">
                          Purchase Credits
                          <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Card className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 border-[#4B6FED]/30">
              <CardContent className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#4B6FED]/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-[#4B6FED]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Need more resources?</h3>
                    <p className="text-gray-400 text-sm">
                      Upgrade your plan or purchase additional credits
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/plan">
                    <Button variant="outline" className="border-[#4B6FED] text-[#4B6FED]">
                      View Plans
                    </Button>
                  </Link>
                  <Link href="/purchase-credits">
                    <Button className="bg-[#4B6FED] hover:bg-[#4B6FED]/80">
                      Purchase Credits
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
