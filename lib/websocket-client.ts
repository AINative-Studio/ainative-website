/**
 * WebSocket Client with Reconnection Logic
 *
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Message queuing for offline messages
 * - Heartbeat/ping mechanism for connection health
 * - Connection state management
 * - Clean disconnection handling
 */

export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting'
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp?: number;
}

export interface WebSocketClientOptions {
  /** URL to connect to */
  url: string;
  /** Protocols to use */
  protocols?: string | string[];
  /** Enable automatic reconnection (default: true) */
  autoReconnect?: boolean;
  /** Initial reconnection delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Maximum reconnection delay in ms (default: 30000) */
  maxReconnectDelay?: number;
  /** Maximum number of reconnection attempts (default: Infinity) */
  maxReconnectAttempts?: number;
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number;
  /** Heartbeat timeout in ms (default: 5000) */
  heartbeatTimeout?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Queue messages when disconnected (default: true) */
  queueMessages?: boolean;
  /** Maximum queue size (default: 100) */
  maxQueueSize?: number;
}

export type MessageHandler = (message: WebSocketMessage) => void;
export type StateChangeHandler = (state: ConnectionState, previousState: ConnectionState) => void;
export type ErrorHandler = (error: Event | Error) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private protocols?: string | string[];
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private messageQueue: string[] = [];
  private messageHandlers: Set<MessageHandler> = new Set();
  private stateChangeHandlers: Set<StateChangeHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private options: Required<Omit<WebSocketClientOptions, 'url' | 'protocols'>>;
  private lastPongTime: number = Date.now();
  private isManualClose = false;

  constructor(options: WebSocketClientOptions) {
    this.url = options.url;
    this.protocols = options.protocols;

    // Set default options
    this.options = {
      autoReconnect: options.autoReconnect ?? true,
      reconnectDelay: options.reconnectDelay ?? 1000,
      maxReconnectDelay: options.maxReconnectDelay ?? 30000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? Infinity,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      heartbeatTimeout: options.heartbeatTimeout ?? 5000,
      debug: options.debug ?? false,
      queueMessages: options.queueMessages ?? true,
      maxQueueSize: options.maxQueueSize ?? 100,
    };
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      this.log('Already connected or connecting');
      return;
    }

    this.isManualClose = false;
    this.setState(ConnectionState.CONNECTING);
    this.log('Connecting to', this.url);

    try {
      this.ws = new WebSocket(this.url, this.protocols);
      this.attachEventHandlers();
    } catch (error) {
      this.handleError(error as Error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.isManualClose = true;
    this.clearReconnectTimeout();
    this.clearHeartbeat();

    if (this.ws) {
      this.log('Disconnecting');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setState(ConnectionState.DISCONNECTED);
  }

  /**
   * Send a message through the WebSocket
   */
  public send(message: string | WebSocketMessage): void {
    const messageStr = typeof message === 'string'
      ? message
      : JSON.stringify(message);

    if (this.isConnected()) {
      try {
        this.ws!.send(messageStr);
        this.log('Sent message:', messageStr);
      } catch (error) {
        this.log('Failed to send message:', error);
        this.queueMessage(messageStr);
      }
    } else {
      this.log('Not connected, queuing message');
      this.queueMessage(messageStr);
    }
  }

  /**
   * Subscribe to incoming messages
   */
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to state changes
   */
  public onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler);
    return () => this.stateChangeHandlers.delete(handler);
  }

  /**
   * Subscribe to errors
   */
  public onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Get current connection state
   */
  public getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get number of queued messages
   */
  public getQueueSize(): number {
    return this.messageQueue.length;
  }

  /**
   * Clear message queue
   */
  public clearQueue(): void {
    this.messageQueue = [];
  }

  /**
   * Get reconnection attempt count
   */
  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  private attachEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  private handleOpen(): void {
    this.log('Connected');
    this.reconnectAttempts = 0;
    this.setState(ConnectionState.CONNECTED);
    this.startHeartbeat();
    this.flushMessageQueue();
  }

  private handleClose(event: CloseEvent): void {
    this.log('Disconnected:', event.code, event.reason);
    this.clearHeartbeat();

    if (this.isManualClose) {
      this.setState(ConnectionState.DISCONNECTED);
      return;
    }

    if (this.options.autoReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.setState(ConnectionState.RECONNECTING);
      this.scheduleReconnect();
    } else {
      this.setState(ConnectionState.DISCONNECTED);
    }
  }

  private handleError(error: Event | Error): void {
    this.log('Error:', error);
    this.setState(ConnectionState.ERROR);
    this.errorHandlers.forEach(handler => handler(error));
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = typeof event.data === 'string' ? event.data : event.data.toString();
      this.log('Received message:', data);

      // Handle ping/pong for heartbeat
      if (data === 'ping') {
        this.send('pong');
        return;
      }

      if (data === 'pong') {
        this.lastPongTime = Date.now();
        this.clearHeartbeatTimeout();
        return;
      }

      // Parse message and notify handlers
      let parsedMessage: WebSocketMessage;
      try {
        parsedMessage = JSON.parse(data);
      } catch {
        // If not JSON, treat as a simple message
        parsedMessage = {
          type: 'message',
          payload: data,
          timestamp: Date.now()
        };
      }

      this.messageHandlers.forEach(handler => handler(parsedMessage));
    } catch (error) {
      this.log('Failed to handle message:', error);
    }
  }

  private setState(newState: ConnectionState): void {
    const previousState = this.state;
    if (previousState === newState) return;

    this.state = newState;
    this.log('State changed:', previousState, '->', newState);
    this.stateChangeHandlers.forEach(handler => handler(newState, previousState));
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimeout();

    const delay = Math.min(
      this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.options.maxReconnectDelay
    );

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping');
        this.startHeartbeatTimeout();
      }
    }, this.options.heartbeatInterval);
  }

  private startHeartbeatTimeout(): void {
    this.clearHeartbeatTimeout();

    this.heartbeatTimeout = setTimeout(() => {
      const timeSinceLastPong = Date.now() - this.lastPongTime;
      if (timeSinceLastPong > this.options.heartbeatTimeout) {
        this.log('Heartbeat timeout - connection may be dead');
        this.ws?.close(4000, 'Heartbeat timeout');
      }
    }, this.options.heartbeatTimeout);
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.clearHeartbeatTimeout();
  }

  private queueMessage(message: string): void {
    if (!this.options.queueMessages) return;

    if (this.messageQueue.length >= this.options.maxQueueSize) {
      this.log('Message queue full, dropping oldest message');
      this.messageQueue.shift();
    }

    this.messageQueue.push(message);
    this.log(`Message queued (${this.messageQueue.length}/${this.options.maxQueueSize})`);
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    this.log(`Flushing ${this.messageQueue.length} queued messages`);

    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws!.send(message);
        } catch (error) {
          this.log('Failed to send queued message:', error);
          // Re-queue on failure
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  private log(...args: unknown[]): void {
    if (this.options.debug) {
      console.log('[WebSocketClient]', ...args);
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.disconnect();
    this.messageHandlers.clear();
    this.stateChangeHandlers.clear();
    this.errorHandlers.clear();
    this.clearQueue();
  }
}

/**
 * Create a WebSocket client instance
 */
export function createWebSocketClient(options: WebSocketClientOptions): WebSocketClient {
  return new WebSocketClient(options);
}
