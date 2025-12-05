#!/bin/bash
# Issue #19: Implement Breadcrumb Component
# TDD Test Script - Tests acceptance criteria

set -e

echo "=========================================="
echo "Issue #19: Breadcrumb Component Tests"
echo "=========================================="

PASS_COUNT=0
FAIL_COUNT=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo ""
    echo "TEST: $test_name"
    if eval "$test_command" > /dev/null 2>&1; then
        echo "  ✅ PASSED"
        ((PASS_COUNT++))
    else
        echo "  ❌ FAILED"
        ((FAIL_COUNT++))
    fi
}

echo ""
echo "--- Component Structure Tests ---"

# Test 1: Breadcrumb component exists
run_test "Breadcrumb component exists" \
    "test -f components/ui/breadcrumb.tsx"

# Test 2: Breadcrumb uses 'use client' directive
run_test "Breadcrumb has 'use client' directive" \
    "head -1 components/ui/breadcrumb.tsx | grep -q 'use client'"

# Test 3: Breadcrumb uses usePathname hook
run_test "Breadcrumb uses usePathname hook" \
    "grep -q 'usePathname' components/ui/breadcrumb.tsx"

echo ""
echo "--- Schema.org Microdata Tests ---"

# Test 4: Breadcrumb has BreadcrumbList itemscope
run_test "BreadcrumbList schema type present" \
    "grep -q 'BreadcrumbList' components/ui/breadcrumb.tsx"

# Test 5: Breadcrumb has ListItem itemtype
run_test "ListItem schema type present" \
    "grep -q 'ListItem' components/ui/breadcrumb.tsx"

# Test 6: itemscope attribute used
run_test "itemscope attribute used" \
    "grep -q 'itemScope' components/ui/breadcrumb.tsx"

# Test 7: itemtype attribute used
run_test "itemtype attribute used" \
    "grep -q 'itemType' components/ui/breadcrumb.tsx"

# Test 8: itemprop attribute used
run_test "itemprop attribute used" \
    "grep -q 'itemProp' components/ui/breadcrumb.tsx"

echo ""
echo "--- Accessibility Tests ---"

# Test 9: Has nav element with aria-label
run_test "Nav element with aria-label" \
    "grep -q 'aria-label' components/ui/breadcrumb.tsx"

# Test 10: Uses semantic ol/li elements
run_test "Uses ordered list (ol) element" \
    "grep -q '<ol' components/ui/breadcrumb.tsx"

echo ""
echo "--- Styling Tests ---"

# Test 11: Uses Tailwind classes for styling
run_test "Uses Tailwind classes" \
    "grep -q 'className' components/ui/breadcrumb.tsx"

# Test 12: Includes separator between items
run_test "Includes separator (chevron or slash)" \
    "grep -qE 'ChevronRight|/|›|>' components/ui/breadcrumb.tsx"

echo ""
echo "--- TypeScript Tests ---"

# Test 13: TypeScript compiles without errors
run_test "TypeScript compiles without errors" \
    "npx tsc --noEmit"

echo ""
echo "=========================================="
echo "Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
