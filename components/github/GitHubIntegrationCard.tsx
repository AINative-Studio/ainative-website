'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Github,
  ExternalLink,
  GitBranch,
  GitMerge,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface GitHubIntegrationData {
  repo_url: string;
  repo_name: string;
  issues_created: number;
  issues_closed: number;
  pull_requests_total: number;
  pull_requests_merged: number;
  pull_requests_open: number;
  last_commit_at: string; // ISO timestamp
}

interface GitHubIntegrationCardProps {
  data?: GitHubIntegrationData;
  isLoading?: boolean;
  error?: string;
}

export function GitHubIntegrationCard({
  data,
  isLoading = false,
  error,
}: GitHubIntegrationCardProps) {
  // Calculate percentages for progress bars
  const issuesClosedPercentage = React.useMemo(() => {
    if (!data || data.issues_created === 0) return 0;
    return Math.round((data.issues_closed / data.issues_created) * 100);
  }, [data]);

  const prMergedPercentage = React.useMemo(() => {
    if (!data || data.pull_requests_total === 0) return 0;
    return Math.round((data.pull_requests_merged / data.pull_requests_total) * 100);
  }, [data]);

  // Format relative time
  const lastCommitRelative = React.useMemo(() => {
    if (!data?.last_commit_at) return null;
    try {
      return formatDistanceToNow(new Date(data.last_commit_at), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  }, [data?.last_commit_at]);

  // Handle opening GitHub repository in new tab
  const handleViewOnGitHub = () => {
    if (data?.repo_url) {
      window.open(data.repo_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-gray-800 bg-[#161B22]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-900 bg-[#161B22]">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <CardTitle className="text-lg text-white">
                GitHub Integration Error
              </CardTitle>
              <CardDescription className="text-red-400 mt-1">
                {error}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card className="border-gray-800 bg-[#161B22]">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Github className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <CardTitle className="text-lg text-white">
                GitHub Integration
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                No GitHub data available
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Main content
  return (
    <Card className="border-gray-800 bg-[#161B22] hover:border-gray-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Github className="h-5 w-5 text-white" />
              {data.repo_name}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              <a
                href={data.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                aria-label={`Visit ${data.repo_name} on GitHub`}
              >
                {data.repo_url.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Issues and Pull Requests Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Issues Statistics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Issues
              </p>
              <p className="text-xs text-gray-400">
                {data.issues_closed}/{data.issues_created}
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-white">
                {data.issues_created}
              </p>
              <p className="text-xs text-gray-500">created</p>
            </div>
            <div className="space-y-1">
              <Progress
                value={issuesClosedPercentage}
                className="h-2"
                aria-label={`${issuesClosedPercentage}% of issues closed`}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {data.issues_closed} closed
                </span>
                <span className="text-gray-500">
                  {issuesClosedPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Pull Requests Statistics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <GitMerge className="h-3.5 w-3.5" />
                Pull Requests
              </p>
              <p className="text-xs text-gray-400">
                {data.pull_requests_merged}/{data.pull_requests_total}
              </p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-white">
                {data.pull_requests_total}
              </p>
              <p className="text-xs text-gray-500">total</p>
            </div>
            <div className="space-y-1">
              <Progress
                value={prMergedPercentage}
                className="h-2"
                aria-label={`${prMergedPercentage}% of pull requests merged`}
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {data.pull_requests_merged} merged
                  </span>
                  <span className="text-yellow-400">
                    {data.pull_requests_open} open
                  </span>
                </div>
                <span className="text-gray-500">
                  {prMergedPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Commit Time */}
        {lastCommitRelative && (
          <div className="pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last commit:{' '}
              <span className="text-gray-300">{lastCommitRelative}</span>
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleViewOnGitHub}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
          aria-label={`View ${data.repo_name} on GitHub`}
        >
          <Github className="h-4 w-4 mr-2" />
          View on GitHub
          <ExternalLink className="h-3.5 w-3.5 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
