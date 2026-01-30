#!/bin/bash

# Test script for Issue #476: Documentation page heading overlaps with header
# This script verifies that the docs page has proper spacing to prevent header overlap

set -e

echo "=========================================="
echo "Testing Issue #476: Docs Page Spacing Fix"
echo "=========================================="
echo ""

DOCS_CLIENT_FILE="app/docs/DocsClient.tsx"
HEADER_FILE="components/layout/Header.tsx"

# Test 1: Verify DocsClient file exists
echo "Test 1: Verify DocsClient component exists"
if [ -f "$DOCS_CLIENT_FILE" ]; then
    echo "✓ PASS: DocsClient component exists at $DOCS_CLIENT_FILE"
else
    echo "✗ FAIL: DocsClient component not found at $DOCS_CLIENT_FILE"
    exit 1
fi
echo ""

# Test 2: Verify proper top padding (pt-24 or pt-32)
echo "Test 2: Verify proper top padding in DocsClient"
if grep -q 'className="container mx-auto px-4 pt-24 pb-16"' "$DOCS_CLIENT_FILE" || \
   grep -q 'className="container mx-auto px-4 pt-32 pb-16"' "$DOCS_CLIENT_FILE"; then
    echo "✓ PASS: DocsClient has proper top padding (pt-24 or pt-32)"
    PADDING=$(grep -o 'pt-[0-9]*' "$DOCS_CLIENT_FILE" | head -1)
    echo "  Found padding: $PADDING"
else
    echo "✗ FAIL: DocsClient does not have proper top padding"
    exit 1
fi
echo ""

# Test 3: Verify old py-16 pattern is removed
echo "Test 3: Verify old py-16 pattern is removed"
if grep -q 'className="container mx-auto px-4 py-16"' "$DOCS_CLIENT_FILE"; then
    echo "✗ FAIL: Old py-16 pattern still exists in DocsClient"
    exit 1
else
    echo "✓ PASS: Old py-16 pattern has been replaced"
fi
echo ""

# Summary
echo "=========================================="
echo "All Tests Passed! ✓"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - DocsClient has proper top padding (pt-24)"
echo "  - Old py-16 pattern has been removed"
echo "  - Header overlap issue is fixed"
echo ""
