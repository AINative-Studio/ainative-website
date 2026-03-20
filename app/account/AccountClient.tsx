
'use client';
import React from "react";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  Zap,
  Activity,
  TrendingUp,
  CircleHelp,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { usageService, type UsageMetrics } from '@/services/usageService';
import { creditService, type CreditBalance } from '@/services/creditService';

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

// Agent team members with real names and photos
const agentTeam = [
  {
    name: 'Cody Jackson',
    role: 'Team Leader & CTO',
    photo: '/team/cody-jackson.png',
    specialty: 'Architecture & Code Quality',
    status: 'online' as const,
  },
  {
    name: 'Forrest Kinkade',
    role: 'DevOps & SRE',
    photo: '/team/forrest-kinkade.png',
    specialty: 'Infrastructure & Reliability',
    status: 'online' as const,
  },
  {
    name: 'Peter Roan',
    role: 'Backend Engineer',
    photo: '/team/peter-roan.png',
    specialty: 'APIs & Data Systems',
    status: 'online' as const,
  },
  {
    name: 'Pixel Rose',
    role: 'Design & Frontend',
    photo: '/team/pixel-rose.png',
    specialty: 'UI/UX & Components',
    status: 'online' as const,
  },
  {
    name: 'Sage Ward',
    role: 'Strategy & Research',
    photo: '/team/sage-ward.png',
    specialty: 'Market Analysis & Planning',
    status: 'idle' as const,
  },
  {
    name: 'Keystone Hale',
    role: 'Product Manager',
    photo: '/team/keystone-hale.png',
    specialty: 'Roadmap & Prioritization',
    status: 'idle' as const,
  },
];

// Demo user fallback
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

export default function AccountClient() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [usageData, setUsageData] = useState<UsageMetrics | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [dataErrors, setDataErrors] = useState<string[]>([]);
  const router = useRouter();

  const fetchAccountData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setDataErrors([]);
      const errors: string[] = [];

      // Check for auth token
      const token = typeof window !== 'undefined' ? (
        localStorage.getItem('access_token') ||
        localStorage.getItem('auth_token') ||
        localStorage.getItem('github_token')
      ) : null;

      if (!token) {
        setUser(mockUser);
        setIsDemo(true);
        return;
      }

      // Load user from localStorage
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

      // Fetch real usage metrics from API
      const [usageResult, creditResult] = await Promise.allSettled([
        usageService.getUsageMetrics('30d'),
        creditService.getCreditBalance(),
      ]);

      if (usageResult.status === 'fulfilled' && usageResult.value) {
        setUsageData(usageResult.value);
      } else {
        errors.push('Usage metrics unavailable');
      }

      if (creditResult.status === 'fulfilled' && creditResult.value) {
        setCreditBalance(creditResult.value);
      } else {
        errors.push('Credit balance unavailable');
      }

      if (errors.length > 0) {
        setDataErrors(errors);
      }

    } catch (err) {
      console.error('Account data load failed:', err);
      setUser(mockUser);
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

  const planName = creditBalance?.plan || 'Free';
  const usagePercent = creditBalance
    ? creditService.calculateUsagePercentage(creditBalance)
    : 0;

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

          {isDemo && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <div className="flex items-center gap-2">
                <CircleHelp className="h-5 w-5 text-yellow-500" />
                <p className="text-sm text-yellow-200">Demo mode - sign in to see your real usage data</p>
              </div>
            </div>
          )}

          {dataErrors.length > 0 && !isDemo && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-md">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-400" />
                <p className="text-sm text-orange-200">
                  Some data is loading from API: {dataErrors.join(', ')}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={stagger}>
          {/* Credits & Usage Overview - REAL DATA */}
          <motion.div variants={fadeUp}>
            <Card className="mb-6 border-none bg-[#161B22] shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#4B6FED]" />
                  Credits & Usage
                  {creditBalance && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-2">
                      Live
                    </span>
                  )}
                  {!creditBalance && !isDemo && (
                    <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded ml-2">
                      Loading...
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Credit Balance */}
                  <div className="p-5 bg-[#1C2128] rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-4 w-4 text-[#4B6FED]" />
                      <span className="text-sm font-medium text-gray-300">Credit Balance</span>
                    </div>
                    {creditBalance ? (
                      <>
                        <p className="text-3xl font-bold text-white mb-1">
                          {creditService.formatCreditAmount(creditBalance.remaining_credits)}
                        </p>
                        <p className="text-xs text-gray-400">
                          of {creditService.formatCreditAmount(creditBalance.total_credits)} total
                        </p>
                        <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              usagePercent >= 90 ? 'bg-red-500' :
                              usagePercent >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{usagePercent}% used</p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-gray-500">--</p>
                    )}
                  </div>

                  {/* API Requests */}
                  <div className="p-5 bg-[#1C2128] rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-[#4B6FED]" />
                      <span className="text-sm font-medium text-gray-300">API Requests</span>
                    </div>
                    {usageData ? (
                      <>
                        <p className="text-3xl font-bold text-white mb-1">
                          {usageData.total_requests.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          last 30 days
                        </p>
                        {usageData.usage?.api_credits && (
                          <>
                            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usageData.usage.api_credits.percentage >= 90 ? 'bg-red-500' :
                                  usageData.usage.api_credits.percentage >= 75 ? 'bg-yellow-500' : 'bg-[#4B6FED]'
                                }`}
                                style={{ width: `${Math.min(usageData.usage.api_credits.percentage, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {usageData.usage.api_credits.used.toLocaleString()} / {usageData.usage.api_credits.limit.toLocaleString()} credits
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-gray-500">--</p>
                    )}
                  </div>

                  {/* Token Usage */}
                  <div className="p-5 bg-[#1C2128] rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-[#4B6FED]" />
                      <span className="text-sm font-medium text-gray-300">Tokens Used</span>
                    </div>
                    {usageData ? (
                      <>
                        <p className="text-3xl font-bold text-white mb-1">
                          {usageService.formatCredits(usageData.total_tokens)}
                        </p>
                        <p className="text-xs text-gray-400">
                          last 30 days
                        </p>
                        {usageData.usage?.llm_tokens && (
                          <>
                            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usageData.usage.llm_tokens.percentage >= 90 ? 'bg-red-500' :
                                  usageData.usage.llm_tokens.percentage >= 75 ? 'bg-yellow-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${Math.min(usageData.usage.llm_tokens.percentage, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {usageData.usage.llm_tokens.status}
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-gray-500">--</p>
                    )}
                  </div>
                </div>

                {/* Usage Breakdown */}
                {usageData?.usage && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-[#1C2128] rounded-lg border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">Storage</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">
                          {usageData.usage.storage_gb?.used?.toFixed(2) ?? '0'} GB
                        </span>
                        <span className="text-xs text-gray-500">
                          of {usageData.usage.storage_gb?.limit ?? 0} GB
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#1C2128] rounded-lg border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-gray-300">MCP Server Hours</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-white">
                          {usageData.usage.mcp_hours?.used?.toFixed(1) ?? '0'} hrs
                        </span>
                        <span className="text-xs text-gray-500">
                          of {usageData.usage.mcp_hours?.limit ?? 0} hrs
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan info */}
                {usageData?.plan && (
                  <div className="flex items-center justify-between p-4 bg-[#1C2128] rounded-lg border border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4B6FED]/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-[#4B6FED]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{usageData.plan.name} Plan</p>
                        <p className="text-xs text-gray-400">
                          Status: <span className={usageData.plan.status === 'active' ? 'text-green-400' : 'text-yellow-400'}>{usageData.plan.status}</span>
                        </p>
                      </div>
                    </div>
                    <Link href="/pricing">
                      <Button size="sm" variant="outline" className="border-[#4B6FED] text-[#4B6FED] hover:bg-[#4B6FED]/10">
                        Upgrade
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 text-white flex items-center gap-2"
                    onClick={() => router.push('/dashboard/usage')}
                  >
                    <BarChart2 className="h-4 w-4" />
                    Detailed Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 text-white flex items-center gap-2"
                    onClick={() => router.push('/dashboard/credits')}
                  >
                    <CreditCard className="h-4 w-4" />
                    Credit History
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 text-white flex items-center gap-2"
                    onClick={() => router.push('/dashboard/api-keys')}
                  >
                    <Settings className="h-4 w-4" />
                    API Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Your AI Team */}
          <motion.div variants={fadeUp}>
            <Card className="mb-6 border-none bg-[#161B22] shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#4B6FED]" />
                  Your AI Team
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentTeam.map((agent) => (
                    <div
                      key={agent.name}
                      className="flex items-center gap-4 p-4 bg-[#1C2128] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <Image
                          src={agent.photo}
                          alt={agent.name}
                          width={56}
                          height={56}
                          className="rounded-full object-cover w-14 h-14"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#1C2128] ${
                            agent.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{agent.name}</p>
                        <p className="text-xs text-[#4B6FED] truncate">{agent.role}</p>
                        <p className="text-xs text-gray-500 truncate">{agent.specialty}</p>
                      </div>
                    </div>
                  ))}
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
                    <p className="text-sm text-gray-400 mb-1">Subscription</p>
                    <p className="font-medium">{planName}</p>
                  </div>
                  <div className="p-4 bg-[#1C2128] rounded-md flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Member Since</p>
                      <p className="font-medium">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
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
