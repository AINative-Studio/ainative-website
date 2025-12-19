# Upstream Sync Process

## Overview

The Next.js migration project (`AINative-Studio/ainative-website-nextjs-staging`) must maintain feature parity with the upstream Vite/React project (`relycapital/AINative-website`). Since these are separate codebases with different tech stacks, changes cannot be merged directly - they must be **ported** (reimplemented in Next.js).

## Sync Schedule

**Frequency**: End of every sprint (approximately every 1-2 weeks)

**Process**:
1. At sprint end, review upstream commits since last sync
2. Categorize changes by type (features, fixes, styling)
3. Create port issues for each significant change
4. Execute ports in the following sprint or as part of sync sprint

## Remote Configuration

```bash
# Upstream (Vite/React source of truth)
upstream = https://github.com/relycapital/AINative-website.git

# Origin (Next.js staging migration)
origin = https://github.com/AINative-Studio/ainative-website-nextjs-staging.git
```

## Sync Workflow

### 1. Check for Upstream Changes

```bash
# Fetch upstream
git fetch upstream

# View commits since last sync (use commit hash from SYNC_LOG.md)
git log --oneline <last-sync-commit>..upstream/main

# Or view recent commits
git log --oneline --since="2024-12-01" upstream/main
```

### 2. Categorize Changes

Group upstream commits by type:

| Type | Description | Port Strategy |
|------|-------------|---------------|
| **Feature** | New components, pages, functionality | Full reimplementation in Next.js |
| **Design System** | Colors, icons, typography, animations | Copy/adapt Tailwind config, port components |
| **Bug Fix** | Logic fixes, error handling | Port if applicable to Next.js version |
| **Build/Config** | Vite-specific configs | Skip (N/A to Next.js) |
| **Documentation** | READMEs, guides | Copy directly if relevant |

### 3. Create Port Issues

For each significant change, create a GitHub issue:

```markdown
Title: [Port] <Feature Name> from Upstream

## Upstream Reference
- Commit: <hash>
- PR: <if applicable>
- Files: <list of files>

## Port Requirements
- [ ] List components to create
- [ ] List files to modify
- [ ] List dependencies to add

## Acceptance Criteria
- [ ] Feature works identically to upstream
- [ ] All tests pass
- [ ] Build succeeds
```

### 4. Update Sync Log

After completing sync review, update `docs/SYNC_LOG.md`:

```markdown
## Sync: YYYY-MM-DD (Sprint X)

**Last Upstream Commit**: <hash>
**Changes Reviewed**: X commits

### Ported
- Feature A (#issue)
- Feature B (#issue)

### Skipped (N/A)
- Vite config changes
- Build optimizations
```

---

## Current Sync Status

**Last Sync**: Never (initial migration)
**Upstream HEAD**: `94234fa` (2024-12-19)

### Pending Ports (Sprint 2 End)

Based on upstream analysis, the following need to be ported:

#### Priority 1: Design System (Foundation)
1. **Design System Phase 1**: Color system, shadows (`tailwind.config.cjs`)
2. **Design System Phase 2**: Custom icon library (30+ icons)
3. **Design System Phase 3**: Branded form components
4. **Design System Phase 5**: Animations

#### Priority 2: Features
5. **Chatwoot Widget**: Customer support chat (script in layout)
6. **Homepage Modernization**: Updated homepage design
7. **Blog View Tracking**: View count display
8. **ReactMarkdown Integration**: Blog detail markdown rendering

#### Priority 3: Bug Fixes
9. **Branding Components**: Missing component fixes
10. **Button Styling**: Nested link warnings, styling issues

#### Skip (Vite-Specific)
- Manual chunks configuration
- Code splitting optimizations
- Vercel cache clearing

---

## Port Guidelines

### Porting Components

1. **Copy the component** from `upstream/src/components/` to `components/`
2. **Update imports**:
   - Change `@/` paths to match Next.js structure
   - Replace Vite-specific imports if any
3. **Add 'use client' directive** if component uses:
   - useState, useEffect, useRef
   - Event handlers (onClick, onChange)
   - Browser APIs
4. **Update types** to match our TypeScript configuration

### Porting Styles

1. **Tailwind Config**: Merge color/animation definitions
2. **Global CSS**: Copy relevant styles to `app/globals.css`
3. **Component Classes**: Usually work as-is

### Porting Scripts (e.g., Chatwoot)

For Next.js, use `next/script`:

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          id="chatwoot-widget"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `/* Chatwoot script */`
          }}
        />
      </body>
    </html>
  )
}
```

---

## Automation (Future)

Consider implementing:

1. **GitHub Action**: Weekly upstream diff report
2. **Slack/Discord notification**: Alert when upstream has significant changes
3. **Automated issue creation**: Generate port issues from commit analysis

---

## Contact

- **Upstream Repo**: https://github.com/relycapital/AINative-website
- **Next.js Migration**: https://github.com/AINative-Studio/ainative-website-nextjs-staging
- **Sync Issues Label**: `upstream-sync`
