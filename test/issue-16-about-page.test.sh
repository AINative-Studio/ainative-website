#!/bin/bash
# Issue #16: Migrate About Page - TDD Acceptance Tests

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
echo "Issue #16: Migrate About Page"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: About page exists
echo "--- AC1: Page file structure ---"

if [ -f "app/about/page.tsx" ]; then
    pass "app/about/page.tsx exists"
else
    fail "app/about/page.tsx missing"
fi

# AC2: Company mission/vision section
echo ""
echo "--- AC2: Mission/Vision section ---"

if grep -qi "mission\|vision" app/about/page.tsx 2>/dev/null; then
    pass "Mission/vision content present"
else
    fail "Mission/vision content missing"
fi

# AC3: Values section
echo ""
echo "--- AC3: Values section ---"

if grep -qi "values\|innovation\|security\|community" app/about/page.tsx 2>/dev/null; then
    pass "Values section present"
else
    fail "Values section missing"
fi

# AC4: Technology stack section
echo ""
echo "--- AC4: Technology stack ---"

if grep -qi "technology\|stack\|TypeScript\|Python" app/about/page.tsx 2>/dev/null; then
    pass "Technology stack section present"
else
    fail "Technology stack section missing"
fi

# AC5: Meta tags
echo ""
echo "--- AC5: Next.js Metadata ---"

if grep -q "export const metadata\|export async function generateMetadata" app/about/page.tsx 2>/dev/null; then
    pass "Next.js Metadata API used"
else
    fail "Next.js Metadata API not used"
fi

# AC6: OpenGraph metadata
echo ""
echo "--- AC6: OpenGraph metadata ---"

if grep -q "openGraph" app/about/page.tsx 2>/dev/null; then
    pass "OpenGraph metadata configured"
else
    fail "OpenGraph metadata missing"
fi

# AC7: Responsive layout
echo ""
echo "--- AC7: Responsive design ---"

if grep -q "md:\|lg:\|sm:" app/about/page.tsx 2>/dev/null; then
    pass "Responsive Tailwind classes present"
else
    fail "Responsive Tailwind classes missing"
fi

# AC8: TypeScript compliance
echo ""
echo "--- AC8: TypeScript ---"

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
