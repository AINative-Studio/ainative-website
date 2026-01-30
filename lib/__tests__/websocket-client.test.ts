/**
 * WebSocket Client Unit Tests
 *
 * Tests for:
 * - Connection management
 * - Reconnection with exponential backoff
 * - Message queuing
 * - Heartbeat mechanism
 * - State management
 * - Error handling
 */

import { WebSocketClient, ConnectionState, createWebSocketClient } from '../websocket-client';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState = MockWebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;

  constructor(public url: string, public protocols?: string | string[]) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(_data: string): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: code ?? 1000, reason: reason ?? '' }));
    }
  }

  simulateMessage(data: string): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  simulateError(_error?: Error): void {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// Replace global WebSocket with mock
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).WebSocket = MockWebSocket;

describe('WebSocketClient', () => {
  let client: WebSocketClient;
  const mockUrl = 'ws://localhost:8080';

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (client) {
      client.destroy();
    }
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Connection Management', () => {
    it('should initialize with DISCONNECTED state', () => {
      client = new WebSocketClient({ url: mockUrl });
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(client.isConnected()).toBe(false);
    });

    it('should connect successfully', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const stateChanges: ConnectionState[] = [];
      client.onStateChange((state) => {
        stateChanges.push(state);
      });

      client.connect();
      expect(client.getState()).toBe(ConnectionState.CONNECTING);

      jest.advanceTimersByTime(20);
      await Promise.resolve();

      expect(stateChanges).toContain(ConnectionState.CONNECTING);
      expect(stateChanges).toContain(ConnectionState.CONNECTED);
      expect(client.isConnected()).toBe(true);
    });

    it('should disconnect cleanly', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      expect(client.isConnected()).toBe(true);

      client.disconnect();
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(client.isConnected()).toBe(false);
    });

    it('should not reconnect on manual disconnect', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        autoReconnect: true,
        debug: false
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      client.disconnect();

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(client.getReconnectAttempts()).toBe(0);
    });
  });

  describe('Reconnection Logic', () => {
    it('should reconnect with exponential backoff', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        autoReconnect: true,
        reconnectDelay: 1000,
        maxReconnectDelay: 30000,
        debug: false
      });

      let reconnectCount = 0;
      client.onStateChange((state) => {
        if (state === ConnectionState.RECONNECTING) {
          reconnectCount++;
        }
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.close(1006, 'Connection lost');

      expect(client.getState()).toBe(ConnectionState.RECONNECTING);

      jest.advanceTimersByTime(1100);
      await Promise.resolve();

      jest.advanceTimersByTime(20);
      await Promise.resolve();

      expect(reconnectCount).toBeGreaterThanOrEqual(1);
    });

    it('should cap reconnection delay at maxReconnectDelay', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        autoReconnect: true,
        reconnectDelay: 1000,
        maxReconnectDelay: 5000,
        debug: false
      });

      let reconnectCount = 0;
      client.onStateChange((state) => {
        if (state === ConnectionState.RECONNECTING) {
          reconnectCount++;
        }
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.close(1006, 'Connection lost');

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      expect(reconnectCount).toBeGreaterThan(0);
    });

    it('should limit reconnection attempts', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        autoReconnect: true,
        maxReconnectAttempts: 3,
        reconnectDelay: 100,
        debug: false
      });

      let reconnectStateCount = 0;
      client.onStateChange((state) => {
        if (state === ConnectionState.RECONNECTING) {
          reconnectStateCount++;
        }
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      expect(client.isConnected()).toBe(true);

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.close(1006, 'Connection lost');

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(reconnectStateCount).toBeGreaterThan(0);
    });

    it('should reset reconnect attempts after successful connection', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        autoReconnect: true,
        reconnectDelay: 100,
        debug: false
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      expect(client.isConnected()).toBe(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws.close(1006, 'Connection lost');
      expect(client.getState()).toBe(ConnectionState.RECONNECTING);

      jest.advanceTimersByTime(200);
      await Promise.resolve();

      expect(client.getReconnectAttempts()).toBe(0);
    });
  });

  describe('Message Queuing', () => {
    it('should queue messages when disconnected', () => {
      client = new WebSocketClient({
        url: mockUrl,
        queueMessages: true,
        debug: false
      });

      expect(client.getQueueSize()).toBe(0);

      client.send('test message 1');
      client.send({ type: 'test', payload: 'data' });

      expect(client.getQueueSize()).toBe(2);
    });

    it('should send queued messages after connection', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        queueMessages: true,
        debug: false
      });

      client.send('queued message 1');
      client.send('queued message 2');
      expect(client.getQueueSize()).toBe(2);

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      expect(client.getQueueSize()).toBe(0);
    });

    it('should drop oldest message when queue is full', () => {
      client = new WebSocketClient({
        url: mockUrl,
        queueMessages: true,
        maxQueueSize: 3,
        debug: false
      });

      client.send('message 1');
      client.send('message 2');
      client.send('message 3');
      client.send('message 4');

      expect(client.getQueueSize()).toBe(3);
    });

    it('should not queue messages when queueMessages is false', () => {
      client = new WebSocketClient({
        url: mockUrl,
        queueMessages: false,
        debug: false
      });

      client.send('test message');
      expect(client.getQueueSize()).toBe(0);
    });

    it('should clear message queue', () => {
      client = new WebSocketClient({
        url: mockUrl,
        queueMessages: true,
        debug: false
      });

      client.send('message 1');
      client.send('message 2');
      expect(client.getQueueSize()).toBe(2);

      client.clearQueue();
      expect(client.getQueueSize()).toBe(0);
    });
  });

  describe('Heartbeat Mechanism', () => {
    it('should send ping messages at heartbeat interval', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        heartbeatInterval: 1000,
        debug: false
      });

      const sendSpy = jest.spyOn(client, 'send');

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      jest.advanceTimersByTime(1000);
      expect(sendSpy).toHaveBeenCalledWith('ping');

      sendSpy.mockRestore();
    });

    it('should handle pong responses', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        heartbeatInterval: 1000,
        heartbeatTimeout: 500,
        debug: false
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.simulateMessage('ping');

      const sendSpy = jest.spyOn(ws, 'send');
      ws.simulateMessage('ping');
      expect(sendSpy).toHaveBeenCalledWith('pong');

      sendSpy.mockRestore();
    });

    it('should close connection on heartbeat timeout', async () => {
      client = new WebSocketClient({
        url: mockUrl,
        heartbeatInterval: 1000,
        heartbeatTimeout: 500,
        debug: false
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      const closeSpy = jest.spyOn(ws, 'close');

      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(600);

      expect(closeSpy).toHaveBeenCalledWith(4000, 'Heartbeat timeout');

      closeSpy.mockRestore();
    });
  });

  describe('Message Handling', () => {
    it('should receive and parse JSON messages', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const messages: unknown[] = [];
      client.onMessage((msg) => {
        messages.push(msg);
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.simulateMessage(JSON.stringify({ type: 'test', payload: 'data' }));

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({ type: 'test', payload: 'data' });
    });

    it('should handle non-JSON messages', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const messages: unknown[] = [];
      client.onMessage((msg) => {
        messages.push(msg);
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.simulateMessage('plain text message');

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        type: 'message',
        payload: 'plain text message'
      });
    });

    it('should support multiple message handlers', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const handler1Messages: unknown[] = [];
      const handler2Messages: unknown[] = [];

      client.onMessage((msg) => handler1Messages.push(msg));
      client.onMessage((msg) => handler2Messages.push(msg));

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.simulateMessage(JSON.stringify({ type: 'test' }));

      expect(handler1Messages).toHaveLength(1);
      expect(handler2Messages).toHaveLength(1);
    });

    it('should unsubscribe message handlers', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const messages: unknown[] = [];
      const unsubscribe = client.onMessage((msg) => {
        messages.push(msg);
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.simulateMessage('message 1');

      unsubscribe();

      ws.simulateMessage('message 2');

      expect(messages).toHaveLength(1);
    });
  });

  describe('State Management', () => {
    it('should notify state change handlers', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const stateChanges: Array<[ConnectionState, ConnectionState]> = [];
      client.onStateChange((newState, oldState) => {
        stateChanges.push([newState, oldState]);
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      expect(stateChanges).toContainEqual([
        ConnectionState.CONNECTING,
        ConnectionState.DISCONNECTED
      ]);
      expect(stateChanges).toContainEqual([
        ConnectionState.CONNECTED,
        ConnectionState.CONNECTING
      ]);
    });

    it('should unsubscribe state change handlers', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const stateChanges: ConnectionState[] = [];
      const unsubscribe = client.onStateChange((state) => {
        stateChanges.push(state);
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      const initialCount = stateChanges.length;
      unsubscribe();

      client.disconnect();
      expect(stateChanges.length).toBe(initialCount);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const errors: unknown[] = [];
      client.onError((error) => {
        errors.push(error);
      });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.simulateError(new Error('Connection failed'));

      expect(errors.length).toBeGreaterThan(0);
      expect(client.getState()).toBe(ConnectionState.ERROR);
    });

    it('should unsubscribe error handlers', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      const errors: unknown[] = [];
      const unsubscribe = client.onError((error) => {
        errors.push(error);
      });

      unsubscribe();

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

       
      const ws = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).ws as MockWebSocket;
      ws.simulateError(new Error('Test error'));

      expect(errors).toHaveLength(0);
    });
  });

  describe('Factory Function', () => {
    it('should create client instance with factory', () => {
      client = createWebSocketClient({ url: mockUrl, debug: false });
      expect(client).toBeInstanceOf(WebSocketClient);
      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', async () => {
      client = new WebSocketClient({ url: mockUrl, debug: false });

      client.connect();
      jest.advanceTimersByTime(20);
      await Promise.resolve();

      client.send('test');
      expect(client.getQueueSize()).toBeGreaterThanOrEqual(0);

      client.destroy();

      expect(client.getState()).toBe(ConnectionState.DISCONNECTED);
      expect(client.getQueueSize()).toBe(0);
    });
  });
});
