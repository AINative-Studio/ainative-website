#!/bin/bash
# Test script for Issue #106: Migrate Resources & Search Pages
# TDD: Run this first to see FAILING tests, then implement to make them pass

set -e

echo "Testing Issue #106: Resources & Search Pages Migration"
echo "======================================================="

PASS=0
FAIL=0

check() {
    local name="$1"
    local result="$2"
    if [ "$result" = "true" ]; then
        echo "PASS $name"
        PASS=$((PASS+1))
    else
        echo "FAIL $name"
        FAIL=$((FAIL+1))
    fi
    return 0
}

# Resources Page Tests
echo ""
echo "--- Resources Page Tests ---"

# Test 1: Resources listing page exists
check "Resources listing page exists" \
    "$([ -f "app/resources/page.tsx" ] && echo true || echo false)"

# Test 2: Resources listing client component exists
check "Resources listing client component exists" \
    "$([ -f "app/resources/ResourcesClient.tsx" ] && echo true || echo false)"

# Test 3: Resources listing has metadata
check "Resources listing has metadata export" \
    "$(grep -q 'export const metadata' app/resources/page.tsx 2>/dev/null && echo true || echo false)"

# Test 4: Resources has type filter
check "Resources has type filter" \
    "$(grep -q 'resource_type' app/resources/ResourcesClient.tsx 2>/dev/null && echo true || echo false)"

# Test 5: Resources has search functionality
check "Resources has search functionality" \
    "$(grep -q 'searchQuery' app/resources/ResourcesClient.tsx 2>/dev/null && echo true || echo false)"

# Test 6: Resources has mock data
check "Resources has mock data" \
    "$(grep -q 'mockResources' app/resources/ResourcesClient.tsx 2>/dev/null && echo true || echo false)"

# Search Page Tests
echo ""
echo "--- Search Page Tests ---"

# Test 7: Search page exists
check "Search page exists" \
    "$([ -f "app/search/page.tsx" ] && echo true || echo false)"

# Test 8: Search client component exists
check "Search client component exists" \
    "$([ -f "app/search/SearchClient.tsx" ] && echo true || echo false)"

# Test 9: Search page has metadata
check "Search page has metadata export" \
    "$(grep -q 'export const metadata' app/search/page.tsx 2>/dev/null && echo true || echo false)"

# Test 10: Search uses semantic search
check "Search uses semantic search" \
    "$(grep -q 'searchCommunityContent' app/search/SearchClient.tsx 2>/dev/null && echo true || echo false)"

# Test 11: Search has content type filter
check "Search has content type filter" \
    "$(grep -q 'contentType' app/search/SearchClient.tsx 2>/dev/null && echo true || echo false)"

# Test 12: Search has debouncing
check "Search has debounce" \
    "$(grep -q 'setTimeout' app/search/SearchClient.tsx 2>/dev/null && echo true || echo false)"

# Test 13: Search displays similarity scores
check "Search displays similarity" \
    "$(grep -q 'similarity' app/search/SearchClient.tsx 2>/dev/null && echo true || echo false)"

# UI Component Tests
echo ""
echo "--- UI Component Tests ---"

# Test 14: Select component exists
check "Select component exists" \
    "$([ -f "components/ui/select.tsx" ] && echo true || echo false)"

# Build Test
echo ""
echo "--- Build Test ---"
echo "Running build test..."
if npm run build > /dev/null 2>&1; then
    check "Build succeeds" "true"
else
    check "Build succeeds" "false"
fi

# Route verification
check "Resources route in build" \
    "$(npm run build 2>&1 | grep -q '/resources' && echo true || echo false)"

check "Search route in build" \
    "$(npm run build 2>&1 | grep -q '/search' && echo true || echo false)"

echo ""
echo "======================================================="
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
    exit 1
fi

echo "All tests passed!"
exit 0
