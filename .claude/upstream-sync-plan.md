# Upstream Sync Plan

## Purpose
Prevent drift between the production Vite SPA and the Next.js staging site by establishing a regular sync cadence.

## Sync Cadence
Perform an upstream sync **between each epic** completion, before starting the next epic.

## Sync Checklist

### Pre-Sync
1. Ensure all current epic work is merged to `main`
2. Run `git status` to verify clean working directory
3. Check production site for any recent changes

### Sync Process
1. **Visual Comparison**
   - Take screenshots of production pages
   - Compare with localhost:3001
   - Note any differences in Header, Footer, navigation, styling

2. **Component Sync**
   ```bash
   # Check for new/modified components in Vite project
   cd /home/quaid/Documents/Projects/ainative-studio/src/AINative-website
   git log --oneline -20  # Recent changes
   find src/components -newer <last-sync-date> -name "*.tsx"
   ```

3. **Route Sync**
   ```bash
   # Compare routes between projects
   # Vite routes in src/App.tsx
   # Next.js routes in app/*/page.tsx
   ```

4. **Content Sync**
   - Check for new pages added to production
   - Check for navigation changes
   - Check for footer link updates

### Post-Sync
1. Create TDD test script for any new components/pages
2. Run all existing tests to verify no regressions
3. Create story documenting sync work
4. Create PR with changes
5. Close story after merge

## Sync History

| Date | Epic Completed | Changes Synced | Story # |
|------|----------------|----------------|---------|
| 2025-12-17 | Sprint 2 Dashboard | Header, Footer, Design System, Login, Signup | #111 |

## Files to Monitor

### High Priority (sync immediately)
- `components/layout/Header.tsx` - Navigation changes
- `components/layout/Footer.tsx` - Footer links
- `app/layout.tsx` - Global layout changes

### Medium Priority (sync at epic boundary)
- Product pages content
- Pricing tiers/features
- New pages

### Low Priority (sync at sprint boundary)
- Styling tweaks
- Animation updates
- Minor copy changes

## Automation Ideas
- Create a diff script to compare production vs local
- Set up visual regression testing
- Add sync reminder to epic completion checklist
