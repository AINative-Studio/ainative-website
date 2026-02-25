# AINative Studio - Frontend (Next.js)

## Quick Reference

| Item | Value |
|------|-------|
| **Framework** | Next.js 16.1.1 + React 19 + TypeScript 5 |
| **Styling** | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| **State** | TanStack React Query 5 |
| **Auth** | NextAuth v4 + Custom JWT + Prisma adapter |
| **Payments** | Stripe (react-stripe-js) |
| **API Client** | `lib/api-client.ts` (fetch-based singleton) |
| **Backend URL** | `https://api.ainative.studio` |
| **QNN API URL** | `https://qnn-api.ainative.studio` |
| **Dev Server** | `npm run dev` (port 3000) |
| **Deploy** | Railway (standalone output) |
| **Build Errors** | `typescript.ignoreBuildErrors: true` in next.config |

---

## Mandatory Rules

### 1. No AI Attribution (Zero Tolerance)
**NEVER include in commits/PRs/code:**
- "Claude", "Anthropic", "Generated with", "Co-Authored-By: Claude"
- Any AI tool attribution

### 2. File Placement
| Type | Location |
|------|----------|
| Documentation | `docs/{category}/` |
| Scripts | `scripts/` |
| Root `.md` allowed | Only `README.md` |

### 3. TDD Required
```bash
npm test -- --coverage
# Coverage >= 80% for new code
# Jest configs: jest.config.js (50%), jest.integration.config.js (70%), jest.aikit.config.js (80-90%)
```

### 4. Test Safety
- NEVER run tests in watch mode from Claude
- ALWAYS use `--run` flag with vitest
- Check for orphaned processes: `ps aux | grep -E "(jest|vitest)" | grep -v grep`

---

## Architecture Overview

### Provider Hierarchy (Root Layout)
```
ThemeProvider (dark default)
  └── SessionProvider (NextAuth + token sync to localStorage)
       └── QueryProvider (TanStack React Query + DevTools in dev)
            └── ConditionalLayout (Header/Footer for non-dashboard routes)
```

### Page Pattern (used by ~95% of pages)
```
app/[route]/page.tsx           → Server Component: exports metadata, renders *Client
app/[route]/[Feature]Client.tsx → Client Component: 'use client', all interactivity
```

### Layout Hierarchy
- **Root** (`app/layout.tsx`): Providers, analytics (GA4, GTM, Meta Pixel), SEO, fonts (Poppins)
- **Dashboard** (`app/dashboard/layout.tsx`): `DashboardLayout` with responsive sidebar
- **Admin** (`app/admin/layout.tsx`): `AdminSidebar` + `AdminHeader`
- **Account routes** (billing, invoices, settings, etc.): Each wrap in `DashboardLayout`
- **ConditionalLayout**: Shows Header/Footer except on dashboard, auth, admin routes

---

## Key Directories

```
app/                     # 95 page routes + 12 API routes
  api/backend/[...path]  # Proxy to api.ainative.studio (60 req/min)
  api/github/[...path]   # Proxy to GitHub API
  api/luma/[...path]     # Proxy to Luma API
  api/auth/              # NextAuth handlers + logout
  api/revalidate/        # ISR cache revalidation (Edge)
components/              # 269 components in 35 subdirectories
  ui/                    # 44+ shadcn/ui primitives + custom branded variants
  layout/                # Header, Footer, Sidebar, DashboardLayout
  providers/             # QueryProvider, SessionProvider, ThemeProvider
  agent-swarm/           # 23 files: wizard (7 steps), terminal, RLHF
  zerodb/                # 14+ files: DB management, vector search, 8 tab modules
  qnn/                   # 16 files: models, training, benchmarks, quantum monitoring
  webinar/               # 13 files: registration, calendar, certificates, Q&A
  billing/ + invoices/   # 12 files: credit charts, payment, invoices
  guards/                # AdminRouteGuard
  seo/                   # StructuredData (10+ JSON-LD schemas)
  analytics/             # GA4, GTM, Meta Pixel, Speed Insights, Web Vitals
services/                # API service layer (30+ files)
  zerodb/                # 8 ZeroDB service modules
  admin/                 # 12 admin service files (AdminApiClient prefix)
  luma/                  # Luma events API (axios)
hooks/                   # 22 custom hooks (React Query-based)
contexts/                # QNNContext (repo/model/training state)
lib/                     # 60+ files
  api-client.ts          # Core fetch-based API client (auto token refresh)
  config/app.ts          # Company info, links, pricing, Stripe IDs
  env.ts                 # Zod-validated env vars (client + server)
  auth/options.ts        # NextAuth config
  rate-limit.ts          # In-memory LRU rate limiting
  [40+ service files]    # Agent, email, notification, team, org, video, webhook, etc.
types/                   # 11 type definition files
utils/                   # 7 utility files (API client, auth cookies, geo detection)
config/pricing.ts        # Regional pricing (USD + INR)
middleware.ts            # Auth route protection (edge)
mocks/                   # MSW (26 files, 12 handlers, 6 factories) - currently disabled in Jest
prisma/                  # Schema: User, Account, Session, VerificationToken
```

---

## API Integration Map

### Core API Client (`lib/api-client.ts`)
- Base: `appConfig.api.baseUrl` → `https://api.ainative.studio`
- Auto Bearer token from `getAuthToken()` (cookies + localStorage)
- Auto 401 → refresh token → retry or redirect `/login`
- Methods: `get`, `post`, `put`, `patch`, `delete`

### Backend API Patterns
| Category | Prefix | Key Services |
|----------|--------|-------------|
| Auth | `/v1/public/auth/` | authService (login, register, refresh, me) |
| Profile | `/v1/public/profile/` | userService |
| ZeroDB | `/v1/public/zerodb/` | 8 services (DB, vectors, files, events, memory, security, RLHF, analytics) |
| Agent Swarm | `/v1/public/agent-swarms/` | agentSwarmService, agentSwarmAIService |
| Agents | `/v1/agents/` | agentService |
| Organizations | `/v1/public/organizations/` | organizationService |
| Models | `/v1/models` | modelAggregatorService |
| Search | `/v1/public/search/` | semanticSearchService |
| Webhooks | `/v1/public/webhooks/` | webhookService |
| Email | `/v1/email/` | emailService |
| Notifications | `/v1/notifications/` | notificationService |
| Admin | `/admin/` | 9 admin service modules |
| WebSocket | `ws://host:8000/ws/admin/agent-swarm/{id}` | useAgentSwarmWebSocket |

### QNN Backend (Separate - Axios-based)
- URL: `https://qnn-api.ainative.studio/v1/`
- Services: repositories, models, training, benchmarks
- Client: `services/qnnApiClient.ts`

### Proxied External APIs
- `/api/backend/[...path]` → `api.ainative.studio` (60 req/min, 30s timeout)
- `/api/github/[...path]` → `api.github.com` (server-side GITHUB_TOKEN)
- `/api/luma/[...path]` → `api.lu.ma` (LUMA_API_KEY)

---

## Auth System

### Flow
1. Login → `authService.login()` → `/v1/public/auth/login` → JWT tokens
2. Storage → cookies (`ainative_access_token`) + localStorage (backward compat)
3. Cross-subdomain SSO → cookie domain `.ainative.studio`
4. Token refresh → auto on 401 with concurrent-safe promise sharing
5. NextAuth → GitHub OAuth + credentials, Prisma adapter

### Protected Routes (middleware.ts)
`/dashboard`, `/account`, `/plan`, `/billing`, `/profile`, `/settings`, `/notifications`, `/credit-history`, `/refills`, `/developer-settings`

### Admin Guard
`AdminRouteGuard` component checks localStorage for admin role, wraps all `/admin/*` pages

---

## Design System

### Colors
```
Surface: #131726 (primary), #22263c (secondary), #31395a (accent)
Brand:   #4B6FED (primary blue), #3955B8 (dark), #6B88F0 (light)
Accent:  #FCAE39 (gold), #22BCDE (teal), #8A63F4 (purple)
```

### Custom Tailwind Utilities
- Glassmorphism: `.glass-sm` through `.glass-xl`, `.glass-card`, `.glass-modal`
- Gradients: `.gradient-primary`, `.gradient-hero`, `.gradient-text-primary`
- Shadows: `ds-sm`, `ds-md`, `ds-lg`
- Animations: fade-in, slide-in, shimmer, pulse-glow, float, stagger-in

### Font: Poppins (primary), loaded via next/font in root layout

### Component Variants
- `button-custom.tsx`: primary/outline/ghost with shimmer
- `card-advanced.tsx`: glassmorphism + gradient-border variants
- `gradient-text.tsx`: 6 color variants + typography scale

---

## ISR (Incremental Static Regeneration)

| Page | Revalidation |
|------|-------------|
| Homepage | 600s (10 min) |
| Pricing | 300s (5 min) |
| Blog detail | 300s (5 min) |
| Webinar detail | 300s (5 min) |
| Video detail | 900s (15 min) |
| FAQ | 1800s (30 min) |
| Products | 1800s (30 min) |
| About | 3600s (1 hr) |
| Auth pages | force-dynamic |

---

## Testing

### Jest Configs
| Config | Target | Coverage |
|--------|--------|----------|
| `jest.config.js` | General | 50% |
| `jest.integration.config.js` | Integration | 70% |
| `jest.aikit.config.js` | AIKit components | 80-90% |

### Playwright (7 browser configs)
chromium, firefox, webkit, mobile (375x812), tablet (768x1024), desktop (1920x1080), accessibility

### MSW Mocks (`mocks/`)
12 handler modules + 6 data factories. **Note**: Currently disabled in Jest due to ESM compatibility.

### Commands
```bash
npm test                           # Unit tests
npm run test:coverage              # With coverage report
npm run test:e2e                   # Playwright E2E
ANALYZE=true npm run build         # Bundle analysis
```

---

## Key Files for Common Tasks

| Task | Files to Check |
|------|---------------|
| Add new page | `app/[route]/page.tsx` + `[Route]Client.tsx` |
| Add API service | `services/` or `lib/` + corresponding hook in `hooks/` |
| Add component | `components/[category]/` + update barrel export if exists |
| Modify auth | `lib/auth/options.ts`, `middleware.ts`, `utils/authCookies.ts` |
| Update design tokens | `tailwind.config.ts`, `app/globals.css` |
| Add API route | `app/api/[route]/route.ts` with rate limiting |
| Modify dashboard nav | `components/layout/Sidebar.tsx` |
| Add SEO | `components/seo/StructuredData.tsx` + page metadata export |
| Add admin page | `app/admin/` + wrap with `AdminRouteGuard` |

---

## Complete Architecture Map
For exhaustive details (all 107 routes, 269 components, full API URL map, type definitions):
`docs/architecture/FRONTEND_ARCHITECTURE_MAP.md`
