#!/bin/bash
# Story #34: Dashboard Landing Page Tests
# Tests for dashboard page migration with NextAuth integration
# Part of Sprint 2 - Dashboard Migrations

# Don't exit on error - we handle test failures ourselves
# set -e

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

echo "========================================"
echo "Story #34: Dashboard Landing Page Tests"
echo "========================================"
echo ""

# ====================
# FILE STRUCTURE TESTS
# ====================
echo "--- File Structure Tests ---"

# Test 1: Dashboard page exists
if [ -f "app/dashboard/page.tsx" ]; then
    test_pass "Dashboard page exists at app/dashboard/page.tsx"
else
    test_fail "Dashboard page not found at app/dashboard/page.tsx"
fi

# Test 2: Dashboard client component exists
if [ -f "app/dashboard/DashboardClient.tsx" ]; then
    test_pass "Dashboard client component exists"
else
    test_fail "Dashboard client component not found"
fi

# Test 3: Dashboard page exports metadata
if grep -q "export const metadata" "app/dashboard/page.tsx" 2>/dev/null; then
    test_pass "Dashboard page exports metadata for SEO"
else
    test_fail "Dashboard page missing metadata export"
fi

# ====================
# NEXTAUTH INTEGRATION TESTS
# ====================
echo ""
echo "--- NextAuth Integration Tests ---"

# Test 4: Dashboard client uses useSession hook
if grep -q "useSession" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard client uses useSession hook"
else
    test_fail "Dashboard client not using useSession hook"
fi

# Test 5: Dashboard imports useSession from next-auth
if grep -q "import.*useSession.*from 'next-auth/react'" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard imports useSession from next-auth/react"
else
    test_fail "Dashboard not importing useSession correctly"
fi

# Test 6: Dashboard handles session loading state
if grep -q "status === 'loading'" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard handles session loading state"
else
    test_fail "Dashboard not handling session loading state"
fi

# Test 7: No localStorage auth checks (should use NextAuth)
if ! grep -q "localStorage.getItem('access_token')" "app/dashboard/DashboardClient.tsx" 2>/dev/null && \
   ! grep -q "localStorage.getItem('auth_token')" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard does not use localStorage for auth (uses NextAuth)"
else
    test_fail "Dashboard still using localStorage for auth instead of NextAuth"
fi

# Test 8: Dashboard uses session.user for user data
if grep -q "session?.user" "app/dashboard/DashboardClient.tsx" 2>/dev/null || \
   grep -q "session.user" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard uses session.user for user data"
else
    test_fail "Dashboard not using session.user for user data"
fi

# ====================
# MIDDLEWARE PROTECTION TESTS
# ====================
echo ""
echo "--- Middleware Protection Tests ---"

# Test 9: Middleware exists and protects dashboard
if [ -f "middleware.ts" ]; then
    if grep -q "/dashboard" "middleware.ts" 2>/dev/null; then
        test_pass "Middleware protects /dashboard route"
    else
        test_fail "Middleware exists but doesn't protect /dashboard"
    fi
else
    test_fail "Middleware.ts not found"
fi

# ====================
# COMPONENT STRUCTURE TESTS
# ====================
echo ""
echo "--- Component Structure Tests ---"

# Test 10: Dashboard is a client component
if grep -q "'use client'" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "DashboardClient is marked as client component"
else
    test_fail "DashboardClient not marked as client component"
fi

# Test 11: Dashboard page imports client component
if grep -q "import DashboardClient" "app/dashboard/page.tsx" 2>/dev/null; then
    test_pass "Dashboard page imports DashboardClient"
else
    test_fail "Dashboard page not importing DashboardClient"
fi

# Test 12: Dashboard uses framer-motion for animations
if grep -q "framer-motion" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard uses framer-motion for animations"
else
    test_fail "Dashboard not using framer-motion"
fi

# ====================
# UI COMPONENT TESTS
# ====================
echo ""
echo "--- UI Component Tests ---"

# Test 13: Dashboard has usage section
if grep -q "Usage" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has usage section"
else
    test_fail "Dashboard missing usage section"
fi

# Test 14: Dashboard has Base Prompt Credits section
if grep -q "Base Prompt Credits" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has Base Prompt Credits section"
else
    test_fail "Dashboard missing Base Prompt Credits section"
fi

# Test 15: Dashboard has Add-on Credits section
if grep -q "Add-on Prompt Credits" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has Add-on Prompt Credits section"
else
    test_fail "Dashboard missing Add-on Credits section"
fi

# Test 16: Dashboard has Cost Breakdown section
if grep -q "Cost Breakdown" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has Cost Breakdown section"
else
    test_fail "Dashboard missing Cost Breakdown section"
fi

# Test 17: Dashboard has AI Metrics section
if grep -q "AI Development Metrics" "app/dashboard/DashboardClient.tsx" 2>/dev/null || \
   grep -q "AI Metrics" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has AI Metrics section"
else
    test_fail "Dashboard missing AI Metrics section"
fi

# ====================
# NAVIGATION TESTS
# ====================
echo ""
echo "--- Navigation Tests ---"

# Test 18: Dashboard has link to pricing page
if grep -q '"/pricing"' "app/dashboard/DashboardClient.tsx" 2>/dev/null || \
   grep -q "href=\"/pricing\"" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has link to pricing page"
else
    test_fail "Dashboard missing link to pricing page"
fi

# Test 19: Dashboard has link to refills page
if grep -q '"/refills"' "app/dashboard/DashboardClient.tsx" 2>/dev/null || \
   grep -q "href=\"/refills\"" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has link to refills page"
else
    test_fail "Dashboard missing link to refills page"
fi

# Test 20: Dashboard has purchase credits action
if grep -q "handlePurchaseCredits" "app/dashboard/DashboardClient.tsx" 2>/dev/null || \
   grep -q "purchase-credits" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has purchase credits action"
else
    test_fail "Dashboard missing purchase credits action"
fi

# ====================
# QUICK ACTIONS TESTS
# ====================
echo ""
echo "--- Quick Actions Tests ---"

# Test 21: Dashboard has refresh functionality
if grep -q "handleRefresh" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has refresh functionality"
else
    test_fail "Dashboard missing refresh functionality"
fi

# Test 22: Dashboard has export functionality
if grep -q "handleExportUsage" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has export usage functionality"
else
    test_fail "Dashboard missing export functionality"
fi

# Test 23: Dashboard has CSV export option
if grep -q "Export CSV" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has CSV export option"
else
    test_fail "Dashboard missing CSV export option"
fi

# Test 24: Dashboard has JSON export option
if grep -q "Export JSON" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has JSON export option"
else
    test_fail "Dashboard missing JSON export option"
fi

# ====================
# DATA DISPLAY TESTS
# ====================
echo ""
echo "--- Data Display Tests ---"

# Test 25: Dashboard shows progress bars for credits
if grep -q "getProgressBarColor" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard shows color-coded progress bars"
else
    test_fail "Dashboard missing progress bar color logic"
fi

# Test 26: Dashboard has loading state
if grep -q "Loading" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has loading state UI"
else
    test_fail "Dashboard missing loading state"
fi

# Test 27: Dashboard has error handling
if grep -q "apiError" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard has API error handling"
else
    test_fail "Dashboard missing API error handling"
fi

# Test 28: Dashboard shows next plan refresh info
if grep -q "nextPlanRefresh" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard shows next plan refresh information"
else
    test_fail "Dashboard missing next plan refresh info"
fi

# ====================
# SEO & METADATA TESTS
# ====================
echo ""
echo "--- SEO & Metadata Tests ---"

# Test 29: Dashboard has title metadata
if grep -q "title:" "app/dashboard/page.tsx" 2>/dev/null; then
    test_pass "Dashboard has title metadata"
else
    test_fail "Dashboard missing title metadata"
fi

# Test 30: Dashboard has description metadata
if grep -q "description:" "app/dashboard/page.tsx" 2>/dev/null; then
    test_pass "Dashboard has description metadata"
else
    test_fail "Dashboard missing description metadata"
fi

# Test 31: Dashboard has robots noindex (protected page)
if grep -q "robots:" "app/dashboard/page.tsx" 2>/dev/null && \
   grep -q "index: false" "app/dashboard/page.tsx" 2>/dev/null; then
    test_pass "Dashboard has robots noindex for protected page"
else
    test_fail "Dashboard missing robots noindex directive"
fi

# ====================
# UI COMPONENT IMPORTS TESTS
# ====================
echo ""
echo "--- UI Component Import Tests ---"

# Test 32: Dashboard uses shadcn Button component
if grep -q "import.*Button.*from '@/components/ui/button'" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard uses shadcn Button component"
else
    test_fail "Dashboard not using shadcn Button"
fi

# Test 33: Dashboard uses shadcn Card components
if grep -q "import.*Card.*from '@/components/ui/card'" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard uses shadcn Card components"
else
    test_fail "Dashboard not using shadcn Card"
fi

# Test 34: Dashboard uses lucide-react icons
if grep -q "from 'lucide-react'" "app/dashboard/DashboardClient.tsx" 2>/dev/null; then
    test_pass "Dashboard uses lucide-react icons"
else
    test_fail "Dashboard not using lucide-react icons"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test 35: Project builds successfully
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with dashboard changes"
else
    test_fail "Project build failed"
    echo "Build output (last 20 lines):"
    tail -20 /tmp/build_output.txt
fi

# ====================
# SUMMARY
# ====================
echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
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
