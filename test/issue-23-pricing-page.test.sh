#!/bin/bash
# Issue #23: Migrate Pricing Page
# TDD Test Script - Tests acceptance criteria

set -e

echo "=========================================="
echo "Issue #23: Pricing Page Migration Tests"
echo "=========================================="

PASS_COUNT=0
FAIL_COUNT=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo ""
    echo "TEST: $test_name"
    if eval "$test_command" > /dev/null 2>&1; then
        echo "  PASSED"
        ((PASS_COUNT++))
    else
        echo "  FAILED"
        ((FAIL_COUNT++))
    fi
}

echo ""
echo "--- File Structure Tests ---"

# Test 1: Pricing page exists
run_test "Pricing page exists at app/pricing/page.tsx" \
    "[ -f app/pricing/page.tsx ]"

# Test 2: Config file exists
run_test "App config exists at config/app.config.ts" \
    "[ -f config/app.config.ts ]"

# Test 3: Pricing service exists
run_test "Pricing service exists at services/pricingService.ts" \
    "[ -f services/pricingService.ts ]"

echo ""
echo "--- Pricing Page Content Tests ---"

# Test 4: Page exports metadata for SEO
run_test "Pricing page has metadata export" \
    "grep -q 'export const metadata' app/pricing/page.tsx"

# Test 5: Pricing uses client component for interactivity (Next.js pattern: separate client component)
run_test "Pricing uses client component with 'use client'" \
    "grep -qE \"'use client'|use client\" app/pricing/PricingClient.tsx"

# Test 6: Uses framer-motion for animations (in client component)
run_test "Pricing client imports framer-motion" \
    "grep -q 'framer-motion' app/pricing/PricingClient.tsx"

# Test 7: Uses lucide-react icons (in client component)
run_test "Pricing client imports lucide-react icons" \
    "grep -q 'lucide-react' app/pricing/PricingClient.tsx"

echo ""
echo "--- Pricing Component Features ---"

# Test 8: Has pricing tiers/plans (in client component)
run_test "Pricing client has Plan type or interface" \
    "grep -qE 'interface Plan|type Plan|Plan\\[\\]' app/pricing/PricingClient.tsx"

# Test 9: Has monthly/annual toggle or pricing display (in client component)
run_test "Pricing client displays price values" \
    "grep -qE 'price|Price|\\$' app/pricing/PricingClient.tsx"

# Test 10: Has CTA buttons (in client component)
run_test "Pricing client has Button component" \
    "grep -q 'Button' app/pricing/PricingClient.tsx"

echo ""
echo "--- Config Tests ---"

# Test 11: Config has Stripe price IDs
run_test "Config has Stripe price keys" \
    "grep -q 'stripeKeys' config/app.config.ts"

# Test 12: Config uses NEXT_PUBLIC_ prefix
run_test "Config uses NEXT_PUBLIC_ env vars" \
    "grep -q 'NEXT_PUBLIC_' config/app.config.ts"

echo ""
echo "--- Build Tests ---"

# Test 13: TypeScript compiles without errors
run_test "TypeScript compiles without errors" \
    "npx tsc --noEmit"

# Test 14: Production build succeeds
run_test "Production build succeeds" \
    "npm run build"

echo ""
echo "=========================================="
echo "Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -eq 0 ]; then
    echo "All tests passed!"
    exit 0
else
    echo "Some tests failed"
    exit 1
fi
