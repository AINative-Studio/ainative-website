/**
 * WebSocket Client Tests
 * Following TDD methodology - Tests written FIRST
 * Refs #430
 */

import { WebSocketClient, WebSocketMessage, WebSocketState } from '../websocket-client';

describe('WebSocketClient', () => {
  let mockWebSocket: {
    send: jest.Mock;
    close: jest.Mock;
    readyState: number;
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onerror: ((error: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock WebSocket constructor - create a fresh mock for each test
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn().mockImplementation(() => {
        mockWebSocket.readyState = WebSocket.CLOSED as 0;
      }),
      readyState: WebSocket.CONNECTING as 0,
      onopen: null,
      onclose: null,
      onerror: null,
      onmessage: null,
    };

    global.WebSocket = jest.fn(() => {
      // Return a fresh mock each time
      const ws = {
        send: jest.fn(),
        close: jest.fn().mockImplementation(() => {
          ws.readyState = WebSocket.CLOSED as 0;
        }),
        readyState: WebSocket.CONNECTING as 0,
        onopen: null,
        onclose: null,
        onerror: null,
        onmessage: null,
      };
      Object.assign(mockWebSocket, ws);
      return mockWebSocket;
    }) as unknown as typeof WebSocket;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should create a WebSocket connection', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
      });

      client.connect();

      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8000/test');
    });

    it('should call onOpen callback when connection opens', () => {
      const onOpen = jest.fn();
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        onOpen,
      });

      client.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.onopen?.();

      expect(onOpen).toHaveBeenCalled();
    });

    it('should call onClose callback when connection closes', () => {
      const onClose = jest.fn();
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        onClose,
      });

      client.connect();
      mockWebSocket.onclose?.();

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onError callback on connection error', () => {
      const onError = jest.fn();
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        onError,
      });

      client.connect();
      const mockError = new Event('error');
      mockWebSocket.onerror?.(mockError);

      expect(onError).toHaveBeenCalledWith(mockError);
    });

    it('should not reconnect on intentional close', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
      });

      client.connect();
      client.close();
      mockWebSocket.onclose?.();

      jest.advanceTimersByTime(5000);

      // Should only be called once (initial connection)
      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });

    it('should prevent duplicate connections when already open', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
      });

      client.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      client.connect();

      // Should only be called once
      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });
  });

  describe('Message Handling', () => {
    it('should handle incoming messages', () => {
      const onMessage = jest.fn();
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        onMessage,
      });

      client.connect();

      const testMessage: WebSocketMessage = { type: 'test', data: 'hello' };
      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify(testMessage),
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(onMessage).toHaveBeenCalledWith(testMessage);
    });

    it('should send messages when connected', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
      });

      client.connect();
      mockWebSocket.readyState = WebSocket.OPEN;

      const message: WebSocketMessage = { type: 'test', data: 'hello' };
      client.send(message);

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should throw error when sending while disconnected', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
      });

      mockWebSocket.readyState = WebSocket.CLOSED;

      const message: WebSocketMessage = { type: 'test', data: 'hello' };

      expect(() => client.send(message)).toThrow('WebSocket is not connected');
    });

    it('should handle malformed JSON messages gracefully', () => {
      const onMessage = jest.fn();
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        onMessage,
      });

      client.connect();

      const messageEvent = new MessageEvent('message', {
        data: 'invalid json {',
      });

      mockWebSocket.onmessage?.(messageEvent);

      expect(onMessage).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('Reconnection Logic', () => {
    it('should reconnect after connection loss with reconnect enabled', () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();
      let callCount = 0;
      let lastWs: any = null;

      global.WebSocket = jest.fn(() => {
        callCount++;
        lastWs = {
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING,
          onopen: null as (() => void) | null,
          onclose: null as (() => void) | null,
          onerror: null as ((error: Event) => void) | null,
          onmessage: null as ((event: MessageEvent) => void) | null,
        };
        return lastWs;
      }) as unknown as typeof WebSocket;

      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
        reconnectInterval: 1000,
      });

      client.connect();
      expect(callCount).toBe(1);

      // Trigger close
      lastWs.readyState = WebSocket.CLOSED;
      lastWs.onclose?.();

      // Fast-forward time to trigger reconnect
      jest.runOnlyPendingTimers();

      // Should have initial connection + 1 reconnect
      expect(callCount).toBe(2);
      expect(consoleLog).toHaveBeenCalledWith('Reconnecting (attempt 1)...');

      consoleLog.mockRestore();
    });

    it('should not reconnect when reconnect is disabled', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: false,
      });

      client.connect();
      mockWebSocket.onclose?.();

      jest.advanceTimersByTime(5000);

      // Should only be called once (no reconnect)
      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });

    it('should apply exponential backoff to reconnection attempts', () => {
      const onReconnect = jest.fn();
      let callCount = 0;
      let currentWs: any = null;

      global.WebSocket = jest.fn(() => {
        callCount++;
        currentWs = {
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING,
          onopen: null as (() => void) | null,
          onclose: null as (() => void) | null,
          onerror: null as ((error: Event) => void) | null,
          onmessage: null as ((event: MessageEvent) => void) | null,
        };
        return currentWs;
      }) as unknown as typeof WebSocket;

      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
        reconnectInterval: 1000,
        reconnectBackoffMultiplier: 2,
        maxReconnectInterval: 10000,
        onReconnect,
      });

      client.connect();
      expect(callCount).toBe(1);

      // Trigger first close and reconnect
      currentWs.readyState = WebSocket.CLOSED;
      currentWs.onclose?.();
      jest.runOnlyPendingTimers();
      expect(callCount).toBe(2);
      expect(onReconnect).toHaveBeenCalledWith(1);

      // Trigger second close and reconnect (should use exponential backoff)
      currentWs.readyState = WebSocket.CLOSED;
      currentWs.onclose?.();
      jest.runOnlyPendingTimers();
      expect(callCount).toBe(3);
      expect(onReconnect).toHaveBeenCalledWith(2);
    });

    it('should respect maxReconnectInterval', () => {
      let callCount = 0;
      let currentWs: any = null;

      global.WebSocket = jest.fn(() => {
        callCount++;
        currentWs = {
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING,
          onopen: null as (() => void) | null,
          onclose: null as (() => void) | null,
          onerror: null as ((error: Event) => void) | null,
          onmessage: null as ((event: MessageEvent) => void) | null,
        };
        return currentWs;
      }) as unknown as typeof WebSocket;

      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
        reconnectInterval: 1000,
        reconnectBackoffMultiplier: 100,
        maxReconnectInterval: 5000,
      });

      client.connect();

      // Multiple reconnects - backoff should cap at maxReconnectInterval
      for (let i = 0; i < 5; i++) {
        currentWs.readyState = WebSocket.CLOSED;
        currentWs.onclose?.();
        jest.runOnlyPendingTimers();
      }

      // Should cap at maxReconnectInterval (initial + 5 reconnects)
      expect(callCount).toBe(6);
    });

    it('should stop reconnecting after max attempts', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      let callCount = 0;
      let currentWs: any = null;

      global.WebSocket = jest.fn(() => {
        callCount++;
        currentWs = {
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING,
          onopen: null as (() => void) | null,
          onclose: null as (() => void) | null,
          onerror: null as ((error: Event) => void) | null,
          onmessage: null as ((event: MessageEvent) => void) | null,
        };
        return currentWs;
      }) as unknown as typeof WebSocket;

      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 3,
      });

      client.connect();
      expect(callCount).toBe(1);

      // Trigger 3 reconnect attempts
      for (let i = 0; i < 3; i++) {
        currentWs.readyState = WebSocket.CLOSED;
        currentWs.onclose?.();
        jest.runOnlyPendingTimers();
      }

      expect(callCount).toBe(4); // initial + 3 reconnects

      // Try one more - should not reconnect (max reached)
      currentWs.readyState = WebSocket.CLOSED;
      currentWs.onclose?.();
      jest.runOnlyPendingTimers();

      // Should still be 4 (max reached, no more reconnects)
      expect(callCount).toBe(4);
      expect(consoleError).toHaveBeenCalledWith('Max reconnect attempts (3) reached');

      consoleError.mockRestore();
    });

    it('should call onReconnect callback on each reconnect attempt', () => {
      const onReconnect = jest.fn();
      let currentWs: any = null;

      global.WebSocket = jest.fn(() => {
        currentWs = {
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING,
          onopen: null as (() => void) | null,
          onclose: null as (() => void) | null,
          onerror: null as ((error: Event) => void) | null,
          onmessage: null as ((event: MessageEvent) => void) | null,
        };
        return currentWs;
      }) as unknown as typeof WebSocket;

      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
        reconnectInterval: 100,
        onReconnect,
      });

      client.connect();

      // Trigger 2 reconnects
      currentWs.readyState = WebSocket.CLOSED;
      currentWs.onclose?.();
      jest.runOnlyPendingTimers();

      currentWs.readyState = WebSocket.CLOSED;
      currentWs.onclose?.();
      jest.runOnlyPendingTimers();

      expect(onReconnect).toHaveBeenCalledTimes(2);
      expect(onReconnect).toHaveBeenNthCalledWith(1, 1);
      expect(onReconnect).toHaveBeenNthCalledWith(2, 2);
    });

    it('should reset reconnect attempts on successful connection', () => {
      let currentWs: any = null;

      global.WebSocket = jest.fn(() => {
        currentWs = {
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING,
          onopen: null as (() => void) | null,
          onclose: null as (() => void) | null,
          onerror: null as ((error: Event) => void) | null,
          onmessage: null as ((event: MessageEvent) => void) | null,
        };
        return currentWs;
      }) as unknown as typeof WebSocket;

      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
        reconnectInterval: 100,
      });

      client.connect();

      // Trigger reconnect
      currentWs.readyState = WebSocket.CLOSED;
      currentWs.onclose?.();
      jest.runOnlyPendingTimers();

      // Successful connection
      currentWs.readyState = WebSocket.OPEN;
      currentWs.onopen?.();

      expect(client.getReconnectAttempts()).toBe(0);
    });
  });

  describe('State Management', () => {
    it('should return correct connection state', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
      });

      expect(client.getState()).toBe(WebSocketState.CLOSED);

      client.connect();
      // After connect(), state should reflect the mock WebSocket's readyState
      expect(client.getState()).toBe(mockWebSocket.readyState);

      mockWebSocket.readyState = WebSocket.OPEN;
      expect(client.getState()).toBe(WebSocketState.OPEN);
    });

    it('should correctly report connection status', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
      });

      expect(client.isConnected()).toBe(false);

      client.connect();
      mockWebSocket.readyState = WebSocket.OPEN;
      expect(client.isConnected()).toBe(true);

      client.close();
      expect(client.isConnected()).toBe(false);
    });

    it('should track reconnect attempts', () => {
      let currentWs: any = null;

      global.WebSocket = jest.fn(() => {
        currentWs = {
          send: jest.fn(),
          close: jest.fn(),
          readyState: WebSocket.CONNECTING,
          onopen: null as (() => void) | null,
          onclose: null as (() => void) | null,
          onerror: null as ((error: Event) => void) | null,
          onmessage: null as ((event: MessageEvent) => void) | null,
        };
        return currentWs;
      }) as unknown as typeof WebSocket;

      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
        reconnectInterval: 100,
      });

      client.connect();

      expect(client.getReconnectAttempts()).toBe(0);

      currentWs.readyState = WebSocket.CLOSED;
      currentWs.onclose?.();
      jest.runOnlyPendingTimers();

      expect(client.getReconnectAttempts()).toBe(1);

      currentWs.readyState = WebSocket.CLOSED;
      currentWs.onclose?.();
      jest.runOnlyPendingTimers();

      expect(client.getReconnectAttempts()).toBe(2);
    });
  });

  describe('Cleanup', () => {
    it('should properly clean up on close', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
      });

      client.connect();
      client.close();

      expect(mockWebSocket.close).toHaveBeenCalled();
      expect(client.getState()).toBe(WebSocketState.CLOSED);
    });

    it('should clear reconnect timeout on close', () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8000/test',
        reconnect: true,
        reconnectInterval: 1000,
      });

      client.connect();
      mockWebSocket.onclose?.();

      // Close before reconnect fires
      client.close();
      jest.advanceTimersByTime(1000);

      // Should only be called once (initial connection, not reconnect)
      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });
  });
});
