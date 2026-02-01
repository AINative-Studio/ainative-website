'use client';

import { useState, useEffect } from 'react';
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
  const [usageData, setUsageData] = useState<UsageData>({
    credits: {
      used: 7500,
      total: 10000,
      nextRefresh: '2025-01-15'
    },
    apiCalls: {
      total: 12450,
      thisMonth: 3240,
      lastMonth: 2890
    },
    storage: {
      used: 2.4,
      total: 10
    },
    billing: {
      currentPlan: 'Pro',
      monthlySpend: 49.99,
      billingDate: '2025-01-01'
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const creditsPercentage = (usageData.credits.used / usageData.credits.total) * 100;
  const storagePercentage = (usageData.storage.used / usageData.storage.total) * 100;
  const apiGrowth = ((usageData.apiCalls.thisMonth - usageData.apiCalls.lastMonth) / usageData.apiCalls.lastMonth) * 100;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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

      {/* Usage Cards */}
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
              <p className="text-xs text-muted-foreground mt-2">
                Refreshes on {new Date(usageData.credits.nextRefresh).toLocaleDateString()}
              </p>
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
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className={`h-3 w-3 ${apiGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${apiGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {apiGrowth >= 0 ? '+' : ''}{apiGrowth.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
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
                      Next refresh: {new Date(usageData.credits.nextRefresh).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
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
    </div>
  );
}
