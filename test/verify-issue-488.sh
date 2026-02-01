#!/bin/bash

# Issue #488 Verification Script
# Verifies all acceptance criteria are met

echo "========================================"
echo "Issue #488: Verification Checklist"
echo "========================================"
echo ""

SUCCESS=0
WARNINGS=0
FAILURES=0

# Function to check file exists
check_file() {
  local file=$1
  local desc=$2
  if [ -f "$file" ]; then
    echo "✓ $desc"
    ((SUCCESS++))
  else
    echo "✗ FAIL: $desc not found"
    ((FAILURES++))
  fi
}

# Function to check pattern in file
check_pattern() {
  local file=$1
  local pattern=$2
  local desc=$3
  if grep -q "$pattern" "$file" 2>/dev/null; then
    echo "✓ $desc"
    ((SUCCESS++))
  else
    echo "✗ FAIL: $desc"
    ((FAILURES++))
  fi
}

echo "=== File Creation Checks ==="
check_file "tailwind.config.ts" "Tailwind config created"
check_file "test/issue-488-dark-mode-tokens.test.tsx" "Test suite created"
check_file "test/audit-token-usage.sh" "Audit script created"
check_file "docs/issue-488-implementation.md" "Implementation docs created"
check_file "docs/DESIGN-TOKENS-REFERENCE.md" "Token reference created"
echo ""

echo "=== Tailwind Config Checks ==="
check_pattern "tailwind.config.ts" "dark-1.*#131726" "dark-1 token defined"
check_pattern "tailwind.config.ts" "dark-2.*#22263c" "dark-2 token defined"
check_pattern "tailwind.config.ts" "dark-3.*#31395a" "dark-3 token defined"
check_pattern "tailwind.config.ts" "brand-primary.*#5867EF" "brand-primary token defined"
check_pattern "tailwind.config.ts" "surface-primary" "surface-primary alias defined"
echo ""

echo "=== Component Token Usage Checks ==="
check_pattern "components/ui/button.tsx" "bg-brand-primary" "Button uses brand-primary"
check_pattern "components/ui/button.tsx" "border-dark-2" "Button uses dark-2 for borders"
check_pattern "components/ui/card.tsx" "bg-dark-2" "Card uses dark-2 background"
check_pattern "components/ui/card.tsx" "border-dark-3" "Card uses dark-3 border"
check_pattern "components/layout/Header.tsx" "bg-dark-1" "Header uses dark-1"
check_pattern "components/layout/Sidebar.tsx" "bg-dark-1" "Sidebar uses dark-1"
echo ""

echo "=== Accessibility Checks ==="
check_pattern "components/ui/button.tsx" "focus-visible:ring" "Button has focus indicator"
check_pattern "components/ui/button-custom.tsx" "focus-visible:ring" "ButtonCustom has focus indicator"
echo ""

echo "=== Token Usage Count ==="
DARK1=$(grep -r "bg-dark-1\|surface-primary" --include="*.tsx" --include="*.ts" components/ app/ 2>/dev/null | wc -l | tr -d ' ')
DARK2=$(grep -r "bg-dark-2\|surface-secondary\|border-dark-2" --include="*.tsx" --include="*.ts" components/ app/ 2>/dev/null | wc -l | tr -d ' ')
DARK3=$(grep -r "bg-dark-3\|surface-accent\|border-dark-3" --include="*.tsx" --include="*.ts" components/ app/ 2>/dev/null | wc -l | tr -d ' ')
BRAND=$(grep -r "bg-brand-primary\|border-brand-primary\|text-brand-primary" --include="*.tsx" --include="*.ts" components/ app/ 2>/dev/null | wc -l | tr -d ' ')
TOTAL=$((DARK1 + DARK2 + DARK3 + BRAND))

echo "dark-1 usages: $DARK1"
echo "dark-2 usages: $DARK2"
echo "dark-3 usages: $DARK3"
echo "brand-primary usages: $BRAND"
echo "Total: $TOTAL"

if [ $TOTAL -ge 40 ]; then
  echo "✓ Token usage target met (40+ usages for core components)"
  ((SUCCESS++))
else
  echo "⚠ WARNING: Only $TOTAL token usages found"
  ((WARNINGS++))
fi
echo ""

echo "========================================"
echo "Summary:"
echo "  Passed: $SUCCESS"
echo "  Warnings: $WARNINGS"
echo "  Failed: $FAILURES"
echo "========================================"

if [ $FAILURES -eq 0 ]; then
  echo "✓ All critical checks passed!"
  exit 0
else
  echo "✗ Some checks failed. Review above."
  exit 1
fi
