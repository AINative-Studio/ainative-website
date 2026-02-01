# Dashboard Component Usage Audit Results

**Issue**: #517
**Date**: 2026-01-31
**Status**: Complete
**Components Analyzed**: 56 unique dashboard components

## Executive Summary

Comprehensive audit of ~40+ dashboard components from source codebase (`/Users/aideveloper/AINative-website/src/components/dashboard/`) to determine actual usage vs legacy/unused components. This analysis identifies migration priorities based on real-world usage patterns.

### Key Findings

- **Total Components**: 56 unique dashboard components identified
- **Critical (20+ refs)**: 16 components - **MUST MIGRATE**
- **Moderate (10-19 refs)**: 11 components - Should migrate
- **Low (1-9 refs)**: 25 components - Evaluate on case-by-case basis
- **Unused (0 refs)**: 4 components - Consider removal

### Migration Impact

- **High Priority**: 16 critical components requiring immediate migration
- **Medium Priority**: 11 moderate-use components
- **Low Priority**: 25 low-use components (many are specialized/edge-case)
- **No Action**: 4 unused components (likely legacy code)

---

## Category 1: CRITICAL Components (Priority 1 - Migrate First)

These components have 20+ references and are heavily used throughout the source codebase. Migration is CRITICAL.

| Component | Total Refs | Import Count | Usage Count | Recommendation |
|-----------|-----------|--------------|-------------|----------------|
| **OverviewTab** | 43 | 1 | 42 | CREATE ISSUE - Core dashboard tab |
| **AgentSwarmInteractiveDashboard** | 42 | 1 | 41 | CREATE ISSUE - Primary agent UI |
| **QuickActionsGrid** | 38 | 2 | 36 | CREATE ISSUE - Used in overview |
| **RecentActivityFeed** | 37 | 2 | 35 | CREATE ISSUE - Activity tracking |
| **AIKitTab** | 36 | 7 | 29 | CREATE ISSUE - Core feature tab |
| **PaymentHistoryTable** | 34 | 2 | 32 | CREATE ISSUE - Billing component |
| **ActionModals** | 32 | 2 | 30 | CREATE ISSUE - Tools interaction |
| **ToolsTab** | 32 | 1 | 31 | CREATE ISSUE - Core dashboard tab |
| **QNNTab** | 31 | 1 | 30 | CREATE ISSUE - Quantum features |
| **BillingTab** | 28 | 1 | 27 | CREATE ISSUE - Core dashboard tab |
| **PlanSummaryCard** | 28 | 2 | 26 | CREATE ISSUE - Subscription UI |
| **AgentSwarmFileManager** | 27 | 1 | 26 | CREATE ISSUE - File management |
| **AgentSwarmTab** | 26 | 2 | 24 | CREATE ISSUE - Core dashboard tab |
| **CreditUsageTrend** | 25 | 2 | 23 | CREATE ISSUE - Usage visualization |
| **QuickActionCard** | 25 | 2 | 23 | CREATE ISSUE - Action UI component |
| **ZeroDBTab** | 21 | 3 | 18 | CREATE ISSUE - Database features |

**Action Required**: Create 16 individual migration issues for these components.

---

## Category 2: MODERATE Usage Components (Priority 2)

These components have 10-19 references and are moderately used. Should be migrated after critical components.

| Component | Total Refs | Import Count | Usage Count | Recommendation |
|-----------|-----------|--------------|-------------|----------------|
| **ModelPerformanceChart** | 19 | 0 | 19 | Migrate - QNN dashboard visualization |
| **QPUUsageCard** | 18 | 2 | 16 | Migrate - Quantum resource tracking |
| **AIFeatureCard** | 17 | 2 | 15 | Migrate - Feature showcase component |
| **QuantumCircuitVisualization** | 17 | 0 | 17 | Migrate - QNN visualization |
| **AIInsightCard** | 15 | 2 | 13 | Migrate - AI insights display |
| **RealTimeAIMetrics** | 14 | 2 | 12 | Migrate - Metrics dashboard |
| **TrainingJobsTable** | 14 | 1 | 13 | Migrate - QNN job tracking |
| **RecentOperationsLog** | 12 | 2 | 10 | Migrate - ZeroDB operations |
| **IndexHealthTable** | 11 | 2 | 9 | Migrate - ZeroDB health monitoring |
| **StorageUsageCard** | 11 | 2 | 9 | Migrate - Storage metrics |
| **QueryPerformanceCard** | 10 | 2 | 8 | Migrate - ZeroDB performance |

**Action Required**: Create migration issues grouped by feature area (QNN, ZeroDB, Metrics).

---

## Category 3: LOW Usage Components (Priority 3)

These components have 1-9 references. Evaluate on case-by-case basis.

### Utility Components (9 refs)
- **StatCard** (9 refs) - Reusable stat display, may be replaced by shadcn/ui

### Dashboard Features (6-5 refs)
- **AIKitOverview** (6 refs) - AI Kit metrics overview
- **TaskQueue** (5 refs) - Agent task queue display

### Specialized Components (4-3 refs)
- **AgentPerformanceMetrics** (4 refs) - Agent metrics visualization
- **ActiveProjectsGrid** (3 refs) - Project grid view
- **ArtifactsBrowser** (3 refs) - Artifact file browser
- **ComponentCard** (3 refs) - Component showcase card
- **ExecutionTimelineChart** (3 refs) - Agent execution timeline
- **QuantumMetrics** (3 refs) - Quantum metrics display

### Edge Case Components (2 refs)
- **ActiveAgentsOverview** (2 refs) - Agent overview panel
- **CostProjectionCard** (2 refs) - Cost forecasting
- **DashboardHeader** (2 refs) - Dashboard header component
- **KongMetrics** (2 refs) - Kong gateway metrics
- **QPUUsageStats** (2 refs) - QPU statistics
- **RecentProjects** (2 refs) - Recent projects list
- **StatsGrid** (2 refs) - Statistics grid layout
- **SwarmExecutionTimeline** (2 refs) - Swarm execution viz
- **SwarmLogs** (2 refs) - Swarm logs display
- **UsageBreakdownChart** (2 refs) - Usage chart component

### Single Reference Components (1 ref)
- **ComponentGallery** (1 ref) - Component showcase gallery
- **InstallationGuide** (1 ref) - Installation guide UI
- **PopularComponents** (1 ref) - Popular components list
- **QuantumTrainingJobs** (1 ref) - Quantum training jobs
- **RateLimitAlert** (1 ref) - Rate limit notification
- **UsageStatistics** (1 ref) - Usage stats display

**Recommendation**: Defer migration until feature-specific work requires them. Consider consolidating similar components.

---

## Category 4: UNUSED Components (Consider Removal)

These components have ZERO references in the source codebase. Likely legacy code.

| Component | Total Refs | Status | Recommendation |
|-----------|-----------|--------|----------------|
| **APIKeyManager** | 0 | Unused | Review - may be replaced by newer implementation |
| **DashboardWithAIKit** | 0 | Unused | Review - experimental/prototype component |
| **DeveloperResources** | 0 | Unused | Review - may be documentation-only |
| **ToolsQuickActions** | 0 | Unused | Review - may be replaced by ActionModals |

**Recommendation**:
1. Verify these are truly unused (not lazy-loaded or dynamic imports)
2. Check git history for last usage
3. If confirmed unused for 6+ months, mark for removal
4. Archive to separate branch before deletion

---

## Next.js Integration Status

Current dashboard implementations in Next.js staging:
- `/app/dashboard/DashboardClient.tsx` - Main dashboard (partial migration)
- `/app/dashboard/main/MainDashboardClient.tsx` - Main dashboard view
- `/app/dashboard/qnn/QNNDashboardClient.tsx` - QNN dashboard (partial)
- `/app/admin/AdminDashboardClient.tsx` - Admin dashboard
- `/app/dashboard-landing/DashboardLandingClient.tsx` - Dashboard landing

**Gap Analysis**: Most critical components NOT yet migrated to Next.js structure.

---

## Migration Roadmap

### Phase 1: Core Dashboard Tabs (Week 1-2)
Create issues for:
1. OverviewTab
2. AgentSwarmTab
3. BillingTab
4. ToolsTab
5. QNNTab
6. ZeroDBTab

### Phase 2: Critical UI Components (Week 3-4)
Create issues for:
7. AgentSwarmInteractiveDashboard
8. QuickActionsGrid
9. RecentActivityFeed
10. PaymentHistoryTable
11. ActionModals
12. AgentSwarmFileManager

### Phase 3: Billing & Usage (Week 5)
Create issues for:
13. PlanSummaryCard
14. CreditUsageTrend
15. QuickActionCard
16. AIKitTab (if not covered in Phase 1)

### Phase 4: Moderate Priority (Week 6-8)
Migrate moderate-use components grouped by feature:
- QNN: ModelPerformanceChart, QPUUsageCard, QuantumCircuitVisualization, TrainingJobsTable
- ZeroDB: RecentOperationsLog, IndexHealthTable, StorageUsageCard, QueryPerformanceCard
- AI Features: AIFeatureCard, AIInsightCard, RealTimeAIMetrics

### Phase 5: Low Priority (On-Demand)
Migrate low-use components as needed for feature completion.

### Phase 6: Cleanup
Review and remove unused components after 6 months.

---

## Implementation Notes

### Component Migration Pattern

For each component migration:

1. **Create Next.js Structure**:
   ```
   app/dashboard/[feature]/
     ├── [Feature]Client.tsx      (use client)
     ├── page.tsx                 (server component)
     └── __tests__/
         └── [Feature]Client.test.tsx
   ```

2. **Adapt Source Component**:
   - Add `'use client'` directive
   - Convert `react-router-dom` Link to Next.js Link
   - Update import paths to `@/` alias
   - Remove react-helmet-async (use Next.js metadata)

3. **Test Coverage**:
   - Port existing tests from source
   - Add Next.js-specific integration tests
   - Ensure 85%+ coverage (TDD requirement)

4. **Verify Build**:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   npm test
   ```

---

## Component Dependencies

### High-Impact Dependencies

Components with multiple dependent components:

- **OverviewTab** → QuickActionsGrid, RecentActivityFeed, CreditUsageTrend, StatCard
- **AgentSwarmInteractiveDashboard** → AgentSwarmFileManager, ActionModals
- **BillingTab** → PaymentHistoryTable, PlanSummaryCard, CostProjectionCard, UsageBreakdownChart
- **QNNTab** → ModelPerformanceChart, QPUUsageCard, QuantumCircuitVisualization, TrainingJobsTable
- **ZeroDBTab** → RecentOperationsLog, IndexHealthTable, StorageUsageCard, QueryPerformanceCard

**Migration Strategy**: Migrate parent tabs AFTER their child components are ready.

---

## Test Coverage Requirements

Per TDD requirements (85%+ coverage):

1. **Unit Tests**: All individual components
2. **Integration Tests**: Tab components with child components
3. **E2E Tests**: Critical user flows (overview, billing, agent swarm)

---

## Success Metrics

Track migration progress with:

1. **Component Migration Rate**: Target 16 critical components in 4-5 weeks
2. **Test Coverage**: Maintain 85%+ coverage
3. **Build Success**: Zero type errors, zero lint errors
4. **Performance**: Dashboard load time < 2s (same as source)

---

## Appendix A: Full Component Reference List

### Critical Components (16)
1. OverviewTab
2. AgentSwarmInteractiveDashboard
3. QuickActionsGrid
4. RecentActivityFeed
5. AIKitTab
6. PaymentHistoryTable
7. ActionModals
8. ToolsTab
9. QNNTab
10. BillingTab
11. PlanSummaryCard
12. AgentSwarmFileManager
13. AgentSwarmTab
14. CreditUsageTrend
15. QuickActionCard
16. ZeroDBTab

### Moderate Components (11)
17. ModelPerformanceChart
18. QPUUsageCard
19. AIFeatureCard
20. QuantumCircuitVisualization
21. AIInsightCard
22. RealTimeAIMetrics
23. TrainingJobsTable
24. RecentOperationsLog
25. IndexHealthTable
26. StorageUsageCard
27. QueryPerformanceCard

### Low Usage Components (25)
28. StatCard
29. AIKitOverview
30. TaskQueue
31. AgentPerformanceMetrics
32. ActiveProjectsGrid
33. ArtifactsBrowser
34. ComponentCard
35. ExecutionTimelineChart
36. QuantumMetrics
37. ActiveAgentsOverview
38. CostProjectionCard
39. DashboardHeader
40. KongMetrics
41. QPUUsageStats
42. RecentProjects
43. StatsGrid
44. SwarmExecutionTimeline
45. SwarmLogs
46. UsageBreakdownChart
47. ComponentGallery
48. InstallationGuide
49. PopularComponents
50. QuantumTrainingJobs
51. RateLimitAlert
52. UsageStatistics

### Unused Components (4)
53. APIKeyManager
54. DashboardWithAIKit
55. DeveloperResources
56. ToolsQuickActions

---

## Appendix B: Usage Pattern Analysis

### Most Heavily Tested Components
Components with extensive test coverage in source:

1. OverviewTab - 42 test usages
2. AgentSwarmInteractiveDashboard - 41 test usages
3. QuickActionsGrid - 36 test usages
4. RecentActivityFeed - 35 test usages

### Components Used Across Multiple Features

- **StatCard**: Used in billing, dashboard, QNN
- **AIKitTab**: Integrated in multiple dashboard views
- **ActionModals**: Shared modal system for multiple features

---

## Appendix C: Technical Debt Assessment

### Duplicate Components

Found duplicates between main directory and tabs subdirectory:
- AgentSwarmTab (2 versions)
- BillingTab (2 versions)
- OverviewTab (2 versions)
- QNNTab (2 versions)
- ToolsTab (2 versions)
- ZeroDBTab (2 versions)

**Action**: Consolidate during migration to prevent confusion.

### Components Without Imports

These components are used but never imported (dynamically loaded or default exports):
- ModelPerformanceChart
- QuantumCircuitVisualization

**Verification Needed**: Check for lazy loading or dynamic imports.

---

## Conclusion

**Total Components Analyzed**: 56
**Migration Priority 1 (Critical)**: 16 components
**Migration Priority 2 (Moderate)**: 11 components
**Migration Priority 3 (Low)**: 25 components
**Unused (Consider Removal)**: 4 components

**Recommended Timeline**: 8 weeks for complete migration
**Critical Path**: 4-5 weeks for top 16 components

**Next Steps**:
1. Create GitHub issues for 16 critical components
2. Begin Phase 1 migration (core dashboard tabs)
3. Establish component library pattern in Next.js
4. Set up automated testing for migrated components

---

**Audit Complete**: 2026-01-31
**Audited By**: System Architect
**Test Framework**: `/Users/aideveloper/ainative-website-nextjs-staging/test/issue-517-usage-audit.test.sh`
