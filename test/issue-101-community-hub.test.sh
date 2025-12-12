#!/bin/bash
# Test script for Issue #101: Migrate Community Hub Page
# Verifies community page migration from Vite SPA to Next.js App Router

echo "=== Issue #101: Community Hub Page Migration Test ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        PASS=$((PASS+1))
    else
        echo -e "${RED}✗ $2${NC}"
        FAIL=$((FAIL+1))
    fi
    return 0
}

# Test 1: Check community page.tsx exists
echo "--- Checking file structure ---"
test -f "app/community/page.tsx" && check 0 "app/community/page.tsx exists" || check 1 "app/community/page.tsx exists"

# Test 2: Check CommunityClient.tsx exists
test -f "app/community/CommunityClient.tsx" && check 0 "app/community/CommunityClient.tsx exists" || check 1 "app/community/CommunityClient.tsx exists"

# Test 3: Check page.tsx exports metadata
echo ""
echo "--- Checking SEO metadata ---"
grep -q "export const metadata: Metadata" app/community/page.tsx && check 0 "page.tsx exports Metadata" || check 1 "page.tsx exports Metadata"

# Test 4: Check title in metadata
grep -q "title:" app/community/page.tsx && check 0 "metadata has title" || check 1 "metadata has title"

# Test 5: Check description in metadata
grep -q "description:" app/community/page.tsx && check 0 "metadata has description" || check 1 "metadata has description"

# Test 6: Check openGraph in metadata
grep -q "openGraph:" app/community/page.tsx && check 0 "metadata has openGraph" || check 1 "metadata has openGraph"

# Test 7: Check twitter in metadata
grep -q "twitter:" app/community/page.tsx && check 0 "metadata has twitter card" || check 1 "metadata has twitter card"

# Test 8: Check canonical URL
grep -q "canonical:" app/community/page.tsx && check 0 "metadata has canonical URL" || check 1 "metadata has canonical URL"

# Test 9: Check client component imports CommunityClient
grep -q "import CommunityClient from './CommunityClient'" app/community/page.tsx && check 0 "page.tsx imports CommunityClient" || check 1 "page.tsx imports CommunityClient"

# Test 10: Check CommunityClient has 'use client' directive
echo ""
echo "--- Checking client component ---"
head -1 app/community/CommunityClient.tsx | grep -q "'use client'" && check 0 "CommunityClient.tsx has 'use client' directive" || check 1 "CommunityClient.tsx has 'use client' directive"

# Test 11: Check for framer-motion animations
grep -q "framer-motion" app/community/CommunityClient.tsx && check 0 "Uses framer-motion for animations" || check 1 "Uses framer-motion for animations"

# Test 12: Check for Next.js Link
grep -q "import Link from 'next/link'" app/community/CommunityClient.tsx && check 0 "Uses Next.js Link component" || check 1 "Uses Next.js Link component"

# Test 13: Check for blog posts section
grep -q "Blog\|blogPosts\|mockBlogPosts" app/community/CommunityClient.tsx && check 0 "Has blog posts section" || check 1 "Has blog posts section"

# Test 14: Check for tutorials section
grep -q "Tutorial\|tutorials\|mockTutorials" app/community/CommunityClient.tsx && check 0 "Has tutorials section" || check 1 "Has tutorials section"

# Test 15: Check for events section
grep -q "Event\|events\|mockEvents" app/community/CommunityClient.tsx && check 0 "Has events section" || check 1 "Has events section"

# Test 16: Check for showcases section
grep -q "Showcase\|showcases\|mockShowcases" app/community/CommunityClient.tsx && check 0 "Has showcases section" || check 1 "Has showcases section"

# Test 17: Check for videos section
grep -q "Video\|videos\|mockVideos" app/community/CommunityClient.tsx && check 0 "Has videos section" || check 1 "Has videos section"

# Test 18: Check for newsletter subscription
grep -q "newsletter\|subscribe\|Newsletter" app/community/CommunityClient.tsx && check 0 "Has newsletter subscription" || check 1 "Has newsletter subscription"

# Test 19: Build test
echo ""
echo "--- Running build test ---"
npm run build > /tmp/build-output.txt 2>&1
BUILD_EXIT=$?
check $BUILD_EXIT "Production build succeeds"

if [ $BUILD_EXIT -ne 0 ]; then
    echo ""
    echo "Build output (last 30 lines):"
    tail -30 /tmp/build-output.txt
fi

# Test 20: Verify community route in build output
grep -q "/community" /tmp/build-output.txt && check 0 "Build output includes /community route" || check 1 "Build output includes /community route"

# Summary
echo ""
echo "=== Test Summary ==="
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
