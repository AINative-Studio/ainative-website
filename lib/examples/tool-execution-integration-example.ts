/**
 * Tool Execution Integration Example
 *
 * This file demonstrates how to integrate the robust tool execution
 * error handling system into your AI model workflow.
 */

import { toolExecutionService } from '../tool-execution-service';
import { responseValidationMiddleware } from '../response-validation-middleware';
import type { ToolCall, ToolExecutionResult } from '../tool-execution-service';

// Example 1: Basic Tool Execution with Error Handling
async function executeWeatherTool() {
  const toolCall: ToolCall = {
    id: 'call-123',
    name: 'get_weather',
    parameters: { city: 'San Francisco' },
  };

  const result = await toolExecutionService.executeTool(
    toolCall,
    async (call) => {
      // Your tool implementation
      const response = await fetch(
        `https://api.weather.com/v1/weather?city=${call.parameters.city}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      return await response.json();
    },
    {
      timeout: 5000,
      retry: true,
      maxRetries: 3,
      fallback: {
        temperature: null,
        conditions: 'unavailable',
      },
    }
  );

  // Always handle the result based on status
  if (result.status === 'success') {
    console.log('Weather data:', result.output);
    return result.output;
  } else {
    console.error('Weather fetch failed:', result.error?.userMessage);
    // Fallback was used
    return result.output;
  }
}

// Example 2: Batch Tool Execution with Validation
async function executeMultipleTools(toolCalls: ToolCall[]) {
  // Execute all tools with error handling
  const results = await toolExecutionService.executeToolBatch(
    toolCalls,
    async (call) => {
      // Route to appropriate tool implementation
      switch (call.name) {
        case 'get_weather':
          return await fetchWeather(call.parameters.city as string);
        case 'search_web':
          return await searchWeb(call.parameters.query as string);
        case 'send_email':
          return await sendEmail(call.parameters);
        default:
          throw new Error(`Unknown tool: ${call.name}`);
      }
    }
  );

  // Validate that results match calls (prevents 400 errors)
  const validation = responseValidationMiddleware.validateToolCallResultMatch(
    toolCalls,
    results
  );

  if (!validation.valid) {
    console.error('Tool execution validation failed:', validation.errors);

    // Use corrected results if available
    if (validation.correctedResults) {
      return validation.correctedResults;
    }
  }

  return results;
}

// Example 3: Model Integration with Full Validation
interface ModelMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolExecutionResult[];
}

async function sendToModel(messages: ModelMessage[]): Promise<ModelMessage> {
  // Validate request before sending to model
  const requestValidation = responseValidationMiddleware.validateRequest({
    messages,
    tools: [
      {
        name: 'get_weather',
        description: 'Get current weather for a city',
        parameters: {
          city: { type: 'string', required: true },
        },
      },
    ],
  });

  if (!requestValidation.valid) {
    throw new Error(`Invalid request: ${requestValidation.errors.join(', ')}`);
  }

  // Send to model (example - replace with actual model API)
  const response = await fetch('https://api.model.com/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const modelResponse = await response.json();

  // Validate response structure
  const responseValidation = responseValidationMiddleware.validateResponse({
    content: modelResponse.content,
    toolCalls: modelResponse.toolCalls,
    toolResults: modelResponse.toolResults,
  });

  if (!responseValidation.valid) {
    console.error('Model response validation failed:', responseValidation.errors);

    // Sanitize response to prevent crashes
    const sanitized = responseValidationMiddleware.sanitizeResponse(modelResponse);
    return sanitized as ModelMessage;
  }

  return modelResponse;
}

// Example 4: Complete Chat Loop with Tool Execution
async function runChatWithTools(userMessage: string) {
  const messages: ModelMessage[] = [
    { role: 'user', content: userMessage },
  ];

  const maxIterations = 5;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    // Send to model
    const modelResponse = await sendToModel(messages);
    messages.push(modelResponse);

    // If model wants to use tools
    if (modelResponse.toolCalls && modelResponse.toolCalls.length > 0) {
      console.log(`Model requested ${modelResponse.toolCalls.length} tool(s)`);

      // Execute tools with error handling
      const toolResults = await executeMultipleTools(modelResponse.toolCalls);

      // Add tool results to messages
      messages.push({
        role: 'assistant',
        content: '',
        toolResults,
      });

      // Continue loop to let model process tool results
      continue;
    }

    // No more tool calls - we have final answer
    return modelResponse.content;
  }

  throw new Error('Max iterations reached');
}

// Example 5: Monitoring and Metrics
function monitorToolHealth() {
  const criticalTools = ['get_weather', 'search_web', 'send_email'];

  setInterval(() => {
    criticalTools.forEach((toolName) => {
      const metrics = toolExecutionService.getToolMetrics(toolName);

      console.log(`Metrics for ${toolName}:`, {
        totalExecutions: metrics.totalExecutions,
        successRate: ((metrics.successCount / metrics.totalExecutions) * 100).toFixed(2) + '%',
        failureRate: (metrics.failureRate * 100).toFixed(2) + '%',
        avgExecutionTime: metrics.avgExecutionTime.toFixed(2) + 'ms',
      });

      // Alert on high failure rates
      if (metrics.failureRate > 0.1) {
        console.error(`HIGH FAILURE RATE for ${toolName}: ${(metrics.failureRate * 100).toFixed(2)}%`);
        // Send alert to ops team
      }

      // Alert on slow execution
      if (metrics.avgExecutionTime > 5000) {
        console.warn(`SLOW EXECUTION for ${toolName}: ${metrics.avgExecutionTime.toFixed(2)}ms`);
        // Send alert to ops team
      }
    });
  }, 60000); // Check every minute
}

// Helper functions (mock implementations)
async function fetchWeather(city: string) {
  const response = await fetch(`https://api.weather.com/v1/weather?city=${city}`);
  return await response.json();
}

async function searchWeb(query: string) {
  const response = await fetch(`https://api.search.com/v1/search?q=${encodeURIComponent(query)}`);
  return await response.json();
}

async function sendEmail(params: Record<string, unknown>) {
  const response = await fetch('https://api.email.com/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return await response.json();
}

// Export examples
export {
  executeWeatherTool,
  executeMultipleTools,
  sendToModel,
  runChatWithTools,
  monitorToolHealth,
};
