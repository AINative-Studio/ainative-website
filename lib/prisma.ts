/**
 * Prisma Client Singleton
 *
 * This module provides a single Prisma Client instance for the entire application.
 * In development, the client is attached to the global object to prevent
 * creating multiple instances during hot reloading.
 *
 * Connection pooling is handled by Prisma Client automatically.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    errorFormat: 'pretty',
  });

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect Prisma Client on application shutdown
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * Health check for database connectivity
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Get database connection statistics
 */
export async function getDatabaseStats() {
  try {
    const userCount = await prisma.user.count();
    const apiKeyCount = await prisma.apiKey.count();
    const subscriptionCount = await prisma.subscription.count();
    const projectCount = await prisma.project.count();

    return {
      users: userCount,
      apiKeys: apiKeyCount,
      subscriptions: subscriptionCount,
      projects: projectCount,
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    throw error;
  }
}
