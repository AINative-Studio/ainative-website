#!/bin/bash
set -e

# Test script for Issue #137 - ZeroDB Product Page
# Tests the ZeroDB product landing page migration

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
echo "Issue #137: ZeroDB Product Page Tests"
echo "=========================================="
echo ""

# --- File Structure Tests ---
echo "--- File Structure Tests ---"

if [ -f "app/products/zerodb/page.tsx" ]; then
  pass "ZeroDB page exists at app/products/zerodb/page.tsx"
else
  fail "ZeroDB page missing at app/products/zerodb/page.tsx"
fi

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ]; then
  pass "ZeroDBClient.tsx component exists"
else
  fail "ZeroDBClient.tsx component missing"
fi

# --- Metadata Tests ---
echo ""
echo "--- Metadata Tests ---"

if [ -f "app/products/zerodb/page.tsx" ] && grep -q "export.*metadata" app/products/zerodb/page.tsx; then
  pass "ZeroDB page has metadata export"
else
  fail "ZeroDB page missing metadata export"
fi

if [ -f "app/products/zerodb/page.tsx" ] && grep -q "ZeroDB" app/products/zerodb/page.tsx; then
  pass "Page metadata includes 'ZeroDB'"
else
  fail "Page metadata missing 'ZeroDB'"
fi

if [ -f "app/products/zerodb/page.tsx" ] && grep -q "description" app/products/zerodb/page.tsx; then
  pass "Page has meta description"
else
  fail "Page missing meta description"
fi

if [ -f "app/products/zerodb/page.tsx" ] && grep -q "openGraph" app/products/zerodb/page.tsx; then
  pass "Page has OpenGraph metadata"
else
  fail "Page missing OpenGraph metadata"
fi

# --- Component Tests ---
echo ""
echo "--- Component Tests ---"

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "'use client'" app/products/zerodb/ZeroDBClient.tsx; then
  pass "ZeroDBClient.tsx has 'use client' directive"
else
  fail "ZeroDBClient.tsx missing 'use client' directive"
fi

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "framer-motion" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page uses framer-motion for animations"
else
  fail "Page missing framer-motion animations"
fi

# --- Content Tests ---
echo ""
echo "--- Content Tests ---"

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "vector" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page mentions vector database features"
else
  fail "Page missing vector database features"
fi

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "semantic" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page mentions semantic search"
else
  fail "Page missing semantic search"
fi

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "embed" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page mentions embeddings"
else
  fail "Page missing embeddings feature"
fi

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q -i "api\|sdk" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page mentions API/SDK"
else
  fail "Page missing API/SDK references"
fi

# --- Feature Section Tests ---
echo ""
echo "--- Feature Section Tests ---"

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "Database\|Shield\|Zap\|Code" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page uses lucide icons for features"
else
  fail "Page missing lucide icons"
fi

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "performance\|speed\|fast" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page highlights performance benefits"
else
  fail "Page missing performance benefits"
fi

# --- CTA Tests ---
echo ""
echo "--- CTA Tests ---"

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "Get Started\|Start Free\|Try" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page has 'Get Started' CTA"
else
  fail "Page missing 'Get Started' CTA"
fi

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "Documentation\|Docs\|Learn" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page has documentation CTA"
else
  fail "Page missing documentation CTA"
fi

# --- Code Example Tests ---
echo ""
echo "--- Code Example Tests ---"

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q "import\|const\|async" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page includes code examples"
else
  fail "Page missing code examples"
fi

# --- Pricing Section Tests ---
echo ""
echo "--- Pricing Section Tests ---"

if [ -f "app/products/zerodb/ZeroDBClient.tsx" ] && grep -q -i "free\|pricing\|tier" app/products/zerodb/ZeroDBClient.tsx; then
  pass "Page mentions pricing tiers"
else
  fail "Page missing pricing information"
fi

# --- Summary ---
echo ""
echo "=========================================="
echo "Test Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -gt 0 ]; then
  exit 1
fi
