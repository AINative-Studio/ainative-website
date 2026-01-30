#!/bin/bash

# Test script for issue #477: Community Videos page heading spacing fix
# This script verifies that the Community Videos page has proper top padding

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Testing Issue #477: Community Videos page heading spacing"
echo "=========================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test 1: Verify VideosClient.tsx exists
echo -n "Test 1: Checking if VideosClient.tsx exists... "
if [ -f "$PROJECT_ROOT/app/community/videos/VideosClient.tsx" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAILED++))
fi

# Test 2: Verify proper top padding (pt-32 or pt-24, not pt-20)
echo -n "Test 2: Verifying proper top padding (pt-32 or pt-24)... "
if grep -q 'className="relative pt-32 pb-12 px-4"' "$PROJECT_ROOT/app/community/videos/VideosClient.tsx" || \
   grep -q 'className="relative pt-24 pb-12 px-4"' "$PROJECT_ROOT/app/community/videos/VideosClient.tsx"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC} - Expected pt-32 or pt-24, found:"
    grep 'className="relative pt-' "$PROJECT_ROOT/app/community/videos/VideosClient.tsx" | head -1
    ((FAILED++))
fi

# Test 3: Verify insufficient spacing (pt-20) is NOT present
echo -n "Test 3: Verifying pt-20 is NOT used for hero section... "
if ! grep -q 'section className="relative pt-20' "$PROJECT_ROOT/app/community/videos/VideosClient.tsx"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC} - Found pt-20 which has insufficient spacing"
    ((FAILED++))
fi

# Test 4: Verify page structure is intact
echo -n "Test 4: Verifying Hero Section structure... "
if grep -q '{/\* Hero Section \*/}' "$PROJECT_ROOT/app/community/videos/VideosClient.tsx"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAILED++))
fi

# Test 5: Verify the heading exists
echo -n "Test 5: Verifying 'Community Videos' heading exists... "
if grep -q 'Community Videos' "$PROJECT_ROOT/app/community/videos/VideosClient.tsx"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAILED++))
fi

# Test 6: Verify page.tsx exists and imports VideosClient
echo -n "Test 6: Verifying page.tsx imports VideosClient... "
if [ -f "$PROJECT_ROOT/app/community/videos/page.tsx" ] && \
   grep -q "import VideosClient from './VideosClient'" "$PROJECT_ROOT/app/community/videos/page.tsx"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAILED++))
fi

# Test 7: Verify unused imports are removed
echo -n "Test 7: Verifying unused imports (Play, Clock) are removed... "
if ! grep -q "Play," "$PROJECT_ROOT/app/community/videos/VideosClient.tsx" && \
   ! grep -q "Clock," "$PROJECT_ROOT/app/community/videos/VideosClient.tsx"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC} - Found unused imports that should be removed"
    ((FAILED++))
fi

echo ""
echo "=========================================================="
echo "Test Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo "=========================================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
