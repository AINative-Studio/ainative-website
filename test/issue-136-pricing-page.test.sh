#!/bin/bash
set -e

# Test script for Issue #136 - Pricing Page Migration
# Tests the migrated Pricing page from Vite SPA to Next.js App Router

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
echo "Issue #136: Pricing Page Migration Tests"
echo "=========================================="
echo ""

# --- File Structure Tests ---
echo "--- File Structure Tests ---"

if [ -f "app/pricing/page.tsx" ]; then
  pass "Pricing page exists at app/pricing/page.tsx"
else
  fail "Pricing page missing at app/pricing/page.tsx"
fi

if [ -f "app/pricing/PricingClient.tsx" ]; then
  pass "PricingClient.tsx component exists"
else
  fail "PricingClient.tsx component missing"
fi

# --- Metadata Tests ---
echo ""
echo "--- Metadata Tests ---"

if [ -f "app/pricing/page.tsx" ] && grep -q "export.*metadata" app/pricing/page.tsx; then
  pass "Pricing page has metadata export"
else
  fail "Pricing page missing metadata export"
fi

if [ -f "app/pricing/page.tsx" ] && grep -q "Pricing" app/pricing/page.tsx; then
  pass "Page metadata includes 'Pricing'"
else
  fail "Page metadata missing 'Pricing'"
fi

if [ -f "app/pricing/page.tsx" ] && grep -q "description" app/pricing/page.tsx; then
  pass "Pricing page has meta description"
else
  fail "Pricing page missing meta description"
fi

# --- Component Tests ---
echo ""
echo "--- Component Tests ---"

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "'use client'" app/pricing/PricingClient.tsx; then
  pass "PricingClient.tsx has 'use client' directive"
else
  fail "PricingClient.tsx missing 'use client' directive"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "framer-motion" app/pricing/PricingClient.tsx; then
  pass "Pricing page uses framer-motion for animations"
else
  fail "Pricing page missing framer-motion animations"
fi

# --- Pricing Tiers Tests ---
echo ""
echo "--- Pricing Tiers Tests ---"

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "Free" app/pricing/PricingClient.tsx; then
  pass "Page displays Free tier"
else
  fail "Page missing Free tier"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "Pro" app/pricing/PricingClient.tsx; then
  pass "Page displays Pro tier"
else
  fail "Page missing Pro tier"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "Teams" app/pricing/PricingClient.tsx; then
  pass "Page displays Teams tier"
else
  fail "Page missing Teams tier"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "Enterprise" app/pricing/PricingClient.tsx; then
  pass "Page displays Enterprise tier"
else
  fail "Page missing Enterprise tier"
fi

# --- Features Tests ---
echo ""
echo "--- Features Tests ---"

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "completions" app/pricing/PricingClient.tsx; then
  pass "Page mentions completions feature"
else
  fail "Page missing completions feature"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "support" app/pricing/PricingClient.tsx; then
  pass "Page mentions support feature"
else
  fail "Page missing support feature"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "SSO" app/pricing/PricingClient.tsx; then
  pass "Page mentions SSO feature for Teams"
else
  fail "Page missing SSO feature"
fi

# --- CTA Tests ---
echo ""
echo "--- CTA Tests ---"

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "Get Started" app/pricing/PricingClient.tsx; then
  pass "Page has 'Get Started' CTA"
else
  fail "Page missing 'Get Started' CTA"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "Contact Sales" app/pricing/PricingClient.tsx; then
  pass "Page has 'Contact Sales' CTA for Enterprise"
else
  fail "Page missing 'Contact Sales' CTA"
fi

# --- Stripe Integration Tests ---
echo ""
echo "--- Stripe Integration Tests ---"

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "priceId" app/pricing/PricingClient.tsx; then
  pass "Page references Stripe price IDs"
else
  fail "Page missing Stripe price ID references"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "handlePlanClick" app/pricing/PricingClient.tsx; then
  pass "Page has plan click handler for Stripe checkout"
else
  fail "Page missing plan click handler"
fi

# --- UI Elements Tests ---
echo ""
echo "--- UI Elements Tests ---"

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "Check" app/pricing/PricingClient.tsx; then
  pass "Page uses Check icons for features"
else
  fail "Page missing Check icons"
fi

if [ -f "app/pricing/PricingClient.tsx" ] && grep -q "highlight" app/pricing/PricingClient.tsx; then
  pass "Page has highlighted plan styling"
else
  fail "Page missing highlighted plan styling"
fi

# --- Summary ---
echo ""
echo "=========================================="
echo "Test Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -gt 0 ]; then
  exit 1
fi
