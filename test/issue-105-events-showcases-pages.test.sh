#!/bin/bash
# Test script for Issue #105: Migrate Events & Showcases Pages
# Validates events and showcases listing and detail pages are properly migrated

set -e

echo "Testing Issue #105: Events & Showcases Pages Migration"
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

# Events Tests
echo ""
echo "--- Events Page Tests ---"

# Test 1: Events listing page exists
check "Events listing page exists" \
    "$([ -f "app/events/page.tsx" ] && echo true || echo false)"

# Test 2: Events listing client component exists
check "Events listing client component exists" \
    "$([ -f "app/events/EventsCalendarClient.tsx" ] && echo true || echo false)"

# Test 3: Events listing has metadata
check "Events listing has metadata export" \
    "$(grep -q 'export const metadata' app/events/page.tsx && echo true || echo false)"

# Test 4: Events uses Strapi client
check "Events listing uses Strapi client" \
    "$(grep -q 'getEvents' app/events/EventsCalendarClient.tsx && echo true || echo false)"

# Test 5: Events has tabs for Upcoming/Past
check "Events has tabs component" \
    "$(grep -q 'Tabs' app/events/EventsCalendarClient.tsx && echo true || echo false)"

# Test 6: Events has date formatting
check "Events has date display" \
    "$(grep -q 'toLocaleDateString' app/events/EventsCalendarClient.tsx && echo true || echo false)"

# Showcases Tests
echo ""
echo "--- Showcases Page Tests ---"

# Test 7: Showcases listing page exists
check "Showcases listing page exists" \
    "$([ -f "app/showcases/page.tsx" ] && echo true || echo false)"

# Test 8: Showcases listing client component exists
check "Showcases listing client component exists" \
    "$([ -f "app/showcases/ShowcaseListingClient.tsx" ] && echo true || echo false)"

# Test 9: Showcase detail page exists
check "Showcase detail page exists" \
    "$([ -f "app/showcases/[slug]/page.tsx" ] && echo true || echo false)"

# Test 10: Showcase detail client component exists
check "Showcase detail client component exists" \
    "$([ -f "app/showcases/[slug]/ShowcaseDetailClient.tsx" ] && echo true || echo false)"

# Test 11: Showcases listing has metadata
check "Showcases listing has metadata export" \
    "$(grep -q 'export const metadata' app/showcases/page.tsx && echo true || echo false)"

# Test 12: Showcase detail has generateMetadata
check "Showcase detail has generateMetadata" \
    "$(grep -q 'generateMetadata' app/showcases/[slug]/page.tsx && echo true || echo false)"

# Test 13: Showcases uses Strapi client
check "Showcases listing uses Strapi client" \
    "$(grep -q 'getShowcases' app/showcases/ShowcaseListingClient.tsx && echo true || echo false)"

# Test 14: Showcase detail uses getShowcase
check "Showcase detail uses getShowcase" \
    "$(grep -q 'getShowcase' app/showcases/[slug]/ShowcaseDetailClient.tsx && echo true || echo false)"

# Test 15: Showcases uses Unsplash helper
check "Showcases listing uses Unsplash helper" \
    "$(grep -q 'getUnsplashImageUrl' app/showcases/ShowcaseListingClient.tsx && echo true || echo false)"

# Test 16: Showcases has semantic search
check "Showcases listing has semantic search" \
    "$(grep -q 'searchCommunityContent' app/showcases/ShowcaseListingClient.tsx && echo true || echo false)"

# Test 17: Showcases has tech stack filter
check "Showcases has tech stack filter" \
    "$(grep -q 'tech_stack' app/showcases/ShowcaseListingClient.tsx && echo true || echo false)"

# Test 18: Showcase detail has tabs
check "Showcase detail has tabs" \
    "$(grep -q 'Tabs' app/showcases/[slug]/ShowcaseDetailClient.tsx && echo true || echo false)"

# UI Component Tests
echo ""
echo "--- UI Component Tests ---"

# Test 19: Switch component exists
check "Switch component exists" \
    "$([ -f "components/ui/switch.tsx" ] && echo true || echo false)"

# Test 20: Label component exists
check "Label component exists" \
    "$([ -f "components/ui/label.tsx" ] && echo true || echo false)"

# Test 21: Separator component exists
check "Separator component exists" \
    "$([ -f "components/ui/separator.tsx" ] && echo true || echo false)"

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
check "Events route in build" \
    "$(npm run build 2>&1 | grep -q '/events' && echo true || echo false)"

check "Showcases route in build" \
    "$(npm run build 2>&1 | grep -q '/showcases' && echo true || echo false)"

echo ""
echo "======================================================="
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
    exit 1
fi

echo "All tests passed!"
exit 0
