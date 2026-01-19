#!/bin/bash
# Test script for Issue #366 - Unsplash Integration Verification
# Tests stock image integration for blog/content

set -e

echo "======================================"
echo "Issue #366: Unsplash Integration"
echo "======================================"
echo ""

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_result() {
    if [ $1 -eq 0 ]; then
        echo "✓ PASS: $2"
        ((TESTS_PASSED++))
    else
        echo "✗ FAIL: $2"
        ((TESTS_FAILED++))
    fi
}

# 1. Verify lib/unsplash.ts exists
echo "Test 1: File existence..."
if [ -f "lib/unsplash.ts" ]; then
    test_result 0 "lib/unsplash.ts exists"
else
    test_result 1 "lib/unsplash.ts not found"
fi

# 2. Verify function exports
echo "Test 2: Function exports..."
if grep -q "export function getUnsplashImageUrl" lib/unsplash.ts; then
    test_result 0 "getUnsplashImageUrl function exported"
else
    test_result 1 "getUnsplashImageUrl not found"
fi

# 3. Verify blog integration
echo "Test 3: Blog integration..."
if grep -q "getUnsplashImageUrl" app/blog/BlogListingClient.tsx; then
    test_result 0 "BlogListingClient uses Unsplash"
else
    test_result 1 "BlogListingClient missing Unsplash"
fi

if grep -q "getUnsplashImageUrl" app/blog/\[slug\]/BlogDetailClient.tsx; then
    test_result 0 "BlogDetailClient uses Unsplash"
else
    test_result 1 "BlogDetailClient missing Unsplash"
fi

# 4. Verify Next.js config
echo "Test 4: Next.js configuration..."
if grep -q "images.unsplash.com" next.config.ts; then
    test_result 0 "images.unsplash.com configured"
else
    test_result 1 "images.unsplash.com not configured"
fi

# Summary
echo ""
echo "======================================"
echo "Summary: $TESTS_PASSED passed, $TESTS_FAILED failed"
echo "======================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ All tests passed!"
    exit 0
else
    echo "✗ Some tests failed"
    exit 1
fi
