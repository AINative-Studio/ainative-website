#!/bin/bash
# Issue #10: Create Root Layout - TDD Acceptance Tests
# Tests based on acceptance criteria from the issue

set -e

PROJECT_DIR="/home/quaid/Documents/Projects/ainative-studio/src/ainative-nextjs"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

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
echo "Issue #10: Create Root Layout"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: Root layout exists
echo "--- AC1: Root layout file ---"

if [ -f "app/layout.tsx" ]; then
    pass "app/layout.tsx exists"
else
    fail "app/layout.tsx missing"
fi

# AC2: HTML lang attribute
echo ""
echo "--- AC2: HTML lang attribute ---"

if grep -q 'lang="en"' app/layout.tsx 2>/dev/null; then
    pass "HTML lang attribute set to 'en'"
else
    fail "HTML lang attribute not set to 'en'"
fi

# AC3: Global metadata configured
echo ""
echo "--- AC3: Global metadata ---"

if grep -q "metadata.*Metadata\|export const metadata" app/layout.tsx 2>/dev/null; then
    pass "Metadata export found"
else
    fail "Metadata export missing"
fi

if grep -q "title:" app/layout.tsx 2>/dev/null; then
    pass "Title metadata configured"
else
    fail "Title metadata missing"
fi

if grep -q "description:" app/layout.tsx 2>/dev/null; then
    pass "Description metadata configured"
else
    fail "Description metadata missing"
fi

# AC4: React Query provider wrapped
echo ""
echo "--- AC4: React Query provider ---"

if grep -q "QueryProvider\|Providers" app/layout.tsx 2>/dev/null; then
    pass "QueryProvider or Providers wrapper used in layout"
else
    fail "QueryProvider not used in layout"
fi

# AC5: Global fonts configured
echo ""
echo "--- AC5: Global fonts ---"

if grep -q "next/font" app/layout.tsx 2>/dev/null; then
    pass "next/font imported"
else
    fail "next/font not imported"
fi

if grep -q "font.*variable\|className.*font\|--font" app/layout.tsx 2>/dev/null; then
    pass "Font variables applied"
else
    fail "Font variables not applied"
fi

# AC6: Global styles imported
echo ""
echo "--- AC6: Global styles ---"

if grep -q './globals.css"\|"./globals.css' app/layout.tsx 2>/dev/null; then
    pass "Global CSS imported"
else
    fail "Global CSS not imported"
fi

# AC7: ThemeProvider integrated
echo ""
echo "--- AC7: ThemeProvider (light/dark mode) ---"

if grep -q '"next-themes"' package.json 2>/dev/null; then
    pass "next-themes package installed"
else
    fail "next-themes package not installed"
fi

if [ -f "components/providers/ThemeProvider.tsx" ]; then
    pass "ThemeProvider component exists"
else
    fail "ThemeProvider component missing"
fi

if grep -q "ThemeProvider\|Providers" app/layout.tsx 2>/dev/null; then
    pass "ThemeProvider or Providers wrapper used in layout"
else
    fail "ThemeProvider not used in layout"
fi

# AC8: Providers component for organization
echo ""
echo "--- AC8: Providers organization ---"

if [ -f "components/providers/Providers.tsx" ] || [ -f "app/providers.tsx" ]; then
    pass "Providers wrapper component exists"
else
    # Check if providers are properly nested in layout
    if grep -q "QueryProvider" app/layout.tsx && grep -q "ThemeProvider" app/layout.tsx; then
        pass "Providers properly nested in layout"
    else
        fail "Providers wrapper or proper nesting missing"
    fi
fi

# AC9: Proper viewport meta
echo ""
echo "--- AC9: Viewport configuration ---"

if grep -q "viewport" app/layout.tsx 2>/dev/null; then
    pass "Viewport metadata configured"
else
    # Check for viewport in metadata
    if grep -q "Viewport\|themeColor" app/layout.tsx 2>/dev/null; then
        pass "Viewport or theme color configured"
    else
        fail "Viewport metadata not configured"
    fi
fi

# AC10: TypeScript and build check
echo ""
echo "--- AC10: Build verification ---"

if npm run build 2>&1 | grep -q "error TS\|Error:"; then
    fail "Build errors detected"
else
    pass "Build succeeds without errors"
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
