#!/bin/bash
# Issue #7: Configure Environment Variables - TDD Acceptance Tests
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
echo "Issue #7: Configure Environment Variables"
echo "TDD Acceptance Tests"
echo "=========================================="
echo ""

# AC1: .env.example created for team reference
echo "--- AC1: .env.example created for team reference ---"

if [ -f ".env.example" ]; then
    pass ".env.example file exists"
else
    fail ".env.example file does not exist"
fi

# Check for essential variable categories
if grep -q "NEXT_PUBLIC_API" .env.example 2>/dev/null; then
    pass ".env.example contains API configuration variables"
else
    fail ".env.example missing API configuration variables"
fi

if grep -q "NEXT_PUBLIC_STRIPE" .env.example 2>/dev/null; then
    pass ".env.example contains Stripe configuration"
else
    fail ".env.example missing Stripe configuration"
fi

if grep -q "NEXT_PUBLIC_STRAPI" .env.example 2>/dev/null; then
    pass ".env.example contains Strapi CMS configuration"
else
    fail ".env.example missing Strapi CMS configuration"
fi

# AC2: .env.local template exists (gitignored)
echo ""
echo "--- AC2: .env.local is gitignored ---"

if grep -q "\.env\.local" .gitignore 2>/dev/null; then
    pass ".env.local is in .gitignore"
else
    fail ".env.local is not in .gitignore"
fi

if grep -q "\.env\*\.local" .gitignore 2>/dev/null || grep -q "\.env\.local" .gitignore 2>/dev/null; then
    pass ".env*.local pattern or .env.local is gitignored"
else
    fail ".env*.local pattern is not gitignored"
fi

# AC3: VITE_* variables converted to NEXT_PUBLIC_*
echo ""
echo "--- AC3: VITE_* variables converted to NEXT_PUBLIC_* ---"

if grep -q "^VITE_" .env.example 2>/dev/null; then
    fail "Found VITE_* prefixed variables (should be NEXT_PUBLIC_*)"
else
    pass "No VITE_* prefixed variables in .env.example"
fi

if grep -q "^NEXT_PUBLIC_" .env.example 2>/dev/null; then
    pass "NEXT_PUBLIC_* prefixed variables found"
else
    fail "No NEXT_PUBLIC_* prefixed variables found"
fi

# AC4: Server-side only variables identified (no NEXT_PUBLIC_ prefix)
echo ""
echo "--- AC4: Server-side only variables (secrets) ---"

# Server-side vars should NOT have NEXT_PUBLIC_ prefix
if grep -q "^STRIPE_SECRET_KEY=" .env.example 2>/dev/null || grep -q "^STRIPE_WEBHOOK_SECRET=" .env.example 2>/dev/null; then
    pass "Server-side Stripe secrets use correct naming (no NEXT_PUBLIC_)"
else
    fail "Server-side Stripe secrets should not have NEXT_PUBLIC_ prefix"
fi

if grep -q "^DATABASE_URL=" .env.example 2>/dev/null; then
    pass "DATABASE_URL uses server-side naming (no NEXT_PUBLIC_)"
else
    fail "DATABASE_URL should be server-side only"
fi

# AC5: Environment variable validation (Zod schema)
echo ""
echo "--- AC5: Environment variable validation ---"

if [ -f "lib/env.ts" ] || [ -f "lib/env.mjs" ]; then
    pass "Environment validation file exists (lib/env.ts or lib/env.mjs)"
else
    fail "Environment validation file missing (lib/env.ts)"
fi

if grep -q "zod\|z\." lib/env.ts 2>/dev/null || grep -q "zod\|z\." lib/env.mjs 2>/dev/null; then
    pass "Zod schema is used for validation"
else
    fail "Zod schema not found in env validation file"
fi

# Check for client env validation
if grep -q "NEXT_PUBLIC_" lib/env.ts 2>/dev/null || grep -q "NEXT_PUBLIC_" lib/env.mjs 2>/dev/null; then
    pass "Client environment variables are validated"
else
    fail "Client environment variables validation missing"
fi

# Check for server env validation
if grep -q "STRIPE_SECRET_KEY\|DATABASE_URL" lib/env.ts 2>/dev/null || grep -q "STRIPE_SECRET_KEY\|DATABASE_URL" lib/env.mjs 2>/dev/null; then
    pass "Server environment variables are validated"
else
    fail "Server environment variables validation missing"
fi

# AC6: TypeScript support for env vars
echo ""
echo "--- AC6: TypeScript support ---"

if [ -f "env.d.ts" ] || [ -f "types/env.d.ts" ]; then
    pass "TypeScript declaration file for env vars exists"
else
    fail "TypeScript declaration file for env vars missing"
fi

# Check that env.d.ts declares ProcessEnv
if grep -q "ProcessEnv" env.d.ts 2>/dev/null || grep -q "ProcessEnv" types/env.d.ts 2>/dev/null; then
    pass "ProcessEnv interface is extended"
else
    fail "ProcessEnv interface extension missing"
fi

# AC7: Documentation exists
echo ""
echo "--- AC7: Environment documentation ---"

if grep -q "Environment\|\.env" .env.example 2>/dev/null && grep -q "#" .env.example 2>/dev/null; then
    pass ".env.example contains documentation comments"
else
    fail ".env.example missing documentation comments"
fi

# Check for section headers in .env.example
if grep -q "===\|---\|#.*Configuration\|#.*API\|#.*Stripe" .env.example 2>/dev/null; then
    pass ".env.example has organized sections"
else
    fail ".env.example missing organized section headers"
fi

# AC8: Zod package installed
echo ""
echo "--- AC8: Dependencies ---"

if grep -q '"zod"' package.json 2>/dev/null; then
    pass "Zod is listed in package.json"
else
    fail "Zod is not in package.json"
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
