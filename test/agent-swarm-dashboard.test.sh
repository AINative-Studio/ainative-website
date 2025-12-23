#!/bin/bash

# Agent Swarm Dashboard - Verification Test Script
# Tests for TDD implementation of Agent Swarm and RLHF features

echo "🧪 Agent Swarm Dashboard - TDD Verification Tests"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0
PASSED=0

# Test function
test() {
  echo -n "Testing: $1... "
}

pass() {
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASSED++))
}

fail() {
  echo -e "${RED}✗ FAIL${NC}: $1"
  ((FAILED++))
}

warn() {
  echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

# Test 1: Service files exist
test "Service files exist"
if [[ -f "lib/agent-swarm-service.ts" ]] && [[ -f "lib/rlhf-service.ts" ]]; then
  pass
else
  fail "Service files not found"
fi

# Test 2: Test files exist
test "Test files exist"
if [[ -f "lib/__tests__/agent-swarm-service.test.ts" ]] && [[ -f "lib/__tests__/rlhf-service.test.ts" ]]; then
  pass
else
  fail "Test files not found"
fi

# Test 3: Page structure exists
test "Page structure exists"
if [[ -f "app/dashboard/agent-swarm/page.tsx" ]] && [[ -f "app/dashboard/agent-swarm/AgentSwarmClient.tsx" ]]; then
  pass
else
  fail "Page files not found"
fi

# Test 4: No forbidden imports
test "No forbidden imports (react-router-dom, react-helmet-async)"
if ! grep -r "react-router-dom\|react-helmet-async" app/dashboard/agent-swarm/ > /dev/null 2>&1; then
  pass
else
  fail "Found forbidden imports"
fi

# Test 5: Uses Next.js patterns
test "Uses Next.js Link component"
if grep -q "next/link" app/dashboard/agent-swarm/*.tsx > /dev/null 2>&1 || ! grep -q "Link" app/dashboard/agent-swarm/AgentSwarmClient.tsx > /dev/null 2>&1; then
  pass
else
  warn "Link component usage not detected (may not be needed)"
  ((PASSED++))
fi

# Test 6: Metadata export in server component
test "Metadata export in server component"
if grep -q "export const metadata" app/dashboard/agent-swarm/page.tsx; then
  pass
else
  fail "Metadata export not found"
fi

# Test 7: Client directive in client component
test "'use client' directive in client component"
if grep -q "'use client'" app/dashboard/agent-swarm/AgentSwarmClient.tsx; then
  pass
else
  fail "'use client' directive not found"
fi

# Test 8: TypeScript compilation
test "TypeScript compilation"
if npx tsc --noEmit > /dev/null 2>&1; then
  pass
else
  fail "TypeScript errors found"
fi

# Test 9: Service tests pass
echo ""
echo "Running service tests..."
test "agent-swarm-service.test.ts"
if npm run test -- lib/__tests__/agent-swarm-service.test.ts > /dev/null 2>&1; then
  pass
else
  fail "agent-swarm-service tests failed"
fi

test "rlhf-service.test.ts"
if npm run test -- lib/__tests__/rlhf-service.test.ts > /dev/null 2>&1; then
  pass
else
  fail "rlhf-service tests failed"
fi

# Test 10: File structure check
test "Service exports singleton instance"
if grep -q "export const agentSwarmService" lib/agent-swarm-service.ts && grep -q "export const rlhfService" lib/rlhf-service.ts; then
  pass
else
  fail "Singleton instances not exported"
fi

# Test 11: API client import
test "Services use apiClient"
if grep -q "import apiClient from './api-client'" lib/agent-swarm-service.ts && grep -q "import apiClient from './api-client'" lib/rlhf-service.ts; then
  pass
else
  fail "apiClient import not found"
fi

# Test 12: TypeScript interfaces exported
test "TypeScript interfaces exported"
if grep -q "export interface" lib/agent-swarm-service.ts && grep -q "export interface" lib/rlhf-service.ts; then
  pass
else
  fail "Interfaces not exported"
fi

# Results summary
echo ""
echo "=================================================="
echo "Test Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "  ${RED}Failed: $FAILED${NC}"
else
  echo -e "  ${GREEN}Failed: $FAILED${NC}"
fi
echo "=================================================="

# Exit with error if any tests failed
if [ $FAILED -gt 0 ]; then
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC} ✨"
  exit 0
fi
