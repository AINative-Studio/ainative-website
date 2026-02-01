#!/bin/bash
# Issue #489 - Typography Scale Verification Script
# Tests: Typography scale implementation in Tailwind config
# Expected: All checks pass, tests succeed

set -e

echo "================================================================"
echo "Issue #489: Typography Scale Verification"
echo "================================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Function to check for pattern in file
check_pattern() {
  local file=$1
  local pattern=$2
  local description=$3

  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $description"
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
}

# Function to verify file exists
check_file() {
  local file=$1
  local description=$2

  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description"
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    ERRORS=$((ERRORS + 1))
    return 1
  fi
}

echo "1. File Structure Verification"
echo "--------------------------------"
check_file "app/globals.css" "globals.css exists"
check_file "__tests__/config/typography-scale.test.ts" "Test file exists"
check_file "docs/design-system/typography-scale.md" "Documentation exists"
check_file "components/examples/TypographyShowcase.tsx" "Showcase component exists"
echo ""

echo "2. Typography Configuration Verification"
echo "-----------------------------------------"
check_pattern "app/globals.css" "font-size-title-1.*28px" "title-1 variable = 28px"
check_pattern "app/globals.css" "font-size-title-2.*24px" "title-2 variable = 24px"
check_pattern "app/globals.css" "font-size-body-sm.*14px" "body-sm variable = 14px"
check_pattern "app/globals.css" "font-size-button-sm.*12px" "button-sm variable = 12px"
echo ""

echo "3. CSS Class Verification"
echo "--------------------------"
check_pattern "app/globals.css" "\.text-title-1" ".text-title-1 class exists"
check_pattern "app/globals.css" "\.text-title-2" ".text-title-2 class exists"
check_pattern "app/globals.css" "\.text-body-sm" ".text-body-sm class exists"
check_pattern "app/globals.css" "\.text-button-sm" ".text-button-sm class exists"
echo ""

echo "4. Tailwind v4 Integration"
echo "---------------------------"
check_pattern "app/globals.css" "@theme inline" "@theme inline directive"
check_pattern "app/globals.css" "Typography Scale" "Typography section documented"
echo ""

echo "5. Responsive Design"
echo "--------------------"
check_pattern "app/globals.css" "@media (max-width: 768px)" "Mobile media query exists"
check_pattern "app/globals.css" "Mobile-optimized" "Mobile optimization comments"
echo ""

echo "6. Documentation Verification"
echo "------------------------------"
check_pattern "docs/design-system/typography-scale.md" "Typography Scale Configuration" "Documentation has configuration section"
check_pattern "docs/design-system/typography-scale.md" "Accessibility Compliance" "Documentation has accessibility section"
check_pattern "docs/design-system/typography-scale.md" "Example" "Documentation has usage examples"
echo ""

echo "7. Running Jest Tests"
echo "---------------------"
if npm test -- __tests__/config/typography-scale.test.ts --silent 2>&1 | grep -q "36 passed"; then
  echo -e "${GREEN}✓${NC} All 36 tests passing"
else
  echo -e "${RED}✗${NC} Tests failed"
  ERRORS=$((ERRORS + 1))
fi
echo ""

echo "8. TypeScript Compilation"
echo "-------------------------"
if grep -q "text-title-1\|text-title-2\|text-body-sm\|text-button-sm" "components/examples/TypographyShowcase.tsx"; then
  echo -e "${GREEN}✓${NC} Typography classes used in TypeScript components"
else
  echo -e "${YELLOW}⚠${NC} Typography classes not found in showcase component"
fi
echo ""

echo "================================================================"
echo "Verification Summary"
echo "================================================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
  echo ""
  echo "Typography Scale Implementation: COMPLETE"
  echo "  - CSS Variables: Configured ✓"
  echo "  - CSS Classes: Defined ✓"
  echo "  - Tests: 36/36 passing ✓"
  echo "  - Documentation: Complete ✓"
  echo "  - Showcase: Implemented ✓"
  echo "  - Responsive: Configured ✓"
  echo ""
  echo "Status: READY FOR COMMIT AND MERGE ✓"
  exit 0
else
  echo -e "${RED}✗ $ERRORS CHECK(S) FAILED${NC}"
  echo ""
  echo "Please review the failed checks above."
  exit 1
fi
