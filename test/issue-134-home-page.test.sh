#!/bin/bash
set -e

# Test script for Issue #134 - Home Page Migration
# Tests the migrated home page from Vite SPA to Next.js App Router

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
echo "Issue #134: Home Page Migration Tests"
echo "=========================================="
echo ""

# --- File Structure Tests ---
echo "--- File Structure Tests ---"

if [ -f "app/page.tsx" ]; then
  pass "Home page exists at app/page.tsx"
else
  fail "Home page missing at app/page.tsx"
fi

if [ -f "app/HomeClient.tsx" ]; then
  pass "HomeClient.tsx component exists"
else
  fail "HomeClient.tsx component missing"
fi

# --- Metadata Tests ---
echo ""
echo "--- Metadata Tests ---"

if [ -f "app/page.tsx" ] && grep -q "export.*metadata" app/page.tsx; then
  pass "Home page has metadata export"
else
  fail "Home page missing metadata export"
fi

if [ -f "app/page.tsx" ] && grep -q "AI Native" app/page.tsx; then
  pass "Home page metadata includes 'AI Native'"
else
  fail "Home page metadata missing 'AI Native'"
fi

if [ -f "app/page.tsx" ] && grep -q "description" app/page.tsx; then
  pass "Home page has meta description"
else
  fail "Home page missing meta description"
fi

# --- Component Tests ---
echo ""
echo "--- Component Tests ---"

if [ -f "app/HomeClient.tsx" ] && grep -q "'use client'" app/HomeClient.tsx; then
  pass "HomeClient.tsx has 'use client' directive"
else
  fail "HomeClient.tsx missing 'use client' directive"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "framer-motion" app/HomeClient.tsx; then
  pass "Home page uses framer-motion for animations"
else
  fail "Home page missing framer-motion animations"
fi

# --- Hero Section Tests ---
echo ""
echo "--- Hero Section Tests ---"

if [ -f "app/HomeClient.tsx" ] && grep -q "AnimatedTargetText" app/HomeClient.tsx; then
  pass "Home page has AnimatedTargetText component"
else
  fail "Home page missing AnimatedTargetText component"
fi

if [ -f "app/HomeClient.tsx" ] && grep -qE "Founders|Developers|Builders" app/HomeClient.tsx; then
  pass "AnimatedTargetText has target audience words"
else
  fail "AnimatedTargetText missing target audience words"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "Download" app/HomeClient.tsx; then
  pass "Home page has Download CTA button"
else
  fail "Home page missing Download CTA button"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "GitHub" app/HomeClient.tsx; then
  pass "Home page has GitHub link"
else
  fail "Home page missing GitHub link"
fi

# --- FREE Embeddings Section Tests ---
echo ""
echo "--- FREE Embeddings Section Tests ---"

if [ -f "app/HomeClient.tsx" ] && grep -q "FREE Embeddings" app/HomeClient.tsx; then
  pass "Home page has FREE Embeddings API section"
else
  fail "Home page missing FREE Embeddings API section"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "OpenAI-compatible" app/HomeClient.tsx; then
  pass "Home page mentions OpenAI compatibility"
else
  fail "Home page missing OpenAI compatibility mention"
fi

# --- ZeroDB Section Tests ---
echo ""
echo "--- ZeroDB Section Tests ---"

if [ -f "app/HomeClient.tsx" ] && grep -q "ZeroDB" app/HomeClient.tsx; then
  pass "Home page has ZeroDB section"
else
  fail "Home page missing ZeroDB section"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "Vector Database" app/HomeClient.tsx; then
  pass "Home page mentions Vector Database feature"
else
  fail "Home page missing Vector Database feature"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "Agent Memory" app/HomeClient.tsx; then
  pass "Home page mentions Agent Memory feature"
else
  fail "Home page missing Agent Memory feature"
fi

# --- Platform Features Section Tests ---
echo ""
echo "--- Platform Features Section Tests ---"

if [ -f "app/HomeClient.tsx" ] && grep -q "Platform Features" app/HomeClient.tsx; then
  pass "Home page has Platform Features section"
else
  fail "Home page missing Platform Features section"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "AI-Powered IDE" app/HomeClient.tsx; then
  pass "Home page mentions AI-Powered IDE"
else
  fail "Home page missing AI-Powered IDE feature"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "AI Kit" app/HomeClient.tsx; then
  pass "Home page mentions AI Kit"
else
  fail "Home page missing AI Kit feature"
fi

# --- Why Choose Section Tests ---
echo ""
echo "--- Why Choose Section Tests ---"

if [ -f "app/HomeClient.tsx" ] && grep -q "Why Choose" app/HomeClient.tsx; then
  pass "Home page has Why Choose section"
else
  fail "Home page missing Why Choose section"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "Memory-Powered Agents" app/HomeClient.tsx; then
  pass "Home page mentions Memory-Powered Agents"
else
  fail "Home page missing Memory-Powered Agents"
fi

# --- Navigation Links Tests ---
echo ""
echo "--- Navigation Links Tests ---"

if [ -f "app/HomeClient.tsx" ] && grep -q "/download" app/HomeClient.tsx; then
  pass "Home page links to /download"
else
  fail "Home page missing /download link"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "/signup" app/HomeClient.tsx; then
  pass "Home page links to /signup"
else
  fail "Home page missing /signup link"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "/ai-kit" app/HomeClient.tsx; then
  pass "Home page links to /ai-kit"
else
  fail "Home page missing /ai-kit link"
fi

if [ -f "app/HomeClient.tsx" ] && grep -q "/community" app/HomeClient.tsx; then
  pass "Home page links to /community"
else
  fail "Home page missing /community link"
fi

# --- Summary ---
echo ""
echo "=========================================="
echo "Test Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -gt 0 ]; then
  exit 1
fi
