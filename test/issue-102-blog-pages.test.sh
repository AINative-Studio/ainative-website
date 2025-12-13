#!/bin/bash
# Test script for Issue #102: Migrate Blog Pages
# Validates blog listing and detail pages are properly migrated

set -e

echo "Testing Issue #102: Blog Pages Migration"
echo "========================================="

PASS=0
FAIL=0

check() {
    local name="$1"
    local result="$2"
    if [ "$result" = "true" ]; then
        echo "✓ $name"
        PASS=$((PASS+1))
    else
        echo "✗ $name"
        FAIL=$((FAIL+1))
    fi
    return 0
}

# Test 1: Blog listing page exists
check "Blog listing page exists" \
    "$([ -f "app/blog/page.tsx" ] && echo true || echo false)"

# Test 2: Blog listing client component exists
check "Blog listing client component exists" \
    "$([ -f "app/blog/BlogListingClient.tsx" ] && echo true || echo false)"

# Test 3: Blog detail page exists
check "Blog detail page exists" \
    "$([ -f "app/blog/[slug]/page.tsx" ] && echo true || echo false)"

# Test 4: Blog detail client component exists
check "Blog detail client component exists" \
    "$([ -f "app/blog/[slug]/BlogDetailClient.tsx" ] && echo true || echo false)"

# Test 5: Blog listing has metadata
check "Blog listing has metadata export" \
    "$(grep -q 'export const metadata' app/blog/page.tsx && echo true || echo false)"

# Test 6: Blog detail has generateMetadata
check "Blog detail has generateMetadata" \
    "$(grep -q 'generateMetadata' app/blog/[slug]/page.tsx && echo true || echo false)"

# Test 7: Uses Strapi client
check "Blog listing uses Strapi client" \
    "$(grep -q 'getBlogPosts' app/blog/BlogListingClient.tsx && echo true || echo false)"

# Test 8: Uses Unsplash helper
check "Blog listing uses Unsplash helper" \
    "$(grep -q 'getUnsplashImageUrl' app/blog/BlogListingClient.tsx && echo true || echo false)"

# Test 9: Has semantic search integration
check "Blog listing has semantic search" \
    "$(grep -q 'searchCommunityContent' app/blog/BlogListingClient.tsx && echo true || echo false)"

# Test 10: Blog detail uses markdown rendering
check "Blog detail uses ReactMarkdown" \
    "$(grep -q 'ReactMarkdown' app/blog/[slug]/BlogDetailClient.tsx && echo true || echo false)"

# Test 11: Blog detail uses syntax highlighting
check "Blog detail uses syntax highlighting" \
    "$(grep -q 'SyntaxHighlighter' app/blog/[slug]/BlogDetailClient.tsx && echo true || echo false)"

# Test 12: UI components exist
check "Input component exists" \
    "$([ -f "components/ui/input.tsx" ] && echo true || echo false)"

check "Skeleton component exists" \
    "$([ -f "components/ui/skeleton.tsx" ] && echo true || echo false)"

check "Separator component exists" \
    "$([ -f "components/ui/separator.tsx" ] && echo true || echo false)"

check "Avatar component exists" \
    "$([ -f "components/ui/avatar.tsx" ] && echo true || echo false)"

# Test 13: Build succeeds
echo ""
echo "Running build test..."
if npm run build > /dev/null 2>&1; then
    check "Build succeeds" "true"
else
    check "Build succeeds" "false"
fi

# Test 14: Blog route in build output
check "Blog route in build" \
    "$(npm run build 2>&1 | grep -q '/blog' && echo true || echo false)"

echo ""
echo "========================================="
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
    exit 1
fi

echo "All tests passed!"
exit 0
