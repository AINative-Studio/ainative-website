#!/bin/bash

# Script to create GitHub issues for critical dashboard component migration
# Usage: ./scripts/create-migration-issues.sh [--dry-run]

set -e

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
  echo "DRY RUN MODE - No issues will be created"
  echo ""
fi

# Check for gh CLI
if ! command -v gh >/dev/null 2>&1; then
  echo "Error: GitHub CLI (gh) not installed"
  echo "Install: brew install gh"
  exit 1
fi

# Critical components to migrate (from audit results)
declare -a COMPONENTS=(
  "OverviewTab:43:Core dashboard overview tab with stats, quick actions, and activity feed"
  "AgentSwarmInteractiveDashboard:42:Primary interactive agent swarm dashboard UI"
  "QuickActionsGrid:38:Quick actions grid used in overview and other tabs"
  "RecentActivityFeed:37:Recent activity feed component for dashboard"
  "AIKitTab:36:AI Kit features tab with component showcase"
  "PaymentHistoryTable:34:Payment history table for billing tab"
  "ActionModals:32:Shared modal system for tools and actions"
  "ToolsTab:32:Tools dashboard tab with developer actions"
  "QNNTab:31:Quantum Neural Network dashboard tab"
  "BillingTab:28:Billing and subscription management tab"
  "PlanSummaryCard:28:Subscription plan summary card"
  "AgentSwarmFileManager:27:File manager component for agent swarm"
  "AgentSwarmTab:26:Agent swarm dashboard tab"
  "CreditUsageTrend:25:Credit usage trend visualization chart"
  "QuickActionCard:25:Individual quick action card component"
  "ZeroDBTab:21:ZeroDB database features dashboard tab"
)

ISSUE_COUNT=0
CREATED_ISSUES=()

echo "=== Creating Migration Issues for Critical Dashboard Components ==="
echo ""
echo "Total components to migrate: ${#COMPONENTS[@]}"
echo ""

for component_info in "${COMPONENTS[@]}"; do
  IFS=':' read -r COMPONENT REFS DESCRIPTION <<< "$component_info"

  ((ISSUE_COUNT++))

  TITLE="[MIGRATE] Dashboard Component: $COMPONENT"

  BODY="## Component Migration: $COMPONENT

**Source**: \`/Users/aideveloper/AINative-website/src/components/dashboard/$COMPONENT.tsx\`
**Target**: \`app/dashboard/[feature]/$COMPONENT/\`
**Usage References**: $REFS
**Priority**: CRITICAL (P0)
**Estimate**: 3-5 hours

## Description

$DESCRIPTION

This component is heavily used ($REFS references) in the source codebase and must be migrated to the Next.js structure.

## Requirements (TDD - 85%+ coverage)

### 1. RED Phase - Write Tests First
- [ ] Create test file: \`app/dashboard/[feature]/$COMPONENT/__tests__/${COMPONENT}Client.test.tsx\`
- [ ] Port existing tests from source: \`src/components/dashboard/__tests__/${COMPONENT}.test.tsx\`
- [ ] Add Next.js-specific integration tests
- [ ] Verify tests FAIL (no implementation yet)

### 2. GREEN Phase - Implement Component
- [ ] Create client component: \`app/dashboard/[feature]/$COMPONENT/${COMPONENT}Client.tsx\`
- [ ] Add \`'use client'\` directive
- [ ] Convert react-router-dom Link to Next.js Link (\`to=\` → \`href=\`)
- [ ] Update import paths to use \`@/\` alias
- [ ] Remove react-helmet-async (use Next.js metadata in page.tsx)
- [ ] Preserve framer-motion animations
- [ ] Verify tests PASS

### 3. REFACTOR Phase
- [ ] Create server component wrapper: \`app/dashboard/[feature]/$COMPONENT/page.tsx\`
- [ ] Export metadata for SEO
- [ ] Optimize bundle size
- [ ] Add loading states
- [ ] Verify all tests still pass

## Migration Pattern

\`\`\`tsx
// app/dashboard/[feature]/$COMPONENT/page.tsx (Server Component)
import { Metadata } from 'next';
import ${COMPONENT}Client from './${COMPONENT}Client';

export const metadata: Metadata = {
  title: '${COMPONENT}',
  description: '${DESCRIPTION}',
};

export default function ${COMPONENT}Page() {
  return <${COMPONENT}Client />;
}
\`\`\`

\`\`\`tsx
// app/dashboard/[feature]/$COMPONENT/${COMPONENT}Client.tsx (Client Component)
'use client';

import Link from 'next/link';
// Port component implementation from source...
\`\`\`

## Acceptance Criteria

- [ ] Component renders correctly in Next.js
- [ ] All interactive features work (buttons, forms, modals)
- [ ] Routing uses Next.js Link (no react-router-dom)
- [ ] Test coverage >= 85%
- [ ] \`npm run lint\` passes with no errors
- [ ] \`npm run type-check\` passes with no errors
- [ ] \`npm run build\` succeeds
- [ ] \`npm test\` passes all tests

## Dependencies

Check component source for child component dependencies and migrate those first if needed.

## Testing Checklist

- [ ] Unit tests: Component renders
- [ ] Unit tests: Props validation
- [ ] Unit tests: User interactions (clicks, form input)
- [ ] Integration tests: Next.js routing
- [ ] Integration tests: API calls (if any)
- [ ] Visual regression: Component appearance matches source

## Related Issues

Part of dashboard migration effort (Issue #517 audit results).

## Labels

- \`migration\`
- \`dashboard\`
- \`priority: critical\`
- \`type: feature\`
- \`tdd\`

---

**Audit Source**: \`docs/dashboard-component-audit-results.md\`
**Component Rank**: #$ISSUE_COUNT of 16 critical components
"

  if [ "$DRY_RUN" = true ]; then
    echo "[$ISSUE_COUNT/16] Would create issue: $TITLE"
    echo "  Description: $DESCRIPTION"
    echo "  References: $REFS"
    echo ""
  else
    echo "[$ISSUE_COUNT/16] Creating issue: $TITLE..."

    ISSUE_URL=$(gh issue create \
      --title "$TITLE" \
      --body "$BODY" \
      --label "migration,dashboard,priority: critical,type: feature,tdd" \
      2>&1)

    if [ $? -eq 0 ]; then
      echo "  ✓ Created: $ISSUE_URL"
      CREATED_ISSUES+=("$ISSUE_URL")
    else
      echo "  ✗ Failed to create issue"
      echo "  Error: $ISSUE_URL"
    fi
    echo ""
  fi
done

echo "=== Summary ==="
echo "Total issues created: $ISSUE_COUNT"

if [ "$DRY_RUN" = false ] && [ ${#CREATED_ISSUES[@]} -gt 0 ]; then
  echo ""
  echo "Created Issues:"
  for issue_url in "${CREATED_ISSUES[@]}"; do
    echo "  - $issue_url"
  done
fi

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "To create issues for real, run:"
  echo "  ./scripts/create-migration-issues.sh"
fi
