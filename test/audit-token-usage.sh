#!/bin/bash

# Issue #488: Dark Mode Token Usage Audit Script
#
# This script counts usages of design tokens across the codebase
# Target: 67+ usages (matching Vite source)

echo "========================================"
echo "Dark Mode Token Usage Audit"
echo "Issue #488: Design Token Migration"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to count pattern occurrences
count_pattern() {
  local pattern=$1
  local name=$2
  local count=$(grep -r "$pattern" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" app/ components/ 2>/dev/null | wc -l | tr -d ' ')

  echo -e "${name}: ${GREEN}${count}${NC} usages"
  return $count
}

echo "=== Dark Mode Tokens ==="
echo ""

# Dark-1 Token (Primary background #131726)
count_pattern "bg-dark-1\|surface-primary" "dark-1 (bg-dark-1 / surface-primary)"
DARK1=$?

# Dark-2 Token (Secondary surface #22263c)
count_pattern "bg-dark-2\|surface-secondary\|border-dark-2" "dark-2 (bg-dark-2 / surface-secondary)"
DARK2=$?

# Dark-3 Token (Accent surface #31395a)
count_pattern "bg-dark-3\|surface-accent\|border-dark-3" "dark-3 (bg-dark-3 / surface-accent)"
DARK3=$?

# Brand Primary Token
count_pattern "bg-brand-primary\|border-brand-primary\|text-brand-primary" "brand-primary"
BRANDPRIMARY=$?

echo ""
echo "=== Total Token Usage ==="
TOTAL=$((DARK1 + DARK2 + DARK3 + BRANDPRIMARY))
echo -e "Total design token usages: ${GREEN}${TOTAL}${NC}"

if [ $TOTAL -ge 67 ]; then
  echo -e "${GREEN}✓ SUCCESS: Met target of 67+ token usages!${NC}"
else
  echo -e "${YELLOW}⚠ WARNING: Only ${TOTAL}/67 token usages found. Need $((67 - TOTAL)) more.${NC}"
fi

echo ""
echo "=== Hardcoded Color Audit ==="

# Find remaining hardcoded colors
HARDCODED=$(grep -r "\[#[0-9A-Fa-f]\{6\}\]" --include="*.tsx" --include="*.ts" app/ components/ 2>/dev/null | grep -v "test" | wc -l | tr -d ' ')
echo -e "Remaining hardcoded hex colors: ${RED}${HARDCODED}${NC}"

if [ $HARDCODED -eq 0 ]; then
  echo -e "${GREEN}✓ SUCCESS: No hardcoded colors found!${NC}"
else
  echo -e "${YELLOW}⚠ WARNING: ${HARDCODED} hardcoded colors still exist.${NC}"
  echo ""
  echo "Top 10 files with hardcoded colors:"
  grep -r "\[#[0-9A-Fa-f]\{6\}\]" --include="*.tsx" --include="*.ts" app/ components/ 2>/dev/null | grep -v "test" | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
fi

echo ""
echo "=== Accessibility Check ==="

# Check for proper focus ring usage
FOCUS_RINGS=$(grep -r "focus-visible:ring" --include="*.tsx" --include="*.ts" app/ components/ 2>/dev/null | wc -l | tr -d ' ')
echo -e "Components with focus indicators: ${GREEN}${FOCUS_RINGS}${NC}"

echo ""
echo "========================================"
echo "Audit Complete"
echo "========================================"
