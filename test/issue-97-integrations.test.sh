#!/bin/bash
# Test script for Issue #97: Migrate Integrations Page
# Tests the Integrations page migration to Next.js App Router

echo "=========================================="
echo "Testing Issue #97: Integrations Page Migration"
echo "=========================================="

PASSED=0
FAILED=0

pass() {
  echo "  PASSED"
  PASSED=$((PASSED + 1))
}

fail() {
  echo "  FAILED: $1"
  FAILED=$((FAILED + 1))
}

# File Structure Tests
echo ""
echo "--- File Structure Tests ---"
echo ""

echo "TEST: app/integrations/page.tsx exists"
if [ -f "app/integrations/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/integrations/IntegrationsClient.tsx exists"
if [ -f "app/integrations/IntegrationsClient.tsx" ]; then pass; else fail "File not found"; fi

# Server Component Tests
echo ""
echo "--- Server Component Tests ---"
echo ""

echo "TEST: page.tsx exports metadata"
if grep -q "export const metadata" app/integrations/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: page.tsx has title metadata"
if grep -q "title:" app/integrations/page.tsx; then pass; else fail "No title"; fi

echo "TEST: page.tsx has description metadata"
if grep -q "description:" app/integrations/page.tsx; then pass; else fail "No description"; fi

echo "TEST: page.tsx has openGraph metadata"
if grep -q "openGraph:" app/integrations/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: page.tsx has twitter metadata"
if grep -q "twitter:" app/integrations/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: page.tsx has canonical URL"
if grep -q "canonical:" app/integrations/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: page.tsx imports IntegrationsClient"
if grep -q "import IntegrationsClient" app/integrations/page.tsx; then pass; else fail "No client import"; fi

# Client Component Tests
echo ""
echo "--- Client Component Tests ---"
echo ""

echo "TEST: IntegrationsClient has 'use client' directive"
if head -1 app/integrations/IntegrationsClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: Uses Next.js Link"
if grep -q "from 'next/link'" app/integrations/IntegrationsClient.tsx; then pass; else fail "Not using next/link"; fi

echo "TEST: No react-router-dom imports"
if ! grep -q "react-router-dom" app/integrations/IntegrationsClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: Has search state (setSearchQuery)"
if grep -q "setSearchQuery" app/integrations/IntegrationsClient.tsx; then pass; else fail "No search state"; fi

echo "TEST: Has category filter state"
if grep -q "setSelectedCategory" app/integrations/IntegrationsClient.tsx; then pass; else fail "No category filter"; fi

# Content Tests
echo ""
echo "--- Content Tests ---"
echo ""

echo "TEST: Has Hero section with Integrations title"
if grep -q "Integrations & Partnerships" app/integrations/IntegrationsClient.tsx; then pass; else fail "No title"; fi

echo "TEST: Has Featured Integrations section"
if grep -q "Featured Integrations" app/integrations/IntegrationsClient.tsx; then pass; else fail "No featured section"; fi

echo "TEST: Has Next.js integration"
if grep -q "Next.js" app/integrations/IntegrationsClient.tsx; then pass; else fail "No Next.js"; fi

echo "TEST: Has FastAPI integration"
if grep -q "FastAPI" app/integrations/IntegrationsClient.tsx; then pass; else fail "No FastAPI"; fi

echo "TEST: Has Supabase integration"
if grep -q "Supabase" app/integrations/IntegrationsClient.tsx; then pass; else fail "No Supabase"; fi

echo "TEST: Has Vercel integration"
if grep -q "Vercel" app/integrations/IntegrationsClient.tsx; then pass; else fail "No Vercel"; fi

echo "TEST: Has LangChain integration"
if grep -q "LangChain" app/integrations/IntegrationsClient.tsx; then pass; else fail "No LangChain"; fi

echo "TEST: Has search input"
if grep -q "Search integrations" app/integrations/IntegrationsClient.tsx; then pass; else fail "No search input"; fi

echo "TEST: Has Build Your Own Integration CTA"
if grep -q "Build Your Own Integration" app/integrations/IntegrationsClient.tsx; then pass; else fail "No CTA section"; fi

echo ""
echo "=========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi
