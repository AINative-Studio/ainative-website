/**
 * Response Validation Middleware
 *
 * Validates model responses before sending to ensure:
 * - Function call count matches function response count
 * - Response structure is valid
 * - No silent failures or missing responses
 *
 * Prevents Gemini CLI issues like:
 * - Issue #16984: Function response parts != function call parts
 * - Issue #16982: Silent tool execution failures
 */

import type { ToolCall, ToolExecutionResult } from './tool-execution-service';

export interface ModelRequest {
  messages: unknown[];
  tools?: ToolDefinition[];
}

export interface ModelResponse {
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolExecutionResult[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ResponseValidationMiddleware {
  /**
   * Validate request before sending to model
   */
  validateRequest(request: ModelRequest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate messages array
    if (!Array.isArray(request.messages) || request.messages.length === 0) {
      errors.push('Request must contain at least one message');
    }

    // Validate tools if present
    if (request.tools) {
      if (!Array.isArray(request.tools)) {
        errors.push('Tools must be an array');
      } else {
        request.tools.forEach((tool, index) => {
          if (!tool.name) {
            errors.push(`Tool at index ${index} missing name`);
          }
          if (!tool.description) {
            warnings.push(`Tool ${tool.name} missing description`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate response before using it
   */
  validateResponse(response: ModelResponse): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required content
    if (typeof response.content !== 'string') {
      errors.push('Response must contain content string');
    }

    // Validate tool calls if present
    if (response.toolCalls) {
      if (!Array.isArray(response.toolCalls)) {
        errors.push('Tool calls must be an array');
      } else {
        response.toolCalls.forEach((call, index) => {
          if (!call.id) {
            errors.push(`Tool call at index ${index} missing id`);
          }
          if (!call.name) {
            errors.push(`Tool call at index ${index} missing name`);
          }
          if (!call.parameters || typeof call.parameters !== 'object') {
            errors.push(`Tool call at index ${index} missing or invalid parameters`);
          }
        });
      }
    }

    // Validate tool results if present
    if (response.toolResults) {
      if (!Array.isArray(response.toolResults)) {
        errors.push('Tool results must be an array');
      } else {
        response.toolResults.forEach((result, index) => {
          if (!result.callId) {
            errors.push(`Tool result at index ${index} missing callId`);
          }
          if (!result.toolName) {
            errors.push(`Tool result at index ${index} missing toolName`);
          }
          if (!result.status) {
            errors.push(`Tool result at index ${index} missing status`);
          }
          if (result.executionTime === undefined) {
            warnings.push(`Tool result at index ${index} missing executionTime`);
          }
        });
      }
    }

    // Critical validation: Tool calls and results must match
    if (response.toolCalls && response.toolResults) {
      const callCount = response.toolCalls.length;
      const resultCount = response.toolResults.length;

      if (callCount !== resultCount) {
        errors.push(
          `Tool call/result count mismatch: ${callCount} calls but ${resultCount} results. ` +
          'This will cause a 400 error when sending to the model.'
        );
      }

      // Validate call IDs match
      for (let i = 0; i < Math.min(callCount, resultCount); i++) {
        if (response.toolCalls[i].id !== response.toolResults[i].callId) {
          errors.push(
            `Tool call/result ID mismatch at index ${i}: ` +
            `call ID "${response.toolCalls[i].id}" != result call ID "${response.toolResults[i].callId}"`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate that tool results match tool calls
   * Returns detailed validation with corrections if possible
   */
  validateToolCallResultMatch(
    toolCalls: ToolCall[],
    toolResults: ToolExecutionResult[]
  ): {
    valid: boolean;
    errors: string[];
    correctedResults?: ToolExecutionResult[];
  } {
    const errors: string[] = [];

    // Check count
    if (toolCalls.length !== toolResults.length) {
      errors.push(
        `Count mismatch: ${toolCalls.length} tool calls but ${toolResults.length} results`
      );

      // Attempt to correct by padding with error results
      if (toolResults.length < toolCalls.length) {
        const correctedResults = [...toolResults];

        for (let i = toolResults.length; i < toolCalls.length; i++) {
          correctedResults.push({
            toolName: toolCalls[i].name,
            callId: toolCalls[i].id,
            status: 'error',
            error: {
              code: 'MISSING_RESULT',
              message: 'Tool execution did not produce a result',
              userMessage: 'The tool execution failed silently. Please try again.',
              retryable: true,
            },
            executionTime: 0,
          });
        }

        return {
          valid: false,
          errors,
          correctedResults,
        };
      }
    }

    // Check order and IDs
    for (let i = 0; i < Math.min(toolCalls.length, toolResults.length); i++) {
      if (toolCalls[i].id !== toolResults[i].callId) {
        errors.push(
          `ID mismatch at index ${i}: expected "${toolCalls[i].id}", got "${toolResults[i].callId}"`
        );
      }

      if (toolCalls[i].name !== toolResults[i].toolName) {
        errors.push(
          `Tool name mismatch at index ${i}: expected "${toolCalls[i].name}", got "${toolResults[i].toolName}"`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize response to remove any problematic data
   */
  sanitizeResponse(response: ModelResponse): ModelResponse {
    // Ensure content is always a string
    const content = typeof response.content === 'string' ? response.content : '';

    // Filter out any incomplete tool calls
    const toolCalls = response.toolCalls?.filter(call =>
      call.id && call.name && call.parameters
    );

    // Filter out any incomplete tool results
    const toolResults = response.toolResults?.filter(result =>
      result.callId && result.toolName && result.status
    );

    return {
      content,
      toolCalls,
      toolResults,
    };
  }

  /**
   * Create error response when validation fails
   */
  createErrorResponse(validationErrors: string[]): ModelResponse {
    return {
      content: 'I encountered an error processing the response. Please try again.',
      toolCalls: undefined,
      toolResults: undefined,
    };
  }

  /**
   * Log validation results
   */
  logValidation(
    type: 'request' | 'response',
    validation: ValidationResult,
    context?: Record<string, unknown>
  ): void {
    if (!validation.valid) {
      console.error(`${type} validation failed:`, {
        errors: validation.errors,
        warnings: validation.warnings,
        context,
        timestamp: new Date().toISOString(),
      });
    } else if (validation.warnings.length > 0) {
      console.warn(`${type} validation warnings:`, {
        warnings: validation.warnings,
        context,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log(`${type} validation passed`, {
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export singleton instance
export const responseValidationMiddleware = new ResponseValidationMiddleware();

export default responseValidationMiddleware;
