'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, Network, BarChart2, CreditCard, ArrowRight, Zap, Cpu, BookOpen, GitBranch, Lock } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/utils/apiClient';
import { usePageViewTracking } from '@/hooks/useConversionTracking';

const featureCards = [
  {
    title: 'ZeroDB',
    description: 'Zero-knowledge database for secure, encrypted data storage with end-to-end encryption',
    icon: <Database className="h-5 w-5" />,
    color: 'from-blue-500 to-blue-600',
    href: '/dashboard/zerodb'
  },
  {
    title: 'Agent Swarm',
    description: 'Upload a PRD and let autonomous AI agents build your application from start to finish',
    icon: <GitBranch className="h-5 w-5" />,
    color: 'from-orange-500 to-red-600',
    href: '/dashboard/agent-swarm'
  },
  {
    title: 'AI Network',
    description: 'Quantum Neural Network platform for advanced AI model training and optimization',
    icon: <Network className="h-5 w-5" />,
    color: 'from-purple-500 to-purple-600',
    href: '/dashboard/qnn'
  },
  {
    title: 'Analytics',
    description: 'Advanced analytics and insights for your AI models and data',
    icon: <BarChart2 className="h-5 w-5" />,
    color: 'from-emerald-500 to-emerald-600',
    href: '/dashboard/usage'
  },
  {
    title: 'Billing',
    description: 'Manage your subscription, payments, and usage',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'from-amber-500 to-amber-600',
    href: '/billing'
  },
  {
    title: 'Developer Tools',
    description: 'Load testing, API sandbox, and development tools',
    icon: <Cpu className="h-5 w-5" />,
    color: 'from-rose-500 to-rose-600',
    href: '/developer-tools'
  },
  {
    title: 'API Keys',
    description: 'Manage your API access and credentials',
    icon: <Lock className="h-5 w-5" />,
    color: 'from-indigo-500 to-indigo-600',
    href: '/developer-settings'
  },
  {
    title: 'API Documentation',
    description: 'Comprehensive API reference and interactive documentation',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'from-cyan-500 to-cyan-600',
    href: 'https://api.ainative.studio/docs-enhanced#/'
  }
];

interface DashboardStats {
  aiModels: {
    total: number;
    weeklyChange: string;
  };
  databases: {
    total: number;
    weeklyChange: string;
  };
  apiRequests: {
    total: string;
    dailyChange: string;
  };
}

const DashboardLandingClient: React.FC = () => {
  // Conversion tracking
  usePageViewTracking();

  const [stats, setStats] = useState<DashboardStats>({
    aiModels: { total: 0, weeklyChange: '+0 this week' },
    databases: { total: 0, weeklyChange: '+0 this week' },
    apiRequests: { total: '0', dailyChange: '+0 today' }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);

        // Check if user is admin from localStorage
        const userData = localStorage.getItem('user_data');
        const isAdmin = userData ? JSON.parse(userData)?.role === 'ADMIN' : false;

        if (isAdmin) {
          // Admin users can fetch admin dashboard stats
          const response = await apiClient.get<{
            data?: {
              total_models?: number;
              models_weekly_change?: number;
              total_databases?: number;
              databases_weekly_change?: number;
              total_api_requests?: number;
              api_requests_daily_change?: number;
            };
            total_models?: number;
            models_weekly_change?: number;
            total_databases?: number;
            databases_weekly_change?: number;
            total_api_requests?: number;
            api_requests_daily_change?: number;
          }>('/v1/admin/dashboard/stats');
          const data = response.data.data || response.data;

          setStats({
            aiModels: {
              total: data.total_models || 0,
              weeklyChange: `+${data.models_weekly_change || 0} this week`
            },
            databases: {
              total: data.total_databases || 0,
              weeklyChange: `+${data.databases_weekly_change || 0} this week`
            },
            apiRequests: {
              total: data.total_api_requests
                ? (data.total_api_requests > 1000
                    ? `${(data.total_api_requests / 1000).toFixed(1)}K`
                    : data.total_api_requests.toString())
                : '0',
              dailyChange: `+${data.api_requests_daily_change || 0} today`
            }
          });
        } else {
          // Non-admin users: fetch their own stats from public profile endpoint
          try {
            const response = await apiClient.get<{
              data?: {
                completions?: { total?: number; week_7_day?: number };
                total_prompts?: number;
                top_coding_languages?: string[];
                total_sessions?: number;
              };
              completions?: { total?: number; week_7_day?: number };
              total_prompts?: number;
              top_coding_languages?: string[];
              total_sessions?: number;
            }>('/v1/public/profile/stats');
            const data = response.data.data || response.data;

            setStats({
              aiModels: {
                total: data.completions?.total || data.total_prompts || 0,
                weeklyChange: `+${data.completions?.week_7_day || 0} this week`
              },
              databases: {
                total: data.top_coding_languages?.length || 0,
                weeklyChange: 'languages used'
              },
              apiRequests: {
                total: data.total_sessions?.toString() || '0',
                dailyChange: 'total sessions'
              }
            });
          } catch {
            // Keep default values if profile stats fail
          }
        }
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status !== 403) {
          console.error('Failed to fetch dashboard stats:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto px-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Welcome to AINative
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
            Manage your AI services, monitor performance, and access powerful tools in one place
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Zap className="h-4 w-4" />
            <span>AI-Powered Platform</span>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Link href={feature.href} className="block h-full">
                <Card className="h-full bg-card border border-border hover:border-primary/50 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="bg-primary/10 inline-flex p-2.5 rounded-lg mb-4 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all">
                      {React.cloneElement(feature.icon, { className: 'h-5 w-5 text-primary' })}
                    </div>
                    <CardTitle className="text-foreground text-xl font-semibold mb-2 flex items-center">
                      {feature.title}
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-primary" />
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-20 bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your AI Infrastructure at a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-secondary/10 p-6 rounded-xl border border-border">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">AI Models</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {isLoading ? '...' : stats.aiModels.total}
                </div>
                <div className="text-sm text-secondary mt-1">
                  {isLoading ? '...' : stats.aiModels.weeklyChange}
                </div>
              </div>
              <div className="bg-secondary/10 p-6 rounded-xl border border-border">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">Databases</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {isLoading ? '...' : stats.databases.total}
                </div>
                <div className="text-sm text-secondary mt-1">
                  {isLoading ? '...' : stats.databases.weeklyChange}
                </div>
              </div>
              <div className="bg-secondary/10 p-6 rounded-xl border border-border">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <BarChart2 className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">API Requests</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {isLoading ? '...' : stats.apiRequests.total}
                </div>
                <div className="text-sm text-accent mt-1">
                  {isLoading ? '...' : stats.apiRequests.dailyChange}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLandingClient;
