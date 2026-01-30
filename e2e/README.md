# E2E Tests - AIKit Dashboard Integration

Comprehensive end-to-end test suite for the AIKit dashboard using Playwright.

## Test Coverage

### 1. Dashboard Navigation (`dashboard-navigation.spec.ts`)
- Tab switching between Overview, AI-Kit, Usage, Billing, Settings
- URL updates on tab changes
- Browser back/forward navigation
- Tab state persistence on reload
- Keyboard navigation with arrow keys
- Visual active tab indicators
- Rapid tab switching stress tests
- Direct navigation to AI Kit page
- Accessible tab navigation with proper ARIA

### 2. Component Interactions (`component-interactions.spec.ts`)
- **AIKitButton**: Clicks, hover states, disabled states, accessibility
- **AIKitTextField**: Text input, clearing, focus states, validation
- **AIKitSlider**: Value changes, keyboard navigation, value display
- **AIKitCheckBox**: Toggle functionality, indeterminate states, labels
- **AIKitChoicePicker**: Dropdown opening, option selection, keyboard navigation

### 3. Responsive Design (`responsive-design.spec.ts`)
- Mobile viewport (375px): Touch targets, vertical stacking, no overflow
- Tablet viewport (768px): Hybrid layouts, grid systems
- Desktop viewport (1920px): Multi-column layouts, full-width utilization
- Cross-viewport functionality tests
- Layout consistency during resizing
- Typography and spacing consistency
- Visual regression baselines

### 4. Visual Testing (`visual-testing.spec.ts`)
- Screenshot capture for all tabs
- Component state screenshots (normal, hover, focus, disabled)
- Loading and error states
- Dark mode toggle and theming
- Dark mode style consistency
- Animation detection and validation
- Color palette consistency
- Typography hierarchy
- Layout spacing and alignment

### 5. Accessibility (`accessibility.spec.ts`)
- Keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
- Focus management and trapping in modals
- Skip-to-content links
- ARIA roles on landmarks (banner, navigation, main, contentinfo)
- ARIA labels on interactive elements
- ARIA expanded/current states
- ARIA live regions for dynamic content
- Screen reader support (heading hierarchy, alt text, form labels)
- WCAG compliance (color contrast, touch targets, focus indicators)
- Descriptive link text

## Directory Structure

```
e2e/
├── tests/                          # Test specifications
│   ├── dashboard-navigation.spec.ts
│   ├── component-interactions.spec.ts
│   ├── responsive-design.spec.ts
│   ├── visual-testing.spec.ts
│   └── accessibility.spec.ts
├── fixtures/                       # Page object models and fixtures
│   ├── auth.fixture.ts            # Authentication helper
│   └── dashboard.fixture.ts       # Dashboard page object model
├── helpers/                        # Utility functions
│   └── test-utils.ts              # Test utilities and base classes
├── screenshots/                    # Screenshot output directory
└── run-tests.sh                   # Test execution script
```

## Running Tests

### Install Dependencies

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Run All Tests

```bash
# Using the test script
./e2e/run-tests.sh all chromium

# Using npm script (add to package.json)
npm run test:e2e
```

### Run Specific Test Suites

```bash
# Navigation tests
./e2e/run-tests.sh navigation chromium

# Component interaction tests
./e2e/run-tests.sh components chromium

# Responsive design tests
./e2e/run-tests.sh responsive chromium

# Visual testing
./e2e/run-tests.sh visual chromium

# Accessibility tests
./e2e/run-tests.sh accessibility chromium
```

### Run with Different Browsers

```bash
# Firefox
npx playwright test --project=firefox

# WebKit (Safari)
npx playwright test --project=webkit

# All browsers
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Run Mobile/Tablet Tests

```bash
# Mobile viewport
npx playwright test --project=mobile

# Tablet viewport
npx playwright test --project=tablet

# Desktop viewport
npx playwright test --project=desktop
```

### Headed Mode (Show Browser)

```bash
# Run tests with visible browser
./e2e/run-tests.sh all chromium true

# Or with Playwright CLI
npx playwright test --headed
```

### Debug Mode

```bash
# Run in debug mode with inspector
npx playwright test --debug

# Run specific test in debug mode
npx playwright test e2e/tests/dashboard-navigation.spec.ts --debug
```

### View Test Reports

```bash
# Generate and open HTML report
npx playwright show-report

# View last test run report
npx playwright show-report playwright-report
```

## Test Configuration

The test suite is configured via `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Timeout**: 30 seconds for navigation, 10 seconds for actions
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Only on failure
- **Videos**: Retained on failure
- **Reporters**: HTML, JSON, JUnit, List

### Viewports

- Mobile: 375x812px (Pixel 5)
- Tablet: 768x1024px (iPad)
- Desktop: 1920x1080px

## Authentication

Tests use the `AuthFixture` class for handling authentication:

```typescript
// Setup auth session (fast, no UI)
await authFixture.setupAuthSession();

// Or login via UI (slower, more realistic)
await authFixture.login();

// Use specific user
const adminUser = AuthFixture.getTestUser('admin');
await authFixture.login(adminUser);
```

Test users:
- `admin@ainative.com` - Admin user
- `user@ainative.com` - Regular user
- `guest@ainative.com` - Guest user

All test users have password: `Test123!@#`

## Page Object Models

### DashboardPage

```typescript
const dashboardPage = new DashboardPage(page);

// Navigate
await dashboardPage.navigateToDashboard();
await dashboardPage.navigateToAIKit();

// Tabs
await dashboardPage.switchTab('ai-kit');
const tabs = await dashboardPage.getTabs();
const activeTab = await dashboardPage.getActiveTab();

// Components
await dashboardPage.clickAIKitButton('Submit');
await dashboardPage.fillAIKitTextField('Username', 'testuser');
await dashboardPage.setAIKitSliderValue('Volume', 75);
await dashboardPage.toggleAIKitCheckbox('Accept terms');
await dashboardPage.selectAIKitChoice('Language', 'English');

// Screenshots
await dashboardPage.captureTabScreenshot('ai-kit');
await dashboardPage.captureAllTabScreenshots('baseline');
```

### TestUtils

```typescript
const testUtils = new TestUtils(page);

// Screenshots
await testUtils.takeScreenshot('test-name', true);

// Keyboard navigation
await testUtils.testKeyboardNavigation(['button1', 'input1']);

// Accessibility
const a11y = await testUtils.checkAccessibility('[data-testid="button"]');

// Responsive testing
await testUtils.testResponsive([
  { width: 375, height: 812, name: 'mobile' },
  { width: 1920, height: 1080, name: 'desktop' }
]);

// Dark mode
const result = await testUtils.testDarkModeToggle();

// Performance
const metrics = await testUtils.measurePerformance();
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) runs:

1. **E2E Tests**: Matrix of browsers and shards for parallel execution
2. **Accessibility Tests**: Dedicated accessibility validation
3. **Visual Regression**: Screenshot comparison tests
4. **Mobile Tests**: Mobile viewport specific tests
5. **Report Merging**: Combines all test results into final report

### Artifacts

All test runs produce artifacts:
- Test results (JSON, JUnit)
- Screenshots (PNG)
- HTML reports
- Videos (on failure)

Artifacts are retained for 30 days.

## Best Practices

### Writing Tests

1. **Use Page Object Models**: Keep selectors and interactions in page objects
2. **Use data-testid**: Prefer `data-testid` attributes for stable selectors
3. **Wait for stability**: Use `waitFor` to ensure elements are ready
4. **Isolate tests**: Each test should be independent
5. **Clean up**: Reset state in `beforeEach` hooks

### Selectors

Priority order:
1. `data-testid` attributes
2. ARIA roles and labels (`role="button"`, `aria-label="Submit"`)
3. Semantic HTML (`button`, `input[type="email"]`)
4. Text content (`.locator('text=Submit')`)
5. CSS classes (last resort, fragile)

### Debugging

```bash
# Run single test with console logs
DEBUG=pw:api npx playwright test e2e/tests/dashboard-navigation.spec.ts

# Trace viewer
npx playwright show-trace trace.zip

# Screenshot on every action
npx playwright test --screenshot=on

# Record video
npx playwright test --video=on
```

## Troubleshooting

### Dev server not starting
```bash
# Manually start dev server
npm run dev

# Or specify port
PORT=3000 npm run dev
```

### Flaky tests
```bash
# Run with retries
npx playwright test --retries=3

# Run single test multiple times
npx playwright test e2e/tests/dashboard-navigation.spec.ts --repeat-each=10
```

### Timeout errors
```bash
# Increase timeout in test
test.setTimeout(60000); // 60 seconds

# Or in config
timeout: 60000
```

### Screenshot mismatches
```bash
# Update baseline screenshots
npx playwright test --update-snapshots
```

## Next Steps

1. Add visual regression testing with baseline images
2. Integrate with CI/CD pipeline
3. Add performance testing with Lighthouse
4. Add API testing for backend integration
5. Add cross-browser compatibility matrix
6. Add mobile device emulation tests
7. Add internationalization (i18n) tests
8. Add error boundary and crash recovery tests

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing Guide](https://playwright.dev/docs/accessibility-testing)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [CI/CD Integration](https://playwright.dev/docs/ci)
