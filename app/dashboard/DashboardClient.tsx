'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AIKitButton } from '@/components/aikit/AIKitButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandedWelcome } from '@/components/branding/BrandedWelcome';
import {
  CircleHelp,
  ChevronRight,
  BarChart2,
  Settings,
  RefreshCcw,
  Download
} from 'lucide-react';
import { creditService } from '@/services/creditService';
import { subscriptionService } from '@/services/subscriptionService';
import { dashboardService, AiUsageCosts } from '@/services/dashboardService';
import { usageService } from '@/services/usageService';

/**
 * Generates a default avatar URL using Gravatar's identicon service
 */
function generateDefaultAvatar(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hashString = Math.abs(hash).toString(16);
  return `https://www.gravatar.com/avatar/${hashString}?d=identicon&s=80`;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

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
  basePromptCredits: {
    used: number;
    total: number;
  };
  additionalPromptCredits: {
    used: number;
    total: number;
  };
  nextPlanRefresh: {
    days: number;
    date: string;
  };
  usagePeriod: {
    startDate: string;
  };
}

interface DashboardUser {
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
}

interface AiMetrics {
  codeGeneration: {
    totalProjects: number;
    linesGenerated: number;
    componentsCreated: number;
    lastGeneration: string;
  };
  modelUsage: Record<string, number>;
  apiIntegrations: {
    activeProviders: string[];
    totalRequests: number;
    avgResponseTime: number;
  };
  aiAssistance: {
    codeReviews: number;
    bugsFixed: number;
    optimizations: number;
    refactorings: number;
  };
}

function mapCreditsToUsageData(credits: { used: number; total: number; next_reset_date?: string }): UsageData {
  const nextRefreshDate = credits.next_reset_date
    ? new Date(credits.next_reset_date)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil(
    (nextRefreshDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  ));

  const periodStart = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return {
    basePromptCredits: {
      used: credits.used,
      total: credits.total
    },
    additionalPromptCredits: {
      used: 0,
      total: 0
    },
    nextPlanRefresh: {
      days: diffDays,
      date: nextRefreshDate.toLocaleDateString()
    },
    usagePeriod: {
      startDate: periodStart
    }
  };
}

export default function DashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ email?: string; name?: string } | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Free');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiMetrics, setAiMetrics] = useState<AiMetrics | null>(null);
  const [costData, setCostData] = useState<AiUsageCosts | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const router = useRouter();

  // Load session and welcome state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setSessionUser({ email: userData.email, name: userData.name });
      }

      const welcomeDismissed = localStorage.getItem('dashboard_welcome_dismissed');
      if (welcomeDismissed === 'true') {
        setShowWelcome(false);
      }
    } catch {
      // Ignore parse errors
    }
    setSessionLoaded(true);
  }, []);

  const handleWelcomeDismiss = useCallback(() => {
    setShowWelcome(false);
    try {
      localStorage.setItem('dashboard_welcome_dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setApiError(null);

      // Build user from session
      if (sessionUser) {
        setUser({
          login: sessionUser.email?.split('@')[0] || 'user',
          name: sessionUser.name || 'User',
          email: sessionUser.email || undefined,
          avatar_url: generateDefaultAvatar(sessionUser.email || 'user')
        });
      } else {
        setUser({
          login: 'user',
          name: 'User',
          avatar_url: generateDefaultAvatar('user')
        });
      }

      // Fetch all data in parallel from real APIs
      const [creditsResult, planResult, costsResult, aiUsageResult] = await Promise.allSettled([
        creditService.getCreditBalance(),
        subscriptionService.getCurrentPlan(),
        dashboardService.getAiUsageCosts(),
        usageService.getUsageMetrics('30d')
      ]);

      // Map credits to usage data
      if (creditsResult.status === 'fulfilled' && creditsResult.value) {
        setUsageData(mapCreditsToUsageData(creditsResult.value));
      } else {
        console.warn('Credits fetch failed:', creditsResult.status === 'rejected' ? creditsResult.reason : 'null response');
        setUsageData(null);
      }

      // Set subscription plan
      if (planResult.status === 'fulfilled' && planResult.value) {
        setSubscriptionPlan(planResult.value.name);
      } else {
        setSubscriptionPlan('Free');
      }

      // Set cost data
      if (costsResult.status === 'fulfilled' && costsResult.value) {
        setCostData(costsResult.value);
      } else {
        setCostData(null);
      }

      // Map AI usage to metrics
      if (aiUsageResult.status === 'fulfilled' && aiUsageResult.value) {
        const metrics = aiUsageResult.value;
        const modelUsage: Record<string, number> = {};
        if (metrics.by_feature) {
          metrics.by_feature.forEach((f) => {
            modelUsage[f.feature] = Math.round(f.percentage);
          });
        }

        setAiMetrics({
          codeGeneration: {
            totalProjects: 0,
            linesGenerated: 0,
            componentsCreated: 0,
            lastGeneration: ''
          },
          modelUsage,
          apiIntegrations: {
            activeProviders: Object.keys(modelUsage),
            totalRequests: metrics.daily_usage?.reduce(
              (sum, d) => sum + d.credits_used, 0
            ) || 0,
            avgResponseTime: 0
          },
          aiAssistance: {
            codeReviews: 0,
            bugsFixed: 0,
            optimizations: 0,
            refactorings: 0
          }
        });
      } else {
        setAiMetrics(null);
      }

    } catch (err) {
      console.error('Dashboard data load failed:', err);
      setApiError('Unable to load dashboard data. Please try refreshing.');
    } finally {
      setIsRefreshing(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    if (mounted && sessionLoaded) {
      fetchDashboardData();
    }
  }, [mounted, sessionLoaded, fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handlePurchaseCredits = () => {
    router.push('/purchase-credits');
  };

  const handleExportUsage = async (format: 'csv' | 'json') => {
    // TODO: Implement actual export when API is available
    console.log(`Exporting usage data as ${format}`);
    setApiError(`Export functionality coming soon`);
  };

  // Show loading state while mounted or user data is being fetched
  if (!mounted || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-vite-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const basePromptPercentage = usageData?.basePromptCredits?.total
    ? (usageData.basePromptCredits.used / usageData.basePromptCredits.total) * 100
    : 0;
  const additionalPromptPercentage = usageData?.additionalPromptCredits?.total
    ? (usageData.additionalPromptCredits.used / usageData.additionalPromptCredits.total) * 100
    : 0;

  const getProgressBarColor = (percentage: number) => {
    if (percentage < 80) {
      return 'from-green-500 to-green-400';
    } else if (percentage < 100) {
      return 'from-yellow-500 to-yellow-400';
    } else {
      return 'from-red-500 to-red-400';
    }
  };

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Welcome Card - Only shown to new users or until dismissed */}
      {showWelcome && (
        <motion.div className="mb-6" variants={fadeUp}>
          <BrandedWelcome
            title="Welcome to AI Native Studio"
            description="Get started by creating your first API key and explore our powerful AI development tools. Build faster with our comprehensive suite of APIs and services."
            actionLabel="Get Your API Key"
            actionHref="/developer-settings"
            userName={user?.name || sessionUser?.name}
            backgroundImage="/card.png"
            showImage
            showDismiss
            onDismiss={handleWelcomeDismiss}
            animate
          />
        </motion.div>
      )}

      {/* Usage Header */}
      <motion.div className="mb-6" variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-[#4B6FED] h-6 w-6" />
              <h2 className="text-2xl font-bold">Usage</h2>
            </div>
            <AIKitButton
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-white"
              title="Refresh data"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </AIKitButton>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <AIKitButton
              variant="outline"
              size="sm"
              onClick={() => handleExportUsage('csv')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </AIKitButton>
            <AIKitButton
              variant="outline"
              size="sm"
              onClick={() => handleExportUsage('json')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </AIKitButton>
            <Link href="/pricing">
              <AIKitButton
                variant="link"
                className="flex items-center gap-1 whitespace-nowrap">
                See updates to pricing structure
                <ChevronRight className="h-4 w-4" />
              </AIKitButton>
            </Link>
          </div>
        </div>

        {/* API Error Notification */}
        {apiError && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <div className="flex items-center gap-2">
              <CircleHelp className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-yellow-200">{apiError}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Usage Summary Cards */}
      <motion.div variants={stagger} className="space-y-6">
        <motion.div variants={fadeUp}>
          <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <RefreshCcw className="h-5 w-5 text-[#4B6FED]" />
                AINative Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!usageData ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Unable to load credit information</p>
                  <AIKitButton
                    onClick={handleRefresh}
                    variant="secondary"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Retry
                  </AIKitButton>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-4 flex items-center gap-2 bg-[#1C2128] p-3 rounded-md">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#4B6FED] animate-pulse"></span>
                    Next plan refresh is in {usageData.nextPlanRefresh?.days ?? 0} days on {usageData.nextPlanRefresh?.date ?? 'N/A'}.
                  </p>

                  {/* Base Credits */}
                  <div className="mt-6">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold text-white">Base Prompt Credits</h3>
                      <p className="text-sm font-medium text-white">
                        {(usageData.basePromptCredits?.used ?? 0).toLocaleString()} /{' '}
                        {(usageData.basePromptCredits?.total ?? 0).toLocaleString()} used
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      Using a premium model in AINative costs one prompt credit per use
                    </div>
                    <div className="bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${getProgressBarColor(basePromptPercentage)} h-full transition-all duration-300`}
                        style={{ width: `${Math.min(basePromptPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Usage since {usageData.usagePeriod.startDate}</p>
                  </div>

                  {/* Add-on Credits */}
                  <div className="mt-8">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold text-white">Add-on Prompt Credits</h3>
                      <p className="text-sm font-medium text-white">
                        {(usageData.additionalPromptCredits?.used ?? 0).toLocaleString()} /{' '}
                        {(usageData.additionalPromptCredits?.total ?? 0).toLocaleString()} used
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 mb-3">Additional prompt credits</div>
                    <div className="bg-gray-800 rounded-full h-2 mb-2 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${getProgressBarColor(additionalPromptPercentage)} h-full transition-all duration-300`}
                        style={{ width: `${Math.min(additionalPromptPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Usage since {usageData.usagePeriod.startDate}</p>
                  </div>

                  <div className="mt-6 p-4 bg-[#1C2128] rounded-md border border-border">
                    <p className="text-sm text-gray-300">
                      Once the usage limit is reached, AINative can continue to be used with the Base
                      model. To continue using premium models, purchase add-on prompt credits.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link href="/refills">
                      <AIKitButton className="font-medium w-full sm:w-auto">
                        <Settings className="h-4 w-4 mr-2" />
                        Setup automatic refills
                      </AIKitButton>
                    </Link>
                    <AIKitButton
                      variant="outline"
                      onClick={handlePurchaseCredits}
                      className="w-full sm:w-auto"
                    >
                      Purchase credits
                    </AIKitButton>
                  </div>

                  <div className="mt-6 flex items-center gap-2 p-3 border border-[#4B6FED]/20 rounded-md bg-[#4B6FED]/5">
                    <CircleHelp className="h-5 w-5 text-[#4B6FED]" />
                    <p className="text-sm text-white">Refer a friend to get 250 free add-on prompt credits</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Breakdown Section */}
        {costData && (
          <motion.div variants={fadeUp}>
            <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <BarChart2 className="h-5 w-5 text-[#4B6FED]" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Current Period Costs */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Current Period</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Base Fee:</span>
                        <span className="text-white">${costData.breakdown?.base_fee?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overage Fees:</span>
                        <span className="text-white">${costData.breakdown?.overage_fees?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-700">
                        <span className="text-white font-semibold">Total:</span>
                        <span className="text-white font-semibold">${costData.total_cost?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Projected Monthly */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Projected Monthly</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Cost:</span>
                        <span className="text-white text-xl font-bold">${costData.projected_monthly?.toFixed(2) || '0.00'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Based on current usage rate
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI Metrics Section */}
        {aiMetrics && (
          <motion.div variants={fadeUp}>
            <Card className="border-none bg-surface-secondary shadow-lg overflow-hidden">
              <CardHeader className="border-b border-border px-6 py-4">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <BarChart2 className="h-5 w-5 text-[#4B6FED]" />
                  AI Development Metrics
                </CardTitle>
              </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {/* Model Usage */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Model Usage</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(aiMetrics.modelUsage).length > 0 ? (
                        Object.entries(aiMetrics.modelUsage).slice(0, 5).map(([model, pct]) => (
                          <div key={model} className="flex justify-between">
                            <span className="text-gray-400">{model}:</span>
                            <span className="text-white">{pct}%</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-xs">No usage data yet</p>
                      )}
                    </div>
                  </div>

                  {/* API Integrations */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">API Integrations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Features:</span>
                        <span className="text-white">{aiMetrics.apiIntegrations.activeProviders.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Credits Used:</span>
                        <span className="text-white">{aiMetrics.apiIntegrations.totalRequests.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Plan */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Current Plan</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-white font-semibold">{subscriptionPlan}</span>
                      </div>
                      {costData && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Cost:</span>
                          <span className="text-white">${costData.total_cost?.toFixed(2) || '0.00'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
