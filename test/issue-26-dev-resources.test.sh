#!/bin/bash
echo "==========================================
Issue #26: Dev Resources Page Migration Tests
==========================================
"
PASS=0
FAIL=0

test_check() {
    echo "TEST: $1"
    if eval "$2"; then
        echo "  ✓ PASSED"
        ((PASS++))
    else
        echo "  ✗ FAILED"
        ((FAIL++))
    fi
}

echo "--- File Structure Tests ---"
echo

test_check "Dev resources page exists at app/dev-resources/page.tsx" \
    "[ -f app/dev-resources/page.tsx ]"

test_check "Dev resources client component exists" \
    "[ -f app/dev-resources/DevResourcesClient.tsx ]"

echo
echo "--- Server Component Tests ---"
echo

test_check "Page exports metadata for SEO" \
    "grep -q 'export const metadata' app/dev-resources/page.tsx"

test_check "Metadata has title" \
    "grep -q 'title:' app/dev-resources/page.tsx"

test_check "Page imports and renders DevResourcesClient" \
    "grep -q 'DevResourcesClient' app/dev-resources/page.tsx"

echo
echo "--- Client Component Tests ---"
echo

test_check "Client component has 'use client' directive" \
    "grep -q \"'use client'\" app/dev-resources/DevResourcesClient.tsx"

test_check "Uses framer-motion for animations" \
    "grep -q 'framer-motion' app/dev-resources/DevResourcesClient.tsx"

test_check "Uses Next.js Link (not react-router-dom)" \
    "grep -q \"from 'next/link'\" app/dev-resources/DevResourcesClient.tsx"

test_check "Does NOT use react-router-dom Link" \
    "! grep -q \"from 'react-router-dom'\" app/dev-resources/DevResourcesClient.tsx"

test_check "Uses lucide-react icons" \
    "grep -q 'lucide-react' app/dev-resources/DevResourcesClient.tsx"

test_check "Has Tabs component" \
    "grep -q 'Tabs' app/dev-resources/DevResourcesClient.tsx"

test_check "Has search functionality (Input)" \
    "grep -q 'Input' app/dev-resources/DevResourcesClient.tsx"

test_check "Has developerTools array" \
    "grep -q 'developerTools' app/dev-resources/DevResourcesClient.tsx"

test_check "Has apiEndpoints data" \
    "grep -q 'apiEndpoints' app/dev-resources/DevResourcesClient.tsx"

test_check "Has ApiSection component" \
    "grep -q 'ApiSection' app/dev-resources/DevResourcesClient.tsx"

test_check "Uses Badge component" \
    "grep -q 'Badge' app/dev-resources/DevResourcesClient.tsx"

test_check "Uses Card components" \
    "grep -q 'Card' app/dev-resources/DevResourcesClient.tsx"

test_check "Uses Button component" \
    "grep -q 'Button' app/dev-resources/DevResourcesClient.tsx"

echo
echo "--- Content Tests ---"
echo

test_check "Has API Reference tab" \
    "grep -q 'API Reference' app/dev-resources/DevResourcesClient.tsx"

test_check "Has Developer Tools tab" \
    "grep -q 'Developer Tools' app/dev-resources/DevResourcesClient.tsx"

test_check "Has SDK Quick Start section" \
    "grep -q 'SDK Quick Start' app/dev-resources/DevResourcesClient.tsx"

test_check "Has Authentication endpoints" \
    "grep -q 'authentication' app/dev-resources/DevResourcesClient.tsx"

test_check "Has ZeroDB endpoints" \
    "grep -q 'ZeroDB' app/dev-resources/DevResourcesClient.tsx"

echo
echo "==========================================
Results: $PASS passed, $FAIL failed
==========================================
"
[ $FAIL -eq 0 ]
