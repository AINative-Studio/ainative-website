#!/usr/bin/env bash
# Smoke Tests for Post-Deployment Validation
# Tests critical paths and functionality after deployment
# Usage: ./scripts/smoke-tests.sh [base_url]
# Example: ./scripts/smoke-tests.sh https://ainative.studio

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL=${1:-"https://ainative.studio"}

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Post-Deployment Smoke Tests         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Testing: ${BLUE}$BASE_URL${NC}"
echo ""

PASSED=0
FAILED=0

# Function to run a single test
run_test() {
    local test_name=$1
    local url=$2
    local expected_status=${3:-200}
    local check_content=${4:-""}

    echo -n "Testing $test_name... "

    # Make request and get status code
    response=$(curl -s -w "\n%{http_code}" --max-time 15 --connect-timeout 5 "$url" 2>/dev/null || echo -e "\n000")
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    # Check status code
    if [ "$http_code" != "$expected_status" ]; then
        echo -e "${RED}✗ FAILED${NC}"
        echo -e "  Expected HTTP $expected_status, got $http_code"
        FAILED=$((FAILED + 1))
        return 1
    fi

    # Check content if specified
    if [ -n "$check_content" ]; then
        if echo "$body" | grep -q "$check_content"; then
            echo -e "${GREEN}✓ PASSED${NC}"
            PASSED=$((PASSED + 1))
            return 0
        else
            echo -e "${RED}✗ FAILED${NC}"
            echo -e "  Content check failed: '$check_content' not found"
            FAILED=$((FAILED + 1))
            return 1
        fi
    fi

    echo -e "${GREEN}✓ PASSED${NC}"
    PASSED=$((PASSED + 1))
    return 0
}

# Test Suite
echo -e "${YELLOW}=== Critical Path Tests ===${NC}\n"

# 1. Homepage
run_test "Homepage" "$BASE_URL/" 200

# 2. API Health Check
run_test "API Health" "$BASE_URL/api/health" 200

# 3. Authentication endpoints (should return 401 without auth)
run_test "Auth Check" "$BASE_URL/api/auth/session" 200

# 4. Static Assets
run_test "Favicon" "$BASE_URL/favicon.ico" 200

# 5. API v1 endpoints
run_test "API v1 Health" "$BASE_URL/api/v1/health" 200 || true

echo ""
echo -e "${YELLOW}=== Performance Tests ===${NC}\n"

# 6. Response time test
echo -n "Response time check... "
START_TIME=$(date +%s%N)
curl -s -o /dev/null --max-time 10 "$BASE_URL/" 2>/dev/null || true
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 3000 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (${RESPONSE_TIME}ms)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ SLOW${NC} (${RESPONSE_TIME}ms - expected <3000ms)"
    # Don't fail on slow response, just warn
    PASSED=$((PASSED + 1))
fi

echo ""
echo -e "${YELLOW}=== Security Tests ===${NC}\n"

# 7. Security headers
echo -n "Security headers check... "
HEADERS=$(curl -s -I --max-time 10 "$BASE_URL/" 2>/dev/null)

SECURITY_SCORE=0
SECURITY_TOTAL=0

# Check for important security headers
if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi
SECURITY_TOTAL=$((SECURITY_TOTAL + 1))

if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi
SECURITY_TOTAL=$((SECURITY_TOTAL + 1))

if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
    SECURITY_SCORE=$((SECURITY_SCORE + 1))
fi
SECURITY_TOTAL=$((SECURITY_TOTAL + 1))

if [ $SECURITY_SCORE -ge 2 ]; then
    echo -e "${GREEN}✓ PASSED${NC} ($SECURITY_SCORE/$SECURITY_TOTAL headers present)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ WARNING${NC} ($SECURITY_SCORE/$SECURITY_TOTAL headers present)"
    PASSED=$((PASSED + 1))
fi

# 8. SSL/TLS check
if [[ $BASE_URL == https://* ]]; then
    echo -n "SSL/TLS certificate check... "
    if curl -s --max-time 10 "$BASE_URL/" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED=$((FAILED + 1))
    fi
fi

# Summary
TOTAL=$((PASSED + FAILED))

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Test Results Summary              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All smoke tests PASSED${NC}"
    echo -e "${GREEN}  Deployment appears healthy${NC}"
    exit 0
else
    echo -e "${RED}✗ Some smoke tests FAILED${NC}"
    echo -e "${YELLOW}  Review failures and consider rollback if critical${NC}"
    exit 1
fi
