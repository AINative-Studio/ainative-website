'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  CheckCircle,
  TestTube,
  Star,
  GitBranch,
  GitMerge,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface CompletionStats {
  total_time_minutes: number;
  agents_deployed: number;
  features_completed: number;
  features_total: number;
  tests_passed: number;
  tests_total: number;
  code_quality_score: number; // 0-100
  github_issues_created: number;
  pull_requests_merged: number;
}

export interface CompletionStatisticsProps {
  stats: CompletionStats;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
  index: number;
}

const StatCard = ({ icon, label, value, description, index }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="bg-gradient-to-br from-green-950/30 to-green-900/10 border-green-800/30 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-green-400">
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-400 mb-1">
                {label}
              </p>
              <p className="text-2xl font-bold text-green-400 mb-1">
                {value}
              </p>
              {description && (
                <p className="text-xs text-gray-500">
                  {description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function CompletionStatistics({ stats }: CompletionStatisticsProps) {
  // Format time display
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Calculate completion percentage
  const featuresPercentage = stats.features_total > 0
    ? Math.round((stats.features_completed / stats.features_total) * 100)
    : 0;

  const testsPercentage = stats.tests_total > 0
    ? Math.round((stats.tests_passed / stats.tests_total) * 100)
    : 0;

  const statisticsData = [
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'Total Time',
      value: formatTime(stats.total_time_minutes),
      description: 'Build duration',
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Agents Deployed',
      value: stats.agents_deployed.toString(),
      description: 'AI agents working',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      label: 'Features',
      value: `${stats.features_completed}/${stats.features_total}`,
      description: `${featuresPercentage}% completed`,
    },
    {
      icon: <TestTube className="w-6 h-6" />,
      label: 'Tests Passed',
      value: `${stats.tests_passed}/${stats.tests_total}`,
      description: `${testsPercentage}% success rate`,
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: 'Code Quality',
      value: `${stats.code_quality_score}/100`,
      description: 'Quality score',
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      label: 'GitHub Issues',
      value: stats.github_issues_created.toString(),
      description: 'Issues created',
    },
    {
      icon: <GitMerge className="w-6 h-6" />,
      label: 'PRs Merged',
      value: stats.pull_requests_merged.toString(),
      description: 'Pull requests merged',
    },
  ];

  return (
    <div className="w-full" role="region" aria-label="Build completion statistics">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center justify-center p-3 bg-green-500/10 rounded-full mb-4 border border-green-500/20">
          <Sparkles className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-3 flex items-center justify-center gap-3">
          <CheckCircle className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
          Build Complete!
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Your application is ready for deployment
        </p>
      </motion.div>

      {/* Statistics Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        role="list"
        aria-label="Build statistics"
      >
        {statisticsData.map((stat, index) => (
          <div key={stat.label} role="listitem">
            <StatCard
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              description={stat.description}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-green-950/30 via-green-900/20 to-green-950/30 border-green-800/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Overall Success</p>
                  <p className="text-lg font-semibold text-green-400">
                    {Math.round((featuresPercentage + testsPercentage + stats.code_quality_score) / 3)}% Complete
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-green-400" />
                  <span>{stats.pull_requests_merged} PRs merged</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-green-400" />
                  <span>Quality score: {stats.code_quality_score}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
