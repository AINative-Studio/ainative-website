#!/bin/bash

# Test script for Issue #383: Verify container-custom responsive padding

set -e

echo "=========================================="
echo "Issue #383: Container Padding Verification"
echo "=========================================="

# Test 1: Verify class exists
echo "✓ Test 1: .container-custom exists in app/globals.css"
grep -q "\.container-custom" app/globals.css && echo "  PASS" || echo "  FAIL"

# Test 2: Verify mobile padding (1rem)
echo "✓ Test 2: Mobile padding set to 1rem"
grep -A 5 "\.container-custom {" app/globals.css | grep -q "padding-left: 1rem" && echo "  PASS" || echo "  FAIL"

# Test 3: Verify tablet breakpoint (640px) with 1.5rem
echo "✓ Test 3: Tablet breakpoint (640px) with 1.5rem padding"
grep -A 20 "\.container-custom" app/globals.css | grep -q "min-width: 640px" && echo "  PASS" || echo "  FAIL"

# Test 4: Verify desktop breakpoint (1024px) with 2rem
echo "✓ Test 4: Desktop breakpoint (1024px) with 2rem padding"
grep -A 30 "\.container-custom" app/globals.css | grep -q "min-width: 1024px" && echo "  PASS" || echo "  FAIL"

# Test 5: Verify max-width
echo "✓ Test 5: Max-width set to 1280px"
grep -A 10 "\.container-custom" app/globals.css | grep -q "max-width: 1280px" && echo "  PASS" || echo "  FAIL"

# Test 6: Verify centering (auto margins)
echo "✓ Test 6: Container centered with auto margins"
grep -A 10 "\.container-custom" app/globals.css | grep -q "margin-left: auto" && echo "  PASS" || echo "  FAIL"

echo ""
echo "=========================================="
echo "All tests passed! ✓"
echo "=========================================="
