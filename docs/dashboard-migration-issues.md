# Dashboard Migration - GitHub Issues

**Parent Issue**: #491 - Dashboard Component Count Discrepancy

This document contains the GitHub issues that should be created for migrating critical dashboard components.

---

## Phase 1: Critical Foundation (P0)

### Issue 1: Migrate DashboardHeader Component
```markdown
**Title**: [DASHBOARD-P0] Migrate DashboardHeader.tsx component

**Labels**: enhancement, dashboard, migration, P0-critical

**Description**:
Migrate the DashboardHeader component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/DashboardHeader.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/DashboardHeader.tsx`

**Priority**: CRITICAL - This component is used as the header for all dashboard pages.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' if interactive
- [ ] Update imports (react-router-dom → next/link)
- [ ] Maintain responsive design
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)
- [ ] Test on all dashboard pages

**Related**: #491

**Estimated Effort**: 4-6 hours
```

### Issue 2: Migrate StatsGrid Component
```markdown
**Title**: [DASHBOARD-P0] Migrate StatsGrid.tsx component

**Labels**: enhancement, dashboard, migration, P0-critical

**Description**:
Migrate the StatsGrid layout component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/StatsGrid.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/StatsGrid.tsx`

**Priority**: CRITICAL - This component provides the statistics grid layout used across dashboard.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Implement responsive grid layout
- [ ] Support flexible stat card placement
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)
- [ ] Verify responsive behavior on mobile/tablet/desktop

**Related**: #491

**Estimated Effort**: 3-4 hours
```

### Issue 3: Migrate StatCard Component
```markdown
**Title**: [DASHBOARD-P0] Migrate StatCard.tsx component

**Labels**: enhancement, dashboard, migration, P0-critical

**Description**:
Migrate the StatCard component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/StatCard.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/StatCard.tsx`

**Priority**: CRITICAL - This reusable component is used throughout the dashboard to display metrics.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Support various stat types (number, percentage, trend)
- [ ] Include icon support
- [ ] Add trend indicators (up/down/neutral)
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)
- [ ] Create Storybook stories for different variants

**Related**: #491

**Estimated Effort**: 4-5 hours
```

---

## Phase 2: Core Dashboard Tabs (P0)

### Issue 4: Migrate OverviewTab Component
```markdown
**Title**: [DASHBOARD-P0] Migrate OverviewTab.tsx component

**Labels**: enhancement, dashboard, migration, P0-critical, tab

**Description**:
Migrate the OverviewTab component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/tabs/OverviewTab.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/tabs/OverviewTab.tsx`

**Priority**: CRITICAL - This is the main dashboard overview tab.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Integrate with dashboard layout
- [ ] Display key metrics and stats
- [ ] Show recent activity
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)
- [ ] Test data loading and error states

**Dependencies**: StatCard, StatsGrid, DashboardHeader

**Related**: #491

**Estimated Effort**: 6-8 hours
```

### Issue 5: Migrate AIKitTab Component
```markdown
**Title**: [DASHBOARD-P0] Migrate AIKitTab.tsx component

**Labels**: enhancement, dashboard, migration, P0-critical, tab, ai-kit

**Description**:
Migrate the AIKitTab component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/tabs/AIKitTab.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/tabs/AIKitTab.tsx`

**Priority**: CRITICAL - This tab displays AI Kit features and components.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display AI Kit components
- [ ] Show usage statistics
- [ ] Integrate with AI Kit services
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)
- [ ] Test AI Kit integration

**Dependencies**: StatCard, StatsGrid

**Related**: #491

**Estimated Effort**: 6-8 hours
```

### Issue 6: Migrate ToolsTab Component
```markdown
**Title**: [DASHBOARD-P0] Migrate ToolsTab.tsx component

**Labels**: enhancement, dashboard, migration, P0-critical, tab, developer-tools

**Description**:
Migrate the ToolsTab component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/tabs/ToolsTab.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/tabs/ToolsTab.tsx`

**Priority**: CRITICAL - This tab provides developer tools and resources.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display developer tools
- [ ] Show quick actions
- [ ] Integrate with API key management
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)
- [ ] Test tool integrations

**Dependencies**: StatCard

**Related**: #491

**Estimated Effort**: 5-6 hours
```

### Issue 7: Migrate BillingTab Component
```markdown
**Title**: [DASHBOARD-P0] Migrate BillingTab.tsx component

**Labels**: enhancement, dashboard, migration, P0-critical, tab, billing

**Description**:
Migrate the BillingTab component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/tabs/BillingTab.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/tabs/BillingTab.tsx`

**Priority**: CRITICAL - This tab displays billing information and payment history.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display current plan
- [ ] Show payment history
- [ ] Display cost projections
- [ ] Integrate with billing services
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)
- [ ] Test billing API integration

**Dependencies**: StatCard, PaymentHistoryTable, PlanSummaryCard

**Related**: #491

**Estimated Effort**: 6-8 hours
```

---

## Phase 3: Agent Swarm Components (P1)

### Issue 8: Migrate AgentSwarmTab Component
```markdown
**Title**: [DASHBOARD-P1] Migrate AgentSwarmTab.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, tab, agent-swarm

**Description**:
Migrate the AgentSwarmTab component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/tabs/AgentSwarmTab.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/tabs/AgentSwarmTab.tsx`

**Priority**: HIGH - This tab provides agent orchestration features.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display active agents
- [ ] Show agent performance metrics
- [ ] Display execution timeline
- [ ] Show swarm logs
- [ ] Integrate with agent swarm services
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Dependencies**: ActiveAgentsOverview, AgentPerformanceMetrics, SwarmExecutionTimeline, SwarmLogs, TaskQueue

**Related**: #491

**Estimated Effort**: 8-10 hours
```

### Issue 9: Migrate ActiveAgentsOverview Component
```markdown
**Title**: [DASHBOARD-P1] Migrate ActiveAgentsOverview.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, agent-swarm

**Description**:
Migrate the ActiveAgentsOverview component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/ActiveAgentsOverview.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/ActiveAgentsOverview.tsx`

**Priority**: HIGH - Displays currently active agents in the swarm.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display agent list
- [ ] Show agent status
- [ ] Real-time updates
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 4-5 hours
```

### Issue 10: Migrate AgentPerformanceMetrics Component
```markdown
**Title**: [DASHBOARD-P1] Migrate AgentPerformanceMetrics.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, agent-swarm, metrics

**Description**:
Migrate the AgentPerformanceMetrics component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/AgentPerformanceMetrics.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/AgentPerformanceMetrics.tsx`

**Priority**: HIGH - Displays agent performance charts and metrics.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Integrate with charting library (recharts/shadcn-charts)
- [ ] Display performance metrics
- [ ] Real-time metric updates
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 5-6 hours
```

### Issue 11: Migrate SwarmExecutionTimeline Component
```markdown
**Title**: [DASHBOARD-P1] Migrate SwarmExecutionTimeline.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, agent-swarm, visualization

**Description**:
Migrate the SwarmExecutionTimeline component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/SwarmExecutionTimeline.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/SwarmExecutionTimeline.tsx`

**Priority**: HIGH - Visualizes agent swarm execution timeline.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Implement timeline visualization
- [ ] Show execution flow
- [ ] Support zoom/pan interactions
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 6-7 hours
```

### Issue 12: Migrate SwarmLogs Component
```markdown
**Title**: [DASHBOARD-P1] Migrate SwarmLogs.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, agent-swarm, logs

**Description**:
Migrate the SwarmLogs component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/SwarmLogs.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/SwarmLogs.tsx`

**Priority**: HIGH - Displays swarm execution logs in real-time.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display log entries
- [ ] Support log filtering
- [ ] Auto-scroll with new entries
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 4-5 hours
```

### Issue 13: Migrate TaskQueue Component
```markdown
**Title**: [DASHBOARD-P1] Migrate TaskQueue.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, agent-swarm

**Description**:
Migrate the TaskQueue component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/TaskQueue.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/TaskQueue.tsx`

**Priority**: HIGH - Displays agent task queue and status.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display queued tasks
- [ ] Show task status
- [ ] Support task actions (cancel, retry)
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 5-6 hours
```

---

## Phase 4: Quantum Computing Components (P1)

### Issue 14: Migrate QNNTab Component
```markdown
**Title**: [DASHBOARD-P1] Migrate QNNTab.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, tab, quantum

**Description**:
Migrate the QNNTab component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/tabs/QNNTab.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/tabs/QNNTab.tsx`

**Priority**: HIGH - This tab provides quantum computing features.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display quantum metrics
- [ ] Show circuit visualization
- [ ] Display QPU usage
- [ ] Show training jobs
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Dependencies**: QuantumCircuitVisualization, QPUUsageCard, ModelPerformanceChart, TrainingJobsTable

**Related**: #491

**Estimated Effort**: 7-8 hours
```

### Issue 15: Migrate QuantumCircuitVisualization Component
```markdown
**Title**: [DASHBOARD-P1] Migrate QuantumCircuitVisualization.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, quantum, visualization

**Description**:
Migrate the QuantumCircuitVisualization component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/QuantumCircuitVisualization.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/QuantumCircuitVisualization.tsx`

**Priority**: HIGH - Visualizes quantum circuits.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Implement circuit rendering
- [ ] Support interactive circuit building
- [ ] Add zoom/pan controls
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 8-10 hours
```

### Issue 16: Migrate QPUUsageCard Component
```markdown
**Title**: [DASHBOARD-P1] Migrate QPUUsageCard.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, quantum, metrics

**Description**:
Migrate the QPUUsageCard component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/QPUUsageCard.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/QPUUsageCard.tsx`

**Priority**: HIGH - Displays QPU (Quantum Processing Unit) usage metrics.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display QPU usage stats
- [ ] Show usage charts
- [ ] Display quota information
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 4-5 hours
```

### Issue 17: Migrate ModelPerformanceChart Component
```markdown
**Title**: [DASHBOARD-P1] Migrate ModelPerformanceChart.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, quantum, visualization

**Description**:
Migrate the ModelPerformanceChart component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/ModelPerformanceChart.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/ModelPerformanceChart.tsx`

**Priority**: HIGH - Displays model performance metrics and charts.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Integrate with charting library
- [ ] Display performance trends
- [ ] Support multiple metrics
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 5-6 hours
```

### Issue 18: Migrate TrainingJobsTable Component
```markdown
**Title**: [DASHBOARD-P1] Migrate TrainingJobsTable.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, quantum, table

**Description**:
Migrate the TrainingJobsTable component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/TrainingJobsTable.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/TrainingJobsTable.tsx`

**Priority**: HIGH - Displays quantum training jobs table.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display training jobs
- [ ] Show job status
- [ ] Support sorting and filtering
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 5-6 hours
```

### Issue 19: Migrate ZeroDBTab Component
```markdown
**Title**: [DASHBOARD-P1] Migrate ZeroDBTab.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, tab, zerodb

**Description**:
Migrate the ZeroDBTab component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/tabs/ZeroDBTab.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/tabs/ZeroDBTab.tsx`

**Priority**: HIGH - This tab provides ZeroDB management features.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display database metrics
- [ ] Show query performance
- [ ] Display storage usage
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Dependencies**: QueryPerformanceCard, StorageUsageCard

**Related**: #491

**Estimated Effort**: 6-7 hours
```

---

## Phase 5: Billing Components (P1)

### Issue 20: Migrate PaymentHistoryTable Component
```markdown
**Title**: [DASHBOARD-P1] Migrate PaymentHistoryTable.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, billing, table

**Description**:
Migrate the PaymentHistoryTable component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/PaymentHistoryTable.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/PaymentHistoryTable.tsx`

**Priority**: HIGH - Displays payment transaction history.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display payment history
- [ ] Support pagination
- [ ] Support filtering and sorting
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 5-6 hours
```

### Issue 21: Migrate PlanSummaryCard Component
```markdown
**Title**: [DASHBOARD-P1] Migrate PlanSummaryCard.tsx component

**Labels**: enhancement, dashboard, migration, P1-high, billing

**Description**:
Migrate the PlanSummaryCard component from the source Vite codebase to Next.js.

**Source**: `/Users/aideveloper/core/AINative-Website/src/components/dashboard/PlanSummaryCard.tsx`
**Target**: `/Users/aideveloper/ainative-website-nextjs-staging/components/dashboard/PlanSummaryCard.tsx`

**Priority**: HIGH - Displays current subscription plan summary.

**Requirements**:
- [ ] Convert to Next.js compatible component
- [ ] Mark as 'use client' directive
- [ ] Display plan details
- [ ] Show usage quotas
- [ ] Display billing cycle
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)

**Related**: #491

**Estimated Effort**: 4-5 hours
```

---

## Summary

**Total Issues**: 21 critical components
**Estimated Total Effort**: 120-140 hours (3-4 weeks for 1 developer)
**Recommended Team**: 2 developers working in parallel
**Estimated Completion**: 1.5-2 weeks with 2 developers

**Issue Labels to Create**:
- `dashboard` - All dashboard-related issues
- `migration` - Component migration from Vite to Next.js
- `P0-critical` - Must have for basic functionality
- `P1-high` - Important for full feature set
- `tab` - Dashboard tab components
- `agent-swarm` - Agent orchestration features
- `quantum` - Quantum computing features
- `billing` - Billing and payments
- `zerodb` - Database management
- `visualization` - Charts and visualizations
- `metrics` - Metrics and statistics

**GitHub Project Board**: Create "Dashboard Migration" project with columns:
- Backlog
- Phase 1 - Foundation
- Phase 2 - Core Tabs
- Phase 3 - Agent Swarm
- Phase 4 - Quantum & ZeroDB
- Phase 5 - Billing
- In Progress
- In Review
- Done
