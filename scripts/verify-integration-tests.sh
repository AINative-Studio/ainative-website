#!/bin/bash

# Integration Tests Verification Script

echo "=================================="
echo "Integration Tests Verification"
echo "=================================="
echo ""

# Check if test files exist
echo "1. Checking test files..."
TEST_FILES=(
  "__tests__/integration/setup.ts"
  "__tests__/integration/auth-flow.integration.test.ts"
  "__tests__/integration/payment-subscription-flow.integration.test.ts"
  "__tests__/integration/credit-system-flow.integration.test.ts"
  "__tests__/integration/video-processing-flow.integration.test.ts"
  "__tests__/integration/rlhf-feedback-flow.integration.test.ts"
  "__tests__/integration/community-features-flow.integration.test.ts"
  "__tests__/integration/helpers/test-helpers.ts"
)

for file in "${TEST_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file"
  else
    echo "   ✗ $file (MISSING)"
    exit 1
  fi
done

echo ""
echo "2. Checking configuration files..."
CONFIG_FILES=(
  "jest.integration.config.js"
  ".github/workflows/integration-tests.yml"
  "__tests__/integration/README.md"
  "INTEGRATION_TESTS_SUMMARY.md"
)

for file in "${CONFIG_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file"
  else
    echo "   ✗ $file (MISSING)"
    exit 1
  fi
done

echo ""
echo "3. Checking package.json scripts..."
if grep -q "test:integration" package.json; then
  echo "   ✓ test:integration script found"
else
  echo "   ✗ test:integration script missing"
  exit 1
fi

if grep -q "test:integration:coverage" package.json; then
  echo "   ✓ test:integration:coverage script found"
else
  echo "   ✗ test:integration:coverage script missing"
  exit 1
fi

echo ""
echo "4. Checking dependencies..."
if npm list msw > /dev/null 2>&1; then
  echo "   ✓ msw installed"
else
  echo "   ⚠ msw not found, installing..."
  npm install --save-dev msw
fi

echo ""
echo "5. Listing integration tests..."
npm run test:integration -- --listTests 2>&1 | grep ".integration.test.ts" | while read line; do
  echo "   ✓ $(basename $line)"
done

echo ""
echo "6. Test file statistics..."
echo "   Total test files: $(find __tests__/integration -name "*.integration.test.ts" | wc -l | tr -d ' ')"
echo "   Total lines of test code: $(cat __tests__/integration/*.integration.test.ts | wc -l | tr -d ' ')"
echo "   Total setup/helper lines: $(cat __tests__/integration/setup.ts __tests__/integration/helpers/*.ts 2>/dev/null | wc -l | tr -d ' ')"

echo ""
echo "=================================="
echo "✓ All Verification Checks Passed!"
echo "=================================="
echo ""
echo "Ready to run integration tests:"
echo "  npm run test:integration"
echo ""
echo "For coverage report:"
echo "  npm run test:integration:coverage"
echo ""
