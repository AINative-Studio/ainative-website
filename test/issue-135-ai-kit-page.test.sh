#!/bin/bash
set -e

# Test script for Issue #135 - AI Kit Page Migration
# Tests the migrated AI Kit page from Vite SPA to Next.js App Router

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
echo "Issue #135: AI Kit Page Migration Tests"
echo "=========================================="
echo ""

# --- File Structure Tests ---
echo "--- File Structure Tests ---"

if [ -f "app/ai-kit/page.tsx" ]; then
  pass "AI Kit page exists at app/ai-kit/page.tsx"
else
  fail "AI Kit page missing at app/ai-kit/page.tsx"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ]; then
  pass "AIKitClient.tsx component exists"
else
  fail "AIKitClient.tsx component missing"
fi

# --- Metadata Tests ---
echo ""
echo "--- Metadata Tests ---"

if [ -f "app/ai-kit/page.tsx" ] && grep -q "export.*metadata" app/ai-kit/page.tsx; then
  pass "AI Kit page has metadata export"
else
  fail "AI Kit page missing metadata export"
fi

if [ -f "app/ai-kit/page.tsx" ] && grep -q "AI Kit" app/ai-kit/page.tsx; then
  pass "Page metadata includes 'AI Kit'"
else
  fail "Page metadata missing 'AI Kit'"
fi

if [ -f "app/ai-kit/page.tsx" ] && grep -q "description" app/ai-kit/page.tsx; then
  pass "AI Kit page has meta description"
else
  fail "AI Kit page missing meta description"
fi

if [ -f "app/ai-kit/page.tsx" ] && grep -q "openGraph" app/ai-kit/page.tsx; then
  pass "AI Kit page has OpenGraph metadata"
else
  fail "AI Kit page missing OpenGraph metadata"
fi

# --- Component Tests ---
echo ""
echo "--- Component Tests ---"

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "'use client'" app/ai-kit/AIKitClient.tsx; then
  pass "AIKitClient.tsx has 'use client' directive"
else
  fail "AIKitClient.tsx missing 'use client' directive"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "framer-motion" app/ai-kit/AIKitClient.tsx; then
  pass "AI Kit page uses framer-motion for animations"
else
  fail "AI Kit page missing framer-motion animations"
fi

# --- Package Tests ---
echo ""
echo "--- NPM Package Tests ---"

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "@ainative-studio/aikit-core" app/ai-kit/AIKitClient.tsx; then
  pass "Page includes @ainative-studio/aikit-core package"
else
  fail "Page missing @ainative-studio/aikit-core package"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "@ainative/ai-kit" app/ai-kit/AIKitClient.tsx; then
  pass "Page includes @ainative/ai-kit package"
else
  fail "Page missing @ainative/ai-kit package"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "@ainative/ai-kit-vue" app/ai-kit/AIKitClient.tsx; then
  pass "Page includes @ainative/ai-kit-vue package"
else
  fail "Page missing @ainative/ai-kit-vue package"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "@ainative/ai-kit-zerodb" app/ai-kit/AIKitClient.tsx; then
  pass "Page includes @ainative/ai-kit-zerodb package"
else
  fail "Page missing @ainative/ai-kit-zerodb package"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "@ainative/ai-kit-cli" app/ai-kit/AIKitClient.tsx; then
  pass "Page includes @ainative/ai-kit-cli package"
else
  fail "Page missing @ainative/ai-kit-cli package"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "@ainative/ai-kit-testing" app/ai-kit/AIKitClient.tsx; then
  pass "Page includes @ainative/ai-kit-testing package"
else
  fail "Page missing @ainative/ai-kit-testing package"
fi

# --- Features Tests ---
echo ""
echo "--- Feature Section Tests ---"

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "Production Ready" app/ai-kit/AIKitClient.tsx; then
  pass "Page mentions Production Ready feature"
else
  fail "Page missing Production Ready feature"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "Type Safe" app/ai-kit/AIKitClient.tsx; then
  pass "Page mentions Type Safe feature"
else
  fail "Page missing Type Safe feature"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "Framework Agnostic" app/ai-kit/AIKitClient.tsx; then
  pass "Page mentions Framework Agnostic feature"
else
  fail "Page missing Framework Agnostic feature"
fi

# --- Code Examples Tests ---
echo ""
echo "--- Code Examples Tests ---"

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "useAIChat" app/ai-kit/AIKitClient.tsx; then
  pass "Page has React useAIChat code example"
else
  fail "Page missing React useAIChat code example"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "ai-kit create" app/ai-kit/AIKitClient.tsx; then
  pass "Page has CLI code example"
else
  fail "Page missing CLI code example"
fi

# --- Category Filter Tests ---
echo ""
echo "--- Category Filter Tests ---"

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "selectedCategory" app/ai-kit/AIKitClient.tsx; then
  pass "Page has category filter state"
else
  fail "Page missing category filter state"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "filteredPackages" app/ai-kit/AIKitClient.tsx; then
  pass "Page filters packages by category"
else
  fail "Page missing package filtering"
fi

# --- CTA Tests ---
echo ""
echo "--- CTA Tests ---"

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "GitHub" app/ai-kit/AIKitClient.tsx; then
  pass "Page has GitHub CTA"
else
  fail "Page missing GitHub CTA"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "npmjs.com" app/ai-kit/AIKitClient.tsx; then
  pass "Page has NPM links"
else
  fail "Page missing NPM links"
fi

if [ -f "app/ai-kit/AIKitClient.tsx" ] && grep -q "npm install" app/ai-kit/AIKitClient.tsx; then
  pass "Page has install commands"
else
  fail "Page missing install commands"
fi

# --- Summary ---
echo ""
echo "=========================================="
echo "Test Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -gt 0 ]; then
  exit 1
fi
