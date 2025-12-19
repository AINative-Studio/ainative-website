#!/bin/bash
# Story #35: Main Dashboard Page Tests
# Tests for main dashboard page with widgets and charts (Recharts)
# Part of Sprint 2 - Dashboard Migrations

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
echo "Story #35: Main Dashboard Page Tests"
echo "========================================"
echo ""

# ====================
# FILE STRUCTURE TESTS
# ====================
echo "--- File Structure Tests ---"

# Test 1: Main dashboard page exists
if [ -f "app/dashboard/main/page.tsx" ]; then
    test_pass "Main dashboard page exists at app/dashboard/main/page.tsx"
else
    test_fail "Main dashboard page not found at app/dashboard/main/page.tsx"
fi

# Test 2: Main dashboard client component exists
if [ -f "app/dashboard/main/MainDashboardClient.tsx" ]; then
    test_pass "Main dashboard client component exists"
else
    test_fail "Main dashboard client component not found"
fi

# Test 3: Main dashboard page exports metadata
if grep -q "export const metadata" "app/dashboard/main/page.tsx" 2>/dev/null; then
    test_pass "Main dashboard page exports metadata for SEO"
else
    test_fail "Main dashboard page missing metadata export"
fi

# ====================
# NEXTAUTH INTEGRATION TESTS
# ====================
echo ""
echo "--- NextAuth Integration Tests ---"

# Test 4: Main dashboard client uses useSession hook
if grep -q "useSession" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard client uses useSession hook"
else
    test_fail "Main dashboard client not using useSession hook"
fi

# Test 5: Main dashboard imports useSession from next-auth
if grep -q "import.*useSession.*from 'next-auth/react'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard imports useSession from next-auth/react"
else
    test_fail "Main dashboard not importing useSession correctly"
fi

# Test 6: Main dashboard handles session loading state
if grep -q "status === 'loading'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard handles session loading state"
else
    test_fail "Main dashboard not handling session loading state"
fi

# ====================
# REACT QUERY TESTS
# ====================
echo ""
echo "--- React Query Integration Tests ---"

# Test 7: Main dashboard uses React Query
if grep -q "useQuery" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard uses React Query useQuery hook"
else
    test_fail "Main dashboard not using React Query"
fi

# Test 8: Main dashboard imports useQuery from tanstack
if grep -q "import.*useQuery.*from '@tanstack/react-query'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard imports useQuery from @tanstack/react-query"
else
    test_fail "Main dashboard not importing useQuery correctly"
fi

# Test 9: Main dashboard has multiple query keys
QUERY_COUNT=$(grep -c "queryKey:" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null || echo "0")
if [ "$QUERY_COUNT" -ge 3 ]; then
    test_pass "Main dashboard has multiple React Query data fetching ($QUERY_COUNT queries)"
else
    test_fail "Main dashboard should have at least 3 data queries (found $QUERY_COUNT)"
fi

# Test 10: Main dashboard has staleTime configured
if grep -q "staleTime" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard has staleTime configured for data caching"
else
    test_fail "Main dashboard missing staleTime configuration"
fi

# ====================
# RECHARTS TESTS
# ====================
echo ""
echo "--- Recharts Integration Tests ---"

# Test 11: Recharts is installed
if grep -q '"recharts"' "package.json" 2>/dev/null; then
    test_pass "Recharts is installed in package.json"
else
    test_fail "Recharts not found in package.json"
fi

# Test 12: Main dashboard imports Recharts components
if grep -q "from 'recharts'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard imports Recharts components"
else
    test_fail "Main dashboard not importing Recharts"
fi

# Test 13: Main dashboard uses AreaChart
if grep -q "AreaChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard uses AreaChart component"
else
    test_fail "Main dashboard missing AreaChart component"
fi

# Test 14: Main dashboard uses BarChart
if grep -q "BarChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard uses BarChart component"
else
    test_fail "Main dashboard missing BarChart component"
fi

# Test 15: Main dashboard uses PieChart
if grep -q "PieChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard uses PieChart component"
else
    test_fail "Main dashboard missing PieChart component"
fi

# Test 16: Main dashboard uses LineChart
if grep -q "LineChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard uses LineChart component"
else
    test_fail "Main dashboard missing LineChart component"
fi

# Test 17: Charts use ResponsiveContainer
if grep -q "ResponsiveContainer" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Charts use ResponsiveContainer for responsive sizing"
else
    test_fail "Charts missing ResponsiveContainer"
fi

# ====================
# WIDGET TESTS
# ====================
echo ""
echo "--- Dashboard Widgets Tests ---"

# Test 18: Main dashboard has stats widgets
if grep -q "StatWidget" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard has StatWidget components"
else
    test_fail "Main dashboard missing StatWidget components"
fi

# Test 19: Main dashboard shows total requests
if grep -q "totalRequests" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard shows total API requests"
else
    test_fail "Main dashboard missing total requests stat"
fi

# Test 20: Main dashboard shows active projects
if grep -q "activeProjects" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard shows active projects"
else
    test_fail "Main dashboard missing active projects stat"
fi

# Test 21: Main dashboard shows credits used
if grep -q "creditsUsed" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard shows credits used"
else
    test_fail "Main dashboard missing credits used stat"
fi

# Test 22: Main dashboard shows response time
if grep -q "avgResponseTime" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard shows average response time"
else
    test_fail "Main dashboard missing response time stat"
fi

# ====================
# UI COMPONENT TESTS
# ====================
echo ""
echo "--- UI Component Tests ---"

# Test 23: Main dashboard is a client component
if grep -q "'use client'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "MainDashboardClient is marked as client component"
else
    test_fail "MainDashboardClient not marked as client component"
fi

# Test 24: Main dashboard page imports client component
if grep -q "import MainDashboardClient" "app/dashboard/main/page.tsx" 2>/dev/null; then
    test_pass "Main dashboard page imports MainDashboardClient"
else
    test_fail "Main dashboard page not importing MainDashboardClient"
fi

# Test 25: Main dashboard uses framer-motion for animations
if grep -q "framer-motion" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard uses framer-motion for animations"
else
    test_fail "Main dashboard not using framer-motion"
fi

# Test 26: Main dashboard uses shadcn Card components
if grep -q "import.*Card.*from '@/components/ui/card'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard uses shadcn Card components"
else
    test_fail "Main dashboard not using shadcn Card"
fi

# Test 27: Main dashboard uses lucide-react icons
if grep -q "from 'lucide-react'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard uses lucide-react icons"
else
    test_fail "Main dashboard not using lucide-react icons"
fi

# ====================
# LOADING & ERROR STATES TESTS
# ====================
echo ""
echo "--- Loading & Error States Tests ---"

# Test 28: Main dashboard has loading state for charts
if grep -q "isLoading" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard has loading state handling"
else
    test_fail "Main dashboard missing loading state"
fi

# Test 29: Main dashboard shows loading spinner
if grep -q "animate-spin" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard shows loading spinner"
else
    test_fail "Main dashboard missing loading spinner"
fi

# Test 30: Main dashboard has refresh functionality
if grep -q "handleRefresh" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null || \
   grep -q "refetch" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard has refresh functionality"
else
    test_fail "Main dashboard missing refresh functionality"
fi

# ====================
# SIDEBAR INTEGRATION TESTS
# ====================
echo ""
echo "--- Sidebar Integration Tests ---"

# Test 31: Sidebar has Main Dashboard link
if grep -q "Main Dashboard" "components/layout/Sidebar.tsx" 2>/dev/null; then
    test_pass "Sidebar has Main Dashboard menu item"
else
    test_fail "Sidebar missing Main Dashboard link"
fi

# Test 32: Sidebar links to /dashboard/main
if grep -q "'/dashboard/main'" "components/layout/Sidebar.tsx" 2>/dev/null; then
    test_pass "Sidebar links to /dashboard/main"
else
    test_fail "Sidebar not linking to /dashboard/main"
fi

# ====================
# SEO & METADATA TESTS
# ====================
echo ""
echo "--- SEO & Metadata Tests ---"

# Test 33: Main dashboard has title metadata
if grep -q "title:" "app/dashboard/main/page.tsx" 2>/dev/null; then
    test_pass "Main dashboard has title metadata"
else
    test_fail "Main dashboard missing title metadata"
fi

# Test 34: Main dashboard has description metadata
if grep -q "description:" "app/dashboard/main/page.tsx" 2>/dev/null; then
    test_pass "Main dashboard has description metadata"
else
    test_fail "Main dashboard missing description metadata"
fi

# Test 35: Main dashboard has robots noindex (protected page)
if grep -q "robots:" "app/dashboard/main/page.tsx" 2>/dev/null && \
   grep -q "index: false" "app/dashboard/main/page.tsx" 2>/dev/null; then
    test_pass "Main dashboard has robots noindex for protected page"
else
    test_fail "Main dashboard missing robots noindex directive"
fi

# ====================
# CHART DATA TESTS
# ====================
echo ""
echo "--- Chart Data Structure Tests ---"

# Test 36: Main dashboard has usage data interface
if grep -q "UsageDataPoint" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard has UsageDataPoint interface"
else
    test_fail "Main dashboard missing UsageDataPoint interface"
fi

# Test 37: Main dashboard has model usage data
if grep -q "ModelUsageData" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard has ModelUsageData interface"
else
    test_fail "Main dashboard missing ModelUsageData interface"
fi

# Test 38: Main dashboard has project activity data
if grep -q "ProjectActivityData" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard has ProjectActivityData interface"
else
    test_fail "Main dashboard missing ProjectActivityData interface"
fi

# Test 39: Main dashboard has performance data
if grep -q "PerformanceData" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Main dashboard has PerformanceData interface"
else
    test_fail "Main dashboard missing PerformanceData interface"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test 40: Project builds successfully
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with main dashboard changes"
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
