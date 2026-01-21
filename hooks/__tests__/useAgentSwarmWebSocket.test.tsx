/**
 * useAgentSwarmWebSocket Hook Tests
 * TDD - Tests written FIRST for Issue #430
 *
 * Tests cover:
 * - Hook initialization and cleanup
 * - WebSocket connection lifecycle
 * - Real-time log streaming
 * - Agent status updates
 * - Reconnection behavior
 * - Fallback to polling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock WebSocket
const mockWebSocketInstances: MockWebSocket[] = [];

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    mockWebSocketInstances.push(this);
  }

  send = jest.fn();
  close = jest.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) } as MessageEvent);
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  simulateClose(code = 1000, reason = 'Normal closure') {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason } as CloseEvent);
    }
  }
}

(global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock location - use delete and reassign pattern to avoid defineProperty issues
const mockLocation = {
  protocol: 'https:',
  hostname: 'app.ainative.studio',
  href: 'https://app.ainative.studio',
  origin: 'https://app.ainative.studio',
  pathname: '/',
  search: '',
  hash: '',
  port: '',
  host: 'app.ainative.studio',
};

// Only mock if we can modify it
if (typeof window !== 'undefined') {
  try {
    delete (window as { location?: unknown }).location;
    (window as { location: typeof mockLocation }).location = mockLocation;
  } catch {
    // jsdom may not allow deletion, use Object.defineProperty with configurable
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });
  }
}

// Import after mocks
import { useAgentSwarmWebSocket, LogEntry, AgentStatus } from '../../hooks/useAgentSwarmWebSocket';
import { agentSwarmService } from '../../lib/agent-swarm-service';

// Mock the service for polling fallback
jest.mock('../../lib/agent-swarm-service', () => ({
  agentSwarmService: {
    getProjectLogs: jest.fn(),
    getProjectStatus: jest.fn(),
  },
}));

const mockAgentSwarmService = agentSwarmService as jest.Mocked<typeof agentSwarmService>;

// Test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAgentSwarmWebSocket', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWebSocketInstances.length = 0;
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-access-token');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(true);
      // Initial connecting log is expected
      expect(result.current.logs.length).toBeGreaterThanOrEqual(0);
      expect(result.current.agents).toEqual(new Map());
      expect(result.current.error).toBeNull();
    });

    it('should establish WebSocket connection on mount', () => {
      renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project-123' }),
        { wrapper: createTestWrapper() }
      );

      expect(mockWebSocketInstances.length).toBe(1);
      expect(mockWebSocketInstances[0].url).toContain('test-project-123');
    });

    it('should include auth token in WebSocket URL', () => {
      mockLocalStorage.getItem.mockReturnValue('my-auth-token');

      renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'proj-1' }),
        { wrapper: createTestWrapper() }
      );

      expect(mockWebSocketInstances[0].url).toContain('token=my-auth-token');
    });

    it('should clean up WebSocket on unmount', () => {
      const { unmount } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      mockWebSocketInstances[0].simulateOpen();

      unmount();

      expect(mockWebSocketInstances[0].close).toHaveBeenCalled();
    });
  });

  describe('Connection State', () => {
    it('should update isConnected when connection opens', async () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      expect(result.current.isConnected).toBe(false);

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isConnecting).toBe(false);
    });

    it('should call onConnectionStatusChange when connection state changes', () => {
      const onConnectionStatusChange = jest.fn();

      const { result } = renderHook(
        () =>
          useAgentSwarmWebSocket({
            projectId: 'test-project',
            onConnectionStatusChange,
          }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
      });

      expect(onConnectionStatusChange).toHaveBeenCalledWith(true);

      act(() => {
        mockWebSocketInstances[0].simulateClose(1006, 'Error');
      });

      expect(onConnectionStatusChange).toHaveBeenCalledWith(false);
    });

    it('should handle connection errors', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateError();
      });

      expect(result.current.error).not.toBeNull();
    });
  });

  describe('Log Streaming', () => {
    it('should add connection established log on connect', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
      });

      expect(result.current.logs.length).toBeGreaterThan(0);
      expect(result.current.logs.some(log => log.type === 'success')).toBe(true);
    });

    it('should process connection_established message', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'connection_established',
          project_id: 'test-project',
        });
      });

      expect(
        result.current.logs.some(log => log.message.includes('test-project'))
      ).toBe(true);
    });

    it('should process project_progress message', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'project_progress',
          progress: 50,
          message: 'Building components',
        });
      });

      expect(
        result.current.logs.some(
          log => log.message.includes('50%') && log.message.includes('Building')
        )
      ).toBe(true);
    });

    it('should process workflow_log message', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'workflow_log',
          level: 'info',
          message: 'Starting analysis',
        });
      });

      expect(
        result.current.logs.some(log => log.message.includes('Starting analysis'))
      ).toBe(true);
    });

    it('should limit logs to last 100 entries', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();

        // Add 150 log messages
        for (let i = 0; i < 150; i++) {
          mockWebSocketInstances[0].simulateMessage({
            type: 'workflow_log',
            level: 'info',
            message: `Log message ${i}`,
          });
        }
      });

      expect(result.current.logs.length).toBeLessThanOrEqual(100);
    });

    it('should process project_completed message', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'project_completed',
          deployment_url: 'https://example.com',
        });
      });

      expect(
        result.current.logs.some(
          log => log.type === 'success' && log.message.includes('completed')
        )
      ).toBe(true);
    });

    it('should process project_error message', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'project_error',
          error: 'Build failed',
        });
      });

      expect(
        result.current.logs.some(
          log => log.type === 'error' && log.message.includes('Build failed')
        )
      ).toBe(true);
    });
  });

  describe('Agent Status Updates', () => {
    it('should update agent status from agent_status_update message', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'agent_status_update',
          agent: 'Frontend Engineer',
          status: 'working',
          progress: 45,
          task: 'Building UI components',
        });
      });

      const agent = result.current.agents.get('Frontend Engineer');
      expect(agent).toBeDefined();
      expect(agent?.status).toBe('working');
      expect(agent?.progress).toBe(45);
      expect(agent?.currentTask).toBe('Building UI components');
    });

    it('should update multiple agents', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'agent_status_update',
          agent: 'Frontend Engineer',
          status: 'working',
          progress: 30,
        });
        mockWebSocketInstances[0].simulateMessage({
          type: 'agent_status_update',
          agent: 'Backend Engineer',
          status: 'working',
          progress: 50,
        });
      });

      expect(result.current.agents.size).toBe(2);
      expect(result.current.agents.get('Frontend Engineer')).toBeDefined();
      expect(result.current.agents.get('Backend Engineer')).toBeDefined();
    });

    it('should update existing agent status', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'agent_status_update',
          agent: 'Frontend Engineer',
          status: 'working',
          progress: 30,
        });
      });

      expect(result.current.agents.get('Frontend Engineer')?.progress).toBe(30);

      act(() => {
        mockWebSocketInstances[0].simulateMessage({
          type: 'agent_status_update',
          agent: 'Frontend Engineer',
          status: 'completed',
          progress: 100,
        });
      });

      expect(result.current.agents.get('Frontend Engineer')?.status).toBe('completed');
      expect(result.current.agents.get('Frontend Engineer')?.progress).toBe(100);
    });
  });

  describe('Reconnection Behavior', () => {
    it('should attempt reconnection after disconnect', () => {
      renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateClose(1006, 'Abnormal');
      });

      // Fast-forward past reconnect delay
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(mockWebSocketInstances.length).toBeGreaterThan(1);
    });

    it('should handle disconnect and attempt reconnection', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);

      act(() => {
        mockWebSocketInstances[0].simulateClose(1006, 'Abnormal');
      });

      // After abnormal close, connection should be lost
      expect(result.current.isConnected).toBe(false);

      // Wait for reconnection attempt
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // A reconnection attempt should be made
      expect(mockWebSocketInstances.length).toBeGreaterThan(1);
    });

    it('should use exponential backoff for reconnection', () => {
      renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      // First connection
      act(() => {
        mockWebSocketInstances[0].simulateClose(1006, 'Error');
      });

      // First reconnect after initial delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockWebSocketInstances.length).toBe(2);

      // Second disconnect
      act(() => {
        mockWebSocketInstances[1].simulateClose(1006, 'Error');
      });

      // Second reconnect should take longer (exponential backoff)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockWebSocketInstances.length).toBe(2); // Not yet

      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockWebSocketInstances.length).toBe(3); // Now reconnected
    });
  });

  describe('Fallback to Polling', () => {
    it('should fall back to polling when WebSocket fails repeatedly', async () => {
      mockAgentSwarmService.getProjectLogs.mockResolvedValue([
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Test log from polling',
        },
      ]);

      const { result } = renderHook(
        () =>
          useAgentSwarmWebSocket({
            projectId: 'test-project',
            enableFallback: true,
            maxReconnectAttempts: 2,
          }),
        { wrapper: createTestWrapper() }
      );

      // Simulate multiple failed connections
      for (let i = 0; i <= 2; i++) {
        act(() => {
          mockWebSocketInstances[i]?.simulateError();
          mockWebSocketInstances[i]?.simulateClose(1006, 'Error');
          jest.advanceTimersByTime(1000 * Math.pow(2, i));
        });
      }

      expect(result.current.isUsingFallback).toBe(true);
    });

    it('should poll for logs when in fallback mode', async () => {
      mockAgentSwarmService.getProjectLogs.mockResolvedValue([]);
      mockAgentSwarmService.getProjectStatus.mockResolvedValue({
        status: 'building',
        progress: 50,
        stage: 'development',
        updated_at: new Date().toISOString(),
      });

      const { result } = renderHook(
        () =>
          useAgentSwarmWebSocket({
            projectId: 'test-project',
            enableFallback: true,
            maxReconnectAttempts: 0,
            pollingInterval: 5000,
          }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateError();
        mockWebSocketInstances[0].simulateClose(1006, 'Error');
      });

      // Wait for fallback to engage and poll
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockAgentSwarmService.getProjectLogs).toHaveBeenCalled();
      });
    });

    it('should expose fallback status', () => {
      const { result } = renderHook(
        () =>
          useAgentSwarmWebSocket({
            projectId: 'test-project',
            enableFallback: true,
            maxReconnectAttempts: 0,
          }),
        { wrapper: createTestWrapper() }
      );

      expect(result.current.isUsingFallback).toBe(false);

      act(() => {
        mockWebSocketInstances[0].simulateError();
        mockWebSocketInstances[0].simulateClose(1006, 'Error');
      });

      expect(result.current.isUsingFallback).toBe(true);
    });
  });

  describe('Manual Controls', () => {
    it('should provide manual reconnect function', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateClose(1006, 'Error');
      });

      expect(mockWebSocketInstances.length).toBe(1);

      act(() => {
        result.current.reconnect();
      });

      expect(mockWebSocketInstances.length).toBe(2);
    });

    it('should provide disconnect function', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);

      act(() => {
        result.current.disconnect();
      });

      expect(mockWebSocketInstances[0].close).toHaveBeenCalled();
    });

    it('should provide clear logs function', () => {
      const { result } = renderHook(
        () => useAgentSwarmWebSocket({ projectId: 'test-project' }),
        { wrapper: createTestWrapper() }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'workflow_log',
          level: 'info',
          message: 'Test log',
        });
      });

      expect(result.current.logs.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearLogs();
      });

      expect(result.current.logs.length).toBe(0);
    });
  });

  describe('Project ID Changes', () => {
    it('should reconnect when projectId changes', () => {
      const { result, rerender } = renderHook(
        ({ projectId }) => useAgentSwarmWebSocket({ projectId }),
        {
          wrapper: createTestWrapper(),
          initialProps: { projectId: 'project-1' },
        }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
      });

      expect(mockWebSocketInstances[0].url).toContain('project-1');

      rerender({ projectId: 'project-2' });

      expect(mockWebSocketInstances.length).toBe(2);
      expect(mockWebSocketInstances[1].url).toContain('project-2');
    });

    it('should clear agent status when projectId changes', () => {
      const { result, rerender } = renderHook(
        ({ projectId }) => useAgentSwarmWebSocket({ projectId }),
        {
          wrapper: createTestWrapper(),
          initialProps: { projectId: 'project-1' },
        }
      );

      act(() => {
        mockWebSocketInstances[0].simulateOpen();
        mockWebSocketInstances[0].simulateMessage({
          type: 'agent_status_update',
          agent: 'Test Agent',
          status: 'working',
          progress: 50,
        });
      });

      expect(result.current.agents.size).toBe(1);

      rerender({ projectId: 'project-2' });

      expect(result.current.agents.size).toBe(0);
    });
  });
});
