#!/bin/bash
# Story #50: SEO Components Migration Tests
# Tests for Next.js Metadata API implementation and server-rendered meta tags
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
echo "Story #50: SEO Components Migration Tests"
echo "==========================================="
echo ""

# ====================
# LEGACY DEPENDENCY TESTS
# ====================
echo "--- Legacy Dependency Tests ---"

# Test 1: react-helmet-async is NOT in package.json
if grep -q '"react-helmet-async"' "package.json" 2>/dev/null; then
    test_fail "react-helmet-async still in package.json (should be removed)"
else
    test_pass "react-helmet-async removed from package.json"
fi

# Test 2: No Helmet imports in app directory
HELMET_IMPORTS=$(grep -r "from 'react-helmet-async'\|from \"react-helmet-async\"" app/ 2>/dev/null | wc -l)
if [ "$HELMET_IMPORTS" -eq 0 ]; then
    test_pass "No react-helmet-async imports in app directory"
else
    test_fail "Found $HELMET_IMPORTS react-helmet-async imports in app directory"
fi

# Test 3: No AIMetaTags component references
AIMETATAGS=$(grep -r "AIMetaTags" app/ 2>/dev/null | wc -l)
if [ "$AIMETATAGS" -eq 0 ]; then
    test_pass "No AIMetaTags component references in app directory"
else
    test_fail "Found $AIMETATAGS AIMetaTags references - should use Metadata API"
fi

# ====================
# STATIC METADATA TESTS
# ====================
echo ""
echo "--- Static Metadata Tests ---"

# Test 4: Root layout has metadata export
if grep -q "export const metadata" "app/layout.tsx" 2>/dev/null; then
    test_pass "Root layout has metadata export"
else
    test_fail "Root layout missing metadata export"
fi

# Test 5: Home page has metadata export
if grep -q "export const metadata" "app/page.tsx" 2>/dev/null; then
    test_pass "Home page has metadata export"
else
    test_fail "Home page missing metadata export"
fi

# Test 6: AI Kit page has metadata export
if grep -q "export const metadata" "app/ai-kit/page.tsx" 2>/dev/null; then
    test_pass "AI Kit page has metadata export"
else
    test_fail "AI Kit page missing metadata export"
fi

# Test 7: Pricing page has metadata export
if grep -q "export const metadata" "app/pricing/page.tsx" 2>/dev/null; then
    test_pass "Pricing page has metadata export"
else
    test_fail "Pricing page missing metadata export"
fi

# Test 8: About page has metadata export
if grep -q "export const metadata" "app/about/page.tsx" 2>/dev/null; then
    test_pass "About page has metadata export"
else
    test_fail "About page missing metadata export"
fi

# Test 9: Products page has metadata export
if grep -q "export const metadata" "app/products/page.tsx" 2>/dev/null; then
    test_pass "Products page has metadata export"
else
    test_fail "Products page missing metadata export"
fi

# Test 10: Contact page has metadata export
if grep -q "export const metadata" "app/contact/page.tsx" 2>/dev/null; then
    test_pass "Contact page has metadata export"
else
    test_fail "Contact page missing metadata export"
fi

# Test 11: Docs page has metadata export
if grep -q "export const metadata" "app/docs/page.tsx" 2>/dev/null; then
    test_pass "Docs page has metadata export"
else
    test_fail "Docs page missing metadata export"
fi

# ====================
# METADATA COUNT TESTS
# ====================
echo ""
echo "--- Metadata Coverage Tests ---"

# Test 12: Count pages with static metadata
STATIC_METADATA_COUNT=$(grep -l "export const metadata" app/*/page.tsx app/*/*/page.tsx app/page.tsx 2>/dev/null | wc -l)
if [ "$STATIC_METADATA_COUNT" -ge 35 ]; then
    test_pass "Found $STATIC_METADATA_COUNT pages with static metadata exports (>=35)"
else
    test_fail "Only $STATIC_METADATA_COUNT pages with static metadata (expected 35+)"
fi

# ====================
# DYNAMIC METADATA TESTS
# ====================
echo ""
echo "--- Dynamic Metadata Tests ---"

# Test 13: Blog detail uses generateMetadata
if grep -q "generateMetadata" "app/blog/[slug]/page.tsx" 2>/dev/null; then
    test_pass "Blog detail page uses generateMetadata"
else
    test_fail "Blog detail page missing generateMetadata"
fi

# Test 14: Tutorial detail uses generateMetadata
if grep -q "generateMetadata" "app/tutorials/[slug]/page.tsx" 2>/dev/null; then
    test_pass "Tutorial detail page uses generateMetadata"
else
    test_fail "Tutorial detail page missing generateMetadata"
fi

# Test 15: Webinar detail uses generateMetadata
if grep -q "generateMetadata" "app/webinars/[slug]/page.tsx" 2>/dev/null; then
    test_pass "Webinar detail page uses generateMetadata"
else
    test_fail "Webinar detail page missing generateMetadata"
fi

# Test 16: Showcase detail uses generateMetadata
if grep -q "generateMetadata" "app/showcases/[slug]/page.tsx" 2>/dev/null; then
    test_pass "Showcase detail page uses generateMetadata"
else
    test_fail "Showcase detail page missing generateMetadata"
fi

# Test 17: Community videos detail uses generateMetadata
if grep -q "generateMetadata" "app/community/videos/[slug]/page.tsx" 2>/dev/null; then
    test_pass "Community videos detail uses generateMetadata"
else
    test_fail "Community videos detail missing generateMetadata"
fi

# Test 18: Count dynamic metadata functions
DYNAMIC_METADATA_COUNT=$(grep -rl "generateMetadata" app/ 2>/dev/null | wc -l)
if [ "$DYNAMIC_METADATA_COUNT" -ge 5 ]; then
    test_pass "Found $DYNAMIC_METADATA_COUNT dynamic routes with generateMetadata (>=5)"
else
    test_fail "Only $DYNAMIC_METADATA_COUNT generateMetadata functions (expected 5+)"
fi

# ====================
# OPENGRAPH TESTS
# ====================
echo ""
echo "--- OpenGraph Tests ---"

# Test 19: AI Kit has OpenGraph
if grep -q "openGraph:" "app/ai-kit/page.tsx" 2>/dev/null; then
    test_pass "AI Kit page has OpenGraph config"
else
    test_fail "AI Kit page missing OpenGraph config"
fi

# Test 20: Pricing has OpenGraph
if grep -q "openGraph:" "app/pricing/page.tsx" 2>/dev/null; then
    test_pass "Pricing page has OpenGraph config"
else
    test_fail "Pricing page missing OpenGraph config"
fi

# Test 21: About has OpenGraph
if grep -q "openGraph:" "app/about/page.tsx" 2>/dev/null; then
    test_pass "About page has OpenGraph config"
else
    test_fail "About page missing OpenGraph config"
fi

# Test 22: Contact has OpenGraph
if grep -q "openGraph:" "app/contact/page.tsx" 2>/dev/null; then
    test_pass "Contact page has OpenGraph config"
else
    test_fail "Contact page missing OpenGraph config"
fi

# Test 23: Count pages with OpenGraph
OG_COUNT=$(grep -rl "openGraph:" app/ 2>/dev/null | wc -l)
if [ "$OG_COUNT" -ge 30 ]; then
    test_pass "Found $OG_COUNT pages with OpenGraph config (>=30)"
else
    test_fail "Only $OG_COUNT pages with OpenGraph (expected 30+)"
fi

# ====================
# TWITTER CARD TESTS
# ====================
echo ""
echo "--- Twitter Card Tests ---"

# Test 24: AI Kit has Twitter card
if grep -q "twitter:" "app/ai-kit/page.tsx" 2>/dev/null; then
    test_pass "AI Kit page has Twitter card config"
else
    test_fail "AI Kit page missing Twitter card config"
fi

# Test 25: Pricing has Twitter card
if grep -q "twitter:" "app/pricing/page.tsx" 2>/dev/null; then
    test_pass "Pricing page has Twitter card config"
else
    test_fail "Pricing page missing Twitter card config"
fi

# Test 26: About has Twitter card
if grep -q "twitter:" "app/about/page.tsx" 2>/dev/null; then
    test_pass "About page has Twitter card config"
else
    test_fail "About page missing Twitter card config"
fi

# Test 27: Count pages with Twitter cards
TWITTER_COUNT=$(grep -rl "twitter:" app/ 2>/dev/null | wc -l)
if [ "$TWITTER_COUNT" -ge 20 ]; then
    test_pass "Found $TWITTER_COUNT pages with Twitter card config (>=20)"
else
    test_fail "Only $TWITTER_COUNT pages with Twitter cards (expected 20+)"
fi

# ====================
# STRUCTURED DATA TESTS
# ====================
echo ""
echo "--- Structured Data Tests ---"

# Test 28: AI Kit has JSON-LD
if grep -q "application/ld+json" "app/ai-kit/page.tsx" 2>/dev/null; then
    test_pass "AI Kit page has JSON-LD structured data"
else
    test_fail "AI Kit page missing JSON-LD structured data"
fi

# Test 29: Pricing has JSON-LD
if grep -q "application/ld+json" "app/pricing/page.tsx" 2>/dev/null; then
    test_pass "Pricing page has JSON-LD structured data"
else
    test_fail "Pricing page missing JSON-LD structured data"
fi

# Test 30: Count pages with JSON-LD
JSONLD_COUNT=$(grep -rl "application/ld+json" app/ 2>/dev/null | wc -l)
if [ "$JSONLD_COUNT" -ge 5 ]; then
    test_pass "Found $JSONLD_COUNT pages with JSON-LD structured data (>=5)"
else
    test_fail "Only $JSONLD_COUNT pages with JSON-LD (expected 5+)"
fi

# ====================
# METADATA TYPE IMPORT TESTS
# ====================
echo ""
echo "--- TypeScript Import Tests ---"

# Test 31: Pages import Metadata type
METADATA_IMPORT_COUNT=$(grep -rl "import.*Metadata.*from 'next'" app/ 2>/dev/null | wc -l)
if [ "$METADATA_IMPORT_COUNT" -ge 30 ]; then
    test_pass "Found $METADATA_IMPORT_COUNT pages importing Metadata type (>=30)"
else
    test_fail "Only $METADATA_IMPORT_COUNT pages importing Metadata type (expected 30+)"
fi

# Test 32: AI Kit imports Metadata type
if grep -qE "import.*\{.*Metadata.*\}.*from ['\"]next['\"]" "app/ai-kit/page.tsx" 2>/dev/null; then
    test_pass "AI Kit imports Metadata type from next"
else
    test_fail "AI Kit not importing Metadata type"
fi

# ====================
# CANONICAL URL TESTS
# ====================
echo ""
echo "--- Canonical URL Tests ---"

# Test 33: AI Kit has canonical URL
if grep -q "canonical:" "app/ai-kit/page.tsx" 2>/dev/null; then
    test_pass "AI Kit page has canonical URL"
else
    test_fail "AI Kit page missing canonical URL"
fi

# Test 34: Count pages with canonical URLs
CANONICAL_COUNT=$(grep -rl "canonical:" app/ 2>/dev/null | wc -l)
if [ "$CANONICAL_COUNT" -ge 10 ]; then
    test_pass "Found $CANONICAL_COUNT pages with canonical URLs (>=10)"
else
    test_fail "Only $CANONICAL_COUNT pages with canonical URLs (expected 10+)"
fi

# ====================
# ROBOTS METADATA TESTS
# ====================
echo ""
echo "--- Robots Metadata Tests ---"

# Test 35: AI Kit has robots config
if grep -q "robots:" "app/ai-kit/page.tsx" 2>/dev/null; then
    test_pass "AI Kit page has robots config"
else
    test_fail "AI Kit page missing robots config"
fi

# Test 36: Count pages with robots config
ROBOTS_COUNT=$(grep -rl "robots:" app/ 2>/dev/null | wc -l)
if [ "$ROBOTS_COUNT" -ge 5 ]; then
    test_pass "Found $ROBOTS_COUNT pages with robots config (>=5)"
else
    test_fail "Only $ROBOTS_COUNT pages with robots config (expected 5+)"
fi

# ====================
# KEYWORDS METADATA TESTS
# ====================
echo ""
echo "--- Keywords Metadata Tests ---"

# Test 37: AI Kit has keywords
if grep -q "keywords:" "app/ai-kit/page.tsx" 2>/dev/null; then
    test_pass "AI Kit page has keywords metadata"
else
    test_fail "AI Kit page missing keywords metadata"
fi

# Test 38: Count pages with keywords
KEYWORDS_COUNT=$(grep -rl "keywords:" app/ 2>/dev/null | wc -l)
if [ "$KEYWORDS_COUNT" -ge 10 ]; then
    test_pass "Found $KEYWORDS_COUNT pages with keywords (>=10)"
else
    test_fail "Only $KEYWORDS_COUNT pages with keywords (expected 10+)"
fi

# ====================
# DASHBOARD PAGE TESTS (NO SEO)
# ====================
echo ""
echo "--- Dashboard Pages (Protected - Basic SEO) ---"

# Test 39: Dashboard page has basic metadata
if grep -q "export const metadata" "app/dashboard/page.tsx" 2>/dev/null; then
    test_pass "Dashboard page has basic metadata"
else
    test_fail "Dashboard page missing basic metadata"
fi

# Test 40: Account page has basic metadata
if grep -q "export const metadata" "app/account/page.tsx" 2>/dev/null; then
    test_pass "Account page has basic metadata"
else
    test_fail "Account page missing basic metadata"
fi

# Test 41: Billing page has basic metadata
if grep -q "export const metadata" "app/billing/page.tsx" 2>/dev/null; then
    test_pass "Billing page has basic metadata"
else
    test_fail "Billing page missing basic metadata"
fi

# ====================
# TITLE PATTERN TESTS
# ====================
echo ""
echo "--- Title Pattern Tests ---"

# Test 42: Titles include site name separator
TITLE_WITH_PIPE=$(grep -r "title:.*|" app/ 2>/dev/null | wc -l)
if [ "$TITLE_WITH_PIPE" -ge 20 ]; then
    test_pass "Found $TITLE_WITH_PIPE pages with properly formatted titles (>=20)"
else
    test_fail "Only $TITLE_WITH_PIPE pages with '|' in title (expected 20+)"
fi

# ====================
# DESCRIPTION TESTS
# ====================
echo ""
echo "--- Description Tests ---"

# Test 43: Count pages with descriptions
DESC_COUNT=$(grep -rl "description:" app/ 2>/dev/null | wc -l)
if [ "$DESC_COUNT" -ge 35 ]; then
    test_pass "Found $DESC_COUNT pages with description (>=35)"
else
    test_fail "Only $DESC_COUNT pages with description (expected 35+)"
fi

# ====================
# NO CLIENT-SIDE SEO TESTS
# ====================
echo ""
echo "--- Server-Side Rendering Verification ---"

# Test 44: No document.title manipulation in pages
DOC_TITLE=$(grep -r "document.title" app/ 2>/dev/null | wc -l)
if [ "$DOC_TITLE" -eq 0 ]; then
    test_pass "No client-side document.title manipulation"
else
    test_fail "Found $DOC_TITLE document.title manipulations (should use metadata)"
fi

# Test 45: No Head component from next/head in app directory
NEXT_HEAD=$(grep -r "from 'next/head'" app/ 2>/dev/null | wc -l)
if [ "$NEXT_HEAD" -eq 0 ]; then
    test_pass "No legacy next/head imports in app directory"
else
    test_fail "Found $NEXT_HEAD next/head imports (use metadata API)"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test 46: Project builds successfully
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with SEO components"
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

TOTAL=$((PASS_COUNT + FAIL_COUNT))
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All $TOTAL tests passed!${NC}"
    exit 0
else
    echo -e "${RED}$FAIL_COUNT of $TOTAL tests failed${NC}"
    exit 1
fi
