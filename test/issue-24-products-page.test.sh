#!/bin/bash
# Issue #24: Migrate Products Page
# TDD Test Script - Tests acceptance criteria

set -e

echo "=========================================="
echo "Issue #24: Products Page Migration Tests"
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
        echo "  PASSED"
        ((PASS_COUNT++))
    else
        echo "  FAILED"
        ((FAIL_COUNT++))
    fi
}

echo ""
echo "--- File Structure Tests ---"

# Test 1: Products page exists
run_test "Products page exists at app/products/page.tsx" \
    "[ -f app/products/page.tsx ]"

# Test 2: Products client component exists
run_test "Products client component exists" \
    "[ -f app/products/ProductsClient.tsx ]"

echo ""
echo "--- Products Page Content Tests ---"

# Test 3: Page exports metadata for SEO
run_test "Products page has metadata export" \
    "grep -q 'export const metadata' app/products/page.tsx"

# Test 4: Uses client component for interactivity
run_test "Products uses client component with 'use client'" \
    "grep -q \"'use client'\" app/products/ProductsClient.tsx"

# Test 5: Uses framer-motion for animations
run_test "Products client imports framer-motion" \
    "grep -q 'framer-motion' app/products/ProductsClient.tsx"

# Test 6: Uses lucide-react icons
run_test "Products client imports lucide-react icons" \
    "grep -q 'lucide-react' app/products/ProductsClient.tsx"

echo ""
echo "--- Products Component Features ---"

# Test 7: Has product features list
run_test "Products client has features array" \
    "grep -qE 'const features|features:' app/products/ProductsClient.tsx"

# Test 8: Has stats section
run_test "Products client has stats array" \
    "grep -qE 'const stats|stats:' app/products/ProductsClient.tsx"

# Test 9: Has Card component
run_test "Products client uses Card component" \
    "grep -q 'Card' app/products/ProductsClient.tsx"

# Test 10: Has Button component
run_test "Products client has Button component" \
    "grep -q 'Button' app/products/ProductsClient.tsx"

# Test 11: Uses Next.js Link instead of react-router-dom
run_test "Products uses Next.js Link component" \
    "grep -q \"from 'next/link'\" app/products/ProductsClient.tsx"

echo ""
echo "--- Build Tests ---"

# Test 12: TypeScript compiles without errors
run_test "TypeScript compiles without errors" \
    "npx tsc --noEmit"

# Test 13: Production build succeeds
run_test "Production build succeeds" \
    "npm run build"

echo ""
echo "=========================================="
echo "Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -eq 0 ]; then
    echo "All tests passed!"
    exit 0
else
    echo "Some tests failed"
    exit 1
fi
