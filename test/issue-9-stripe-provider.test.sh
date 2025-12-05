#!/bin/bash
# Issue #9: Migrate Stripe Provider - TDD Acceptance Tests
# Tests based on acceptance criteria from the issue

set -e

PROJECT_DIR="/home/quaid/Documents/Projects/ainative-studio/src/ainative-nextjs"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    PASSED=$((PASSED + 1))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    FAILED=$((FAILED + 1))
}

echo "=========================================="
echo "Issue #9: Migrate Stripe Provider"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: Stripe packages installed
echo "--- AC1: Stripe packages installed ---"

if grep -q '"@stripe/stripe-js"' package.json 2>/dev/null; then
    pass "@stripe/stripe-js is installed"
else
    fail "@stripe/stripe-js is not installed"
fi

if grep -q '"@stripe/react-stripe-js"' package.json 2>/dev/null; then
    pass "@stripe/react-stripe-js is installed"
else
    fail "@stripe/react-stripe-js is not installed"
fi

# AC2: Stripe provider file exists in correct location
echo ""
echo "--- AC2: Stripe provider location ---"

if [ -f "components/providers/StripeProvider.tsx" ] || [ -f "providers/StripeProvider.tsx" ]; then
    pass "Stripe provider file exists"
else
    fail "Stripe provider file missing"
fi

# AC3: Marked as Client Component
echo ""
echo "--- AC3: Client Component directive ---"

STRIPE_FILE=""
if [ -f "components/providers/StripeProvider.tsx" ]; then
    STRIPE_FILE="components/providers/StripeProvider.tsx"
elif [ -f "providers/StripeProvider.tsx" ]; then
    STRIPE_FILE="providers/StripeProvider.tsx"
fi

if [ -n "$STRIPE_FILE" ]; then
    if head -1 "$STRIPE_FILE" | grep -q "use client"; then
        pass "Stripe provider has 'use client' directive"
    else
        fail "Stripe provider missing 'use client' directive"
    fi
else
    fail "Cannot check - Stripe provider file not found"
fi

# AC4: Uses Stripe Elements
echo ""
echo "--- AC4: Stripe Elements usage ---"

if [ -n "$STRIPE_FILE" ]; then
    if grep -q "Elements" "$STRIPE_FILE" 2>/dev/null; then
        pass "Uses Stripe Elements component"
    else
        fail "Stripe Elements not used"
    fi

    if grep -q "loadStripe" "$STRIPE_FILE" 2>/dev/null; then
        pass "Uses loadStripe function"
    else
        fail "loadStripe not used"
    fi
else
    fail "Cannot check - Stripe provider file not found"
    fail "Cannot check - Stripe provider file not found"
fi

# AC5: Environment variable configured
echo ""
echo "--- AC5: Environment variable usage ---"

if [ -n "$STRIPE_FILE" ]; then
    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\|process.env" "$STRIPE_FILE" 2>/dev/null; then
        pass "Uses environment variable for Stripe key"
    else
        fail "Environment variable not used for Stripe key"
    fi
else
    fail "Cannot check - Stripe provider file not found"
fi

# AC6: Stripe key in .env.example
echo ""
echo "--- AC6: Stripe key documented ---"

if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.example 2>/dev/null; then
    pass "Stripe publishable key in .env.example"
else
    fail "Stripe publishable key not in .env.example"
fi

# AC7: Provider exported correctly
echo ""
echo "--- AC7: Provider export ---"

if [ -n "$STRIPE_FILE" ]; then
    if grep -q "export.*StripeProvider\|export function StripeProvider\|export const StripeProvider" "$STRIPE_FILE" 2>/dev/null; then
        pass "StripeProvider is exported"
    else
        fail "StripeProvider not exported"
    fi
else
    fail "Cannot check - Stripe provider file not found"
fi

# AC8: Graceful handling when Stripe key is missing
echo ""
echo "--- AC8: Graceful fallback ---"

if [ -n "$STRIPE_FILE" ]; then
    if grep -q "null\|undefined\|!.*key\|missing\|warn" "$STRIPE_FILE" 2>/dev/null; then
        pass "Has fallback for missing Stripe key"
    else
        fail "No fallback for missing Stripe key"
    fi
else
    fail "Cannot check - Stripe provider file not found"
fi

# AC9: TypeScript types
echo ""
echo "--- AC9: TypeScript support ---"

if npm run build 2>&1 | grep -q "error TS"; then
    fail "TypeScript errors in build"
else
    pass "No TypeScript errors"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
