'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CircleHelp,
  ChevronRight,
  BarChart2,
  Settings,
  RefreshCcw,
  Download
} from 'lucide-react';

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
  modelUsage: {
    gpt4: number;
    claude: number;
    llama: number;
    custom: number;
  };
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

interface CostData {
  total_cost: number;
  currency: string;
  period: string;
  breakdown: {
    base_fee: number;
    overage_fees: number;
    overage_breakdown: {
      api_credits: number;
      llm_tokens: number;
      storage_gb: number;
      mcp_hours: number;
    };
  };
  projected_monthly: number;
}

export default function DashboardClient() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Free');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [aiMetrics, setAiMetrics] = useState<AiMetrics | null>(null);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // Set mock AI metrics data
  const setMockAiMetrics = useCallback(() => {
    setAiMetrics({
      codeGeneration: {
        totalProjects: 12,
        linesGenerated: 45230,
        componentsCreated: 89,
        lastGeneration: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      modelUsage: {
        gpt4: 45,
        claude: 35,
        llama: 15,
        custom: 5
      },
      apiIntegrations: {
        activeProviders: ['OpenAI', 'Anthropic', 'Meta'],
        totalRequests: 1247,
        avgResponseTime: 1.2
      },
      aiAssistance: {
        codeReviews: 34,
        bugsFixed: 18,
        optimizations: 12,
        refactorings: 7
      }
    });
  }, []);

  // Set mock usage data
  const setMockUsageData = useCallback(() => {
    const nextRefreshDate = new Date();
    nextRefreshDate.setDate(nextRefreshDate.getDate() + 15);

    setUsageData({
      basePromptCredits: {
        used: 750,
        total: 1000
      },
      additionalPromptCredits: {
        used: 150,
        total: 500
      },
      nextPlanRefresh: {
        days: 15,
        date: nextRefreshDate.toLocaleDateString()
      },
      usagePeriod: {
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    });
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setApiError(null);

      // Check for auth token
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('access_token') || localStorage.getItem('auth_token')
        : null;

      if (!token) {
        // For demo purposes, set mock data instead of redirecting
        setUser({
          login: 'demo_user',
          name: 'Demo User',
          email: 'demo@example.com',
          avatar_url: generateDefaultAvatar('demo_user')
        });
        setMockUsageData();
        setMockAiMetrics();
        setSubscriptionPlan('Pro');
        setCostData({
          total_cost: 49.99,
          currency: 'USD',
          period: 'current',
          breakdown: {
            base_fee: 49.99,
            overage_fees: 0,
            overage_breakdown: {
              api_credits: 0,
              llm_tokens: 0,
              storage_gb: 0,
              mcp_hours: 0
            }
          },
          projected_monthly: 49.99
        });
        return;
      }

      // TODO: Implement actual API calls when services are migrated
      // For now, use mock data
      setUser({
        login: 'authenticated_user',
        name: 'Authenticated User',
        email: 'user@example.com',
        avatar_url: generateDefaultAvatar('authenticated_user')
      });
      setMockUsageData();
      setMockAiMetrics();
      setSubscriptionPlan('Pro');

    } catch (err) {
      console.error('Dashboard data load failed:', err);
      setApiError('Unable to load dashboard data');
      setMockAiMetrics();
      setMockUsageData();
    } finally {
      setIsRefreshing(false);
    }
  }, [setMockAiMetrics, setMockUsageData]);

  useEffect(() => {
    setMockAiMetrics();
    setMockUsageData();
    fetchDashboardData();
  }, [fetchDashboardData, setMockAiMetrics, setMockUsageData]);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-[#0D1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
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
      className="max-w-5xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Usage Header */}
      <motion.div className="mb-10" variants={fadeUp}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-[#4B6FED] h-6 w-6" />
              <h2 className="text-2xl font-bold">Usage</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              title="Refresh data"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportUsage('csv')}
              className="border-gray-700 hover:bg-gray-800 text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportUsage('json')}
              className="border-gray-700 hover:bg-gray-800 text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Link href="/pricing">
              <Button
                variant="link"
                className="text-[#4B6FED] hover:text-[#6B8AF8] flex items-center gap-1"
              >
                See updates to pricing structure
                <ChevronRight className="h-4 w-4" />
              </Button>
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
      <motion.div variants={stagger}>
        <motion.div variants={fadeUp}>
          <Card className="mb-6 border-none bg-[#161B22] shadow-lg overflow-hidden">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <RefreshCcw className="h-5 w-5 text-[#4B6FED]" />
                AINative Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!usageData ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Unable to load credit information</p>
                  <Button
                    onClick={handleRefresh}
                    variant="secondary"
                    className="bg-gray-800 hover:bg-gray-700"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
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

                  <div className="mt-8 p-4 bg-[#1C2128] rounded-md border border-gray-800">
                    <p className="text-sm text-gray-300">
                      Once the usage limit is reached, AINative can continue to be used with the Base
                      model. To continue using premium models, purchase add-on prompt credits.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link href="/refills">
                      <Button className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white font-medium">
                        <Settings className="h-4 w-4 mr-2" />
                        Setup automatic refills
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800 text-white"
                      onClick={handlePurchaseCredits}
                    >
                      Purchase credits
                    </Button>
                  </div>

                  <div className="mt-8 flex items-center gap-2 p-3 border border-[#4B6FED]/20 rounded-md bg-[#4B6FED]/5">
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
          <motion.div variants={fadeUp} className="mt-6">
            <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <BarChart2 className="h-5 w-5 text-[#4B6FED]" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <motion.div variants={fadeUp} className="mt-6">
            <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <BarChart2 className="h-5 w-5 text-[#4B6FED]" />
                  AI Development Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Code Generation */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Code Generation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Projects:</span>
                        <span className="text-white">{aiMetrics.codeGeneration.totalProjects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lines Generated:</span>
                        <span className="text-white">{aiMetrics.codeGeneration.linesGenerated.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Components:</span>
                        <span className="text-white">{aiMetrics.codeGeneration.componentsCreated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Model Usage */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Model Usage</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">GPT-4:</span>
                        <span className="text-white">{aiMetrics.modelUsage.gpt4}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Claude:</span>
                        <span className="text-white">{aiMetrics.modelUsage.claude}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Llama:</span>
                        <span className="text-white">{aiMetrics.modelUsage.llama}%</span>
                      </div>
                    </div>
                  </div>

                  {/* API Integrations */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">API Integrations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Providers:</span>
                        <span className="text-white">{aiMetrics.apiIntegrations.activeProviders.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Requests:</span>
                        <span className="text-white">{aiMetrics.apiIntegrations.totalRequests.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Response:</span>
                        <span className="text-white">{aiMetrics.apiIntegrations.avgResponseTime}s</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistance */}
                  <div className="bg-[#1C2128] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">AI Assistance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Code Reviews:</span>
                        <span className="text-white">{aiMetrics.aiAssistance.codeReviews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bugs Fixed:</span>
                        <span className="text-white">{aiMetrics.aiAssistance.bugsFixed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Optimizations:</span>
                        <span className="text-white">{aiMetrics.aiAssistance.optimizations}</span>
                      </div>
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
