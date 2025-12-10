#!/bin/bash
# Test script for Issue #95: Migrate Download Page
# Tests the Download page migration to Next.js App Router

echo "=========================================="
echo "Testing Issue #95: Download Page Migration"
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

echo "TEST: app/download/page.tsx exists"
if [ -f "app/download/page.tsx" ]; then pass; else fail "File not found"; fi

echo "TEST: app/download/DownloadClient.tsx exists"
if [ -f "app/download/DownloadClient.tsx" ]; then pass; else fail "File not found"; fi

# Server Component Tests
echo ""
echo "--- Server Component Tests ---"
echo ""

echo "TEST: page.tsx exports metadata"
if grep -q "export const metadata" app/download/page.tsx; then pass; else fail "No metadata export"; fi

echo "TEST: page.tsx has title metadata"
if grep -q "title:" app/download/page.tsx; then pass; else fail "No title"; fi

echo "TEST: page.tsx has description metadata"
if grep -q "description:" app/download/page.tsx; then pass; else fail "No description"; fi

echo "TEST: page.tsx has openGraph metadata"
if grep -q "openGraph:" app/download/page.tsx; then pass; else fail "No openGraph"; fi

echo "TEST: page.tsx has twitter metadata"
if grep -q "twitter:" app/download/page.tsx; then pass; else fail "No twitter"; fi

echo "TEST: page.tsx has canonical URL"
if grep -q "canonical:" app/download/page.tsx; then pass; else fail "No canonical"; fi

echo "TEST: page.tsx imports DownloadClient"
if grep -q "import DownloadClient" app/download/page.tsx; then pass; else fail "No client import"; fi

# Client Component Tests
echo ""
echo "--- Client Component Tests ---"
echo ""

echo "TEST: DownloadClient has 'use client' directive"
if head -1 app/download/DownloadClient.tsx | grep -q "'use client'"; then pass; else fail "No use client"; fi

echo "TEST: No react-router-dom imports"
if ! grep -q "react-router-dom" app/download/DownloadClient.tsx; then pass; else fail "Still using react-router-dom"; fi

echo "TEST: Uses appConfig for GitHub link"
if grep -q "appConfig.links.github" app/download/DownloadClient.tsx; then pass; else fail "Not using appConfig"; fi

# Content Tests
echo ""
echo "--- Content Tests ---"
echo ""

echo "TEST: Has Hero section with Download title"
if grep -q "Download AI Native Studio" app/download/DownloadClient.tsx; then pass; else fail "No Download title"; fi

echo "TEST: Has macOS Silicon download"
if grep -q "macOS Silicon" app/download/DownloadClient.tsx; then pass; else fail "No macOS Silicon"; fi

echo "TEST: Has macOS Intel download"
if grep -q "macOS Intel" app/download/DownloadClient.tsx; then pass; else fail "No macOS Intel"; fi

echo "TEST: Has Windows download"
if grep -q "Windows" app/download/DownloadClient.tsx; then pass; else fail "No Windows"; fi

echo "TEST: Has Linux Debian download"
if grep -q "Linux Debian" app/download/DownloadClient.tsx; then pass; else fail "No Linux Debian"; fi

echo "TEST: Has Linux RPM download"
if grep -q "Linux RPM" app/download/DownloadClient.tsx; then pass; else fail "No Linux RPM"; fi

echo "TEST: Has Linux AppImage download"
if grep -q "Linux AppImage" app/download/DownloadClient.tsx; then pass; else fail "No Linux AppImage"; fi

echo "TEST: Has GitHub section"
if grep -q "Open Source & Community" app/download/DownloadClient.tsx; then pass; else fail "No GitHub section"; fi

echo "TEST: Has IDE Plugins section"
if grep -q "IDE Plugins" app/download/DownloadClient.tsx; then pass; else fail "No plugins section"; fi

echo "TEST: Has What's Inside section"
if grep -q "What" app/download/DownloadClient.tsx; then pass; else fail "No features section"; fi

echo "TEST: Has LLM Provider Support section"
if grep -q "LLM Provider Support" app/download/DownloadClient.tsx; then pass; else fail "No LLM section"; fi

echo ""
echo "=========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
  exit 1
fi
