/**
 * Test fixtures for Git repository data
 */

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: Date;
}

export interface GitRepository {
  id: string;
  name: string;
  url: string;
  stars: number;
  language: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
}

export const createGitCommit = (overrides?: Partial<GitCommit>): GitCommit => ({
  sha: 'abc123',
  message: 'feat: add new feature',
  author: 'John Doe',
  date: new Date('2025-01-01T12:00:00Z'),
  ...overrides,
});

export const createGitRepository = (overrides?: Partial<GitRepository>): GitRepository => ({
  id: 'repo-1',
  name: 'ainative-platform',
  url: 'https://github.com/ainative/platform',
  stars: 1234,
  language: 'TypeScript',
  ...overrides,
});

export const createPullRequest = (overrides?: Partial<PullRequest>): PullRequest => ({
  id: 'pr-1',
  number: 123,
  title: 'Add authentication',
  state: 'open',
  author: 'jane-doe',
  ...overrides,
});

export const gitCommits = [
  createGitCommit({ sha: 'commit-1', message: 'feat: add auth' }),
  createGitCommit({ sha: 'commit-2', message: 'fix: bug fix' }),
];

export const gitRepositories = [
  createGitRepository({ id: 'repo-1', name: 'platform' }),
  createGitRepository({ id: 'repo-2', name: 'docs', language: 'Markdown' }),
];

export const pullRequests = [
  createPullRequest({ id: 'pr-1', state: 'open' }),
  createPullRequest({ id: 'pr-2', state: 'merged', number: 124 }),
];

export const pullRequestsByState = {
  open: pullRequests.filter(pr => pr.state === 'open'),
  merged: pullRequests.filter(pr => pr.state === 'merged'),
  closed: pullRequests.filter(pr => pr.state === 'closed'),
};
