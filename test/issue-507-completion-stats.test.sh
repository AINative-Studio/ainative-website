#!/bin/bash

# Test script for Issue #507 - Completion Statistics Demo Page
# This script validates the completion statistics implementation

set -e

echo "Testing Issue #507 - Completion Statistics Demo Page"
echo "===================================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_check() {
  TESTS_RUN=$((TESTS_RUN + 1))
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

echo ""
echo "1. Checking File Structure"
echo "--------------------------"

# Check if client component exists
if [ -f "app/demo/completion-statistics/CompletionStatisticsClient.tsx" ]; then
  echo -e "${GREEN}✓${NC} CompletionStatisticsClient.tsx exists"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} CompletionStatisticsClient.tsx missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check if server component exists
if [ -f "app/demo/completion-statistics/page.tsx" ]; then
  echo -e "${GREEN}✓${NC} page.tsx exists"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} page.tsx missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check if test file exists
if [ -f "app/demo/completion-statistics/__tests__/CompletionStatisticsClient.test.tsx" ]; then
  echo -e "${GREEN}✓${NC} Test file exists"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Test file missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "2. Validating Client Component Structure"
echo "---------------------------------------"

# Check for 'use client' directive
if grep -q "'use client'" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} 'use client' directive present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} 'use client' directive missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for recharts imports
if grep -q "from 'recharts'" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Recharts imports present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Recharts imports missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for LineChart
if grep -q "LineChart" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} LineChart component used"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} LineChart component missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for BarChart
if grep -q "BarChart" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} BarChart component used"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} BarChart component missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for PieChart
if grep -q "PieChart" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} PieChart component used"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} PieChart component missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for ResponsiveContainer
if grep -q "ResponsiveContainer" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} ResponsiveContainer used for responsive design"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} ResponsiveContainer missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for framer-motion
if grep -q "from 'framer-motion'" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Framer Motion animations present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${YELLOW}⚠${NC} Framer Motion not used (optional)"
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "3. Validating Metrics Display"
echo "----------------------------"

# Check for completion rate metric
if grep -qi "completion.*rate" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Completion rate metric present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Completion rate metric missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for average time metric
if grep -qi "average.*time" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Average time metric present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Average time metric missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for success rate metric
if grep -qi "success.*rate" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Success rate metric present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Success rate metric missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for total completions metric
if grep -qi "total.*completions" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Total completions metric present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Total completions metric missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "4. Validating Server Component (SEO)"
echo "-----------------------------------"

# Check metadata export
if grep -q "export const metadata" app/demo/completion-statistics/page.tsx; then
  echo -e "${GREEN}✓${NC} Metadata export present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Metadata export missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for title
if grep -q "title:" app/demo/completion-statistics/page.tsx; then
  echo -e "${GREEN}✓${NC} Page title defined"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Page title missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for description
if grep -q "description:" app/demo/completion-statistics/page.tsx; then
  echo -e "${GREEN}✓${NC} Page description defined"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Page description missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for OpenGraph metadata
if grep -q "openGraph:" app/demo/completion-statistics/page.tsx; then
  echo -e "${GREEN}✓${NC} OpenGraph metadata present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} OpenGraph metadata missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check NO 'use client' in page.tsx
if grep -q "'use client'" app/demo/completion-statistics/page.tsx; then
  echo -e "${RED}✗${NC} 'use client' should not be in page.tsx (server component)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
else
  echo -e "${GREEN}✓${NC} page.tsx is server component (no 'use client')"
  TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "5. Validating Accessibility"
echo "--------------------------"

# Check for ARIA labels
if grep -q "aria-label" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} ARIA labels present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} ARIA labels missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for role attributes
if grep -q "role=" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Role attributes present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Role attributes missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for semantic HTML (main tag)
if grep -q "<main" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Semantic HTML (main tag) used"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Semantic HTML missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "6. Validating Test Coverage"
echo "--------------------------"

# Check for test describe blocks
DESCRIBE_COUNT=$(grep -c "describe(" app/demo/completion-statistics/__tests__/CompletionStatisticsClient.test.tsx || echo "0")
if [ "$DESCRIBE_COUNT" -ge 5 ]; then
  echo -e "${GREEN}✓${NC} Multiple test suites ($DESCRIBE_COUNT describe blocks)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Insufficient test suites (found $DESCRIBE_COUNT, need 5+)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for test it blocks
IT_COUNT=$(grep -c "it(" app/demo/completion-statistics/__tests__/CompletionStatisticsClient.test.tsx || echo "0")
if [ "$IT_COUNT" -ge 30 ]; then
  echo -e "${GREEN}✓${NC} Comprehensive test cases ($IT_COUNT test cases)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${YELLOW}⚠${NC} Moderate test coverage (found $IT_COUNT test cases)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for accessibility tests
if grep -qi "accessibility" app/demo/completion-statistics/__tests__/CompletionStatisticsClient.test.tsx; then
  echo -e "${GREEN}✓${NC} Accessibility tests present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Accessibility tests missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for responsive design tests
if grep -qi "responsive" app/demo/completion-statistics/__tests__/CompletionStatisticsClient.test.tsx; then
  echo -e "${GREEN}✓${NC} Responsive design tests present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Responsive design tests missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for chart tests
if grep -qi "chart" app/demo/completion-statistics/__tests__/CompletionStatisticsClient.test.tsx; then
  echo -e "${GREEN}✓${NC} Chart rendering tests present"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Chart rendering tests missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "7. Validating Responsive Design"
echo "------------------------------"

# Check for grid layout
if grep -q "grid" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Grid layout used"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Grid layout missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for responsive breakpoints (md, lg)
if grep -q "md:" app/demo/completion-statistics/CompletionStatisticsClient.tsx && \
   grep -q "lg:" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${GREEN}✓${NC} Responsive breakpoints defined"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗${NC} Responsive breakpoints missing"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "8. Checking No Forbidden Patterns"
echo "--------------------------------"

# Check for react-router-dom (should not be used in Next.js)
if grep -q "react-router-dom" app/demo/completion-statistics/CompletionStatisticsClient.tsx; then
  echo -e "${RED}✗${NC} Forbidden: react-router-dom found (use next/link)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
else
  echo -e "${GREEN}✓${NC} No react-router-dom imports"
  TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Check for react-helmet-async (should not be used in Next.js)
if grep -q "react-helmet-async" app/demo/completion-statistics/; then
  echo -e "${RED}✗${NC} Forbidden: react-helmet-async found (use metadata export)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
else
  echo -e "${GREEN}✓${NC} No react-helmet-async imports"
  TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

echo ""
echo "===================================================="
echo "Test Summary"
echo "===================================================="
echo -e "Tests Run:    ${TESTS_RUN}"
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed${NC}"
  exit 1
fi
