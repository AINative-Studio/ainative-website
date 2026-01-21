/**
 * WebSocket Client Utility
 * Generic WebSocket client with automatic reconnection and exponential backoff
 * Implements graceful fallback to polling when WebSocket is unavailable
 *
 * Issue #430 - Agent Swarm Terminal WebSocket Implementation
 */

/**
 * WebSocket connection states
 */
export enum WebSocketState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FALLBACK_POLLING = 'fallback_polling',
}

/**
 * Connection statistics for monitoring
 */
export interface ConnectionStats {
  connectionAttempts: number;
  successfulConnections: number;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
  totalReconnectAttempts: number;
}

/**
 * WebSocket client configuration
 */
export interface WebSocketClientConfig {
  /** WebSocket URL to connect to */
  url: string;

  /** Optional authentication token to append to URL */
  authToken?: string;

  /** Enable automatic reconnection (default: true) */
  reconnect?: boolean;

  /** Initial delay before first reconnect attempt in ms (default: 1000) */
  initialReconnectDelay?: number;

  /** Maximum delay between reconnect attempts in ms (default: 30000) */
  maxReconnectDelay?: number;

  /** Multiplier for exponential backoff (default: 2) */
  reconnectBackoffMultiplier?: number;

  /** Maximum number of reconnect attempts before giving up (default: Infinity) */
  maxReconnectAttempts?: number;

  /** Enable fallback to polling when WebSocket fails (default: false) */
  enableFallback?: boolean;

  /** Interval to retry WebSocket connection when in fallback mode (default: 30000) */
  fallbackReconnectInterval?: number;

  /** Queue messages while connecting and send after connection (default: false) */
  queueMessagesWhileConnecting?: boolean;

  /** Callback when connection is established */
  onConnect?: () => void;

  /** Callback when disconnected */
  onDisconnect?: (event: CloseEvent) => void;

  /** Callback when message is received */
  onMessage?: (data: unknown) => void;

  /** Callback when error occurs */
  onError?: (error: Event | Error) => void;

  /** Callback when max reconnect attempts reached */
  onMaxReconnectAttemptsReached?: () => void;

  /** Callback when falling back to polling mode */
  onFallbackToPolling?: () => void;
}

/**
 * WebSocket Client
 * Provides robust WebSocket connection management with automatic reconnection
 */
export class WebSocketClient {
  private config: Required<
    Pick<
      WebSocketClientConfig,
      | 'url'
      | 'reconnect'
      | 'initialReconnectDelay'
      | 'maxReconnectDelay'
      | 'reconnectBackoffMultiplier'
      | 'maxReconnectAttempts'
      | 'enableFallback'
      | 'fallbackReconnectInterval'
      | 'queueMessagesWhileConnecting'
    >
  > &
    Omit<
      WebSocketClientConfig,
      | 'url'
      | 'reconnect'
      | 'initialReconnectDelay'
      | 'maxReconnectDelay'
      | 'reconnectBackoffMultiplier'
      | 'maxReconnectAttempts'
      | 'enableFallback'
      | 'fallbackReconnectInterval'
      | 'queueMessagesWhileConnecting'
    >;

  private ws: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private currentReconnectDelay: number;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private fallbackTimeout: NodeJS.Timeout | null = null;
  private intentionalDisconnect: boolean = false;
  private messageQueue: unknown[] = [];

  private stats: ConnectionStats = {
    connectionAttempts: 0,
    successfulConnections: 0,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    totalReconnectAttempts: 0,
  };

  constructor(config: WebSocketClientConfig) {
    this.config = {
      ...config,
      reconnect: config.reconnect ?? true,
      initialReconnectDelay: config.initialReconnectDelay ?? 1000,
      maxReconnectDelay: config.maxReconnectDelay ?? 30000,
      reconnectBackoffMultiplier: config.reconnectBackoffMultiplier ?? 2,
      maxReconnectAttempts: config.maxReconnectAttempts ?? Infinity,
      enableFallback: config.enableFallback ?? false,
      fallbackReconnectInterval: config.fallbackReconnectInterval ?? 30000,
      queueMessagesWhileConnecting: config.queueMessagesWhileConnecting ?? false,
    };

    this.currentReconnectDelay = this.config.initialReconnectDelay;
  }

  /**
   * Build the full WebSocket URL with optional auth token
   */
  private buildUrl(): string {
    let url = this.config.url;

    if (this.config.authToken) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}token=${encodeURIComponent(this.config.authToken)}`;
    }

    return url;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.state === WebSocketState.CONNECTED) {
      return;
    }

    this.intentionalDisconnect = false;
    this.state = WebSocketState.CONNECTING;
    this.stats.connectionAttempts++;

    try {
      const url = this.buildUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      this.config.onError?.(error instanceof Error ? error : new Error(String(error)));
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.intentionalDisconnect = true;
    this.clearReconnectTimeout();
    this.clearFallbackTimeout();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }

    this.state = WebSocketState.DISCONNECTED;
    this.messageQueue = [];
  }

  /**
   * Send a message through the WebSocket
   * @returns true if message was sent, false otherwise
   */
  send(data: unknown): boolean {
    if (this.state === WebSocketState.CONNECTED && this.ws) {
      this.ws.send(JSON.stringify(data));
      return true;
    }

    if (
      this.config.queueMessagesWhileConnecting &&
      this.state === WebSocketState.CONNECTING
    ) {
      this.messageQueue.push(data);
      return true;
    }

    return false;
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return this.state;
  }

  /**
   * Check if using fallback polling mode
   */
  isUsingFallback(): boolean {
    return this.state === WebSocketState.FALLBACK_POLLING;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): ConnectionStats {
    return { ...this.stats };
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.state = WebSocketState.CONNECTED;
    this.stats.successfulConnections++;
    this.stats.lastConnectedAt = Date.now();
    this.reconnectAttempts = 0;
    this.currentReconnectDelay = this.config.initialReconnectDelay;

    // Send queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message !== undefined) {
        this.send(message);
      }
    }

    this.config.onConnect?.();
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.config.onMessage?.(data);
    } catch (error) {
      this.config.onError?.(
        error instanceof Error ? error : new Error('Failed to parse message')
      );
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    this.config.onError?.(event);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.stats.lastDisconnectedAt = Date.now();
    this.config.onDisconnect?.(event);

    if (this.intentionalDisconnect) {
      this.state = WebSocketState.DISCONNECTED;
      return;
    }

    // Check if we should fall back to polling
    if (this.shouldFallbackToPolling()) {
      this.activateFallback();
      return;
    }

    // Attempt reconnection if enabled
    if (this.config.reconnect) {
      this.scheduleReconnect();
    } else {
      this.state = WebSocketState.DISCONNECTED;
    }
  }

  /**
   * Check if we should fall back to polling
   */
  private shouldFallbackToPolling(): boolean {
    return (
      this.config.enableFallback &&
      this.reconnectAttempts >= this.config.maxReconnectAttempts
    );
  }

  /**
   * Activate fallback polling mode
   */
  private activateFallback(): void {
    this.state = WebSocketState.FALLBACK_POLLING;
    this.config.onFallbackToPolling?.();
    this.config.onMaxReconnectAttemptsReached?.();

    // Schedule periodic WebSocket reconnection attempts
    this.scheduleFallbackReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimeout();

    // Check if max attempts reached
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      if (this.config.enableFallback) {
        this.activateFallback();
      } else {
        this.state = WebSocketState.DISCONNECTED;
        this.config.onMaxReconnectAttemptsReached?.();
      }
      return;
    }

    this.state = WebSocketState.RECONNECTING;
    this.reconnectAttempts++;
    this.stats.totalReconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
      // Calculate next delay with exponential backoff
      this.currentReconnectDelay = Math.min(
        this.currentReconnectDelay * this.config.reconnectBackoffMultiplier,
        this.config.maxReconnectDelay
      );
    }, this.currentReconnectDelay);
  }

  /**
   * Schedule WebSocket reconnection attempt from fallback mode
   */
  private scheduleFallbackReconnect(): void {
    this.clearFallbackTimeout();

    this.fallbackTimeout = setTimeout(() => {
      // Reset reconnect attempts for a fresh try
      this.reconnectAttempts = 0;
      this.currentReconnectDelay = this.config.initialReconnectDelay;
      this.connect();
    }, this.config.fallbackReconnectInterval);
  }

  /**
   * Clear reconnect timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Clear fallback timeout
   */
  private clearFallbackTimeout(): void {
    if (this.fallbackTimeout) {
      clearTimeout(this.fallbackTimeout);
      this.fallbackTimeout = null;
    }
  }
}

/**
 * Factory function to create a WebSocket client
 */
export function createWebSocketClient(config: WebSocketClientConfig): WebSocketClient {
  return new WebSocketClient(config);
}

/**
 * Helper to build Agent Swarm WebSocket URL
 */
export function buildAgentSwarmWebSocketUrl(
  projectId: string,
  token?: string
): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = process.env.NEXT_PUBLIC_WS_PORT || '8000';

  let url = `${protocol}//${host}:${port}/ws/admin/agent-swarm/${projectId}`;

  if (token) {
    url += `?token=${encodeURIComponent(token)}`;
  }

  return url;
}
