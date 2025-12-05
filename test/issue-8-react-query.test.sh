#!/bin/bash
# Issue #8: Set Up React Query with Next.js - TDD Acceptance Tests
# Tests based on acceptance criteria from the issue

set -e

PROJECT_DIR="/home/quaid/Documents/Projects/ainative-studio/src/ainative-nextjs"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

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
echo "Issue #8: Set Up React Query with Next.js"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: React Query packages installed
echo "--- AC1: React Query packages installed ---"

if grep -q '"@tanstack/react-query"' package.json 2>/dev/null; then
    pass "@tanstack/react-query is installed"
else
    fail "@tanstack/react-query is not installed"
fi

if grep -q '"@tanstack/react-query-devtools"' package.json 2>/dev/null; then
    pass "@tanstack/react-query-devtools is installed"
else
    fail "@tanstack/react-query-devtools is not installed"
fi

# AC2: Query client configuration exists
echo ""
echo "--- AC2: Query client configuration ---"

if [ -f "lib/query-client.ts" ] || [ -f "lib/react-query.ts" ]; then
    pass "Query client configuration file exists"
else
    fail "Query client configuration file missing"
fi

# Check for QueryClient creation
if grep -q "QueryClient\|queryClient" lib/query-client.ts 2>/dev/null || grep -q "QueryClient\|queryClient" lib/react-query.ts 2>/dev/null; then
    pass "QueryClient is configured"
else
    fail "QueryClient configuration not found"
fi

# Check for default options
if grep -q "defaultOptions\|staleTime\|gcTime\|refetchOnWindowFocus" lib/query-client.ts 2>/dev/null || grep -q "defaultOptions\|staleTime\|gcTime\|refetchOnWindowFocus" lib/react-query.ts 2>/dev/null; then
    pass "Query client default options are configured"
else
    fail "Query client default options not configured"
fi

# AC3: React Query provider set up in root layout
echo ""
echo "--- AC3: React Query provider in layout ---"

if [ -f "components/providers/QueryProvider.tsx" ] || [ -f "providers/QueryProvider.tsx" ] || [ -f "app/providers.tsx" ]; then
    pass "Query provider component exists"
else
    fail "Query provider component missing"
fi

# Check provider uses QueryClientProvider
if grep -q "QueryClientProvider" components/providers/QueryProvider.tsx 2>/dev/null || grep -q "QueryClientProvider" providers/QueryProvider.tsx 2>/dev/null || grep -q "QueryClientProvider" app/providers.tsx 2>/dev/null; then
    pass "QueryClientProvider is used in provider"
else
    fail "QueryClientProvider not found in provider"
fi

# Check root layout uses provider
if grep -q "QueryProvider\|Providers" app/layout.tsx 2>/dev/null; then
    pass "Query provider is used in root layout"
else
    fail "Query provider not used in root layout"
fi

# AC4: HydrationBoundary configured for SSR
echo ""
echo "--- AC4: HydrationBoundary for SSR ---"

if grep -q "HydrationBoundary" components/providers/QueryProvider.tsx 2>/dev/null || grep -q "HydrationBoundary" providers/QueryProvider.tsx 2>/dev/null || grep -q "HydrationBoundary" lib/query-client.ts 2>/dev/null || grep -q "HydrationBoundary" lib/react-query.ts 2>/dev/null; then
    pass "HydrationBoundary is exported/configured"
else
    fail "HydrationBoundary not configured"
fi

# Check for dehydrate function availability
if grep -q "dehydrate" lib/query-client.ts 2>/dev/null || grep -q "dehydrate" lib/react-query.ts 2>/dev/null; then
    pass "dehydrate function is available for SSR"
else
    fail "dehydrate function not available"
fi

# AC5: DevTools enabled in development
echo ""
echo "--- AC5: DevTools in development ---"

if grep -q "ReactQueryDevtools" components/providers/QueryProvider.tsx 2>/dev/null || grep -q "ReactQueryDevtools" providers/QueryProvider.tsx 2>/dev/null || grep -q "ReactQueryDevtools" app/providers.tsx 2>/dev/null; then
    pass "ReactQueryDevtools is imported"
else
    fail "ReactQueryDevtools is not imported"
fi

# Check for development-only condition
if grep -q "process.env.NODE_ENV\|development" components/providers/QueryProvider.tsx 2>/dev/null || grep -q "process.env.NODE_ENV\|development" providers/QueryProvider.tsx 2>/dev/null || grep -q "process.env.NODE_ENV\|development" app/providers.tsx 2>/dev/null; then
    pass "DevTools conditionally rendered for development"
else
    fail "DevTools not conditionally rendered"
fi

# AC6: Provider is client component
echo ""
echo "--- AC6: Provider is client component ---"

if head -1 components/providers/QueryProvider.tsx 2>/dev/null | grep -q "use client" || head -1 providers/QueryProvider.tsx 2>/dev/null | grep -q "use client" || head -1 app/providers.tsx 2>/dev/null | grep -q "use client"; then
    pass "Provider has 'use client' directive"
else
    fail "Provider missing 'use client' directive"
fi

# AC7: Custom hooks exported
echo ""
echo "--- AC7: Custom hooks for data fetching ---"

if [ -f "hooks/use-query.ts" ] || [ -f "lib/react-query.ts" ]; then
    if grep -q "useQuery\|useMutation" hooks/use-query.ts 2>/dev/null || grep -q "useQuery\|useMutation" lib/react-query.ts 2>/dev/null; then
        pass "Query hooks are exported"
    else
        fail "Query hooks not exported"
    fi
else
    # Check if hooks are re-exported from main file
    if grep -q "export.*useQuery\|export.*from.*@tanstack/react-query" lib/react-query.ts 2>/dev/null || grep -q "export.*useQuery\|export.*from.*@tanstack/react-query" lib/query-client.ts 2>/dev/null; then
        pass "Query hooks are re-exported"
    else
        fail "Query hooks file missing or not exported"
    fi
fi

# AC8: TypeScript types
echo ""
echo "--- AC8: TypeScript support ---"

# Build should pass with no type errors
if npm run build 2>&1 | grep -q "error TS"; then
    fail "TypeScript errors in build"
else
    pass "No TypeScript errors"
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
