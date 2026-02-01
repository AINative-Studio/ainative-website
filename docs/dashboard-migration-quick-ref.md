# Dashboard Component Migration - Quick Reference

**Related**: Issue #517 - Dashboard Component Usage Audit
**Full Report**: `docs/dashboard-component-audit-results.md`

## Quick Stats

- **Total Components Audited**: 56
- **Critical (20+ refs)**: 16 - CREATE ISSUES
- **Moderate (10-19 refs)**: 11 - Migrate later
- **Low (1-9 refs)**: 25 - On-demand
- **Unused (0 refs)**: 4 - Consider removal

## Top 16 Critical Components (Create Issues)

| # | Component | Refs | Description |
|---|-----------|------|-------------|
| 1 | OverviewTab | 43 | Core dashboard overview tab |
| 2 | AgentSwarmInteractiveDashboard | 42 | Primary agent swarm UI |
| 3 | QuickActionsGrid | 38 | Quick actions grid |
| 4 | RecentActivityFeed | 37 | Activity feed |
| 5 | AIKitTab | 36 | AI Kit features tab |
| 6 | PaymentHistoryTable | 34 | Payment history |
| 7 | ActionModals | 32 | Shared modal system |
| 8 | ToolsTab | 32 | Tools dashboard tab |
| 9 | QNNTab | 31 | Quantum features tab |
| 10 | BillingTab | 28 | Billing management |
| 11 | PlanSummaryCard | 28 | Subscription summary |
| 12 | AgentSwarmFileManager | 27 | File manager |
| 13 | AgentSwarmTab | 26 | Agent swarm tab |
| 14 | CreditUsageTrend | 25 | Usage visualization |
| 15 | QuickActionCard | 25 | Action card component |
| 16 | ZeroDBTab | 21 | ZeroDB features tab |

## Create Migration Issues

```bash
# Dry run (preview issues)
./scripts/create-migration-issues.sh --dry-run

# Create actual issues
./scripts/create-migration-issues.sh
```

## Migration Pattern

```
app/dashboard/[feature]/
  ├── [Component]Client.tsx      # 'use client'
  ├── page.tsx                   # Server component + metadata
  └── __tests__/
      └── [Component]Client.test.tsx
```

## TDD Workflow

1. **RED**: Write tests first (port from source + add Next.js tests)
2. **GREEN**: Implement component (add 'use client', convert routing)
3. **REFACTOR**: Optimize (server wrapper, metadata, bundle size)

## Pre-Commit Checklist

```bash
npm run lint          # Must pass
npm run type-check    # Must pass
npm run build         # Must succeed
npm test              # All tests pass, 85%+ coverage
```

## Component Dependencies

**Parent → Children** (migrate children first):

- OverviewTab → QuickActionsGrid, RecentActivityFeed, CreditUsageTrend
- BillingTab → PaymentHistoryTable, PlanSummaryCard
- QNNTab → ModelPerformanceChart, QPUUsageCard, QuantumCircuitVisualization
- ZeroDBTab → RecentOperationsLog, IndexHealthTable, StorageUsageCard

## Timeline Estimate

- **Phase 1 (Weeks 1-2)**: Core tabs (6 components)
- **Phase 2 (Weeks 3-4)**: Critical UI (6 components)
- **Phase 3 (Week 5)**: Billing/Usage (4 components)
- **Total**: 4-5 weeks for all 16 critical components

## Resources

- Full audit report: `docs/dashboard-component-audit-results.md`
- Test framework: `test/issue-517-usage-audit.test.sh`
- Issue creation: `scripts/create-migration-issues.sh`
- Source components: `/Users/aideveloper/AINative-website/src/components/dashboard/`
