# Tool Execution Error Handling

Comprehensive error handling system for tool execution that prevents silent failures, response mismatches, and session hangs.

## Overview

This system was designed to prevent the critical issues found in Gemini CLI:

- **Issue #16984**: Function response parts != function call parts (400 errors)
- **Issue #16982**: Silent tool execution failures - tools return no output
- **Issue #16985**: Sessions hang due to silent dying

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Tool Execution Flow                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────────┐      ┌──────────────┐
│ Model Request│─────▶│ Request Validation│─────▶│ Tool Executor│
└──────────────┘      └──────────────────┘      └──────────────┘
                                                        │
                                                        ▼
                      ┌──────────────────────────────────────────┐
                      │         Tool Execution Service           │
                      │  ┌────────────────────────────────────┐  │
                      │  │ Circuit Breaker Pattern            │  │
                      │  │ - Track failures per tool          │  │
                      │  │ - Open circuit after threshold     │  │
                      │  │ - Auto-reset after cooldown        │  │
                      │  └────────────────────────────────────┘  │
                      │                                          │
                      │  ┌────────────────────────────────────┐  │
                      │  │ Retry Logic                        │  │
                      │  │ - Exponential backoff             │  │
                      │  │ - Retryable vs non-retryable      │  │
                      │  │ - Max retry limit                 │  │
                      │  └────────────────────────────────────┘  │
                      │                                          │
                      │  ┌────────────────────────────────────┐  │
                      │  │ Timeout Handling                   │  │
                      │  │ - Per-tool timeout                 │  │
                      │  │ - Global default timeout           │  │
                      │  │ - Timeout error categorization     │  │
                      │  └────────────────────────────────────┘  │
                      └──────────────────────────────────────────┘
                                        │
                                        ▼
                      ┌──────────────────────────────────┐
                      │   Structured Result (ALWAYS)     │
                      │   - status: success/error/timeout│
                      │   - output or error details      │
                      │   - execution time                │
                      │   - user-friendly message         │
                      └──────────────────────────────────┘
                                        │
                                        ▼
┌──────────────┐      ┌──────────────────┐      ┌──────────────┐
│Model Response│◀─────│Response Validation│◀─────│Tool Results  │
└──────────────┘      └──────────────────┘      └──────────────┘
```

## Key Components

### 1. ToolExecutionService

Core service that wraps all tool executions with comprehensive error handling.

**File**: `lib/tool-execution-service.ts`

**Features**:
- Never returns `null` or `undefined` - always returns structured result
- Automatic retry with exponential backoff
- Circuit breaker pattern for unstable services
- Timeout handling with configurable limits
- Comprehensive metrics tracking
- User-friendly error messages

**Usage**:

```typescript
import { toolExecutionService } from '@/lib/tool-execution-service';

// Execute a single tool
const result = await toolExecutionService.executeTool(
  {
    id: 'call-1',
    name: 'get_weather',
    parameters: { city: 'San Francisco' }
  },
  async (call) => {
    // Your tool implementation
    return await fetchWeather(call.parameters.city);
  },
  {
    timeout: 5000,      // 5 second timeout
    retry: true,        // Enable retry
    maxRetries: 3,      // Max 3 attempts
    exponentialBackoff: true,
    fallback: { temp: null, conditions: 'unavailable' }
  }
);

// Result is always structured
console.log(result);
// {
//   toolName: 'get_weather',
//   callId: 'call-1',
//   status: 'success',
//   output: { temperature: 72, conditions: 'sunny' },
//   executionTime: 125
// }
```

**Batch Execution**:

```typescript
// Execute multiple tools and ensure response count matches
const results = await toolExecutionService.executeToolBatch(
  [
    { id: 'call-1', name: 'tool_a', parameters: {} },
    { id: 'call-2', name: 'tool_b', parameters: {} },
    { id: 'call-3', name: 'tool_c', parameters: {} }
  ],
  async (call) => {
    return await executeToolImplementation(call);
  }
);

// Results array always has same length as input array
// No more "response parts != call parts" errors!
console.log(results.length); // Always 3
```

### 2. ResponseValidationMiddleware

Validates requests and responses to ensure correct structure before sending to model.

**File**: `lib/response-validation-middleware.ts`

**Features**:
- Validates request structure before sending to model
- Validates response structure after receiving from model
- **Critical**: Detects tool call/result count mismatches
- Auto-corrects missing results with error placeholders
- Sanitizes responses to remove incomplete data
- Comprehensive validation logging

**Usage**:

```typescript
import { responseValidationMiddleware } from '@/lib/response-validation-middleware';

// Validate before sending to model
const request = {
  messages: [...],
  tools: [...]
};

const validation = responseValidationMiddleware.validateRequest(request);
if (!validation.valid) {
  console.error('Request validation failed:', validation.errors);
  // Handle errors before sending
}

// Validate response from model
const response = {
  content: '...',
  toolCalls: [...],
  toolResults: [...]
};

const responseValidation = responseValidationMiddleware.validateResponse(response);
if (!responseValidation.valid) {
  console.error('Response validation failed:', responseValidation.errors);
  // This prevents 400 errors when sending back to model
}
```

**Critical Validation**:

```typescript
// Prevent "function response parts != function call parts" errors
const validation = responseValidationMiddleware.validateToolCallResultMatch(
  toolCalls,
  toolResults
);

if (!validation.valid && validation.correctedResults) {
  // Use corrected results that match call count
  toolResults = validation.correctedResults;
}
```

### 3. Error Categorization

All errors are categorized with appropriate codes and retry strategies:

| Error Code | Description | Retryable | User Message |
|-----------|-------------|-----------|--------------|
| `NETWORK_ERROR` | Connection failures | Yes | Service unavailable, try again later |
| `TIMEOUT` | Operation exceeded timeout | Yes | Tool took too long, try again |
| `AUTHENTICATION_ERROR` | Auth failures | No | Check your credentials |
| `VALIDATION_ERROR` | Invalid input | No | Check your parameters |
| `RATE_LIMIT_ERROR` | Rate limiting | Yes | Wait and try again |
| `CIRCUIT_OPEN` | Circuit breaker tripped | No | Service temporarily unavailable |
| `TOOL_EXECUTION_ERROR` | Generic error | Yes | Tool encountered an error |
| `MISSING_RESULT` | Silent failure detected | Yes | Tool failed silently |

### 4. Circuit Breaker Pattern

Protects against cascading failures by temporarily blocking calls to unstable services.

**Configuration**:

```typescript
const service = new ToolExecutionService({
  defaultTimeout: 30000,
  maxRetries: 3,
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 5,    // Open after 5 consecutive failures
  circuitBreakerCooldown: 60000  // Reset after 60 seconds
});
```

**States**:
- **Closed**: Normal operation, all calls go through
- **Open**: Circuit tripped, all calls fail fast
- **Half-Open**: Testing if service recovered

**Per-Tool Tracking**:
Each tool has its own circuit breaker state, so one failing service doesn't affect others.

### 5. Metrics and Monitoring

Track execution metrics for all tools:

```typescript
const metrics = toolExecutionService.getToolMetrics('get_weather');

console.log(metrics);
// {
//   totalExecutions: 100,
//   successCount: 95,
//   errorCount: 5,
//   timeoutCount: 0,
//   avgExecutionTime: 125,
//   failureRate: 0.05
// }
```

Use metrics for:
- Alerting on high failure rates
- Identifying slow tools
- Capacity planning
- SLA monitoring

## Integration Guide

### Step 1: Wrap Your Tool Executor

```typescript
// Before: Direct tool execution (risky!)
async function executeTools(toolCalls) {
  return await Promise.all(
    toolCalls.map(call => myToolImplementation(call))
  );
}

// After: Wrapped with error handling
import { toolExecutionService } from '@/lib/tool-execution-service';

async function executeTools(toolCalls) {
  return await toolExecutionService.executeToolBatch(
    toolCalls,
    async (call) => myToolImplementation(call)
  );
}
```

### Step 2: Add Response Validation

```typescript
import { responseValidationMiddleware } from '@/lib/response-validation-middleware';

async function sendToModel(request) {
  // Validate before sending
  const validation = responseValidationMiddleware.validateRequest(request);
  if (!validation.valid) {
    throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
  }

  const response = await modelApi.generate(request);

  // Validate response
  const responseValidation = responseValidationMiddleware.validateResponse(response);
  if (!responseValidation.valid) {
    console.error('Response validation failed:', responseValidation.errors);
    // Use sanitized version to prevent crashes
    return responseValidationMiddleware.sanitizeResponse(response);
  }

  return response;
}
```

### Step 3: Handle Tool Results

```typescript
async function handleModelToolCalls(toolCalls) {
  // Execute tools with error handling
  const toolResults = await toolExecutionService.executeToolBatch(
    toolCalls,
    async (call) => executeToolImplementation(call)
  );

  // Validate results match calls
  const validation = responseValidationMiddleware.validateToolCallResultMatch(
    toolCalls,
    toolResults
  );

  if (!validation.valid) {
    console.error('Tool call/result mismatch:', validation.errors);

    // Use corrected results if available
    if (validation.correctedResults) {
      return validation.correctedResults;
    }
  }

  return toolResults;
}
```

## Testing

Comprehensive test coverage ensures reliability:

### Test Files

- `lib/__tests__/tool-execution-service.test.ts` - 500+ lines, 30+ test cases
- `lib/__tests__/response-validation-middleware.test.ts` - 400+ lines, 25+ test cases

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Run specific test file
npm test tool-execution-service.test.ts
```

### Coverage Requirements

- Minimum 80% coverage required
- All critical paths must be tested
- Edge cases covered (timeouts, retries, circuit breaker)

## Configuration

### Default Configuration

```typescript
{
  defaultTimeout: 30000,              // 30 seconds
  maxRetries: 3,                      // 3 retry attempts
  enableCircuitBreaker: true,         // Circuit breaker enabled
  circuitBreakerThreshold: 5,         // Open after 5 failures
  circuitBreakerCooldown: 60000       // Reset after 60 seconds
}
```

### Custom Configuration

```typescript
import { ToolExecutionService } from '@/lib/tool-execution-service';

const customService = new ToolExecutionService({
  defaultTimeout: 10000,              // 10 second timeout
  maxRetries: 5,                      // More retries
  enableCircuitBreaker: true,
  circuitBreakerThreshold: 10,        // More tolerant
  circuitBreakerCooldown: 30000       // Faster recovery
});
```

### Per-Tool Configuration

```typescript
// Override defaults per tool
const result = await toolExecutionService.executeTool(
  toolCall,
  executor,
  {
    timeout: 60000,          // 60 second timeout for this tool
    maxRetries: 1,           // Only retry once
    exponentialBackoff: false,
    fallback: defaultValue
  }
);
```

## Best Practices

### 1. Always Use Structured Results

```typescript
// Good: Always check status
const result = await toolExecutionService.executeTool(...);
if (result.status === 'success') {
  useData(result.output);
} else {
  showError(result.error.userMessage);
}

// Bad: Assuming success
const result = await toolExecutionService.executeTool(...);
useData(result.output); // Could be undefined!
```

### 2. Provide User-Friendly Fallbacks

```typescript
const result = await toolExecutionService.executeTool(
  toolCall,
  executor,
  {
    fallback: {
      // Provide sensible defaults
      temperature: null,
      conditions: 'unavailable'
    }
  }
);

// Always has output, even on error
console.log(result.output);
```

### 3. Monitor Metrics

```typescript
// Set up monitoring
setInterval(() => {
  const metrics = toolExecutionService.getToolMetrics('critical_tool');

  if (metrics.failureRate > 0.1) {
    alertOps('High failure rate for critical_tool');
  }

  if (metrics.avgExecutionTime > 5000) {
    alertOps('Slow execution for critical_tool');
  }
}, 60000); // Check every minute
```

### 4. Validate Before Sending to Model

```typescript
// Always validate before API calls
const validation = responseValidationMiddleware.validateResponse(response);

if (!validation.valid) {
  // Log for debugging
  console.error('Validation failed:', validation.errors);

  // Prevent 400 errors by sanitizing
  response = responseValidationMiddleware.sanitizeResponse(response);
}

await modelApi.send(response);
```

### 5. Handle Circuit Breaker States

```typescript
const result = await toolExecutionService.executeTool(...);

if (result.error?.code === 'CIRCUIT_OPEN') {
  // Circuit breaker is open - service is down
  // Use cached data or show degraded experience
  return getCachedData();
}
```

## Troubleshooting

### "Tool response parts != call parts" Error

**Cause**: Response count doesn't match call count

**Solution**:
```typescript
// Use validation to detect and correct
const validation = responseValidationMiddleware.validateToolCallResultMatch(
  toolCalls,
  toolResults
);

if (!validation.valid && validation.correctedResults) {
  toolResults = validation.correctedResults; // Use corrected version
}
```

### Silent Tool Failures

**Cause**: Tool returns `undefined` or throws without handling

**Solution**:
```typescript
// ToolExecutionService prevents this automatically
const result = await toolExecutionService.executeTool(...);
// result is always defined with status field
```

### Session Hangs

**Cause**: Tool never completes, no timeout

**Solution**:
```typescript
// Always set timeout
const result = await toolExecutionService.executeTool(
  toolCall,
  executor,
  { timeout: 30000 } // Will timeout after 30 seconds
);

if (result.status === 'timeout') {
  handleTimeout();
}
```

### High Failure Rates

**Cause**: Service is unstable or network issues

**Solution**:
```typescript
// Circuit breaker will automatically protect
// Check metrics to diagnose
const metrics = toolExecutionService.getToolMetrics('failing_tool');
console.log('Failure rate:', metrics.failureRate);
console.log('Avg execution time:', metrics.avgExecutionTime);

// Manually reset circuit breaker if needed
toolExecutionService.resetCircuitBreaker('failing_tool');
```

## API Reference

See inline documentation in:
- `/Users/aideveloper/ainative-website-nextjs-staging/lib/tool-execution-service.ts`
- `/Users/aideveloper/ainative-website-nextjs-staging/lib/response-validation-middleware.ts`

## Related Issues

This implementation addresses the following Gemini CLI issues:

- **#16984**: Function response parts != function call parts causing 400 errors
  - Solved by: ResponseValidationMiddleware with auto-correction
- **#16982**: Silent tool execution failures
  - Solved by: Always returning structured results, never undefined
- **#16985**: Sessions hanging due to silent dying
  - Solved by: Timeout handling and circuit breaker pattern

## Monitoring and Alerts

### Recommended Metrics

Monitor these metrics in production:

1. **Tool execution success rate** (target: >95%)
2. **Average execution time** (target: <5s)
3. **Circuit breaker trips** (alert on any trip)
4. **Response validation failures** (alert on any failure)
5. **Timeout rate** (target: <1%)

### Example Alert Configuration

```typescript
// Set up alerts
const ALERT_THRESHOLDS = {
  failureRate: 0.05,      // 5%
  avgExecutionTime: 5000, // 5 seconds
  timeoutRate: 0.01       // 1%
};

function checkToolHealth(toolName: string) {
  const metrics = toolExecutionService.getToolMetrics(toolName);

  if (metrics.failureRate > ALERT_THRESHOLDS.failureRate) {
    alertOps(`High failure rate for ${toolName}: ${metrics.failureRate * 100}%`);
  }

  if (metrics.avgExecutionTime > ALERT_THRESHOLDS.avgExecutionTime) {
    alertOps(`Slow execution for ${toolName}: ${metrics.avgExecutionTime}ms`);
  }

  const timeoutRate = metrics.timeoutCount / metrics.totalExecutions;
  if (timeoutRate > ALERT_THRESHOLDS.timeoutRate) {
    alertOps(`High timeout rate for ${toolName}: ${timeoutRate * 100}%`);
  }
}
```

## License

Internal use only - AINative Studio
