#!/bin/bash
echo "==========================================
Issue #27: API Reference Page Migration Tests
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

test_check "API Reference page exists at app/api-reference/page.tsx" \
    "[ -f app/api-reference/page.tsx ]"

test_check "API Reference client component exists" \
    "[ -f app/api-reference/APIReferenceClient.tsx ]"

echo
echo "--- Server Component Tests ---"
echo

test_check "Page exports metadata for SEO" \
    "grep -q 'export const metadata' app/api-reference/page.tsx"

test_check "Metadata has title" \
    "grep -q 'title:' app/api-reference/page.tsx"

test_check "Page imports and renders APIReferenceClient" \
    "grep -q 'APIReferenceClient' app/api-reference/page.tsx"

echo
echo "--- Client Component Tests ---"
echo

test_check "Client component has 'use client' directive" \
    "grep -q \"'use client'\" app/api-reference/APIReferenceClient.tsx"

test_check "Uses framer-motion for animations" \
    "grep -q 'framer-motion' app/api-reference/APIReferenceClient.tsx"

test_check "Uses lucide-react icons" \
    "grep -q 'lucide-react' app/api-reference/APIReferenceClient.tsx"

test_check "Has useState hook" \
    "grep -q 'useState' app/api-reference/APIReferenceClient.tsx"

test_check "Has search functionality" \
    "grep -q 'searchQuery' app/api-reference/APIReferenceClient.tsx"

test_check "Has category filter" \
    "grep -q 'selectedCategory' app/api-reference/APIReferenceClient.tsx"

test_check "Has APIEndpoint interface" \
    "grep -q 'interface APIEndpoint' app/api-reference/APIReferenceClient.tsx"

test_check "Has endpoints data" \
    "grep -q 'endpoints:' app/api-reference/APIReferenceClient.tsx"

test_check "Has copy to clipboard function" \
    "grep -q 'copyToClipboard' app/api-reference/APIReferenceClient.tsx"

test_check "Has expandable endpoint details" \
    "grep -q 'expandedEndpoint' app/api-reference/APIReferenceClient.tsx"

echo
echo "--- Content Tests ---"
echo

test_check "Has ZeroDB Projects category" \
    "grep -q 'ZeroDB Projects' app/api-reference/APIReferenceClient.tsx"

test_check "Has Memory System category" \
    "grep -q 'Memory System' app/api-reference/APIReferenceClient.tsx"

test_check "Has Agent Swarm category" \
    "grep -q 'Agent Swarm' app/api-reference/APIReferenceClient.tsx"

test_check "Has code examples" \
    "grep -q 'Code Examples' app/api-reference/APIReferenceClient.tsx"

test_check "Has responses section" \
    "grep -q 'Responses' app/api-reference/APIReferenceClient.tsx"

echo
echo "==========================================
Results: $PASS passed, $FAIL failed
==========================================
"
[ $FAIL -eq 0 ]
