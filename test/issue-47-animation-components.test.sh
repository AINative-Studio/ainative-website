#!/bin/bash
# Story #47: Animation Components Migration Tests
# Tests for framer-motion components with proper client directive
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

echo "=========================================="
echo "Story #47: Animation Components Migration Tests"
echo "=========================================="
echo ""

# ====================
# DEPENDENCY TESTS
# ====================
echo "--- Dependency Tests ---"

# Test 1: Framer Motion is installed
if grep -q '"framer-motion"' "package.json" 2>/dev/null; then
    test_pass "Framer Motion is installed in package.json"
else
    test_fail "Framer Motion not found in package.json"
fi

# Test 2: Check Framer Motion version
FM_VERSION=$(grep '"framer-motion"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
if [ -n "$FM_VERSION" ]; then
    test_pass "Framer Motion version: $FM_VERSION"
else
    test_fail "Could not determine Framer Motion version"
fi

# ====================
# CLIENT DIRECTIVE TESTS
# ====================
echo ""
echo "--- Client Directive Tests (App Components) ---"

# All components using framer-motion must have 'use client' directive
APP_ANIMATION_FILES=(
    "app/HomeClient.tsx"
    "app/ai-kit/AIKitClient.tsx"
    "app/pricing/PricingClient.tsx"
    "app/products/zerodb/ZeroDBClient.tsx"
    "app/products/ProductsClient.tsx"
    "app/dashboard/DashboardClient.tsx"
    "app/dashboard/main/MainDashboardClient.tsx"
    "app/billing/BillingClient.tsx"
    "app/invoices/InvoicesClient.tsx"
    "app/account/AccountClient.tsx"
    "app/refills/CreditRefillsClient.tsx"
    "app/credit-history/CreditHistoryClient.tsx"
    "app/team/TeamSettingsClient.tsx"
    "app/contact/ContactClient.tsx"
    "app/about/AboutClient.tsx"
    "app/docs/DocsClient.tsx"
    "app/api-reference/APIReferenceClient.tsx"
    "app/download/DownloadClient.tsx"
    "app/enterprise/EnterpriseClient.tsx"
    "app/agent-swarm/AgentSwarmClient.tsx"
    "app/getting-started/GettingStartedClient.tsx"
    "app/integrations/IntegrationsClient.tsx"
    "app/privacy/PrivacyClient.tsx"
    "app/terms/TermsClient.tsx"
    "app/blog/BlogListingClient.tsx"
    "app/blog/[slug]/BlogDetailClient.tsx"
    "app/tutorials/TutorialListingClient.tsx"
    "app/tutorials/[slug]/TutorialDetailClient.tsx"
    "app/webinars/WebinarListingClient.tsx"
    "app/webinars/[slug]/WebinarDetailClient.tsx"
    "app/showcases/ShowcaseListingClient.tsx"
    "app/showcases/[slug]/ShowcaseDetailClient.tsx"
    "app/events/EventsCalendarClient.tsx"
    "app/community/CommunityClient.tsx"
    "app/community/videos/VideosClient.tsx"
    "app/community/videos/[slug]/VideoDetailClient.tsx"
    "app/resources/ResourcesClient.tsx"
    "app/examples/ExamplesClient.tsx"
    "app/search/SearchClient.tsx"
)

for file in "${APP_ANIMATION_FILES[@]}"; do
    if [ -f "$file" ]; then
        # Check if file uses framer-motion
        if grep -q "from 'framer-motion'" "$file" 2>/dev/null; then
            # Check if it has 'use client' directive
            if grep -qE "^['\"]use client['\"]" "$file" 2>/dev/null; then
                test_pass "$file has 'use client' directive"
            else
                test_fail "$file uses framer-motion but missing 'use client'"
            fi
        else
            test_skip "$file does not use framer-motion"
        fi
    else
        test_skip "$file does not exist"
    fi
done

echo ""
echo "--- Client Directive Tests (Layout Components) ---"

# Test layout component
if grep -q "from 'framer-motion'" "components/layout/Sidebar.tsx" 2>/dev/null; then
    if grep -qE "^['\"]use client['\"]" "components/layout/Sidebar.tsx" 2>/dev/null; then
        test_pass "Sidebar.tsx has 'use client' directive"
    else
        test_fail "Sidebar.tsx uses framer-motion but missing 'use client'"
    fi
fi

# ====================
# MOTION IMPORT TESTS
# ====================
echo ""
echo "--- Motion Import Pattern Tests ---"

# Test 3: Check for motion component import
MOTION_IMPORT_COUNT=$(grep -r "import.*motion.*from 'framer-motion'" app/ components/ 2>/dev/null | wc -l)
if [ "$MOTION_IMPORT_COUNT" -ge 30 ]; then
    test_pass "Motion component imported in $MOTION_IMPORT_COUNT files"
else
    test_fail "Expected 30+ motion imports, found $MOTION_IMPORT_COUNT"
fi

# Test 4: Check for AnimatePresence import (for enter/exit animations)
ANIMATE_PRESENCE_COUNT=$(grep -r "AnimatePresence" app/ components/ 2>/dev/null | wc -l)
if [ "$ANIMATE_PRESENCE_COUNT" -ge 1 ]; then
    test_pass "AnimatePresence used in $ANIMATE_PRESENCE_COUNT locations"
else
    test_skip "AnimatePresence not used (optional)"
fi

# Test 5: Check for Variants type import (for animation definitions)
VARIANTS_COUNT=$(grep -r "Variants" app/ components/ 2>/dev/null | grep "from 'framer-motion'" | wc -l)
if [ "$VARIANTS_COUNT" -ge 1 ]; then
    test_pass "Variants type imported in $VARIANTS_COUNT files"
else
    test_skip "Variants type not imported (optional)"
fi

# ====================
# ANIMATION PATTERN TESTS
# ====================
echo ""
echo "--- Animation Pattern Tests ---"

# Test 6: Check for initial animation state pattern
INITIAL_COUNT=$(grep -r "initial=" app/ components/ 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$INITIAL_COUNT" -ge 10 ]; then
    test_pass "Initial animation state used in $INITIAL_COUNT locations"
else
    test_fail "Expected 10+ initial states, found $INITIAL_COUNT"
fi

# Test 7: Check for animate pattern
ANIMATE_COUNT=$(grep -r "animate=" app/ components/ 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$ANIMATE_COUNT" -ge 10 ]; then
    test_pass "Animate prop used in $ANIMATE_COUNT locations"
else
    test_fail "Expected 10+ animate props, found $ANIMATE_COUNT"
fi

# Test 8: Check for whileHover pattern (interactive animations)
WHILE_HOVER_COUNT=$(grep -r "whileHover" app/ components/ 2>/dev/null | wc -l)
if [ "$WHILE_HOVER_COUNT" -ge 5 ]; then
    test_pass "whileHover used in $WHILE_HOVER_COUNT locations"
else
    test_skip "whileHover used in $WHILE_HOVER_COUNT locations (minimal)"
fi

# Test 9: Check for whileTap pattern (click feedback)
WHILE_TAP_COUNT=$(grep -r "whileTap" app/ components/ 2>/dev/null | wc -l)
if [ "$WHILE_TAP_COUNT" -ge 1 ]; then
    test_pass "whileTap used in $WHILE_TAP_COUNT locations"
else
    test_skip "whileTap not used (optional)"
fi

# Test 10: Check for whileInView pattern (scroll animations)
WHILE_IN_VIEW_COUNT=$(grep -r "whileInView" app/ components/ 2>/dev/null | wc -l)
if [ "$WHILE_IN_VIEW_COUNT" -ge 5 ]; then
    test_pass "whileInView used in $WHILE_IN_VIEW_COUNT locations"
else
    test_skip "whileInView used in $WHILE_IN_VIEW_COUNT locations"
fi

# Test 11: Check for transition prop
TRANSITION_COUNT=$(grep -r "transition=" app/ components/ 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$TRANSITION_COUNT" -ge 10 ]; then
    test_pass "Transition prop used in $TRANSITION_COUNT locations"
else
    test_fail "Expected 10+ transitions, found $TRANSITION_COUNT"
fi

# ====================
# SCROLL ANIMATION TESTS
# ====================
echo ""
echo "--- Scroll Animation Tests ---"

# Test 12: Check for useScroll hook
USE_SCROLL_COUNT=$(grep -r "useScroll" app/ components/ 2>/dev/null | wc -l)
if [ "$USE_SCROLL_COUNT" -ge 1 ]; then
    test_pass "useScroll hook used in $USE_SCROLL_COUNT locations"
else
    test_skip "useScroll not used (optional)"
fi

# Test 13: Check for useTransform hook
USE_TRANSFORM_COUNT=$(grep -r "useTransform" app/ components/ 2>/dev/null | wc -l)
if [ "$USE_TRANSFORM_COUNT" -ge 1 ]; then
    test_pass "useTransform hook used in $USE_TRANSFORM_COUNT locations"
else
    test_skip "useTransform not used (optional)"
fi

# ====================
# ANIMATION VARIANTS TESTS
# ====================
echo ""
echo "--- Animation Variants Tests ---"

# Test 14: Check for fadeUp/fadeIn variants pattern
FADE_VARIANT_COUNT=$(grep -rE "(fadeUp|fadeIn|fadeDown)" app/ components/ 2>/dev/null | wc -l)
if [ "$FADE_VARIANT_COUNT" -ge 1 ]; then
    test_pass "Fade animation variants used in $FADE_VARIANT_COUNT locations"
else
    test_skip "Fade variants not explicitly named (may use inline)"
fi

# Test 15: Check for stagger animation pattern
STAGGER_COUNT=$(grep -r "staggerChildren" app/ components/ 2>/dev/null | wc -l)
if [ "$STAGGER_COUNT" -ge 1 ]; then
    test_pass "Stagger animations used in $STAGGER_COUNT locations"
else
    test_skip "Stagger animations not used"
fi

# Test 16: Check for variants prop usage
VARIANTS_PROP_COUNT=$(grep -r "variants=" app/ components/ 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$VARIANTS_PROP_COUNT" -ge 5 ]; then
    test_pass "Variants prop used in $VARIANTS_PROP_COUNT locations"
else
    test_skip "Variants prop used in $VARIANTS_PROP_COUNT locations"
fi

# ====================
# HYDRATION SAFETY TESTS
# ====================
echo ""
echo "--- Hydration Safety Tests ---"

# Test 17: Check for isMounted pattern (prevents hydration issues)
IS_MOUNTED_COUNT=$(grep -r "isMounted\|setIsMounted" app/ components/ 2>/dev/null | wc -l)
if [ "$IS_MOUNTED_COUNT" -ge 1 ]; then
    test_pass "Hydration-safe isMounted pattern used in $IS_MOUNTED_COUNT locations"
else
    test_skip "isMounted pattern not used (may be handled differently)"
fi

# Test 18: Check that HomeClient has isMounted for scroll animations
if grep -q "isMounted" "app/HomeClient.tsx" 2>/dev/null; then
    test_pass "HomeClient uses isMounted for hydration safety"
else
    test_fail "HomeClient missing isMounted for scroll animations"
fi

# Test 19: Check for viewport prop with once: true (prevents re-animation)
VIEWPORT_ONCE_COUNT=$(grep -r "once: true" app/ components/ 2>/dev/null | wc -l)
if [ "$VIEWPORT_ONCE_COUNT" -ge 5 ]; then
    test_pass "Viewport 'once: true' used in $VIEWPORT_ONCE_COUNT locations"
else
    test_skip "Viewport 'once: true' used in $VIEWPORT_ONCE_COUNT locations"
fi

# ====================
# MOTION DIV USAGE TESTS
# ====================
echo ""
echo "--- Motion Element Usage Tests ---"

# Test 20: Check for motion.div usage
MOTION_DIV_COUNT=$(grep -r "<motion.div" app/ components/ 2>/dev/null | wc -l)
if [ "$MOTION_DIV_COUNT" -ge 30 ]; then
    test_pass "motion.div used in $MOTION_DIV_COUNT locations"
else
    test_fail "Expected 30+ motion.div usages, found $MOTION_DIV_COUNT"
fi

# Test 21: Check for motion.button usage (interactive elements)
MOTION_BUTTON_COUNT=$(grep -r "<motion.button" app/ components/ 2>/dev/null | wc -l)
if [ "$MOTION_BUTTON_COUNT" -ge 1 ]; then
    test_pass "motion.button used in $MOTION_BUTTON_COUNT locations"
else
    test_skip "motion.button not used"
fi

# Test 22: Check for motion.span usage
MOTION_SPAN_COUNT=$(grep -r "<motion.span" app/ components/ 2>/dev/null | wc -l)
if [ "$MOTION_SPAN_COUNT" -ge 1 ]; then
    test_pass "motion.span used in $MOTION_SPAN_COUNT locations"
else
    test_skip "motion.span not used"
fi

# ====================
# ANIMATION EASING TESTS
# ====================
echo ""
echo "--- Animation Easing Tests ---"

# Test 23: Check for custom easing curves
CUSTOM_EASE_COUNT=$(grep -rE "ease:\s*\[" app/ components/ 2>/dev/null | wc -l)
if [ "$CUSTOM_EASE_COUNT" -ge 1 ]; then
    test_pass "Custom easing curves used in $CUSTOM_EASE_COUNT locations"
else
    test_skip "Custom easing not used (may use defaults)"
fi

# Test 24: Check for spring animations
SPRING_COUNT=$(grep -r "type.*spring\|spring:" app/ components/ 2>/dev/null | wc -l)
if [ "$SPRING_COUNT" -ge 1 ]; then
    test_pass "Spring animations used in $SPRING_COUNT locations"
else
    test_skip "Spring animations not used"
fi

# ====================
# SPECIFIC COMPONENT TESTS
# ====================
echo ""
echo "--- Specific Animation Component Tests ---"

# Test 25: HomeClient has AnimatedTargetText component
if grep -q "AnimatedTargetText" "app/HomeClient.tsx" 2>/dev/null; then
    test_pass "HomeClient has AnimatedTargetText component"
else
    test_fail "HomeClient missing AnimatedTargetText component"
fi

# Test 26: Sidebar has animation variants
if grep -q "listVariants\|itemVariants" "components/layout/Sidebar.tsx" 2>/dev/null; then
    test_pass "Sidebar uses animation variants"
else
    test_fail "Sidebar missing animation variants"
fi

# Test 27: Sidebar has mobile slide animation
if grep -q "initial.*x:" "components/layout/Sidebar.tsx" 2>/dev/null; then
    test_pass "Sidebar has mobile slide animation"
else
    test_fail "Sidebar missing mobile slide animation"
fi

# Test 28: ZeroDBClient uses Variants type
if grep -q "Variants" "app/products/zerodb/ZeroDBClient.tsx" 2>/dev/null; then
    test_pass "ZeroDBClient uses Variants type"
else
    test_skip "ZeroDBClient does not use Variants type"
fi

# ====================
# PERFORMANCE TESTS
# ====================
echo ""
echo "--- Performance Pattern Tests ---"

# Test 29: Check for delay patterns in animations
DELAY_COUNT=$(grep -r "delay:" app/ components/ 2>/dev/null | wc -l)
if [ "$DELAY_COUNT" -ge 5 ]; then
    test_pass "Animation delays used in $DELAY_COUNT locations"
else
    test_skip "Animation delays used sparingly"
fi

# Test 30: Check for duration settings
DURATION_COUNT=$(grep -r "duration:" app/ components/ 2>/dev/null | wc -l)
if [ "$DURATION_COUNT" -ge 10 ]; then
    test_pass "Animation durations configured in $DURATION_COUNT locations"
else
    test_fail "Expected 10+ duration configs, found $DURATION_COUNT"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test 31: Project builds successfully
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with animation components"
else
    test_fail "Project build failed"
    echo "Build output (last 20 lines):"
    tail -20 /tmp/build_output.txt
fi

# ====================
# SUMMARY
# ====================
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
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
