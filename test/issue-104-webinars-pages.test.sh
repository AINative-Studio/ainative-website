#!/bin/bash
# Test script for Issue #104: Migrate Webinars Pages
# Validates webinar listing and detail pages are properly migrated

set -e

echo "Testing Issue #104: Webinars Pages Migration"
echo "=============================================="

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

# Test 1: Webinars listing page exists
check "Webinars listing page exists" \
    "$([ -f "app/webinars/page.tsx" ] && echo true || echo false)"

# Test 2: Webinars listing client component exists
check "Webinars listing client component exists" \
    "$([ -f "app/webinars/WebinarListingClient.tsx" ] && echo true || echo false)"

# Test 3: Webinar detail page exists
check "Webinar detail page exists" \
    "$([ -f "app/webinars/[slug]/page.tsx" ] && echo true || echo false)"

# Test 4: Webinar detail client component exists
check "Webinar detail client component exists" \
    "$([ -f "app/webinars/[slug]/WebinarDetailClient.tsx" ] && echo true || echo false)"

# Test 5: Webinars listing has metadata
check "Webinars listing has metadata export" \
    "$(grep -q 'export const metadata' app/webinars/page.tsx && echo true || echo false)"

# Test 6: Webinar detail has generateMetadata
check "Webinar detail has generateMetadata" \
    "$(grep -q 'generateMetadata' app/webinars/[slug]/page.tsx && echo true || echo false)"

# Test 7: Uses Strapi client
check "Webinars listing uses Strapi client" \
    "$(grep -q 'getWebinars' app/webinars/WebinarListingClient.tsx && echo true || echo false)"

# Test 8: Webinar detail uses getWebinar
check "Webinar detail uses getWebinar" \
    "$(grep -q 'getWebinar' app/webinars/[slug]/WebinarDetailClient.tsx && echo true || echo false)"

# Test 9: Uses Unsplash helper
check "Webinars listing uses Unsplash helper" \
    "$(grep -q 'getUnsplashImageUrl' app/webinars/WebinarListingClient.tsx && echo true || echo false)"

# Test 10: Has semantic search integration
check "Webinars listing has semantic search" \
    "$(grep -q 'searchCommunityContent' app/webinars/WebinarListingClient.tsx && echo true || echo false)"

# Test 11: Tabs component exists
check "Tabs component exists" \
    "$([ -f "components/ui/tabs.tsx" ] && echo true || echo false)"

# Test 12: Has status badges
check "Webinars listing has status badges" \
    "$(grep -q 'getStatusBadge' app/webinars/WebinarListingClient.tsx && echo true || echo false)"

# Test 13: Has date filter tabs
check "Webinars listing has date filter tabs" \
    "$(grep -q 'dateFilter' app/webinars/WebinarListingClient.tsx && echo true || echo false)"

# Test 14: Webinar detail has speaker info
check "Webinar detail has speaker info" \
    "$(grep -q 'speaker' app/webinars/[slug]/WebinarDetailClient.tsx && echo true || echo false)"

# Test 15: Webinar detail has learning outcomes
check "Webinar detail has learning outcomes" \
    "$(grep -q 'learning_outcomes' app/webinars/[slug]/WebinarDetailClient.tsx && echo true || echo false)"

# Test 16: Build succeeds
echo ""
echo "Running build test..."
if npm run build > /dev/null 2>&1; then
    check "Build succeeds" "true"
else
    check "Build succeeds" "false"
fi

# Test 17: Webinars route in build output
check "Webinars route in build" \
    "$(npm run build 2>&1 | grep -q '/webinars' && echo true || echo false)"

echo ""
echo "=============================================="
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
    exit 1
fi

echo "All tests passed!"
exit 0
