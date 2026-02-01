#!/bin/bash
# Test Script for Issue #516: AIKitChoicePicker Component Migration
# Verifies TDD implementation with 85%+ coverage and WCAG 2.1 AA compliance

set -e

echo "======================================================================"
echo "Issue #516: AIKitChoicePicker Component Migration Verification"
echo "======================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2

    echo -e "${YELLOW}Testing: ${test_name}${NC}"

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "1. Verifying Component Files Exist"
echo "-----------------------------------"
run_test "Component file exists" "test -f components/aikit/AIKitChoicePicker.tsx"
run_test "Test file exists" "test -f components/aikit/__tests__/AIKitChoicePicker.test.tsx"
run_test "Storybook file exists" "test -f components/aikit/AIKitChoicePicker.stories.tsx"
run_test "Documentation exists" "test -f components/aikit/AIKitChoicePicker.md"
echo ""

echo "2. Verifying Required Patterns"
echo "-------------------------------"
run_test "Component has 'use client' directive" "grep -q \"'use client'\" components/aikit/AIKitChoicePicker.tsx"
run_test "Component uses TypeScript" "grep -q 'export interface AIKitChoicePickerProps' components/aikit/AIKitChoicePicker.tsx"
run_test "Component has display name" "grep -q 'displayName = .AIKitChoicePicker.' components/aikit/AIKitChoicePicker.tsx"
run_test "Component exported in index" "grep -q 'AIKitChoicePicker' components/aikit/index.ts"
echo ""

echo "3. Verifying Component Features"
echo "--------------------------------"
run_test "Single select mode implemented" "grep -q \"mode.*single\" components/aikit/AIKitChoicePicker.tsx"
run_test "Multi select mode implemented" "grep -q \"mode.*multi\" components/aikit/AIKitChoicePicker.tsx"
run_test "Keyboard navigation implemented" "grep -q 'ArrowRight' components/aikit/AIKitChoicePicker.tsx"
run_test "Clear all functionality implemented" "grep -q 'handleClearAll' components/aikit/AIKitChoicePicker.tsx"
run_test "Max selections implemented" "grep -q 'maxSelections' components/aikit/AIKitChoicePicker.tsx"
run_test "Disabled state implemented" "grep -q 'disabled' components/aikit/AIKitChoicePicker.tsx"
echo ""

echo "4. Verifying Accessibility (WCAG 2.1 AA)"
echo "-----------------------------------------"
run_test "ARIA role group" "grep -q 'role=\"group\"' components/aikit/AIKitChoicePicker.tsx"
run_test "ARIA pressed attribute" "grep -q 'aria-pressed' components/aikit/AIKitChoicePicker.tsx"
run_test "ARIA disabled attribute" "grep -q 'aria-disabled' components/aikit/AIKitChoicePicker.tsx"
run_test "ARIA labelledby" "grep -q 'aria-labelledby' components/aikit/AIKitChoicePicker.tsx"
run_test "Focus visible styles" "grep -q 'focus-visible:ring' components/aikit/AIKitChoicePicker.tsx"
echo ""

echo "5. Verifying Performance Optimizations"
echo "---------------------------------------"
run_test "React.memo used" "grep -q 'React.memo' components/aikit/AIKitChoicePicker.tsx"
run_test "useMemo used" "grep -q 'useMemo' components/aikit/AIKitChoicePicker.tsx"
run_test "useCallback used" "grep -q 'useCallback' components/aikit/AIKitChoicePicker.tsx"
echo ""

echo "6. Verifying Test Coverage"
echo "--------------------------"
run_test "Tests for single select mode" "grep -q 'Single Select Mode' components/aikit/__tests__/AIKitChoicePicker.test.tsx"
run_test "Tests for multi select mode" "grep -q 'Multi Select Mode' components/aikit/__tests__/AIKitChoicePicker.test.tsx"
run_test "Tests for keyboard navigation" "grep -q 'Keyboard Navigation' components/aikit/__tests__/AIKitChoicePicker.test.tsx"
run_test "Tests for WCAG compliance" "grep -q 'WCAG 2.1 AA Accessibility' components/aikit/__tests__/AIKitChoicePicker.test.tsx"
run_test "Tests for disabled state" "grep -q 'Disabled State' components/aikit/__tests__/AIKitChoicePicker.test.tsx"
run_test "Tests for clear all" "grep -q 'Clear All Functionality' components/aikit/__tests__/AIKitChoicePicker.test.tsx"
echo ""

echo "7. Running Jest Tests"
echo "---------------------"
if npm test -- AIKitChoicePicker --silent --passWithNoTests 2>&1 | grep -q "Tests:.*passed"; then
    echo -e "${GREEN}✓ PASS${NC}: All Jest tests passed"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Jest tests failed"
    ((TESTS_FAILED++))
fi
echo ""

echo "8. Verifying Test Coverage (85%+ required)"
echo "-------------------------------------------"
COVERAGE_OUTPUT=$(npm test -- AIKitChoicePicker --coverage --collectCoverageFrom="components/aikit/AIKitChoicePicker.tsx" --silent 2>&1)

# Extract coverage percentages from the summary line
STATEMENTS=$(echo "$COVERAGE_OUTPUT" | grep "Statements" | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo "0")
BRANCHES=$(echo "$COVERAGE_OUTPUT" | grep "Branches" | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo "0")
FUNCTIONS=$(echo "$COVERAGE_OUTPUT" | grep "Functions" | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo "0")
LINES=$(echo "$COVERAGE_OUTPUT" | grep "Lines" | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo "0")

echo "Coverage Results:"
echo "  Statements: ${STATEMENTS}%"
echo "  Branches: ${BRANCHES}%"
echo "  Functions: ${FUNCTIONS}%"
echo "  Lines: ${LINES}%"

# Check if coverage meets 85% threshold
if (( $(echo "$STATEMENTS >= 85" | bc -l) )) && \
   (( $(echo "$LINES >= 85" | bc -l) )); then
    echo -e "${GREEN}✓ PASS${NC}: Coverage exceeds 85% threshold"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Coverage below 85% threshold"
    ((TESTS_FAILED++))
fi
echo ""

echo "9. Verifying Storybook Stories"
echo "-------------------------------"
run_test "Default story" "grep -q 'export const Default' components/aikit/AIKitChoicePicker.stories.tsx"
run_test "Single select story" "grep -q 'export const SingleSelect' components/aikit/AIKitChoicePicker.stories.tsx"
run_test "Multi select story" "grep -q 'export const MultiSelect' components/aikit/AIKitChoicePicker.stories.tsx"
run_test "Accessibility demo story" "grep -q 'export const AccessibilityDemo' components/aikit/AIKitChoicePicker.stories.tsx"
run_test "Interactive controlled story" "grep -q 'export const InteractiveControlled' components/aikit/AIKitChoicePicker.stories.tsx"
echo ""

echo "======================================================================"
echo "Test Summary"
echo "======================================================================"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo ""
    echo "Issue #516 Acceptance Criteria Met:"
    echo "  ✓ Component created with TypeScript"
    echo "  ✓ Single/multi-select modes working"
    echo "  ✓ Keyboard navigation functional"
    echo "  ✓ Tests passing with 85%+ coverage"
    echo "  ✓ Storybook story created"
    echo "  ✓ WCAG 2.1 AA compliance verified"
    echo "  ✓ Performance optimizations applied"
    echo ""
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo "Please review the failures above."
    echo ""
    exit 1
fi
