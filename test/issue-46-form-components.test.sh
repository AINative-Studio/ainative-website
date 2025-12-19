#!/bin/bash
# Story #46: Form Components Migration Tests
# Tests for form components with validation and accessibility
# Part of Sprint 2 - Component Migration

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
echo "Story #46: Form Components Migration Tests"
echo "========================================"
echo ""

# ====================
# FORM FILE TESTS
# ====================
echo "--- Form File Structure Tests ---"

# Test 1: Login form exists
if [ -f "app/login/page.tsx" ]; then
    test_pass "Login form exists at app/login/page.tsx"
else
    test_fail "Login form not found"
fi

# Test 2: Signup form exists
if [ -f "app/signup/page.tsx" ]; then
    test_pass "Signup form exists at app/signup/page.tsx"
else
    test_fail "Signup form not found"
fi

# Test 3: Forgot password form exists
if [ -f "app/forgot-password/page.tsx" ]; then
    test_pass "Forgot password form exists at app/forgot-password/page.tsx"
else
    test_fail "Forgot password form not found"
fi

# Test 4: Contact form client exists
if [ -f "app/contact/ContactClient.tsx" ]; then
    test_pass "Contact form client exists at app/contact/ContactClient.tsx"
else
    test_fail "Contact form client not found"
fi

# Test 5: Support form client exists
if [ -f "app/support/SupportClient.tsx" ]; then
    test_pass "Support form client exists at app/support/SupportClient.tsx"
else
    test_fail "Support form client not found"
fi

# Test 6: Credit refills form exists
if [ -f "app/refills/CreditRefillsClient.tsx" ]; then
    test_pass "Credit refills form exists at app/refills/CreditRefillsClient.tsx"
else
    test_fail "Credit refills form not found"
fi

# ====================
# FORM ELEMENT TESTS
# ====================
echo ""
echo "--- Form Element Tests ---"

# Test 7: Login form has form element
if grep -q "<form" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login page has <form> element"
else
    test_fail "Login page missing <form> element"
fi

# Test 8: Signup form has form element
if grep -q "<form" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup page has <form> element"
else
    test_fail "Signup page missing <form> element"
fi

# Test 9: Contact form has form element
if grep -q "<form" "app/contact/ContactClient.tsx" 2>/dev/null; then
    test_pass "Contact page has <form> element"
else
    test_fail "Contact page missing <form> element"
fi

# Test 10: Support form has form element
if grep -q "<form" "app/support/SupportClient.tsx" 2>/dev/null; then
    test_pass "Support page has <form> element"
else
    test_fail "Support page missing <form> element"
fi

# ====================
# FORM SUBMISSION TESTS
# ====================
echo ""
echo "--- Form Submission Handler Tests ---"

# Test 11: Login has handleSubmit
if grep -q "handleSubmit" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login has handleSubmit function"
else
    test_fail "Login missing handleSubmit function"
fi

# Test 12: Signup has handleSubmit
if grep -q "handleSubmit" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup has handleSubmit function"
else
    test_fail "Signup missing handleSubmit function"
fi

# Test 13: Contact has handleSubmit
if grep -q "handleSubmit" "app/contact/ContactClient.tsx" 2>/dev/null; then
    test_pass "Contact has handleSubmit function"
else
    test_fail "Contact missing handleSubmit function"
fi

# Test 14: Forms prevent default
if grep -q "e.preventDefault()" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login form prevents default submission"
else
    test_fail "Login form missing preventDefault"
fi

# ====================
# INPUT COMPONENT TESTS
# ====================
echo ""
echo "--- Input Component Usage Tests ---"

# Test 15: Login uses shadcn Input
if grep -q "from '@/components/ui/input'" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login uses shadcn Input component"
else
    test_fail "Login not using shadcn Input"
fi

# Test 16: Signup uses shadcn Input
if grep -q "from '@/components/ui/input'" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup uses shadcn Input component"
else
    test_fail "Signup not using shadcn Input"
fi

# Test 17: Contact uses shadcn Input
if grep -q "from '@/components/ui/input'" "app/contact/ContactClient.tsx" 2>/dev/null; then
    test_pass "Contact uses shadcn Input component"
else
    test_fail "Contact not using shadcn Input"
fi

# Test 18: Contact uses shadcn Textarea
if grep -q "from '@/components/ui/textarea'" "app/contact/ContactClient.tsx" 2>/dev/null; then
    test_pass "Contact uses shadcn Textarea component"
else
    test_fail "Contact not using shadcn Textarea"
fi

# Test 19: Contact uses shadcn Select
if grep -q "from '@/components/ui/select'" "app/contact/ContactClient.tsx" 2>/dev/null; then
    test_pass "Contact uses shadcn Select component"
else
    test_fail "Contact not using shadcn Select"
fi

# ====================
# ACCESSIBILITY TESTS
# ====================
echo ""
echo "--- Accessibility (ARIA/Labels) Tests ---"

# Test 20: Login uses Label component
if grep -q "from '@/components/ui/label'" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login uses Label component for accessibility"
else
    test_fail "Login not using Label component"
fi

# Test 21: Login has htmlFor on labels
if grep -q "htmlFor=" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login labels have htmlFor attribute"
else
    test_fail "Login labels missing htmlFor attribute"
fi

# Test 22: Login inputs have id for label linking
if grep -q 'id="email"' "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login email input has id for label association"
else
    test_fail "Login email input missing id"
fi

# Test 23: Login inputs have id for label linking
if grep -q 'id="password"' "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login password input has id for label association"
else
    test_fail "Login password input missing id"
fi

# Test 24: Signup uses Label component
if grep -q "from '@/components/ui/label'" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup uses Label component for accessibility"
else
    test_fail "Signup not using Label component"
fi

# Test 25: Contact uses Label component
if grep -q "from '@/components/ui/label'" "app/contact/ContactClient.tsx" 2>/dev/null; then
    test_pass "Contact uses Label component for accessibility"
else
    test_fail "Contact not using Label component"
fi

# ====================
# ERROR HANDLING TESTS
# ====================
echo ""
echo "--- Error Handling Tests ---"

# Test 26: Login has error state
if grep -q "setError" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login has error state handling"
else
    test_fail "Login missing error state"
fi

# Test 27: Login displays error messages
if grep -q "{error}" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login displays error messages"
else
    test_fail "Login not displaying errors"
fi

# Test 28: Signup has error state
if grep -q "setError" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup has error state handling"
else
    test_fail "Signup missing error state"
fi

# Test 29: Signup displays error messages
if grep -q "{error}" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup displays error messages"
else
    test_fail "Signup not displaying errors"
fi

# ====================
# LOADING STATE TESTS
# ====================
echo ""
echo "--- Loading State Tests ---"

# Test 30: Login has loading state
if grep -q "isLoading" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login has loading state"
else
    test_fail "Login missing loading state"
fi

# Test 31: Signup has loading state
if grep -q "isLoading" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup has loading state"
else
    test_fail "Signup missing loading state"
fi

# Test 32: Contact has submitting state
if grep -q "isSubmitting" "app/contact/ContactClient.tsx" 2>/dev/null; then
    test_pass "Contact has submitting state"
else
    test_fail "Contact missing submitting state"
fi

# Test 33: Forms disable button during submission
if grep -q "disabled={isLoading}" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login button disabled during loading"
else
    test_fail "Login button not disabled during loading"
fi

# ====================
# VALIDATION TESTS
# ====================
echo ""
echo "--- Basic Validation Tests ---"

# Test 34: Login email has required attribute
if grep -q "required" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login form has required validation"
else
    test_fail "Login form missing required validation"
fi

# Test 35: Login email has type="email"
if grep -q 'type="email"' "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login uses type=email for email validation"
else
    test_fail "Login not using type=email"
fi

# Test 36: Signup password has minLength
if grep -q "minLength" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup has password minLength validation"
else
    test_fail "Signup missing password minLength"
fi

# ====================
# CLIENT COMPONENT TESTS
# ====================
echo ""
echo "--- Client Component Tests ---"

# Test 37: Login is client component
if grep -qE "^['\"]use client['\"]" "app/login/page.tsx" 2>/dev/null; then
    test_pass "Login is a client component"
else
    test_fail "Login missing 'use client' directive"
fi

# Test 38: Signup is client component
if grep -qE "^['\"]use client['\"]" "app/signup/page.tsx" 2>/dev/null; then
    test_pass "Signup is a client component"
else
    test_fail "Signup missing 'use client' directive"
fi

# Test 39: Contact client is client component
if grep -qE "^['\"]use client['\"]" "app/contact/ContactClient.tsx" 2>/dev/null; then
    test_pass "ContactClient is a client component"
else
    test_fail "ContactClient missing 'use client' directive"
fi

# ====================
# DEPENDENCY TESTS
# ====================
echo ""
echo "--- Dependency Tests ---"

# Test 40: Zod is installed for validation
if grep -q '"zod"' "package.json" 2>/dev/null; then
    test_pass "Zod is installed for validation"
else
    test_fail "Zod not installed"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test 41: Project builds successfully
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with form components"
else
    test_fail "Project build failed"
    echo "Build output (last 20 lines):"
    tail -20 /tmp/build_output.txt
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
