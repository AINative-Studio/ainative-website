#!/bin/bash
# Test script for Issue #96: Migrate Getting Started Page
# Tests the Getting Started page migration to Next.js App Router

echo "=========================================="
echo "Testing Issue #96: Getting Started Page Migration"
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

echo "TEST: app/getting-started/page.tsx exists"
if [ -f "app/getting-started/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/getting-started/GettingStartedClient.tsx exists"
if [ -f "app/getting-started/GettingStartedClient.tsx" ]; then pass; else fail "File not found"; fi

# Server Component Tests
echo ""
echo "--- Server Component Tests ---"
echo ""

echo "TEST: page.tsx exports metadata"
if grep -q "export const metadata" app/getting-started/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: page.tsx has title metadata"
if grep -q "title:" app/getting-started/page.tsx; then pass; else fail "No title"; fi

echo "TEST: page.tsx has description metadata"
if grep -q "description:" app/getting-started/page.tsx; then pass; else fail "No description"; fi

echo "TEST: page.tsx has openGraph metadata"
if grep -q "openGraph:" app/getting-started/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: page.tsx has twitter metadata"
if grep -q "twitter:" app/getting-started/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: page.tsx has canonical URL"
if grep -q "canonical:" app/getting-started/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: page.tsx imports GettingStartedClient"
if grep -q "import GettingStartedClient" app/getting-started/page.tsx; then pass; else fail "No client import"; fi

# Client Component Tests
echo ""
echo "--- Client Component Tests ---"
echo ""

echo "TEST: GettingStartedClient has 'use client' directive"
if head -1 app/getting-started/GettingStartedClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: Uses Next.js Link"
if grep -q "from 'next/link'" app/getting-started/GettingStartedClient.tsx; then pass; else fail "Not using next/link"; fi

echo "TEST: No react-router-dom imports"
if ! grep -q "react-router-dom" app/getting-started/GettingStartedClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: Uses appConfig for external URLs"
if grep -q "appConfig.links" app/getting-started/GettingStartedClient.tsx; then pass; else fail "Not using appConfig"; fi

echo "TEST: Has useState for copiedCode"
if grep -q "setCopiedCode" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No copiedCode state"; fi

echo "TEST: Has useState for activeTab"
if grep -q "setActiveTab" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No activeTab state"; fi

# Content Tests
echo ""
echo "--- Content Tests ---"
echo ""

echo "TEST: Has Hero section with Getting Started title"
if grep -q "Getting Started with AINative" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No Getting Started title"; fi

echo "TEST: Has 4 Steps to Success section"
if grep -q "4 Steps to Success" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No steps section"; fi

echo "TEST: Has Python SDK install command"
if grep -q "pip install ainative-sdk" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No Python install"; fi

echo "TEST: Has TypeScript SDK install command"
if grep -q "npm install @ainative/sdk" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No TypeScript install"; fi

echo "TEST: Has Go SDK install command"
if grep -q "go get github.com/ainative/go-sdk" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No Go install"; fi

echo "TEST: Has Core Features section"
if grep -q "Core Features" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No Core Features"; fi

echo "TEST: Has Vector Database feature"
if grep -q "Vector Database" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No Vector Database"; fi

echo "TEST: Has Memory System feature"
if grep -q "Memory System" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No Memory System"; fi

echo "TEST: Has Agent Swarm feature"
if grep -q "Agent Swarm" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No Agent Swarm"; fi

echo "TEST: Has Support section with Discord link"
if grep -q "Join Discord Community" app/getting-started/GettingStartedClient.tsx; then pass; else fail "No Discord CTA"; fi

echo ""
echo "=========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi
