# AINative Studio Next.js - Project Memory

---
## CRITICAL: GIT COMMIT RULES - ZERO TOLERANCE

**READ AND FOLLOW: `.claude/rules/git-rules.md`**

**NEVER include in commits, PRs, or GitHub activity:**
- "Claude" / "Anthropic" / "claude.com"
- "Generated with Claude" / "Claude Code"
- "Co-Authored-By: Claude" or any Claude/Anthropic reference

**EVERY commit must be checked before pushing.** Violations require immediate cleanup with force push.

---

**Project**: AINative Studio Marketing Website (Next.js Migration)
**Tech Stack**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
**Repository**: ainative-website-nextjs-staging
**Last Updated**: 2025-12-24

---

## MCP Servers (Required for Development)

This project uses the following MCP servers configured in `~/.claude/settings.json`:

### ZeroDB MCP Server
- **Purpose**: Vector database, embeddings, agent memory, RLHF
- **Package**: `ainative-zerodb-mcp-server`
- **Key Tools**:
  - `zerodb_semantic_search` - Search vectors
  - `zerodb_store_memory` - Persist agent context
  - `zerodb_embed_and_store` - Store embeddings

### GitHub MCP Server
- **Purpose**: GitHub API integration for issues, PRs, commits
- **Package**: `@modelcontextprotocol/server-github`

### Sequential Thinking MCP Server
- **Purpose**: Complex multi-step reasoning
- **Package**: `@modelcontextprotocol/server-sequential-thinking`

### Memory MCP Server
- **Purpose**: Persistent knowledge graph
- **Package**: `@modelcontextprotocol/server-memory`

### Filesystem MCP Server
- **Purpose**: Extended file access
- **Package**: `@modelcontextprotocol/server-filesystem`

---

## Project Agents (`.claude/agents/`)

Specialized agents available for parallel work:

| Agent | Purpose | Color |
|-------|---------|-------|
| `frontend-ux-architect` | UI/UX design and implementation | cyan |
| `frontend-ui-builder` | Component building | - |
| `backend-api-architect` | API design and TDD | - |
| `devops-orchestrator` | CI/CD and deployment | - |
| `qa-bug-hunter` | QA testing and bug detection | - |
| `test-automation-specialist` | Test coverage and TDD | - |
| `playwright-frontend-qa` | E2E browser testing | - |
| `system-architect` | System design | - |
| `quantum-computing-expert` | Quantum algorithms | - |
| `ux-research-investigator` | User research | - |

---

## SEO Implementation (SSR-Enabled)

### Root Layout (`app/layout.tsx`)
- Comprehensive `metadata` export with Open Graph, Twitter Cards
- Structured Data via `components/seo/StructuredData.tsx`
- JSON-LD schemas: Organization, SoftwareApplication, WebSite

### Per-Page Metadata Pattern
```tsx
// app/[page]/page.tsx
export const metadata: Metadata = {
  title: 'Page Title', // Uses template: '%s | AI Native Studio'
  description: 'Page description',
  openGraph: { ... },
  twitter: { ... },
};
```

### SEO Assets (`public/`)
- `card.png` - OG/Twitter share image (1200x630)
- `code_simple_logo.jpg` - Favicon and app icon
- `manifest.json` - PWA manifest

### Structured Data Components
```tsx
import { BreadcrumbSchema, FAQSchema, ProductSchema, ArticleSchema } from '@/components/seo/StructuredData';
```

---

## Development Conventions

### Port Assignments (CRITICAL)

- **Port 3000**: Reserved for AINative Studio Next.js dev server
  - If port 3000 is occupied, KILL the other service and take over
  - Always maintain port 3000 during development sessions
  - Run: `pkill -f "next" && npm run dev` to reclaim the port

- **Port 3001**: Reserved for other local services

### Local Development Workflow

```bash
# Start dev server (kills existing processes if needed)
pkill -f "next" 2>/dev/null; rm -rf .next && npm run dev

# Quick restart
npm run dev

# Build verification before commit
npm run lint && npm run type-check && npm run build

# Run tests
npm test
```

### Pre-Commit Checklist

1. Run `npm run lint` - must pass (warnings OK, no errors)
2. Run `npm run type-check` - must pass
3. Run `npm run build` - must succeed
4. Run `npm test` - all tests must pass

---

## Architecture Patterns

### Page Migration Pattern (from Vite SPA)

When migrating pages from the original Vite SPA:

1. **Server Component** (`app/[page]/page.tsx`):
   - Export `metadata` for SEO (replaces react-helmet-async)
   - Import and render the client component
   - No 'use client' directive

2. **Client Component** (`app/[page]/[Page]Client.tsx`):
   - Add `'use client'` directive at top
   - Convert `react-router-dom` Link to Next.js Link (`to=` → `href=`)
   - Remove Helmet imports
   - Keep framer-motion for animations
   - Import services from `@/services/`

3. **Test Script** (`test/issue-[N]-[page].test.sh`):
   - Verify file structure
   - Check for required patterns
   - Validate no forbidden imports (react-router-dom, react-helmet-async)

---

## Key Directories

```
app/                    # Next.js App Router pages
  layout.tsx           # Root layout with SEO metadata
  sitemap.ts           # Dynamic sitemap generation
  robots.ts            # Robots.txt configuration
components/
  layout/              # Header, Footer, navigation
  ui/                  # shadcn/ui components
  seo/                 # SEO components (StructuredData)
lib/
  config/app.ts        # Centralized app configuration
  api-client.ts        # HTTP client for API calls
  env.ts               # Environment variable validation
services/
  pricingService.ts    # Stripe checkout integration
  apiKeyService.ts     # API key management
  creditService.ts     # Credit system
  usageService.ts      # Usage tracking
  subscriptionService.ts # Subscription management
  userSettingsService.ts # User settings
  billingService.ts    # Billing operations
test/                  # Page-specific test scripts
public/
  card.png             # OG share image
  code_simple_logo.jpg # Logo/favicon
  manifest.json        # PWA manifest
.claude/
  agents/              # Specialized agent definitions
  rules/               # Git and project rules
```

---

## GitHub Workflow

- **Staging Repo**: No GitHub Actions (use local verification)
- **CI/CD**: Disabled for staging, use local `npm run build` for verification
- **PRs**: Create against `main` branch

---

## Parallel Agent Workflow (REQUIRED)

For PRD-driven, spec-driven, TDD, or BDD projects, **always prefer running multiple agents in parallel**:

1. **Analyze the work** - Identify independent workstreams (frontend, backend, tests, docs)
2. **Launch agents concurrently** - Use Task tool with multiple agents in a single message
3. **Track progress** - Each agent displays with distinct color showing its current task

### Example Parallel Launch
```
When implementing a feature from a PRD:
- frontend-ux-architect → UI components
- backend-api-architect → API endpoints
- test-automation-specialist → Test coverage
- devops-orchestrator → Deployment config
```

---

## Original Site Reference

- **Location**: `/Users/tobymorning/Desktop/AINative-website-main/`
- **SEO Reference**: `index.html` contains full OG/Twitter/Schema markup
- **Assets**: `public/` folder has `card.png`, `code_simple_logo.jpg`
