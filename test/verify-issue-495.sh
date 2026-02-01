#!/bin/bash
# Verification Script for Issue #495: Animation Variants
# This script verifies all animations are properly implemented

set -e

echo "================================================"
echo "Issue #495: Animation Variants - Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Helper functions
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
  fi
}

# 1. Verify animation keyframes exist in globals.css
echo "1. Checking animation keyframes in globals.css..."
grep -q "@keyframes gradient-shift" app/globals.css
check "gradient-shift keyframe defined"

grep -q "@keyframes shimmer" app/globals.css
check "shimmer keyframe defined"

grep -q "@keyframes pulse-glow" app/globals.css
check "pulse-glow keyframe defined"

grep -q "@keyframes float" app/globals.css
check "float keyframe defined"

grep -q "@keyframes stagger-in" app/globals.css
check "stagger-in keyframe defined"

grep -q "@keyframes fade-in" app/globals.css
check "fade-in keyframe defined"

grep -q "@keyframes slide-in" app/globals.css
check "slide-in keyframe defined"

grep -q "@keyframes accordion-down" app/globals.css
check "accordion-down keyframe defined"

grep -q "@keyframes accordion-up" app/globals.css
check "accordion-up keyframe defined"

echo ""

# 2. Verify animation utility classes exist
echo "2. Checking animation utility classes..."
grep -q ".animate-gradient-shift" app/globals.css
check "animate-gradient-shift class defined"

grep -q ".animate-shimmer" app/globals.css
check "animate-shimmer class defined"

grep -q ".animate-pulse-glow" app/globals.css
check "animate-pulse-glow class defined"

grep -q ".animate-float" app/globals.css
check "animate-float class defined"

grep -q ".animate-stagger-in" app/globals.css
check "animate-stagger-in class defined"

echo ""

# 3. Verify Tailwind config has animation definitions
echo "3. Checking Tailwind configuration..."
grep -q "'gradient-shift'" tailwind.config.ts
check "gradient-shift in Tailwind config"

grep -q "'shimmer'" tailwind.config.ts
check "shimmer in Tailwind config"

grep -q "'pulse-glow'" tailwind.config.ts
check "pulse-glow in Tailwind config"

grep -q "'float'" tailwind.config.ts
check "float in Tailwind config"

grep -q "'stagger-in'" tailwind.config.ts
check "stagger-in in Tailwind config"

echo ""

# 4. Verify prefers-reduced-motion media query exists
echo "4. Checking accessibility (prefers-reduced-motion)..."
grep -q "@media (prefers-reduced-motion: reduce)" app/globals.css
check "prefers-reduced-motion media query exists"

grep -q ".animate-gradient-shift" app/globals.css && grep -A 10 "@media (prefers-reduced-motion: reduce)" app/globals.css | grep -q "animate-gradient-shift"
check "gradient-shift respects reduced motion"

echo ""

# 5. Verify test file exists and runs
echo "5. Checking test suite..."
[ -f "test/issue-495-animations.test.tsx" ]
check "Test file exists"

npm test -- test/issue-495-animations.test.tsx --silent > /dev/null 2>&1
check "All tests passing"

echo ""

# 6. Verify documentation exists
echo "6. Checking documentation..."
[ -f "docs/animations.md" ]
check "Main documentation exists"

[ -f "docs/animations-quick-reference.md" ]
check "Quick reference exists"

[ -f "test/issue-495-summary.md" ]
check "Implementation summary exists"

echo ""

# 7. Verify showcase component exists
echo "7. Checking showcase component..."
[ -f "components/showcase/AnimationShowcase.tsx" ]
check "Showcase component exists"

[ -f "components/showcase/AnimationShowcase.stories.tsx" ]
check "Storybook stories exist"

[ -f "app/demo/animations/page.tsx" ]
check "Demo page exists"

echo ""

# 8. Verify specific animation implementations
echo "8. Verifying animation implementations..."

# Check gradient-shift has correct properties
grep -A 3 "@keyframes gradient-shift" app/globals.css | grep -q "background-position"
check "gradient-shift uses background-position"

# Check shimmer has transform
grep -A 3 "@keyframes shimmer" app/globals.css | grep -q "transform"
check "shimmer uses transform"

# Check pulse-glow has box-shadow
grep -A 5 "@keyframes pulse-glow" app/globals.css | grep -q "box-shadow"
check "pulse-glow uses box-shadow"

# Check float has translateY
grep -A 3 "@keyframes float" app/globals.css | grep -q "translateY"
check "float uses translateY"

echo ""

# Summary
echo "================================================"
echo "Summary"
echo "================================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Issue #495 is complete.${NC}"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Please review the output above.${NC}"
  exit 1
fi
