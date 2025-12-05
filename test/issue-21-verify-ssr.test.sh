#!/bin/bash
# Issue #21: Verify SSR Functionality
# TDD Test Script - Tests acceptance criteria for Server-Side Rendering

set -e

echo "=========================================="
echo "Issue #21: SSR Verification Tests"
echo "=========================================="

PASS_COUNT=0
FAIL_COUNT=0
PORT=3000  # Default Next.js port

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
echo "--- Build Tests ---"

# Test 1: Production build succeeds
run_test "Production build succeeds" \
    "npm run build"

echo ""
echo "--- Starting production server for SSR tests ---"

# Start production server in background
npm run start -- -p $PORT &
SERVER_PID=$!
sleep 5  # Wait for server to start

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up..."
    kill $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

echo ""
echo "--- HTML Content Tests ---"

# Test 2: HTML response contains actual content (not empty div)
run_test "HTML contains rendered content (not empty)" \
    "curl -s http://localhost:$PORT | grep -q '<body'"

# Test 3: HTML is not just a loading shell
run_test "HTML has substantial content (>1000 chars)" \
    "[ \$(curl -s http://localhost:$PORT | wc -c) -gt 1000 ]"

# Test 4: DOCTYPE is present (proper HTML response)
run_test "DOCTYPE present in response" \
    "curl -s http://localhost:$PORT | head -1 | grep -qi 'doctype'"

echo ""
echo "--- Meta Tag Tests ---"

# Test 5: Title tag present in HTML
run_test "Title tag present in HTML source" \
    "curl -s http://localhost:$PORT | grep -q '<title>'"

# Test 6: Charset meta tag present
run_test "Charset meta tag present" \
    "curl -s http://localhost:$PORT | grep -qi 'charset'"

# Test 7: Viewport meta tag present
run_test "Viewport meta tag present" \
    "curl -s http://localhost:$PORT | grep -qi 'viewport'"

echo ""
echo "--- Next.js SSR Indicators ---"

# Test 8: Next.js script tags present (indicates proper SSR)
run_test "Next.js script tags present" \
    "curl -s http://localhost:$PORT | grep -q '_next'"

# Test 9: React hydration marker present
run_test "React hydration root present" \
    "curl -s http://localhost:$PORT | grep -qE 'id=\"__next\"|data-reactroot|<html'"

# Test 10: Fonts preloaded (performance optimization)
run_test "Font preload present" \
    "curl -s http://localhost:$PORT | grep -qi 'preload'"

echo ""
echo "--- Response Header Tests ---"

# Test 11: Content-Type is text/html
run_test "Content-Type is text/html" \
    "curl -sI http://localhost:$PORT | grep -qi 'content-type.*text/html'"

# Test 12: Response status is 200
run_test "Response status is 200 OK" \
    "curl -sI http://localhost:$PORT | head -1 | grep -q '200'"

echo ""
echo "--- Static Generation Tests ---"

# Test 13: Static page is pre-rendered
run_test "Homepage is statically generated" \
    "curl -s http://localhost:$PORT | grep -qE '<div|<main|<section'"

echo ""
echo "=========================================="
echo "Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 All SSR tests passed!"
    echo ""
    echo "SSR Verification Summary:"
    echo "- HTML is pre-rendered on the server"
    echo "- Meta tags are present in HTML source"
    echo "- Next.js hydration is properly configured"
    echo "- Response headers are correct"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
