#!/bin/bash
# Story #48: Chart Components Migration Tests
# Tests for Recharts components with proper client directive and data handling
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

echo "========================================"
echo "Story #48: Chart Components Migration Tests"
echo "========================================"
echo ""

# ====================
# DEPENDENCY TESTS
# ====================
echo "--- Dependency Tests ---"

# Test 1: Recharts is installed
if grep -q '"recharts"' "package.json" 2>/dev/null; then
    test_pass "Recharts is installed in package.json"
else
    test_fail "Recharts not found in package.json"
fi

# Test 2: Check Recharts version
RC_VERSION=$(grep '"recharts"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
if [ -n "$RC_VERSION" ]; then
    test_pass "Recharts version: $RC_VERSION"
else
    test_fail "Could not determine Recharts version"
fi

# ====================
# FILE STRUCTURE TESTS
# ====================
echo ""
echo "--- File Structure Tests ---"

# Test 3: Main dashboard client exists
if [ -f "app/dashboard/main/MainDashboardClient.tsx" ]; then
    test_pass "Main dashboard client exists"
else
    test_fail "Main dashboard client not found"
fi

# Test 4: Main dashboard page exists
if [ -f "app/dashboard/main/page.tsx" ]; then
    test_pass "Main dashboard page exists"
else
    test_fail "Main dashboard page not found"
fi

# ====================
# CLIENT DIRECTIVE TESTS
# ====================
echo ""
echo "--- Client Directive Tests ---"

# Test 5: MainDashboardClient has 'use client' directive
if grep -qE "^['\"]use client['\"]" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "MainDashboardClient has 'use client' directive"
else
    test_fail "MainDashboardClient missing 'use client' (required for Recharts)"
fi

# ====================
# RECHARTS IMPORT TESTS
# ====================
echo ""
echo "--- Recharts Import Tests ---"

# Test 6: Imports from recharts
if grep -q "from 'recharts'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "MainDashboardClient imports from recharts"
else
    test_fail "MainDashboardClient not importing from recharts"
fi

# Test 7: AreaChart imported
if grep -q "AreaChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "AreaChart component imported"
else
    test_fail "AreaChart not imported"
fi

# Test 8: BarChart imported
if grep -q "BarChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "BarChart component imported"
else
    test_fail "BarChart not imported"
fi

# Test 9: PieChart imported
if grep -q "PieChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "PieChart component imported"
else
    test_fail "PieChart not imported"
fi

# Test 10: LineChart imported
if grep -q "LineChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "LineChart component imported"
else
    test_fail "LineChart not imported"
fi

# ====================
# CHART COMPONENT TESTS
# ====================
echo ""
echo "--- Chart Component Usage Tests ---"

# Test 11: ResponsiveContainer used
if grep -q "ResponsiveContainer" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "ResponsiveContainer used for responsive charts"
else
    test_fail "ResponsiveContainer not used (charts won't be responsive)"
fi

# Test 12: CartesianGrid used
if grep -q "CartesianGrid" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "CartesianGrid component used"
else
    test_fail "CartesianGrid not used"
fi

# Test 13: XAxis used
if grep -q "XAxis" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "XAxis component used"
else
    test_fail "XAxis not used"
fi

# Test 14: YAxis used
if grep -q "YAxis" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "YAxis component used"
else
    test_fail "YAxis not used"
fi

# Test 15: Tooltip used
if grep -q "Tooltip" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Tooltip component used"
else
    test_fail "Tooltip not used"
fi

# Test 16: Legend used
if grep -q "Legend" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Legend component used"
else
    test_fail "Legend not used"
fi

# ====================
# CHART DATA ELEMENTS
# ====================
echo ""
echo "--- Chart Data Element Tests ---"

# Test 17: Area element used
if grep -q "<Area" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Area element used in AreaChart"
else
    test_fail "Area element not used"
fi

# Test 18: Bar element used
if grep -q "<Bar" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Bar element used in BarChart"
else
    test_fail "Bar element not used"
fi

# Test 19: Pie element used
if grep -q "<Pie" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Pie element used in PieChart"
else
    test_fail "Pie element not used"
fi

# Test 20: Line element used
if grep -q "<Line" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Line element used in LineChart"
else
    test_fail "Line element not used"
fi

# Test 21: Cell element used (for PieChart coloring)
if grep -q "<Cell" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Cell element used for PieChart coloring"
else
    test_fail "Cell element not used"
fi

# ====================
# DATA INTERFACE TESTS
# ====================
echo ""
echo "--- TypeScript Data Interface Tests ---"

# Test 22: UsageDataPoint interface defined
if grep -q "interface UsageDataPoint" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "UsageDataPoint interface defined"
else
    test_fail "UsageDataPoint interface not defined"
fi

# Test 23: ModelUsageData interface defined
if grep -q "interface ModelUsageData" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "ModelUsageData interface defined"
else
    test_fail "ModelUsageData interface not defined"
fi

# Test 24: ProjectActivityData interface defined
if grep -q "interface ProjectActivityData" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "ProjectActivityData interface defined"
else
    test_fail "ProjectActivityData interface not defined"
fi

# Test 25: PerformanceData interface defined
if grep -q "interface PerformanceData" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "PerformanceData interface defined"
else
    test_fail "PerformanceData interface not defined"
fi

# ====================
# DATA FETCHING TESTS
# ====================
echo ""
echo "--- React Query Data Fetching Tests ---"

# Test 26: useQuery hook used
if grep -q "useQuery" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "useQuery hook used for data fetching"
else
    test_fail "useQuery not used for data fetching"
fi

# Test 27: queryKey defined
QUERY_KEY_COUNT=$(grep -c "queryKey:" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null || echo "0")
if [ "$QUERY_KEY_COUNT" -ge 3 ]; then
    test_pass "Multiple queryKeys defined ($QUERY_KEY_COUNT)"
else
    test_fail "Expected 3+ queryKeys, found $QUERY_KEY_COUNT"
fi

# Test 28: staleTime configured
if grep -q "staleTime:" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "staleTime configured for caching"
else
    test_fail "staleTime not configured"
fi

# ====================
# CHART WRAPPER COMPONENTS
# ====================
echo ""
echo "--- Chart Wrapper Component Tests ---"

# Test 29: UsageChart component exists
if grep -q "function UsageChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "UsageChart wrapper component defined"
else
    test_fail "UsageChart component not found"
fi

# Test 30: ModelUsageChart component exists
if grep -q "function ModelUsageChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "ModelUsageChart wrapper component defined"
else
    test_fail "ModelUsageChart component not found"
fi

# Test 31: ProjectActivityChart component exists
if grep -q "function ProjectActivityChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "ProjectActivityChart wrapper component defined"
else
    test_fail "ProjectActivityChart component not found"
fi

# Test 32: PerformanceChart component exists
if grep -q "function PerformanceChart" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "PerformanceChart wrapper component defined"
else
    test_fail "PerformanceChart component not found"
fi

# ====================
# LOADING STATE TESTS
# ====================
echo ""
echo "--- Loading State Tests ---"

# Test 33: Charts handle isLoading prop
if grep -q "isLoading" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Charts handle isLoading state"
else
    test_fail "Charts don't handle isLoading"
fi

# Test 34: Loading spinner shown
if grep -q "animate-spin" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Loading spinner displayed during fetch"
else
    test_fail "No loading spinner found"
fi

# ====================
# RESPONSIVE BEHAVIOR TESTS
# ====================
echo ""
echo "--- Responsive Behavior Tests ---"

# Test 35: ResponsiveContainer width set to 100%
if grep -q 'width="100%"' "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "ResponsiveContainer width is 100%"
else
    test_fail "ResponsiveContainer width not set to 100%"
fi

# Test 36: Charts have defined heights
RESPONSIVE_COUNT=$(grep -c 'ResponsiveContainer.*height=' "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null || echo "0")
if [ "$RESPONSIVE_COUNT" -ge 4 ]; then
    test_pass "ResponsiveContainers have defined heights ($RESPONSIVE_COUNT)"
else
    test_fail "Expected 4+ ResponsiveContainers with height, found $RESPONSIVE_COUNT"
fi

# ====================
# STYLING TESTS
# ====================
echo ""
echo "--- Chart Styling Tests ---"

# Test 37: Gradient definitions for Area charts
if grep -q "linearGradient" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Gradient definitions for Area chart styling"
else
    test_fail "No gradient definitions for Area charts"
fi

# Test 38: Custom tooltip styling
if grep -q "contentStyle" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Custom tooltip styling applied"
else
    test_fail "No custom tooltip styling"
fi

# Test 39: Charts use theme colors
if grep -q "#4B6FED" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Charts use theme colors"
else
    test_fail "Charts not using theme colors"
fi

# ====================
# REFRESH FUNCTIONALITY TESTS
# ====================
echo ""
echo "--- Refresh Functionality Tests ---"

# Test 40: Refetch functions available
if grep -q "refetch" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Refetch functions available for data refresh"
else
    test_fail "No refetch functions found"
fi

# Test 41: handleRefreshAll function exists
if grep -q "handleRefreshAll" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "handleRefreshAll function defined"
else
    test_fail "handleRefreshAll function not found"
fi

# ====================
# SESSION INTEGRATION TESTS
# ====================
echo ""
echo "--- Session Integration Tests ---"

# Test 42: useSession hook used
if grep -q "useSession" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "useSession hook used for authentication"
else
    test_fail "useSession not used"
fi

# Test 43: Session loading handled
if grep -q "status === 'loading'" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Session loading state handled"
else
    test_fail "Session loading not handled"
fi

# ====================
# STAT WIDGET TESTS
# ====================
echo ""
echo "--- Stat Widget Component Tests ---"

# Test 44: StatWidget component exists
if grep -q "function StatWidget" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "StatWidget component defined"
else
    test_fail "StatWidget component not found"
fi

# Test 45: StatWidget displays trend
if grep -q "trend" "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "StatWidget displays trend data"
else
    test_fail "StatWidget doesn't show trends"
fi

# ====================
# DATA KEY VALIDATION
# ====================
echo ""
echo "--- Chart Data Key Tests ---"

# Test 46: dataKey props used correctly
DATA_KEY_COUNT=$(grep -c 'dataKey=' "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null || echo "0")
if [ "$DATA_KEY_COUNT" -ge 10 ]; then
    test_pass "dataKey props configured ($DATA_KEY_COUNT instances)"
else
    test_fail "Expected 10+ dataKey props, found $DATA_KEY_COUNT"
fi

# Test 47: Specific data keys for usage chart
if grep -q 'dataKey="requests"' "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "requests dataKey used in usage chart"
else
    test_fail "requests dataKey not found"
fi

# Test 48: Specific data keys for performance chart
if grep -q 'dataKey="latency"' "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "latency dataKey used in performance chart"
else
    test_fail "latency dataKey not found"
fi

# ====================
# DUAL AXIS CHART TESTS
# ====================
echo ""
echo "--- Dual Axis Chart Tests ---"

# Test 49: Dual Y-axis for performance chart
if grep -q 'yAxisId="left"' "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Dual Y-axis configured (left)"
else
    test_fail "Dual Y-axis left not configured"
fi

# Test 50: Dual Y-axis right
if grep -q 'yAxisId="right"' "app/dashboard/main/MainDashboardClient.tsx" 2>/dev/null; then
    test_pass "Dual Y-axis configured (right)"
else
    test_fail "Dual Y-axis right not configured"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test 51: Project builds successfully
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with chart components"
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
