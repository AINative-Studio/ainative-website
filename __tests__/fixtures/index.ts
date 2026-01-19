/**
 * Centralized test fixtures for AINative platform
 *
 * This module provides easy access to all test fixtures used across the test suite.
 * Import fixtures from this file to maintain consistency and simplify test setup.
 *
 * @example
 * ```typescript
 * import { createModel, models, benchmarkResults } from '@/__tests__/fixtures';
 *
 * describe('ModelService', () => {
 *   it('should fetch model details', () => {
 *     const model = createModel({ id: 'custom-model' });
 *     // ... test logic
 *   });
 * });
 * ```
 */

// Benchmark fixtures
export * from './benchmarks.fixture';

// Model fixtures
export * from './models.fixture';

// Monitoring fixtures
export * from './monitoring.fixture';

// Repository fixtures
export * from './repositories.fixture';

// Training fixtures
export * from './training.fixture';
