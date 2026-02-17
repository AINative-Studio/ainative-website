/**
 * Session & Memory Management Service
 * Handles all session and memory API calls for context management
 */

import apiClient from './api-client';

// ===== Session Types =====
export interface Session {
  id: string;
  title: string;
  description: string;
  meta_data: Record<string, unknown>;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'archived';
  message_count: number;
  context_size: number;
}

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface SessionDetail extends Session {
  messages?: SessionMessage[];
}

export interface SessionsListResponse {
  sessions: Session[];
  total: number;
  skip: number;
  limit: number;
}

export interface SessionListParams {
  user_id?: string;
  status?: 'active' | 'completed' | 'archived';
  skip?: number;
  limit?: number;
}

export interface DeleteSessionResponse {
  message: string;
  session_id: string;
}

// ===== Memory Types =====
export interface MemoryEntry {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  relevance_score?: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryContextResponse {
  context: MemoryEntry[];
  total_tokens: number;
  max_tokens: number;
  session_id: string;
}

export interface MemoryContextParams {
  session_id: string;
  max_tokens?: number;
}

export interface StoreMemoryData {
  session_id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  metadata?: Record<string, unknown>;
}

export interface StoredMemory {
  id: string;
  session_id: string;
  content: string;
  role: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface MemorySearchParams {
  query: string;
  session_id?: string;
  limit: number;
}

export interface MemorySearchResult {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  relevance_score: number;
}

export interface MemorySearchResponse {
  results: MemorySearchResult[];
  total: number;
  query: string;
}

export interface DeleteMemoryResponse {
  message: string;
  memory_id: string;
}

export interface RoleStats {
  count: number;
  tokens: number;
}

export interface MemoryStats {
  session_id: string;
  total_memories: number;
  total_tokens: number;
  by_role: {
    user: RoleStats;
    assistant: RoleStats;
    system: RoleStats;
  };
  context_window_usage: number;
  created_at: string;
  last_updated: string;
}

export interface ClearMemoryResponse {
  message: string;
  session_id: string;
  memories_deleted: number;
}

/**
 * Session & Memory Service class
 */
class SessionService {
  // ===== Session Endpoints =====

  /**
   * List all sessions with optional filters
   */
  async listSessions(params: SessionListParams = {}): Promise<SessionsListResponse> {
    const queryParams = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    );
    const endpoint = queryParams.toString()
      ? `/v1/public/chat/sessions?${queryParams.toString()}`
      : '/v1/public/chat/sessions';
    const response = await apiClient.get<SessionsListResponse>(endpoint);
    return response.data;
  }

  /**
   * Get session details by ID
   */
  async getSession(sessionId: string): Promise<SessionDetail> {
    const response = await apiClient.get<SessionDetail>(`/v1/public/chat/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
    const response = await apiClient.delete<DeleteSessionResponse>(`/v1/public/chat/sessions/${sessionId}`);
    return response.data;
  }

  // ===== Memory Endpoints =====
  // Note: Standalone memory endpoints may not be available on all deployments.
  // These methods return null gracefully when endpoints are unavailable,
  // matching the pattern established in bugs #575-577.

  /**
   * Get memory context for a session
   * Returns null if the endpoint is unavailable
   */
  async getMemoryContext(params: MemoryContextParams): Promise<MemoryContextResponse | null> {
    try {
      const queryParams = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      );
      const endpoint = `/v1/public/memory/context?${queryParams.toString()}`;
      const response = await apiClient.get<MemoryContextResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching memory context:', error);
      return null;
    }
  }

  /**
   * Store new memory entry
   * Returns null if the endpoint is unavailable
   */
  async storeMemory(data: StoreMemoryData): Promise<StoredMemory | null> {
    try {
      const response = await apiClient.post<StoredMemory>('/v1/public/memory/store', data);
      return response.data;
    } catch (error) {
      console.error('Error storing memory:', error);
      return null;
    }
  }

  /**
   * Search memory entries
   * Returns null if the endpoint is unavailable
   */
  async searchMemory(params: MemorySearchParams): Promise<MemorySearchResponse | null> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('query', params.query);
      if (params.session_id) {
        queryParams.set('session_id', params.session_id);
      }
      queryParams.set('limit', String(params.limit));

      const endpoint = `/v1/public/memory/search?${queryParams.toString()}`;
      const response = await apiClient.get<MemorySearchResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error searching memory:', error);
      return null;
    }
  }

  /**
   * Delete a specific memory entry
   * Returns null if the endpoint is unavailable
   */
  async deleteMemory(memoryId: string): Promise<DeleteMemoryResponse | null> {
    try {
      const response = await apiClient.delete<DeleteMemoryResponse>(`/v1/public/memory/${memoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return null;
    }
  }

  /**
   * Get memory statistics for a session
   * Returns null if the endpoint is unavailable
   */
  async getMemoryStats(sessionId: string): Promise<MemoryStats | null> {
    try {
      const response = await apiClient.get<MemoryStats>(
        `/v1/public/memory/stats?session_id=${sessionId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching memory stats:', error);
      return null;
    }
  }

  /**
   * Clear all memory for a session
   * Returns null if the endpoint is unavailable
   */
  async clearSessionMemory(sessionId: string): Promise<ClearMemoryResponse | null> {
    try {
      const response = await apiClient.delete<ClearMemoryResponse>(
        `/v1/public/chat/sessions/${sessionId}/memory`
      );
      return response.data;
    } catch (error) {
      console.error('Error clearing session memory:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();
