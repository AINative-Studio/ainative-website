# Component Test Coverage Gap Analysis

**Generated:** 2026-01-19 17:13:22
**Issue:** #354

## Executive Summary

- **Total Component Files:** 573
- **Total Test Files:** 9
- **File Test Coverage:** 1.57%
- **Current Code Coverage:** 9.93% (Statements), 8.54% (Branches), 9.03% (Functions), 10.13% (Lines)
- **Target Coverage:** 50% (Project Threshold)
- **Gap:** 564 files without tests
- **Status:** 🔴 CRITICAL - Significant gap requiring immediate attention

## Coverage Breakdown

### Components Directory
- Total Files: 243
- Test Files: 8
- Coverage: 3.29%

### App Directory
- Total Files: 197
- Test Files: 1
- Coverage: 0.51%

### Services Directory
- Total Files: 48
- Test Files: 0
- Coverage: 0.00%

### Lib Directory
- Total Files: 85
- Test Files: 0
- Coverage: 0.00%

## Untested Components by Priority


### Agent Swarm Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/agent-swarm/AgentDetailModal.tsx | 🔴 Critical | High | 412 |
| components/agent-swarm/SprintPlanReview.tsx | 🟠 High | High | 1730 |
| components/agent-swarm/BacklogReview.tsx | 🟢 Low | High | 2156 |
| components/agent-swarm/DataModelReview.tsx | 🟢 Low | High | 1509 |
| components/agent-swarm/SwarmLaunchConfirmation.tsx | 🟢 Low | High | 779 |
| components/agent-swarm/AgentSwarmRulesUpload.tsx | 🟢 Low | High | 448 |
| components/agent-swarm/AgentSwarmTerminal.tsx | 🟢 Low | High | 365 |
| components/agent-swarm/TDDProgressDisplay.tsx | 🟢 Low | High | 325 |
| components/agent-swarm/CompletionStatistics.tsx | 🟢 Low | Medium | 221 |
| components/agent-swarm/AgentTeamOverview.tsx | 🟢 Low | Medium | 214 |
| components/agent-swarm/AgentCard.tsx | 🟢 Low | Low | 145 |
| components/agent-swarm/ExecutionTimer.tsx | 🟢 Low | Low | 144 |
| components/agent-swarm/StageIndicator.tsx | 🟢 Low | Low | 136 |
| components/agent-swarm/TimeComparisonCard.tsx | 🟢 Low | Low | 135 |
| components/agent-swarm/AgentStatusIndicator.tsx | 🟢 Low | Low | 117 |
| components/agent-swarm/index.ts | 🟢 Low | Low | 81 |

### App: about

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/about/AboutClient.tsx | 🔴 Critical | High | 331 |
| app/about/page.tsx | 🔴 Critical | Low | 80 |

### App: account

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/account/AccountClient.tsx | 🔴 Critical | High | 449 |
| app/account/page.tsx | 🔴 Critical | Low | 15 |
| app/account/layout.tsx | 🟢 Low | Low | 9 |

### App: admin

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/admin/AdminDashboardClient.tsx | 🔴 Critical | High | 399 |
| app/admin/analytics-verify/AnalyticsVerifyClient.tsx | 🔴 Critical | High | 399 |
| app/admin/monitoring/MonitoringClient.tsx | 🔴 Critical | High | 316 |
| app/admin/users/UsersClient.tsx | 🔴 Critical | Medium | 275 |
| app/admin/audit/AuditClient.tsx | 🔴 Critical | Medium | 272 |
| app/admin/analytics-verify/page.tsx | 🔴 Critical | Low | 19 |
| app/admin/page.tsx | 🔴 Critical | Low | 10 |
| app/admin/audit/page.tsx | 🔴 Critical | Low | 10 |
| app/admin/users/page.tsx | 🔴 Critical | Low | 10 |
| app/admin/monitoring/page.tsx | 🔴 Critical | Low | 10 |

### App: agent-swarm

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/agent-swarm/AgentSwarmClient.tsx | 🔴 Critical | High | 581 |
| app/agent-swarm/page.tsx | 🔴 Critical | Low | 52 |

### App: ai-kit

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/ai-kit/AIKitClient.tsx | 🔴 Critical | High | 764 |
| app/ai-kit/page.tsx | 🔴 Critical | Low | 104 |

### App: analytics

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/analytics/AnalyticsClient.tsx | 🔴 Critical | High | 509 |
| app/analytics/page.tsx | 🔴 Critical | Low | 15 |

### App: api-reference

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/api-reference/APIReferenceClient.tsx | 🔴 Critical | High | 720 |
| app/api-reference/page.tsx | 🔴 Critical | Low | 86 |

### App: auth

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/auth/signin/SignInClient.tsx | 🔴 Critical | Medium | 220 |
| app/auth/error/ErrorClient.tsx | 🔴 Critical | Medium | 155 |
| app/auth/signout/SignOutClient.tsx | 🔴 Critical | Medium | 153 |
| app/auth/verify-email/VerifyEmailClient.tsx | 🔴 Critical | Low | 122 |
| app/auth/verify-email/page.tsx | 🔴 Critical | Low | 42 |
| app/auth/signout/page.tsx | 🔴 Critical | Low | 15 |
| app/auth/signin/page.tsx | 🔴 Critical | Low | 15 |
| app/auth/error/page.tsx | 🔴 Critical | Low | 15 |

### App: billing

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/billing/BillingClient.tsx | 🔴 Critical | High | 538 |
| app/billing/page.tsx | 🔴 Critical | Low | 15 |
| app/billing/layout.tsx | 🟠 High | Low | 9 |

### App: blog

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/blog/BlogListingClient.tsx | 🔴 Critical | High | 522 |
| app/blog/[slug]/BlogDetailClient.tsx | 🔴 Critical | High | 483 |
| app/blog/[slug]/page.tsx | 🔴 Critical | Low | 65 |
| app/blog/page.tsx | 🔴 Critical | Low | 34 |

### App: community

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/community/videos/[slug]/VideoDetailClient.tsx | 🔴 Critical | High | 619 |
| app/community/CommunityClient.tsx | 🔴 Critical | High | 567 |
| app/community/videos/VideosClient.tsx | 🔴 Critical | High | 503 |
| app/community/videos/[slug]/page.tsx | 🔴 Critical | Low | 144 |
| app/community/page.tsx | 🔴 Critical | Low | 44 |
| app/community/videos/page.tsx | 🔴 Critical | Low | 41 |

### App: contact

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/contact/ContactClient.tsx | 🔴 Critical | High | 343 |
| app/contact/page.tsx | 🔴 Critical | Low | 89 |

### App: credit-history

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/credit-history/CreditHistoryClient.tsx | 🔴 Critical | Medium | 255 |
| app/credit-history/page.tsx | 🔴 Critical | Low | 15 |
| app/credit-history/layout.tsx | 🟢 Low | Low | 9 |

### App: dashboard

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/dashboard/agents/AgentsClient.tsx | 🔴 Critical | High | 1064 |
| app/dashboard/email/EmailManagementClient.tsx | 🔴 Critical | High | 805 |
| app/dashboard/zerodb/ZeroDBClient.tsx | 🔴 Critical | High | 740 |
| app/dashboard/load-testing/LoadTestingClient.tsx | 🔴 Critical | High | 705 |
| app/dashboard/DashboardClient.tsx | 🔴 Critical | High | 676 |
| app/dashboard/api-sandbox/APISandboxClient.tsx | 🔴 Critical | High | 621 |
| app/dashboard/main/MainDashboardClient.tsx | 🔴 Critical | High | 621 |
| app/dashboard/sessions/SessionsClient.tsx | 🔴 Critical | High | 612 |
| app/dashboard/mcp-hosting/MCPHostingClient.tsx | 🔴 Critical | High | 605 |
| app/dashboard/qnn/QNNDashboardClient.tsx | 🔴 Critical | High | 544 |
| app/dashboard/teams/TeamsClient.tsx | 🔴 Critical | High | 496 |
| app/dashboard/organizations/[id]/OrganizationDetailClient.tsx | 🔴 Critical | High | 481 |
| app/dashboard/ai-settings/AISettingsClient.tsx | 🔴 Critical | High | 435 |
| app/dashboard/api-keys/ApiKeysClient.tsx | 🔴 Critical | High | 433 |
| app/dashboard/ai-usage/AIUsageClient.tsx | 🔴 Critical | High | 430 |
| app/dashboard/webhooks/WebhooksClient.tsx | 🔴 Critical | High | 416 |
| app/dashboard/agent-swarm/workflow-demo/WorkflowDemoClient.tsx | 🔴 Critical | High | 383 |
| app/dashboard/agent-swarm/AgentSwarmClient.tsx | 🔴 Critical | High | 379 |
| app/dashboard/qnn/signatures/SignaturesClient.tsx | 🔴 Critical | High | 376 |
| app/dashboard/video/VideoProcessingClient.tsx | 🔴 Critical | High | 350 |
| app/dashboard/usage/UsageClient.tsx | 🔴 Critical | High | 337 |
| app/dashboard/organizations/OrganizationsClient.tsx | 🔴 Critical | Medium | 299 |
| app/dashboard/agent-swarm/workflow-demo/page.tsx | 🔴 Critical | Low | 21 |
| app/dashboard/agent-swarm/page.tsx | 🔴 Critical | Low | 17 |
| app/dashboard/page.tsx | 🔴 Critical | Low | 15 |
| app/dashboard/main/page.tsx | 🔴 Critical | Low | 15 |
| app/dashboard/organizations/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/video/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/ai-settings/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/api-sandbox/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/zerodb/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/agents/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/api-keys/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/usage/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/mcp-hosting/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/sessions/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/teams/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/qnn/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/load-testing/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/webhooks/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/ai-usage/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/email/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/qnn/signatures/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/organizations/[id]/page.tsx | 🔴 Critical | Low | 11 |
| app/dashboard/agent-swarm/workflow-demo/components/AgentSwarmWorkflowProgress.tsx | 🟠 High | High | 436 |
| app/dashboard/layout.tsx | 🟠 High | Low | 9 |

### App: dashboard-landing

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/dashboard-landing/DashboardLandingClient.tsx | 🔴 Critical | High | 305 |
| app/dashboard-landing/page.tsx | 🔴 Critical | Low | 21 |

### App: demo

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/demo/progress-indicators/ProgressIndicatorsDemoClient.tsx | 🔴 Critical | High | 584 |
| app/demo/review/ReviewDemoClient.tsx | 🔴 Critical | Medium | 264 |
| app/demo/review/page.tsx | 🔴 Critical | Low | 17 |
| app/demo/meta-pixel/page.tsx | 🔴 Critical | Low | 15 |
| app/demo/progress-indicators/page.tsx | 🔴 Critical | Low | 11 |
| app/demo/meta-pixel/MetaPixelDemo.tsx | 🟢 Low | Medium | 173 |

### App: design-system

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/design-system/page.tsx | 🔴 Critical | Low | 64 |

### App: design-system-showcase

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/design-system-showcase/DesignSystemShowcaseClient.tsx | 🔴 Critical | High | 1018 |
| app/design-system-showcase/page.tsx | 🔴 Critical | Low | 30 |

### App: dev-resources

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/dev-resources/DevResourcesClient.tsx | 🔴 Critical | High | 1097 |
| app/dev-resources/page.tsx | 🔴 Critical | Low | 49 |

### App: developer-settings

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/developer-settings/DeveloperSettingsClient.tsx | 🔴 Critical | Medium | 281 |
| app/developer-settings/page.tsx | 🔴 Critical | Low | 11 |
| app/developer-settings/layout.tsx | 🟢 Low | Low | 9 |

### App: developer-tools

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/developer-tools/DeveloperToolsClient.tsx | 🔴 Critical | High | 614 |
| app/developer-tools/page.tsx | 🔴 Critical | Low | 21 |

### App: docs

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/docs/DocsClient.tsx | 🔴 Critical | Medium | 233 |
| app/docs/page.tsx | 🔴 Critical | Low | 107 |

### App: download

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/download/DownloadClient.tsx | 🔴 Critical | High | 337 |
| app/download/page.tsx | 🔴 Critical | Low | 52 |

### App: enterprise

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/enterprise/EnterpriseClient.tsx | 🔴 Critical | Medium | 206 |
| app/enterprise/page.tsx | 🔴 Critical | Low | 58 |

### App: events

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/events/EventsCalendarClient.tsx | 🔴 Critical | High | 371 |
| app/events/page.tsx | 🔴 Critical | Low | 16 |

### App: examples

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/examples/ExamplesClient.tsx | 🔴 Critical | High | 679 |
| app/examples/page.tsx | 🔴 Critical | Low | 16 |

### App: faq

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/faq/FAQClient.tsx | 🔴 Critical | Medium | 184 |
| app/faq/page.tsx | 🔴 Critical | Low | 129 |

### App: forgot-password

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/forgot-password/page.tsx | 🔴 Critical | Low | 118 |

### App: getting-started

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/getting-started/GettingStartedClient.tsx | 🔴 Critical | High | 544 |
| app/getting-started/page.tsx | 🔴 Critical | Low | 46 |

### App: integrations

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/integrations/IntegrationsClient.tsx | 🔴 Critical | High | 703 |
| app/integrations/page.tsx | 🔴 Critical | Low | 46 |

### App: invoices

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/invoices/InvoicesClient.tsx | 🔴 Critical | High | 461 |
| app/invoices/[invoiceId]/InvoiceDetailClient.tsx | 🔴 Critical | High | 423 |
| app/invoices/create/CreateInvoiceClient.tsx | 🔴 Critical | Medium | 284 |
| app/invoices/[invoiceId]/page.tsx | 🔴 Critical | Low | 21 |
| app/invoices/page.tsx | 🔴 Critical | Low | 15 |
| app/invoices/create/page.tsx | 🔴 Critical | Low | 15 |
| app/invoices/layout.tsx | 🟢 Low | Low | 9 |

### App: login

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/login/page.tsx | 🔴 Critical | Medium | 202 |
| app/login/callback/OAuthCallbackClient.tsx | 🔴 Critical | Low | 142 |
| app/login/callback/page.tsx | 🔴 Critical | Low | 27 |

### App: notifications

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/notifications/NotificationsClient.tsx | 🔴 Critical | High | 570 |
| app/notifications/page.tsx | 🔴 Critical | Low | 11 |

### App: plan

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/plan/page.tsx | 🔴 Critical | Low | 11 |
| app/plan/layout.tsx | 🟠 High | Low | 9 |

### App: pricing

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/pricing/PricingGeoAwareClient.tsx | 🔴 Critical | High | 508 |
| app/pricing/PricingClient.tsx | 🔴 Critical | High | 437 |
| app/pricing/page.tsx | 🔴 Critical | Low | 115 |

### App: privacy

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/privacy/PrivacyClient.tsx | 🔴 Critical | High | 511 |
| app/privacy/page.tsx | 🔴 Critical | Low | 44 |

### App: products

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/products/zerodb/ZeroDBClient.tsx | 🔴 Critical | High | 484 |
| app/products/ProductsClient.tsx | 🔴 Critical | High | 351 |
| app/products/qnn/QNNClient.tsx | 🔴 Critical | Medium | 236 |
| app/products/page.tsx | 🔴 Critical | Low | 120 |
| app/products/zerodb/page.tsx | 🔴 Critical | Low | 96 |
| app/products/qnn/page.tsx | 🔴 Critical | Low | 55 |

### App: products-enhanced

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/products-enhanced/ProductsEnhancedClient.tsx | 🔴 Critical | High | 509 |
| app/products-enhanced/page.tsx | 🔴 Critical | Low | 30 |

### App: profile

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/profile/ProfileClient.tsx | 🔴 Critical | High | 317 |
| app/profile/page.tsx | 🔴 Critical | Low | 11 |
| app/profile/layout.tsx | 🟢 Low | Low | 9 |

### App: refills

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/refills/CreditRefillsClient.tsx | 🔴 Critical | High | 400 |
| app/refills/page.tsx | 🔴 Critical | Low | 15 |
| app/refills/layout.tsx | 🟢 Low | Low | 9 |

### App: resources

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/resources/ResourcesClient.tsx | 🔴 Critical | Medium | 278 |
| app/resources/page.tsx | 🔴 Critical | Low | 16 |

### App: search

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/search/SearchClient.tsx | 🔴 Critical | Medium | 276 |
| app/search/page.tsx | 🔴 Critical | Low | 16 |

### App: settings

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/settings/SettingsClient.tsx | 🔴 Critical | High | 370 |
| app/settings/page.tsx | 🔴 Critical | Low | 15 |
| app/settings/layout.tsx | 🟢 Low | Low | 9 |

### App: showcases

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/showcases/[slug]/ShowcaseDetailClient.tsx | 🔴 Critical | High | 469 |
| app/showcases/ShowcaseListingClient.tsx | 🔴 Critical | High | 400 |
| app/showcases/[slug]/page.tsx | 🔴 Critical | Low | 30 |
| app/showcases/page.tsx | 🔴 Critical | Low | 16 |

### App: signup

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/signup/page.tsx | 🔴 Critical | Medium | 200 |

### App: support

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/support/SupportClient.tsx | 🔴 Critical | Medium | 293 |
| app/support/page.tsx | 🔴 Critical | Low | 44 |

### App: team

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/team/TeamSettingsClient.tsx | 🔴 Critical | High | 529 |
| app/team/page.tsx | 🔴 Critical | Low | 15 |
| app/team/layout.tsx | 🟢 Low | Low | 9 |

### App: terms

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/terms/TermsClient.tsx | 🔴 Critical | High | 507 |
| app/terms/page.tsx | 🔴 Critical | Low | 44 |

### App: tutorials

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/tutorials/[slug]/watch/TutorialWatchClient.tsx | 🔴 Critical | High | 455 |
| app/tutorials/TutorialListingClient.tsx | 🔴 Critical | High | 343 |
| app/tutorials/[slug]/TutorialDetailClient.tsx | 🔴 Critical | High | 328 |
| app/tutorials/[slug]/page.tsx | 🔴 Critical | Low | 86 |
| app/tutorials/page.tsx | 🔴 Critical | Low | 34 |
| app/tutorials/[slug]/watch/page.tsx | 🔴 Critical | Low | 22 |

### App: webinars

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| app/webinars/[slug]/WebinarDetailClient.tsx | 🔴 Critical | High | 572 |
| app/webinars/WebinarListingClient.tsx | 🔴 Critical | High | 479 |
| app/webinars/[slug]/page.tsx | 🔴 Critical | Low | 66 |
| app/webinars/page.tsx | 🔴 Critical | Low | 16 |

### Branding Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/branding/BrandedWelcome.tsx | 🟢 Low | High | 301 |
| components/branding/EnhancedStatCard.tsx | 🟢 Low | Medium | 243 |
| components/branding/BrandedWelcome.test.tsx | 🟢 Low | Medium | 233 |
| components/branding/BrandedWelcome.stories.tsx | 🟢 Low | Medium | 228 |
| components/branding/index.tsx | 🟢 Low | Medium | 205 |
| components/branding/BrandedEmpty.tsx | 🟢 Low | Medium | 163 |

### Invoice Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/invoices/PaymentForm.tsx | 🔴 Critical | High | 301 |
| components/invoices/InvoiceDetailModal.tsx | 🔴 Critical | Medium | 244 |
| components/invoices/PaymentButton.tsx | 🔴 Critical | Medium | 178 |
| components/invoices/InvoiceList.tsx | 🟡 Medium | High | 409 |
| components/invoices/LineItemEditor.tsx | 🟡 Medium | Medium | 197 |
| components/invoices/InvoiceCard.tsx | 🟢 Low | Low | 145 |
| components/invoices/InvoiceStatusBadge.tsx | 🟢 Low | Low | 34 |
| components/invoices/index.ts | 🟢 Low | Low | 16 |

### Layout Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/layout/DashboardLayout.tsx | 🔴 Critical | Low | 110 |
| components/layout/Header.tsx | 🟢 Low | Medium | 275 |
| components/layout/Sidebar.tsx | 🟢 Low | Medium | 220 |
| components/layout/SidebarNew.tsx | 🟢 Low | Medium | 186 |
| components/layout/Footer.tsx | 🟢 Low | Medium | 176 |

### Library

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| lib/review-export-service.ts | 🔴 Critical | High | 495 |
| lib/api-client.ts | 🔴 Critical | Low | 125 |
| lib/auth-helpers.ts | 🔴 Critical | Low | 53 |
| lib/auth/options.ts | 🟠 High | Medium | 278 |
| lib/ignore-cli.ts | 🟢 Low | High | 890 |
| lib/tutorialStorage.ts | 🟢 Low | High | 461 |
| lib/videoStorage.ts | 🟢 Low | High | 436 |
| lib/api-proxy-utils.ts | 🟢 Low | Medium | 287 |
| lib/performance/web-vitals.ts | 🟢 Low | Medium | 281 |
| lib/cache-revalidation.ts | 🟢 Low | Medium | 257 |
| lib/swr-config.ts | 🟢 Low | Medium | 253 |
| lib/examples/tool-execution-integration-example.ts | 🟢 Low | Medium | 246 |
| lib/types/review.ts | 🟢 Low | Medium | 235 |
| lib/githubAPI.ts | 🟢 Low | Medium | 229 |
| lib/cache-config.ts | 🟢 Low | Medium | 225 |
| lib/env.ts | 🟢 Low | Medium | 182 |
| lib/calendarUtils.ts | 🟢 Low | Medium | 161 |
| lib/webinarAPI.ts | 🟢 Low | Medium | 155 |
| lib/analytics/sentry.ts | 🟢 Low | Low | 145 |
| lib/rate-limit-config.ts | 🟢 Low | Low | 139 |
| lib/analytics/chatwoot.ts | 🟢 Low | Low | 133 |
| lib/config/app.ts | 🟢 Low | Low | 122 |
| lib/analytics/ga4.ts | 🟢 Low | Low | 122 |
| lib/calendarGenerator.ts | 🟢 Low | Low | 114 |
| lib/analytics/index.ts | 🟢 Low | Low | 106 |
| lib/analytics/gtm.ts | 🟢 Low | Low | 105 |
| lib/certificateGenerator.ts | 🟢 Low | Low | 91 |
| lib/react-query.ts | 🟢 Low | Low | 88 |
| lib/analytics/speed-insights.ts | 🟢 Low | Low | 82 |
| lib/unsplash.ts | 🟢 Low | Low | 52 |
| lib/community/search.ts | 🟢 Low | Low | 30 |

### Provider Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/providers/QueryProvider.tsx | 🔴 Critical | Low | 39 |
| components/providers/session-provider.tsx | 🔴 Critical | Low | 11 |

### Section Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/sections/Documentation.tsx | 🟢 Low | Low | 122 |
| components/sections/Solutions.tsx | 🟢 Low | Low | 121 |
| components/sections/AudioDemo.tsx | 🟢 Low | Low | 71 |
| components/sections/index.ts | 🟢 Low | Low | 3 |

### Services

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| services/QNNApiClient.ts | 🔴 Critical | High | 996 |
| services/InvoiceService.ts | 🔴 Critical | High | 482 |
| services/zerodb/rlhf-service.ts | 🔴 Critical | High | 478 |
| services/pricingService.ts | 🔴 Critical | High | 454 |
| services/DataModelChatService.ts | 🔴 Critical | High | 404 |
| services/zerodb/streaming-service.ts | 🔴 Critical | High | 402 |
| services/ConversionTrackingService.ts | 🔴 Critical | High | 391 |
| services/zerodb/database-service.ts | 🔴 Critical | High | 391 |
| services/zerodb/security-service.ts | 🔴 Critical | High | 387 |
| services/AgentSwarmService.ts | 🔴 Critical | High | 378 |
| services/AuthService.ts | 🔴 Critical | High | 343 |
| services/zerodb/analytics-service.ts | 🔴 Critical | High | 322 |
| services/unsplashService.ts | 🔴 Critical | High | 320 |
| services/zerodb/agent-service.ts | 🔴 Critical | High | 319 |
| services/zerodb/vector-service.ts | 🔴 Critical | High | 314 |
| services/zerodb/storage-service.ts | 🔴 Critical | High | 313 |
| services/UserService.ts | 🔴 Critical | Medium | 284 |
| services/SemanticSearchService.ts | 🔴 Critical | Medium | 263 |
| services/webinarService.ts | 🔴 Critical | Medium | 257 |
| services/benchmarkService.ts | 🔴 Critical | Medium | 255 |
| services/DashboardService.ts | 🔴 Critical | Medium | 238 |
| services/GitHubService.ts | 🔴 Critical | Medium | 220 |
| services/luma/client.ts | 🔴 Critical | Medium | 209 |
| services/RLHFService.ts | 🔴 Critical | Medium | 151 |
| services/qnn/code-analysis.ts | 🟢 Low | High | 389 |
| services/luma/endpoints/events.ts | 🟢 Low | Medium | 240 |
| services/unsplashCache.ts | 🟢 Low | Medium | 214 |
| services/luma/types.ts | 🟢 Low | Medium | 193 |
| services/unsplashRateLimit.ts | 🟢 Low | Medium | 173 |
| services/luma/endpoints/calendar.ts | 🟢 Low | Medium | 172 |
| services/types/unsplash.types.ts | 🟢 Low | Low | 124 |
| services/unsplashAttribution.ts | 🟢 Low | Low | 114 |
| services/zerodb/index.ts | 🟢 Low | Low | 103 |
| services/luma/index.ts | 🟢 Low | Low | 70 |

### Tutorial Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/tutorial/NotesPanel.tsx | 🟡 Medium | High | 801 |
| components/tutorial/QuizPanel.tsx | 🟡 Medium | High | 717 |
| components/tutorial/ResourcesPanel.tsx | 🟡 Medium | High | 475 |
| components/tutorial/ProgressTracker.tsx | 🟢 Low | High | 599 |
| components/tutorial/CertificateGenerator.tsx | 🟢 Low | High | 456 |
| components/tutorial/CodeSnippet.tsx | 🟢 Low | High | 341 |
| components/tutorial/ChapterNavigation.tsx | 🟢 Low | High | 329 |
| components/tutorial/index.ts | 🟢 Low | Low | 14 |

### UI Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/ui/form.tsx | 🔴 Critical | Medium | 179 |
| components/ui/alert-dialog.tsx | 🔴 Critical | Low | 141 |
| components/ui/dialog.tsx | 🔴 Critical | Low | 122 |
| components/ui/form-branded.tsx | 🔴 Critical | Low | 64 |
| components/ui/table.tsx | 🟡 Medium | Low | 120 |
| components/ui/chart.tsx | 🟢 Low | High | 369 |
| components/ui/progress/ErrorDisplay.tsx | 🟢 Low | High | 342 |
| components/ui/progress/StreamingProgress.tsx | 🟢 Low | High | 326 |
| components/ui/progress/ToolExecutionStatus.tsx | 🟢 Low | Medium | 271 |
| components/ui/progress/LongOperationIndicator.tsx | 🟢 Low | Medium | 268 |
| components/ui/carousel.tsx | 🟢 Low | Medium | 260 |
| components/ui/menubar.tsx | 🟢 Low | Medium | 240 |
| components/ui/dropdown-menu.tsx | 🟢 Low | Medium | 205 |
| components/ui/context-menu.tsx | 🟢 Low | Medium | 204 |
| components/ui/select-branded.tsx | 🟢 Low | Medium | 188 |
| components/ui/spinner-branded.tsx | 🟢 Low | Medium | 164 |
| components/ui/select.tsx | 🟢 Low | Medium | 160 |
| components/ui/command.tsx | 🟢 Low | Medium | 155 |
| components/ui/sheet.tsx | 🟢 Low | Low | 140 |
| components/ui/card-advanced.tsx | 🟢 Low | Low | 138 |
| components/ui/breadcrumb.tsx | 🟢 Low | Low | 131 |
| components/ui/navigation-menu.tsx | 🟢 Low | Low | 130 |
| components/ui/toast.tsx | 🟢 Low | Low | 129 |
| components/ui/pagination.tsx | 🟢 Low | Low | 121 |
| components/ui/drawer.tsx | 🟢 Low | Low | 118 |
| components/ui/skeleton-branded.tsx | 🟢 Low | Low | 109 |
| components/ui/gradient-text.tsx | 🟢 Low | Low | 105 |
| components/ui/route-loading.tsx | 🟢 Low | Low | 94 |
| components/ui/calendar.tsx | 🟢 Low | Low | 75 |
| components/ui/input-otp.tsx | 🟢 Low | Low | 69 |
| components/ui/toggle-group.tsx | 🟢 Low | Low | 59 |
| components/ui/accordion.tsx | 🟢 Low | Low | 58 |
| components/ui/tabs.tsx | 🟢 Low | Low | 55 |
| components/ui/avatar.tsx | 🟢 Low | Low | 50 |
| components/ui/progress/ProgressContext.tsx | 🟢 Low | Low | 49 |
| components/ui/scroll-area.tsx | 🟢 Low | Low | 48 |
| components/ui/input-branded.tsx | 🟢 Low | Low | 45 |
| components/ui/textarea-branded.tsx | 🟢 Low | Low | 44 |
| components/ui/radio-group.tsx | 🟢 Low | Low | 44 |
| components/ui/resizable.tsx | 🟢 Low | Low | 43 |
| components/ui/toggle.tsx | 🟢 Low | Low | 43 |
| components/ui/toaster.tsx | 🟢 Low | Low | 35 |
| components/ui/button-custom.tsx | 🟢 Low | Low | 34 |
| components/ui/popover.tsx | 🟢 Low | Low | 33 |
| components/ui/sonner.tsx | 🟢 Low | Low | 31 |
| components/ui/tooltip.tsx | 🟢 Low | Low | 30 |
| components/ui/checkbox.tsx | 🟢 Low | Low | 30 |
| components/ui/hover-card.tsx | 🟢 Low | Low | 29 |
| components/ui/switch.tsx | 🟢 Low | Low | 29 |
| components/ui/slider.tsx | 🟢 Low | Low | 28 |
| components/ui/label.tsx | 🟢 Low | Low | 26 |
| components/ui/textarea.tsx | 🟢 Low | Low | 24 |
| components/ui/progress/index.ts | 🟢 Low | Low | 21 |
| components/ui/collapsible.tsx | 🟢 Low | Low | 9 |
| components/ui/aspect-ratio.tsx | 🟢 Low | Low | 5 |

### Video Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/video/VideoPlayerControls.tsx | 🟢 Low | High | 510 |
| components/video/TutorialVideoPlayer.tsx | 🟢 Low | High | 459 |
| components/video/VideoPlayer.tsx | 🟢 Low | High | 415 |
| components/video/ThumbnailPreview.tsx | 🟢 Low | Medium | 205 |
| components/video/ChapterMarkers.tsx | 🟢 Low | Low | 95 |
| components/video/index.ts | 🟢 Low | Low | 21 |

### Webinar Components

| Component | Priority | Complexity | Lines |
|-----------|----------|------------|-------|
| components/webinar/RegistrationForm.tsx | 🔴 Critical | Medium | 161 |
| components/webinar/QASection.tsx | 🟡 Medium | Low | 143 |
| components/webinar/UpcomingWebinarCard.tsx | 🟢 Low | Medium | 222 |
| components/webinar/AttendanceCertificate.tsx | 🟢 Low | Medium | 170 |
| components/webinar/QATimestamps.tsx | 🟢 Low | Medium | 169 |
| components/webinar/SpeakerBio.tsx | 🟢 Low | Medium | 161 |
| components/webinar/WebinarCard.tsx | 🟢 Low | Medium | 153 |
| components/webinar/WebinarFilters.tsx | 🟢 Low | Medium | 151 |
| components/webinar/WebinarResources.tsx | 🟢 Low | Low | 141 |
| components/webinar/CalendarButtons.tsx | 🟢 Low | Low | 129 |
| components/webinar/CertificateViewer.tsx | 🟢 Low | Low | 125 |
| components/webinar/SpeakerInfo.tsx | 🟢 Low | Low | 104 |
| components/webinar/CalendarExport.tsx | 🟢 Low | Low | 93 |


## Top 20 Critical Components Needing Tests

These components have been prioritized based on:
1. Business logic complexity
2. User-facing importance
3. Critical functionality (auth, payments, data mutations)
4. Lines of code (complexity proxy)

| # | Component | Priority | Complexity | Lines | Reason |
|---|-----------|----------|------------|-------|--------|
| 1 | app/dev-resources/DevResourcesClient.tsx | Critical | High | 1097 | Client component with state |
| 2 | app/dashboard/agents/AgentsClient.tsx | Critical | High | 1064 | Client component with state |
| 3 | app/design-system-showcase/DesignSystemShowcaseClient.tsx | Critical | High | 1018 | Client component with state |
| 4 | services/QNNApiClient.ts | Critical | High | 996 | Client component with state |
| 5 | app/dashboard/email/EmailManagementClient.tsx | Critical | High | 805 | Client component with state |
| 6 | app/ai-kit/AIKitClient.tsx | Critical | High | 764 | Client component with state |
| 7 | app/dashboard/zerodb/ZeroDBClient.tsx | Critical | High | 740 | Client component with state |
| 8 | app/api-reference/APIReferenceClient.tsx | Critical | High | 720 | Client component with state |
| 9 | app/dashboard/load-testing/LoadTestingClient.tsx | Critical | High | 705 | Client component with state |
| 10 | app/integrations/IntegrationsClient.tsx | Critical | High | 703 | Client component with state |
| 11 | app/examples/ExamplesClient.tsx | Critical | High | 679 | Client component with state |
| 12 | app/dashboard/DashboardClient.tsx | Critical | High | 676 | Client component with state |
| 13 | app/dashboard/api-sandbox/APISandboxClient.tsx | Critical | High | 621 | Client component with state |
| 14 | app/dashboard/main/MainDashboardClient.tsx | Critical | High | 621 | Client component with state |
| 15 | app/community/videos/[slug]/VideoDetailClient.tsx | Critical | High | 619 | Client component with state |
| 16 | app/developer-tools/DeveloperToolsClient.tsx | Critical | High | 614 | Client component with state |
| 17 | app/dashboard/sessions/SessionsClient.tsx | Critical | High | 612 | Client component with state |
| 18 | app/dashboard/mcp-hosting/MCPHostingClient.tsx | Critical | High | 605 | Client component with state |
| 19 | app/demo/progress-indicators/ProgressIndicatorsDemoClient.tsx | Critical | High | 584 | Client component with state |
| 20 | app/agent-swarm/AgentSwarmClient.tsx | Critical | High | 581 | Client component with state |


## Priority Test Implementation Plan

### Phase 1: Critical Components (Week 1) - Top 20
**Focus:** Business logic, authentication, payments, data mutations

**Components to test:**
1. `app/dev-resources/DevResourcesClient.tsx`
2. `app/dashboard/agents/AgentsClient.tsx`
3. `app/design-system-showcase/DesignSystemShowcaseClient.tsx`
4. `services/QNNApiClient.ts`
5. `app/dashboard/email/EmailManagementClient.tsx`
6. `app/ai-kit/AIKitClient.tsx`
7. `app/dashboard/zerodb/ZeroDBClient.tsx`
8. `app/api-reference/APIReferenceClient.tsx`
9. `app/dashboard/load-testing/LoadTestingClient.tsx`
10. `app/integrations/IntegrationsClient.tsx`
11. `app/examples/ExamplesClient.tsx`
12. `app/dashboard/DashboardClient.tsx`
13. `app/dashboard/api-sandbox/APISandboxClient.tsx`
14. `app/dashboard/main/MainDashboardClient.tsx`
15. `app/community/videos/[slug]/VideoDetailClient.tsx`
16. `app/developer-tools/DeveloperToolsClient.tsx`
17. `app/dashboard/sessions/SessionsClient.tsx`
18. `app/dashboard/mcp-hosting/MCPHostingClient.tsx`
19. `app/demo/progress-indicators/ProgressIndicatorsDemoClient.tsx`
20. `app/agent-swarm/AgentSwarmClient.tsx`


### Phase 2: High Priority Components (Week 2) - Next 30
**Focus:** Dashboard components, settings, user management

### Phase 3: Medium Priority Components (Week 3) - Next 50
**Focus:** Feature components, forms, navigation

### Phase 4: Low Priority Components (Week 4) - Remaining
**Focus:** UI components, simple wrappers, presentational components

## Testing Standards

### Required Test Coverage Per Component

#### Unit Tests (Required for all)
- ✅ Renders without crashing
- ✅ Props are correctly passed and displayed
- ✅ Event handlers work correctly
- ✅ Conditional rendering based on state/props
- ✅ Edge cases (null, undefined, empty arrays)
- ✅ Error boundaries

#### Integration Tests (Complex components)
- ✅ Component interactions with child components
- ✅ API calls with mocked responses
- ✅ Form submission workflows
- ✅ Navigation flows

#### Accessibility Tests (User-facing components)
- ✅ ARIA labels present
- ✅ Keyboard navigation works
- ✅ Screen reader compatibility
- ✅ Focus management

### Test Pattern Example

```typescript
// components/ui/__tests__/example-component.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExampleComponent from '../example-component';

describe('ExampleComponent', () => {
  // Given-When-Then pattern
  describe('Rendering', () => {
    it('should render with required props', () => {
      // Given
      const props = {{ title: 'Test', onSave: jest.fn() }};

      // When
      render(<ExampleComponent {{...props}} />);

      // Then
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onSave when button clicked', async () => {
      // Given
      const onSave = jest.fn();
      const user = userEvent.setup();
      render(<ExampleComponent onSave={{onSave}} />);

      // When
      await user.click(screen.getByRole('button', {{ name: /save/i }}));

      // Then
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should display error message on failure', async () => {
      // Given
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      render(<ExampleComponent onSave={{onSave}} />);

      // When
      fireEvent.click(screen.getByRole('button', {{ name: /save/i }}));

      // Then
      await waitFor(() => {
        expect(screen.getByText(/save failed/i)).toBeInTheDocument();
      });
    });
  });
});
```

### Coverage Thresholds

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
  // Per-file thresholds for critical files
  './components/ui/button.tsx': {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## Jest Configuration Optimization

### Current Issues
1. ❌ Coverage thresholds not met (9.93% vs 50% target)
2. ❌ Many test failures (37 failing tests)
3. ❌ Slow test execution
4. ⚠️ Missing test isolation

### Recommended Improvements

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // Better module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },

  // Comprehensive test matching
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage collection
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/e2e/**',
    '!**/.next/**',
    '!**/coverage/**',
  ]],

  // Updated thresholds (gradual improvement)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/coverage/',
  ]],

  // Performance
  maxWorkers: '50%',
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};

module.exports = createJestConfig(customJestConfig);
```

## Next Steps

### Immediate Actions (This Week)
1. ✅ Review this gap analysis report
2. 📝 Create GitHub issues for top 20 critical components
3. 🧪 Begin implementing tests for Phase 1 components
4. ⚙️ Optimize Jest configuration
5. 🔧 Fix failing tests

### Short-term Goals (Next 2 Weeks)
1. 🎯 Achieve 30% file test coverage
2. 🎯 Achieve 25% code coverage (statements)
3. 🧪 Complete Phase 1 critical component tests
4. 📊 Set up coverage tracking in CI/CD

### Long-term Goals (Next Month)
1. 🎯 Achieve 80% file test coverage
2. 🎯 Achieve 50% code coverage (meet thresholds)
3. 🧪 Complete all high and medium priority tests
4. 📈 Implement coverage ratcheting (prevent regression)
5. 🔄 Regular coverage reviews in PRs

## Automation Recommendations

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run test -- --coverage --changedSince=main
```

### PR Quality Gates
- Require tests for new components
- Block PRs that decrease coverage
- Require 80% coverage for new code

### Coverage Badges
Add coverage badges to README:
```markdown
![Coverage](https://img.shields.io/badge/coverage-9.93%25-red)
![Tests](https://img.shields.io/badge/tests-899%20passing-green)
```

## Useful Commands

```bash
# Run all tests with coverage
npm test -- --coverage

# Run tests for specific file
npm test -- button.test.tsx

# Run tests in watch mode
npm test -- --watch

# Update snapshots
npm test -- -u

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://testing-library.com/docs/queries/about/#priority)

---

**Report Generated:** 2026-01-19 17:13:22
**Total Untested Files:** 380
**Priority Distribution:** Critical: 218, High: 6, Medium: 7, Low: 149
