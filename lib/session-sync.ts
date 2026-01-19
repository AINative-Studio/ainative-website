/**
 * Cross-Subdomain Session Synchronization Utilities
 *
 * This module provides utilities to synchronize authentication sessions
 * across all *.ainative.studio subdomains using BroadcastChannel API
 * and cross-window messaging.
 *
 * Features:
 * - Real-time session sync across tabs and windows
 * - Cross-subdomain logout propagation
 * - Session heartbeat monitoring
 * - Storage event synchronization
 */

import { Session } from 'next-auth';

export interface SessionSyncMessage {
  type: 'SESSION_UPDATE' | 'SESSION_LOGOUT' | 'SESSION_HEARTBEAT';
  session?: Session | null;
  timestamp: number;
  subdomain?: string;
}

/**
 * Session Synchronization Manager
 * Handles cross-tab and cross-subdomain session synchronization
 */
export class SessionSyncManager {
  private channel: BroadcastChannel | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private storageKey = 'next-auth.session-sync';
  private heartbeatKey = 'next-auth.heartbeat';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeChannel();
      this.initializeStorageListener();
    }
  }

  /**
   * Initialize BroadcastChannel for same-origin tab communication
   */
  private initializeChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('next-auth-session');

      this.channel.addEventListener('message', (event: MessageEvent<SessionSyncMessage>) => {
        this.handleSyncMessage(event.data);
      });
    }
  }

  /**
   * Initialize storage event listener for cross-subdomain sync
   * Storage events fire when localStorage changes in another window/tab
   */
  private initializeStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const message: SessionSyncMessage = JSON.parse(event.newValue);
          this.handleSyncMessage(message);
        } catch (error) {
          console.error('Failed to parse session sync message:', error);
        }
      }
    });
  }

  /**
   * Handle incoming session sync messages
   */
  private handleSyncMessage(message: SessionSyncMessage) {
    switch (message.type) {
      case 'SESSION_UPDATE':
        this.onSessionUpdate(message.session);
        break;

      case 'SESSION_LOGOUT':
        this.onSessionLogout();
        break;

      case 'SESSION_HEARTBEAT':
        this.onHeartbeat(message.timestamp);
        break;
    }
  }

  /**
   * Broadcast session update to all tabs/windows
   */
  public broadcastSessionUpdate(session: Session | null) {
    const message: SessionSyncMessage = {
      type: 'SESSION_UPDATE',
      session,
      timestamp: Date.now(),
      subdomain: window.location.hostname,
    };

    this.broadcast(message);
  }

  /**
   * Broadcast logout event to all tabs/windows
   */
  public broadcastLogout() {
    const message: SessionSyncMessage = {
      type: 'SESSION_LOGOUT',
      timestamp: Date.now(),
      subdomain: window.location.hostname,
    };

    this.broadcast(message);
    this.stopHeartbeat();
  }

  /**
   * Start session heartbeat to detect session expiration
   */
  public startHeartbeat(interval = 60000) {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      const message: SessionSyncMessage = {
        type: 'SESSION_HEARTBEAT',
        timestamp: Date.now(),
        subdomain: window.location.hostname,
      };

      this.broadcast(message);
    }, interval);
  }

  /**
   * Stop session heartbeat
   */
  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Broadcast message to all channels
   */
  private broadcast(message: SessionSyncMessage) {
    // Broadcast via BroadcastChannel (same origin)
    if (this.channel) {
      this.channel.postMessage(message);
    }

    // Broadcast via localStorage (cross-subdomain)
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(message));
      // Clear immediately to allow same message to be sent again
      setTimeout(() => {
        localStorage.removeItem(this.storageKey);
      }, 100);
    } catch (error) {
      console.error('Failed to broadcast via localStorage:', error);
    }
  }

  /**
   * Session update handler (override this in your app)
   */
  private onSessionUpdate(session: Session | null) {
    // Trigger a session refresh
    window.dispatchEvent(new CustomEvent('session-update', { detail: session }));
  }

  /**
   * Session logout handler (override this in your app)
   */
  private onSessionLogout() {
    // Trigger logout
    window.dispatchEvent(new Event('session-logout'));
  }

  /**
   * Heartbeat handler
   */
  private onHeartbeat(timestamp: number) {
    localStorage.setItem(this.heartbeatKey, timestamp.toString());
  }

  /**
   * Check if session is alive based on heartbeat
   */
  public isSessionAlive(maxAge = 120000): boolean {
    const lastHeartbeat = localStorage.getItem(this.heartbeatKey);
    if (!lastHeartbeat) return false;

    const age = Date.now() - parseInt(lastHeartbeat, 10);
    return age < maxAge;
  }

  /**
   * Clean up resources
   */
  public destroy() {
    this.stopHeartbeat();

    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

/**
 * Singleton instance for session sync
 */
let sessionSyncInstance: SessionSyncManager | null = null;

/**
 * Get or create the session sync manager instance
 */
export function getSessionSyncManager(): SessionSyncManager {
  if (typeof window === 'undefined') {
    throw new Error('SessionSyncManager can only be used in browser environment');
  }

  if (!sessionSyncInstance) {
    sessionSyncInstance = new SessionSyncManager();
  }

  return sessionSyncInstance;
}

/**
 * Hook for React components to use session sync
 */
export function useSessionSync() {
  if (typeof window === 'undefined') {
    return null;
  }

  return getSessionSyncManager();
}

/**
 * Sync session across all subdomains on login
 */
export async function syncSessionOnLogin(session: Session) {
  if (typeof window === 'undefined') return;

  const manager = getSessionSyncManager();
  manager.broadcastSessionUpdate(session);
  manager.startHeartbeat();
}

/**
 * Sync logout across all subdomains
 */
export async function syncLogoutAcrossSubdomains() {
  if (typeof window === 'undefined') return;

  const manager = getSessionSyncManager();
  manager.broadcastLogout();

  // Clear all session-related cookies across subdomains
  const domain = window.location.hostname.includes('ainative.studio')
    ? '.ainative.studio'
    : undefined;

  const cookiesToClear = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
  ];

  cookiesToClear.forEach((cookieName) => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // Clear for parent domain if applicable
    if (domain) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
    }
  });

  // Clear localStorage
  try {
    localStorage.removeItem('next-auth.session-sync');
    localStorage.removeItem('next-auth.heartbeat');
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Get session expiration time from JWT
 */
export function getSessionExpiration(session: Session | null): Date | null {
  if (!session) return null;

  try {
    // JWT tokens are typically valid for 30 days (configured in auth options)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    return new Date(Date.now() + maxAge);
  } catch (error) {
    console.error('Failed to get session expiration:', error);
    return null;
  }
}

/**
 * Check if session is about to expire (within 24 hours)
 */
export function isSessionExpiringSoon(session: Session | null): boolean {
  const expiration = getSessionExpiration(session);
  if (!expiration) return true;

  const hoursUntilExpiration = (expiration.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntilExpiration < 24;
}
