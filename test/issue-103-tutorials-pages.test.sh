#!/bin/bash
# Test script for Issue #103: Migrate Tutorials Pages
# Validates tutorials listing and detail pages are properly migrated

set -e

echo "Testing Issue #103: Tutorials Pages Migration"
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

# Test 1: Tutorials listing page exists
check "Tutorials listing page exists" \
    "$([ -f "app/tutorials/page.tsx" ] && echo true || echo false)"

# Test 2: Tutorials listing client component exists
check "Tutorials listing client component exists" \
    "$([ -f "app/tutorials/TutorialListingClient.tsx" ] && echo true || echo false)"

# Test 3: Tutorial detail page exists
check "Tutorial detail page exists" \
    "$([ -f "app/tutorials/[slug]/page.tsx" ] && echo true || echo false)"

# Test 4: Tutorial detail client component exists
check "Tutorial detail client component exists" \
    "$([ -f "app/tutorials/[slug]/TutorialDetailClient.tsx" ] && echo true || echo false)"

# Test 5: Tutorials listing has metadata
check "Tutorials listing has metadata export" \
    "$(grep -q 'export const metadata' app/tutorials/page.tsx && echo true || echo false)"

# Test 6: Tutorial detail has generateMetadata
check "Tutorial detail has generateMetadata" \
    "$(grep -q 'generateMetadata' app/tutorials/[slug]/page.tsx && echo true || echo false)"

# Test 7: Uses Strapi client
check "Tutorials listing uses Strapi client" \
    "$(grep -q 'getTutorials' app/tutorials/TutorialListingClient.tsx && echo true || echo false)"

# Test 8: Tutorial detail uses getTutorial
check "Tutorial detail uses getTutorial" \
    "$(grep -q 'getTutorial' app/tutorials/[slug]/TutorialDetailClient.tsx && echo true || echo false)"

# Test 9: Uses Unsplash helper
check "Tutorials listing uses Unsplash helper" \
    "$(grep -q 'getUnsplashImageUrl' app/tutorials/TutorialListingClient.tsx && echo true || echo false)"

# Test 10: Has semantic search integration
check "Tutorials listing has semantic search" \
    "$(grep -q 'searchCommunityContent' app/tutorials/TutorialListingClient.tsx && echo true || echo false)"

# Test 11: Tutorial detail uses syntax highlighting
check "Tutorial detail uses syntax highlighting" \
    "$(grep -q 'SyntaxHighlighter' app/tutorials/[slug]/TutorialDetailClient.tsx && echo true || echo false)"

# Test 12: Tutorial detail has difficulty badges
check "Tutorial detail has difficulty badges" \
    "$(grep -q 'getDifficultyColor' app/tutorials/[slug]/TutorialDetailClient.tsx && echo true || echo false)"

# Test 13: UI component exists
check "Progress component exists" \
    "$([ -f "components/ui/progress.tsx" ] && echo true || echo false)"

# Test 14: Tutorial detail has learning objectives
check "Tutorial detail has learning objectives" \
    "$(grep -q 'learning_objectives' app/tutorials/[slug]/TutorialDetailClient.tsx && echo true || echo false)"

# Test 15: Tutorial detail has prerequisites
check "Tutorial detail has prerequisites" \
    "$(grep -q 'prerequisites' app/tutorials/[slug]/TutorialDetailClient.tsx && echo true || echo false)"

# Test 16: Build succeeds
echo ""
echo "Running build test..."
if npm run build > /dev/null 2>&1; then
    check "Build succeeds" "true"
else
    check "Build succeeds" "false"
fi

# Test 17: Tutorials route in build output
check "Tutorials route in build" \
    "$(npm run build 2>&1 | grep -q '/tutorials' && echo true || echo false)"

echo ""
echo "=============================================="
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
    exit 1
fi

echo "All tests passed!"
exit 0
