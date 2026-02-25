# AINative Studio Frontend - Complete Architecture Map

> **Generated**: 2026-02-18 | **Framework**: Next.js 16 + React 19 + TypeScript
> **This document serves as the single source of truth for all frontend architecture decisions, file locations, and integration points.**

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Directory Structure](#2-directory-structure)
3. [Route Map (107 Routes)](#3-route-map)
4. [Component Inventory (269 Components)](#4-component-inventory)
5. [Services & API Integration](#5-services--api-integration)
6. [Hooks (22 Custom Hooks)](#6-hooks)
7. [Contexts & Providers](#7-contexts--providers)
8. [Types & Interfaces](#8-types--interfaces)
9. [Middleware & Auth](#9-middleware--auth)
10. [Design System](#10-design-system)
11. [Testing Infrastructure](#11-testing-infrastructure)
12. [Build & Config](#12-build--config)
13. [Backend API URL Map](#13-backend-api-url-map)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.1 |
| **Language** | TypeScript | 5.x |
| **UI Library** | React | 19.2.0 |
| **Styling** | Tailwind CSS v4 + PostCSS | 4.x |
| **Component Library** | shadcn/ui (Radix UI primitives) | Latest |
| **State Management** | TanStack React Query | 5.90.12 |
| **Forms** | react-hook-form + Zod validation | 7.69.0 / 4.1.13 |
| **Animation** | Framer Motion | 12.23.26 |
| **Auth** | NextAuth.js v4 + Custom JWT | 4.24.13 |
| **Payments** | Stripe (react-stripe-js) | 5.4.1 |
| **Charts** | Recharts | 3.6.0 |
| **Icons** | Lucide React + React Icons | 0.562.0 |
| **HTTP Client** | Native fetch (ApiClient) + Axios (QNN only) | - |
| **Video** | HLS.js | 1.6.15 |
| **Error Tracking** | Sentry (@sentry/nextjs) | 10.38.0 |
| **Analytics** | GA4, GTM, Meta Pixel, Vercel Speed Insights | - |
| **Testing** | Jest + React Testing Library + Playwright | - |
| **Mocking** | MSW (Mock Service Worker) | - |
| **ORM** | Prisma (NextAuth sessions) | 5.22.0 |
| **Theming** | next-themes (dark/light) | 0.4.6 |
| **Toast** | Sonner | 2.0.7 |
| **Carousel** | Embla Carousel | 8.6.0 |
| **Markdown** | react-markdown | 10.1.0 |
| **Code Highlight** | react-syntax-highlighter | 16.1.0 |

---

## 2. Directory Structure

```
ainative-website-nextjs/
├── app/                          # Next.js App Router (95 page routes + 12 API routes)
│   ├── layout.tsx                # Root layout: ThemeProvider > SessionProvider > QueryProvider > ConditionalLayout
│   ├── page.tsx                  # Homepage (ISR 600s)
│   ├── globals.css               # Global styles + CSS variables + Tailwind v4 @theme
│   ├── auth/                     # Auth pages (signin, signout, error, verify-email)
│   ├── login/                    # Login + OAuth callback
│   ├── signup/                   # Registration
│   ├── dashboard/                # Dashboard (DashboardLayout) - 20+ sub-routes
│   ├── admin/                    # Admin panel (AdminLayout) - 7 sub-routes
│   ├── blog/                     # Blog listing + [slug] detail
│   ├── community/                # Community hub + videos
│   ├── tutorials/                # Tutorial listing + [slug]/watch
│   ├── webinars/                 # Webinar listing + [slug] detail
│   ├── showcases/                # Showcase listing + [slug] detail
│   ├── products/                 # Products + QNN + ZeroDB sub-pages
│   ├── pricing/                  # Pricing page
│   ├── api/                      # API routes (auth, backend proxy, tutorials, webinars, revalidate)
│   ├── account/                  # Account settings (DashboardLayout)
│   ├── billing/                  # Billing management (DashboardLayout)
│   ├── invoices/                 # Invoice CRUD (DashboardLayout)
│   ├── developer/                # Developer earnings/payouts (DashboardLayout)
│   └── demo/                     # Demo/showcase pages
├── components/                   # 269 component files in 35 subdirectories
│   ├── ui/                       # 44+ shadcn/ui + custom branded components
│   ├── layout/                   # Header, Footer, Sidebar, DashboardLayout, ConditionalLayout
│   ├── providers/                # QueryProvider, SessionProvider, ThemeProvider
│   ├── agent-swarm/              # 23 files: wizard, terminal, monitoring, RLHF
│   ├── zerodb/                   # 14+ files: database management, vector search, tabs
│   ├── qnn/                      # 16 files: models, training, benchmarking, signatures
│   ├── webinar/                  # 13 files: registration, calendar, certificates, Q&A
│   ├── tutorial/                 # 7 files: chapters, quizzes, progress, certificates
│   ├── video/                    # 5 files: player, controls, chapters
│   ├── billing/                  # 5 files: credit charts, payment methods, invoices
│   ├── invoices/                 # 7 files: cards, modals, status badges, payment
│   ├── admin/                    # AdminSidebar, AdminHeader, AdminCard
│   ├── marketing/                # Company logos, feature comparison, trust signals
│   ├── branding/                 # BrandedWelcome, BrandedEmpty, EnhancedStatCard
│   ├── icons/                    # 30+ organized icons (actions, content, dashboard, features, nav, social, status)
│   ├── seo/                      # StructuredData (10+ JSON-LD schemas)
│   ├── analytics/                # GA4, GTM, Meta Pixel, Speed Insights, Web Vitals
│   ├── guards/                   # AdminRouteGuard
│   ├── search/                   # SearchInput + SuggestionsDropdown
│   ├── showcase/                 # Video cards, tech badges, animations
│   ├── community/                # Comments (Strapi CMS)
│   ├── lazy/                     # Code-split lazy-loaded components
│   ├── checkout/                 # StripePaymentForm
│   ├── aikit/                    # AIKit component library (buttons, checkboxes, tabs)
│   └── github/                   # GitHubRepoStatus, GitHubIntegrationCard
├── services/                     # API service layer (30+ files)
│   ├── zerodb/                   # 8 ZeroDB service modules
│   ├── admin/                    # 12 admin service files (AdminApiClient)
│   ├── luma/                     # 4 Luma event API files
│   └── qnn/                      # QNN-specific services
├── hooks/                        # 22 custom React hooks
├── contexts/                     # React contexts (QNNContext)
├── lib/                          # 60+ library files
│   ├── config/app.ts             # Centralized app config
│   ├── api-client.ts             # Core API client (fetch-based)
│   ├── env.ts                    # Zod-validated env vars
│   ├── auth/options.ts           # NextAuth configuration
│   ├── rate-limit.ts             # In-memory rate limiting
│   ├── analytics/                # GA4, GTM, Sentry, Chatwoot, Speed Insights
│   ├── utils/                    # Export, color contrast, slug generation
│   └── [40+ service files]       # Agent, email, notification, team, org, video, webhook, etc.
├── types/                        # 11 TypeScript type definition files
├── utils/                        # 7 utility files (API client, auth cookies, geo detection)
├── config/                       # Pricing configuration (regional pricing)
├── middleware.ts                  # Auth route protection (edge middleware)
├── middleware/                    # Rate limiting middleware
├── styles/                       # video-player.css only
├── prisma/                       # Prisma schema (NextAuth User/Account/Session models)
├── public/                       # Static assets (logos, manifest, robots.txt, sitemap)
├── mocks/                        # MSW infrastructure (26 files, 12 handler modules, 6 factories)
├── __tests__/                    # Unit/integration tests (30+ files)
├── test/                         # Verification scripts (70+ files)
├── e2e/                          # Playwright E2E tests (20+ files, 7 browser configs)
├── scripts/                      # Build analysis, testing, verification (15 files)
└── docs/                         # 80+ documentation files
```

---

## 3. Route Map

### Page Architecture Pattern

Nearly every page follows this pattern:
```
app/[route]/page.tsx          (Server Component) - exports metadata, renders *Client
app/[route]/[Feature]Client.tsx  (Client Component) - 'use client', all interactivity
```

### Public Marketing Routes

| Route | ISR | SEO | Description |
|-------|-----|-----|-------------|
| `/` | 600s | Full + JSON-LD | Homepage landing |
| `/about` | 3600s | JSON-LD Organization | Company info |
| `/pricing` | 300s | JSON-LD Product + Offers | Free/Pro/Teams/Enterprise |
| `/products` | 1800s | JSON-LD ItemList | Product suite overview |
| `/products/qnn` | - | Full | Quantum Neural Networks |
| `/products/zerodb` | - | JSON-LD SoftwareApplication | ZeroDB vector database |
| `/products-enhanced` | - | OG | Cody IDE |
| `/enterprise` | - | Full | Enterprise platform |
| `/download` | - | Full | IDE download |
| `/contact` | - | JSON-LD ContactPage | Contact form |
| `/privacy` | - | Full | Privacy policy |
| `/terms` | - | Full | Terms of service |
| `/faq` | 1800s | JSON-LD FAQPage | 14 FAQ items |
| `/support` | - | Full | Support center |

### Developer/Docs Routes

| Route | Description |
|-------|-------------|
| `/docs` | Documentation hub |
| `/getting-started` | Quick start guide |
| `/api-reference` | Interactive API docs (ZeroDB, Agent Swarm, Memory) |
| `/dev-resources` | API docs, UI resources, dev tools |
| `/developer-tools` | API testing, SDKs, docs |
| `/examples` | Code examples gallery |
| `/examples/aikit-slider` | AIKitSlider live example |
| `/integrations` | Third-party integrations |
| `/resources` | SDKs, MCP servers, templates |
| `/design-system` | Coming soon placeholder |
| `/design-system-showcase` | 14 NPM packages, 57+ components |

### Auth Routes (force-dynamic, noindex)

| Route | Description |
|-------|-------------|
| `/auth/signin` | NextAuth sign-in |
| `/auth/signout` | NextAuth sign-out |
| `/auth/error` | Auth error page |
| `/auth/verify-email` | Email verification |
| `/login` | Custom login form |
| `/login/callback` | OAuth callback handler |
| `/signup` | Registration form (inline client component) |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |

### Content Routes

| Route | ISR | Description |
|-------|-----|-------------|
| `/blog` | - | Blog listing |
| `/blog/[slug]` | 300s | Blog post detail |
| `/community` | - | Community hub |
| `/community/videos` | - | Video listing |
| `/community/videos/[slug]` | 900s | Video detail |
| `/webinars` | - | Webinar listing |
| `/webinars/[slug]` | 300s | Webinar detail |
| `/tutorials` | - | Tutorial listing |
| `/tutorials/[slug]/watch` | - | Tutorial player |
| `/showcases` | - | Showcase listing |
| `/showcases/[slug]` | - | Showcase detail |
| `/events` | - | Events calendar |
| `/search` | - | Semantic search |

### Dashboard Routes (DashboardLayout, noindex)

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard (usage, credits, AI metrics) |
| `/dashboard/main` | Charts, real-time data |
| `/dashboard/agent-swarm` | PRD upload, agent management |
| `/dashboard/agent-swarm/workflow-demo` | 9-step workflow with RLHF |
| `/dashboard/agent-swarm-wizard` | Multi-step project creation wizard |
| `/dashboard/agents` | Agent framework (create/configure/manage) |
| `/dashboard/ai-settings` | AI model registry |
| `/dashboard/ai-settings/[slug]` | Model detail (playground, API docs) |
| `/dashboard/ai-usage` | Model usage, costs, performance |
| `/dashboard/api-keys` | Auth credentials (ZeroDB, QNN) |
| `/dashboard/api-sandbox` | API testing sandbox |
| `/dashboard/email` | Email templates, analytics |
| `/dashboard/load-testing` | Performance testing |
| `/dashboard/mcp-hosting` | MCP server management |
| `/dashboard/organizations` | Organization management |
| `/dashboard/organizations/[id]` | Organization detail |
| `/dashboard/qnn` | QNN models, training, metrics |
| `/dashboard/qnn/signatures` | Quantum-resistant signatures |
| `/dashboard/sessions` | AI sessions, memory context |
| `/dashboard/teams` | Team management |
| `/dashboard/usage` | Account usage, credits |
| `/dashboard/video` | Video processing |
| `/dashboard/webhooks` | Webhook configuration |
| `/dashboard/zerodb` | ZeroDB namespace explorer, query builder |

### Account/Settings Routes (DashboardLayout, noindex)

| Route | Description |
|-------|-------------|
| `/account` | Account settings, AI metrics |
| `/billing` | Payment methods, billing history |
| `/credit-history` | Credit transactions |
| `/developer-settings` | API access, webhooks |
| `/invoices` | Invoice listing |
| `/invoices/create` | Create invoice |
| `/invoices/[invoiceId]` | Invoice detail |
| `/plan` | Subscription management |
| `/profile` | Profile management |
| `/refills` | Purchase prompt credits |
| `/settings` | Notification preferences |
| `/team` | Team members, roles |
| `/notifications` | Notification management |
| `/developer/earnings` | Revenue breakdown |
| `/developer/payouts` | Payment methods, tax forms |

### Admin Routes (AdminLayout + AdminRouteGuard)

| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard |
| `/admin/audit` | Audit log viewer |
| `/admin/monitoring` | System monitoring |
| `/admin/users` | User management |
| `/admin/api-keys` | API keys (placeholder) |
| `/admin/login` | Admin login (placeholder) |
| `/admin/analytics-verify` | Analytics verification |

### API Routes (12 total)

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth handler (5 req/min) |
| `/api/auth/logout` | GET, POST | Cookie cleanup + redirect |
| `/api/backend/[...path]` | ALL | Proxy to api.ainative.studio (60 req/min, 30s timeout) |
| `/api/github/[...path]` | ALL | Proxy to GitHub API (60 req/min) |
| `/api/luma/[...path]` | ALL | Proxy to Luma API (30 req/min) |
| `/api/tutorials/[id]/progress` | GET, DELETE | Tutorial progress |
| `/api/tutorials/[id]/progress/chapter` | POST | Chapter progress |
| `/api/tutorials/[id]/progress/quiz` | POST | Quiz scores (70% pass) |
| `/api/tutorials/[id]/complete` | POST | Mark complete, earn certificate |
| `/api/webinars/[id]/calendar` | GET | Download .ics file |
| `/api/webinars/send-confirmation` | POST | Registration confirmation |
| `/api/revalidate` | GET, POST | ISR cache revalidation (Edge Runtime) |

---

## 4. Component Inventory

### Component Categories Summary

| Category | Files | Key Components |
|----------|-------|----------------|
| **UI Primitives (shadcn/ui)** | 44+ | button, dialog, table, tabs, toast, form, select, input, etc. |
| **Custom Branded UI** | 10+ | button-custom, card-advanced, gradient-text, skeleton-branded, spinner-branded |
| **Layout** | 8 | ConditionalLayout, DashboardLayout, Header, Footer, Sidebar, SidebarNew, AdminSidebar, AdminHeader |
| **Agent Swarm** | 23 | AgentSwarmWizard (7 steps), Terminal, StatusIndicator, Cards, RLHF |
| **ZeroDB** | 14+ | EnhancedZeroDBPage, 8 tab components, data-table, metrics-dashboard |
| **QNN** | 16 | ModelManager, TrainingConfig/History, Benchmarking, QuantumMonitoring, Signatures |
| **Webinar** | 13 | RegistrationForm, CalendarButtons, AttendanceCertificate, Q&A, SpeakerBio |
| **Tutorial** | 7 | ChapterNavigation, QuizPanel, CertificateGenerator, ProgressTracker |
| **Video** | 5 | VideoPlayer, TutorialVideoPlayer, Controls, ChapterMarkers, ThumbnailPreview |
| **Billing/Invoices** | 12 | CreditUsageChart, PaymentMethodManager, InvoiceList, PaymentForm |
| **Marketing** | 6 | CompanyLogos, FeatureComparison, TrustSignals + sub-components |
| **Branding** | 3 | BrandedWelcome, BrandedEmpty, EnhancedStatCard |
| **Analytics** | 5 | GoogleAnalytics, GoogleTagManager, MetaPixel, SpeedInsights, WebVitalsMonitor |
| **SEO** | 1 (10+ schemas) | StructuredData (Organization, Product, Article, FAQ, Video, etc.) |
| **Icons** | 30+ | Organized into actions, content, dashboard, features, navigation, social, status |
| **Search** | 2 | SearchInputWithSuggestions, SearchSuggestionsDropdown |
| **Providers** | 3 | QueryProvider, SessionProvider, ThemeProvider |
| **Guards** | 1 | AdminRouteGuard (+ useIsAdmin hook) |
| **Lazy** | 5 | LazyCharts, LazyVideoPlayer, LazyDialogs, LazyMarkdown, LazyMotion |

### Barrel Exports (20 index files)

Components with barrel exports: admin, agent-swarm, agent-swarm/wizard-steps, aikit, branding, commands, community, github, icons, invoices, lazy, marketing, search, sections, showcase, tutorial, ui/progress, video, zerodb, zerodb/tabs

---

## 5. Services & API Integration

### Core API Client (`lib/api-client.ts`)
- Singleton `ApiClient` class using native `fetch`
- Base URL: `appConfig.api.baseUrl` (default: `https://api.ainative.studio`)
- Auto Bearer token from `getAuthToken()`
- Auto 401 handling: refresh token, retry, or redirect to `/login`
- Prevents concurrent refresh with shared promise

### Service Layer

| Service | File | API Prefix |
|---------|------|------------|
| **Auth** | `services/authService.ts` | `/v1/public/auth/*` |
| **Billing** | `services/billingService.ts` | `/v1/public/billing/*` |
| **Dashboard** | `services/dashboardService.ts` | `/v1/metrics/*` |
| **Search** | `services/semanticSearchService.ts` | `/v1/public/search/*` |
| **QNN** | `services/qnnApiClient.ts` | `https://qnn-api.ainative.studio/v1/*` (axios) |
| **Tutorials** | `services/tutorialProgressService.ts` | `/v1/tutorials/progress/*` |
| **User** | `services/userService.ts` | `/v1/public/auth/me`, `/v1/public/profile/*` |
| **Settings** | `services/userSettingsService.ts` | `/v1/settings/*`, `/v1/profiles/*` |
| **RLHF** | `services/rlhfService.ts` | RLHF feedback API |
| **Conversions** | `services/conversionTrackingService.ts` | Meta Pixel, Google Ads |
| **Unsplash** | `services/unsplashService.ts` | Unsplash API |

### ZeroDB Services (`services/zerodb/`)

| Service | API Path |
|---------|----------|
| `database-service.ts` | `/v1/public/zerodb/*`, `/v1/projects/{id}/postgres/*` |
| `analytics-service.ts` | `/v1/public/zerodb/usage/*`, `/v1/monitoring/*` |
| `vector-service.ts` | `/v1/public/zerodb/vectors/*` |
| `streaming-service.ts` | `/v1/public/zerodb/events/*` |
| `file-storage-service.ts` | `/v1/public/zerodb/files/*` |
| `agent-memory-service.ts` | `/v1/public/zerodb/memory/*` |
| `security-service.ts` | `/v1/public/zerodb/security/*` |
| `rlhf-service.ts` | `/v1/public/zerodb/rlhf/*` |

### Admin Services (`services/admin/`)
All use `AdminApiClient` (auto-prefixes `/admin`):
users, apiKeys, rlhf, monitoring, evaluation, enterprise, agents, zerodb, billing (12 files total)

### Lib Services (`lib/`)

| Service | File | API Path |
|---------|------|----------|
| Agent | `agent-service.ts` | `/v1/agents/*` |
| Agent Swarm | `agent-swarm-service.ts` | `/v1/public/agent-swarms/*` |
| Agent Swarm Wizard | `agent-swarm-wizard-service.ts` | GitHub, ZeroDB, AI endpoints |
| Email | `email-service.ts` | `/v1/email/*` |
| Notifications | `notification-service.ts` | `/v1/notifications/*` |
| Sessions | `session-service.ts` | `/v1/public/sessions/*`, `/v1/public/memory/*` |
| Teams | `team-service.ts` | `/v1/teams/*` |
| Organizations | `organization-service.ts` | `/v1/public/organizations/*` |
| Video | `video-service.ts` | `/v1/video/*` |
| ZeroDB | `zerodb-service.ts` | `/v1/public/zerodb/*` |
| Webhooks | `webhook-service.ts` | `/v1/public/webhooks/*` |
| Models | `model-aggregator.ts` | `/v1/models`, `/v1/public/embeddings/models` |
| Admin | `admin-service.ts` | `/v1/metrics/*`, `/database/admin/*` |
| Review | `review-service.ts` | Client-side only (regex-based) |
| WebSocket | `websocket-client.ts` | Generic WebSocket with auto-reconnect |

### Luma Services (`services/luma/`)
Axios-based client proxied through `/api/luma`, 300 req/min rate limit

---

## 6. Hooks

| Hook | Purpose | Data Source |
|------|---------|-------------|
| `useBilling` | Billing usage, summary, history | React Query + billing API |
| `useQNN` | Master QNN hook (combines sub-hooks) | React Query |
| `useRepositories` | QNN repos with pagination/search | `qnnApiClient` |
| `useModels` | QNN models with optimistic updates | `qnnApiClient` |
| `useTraining` | QNN training with polling (5s/3s) | `qnnApiClient` |
| `useBenchmarks` | QNN benchmarks with polling (3s) | `qnnApiClient` |
| `useEvaluation` | Model evaluation | **MOCK DATA** (TODO) |
| `useDashboardStats` | Kong metrics (5s), health (30s), API usage (60s) | `dashboardService` |
| `useVideoPlayer` | HLS.js video player state | HLS.js + analytics API |
| `useTutorialProgressSync` | Tutorial chapter progress sync | Tutorial progress API |
| `useWebinarRegistration` | Webinar registration | Luma API proxy |
| `useAgentSwarmWebSocket` | Real-time agent swarm updates | WebSocket `ws://host:8000/ws/admin/agent-swarm/{projectId}` |
| `useSearchSuggestions` | Search autocomplete | `semanticSearchService` |
| `useConversionTracking` | Conversion event tracking | `conversionTrackingService` |
| `useOperationProgress` | Long-running operation progress | SSE/WebSocket |
| `useShowcaseVideo` | Video player + annotations | Local state |
| `useDebounce` | Debounce utility | Local state |
| `useChapterNavigation` | Tutorial chapter navigation | Local state |
| `useProgressToast` | Progress toast notifications | Sonner toasts |
| `useTutorialProgress` | Tutorial progress | localStorage |
| `useCodeSync` | Code sync with video playback | Local state |
| `use-toast` | Toast notification reducer | Local state |

---

## 7. Contexts & Providers

### Provider Hierarchy (Root Layout)
```
ThemeProvider (next-themes, dark default)
  └── SessionProvider (NextAuth + TokenSync)
       └── QueryProvider (TanStack React Query + DevTools)
            └── ConditionalLayout (Header/Footer for non-dashboard routes)
```

### QNNContext (`contexts/QNNContext.tsx`)
- State: selectedRepository, savedRepositories, selectedModel, activeTraining, isPollingEnabled, viewMode
- Hooks: `useQNN`, `useQNNContext`, `useIsTrainingActive`, `useClearQNNState`

---

## 8. Types & Interfaces

| File | Key Types |
|------|-----------|
| `types/qnn.types.ts` | Repository, Model, Training, Benchmark, Evaluation, Monitoring, Signature (~534 lines) |
| `types/tutorial.ts` | Chapter, CodeSnippet, QuizQuestion, TutorialProgress, CertificateData |
| `types/rlhf.ts` | RLHFFeedbackProps, RLHFFeedbackData, RLHFFeedbackResponse |
| `types/search.ts` | SearchSuggestion, SearchSuggestionsResponse |
| `types/progress.ts` | OperationProgress, OperationStatus, OperationType |
| `types/agent-team.types.ts` | AgentStatus, AgentRole, AgentRuntimeData, STATUS_CONFIGS |
| `types/executionStageEnum.ts` | ExecutionStage enum (1-11 stages) |
| `types/executionStages.ts` | Stages 7-11 definitions |
| `types/strapi.ts` | Strapi CMS: Webinar, Author, Image |
| `types/next-auth.d.ts` | NextAuth Session/User/JWT extensions |
| `types/global.d.ts` | Module declarations |
| `components/zerodb/types.ts` | 670+ lines: Project, Collection, PostgreSQLInstance, VectorCollection, etc. |

---

## 9. Middleware & Auth

### Edge Middleware (`middleware.ts`)
- **Protected routes** (redirect to `/login` if no token):
  `/dashboard`, `/account`, `/plan`, `/billing`, `/purchase-credits`, `/profile`, `/settings`, `/notifications`, `/credit-history`, `/refills`, `/developer-settings`
- **Auth routes** (redirect to `/dashboard` if logged in):
  `/login`, `/signup`
- Token source: `ainative_access_token` cookie

### Auth Flow
1. **Login**: `authService.login()` -> backend `/v1/public/auth/login` -> JWT tokens
2. **Token Storage**: Dual storage in cookies + localStorage (`authCookies.ts`)
3. **Cross-subdomain SSO**: Cookie domain `.ainative.studio` (ainative.studio + zerodb.ainative.studio)
4. **Token Refresh**: Auto-refresh on 401 via `ApiClient` with concurrent-safe promise sharing
5. **NextAuth**: GitHub OAuth + credentials provider, Prisma adapter for sessions
6. **Admin Guard**: `AdminRouteGuard` checks localStorage for admin role

### Rate Limiting (`middleware/rateLimit.ts`)
- In-memory LRU cache, tiers: auth (5/min), payment (10/min), apiKey (20/min), api (60/min)
- Abuse detection: 10 violations -> 24-hour IP block

---

## 10. Design System

### Color Palette
```
Surface:     dark-1 #131726, dark-2 #22263c, dark-3 #31395a
Brand:       primary #4B6FED, primary-dark #3955B8, primary-light #6B88F0
Secondary:   #338585 (teal), dark #1A7575, light #4D9A9A
Accent:      gold #FCAE39, teal #22BCDE, purple #8A63F4
Purple:      #8A63F4, dark #6B4AC2, light #A881F7, vibrant #D04BF4
```

### Typography
```
Font: Poppins (primary), Geist Sans, Geist Mono
Sizes: title-1 28px/700, title-2 24px/600, body 14px, button 12px/500
```

### Custom Utilities
- **Glassmorphism**: `.glass-sm`, `.glass-md`, `.glass-lg`, `.glass-xl`, `.glass-card`, `.glass-modal`, `.glass-overlay`
- **Gradients**: `.gradient-primary`, `.gradient-secondary`, `.gradient-card`, `.gradient-hero`, `.gradient-text-primary`
- **Shadows**: `ds-sm`, `ds-md`, `ds-lg` (three-tier depth)
- **Animations**: 9 custom (fade-in, slide-in, gradient-shift, shimmer, pulse-glow, float, stagger-in, accordion-down/up)

### Agent Type Colors (WCAG AA Compliant)
```
quantum #8B5CF6, ml #10B981, general #3B82F6, conversational #EC4899
task #F59E0B, workflow #6366F1, custom #64748B
```

---

## 11. Testing Infrastructure

### Three-Tier Testing

| Tier | Tool | Location | Coverage Target |
|------|------|----------|----------------|
| **Unit** | Jest + RTL | `__tests__/`, `components/**/__tests__/` | 50% (progressive) |
| **Integration** | Jest + MSW | `__tests__/integration/` | 70% |
| **E2E** | Playwright | `e2e/` | Manual |
| **AIKit** | Jest (custom config) | `components/ui/__tests__/aikit-*` | 80-90% |

### Jest Configuration
- Main: `jest.config.js` - 50% global, `maxWorkers: 50%`, 10s timeout
- Integration: `jest.integration.config.js` - 70% global, 30s timeout
- AIKit: `jest.aikit.config.js` - 80% global, 90% for button/input

### Playwright Configuration
7 test projects: chromium, firefox, webkit, mobile (375x812), tablet (768x1024), desktop (1920x1080), accessibility

### MSW Infrastructure (`mocks/`)
- 12 handler modules (auth, user, credit, subscription, usage, rlhf, apiKey, invoice, billing, community, video, webinar)
- 6 data factories (Auth, User, Credit, Subscription, RLHF, APIKey)
- **Note**: MSW is built but commented out in jest.setup.js due to ESM issues

### Test Data Factories (`__tests__/fixtures/`)
`createModel()`, `createBenchmark()`, `createMonitoringData()`, `createRepository()`, `createTrainingJob()`

---

## 12. Build & Config

### Next.js (`next.config.ts`)
- `output: 'standalone'` (Railway deployment)
- TypeScript build errors ignored (`ignoreBuildErrors: true`)
- Sentry integration (conditional on DSN)
- Image optimization: api.ainative.studio, ainative-community, unsplash, lu.ma
- Bundle splitting: react-vendor, radix-ui, charts, animations, icons, utilities, vendor, common
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options
- Package import optimization: lucide-react, radix-ui, framer-motion, recharts, react-icons, tanstack

### Environment Variables (`lib/env.ts`)
**Client (NEXT_PUBLIC_)**:
- `NEXT_PUBLIC_API_URL` - Backend API
- `NEXT_PUBLIC_QNN_API_URL` - QNN API
- `NEXT_PUBLIC_STRAPI_URL` - CMS
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Analytics flags, feature flags, GitHub client ID, Luma URL

**Server**:
- Stripe secrets, DB URL, Redis URL, GitHub secret
- JWT secrets, OpenAI/Anthropic keys, ZeroDB credentials
- SMTP config, AWS S3 config, Sentry config

### Prisma Schema (`prisma/schema.prisma`)
PostgreSQL with 4 models: User (with role), Account, Session, VerificationToken

---

## 13. Backend API URL Map

### Core Backend (`https://api.ainative.studio`)

| Category | URL Pattern |
|----------|-------------|
| **Auth** | `/v1/public/auth/me`, `/login`, `/register`, `/refresh` |
| **Profile** | `/v1/public/profile`, `/preferences`, `/picture` |
| **Settings** | `/v1/settings/notifications/preferences`, `/communication` |
| **Notifications** | `/v1/notifications/*` |
| **API Keys** | `/v1/public/api-keys/` |
| **Projects** | `/v1/public/projects/*` |
| **Organizations** | `/v1/public/organizations/*` |
| **Teams** | `/v1/teams/*` |
| **ZeroDB** | `/v1/public/zerodb/*` (vectors, namespaces, stats, query, collections, tables, files, events, memory, security, rlhf) |
| **Agent Swarm** | `/v1/public/agent-swarms/*` (orchestrate, projects, status, logs, metrics, GitHub) |
| **Agents** | `/v1/agents/*` |
| **GitHub** | `/v1/public/github/*` |
| **Models** | `/v1/models`, `/v1/chat/completions` |
| **Embeddings** | `/v1/public/embeddings/models`, `/v1/embeddings` |
| **Metrics** | `/v1/metrics/health`, `/v1/metrics/summary` |
| **Email** | `/v1/email/*` |
| **Video** | `/v1/video/*` |
| **Webhooks** | `/v1/public/webhooks/*` |
| **Sessions** | `/v1/public/sessions/*` |
| **Memory** | `/v1/public/memory/*` |
| **Billing** | `/v1/billing/*`, `/v1/monitoring/*` |
| **Tutorials** | `/v1/tutorials/progress/*` |
| **Search** | `/v1/public/search/*` |
| **Admin** | `/admin/*` (all admin service paths) |
| **WebSocket** | `ws(s)://hostname:8000/ws/admin/agent-swarm/{projectId}` |

### QNN Backend (`https://qnn-api.ainative.studio`)
- `/v1/repositories/*`
- `/v1/models/*`
- `/v1/training/*`
- `/v1/benchmarks/*`

### External APIs
| Service | Access Method |
|---------|--------------|
| Luma Events | `/api/luma` proxy -> Luma API |
| GitHub | `/api/github` proxy -> `api.github.com` |
| Unsplash | Direct via unsplashService |
| Strapi CMS | Direct via `NEXT_PUBLIC_STRAPI_URL` |
| Stripe | Stripe.js SDK |
| IP Geolocation | `https://ipapi.co/json/` |

---

## 14. Deployment & Infrastructure

### Railway Deployment
- `output: 'standalone'` in next.config.ts
- Static assets cached with immutable headers (1 year for images/fonts)
- Sentry source maps uploaded in production

### Analytics Stack
- **GA4**: `G-ML0XEBPZV2` via `GoogleAnalytics.tsx`
- **GTM**: `GTM-MJKQDBGV` via `GoogleTagManager.tsx`
- **Meta Pixel**: via `MetaPixel.tsx` (consent-managed)
- **Sentry**: Client + Server + Edge configs (10% trace rate in prod)
- **Vercel Speed Insights**: via `SpeedInsights.tsx`
- **Web Vitals**: CLS, FCP, INP, LCP, TTFB monitoring
- **Chatwoot**: Live chat widget

### PWA Support
- `manifest.json` with app name, theme color `#4B6FED`, categories: developer tools
- `robots.txt` with bot-specific rules (GPTBot, ClaudeBot, Google-Extended)
- `sitemap.xml` with 12 priority URLs

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server (port 3000)
npm run build                  # Production build
npm run lint                   # ESLint

# Testing
npm test                       # Jest unit tests
npm run test:coverage          # Jest with coverage
npm run test:e2e               # Playwright E2E
npm run test:e2e:ui            # Playwright UI mode

# Analysis
ANALYZE=true npm run build     # Bundle analyzer
```
