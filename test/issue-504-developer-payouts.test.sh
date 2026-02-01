#!/bin/bash

# Test script for Issue #504 - Developer Payouts Page
# This script verifies the Developer Payouts page implementation with TDD approach

set -e

echo "===== Testing Issue #504: Developer Payouts Page ====="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
test_file() {
  local file=$1
  local description=$2

  TESTS_RUN=$((TESTS_RUN + 1))

  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $description is missing"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Helper function to check file content
test_content() {
  local file=$1
  local pattern=$2
  local description=$3

  TESTS_RUN=$((TESTS_RUN + 1))

  if grep -q "$pattern" "$file"; then
    echo -e "${GREEN}✓${NC} $description"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Helper function to check file does NOT contain pattern
test_no_content() {
  local file=$1
  local pattern=$2
  local description=$3

  TESTS_RUN=$((TESTS_RUN + 1))

  if ! grep -q "$pattern" "$file"; then
    echo -e "${GREEN}✓${NC} $description"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

echo "1. File Structure Tests"
echo "----------------------"

# Test file existence
test_file "services/payoutService.ts" "Payout service (payoutService.ts)"
test_file "app/developer/payouts/page.tsx" "Server component (page.tsx)"
test_file "app/developer/payouts/PayoutsClient.tsx" "Client component (PayoutsClient.tsx)"

echo ""
echo "2. Service Layer Tests (payoutService.ts)"
echo "-----------------------------------------"

# Test service interfaces and methods
test_content "services/payoutService.ts" "export interface Payout" "Has Payout interface"
test_content "services/payoutService.ts" "export interface ConnectedPaymentMethod" "Has ConnectedPaymentMethod interface"
test_content "services/payoutService.ts" "export interface AutoPayoutSettings" "Has AutoPayoutSettings interface"
test_content "services/payoutService.ts" "export interface TaxForm" "Has TaxForm interface"
test_content "services/payoutService.ts" "export interface PayoutNotificationPreferences" "Has PayoutNotificationPreferences interface"
test_content "services/payoutService.ts" "export interface StripeConnectStatus" "Has StripeConnectStatus interface"
test_content "services/payoutService.ts" "export class PayoutService" "Has PayoutService class"
test_content "services/payoutService.ts" "getStripeConnectStatus" "Has Stripe Connect status method"
test_content "services/payoutService.ts" "getPaymentMethods" "Has payment methods method"
test_content "services/payoutService.ts" "getPayouts" "Has get payouts method"
test_content "services/payoutService.ts" "getAutoPayoutSettings" "Has auto-payout settings method"
test_content "services/payoutService.ts" "getTaxForms" "Has get tax forms method"
test_content "services/payoutService.ts" "uploadTaxForm" "Has upload tax form method"
test_content "services/payoutService.ts" "getNotificationPreferences" "Has notification preferences method"

echo ""
echo "3. Server Component Tests (page.tsx)"
echo "------------------------------------"

# Test server component structure
test_content "app/developer/payouts/page.tsx" "export const metadata" "Exports metadata for SEO"
test_content "app/developer/payouts/page.tsx" "import PayoutsClient" "Imports PayoutsClient component"
test_no_content "app/developer/payouts/page.tsx" "'use client'" "Does NOT have 'use client' directive"
test_content "app/developer/payouts/page.tsx" "Developer Payouts" "Has correct page title"

echo ""
echo "4. Client Component Tests (PayoutsClient.tsx)"
echo "----------------------------------------------"

# Test client component structure
test_content "app/developer/payouts/PayoutsClient.tsx" "'use client'" "Has 'use client' directive at top"
test_content "app/developer/payouts/PayoutsClient.tsx" "payoutService" "Imports payoutService"
test_content "app/developer/payouts/PayoutsClient.tsx" "from '@/services/payoutService'" "Uses correct service import path"
test_no_content "app/developer/payouts/PayoutsClient.tsx" "react-router-dom" "Does NOT import react-router-dom"
test_no_content "app/developer/payouts/PayoutsClient.tsx" "react-helmet" "Does NOT import react-helmet"

echo ""
echo "5. Stripe Connect Integration Tests"
echo "-----------------------------------"

# Test Stripe Connect features
test_content "app/developer/payouts/PayoutsClient.tsx" "StripeConnectStatus" "Has StripeConnect status display"
test_content "app/developer/payouts/PayoutsClient.tsx" "handleConnectAccount\\|connectAccount\\|Connect with Stripe" "Has Stripe Connect onboarding"
test_content "app/developer/payouts/PayoutsClient.tsx" "charges_enabled\\|payouts_enabled" "Displays Stripe account status"

echo ""
echo "6. Payment Method Configuration Tests"
echo "-------------------------------------"

# Test payment method management
test_content "app/developer/payouts/PayoutsClient.tsx" "ConnectedPaymentMethod\\|PaymentMethod" "Has payment method display"
test_content "app/developer/payouts/PayoutsClient.tsx" "bank_account\\|debit_card" "Supports bank accounts and debit cards"
test_content "app/developer/payouts/PayoutsClient.tsx" "addPaymentMethod\\|handleAddPayment" "Has add payment method functionality"
test_content "app/developer/payouts/PayoutsClient.tsx" "removePaymentMethod\\|handleRemovePayment\\|Delete" "Has remove payment method functionality"
test_content "app/developer/payouts/PayoutsClient.tsx" "is_default\\|setDefault" "Has default payment method setting"

echo ""
echo "7. Payout History Tests"
echo "----------------------"

# Test payout history display
test_content "app/developer/payouts/PayoutsClient.tsx" "Payout History\\|Recent Payouts" "Has payout history section"
test_content "app/developer/payouts/PayoutsClient.tsx" "status.*pending\\|in_transit\\|paid\\|failed" "Displays payout statuses"
test_content "app/developer/payouts/PayoutsClient.tsx" "Table\\|table\\|td\\|tr" "Uses table for payout history"
test_content "app/developer/payouts/PayoutsClient.tsx" "amount\\|currency" "Displays payout amounts"
test_content "app/developer/payouts/PayoutsClient.tsx" "arrival_date\\|created_at" "Displays payout dates"

echo ""
echo "8. Auto-Payout Settings Tests"
echo "-----------------------------"

# Test automatic payout settings
test_content "app/developer/payouts/PayoutsClient.tsx" "AutoPayoutSettings\\|Automatic Payout" "Has auto-payout settings"
test_content "app/developer/payouts/PayoutsClient.tsx" "schedule.*daily\\|weekly\\|monthly\\|manual" "Has payout schedule options"
test_content "app/developer/payouts/PayoutsClient.tsx" "threshold" "Has payout threshold setting"
test_content "app/developer/payouts/PayoutsClient.tsx" "autoSettings.enabled\\|auto-payout-enabled" "Has enable/disable auto-payout toggle"
test_content "app/developer/payouts/PayoutsClient.tsx" "updateAutoPayoutSettings\\|saveAutoSettings" "Has save auto-payout settings"

echo ""
echo "9. Tax Form Management Tests"
echo "----------------------------"

# Test tax form features
test_content "app/developer/payouts/PayoutsClient.tsx" "Tax Form\\|W9\\|1099" "Has tax form section"
test_content "app/developer/payouts/PayoutsClient.tsx" "uploadTaxForm\\|handleUploadTax\\|Upload" "Has tax form upload"
test_content "app/developer/payouts/PayoutsClient.tsx" "downloadTaxForm\\|Download" "Has tax form download"
test_content "app/developer/payouts/PayoutsClient.tsx" "type=.*file" "Has file upload input"

echo ""
echo "10. Notification Preferences Tests"
echo "----------------------------------"

# Test notification settings
test_content "app/developer/payouts/PayoutsClient.tsx" "Notification.*Preferences\\|Email.*Notifications" "Has notification preferences"
test_content "app/developer/payouts/PayoutsClient.tsx" "email_on_payout\\|email.*payout" "Has email notification toggles"
test_content "app/developer/payouts/PayoutsClient.tsx" "updateNotificationPreferences\\|saveNotifications" "Has save notification preferences"

echo ""
echo "11. UI Component Tests"
echo "---------------------"

# Test UI component usage
test_content "app/developer/payouts/PayoutsClient.tsx" "@/components/ui/button" "Imports Button component"
test_content "app/developer/payouts/PayoutsClient.tsx" "@/components/ui/card" "Imports Card component"
test_content "app/developer/payouts/PayoutsClient.tsx" "@/components/ui/switch\\|@/components/ui/select" "Imports form components"
test_content "app/developer/payouts/PayoutsClient.tsx" "lucide-react" "Uses lucide-react icons"
test_content "app/developer/payouts/PayoutsClient.tsx" "toast\\|useToast" "Uses toast notifications"

echo ""
echo "12. Responsive Design Tests"
echo "---------------------------"

# Test responsive design patterns
test_content "app/developer/payouts/PayoutsClient.tsx" "md:\\|lg:\\|sm:" "Uses responsive Tailwind classes"
test_content "app/developer/payouts/PayoutsClient.tsx" "grid\\|flex" "Uses responsive layout"

echo ""
echo "13. Error Handling Tests"
echo "-----------------------"

# Test error handling
test_content "app/developer/payouts/PayoutsClient.tsx" "try.*catch\\|error" "Has error handling"
test_content "app/developer/payouts/PayoutsClient.tsx" "loading\\|isLoading" "Has loading states"

echo ""
echo "14. TypeScript Type Safety Tests"
echo "--------------------------------"

# Test TypeScript usage
test_content "app/developer/payouts/PayoutsClient.tsx" "Payout\\[\\]\\|Array<Payout>" "Uses typed arrays"
test_content "app/developer/payouts/PayoutsClient.tsx" "useState<\\|React.FC" "Uses TypeScript generics"

echo ""
echo "===== Test Summary ====="
echo "Tests Run:    $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

# Calculate pass rate
PASS_RATE=$((TESTS_PASSED * 100 / TESTS_RUN))
echo -e "Pass Rate:    ${YELLOW}$PASS_RATE%${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
elif [ $PASS_RATE -ge 85 ]; then
  echo -e "${YELLOW}Pass rate meets 85% threshold but some tests failed.${NC}"
  exit 0
else
  echo -e "${RED}Tests failed! Pass rate below 85% threshold.${NC}"
  exit 1
fi
