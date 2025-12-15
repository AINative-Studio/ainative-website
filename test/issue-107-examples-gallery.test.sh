#!/bin/bash
# Test script for Issue #107: Migrate Examples Gallery Page
# TDD Approach: RED phase - these tests should fail initially

echo "========================================"
echo "Issue #107: Examples Gallery Page Tests"
echo "========================================"

PASS=0
FAIL=0

check() {
  local description="$1"
  local condition="$2"

  if eval "$condition"; then
    echo "[PASS] $description"
    ((PASS++))
  else
    echo "[FAIL] $description"
    ((FAIL++))
  fi
}

cd /home/quaid/Documents/Projects/ainative-studio/src/ainative-nextjs

echo ""
echo "--- File Structure Tests ---"

# Test 1: Examples page exists
check "app/examples/page.tsx exists" \
  "[ -f app/examples/page.tsx ]"

# Test 2: Examples client component exists
check "app/examples/ExamplesClient.tsx exists" \
  "[ -f app/examples/ExamplesClient.tsx ]"

echo ""
echo "--- Page Component Tests ---"

# Test 3: Server component has metadata
check "Page has Metadata export" \
  "grep -q 'export const metadata: Metadata' app/examples/page.tsx 2>/dev/null"

# Test 4: Page has proper title
check "Metadata has Examples Gallery title" \
  "grep -q 'Examples' app/examples/page.tsx 2>/dev/null && grep -q 'title' app/examples/page.tsx 2>/dev/null"

# Test 5: Page imports client component
check "Page imports ExamplesClient" \
  "grep -q 'ExamplesClient' app/examples/page.tsx 2>/dev/null"

echo ""
echo "--- Client Component Tests ---"

# Test 6: Client component has 'use client' directive
check "ExamplesClient has 'use client' directive" \
  "head -5 app/examples/ExamplesClient.tsx 2>/dev/null | grep -q \"'use client'\""

# Test 7: Has Example interface/type
check "ExamplesClient has Example type definition" \
  "grep -qE '(interface Example|type Example)' app/examples/ExamplesClient.tsx 2>/dev/null"

# Test 8: Has mock examples data
check "ExamplesClient has examples array" \
  "grep -qE '(const examples|mockExamples)' app/examples/ExamplesClient.tsx 2>/dev/null"

# Test 9: Has search query state
check "ExamplesClient has searchQuery state" \
  "grep -q 'searchQuery' app/examples/ExamplesClient.tsx 2>/dev/null"

# Test 10: Has category filter state
check "ExamplesClient has selectedCategory state" \
  "grep -q 'selectedCategory' app/examples/ExamplesClient.tsx 2>/dev/null"

# Test 11: Has language filter state
check "ExamplesClient has selectedLanguage state" \
  "grep -q 'selectedLanguage' app/examples/ExamplesClient.tsx 2>/dev/null"

# Test 12: Has difficulty level display
check "ExamplesClient has difficulty level" \
  "grep -q 'difficulty' app/examples/ExamplesClient.tsx 2>/dev/null"

# Test 13: Has code preview functionality
check "ExamplesClient has code preview" \
  "grep -q 'preview' app/examples/ExamplesClient.tsx 2>/dev/null"

# Test 14: Has copy to clipboard functionality
check "ExamplesClient has copy to clipboard" \
  "grep -qE '(copyToClipboard|clipboard|Copy)' app/examples/ExamplesClient.tsx 2>/dev/null"

# Test 15: Has estimated time display
check "ExamplesClient has estimatedTime" \
  "grep -q 'estimatedTime' app/examples/ExamplesClient.tsx 2>/dev/null"

echo ""
echo "--- Build Tests ---"

# Test 16: TypeScript compilation succeeds (build does this check)
check "TypeScript compiles without errors" \
  "npx tsc --noEmit 2>/dev/null || npm run build 2>/dev/null"

# Test 17: Build succeeds
check "Next.js build succeeds" \
  "npm run build 2>/dev/null"

# Test 18: Examples route in build output
check "Examples route exists in build" \
  "npm run build 2>/dev/null && grep -q '/examples' .next/server/app-paths-manifest.json 2>/dev/null"

echo ""
echo "========================================"
echo "Results: $PASS passed, $FAIL failed"
echo "========================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
