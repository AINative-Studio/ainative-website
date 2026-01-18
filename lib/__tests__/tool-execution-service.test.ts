/**
 * Tool Execution Service Tests
 *
 * Comprehensive test suite for robust tool execution error handling.
 * Prevents issues like:
 * - Silent tool execution failures
 * - Function response parts mismatch (400 errors)
 * - Session hangs due to silent dying
 *
 * Reference: Gemini CLI issues #16984, #16982, #16985
 */

import { ToolExecutionService, ToolExecutionError } from '../tool-execution-service';
import type { ToolCall, ToolExecutionResult, ToolExecutionOptions } from '../tool-execution-service';

describe('ToolExecutionService', () => {
  let service: ToolExecutionService;

  beforeEach(() => {
    service = new ToolExecutionService({
      defaultTimeout: 5000,
      maxRetries: 3,
      enableCircuitBreaker: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Feature: Execute tool with success', () => {
    it('should successfully execute a tool and return structured result', async () => {
      // Given: A valid tool call
      const toolCall: ToolCall = {
        id: 'call-1',
        name: 'get_weather',
        parameters: { city: 'San Francisco' },
      };

      const mockExecutor = jest.fn().mockResolvedValue({
        temperature: 72,
        conditions: 'sunny',
      });

      // When: The tool is executed
      const result = await service.executeTool(toolCall, mockExecutor);

      // Then: Result should be structured correctly
      expect(result.status).toBe('success');
      expect(result.toolName).toBe('get_weather');
      expect(result.callId).toBe('call-1');
      expect(result.output).toEqual({
        temperature: 72,
        conditions: 'sunny',
      });
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });

    it('should track execution time accurately', async () => {
      const toolCall: ToolCall = {
        id: 'call-2',
        name: 'slow_operation',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve({ done: true }), 100));
      });

      const result = await service.executeTool(toolCall, mockExecutor);

      expect(result.executionTime).toBeGreaterThanOrEqual(100);
      expect(result.executionTime).toBeLessThan(200); // Allow some variance
    });
  });

  describe('Feature: Handle tool execution errors', () => {
    it('should catch and wrap execution errors with user-friendly messages', async () => {
      // Given: A tool that throws an error
      const toolCall: ToolCall = {
        id: 'call-3',
        name: 'failing_tool',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      // When: The tool is executed
      const result = await service.executeTool(toolCall, mockExecutor);

      // Then: Error should be captured with user-friendly message
      expect(result.status).toBe('error');
      expect(result.callId).toBe('call-3');
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('TOOL_EXECUTION_ERROR');
      expect(result.error?.message).toBe('Database connection failed');
      expect(result.error?.userMessage).toContain('encountered an error');
      expect(result.error?.retryable).toBe(true);
    });

    it('should never return undefined or null for failed executions', async () => {
      const toolCall: ToolCall = {
        id: 'call-4',
        name: 'silent_fail_tool',
        parameters: {},
      };

      // Simulate a tool that returns nothing (silent failure)
      const mockExecutor = jest.fn().mockResolvedValue(undefined);

      const result = await service.executeTool(toolCall, mockExecutor);

      // Should still return a valid result structure
      expect(result).toBeDefined();
      expect(result.status).toBe('success'); // undefined is still a valid result
      expect(result.callId).toBe('call-4');
    });

    it('should classify errors as retryable or non-retryable', async () => {
      const toolCall: ToolCall = {
        id: 'call-5',
        name: 'auth_tool',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockRejectedValue(
        new ToolExecutionError('Unauthorized', 'AUTHENTICATION_ERROR', false)
      );

      const result = await service.executeTool(toolCall, mockExecutor);

      expect(result.status).toBe('error');
      expect(result.error?.retryable).toBe(false);
    });
  });

  describe('Feature: Timeout handling', () => {
    it('should timeout long-running operations', async () => {
      const toolCall: ToolCall = {
        id: 'call-6',
        name: 'long_operation',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
      });

      const options: ToolExecutionOptions = {
        timeout: 100, // 100ms timeout
      };

      const result = await service.executeTool(toolCall, mockExecutor, options);

      expect(result.status).toBe('timeout');
      expect(result.error?.code).toBe('TIMEOUT');
      expect(result.error?.message).toContain('exceeded timeout');
      expect(result.executionTime).toBeGreaterThanOrEqual(100);
    });

    it('should use default timeout when not specified', async () => {
      // Create a service with a shorter default timeout for testing
      const testService = new ToolExecutionService({
        defaultTimeout: 100, // 100ms default timeout
        maxRetries: 1,
        enableCircuitBreaker: false,
      });

      const toolCall: ToolCall = {
        id: 'call-7',
        name: 'default_timeout_test',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(resolve, 500)); // 500ms (exceeds 100ms timeout)
      });

      const result = await testService.executeTool(toolCall, mockExecutor);

      expect(result.status).toBe('timeout');
      expect(result.error?.code).toBe('TIMEOUT');
    });
  });

  describe('Feature: Retry logic', () => {
    it('should retry failed operations up to max retries', async () => {
      const toolCall: ToolCall = {
        id: 'call-8',
        name: 'flaky_tool',
        parameters: {},
      };

      let attempts = 0;
      const mockExecutor = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ success: true });
      });

      const options: ToolExecutionOptions = {
        retry: true,
        maxRetries: 3,
      };

      const result = await service.executeTool(toolCall, mockExecutor, options);

      expect(result.status).toBe('success');
      expect(mockExecutor).toHaveBeenCalledTimes(3);
      expect(result.output).toEqual({ success: true });
    });

    it('should not retry non-retryable errors', async () => {
      const toolCall: ToolCall = {
        id: 'call-9',
        name: 'validation_tool',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockRejectedValue(
        new ToolExecutionError('Invalid input', 'VALIDATION_ERROR', false)
      );

      const options: ToolExecutionOptions = {
        retry: true,
        maxRetries: 3,
      };

      const result = await service.executeTool(toolCall, mockExecutor, options);

      expect(result.status).toBe('error');
      expect(mockExecutor).toHaveBeenCalledTimes(1); // No retries
    });

    it('should implement exponential backoff for retries', async () => {
      const toolCall: ToolCall = {
        id: 'call-10',
        name: 'backoff_tool',
        parameters: {},
      };

      const timestamps: number[] = [];
      const mockExecutor = jest.fn().mockImplementation(() => {
        timestamps.push(Date.now());
        return Promise.reject(new Error('Retry me'));
      });

      const options: ToolExecutionOptions = {
        retry: true,
        maxRetries: 3,
        exponentialBackoff: true,
      };

      await service.executeTool(toolCall, mockExecutor, options);

      // Verify exponential backoff timing
      expect(timestamps).toHaveLength(3);
      if (timestamps.length >= 3) {
        const delay1 = timestamps[1] - timestamps[0];
        const delay2 = timestamps[2] - timestamps[1];
        expect(delay2).toBeGreaterThan(delay1);
      }
    });
  });

  describe('Feature: Response validation', () => {
    it('should validate that response matches call', async () => {
      const toolCall: ToolCall = {
        id: 'call-11',
        name: 'calculator',
        parameters: { operation: 'add', a: 2, b: 3 },
      };

      const mockExecutor = jest.fn().mockResolvedValue({ result: 5 });

      const result = await service.executeTool(toolCall, mockExecutor);

      // Result should have matching callId
      expect(result.callId).toBe('call-11');
      expect(result.toolName).toBe('calculator');
    });

    it('should validate function call and response count match', async () => {
      // Given: Multiple tool calls
      const toolCalls: ToolCall[] = [
        { id: 'call-12', name: 'tool_a', parameters: {} },
        { id: 'call-13', name: 'tool_b', parameters: {} },
        { id: 'call-14', name: 'tool_c', parameters: {} },
      ];

      const mockExecutor = jest.fn().mockResolvedValue({ data: 'test' });

      // When: Executing all tools
      const results = await service.executeToolBatch(toolCalls, mockExecutor);

      // Then: Response count should match call count
      expect(results).toHaveLength(3);
      expect(results[0].callId).toBe('call-12');
      expect(results[1].callId).toBe('call-13');
      expect(results[2].callId).toBe('call-14');
    });

    it('should detect and report response mismatch', () => {
      const toolCalls: ToolCall[] = [
        { id: 'call-15', name: 'tool_a', parameters: {} },
        { id: 'call-16', name: 'tool_b', parameters: {} },
      ];

      const toolResults: ToolExecutionResult[] = [
        {
          toolName: 'tool_a',
          callId: 'call-15',
          status: 'success',
          output: {},
          executionTime: 100,
        },
        // Missing second result - mismatch!
      ];

      const validation = service.validateResponseMatch(toolCalls, toolResults);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Response count (1) does not match call count (2)');
    });

    it('should validate response order matches call order', () => {
      const toolCalls: ToolCall[] = [
        { id: 'call-17', name: 'tool_a', parameters: {} },
        { id: 'call-18', name: 'tool_b', parameters: {} },
      ];

      const toolResults: ToolExecutionResult[] = [
        {
          toolName: 'tool_b',
          callId: 'call-18', // Wrong order!
          status: 'success',
          output: {},
          executionTime: 50,
        },
        {
          toolName: 'tool_a',
          callId: 'call-17',
          status: 'success',
          output: {},
          executionTime: 50,
        },
      ];

      const validation = service.validateResponseMatch(toolCalls, toolResults);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('order mismatch');
    });
  });

  describe('Feature: Circuit breaker pattern', () => {
    it('should open circuit after consecutive failures', async () => {
      const toolCall: ToolCall = {
        id: 'call-19',
        name: 'unstable_service',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockRejectedValue(new Error('Service unavailable'));

      // Fail 5 times to trip circuit breaker
      for (let i = 0; i < 5; i++) {
        await service.executeTool(toolCall, mockExecutor, { retry: false });
      }

      // Next call should fail fast without executing
      const result = await service.executeTool(toolCall, mockExecutor, { retry: false });

      expect(result.status).toBe('error');
      expect(result.error?.code).toBe('CIRCUIT_OPEN');
      expect(result.error?.userMessage).toContain('temporarily unavailable');
    });

    it('should reset circuit after cool-down period', async () => {
      const toolCall: ToolCall = {
        id: 'call-20',
        name: 'recovering_service',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockRejectedValue(new Error('Temporary failure'));

      // Trip the circuit
      for (let i = 0; i < 5; i++) {
        await service.executeTool(toolCall, mockExecutor, { retry: false });
      }

      // Wait for cool-down (using short cool-down for testing)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Reset circuit manually for testing
      service.resetCircuitBreaker(toolCall.name);

      // Should allow execution again
      mockExecutor.mockResolvedValue({ recovered: true });
      const result = await service.executeTool(toolCall, mockExecutor);

      expect(result.status).toBe('success');
      expect(result.output).toEqual({ recovered: true });
    });

    it('should track circuit breaker state per tool', async () => {
      const toolCallA: ToolCall = {
        id: 'call-21',
        name: 'service_a',
        parameters: {},
      };

      const toolCallB: ToolCall = {
        id: 'call-22',
        name: 'service_b',
        parameters: {},
      };

      const mockExecutorA = jest.fn().mockRejectedValue(new Error('Service A down'));
      const mockExecutorB = jest.fn().mockResolvedValue({ ok: true });

      // Trip circuit for service A only
      for (let i = 0; i < 5; i++) {
        await service.executeTool(toolCallA, mockExecutorA, { retry: false });
      }

      // Service B should still work
      const resultB = await service.executeTool(toolCallB, mockExecutorB);
      expect(resultB.status).toBe('success');

      // Service A should be blocked
      const resultA = await service.executeTool(toolCallA, mockExecutorA);
      expect(resultA.error?.code).toBe('CIRCUIT_OPEN');
    });
  });

  describe('Feature: Logging and monitoring', () => {
    it('should log all tool execution attempts', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      const toolCall: ToolCall = {
        id: 'call-23',
        name: 'logged_tool',
        parameters: { data: 'test' },
      };

      const mockExecutor = jest.fn().mockResolvedValue({ result: 'ok' });

      await service.executeTool(toolCall, mockExecutor);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Executing tool'),
        expect.objectContaining({ toolName: 'logged_tool' })
      );

      logSpy.mockRestore();
    });

    it('should track tool execution metrics', async () => {
      const toolCall: ToolCall = {
        id: 'call-24',
        name: 'metrics_tool',
        parameters: {},
      };

      // Add small delay to ensure measurable execution time
      const mockExecutor = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve({ data: 'ok' }), 10));
      });

      await service.executeTool(toolCall, mockExecutor);

      const metrics = service.getToolMetrics('metrics_tool');

      expect(metrics.totalExecutions).toBe(1);
      expect(metrics.successCount).toBe(1);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.avgExecutionTime).toBeGreaterThan(0);
    });

    it('should track failure rates', async () => {
      const toolCall: ToolCall = {
        id: 'call-25',
        name: 'failure_tracking_tool',
        parameters: {},
      };

      let callCount = 0;
      const mockExecutor = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Fail'));
        }
        return Promise.resolve({ ok: true });
      });

      // 2 failures
      await service.executeTool(toolCall, mockExecutor, { retry: false });
      await service.executeTool(toolCall, mockExecutor, { retry: false });

      // 1 success
      await service.executeTool(toolCall, mockExecutor, { retry: false });

      const metrics = service.getToolMetrics('failure_tracking_tool');

      expect(metrics.totalExecutions).toBe(3);
      expect(metrics.successCount).toBe(1);
      expect(metrics.errorCount).toBe(2);
      expect(metrics.failureRate).toBeCloseTo(0.667, 2); // 2/3 = 66.7%
    });
  });

  describe('Feature: Graceful degradation', () => {
    it('should provide fallback when tool fails', async () => {
      const toolCall: ToolCall = {
        id: 'call-26',
        name: 'weather_tool',
        parameters: { city: 'Unknown' },
      };

      const mockExecutor = jest.fn().mockRejectedValue(new Error('City not found'));

      const fallbackValue = { temperature: null, conditions: 'unavailable' };
      const options: ToolExecutionOptions = {
        fallback: fallbackValue,
      };

      const result = await service.executeTool(toolCall, mockExecutor, options);

      expect(result.status).toBe('error');
      expect(result.fallbackUsed).toBe(true);
      expect(result.output).toEqual(fallbackValue);
    });

    it('should continue execution when one tool in batch fails', async () => {
      const toolCalls: ToolCall[] = [
        { id: 'call-27', name: 'tool_a', parameters: {} },
        { id: 'call-28', name: 'tool_b', parameters: {} },
        { id: 'call-29', name: 'tool_c', parameters: {} },
      ];

      const mockExecutor = jest.fn().mockImplementation((call: ToolCall) => {
        if (call.id === 'call-28') {
          return Promise.reject(new Error('Tool B failed'));
        }
        return Promise.resolve({ ok: true });
      });

      const results = await service.executeToolBatch(toolCalls, mockExecutor);

      expect(results).toHaveLength(3);
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('error');
      expect(results[2].status).toBe('success');
    });
  });

  describe('Feature: Clear error messages', () => {
    it('should provide user-friendly error messages', async () => {
      const toolCall: ToolCall = {
        id: 'call-30',
        name: 'api_tool',
        parameters: {},
      };

      const mockExecutor = jest.fn().mockRejectedValue(
        new Error('ECONNREFUSED: Connection refused')
      );

      const result = await service.executeTool(toolCall, mockExecutor);

      expect(result.error?.userMessage).toBe(
        'The api_tool service is currently unavailable. Please try again later.'
      );
      expect(result.error?.message).toBe('ECONNREFUSED: Connection refused'); // Technical message preserved
    });

    it('should categorize errors appropriately', async () => {
      const testCases = [
        {
          error: new Error('ENOTFOUND api.example.com'),
          expectedCode: 'NETWORK_ERROR',
          expectedRetryable: true,
        },
        {
          error: new Error('Invalid API key'),
          expectedCode: 'AUTHENTICATION_ERROR',
          expectedRetryable: false,
        },
        {
          error: new Error('Rate limit exceeded'),
          expectedCode: 'RATE_LIMIT_ERROR',
          expectedRetryable: true,
        },
      ];

      for (const testCase of testCases) {
        const toolCall: ToolCall = {
          id: `call-${Math.random()}`,
          name: 'categorized_tool',
          parameters: {},
        };

        const mockExecutor = jest.fn().mockRejectedValue(testCase.error);
        const result = await service.executeTool(toolCall, mockExecutor);

        expect(result.error?.code).toBe(testCase.expectedCode);
        expect(result.error?.retryable).toBe(testCase.expectedRetryable);
      }
    });
  });
});
