#!/bin/bash
set -e

# Test script for Layout Components (Header, Footer) and Auth Pages
# Tests the Header, Footer components and login/signup/design-system pages

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo "✅ PASS: $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "❌ FAIL: $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

echo "=========================================="
echo "Layout Components & Auth Pages Tests"
echo "=========================================="
echo ""

# --- Header Component Tests ---
echo "--- Header Component Tests ---"

if [ -f "components/layout/Header.tsx" ]; then
  pass "Header component exists"
else
  fail "Header component missing"
fi

if grep -q "'use client'" components/layout/Header.tsx 2>/dev/null; then
  pass "Header is a client component"
else
  fail "Header missing 'use client' directive"
fi

if grep -q "Products" components/layout/Header.tsx 2>/dev/null; then
  pass "Header has Products navigation"
else
  fail "Header missing Products navigation"
fi

if grep -q "Pricing" components/layout/Header.tsx 2>/dev/null; then
  pass "Header has Pricing navigation"
else
  fail "Header missing Pricing navigation"
fi

if grep -q "Design System" components/layout/Header.tsx 2>/dev/null; then
  pass "Header has Design System navigation"
else
  fail "Header missing Design System navigation"
fi

if grep -q "ZeroDB" components/layout/Header.tsx 2>/dev/null; then
  pass "Header has ZeroDB navigation"
else
  fail "Header missing ZeroDB navigation"
fi

if grep -q "Sign In" components/layout/Header.tsx 2>/dev/null; then
  pass "Header has Sign In button"
else
  fail "Header missing Sign In button"
fi

if grep -q "Book a Call" components/layout/Header.tsx 2>/dev/null; then
  pass "Header has Book a Call button"
else
  fail "Header missing Book a Call button"
fi

# --- Footer Component Tests ---
echo ""
echo "--- Footer Component Tests ---"

if [ -f "components/layout/Footer.tsx" ]; then
  pass "Footer component exists"
else
  fail "Footer component missing"
fi

if grep -q "'use client'" components/layout/Footer.tsx 2>/dev/null; then
  pass "Footer is a client component"
else
  fail "Footer missing 'use client' directive"
fi

if grep -q "PRODUCT" components/layout/Footer.tsx 2>/dev/null; then
  pass "Footer has PRODUCT section"
else
  fail "Footer missing PRODUCT section"
fi

if grep -q "COMMUNITY" components/layout/Footer.tsx 2>/dev/null; then
  pass "Footer has COMMUNITY section"
else
  fail "Footer missing COMMUNITY section"
fi

if grep -q "COMPANY" components/layout/Footer.tsx 2>/dev/null; then
  pass "Footer has COMPANY section"
else
  fail "Footer missing COMPANY section"
fi

if grep -q "LinkedIn" components/layout/Footer.tsx 2>/dev/null || grep -q "linkedin" components/layout/Footer.tsx 2>/dev/null; then
  pass "Footer has LinkedIn link"
else
  fail "Footer missing LinkedIn link"
fi

if grep -q "GitHub" components/layout/Footer.tsx 2>/dev/null || grep -q "github" components/layout/Footer.tsx 2>/dev/null; then
  pass "Footer has GitHub link"
else
  fail "Footer missing GitHub link"
fi

# --- Root Layout Tests ---
echo ""
echo "--- Root Layout Tests ---"

if [ -f "app/layout.tsx" ]; then
  pass "Root layout exists"
else
  fail "Root layout missing"
fi

if grep -q "Header" app/layout.tsx 2>/dev/null; then
  pass "Root layout imports Header"
else
  fail "Root layout missing Header import"
fi

if grep -q "Footer" app/layout.tsx 2>/dev/null; then
  pass "Root layout imports Footer"
else
  fail "Root layout missing Footer import"
fi

if grep -q "<Header" app/layout.tsx 2>/dev/null; then
  pass "Root layout renders Header"
else
  fail "Root layout not rendering Header"
fi

if grep -q "<Footer" app/layout.tsx 2>/dev/null; then
  pass "Root layout renders Footer"
else
  fail "Root layout not rendering Footer"
fi

# --- Design System Page Tests ---
echo ""
echo "--- Design System Page Tests ---"

if [ -f "app/design-system/page.tsx" ]; then
  pass "Design System page exists"
else
  fail "Design System page missing"
fi

if grep -q "export.*metadata" app/design-system/page.tsx 2>/dev/null; then
  pass "Design System page has metadata"
else
  fail "Design System page missing metadata"
fi

if grep -q "Coming Soon" app/design-system/page.tsx 2>/dev/null; then
  pass "Design System page has Coming Soon placeholder"
else
  fail "Design System page missing Coming Soon placeholder"
fi

# --- Login Page Tests ---
echo ""
echo "--- Login Page Tests ---"

if [ -f "app/login/page.tsx" ]; then
  pass "Login page exists"
else
  fail "Login page missing"
fi

if grep -q "'use client'" app/login/page.tsx 2>/dev/null; then
  pass "Login page is a client component"
else
  fail "Login page missing 'use client' directive"
fi

if grep -q "GitHub" app/login/page.tsx 2>/dev/null; then
  pass "Login page has GitHub OAuth option"
else
  fail "Login page missing GitHub OAuth option"
fi

if grep -q "email" app/login/page.tsx 2>/dev/null; then
  pass "Login page has email input"
else
  fail "Login page missing email input"
fi

if grep -q "password" app/login/page.tsx 2>/dev/null; then
  pass "Login page has password input"
else
  fail "Login page missing password input"
fi

if grep -q "Sign in" app/login/page.tsx 2>/dev/null || grep -q "Sign In" app/login/page.tsx 2>/dev/null; then
  pass "Login page has Sign In button"
else
  fail "Login page missing Sign In button"
fi

# --- Signup Page Tests ---
echo ""
echo "--- Signup Page Tests ---"

if [ -f "app/signup/page.tsx" ]; then
  pass "Signup page exists"
else
  fail "Signup page missing"
fi

if grep -q "'use client'" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page is a client component"
else
  fail "Signup page missing 'use client' directive"
fi

if grep -q "GitHub" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page has GitHub OAuth option"
else
  fail "Signup page missing GitHub OAuth option"
fi

if grep -q "name" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page has name input"
else
  fail "Signup page missing name input"
fi

if grep -q "email" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page has email input"
else
  fail "Signup page missing email input"
fi

if grep -q "password" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page has password input"
else
  fail "Signup page missing password input"
fi

if grep -q "Terms" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page links to Terms of Service"
else
  fail "Signup page missing Terms of Service link"
fi

if grep -q "Privacy" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page links to Privacy Policy"
else
  fail "Signup page missing Privacy Policy link"
fi

# --- Summary ---
echo ""
echo "=========================================="
echo "Test Results Summary"
echo "=========================================="
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
  echo "❌ Some tests failed!"
  exit 1
else
  echo "✅ All tests passed!"
  exit 0
fi
