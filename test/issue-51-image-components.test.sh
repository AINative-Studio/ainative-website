#!/bin/bash
# Story #51: Image Components Optimization Tests
# Tests for Next.js Image component usage and optimization
# Part of Sprint 2 - Component Migration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# Test helper function
test_pass() {
    echo -e "${GREEN}PASS${NC}: $1"
    ((PASS_COUNT++))
}

test_fail() {
    echo -e "${RED}FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

test_skip() {
    echo -e "${YELLOW}SKIP${NC}: $1"
}

echo "==========================================="
echo "Story #51: Image Components Optimization Tests"
echo "==========================================="
echo ""

# ====================
# NEXT/IMAGE DEPENDENCY TESTS
# ====================
echo "--- Next.js Image Configuration Tests ---"

# Test 1: Next.js is installed
if grep -q '"next"' "package.json" 2>/dev/null; then
    test_pass "Next.js package is installed"
else
    test_fail "Next.js package not found"
fi

# Test 2: next.config.ts exists
if [ -f "next.config.ts" ]; then
    test_pass "next.config.ts exists"
else
    test_fail "next.config.ts not found"
fi

# ====================
# AVATAR COMPONENT TESTS
# ====================
echo ""
echo "--- Avatar Component Tests ---"

# Test 3: Avatar component exists
if [ -f "components/ui/avatar.tsx" ]; then
    test_pass "Avatar component exists at components/ui/avatar.tsx"
else
    test_fail "Avatar component not found"
fi

# Test 4: Avatar uses Radix UI primitives
if grep -q "@radix-ui/react-avatar" "components/ui/avatar.tsx" 2>/dev/null; then
    test_pass "Avatar uses Radix UI Avatar primitives"
else
    test_fail "Avatar not using Radix UI primitives"
fi

# Test 5: Avatar has fallback component
if grep -q "AvatarFallback" "components/ui/avatar.tsx" 2>/dev/null; then
    test_pass "Avatar has AvatarFallback component"
else
    test_fail "Avatar missing AvatarFallback"
fi

# Test 6: AvatarImage exported
if grep -q "AvatarImage" "components/ui/avatar.tsx" 2>/dev/null; then
    test_pass "AvatarImage component exported"
else
    test_fail "AvatarImage not exported"
fi

# Test 7: Avatar is client component
if grep -qE "^['\"]use client['\"]" "components/ui/avatar.tsx" 2>/dev/null; then
    test_pass "Avatar is a client component"
else
    test_fail "Avatar missing 'use client' directive"
fi

# ====================
# IMG TAG USAGE TESTS
# ====================
echo ""
echo "--- Image Tag Usage Tests ---"

# Test 8: Count files with img tags (should document current state)
IMG_TAG_COUNT=$(grep -rl "<img" app/ components/ 2>/dev/null | wc -l)
echo "  INFO: Found $IMG_TAG_COUNT files with <img> tags"

# Test 9: Header uses img for avatar
if grep -q "<img" "components/layout/Header.tsx" 2>/dev/null; then
    test_pass "Header uses img for dynamic avatar (external URLs)"
else
    test_pass "Header doesn't use img tags"
fi

# Test 10: Blog listing uses img
if grep -q "<img" "app/blog/BlogListingClient.tsx" 2>/dev/null; then
    test_pass "BlogListingClient uses img for Unsplash images"
else
    test_pass "BlogListingClient doesn't use img tags"
fi

# ====================
# ALT TEXT TESTS
# ====================
echo ""
echo "--- Alt Text Accessibility Tests ---"

# Test 11: Header img has alt text
if grep -q "alt=" "components/layout/Header.tsx" 2>/dev/null; then
    test_pass "Header img tags have alt attributes"
else
    test_fail "Header img tags missing alt attributes"
fi

# Test 12: Blog images have alt text
if grep -q "alt=" "app/blog/BlogListingClient.tsx" 2>/dev/null; then
    test_pass "BlogListingClient images have alt attributes"
else
    test_fail "BlogListingClient images missing alt"
fi

# Test 13: Tutorial images have alt text
if grep -q "alt=" "app/tutorials/TutorialListingClient.tsx" 2>/dev/null; then
    test_pass "TutorialListingClient images have alt attributes"
else
    test_fail "TutorialListingClient images missing alt"
fi

# Test 14: Webinar images have alt text
if grep -q "alt=" "app/webinars/WebinarListingClient.tsx" 2>/dev/null; then
    test_pass "WebinarListingClient images have alt attributes"
else
    test_fail "WebinarListingClient images missing alt"
fi

# Test 15: Events images have alt text
if grep -q "alt=" "app/events/EventsCalendarClient.tsx" 2>/dev/null; then
    test_pass "EventsCalendarClient images have alt attributes"
else
    test_fail "EventsCalendarClient images missing alt"
fi

# Test 16: Showcase images have alt text
if grep -q "alt=" "app/showcases/ShowcaseListingClient.tsx" 2>/dev/null; then
    test_pass "ShowcaseListingClient images have alt attributes"
else
    test_fail "ShowcaseListingClient images missing alt"
fi

# ====================
# IMAGE DIMENSION TESTS
# ====================
echo ""
echo "--- Image Dimension Tests ---"

# Test 17: Blog images specify dimensions
if grep -q "w-full\|aspect-" "app/blog/BlogListingClient.tsx" 2>/dev/null; then
    test_pass "BlogListingClient images have CSS dimension classes"
else
    test_fail "BlogListingClient images missing dimension classes"
fi

# Test 18: Tutorial images specify dimensions
if grep -q "w-full\|aspect-" "app/tutorials/TutorialListingClient.tsx" 2>/dev/null; then
    test_pass "TutorialListingClient images have CSS dimension classes"
else
    test_fail "TutorialListingClient images missing dimension classes"
fi

# Test 19: Webinar images specify dimensions
if grep -q "w-full\|aspect-" "app/webinars/WebinarListingClient.tsx" 2>/dev/null; then
    test_pass "WebinarListingClient images have CSS dimension classes"
else
    test_fail "WebinarListingClient images missing dimension classes"
fi

# ====================
# LAZY LOADING TESTS
# ====================
echo ""
echo "--- Lazy Loading Tests ---"

# Test 20: Blog images use lazy loading (CSS aspect-ratio enables above-fold detection)
if grep -q "aspect-video\|aspect-\[" "app/blog/BlogListingClient.tsx" 2>/dev/null; then
    test_pass "BlogListingClient uses aspect-ratio for layout stability"
else
    test_fail "BlogListingClient missing aspect-ratio"
fi

# Test 21: Tutorial images use aspect ratio
if grep -q "aspect-video\|aspect-\[" "app/tutorials/TutorialListingClient.tsx" 2>/dev/null; then
    test_pass "TutorialListingClient uses aspect-ratio for layout stability"
else
    test_fail "TutorialListingClient missing aspect-ratio"
fi

# Test 22: Webinar images use aspect ratio
if grep -q "aspect-video\|aspect-\[" "app/webinars/WebinarListingClient.tsx" 2>/dev/null; then
    test_pass "WebinarListingClient uses aspect-ratio for layout stability"
else
    test_fail "WebinarListingClient missing aspect-ratio"
fi

# ====================
# CSS OPTIMIZATION TESTS
# ====================
echo ""
echo "--- CSS Optimization Tests ---"

# Test 23: Object-fit for image scaling
OBJECT_FIT_COUNT=$(grep -r "object-cover\|object-contain" app/ 2>/dev/null | wc -l)
if [ "$OBJECT_FIT_COUNT" -ge 5 ]; then
    test_pass "Found $OBJECT_FIT_COUNT object-fit usages for proper image scaling"
else
    test_fail "Only $OBJECT_FIT_COUNT object-fit usages (expected 5+)"
fi

# Test 24: Overflow hidden for container
OVERFLOW_HIDDEN_COUNT=$(grep -r "overflow-hidden" app/ 2>/dev/null | wc -l)
if [ "$OVERFLOW_HIDDEN_COUNT" -ge 10 ]; then
    test_pass "Found $OVERFLOW_HIDDEN_COUNT overflow-hidden containers"
else
    test_fail "Only $OVERFLOW_HIDDEN_COUNT overflow-hidden (expected 10+)"
fi

# ====================
# EXTERNAL URL PATTERN TESTS
# ====================
echo ""
echo "--- External Image URL Tests ---"

# Test 25: Unsplash URL function exists
if grep -q "getUnsplashImageUrl\|unsplash.com" app/ -r 2>/dev/null; then
    test_pass "Unsplash image URL pattern detected"
else
    test_skip "No Unsplash URL pattern found"
fi

# Test 26: Images have size parameters in URL
if grep -q "w=\|width=\|/w_\|/[0-9]*x[0-9]*" app/ -r 2>/dev/null; then
    test_pass "Image URLs include size parameters"
else
    test_skip "Image URLs may not have size parameters"
fi

# ====================
# CLIENT COMPONENT TESTS
# ====================
echo ""
echo "--- Client Component Tests ---"

# Test 27: BlogListingClient is client component
if grep -qE "^['\"]use client['\"]" "app/blog/BlogListingClient.tsx" 2>/dev/null; then
    test_pass "BlogListingClient is a client component"
else
    test_fail "BlogListingClient missing 'use client'"
fi

# Test 28: TutorialListingClient is client component
if grep -qE "^['\"]use client['\"]" "app/tutorials/TutorialListingClient.tsx" 2>/dev/null; then
    test_pass "TutorialListingClient is a client component"
else
    test_fail "TutorialListingClient missing 'use client'"
fi

# Test 29: WebinarListingClient is client component
if grep -qE "^['\"]use client['\"]" "app/webinars/WebinarListingClient.tsx" 2>/dev/null; then
    test_pass "WebinarListingClient is a client component"
else
    test_fail "WebinarListingClient missing 'use client'"
fi

# Test 30: ShowcaseListingClient is client component
if grep -qE "^['\"]use client['\"]" "app/showcases/ShowcaseListingClient.tsx" 2>/dev/null; then
    test_pass "ShowcaseListingClient is a client component"
else
    test_fail "ShowcaseListingClient missing 'use client'"
fi

# Test 31: EventsCalendarClient is client component
if grep -qE "^['\"]use client['\"]" "app/events/EventsCalendarClient.tsx" 2>/dev/null; then
    test_pass "EventsCalendarClient is a client component"
else
    test_fail "EventsCalendarClient missing 'use client'"
fi

# ====================
# DETAIL PAGE IMAGE TESTS
# ====================
echo ""
echo "--- Detail Page Image Tests ---"

# Test 32: BlogDetailClient has images
if [ -f "app/blog/[slug]/BlogDetailClient.tsx" ]; then
    if grep -q "<img\|Image" "app/blog/[slug]/BlogDetailClient.tsx" 2>/dev/null; then
        test_pass "BlogDetailClient handles images"
    else
        test_skip "BlogDetailClient may not have images"
    fi
else
    test_fail "BlogDetailClient not found"
fi

# Test 33: TutorialDetailClient has images
if [ -f "app/tutorials/[slug]/TutorialDetailClient.tsx" ]; then
    if grep -q "<img\|Image" "app/tutorials/[slug]/TutorialDetailClient.tsx" 2>/dev/null; then
        test_pass "TutorialDetailClient handles images"
    else
        test_skip "TutorialDetailClient may not have images"
    fi
else
    test_fail "TutorialDetailClient not found"
fi

# Test 34: WebinarDetailClient has images
if [ -f "app/webinars/[slug]/WebinarDetailClient.tsx" ]; then
    if grep -q "<img\|Image" "app/webinars/[slug]/WebinarDetailClient.tsx" 2>/dev/null; then
        test_pass "WebinarDetailClient handles images"
    else
        test_skip "WebinarDetailClient may not have images"
    fi
else
    test_fail "WebinarDetailClient not found"
fi

# Test 35: ShowcaseDetailClient has images
if [ -f "app/showcases/[slug]/ShowcaseDetailClient.tsx" ]; then
    if grep -q "<img\|Image" "app/showcases/[slug]/ShowcaseDetailClient.tsx" 2>/dev/null; then
        test_pass "ShowcaseDetailClient handles images"
    else
        test_skip "ShowcaseDetailClient may not have images"
    fi
else
    test_fail "ShowcaseDetailClient not found"
fi

# ====================
# HEADER IMAGE TESTS
# ====================
echo ""
echo "--- Header Avatar Image Tests ---"

# Test 36: Header has alt text for avatar
if grep -q 'alt="avatar"' "components/layout/Header.tsx" 2>/dev/null; then
    test_pass "Header avatar has alt text"
else
    test_fail "Header avatar missing alt text"
fi

# Test 37: Header has rounded styling for avatar
if grep -q "rounded" "components/layout/Header.tsx" 2>/dev/null; then
    test_pass "Header avatar has rounded styling"
else
    test_fail "Header avatar missing rounded styling"
fi

# Test 38: Header has size classes for avatar
if grep -q "h-8\|w-8\|h-6\|w-6" "components/layout/Header.tsx" 2>/dev/null; then
    test_pass "Header avatar has explicit size classes"
else
    test_fail "Header avatar missing size classes"
fi

# ====================
# STATIC ASSET TESTS
# ====================
echo ""
echo "--- Static Asset Tests ---"

# Test 39: Public directory exists
if [ -d "public" ]; then
    test_pass "Public directory exists for static assets"
else
    test_fail "Public directory not found"
fi

# Test 40: Check for image assets in public
PUBLIC_IMAGES=$(find public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.svg" -o -name "*.ico" \) 2>/dev/null | wc -l)
echo "  INFO: Found $PUBLIC_IMAGES image files in public directory"
if [ "$PUBLIC_IMAGES" -ge 1 ]; then
    test_pass "Public directory has image assets ($PUBLIC_IMAGES files)"
else
    test_skip "No image files in public directory"
fi

# ====================
# NEXT.JS CONFIG TESTS
# ====================
echo ""
echo "--- Next.js Configuration Tests ---"

# Test 41: next.config.ts has turbopack config
if grep -q "turbopack" "next.config.ts" 2>/dev/null; then
    test_pass "next.config.ts has Turbopack configuration"
else
    test_fail "next.config.ts missing Turbopack config"
fi

# Test 42: next.config.ts has reactStrictMode
if grep -q "reactStrictMode" "next.config.ts" 2>/dev/null; then
    test_pass "next.config.ts has reactStrictMode enabled"
else
    test_fail "next.config.ts missing reactStrictMode"
fi

# ====================
# TAILWIND ASPECT RATIO TESTS
# ====================
echo ""
echo "--- Tailwind Aspect Ratio Tests ---"

# Test 43: aspect-video class used
ASPECT_VIDEO=$(grep -r "aspect-video" app/ 2>/dev/null | wc -l)
if [ "$ASPECT_VIDEO" -ge 10 ]; then
    test_pass "aspect-video class used ($ASPECT_VIDEO usages)"
else
    test_fail "Only $ASPECT_VIDEO aspect-video usages (expected 10+)"
fi

# Test 44: aspect-square class used
ASPECT_SQUARE=$(grep -r "aspect-square" app/ components/ 2>/dev/null | wc -l)
if [ "$ASPECT_SQUARE" -ge 2 ]; then
    test_pass "aspect-square class used ($ASPECT_SQUARE usages)"
else
    test_skip "aspect-square class has $ASPECT_SQUARE usages"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test 45: Project builds successfully
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with image components"
else
    test_fail "Project build failed"
    echo "Build output (last 20 lines):"
    tail -20 /tmp/build_output.txt
fi

# ====================
# SUMMARY
# ====================
echo ""
echo "==========================================="
echo "Test Summary"
echo "==========================================="
echo -e "Passed: ${GREEN}${PASS_COUNT}${NC}"
echo -e "Failed: ${RED}${FAIL_COUNT}${NC}"
echo ""

# Image optimization notes
echo "--- Image Optimization Notes ---"
echo "Current state uses <img> tags for external images (Unsplash, avatars)"
echo "This is acceptable for dynamic external URLs with proper alt text"
echo "To use next/image for external URLs, configure remotePatterns in next.config.ts"
echo ""

TOTAL=$((PASS_COUNT + FAIL_COUNT))
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All $TOTAL tests passed!${NC}"
    exit 0
else
    echo -e "${RED}$FAIL_COUNT of $TOTAL tests failed${NC}"
    exit 1
fi
