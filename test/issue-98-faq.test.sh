#!/bin/bash
# Test script for Issue #98: Migrate FAQ Page
# Tests the FAQ page migration to Next.js App Router

echo "=========================================="
echo "Testing Issue #98: FAQ Page Migration"
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

echo "TEST: app/faq/page.tsx exists"
if [ -f "app/faq/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/faq/FAQClient.tsx exists"
if [ -f "app/faq/FAQClient.tsx" ]; then pass; else fail "File not found"; fi

# Server Component Tests
echo ""
echo "--- Server Component Tests ---"
echo ""

echo "TEST: page.tsx exports metadata"
if grep -q "export const metadata" app/faq/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: page.tsx has title metadata"
if grep -q "title:" app/faq/page.tsx; then pass; else fail "No title"; fi

echo "TEST: page.tsx has description metadata"
if grep -q "description:" app/faq/page.tsx; then pass; else fail "No description"; fi

echo "TEST: page.tsx has openGraph metadata"
if grep -q "openGraph:" app/faq/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: page.tsx has twitter metadata"
if grep -q "twitter:" app/faq/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: page.tsx has canonical URL"
if grep -q "canonical:" app/faq/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: page.tsx imports FAQClient"
if grep -q "import FAQClient" app/faq/page.tsx; then pass; else fail "No client import"; fi

# Client Component Tests
echo ""
echo "--- Client Component Tests ---"
echo ""

echo "TEST: FAQClient has 'use client' directive"
if head -1 app/faq/FAQClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: Uses Next.js Link"
if grep -q "from 'next/link'" app/faq/FAQClient.tsx; then pass; else fail "Not using next/link"; fi

echo "TEST: No react-router-dom imports"
if ! grep -q "react-router-dom" app/faq/FAQClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: Uses Accordion component"
if grep -q "Accordion" app/faq/FAQClient.tsx; then pass; else fail "No Accordion"; fi

echo "TEST: Uses AccordionItem component"
if grep -q "AccordionItem" app/faq/FAQClient.tsx; then pass; else fail "No AccordionItem"; fi

echo "TEST: Uses AccordionTrigger component"
if grep -q "AccordionTrigger" app/faq/FAQClient.tsx; then pass; else fail "No AccordionTrigger"; fi

echo "TEST: Uses AccordionContent component"
if grep -q "AccordionContent" app/faq/FAQClient.tsx; then pass; else fail "No AccordionContent"; fi

# Content Tests
echo ""
echo "--- Content Tests ---"
echo ""

echo "TEST: Has FAQ page title"
if grep -q "Frequently Asked Questions" app/faq/FAQClient.tsx; then pass; else fail "No title"; fi

echo "TEST: Has Getting Started category"
if grep -q "Getting Started" app/faq/FAQClient.tsx; then pass; else fail "No Getting Started category"; fi

echo "TEST: Has Pricing & Billing category"
if grep -q "Pricing & Billing" app/faq/FAQClient.tsx; then pass; else fail "No Pricing category"; fi

echo "TEST: Has Security & Privacy category"
if grep -q "Security & Privacy" app/faq/FAQClient.tsx; then pass; else fail "No Security category"; fi

echo "TEST: Has Technical Support category"
if grep -q "Technical Support" app/faq/FAQClient.tsx; then pass; else fail "No Support category"; fi

echo "TEST: Has Products & Features category"
if grep -q "Products & Features" app/faq/FAQClient.tsx; then pass; else fail "No Products category"; fi

echo "TEST: Has Contact Support button"
if grep -q "Contact Support" app/faq/FAQClient.tsx; then pass; else fail "No support button"; fi

echo "TEST: Has Documentation link"
if grep -q "View Documentation" app/faq/FAQClient.tsx; then pass; else fail "No docs link"; fi

echo "TEST: Has AI Kit question"
if grep -q "AI Kit" app/faq/FAQClient.tsx; then pass; else fail "No AI Kit content"; fi

echo "TEST: Has ZeroDB question"
if grep -q "ZeroDB" app/faq/FAQClient.tsx; then pass; else fail "No ZeroDB content"; fi

echo ""
echo "=========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi
