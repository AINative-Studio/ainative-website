# CI/CD Disabled Components - Staging Repository

**Last Updated**: 2024-12-27
**Repository**: ainative-website-nextjs-staging
**Status**: Staging/Development Environment

---

## Overview

This document tracks all CI/CD components that are currently disabled or skipped in the staging repository. These components need to be enabled and properly configured before moving to production.

---

## Disabled GitHub Actions Workflows

### 1. Test Workflow (`test.yml.disabled`)

**Original File**: `.github/workflows/test.yml`
**Status**: Disabled (renamed to `.disabled`)
**Reason**: ESLint errors and missing test infrastructure

**Jobs Included**:

| Job | Description | Dependencies | Status |
|-----|-------------|--------------|--------|
| `test` | Runs ESLint linter and Jest unit tests with coverage | None | Disabled |
| `e2e` | Runs Playwright end-to-end browser tests | `test` | Disabled |
| `build` | Runs production build verification | `test`, `e2e` | Disabled |

**Required Actions for Production**:
- [ ] Fix remaining 363 ESLint errors (reduced from 534)
- [ ] Configure Jest test coverage thresholds
- [ ] Set up Codecov integration with valid token
- [ ] Configure Playwright for E2E testing
- [ ] Install Playwright browsers in CI environment
- [ ] Create E2E test scripts (`npm run test:e2e`)

**Configuration Details**:
```yaml
# test job
- npm run lint (ESLint)
- npm test -- --coverage --ci (Jest with coverage)
- Codecov coverage upload

# e2e job
- Playwright browser installation
- npm run test:e2e

# build job
- npm run build
```

---

### 2. Lighthouse CI Workflow (`lighthouse.yml.disabled`)

**Original File**: `.github/workflows/lighthouse.yml`
**Status**: Disabled (renamed to `.disabled`)
**Reason**: Missing Lighthouse configuration and performance budgets

**Jobs Included**:

| Job | Description | Dependencies | Status |
|-----|-------------|--------------|--------|
| `lighthouse` | Runs Lighthouse CI performance audits | None | Disabled |

**Required Actions for Production**:
- [ ] Create `lighthouserc.js` configuration file
- [ ] Define performance budgets (LCP, CLS, FID, etc.)
- [ ] Set up Lighthouse CI server or temporary public storage
- [ ] Configure performance thresholds for CI pass/fail
- [ ] Add Core Web Vitals monitoring

**Configuration Details**:
```yaml
# lighthouse job
- npm run build
- treosh/lighthouse-ci-action@v12
- Requires: lighthouserc.js
```

---

## Missing CI/CD Components

### Not Yet Implemented

| Component | Description | Priority | Notes |
|-----------|-------------|----------|-------|
| **Deployment Pipeline** | Automated deployment to staging/production | High | Vercel/Netlify integration |
| **Security Scanning** | Dependency vulnerability scanning | High | Snyk or Dependabot alerts |
| **Code Quality** | SonarQube or similar code analysis | Medium | Code smell detection |
| **Visual Regression** | Percy or Chromatic screenshot testing | Medium | UI change detection |
| **Bundle Analysis** | Webpack bundle size monitoring | Medium | Performance budgets |
| **Preview Deployments** | PR preview environments | Medium | Vercel/Netlify previews |
| **Release Automation** | Semantic versioning and changelog | Low | semantic-release |

---

## Configuration Files Status

| File | Purpose | Status | Action Required |
|------|---------|--------|-----------------|
| `lighthouserc.js` | Lighthouse CI config | Missing | Create configuration |
| `playwright.config.ts` | Playwright E2E config | Missing | Create configuration |
| `.codecov.yml` | Coverage reporting config | Missing | Create configuration |
| `jest.config.js` | Jest test configuration | Exists | Verify coverage thresholds |
| `.eslintrc.json` | ESLint configuration | Exists | Fix remaining 363 errors |

---

## Environment Variables Required for CI

| Variable | Purpose | Status |
|----------|---------|--------|
| `CODECOV_TOKEN` | Coverage report uploads | Not configured |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI GitHub integration | Not configured |
| `VERCEL_TOKEN` | Deployment automation | Not configured |
| `NEXT_PUBLIC_*` | Public environment variables | Partially configured |

---

## Re-enabling Workflows

To re-enable the disabled workflows:

```bash
# Re-enable test workflow
mv .github/workflows/test.yml.disabled .github/workflows/test.yml

# Re-enable lighthouse workflow
mv .github/workflows/lighthouse.yml.disabled .github/workflows/lighthouse.yml
```

---

## Production Readiness Checklist

### Before Going Live

- [ ] All ESLint errors resolved (currently 363 remaining)
- [ ] Test coverage meets threshold (>80% recommended)
- [ ] E2E tests passing for critical user flows
- [ ] Lighthouse scores meet budgets (Performance >90)
- [ ] Security vulnerabilities addressed (see Dependabot)
- [ ] Environment variables properly configured
- [ ] Deployment pipeline tested and verified
- [ ] Rollback procedures documented

---

## Related Issues

- **Issue #239**: ESLint cleanup (in progress)
- **Issue #240**: TypeScript type assertions (completed)

---

## Contact

For questions about CI/CD configuration, contact the DevOps team or create an issue in the repository.
