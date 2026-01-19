/**
 * Database Utility Functions
 *
 * Provides helper functions for database operations including:
 * - Retry logic for transient failures
 * - Transaction helpers
 * - Error handling
 */

import { prisma } from './prisma';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryableErrors?: string[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'P1001', // Can't reach database server
    'P1008', // Operations timed out
    'P1017', // Server has closed the connection
    'P2024', // Connection pool timeout
  ],
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (error instanceof Error) {
    return retryableErrors.some(
      (code) =>
        error.message.includes(code) ||
        (error as any).code === code
    );
  }
  return false;
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter (±25%)
  const jitter = exponentialDelay * (Math.random() * 0.5 - 0.25);
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Execute a database operation with retry logic
 *
 * @example
 * const user = await withRetry(() => prisma.user.findUnique({ where: { id } }));
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, retryableErrors } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, retryableErrors)) {
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, baseDelay, maxDelay);
      console.warn(
        `Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`,
        error instanceof Error ? error.message : error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Execute multiple operations in a transaction with retry logic
 *
 * @example
 * const result = await withTransaction(async (tx) => {
 *   const user = await tx.user.create({ data: { email: 'test@example.com' } });
 *   const apiKey = await tx.apiKey.create({ data: { userId: user.id, key: '...' } });
 *   return { user, apiKey };
 * });
 */
export async function withTransaction<T>(
  operation: (tx: typeof prisma) => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  return withRetry(
    () => prisma.$transaction(operation, {
      maxWait: 5000, // Maximum time to wait for a transaction slot
      timeout: 10000, // Maximum time the transaction can run
    }),
    config
  );
}

/**
 * Batch insert with chunking to avoid timeout on large datasets
 *
 * @example
 * await batchInsert(
 *   users,
 *   (chunk) => prisma.user.createMany({ data: chunk }),
 *   100
 * );
 */
export async function batchInsert<T>(
  items: T[],
  insertFn: (chunk: T[]) => Promise<any>,
  chunkSize = 100
): Promise<void> {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    await withRetry(() => insertFn(chunk));
  }
}

/**
 * Paginate through large datasets efficiently
 *
 * @example
 * for await (const users of paginate(
 *   (skip, take) => prisma.user.findMany({ skip, take }),
 *   100
 * )) {
 *   // Process users
 * }
 */
export async function* paginate<T>(
  fetchFn: (skip: number, take: number) => Promise<T[]>,
  pageSize = 100
): AsyncGenerator<T[]> {
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const items = await withRetry(() => fetchFn(skip, pageSize));

    if (items.length === 0) {
      hasMore = false;
    } else {
      yield items;
      skip += items.length;

      if (items.length < pageSize) {
        hasMore = false;
      }
    }
  }
}

/**
 * Execute a raw SQL query with retry logic
 *
 * @example
 * const result = await executeRaw`UPDATE users SET last_login = NOW() WHERE id = ${userId}`;
 */
export async function executeRaw(
  query: TemplateStringsArray,
  ...values: any[]
): Promise<number> {
  return withRetry(() => prisma.$executeRaw(query, ...values));
}

/**
 * Query with raw SQL with retry logic
 *
 * @example
 * const users = await queryRaw<User[]>`SELECT * FROM users WHERE role = ${role}`;
 */
export async function queryRaw<T = unknown>(
  query: TemplateStringsArray,
  ...values: any[]
): Promise<T> {
  return withRetry(() => prisma.$queryRaw(query, ...values));
}

/**
 * Soft delete helper
 */
export async function softDelete(
  model: keyof typeof prisma,
  where: any
): Promise<any> {
  const modelClient = prisma[model] as any;
  return withRetry(() =>
    modelClient.updateMany({
      where,
      data: { deletedAt: new Date() },
    })
  );
}

/**
 * Upsert with retry logic
 */
export async function upsertWithRetry<T>(
  model: keyof typeof prisma,
  params: {
    where: any;
    create: any;
    update: any;
  }
): Promise<T> {
  const modelClient = prisma[model] as any;
  return withRetry(() => modelClient.upsert(params));
}
