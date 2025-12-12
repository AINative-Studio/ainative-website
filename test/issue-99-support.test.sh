#!/bin/bash
# Test script for Issue #99: Migrate Support Page
# Tests the Support page migration to Next.js App Router

echo "=========================================="
echo "Testing Issue #99: Support Page Migration"
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

echo "TEST: app/support/page.tsx exists"
if [ -f "app/support/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/support/SupportClient.tsx exists"
if [ -f "app/support/SupportClient.tsx" ]; then pass; else fail "File not found"; fi

# Server Component Tests
echo ""
echo "--- Server Component Tests ---"
echo ""

echo "TEST: page.tsx exports metadata"
if grep -q "export const metadata" app/support/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: page.tsx has title metadata"
if grep -q "title:" app/support/page.tsx; then pass; else fail "No title"; fi

echo "TEST: page.tsx has description metadata"
if grep -q "description:" app/support/page.tsx; then pass; else fail "No description"; fi

echo "TEST: page.tsx has openGraph metadata"
if grep -q "openGraph:" app/support/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: page.tsx has twitter metadata"
if grep -q "twitter:" app/support/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: page.tsx has canonical URL"
if grep -q "canonical:" app/support/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: page.tsx imports SupportClient"
if grep -q "import SupportClient" app/support/page.tsx; then pass; else fail "No client import"; fi

# Client Component Tests
echo ""
echo "--- Client Component Tests ---"
echo ""

echo "TEST: SupportClient has 'use client' directive"
if head -1 app/support/SupportClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: Uses Next.js Link"
if grep -q "from 'next/link'" app/support/SupportClient.tsx; then pass; else fail "Not using next/link"; fi

echo "TEST: No react-router-dom imports"
if ! grep -q "react-router-dom" app/support/SupportClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: Uses useState hook"
if grep -q "useState" app/support/SupportClient.tsx; then pass; else fail "No useState"; fi

echo "TEST: Uses Card component"
if grep -q "Card" app/support/SupportClient.tsx; then pass; else fail "No Card"; fi

echo "TEST: Uses Button component"
if grep -q "Button" app/support/SupportClient.tsx; then pass; else fail "No Button"; fi

# Content Tests
echo ""
echo "--- Content Tests ---"
echo ""

echo "TEST: Has Support Center title"
if grep -q "Support Center" app/support/SupportClient.tsx; then pass; else fail "No title"; fi

echo "TEST: Has Discord Community option"
if grep -q "Discord Community" app/support/SupportClient.tsx; then pass; else fail "No Discord"; fi

echo "TEST: Has Documentation option"
if grep -q "Documentation" app/support/SupportClient.tsx; then pass; else fail "No Documentation"; fi

echo "TEST: Has FAQ link"
if grep -q "/faq" app/support/SupportClient.tsx; then pass; else fail "No FAQ link"; fi

echo "TEST: Has GitHub Issues option"
if grep -q "GitHub Issues" app/support/SupportClient.tsx; then pass; else fail "No GitHub"; fi

echo "TEST: Has Email Support option"
if grep -q "Email Support" app/support/SupportClient.tsx; then pass; else fail "No Email"; fi

echo "TEST: Has Enterprise Support option"
if grep -q "Enterprise Support" app/support/SupportClient.tsx; then pass; else fail "No Enterprise"; fi

echo "TEST: Has contact form"
if grep -q "Submit a Support Request" app/support/SupportClient.tsx; then pass; else fail "No contact form"; fi

echo "TEST: Has name field"
if grep -q 'name="name"' app/support/SupportClient.tsx; then pass; else fail "No name field"; fi

echo "TEST: Has email field"
if grep -q 'name="email"' app/support/SupportClient.tsx; then pass; else fail "No email field"; fi

echo "TEST: Has subject field"
if grep -q 'name="subject"' app/support/SupportClient.tsx; then pass; else fail "No subject field"; fi

echo "TEST: Has message field"
if grep -q 'name="message"' app/support/SupportClient.tsx; then pass; else fail "No message field"; fi

echo "TEST: Has submit button"
if grep -q "Submit Support Request" app/support/SupportClient.tsx; then pass; else fail "No submit button"; fi

echo "TEST: Has success state"
if grep -q "Request Submitted" app/support/SupportClient.tsx; then pass; else fail "No success state"; fi

echo ""
echo "=========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi
