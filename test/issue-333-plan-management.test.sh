#!/bin/bash

# Test Script for Issue #333: Plan Management Page - Subscription changes
# This script verifies the implementation of the enhanced plan management functionality

set -e

echo "=========================================="
echo "Issue #333 - Plan Management Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to report test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Verify PlanManagementClient exists
echo "Test 1: Checking PlanManagementClient component exists..."
if [ -f "app/plan/PlanManagementClient.tsx" ]; then
    test_result 0 "PlanManagementClient.tsx exists"
else
    test_result 1 "PlanManagementClient.tsx missing"
fi

# Test 2: Verify page.tsx exists
echo "Test 2: Checking page.tsx exists..."
if [ -f "app/plan/page.tsx" ]; then
    test_result 0 "page.tsx exists"
else
    test_result 1 "page.tsx missing"
fi

# Test 3: Verify upgrade/downgrade functionality
echo "Test 3: Checking upgrade/downgrade implementation..."
if grep -q "handlePlanChange" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Plan change handler implemented"
else
    test_result 1 "Plan change handler missing"
fi

# Test 4: Verify payment method management
echo "Test 4: Checking payment method management..."
if grep -q "handleRemovePaymentMethod" app/plan/PlanManagementClient.tsx && \
   grep -q "handleSetDefaultPaymentMethod" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Payment method management implemented"
else
    test_result 1 "Payment method management incomplete"
fi

# Test 5: Verify billing history
echo "Test 5: Checking billing history implementation..."
if grep -q "invoices" app/plan/PlanManagementClient.tsx && \
   grep -q "formatTimestamp" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Billing history implemented"
else
    test_result 1 "Billing history incomplete"
fi

# Test 6: Verify confirmation dialogs
echo "Test 6: Checking confirmation dialogs..."
if grep -q "Dialog" app/plan/PlanManagementClient.tsx && \
   grep -q "DialogContent" app/plan/PlanManagementClient.tsx && \
   grep -q "dialogType" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Confirmation dialogs implemented"
else
    test_result 1 "Confirmation dialogs incomplete"
fi

# Test 7: Verify prorated billing calculation
echo "Test 7: Checking prorated billing calculation..."
if grep -q "calculateProration" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Prorated billing calculation implemented"
else
    test_result 1 "Prorated billing calculation missing"
fi

# Test 8: Verify tabs implementation
echo "Test 8: Checking tabs for different views..."
if grep -q "Tabs" app/plan/PlanManagementClient.tsx && \
   grep -q "TabsList" app/plan/PlanManagementClient.tsx && \
   grep -q "overview" app/plan/PlanManagementClient.tsx && \
   grep -q "plans" app/plan/PlanManagementClient.tsx && \
   grep -q "payment" app/plan/PlanManagementClient.tsx && \
   grep -q "billing" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Tabs implementation complete"
else
    test_result 1 "Tabs implementation incomplete"
fi

# Test 9: Verify subscription cancellation
echo "Test 9: Checking subscription cancellation..."
if grep -q "handleCancelSubscription" app/plan/PlanManagementClient.tsx && \
   grep -q "confirmCancelSubscription" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Subscription cancellation implemented"
else
    test_result 1 "Subscription cancellation missing"
fi

# Test 10: Verify subscription reactivation
echo "Test 10: Checking subscription reactivation..."
if grep -q "handleReactivateSubscription" app/plan/PlanManagementClient.tsx && \
   grep -q "confirmReactivateSubscription" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Subscription reactivation implemented"
else
    test_result 1 "Subscription reactivation missing"
fi

# Test 11: Verify error handling
echo "Test 11: Checking error handling..."
if grep -q "toast.error" app/plan/PlanManagementClient.tsx && \
   grep -q "catch" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Error handling implemented"
else
    test_result 1 "Error handling incomplete"
fi

# Test 12: Verify loading states
echo "Test 12: Checking loading states..."
if grep -q "loading" app/plan/PlanManagementClient.tsx && \
   grep -q "actionLoading" app/plan/PlanManagementClient.tsx && \
   grep -q "Loader2" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Loading states implemented"
else
    test_result 1 "Loading states incomplete"
fi

# Test 13: Verify test file exists
echo "Test 13: Checking test file exists..."
if [ -f "app/plan/__tests__/PlanManagementClient.test.tsx" ]; then
    test_result 0 "Test file exists"
else
    test_result 1 "Test file missing"
fi

# Test 14: Verify SubscriptionService integration
echo "Test 14: Checking SubscriptionService integration..."
if grep -q "SubscriptionService" app/plan/PlanManagementClient.tsx && \
   grep -q "getCurrentSubscription" app/plan/PlanManagementClient.tsx && \
   grep -q "getPaymentMethods" app/plan/PlanManagementClient.tsx && \
   grep -q "getInvoices" app/plan/PlanManagementClient.tsx; then
    test_result 0 "SubscriptionService properly integrated"
else
    test_result 1 "SubscriptionService integration incomplete"
fi

# Test 15: Verify proper TypeScript types
echo "Test 15: Checking TypeScript types..."
if grep -q "interface PlanDisplay" app/plan/PlanManagementClient.tsx && \
   grep -q "interface CurrentPlanInfo" app/plan/PlanManagementClient.tsx && \
   grep -q "type DialogType" app/plan/PlanManagementClient.tsx; then
    test_result 0 "TypeScript types properly defined"
else
    test_result 1 "TypeScript types incomplete"
fi

# Test 16: Verify accessibility features
echo "Test 16: Checking accessibility features..."
if grep -q "aria-" app/plan/PlanManagementClient.tsx || \
   grep -q "role=" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Accessibility features present"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Limited accessibility attributes found"
fi

# Test 17: Verify responsive design implementation
echo "Test 17: Checking responsive design..."
if grep -q "grid-cols-1" app/plan/PlanManagementClient.tsx && \
   grep -q "lg:grid-cols-" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Responsive design implemented"
else
    test_result 1 "Responsive design incomplete"
fi

# Test 18: Verify animation implementation
echo "Test 18: Checking animations..."
if grep -q "motion" app/plan/PlanManagementClient.tsx && \
   grep -q "framer-motion" app/plan/PlanManagementClient.tsx; then
    test_result 0 "Animations implemented"
else
    test_result 1 "Animations missing"
fi

# Test 19: Verify proper imports
echo "Test 19: Checking required imports..."
REQUIRED_IMPORTS=("useState" "useEffect" "useRouter" "toast" "SubscriptionService" "pricingService")
MISSING_IMPORTS=0

for import in "${REQUIRED_IMPORTS[@]}"; do
    if ! grep -q "$import" app/plan/PlanManagementClient.tsx; then
        echo -e "${RED}  Missing import: $import${NC}"
        ((MISSING_IMPORTS++))
    fi
done

if [ $MISSING_IMPORTS -eq 0 ]; then
    test_result 0 "All required imports present"
else
    test_result 1 "Missing $MISSING_IMPORTS required imports"
fi

# Test 20: Verify no forbidden patterns
echo "Test 20: Checking for forbidden patterns..."
FORBIDDEN_FOUND=0

if grep -q "react-router-dom" app/plan/PlanManagementClient.tsx; then
    echo -e "${RED}  Found forbidden: react-router-dom${NC}"
    ((FORBIDDEN_FOUND++))
fi

if grep -q "react-helmet" app/plan/PlanManagementClient.tsx; then
    echo -e "${RED}  Found forbidden: react-helmet${NC}"
    ((FORBIDDEN_FOUND++))
fi

if [ $FORBIDDEN_FOUND -eq 0 ]; then
    test_result 0 "No forbidden patterns found"
else
    test_result 1 "Found $FORBIDDEN_FOUND forbidden patterns"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "=========================================="

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
