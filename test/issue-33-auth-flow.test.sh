#!/bin/bash
set -e

# Test script for Story #33: Implement Authentication Flow
# Tests NextAuth.js configuration, auth pages, middleware, and session management

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
echo "Story #33: Authentication Flow Tests"
echo "=========================================="
echo ""

# --- NextAuth Configuration Tests ---
echo "--- NextAuth Configuration Tests ---"

if [ -f "lib/auth/options.ts" ]; then
  pass "Auth options file exists"
else
  fail "Auth options file missing"
fi

if grep -q "GitHubProvider" lib/auth/options.ts 2>/dev/null; then
  pass "GitHub provider configured"
else
  fail "GitHub provider not configured"
fi

if grep -q "CredentialsProvider" lib/auth/options.ts 2>/dev/null; then
  pass "Credentials provider configured"
else
  fail "Credentials provider not configured"
fi

if grep -q "session:" lib/auth/options.ts 2>/dev/null; then
  pass "Session configuration present"
else
  fail "Session configuration missing"
fi

if grep -q "callbacks:" lib/auth/options.ts 2>/dev/null; then
  pass "Auth callbacks configured"
else
  fail "Auth callbacks missing"
fi

if grep -q "jwt" lib/auth/options.ts 2>/dev/null; then
  pass "JWT strategy configured"
else
  fail "JWT strategy not configured"
fi

# --- Auth API Route Tests ---
echo ""
echo "--- Auth API Route Tests ---"

if [ -f "app/api/auth/[...nextauth]/route.ts" ]; then
  pass "NextAuth API route exists"
else
  fail "NextAuth API route missing"
fi

if grep -q "NextAuth" app/api/auth/\[...nextauth\]/route.ts 2>/dev/null; then
  pass "NextAuth handler configured"
else
  fail "NextAuth handler not configured"
fi

if grep -q "GET\|POST" app/api/auth/\[...nextauth\]/route.ts 2>/dev/null; then
  pass "HTTP methods exported"
else
  fail "HTTP methods not exported"
fi

# --- Middleware Tests ---
echo ""
echo "--- Middleware Tests ---"

if [ -f "middleware.ts" ]; then
  pass "Middleware file exists"
else
  fail "Middleware file missing"
fi

if grep -q "getToken" middleware.ts 2>/dev/null; then
  pass "getToken from next-auth/jwt used"
else
  fail "getToken not used in middleware"
fi

if grep -q "dashboard" middleware.ts 2>/dev/null; then
  pass "Dashboard route protected"
else
  fail "Dashboard route not protected"
fi

if grep -q "matcher" middleware.ts 2>/dev/null; then
  pass "Route matcher configured"
else
  fail "Route matcher not configured"
fi

if grep -q "login" middleware.ts 2>/dev/null; then
  pass "Login route handled"
else
  fail "Login route not handled"
fi

# --- Session Provider Tests ---
echo ""
echo "--- Session Provider Tests ---"

if [ -f "components/providers/session-provider.tsx" ]; then
  pass "Session provider component exists"
else
  fail "Session provider component missing"
fi

if grep -q "SessionProvider" components/providers/session-provider.tsx 2>/dev/null; then
  pass "SessionProvider from next-auth/react used"
else
  fail "SessionProvider not imported"
fi

if grep -q "SessionProvider" app/layout.tsx 2>/dev/null; then
  pass "SessionProvider added to root layout"
else
  fail "SessionProvider not in root layout"
fi

# --- Login Page Tests ---
echo ""
echo "--- Login Page Tests ---"

if [ -f "app/login/page.tsx" ]; then
  pass "Login page exists"
else
  fail "Login page missing"
fi

if grep -q "signIn" app/login/page.tsx 2>/dev/null; then
  pass "Login page uses NextAuth signIn"
else
  fail "Login page not using NextAuth signIn"
fi

if grep -q "useSearchParams" app/login/page.tsx 2>/dev/null; then
  pass "Login page handles callback URLs"
else
  fail "Login page not handling callback URLs"
fi

if grep -q "credentials" app/login/page.tsx 2>/dev/null; then
  pass "Credentials login implemented"
else
  fail "Credentials login not implemented"
fi

if grep -q "github" app/login/page.tsx 2>/dev/null; then
  pass "GitHub OAuth implemented"
else
  fail "GitHub OAuth not implemented"
fi

# --- Signup Page Tests ---
echo ""
echo "--- Signup Page Tests ---"

if [ -f "app/signup/page.tsx" ]; then
  pass "Signup page exists"
else
  fail "Signup page missing"
fi

if grep -q "signIn" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page uses NextAuth signIn"
else
  fail "Signup page not using NextAuth signIn"
fi

if grep -q "Terms" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page has Terms link"
else
  fail "Signup page missing Terms link"
fi

if grep -q "Privacy" app/signup/page.tsx 2>/dev/null; then
  pass "Signup page has Privacy link"
else
  fail "Signup page missing Privacy link"
fi

# --- Forgot Password Page Tests ---
echo ""
echo "--- Forgot Password Page Tests ---"

if [ -f "app/forgot-password/page.tsx" ]; then
  pass "Forgot password page exists"
else
  fail "Forgot password page missing"
fi

if grep -q "'use client'" app/forgot-password/page.tsx 2>/dev/null; then
  pass "Forgot password is client component"
else
  fail "Forgot password missing 'use client'"
fi

if grep -q "email" app/forgot-password/page.tsx 2>/dev/null; then
  pass "Forgot password has email input"
else
  fail "Forgot password missing email input"
fi

if grep -q "reset" app/forgot-password/page.tsx 2>/dev/null; then
  pass "Reset functionality present"
else
  fail "Reset functionality missing"
fi

# --- Header Auth Integration Tests ---
echo ""
echo "--- Header Auth Integration Tests ---"

if grep -q "useSession" components/layout/Header.tsx 2>/dev/null; then
  pass "Header uses NextAuth useSession"
else
  fail "Header not using useSession"
fi

if grep -q "signOut" components/layout/Header.tsx 2>/dev/null; then
  pass "Header uses NextAuth signOut"
else
  fail "Header not using signOut"
fi

if grep -q "status" components/layout/Header.tsx 2>/dev/null; then
  pass "Header checks auth status"
else
  fail "Header not checking auth status"
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
