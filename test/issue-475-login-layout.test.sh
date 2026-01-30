#!/bin/bash

# Test script for issue #475: Login page layout fixes
# Validates:
# 1. No duplicate AINATIVE logo in login form
# 2. Proper footer spacing with mb-16

set -e

echo "=================================="
echo "Issue #475: Login Page Layout Test"
echo "=================================="

LOGIN_PAGE="app/login/page.tsx"
ERRORS=0

# Check if login page exists
if [ ! -f "$LOGIN_PAGE" ]; then
  echo "ERROR: Login page not found at $LOGIN_PAGE"
  exit 1
fi

echo ""
echo "Test 1: Verify no duplicate AINATIVE logo in login form"
echo "--------------------------------------------------------"
# Should NOT find Image import
if grep -q "import Image from 'next/image'" "$LOGIN_PAGE"; then
  echo "ERROR: Found unused Image import - should be removed"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: No Image import found"
fi

# Should NOT find logo inside LoginForm component
if grep -A 20 "function LoginForm()" "$LOGIN_PAGE" | grep -q "ainative-icon.svg"; then
  echo "ERROR: Found duplicate logo in LoginForm component"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: No duplicate logo in LoginForm component"
fi

# Should NOT find logo inside LoginFormFallback
if grep -A 20 "function LoginFormFallback()" "$LOGIN_PAGE" | grep -q "ainative-icon.svg"; then
  echo "ERROR: Found duplicate logo in LoginFormFallback component"
  ERRORS=$((ERRORS + 1))
else
  echo "PASS: No duplicate logo in LoginFormFallback component"
fi

echo ""
echo "Test 2: Verify proper footer spacing (mb-16)"
echo "---------------------------------------------"
# Should find mb-16 on signup link paragraph
if grep -q 'className="text-center mt-6 mb-16 text-gray-400"' "$LOGIN_PAGE"; then
  echo "PASS: Found mb-16 spacing on signup link"
else
  echo "ERROR: mb-16 spacing not found on signup link"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "Test 3: Verify Header component shows logo"
echo "-------------------------------------------"
HEADER_FILE="components/layout/Header.tsx"
if [ -f "$HEADER_FILE" ]; then
  if grep -q "AINATIVE\|ainative-icon" "$HEADER_FILE"; then
    echo "PASS: Header component contains AINATIVE branding"
  else
    echo "WARNING: Header component may not contain AINATIVE branding"
  fi
else
  echo "WARNING: Header component not found at $HEADER_FILE"
fi

echo ""
echo "Test 4: Verify ConditionalLayout allows login to have Header"
echo "-------------------------------------------------------------"
CONDITIONAL_LAYOUT="components/layout/ConditionalLayout.tsx"
if [ -f "$CONDITIONAL_LAYOUT" ]; then
  # Login should NOT be in the dashboard routes list
  if grep -A 20 "isDashboardRoute" "$CONDITIONAL_LAYOUT" | grep -q "/login"; then
    echo "ERROR: Login page incorrectly marked as dashboard route"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: Login page allows Header/Footer rendering"
  fi
else
  echo "ERROR: ConditionalLayout component not found"
  ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=================================="
if [ $ERRORS -eq 0 ]; then
  echo "RESULT: ALL TESTS PASSED"
  echo "=================================="
  exit 0
else
  echo "RESULT: $ERRORS TEST(S) FAILED"
  echo "=================================="
  exit 1
fi
