/**
 * useAgentSwarmWebSocket Hook Tests
 * Following TDD methodology - Tests written FIRST
 * Refs #430
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgentSwarmWebSocket } from '../useAgentSwarmWebSocket';
import { WebSocketClient } from '@/lib/websocket-client';

// Mock WebSocketClient
jest.mock('@/lib/websocket-client');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useAgentSwarmWebSocket', () => {
  let mockWebSocketClient: {
    connect: jest.Mock;
    close: jest.Mock;
    send: jest.Mock;
    isConnected: jest.Mock;
    getState: jest.Mock;
    getReconnectAttempts: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockWebSocketClient = {
      connect: jest.fn(),
      close: jest.fn(),
      send: jest.fn(),
      isConnected: jest.fn().mockReturnValue(false),
      getState: jest.fn().mockReturnValue(3), // CLOSED
      getReconnectAttempts: jest.fn().mockReturnValue(0),
    };

    (WebSocketClient as jest.Mock).mockImplementation((config) => {
      // Store the callbacks for later use
      setTimeout(() => {
        if (config.onOpen) {
          mockWebSocketClient.isConnected.mockReturnValue(true);
        }
      }, 0);
      return mockWebSocketClient;
    });

    localStorageMock.getItem.mockReturnValue('test-token');
  });

  describe('Hook Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      expect(result.current.logs).toEqual([]);
      expect(result.current.agents).toEqual(new Map());
      expect(result.current.connected).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.reconnectAttempts).toBe(0);
    });

    it('should connect to WebSocket on mount when enabled', () => {
      renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
          enabled: true,
        })
      );

      expect(WebSocketClient).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('test-project'),
          reconnect: true,
        })
      );
      expect(mockWebSocketClient.connect).toHaveBeenCalled();
    });

    it('should not connect when disabled', () => {
      renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
          enabled: false,
        })
      );

      expect(WebSocketClient).not.toHaveBeenCalled();
      expect(mockWebSocketClient.connect).not.toHaveBeenCalled();
    });

    it('should include auth token in WebSocket URL', () => {
      localStorageMock.getItem.mockReturnValue('my-auth-token');

      renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      expect(WebSocketClient).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('token=my-auth-token'),
        })
      );
    });
  });

  describe('Message Handling', () => {
    it('should handle connection_established message', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'connection_established',
          project_id: 'test-project',
        });
      });

      await waitFor(() => {
        expect(result.current.logs.length).toBeGreaterThan(0);
        expect(result.current.logs.some((log) => log.type === 'success')).toBe(true);
      });
    });

    it('should handle project_started message', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'project_started',
        });
      });

      await waitFor(() => {
        expect(result.current.logs.some((log) => log.message.includes('started'))).toBe(true);
      });
    });

    it('should handle project_progress message', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'project_progress',
          progress: 50,
          message: 'Building components',
        });
      });

      await waitFor(() => {
        expect(result.current.logs.some((log) => log.message.includes('50%'))).toBe(true);
      });
    });

    it('should handle agent_status_update message and update agent state', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'agent_status_update',
          agent: 'frontend-agent',
          status: 'working',
          progress: 75,
          task: 'Building UI components',
        });
      });

      await waitFor(() => {
        const agent = result.current.agents.get('frontend-agent');
        expect(agent).toBeDefined();
        expect(agent?.name).toBe('frontend-agent');
        expect(agent?.status).toBe('working');
        expect(agent?.progress).toBe(75);
        expect(agent?.currentTask).toBe('Building UI components');
      });
    });

    it('should handle workflow_stage_update message', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'workflow_stage_update',
          stage: 'Testing',
          message: 'Running integration tests',
        });
      });

      await waitFor(() => {
        expect(result.current.logs.some((log) => log.message.includes('Testing'))).toBe(true);
      });
    });

    it('should handle workflow_log message', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'workflow_log',
          level: 'info',
          message: 'Processing request',
          emoji: '⚙️',
        });
      });

      await waitFor(() => {
        expect(result.current.logs.some((log) => log.message.includes('Processing request'))).toBe(
          true
        );
      });
    });

    it('should handle project_completed message', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'project_completed',
          deployment_url: 'https://app.example.com',
        });
      });

      await waitFor(() => {
        expect(
          result.current.logs.some((log) => log.message.includes('completed successfully'))
        ).toBe(true);
      });
    });

    it('should handle project_error message', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'project_error',
          error: 'Build failed',
        });
      });

      await waitFor(() => {
        expect(result.current.logs.some((log) => log.type === 'error')).toBe(true);
      });
    });

    it('should handle unknown message types gracefully', async () => {
      let capturedConfig: any;
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'unknown_type',
          data: 'some data',
        });
      });

      expect(consoleLog).toHaveBeenCalledWith('Unknown WebSocket message type:', 'unknown_type');
      consoleLog.mockRestore();
    });
  });

  describe('Connection Callbacks', () => {
    it('should call onConnectionChange when connection opens', async () => {
      let capturedConfig: any;
      const onConnectionChange = jest.fn();

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
          onConnectionChange,
        })
      );

      await act(async () => {
        capturedConfig.onOpen();
      });

      await waitFor(() => {
        expect(result.current.connected).toBe(true);
        expect(onConnectionChange).toHaveBeenCalledWith(true);
      });
    });

    it('should call onConnectionChange when connection closes', async () => {
      let capturedConfig: any;
      const onConnectionChange = jest.fn();

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
          onConnectionChange,
        })
      );

      await act(async () => {
        capturedConfig.onClose();
      });

      await waitFor(() => {
        expect(result.current.connected).toBe(false);
        expect(onConnectionChange).toHaveBeenCalledWith(false);
      });
    });

    it('should call onError when connection error occurs', async () => {
      let capturedConfig: any;
      const onError = jest.fn();

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
          onError,
        })
      );

      await act(async () => {
        capturedConfig.onError(new Event('error'));
      });

      await waitFor(() => {
        expect(result.current.error).toBe('WebSocket connection error');
        expect(onError).toHaveBeenCalledWith('WebSocket connection error');
      });
    });

    it('should update reconnect attempts on reconnection', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onReconnect(3);
      });

      await waitFor(() => {
        expect(result.current.reconnectAttempts).toBe(3);
      });
    });
  });

  describe('Log Management', () => {
    it('should limit logs to last 100 entries', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      // Add 150 logs
      await act(async () => {
        for (let i = 0; i < 150; i++) {
          capturedConfig.onMessage({
            type: 'workflow_log',
            level: 'info',
            message: `Log entry ${i}`,
          });
        }
      });

      await waitFor(() => {
        expect(result.current.logs.length).toBeLessThanOrEqual(100);
      });
    });

    it('should clear logs when clearLogs is called', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'workflow_log',
          level: 'info',
          message: 'Test log',
        });
      });

      await waitFor(() => {
        expect(result.current.logs.length).toBeGreaterThan(0);
      });

      act(() => {
        result.current.clearLogs();
      });

      expect(result.current.logs.length).toBe(0);
    });

    it('should assign unique IDs to log entries', async () => {
      let capturedConfig: any;

      (WebSocketClient as jest.Mock).mockImplementation((config) => {
        capturedConfig = config;
        return mockWebSocketClient;
      });

      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      await act(async () => {
        capturedConfig.onMessage({
          type: 'workflow_log',
          level: 'info',
          message: 'Log 1',
        });
        capturedConfig.onMessage({
          type: 'workflow_log',
          level: 'info',
          message: 'Log 2',
        });
      });

      await waitFor(() => {
        expect(result.current.logs.length).toBe(2);
        expect(result.current.logs[0].id).not.toBe(result.current.logs[1].id);
      });
    });
  });

  describe('Cleanup', () => {
    it('should disconnect WebSocket on unmount', () => {
      const { unmount } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      unmount();

      expect(mockWebSocketClient.close).toHaveBeenCalled();
    });

    it('should disconnect when calling disconnect method', () => {
      const { result } = renderHook(() =>
        useAgentSwarmWebSocket({
          projectId: 'test-project',
        })
      );

      act(() => {
        result.current.disconnect();
      });

      expect(mockWebSocketClient.close).toHaveBeenCalled();
    });
  });

  describe('Project ID Changes', () => {
    it('should reconnect when projectId changes', () => {
      const { rerender } = renderHook(
        ({ projectId }) => useAgentSwarmWebSocket({ projectId }),
        {
          initialProps: { projectId: 'project-1' },
        }
      );

      expect(WebSocketClient).toHaveBeenCalledTimes(1);
      expect(WebSocketClient).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('project-1'),
        })
      );

      rerender({ projectId: 'project-2' });

      expect(mockWebSocketClient.close).toHaveBeenCalled();
      expect(WebSocketClient).toHaveBeenCalledTimes(2);
      expect(WebSocketClient).toHaveBeenLastCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('project-2'),
        })
      );
    });
  });
});
