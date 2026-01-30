/**
 * Session & Memory Management Service
 * Handles all session and memory API calls for context management
 *
 * API Endpoints:
 * - Sessions: /v1/public/sessions/ (confirmed working)
 * - Memory: /v1/public/memory/ (TODO: verify backend implementation)
 */

import apiClient from './api-client';

// API base paths
const SESSIONS_BASE = '/v1/public/sessions';
const MEMORY_BASE = '/v1/public/memory';

// ===== Session Types =====
export interface Session {
  id: string;
  agent_id: string;
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
  page: number;
  page_size: number;
}

export interface SessionListParams {
  agent_id?: string;
  status?: 'active' | 'completed' | 'archived';
  page?: number;
  page_size?: number;
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
      ? `${SESSIONS_BASE}?${queryParams.toString()}`
      : SESSIONS_BASE;
    const response = await apiClient.get<SessionsListResponse>(endpoint);
    return response.data;
  }

  /**
   * Get session details by ID
   */
  async getSession(sessionId: string): Promise<SessionDetail> {
    const response = await apiClient.get<SessionDetail>(`${SESSIONS_BASE}/${sessionId}`);
    return response.data;
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
    const response = await apiClient.delete<DeleteSessionResponse>(`${SESSIONS_BASE}/${sessionId}`);
    return response.data;
  }

  // ===== Memory Endpoints =====
  // TODO: Memory endpoints may not be implemented in backend yet.
  // These methods return graceful errors until backend confirms availability.

  /**
   * Get memory context for a session
   * TODO: Verify backend endpoint /v1/public/memory/context exists
   */
  async getMemoryContext(params: MemoryContextParams): Promise<MemoryContextResponse> {
    try {
      const queryParams = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      );
      const endpoint = `${MEMORY_BASE}/context?${queryParams.toString()}`;
      const response = await apiClient.get<MemoryContextResponse>(endpoint);
      return response.data;
    } catch (error) {
      // Return empty context if endpoint not implemented
      console.warn('Memory context endpoint may not be implemented:', error);
      return {
        context: [],
        total_tokens: 0,
        max_tokens: 0,
        session_id: params.session_id,
      };
    }
  }

  /**
   * Store new memory entry
   * TODO: Verify backend endpoint /v1/public/memory/store exists
   */
  async storeMemory(data: StoreMemoryData): Promise<StoredMemory> {
    try {
      const response = await apiClient.post<StoredMemory>(`${MEMORY_BASE}/store`, data);
      return response.data;
    } catch (error) {
      // Return placeholder if endpoint not implemented
      console.warn('Memory store endpoint may not be implemented:', error);
      return {
        id: '',
        session_id: data.session_id,
        content: data.content,
        role: data.role,
        timestamp: new Date().toISOString(),
        metadata: data.metadata,
      };
    }
  }

  /**
   * Search memory entries
   * TODO: Verify backend endpoint /v1/public/memory/search exists
   */
  async searchMemory(params: MemorySearchParams): Promise<MemorySearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('query', params.query);
      if (params.session_id) {
        queryParams.set('session_id', params.session_id);
      }
      queryParams.set('limit', String(params.limit));

      const endpoint = `${MEMORY_BASE}/search?${queryParams.toString()}`;
      const response = await apiClient.get<MemorySearchResponse>(endpoint);
      return response.data;
    } catch (error) {
      // Return empty results if endpoint not implemented
      console.warn('Memory search endpoint may not be implemented:', error);
      return {
        results: [],
        total: 0,
        query: params.query,
      };
    }
  }

  /**
   * Delete a specific memory entry
   * TODO: Verify backend endpoint /v1/public/memory/{memoryId} exists
   */
  async deleteMemory(memoryId: string): Promise<DeleteMemoryResponse> {
    try {
      const response = await apiClient.delete<DeleteMemoryResponse>(`${MEMORY_BASE}/${memoryId}`);
      return response.data;
    } catch (error) {
      // Return placeholder if endpoint not implemented
      console.warn('Memory delete endpoint may not be implemented:', error);
      return {
        message: 'Memory endpoint not implemented',
        memory_id: memoryId,
      };
    }
  }

  /**
   * Get memory statistics for a session
   * TODO: Verify backend endpoint /v1/public/memory/stats exists
   */
  async getMemoryStats(sessionId: string): Promise<MemoryStats> {
    try {
      const response = await apiClient.get<MemoryStats>(
        `${MEMORY_BASE}/stats?session_id=${sessionId}`
      );
      return response.data;
    } catch (error) {
      // Return empty stats if endpoint not implemented
      console.warn('Memory stats endpoint may not be implemented:', error);
      return {
        session_id: sessionId,
        total_memories: 0,
        total_tokens: 0,
        by_role: {
          user: { count: 0, tokens: 0 },
          assistant: { count: 0, tokens: 0 },
          system: { count: 0, tokens: 0 },
        },
        context_window_usage: 0,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      };
    }
  }

  /**
   * Clear all memory for a session
   * TODO: Verify backend endpoint /v1/public/sessions/{sessionId}/memory exists
   */
  async clearSessionMemory(sessionId: string): Promise<ClearMemoryResponse> {
    try {
      const response = await apiClient.delete<ClearMemoryResponse>(
        `${SESSIONS_BASE}/${sessionId}/memory`
      );
      return response.data;
    } catch (error) {
      // Return placeholder if endpoint not implemented
      console.warn('Clear session memory endpoint may not be implemented:', error);
      return {
        message: 'Memory endpoint not implemented',
        session_id: sessionId,
        memories_deleted: 0,
      };
    }
  }
}

// Export singleton instance
export const sessionService = new SessionService();
