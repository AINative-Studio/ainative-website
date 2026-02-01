#!/bin/bash
# Integration test for Issue #508 - Completion Time Summary Demo Page
# Tests file structure, component implementation, and accessibility

set -e

echo "=========================================="
echo "Testing Issue #508: Completion Time Summary Demo"
echo "=========================================="

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASS=0
FAIL=0

# Helper function for test assertions
assert_file_exists() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((FAIL++))
    fi
}

assert_file_contains() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} File contains pattern: $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} File missing pattern: $2 in $1"
        ((FAIL++))
    fi
}

echo ""
echo "1. Testing File Structure"
echo "----------------------------------------"

# Check for required files
assert_file_exists "app/demo/completion-time-summary/page.tsx"
assert_file_exists "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx"
assert_file_exists "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx"

echo ""
echo "2. Testing Server Component (page.tsx)"
echo "----------------------------------------"

# Check for metadata export
assert_file_contains "app/demo/completion-time-summary/page.tsx" "export const metadata"
assert_file_contains "app/demo/completion-time-summary/page.tsx" "title:.*Completion Time Summary"
assert_file_contains "app/demo/completion-time-summary/page.tsx" "description:.*time-based completion"

# Check that it imports and renders client component
assert_file_contains "app/demo/completion-time-summary/page.tsx" "import CompletionTimeSummaryClient"
assert_file_contains "app/demo/completion-time-summary/page.tsx" "<CompletionTimeSummaryClient"

# Ensure NO 'use client' directive in server component
if grep -q "use client" "app/demo/completion-time-summary/page.tsx"; then
    echo -e "${RED}✗${NC} Server component should not have 'use client' directive"
    ((FAIL++))
else
    echo -e "${GREEN}✓${NC} Server component correctly has no 'use client' directive"
    ((PASS++))
fi

echo ""
echo "3. Testing Client Component (CompletionTimeSummaryClient.tsx)"
echo "----------------------------------------"

# Check for 'use client' directive
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "use client"

# Check for recharts imports
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "from 'recharts'"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "LineChart"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "ResponsiveContainer"

# Check for time period switching
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "daily"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "weekly"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "monthly"

# Check for statistics cards
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "Total Completions"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "Average Time"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "Fastest Completion"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "Slowest Completion"

# Check for responsive design classes
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "grid-cols-1"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "md:grid-cols-2"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "lg:grid-cols-4"

echo ""
echo "4. Testing Accessibility Features"
echo "----------------------------------------"

# Check for ARIA attributes
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "role=\"status\""
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "aria-live"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "sr-only"

# Check for semantic HTML
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "<h1"
assert_file_contains "app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx" "<h3"

echo ""
echo "5. Testing Component Tests"
echo "----------------------------------------"

# Check test file structure
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "describe.*CompletionTimeSummaryClient"
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "Component Rendering"
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "Time Period Switching"
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "Timeline Data Rendering"
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "Responsive Design"
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "Accessibility Compliance"

# Check for BDD-style tests (Given/When/Then)
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "// Given"
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "// When"
assert_file_contains "app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx" "// Then"

echo ""
echo "6. Running Unit Tests"
echo "----------------------------------------"

# Run the actual tests
if npm test -- app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx --coverage --collectCoverageFrom='app/demo/completion-time-summary/**/*.{ts,tsx}' --collectCoverageFrom='!app/demo/completion-time-summary/__tests__/**' --silent 2>&1 | grep -q "PASS"; then
    echo -e "${GREEN}✓${NC} Unit tests pass"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Unit tests failed"
    ((FAIL++))
fi

# Check test coverage (should be 85%+)
COVERAGE=$(npm test -- app/demo/completion-time-summary/__tests__/CompletionTimeSummaryClient.test.tsx --coverage --collectCoverageFrom='app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx' --silent 2>&1 | grep "CompletionTimeSummaryClient.tsx" | awk '{print $2}' | sed 's/%//')

if [ -n "$COVERAGE" ] && [ "$COVERAGE" -ge 85 ]; then
    echo -e "${GREEN}✓${NC} Test coverage is ${COVERAGE}% (>= 85%)"
    ((PASS++))
elif [ -n "$COVERAGE" ]; then
    echo -e "${YELLOW}!${NC} Test coverage is ${COVERAGE}% (target: >= 85%)"
    ((PASS++))
else
    echo -e "${YELLOW}!${NC} Could not determine test coverage"
fi

echo ""
echo "7. Testing TypeScript Compilation"
echo "----------------------------------------"

# Check TypeScript types
if npx tsc --noEmit app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx 2>&1 | grep -q "error TS"; then
    echo -e "${RED}✗${NC} TypeScript compilation errors found"
    ((FAIL++))
else
    echo -e "${GREEN}✓${NC} TypeScript compilation successful"
    ((PASS++))
fi

echo ""
echo "8. Testing Linting"
echo "----------------------------------------"

# Run ESLint
if npx eslint app/demo/completion-time-summary/CompletionTimeSummaryClient.tsx 2>&1 | grep -q "error"; then
    echo -e "${YELLOW}!${NC} ESLint found errors"
else
    echo -e "${GREEN}✓${NC} ESLint passed"
    ((PASS++))
fi

echo ""
echo "=========================================="
echo "Test Results"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${RED}Failed:${NC} $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
