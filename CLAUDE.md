# AINative Studio Next.js - Project Memory

**Project**: AINative Studio Marketing Website (Next.js Migration)
**Tech Stack**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
**Repository**: ainative-website-nextjs-staging
**Last Updated**: 2025-12-09

---

## Development Conventions

### Port Assignments (CRITICAL)

- **Port 3000**: Reserved for AINative Studio Next.js dev server
  - If port 3000 is occupied, KILL the other service and take over
  - Always maintain port 3000 during development sessions
  - Run: `pkill -f "next" && npm run dev` to reclaim the port

- **Port 3001**: Reserved for other local services (see related conventions)

### Local Development Workflow

```bash
# Start dev server (kills existing processes if needed)
pkill -f "next" 2>/dev/null; rm -rf .next && npm run dev

# Quick restart
npm run dev

# Build verification before commit
npm run lint && npm run type-check && npm run build
```

### Pre-Commit Checklist

1. Run `npm run lint` - must pass (warnings OK, no errors)
2. Run `npm run type-check` - must pass
3. Run `npm run build` - must succeed
4. Run page-specific test script if exists (e.g., `./test/issue-92-agent-swarm.test.sh`)

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
components/
  layout/              # Header, Footer, navigation
  ui/                  # shadcn/ui components
lib/
  config/app.ts        # Centralized app configuration
  api-client.ts        # HTTP client for API calls
  env.ts               # Environment variable validation
services/
  pricingService.ts    # Stripe checkout integration
test/                  # Page-specific test scripts
```

---

## GitHub Workflow

- **Staging Repo**: No GitHub Actions (use local verification)
- **CI/CD**: Disabled for staging, use local `npm run build` for verification
- **PRs**: Create against `main` branch

---

## Related Memories

- Port 3001 convention for secondary services
- Original Vite SPA in `/home/quaid/Documents/Projects/ainative-studio/src/AINative-website/`
