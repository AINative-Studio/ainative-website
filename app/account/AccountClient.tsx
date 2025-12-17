'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronRight,
  BarChart2,
  Settings,
  User,
  RefreshCcw,
  Brain,
  Code2,
  Zap,
  Activity,
  TrendingUp,
  CircleHelp
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

interface DashboardUser {
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at: string;
  id?: string;
  full_name?: string;
  username?: string;
  email_verified?: boolean;
  is_active?: boolean;
}

interface AIMetrics {
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

// Mock data for demo/development
const mockUser: DashboardUser = {
  login: 'demo_user',
  name: 'Demo User',
  email: 'demo@ainative.studio',
  avatar_url: generateDefaultAvatar('demo_user'),
  public_repos: 12,
  created_at: new Date().toISOString(),
  full_name: 'Demo User',
  username: 'demo_user',
  email_verified: true,
  is_active: true
};

const mockAiMetrics: AIMetrics = {
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
};

export default function AccountClient() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [aiMetrics, setAiMetrics] = useState<AIMetrics | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Free');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();

  const fetchAccountData = useCallback(async () => {
    try {
      setIsRefreshing(true);

      // Check for auth token
      const token = typeof window !== 'undefined' ? (
        localStorage.getItem('access_token') ||
        localStorage.getItem('auth_token') ||
        localStorage.getItem('github_token')
      ) : null;

      if (!token) {
        // Use demo data when no auth
        setUser(mockUser);
        setAiMetrics(mockAiMetrics);
        setSubscriptionPlan('Free');
        setIsDemo(true);
        return;
      }

      // Try to fetch real data from API
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser({
            login: userData.login || userData.username || 'user',
            email: userData.email,
            avatar_url: userData.avatar_url || generateDefaultAvatar(userData.login || userData.username || 'user'),
            created_at: userData.created_at || new Date().toISOString(),
            id: userData.id,
            name: userData.name,
            full_name: userData.full_name || userData.name,
            username: userData.username || userData.login,
            email_verified: userData.email_verified,
            is_active: userData.is_active ?? true,
            public_repos: userData.public_repos
          });
        } else {
          setUser(mockUser);
          setIsDemo(true);
        }
      } catch {
        setUser(mockUser);
        setIsDemo(true);
      }

      // Use mock metrics for now (real API integration would go here)
      setAiMetrics(mockAiMetrics);

    } catch (err) {
      console.error('Account data load failed:', err);
      // Fallback to demo data
      setUser(mockUser);
      setAiMetrics(mockAiMetrics);
      setIsDemo(true);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const handleRefresh = () => {
    fetchAccountData();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <motion.div
        className="max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Account Header */}
        <motion.div className="mb-10" variants={fadeUp}>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="text-[#4B6FED] h-6 w-6" />
                <h2 className="text-2xl font-bold">Account</h2>
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
            <Button
              variant="link"
              className="text-[#4B6FED] hover:text-[#6B8AF8] flex items-center gap-1"
              onClick={() => router.push('/dashboard/usage')}
            >
              View usage details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Demo Mode Notification */}
          {isDemo && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <div className="flex items-center gap-2">
                <CircleHelp className="h-5 w-5 text-yellow-500" />
                <p className="text-sm text-yellow-200">Demo mode - showing sample data</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* AI Native Metrics Section */}
        <motion.div variants={stagger}>
          <motion.div variants={fadeUp}>
            <Card className="mb-6 border-none bg-[#161B22] shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#4B6FED]" />
                  AI Native Metrics
                  {isDemo && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                      Sample Data
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!aiMetrics ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">Unable to load AI metrics</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Code Generation Stats */}
                    <div className="p-4 bg-[#1C2128] rounded-md border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Code2 className="h-4 w-4 text-[#4B6FED]" />
                        <span className="text-sm font-medium text-gray-300">Code Generation</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Projects: <span className="text-white font-medium">{aiMetrics.codeGeneration.totalProjects}</span></p>
                        <p className="text-xs text-gray-400">Lines: <span className="text-white font-medium">{aiMetrics.codeGeneration.linesGenerated.toLocaleString()}</span></p>
                        <p className="text-xs text-gray-400">Components: <span className="text-white font-medium">{aiMetrics.codeGeneration.componentsCreated}</span></p>
                      </div>
                    </div>

                    {/* Model Usage */}
                    <div className="p-4 bg-[#1C2128] rounded-md border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-[#4B6FED]" />
                        <span className="text-sm font-medium text-gray-300">Model Usage</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">GPT-4: <span className="text-white font-medium">{aiMetrics.modelUsage.gpt4}%</span></p>
                        <p className="text-xs text-gray-400">Claude: <span className="text-white font-medium">{aiMetrics.modelUsage.claude}%</span></p>
                        <p className="text-xs text-gray-400">Llama: <span className="text-white font-medium">{aiMetrics.modelUsage.llama}%</span></p>
                      </div>
                    </div>

                    {/* API Integrations */}
                    <div className="p-4 bg-[#1C2128] rounded-md border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-[#4B6FED]" />
                        <span className="text-sm font-medium text-gray-300">API Performance</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Total Requests: <span className="text-white font-medium">{aiMetrics.apiIntegrations.totalRequests.toLocaleString()}</span></p>
                        <p className="text-xs text-gray-400">Avg Response: <span className="text-white font-medium">{aiMetrics.apiIntegrations.avgResponseTime}s</span></p>
                        <p className="text-xs text-gray-400">Providers: <span className="text-white font-medium">{aiMetrics.apiIntegrations.activeProviders.length}</span></p>
                      </div>
                    </div>

                    {/* AI Assistance */}
                    <div className="p-4 bg-[#1C2128] rounded-md border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-[#4B6FED]" />
                        <span className="text-sm font-medium text-gray-300">AI Assistance</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Code Reviews: <span className="text-white font-medium">{aiMetrics.aiAssistance.codeReviews}</span></p>
                        <p className="text-xs text-gray-400">Bugs Fixed: <span className="text-white font-medium">{aiMetrics.aiAssistance.bugsFixed}</span></p>
                        <p className="text-xs text-gray-400">Optimizations: <span className="text-white font-medium">{aiMetrics.aiAssistance.optimizations}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 text-white flex items-center gap-2"
                    onClick={() => router.push('/analytics')}
                  >
                    <BarChart2 className="h-4 w-4" />
                    View Detailed Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 text-white flex items-center gap-2"
                    onClick={() => router.push('/dashboard/api-keys')}
                  >
                    <Settings className="h-4 w-4" />
                    Manage API Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Information */}
          <motion.div variants={fadeUp}>
            <Card className="border-none bg-[#161B22] shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-[#4B6FED]" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-[#1C2128] rounded-md">
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="font-medium">{user.email || 'Not provided'}</p>
                    {user.email_verified && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="p-4 bg-[#1C2128] rounded-md">
                    <p className="text-sm text-gray-400 mb-1">Username</p>
                    <p className="font-medium">{user.username || user.login || 'Not set'}</p>
                  </div>
                  <div className="p-4 bg-[#1C2128] rounded-md">
                    <p className="text-sm text-gray-400 mb-1">Full Name</p>
                    <p className="font-medium">{user.full_name || user.name || 'Not provided'}</p>
                  </div>
                  <div className="p-4 bg-[#1C2128] rounded-md">
                    <p className="text-sm text-gray-400 mb-1">Account Status</p>
                    <p className="font-medium flex items-center gap-2">
                      {user.is_active ? (
                        <>
                          <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                          Active
                        </>
                      ) : (
                        <>
                          <span className="inline-block w-2 h-2 rounded-full bg-red-400"></span>
                          Inactive
                        </>
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-[#1C2128] rounded-md">
                    <p className="text-sm text-gray-400 mb-1">GitHub Repos</p>
                    <p className="font-medium">{user.public_repos || 0}</p>
                  </div>
                  <div className="p-4 bg-[#1C2128] rounded-md flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Subscription Plan</p>
                      <p className="font-medium">{subscriptionPlan}</p>
                    </div>
                    <Link href="/pricing">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#4B6FED] text-[#4B6FED] hover:bg-[#4B6FED]/10"
                      >
                        Upgrade
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
