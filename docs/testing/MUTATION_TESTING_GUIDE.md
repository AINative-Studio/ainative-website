# Mutation Testing Guide

## Overview

Mutation testing validates test quality by introducing small code changes (mutations) and verifying that tests catch these changes. This ensures tests actually verify behavior rather than just executing code.

## What is Mutation Testing?

**Code Coverage** measures if code is **executed** by tests.
**Mutation Testing** measures if tests **verify behavior**.

### Example

```typescript
// Original function
function add(a: number, b: number): number {
  return a + b;
}

// Test
expect(add(2, 3)).toBe(5); // ✅ Passes

// Mutant 1: Change + to -
function add(a: number, b: number): number {
  return a - b;
}

// Test
expect(add(2, 3)).toBe(5); // ❌ Fails - Mutant killed!

// Mutant 2: Change + to *
function add(a: number, b: number): number {
  return a * b;
}

// Test
expect(add(2, 3)).toBe(5); // ❌ Fails - Mutant killed!
```

If a mutation causes tests to fail, the mutant is **killed** (good tests).
If a mutation doesn't cause tests to fail, the mutant **survived** (weak tests).

## Mutation Score

```
Mutation Score = (Killed Mutants / Total Mutants) * 100
```

**Target:** >= 80% mutation score

## Mutation Operators

### 1. Arithmetic Operators

| Original | Mutants |
|----------|---------|
| `a + b`  | `a - b`, `a * b`, `a / b` |
| `a - b`  | `a + b`, `a * b`, `a / b` |
| `a * b`  | `a + b`, `a - b`, `a / b` |
| `a / b`  | `a + b`, `a - b`, `a * b` |

### 2. Comparison Operators

| Original | Mutants |
|----------|---------|
| `a < b`  | `a <= b`, `a > b`, `a >= b`, `a == b`, `a != b` |
| `a > b`  | `a >= b`, `a < b`, `a <= b`, `a == b`, `a != b` |
| `a == b` | `a != b`, `a < b`, `a > b` |

### 3. Logical Operators

| Original | Mutants |
|----------|---------|
| `a && b` | `a \|\| b`, `a`, `b` |
| `a \|\| b` | `a && b`, `a`, `b` |
| `!a`     | `a` |

### 4. Boolean Literals

| Original | Mutant |
|----------|--------|
| `true`   | `false` |
| `false`  | `true` |

### 5. Return Values

| Original | Mutants |
|----------|---------|
| `return x` | `return null`, `return 0`, `return ""` |

### 6. Conditional Boundaries

| Original | Mutant |
|----------|--------|
| `x < 10` | `x <= 10` |
| `x > 0`  | `x >= 0` |

## Applying Mutation Testing to Our Code

### slug-generator.ts

**Critical mutations to test:**

```typescript
// Original
slug.replace(/[^a-z0-9]+/g, '-')

// Mutants
slug.replace(/[^a-z0-9]/g, '-')     // Missing +
slug.replace(/[^a-z0-9]+/, '-')     // Missing g flag
slug.replace(/[^a-z0-9-]+/g, '-')   // Different pattern
```

**Tests should catch:**
- Regex pattern changes
- Case transformation removal
- Boundary condition changes (length <= 100 vs < 100)

### thumbnail-generator.ts

**Critical mutations to test:**

```typescript
// Original
if (thumbnailUrl && thumbnailUrl.trim() !== '')

// Mutants
if (thumbnailUrl)                           // Missing trim check
if (thumbnailUrl && thumbnailUrl !== '')    // Missing trim
if (thumbnailUrl || thumbnailUrl.trim() !== '') // && to ||
```

**Tests should catch:**
- Color value changes
- Font size changes
- Boolean logic changes
- String template modifications

### import-validation.test.ts

**Critical mutations to test:**

```typescript
// Original
importPath.startsWith('.')

// Mutants
!importPath.startsWith('.')     // Negation
importPath.startsWith('@')      // Different check
importPath.includes('.')        // Different method
```

**Tests should catch:**
- Path detection logic
- Filter conditions
- Set membership checks

## Manual Mutation Testing Process

1. **Identify Critical Code**: Focus on business logic, edge cases, validation
2. **Apply Mutations**: Manually modify code with mutation operators
3. **Run Tests**: Execute test suite against mutated code
4. **Analyze Results**:
   - ✅ Tests fail → Mutant killed (good tests)
   - ❌ Tests pass → Mutant survived (add tests)
5. **Improve Tests**: Write tests to kill surviving mutants
6. **Document**: Track mutation score over time

## Example: Manual Mutation Testing

### Original Code
```typescript
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0 || slug.length > 100) {
    return false;
  }
  const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return validPattern.test(slug);
}
```

### Mutation 1: Boundary Condition
```typescript
// Mutant: Change > to >=
if (!slug || slug.length === 0 || slug.length >= 100) {
```

**Test to kill this mutant:**
```typescript
it('should return true for slugs at exactly 100 characters', () => {
  const maxSlug = 'a'.repeat(100);
  expect(isValidSlug(maxSlug)).toBe(true);
});

it('should return false for slugs exceeding 100 characters', () => {
  const overMaxSlug = 'a'.repeat(101);
  expect(isValidSlug(overMaxSlug)).toBe(false);
});
```

### Mutation 2: Regex Pattern
```typescript
// Mutant: Allow uppercase
const validPattern = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
```

**Test to kill this mutant:**
```typescript
it('should return false for slugs with uppercase letters', () => {
  expect(isValidSlug('Hello-World')).toBe(false);
});
```

### Mutation 3: Boolean Logic
```typescript
// Mutant: Change || to &&
if (!slug || slug.length === 0 && slug.length > 100) {
```

**Test to kill this mutant:**
```typescript
it('should return false for empty strings', () => {
  expect(isValidSlug('')).toBe(false);
});

it('should return false for very long strings', () => {
  expect(isValidSlug('a'.repeat(101))).toBe(false);
});
```

## Automated Mutation Testing Tools

For JavaScript/TypeScript, use **Stryker Mutator**:

### Installation
```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner
```

### Configuration (stryker.conf.json)
```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "mutate": [
    "lib/**/*.ts",
    "!lib/**/*.test.ts",
    "!lib/**/__tests__/**"
  ],
  "testRunner": "jest",
  "jest": {
    "projectType": "custom",
    "configFile": "jest.config.js"
  },
  "reporters": ["html", "clear-text", "progress"],
  "coverageAnalysis": "perTest",
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 70
  }
}
```

### Run Stryker
```bash
npx stryker run
```

## Best Practices

### 1. Focus on Critical Code
Prioritize mutation testing for:
- Business logic
- Validation functions
- Edge case handling
- Security-sensitive code

### 2. Use Boundary Value Analysis
Test edge cases to kill boundary mutations:
```typescript
// Test both sides of boundary
expect(isValid(99)).toBe(true);
expect(isValid(100)).toBe(true);
expect(isValid(101)).toBe(false);
```

### 3. Test All Branches
Cover both true and false paths:
```typescript
// True branch
expect(hasPrefix('hello', 'he')).toBe(true);

// False branch
expect(hasPrefix('hello', 'wo')).toBe(false);
```

### 4. Verify Exact Values
Use precise assertions:
```typescript
// Good: Kills return value mutants
expect(getValue()).toBe(42);

// Bad: Doesn't kill mutants
expect(getValue()).toBeTruthy();
```

### 5. Test Operator Behavior
```typescript
// Test addition
expect(add(5, 3)).toBe(8);

// Ensure it's not subtraction
expect(add(5, 3)).not.toBe(2);
```

## Mutation Testing Workflow

1. **Write Unit Tests** → Achieve high code coverage
2. **Run Mutation Testing** → Identify weak tests
3. **Analyze Surviving Mutants** → Find test gaps
4. **Add Tests** → Kill surviving mutants
5. **Refactor** → Improve code and tests
6. **Repeat** → Iterate until mutation score >= 80%

## Metrics

Track these metrics over time:

| Metric | Target |
|--------|--------|
| Line Coverage | >= 80% |
| Branch Coverage | >= 80% |
| Mutation Score | >= 80% |
| Surviving Mutants | < 20% |

## Integration with CI/CD

Add mutation testing to CI pipeline:

```yaml
# .github/workflows/mutation-testing.yml
name: Mutation Testing

on:
  pull_request:
    branches: [main]

jobs:
  mutation-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:mutation
      - name: Check Mutation Score
        run: |
          SCORE=$(cat reports/mutation/mutation-score.txt)
          if [ $SCORE -lt 80 ]; then
            echo "❌ Mutation score $SCORE% is below threshold (80%)"
            exit 1
          fi
```

## Common Pitfalls

### 1. High Coverage, Low Mutation Score
```typescript
// Bad: High coverage, doesn't verify behavior
it('should process input', () => {
  processInput('test');
  // No assertions!
});

// Good: Verifies behavior
it('should process input correctly', () => {
  const result = processInput('test');
  expect(result).toBe('TEST');
});
```

### 2. Weak Assertions
```typescript
// Bad: Weak assertion
expect(result).toBeTruthy();

// Good: Strong assertion
expect(result).toBe(expectedValue);
```

### 3. Missing Edge Cases
```typescript
// Incomplete
it('should validate input', () => {
  expect(isValid('test')).toBe(true);
});

// Complete: Tests boundaries
it('should validate input', () => {
  expect(isValid('')).toBe(false);
  expect(isValid('a')).toBe(true);
  expect(isValid('a'.repeat(100))).toBe(true);
  expect(isValid('a'.repeat(101))).toBe(false);
});
```

## Summary

Mutation testing complements code coverage by ensuring tests **verify behavior**, not just **execute code**. By systematically applying mutations and analyzing which tests catch them, we build a robust test suite that prevents regressions and validates correctness.

**Remember:**
- Target >= 80% mutation score
- Focus on critical code paths
- Use boundary value analysis
- Test all branches and operators
- Verify exact values, not just truthiness

## References

- [Stryker Mutator Documentation](https://stryker-mutator.io/)
- [Mutation Testing Wikipedia](https://en.wikipedia.org/wiki/Mutation_testing)
- [Effective Mutation Testing Strategies](https://martinfowler.com/articles/practical-test-pyramid.html)
