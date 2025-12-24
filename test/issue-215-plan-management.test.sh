#!/bin/bash

# Test script for Issue #215: Migrate PlanManagementPage from Vite SPA to Next.js
# This script verifies the migration follows the project's established patterns

set -e

echo "🧪 Testing Plan Management Page Migration (Issue #215)"
echo "=================================================="

PROJECT_ROOT="/Users/tobymorning/Cody/projects/ainative-website-nextjs-staging"
PLAN_DIR="$PROJECT_ROOT/app/plan"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Helper functions
pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASS++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAIL++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Directory structure
echo ""
echo "Test 1: Verify directory structure"
if [ -d "$PLAN_DIR" ]; then
  pass "Plan directory exists"
else
  fail "Plan directory missing"
fi

# Test 2: Server component (page.tsx)
echo ""
echo "Test 2: Verify server component (page.tsx)"
if [ -f "$PLAN_DIR/page.tsx" ]; then
  pass "page.tsx exists"

  # Check for metadata export
  if grep -q "export const metadata" "$PLAN_DIR/page.tsx"; then
    pass "Metadata export found"
  else
    fail "Missing metadata export"
  fi

  # Check for Metadata import
  if grep -q "import.*Metadata.*from 'next'" "$PLAN_DIR/page.tsx"; then
    pass "Metadata type imported"
  else
    fail "Missing Metadata import"
  fi

  # Check NO 'use client' directive
  if ! grep -q "'use client'" "$PLAN_DIR/page.tsx"; then
    pass "No 'use client' directive (correct for server component)"
  else
    fail "Found 'use client' directive (should not be in server component)"
  fi
else
  fail "page.tsx missing"
fi

# Test 3: Client component (PlanManagementClient.tsx)
echo ""
echo "Test 3: Verify client component (PlanManagementClient.tsx)"
if [ -f "$PLAN_DIR/PlanManagementClient.tsx" ]; then
  pass "PlanManagementClient.tsx exists"

  # Check for 'use client' directive
  if grep -q "'use client'" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "'use client' directive found"
  else
    fail "Missing 'use client' directive"
  fi

  # Check for Next.js router import
  if grep -q "from 'next/navigation'" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "Next.js navigation imported"
  else
    fail "Missing Next.js navigation import"
  fi

  # Check NO react-router-dom
  if ! grep -q "react-router-dom" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "No react-router-dom imports (correctly migrated)"
  else
    fail "Found react-router-dom imports (should use Next.js router)"
  fi

  # Check NO react-helmet-async
  if ! grep -q "react-helmet" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "No react-helmet imports (correctly migrated)"
  else
    fail "Found react-helmet imports (should use metadata in page.tsx)"
  fi

  # Check for subscriptionService import
  if grep -q "@/services/subscriptionService" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "Subscription service imported from @/services/"
  else
    fail "Missing or incorrect subscription service import"
  fi

  # Check for framer-motion (animations preserved)
  if grep -q "from 'framer-motion'" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "Framer Motion animations preserved"
  else
    warn "Framer Motion not found (animations may be missing)"
  fi

  # Check for useRouter usage
  if grep -q "useRouter" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "useRouter hook used"
  else
    fail "Missing useRouter hook"
  fi

  # Check router.back() or router.push() usage
  if grep -q "router\.back()" "$PLAN_DIR/PlanManagementClient.tsx" || grep -q "router\.push(" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "Router navigation methods used"
  else
    fail "Missing router navigation methods"
  fi

else
  fail "PlanManagementClient.tsx missing"
fi

# Test 4: Component functionality
echo ""
echo "Test 4: Verify component functionality"
if [ -f "$PLAN_DIR/PlanManagementClient.tsx" ]; then
  # Check for essential features
  if grep -q "getCurrentPlan" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "getCurrentPlan function call found"
  else
    fail "Missing getCurrentPlan function call"
  fi

  if grep -q "getAvailablePlans" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "getAvailablePlans function call found"
  else
    fail "Missing getAvailablePlans function call"
  fi

  if grep -q "cancelSubscription" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "cancelSubscription function found"
  else
    fail "Missing cancelSubscription function"
  fi

  # Check for UI components
  if grep -q "Card" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "shadcn/ui Card component used"
  else
    fail "Missing Card component"
  fi

  if grep -q "Badge" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "shadcn/ui Badge component used"
  else
    fail "Missing Badge component"
  fi

  if grep -q "Button" "$PLAN_DIR/PlanManagementClient.tsx"; then
    pass "shadcn/ui Button component used"
  else
    fail "Missing Button component"
  fi
fi

# Test 5: Subscription service exists
echo ""
echo "Test 5: Verify subscription service"
if [ -f "$PROJECT_ROOT/services/subscriptionService.ts" ]; then
  pass "Subscription service exists"

  if grep -q "class SubscriptionService" "$PROJECT_ROOT/services/subscriptionService.ts"; then
    pass "SubscriptionService class found"
  else
    fail "SubscriptionService class not found"
  fi

  if grep -q "getCurrentPlan" "$PROJECT_ROOT/services/subscriptionService.ts"; then
    pass "getCurrentPlan method exists"
  else
    fail "getCurrentPlan method missing"
  fi

  if grep -q "getAvailablePlans" "$PROJECT_ROOT/services/subscriptionService.ts"; then
    pass "getAvailablePlans method exists"
  else
    fail "getAvailablePlans method missing"
  fi

  if grep -q "cancelSubscription" "$PROJECT_ROOT/services/subscriptionService.ts"; then
    pass "cancelSubscription method exists"
  else
    fail "cancelSubscription method missing"
  fi
else
  fail "Subscription service missing"
fi

# Test 6: TypeScript compilation
echo ""
echo "Test 6: TypeScript type checking"
cd "$PROJECT_ROOT"
if npm run type-check 2>&1 | grep -q "error"; then
  fail "TypeScript compilation has errors"
else
  pass "TypeScript compilation successful"
fi

# Summary
echo ""
echo "=================================================="
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "Migration checklist:"
  echo "  ✓ Server component with metadata"
  echo "  ✓ Client component with 'use client'"
  echo "  ✓ Next.js router (no react-router-dom)"
  echo "  ✓ No react-helmet (metadata in page.tsx)"
  echo "  ✓ Subscription service integration"
  echo "  ✓ UI components and animations"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  echo ""
  exit 1
fi
