/**
 * WebSocket Client Utility Tests
 * TDD - Tests written FIRST for Issue #430
 *
 * Tests cover:
 * - Connection establishment
 * - Automatic reconnection with exponential backoff
 * - Message handling
 * - Graceful fallback to polling
 * - Connection state management
 */

// Mock WebSocket before imports
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
    if (this.onclose) {
      this.onclose({ code: 1000, reason: 'Normal closure' } as CloseEvent);
    }
  });

  // Test helpers
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

  simulateError(error?: Error) {
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

// Set up global WebSocket mock
(global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket;

// Import after mock setup
import {
  WebSocketClient,
  WebSocketClientConfig,
  WebSocketState,
  createWebSocketClient,
} from '../websocket-client';

describe('WebSocketClient', () => {
  let client: WebSocketClient;

  beforeEach(() => {
    jest.useFakeTimers();
    mockWebSocketInstances.length = 0;
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (client) {
      client.disconnect();
    }
    jest.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should establish a WebSocket connection', () => {
      const config: WebSocketClientConfig = {
        url: 'wss://example.com/ws',
      };

      client = createWebSocketClient(config);
      client.connect();

      expect(mockWebSocketInstances.length).toBe(1);
      expect(mockWebSocketInstances[0].url).toBe('wss://example.com/ws');
    });

    it('should report CONNECTING state initially', () => {
      client = createWebSocketClient({ url: 'wss://example.com/ws' });

      expect(client.getState()).toBe(WebSocketState.DISCONNECTED);

      client.connect();

      expect(client.getState()).toBe(WebSocketState.CONNECTING);
    });

    it('should report CONNECTED state after successful connection', () => {
      const onConnect = jest.fn();
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        onConnect,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();

      expect(client.getState()).toBe(WebSocketState.CONNECTED);
      expect(onConnect).toHaveBeenCalledTimes(1);
    });

    it('should append auth token to URL when provided', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        authToken: 'test-token-123',
      });

      client.connect();

      expect(mockWebSocketInstances[0].url).toBe(
        'wss://example.com/ws?token=test-token-123'
      );
    });

    it('should handle URL with existing query parameters', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws?project=123',
        authToken: 'test-token',
      });

      client.connect();

      expect(mockWebSocketInstances[0].url).toBe(
        'wss://example.com/ws?project=123&token=test-token'
      );
    });

    it('should disconnect cleanly', () => {
      client = createWebSocketClient({ url: 'wss://example.com/ws' });
      client.connect();
      mockWebSocketInstances[0].simulateOpen();

      client.disconnect();

      expect(mockWebSocketInstances[0].close).toHaveBeenCalled();
      expect(client.getState()).toBe(WebSocketState.DISCONNECTED);
    });
  });

  describe('Message Handling', () => {
    it('should parse and deliver JSON messages', () => {
      const onMessage = jest.fn();
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        onMessage,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();
      mockWebSocketInstances[0].simulateMessage({ type: 'test', data: 'hello' });

      expect(onMessage).toHaveBeenCalledWith({ type: 'test', data: 'hello' });
    });

    it('should send messages when connected', () => {
      client = createWebSocketClient({ url: 'wss://example.com/ws' });
      client.connect();
      mockWebSocketInstances[0].simulateOpen();

      const result = client.send({ type: 'ping' });

      expect(result).toBe(true);
      expect(mockWebSocketInstances[0].send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'ping' })
      );
    });

    it('should return false when sending message while disconnected', () => {
      client = createWebSocketClient({ url: 'wss://example.com/ws' });

      const result = client.send({ type: 'ping' });

      expect(result).toBe(false);
    });

    it('should queue messages when connecting and send after connection', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        queueMessagesWhileConnecting: true,
      });

      client.connect();
      client.send({ type: 'queued1' });
      client.send({ type: 'queued2' });

      expect(mockWebSocketInstances[0].send).not.toHaveBeenCalled();

      mockWebSocketInstances[0].simulateOpen();

      expect(mockWebSocketInstances[0].send).toHaveBeenCalledTimes(2);
      expect(mockWebSocketInstances[0].send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'queued1' })
      );
      expect(mockWebSocketInstances[0].send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'queued2' })
      );
    });
  });

  describe('Reconnection with Exponential Backoff', () => {
    it('should attempt to reconnect after unexpected disconnect', () => {
      const onDisconnect = jest.fn();
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        onDisconnect,
        reconnect: true,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();
      mockWebSocketInstances[0].simulateClose(1006, 'Abnormal closure');

      expect(onDisconnect).toHaveBeenCalled();
      expect(client.getState()).toBe(WebSocketState.RECONNECTING);

      // Fast-forward past initial reconnect delay
      jest.advanceTimersByTime(1000);

      expect(mockWebSocketInstances.length).toBe(2);
    });

    it('should use exponential backoff for reconnection attempts', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
        initialReconnectDelay: 1000,
        maxReconnectDelay: 30000,
        reconnectBackoffMultiplier: 2,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();

      // First disconnect
      mockWebSocketInstances[0].simulateClose(1006, 'Error');
      expect(mockWebSocketInstances.length).toBe(1);

      // First reconnect after 1000ms (initial delay)
      jest.advanceTimersByTime(1000);
      expect(mockWebSocketInstances.length).toBe(2);

      // Second disconnect
      mockWebSocketInstances[1].simulateClose(1006, 'Error');

      // Second reconnect after 2000ms (1000 * 2)
      jest.advanceTimersByTime(1999);
      expect(mockWebSocketInstances.length).toBe(2);
      jest.advanceTimersByTime(1);
      expect(mockWebSocketInstances.length).toBe(3);

      // Third disconnect
      mockWebSocketInstances[2].simulateClose(1006, 'Error');

      // Third reconnect after 4000ms (2000 * 2)
      jest.advanceTimersByTime(3999);
      expect(mockWebSocketInstances.length).toBe(3);
      jest.advanceTimersByTime(1);
      expect(mockWebSocketInstances.length).toBe(4);
    });

    it('should cap reconnect delay at maxReconnectDelay', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
        initialReconnectDelay: 1000,
        maxReconnectDelay: 5000,
        reconnectBackoffMultiplier: 10,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();
      mockWebSocketInstances[0].simulateClose(1006, 'Error');

      // First reconnect: 1000ms
      jest.advanceTimersByTime(1000);
      expect(mockWebSocketInstances.length).toBe(2);
      mockWebSocketInstances[1].simulateClose(1006, 'Error');

      // Second reconnect: would be 10000ms, but capped at 5000ms
      jest.advanceTimersByTime(5000);
      expect(mockWebSocketInstances.length).toBe(3);
    });

    it('should reset backoff after successful connection', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
        initialReconnectDelay: 1000,
        reconnectBackoffMultiplier: 2,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();
      mockWebSocketInstances[0].simulateClose(1006, 'Error');

      // First reconnect after 1000ms
      jest.advanceTimersByTime(1000);
      mockWebSocketInstances[1].simulateClose(1006, 'Error');

      // Second reconnect after 2000ms
      jest.advanceTimersByTime(2000);
      mockWebSocketInstances[2].simulateOpen(); // Successful connection!
      mockWebSocketInstances[2].simulateClose(1006, 'Error');

      // Next reconnect should be back to 1000ms (reset)
      jest.advanceTimersByTime(1000);
      expect(mockWebSocketInstances.length).toBe(4);
    });

    it('should stop reconnecting after maxReconnectAttempts', () => {
      const onMaxReconnectAttemptsReached = jest.fn();
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
        maxReconnectAttempts: 3,
        initialReconnectDelay: 100,
        onMaxReconnectAttemptsReached,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();

      // Simulate 3 failed reconnection attempts
      for (let i = 0; i < 3; i++) {
        mockWebSocketInstances[i].simulateClose(1006, 'Error');
        jest.advanceTimersByTime(100 * Math.pow(2, i));
      }

      // After 3rd failure, should trigger callback
      mockWebSocketInstances[3].simulateClose(1006, 'Error');

      expect(onMaxReconnectAttemptsReached).toHaveBeenCalled();
      expect(client.getState()).toBe(WebSocketState.DISCONNECTED);

      // Should not attempt more reconnections
      jest.advanceTimersByTime(100000);
      expect(mockWebSocketInstances.length).toBe(4);
    });

    it('should not reconnect on intentional disconnect', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();
      client.disconnect();

      jest.advanceTimersByTime(10000);

      expect(mockWebSocketInstances.length).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        onError,
      });

      client.connect();
      mockWebSocketInstances[0].simulateError(new Error('Connection failed'));

      expect(onError).toHaveBeenCalled();
    });

    it('should handle malformed JSON messages gracefully', () => {
      const onMessage = jest.fn();
      const onError = jest.fn();
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        onMessage,
        onError,
      });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();

      // Manually trigger message with invalid JSON
      if (mockWebSocketInstances[0].onmessage) {
        mockWebSocketInstances[0].onmessage({
          data: 'invalid json {{{',
        } as MessageEvent);
      }

      expect(onMessage).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Fallback to Polling', () => {
    it('should trigger fallback callback when WebSocket fails completely', () => {
      const onFallbackToPolling = jest.fn();
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
        maxReconnectAttempts: 2,
        initialReconnectDelay: 100,
        enableFallback: true,
        onFallbackToPolling,
      });

      client.connect();

      // Simulate immediate failure (no open event)
      mockWebSocketInstances[0].simulateError();
      mockWebSocketInstances[0].simulateClose(1006, 'Error');

      jest.advanceTimersByTime(100);
      mockWebSocketInstances[1].simulateError();
      mockWebSocketInstances[1].simulateClose(1006, 'Error');

      jest.advanceTimersByTime(200);
      mockWebSocketInstances[2].simulateError();
      mockWebSocketInstances[2].simulateClose(1006, 'Error');

      expect(onFallbackToPolling).toHaveBeenCalled();
      expect(client.getState()).toBe(WebSocketState.FALLBACK_POLLING);
    });

    it('should indicate when in fallback mode', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
        maxReconnectAttempts: 0,
        enableFallback: true,
      });

      client.connect();
      mockWebSocketInstances[0].simulateClose(1006, 'Error');

      expect(client.isUsingFallback()).toBe(true);
    });

    it('should attempt WebSocket reconnection from fallback mode', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
        maxReconnectAttempts: 0,
        enableFallback: true,
        fallbackReconnectInterval: 30000,
      });

      client.connect();
      mockWebSocketInstances[0].simulateClose(1006, 'Error');

      expect(client.isUsingFallback()).toBe(true);
      expect(mockWebSocketInstances.length).toBe(1);

      // After fallback interval, should try WebSocket again
      jest.advanceTimersByTime(30000);
      expect(mockWebSocketInstances.length).toBe(2);
    });
  });

  describe('Connection Statistics', () => {
    it('should track connection attempts', () => {
      client = createWebSocketClient({
        url: 'wss://example.com/ws',
        reconnect: true,
        initialReconnectDelay: 100,
      });

      client.connect();
      const stats1 = client.getConnectionStats();
      expect(stats1.connectionAttempts).toBe(1);

      mockWebSocketInstances[0].simulateClose(1006, 'Error');
      jest.advanceTimersByTime(100);

      const stats2 = client.getConnectionStats();
      expect(stats2.connectionAttempts).toBe(2);
    });

    it('should track successful connections', () => {
      client = createWebSocketClient({ url: 'wss://example.com/ws' });

      client.connect();
      mockWebSocketInstances[0].simulateOpen();

      const stats = client.getConnectionStats();
      expect(stats.successfulConnections).toBe(1);
    });

    it('should track last connected timestamp', () => {
      client = createWebSocketClient({ url: 'wss://example.com/ws' });

      const beforeConnect = Date.now();
      client.connect();
      mockWebSocketInstances[0].simulateOpen();

      const stats = client.getConnectionStats();
      expect(stats.lastConnectedAt).toBeGreaterThanOrEqual(beforeConnect);
    });
  });
});
