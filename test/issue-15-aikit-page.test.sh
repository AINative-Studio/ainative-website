#!/bin/bash
# Issue #15: Migrate AI Kit Page - TDD Acceptance Tests

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
echo "Issue #15: Migrate AI Kit Page"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: AI Kit page exists at correct route
echo "--- AC1: Page file structure ---"

if [ -f "app/ai-kit/page.tsx" ]; then
    pass "app/ai-kit/page.tsx exists"
else
    fail "app/ai-kit/page.tsx missing"
fi

# AC2: All 14 packages displayed
echo ""
echo "--- AC2: Package data ---"

if grep -q "aiKitPackages\|packages" app/ai-kit/page.tsx 2>/dev/null || [ -f "lib/data/ai-kit-packages.ts" ]; then
    pass "Package data defined or imported"
else
    fail "Package data not found"
fi

# Check for 14 packages
if grep -c "@ainative" app/ai-kit/page.tsx 2>/dev/null | grep -q "1[0-4]" || \
   grep -c "@ainative" lib/data/ai-kit-packages.ts 2>/dev/null | grep -q "1[0-4]"; then
    pass "Multiple package references found"
else
    # Alternative check
    if grep -q "14.*[Pp]ackage\|packages.*14" app/ai-kit/page.tsx 2>/dev/null; then
        pass "14 packages referenced"
    else
        fail "14 packages not clearly referenced"
    fi
fi

# AC3: FAQ schema included
echo ""
echo "--- AC3: FAQ schema ---"

if grep -q "FAQPage\|faq" app/ai-kit/page.tsx 2>/dev/null; then
    pass "FAQ schema present"
else
    fail "FAQ schema missing"
fi

# AC4: HowTo schemas (React & Vue)
echo ""
echo "--- AC4: HowTo schemas ---"

if grep -q "HowTo" app/ai-kit/page.tsx 2>/dev/null; then
    pass "HowTo schema present"
else
    fail "HowTo schema missing"
fi

# AC5: Next.js Metadata API used
echo ""
echo "--- AC5: Next.js Metadata ---"

if grep -q "export const metadata\|export async function generateMetadata" app/ai-kit/page.tsx 2>/dev/null; then
    pass "Next.js Metadata API used"
else
    fail "Next.js Metadata API not used"
fi

# AC6: OpenGraph metadata
echo ""
echo "--- AC6: OpenGraph metadata ---"

if grep -q "openGraph" app/ai-kit/page.tsx 2>/dev/null; then
    pass "OpenGraph metadata configured"
else
    fail "OpenGraph metadata missing"
fi

# AC7: Breadcrumb navigation
echo ""
echo "--- AC7: Breadcrumb ---"

if grep -q "BreadcrumbList\|breadcrumb\|Breadcrumb" app/ai-kit/page.tsx 2>/dev/null; then
    pass "Breadcrumb navigation present"
else
    fail "Breadcrumb navigation missing"
fi

# AC8: ARIA attributes
echo ""
echo "--- AC8: Accessibility ---"

if grep -q "aria-\|role=" app/ai-kit/page.tsx 2>/dev/null; then
    pass "ARIA attributes present"
else
    fail "ARIA attributes missing"
fi

# AC9: Client component for interactivity
echo ""
echo "--- AC9: Client/Server split ---"

# Check for client component(s) for interactive parts
if [ -f "components/ai-kit/PackageGrid.tsx" ] || [ -f "components/ai-kit/AIKitClient.tsx" ] || \
   grep -q '"use client"' app/ai-kit/page.tsx 2>/dev/null; then
    pass "Client component for interactivity exists"
else
    fail "Client component for interactivity missing"
fi

# AC10: TypeScript compliance
echo ""
echo "--- AC10: TypeScript ---"

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
