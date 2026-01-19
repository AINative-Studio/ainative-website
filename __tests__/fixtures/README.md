# Test Fixtures

Centralized test fixtures for the AINative platform. These fixtures provide consistent, reusable test data across the entire test suite.

## Overview

Test fixtures are pre-defined data structures that represent common entities in the AINative platform. They ensure consistency across tests, reduce code duplication, and make tests more maintainable.

## Available Fixtures

### 1. Benchmarks (`benchmarks.fixture.ts`)

Fixtures for testing benchmark-related functionality.

**Example:**
```typescript
import { createBenchmarkResult, benchmarkResults } from '@/__tests__/fixtures';

it('should display benchmark results', () => {
  const result = createBenchmarkResult({
    modelName: 'Custom Model',
    score: 98.5
  });
  expect(result.modelName).toBe('Custom Model');
});
```

### 2. Models (`models.fixture.ts`)

Fixtures for AI model data.

**Example:**
```typescript
import { createModel, models, activeModels } from '@/__tests__/fixtures';

it('should filter active models', () => {
  const model = createModel({ status: 'active' });
  expect(activeModels.length).toBeGreaterThan(0);
});
```

### 3. Monitoring (`monitoring.fixture.ts`)

Fixtures for observability and monitoring.

**Example:**
```typescript
import { createAlert, activeAlerts } from '@/__tests__/fixtures';

it('should display active alerts', () => {
  const alert = createAlert({ severity: 'high' });
  expect(activeAlerts.length).toBeGreaterThan(0);
});
```

### 4. Repositories (`repositories.fixture.ts`)

Fixtures for Git repository data.

**Example:**
```typescript
import { createGitRepository, pullRequestsByState } from '@/__tests__/fixtures';

it('should list open pull requests', () => {
  const repo = createGitRepository({ name: 'my-repo' });
  expect(pullRequestsByState.open.length).toBeGreaterThan(0);
});
```

### 5. Training (`training.fixture.ts`)

Fixtures for AI model training.

**Example:**
```typescript
import { createTrainingJob, trainingJobsByStatus } from '@/__tests__/fixtures';

it('should track training progress', () => {
  const job = createTrainingJob({ status: 'running', progress: 75 });
  expect(job.progress).toBe(75);
});
```

## Usage Patterns

### Basic Usage

```typescript
import { models, createModel } from '@/__tests__/fixtures';

describe('ModelList', () => {
  it('should render all models', () => {
    render(<ModelList models={models} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(models.length);
  });
});
```

### Customization with Overrides

```typescript
import { createBenchmarkResult } from '@/__tests__/fixtures';

it('should handle high scores', () => {
  const topResult = createBenchmarkResult({
    score: 99.9,
    accuracy: 0.999,
    modelName: 'Premium Model'
  });
  expect(topResult.score).toBe(99.9);
});
```

### Testing Collections

```typescript
import { modelsByProvider, activeModels } from '@/__tests__/fixtures';

it('should group models by provider', () => {
  expect(modelsByProvider.OpenAI).toBeDefined();
  expect(activeModels.length).toBeGreaterThan(0);
});
```

## Best Practices

1. **Use Creator Functions** - Always use factory functions (e.g., `createModel()`) for custom data
2. **Import Selectively** - Import only what you need to keep tests clean
3. **Use Pre-built Collections** - Leverage collections like `models`, `benchmarkResults` for common scenarios
4. **Keep Tests Isolated** - Clone fixtures if tests mutate data

## Adding New Fixtures

When adding new fixtures:

1. Create a new fixture file (e.g., `users.fixture.ts`)
2. Define TypeScript interfaces
3. Create factory functions with sensible defaults
4. Provide collections for common use cases
5. Export from `index.ts`
6. Document in this README

## Migration from Vite

These fixtures have been ported from the original Vite codebase with enhancements:

- Added TypeScript types for better type safety
- Expanded collections for more test scenarios
- Added factory functions for easier customization
- Included edge case fixtures

## Related Documentation

- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Test-Driven Development](../.claude/rules/mandatory-tdd.md)
