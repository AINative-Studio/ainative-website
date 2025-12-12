#!/bin/bash
# Test script for Issue #100: Migrate Legal Pages (Privacy & Terms)
# Tests the Privacy and Terms pages migration to Next.js App Router

echo "=========================================="
echo "Testing Issue #100: Legal Pages Migration"
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

# ========================================
# Privacy Page Tests
# ========================================
echo ""
echo "--- Privacy Page File Structure Tests ---"
echo ""

echo "TEST: app/privacy/page.tsx exists"
if [ -f "app/privacy/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/privacy/PrivacyClient.tsx exists"
if [ -f "app/privacy/PrivacyClient.tsx" ]; then pass; else fail "File not found"; fi

echo ""
echo "--- Privacy Page Server Component Tests ---"
echo ""

echo "TEST: Privacy page.tsx exports metadata"
if grep -q "export const metadata" app/privacy/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: Privacy page.tsx has title metadata"
if grep -q "title:" app/privacy/page.tsx; then pass; else fail "No title"; fi

echo "TEST: Privacy page.tsx has description metadata"
if grep -q "description:" app/privacy/page.tsx; then pass; else fail "No description"; fi

echo "TEST: Privacy page.tsx has openGraph metadata"
if grep -q "openGraph:" app/privacy/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: Privacy page.tsx has twitter metadata"
if grep -q "twitter:" app/privacy/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: Privacy page.tsx has canonical URL"
if grep -q "canonical:" app/privacy/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: Privacy page.tsx imports PrivacyClient"
if grep -q "import PrivacyClient" app/privacy/page.tsx; then pass; else fail "No client import"; fi

echo ""
echo "--- Privacy Page Client Component Tests ---"
echo ""

echo "TEST: PrivacyClient has 'use client' directive"
if head -1 app/privacy/PrivacyClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: PrivacyClient uses Next.js Link"
if grep -q "from 'next/link'" app/privacy/PrivacyClient.tsx; then pass; else fail "Not using next/link"; fi

echo "TEST: PrivacyClient no react-router-dom imports"
if ! grep -q "react-router-dom" app/privacy/PrivacyClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: PrivacyClient uses lucide-react icons"
if grep -q "from 'lucide-react'" app/privacy/PrivacyClient.tsx; then pass; else fail "Not using lucide-react"; fi

echo "TEST: PrivacyClient uses Framer Motion"
if grep -q "from 'framer-motion'" app/privacy/PrivacyClient.tsx; then pass; else fail "No Framer Motion"; fi

echo ""
echo "--- Privacy Page Content Tests ---"
echo ""

echo "TEST: Has Privacy Policy title"
if grep -q "Privacy Policy" app/privacy/PrivacyClient.tsx; then pass; else fail "No title"; fi

echo "TEST: Has Information We Collect section"
if grep -q "Information We Collect" app/privacy/PrivacyClient.tsx; then pass; else fail "No collection section"; fi

echo "TEST: Has How We Use section"
if grep -q "How We Use" app/privacy/PrivacyClient.tsx; then pass; else fail "No usage section"; fi

echo "TEST: Has Your Privacy Rights section"
if grep -q "Your Privacy Rights" app/privacy/PrivacyClient.tsx; then pass; else fail "No rights section"; fi

echo "TEST: Has Data Security section"
if grep -q "Data Security" app/privacy/PrivacyClient.tsx; then pass; else fail "No security section"; fi

echo "TEST: Has GDPR compliance mention"
if grep -q "GDPR" app/privacy/PrivacyClient.tsx; then pass; else fail "No GDPR mention"; fi

echo "TEST: Has CCPA compliance mention"
if grep -q "CCPA" app/privacy/PrivacyClient.tsx; then pass; else fail "No CCPA mention"; fi

echo "TEST: Has link to Terms of Service"
if grep -q "/terms" app/privacy/PrivacyClient.tsx; then pass; else fail "No terms link"; fi

# ========================================
# Terms Page Tests
# ========================================
echo ""
echo "--- Terms Page File Structure Tests ---"
echo ""

echo "TEST: app/terms/page.tsx exists"
if [ -f "app/terms/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/terms/TermsClient.tsx exists"
if [ -f "app/terms/TermsClient.tsx" ]; then pass; else fail "File not found"; fi

echo ""
echo "--- Terms Page Server Component Tests ---"
echo ""

echo "TEST: Terms page.tsx exports metadata"
if grep -q "export const metadata" app/terms/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: Terms page.tsx has title metadata"
if grep -q "title:" app/terms/page.tsx; then pass; else fail "No title"; fi

echo "TEST: Terms page.tsx has description metadata"
if grep -q "description:" app/terms/page.tsx; then pass; else fail "No description"; fi

echo "TEST: Terms page.tsx has openGraph metadata"
if grep -q "openGraph:" app/terms/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: Terms page.tsx has twitter metadata"
if grep -q "twitter:" app/terms/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: Terms page.tsx has canonical URL"
if grep -q "canonical:" app/terms/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: Terms page.tsx imports TermsClient"
if grep -q "import TermsClient" app/terms/page.tsx; then pass; else fail "No client import"; fi

echo ""
echo "--- Terms Page Client Component Tests ---"
echo ""

echo "TEST: TermsClient has 'use client' directive"
if head -1 app/terms/TermsClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: TermsClient uses Next.js Link"
if grep -q "from 'next/link'" app/terms/TermsClient.tsx; then pass; else fail "Not using next/link"; fi

echo "TEST: TermsClient no react-router-dom imports"
if ! grep -q "react-router-dom" app/terms/TermsClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: TermsClient uses lucide-react icons"
if grep -q "from 'lucide-react'" app/terms/TermsClient.tsx; then pass; else fail "Not using lucide-react"; fi

echo "TEST: TermsClient uses Framer Motion"
if grep -q "from 'framer-motion'" app/terms/TermsClient.tsx; then pass; else fail "No Framer Motion"; fi

echo ""
echo "--- Terms Page Content Tests ---"
echo ""

echo "TEST: Has Terms of Service title"
if grep -q "Terms of Service" app/terms/TermsClient.tsx; then pass; else fail "No title"; fi

echo "TEST: Has Acceptance of Terms section"
if grep -q "Acceptance of Terms" app/terms/TermsClient.tsx; then pass; else fail "No acceptance section"; fi

echo "TEST: Has Use License section"
if grep -q "Use License" app/terms/TermsClient.tsx; then pass; else fail "No license section"; fi

echo "TEST: Has User Accounts section"
if grep -q "User Accounts" app/terms/TermsClient.tsx; then pass; else fail "No accounts section"; fi

echo "TEST: Has Intellectual Property section"
if grep -q "Intellectual Property" app/terms/TermsClient.tsx; then pass; else fail "No IP section"; fi

echo "TEST: Has Limitation of Liability section"
if grep -q "Limitation of Liability" app/terms/TermsClient.tsx; then pass; else fail "No liability section"; fi

echo "TEST: Has Changes to Terms section"
if grep -q "Changes to Terms" app/terms/TermsClient.tsx; then pass; else fail "No changes section"; fi

echo "TEST: Has Contact Us section"
if grep -q "Contact Us" app/terms/TermsClient.tsx; then pass; else fail "No contact section"; fi

echo "TEST: Has link to Privacy Policy"
if grep -q "/privacy" app/terms/TermsClient.tsx; then pass; else fail "No privacy link"; fi

echo ""
echo "=========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi
