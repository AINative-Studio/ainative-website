/**
 * Response Validation Middleware Tests
 */

import { ResponseValidationMiddleware } from '../response-validation-middleware';
import type { ModelRequest, ModelResponse } from '../response-validation-middleware';
import type { ToolCall, ToolExecutionResult } from '../tool-execution-service';

describe('ResponseValidationMiddleware', () => {
  let middleware: ResponseValidationMiddleware;

  beforeEach(() => {
    middleware = new ResponseValidationMiddleware();
  });

  describe('Feature: Request validation', () => {
    it('should validate valid request', () => {
      const request: ModelRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [
          {
            name: 'get_weather',
            description: 'Get weather for a city',
            parameters: { city: { type: 'string' } },
          },
        ],
      };

      const validation = middleware.validateRequest(request);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject request without messages', () => {
      const request: ModelRequest = {
        messages: [],
      };

      const validation = middleware.validateRequest(request);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Request must contain at least one message');
    });

    it('should reject request with invalid tools array', () => {
      const request = {
        messages: [{ role: 'user', content: 'Hello' }],
        tools: 'not an array',
      } as unknown as ModelRequest;

      const validation = middleware.validateRequest(request);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Tools must be an array');
    });

    it('should validate tool definitions', () => {
      const request: ModelRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [
          {
            name: '',
            description: 'Test',
            parameters: {},
          },
        ],
      };

      const validation = middleware.validateRequest(request);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('missing name'))).toBe(true);
    });

    it('should warn about missing tool descriptions', () => {
      const request: ModelRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [
          {
            name: 'test_tool',
            description: '',
            parameters: {},
          },
        ],
      };

      const validation = middleware.validateRequest(request);

      expect(validation.valid).toBe(true); // Warning, not error
      expect(validation.warnings.some(w => w.includes('missing description'))).toBe(true);
    });
  });

  describe('Feature: Response validation', () => {
    it('should validate valid response', () => {
      const response: ModelResponse = {
        content: 'Here is the response',
        toolCalls: [
          {
            id: 'call-1',
            name: 'get_weather',
            parameters: { city: 'SF' },
          },
        ],
        toolResults: [
          {
            toolName: 'get_weather',
            callId: 'call-1',
            status: 'success',
            output: { temp: 72 },
            executionTime: 100,
          },
        ],
      };

      const validation = middleware.validateResponse(response);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject response without content', () => {
      const response = {
        content: null,
      } as unknown as ModelResponse;

      const validation = middleware.validateResponse(response);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Response must contain content string');
    });

    it('should validate tool calls structure', () => {
      const response: ModelResponse = {
        content: 'Test',
        toolCalls: [
          {
            id: '',
            name: 'test',
            parameters: {},
          },
        ],
      };

      const validation = middleware.validateResponse(response);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('missing id'))).toBe(true);
    });

    it('should validate tool results structure', () => {
      const response: ModelResponse = {
        content: 'Test',
        toolResults: [
          {
            toolName: 'test',
            callId: '',
            status: 'success',
            executionTime: 100,
          },
        ],
      };

      const validation = middleware.validateResponse(response);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('missing callId'))).toBe(true);
    });

    it('should detect tool call/result count mismatch', () => {
      const response: ModelResponse = {
        content: 'Test',
        toolCalls: [
          { id: 'call-1', name: 'tool_a', parameters: {} },
          { id: 'call-2', name: 'tool_b', parameters: {} },
        ],
        toolResults: [
          {
            toolName: 'tool_a',
            callId: 'call-1',
            status: 'success',
            executionTime: 50,
          },
        ],
      };

      const validation = middleware.validateResponse(response);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('count mismatch'))).toBe(true);
      expect(validation.errors.some(e => e.includes('400 error'))).toBe(true);
    });

    it('should detect tool call/result ID mismatch', () => {
      const response: ModelResponse = {
        content: 'Test',
        toolCalls: [
          { id: 'call-1', name: 'tool_a', parameters: {} },
        ],
        toolResults: [
          {
            toolName: 'tool_a',
            callId: 'call-2', // Wrong ID
            status: 'success',
            executionTime: 50,
          },
        ],
      };

      const validation = middleware.validateResponse(response);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('ID mismatch'))).toBe(true);
    });
  });

  describe('Feature: Tool call/result matching', () => {
    it('should validate matching tool calls and results', () => {
      const toolCalls: ToolCall[] = [
        { id: 'call-1', name: 'tool_a', parameters: {} },
        { id: 'call-2', name: 'tool_b', parameters: {} },
      ];

      const toolResults: ToolExecutionResult[] = [
        {
          toolName: 'tool_a',
          callId: 'call-1',
          status: 'success',
          executionTime: 50,
        },
        {
          toolName: 'tool_b',
          callId: 'call-2',
          status: 'success',
          executionTime: 75,
        },
      ];

      const validation = middleware.validateToolCallResultMatch(toolCalls, toolResults);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect and correct missing results', () => {
      const toolCalls: ToolCall[] = [
        { id: 'call-1', name: 'tool_a', parameters: {} },
        { id: 'call-2', name: 'tool_b', parameters: {} },
        { id: 'call-3', name: 'tool_c', parameters: {} },
      ];

      const toolResults: ToolExecutionResult[] = [
        {
          toolName: 'tool_a',
          callId: 'call-1',
          status: 'success',
          executionTime: 50,
        },
      ];

      const validation = middleware.validateToolCallResultMatch(toolCalls, toolResults);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Count mismatch'))).toBe(true);
      expect(validation.correctedResults).toBeDefined();
      expect(validation.correctedResults).toHaveLength(3);

      // Check that missing results were added
      expect(validation.correctedResults![1].callId).toBe('call-2');
      expect(validation.correctedResults![1].status).toBe('error');
      expect(validation.correctedResults![1].error?.code).toBe('MISSING_RESULT');

      expect(validation.correctedResults![2].callId).toBe('call-3');
      expect(validation.correctedResults![2].status).toBe('error');
    });

    it('should detect ID mismatch', () => {
      const toolCalls: ToolCall[] = [
        { id: 'call-1', name: 'tool_a', parameters: {} },
      ];

      const toolResults: ToolExecutionResult[] = [
        {
          toolName: 'tool_a',
          callId: 'call-999', // Wrong ID
          status: 'success',
          executionTime: 50,
        },
      ];

      const validation = middleware.validateToolCallResultMatch(toolCalls, toolResults);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('ID mismatch'))).toBe(true);
    });

    it('should detect tool name mismatch', () => {
      const toolCalls: ToolCall[] = [
        { id: 'call-1', name: 'tool_a', parameters: {} },
      ];

      const toolResults: ToolExecutionResult[] = [
        {
          toolName: 'tool_b', // Wrong name
          callId: 'call-1',
          status: 'success',
          executionTime: 50,
        },
      ];

      const validation = middleware.validateToolCallResultMatch(toolCalls, toolResults);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Tool name mismatch'))).toBe(true);
    });
  });

  describe('Feature: Response sanitization', () => {
    it('should sanitize response with non-string content', () => {
      const response = {
        content: null,
      } as unknown as ModelResponse;

      const sanitized = middleware.sanitizeResponse(response);

      expect(sanitized.content).toBe('');
    });

    it('should filter out incomplete tool calls', () => {
      const response: ModelResponse = {
        content: 'Test',
        toolCalls: [
          { id: 'call-1', name: 'tool_a', parameters: {} },
          { id: '', name: 'tool_b', parameters: {} }, // Incomplete
          { id: 'call-3', name: '', parameters: {} }, // Incomplete
        ],
      };

      const sanitized = middleware.sanitizeResponse(response);

      expect(sanitized.toolCalls).toHaveLength(1);
      expect(sanitized.toolCalls![0].id).toBe('call-1');
    });

    it('should filter out incomplete tool results', () => {
      const response: ModelResponse = {
        content: 'Test',
        toolResults: [
          {
            toolName: 'tool_a',
            callId: 'call-1',
            status: 'success',
            executionTime: 50,
          },
          {
            toolName: '',
            callId: 'call-2',
            status: 'success',
            executionTime: 50,
          } as ToolExecutionResult,
        ],
      };

      const sanitized = middleware.sanitizeResponse(response);

      expect(sanitized.toolResults).toHaveLength(1);
      expect(sanitized.toolResults![0].callId).toBe('call-1');
    });
  });

  describe('Feature: Error response creation', () => {
    it('should create error response with clear message', () => {
      const errors = ['Error 1', 'Error 2'];
      const errorResponse = middleware.createErrorResponse(errors);

      expect(errorResponse.content).toContain('error');
      expect(errorResponse.toolCalls).toBeUndefined();
      expect(errorResponse.toolResults).toBeUndefined();
    });
  });

  describe('Feature: Validation logging', () => {
    it('should log validation failures', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const validation = {
        valid: false,
        errors: ['Test error'],
        warnings: [],
      };

      middleware.logValidation('request', validation, { test: true });

      expect(consoleSpy).toHaveBeenCalledWith(
        'request validation failed:',
        expect.objectContaining({
          errors: ['Test error'],
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log validation warnings', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const validation = {
        valid: true,
        errors: [],
        warnings: ['Test warning'],
      };

      middleware.logValidation('response', validation);

      expect(consoleSpy).toHaveBeenCalledWith(
        'response validation warnings:',
        expect.objectContaining({
          warnings: ['Test warning'],
        })
      );

      consoleSpy.mockRestore();
    });

    it('should log successful validation', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const validation = {
        valid: true,
        errors: [],
        warnings: [],
      };

      middleware.logValidation('request', validation);

      expect(consoleSpy).toHaveBeenCalledWith(
        'request validation passed',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });
});
