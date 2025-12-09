#!/bin/bash
echo "==========================================
Issue #92: Agent Swarm Page Migration Tests
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

test_check "Agent Swarm page exists at app/agent-swarm/page.tsx" \
    "[ -f app/agent-swarm/page.tsx ]"

test_check "Agent Swarm client component exists" \
    "[ -f app/agent-swarm/AgentSwarmClient.tsx ]"

echo
echo "--- Server Component Tests ---"
echo

test_check "Page exports metadata for SEO" \
    "grep -q 'export const metadata' app/agent-swarm/page.tsx"

test_check "Metadata has title" \
    "grep -q 'title:' app/agent-swarm/page.tsx"

test_check "Page imports and renders AgentSwarmClient" \
    "grep -q 'AgentSwarmClient' app/agent-swarm/page.tsx"

echo
echo "--- Client Component Tests ---"
echo

test_check "Client component has 'use client' directive" \
    "grep -q \"'use client'\" app/agent-swarm/AgentSwarmClient.tsx"

test_check "Uses framer-motion for animations" \
    "grep -q 'framer-motion' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Uses Next.js Link (not react-router-dom)" \
    "grep -q \"from 'next/link'\" app/agent-swarm/AgentSwarmClient.tsx"

test_check "Does NOT use react-router-dom Link" \
    "! grep -q \"from 'react-router-dom'\" app/agent-swarm/AgentSwarmClient.tsx"

test_check "Does NOT use react-helmet-async" \
    "! grep -q 'react-helmet-async' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Uses lucide-react icons" \
    "grep -q 'lucide-react' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Uses Button component" \
    "grep -q 'Button' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Has pricing service integration" \
    "grep -q 'pricingService' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Has handleSubscribe function" \
    "grep -q 'handleSubscribe' app/agent-swarm/AgentSwarmClient.tsx"

echo
echo "--- Content Tests ---"
echo

test_check "Has Hero section" \
    "grep -q 'Hero Section' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Has How It Works section" \
    "grep -q 'How Agent Swarms Work' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Has AI Development Team section" \
    "grep -q 'Meet Your AI Development Team' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Has Pricing tiers" \
    "grep -q 'pricingTiers' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Has Agent Swarm pricing" \
    "grep -q 'Agent Swarm' app/agent-swarm/AgentSwarmClient.tsx"

test_check "Has Cody Agent pricing" \
    "grep -q 'Cody Agent' app/agent-swarm/AgentSwarmClient.tsx"

echo
echo "==========================================
Results: $PASS passed, $FAIL failed
==========================================
"
[ $FAIL -eq 0 ]
