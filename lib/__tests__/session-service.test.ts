import apiClient from '../api-client';
import { sessionService } from '../session-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('SessionService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== Session Endpoints =====
  describe('listSessions', () => {
    it('fetches all sessions with default parameters', async () => {
      const mockSessions = {
        sessions: [
          {
            id: 'session-1',
            title: 'React Hooks Discussion',
            description: 'A session about React hooks',
            meta_data: {},
            user_id: 'user-1',
            created_at: '2025-12-21T10:00:00Z',
            updated_at: '2025-12-21T11:00:00Z',
            status: 'active',
            message_count: 15,
            context_size: 8000,
          },
          {
            id: 'session-2',
            title: 'Deployment Strategy',
            description: '',
            meta_data: {},
            user_id: 'user-1',
            created_at: '2025-12-20T10:00:00Z',
            updated_at: '2025-12-20T12:00:00Z',
            status: 'completed',
            message_count: 25,
            context_size: 12000,
          },
        ],
        total: 2,
        skip: 0,
        limit: 20,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSessions,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.listSessions();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/chat/sessions');
      expect(result).toEqual(mockSessions);
    });

    it('fetches sessions with filters', async () => {
      const params = {
        user_id: 'user-1',
        status: 'active' as const,
        skip: 10,
        limit: 10,
      };

      const mockSessions = {
        sessions: [
          {
            id: 'session-3',
            title: 'API Design',
            description: '',
            meta_data: {},
            user_id: 'user-1',
            created_at: '2025-12-19T10:00:00Z',
            updated_at: '2025-12-19T11:00:00Z',
            status: 'active',
            message_count: 10,
            context_size: 5000,
          },
        ],
        total: 11,
        skip: 10,
        limit: 10,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSessions,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.listSessions(params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/chat/sessions?user_id=user-1&status=active&skip=10&limit=10'
      );
      expect(result).toEqual(mockSessions);
    });

    it('handles errors when listing sessions', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(sessionService.listSessions()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getSession', () => {
    it('fetches session by id', async () => {
      const sessionId = 'session-1';
      const mockSession = {
        id: sessionId,
        title: 'React Hooks Discussion',
        description: 'A session about React hooks',
        meta_data: {},
        user_id: 'user-1',
        created_at: '2025-12-21T10:00:00Z',
        updated_at: '2025-12-21T11:00:00Z',
        status: 'active',
        message_count: 15,
        context_size: 8000,
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello, how are you?',
            timestamp: '2025-12-21T10:00:00Z',
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'I am doing well, thank you!',
            timestamp: '2025-12-21T10:00:05Z',
          },
        ],
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockSession,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.getSession(sessionId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/public/chat/sessions/${sessionId}`);
      expect(result).toEqual(mockSession);
    });

    it('handles errors when fetching session', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Session not found'));

      await expect(sessionService.getSession('invalid-id')).rejects.toThrow('Session not found');
    });
  });

  describe('deleteSession', () => {
    it('deletes session by id', async () => {
      const sessionId = 'session-1';
      const mockResponse = {
        message: 'Session deleted successfully',
        session_id: sessionId,
      };

      mockApiClient.delete.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.deleteSession(sessionId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/public/chat/sessions/${sessionId}`);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when deleting session', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Session not found'));

      await expect(sessionService.deleteSession('invalid-id')).rejects.toThrow('Session not found');
    });
  });

  // ===== Memory Endpoints (graceful null returns) =====
  describe('getMemoryContext', () => {
    it('fetches memory context with default parameters', async () => {
      const mockContext = {
        context: [
          {
            id: 'mem-1',
            content: 'Previous conversation about React hooks',
            role: 'assistant',
            timestamp: '2025-12-21T09:00:00Z',
            relevance_score: 0.95,
          },
          {
            id: 'mem-2',
            content: 'User asked about useState',
            role: 'user',
            timestamp: '2025-12-21T09:00:05Z',
            relevance_score: 0.92,
          },
        ],
        total_tokens: 1500,
        max_tokens: 8000,
        session_id: 'session-1',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockContext,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.getMemoryContext({ session_id: 'session-1' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/memory/context?session_id=session-1');
      expect(result).toEqual(mockContext);
    });

    it('fetches memory context with max_tokens limit', async () => {
      const params = {
        session_id: 'session-1',
        max_tokens: 4000,
      };

      const mockContext = {
        context: [
          {
            id: 'mem-1',
            content: 'Relevant context snippet',
            role: 'assistant',
            timestamp: '2025-12-21T09:00:00Z',
            relevance_score: 0.98,
          },
        ],
        total_tokens: 500,
        max_tokens: 4000,
        session_id: 'session-1',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockContext,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.getMemoryContext(params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/memory/context?session_id=session-1&max_tokens=4000'
      );
      expect(result).toEqual(mockContext);
    });

    it('returns null gracefully when endpoint is unavailable', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not Found'));

      const result = await sessionService.getMemoryContext({ session_id: 'invalid' });
      expect(result).toBeNull();
    });
  });

  describe('storeMemory', () => {
    it('stores new memory successfully', async () => {
      const memoryData = {
        session_id: 'session-1',
        content: 'Important context to remember',
        role: 'system' as const,
        metadata: {
          source: 'user-preference',
          priority: 'high',
        },
      };

      const mockResponse = {
        id: 'mem-new-1',
        session_id: 'session-1',
        content: 'Important context to remember',
        role: 'system',
        timestamp: '2025-12-21T12:00:00Z',
        metadata: {
          source: 'user-preference',
          priority: 'high',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await sessionService.storeMemory(memoryData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/memory/store', memoryData);
      expect(result).toEqual(mockResponse);
    });

    it('stores memory without optional metadata', async () => {
      const memoryData = {
        session_id: 'session-1',
        content: 'Simple memory entry',
        role: 'user' as const,
      };

      const mockResponse = {
        id: 'mem-new-2',
        session_id: 'session-1',
        content: 'Simple memory entry',
        role: 'user',
        timestamp: '2025-12-21T12:05:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await sessionService.storeMemory(memoryData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/memory/store', memoryData);
      expect(result).toEqual(mockResponse);
    });

    it('returns null gracefully when endpoint is unavailable', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Memory storage failed'));

      const result = await sessionService.storeMemory({
        session_id: 'session-1',
        content: 'test',
        role: 'user',
      });
      expect(result).toBeNull();
    });
  });

  describe('searchMemory', () => {
    it('searches memory with query', async () => {
      const searchParams = {
        query: 'React hooks useState',
        session_id: 'session-1',
        limit: 10,
      };

      const mockResults = {
        results: [
          {
            id: 'mem-1',
            content: 'Discussion about React hooks including useState and useEffect',
            role: 'assistant',
            timestamp: '2025-12-21T09:00:00Z',
            relevance_score: 0.95,
          },
          {
            id: 'mem-2',
            content: 'User asked about useState best practices',
            role: 'user',
            timestamp: '2025-12-21T09:05:00Z',
            relevance_score: 0.88,
          },
        ],
        total: 2,
        query: 'React hooks useState',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockResults,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.searchMemory(searchParams);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/memory/search?query=React+hooks+useState&session_id=session-1&limit=10'
      );
      expect(result).toEqual(mockResults);
    });

    it('searches memory across all sessions', async () => {
      const searchParams = {
        query: 'deployment strategies',
        limit: 5,
      };

      const mockResults = {
        results: [
          {
            id: 'mem-10',
            content: 'Blue-green deployment is a release strategy',
            role: 'assistant',
            timestamp: '2025-12-20T14:00:00Z',
            relevance_score: 0.92,
          },
        ],
        total: 1,
        query: 'deployment strategies',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockResults,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.searchMemory(searchParams);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/v1/public/memory/search?query=deployment+strategies&limit=5'
      );
      expect(result).toEqual(mockResults);
    });

    it('returns null gracefully when endpoint is unavailable', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Search failed'));

      const result = await sessionService.searchMemory({ query: 'test', limit: 10 });
      expect(result).toBeNull();
    });
  });

  describe('deleteMemory', () => {
    it('deletes memory by id', async () => {
      const memoryId = 'mem-1';
      const mockResponse = {
        message: 'Memory deleted successfully',
        memory_id: memoryId,
      };

      mockApiClient.delete.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.deleteMemory(memoryId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/public/memory/${memoryId}`);
      expect(result).toEqual(mockResponse);
    });

    it('returns null gracefully when endpoint is unavailable', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Memory not found'));

      const result = await sessionService.deleteMemory('invalid-id');
      expect(result).toBeNull();
    });
  });

  // ===== Memory Statistics =====
  describe('getMemoryStats', () => {
    it('fetches memory statistics for a session', async () => {
      const mockStats = {
        session_id: 'session-1',
        total_memories: 150,
        total_tokens: 25000,
        by_role: {
          user: { count: 50, tokens: 8000 },
          assistant: { count: 80, tokens: 15000 },
          system: { count: 20, tokens: 2000 },
        },
        context_window_usage: 0.31,
        created_at: '2025-12-21T10:00:00Z',
        last_updated: '2025-12-21T12:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockStats,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.getMemoryStats('session-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/memory/stats?session_id=session-1');
      expect(result).toEqual(mockStats);
    });

    it('returns null gracefully when endpoint is unavailable', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Session not found'));

      const result = await sessionService.getMemoryStats('invalid-id');
      expect(result).toBeNull();
    });
  });

  // ===== Bulk Operations =====
  describe('clearSessionMemory', () => {
    it('clears all memory for a session', async () => {
      const sessionId = 'session-1';
      const mockResponse = {
        message: 'Session memory cleared successfully',
        session_id: sessionId,
        memories_deleted: 150,
      };

      mockApiClient.delete.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await sessionService.clearSessionMemory(sessionId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/public/chat/sessions/${sessionId}/memory`);
      expect(result).toEqual(mockResponse);
    });

    it('returns null gracefully when endpoint is unavailable', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Session not found'));

      const result = await sessionService.clearSessionMemory('invalid-id');
      expect(result).toBeNull();
    });
  });
});
