/**
 * Authentication Helper Utilities
 * Server-side utilities for handling authentication in API routes
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './auth/options';

/**
 * Get the authenticated user ID from the current session
 * Returns null if user is not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  // Return user ID or email as fallback identifier
  return session.user.id || session.user.email || null;
}

/**
 * Get the full user session
 * Returns null if user is not authenticated
 */
export async function getUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

/**
 * Require authentication - throws error if not authenticated
 * Use in API routes that require authentication
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Unauthorized - authentication required');
  }

  return session.user;
}
