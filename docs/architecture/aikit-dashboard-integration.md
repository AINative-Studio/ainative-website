# AIKit Dashboard Integration - System Architecture Design

**Project:** AINative Studio Next.js
**Document Version:** 1.0.0
**Date:** 2026-01-29
**Author:** System Architect

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Requirements Analysis](#requirements-analysis)
3. [Proposed Architecture](#proposed-architecture)
4. [Technology Stack](#technology-stack)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Risk Assessment](#risk-assessment)
7. [Success Metrics](#success-metrics)

---

## 1. Executive Summary

### 1.1 High-Level Overview

This document outlines the architectural design for integrating AIKit components into the `/dashboard` page, transforming it from a traditional shadcn/ui-based interface into a modern, tab-based navigation system powered by AIKit design system components.

### 1.2 Key Decisions

- **Tab Navigation Pattern**: Implement 5-tab structure: [Overview] [AI-Kit] [Usage] [Billing] [Settings]
- **Gradual Migration Strategy**: Replace shadcn/ui components incrementally while maintaining existing functionality
- **Service Layer Preservation**: Keep existing service layer (`usageService`, `billingService`, `dashboardService`) intact
- **State Management**: Utilize React Query for server state, local state for UI concerns
- **Dark Theme First**: Design with dark theme as primary, leverage existing Tailwind dark mode utilities
- **Mobile-First Responsive**: Ensure all AIKit components are fully responsive from mobile to desktop

### 1.3 Architecture Goals

1. **Modularity**: Enable independent tab development and testing
2. **Performance**: Lazy-load tab content, optimize bundle size
3. **Maintainability**: Clear separation of concerns, reusable components
4. **Scalability**: Easy to add new tabs or features in the future
5. **User Experience**: Seamless transitions, optimistic updates, loading states

---

## 2. Requirements Analysis

### 2.1 Functional Requirements

#### FR-1: Tab Navigation System
- Implement horizontal tab navigation with 5 primary tabs
- Support keyboard navigation (Arrow keys, Home, End)
- Maintain tab state in URL query parameters for deep linking
- Preserve scroll position when switching tabs

#### FR-2: Overview Tab
- Display user welcome card with dismissible functionality
- Show credit usage summary (base + additional prompt credits)
- Display cost breakdown (current period + projected monthly)
- Present AI development metrics (code generation, model usage, API integrations)
- Include quick refresh functionality

#### FR-3: AI-Kit Tab
- Showcase available AIKit packages (similar to `/ai-kit` page)
- Display installation commands with copy-to-clipboard
- Filter packages by category
- Link to NPM and GitHub documentation

#### FR-4: Usage Tab
- Detailed usage metrics visualization
- Export functionality (CSV/JSON)
- Time period filtering (7d, 30d, 90d)
- Real-time usage tracking

#### FR-5: Billing Tab
- Payment method management
- Invoice history with download capability
- Subscription plan details
- Auto-refill configuration

#### FR-6: Settings Tab
- User preferences management
- API key management link
- Notification settings
- Account settings

### 2.2 Non-Functional Requirements

#### NFR-1: Performance
- Initial page load: < 2 seconds
- Tab switching: < 300ms
- Code splitting: Each tab loaded on demand
- Bundle size: Main chunk < 100KB gzipped

#### NFR-2: Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader support with ARIA labels
- Keyboard navigation support
- Focus management on tab switches

#### NFR-3: Responsive Design
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+
- Touch-friendly tap targets (min 44x44px)

#### NFR-4: Browser Compatibility
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari/Chrome

#### NFR-5: Security
- Client-side data validation
- Secure API key display (masked by default)
- CSRF protection on form submissions
- XSS prevention in user-generated content

---

## 3. Proposed Architecture

### 3.1 System Architecture Diagram (C4 - Level 2)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Client)                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          /dashboard (Next.js App Router Page)              │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │   DashboardLayout (Shared Layout)                    │  │ │
│  │  │   - Header, Sidebar, Mobile Nav                      │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │   DashboardClient (Main Container)                   │  │ │
│  │  │                                                       │  │ │
│  │  │   ┌───────────────────────────────────────────────┐ │  │ │
│  │  │   │  AIKitTabs (Tab Navigation)                   │ │  │ │
│  │  │   │  ┌──┬──────┬───────┬─────────┬──────────┐    │ │  │ │
│  │  │   │  │OV│AI-Kit│ Usage │ Billing │ Settings │    │ │  │ │
│  │  │   │  └──┴──────┴───────┴─────────┴──────────┘    │ │  │ │
│  │  │   └───────────────────────────────────────────────┘ │  │ │
│  │  │                                                       │  │ │
│  │  │   ┌───────────────────────────────────────────────┐ │  │ │
│  │  │   │  Tab Content (Lazy Loaded)                    │ │  │ │
│  │  │   │                                                │ │  │ │
│  │  │   │  • OverviewTab                                 │ │  │ │
│  │  │   │    - UsageMetricsCard (AIKit)                  │ │  │ │
│  │  │   │    - CostBreakdownCard (AIKit)                 │ │  │ │
│  │  │   │    - AIMetricsGrid (AIKit)                     │ │  │ │
│  │  │   │                                                 │ │  │ │
│  │  │   │  • AIKitTab                                    │ │  │ │
│  │  │   │    - PackageGrid (AIKit)                       │ │  │ │
│  │  │   │    - CategoryFilter (AIKit)                    │ │  │ │
│  │  │   │                                                 │ │  │ │
│  │  │   │  • UsageTab                                    │ │  │ │
│  │  │   │    - UsageCharts (Recharts + AIKit)            │ │  │ │
│  │  │   │    - ExportControls (AIKit)                    │ │  │ │
│  │  │   │                                                 │ │  │ │
│  │  │   │  • BillingTab                                  │ │  │ │
│  │  │   │    - PaymentMethodList (AIKit)                 │ │  │ │
│  │  │   │    - InvoiceTable (AIKit)                      │ │  │ │
│  │  │   │    - SubscriptionCard (AIKit)                  │ │  │ │
│  │  │   │                                                 │ │  │ │
│  │  │   │  • SettingsTab                                 │ │  │ │
│  │  │   │    - UserPreferences (AIKit)                   │ │  │ │
│  │  │   │    - NotificationSettings (AIKit)              │ │  │ │
│  │  │   └───────────────────────────────────────────────┘ │  │ │
│  │  │                                                       │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │   State Management Layer                            │  │ │
│  │  │   - React Query (Server State)                      │  │ │
│  │  │   - useState (UI State)                             │  │ │
│  │  │   - useContext (Shared State)                       │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │   Service Layer                                     │  │ │
│  │  │   - usageService                                    │  │ │
│  │  │   - billingService                                  │  │ │
│  │  │   - dashboardService                                │  │ │
│  │  │   - apiClient                                       │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Services                          │
│                                                                   │
│  /api/v1/usage/*         - Usage metrics, limits, real-time     │
│  /api/v1/billing/*       - Billing info, invoices, payments     │
│  /api/v1/credits/*       - Credit balance, transactions         │
│  /api/v1/subscription/*  - Subscription plans, management       │
│  /database/admin/kong/*  - Kong metrics, health                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Hierarchy

```
app/dashboard/
├── page.tsx                          # Server Component (Metadata)
├── DashboardClient.tsx               # Root Client Component (NEW)
│   └── AIKitTabs                     # Tab Navigation (AIKit)
│       ├── OverviewTab (Lazy)
│       │   ├── WelcomeCard (AIKit)
│       │   ├── UsageMetricsCard (AIKit)
│       │   ├── CostBreakdownCard (AIKit)
│       │   └── AIMetricsGrid (AIKit)
│       ├── AIKitTab (Lazy)
│       │   ├── PackageGrid (AIKit)
│       │   ├── PackageCard (AIKit)
│       │   └── CategoryFilter (AIKit)
│       ├── UsageTab (Lazy)
│       │   ├── UsageChart (Recharts + AIKit)
│       │   ├── PeriodSelector (AIKit)
│       │   └── ExportMenu (AIKit)
│       ├── BillingTab (Lazy)
│       │   ├── PaymentMethodCard (AIKit)
│       │   ├── InvoiceTable (AIKit)
│       │   ├── SubscriptionCard (AIKit)
│       │   └── AutoRefillSettings (AIKit)
│       └── SettingsTab (Lazy)
│           ├── UserPreferencesForm (AIKit)
│           ├── NotificationSettings (AIKit)
│           └── DangerZone (AIKit)
│
components/dashboard/
├── aikit/                            # AIKit-specific components (NEW)
│   ├── tabs/
│   │   ├── AIKitTabs.tsx            # Custom tab wrapper with AIKit styling
│   │   ├── TabTrigger.tsx           # Styled tab trigger
│   │   └── TabContent.tsx           # Styled tab content
│   ├── cards/
│   │   ├── MetricCard.tsx           # AIKit metric display card
│   │   ├── StatWidget.tsx           # AIKit stat widget
│   │   └── ChartCard.tsx            # AIKit chart container
│   ├── tables/
│   │   ├── DataTable.tsx            # AIKit data table
│   │   └── InvoiceRow.tsx           # AIKit invoice row
│   └── forms/
│       ├── PaymentMethodForm.tsx    # AIKit payment form
│       └── SettingsForm.tsx         # AIKit settings form
│
hooks/
├── useDashboardData.ts              # Unified data fetching hook
├── useTabNavigation.ts              # Tab state management hook
└── useLocalStorage.ts               # Persistent state hook
│
services/
├── usageService.ts                  # EXISTING - No changes
├── billingService.ts                # EXISTING - No changes
└── dashboardService.ts              # EXISTING - No changes
```

### 3.3 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        User Action                            │
│  (Tab Click, Refresh, Export, etc.)                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Event Handlers                             │
│  - onTabChange(tab: TabValue)                                │
│  - onRefresh()                                                │
│  - onExport(format: 'csv' | 'json')                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  Custom Hooks Layer                           │
│                                                                │
│  useDashboardData():                                          │
│  ├── useQuery('dashboardStats', fetchStats)                  │
│  ├── useQuery('usageData', fetchUsage)                       │
│  ├── useQuery('billingInfo', fetchBilling)                   │
│  └── useQuery('creditBalance', fetchCredits)                 │
│                                                                │
│  useTabNavigation():                                          │
│  ├── [activeTab, setActiveTab] = useState('overview')        │
│  ├── useSearchParams() for URL sync                          │
│  └── useEffect() for scroll restoration                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   Service Layer                               │
│                                                                │
│  usageService.getUsageMetrics(period)                        │
│  billingService.getBillingInfo()                             │
│  billingService.getInvoices()                                │
│  dashboardService.getKongMetrics()                           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   API Client                                  │
│  apiClient.get('/api/v1/usage/metrics')                      │
│  - Request interceptors (auth token)                         │
│  - Response interceptors (error handling)                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  Backend API                                  │
│  Returns JSON response                                        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│               React Query Cache Update                        │
│  - Updates queryCache                                         │
│  - Triggers re-render of dependent components                │
│  - Optimistic updates for mutations                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│               Component Re-render                             │
│  - AIKit components receive new props                        │
│  - Smooth transitions with Framer Motion                     │
│  - Loading states handled gracefully                         │
└──────────────────────────────────────────────────────────────┘
```

### 3.4 State Management Strategy

#### 3.4.1 Server State (React Query)

```typescript
// Server state managed by React Query
interface DashboardQueries {
  dashboardStats: {
    totalRequests: number;
    activeProjects: number;
    creditsUsed: number;
    avgResponseTime: number;
  };

  usageMetrics: UsageMetrics;

  billingInfo: BillingInfo;

  creditBalance: CreditBalance;

  invoices: Invoice[];
}

// Query configuration
const queryConfig = {
  staleTime: 30000,        // 30 seconds
  cacheTime: 300000,       // 5 minutes
  refetchOnWindowFocus: true,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
};
```

#### 3.4.2 UI State (React useState/Context)

```typescript
// UI state managed locally
interface DashboardUIState {
  activeTab: 'overview' | 'ai-kit' | 'usage' | 'billing' | 'settings';
  showWelcome: boolean;
  selectedCategory: string;
  copiedPackage: string | null;
  isRefreshing: boolean;
  selectedPeriod: '7d' | '30d' | '90d';
}

// Context for shared UI state
interface DashboardContextValue {
  uiState: DashboardUIState;
  updateUIState: (updates: Partial<DashboardUIState>) => void;
  resetUIState: () => void;
}
```

#### 3.4.3 Persistent State (localStorage)

```typescript
// Persisted to localStorage
interface DashboardPreferences {
  welcomeDismissed: boolean;
  preferredPeriod: '7d' | '30d' | '90d';
  defaultTab: TabValue;
  theme: 'dark' | 'light';
}
```

### 3.5 Tab Navigation Design

#### 3.5.1 Tab Configuration

```typescript
interface TabConfig {
  value: string;
  label: string;
  icon: LucideIcon;
  component: React.LazyExoticComponent<React.ComponentType>;
  requiresAuth: boolean;
  badge?: number | string;
}

const tabConfig: TabConfig[] = [
  {
    value: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    component: lazy(() => import('./tabs/OverviewTab')),
    requiresAuth: true
  },
  {
    value: 'ai-kit',
    label: 'AI-Kit',
    icon: Package,
    component: lazy(() => import('./tabs/AIKitTab')),
    requiresAuth: false
  },
  {
    value: 'usage',
    label: 'Usage',
    icon: BarChart2,
    component: lazy(() => import('./tabs/UsageTab')),
    requiresAuth: true
  },
  {
    value: 'billing',
    label: 'Billing',
    icon: CreditCard,
    component: lazy(() => import('./tabs/BillingTab')),
    requiresAuth: true
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: Settings,
    component: lazy(() => import('./tabs/SettingsTab')),
    requiresAuth: true
  }
];
```

#### 3.5.2 URL Structure

```
/dashboard                    → Default to overview tab
/dashboard?tab=overview      → Overview tab
/dashboard?tab=ai-kit        → AI-Kit tab
/dashboard?tab=usage         → Usage tab
/dashboard?tab=billing       → Billing tab
/dashboard?tab=settings      → Settings tab
```

### 3.6 Dark Theme Implementation

#### 3.6.1 Color System (Extending Tailwind)

```typescript
// tailwind.config.ts extension for AIKit components
{
  theme: {
    extend: {
      colors: {
        // AIKit Dashboard specific colors
        'aikit': {
          'bg-primary': '#0D1117',
          'bg-secondary': '#161B22',
          'bg-tertiary': '#1C2128',
          'border': '#2D333B',
          'border-hover': '#4B6FED40',
          'accent': '#4B6FED',
          'accent-hover': '#3A56D3',
          'text-primary': '#FFFFFF',
          'text-secondary': '#9CA3AF',
          'text-muted': '#6B7280'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dashboard': 'linear-gradient(135deg, #0D1117 0%, #1A1B2E 100%)'
      }
    }
  }
}
```

#### 3.6.2 AIKit Component Theming

```typescript
// AIKit component default styles
const aikitCardStyles = {
  base: "bg-aikit-bg-secondary border border-aikit-border hover:border-aikit-border-hover",
  header: "border-b border-aikit-border",
  title: "text-aikit-text-primary",
  description: "text-aikit-text-secondary"
};

const aikitTabStyles = {
  list: "bg-aikit-bg-tertiary border-b border-aikit-border",
  trigger: {
    base: "text-aikit-text-secondary data-[state=active]:text-aikit-text-primary",
    active: "border-b-2 border-aikit-accent"
  }
};
```

---

## 4. Technology Stack

### 4.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | App Router, SSR, React framework |
| React | 19.x | UI component library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 12.x | Animations and transitions |

### 4.2 UI Component Libraries

| Library | Version | Purpose | Migration Status |
|---------|---------|---------|------------------|
| shadcn/ui | Current | Existing components | Phase out gradually |
| AIKit Components | TBD | New design system | Implement |
| Radix UI | 1.x | Headless primitives | Underlying for both |
| Lucide React | 0.x | Icons | Keep |

### 4.3 State Management & Data Fetching

| Library | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-query | 5.x | Server state management |
| React Context | Built-in | Shared UI state |
| zustand (Optional) | 5.x | Complex client state (if needed) |

### 4.4 Charts & Visualization

| Library | Version | Purpose |
|---------|---------|---------|
| Recharts | 2.x | Charts (existing) |
| @tremor/react (Optional) | 3.x | Dashboard-specific charts (AIKit) |

### 4.5 Utilities

| Library | Version | Purpose |
|---------|---------|---------|
| clsx / cn | - | Conditional classes |
| date-fns | 4.x | Date formatting |
| axios | 1.x | HTTP client (existing) |

### 4.6 Development & Testing

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.x | Linting |
| Prettier | 3.x | Code formatting |
| Jest | 29.x | Unit testing |
| React Testing Library | 16.x | Component testing |
| Playwright | 1.x | E2E testing |

---

## 5. Implementation Roadmap

### 5.1 Phase 1: Foundation (Week 1-2)

#### Milestone 1.1: Project Setup & AIKit Component Library
- [ ] Create AIKit component library structure
- [ ] Define AIKit design tokens and theme
- [ ] Build core AIKit components:
  - [ ] AIKitTabs (wrapper around Radix Tabs)
  - [ ] AIKitCard (metric cards, stat widgets)
  - [ ] AIKitButton (styled buttons)
  - [ ] AIKitTable (data tables)
  - [ ] AIKitBadge (status badges)
- [ ] Create Storybook stories for AIKit components
- [ ] Write unit tests for AIKit components

#### Milestone 1.2: Tab Navigation Infrastructure
- [ ] Implement `useTabNavigation` hook
- [ ] Add URL query parameter sync
- [ ] Set up lazy loading with React.lazy
- [ ] Create tab loading/error boundaries
- [ ] Implement scroll restoration

### 5.2 Phase 2: Overview Tab Migration (Week 3)

#### Milestone 2.1: Data Layer
- [ ] Create `useDashboardData` hook
- [ ] Set up React Query configuration
- [ ] Migrate existing data fetching to React Query
- [ ] Add optimistic updates for mutations
- [ ] Implement error handling and retries

#### Milestone 2.2: Overview Tab Components
- [ ] Migrate `WelcomeCard` to AIKit
- [ ] Migrate `UsageMetricsCard` to AIKit
- [ ] Migrate `CostBreakdownCard` to AIKit
- [ ] Migrate `AIMetricsGrid` to AIKit
- [ ] Add animations with Framer Motion
- [ ] Implement refresh functionality

#### Milestone 2.3: Testing
- [ ] Unit tests for Overview tab components
- [ ] Integration tests for data fetching
- [ ] Accessibility audit (A11y)
- [ ] Visual regression tests (Chromatic/Percy)

### 5.3 Phase 3: AI-Kit Tab (Week 4)

#### Milestone 3.1: Component Development
- [ ] Create `PackageGrid` component
- [ ] Create `PackageCard` component (AIKit)
- [ ] Create `CategoryFilter` component
- [ ] Implement copy-to-clipboard functionality
- [ ] Add package search/filter

#### Milestone 3.2: Integration
- [ ] Integrate package data (static or API)
- [ ] Add category filtering logic
- [ ] Implement animations
- [ ] Mobile responsive layout

#### Milestone 3.3: Testing
- [ ] Unit tests for AI-Kit tab
- [ ] E2E tests for filtering and copy
- [ ] Performance testing (bundle size)

### 5.4 Phase 4: Usage Tab (Week 5)

#### Milestone 4.1: Chart Integration
- [ ] Integrate Recharts with AIKit styling
- [ ] Create `UsageChart` component
- [ ] Create `PeriodSelector` component
- [ ] Implement time range filtering

#### Milestone 4.2: Export Functionality
- [ ] Create `ExportMenu` component
- [ ] Implement CSV export
- [ ] Implement JSON export
- [ ] Add download tracking

#### Milestone 4.3: Real-time Updates
- [ ] Implement polling for real-time data
- [ ] Add WebSocket support (optional)
- [ ] Optimistic UI updates

### 5.5 Phase 5: Billing Tab (Week 6)

#### Milestone 5.1: Payment Management
- [ ] Migrate `PaymentMethodCard` to AIKit
- [ ] Implement add payment method flow
- [ ] Implement remove payment method
- [ ] Stripe integration testing

#### Milestone 5.2: Invoice Management
- [ ] Create `InvoiceTable` component (AIKit)
- [ ] Implement invoice download
- [ ] Add invoice filtering/sorting
- [ ] Pagination for large invoice lists

#### Milestone 5.3: Subscription Management
- [ ] Migrate `SubscriptionCard` to AIKit
- [ ] Create `AutoRefillSettings` component
- [ ] Implement subscription upgrade/downgrade
- [ ] Add cancellation flow

### 5.6 Phase 6: Settings Tab (Week 7)

#### Milestone 6.1: User Preferences
- [ ] Create `UserPreferencesForm` (AIKit)
- [ ] Implement theme toggle (if needed)
- [ ] Add notification preferences
- [ ] Save preferences to backend

#### Milestone 6.2: Account Management
- [ ] Link to API key management
- [ ] Add account deletion (danger zone)
- [ ] Implement email/password change
- [ ] Two-factor authentication settings

### 5.7 Phase 7: Polish & Optimization (Week 8)

#### Milestone 7.1: Performance Optimization
- [ ] Bundle size analysis
- [ ] Code splitting optimization
- [ ] Image optimization
- [ ] Lazy loading fine-tuning
- [ ] React Query cache optimization

#### Milestone 7.2: Accessibility & UX
- [ ] Full keyboard navigation audit
- [ ] Screen reader testing
- [ ] Focus management improvements
- [ ] Loading state consistency
- [ ] Error message improvements

#### Milestone 7.3: Documentation
- [ ] Component documentation
- [ ] Integration guide
- [ ] API documentation
- [ ] Migration guide for developers

### 5.8 Phase 8: Testing & Release (Week 9-10)

#### Milestone 8.1: Comprehensive Testing
- [ ] Full E2E test suite (Playwright)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance testing (Lighthouse)
- [ ] Security audit

#### Milestone 8.2: Deployment
- [ ] Staging deployment
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitoring and alerting setup
- [ ] Rollback plan documentation

---

## 6. Risk Assessment

### 6.1 Technical Risks

#### Risk 1: AIKit Component Library Maturity
**Severity:** High
**Probability:** Medium
**Impact:** Development delays, component quality issues

**Mitigation:**
- Start with well-defined, simple components
- Create comprehensive Storybook documentation
- Thorough unit testing from the start
- Regular design reviews with stakeholders
- Fallback to shadcn/ui if AIKit components not ready

#### Risk 2: Performance Degradation
**Severity:** High
**Probability:** Low
**Impact:** Poor user experience, increased bounce rate

**Mitigation:**
- Implement code splitting from the start
- Set performance budgets (Lighthouse CI)
- Regular bundle size monitoring
- Lazy load all tab content
- Optimize images and assets
- Use React.memo for expensive components

#### Risk 3: State Management Complexity
**Severity:** Medium
**Probability:** Medium
**Impact:** Bugs, difficult maintenance, performance issues

**Mitigation:**
- Clear separation of server vs. client state
- React Query for all server state
- Simple useState for UI state
- Document state management patterns
- Code reviews focused on state management

#### Risk 4: Breaking Changes in Existing Functionality
**Severity:** High
**Probability:** Medium
**Impact:** Loss of critical features, user complaints

**Mitigation:**
- Comprehensive E2E test coverage before migration
- Feature flag implementation for gradual rollout
- Parallel implementation (keep old code until new is verified)
- Thorough QA testing
- Phased rollout strategy

### 6.2 Design & UX Risks

#### Risk 5: Inconsistent Design System
**Severity:** Medium
**Probability:** High
**Impact:** Poor user experience, unprofessional appearance

**Mitigation:**
- Establish clear design tokens early
- Regular design system audits
- Component library governance
- Design reviews at each milestone
- Style guide documentation

#### Risk 6: Mobile Responsiveness Issues
**Severity:** Medium
**Probability:** Medium
**Impact:** Poor mobile experience, accessibility issues

**Mitigation:**
- Mobile-first development approach
- Responsive design testing at every step
- Use mobile simulators and real devices
- Touch target size compliance (44x44px minimum)
- Tablet breakpoint considerations

### 6.3 Integration Risks

#### Risk 7: Backend API Changes
**Severity:** High
**Probability:** Low
**Impact:** Dashboard functionality breaks

**Mitigation:**
- Maintain existing service layer abstraction
- API contract testing
- Mock API responses for development
- Graceful degradation for API failures
- Comprehensive error handling

#### Risk 8: Third-Party Dependency Issues
**Severity:** Medium
**Probability:** Medium
**Impact:** Build failures, security vulnerabilities

**Mitigation:**
- Lock dependency versions (package-lock.json)
- Regular dependency audits (npm audit)
- Use well-maintained libraries only
- Have fallback options for critical dependencies
- Security scanning in CI/CD

### 6.4 Project Management Risks

#### Risk 9: Scope Creep
**Severity:** Medium
**Probability:** High
**Impact:** Timeline delays, budget overruns

**Mitigation:**
- Clear requirements documentation
- Change control process
- Regular stakeholder communication
- Prioritized feature list (MoSCoW method)
- Time-boxed development sprints

#### Risk 10: Resource Availability
**Severity:** Medium
**Probability:** Medium
**Impact:** Development delays

**Mitigation:**
- Buffer time in estimates (20-30%)
- Cross-training team members
- Clear documentation for knowledge transfer
- Modular architecture for parallel development
- External resource contingency plan

---

## 7. Success Metrics

### 7.1 Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| First Contentful Paint (FCP) | < 1.2s | Lighthouse CI |
| Largest Contentful Paint (LCP) | < 2.0s | Lighthouse CI |
| Time to Interactive (TTI) | < 3.0s | Lighthouse CI |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse CI |
| Total Blocking Time (TBT) | < 300ms | Lighthouse CI |
| Main bundle size | < 100KB gzipped | webpack-bundle-analyzer |
| Tab switch time | < 300ms | Custom performance marks |

### 7.2 User Experience Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Accessibility Score (Lighthouse) | > 95 | Lighthouse CI |
| Mobile usability score | > 90 | PageSpeed Insights |
| User satisfaction (NPS) | > 50 | User surveys |
| Task completion rate | > 95% | Analytics events |
| Error rate | < 1% | Error tracking (Sentry) |

### 7.3 Code Quality Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Test coverage | > 80% | Jest coverage report |
| TypeScript strict mode | 100% | tsconfig.json |
| ESLint errors | 0 | CI/CD pipeline |
| Component documentation | 100% | Storybook coverage |
| Code duplication | < 3% | SonarQube |

### 7.4 Business Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Dashboard engagement rate | Baseline + 20% | Google Analytics |
| Average session duration | Baseline + 15% | Google Analytics |
| Tab utilization rate | > 60% for all tabs | Custom analytics |
| Credit purchase conversion | Baseline + 10% | Conversion tracking |
| Support ticket reduction | -25% (dashboard-related) | Support system |

### 7.5 Development Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Sprint velocity | Consistent ±10% | Jira/GitHub Projects |
| Build time | < 60s | CI/CD pipeline |
| Deployment frequency | 2-3x per week | CI/CD logs |
| Mean time to recovery (MTTR) | < 1 hour | Incident tracking |
| Code review turnaround | < 24 hours | GitHub PR metrics |

---

## 8. Component Integration Strategy

### 8.1 Migration Path: shadcn/ui → AIKit

#### Strategy: Progressive Enhancement

```typescript
// Phase 1: Wrapper Approach (Week 1-3)
// Wrap existing shadcn/ui components with AIKit styling

import { Card as ShadcnCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AIKitCard({ className, ...props }) {
  return (
    <ShadcnCard
      className={cn(
        'bg-aikit-bg-secondary',
        'border-aikit-border',
        'hover:border-aikit-border-hover',
        className
      )}
      {...props}
    />
  );
}

// Phase 2: Custom Implementation (Week 4-6)
// Build custom AIKit components from scratch

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AIKitCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'ghost' | 'bordered';
  gradient?: boolean;
}

export const AIKitCard = React.forwardRef<HTMLDivElement, AIKitCardProps>(
  ({ className, variant = 'default', gradient, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variant === 'default' && 'bg-aikit-bg-secondary border border-aikit-border',
          variant === 'ghost' && 'bg-transparent',
          variant === 'bordered' && 'border-2 border-aikit-border',
          gradient && 'bg-gradient-to-br from-aikit-accent/10 to-aikit-bg-secondary',
          'hover:border-aikit-border-hover transition-all duration-300',
          className
        )}
        {...props}
      />
    );
  }
);
AIKitCard.displayName = 'AIKitCard';

// Phase 3: Optimization (Week 7-8)
// Add performance optimizations, animations, advanced features
```

### 8.2 Component Replacement Matrix

| Current Component | AIKit Replacement | Migration Priority | Complexity |
|-------------------|-------------------|-------------------|-----------|
| Card | AIKitCard | High | Low |
| Button | AIKitButton | High | Low |
| Tabs | AIKitTabs | Critical | Medium |
| Badge | AIKitBadge | Medium | Low |
| Table | AIKitTable | High | High |
| Input | AIKitInput | Medium | Low |
| Select | AIKitSelect | Medium | Medium |
| Dialog | AIKitDialog | Low | Medium |
| Tooltip | AIKitTooltip | Low | Low |
| Progress | AIKitProgress | Medium | Low |

### 8.3 Compatibility Layer

To ensure smooth transition, we'll maintain a compatibility layer:

```typescript
// components/aikit/compat/index.ts
// Provides backwards-compatible exports during migration

export { AIKitCard as Card } from '../cards/AIKitCard';
export { AIKitButton as Button } from '../buttons/AIKitButton';
export { AIKitTabs as Tabs } from '../tabs/AIKitTabs';
// ... etc

// This allows gradual migration:
// Old: import { Card } from '@/components/ui/card';
// New: import { Card } from '@/components/aikit/compat';
// Final: import { AIKitCard } from '@/components/aikit/cards';
```

---

## 9. API Integration Points

### 9.1 Existing Service Layer (Preserved)

```typescript
// No changes to existing services
// services/usageService.ts
// services/billingService.ts
// services/dashboardService.ts
```

### 9.2 New Dashboard-Specific Hooks

```typescript
// hooks/useDashboardData.ts
export function useDashboardData() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } =
    useQuery({
      queryKey: ['dashboardStats'],
      queryFn: () => dashboardService.getRealtimeMetrics(),
      staleTime: 30000,
    });

  const { data: usage, isLoading: usageLoading } =
    useQuery({
      queryKey: ['usageMetrics', period],
      queryFn: () => usageService.getUsageMetrics(period),
      staleTime: 30000,
    });

  const { data: billing, isLoading: billingLoading } =
    useQuery({
      queryKey: ['billingInfo'],
      queryFn: () => billingService.getBillingInfo(),
      staleTime: 60000,
    });

  const { data: credits } =
    useQuery({
      queryKey: ['creditBalance'],
      queryFn: () => billingService.getCreditBalance(),
      staleTime: 30000,
    });

  return {
    stats,
    usage,
    billing,
    credits,
    isLoading: statsLoading || usageLoading || billingLoading,
    refetchAll: () => {
      refetchStats();
      // ... other refetch calls
    }
  };
}
```

### 9.3 API Endpoints Used

```
GET /api/v1/usage/metrics?period=30d
GET /api/v1/usage/limits
GET /api/v1/billing/info
GET /api/v1/billing/invoices
GET /api/v1/credits
GET /api/v1/credits/usage
GET /api/v1/subscription
GET /database/admin/kong/metrics
GET /database/admin/health

POST /api/v1/billing/payment-method
POST /api/v1/credits/purchase
PUT /api/v1/billing/auto-refill-settings
DELETE /api/v1/billing/payment-method/:id
```

---

## 10. Accessibility Compliance

### 10.1 WCAG 2.1 Level AA Requirements

#### Perceivable
- [ ] Text alternatives for non-text content
- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Content not solely reliant on color
- [ ] Responsive text sizing (up to 200%)
- [ ] Images of text avoided (use actual text)

#### Operable
- [ ] Full keyboard navigation support
- [ ] No keyboard traps
- [ ] Sufficient time for interactions (disable timeouts or allow extension)
- [ ] Skip navigation links
- [ ] Clear focus indicators (visible and high contrast)
- [ ] Multiple ways to navigate (tabs, search, breadcrumbs)

#### Understandable
- [ ] Language of page identified (lang attribute)
- [ ] Consistent navigation across tabs
- [ ] Clear error identification and suggestions
- [ ] Labels and instructions for inputs
- [ ] Help text available for complex interactions

#### Robust
- [ ] Valid HTML
- [ ] ARIA landmarks properly used
- [ ] Name, role, value properly exposed for custom components
- [ ] Status messages announced to screen readers

### 10.2 ARIA Implementation

```typescript
// Example: Accessible tab implementation
<Tabs
  value={activeTab}
  onValueChange={setActiveTab}
  aria-label="Dashboard navigation"
>
  <TabsList role="tablist">
    <TabsTrigger
      value="overview"
      role="tab"
      aria-selected={activeTab === 'overview'}
      aria-controls="overview-panel"
    >
      <LayoutDashboard aria-hidden="true" />
      <span>Overview</span>
    </TabsTrigger>
    {/* ... other tabs */}
  </TabsList>

  <TabsContent
    value="overview"
    role="tabpanel"
    id="overview-panel"
    aria-labelledby="overview-tab"
    tabIndex={0}
  >
    {/* Overview content */}
  </TabsContent>
</Tabs>
```

### 10.3 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus to next focusable element |
| Shift + Tab | Move focus to previous focusable element |
| Arrow Right | Move to next tab |
| Arrow Left | Move to previous tab |
| Home | Move to first tab |
| End | Move to last tab |
| Enter / Space | Activate focused element |
| Escape | Close modal/dropdown |

---

## 11. Security Considerations

### 11.1 Client-Side Security

#### Input Validation
- Validate all user inputs on client before sending to server
- Sanitize display of user-generated content
- Use TypeScript for type safety

#### Sensitive Data Handling
- Mask API keys by default (show only last 4 characters)
- Never log sensitive data (tokens, keys, passwords)
- Use environment variables for configuration

#### XSS Prevention
- Use React's automatic escaping
- Avoid `dangerouslySetInnerHTML`
- Sanitize any HTML content with DOMPurify if needed

### 11.2 API Security

#### Authentication
- Include JWT token in Authorization header
- Token refresh mechanism before expiration
- Handle 401 responses gracefully (redirect to login)

#### CSRF Protection
- Include CSRF token in all mutations
- SameSite cookie attribute set to 'Strict'

#### Rate Limiting
- Implement client-side request throttling
- Respect API rate limits (display warnings)
- Queue requests if necessary

### 11.3 Data Privacy

#### PII Handling
- No PII in localStorage (only anonymized IDs)
- Clear sensitive data on logout
- Comply with GDPR/CCPA requirements

#### Consent Management
- Cookie consent banner (if tracking enabled)
- Analytics opt-out mechanism
- Clear privacy policy link

---

## 12. Monitoring & Observability

### 12.1 Frontend Monitoring

```typescript
// Error tracking with Sentry (if integrated)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  }
});

// Custom performance tracking
export function trackTabSwitch(fromTab: string, toTab: string, duration: number) {
  if (window.gtag) {
    window.gtag('event', 'tab_switch', {
      from_tab: fromTab,
      to_tab: toTab,
      duration_ms: duration
    });
  }
}

// Usage tracking
export function trackFeatureUsage(feature: string, action: string) {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: 'Dashboard',
      event_label: feature
    });
  }
}
```

### 12.2 Analytics Events

| Event | Parameters | Purpose |
|-------|-----------|---------|
| dashboard_page_view | tab | Track tab views |
| tab_switch | from_tab, to_tab, duration | Tab navigation patterns |
| credit_purchase_click | plan | Purchase funnel |
| invoice_download | invoice_id | Feature usage |
| export_usage_data | format | Export feature tracking |
| welcome_dismissed | - | Onboarding completion |
| error_occurred | error_type, component | Error monitoring |

### 12.3 Health Checks

```typescript
// Dashboard health check endpoint
// /api/dashboard/health

export async function GET() {
  const checks = await Promise.all([
    checkServiceHealth('usage'),
    checkServiceHealth('billing'),
    checkServiceHealth('kong')
  ]);

  const allHealthy = checks.every(c => c.healthy);

  return Response.json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  }, {
    status: allHealthy ? 200 : 503
  });
}
```

---

## 13. Deployment Strategy

### 13.1 Deployment Phases

#### Phase 1: Feature Flag Deployment
```typescript
// Feature flag for AIKit dashboard
const useAIKitDashboard = process.env.NEXT_PUBLIC_USE_AIKIT_DASHBOARD === 'true';

export default function DashboardPage() {
  if (useAIKitDashboard) {
    return <DashboardClientAIKit />;
  }
  return <DashboardClientLegacy />;
}
```

#### Phase 2: Canary Deployment (10% traffic)
- Deploy to staging
- Enable for internal team (beta users)
- Monitor for 48 hours
- Collect feedback

#### Phase 3: Gradual Rollout
- Week 1: 10% of users
- Week 2: 25% of users (if no critical issues)
- Week 3: 50% of users
- Week 4: 100% of users

#### Phase 4: Legacy Cleanup
- Week 5: Remove feature flag
- Week 6: Delete legacy code
- Week 7: Final documentation update

### 13.2 Rollback Plan

```typescript
// Immediate rollback procedure
// 1. Set feature flag to false in environment
process.env.NEXT_PUBLIC_USE_AIKIT_DASHBOARD = 'false';

// 2. Trigger redeployment
npm run build && npm run deploy:production

// 3. Verify legacy dashboard loads
// 4. Investigate issues in AIKit version
// 5. Fix and redeploy when ready
```

### 13.3 Monitoring Post-Deployment

- Error rate monitoring (< 1% threshold)
- Performance monitoring (Lighthouse CI on every deploy)
- User feedback collection (in-app survey)
- Support ticket monitoring (dashboard-related)
- Rollback if critical issues within 24 hours

---

## 14. Documentation Requirements

### 14.1 Developer Documentation

- [ ] Component library documentation (Storybook)
- [ ] API integration guide
- [ ] State management patterns
- [ ] Custom hooks documentation
- [ ] Testing guide
- [ ] Deployment procedures

### 14.2 User Documentation

- [ ] Dashboard user guide
- [ ] Tab navigation help
- [ ] FAQ section
- [ ] Video tutorials (optional)
- [ ] Tooltips and inline help

### 14.3 Architecture Documentation

- [ ] System architecture diagrams (C4 model)
- [ ] Data flow diagrams
- [ ] Component hierarchy
- [ ] Integration points
- [ ] Security architecture
- [ ] This document (living document)

---

## 15. Conclusion

This architecture provides a comprehensive blueprint for integrating AIKit components into the `/dashboard` page. The design prioritizes:

1. **Modularity**: Clear separation of concerns with independent tabs
2. **Performance**: Lazy loading, code splitting, optimized bundle sizes
3. **Maintainability**: Well-documented components, consistent patterns
4. **User Experience**: Smooth animations, responsive design, accessibility
5. **Scalability**: Easy to extend with new tabs or features

The phased implementation approach mitigates risk while delivering value incrementally. With proper monitoring, testing, and rollback procedures, we can ensure a smooth transition to the AIKit-based dashboard.

---

## 16. Appendix

### 16.1 Glossary

- **AIKit**: Custom design system for AINative Studio
- **shadcn/ui**: Existing UI component library built on Radix UI
- **Tab Navigation**: Primary navigation pattern for dashboard sections
- **React Query**: Server state management library
- **Framer Motion**: Animation library for React
- **Lazy Loading**: Loading components on-demand to reduce initial bundle size

### 16.2 References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### 16.3 Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-29 | System Architect | Initial architecture design |

---

**Document Status:** Draft
**Next Review Date:** 2026-02-05
**Approval Required From:** Engineering Lead, Product Manager, Design Lead

---

*END OF DOCUMENT*
