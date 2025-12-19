#!/bin/bash
# Story #44: Component Audit Tests
# Tests for component audit documentation
# Part of Sprint 2 - Dashboard Migrations (Story 5.1)

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
echo "Story #44: Component Audit Tests"
echo "========================================"
echo ""

# ====================
# AUDIT REPORT TESTS
# ====================
echo "--- Audit Report Tests ---"

# Test 1: Component audit report exists
if [ -f "docs/COMPONENT_AUDIT.md" ]; then
    test_pass "Component audit report exists at docs/COMPONENT_AUDIT.md"
else
    test_fail "Component audit report not found at docs/COMPONENT_AUDIT.md"
fi

# Test 2: Audit report has Executive Summary
if grep -q "Executive Summary" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Audit report has Executive Summary section"
else
    test_fail "Audit report missing Executive Summary"
fi

# Test 3: Audit report has UI Components section
if grep -q "UI Components" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Audit report has UI Components section"
else
    test_fail "Audit report missing UI Components section"
fi

# Test 4: Audit report has Layout Components section
if grep -q "Layout Components" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Audit report has Layout Components section"
else
    test_fail "Audit report missing Layout Components section"
fi

# Test 5: Audit report has Provider/Guard section
if grep -q "Provider/Guard" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Audit report has Provider/Guard Components section"
else
    test_fail "Audit report missing Provider/Guard section"
fi

# Test 6: Audit report has Page Client Components section
if grep -q "Page Client Components" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Audit report has Page Client Components section"
else
    test_fail "Audit report missing Page Client Components section"
fi

# ====================
# USAGE COUNT TESTS
# ====================
echo ""
echo "--- Usage Count Documentation Tests ---"

# Test 7: Documents button usage count
if grep -q "button.*38" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Documents button usage count (38)"
else
    test_fail "Missing or incorrect button usage count"
fi

# Test 8: Documents card usage count
if grep -q "card.*30" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Documents card usage count (30)"
else
    test_fail "Missing or incorrect card usage count"
fi

# Test 9: Documents badge usage count
if grep -q "badge.*17" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Documents badge usage count (17)"
else
    test_fail "Missing or incorrect badge usage count"
fi

# Test 10: Documents input usage count
if grep -q "input.*13" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Documents input usage count (13)"
else
    test_fail "Missing or incorrect input usage count"
fi

# ====================
# CLIENT/SERVER CLASSIFICATION TESTS
# ====================
echo ""
echo "--- Client/Server Classification Tests ---"

# Test 11: Has Client vs Server classification section
if grep -q "Client vs Server" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Client vs Server Component Classification section"
else
    test_fail "Missing Client vs Server classification section"
fi

# Test 12: Identifies DashboardLayout as Client Component
if grep -q "DashboardLayout.*Client" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Correctly identifies DashboardLayout as Client Component"
else
    test_fail "Missing DashboardLayout client classification"
fi

# Test 13: Identifies button as Server-Compatible
if grep -q "button.*Server-Compatible" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Correctly identifies button as Server-Compatible"
else
    test_fail "Missing button server-compatible classification"
fi

# Test 14: Identifies SessionProvider as Client Component
if grep -q "SessionProvider.*Client" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Correctly identifies SessionProvider as Client Component"
else
    test_fail "Missing SessionProvider client classification"
fi

# ====================
# PRIORITY ORDER TESTS
# ====================
echo ""
echo "--- Priority Order Tests ---"

# Test 15: Has Priority Order section
if grep -q "Migration Priority Order" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Migration Priority Order section"
else
    test_fail "Missing Migration Priority Order section"
fi

# Test 16: Has Priority 1 - Critical
if grep -q "Priority 1.*Critical" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Priority 1 - Critical classification"
else
    test_fail "Missing Priority 1 - Critical classification"
fi

# Test 17: Has Priority 2 - High
if grep -q "Priority 2.*High" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Priority 2 - High classification"
else
    test_fail "Missing Priority 2 - High classification"
fi

# Test 18: Has Priority 3 - Medium
if grep -q "Priority 3.*Medium" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Priority 3 - Medium classification"
else
    test_fail "Missing Priority 3 - Medium classification"
fi

# Test 19: Has Priority 4 - Low
if grep -q "Priority 4.*Low" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Priority 4 - Low classification"
else
    test_fail "Missing Priority 4 - Low classification"
fi

# Test 20: Has Priority 5 - Unused
if grep -q "Priority 5.*Unused" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Priority 5 - Unused classification"
else
    test_fail "Missing Priority 5 - Unused classification"
fi

# ====================
# DEPENDENCIES TESTS
# ====================
echo ""
echo "--- Component Dependencies Tests ---"

# Test 21: Has Dependencies Graph section
if grep -q "Component Dependencies" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Component Dependencies Graph section"
else
    test_fail "Missing Component Dependencies section"
fi

# Test 22: Documents Radix UI dependencies
if grep -q "Radix" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Documents Radix UI dependencies"
else
    test_fail "Missing Radix UI dependency documentation"
fi

# Test 23: Documents React Query dependency
if grep -q "react-query" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Documents React Query dependency"
else
    test_fail "Missing React Query dependency documentation"
fi

# Test 24: Documents framer-motion dependency
if grep -q "framer-motion" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Documents framer-motion dependency"
else
    test_fail "Missing framer-motion dependency documentation"
fi

# ====================
# COMPONENT FILE VERIFICATION
# ====================
echo ""
echo "--- Component File Verification ---"

# Test 25: All UI components directory exists
if [ -d "components/ui" ]; then
    test_pass "UI components directory exists"
else
    test_fail "UI components directory not found"
fi

# Test 26: Layout components directory exists
if [ -d "components/layout" ]; then
    test_pass "Layout components directory exists"
else
    test_fail "Layout components directory not found"
fi

# Test 27: Guards components directory exists
if [ -d "components/guards" ]; then
    test_pass "Guards components directory exists"
else
    test_fail "Guards components directory not found"
fi

# Test 28: Providers components directory exists
if [ -d "components/providers" ]; then
    test_pass "Providers components directory exists"
else
    test_fail "Providers components directory not found"
fi

# Test 29: Button component file exists
if [ -f "components/ui/button.tsx" ]; then
    test_pass "Button component file exists"
else
    test_fail "Button component file not found"
fi

# Test 30: Card component file exists
if [ -f "components/ui/card.tsx" ]; then
    test_pass "Card component file exists"
else
    test_fail "Card component file not found"
fi

# ====================
# RECOMMENDATIONS TESTS
# ====================
echo ""
echo "--- Recommendations Tests ---"

# Test 31: Has Recommendations section
if grep -q "Recommendations" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Recommendations section"
else
    test_fail "Missing Recommendations section"
fi

# Test 32: Has Immediate Actions
if grep -q "Immediate Actions" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Immediate Actions recommendations"
else
    test_fail "Missing Immediate Actions"
fi

# Test 33: Has Migration Strategy
if grep -q "Migration Strategy" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Migration Strategy recommendations"
else
    test_fail "Missing Migration Strategy"
fi

# ====================
# APPENDIX TESTS
# ====================
echo ""
echo "--- Appendix Tests ---"

# Test 34: Has File Locations appendix
if grep -q "File Locations" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has File Locations appendix"
else
    test_fail "Missing File Locations appendix"
fi

# Test 35: Documents components/ui/ directory
if grep -q "components/ui/" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Documents components/ui/ directory structure"
else
    test_fail "Missing components/ui/ documentation"
fi

# ====================
# METADATA TESTS
# ====================
echo ""
echo "--- Report Metadata Tests ---"

# Test 36: Has Story reference
if grep -q "Story.*#44" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Story #44 reference"
else
    test_fail "Missing Story #44 reference"
fi

# Test 37: Has Sprint reference
if grep -q "Sprint.*2" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Sprint 2 reference"
else
    test_fail "Missing Sprint 2 reference"
fi

# Test 38: Has Date
if grep -q "\*\*Date\*\*:" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Date metadata"
else
    test_fail "Missing Date metadata"
fi

# Test 39: Has Status
if grep -q "\*\*Status\*\*:" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Status metadata"
else
    test_fail "Missing Status metadata"
fi

# Test 40: Has Total Components count
if grep -q "Total Components.*67" "docs/COMPONENT_AUDIT.md" 2>/dev/null; then
    test_pass "Has Total Components count (67)"
else
    test_fail "Missing or incorrect Total Components count"
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
