#!/bin/bash
# Story #45: UI Components Migration Tests
# Tests for shadcn/ui components with proper client/server classification
# Part of Sprint 2 - Component Migration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# Test helper function
test_pass() {
    echo -e "${GREEN}PASS${NC}: $1"
    ((PASS_COUNT++))
}

test_fail() {
    echo -e "${RED}FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

test_skip() {
    echo -e "${YELLOW}SKIP${NC}: $1"
}

echo "========================================"
echo "Story #45: UI Components Migration Tests"
echo "========================================"
echo ""

# ====================
# FILE STRUCTURE TESTS
# ====================
echo "--- File Structure Tests ---"

# Test 1: UI components directory exists
if [ -d "components/ui" ]; then
    test_pass "UI components directory exists at components/ui"
else
    test_fail "UI components directory not found"
fi

# Test 2: All expected UI components exist
EXPECTED_COMPONENTS=("accordion" "alert" "avatar" "badge" "breadcrumb" "button" "card" "dialog" "input" "label" "progress" "select" "separator" "skeleton" "switch" "tabs" "textarea" "tooltip")
MISSING=""
for comp in "${EXPECTED_COMPONENTS[@]}"; do
    if [ ! -f "components/ui/${comp}.tsx" ]; then
        MISSING="$MISSING $comp"
    fi
done

if [ -z "$MISSING" ]; then
    test_pass "All 18 expected UI components exist"
else
    test_fail "Missing UI components:$MISSING"
fi

# ====================
# CLIENT COMPONENT TESTS
# ====================
echo ""
echo "--- Client Component Tests ---"

# These components MUST have 'use client' directive (they use Radix UI with state)
CLIENT_COMPONENTS=("accordion" "avatar" "breadcrumb" "dialog" "label" "progress" "select" "separator" "switch" "tabs" "tooltip")

for comp in "${CLIENT_COMPONENTS[@]}"; do
    if grep -qE "^['\"]use client['\"]" "components/ui/${comp}.tsx" 2>/dev/null; then
        test_pass "${comp}.tsx has 'use client' directive"
    else
        test_fail "${comp}.tsx missing 'use client' directive (interactive Radix component)"
    fi
done

# ====================
# SERVER COMPONENT TESTS
# ====================
echo ""
echo "--- Server Component Tests ---"

# These components should NOT have 'use client' (they are presentational only)
SERVER_COMPONENTS=("alert" "badge" "button" "card" "input" "skeleton" "textarea")

for comp in "${SERVER_COMPONENTS[@]}"; do
    if grep -qE "^['\"]use client['\"]" "components/ui/${comp}.tsx" 2>/dev/null; then
        test_fail "${comp}.tsx has unnecessary 'use client' directive (should be server component)"
    else
        test_pass "${comp}.tsx correctly has no 'use client' (server component)"
    fi
done

# ====================
# RADIX UI INTEGRATION TESTS
# ====================
echo ""
echo "--- Radix UI Integration Tests ---"

# Test: Interactive components import from Radix UI
# Note: breadcrumb uses custom implementation with usePathname, not Radix primitives
RADIX_COMPONENTS=("accordion" "avatar" "dialog" "label" "progress" "select" "separator" "switch" "tabs" "tooltip")

for comp in "${RADIX_COMPONENTS[@]}"; do
    if grep -q "@radix-ui/react-${comp}" "components/ui/${comp}.tsx" 2>/dev/null; then
        test_pass "${comp}.tsx imports from @radix-ui/react-${comp}"
    else
        test_fail "${comp}.tsx missing Radix UI import"
    fi
done

# Test: Breadcrumb uses usePathname for route-based generation
if grep -q "usePathname" "components/ui/breadcrumb.tsx" 2>/dev/null; then
    test_pass "breadcrumb.tsx uses usePathname for route-based generation"
else
    test_fail "breadcrumb.tsx missing usePathname hook"
fi

# Test: Button uses Slot for polymorphism (but no state)
if grep -q "@radix-ui/react-slot" "components/ui/button.tsx" 2>/dev/null; then
    test_pass "button.tsx uses @radix-ui/react-slot for polymorphism"
else
    test_fail "button.tsx missing @radix-ui/react-slot"
fi

# ====================
# STYLING TESTS
# ====================
echo ""
echo "--- Styling Integration Tests ---"

# Test: Components use cn() utility for className merging
CN_COUNT=0
for file in components/ui/*.tsx; do
    if grep -q 'cn(' "$file" 2>/dev/null; then
        ((CN_COUNT++))
    fi
done

if [ $CN_COUNT -ge 15 ]; then
    test_pass "Components use cn() utility ($CN_COUNT components)"
else
    test_fail "Not enough components using cn() utility (found $CN_COUNT, expected 15+)"
fi

# Test: Components use class-variance-authority for variants
CVA_COUNT=0
for file in components/ui/*.tsx; do
    if grep -q 'cva\|VariantProps' "$file" 2>/dev/null; then
        ((CVA_COUNT++))
    fi
done

if [ $CVA_COUNT -ge 3 ]; then
    test_pass "Components use class-variance-authority for variants ($CVA_COUNT components)"
else
    test_fail "Not enough components using cva (found $CVA_COUNT, expected 3+)"
fi

# ====================
# EXPORT PATTERN TESTS
# ====================
echo ""
echo "--- Export Pattern Tests ---"

# Test: Components use proper React.forwardRef pattern
FORWARD_REF_COUNT=0
for file in components/ui/*.tsx; do
    if grep -q 'React.forwardRef\|forwardRef' "$file" 2>/dev/null; then
        ((FORWARD_REF_COUNT++))
    fi
done

if [ $FORWARD_REF_COUNT -ge 10 ]; then
    test_pass "Components use forwardRef pattern ($FORWARD_REF_COUNT components)"
else
    test_fail "Not enough components using forwardRef (found $FORWARD_REF_COUNT, expected 10+)"
fi

# Test: Components have displayName for DevTools
DISPLAY_NAME_COUNT=0
for file in components/ui/*.tsx; do
    if grep -q 'displayName' "$file" 2>/dev/null; then
        ((DISPLAY_NAME_COUNT++))
    fi
done

if [ $DISPLAY_NAME_COUNT -ge 10 ]; then
    test_pass "Components have displayName for DevTools ($DISPLAY_NAME_COUNT components)"
else
    test_fail "Not enough components with displayName (found $DISPLAY_NAME_COUNT, expected 10+)"
fi

# ====================
# TYPESCRIPT TESTS
# ====================
echo ""
echo "--- TypeScript Integration Tests ---"

# Test: Components export proper TypeScript types
TYPE_EXPORT_COUNT=0
for file in components/ui/*.tsx; do
    if grep -q 'React.ComponentPropsWithoutRef\|React.HTMLAttributes\|interface\|type.*=' "$file" 2>/dev/null; then
        ((TYPE_EXPORT_COUNT++))
    fi
done

if [ $TYPE_EXPORT_COUNT -ge 15 ]; then
    test_pass "Components have proper TypeScript types ($TYPE_EXPORT_COUNT components)"
else
    test_fail "Not enough components with TypeScript types (found $TYPE_EXPORT_COUNT, expected 15+)"
fi

# ====================
# IMPORT PATH TESTS
# ====================
echo ""
echo "--- Import Path Tests ---"

# Test: Components use @/lib/utils import
UTILS_IMPORT_COUNT=0
for file in components/ui/*.tsx; do
    if grep -q "@/lib/utils" "$file" 2>/dev/null; then
        ((UTILS_IMPORT_COUNT++))
    fi
done

if [ $UTILS_IMPORT_COUNT -ge 15 ]; then
    test_pass "Components import from @/lib/utils ($UTILS_IMPORT_COUNT components)"
else
    test_fail "Not enough components importing from @/lib/utils (found $UTILS_IMPORT_COUNT, expected 15+)"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test: Project builds successfully with UI components
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with UI components"
else
    test_fail "Project build failed"
    echo "Build output (last 20 lines):"
    tail -20 /tmp/build_output.txt
fi

# ====================
# SUMMARY
# ====================
echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo -e "Passed: ${GREEN}${PASS_COUNT}${NC}"
echo -e "Failed: ${RED}${FAIL_COUNT}${NC}"
echo ""

TOTAL=$((PASS_COUNT + FAIL_COUNT))
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All $TOTAL tests passed!${NC}"
    exit 0
else
    echo -e "${RED}$FAIL_COUNT of $TOTAL tests failed${NC}"
    exit 1
fi
