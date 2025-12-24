#!/bin/bash
echo "================================================
Issue #213: Developer Resources Page Migration Tests
================================================
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

test_check "Dev Resources page exists at app/dev-resources/page.tsx" \
    "[ -f app/dev-resources/page.tsx ]"

test_check "Dev Resources client component exists" \
    "[ -f app/dev-resources/DevResourcesClient.tsx ]"

echo
echo "--- Server Component Tests ---"
echo

test_check "Page exports metadata for SEO" \
    "grep -q 'export const metadata' app/dev-resources/page.tsx"

test_check "Metadata has title" \
    "grep -q 'title:' app/dev-resources/page.tsx"

test_check "Metadata has description" \
    "grep -q 'description:' app/dev-resources/page.tsx"

test_check "Metadata includes developer keywords" \
    "grep -q 'developer resources' app/dev-resources/page.tsx"

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

test_check "Does NOT use react-helmet-async" \
    "! grep -q 'react-helmet-async' app/dev-resources/DevResourcesClient.tsx"

test_check "Uses lucide-react icons" \
    "grep -q 'lucide-react' app/dev-resources/DevResourcesClient.tsx"

test_check "Uses Button component" \
    "grep -q 'Button' app/dev-resources/DevResourcesClient.tsx"

test_check "Uses Card component" \
    "grep -q 'Card' app/dev-resources/DevResourcesClient.tsx"

test_check "Uses Tabs component" \
    "grep -q 'Tabs' app/dev-resources/DevResourcesClient.tsx"

echo
echo "--- Content Tests ---"
echo

test_check "Has search functionality" \
    "grep -q 'searchQuery' app/dev-resources/DevResourcesClient.tsx"

test_check "Has API Reference tab" \
    "grep -q 'API Reference' app/dev-resources/DevResourcesClient.tsx"

test_check "Has UI Design tab" \
    "grep -q 'UI Design' app/dev-resources/DevResourcesClient.tsx"

test_check "Has Developer Tools tab" \
    "grep -q 'Developer Tools' app/dev-resources/DevResourcesClient.tsx"

test_check "Has API endpoints data" \
    "grep -q 'apiEndpoints' app/dev-resources/DevResourcesClient.tsx"

test_check "Has developer tools data" \
    "grep -q 'developerTools' app/dev-resources/DevResourcesClient.tsx"

test_check "Has UI design resources" \
    "grep -q 'uiDesignResources' app/dev-resources/DevResourcesClient.tsx"

test_check "Has Core API section" \
    "grep -q 'Core API' app/dev-resources/DevResourcesClient.tsx"

test_check "Has Files API section" \
    "grep -q '\"Files\"' app/dev-resources/DevResourcesClient.tsx"

test_check "Has Assistants API section" \
    "grep -q 'Assistants' app/dev-resources/DevResourcesClient.tsx"

test_check "Has API Key CTA section" \
    "grep -q 'Get Your API Key' app/dev-resources/DevResourcesClient.tsx"

test_check "Has API key modal" \
    "grep -q 'ApiKeyModal' app/dev-resources/DevResourcesClient.tsx"

echo
echo "--- Component Tests ---"
echo

test_check "Has ApiSection component" \
    "grep -q 'const ApiSection' app/dev-resources/DevResourcesClient.tsx"

test_check "Has endpoint expansion functionality" \
    "grep -q 'expanded' app/dev-resources/DevResourcesClient.tsx"

test_check "Has filter functionality" \
    "grep -q 'filteredSections' app/dev-resources/DevResourcesClient.tsx"

test_check "Has filtered tools functionality" \
    "grep -q 'filteredTools' app/dev-resources/DevResourcesClient.tsx"

echo
echo "--- UI/UX Tests ---"
echo

test_check "Has sticky search header" \
    "grep -q 'sticky' app/dev-resources/DevResourcesClient.tsx"

test_check "Has search clear functionality" \
    "grep -q 'setSearchQuery' app/dev-resources/DevResourcesClient.tsx"

test_check "Has tab navigation" \
    "grep -q 'TabsList' app/dev-resources/DevResourcesClient.tsx"

test_check "Has no results state" \
    "grep -q 'No results found' app/dev-resources/DevResourcesClient.tsx"

test_check "Has badge counts" \
    "grep -q 'Badge' app/dev-resources/DevResourcesClient.tsx"

echo
echo "================================================
Results: $PASS passed, $FAIL failed
================================================
"
[ $FAIL -eq 0 ]
