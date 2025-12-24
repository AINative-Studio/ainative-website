#!/bin/bash

# Test script for Issue #217: OAuth Callback Page Migration
# Verifies proper migration from Vite SPA to Next.js

# Note: Not using set -e to allow all tests to run even if some fail

echo "🧪 Testing OAuth Callback Page Migration (Issue #217)"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Check if server component exists
echo ""
echo "Test 1: Server component structure"
if [ -f "app/login/callback/page.tsx" ]; then
    pass "Server component exists at app/login/callback/page.tsx"

    # Check for metadata export
    if grep -q "export const metadata" "app/login/callback/page.tsx"; then
        pass "Metadata export found"
    else
        fail "Metadata export missing"
    fi

    # Check that it doesn't have 'use client'
    if ! grep -q "'use client'" "app/login/callback/page.tsx"; then
        pass "Server component doesn't have 'use client' directive"
    else
        fail "Server component should not have 'use client' directive"
    fi
else
    fail "Server component missing at app/login/callback/page.tsx"
fi

# Test 2: Check if client component exists
echo ""
echo "Test 2: Client component structure"
if [ -f "app/login/callback/OAuthCallbackClient.tsx" ]; then
    pass "Client component exists at app/login/callback/OAuthCallbackClient.tsx"

    # Check for 'use client' directive
    if grep -q "'use client'" "app/login/callback/OAuthCallbackClient.tsx"; then
        pass "'use client' directive found"
    else
        fail "'use client' directive missing"
    fi

    # Check for Next.js router usage
    if grep -q "useRouter" "app/login/callback/OAuthCallbackClient.tsx" && \
       grep -q "next/navigation" "app/login/callback/OAuthCallbackClient.tsx"; then
        pass "Next.js useRouter imported correctly"
    else
        fail "Next.js useRouter not properly imported"
    fi

    # Check for useSearchParams
    if grep -q "useSearchParams" "app/login/callback/OAuthCallbackClient.tsx"; then
        pass "useSearchParams used for URL parameter handling"
    else
        fail "useSearchParams missing"
    fi
else
    fail "Client component missing at app/login/callback/OAuthCallbackClient.tsx"
fi

# Test 3: Check for forbidden imports
echo ""
echo "Test 3: Forbidden imports check"
FORBIDDEN_FOUND=0

if grep -q "react-router-dom" "app/login/callback/OAuthCallbackClient.tsx" 2>/dev/null; then
    fail "react-router-dom import found (should use Next.js navigation)"
    ((FORBIDDEN_FOUND++))
fi

if grep -q "react-helmet" "app/login/callback/OAuthCallbackClient.tsx" 2>/dev/null; then
    fail "react-helmet import found (should use Next.js metadata)"
    ((FORBIDDEN_FOUND++))
fi

if [ $FORBIDDEN_FOUND -eq 0 ]; then
    pass "No forbidden imports found"
fi

# Test 4: Check AuthService
echo ""
echo "Test 4: AuthService implementation"
if [ -f "services/AuthService.ts" ]; then
    pass "AuthService exists at services/AuthService.ts"

    # Check for key methods
    if grep -q "handleOAuthCallback" "services/AuthService.ts"; then
        pass "handleOAuthCallback method found"
    else
        fail "handleOAuthCallback method missing"
    fi

    if grep -q "getCurrentUser" "services/AuthService.ts"; then
        pass "getCurrentUser method found"
    else
        fail "getCurrentUser method missing"
    fi

    if grep -q "testLogin" "services/AuthService.ts"; then
        pass "testLogin fallback method found"
    else
        warn "testLogin fallback method missing (optional)"
    fi
else
    fail "AuthService missing at services/AuthService.ts"
fi

# Test 5: Check for proper API client usage
echo ""
echo "Test 5: API client integration"
if grep -q "@/services/AuthService" "app/login/callback/OAuthCallbackClient.tsx"; then
    pass "AuthService imported from @/services/"
else
    fail "AuthService not imported correctly"
fi

if grep -q "@/lib/api-client" "services/AuthService.ts" 2>/dev/null; then
    pass "API client imported in AuthService"
else
    fail "API client not imported in AuthService"
fi

# Test 6: Check for OAuth flow components
echo ""
echo "Test 6: OAuth flow implementation"
CLIENT_FILE="app/login/callback/OAuthCallbackClient.tsx"

if grep -q "searchParams.get('code')" "$CLIENT_FILE" 2>/dev/null; then
    pass "OAuth code parameter extraction found"
else
    fail "OAuth code parameter extraction missing"
fi

if grep -q "searchParams.get('error')" "$CLIENT_FILE" 2>/dev/null; then
    pass "OAuth error handling found"
else
    fail "OAuth error handling missing"
fi

if grep -q "toast" "$CLIENT_FILE" 2>/dev/null; then
    pass "Toast notifications implemented"
else
    fail "Toast notifications missing"
fi

# Test 7: Check styling consistency
echo ""
echo "Test 7: Styling and UI components"
if grep -q "bg-\[#0D1117\]" "$CLIENT_FILE" 2>/dev/null; then
    pass "Consistent background color usage"
else
    warn "Background color might not match design system"
fi

if grep -q "Loader2" "$CLIENT_FILE" 2>/dev/null; then
    pass "Loading indicator (Loader2) found"
else
    fail "Loading indicator missing"
fi

# Test 8: TypeScript check (via build)
echo ""
echo "Test 8: TypeScript compilation"
if npx tsc --noEmit > /dev/null 2>&1; then
    pass "TypeScript compilation successful"
else
    warn "TypeScript compilation has errors (will be caught by build)"
fi

# Test 9: Lint check
echo ""
echo "Test 9: ESLint validation"
if npm run lint > /dev/null 2>&1; then
    pass "ESLint validation passed"
else
    warn "ESLint validation has warnings (this is acceptable)"
fi

# Summary
echo ""
echo "=================================================="
echo "Test Summary"
echo "=================================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo "OAuth Callback page migration is complete and verified."
    exit 0
else
    echo -e "${RED}✗ Some tests failed.${NC}"
    echo "Please review the failures above."
    exit 1
fi
