'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Star,
  GitFork,
  AlertCircle,
  GitCommit,
  Users,
  ExternalLink,
  Clock,
  Code2,
  Shield,
  Download,
} from 'lucide-react';
import {
  getGitHubStats,
  calculateLanguagePercentages,
  formatStarCount,
  formatRelativeTime,
  GitHubStats as GitHubStatsType,
} from '@/lib/githubAPI';
import { cn } from '@/lib/utils';

interface GitHubStatsProps {
  githubUrl: string;
  className?: string;
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

export function GitHubStats({ githubUrl, className }: GitHubStatsProps) {
  const [stats, setStats] = useState<GitHubStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGitHubStats(githubUrl);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch GitHub stats:', err);
        setError('Failed to load GitHub stats');
      } finally {
        setLoading(false);
      }
    };

    if (githubUrl) {
      fetchStats();
    }
  }, [githubUrl]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={cn('border-destructive/50', className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Unable to load GitHub stats</p>
              <p className="text-sm text-muted-foreground">
                {error || 'Repository data unavailable'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { repo, commits, contributors, languages } = stats;
  const languageData = calculateLanguagePercentages(languages);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Repository Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-1">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  {repo.name}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardTitle>
              {repo.description && (
                <p className="text-sm text-muted-foreground">{repo.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-2xl font-bold">
                        {formatStarCount(repo.stargazers_count)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Stars</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {repo.stargazers_count.toLocaleString()} stars
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <GitFork className="h-4 w-4 text-blue-500" />
                      <span className="text-2xl font-bold">
                        {formatStarCount(repo.forks_count)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Forks</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {repo.forks_count.toLocaleString()} forks
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-2xl font-bold">
                        {repo.open_issues_count}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Issues</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {repo.open_issues_count} open issues
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* License */}
          {repo.license && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <Badge variant="outline">
                {repo.license.name}
              </Badge>
            </div>
          )}

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {repo.topics.slice(0, 5).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {repo.topics.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{repo.topics.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* Clone Button */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full"
          >
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Clone Repository
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Language Breakdown */}
      {languageData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Language Bar */}
            <div className="h-2 rounded-full overflow-hidden flex">
              {languageData.map((lang, index) => (
                <TooltipProvider key={lang.language}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'h-full transition-all hover:opacity-80 cursor-pointer',
                          getLanguageColor(lang.language)
                        )}
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {lang.language}: {lang.percentage.toFixed(1)}%
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>

            {/* Language List */}
            <div className="space-y-2">
              {languageData.slice(0, 5).map((lang) => (
                <div key={lang.language} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn('w-3 h-3 rounded-full', getLanguageColor(lang.language))}
                    />
                    <span>{lang.language}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {lang.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Commits */}
      {commits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Recent Commits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {commits.slice(0, 5).map((commit) => (
              <div key={commit.sha}>
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-accent p-2 rounded-md -mx-2 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {commit.author && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={commit.author.avatar_url} />
                        <AvatarFallback>
                          {commit.commit.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {commit.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{commit.commit.author.name}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(commit.commit.author.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
                <Separator className="mt-3" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contributors */}
      {contributors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {contributors.slice(0, 10).map((contributor) => (
                <TooltipProvider key={contributor.login}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={contributor.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contributor.avatar_url} />
                          <AvatarFallback>
                            {contributor.login.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate w-full text-center">
                          {contributor.login}
                        </span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-medium">{contributor.login}</p>
                        <p className="text-xs text-muted-foreground">
                          {contributor.contributions} contributions
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Language color mapping
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: 'bg-yellow-400',
    TypeScript: 'bg-blue-500',
    Python: 'bg-blue-600',
    Java: 'bg-red-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-orange-500',
    'C++': 'bg-pink-500',
    C: 'bg-gray-600',
    Ruby: 'bg-red-600',
    PHP: 'bg-purple-500',
    Swift: 'bg-orange-600',
    Kotlin: 'bg-purple-600',
    Shell: 'bg-green-600',
    HTML: 'bg-orange-400',
    CSS: 'bg-blue-400',
    Vue: 'bg-green-500',
    Dart: 'bg-cyan-600',
  };

  return colors[language] || 'bg-gray-400';
}
