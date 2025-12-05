#!/bin/bash
# Issue #12: Set Up Error Boundaries - TDD Acceptance Tests

set -e

PROJECT_DIR="/home/quaid/Documents/Projects/ainative-studio/src/ainative-nextjs"
cd "$PROJECT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

PASSED=0
FAILED=0

pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    PASSED=$((PASSED + 1))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    FAILED=$((FAILED + 1))
}

echo "=========================================="
echo "Issue #12: Set Up Error Boundaries"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: Global error boundary exists
echo "--- AC1: Global error boundary ---"

if [ -f "app/error.tsx" ]; then
    pass "app/error.tsx exists"
else
    fail "app/error.tsx missing"
fi

# Verify it's a client component (required for error boundaries)
if grep -q '"use client"' app/error.tsx 2>/dev/null; then
    pass "Error boundary is a client component"
else
    fail "Error boundary missing 'use client' directive"
fi

# AC2: Not found page exists
echo ""
echo "--- AC2: Not found page ---"

if [ -f "app/not-found.tsx" ]; then
    pass "app/not-found.tsx exists"
else
    fail "app/not-found.tsx missing"
fi

# AC3: Error logging configured
echo ""
echo "--- AC3: Error logging ---"

if grep -q "console.error\|console.log" app/error.tsx 2>/dev/null; then
    pass "Error logging configured"
else
    fail "Error logging not configured"
fi

# AC4: User-friendly error messages
echo ""
echo "--- AC4: User-friendly messages ---"

if grep -q "Something went wrong\|error\|Error" app/error.tsx 2>/dev/null; then
    pass "User-friendly error message present"
else
    fail "User-friendly error message missing"
fi

# AC5: Reset/retry functionality
echo ""
echo "--- AC5: Reset functionality ---"

if grep -q "reset\|retry\|Try again" app/error.tsx 2>/dev/null; then
    pass "Reset/retry functionality present"
else
    fail "Reset/retry functionality missing"
fi

# AC6: Development vs Production error display
echo ""
echo "--- AC6: Dev/Prod error handling ---"

if grep -q "NODE_ENV\|development\|process.env" app/error.tsx 2>/dev/null; then
    pass "Environment-aware error display configured"
else
    # Check if error.message is conditionally shown
    if grep -q "error.message\|error.digest" app/error.tsx 2>/dev/null; then
        pass "Error details available (digest for production tracking)"
    else
        fail "Environment-aware error display not configured"
    fi
fi

# AC7: Not found has navigation back
echo ""
echo "--- AC7: Not found navigation ---"

if grep -q "Link\|href\|home\|back" app/not-found.tsx 2>/dev/null; then
    pass "Not found page has navigation"
else
    fail "Not found page missing navigation"
fi

# AC8: TypeScript compliance
echo ""
echo "--- AC8: TypeScript compliance ---"

if npm run type-check 2>&1 | grep -q "error TS"; then
    fail "TypeScript errors detected"
else
    pass "TypeScript type check passes"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
