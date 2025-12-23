# AINative Studio - QA Documentation

**Issue:** #193 - Document Manual QA Testing Procedures

This directory contains all QA testing documentation for the AINative Studio Next.js application.

## Documents

| Document | Description |
|----------|-------------|
| [testing-checklist.md](./testing-checklist.md) | Critical user flow testing |
| [accessibility-testing.md](./accessibility-testing.md) | Accessibility testing procedures |
| [responsive-testing.md](./responsive-testing.md) | Mobile responsiveness guide |
| [browser-compatibility.md](./browser-compatibility.md) | Browser testing matrix |
| [performance-testing.md](./performance-testing.md) | Performance testing guidelines |

## Quick Reference

### Test Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | http://localhost:3000 | Development testing |
| Staging | https://staging.ainative.studio | UAT, integration |
| Production | https://ainative.studio | Smoke tests only |

### Testing Tools

| Category | Tool | Purpose |
|----------|------|---------|
| Accessibility | axe DevTools | WCAG compliance |
| Performance | Lighthouse | Core Web Vitals |
| Cross-browser | BrowserStack | Browser testing |
| Responsive | Chrome DevTools | Device emulation |
| E2E | Playwright | Automated testing |

### Priority Levels

| Priority | Description | Testing Required |
|----------|-------------|------------------|
| P0 | Critical path | Every release |
| P1 | Core features | Every release |
| P2 | Secondary features | Major releases |
| P3 | Nice-to-have | Quarterly |

## Testing Workflow

```
1. Feature Development
   └── Developer testing (local)

2. Pull Request
   └── Automated tests (CI)

3. Code Review
   └── Manual spot checks

4. Staging Deployment
   └── Full QA testing

5. UAT Sign-off
   └── Stakeholder approval

6. Production Deployment
   └── Smoke tests
```

## Related Documentation

- [Deployment Documentation](../deployment/README.md)
- [UAT Checklist](../deployment/uat-checklist.md)
