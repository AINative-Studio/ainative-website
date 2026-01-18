/**
 * Tool Execution Service
 *
 * Robust tool execution error handling service that prevents:
 * - Silent tool execution failures
 * - Function response parts mismatch (400 errors)
 * - Session hangs due to silent dying
 *
 * Features:
 * - Structured error responses (never silent failures)
 * - Automatic retry with exponential backoff
 * - Circuit breaker pattern for unstable services
 * - Response validation (call/response count matching)
 * - Timeout handling
 * - Comprehensive logging and metrics
 * - User-friendly error messages
 *
 * Reference: Gemini CLI issues #16984, #16982, #16985
 */

// Types
export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
}

export interface ToolExecutionResult {
  toolName: string;
  callId: string;
  status: 'success' | 'error' | 'timeout';
  output?: unknown;
  error?: {
    code: string;
    message: string;
    userMessage: string;
    retryable: boolean;
  };
  executionTime: number;
  fallbackUsed?: boolean;
}

export interface ToolExecutionOptions {
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
  exponentialBackoff?: boolean;
  fallback?: unknown;
}

export interface ToolMetrics {
  totalExecutions: number;
  successCount: number;
  errorCount: number;
  timeoutCount: number;
  avgExecutionTime: number;
  failureRate: number;
}

export interface ResponseValidation {
  valid: boolean;
  error?: string;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

interface ServiceConfig {
  defaultTimeout: number;
  maxRetries: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerCooldown?: number;
}

// Custom Error Class
export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

// Tool Execution Service
export class ToolExecutionService {
  private config: ServiceConfig;
  private metrics: Map<string, ToolMetrics>;
  private circuitBreakers: Map<string, CircuitBreakerState>;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_COOLDOWN = 60000; // 60 seconds
  private readonly BASE_RETRY_DELAY = 100; // 100ms

  constructor(config: ServiceConfig) {
    this.config = config;
    this.metrics = new Map();
    this.circuitBreakers = new Map();
  }

  /**
   * Execute a single tool with comprehensive error handling
   */
  async executeTool(
    toolCall: ToolCall,
    executor: (call: ToolCall) => Promise<unknown>,
    options: ToolExecutionOptions = {}
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const timeout = options.timeout || this.config.defaultTimeout;
    const maxRetries = options.maxRetries || this.config.maxRetries;
    const shouldRetry = options.retry !== false;

    // Check circuit breaker
    if (this.config.enableCircuitBreaker && this.isCircuitOpen(toolCall.name)) {
      return this.createErrorResult(
        toolCall,
        new ToolExecutionError(
          'Circuit breaker is open',
          'CIRCUIT_OPEN',
          false
        ),
        Date.now() - startTime
      );
    }

    // Log execution attempt
    this.logExecution(toolCall);

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < (shouldRetry ? maxRetries : 1)) {
      try {
        // Execute with timeout
        const result = await this.executeWithTimeout(toolCall, executor, timeout);

        // Success - record metrics and return
        this.recordSuccess(toolCall.name, Date.now() - startTime);
        this.resetCircuitBreaker(toolCall.name);

        return {
          toolName: toolCall.name,
          callId: toolCall.id,
          status: 'success',
          output: result,
          executionTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        const toolError = this.categorizeError(lastError);

        if (!toolError.retryable || !shouldRetry) {
          break; // Don't retry non-retryable errors
        }

        attempt++;

        // Exponential backoff
        if (attempt < maxRetries && options.exponentialBackoff) {
          const delay = this.BASE_RETRY_DELAY * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted or non-retryable error
    const executionTime = Date.now() - startTime;

    // Record failure and update circuit breaker
    this.recordFailure(toolCall.name, executionTime);

    // Check if we should use fallback
    if (options.fallback !== undefined && lastError) {
      return {
        toolName: toolCall.name,
        callId: toolCall.id,
        status: 'error',
        output: options.fallback,
        error: this.formatError(toolCall.name, lastError),
        executionTime,
        fallbackUsed: true,
      };
    }

    // Return error result
    return this.createErrorResult(toolCall, lastError!, executionTime);
  }

  /**
   * Execute a batch of tools and ensure response count matches call count
   */
  async executeToolBatch(
    toolCalls: ToolCall[],
    executor: (call: ToolCall) => Promise<unknown>,
    options: ToolExecutionOptions = {}
  ): Promise<ToolExecutionResult[]> {
    const results = await Promise.all(
      toolCalls.map(call => this.executeTool(call, executor, options))
    );

    // Validate response count matches call count
    const validation = this.validateResponseMatch(toolCalls, results);
    if (!validation.valid) {
      console.error('Response validation failed:', validation.error);
    }

    return results;
  }

  /**
   * Validate that responses match calls (prevents 400 errors)
   */
  validateResponseMatch(
    toolCalls: ToolCall[],
    toolResults: ToolExecutionResult[]
  ): ResponseValidation {
    // Check count match
    if (toolCalls.length !== toolResults.length) {
      return {
        valid: false,
        error: `Response count (${toolResults.length}) does not match call count (${toolCalls.length})`,
      };
    }

    // Check order match
    for (let i = 0; i < toolCalls.length; i++) {
      if (toolCalls[i].id !== toolResults[i].callId) {
        return {
          valid: false,
          error: `Response order mismatch at index ${i}: expected call ID ${toolCalls[i].id}, got ${toolResults[i].callId}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get metrics for a specific tool
   */
  getToolMetrics(toolName: string): ToolMetrics {
    return this.metrics.get(toolName) || {
      totalExecutions: 0,
      successCount: 0,
      errorCount: 0,
      timeoutCount: 0,
      avgExecutionTime: 0,
      failureRate: 0,
    };
  }

  /**
   * Reset circuit breaker for a tool
   */
  resetCircuitBreaker(toolName: string): void {
    this.circuitBreakers.set(toolName, {
      failures: 0,
      lastFailure: 0,
      state: 'closed',
    });
  }

  // Private helper methods

  private async executeWithTimeout(
    toolCall: ToolCall,
    executor: (call: ToolCall) => Promise<unknown>,
    timeout: number
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new ToolExecutionError(
          `Tool ${toolCall.name} exceeded timeout of ${timeout}ms`,
          'TIMEOUT',
          true
        ));
      }, timeout);

      executor(toolCall)
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private createErrorResult(
    toolCall: ToolCall,
    error: Error,
    executionTime: number
  ): ToolExecutionResult {
    const isTimeout = error instanceof ToolExecutionError && error.code === 'TIMEOUT';

    return {
      toolName: toolCall.name,
      callId: toolCall.id,
      status: isTimeout ? 'timeout' : 'error',
      error: this.formatError(toolCall.name, error),
      executionTime,
    };
  }

  private categorizeError(error: Error): ToolExecutionError {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('enotfound') || message.includes('econnrefused')) {
      return new ToolExecutionError(error.message, 'NETWORK_ERROR', true);
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('api key')) {
      return new ToolExecutionError(error.message, 'AUTHENTICATION_ERROR', false);
    }

    // Rate limiting
    if (message.includes('rate limit')) {
      return new ToolExecutionError(error.message, 'RATE_LIMIT_ERROR', true);
    }

    // Validation errors
    if (message.includes('invalid') || message.includes('validation')) {
      return new ToolExecutionError(error.message, 'VALIDATION_ERROR', false);
    }

    // If already a ToolExecutionError, return it
    if (error instanceof ToolExecutionError) {
      return error;
    }

    // Default: generic error (retryable)
    return new ToolExecutionError(error.message, 'TOOL_EXECUTION_ERROR', true);
  }

  private formatError(toolName: string, error: Error): ToolExecutionResult['error'] {
    const categorizedError = this.categorizeError(error);

    let userMessage: string;

    switch (categorizedError.code) {
      case 'TIMEOUT':
        userMessage = `The ${toolName} tool took too long to respond. Please try again.`;
        break;
      case 'NETWORK_ERROR':
        userMessage = `The ${toolName} service is currently unavailable. Please try again later.`;
        break;
      case 'AUTHENTICATION_ERROR':
        userMessage = `Authentication failed for ${toolName}. Please check your credentials.`;
        break;
      case 'RATE_LIMIT_ERROR':
        userMessage = `Rate limit exceeded for ${toolName}. Please wait a moment and try again.`;
        break;
      case 'VALIDATION_ERROR':
        userMessage = `Invalid input provided to ${toolName}. Please check your parameters.`;
        break;
      case 'CIRCUIT_OPEN':
        userMessage = `The ${toolName} service is temporarily unavailable due to repeated failures. Please try again later.`;
        break;
      default:
        userMessage = `The ${toolName} tool encountered an error. Please try again.`;
    }

    return {
      code: categorizedError.code,
      message: categorizedError.message,
      userMessage,
      retryable: categorizedError.retryable,
    };
  }

  private isCircuitOpen(toolName: string): boolean {
    const breaker = this.circuitBreakers.get(toolName);
    if (!breaker || breaker.state === 'closed') {
      return false;
    }

    const threshold = this.config.circuitBreakerThreshold || this.CIRCUIT_BREAKER_THRESHOLD;
    const cooldown = this.config.circuitBreakerCooldown || this.CIRCUIT_BREAKER_COOLDOWN;

    // Check if we should try half-open
    if (breaker.state === 'open' && Date.now() - breaker.lastFailure > cooldown) {
      breaker.state = 'half-open';
      this.circuitBreakers.set(toolName, breaker);
      return false;
    }

    return breaker.failures >= threshold && breaker.state === 'open';
  }

  private recordSuccess(toolName: string, executionTime: number): void {
    const metrics = this.getToolMetrics(toolName);

    const newMetrics: ToolMetrics = {
      totalExecutions: metrics.totalExecutions + 1,
      successCount: metrics.successCount + 1,
      errorCount: metrics.errorCount,
      timeoutCount: metrics.timeoutCount,
      avgExecutionTime:
        (metrics.avgExecutionTime * metrics.totalExecutions + executionTime) /
        (metrics.totalExecutions + 1),
      failureRate: metrics.errorCount / (metrics.totalExecutions + 1),
    };

    this.metrics.set(toolName, newMetrics);
  }

  private recordFailure(toolName: string, executionTime: number): void {
    const metrics = this.getToolMetrics(toolName);

    const newMetrics: ToolMetrics = {
      totalExecutions: metrics.totalExecutions + 1,
      successCount: metrics.successCount,
      errorCount: metrics.errorCount + 1,
      timeoutCount: metrics.timeoutCount,
      avgExecutionTime:
        (metrics.avgExecutionTime * metrics.totalExecutions + executionTime) /
        (metrics.totalExecutions + 1),
      failureRate: (metrics.errorCount + 1) / (metrics.totalExecutions + 1),
    };

    this.metrics.set(toolName, newMetrics);

    // Update circuit breaker
    if (this.config.enableCircuitBreaker) {
      const breaker = this.circuitBreakers.get(toolName) || {
        failures: 0,
        lastFailure: 0,
        state: 'closed' as const,
      };

      breaker.failures++;
      breaker.lastFailure = Date.now();

      const threshold = this.config.circuitBreakerThreshold || this.CIRCUIT_BREAKER_THRESHOLD;
      if (breaker.failures >= threshold) {
        breaker.state = 'open';
      }

      this.circuitBreakers.set(toolName, breaker);
    }
  }

  private logExecution(toolCall: ToolCall): void {
    console.log('Executing tool', {
      toolName: toolCall.name,
      callId: toolCall.id,
      parameters: toolCall.parameters,
      timestamp: new Date().toISOString(),
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance with default config
export const toolExecutionService = new ToolExecutionService({
  defaultTimeout: 30000, // 30 seconds
  maxRetries: 3,
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,
  circuitBreakerCooldown: 60000, // 60 seconds
});

export default toolExecutionService;
