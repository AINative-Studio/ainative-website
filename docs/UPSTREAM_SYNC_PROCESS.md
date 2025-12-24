# Upstream Sync & Porting Operations

## Overview

The Next.js migration project (`AINative-Studio/ainative-website-nextjs-staging`) must maintain feature parity with the upstream Vite/React project (`relycapital/AINative-website`). Since these are separate codebases with different tech stacks, changes cannot be merged directly - they must be **ported** (reimplemented in Next.js patterns).

---

## Complete Porting Workflow

### Step 1: Analyze Divergence

```bash
# Check commit divergence between repos
cd /path/to/upstream-vite-spa
git fetch origin
git log --oneline origin/main | head -50

cd /path/to/nextjs-target
git fetch origin
git log --oneline origin/main | head -50

# Count total commits to understand divergence scale
git rev-list --count origin/main  # Run in each repo
```

### Step 2: Enter Plan Mode

When significant divergence exists (>20 commits), use Claude's plan mode:

```
> go into planning mode to figure out the best approach to port these features
```

This creates a structured plan file in `~/.claude/plans/` with:
- Gap analysis
- Priority categorization
- Workstream organization
- Testing strategy

### Step 3: Gap Analysis

Create a comparison table to understand the scope:

| Metric | Next.js (Target) | Vite SPA (Source) | Gap |
|--------|------------------|-------------------|-----|
| Pages/Routes | Count | Count | Delta |
| Services | Count | Count | Delta |
| Components | Count | Count | Delta |
| Test Coverage | Tests | Tests | Delta |

### Step 4: Prioritize Features

Categorize all gaps by business priority:

| Priority | Description | Examples |
|----------|-------------|----------|
| **P0** | Critical - blocks production | Auth, revenue features, core functionality |
| **P1** | Important - key differentiators | AI products, content platform, API integrations |
| **P2** | Nice-to-have | Analytics, support widgets, UI polish |

### Step 5: Create Backlog of Stories (< 3 Points Each)

**Critical Rule**: Every porting task must be broken into stories of **less than 3 story points**.

#### Story Point Guidelines

| Points | Scope | Examples |
|--------|-------|----------|
| **1** | Single file, simple logic | Add one API method, port one component |
| **2** | 2-3 files, moderate complexity | Service + tests, component + styling |
| **3** | MAX - Multiple files, integration needed | Dashboard page + service + tests |

#### Breaking Down Large Features

If a feature is > 3 points, split it:

```
❌ BAD: "Port QNN Dashboard" (13 components, ~8 points)

✅ GOOD:
- "Create qnn-service.ts with TDD tests" (2 points)
- "Create QNN Dashboard page skeleton" (1 point)
- "Add Models tab to QNN Dashboard" (2 points)
- "Add Training tab to QNN Dashboard" (2 points)
- "Add Benchmarks tab to QNN Dashboard" (2 points)
- "Add Monitoring tab to QNN Dashboard" (2 points)
```

### Step 6: Create GitHub Issues for Each Story

**Every story gets a GitHub issue** before work begins.

#### Issue Template

```markdown
## [Port] <Feature Name>

### Story Points: X (must be < 3)

### Upstream Reference
- **Source Files**: `src/components/qnn/ModelManager.tsx`
- **Commit**: `abc123` (if applicable)
- **PR**: #XX (if applicable)

### Target Files
- `lib/qnn-service.ts`
- `lib/__tests__/qnn-service.test.ts`
- `app/dashboard/qnn/page.tsx`

### Acceptance Criteria
- [ ] Tests written FIRST (TDD)
- [ ] Implementation passes all tests
- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Type check passes (`npm run type-check`)

### Dependencies
- Depends on: #XX (if applicable)
- Blocks: #YY (if applicable)

### Labels
`upstream-sync`, `port`, `P0|P1|P2`
```

#### Issue Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Create    │────▶│   Create    │────▶│   Close     │
│   Issue     │     │   PR        │     │   Issue     │
│             │     │   (link to  │     │   (auto on  │
│             │     │   issue)    │     │   PR merge) │
└─────────────┘     └─────────────┘     └─────────────┘
```

**PR Description must include:**
```markdown
Closes #XX

## Changes
- Created qnn-service.ts with 35 API methods
- Added comprehensive TDD tests

## Test Results
- 496 tests passing
- Build successful
```

### Step 7: Feature-by-Feature Porting (NOT Cherry-Pick)

**Why NOT cherry-pick commits:**
1. Architecture mismatch (react-router-dom vs App Router)
2. State management differs (localStorage vs NextAuth)
3. API patterns differ (axios interceptors vs api-client.ts fetch wrapper)
4. Component patterns differ (client-only vs Server Components)

**Porting workflow for each story:**

```
1. READ    - Study upstream implementation for feature logic
2. ADAPT   - Design Next.js-native implementation
3. TEST    - Write failing tests FIRST (TDD)
4. CODE    - Implement minimum to pass tests
5. REFACTOR - Clean up while tests pass
6. VERIFY  - npm run build && npm test
7. PR      - Create PR linked to issue
```

### Step 8: Organize Parallel Workstreams

For large porting efforts, organize into parallel streams:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PARALLEL WORKSTREAMS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Stream A: Critical Path (P0)          Stream B: Content (P1)       │
│  ├── Authentication/SSO               ├── Strapi client             │
│  ├── Core Dashboard                   ├── HLS Video Player          │
│  ├── Revenue Features                 ├── Search functionality      │
│  └── API Integrations                 └── Comments System           │
│                                                                     │
│  Stream C: AI Products (P1)            Stream D: Platform (P2)      │
│  ├── QNN Dashboard                    ├── Analytics (GTM)           │
│  ├── Model Management                 ├── Support (Chatwoot)        │
│  ├── Training UI                      ├── Performance monitoring    │
│  └── Benchmarking                     └── UI Polish                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Step 9: TDD for Every Feature

**Mandatory TDD approach:**

```
1. RED   - Write failing tests first
2. GREEN - Implement minimum code to pass
3. REFACTOR - Clean up while tests pass
```

**Test file conventions:**
```
lib/__tests__/{service-name}.test.ts     # Service tests
components/__tests__/{Component}.test.tsx # Component tests
e2e/{feature}.spec.ts                     # E2E tests (Playwright)
```

### Step 10: Verification Checklist

Before merging any PR:

- [ ] Tests written BEFORE implementation
- [ ] All unit tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Coverage maintained at 80%+
- [ ] PR linked to issue with "Closes #XX"

---

## Remote Configuration

```bash
# Upstream (Vite/React source of truth)
upstream = https://github.com/relycapital/AINative-website.git

# Origin (Next.js staging migration)
origin = https://github.com/AINative-Studio/ainative-website-nextjs-staging.git
```

---

## Sync Schedule

**Frequency**: End of every sprint (approximately every 1-2 weeks)

**Process**:
1. At sprint end, review upstream commits since last sync
2. Run gap analysis
3. Create backlog of < 3 point stories
4. Create GitHub issues for each story
5. Execute ports with TDD in the following sprint

---

## Port Guidelines

### Porting Services

1. **Create service file** in `lib/{service-name}.ts`
2. **Write tests FIRST** in `lib/__tests__/{service-name}.test.ts`
3. **Use api-client.ts** for HTTP calls (not axios directly)
4. **Export types** alongside functions
5. **Follow existing patterns** (see `lib/qnn-service.ts` as reference)

### Porting Components

1. **Copy component logic** from `upstream/src/components/`
2. **Add 'use client' directive** if component uses:
   - useState, useEffect, useRef
   - Event handlers (onClick, onChange)
   - Browser APIs
3. **Update imports**:
   - Change `@/` paths to match Next.js structure
   - Use `next/link` instead of react-router-dom Link
   - Use `next/image` for images
4. **Update types** to match TypeScript configuration
5. **Write tests** before implementation

### Porting Pages

Next.js App Router pattern:

```
app/
  dashboard/
    feature-name/
      page.tsx           # Server Component (metadata, layout)
      FeatureClient.tsx  # Client Component ('use client', interactivity)
```

**Server Component (page.tsx):**
```tsx
import { Metadata } from 'next';
import FeatureClient from './FeatureClient';

export const metadata: Metadata = {
  title: 'Feature Name | AINative Studio',
  description: 'Feature description for SEO',
};

export default function FeaturePage() {
  return <FeatureClient />;
}
```

**Client Component (FeatureClient.tsx):**
```tsx
'use client';

import { useState, useEffect } from 'react';
import featureService from '@/lib/feature-service';

export default function FeatureClient() {
  const [data, setData] = useState([]);
  // ... component logic
}
```

---

## Key File Mappings

| Source (Vite SPA) | Target (Next.js) |
|-------------------|------------------|
| `src/services/*.ts` | `lib/*.ts` |
| `src/components/*` | `components/*` |
| `src/pages/*` | `app/*/page.tsx` |
| `src/__tests__/*` | `lib/__tests__/*` |
| `src/contexts/*` | `lib/contexts/*` or React Query |
| `src/hooks/*` | `lib/hooks/*` |

---

## GitHub Labels for Tracking

| Label | Description |
|-------|-------------|
| `upstream-sync` | All porting-related issues |
| `port` | Individual port task |
| `P0`, `P1`, `P2` | Priority level |
| `tdd` | Requires test-first approach |
| `blocked` | Waiting on dependency |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Feature parity | 100% of P0/P1 features ported |
| Test coverage | Maintain 80%+ |
| Story size | All stories < 3 points |
| Build time | No increase > 10% |
| Bundle size | No increase > 15% |
| Lighthouse score | Maintain 90+ |

---

## Automation (Future)

Consider implementing:

1. **GitHub Action**: Weekly upstream diff report
2. **Auto-issue creation**: Generate port issues from commit analysis
3. **PR template**: Enforce issue linking
4. **Coverage gates**: Block PRs below 80% coverage

---

## Contact

- **Upstream Repo**: https://github.com/relycapital/AINative-website
- **Next.js Migration**: https://github.com/AINative-Studio/ainative-website-nextjs-staging
- **Sync Issues Label**: `upstream-sync`
