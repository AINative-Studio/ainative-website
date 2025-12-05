#!/bin/bash
# Issue #13: Document Migration Patterns - TDD Acceptance Tests

set -e

PROJECT_DIR="/home/quaid/Documents/Projects/ainative-studio/src/ainative-nextjs"
cd "$PROJECT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

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
echo "Issue #13: Document Migration Patterns"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: MIGRATION_GUIDE.md exists
echo "--- AC1: Migration guide file ---"

if [ -f "MIGRATION_GUIDE.md" ]; then
    pass "MIGRATION_GUIDE.md exists"
else
    fail "MIGRATION_GUIDE.md missing"
fi

# AC2: File structure documented
echo ""
echo "--- AC2: File structure section ---"

if grep -qi "file structure\|directory\|folder" MIGRATION_GUIDE.md 2>/dev/null; then
    pass "File structure section present"
else
    fail "File structure section missing"
fi

# AC3: Routing pattern documented
echo ""
echo "--- AC3: Routing conversion ---"

if grep -qi "routing\|route\|app router" MIGRATION_GUIDE.md 2>/dev/null; then
    pass "Routing pattern documented"
else
    fail "Routing pattern not documented"
fi

# AC4: Meta tags pattern documented
echo ""
echo "--- AC4: Meta tags conversion ---"

if grep -qi "meta\|metadata\|seo\|helmet" MIGRATION_GUIDE.md 2>/dev/null; then
    pass "Meta tags pattern documented"
else
    fail "Meta tags pattern not documented"
fi

# AC5: Client vs Server component decision tree
echo ""
echo "--- AC5: Client vs Server components ---"

if grep -qi "use client\|client component\|server component" MIGRATION_GUIDE.md 2>/dev/null; then
    pass "Client/Server component guidelines documented"
else
    fail "Client/Server component guidelines not documented"
fi

# AC6: Data fetching patterns documented
echo ""
echo "--- AC6: Data fetching patterns ---"

if grep -qi "data fetch\|fetching\|react query\|server action" MIGRATION_GUIDE.md 2>/dev/null; then
    pass "Data fetching patterns documented"
else
    fail "Data fetching patterns not documented"
fi

# AC7: Common pitfalls and solutions
echo ""
echo "--- AC7: Troubleshooting ---"

if grep -qi "pitfall\|troubleshoot\|common issue\|problem\|gotcha" MIGRATION_GUIDE.md 2>/dev/null; then
    pass "Troubleshooting section present"
else
    fail "Troubleshooting section missing"
fi

# AC8: Code examples included
echo ""
echo "--- AC8: Code examples ---"

if grep -q '```' MIGRATION_GUIDE.md 2>/dev/null; then
    pass "Code examples included"
else
    fail "Code examples missing"
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
