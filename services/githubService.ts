// services/githubService.ts
import apiClient from '@/utils/apiClient';

// Type for Axios-like errors
interface AxiosErrorLike {
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

// GitHub repository interface
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
}

// Define the GitHub API response type
interface GitHubApiResponse {
  login: string;
  id: number;
  name: string | null;
  email: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

// Map the API response to our expected format
interface GitHubUserResponse {
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}


export class GitHubService {
  /**
   * Fetches GitHub user information using user-specific token
   * Updated to use per-user GitHub tokens instead of shared token
   * @returns Promise with GitHub user information
   */
  async getUserInfo(): Promise<GitHubUserResponse> {
    console.log('Fetching GitHub user info using personal token...');
    
    try {
      // Use new per-user GitHub API endpoint
      const response = await apiClient.get<GitHubApiResponse>('/v1/public/github/user');
      const userData = response.data;
      
      console.log('GitHub user data successfully retrieved');
      
      // Map the GitHub API response to our expected format
      return {
        login: userData.login || 'github-user',
        name: userData.name || undefined,
        email: userData.email || undefined,
        avatar_url: userData.avatar_url || this.generateDefaultAvatar(userData.login || 'user'),
        public_repos: userData.public_repos || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
        created_at: userData.created_at || new Date().toISOString()
      };
    } catch (error: unknown) {
      // Enhanced error logging with detailed context
      console.error('Error fetching GitHub user info:', error);

      const axiosError = error as AxiosErrorLike;

      // Provide more specific error information based on error type
      if (axiosError?.message === 'Network Error') {
        console.warn('CORS or network connectivity issue with GitHub API');
      } else if (axiosError?.response?.status === 404) {
        console.warn('GitHub user endpoint not found - check API configuration');
      } else if (axiosError?.response?.status === 401) {
        console.warn('GitHub authentication failed - user needs to add GitHub token');
      }

      // Provide helpful error message for GitHub token configuration
      const errorMessage = axiosError?.response?.status === 404
        ? 'No GitHub token configured. Please add your GitHub personal access token in Settings → GitHub Integration.'
        : 'GitHub API unavailable. Please check your GitHub token in Settings.';

      // Fallback to session user data if GitHub API fails
      try {
        console.log('Falling back to session user data...');
        const sessionResponse = await apiClient.get('/v1/public/auth/me');
        const sessionUser = sessionResponse.data as {
          id: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          created_at: string;
        };

        console.log('Session user data successfully retrieved');

        return {
          login: sessionUser.email?.split('@')[0] || 'user',
          name: sessionUser.name,
          email: sessionUser.email,
          avatar_url: sessionUser.avatar_url || this.generateDefaultAvatar(sessionUser.email?.split('@')[0] || 'user'),
          public_repos: 0,
          followers: 0,
          following: 0,
          created_at: sessionUser.created_at
        };
      } catch (sessionError: unknown) {
        console.error('Error fetching session user data:', sessionError);

        const sessionAxiosError = sessionError as AxiosErrorLike;

        // Provide more specific error information for session errors
        if (sessionAxiosError?.message === 'Network Error') {
          console.warn('CORS or network connectivity issue with auth API');
        } else if (sessionAxiosError?.response?.status === 404) {
          console.warn('Auth endpoint not found - check API configuration');
        }

        // Throw error with helpful message about GitHub token
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * Generates a default avatar URL using a reliable avatar service
   * @param identifier - Username or identifier for consistent avatar generation
   * @returns Generated avatar URL
   */
  private generateDefaultAvatar(identifier: string): string {
    // Use Gravatar's identicon service as a fallback
    // This creates consistent, unique avatars based on the identifier
    const hash = this.simpleHash(identifier);
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`;
  }

  /**
   * Fetches GitHub repositories for the authenticated user using their personal token
   * @param includePrivate - Whether to include private repositories
   * @param limit - Maximum number of repositories to fetch
   * @returns Promise with GitHub repositories
   */
  async getRepositories(includePrivate: boolean = false, limit: number = 50): Promise<GitHubRepository[]> {
    try {
      console.log('Fetching GitHub repositories using personal token...');
      const queryParams = new URLSearchParams({
        include_private: includePrivate.toString(),
        limit: limit.toString()
      });

      const response = await apiClient.get(`/v1/public/github/repositories?${queryParams}`);

      // The new API returns repositories directly, not wrapped in success/data
      return (response.data as GitHubRepository[]) || [];
    } catch (error: unknown) {
      console.error('Error fetching GitHub repositories:', error);

      const axiosError = error as AxiosErrorLike;

      if (axiosError?.response?.status === 401) {
        console.warn('GitHub authentication failed - check token validity');
      } else if (axiosError?.response?.status === 404) {
        console.warn('No GitHub token configured. Please add your token in Settings.');
      }

      return [];
    }
  }

  /**
   * Check GitHub connection status
   * @returns Promise with connection status
   */
  async getConnectionStatus(): Promise<{ connected: boolean; github_username?: string; message?: string }> {
    try {
      const response = await apiClient.get('/v1/public/github/connection-status');
      return response.data as { connected: boolean; github_username?: string; message?: string };
    } catch (error: unknown) {
      console.error('Error checking GitHub connection status:', error);
      return {
        connected: false,
        message: 'Failed to check GitHub connection'
      };
    }
  }

  /**
   * Simple hash function for generating consistent hashes
   * @param str - String to hash
   * @returns Hash string
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}
