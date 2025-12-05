#!/bin/bash
# Issue #20: Set Up Font Optimization
# TDD Test Script - Tests acceptance criteria

set -e

echo "=========================================="
echo "Issue #20: Font Optimization Tests"
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
echo "--- next/font Configuration Tests ---"

# Test 1: Layout uses next/font/google
run_test "Layout imports from next/font/google" \
    "grep -q 'next/font/google' app/layout.tsx"

# Test 2: Font is configured with subsets
run_test "Font configured with subsets" \
    "grep -q 'subsets' app/layout.tsx"

# Test 3: Font has CSS variable configured
run_test "Font has CSS variable" \
    "grep -q 'variable:' app/layout.tsx"

# Test 4: Font variable applied to body
run_test "Font variable applied to body" \
    "grep -qE 'className.*font|variable' app/layout.tsx"

echo ""
echo "--- Font Display Tests ---"

# Test 5: Display swap configured for better FOUT handling
run_test "Display swap configured for FOUT optimization" \
    "grep -q 'display.*swap' app/layout.tsx"

echo ""
echo "--- Font Fallback Tests ---"

# Test 6: Tailwind v4 CSS config uses font variables
run_test "Tailwind CSS config uses font variables" \
    "grep -qE 'font-sans|font-mono|font-geist' app/globals.css"

echo ""
echo "--- Build Tests ---"

# Test 7: TypeScript compiles without errors
run_test "TypeScript compiles without errors" \
    "npx tsc --noEmit"

# Test 8: Build succeeds
run_test "Production build succeeds" \
    "npm run build"

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
