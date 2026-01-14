'use client';

import { CheckCircle, ExternalLink, GitBranch, Shield, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GitHubRepoStatusProps {
  repoUrl?: string;
  status?: 'creating' | 'created' | 'failed';
}

export function GitHubRepoStatus({ repoUrl, status = 'creating' }: GitHubRepoStatusProps) {
  // Extract repository name from URL for display
  const getRepoName = (url?: string) => {
    if (!url) return 'Repository';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'Repository';
    } catch {
      return 'Repository';
    }
  };

  const repoName = getRepoName(repoUrl);

  // Render creating state
  if (status === 'creating') {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-300">Creating repository...</p>
          <p className="text-xs text-gray-400 mt-0.5">Setting up your GitHub repository</p>
        </div>
      </div>
    );
  }

  // Render failed state
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-300">Repository creation failed</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Failed to create repository. Retrying automatically...
          </p>
        </div>
      </div>
    );
  }

  // Render created state
  return (
    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-3">
      {/* Success Header */}
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-300">Repository created successfully</p>
          <p className="text-xs text-gray-400 mt-0.5">Your GitHub repository is ready</p>
        </div>
      </div>

      {/* Repository URL */}
      {repoUrl && (
        <div className="pl-8">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300',
              'hover:underline transition-colors break-all'
            )}
          >
            <span className="font-mono">{repoName}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      )}

      {/* Repository Metadata Icons */}
      <div className="pl-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
          <span>Initial commit</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <GitBranch className="w-3.5 h-3.5 text-blue-400" />
          <span>Main branch</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>Protection enabled</span>
        </div>
      </div>

      {/* View on GitHub Button */}
      {repoUrl && (
        <div className="pl-8 pt-1">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 text-xs border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50"
          >
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
