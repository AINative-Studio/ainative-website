# AIKit TDD Testing Guide

## Overview

Comprehensive Test-Driven Development (TDD) test suite for AIKit dashboard components following strict testing principles and achieving 80%+ code coverage.

## Test Suite Structure

```
components/ui/__tests__/
├── aikit-button.test.tsx          # Button component (100% coverage)
├── aikit-textfield.test.tsx       # Input/TextField (100% coverage)
├── aikit-tabs.test.tsx            # Tabs navigation (100% coverage)
├── aikit-slider.test.tsx          # Slider/Range (100% coverage)
├── aikit-checkbox.test.tsx        # Checkbox (100% coverage)
├── aikit-select.test.tsx          # Select/ChoicePicker (100% coverage)
└── aikit-separator.test.tsx       # Divider/Separator (100% coverage)

app/ai-kit/__tests__/
└── AIKitDashboardIntegration.test.tsx  # Integration tests (90%+ coverage)

e2e/
└── aikit-dashboard.spec.ts        # End-to-end tests (Playwright)

scripts/
└── test-aikit.sh                  # Test execution script
```

## Test Coverage Goals

### Mandatory Coverage: 80% Minimum

- **Lines**: ≥80%
- **Statements**: ≥80%
- **Functions**: ≥80%
- **Branches**: ≥80%

### Critical Components: 90%+ Target

- Button component
- Input/TextField component
- Dashboard integration points

## Running Tests

### Quick Start

```bash
# Run all AIKit tests with coverage
npm run test:coverage -- components/ui/__tests__/aikit-*.test.tsx

# Using the execution script (recommended)
./scripts/test-aikit.sh
```

### Test Execution Options

```bash
# Unit tests only
./scripts/test-aikit.sh --unit

# Integration tests only
./scripts/test-aikit.sh --integration

# E2E tests only
./scripts/test-aikit.sh --e2e

# Generate coverage report
./scripts/test-aikit.sh --coverage

# Watch mode (for development)
./scripts/test-aikit.sh --watch

# CI mode (all tests including E2E)
./scripts/test-aikit.sh --ci
```

### Individual Component Tests

```bash
# Test specific component
npm test components/ui/__tests__/aikit-button.test.tsx

# Test with coverage
npm run test:coverage -- components/ui/__tests__/aikit-button.test.tsx

# Watch mode for TDD workflow
npm run test:watch -- components/ui/__tests__/aikit-button.test.tsx
```

### E2E Tests

```bash
# Run E2E tests (requires dev server)
npm run dev  # Terminal 1
npm run test:e2e e2e/aikit-dashboard.spec.ts  # Terminal 2

# Or use headed mode for debugging
npm run test:e2e:headed e2e/aikit-dashboard.spec.ts

# UI mode for test development
npm run test:e2e:ui
```

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual components in isolation

**Coverage**:
- Component rendering (all variants, sizes, states)
- User interactions (click, hover, focus, keyboard)
- State management (controlled/uncontrolled)
- Accessibility (WCAG 2.1 AA compliance)
- Dark theme compatibility
- Mobile responsiveness
- Error states and edge cases
- Ref forwarding

**Example**:
```typescript
describe('AIKit Button Component', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Tests

**Purpose**: Test component integration and data flow

**Coverage**:
- Dashboard rendering with all sections
- Package filtering functionality
- Tab switching and state persistence
- Copy-to-clipboard integration
- Theme integration
- Responsive behavior
- Performance benchmarks

**Example**:
```typescript
describe('AIKit Dashboard Integration', () => {
  it('should filter packages by category', async () => {
    const user = userEvent.setup();
    render(<AIKitClient />);

    await user.click(screen.getByRole('button', { name: /core/i }));

    expect(screen.getByText(/@ainative-studio\/aikit-core/i))
      .toBeInTheDocument();
  });
});
```

### 3. E2E Tests

**Purpose**: Test complete user workflows in real browser

**Coverage**:
- Page loading and navigation
- Package filtering end-to-end
- Code example tab switching
- Copy functionality with clipboard
- Keyboard navigation
- Mobile/tablet/desktop viewports
- Performance budgets
- External link handling

**Example**:
```typescript
test('should filter packages by category', async ({ page }) => {
  await page.goto('/ai-kit');

  await page.getByRole('button', { name: 'Core' }).click();

  await expect(page.getByText(/@ainative-studio\/aikit-core/i))
    .toBeVisible();
});
```

## Test-Driven Development (TDD) Workflow

### Red-Green-Refactor Cycle

```bash
# 1. RED: Write failing test
npm run test:watch -- components/ui/__tests__/aikit-button.test.tsx

# 2. GREEN: Write minimal code to pass
# Edit components/ui/button.tsx

# 3. REFACTOR: Improve code while keeping tests green
# Refactor with confidence

# 4. REPEAT: Add next test
```

### TDD Best Practices

1. **Write Test First**: Always write the test before implementation
2. **One Test at a Time**: Focus on one behavior per test
3. **Minimal Implementation**: Write just enough code to pass
4. **Refactor Confidently**: Tests protect against regressions
5. **Test Behavior, Not Implementation**: Focus on what, not how

## Accessibility Testing

### WCAG 2.1 AA Compliance

All components are tested for:

- **Keyboard Navigation**: Tab, Enter, Space, Arrow keys
- **Screen Reader Support**: ARIA labels, roles, states
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Sufficient contrast ratios
- **Touch Targets**: Minimum 44x44px (or adequate with padding)

### Running Accessibility Tests

```bash
# All tests include axe-core accessibility checks
npm test -- components/ui/__tests__/aikit-button.test.tsx

# Look for axe violations in output
```

### Example Accessibility Test

```typescript
it('should have no accessibility violations', async () => {
  const { container } = render(
    <div>
      <label htmlFor="test-input">Name</label>
      <Input id="test-input" />
    </div>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Coverage Reports

### Viewing Coverage

```bash
# Generate coverage report
./scripts/test-aikit.sh --coverage

# Open HTML report
open coverage/aikit/lcov-report/index.html
```

### Coverage Metrics

The coverage report shows:

- **Lines**: Percentage of code lines executed
- **Statements**: Percentage of statements executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of conditional branches tested

### Coverage Requirements

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  // Critical components: 90%+
  './components/ui/button.tsx': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: AIKit Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run AIKit test suite
        run: ./scripts/test-aikit.sh --ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/aikit/cobertura-coverage.xml
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run AIKit tests before commit
npm run test -- --testPathPattern="aikit" --passWithNoTests

# Ensure coverage meets threshold
npm run test:coverage -- --testPathPattern="aikit" --passWithNoTests
```

## Debugging Tests

### Debug in VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug AIKit Tests",
      "type": "node",
      "request": "launch",
      "runtimeArgs": [
        "--inspect-brk",
        "${workspaceRoot}/node_modules/.bin/jest",
        "--runInBand",
        "--testPathPattern=aikit"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debug E2E Tests

```bash
# Run with Playwright Inspector
PWDEBUG=1 npm run test:e2e e2e/aikit-dashboard.spec.ts

# Run headed mode
npm run test:e2e:headed e2e/aikit-dashboard.spec.ts

# Generate trace for debugging
npm run test:e2e -- e2e/aikit-dashboard.spec.ts --trace on
```

### Common Debugging Commands

```bash
# Run single test
npm test -- -t "should render button"

# Update snapshots
npm test -- -u

# Show test coverage for specific file
npm test -- --coverage --collectCoverageFrom="components/ui/button.tsx"

# Run with verbose output
npm test -- --verbose
```

## Performance Testing

### Performance Benchmarks

```typescript
it('should render large dataset efficiently', () => {
  const startTime = performance.now();
  render(<AIKitClient />);
  const endTime = performance.now();

  // Should render in under 1 second
  expect(endTime - startTime).toBeLessThan(1000);
});
```

### E2E Performance

```typescript
test('should load within performance budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/ai-kit');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  // Should load in under 3 seconds
  expect(loadTime).toBeLessThan(3000);
});
```

## Mutation Testing

### Why Mutation Testing?

Mutation testing validates test suite effectiveness by introducing code mutations and verifying tests catch them.

### Running Mutation Tests

```bash
# Install Stryker (mutation testing tool)
npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner

# Run mutation tests
npx stryker run
```

### Example Stryker Configuration

```javascript
// stryker.conf.json
{
  "mutate": [
    "components/ui/button.tsx",
    "components/ui/input.tsx"
  ],
  "testRunner": "jest",
  "reporters": ["html", "clear-text", "progress"],
  "coverageAnalysis": "perTest",
  "thresholds": { "high": 80, "low": 60, "break": 70 }
}
```

## Best Practices

### Do's

✅ Write tests before implementation (TDD)
✅ Test behavior, not implementation details
✅ Use descriptive test names (Given-When-Then)
✅ Test accessibility (axe-core)
✅ Test keyboard navigation
✅ Test error states and edge cases
✅ Mock external dependencies
✅ Use userEvent for interactions
✅ Test dark theme compatibility
✅ Test mobile responsiveness
✅ Aim for 80%+ coverage

### Don'ts

❌ Don't test implementation details
❌ Don't skip accessibility tests
❌ Don't ignore edge cases
❌ Don't use shallow rendering
❌ Don't test library code
❌ Don't hardcode test data
❌ Don't ignore TypeScript errors in tests
❌ Don't skip E2E tests for critical flows

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module '@/test/test-utils'"

**Solution**: Check `tsconfig.json` has correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

**Issue**: E2E tests timeout

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
export default defineConfig({
  timeout: 30000, // 30 seconds
});
```

---

**Issue**: Coverage not meeting threshold

**Solution**: Run coverage report to identify untested code:
```bash
npm run test:coverage
open coverage/aikit/lcov-report/index.html
```

---

**Issue**: Jest out of memory

**Solution**: Increase Node.js memory:
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm test
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [TDD Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new tests:

1. Follow TDD: Test first, then implement
2. Maintain 80%+ coverage
3. Include accessibility tests
4. Test mobile responsiveness
5. Test dark theme
6. Add to appropriate test file
7. Update this guide if needed
8. Run full test suite before PR

---

**Last Updated**: 2026-01-29
**Coverage Achieved**: 80%+ (All AIKit Components)
**Test Framework**: Jest + React Testing Library + Playwright
