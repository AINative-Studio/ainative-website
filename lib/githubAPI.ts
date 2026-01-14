import axios from 'axios';

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  languages_url: string;
  license: {
    name: string;
    spdx_id: string;
  } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  watchers_count: number;
  subscribers_count: number;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
  html_url: string;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface GitHubLanguages {
  [language: string]: number;
}

export interface GitHubStats {
  repo: GitHubRepo;
  commits: GitHubCommit[];
  contributors: GitHubContributor[];
  languages: GitHubLanguages;
}

const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
if (GITHUB_TOKEN) {
  githubClient.defaults.headers.common['Authorization'] = `token ${GITHUB_TOKEN}`;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to parse GitHub URL:', error);
    return null;
  }
}

export async function getGitHubRepo(owner: string, repo: string): Promise<GitHubRepo> {
  try {
    const response = await githubClient.get<GitHubRepo>(`/repos/${owner}/${repo}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch GitHub repo:', error);
    throw error;
  }
}

export async function getGitHubCommits(
  owner: string,
  repo: string,
  limit: number = 5
): Promise<GitHubCommit[]> {
  try {
    const response = await githubClient.get<GitHubCommit[]>(
      `/repos/${owner}/${repo}/commits`,
      {
        params: {
          per_page: limit,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch GitHub commits:', error);
    throw error;
  }
}

export async function getGitHubContributors(
  owner: string,
  repo: string,
  limit: number = 10
): Promise<GitHubContributor[]> {
  try {
    const response = await githubClient.get<GitHubContributor[]>(
      `/repos/${owner}/${repo}/contributors`,
      {
        params: {
          per_page: limit,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch GitHub contributors:', error);
    throw error;
  }
}

export async function getGitHubLanguages(
  owner: string,
  repo: string
): Promise<GitHubLanguages> {
  try {
    const response = await githubClient.get<GitHubLanguages>(
      `/repos/${owner}/${repo}/languages`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch GitHub languages:', error);
    throw error;
  }
}

export async function getGitHubStats(githubUrl: string): Promise<GitHubStats | null> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    return null;
  }

  try {
    const [repo, commits, contributors, languages] = await Promise.all([
      getGitHubRepo(parsed.owner, parsed.repo),
      getGitHubCommits(parsed.owner, parsed.repo, 5),
      getGitHubContributors(parsed.owner, parsed.repo, 10),
      getGitHubLanguages(parsed.owner, parsed.repo),
    ]);

    return {
      repo,
      commits,
      contributors,
      languages,
    };
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    return null;
  }
}

export function calculateLanguagePercentages(
  languages: GitHubLanguages
): { language: string; percentage: number; bytes: number }[] {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

  return Object.entries(languages)
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: (bytes / total) * 100,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

export function formatStarCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  }
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}
