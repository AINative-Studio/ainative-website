# E2E Tests - Quick Reference Card

## Installation

```bash
npm install
npx playwright install
```

## Run Tests

```bash
# All tests
npm run test:e2e

# Specific suites
npm run test:e2e:navigation    # Dashboard navigation
npm run test:e2e:components    # Component interactions
npm run test:e2e:responsive    # Responsive design
npm run test:e2e:visual        # Visual testing
npm run test:e2e:a11y          # Accessibility

# By viewport
npm run test:e2e:mobile        # 375px
npm run test:e2e:tablet        # 768px
npm run test:e2e:desktop       # 1920px
```

## Interactive Testing

```bash
npm run test:e2e:ui            # UI mode (recommended)
npm run test:e2e:headed        # Show browser
npm run test:e2e:debug         # Debug mode
npm run test:e2e:report        # View report
```

## Common Commands

```bash
# Single test file
npx playwright test e2e/tests/accessibility.spec.ts

# Specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Filter by name
npx playwright test --grep "keyboard"
npx playwright test --grep "dark mode"

# With retries
npx playwright test --retries=3

# Update screenshots
npx playwright test --update-snapshots
```

## Shell Script

```bash
./e2e/run-tests.sh [test-type] [browser] [headed]

# Examples:
./e2e/run-tests.sh all chromium
./e2e/run-tests.sh navigation firefox
./e2e/run-tests.sh accessibility chromium true
```

## Debugging

```bash
# Debug mode
npm run test:e2e:debug

# View trace
npx playwright show-trace test-results/trace.zip

# View screenshots
ls -la e2e/screenshots/

# Check logs
cat test-results/results.json
```

## File Locations

```
Tests:        e2e/tests/*.spec.ts
Fixtures:     e2e/fixtures/*.ts
Utils:        e2e/helpers/test-utils.ts
Screenshots:  e2e/screenshots/
Results:      test-results/
Config:       playwright.config.ts
CI/CD:        .github/workflows/e2e-tests.yml
Docs:         e2e/README.md
Guide:        e2e/TEST-EXECUTION-GUIDE.md
```

## Test Users

```
admin@ainative.com   / Test123!@#
user@ainative.com    / Test123!@#
guest@ainative.com   / Test123!@#
```

## Key Shortcuts (UI Mode)

```
Space     - Run/pause test
F10       - Step over
F11       - Step into
Shift+F11 - Step out
F5        - Continue
```

## Viewports

```
Mobile:  375 x 812  (Pixel 5)
Tablet:  768 x 1024 (iPad)
Desktop: 1920 x 1080
```

## Quick Tips

- Use UI mode for development: `npm run test:e2e:ui`
- Use headed mode to see browser: `npm run test:e2e:headed`
- Add `.only` to run single test: `test.only('test name', ...)`
- Add `.skip` to skip test: `test.skip('test name', ...)`
- Check screenshots on failure: `e2e/screenshots/`
- View HTML report: `npm run test:e2e:report`

## Need Help?

- Documentation: `e2e/README.md`
- Execution Guide: `e2e/TEST-EXECUTION-GUIDE.md`
- Summary: `E2E-TEST-SUITE-SUMMARY.md`
- Playwright Docs: https://playwright.dev/
