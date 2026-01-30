#!/bin/bash

# Test script for issue #474: Dashboard padding fix
# Verifies that DashboardClient.tsx uses w-full instead of max-w-5xl mx-auto

set -e

echo "Testing issue #474: Dashboard padding fix"
echo "=========================================="

DASHBOARD_CLIENT="app/dashboard/DashboardClient.tsx"
DASHBOARD_LAYOUT="components/layout/DashboardLayout.tsx"

# Test 1: Verify DashboardClient.tsx exists
echo "Test 1: Verifying DashboardClient.tsx exists..."
if [ ! -f "$DASHBOARD_CLIENT" ]; then
  echo "FAIL: $DASHBOARD_CLIENT not found"
  exit 1
fi
echo "PASS: DashboardClient.tsx exists"

# Test 2: Verify DashboardLayout.tsx exists
echo "Test 2: Verifying DashboardLayout.tsx exists..."
if [ ! -f "$DASHBOARD_LAYOUT" ]; then
  echo "FAIL: $DASHBOARD_LAYOUT not found"
  exit 1
fi
echo "PASS: DashboardLayout.tsx exists"

# Test 3: Verify w-full is used in DashboardClient.tsx
echo "Test 3: Verifying w-full class in DashboardClient.tsx..."
if ! grep -q 'className="w-full"' "$DASHBOARD_CLIENT"; then
  echo "FAIL: w-full class not found in DashboardClient.tsx"
  exit 1
fi
echo "PASS: w-full class found in DashboardClient.tsx"

# Test 4: Verify max-w-5xl mx-auto is NOT used in DashboardClient.tsx
echo "Test 4: Verifying max-w-5xl mx-auto is removed from DashboardClient.tsx..."
if grep -q 'max-w-5xl mx-auto' "$DASHBOARD_CLIENT"; then
  echo "FAIL: max-w-5xl mx-auto still present in DashboardClient.tsx"
  exit 1
fi
echo "PASS: max-w-5xl mx-auto removed from DashboardClient.tsx"

# Test 5: Verify DashboardLayout has proper margin for desktop
echo "Test 5: Verifying DashboardLayout has md:ml-72..."
if ! grep -q 'md:ml-72' "$DASHBOARD_LAYOUT"; then
  echo "FAIL: md:ml-72 not found in DashboardLayout.tsx"
  exit 1
fi
echo "PASS: DashboardLayout has proper sidebar margin"

# Test 6: Verify DashboardLayout has max-width constraint
echo "Test 6: Verifying DashboardLayout has max-w-7xl constraint..."
if ! grep -q 'max-w-7xl' "$DASHBOARD_LAYOUT"; then
  echo "FAIL: max-w-7xl not found in DashboardLayout.tsx"
  exit 1
fi
echo "PASS: DashboardLayout has max-w-7xl constraint"

# Test 7: Verify framer-motion is still used
echo "Test 7: Verifying framer-motion is still used..."
if ! grep -q "from 'framer-motion'" "$DASHBOARD_CLIENT"; then
  echo "FAIL: framer-motion import not found"
  exit 1
fi
echo "PASS: framer-motion is still used"

# Test 8: Verify client directive is present
echo "Test 8: Verifying 'use client' directive..."
if ! head -n 1 "$DASHBOARD_CLIENT" | grep -q "'use client'"; then
  echo "FAIL: 'use client' directive not found at top of file"
  exit 1
fi
echo "PASS: 'use client' directive present"

echo ""
echo "=========================================="
echo "All tests passed!"
echo "Dashboard padding issue #474 is fixed:"
echo "- DashboardClient.tsx uses w-full"
echo "- Content will utilize full available width"
echo "- DashboardLayout maintains proper constraints"
echo "=========================================="
