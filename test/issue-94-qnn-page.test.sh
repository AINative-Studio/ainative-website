#!/bin/bash
# Test script for Issue #94: Migrate QNN Product Page
# Tests the QNN page migration to Next.js App Router

echo "=========================================="
echo "Testing Issue #94: QNN Product Page Migration"
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

echo "TEST: app/products/qnn/page.tsx exists"
if [ -f "app/products/qnn/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/products/qnn/QNNClient.tsx exists"
if [ -f "app/products/qnn/QNNClient.tsx" ]; then pass; else fail "File not found"; fi

# Server Component Tests
echo ""
echo "--- Server Component Tests ---"
echo ""

echo "TEST: page.tsx exports metadata"
if grep -q "export const metadata" app/products/qnn/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: page.tsx has title metadata"
if grep -q "title:" app/products/qnn/page.tsx; then pass; else fail "No title"; fi

echo "TEST: page.tsx has description metadata"
if grep -q "description:" app/products/qnn/page.tsx; then pass; else fail "No description"; fi

echo "TEST: page.tsx has openGraph metadata"
if grep -q "openGraph:" app/products/qnn/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: page.tsx has twitter metadata"
if grep -q "twitter:" app/products/qnn/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: page.tsx has canonical URL"
if grep -q "canonical:" app/products/qnn/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: page.tsx imports QNNClient"
if grep -q "import QNNClient" app/products/qnn/page.tsx; then pass; else fail "No client import"; fi

# Client Component Tests
echo ""
echo "--- Client Component Tests ---"
echo ""

echo "TEST: QNNClient has 'use client' directive"
if head -1 app/products/qnn/QNNClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: Uses Next.js Link"
if grep -q "from 'next/link'" app/products/qnn/QNNClient.tsx; then pass; else fail "Not using next/link"; fi

echo "TEST: No react-router-dom imports"
if ! grep -q "react-router-dom" app/products/qnn/QNNClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: Uses appConfig for calendly URL"
if grep -q "appConfig.links.calendly" app/products/qnn/QNNClient.tsx; then pass; else fail "Not using appConfig"; fi

# Content Tests
echo ""
echo "--- Content Tests ---"
echo ""

echo "TEST: Has Hero section with QNN title"
if grep -q "Quantum Neural Networks" app/products/qnn/QNNClient.tsx; then pass; else fail "No QNN title"; fi

echo "TEST: Has Value Pillars section"
if grep -q "Quantum-Enhanced Speed" app/products/qnn/QNNClient.tsx; then pass; else fail "No value pillars"; fi

echo "TEST: Has Platform Features section"
if grep -q "Platform Features" app/products/qnn/QNNClient.tsx; then pass; else fail "No platform features"; fi

echo "TEST: Has Industry Applications section"
if grep -q "Industry Applications" app/products/qnn/QNNClient.tsx; then pass; else fail "No industry apps"; fi

echo "TEST: Has How QNN Works section"
if grep -q "How QNN Works" app/products/qnn/QNNClient.tsx; then pass; else fail "No how it works"; fi

echo "TEST: Has Superposition explanation"
if grep -q "Superposition" app/products/qnn/QNNClient.tsx; then pass; else fail "No superposition"; fi

echo "TEST: Has Entanglement explanation"
if grep -q "Entanglement" app/products/qnn/QNNClient.tsx; then pass; else fail "No entanglement"; fi

echo "TEST: Has Infrastructure section"
if grep -q "Infrastructure" app/products/qnn/QNNClient.tsx; then pass; else fail "No infrastructure"; fi

echo "TEST: Has Schedule Demo CTA"
if grep -q "Schedule a Demo" app/products/qnn/QNNClient.tsx; then pass; else fail "No demo CTA"; fi

echo ""
echo "=========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi
