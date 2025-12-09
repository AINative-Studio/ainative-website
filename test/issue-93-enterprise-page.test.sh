#!/bin/bash
# Test script for Issue #93: Migrate Enterprise Page
# Tests the Enterprise page migration to Next.js App Router

echo "=========================================="
echo "Testing Issue #93: Enterprise Page Migration"
echo "=========================================="

PASSED=0
FAILED=0

pass() {
  echo "  ✓ PASSED"
  PASSED=$((PASSED + 1))
}

fail() {
  echo "  ✗ FAILED: $1"
  FAILED=$((FAILED + 1))
}

# File Structure Tests
echo ""
echo "--- File Structure Tests ---"
echo ""

echo "TEST: app/enterprise/page.tsx exists"
if [ -f "app/enterprise/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/enterprise/EnterpriseClient.tsx exists"
if [ -f "app/enterprise/EnterpriseClient.tsx" ]; then pass; else fail "File not found"; fi

# Server Component Tests
echo ""
echo "--- Server Component Tests ---"
echo ""

echo "TEST: page.tsx exports metadata"
if grep -q "export const metadata" app/enterprise/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: page.tsx has title metadata"
if grep -q "title:" app/enterprise/page.tsx; then pass; else fail "No title"; fi

echo "TEST: page.tsx has description metadata"
if grep -q "description:" app/enterprise/page.tsx; then pass; else fail "No description"; fi

echo "TEST: page.tsx has openGraph metadata"
if grep -q "openGraph:" app/enterprise/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: page.tsx has twitter metadata"
if grep -q "twitter:" app/enterprise/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: page.tsx has canonical URL"
if grep -q "canonical:" app/enterprise/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: page.tsx imports EnterpriseClient"
if grep -q "import EnterpriseClient" app/enterprise/page.tsx; then pass; else fail "No client import"; fi

# Client Component Tests
echo ""
echo "--- Client Component Tests ---"
echo ""

echo "TEST: EnterpriseClient has 'use client' directive"
if head -1 app/enterprise/EnterpriseClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: Uses Next.js Link instead of react-router-dom"
if grep -q "from 'next/link'" app/enterprise/EnterpriseClient.tsx; then pass; else fail "Not using next/link"; fi

echo "TEST: No react-router-dom imports"
if ! grep -q "react-router-dom" app/enterprise/EnterpriseClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: Uses appConfig for calendly URL"
if grep -q "appConfig.links.calendly" app/enterprise/EnterpriseClient.tsx; then pass; else fail "Not using appConfig"; fi

echo "TEST: Has framer-motion import"
if grep -q "from 'framer-motion'" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No framer-motion"; fi

# Content Tests
echo ""
echo "--- Content Tests ---"
echo ""

echo "TEST: Has Hero section with title"
if grep -q "Quantum-Enabled AI for Enterprise Teams" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No hero title"; fi

echo "TEST: Has Business Impact section"
if grep -q "Business Impact" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No business impact"; fi

echo "TEST: Has Cody Can Handle section"
if grep -q "Cody Can Handle" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No cody section"; fi

echo "TEST: Has Deployment Options section"
if grep -q "Deployment Options" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No deployment options"; fi

echo "TEST: Has Enterprise Security section"
if grep -q "Enterprise-Grade Security" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No security section"; fi

echo "TEST: Has Platform Capabilities section"
if grep -q "Platform Capabilities" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No capabilities section"; fi

echo "TEST: Has Schedule Demo CTA"
if grep -q "Schedule a Demo" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No demo CTA"; fi

echo "TEST: Has View Plans link"
if grep -q "View Plans" app/enterprise/EnterpriseClient.tsx; then pass; else fail "No plans link"; fi

echo ""
echo "=========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi
