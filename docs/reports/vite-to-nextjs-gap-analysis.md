# Vite to Next.js Migration - Gap Analysis Report

**Date:** 2026-01-14
**Prepared by:** AINative Dev Team
**Source:** Vite Website (`/Users/ranveerdeshmukh/AINative-core/core/AINative-website`)
**Target:** Next.js Website (`/Users/ranveerdeshmukh/ainative-website-nextjs`)

---

## Executive Summary

This document provides a comprehensive gap analysis comparing the original Vite-based AINative website with the Next.js migration. The analysis covers pages/routes, components, services, hooks, utilities, and features.

**Overall Status:** ~85% feature parity achieved

| Category | Vite | Next.js | Gap |
|----------|------|---------|-----|
| Pages/Routes | 71 | 75 | 9 missing |
| Components | 104+ | 85+ | 35+ missing |
| Services | 24 | 20 | 4 missing |
| Hooks | 18 | 15 | 3 missing |
| Utilities | 7 | 3 | 4 missing |

---

## Table of Contents

1. [Missing Pages/Routes](#1-missing-pagesroutes)
2. [Missing Components](#2-missing-components)
3. [Missing Services](#3-missing-services)
4. [Missing Hooks](#4-missing-hooks)
5. [Missing Utilities](#5-missing-utilities)
6. [Missing Lib Files](#6-missing-lib-files)
7. [Feature Gaps](#7-feature-gaps)
8. [Configuration Gaps](#8-configuration-gaps)
9. [Priority Backlog](#9-priority-backlog)

---

## 1. Missing Pages/Routes

### 1.1 Critical Missing Pages (HIGH Priority)

| Route | Vite File | Description | Priority |
|-------|-----------|-------------|----------|
| `/auth/verify-email` | `VerifyEmailPage.tsx` | Email verification flow after signup | HIGH |
| `/invoices/create` | `CreateInvoicePage.tsx` | Admin invoice creation page | HIGH |
| `/invoices/:invoiceId` | `InvoiceDetailPage.tsx` | Invoice detail view with payment | HIGH |
| `/developer-tools` | `DeveloperToolsPage.tsx` | Developer utilities and tools | HIGH |
| `/dashboard/agent-swarm/workflow-demo` | `AgentSwarmWorkflowDemo.tsx` | Agent Swarm workflow demonstration | HIGH |

### 1.2 Medium Priority Missing Pages

| Route | Vite File | Description | Priority |
|-------|-----------|-------------|----------|
| `/products/classic` | `ProductsPage.tsx` | Classic/alternate products view | MEDIUM |
| `/analytics` | `DashboardPage.tsx` | Analytics dashboard (alternate route) | MEDIUM |
| `/pricing-old` | `PricingPage.tsx` | Legacy pricing page (backup) | LOW |
| `/qnn-signatures` | `QNNSignaturesPage.tsx` | QNN signatures dedicated page | MEDIUM |

### 1.3 Demo/Example Pages (LOW Priority)

| Route | Vite File | Description | Priority |
|-------|-----------|-------------|----------|
| `/stage-indicator-demo` | `StageIndicatorDemo.tsx` | Stage indicator demo | LOW |
| `/completion-statistics-demo` | `CompletionStatisticsDemo.tsx` | Statistics demo | LOW |
| `/completion-time-summary-demo` | `CompletionTimeSummaryDemo.tsx` | Time summary demo | LOW |

---

## 2. Missing Components

### 2.1 Agent Swarm Components (HIGH Priority)

These components are critical for the Agent Swarm workflow feature:

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `AgentCard.tsx` | `components/agentswarm/` | Individual agent display card | ~150 |
| `AgentDetailModal.tsx` | `components/agentswarm/` | Detailed agent info modal | ~200 |
| `AgentStatusIndicator.tsx` | `components/agentswarm/` | Agent status visualization | ~100 |
| `AgentTeamOverview.tsx` | `components/agentswarm/` | Team summary dashboard | ~250 |

### 2.2 Agent Swarm Workflow Components (HIGH Priority)

Large, complex components for the full Agent Swarm workflow:

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `AgentSwarmRulesUpload.tsx` | `components/` | Rules file upload interface | ~17,300 |
| `AgentSwarmTerminal.tsx` | `components/` | Real-time terminal emulator | ~12,000 |
| `AIPRDGenerator.tsx` | `components/` | AI PRD generation tool | ~15,200 |
| `BacklogReview.tsx` | `components/` | Backlog review interface | ~97,800 |
| `DataModelReview.tsx` | `components/` | Data model review interface | ~66,500 |
| `SprintPlanReview.tsx` | `components/` | Sprint planning review | ~80,600 |
| `SwarmLaunchConfirmation.tsx` | `components/` | Swarm launch confirmation dialog | ~38,200 |

### 2.3 Workflow Progress Components (HIGH Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `ExecutionTimer.tsx` | `components/` | Workflow execution timer | ~5,600 |
| `StageIndicator.tsx` | `components/` | Workflow stage progress indicator | ~3,300 |
| `CompletionStatistics.tsx` | `components/` | Completion stats display | ~7,400 |
| `CompletionTimeSummary.tsx` | `components/` | Time summary component | ~7,700 |
| `TDDProgressDisplay.tsx` | `components/` | TDD progress visualization | ~11,600 |
| `TimeComparisonCard.tsx` | `components/` | Time comparison display | ~5,700 |

### 2.4 GitHub Integration Components (MEDIUM Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `GitHubIntegrationCard.tsx` | `components/` | GitHub integration status card | ~9,600 |
| `GitHubRepoStatus.tsx` | `components/` | Repository status display | ~4,200 |

### 2.5 Invoice Components (HIGH Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `InvoiceCard.tsx` | `components/invoices/` | Invoice card display | ~200 |
| `InvoiceDetailModal.tsx` | `components/invoices/` | Invoice detail view modal | ~400 |
| `InvoiceList.tsx` | `components/invoices/` | Invoice list component | ~300 |
| `LineItemEditor.tsx` | `components/invoices/` | Invoice line item editor | ~350 |
| `PaymentButton.tsx` | `components/invoices/` | Payment action button | ~150 |
| `PaymentForm.tsx` | `components/invoices/` | Payment form UI | ~400 |

**Note:** Next.js has `InvoiceStatusBadge.tsx` only

### 2.6 Community/Content Components (MEDIUM Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `Comments.tsx` | `components/` | Comment system for content | ~11,800 |
| `RelatedContent.tsx` | `components/community/` | Related content suggestions | ~200 |

### 2.7 Search Components (MEDIUM Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `SearchInput.tsx` | `components/search/` | Search input with suggestions | ~300 |
| `SearchResults.tsx` | `components/search/` | Search results display | ~400 |
| `SearchSuggestions.tsx` | `components/search/` | Autocomplete suggestions | ~250 |
| `SearchFilters.tsx` | `components/search/` | Search filter controls | ~300 |

### 2.8 Showcase Components (MEDIUM Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `ShowcaseCard.tsx` | `components/showcase/` | Showcase project card | ~200 |
| `ShowcaseGallery.tsx` | `components/showcase/` | Showcase gallery grid | ~300 |
| `ShowcaseFilters.tsx` | `components/showcase/` | Showcase filter controls | ~200 |
| `ShowcaseTags.tsx` | `components/showcase/` | Showcase tag display | ~100 |

### 2.9 Tutorial Components (MEDIUM Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| Tutorial presentation components | `components/tutorial/` | Various tutorial UI components | ~2,000 |

### 2.10 Section Components (LOW Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `Documentation.tsx` | `components/sections/` | Documentation section | ~300 |
| `AudioDemo.tsx` | `components/sections/` | Audio demonstration section | ~200 |
| `Solutions.tsx` | `components/sections/` | Solutions showcase section | ~400 |

### 2.11 Theme Provider (LOW Priority)

| Component | Vite Path | Description | LOC |
|-----------|-----------|-------------|-----|
| `theme-provider.tsx` | `components/` | Dark/light theme context | ~100 |

**Note:** Next.js uses `next-themes` package instead

---

## 3. Missing Services

### 3.1 Critical Missing Services

| Service | Vite Path | Description | Priority |
|---------|-----------|-------------|----------|
| `UserService.ts` | `services/` | Dedicated user profile management | HIGH |
| `DataModelChatService.ts` | `services/` | Data model chat interaction service | HIGH |
| `SemanticSearchService.ts` | `services/` | Semantic/vector search functionality | MEDIUM |
| `QNN code-analysis.ts` | `services/qnn/` | QNN code analysis service | MEDIUM |

### 3.2 Service Comparison

| Service | Vite | Next.js | Status |
|---------|------|---------|--------|
| AuthService | ✅ | ✅ | Complete |
| BillingService | ✅ | ✅ | Complete |
| CreditService | ✅ | ✅ | Complete |
| SubscriptionService | ✅ | ✅ | Complete |
| InvoiceService | ✅ | ✅ | Complete |
| PricingService | ✅ | ✅ | Complete |
| DashboardService | ✅ | ✅ | Complete |
| GitHubService | ✅ | ✅ | Complete |
| QNNApiClient | ✅ | ✅ | Complete |
| AgentSwarmService | ✅ | ✅ | Complete |
| RLHFService | ✅ | ✅ | Complete |
| WebinarService | ✅ | ✅ | Complete |
| UsageService | ✅ | ✅ | Complete |
| ConversionTrackingService | ✅ | ✅ | Complete |
| UserSettingsService | ✅ | ✅ | Complete |
| ApiKeyService | ✅ | ✅ | Complete |
| Luma Services | ✅ | ✅ | Complete |
| ZeroDB Services | ✅ | ✅ | Complete |
| UserService | ✅ | ❌ | **MISSING** |
| DataModelChatService | ✅ | ❌ | **MISSING** |
| SemanticSearchService | ✅ | ❌ | **MISSING** |

---

## 4. Missing Hooks

| Hook | Vite Path | Description | Priority |
|------|-----------|-------------|----------|
| `useDebounce.ts` | `hooks/` | Debounce utility hook | HIGH |
| `useSearchSuggestions.ts` | `hooks/` | Search autocomplete hook | MEDIUM |

### 4.1 Hooks Comparison

| Hook | Vite | Next.js | Status |
|------|------|---------|--------|
| use-toast | ✅ | ✅ | Complete |
| useBenchmarks | ✅ | ✅ | Complete |
| useBilling | ✅ | ✅ | Complete |
| useCodeSync | ✅ | ✅ | Complete |
| useConversionTracking | ✅ | ✅ | Complete |
| useDashboardStats | ✅ | ✅ | Complete |
| useEvaluation | ✅ | ✅ | Complete |
| useModels | ✅ | ✅ | Complete |
| useQNN | ✅ | ✅ | Complete |
| useRepositories | ✅ | ✅ | Complete |
| useShowcaseVideo | ✅ | ✅ | Complete |
| useTraining | ✅ | ✅ | Complete |
| useTutorialProgress | ✅ | ✅ | Complete |
| useVideoPlayer | ✅ | ✅ | Complete |
| useWebinarRegistration | ✅ | ✅ | Complete |
| useDebounce | ✅ | ❌ | **MISSING** |
| useSearchSuggestions | ✅ | ❌ | **MISSING** |

---

## 5. Missing Utilities

| Utility | Vite Path | Description | Priority |
|---------|-----------|-------------|----------|
| `authDebug.ts` | `utils/` | Authentication debugging utilities | LOW |
| `calc.ts` | `utils/` | Calculation utilities | LOW |
| `envValidation.ts` | `utils/` | Environment variable validation | MEDIUM |
| `executionStageHelpers.ts` | `utils/` | Execution stage helper functions | HIGH |

### 5.1 Utilities Comparison

| Utility | Vite | Next.js | Status |
|---------|------|---------|--------|
| apiClient | ✅ | ✅ | Complete |
| authCookies | ✅ | ✅ | Complete |
| geoDetection | ✅ | ✅ | Complete |
| authDebug | ✅ | ❌ | **MISSING** |
| calc | ✅ | ❌ | **MISSING** |
| envValidation | ✅ | ❌ | **MISSING** |
| executionStageHelpers | ✅ | ❌ | **MISSING** |

---

## 6. Missing Lib Files

| File | Vite Path | Description | Priority |
|------|-----------|-------------|----------|
| `calendarUtils.ts` | `lib/` | Calendar manipulation utilities | LOW |
| `githubAPI.ts` | `lib/` | GitHub API wrapper functions | MEDIUM |
| `tutorialStorage.ts` | `lib/` | Tutorial progress persistence | MEDIUM |
| `unsplash.ts` | `lib/` | Unsplash image API integration | LOW |
| `videoStorage.ts` | `lib/` | Video progress persistence | MEDIUM |
| `community/` | `lib/community/` | Community content utilities | MEDIUM |

### 6.1 Lib Comparison

| File | Vite | Next.js | Status |
|------|------|---------|--------|
| calendarGenerator | ✅ | ✅ | Complete |
| certificateGenerator | ✅ | ✅ | Complete |
| strapi | ✅ | ✅ | Complete (as strapi-client) |
| utils | ✅ | ✅ | Complete |
| videoPlayerConfig | ✅ | ✅ | Complete |
| webinarAPI | ✅ | ✅ | Complete |
| calendarUtils | ✅ | ❌ | **MISSING** |
| githubAPI | ✅ | ❌ | **MISSING** |
| tutorialStorage | ✅ | ❌ | **MISSING** |
| unsplash | ✅ | ❌ | **MISSING** |
| videoStorage | ✅ | ❌ | **MISSING** |

---

## 7. Feature Gaps

### 7.1 Critical Feature Gaps (HIGH Priority)

| Feature | Description | Impact |
|---------|-------------|--------|
| **Email Verification Flow** | Complete email verification after signup | Users cannot verify emails |
| **Invoice CRUD Operations** | Full invoice management (create, view, edit) | Admin cannot manage invoices |
| **Agent Swarm Workflow** | Visual workflow execution with stage indicators | Core product feature incomplete |
| **Developer Tools Page** | Developer utilities and tools dashboard | Developer experience gap |

### 7.2 Medium Priority Feature Gaps

| Feature | Description | Impact |
|---------|-------------|--------|
| **Semantic Search** | AI-powered semantic search across content | Search quality degraded |
| **Tutorial Progress Storage** | Persist tutorial progress across sessions | User experience gap |
| **Video Progress Storage** | Resume videos from last position | User experience gap |
| **Comment System** | User comments on blog/tutorials | Community engagement reduced |
| **Showcase Gallery** | Project showcase with filtering | Community content incomplete |

### 7.3 Low Priority Feature Gaps

| Feature | Description | Impact |
|---------|-------------|--------|
| **Auth Debugging** | Debug tools for auth issues | Developer debugging harder |
| **Legacy Pricing Page** | Backup pricing page | Low impact |
| **Unsplash Integration** | Stock image integration | Minor feature |

---

## 8. Configuration Gaps

### 8.1 Missing Configuration

| Config | Vite | Next.js | Description |
|--------|------|---------|-------------|
| `app.config.ts` | ✅ | ❌ | Centralized app configuration |
| `routerConfig.ts` | ✅ | N/A | Router config (not needed in Next.js) |
| `pricing.ts` | ✅ | Partial | Regional pricing configuration |

### 8.2 Environment Variables

Both projects have comprehensive env configuration. Next.js has additional variables for:
- NextAuth configuration
- Server-side secrets
- Additional service integrations

---

## 9. Priority Backlog

### 9.1 Sprint 1 - Critical Gaps (HIGH Priority)

| # | Type | Title | Estimate |
|---|------|-------|----------|
| 1 | Feature | Implement Email Verification Flow | 4h |
| 2 | Feature | Create Invoice Management Pages (Create/Detail) | 8h |
| 3 | Component | Port Invoice Components (6 components) | 6h |
| 4 | Feature | Implement Agent Swarm Workflow Demo Page | 4h |
| 5 | Component | Port Agent Swarm Components (4 components) | 6h |
| 6 | Utility | Add executionStageHelpers utility | 2h |

### 9.2 Sprint 2 - Agent Swarm Workflow (HIGH Priority)

| # | Type | Title | Estimate |
|---|------|-------|----------|
| 7 | Component | Port AgentSwarmRulesUpload component | 8h |
| 8 | Component | Port AgentSwarmTerminal component | 6h |
| 9 | Component | Port BacklogReview component | 12h |
| 10 | Component | Port DataModelReview component | 10h |
| 11 | Component | Port SprintPlanReview component | 10h |
| 12 | Component | Port SwarmLaunchConfirmation component | 6h |

### 9.3 Sprint 3 - Workflow Progress Components (HIGH Priority)

| # | Type | Title | Estimate |
|---|------|-------|----------|
| 13 | Component | Port ExecutionTimer component | 3h |
| 14 | Component | Port StageIndicator component | 3h |
| 15 | Component | Port CompletionStatistics component | 3h |
| 16 | Component | Port CompletionTimeSummary component | 3h |
| 17 | Component | Port TDDProgressDisplay component | 4h |
| 18 | Component | Port TimeComparisonCard component | 2h |

### 9.4 Sprint 4 - GitHub & Developer Tools (MEDIUM Priority)

| # | Type | Title | Estimate |
|---|------|-------|----------|
| 19 | Component | Port GitHubIntegrationCard component | 4h |
| 20 | Component | Port GitHubRepoStatus component | 2h |
| 21 | Page | Create Developer Tools Page | 6h |
| 22 | Lib | Add githubAPI utilities | 3h |
| 23 | Service | Add UserService | 4h |

### 9.5 Sprint 5 - Search & Community (MEDIUM Priority)

| # | Type | Title | Estimate |
|---|------|-------|----------|
| 24 | Component | Port Search Components (4 components) | 6h |
| 25 | Service | Add SemanticSearchService | 4h |
| 26 | Hook | Add useDebounce hook | 1h |
| 27 | Hook | Add useSearchSuggestions hook | 2h |
| 28 | Component | Port Comments component | 6h |

### 9.6 Sprint 6 - Content & Storage (MEDIUM Priority)

| # | Type | Title | Estimate |
|---|------|-------|----------|
| 29 | Component | Port Showcase Components (4 components) | 4h |
| 30 | Component | Port Tutorial Components | 4h |
| 31 | Lib | Add tutorialStorage utilities | 3h |
| 32 | Lib | Add videoStorage utilities | 3h |
| 33 | Service | Add DataModelChatService | 4h |

### 9.7 Sprint 7 - Polish & Utilities (LOW Priority)

| # | Type | Title | Estimate |
|---|------|-------|----------|
| 34 | Page | Create Analytics Dashboard route | 2h |
| 35 | Utility | Add envValidation utility | 2h |
| 36 | Utility | Add authDebug utility | 2h |
| 37 | Utility | Add calc utility | 1h |
| 38 | Lib | Add calendarUtils | 2h |
| 39 | Component | Port Section Components (3 components) | 3h |
| 40 | Lib | Add unsplash integration | 2h |

---

## Summary Statistics

### Total Gaps Identified

| Category | Count | Estimated Hours |
|----------|-------|-----------------|
| Missing Pages | 9 | 24h |
| Missing Components | 35+ | 120h |
| Missing Services | 4 | 16h |
| Missing Hooks | 2 | 3h |
| Missing Utilities | 4 | 7h |
| Missing Lib Files | 6 | 15h |
| **Total** | **60+** | **~185h** |

### Priority Breakdown

| Priority | Items | Estimated Hours |
|----------|-------|-----------------|
| HIGH | 25 | ~110h |
| MEDIUM | 25 | ~60h |
| LOW | 10 | ~15h |

---

## Recommendations

1. **Start with Sprint 1** - Critical gaps affecting core functionality
2. **Prioritize Agent Swarm** - This is a key differentiating feature
3. **Consider component reusability** - Many Vite components can be ported with minimal changes
4. **Test incrementally** - Add tests as components are ported
5. **Document new components** - Update Storybook/documentation as components are added

---

## Appendix A: File Size Reference (Large Components)

These components are large and will require significant effort:

| Component | Lines of Code | Complexity |
|-----------|---------------|------------|
| BacklogReview.tsx | ~97,800 | Very High |
| SprintPlanReview.tsx | ~80,600 | Very High |
| DataModelReview.tsx | ~66,500 | Very High |
| SwarmLaunchConfirmation.tsx | ~38,200 | High |
| AgentSwarmRulesUpload.tsx | ~17,300 | High |
| AIPRDGenerator.tsx | ~15,200 | High |
| AgentSwarmTerminal.tsx | ~12,000 | High |
| Comments.tsx | ~11,800 | Medium |
| TDDProgressDisplay.tsx | ~11,600 | Medium |
| RLHFFeedback.tsx | ~29,400 | High |

---

## Appendix B: Test Coverage Requirements

When porting components, ensure:

1. Unit tests for all new components (minimum 80% coverage)
2. Integration tests for workflows
3. E2E tests for critical user flows
4. Accessibility tests for UI components

---

*Report generated by AINative Dev Team*
