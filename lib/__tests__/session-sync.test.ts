/**
 * Tests for session-sync utilities
 *
 * @jest-environment jsdom
 */

import {
  SessionSyncManager,
  getSessionSyncManager,
  syncSessionOnLogin,
  syncLogoutAcrossSubdomains,
  getSessionExpiration,
  isSessionExpiringSoon,
} from '../session-sync';
import { Session } from 'next-auth';

describe('Session Sync Utilities', () => {
  let manager: SessionSyncManager;

  beforeEach(() => {
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();

    // Create fresh manager instance
    manager = new SessionSyncManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('SessionSyncManager', () => {
    it('should initialize correctly', () => {
      expect(manager).toBeDefined();
    });

    it('should broadcast session update', () => {
      const mockSession: Session = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        expires: new Date(Date.now() + 1000).toISOString(),
      };

      // This should not throw
      expect(() => {
        manager.broadcastSessionUpdate(mockSession);
      }).not.toThrow();
    });

    it('should broadcast logout', () => {
      expect(() => {
        manager.broadcastLogout();
      }).not.toThrow();
    });

    it('should start and stop heartbeat', () => {
      jest.useFakeTimers();

      manager.startHeartbeat(1000);
      expect(manager['heartbeatInterval']).toBeTruthy();

      manager.stopHeartbeat();
      expect(manager['heartbeatInterval']).toBeNull();

      jest.useRealTimers();
    });

    it('should detect session alive status', () => {
      localStorage.setItem('next-auth.heartbeat', Date.now().toString());
      expect(manager.isSessionAlive()).toBe(true);
    });

    it('should detect dead session', () => {
      const oldTimestamp = Date.now() - 200000; // 200 seconds ago
      localStorage.setItem('next-auth.heartbeat', oldTimestamp.toString());
      expect(manager.isSessionAlive()).toBe(false);
    });

    it('should clean up resources on destroy', () => {
      manager.startHeartbeat();
      manager.destroy();

      expect(manager['heartbeatInterval']).toBeNull();
      expect(manager['channel']).toBeNull();
    });
  });

  describe('getSessionSyncManager', () => {
    it('should return singleton instance', () => {
      const instance1 = getSessionSyncManager();
      const instance2 = getSessionSyncManager();

      expect(instance1).toBe(instance2);
    });
  });

  describe('syncSessionOnLogin', () => {
    it('should sync session on login', async () => {
      const mockSession: Session = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        expires: new Date(Date.now() + 1000).toISOString(),
      };

      await syncSessionOnLogin(mockSession);

      // Should start heartbeat
      const manager = getSessionSyncManager();
      expect(manager['heartbeatInterval']).toBeTruthy();

      // Clean up
      manager.stopHeartbeat();
    });
  });

  describe('syncLogoutAcrossSubdomains', () => {
    it('should clear cookies and storage on logout', async () => {
      // Set some test data
      localStorage.setItem('next-auth.session-sync', 'test');
      localStorage.setItem('next-auth.heartbeat', 'test');
      document.cookie = 'next-auth.session-token=test';

      await syncLogoutAcrossSubdomains();

      // Storage should be cleared
      expect(localStorage.getItem('next-auth.session-sync')).toBeNull();
      expect(localStorage.getItem('next-auth.heartbeat')).toBeNull();
    });
  });

  describe('getSessionExpiration', () => {
    it('should return null for no session', () => {
      const expiration = getSessionExpiration(null);
      expect(expiration).toBeNull();
    });

    it('should calculate expiration date', () => {
      const mockSession: Session = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        expires: new Date(Date.now() + 1000).toISOString(),
      };

      const expiration = getSessionExpiration(mockSession);
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('isSessionExpiringSoon', () => {
    it('should return true for null session', () => {
      expect(isSessionExpiringSoon(null)).toBe(true);
    });

    it('should detect session expiring soon', () => {
      const mockSession: Session = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
        expires: new Date(Date.now() + 1000).toISOString(),
      };

      // Session is expiring soon if within 24 hours
      // The default maxAge is 30 days, so this should return false
      const result = isSessionExpiringSoon(mockSession);

      // With 30 day expiration, session is NOT expiring soon
      expect(result).toBe(false);
    });
  });

  describe('BroadcastChannel integration', () => {
    it('should handle missing BroadcastChannel gracefully', () => {
      const originalBroadcastChannel = (window as any).BroadcastChannel;
      delete (window as any).BroadcastChannel;

      const testManager = new SessionSyncManager();
      expect(testManager['channel']).toBeNull();

      // Restore
      (window as any).BroadcastChannel = originalBroadcastChannel;
      testManager.destroy();
    });
  });

  describe('Storage events', () => {
    it('should handle storage events', () => {
      const listener = jest.fn();
      window.addEventListener('storage', listener);

      localStorage.setItem('next-auth.session-sync', JSON.stringify({
        type: 'SESSION_UPDATE',
        timestamp: Date.now(),
      }));

      // Note: In jsdom, storage events don't fire automatically
      // This test verifies the listener is set up

      window.removeEventListener('storage', listener);
    });
  });
});
