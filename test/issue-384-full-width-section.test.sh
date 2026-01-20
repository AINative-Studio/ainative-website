#!/bin/bash

# Test script for Issue #384: Full-Width Section utility class implementation
# This script verifies the implementation and usage of .full-width-section classes

set -e

echo "=================================="
echo "Issue #384: Full-Width Section Test"
echo "=================================="
echo ""

PASS=0
FAIL=0
WARNINGS=0

# Test function
test_check() {
  if [ $? -eq 0 ]; then
    echo "✅ PASS: $1"
    ((PASS++))
  else
    echo "❌ FAIL: $1"
    ((FAIL++))
  fi
}

test_warning() {
  echo "⚠️  WARNING: $1"
  ((WARNINGS++))
}

# Test 1: Verify .full-width-section class exists in globals.css
echo "Test 1: Checking for .full-width-section in globals.css..."
grep -q "\.full-width-section {" app/globals.css
test_check ".full-width-section base class exists"

# Test 2: Verify all padding variants exist
echo ""
echo "Test 2: Checking for padding variants..."
grep -q "\.full-width-section-sm {" app/globals.css
test_check ".full-width-section-sm variant exists"

grep -q "\.full-width-section-md {" app/globals.css
test_check ".full-width-section-md variant exists"

grep -q "\.full-width-section-lg {" app/globals.css
test_check ".full-width-section-lg variant exists"

grep -q "\.full-width-section-xl {" app/globals.css
test_check ".full-width-section-xl variant exists"

# Test 3: Verify responsive breakpoints for variants
echo ""
echo "Test 3: Checking for responsive breakpoints..."
grep -q "@media (min-width: 768px)" app/globals.css
test_check "Tablet breakpoint (768px) exists"

grep -q "@media (min-width: 1024px)" app/globals.css
test_check "Desktop breakpoint (1024px) exists"

# Test 4: Verify usage in HomeClient.tsx
echo ""
echo "Test 4: Checking HomeClient.tsx usage..."
grep -q "full-width-section" app/HomeClient.tsx
test_check "HomeClient.tsx uses full-width-section classes"

# Count usages
HOME_USAGE=$(grep -c "full-width-section" app/HomeClient.tsx || echo "0")
echo "   Found $HOME_USAGE usage(s) in HomeClient.tsx"

# Test 5: Verify usage in EnterpriseClient.tsx
echo ""
echo "Test 5: Checking EnterpriseClient.tsx usage..."
grep -q "full-width-section" app/enterprise/EnterpriseClient.tsx
test_check "EnterpriseClient.tsx uses full-width-section classes"

# Test 6: Verify usage in AgentSwarmClient.tsx
echo ""
echo "Test 6: Checking AgentSwarmClient.tsx usage..."
grep -q "full-width-section" app/agent-swarm/AgentSwarmClient.tsx
test_check "AgentSwarmClient.tsx uses full-width-section classes"

SWARM_USAGE=$(grep -c "full-width-section" app/agent-swarm/AgentSwarmClient.tsx || echo "0")
echo "   Found $SWARM_USAGE usage(s) in AgentSwarmClient.tsx"

# Test 7: Verify usage in PricingClient.tsx
echo ""
echo "Test 7: Checking PricingClient.tsx usage..."
grep -q "full-width-section" app/pricing/PricingClient.tsx
test_check "PricingClient.tsx uses full-width-section classes"

# Test 8: Verify usage in ZeroDBClient.tsx
echo ""
echo "Test 8: Checking ZeroDBClient.tsx usage..."
grep -q "full-width-section" app/products/zerodb/ZeroDBClient.tsx
test_check "ZeroDBClient.tsx uses full-width-section classes"

# Test 9: Check for proper nesting with container-custom
echo ""
echo "Test 9: Verifying proper nesting patterns..."

# Look for pattern: full-width-section followed by container-custom
if grep -A 5 "full-width-section" app/HomeClient.tsx | grep -q "container-custom"; then
  echo "✅ PASS: HomeClient.tsx properly nests container-custom"
  ((PASS++))
else
  echo "⚠️  WARNING: HomeClient.tsx may not properly nest container-custom"
  ((WARNINGS++))
fi

# Test 10: Verify documentation exists
echo ""
echo "Test 10: Checking for documentation..."
if [ -f "docs/design-system/full-width-section.md" ]; then
  echo "✅ PASS: Documentation file exists"
  ((PASS++))
else
  echo "❌ FAIL: Documentation file not found"
  ((FAIL++))
fi

# Test 11: Verify no conflicting overflow styles
echo ""
echo "Test 11: Checking for style conflicts..."

# Check that sections using full-width-section don't also use overflow-hidden
CONFLICT_COUNT=$(grep -E "full-width-section.*overflow-hidden" app/HomeClient.tsx app/enterprise/EnterpriseClient.tsx app/agent-swarm/AgentSwarmClient.tsx 2>/dev/null | wc -l || echo "0")

if [ "$CONFLICT_COUNT" -gt 0 ]; then
  test_warning "Found $CONFLICT_COUNT potential overflow style conflicts (may be intentional)"
else
  echo "✅ PASS: No overflow style conflicts detected"
  ((PASS++))
fi

# Test 12: Check for removed manual py-* classes
echo ""
echo "Test 12: Checking for migration from manual padding..."

# Count sections that still use py-* with bg-* (potential migration candidates)
MANUAL_PADDING=$(grep -E "section className=.*py-[0-9]+.*bg-" app/HomeClient.tsx app/enterprise/EnterpriseClient.tsx app/agent-swarm/AgentSwarmClient.tsx 2>/dev/null | wc -l || echo "0")

if [ "$MANUAL_PADDING" -gt 0 ]; then
  test_warning "Found $MANUAL_PADDING sections with manual padding (may need migration)"
else
  echo "✅ PASS: No manual padding patterns found (clean migration)"
  ((PASS++))
fi

# Test 13: Verify CSS properties
echo ""
echo "Test 13: Checking CSS property completeness..."

# Check for required properties in base class
if grep -A 3 "\.full-width-section {" app/globals.css | grep -q "width: 100%"; then
  echo "✅ PASS: Base class has width: 100%"
  ((PASS++))
else
  echo "❌ FAIL: Base class missing width: 100%"
  ((FAIL++))
fi

if grep -A 3 "\.full-width-section {" app/globals.css | grep -q "position: relative"; then
  echo "✅ PASS: Base class has position: relative"
  ((PASS++))
else
  echo "❌ FAIL: Base class missing position: relative"
  ((FAIL++))
fi

if grep -A 3 "\.full-width-section {" app/globals.css | grep -q "overflow: hidden"; then
  echo "✅ PASS: Base class has overflow: hidden"
  ((PASS++))
else
  echo "❌ FAIL: Base class missing overflow: hidden"
  ((FAIL++))
fi

# Summary
echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo "✅ Passed:  $PASS"
echo "❌ Failed:  $FAIL"
echo "⚠️  Warnings: $WARNINGS"
echo ""

TOTAL=$((PASS + FAIL))
PERCENTAGE=$((PASS * 100 / TOTAL))

echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All critical tests passed!"
  echo ""
  echo "Next Steps:"
  echo "1. Run 'npm run dev' and visually test responsive behavior"
  echo "2. Test on mobile (375px), tablet (768px), and desktop (1024px+)"
  echo "3. Verify backgrounds span full width"
  echo "4. Check that content is properly contained"
  echo "5. Review /docs/design-system/full-width-section.md"
  exit 0
else
  echo "❌ Some tests failed. Please review and fix."
  exit 1
fi
