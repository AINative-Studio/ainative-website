/**
 * Generic WebSocket Client Utility
 * Provides robust WebSocket connection management with auto-reconnection
 * Refs #430
 */

export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

export interface WebSocketClientConfig {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  reconnectBackoffMultiplier?: number;
  maxReconnectInterval?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnect?: (attempt: number) => void;
}

export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketClientConfig>;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private intentionalClose = false;
  private currentReconnectInterval: number;

  constructor(config: WebSocketClientConfig) {
    this.config = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      reconnectBackoffMultiplier: 1.5,
      maxReconnectInterval: 30000,
      onOpen: () => {},
      onClose: () => {},
      onError: () => {},
      onMessage: () => {},
      onReconnect: () => {},
      ...config,
    };
    this.currentReconnectInterval = this.config.reconnectInterval;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected');
      return;
    }

    try {
      this.intentionalClose = false;
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.currentReconnectInterval = this.config.reconnectInterval;
        this.config.onOpen();
      };

      this.ws.onclose = () => {
        this.config.onClose();
        if (!this.intentionalClose && this.config.reconnect) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        this.config.onError(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.config.onMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      if (this.config.reconnect) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error(`Max reconnect attempts (${this.config.maxReconnectAttempts}) reached`);
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    this.config.onReconnect(this.reconnectAttempts);

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, this.currentReconnectInterval);

    // Apply exponential backoff
    this.currentReconnectInterval = Math.min(
      this.currentReconnectInterval * this.config.reconnectBackoffMultiplier,
      this.config.maxReconnectInterval
    );
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Close WebSocket connection
   */
  close(): void {
    this.intentionalClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get current connection state
   */
  getState(): WebSocketState {
    return (this.ws?.readyState ?? WebSocketState.CLOSED) as WebSocketState;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get number of reconnect attempts
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}
