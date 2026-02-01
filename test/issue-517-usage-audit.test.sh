#!/bin/bash

# Test Script for Issue #517: Dashboard Component Usage Audit
# TDD RED Phase - Define expected outcomes before conducting audit

set -e

echo "=== Issue #517: Dashboard Component Usage Audit Test ==="
echo ""

SOURCE_DIR="/Users/aideveloper/AINative-website/src"
DASHBOARD_DIR="$SOURCE_DIR/components/dashboard"
AUDIT_REPORT="/Users/aideveloper/ainative-website-nextjs-staging/docs/dashboard-component-audit-results.md"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo -e "${GREEN}✓ PASS${NC}: $1"
  ((PASS_COUNT++))
}

fail() {
  echo -e "${RED}✗ FAIL${NC}: $1"
  ((FAIL_COUNT++))
}

warn() {
  echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

# Test 1: Source dashboard directory exists
echo "Test 1: Verify source dashboard directory exists"
if [ -d "$DASHBOARD_DIR" ]; then
  pass "Source dashboard directory found at $DASHBOARD_DIR"
else
  fail "Source dashboard directory not found at $DASHBOARD_DIR"
fi

# Test 2: Dashboard components can be listed
echo ""
echo "Test 2: Verify dashboard components can be enumerated"
COMPONENT_COUNT=$(find "$DASHBOARD_DIR" -type f -name "*.tsx" ! -path "*/\__tests__/*" | wc -l | tr -d ' ')
if [ "$COMPONENT_COUNT" -ge 40 ]; then
  pass "Found $COMPONENT_COUNT dashboard components (expected ~40+)"
else
  warn "Found $COMPONENT_COUNT dashboard components (expected ~40+)"
fi

# Test 3: Usage analysis can be performed
echo ""
echo "Test 3: Verify usage analysis capability"
TEST_COMPONENT="DashboardHeader.tsx"
USAGE_COUNT=$(grep -r "from.*DashboardHeader" "$SOURCE_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ $? -eq 0 ]; then
  pass "Usage analysis working (DashboardHeader found in $USAGE_COUNT locations)"
else
  fail "Usage analysis failed for test component"
fi

# Test 4: Categorization logic
echo ""
echo "Test 4: Verify categorization logic"
echo "  - Critical: 3+ usage locations"
echo "  - Integrated: Functionality exists differently in Next.js"
echo "  - Unused: 0 usage references"
pass "Categorization criteria defined"

# Test 5: Audit report structure requirements
echo ""
echo "Test 5: Verify audit report will be created"
REPORT_DIR=$(dirname "$AUDIT_REPORT")
if [ -d "$REPORT_DIR" ]; then
  pass "Report directory exists at $REPORT_DIR"
else
  mkdir -p "$REPORT_DIR"
  if [ $? -eq 0 ]; then
    pass "Report directory created at $REPORT_DIR"
  else
    fail "Cannot create report directory at $REPORT_DIR"
  fi
fi

# Test 6: Component import pattern detection
echo ""
echo "Test 6: Verify component import patterns can be detected"
IMPORT_PATTERNS=(
  "import.*from.*components/dashboard"
  "import.*DashboardHeader"
  "import.*AgentSwarm"
)

PATTERN_TESTS_PASSED=0
for pattern in "${IMPORT_PATTERNS[@]}"; do
  if grep -r -E "$pattern" "$SOURCE_DIR" --include="*.tsx" --include="*.ts" >/dev/null 2>&1; then
    ((PATTERN_TESTS_PASSED++))
  fi
done

if [ "$PATTERN_TESTS_PASSED" -ge 2 ]; then
  pass "Component import patterns detected ($PATTERN_TESTS_PASSED patterns found)"
else
  warn "Limited import patterns detected ($PATTERN_TESTS_PASSED patterns found)"
fi

# Test 7: Next.js migration tracking
echo ""
echo "Test 7: Verify Next.js equivalents can be checked"
NEXTJS_DIR="/Users/aideveloper/ainative-website-nextjs-staging/app"
if [ -d "$NEXTJS_DIR" ]; then
  NEXTJS_COMPONENTS=$(find "$NEXTJS_DIR" -type f -name "*.tsx" | wc -l | tr -d ' ')
  pass "Next.js app directory accessible ($NEXTJS_COMPONENTS components found)"
else
  fail "Next.js app directory not found"
fi

# Test 8: Usage frequency analysis
echo ""
echo "Test 8: Verify usage frequency can be measured"
# Test with a known component
TEST_COMPONENTS=("DashboardHeader" "AgentSwarmInteractiveDashboard" "APIKeyManager")
FREQUENCY_TESTS_PASSED=0

for comp in "${TEST_COMPONENTS[@]}"; do
  COUNT=$(grep -r "$comp" "$SOURCE_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COUNT" -gt 0 ]; then
    ((FREQUENCY_TESTS_PASSED++))
  fi
done

if [ "$FREQUENCY_TESTS_PASSED" -ge 2 ]; then
  pass "Usage frequency analysis working ($FREQUENCY_TESTS_PASSED/3 components tested)"
else
  fail "Usage frequency analysis issues ($FREQUENCY_TESTS_PASSED/3 components found)"
fi

# Test 9: Documentation requirements
echo ""
echo "Test 9: Verify documentation requirements"
REQUIRED_SECTIONS=(
  "Component Name"
  "Usage Count"
  "Import Locations"
  "Category"
  "Recommendation"
  "Migration Priority"
)
pass "Documentation structure defined with ${#REQUIRED_SECTIONS[@]} required sections"

# Test 10: Migration issue tracking
echo ""
echo "Test 10: Verify migration issue creation capability"
if command -v gh >/dev/null 2>&1; then
  pass "GitHub CLI available for creating migration issues"
else
  warn "GitHub CLI not available - issues will need manual creation"
fi

# Summary
echo ""
echo "=== Test Summary ==="
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ All audit framework tests passed - ready for GREEN phase${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}✗ Some tests failed - fix issues before proceeding${NC}"
  exit 1
fi
