# E2E Test Execution Guide

Complete guide for running, debugging, and maintaining the AIKit Dashboard E2E test suite.

## Quick Start

```bash
# Install dependencies (one-time setup)
npm install
npx playwright install

# Run all tests
npm run test:e2e

# Run specific test suite
npm run test:e2e:navigation
npm run test:e2e:components
npm run test:e2e:responsive
npm run test:e2e:visual
npm run test:e2e:a11y

# View test report
npm run test:e2e:report
```

## Test Suites Overview

### 1. Dashboard Navigation Tests
**Command**: `npm run test:e2e:navigation`

Tests:
- Tab switching functionality
- URL updates on navigation
- Browser back/forward buttons
- Tab state persistence
- Keyboard navigation (arrow keys)
- Active tab visual indicators
- Rapid tab switching stress test
- Direct page navigation
- Accessible navigation

**Expected Duration**: 2-3 minutes
**Critical For**: Navigation UX, URL routing

### 2. Component Interaction Tests
**Command**: `npm run test:e2e:components`

Tests:
- AIKitButton clicks, hovers, disabled states
- AIKitTextField input, validation, focus
- AIKitSlider value changes, keyboard control
- AIKitCheckBox toggle, indeterminate state
- AIKitChoicePicker selection, keyboard nav

**Expected Duration**: 3-4 minutes
**Critical For**: User interactions, form functionality

### 3. Responsive Design Tests
**Command**: `npm run test:e2e:responsive`

Tests:
- Mobile viewport (375px) layout
- Tablet viewport (768px) layout
- Desktop viewport (1920px) layout
- Touch target sizes
- Horizontal overflow prevention
- Element stacking on mobile
- Multi-column layouts on desktop
- Cross-viewport consistency
- Layout stability during resize

**Expected Duration**: 4-5 minutes
**Critical For**: Mobile UX, responsive design

### 4. Visual Testing
**Command**: `npm run test:e2e:visual`

Tests:
- Screenshot capture for all tabs
- Component state screenshots
- Loading/error state capture
- Dark mode toggle
- Dark mode style consistency
- Animation detection
- Color palette consistency
- Typography hierarchy
- Layout spacing

**Expected Duration**: 3-4 minutes
**Critical For**: Visual consistency, theming

### 5. Accessibility Tests
**Command**: `npm run test:e2e:a11y`

Tests:
- Keyboard navigation (Tab, arrow keys)
- Focus management and trapping
- ARIA roles and attributes
- Screen reader support
- Heading hierarchy
- Alt text on images
- Form labels
- WCAG color contrast
- Touch target sizes
- Focus indicators

**Expected Duration**: 4-5 minutes
**Critical For**: WCAG compliance, accessibility

## Running Tests by Viewport

```bash
# Mobile viewport (375px)
npm run test:e2e:mobile

# Tablet viewport (768px)
npm run test:e2e:tablet

# Desktop viewport (1920px)
npm run test:e2e:desktop
```

## Running Tests by Browser

```bash
# Chromium (Chrome/Edge)
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# WebKit (Safari)
npx playwright test --project=webkit

# All browsers
npx playwright test --project=chromium --project=firefox --project=webkit
```

## Interactive Testing

### UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

Features:
- Watch mode with auto-rerun
- Time travel through test steps
- Visual test explorer
- Screenshot viewer
- Network inspector
- Console logs viewer

### Headed Mode (Show Browser)
```bash
npm run test:e2e:headed

# Or specific test
npx playwright test e2e/tests/dashboard-navigation.spec.ts --headed
```

### Debug Mode (Step Through Tests)
```bash
npm run test:e2e:debug

# Or specific test
npx playwright test e2e/tests/accessibility.spec.ts --debug
```

Features:
- Pause execution
- Step through test
- Inspect page state
- Try selectors in console
- Record new tests

## Filtering Tests

### Run Specific Test File
```bash
npx playwright test e2e/tests/dashboard-navigation.spec.ts
```

### Run Tests Matching Name
```bash
npx playwright test --grep "should navigate"
npx playwright test --grep "keyboard"
npx playwright test --grep "dark mode"
```

### Skip Tests Matching Pattern
```bash
npx playwright test --grep-invert "slow"
```

### Run Single Test
```bash
# Add .only to test
test.only('should toggle dark mode', async () => {
  // test code
});
```

## Test Output and Artifacts

### HTML Report
```bash
# Generate and open report
npm run test:e2e:report

# Or manually
npx playwright show-report
```

Report includes:
- Test results with pass/fail status
- Test duration and retries
- Screenshots (on failure)
- Videos (on failure)
- Traces (on first retry)
- Console logs
- Network requests

### Screenshots
Location: `/e2e/screenshots/`

Naming convention:
- `{test-name}-{timestamp}.png`
- `dashboard-{tab}-{suffix}.png`
- `baseline-{viewport}.png`
- `theme-{light|dark}.png`

### Test Results
Location: `/test-results/`

Files:
- `results.json` - Machine-readable results
- `junit.xml` - CI/CD integration format
- Individual test artifacts (screenshots, videos, traces)

### Videos
Created on test failure, located in `/test-results/`

### Trace Files
Created on first retry, viewable with:
```bash
npx playwright show-trace test-results/trace.zip
```

## Debugging Failed Tests

### 1. Check Screenshots
```bash
ls -la e2e/screenshots/
open e2e/screenshots/
```

### 2. View Video Recording
```bash
ls -la test-results/*.webm
open test-results/*.webm
```

### 3. Inspect Trace
```bash
npx playwright show-trace test-results/*/trace.zip
```

### 4. Run in Headed Mode
```bash
npx playwright test e2e/tests/failing-test.spec.ts --headed
```

### 5. Add Debug Logs
```typescript
test('my test', async ({ page }) => {
  await page.goto('/dashboard');
  console.log('Current URL:', page.url());

  const element = page.locator('[data-testid="button"]');
  console.log('Element count:', await element.count());

  await page.screenshot({ path: 'debug-screenshot.png' });
});
```

### 6. Increase Timeout
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // test code
});
```

### 7. Wait for Elements
```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="button"]', { state: 'visible' });

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific condition
await page.waitForFunction(() => document.readyState === 'complete');
```

## Common Issues and Solutions

### Dev Server Not Running
```bash
# Start dev server manually
npm run dev

# Or configure in playwright.config.ts
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```

### Port Already in Use
```bash
# Kill process on port 3000
pkill -f "next"
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Flaky Tests
```bash
# Run with retries
npx playwright test --retries=3

# Run multiple times to reproduce
npx playwright test --repeat-each=10

# Add explicit waits
await page.waitForTimeout(1000);
await page.waitForSelector('[data-testid="element"]');
```

### Timeout Errors
```bash
# Increase timeout in config
timeout: 60000, // 60 seconds

# Or per test
test.setTimeout(60000);

# Check for network issues
await page.waitForLoadState('networkidle');
```

### Element Not Found
```bash
# Verify selector in debug mode
npx playwright test --debug

# Try alternative selectors
page.locator('[data-testid="button"]')
page.locator('button:has-text("Submit")')
page.locator('[role="button"]')
page.getByRole('button', { name: 'Submit' })
```

### Authentication Issues
```typescript
// Use auth fixture
const authFixture = new AuthFixture(page);
await authFixture.setupAuthSession();

// Or login via UI
await authFixture.login({
  email: 'test@example.com',
  password: 'password123'
});
```

## CI/CD Integration

### GitHub Actions
The workflow runs automatically on:
- Push to `main`, `develop`, `staging` branches
- Pull requests to `main`, `develop`
- Manual trigger via `workflow_dispatch`

### Viewing CI Results
1. Go to GitHub Actions tab
2. Select "E2E Tests - AIKit Dashboard" workflow
3. Click on specific run
4. Download artifacts:
   - `playwright-results-*` - Test results
   - `screenshots-*` - Screenshot artifacts
   - `playwright-report-*` - HTML report

### Running Tests Locally Like CI
```bash
# Set CI environment variable
CI=true npx playwright test

# Use CI config
npx playwright test --config=playwright.config.ci.ts
```

## Performance Optimization

### Parallel Execution
```bash
# Run tests in parallel (default)
npx playwright test --workers=4

# Run sequentially (for debugging)
npx playwright test --workers=1
```

### Sharding (Multiple Machines)
```bash
# Split tests across 4 machines
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

### Skip Slow Tests in Development
```typescript
test('slow test', async ({ page }) => {
  test.skip(!!process.env.SKIP_SLOW, 'Skipping slow test in dev');
  // test code
});

// Run all tests
npx playwright test

// Skip slow tests
SKIP_SLOW=true npx playwright test
```

## Best Practices

### 1. Use Page Object Models
```typescript
// Good
const dashboardPage = new DashboardPage(page);
await dashboardPage.switchTab('ai-kit');

// Avoid
await page.click('[role="tab"]:has-text("AI Kit")');
```

### 2. Use data-testid for Stability
```typescript
// Best
await page.click('[data-testid="submit-button"]');

// Good
await page.getByRole('button', { name: 'Submit' });

// Avoid (fragile)
await page.click('.btn.btn-primary.submit');
```

### 3. Wait for Stability
```typescript
// Wait for element before interaction
const button = page.locator('[data-testid="button"]');
await button.waitFor({ state: 'visible' });
await button.click();

// Wait for network
await page.waitForLoadState('networkidle');
```

### 4. Isolate Tests
```typescript
// Each test should be independent
test.beforeEach(async ({ page }) => {
  // Reset state
  await authFixture.setupAuthSession();
  await dashboardPage.navigateToDashboard();
});
```

### 5. Use Meaningful Names
```typescript
// Good
test('should update URL when switching to AI Kit tab', async () => {});

// Avoid
test('test 1', async () => {});
```

## Maintenance

### Updating Baselines
```bash
# Update screenshot baselines
npx playwright test --update-snapshots

# Update for specific test
npx playwright test e2e/tests/visual-testing.spec.ts --update-snapshots
```

### Cleaning Old Artifacts
```bash
# Remove old test results
rm -rf test-results/

# Remove old screenshots
rm -rf e2e/screenshots/

# Remove old reports
rm -rf playwright-report/
```

### Upgrading Playwright
```bash
# Update Playwright
npm install --save-dev @playwright/test@latest

# Update browsers
npx playwright install

# Check for breaking changes
npx playwright --version
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
