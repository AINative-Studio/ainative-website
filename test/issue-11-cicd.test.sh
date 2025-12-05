#!/bin/bash
# Issue #11: Configure CI/CD Pipeline - TDD Acceptance Tests

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
echo "Issue #11: Configure CI/CD Pipeline"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: GitHub Actions workflow directory exists
echo "--- AC1: GitHub Actions setup ---"

if [ -d ".github/workflows" ]; then
    pass ".github/workflows directory exists"
else
    fail ".github/workflows directory missing"
fi

# AC2: CI workflow file exists
echo ""
echo "--- AC2: CI workflow file ---"

if [ -f ".github/workflows/ci.yml" ] || [ -f ".github/workflows/ci.yaml" ]; then
    pass "CI workflow file exists"
else
    fail "CI workflow file missing"
fi

# AC3: Workflow triggers on PR
echo ""
echo "--- AC3: PR trigger configured ---"

CI_FILE=""
if [ -f ".github/workflows/ci.yml" ]; then
    CI_FILE=".github/workflows/ci.yml"
elif [ -f ".github/workflows/ci.yaml" ]; then
    CI_FILE=".github/workflows/ci.yaml"
fi

if [ -n "$CI_FILE" ]; then
    if grep -q "pull_request" "$CI_FILE" 2>/dev/null; then
        pass "Workflow triggers on pull_request"
    else
        fail "Workflow missing pull_request trigger"
    fi
else
    fail "Cannot check - CI workflow file not found"
fi

# AC4: Type checking in CI
echo ""
echo "--- AC4: Type checking ---"

if [ -n "$CI_FILE" ]; then
    if grep -q "type-check\|tsc\|typescript" "$CI_FILE" 2>/dev/null; then
        pass "Type checking configured in CI"
    else
        fail "Type checking not configured in CI"
    fi
else
    fail "Cannot check - CI workflow file not found"
fi

# Check type-check script exists in package.json
if grep -q '"type-check"' package.json 2>/dev/null; then
    pass "type-check script exists in package.json"
else
    fail "type-check script missing in package.json"
fi

# AC5: Linting in CI
echo ""
echo "--- AC5: Linting ---"

if [ -n "$CI_FILE" ]; then
    if grep -q "lint" "$CI_FILE" 2>/dev/null; then
        pass "Linting configured in CI"
    else
        fail "Linting not configured in CI"
    fi
else
    fail "Cannot check - CI workflow file not found"
fi

# AC6: Build step in CI
echo ""
echo "--- AC6: Build step ---"

if [ -n "$CI_FILE" ]; then
    if grep -q "npm run build\|next build\|build" "$CI_FILE" 2>/dev/null; then
        pass "Build step configured in CI"
    else
        fail "Build step not configured in CI"
    fi
else
    fail "Cannot check - CI workflow file not found"
fi

# AC7: Node.js setup
echo ""
echo "--- AC7: Node.js setup ---"

if [ -n "$CI_FILE" ]; then
    if grep -q "setup-node\|node-version" "$CI_FILE" 2>/dev/null; then
        pass "Node.js setup configured"
    else
        fail "Node.js setup not configured"
    fi
else
    fail "Cannot check - CI workflow file not found"
fi

# AC8: Caching configured
echo ""
echo "--- AC8: Dependency caching ---"

if [ -n "$CI_FILE" ]; then
    if grep -q "cache" "$CI_FILE" 2>/dev/null; then
        pass "Caching configured in CI"
    else
        fail "Caching not configured in CI"
    fi
else
    fail "Cannot check - CI workflow file not found"
fi

# AC9: Workflow is valid YAML
echo ""
echo "--- AC9: YAML validity ---"

if [ -n "$CI_FILE" ]; then
    # Basic YAML structure check
    if head -1 "$CI_FILE" | grep -q "^name:" || grep -q "^on:" "$CI_FILE"; then
        pass "Workflow has valid YAML structure"
    else
        fail "Workflow YAML structure invalid"
    fi
else
    fail "Cannot check - CI workflow file not found"
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
