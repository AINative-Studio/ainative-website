# Production Readiness Checklist

This comprehensive checklist ensures all critical aspects are verified before deploying to production. Use this as a gate for production releases.

**Date:** 2026-02-08
**Incident Context:** www.ainative.studio outage (NextAuth secret, missing files, env vars)
**Status:** REQUIRED for all production deployments

---

## Executive Summary

This checklist covers:
- Environment configuration validation
- Build-time dependency verification
- Security hardening
- Monitoring and observability
- Incident response readiness
- Performance and capacity planning

**Go/No-Go Decision:** ALL items marked CRITICAL must pass. RECOMMENDED items should be tracked as tech debt if deferred.

---

## 1. Environment Configuration

### 1.1 Environment Variables

**CRITICAL: Missing environment variables cause runtime failures**

| Check | Status | Validation |
|-------|--------|------------|
| All required env vars defined in `.env.example` | ☐ | Run `npm run validate:env` |
| NEXTAUTH_SECRET configured (min 32 chars) | ☐ | Check length, uniqueness |
| NEXTAUTH_URL matches deployment domain | ☐ | Verify https://www.ainative.studio |
| DATABASE_URL uses correct port (6432 for PgBouncer) | ☐ | Verify connection string |
| All NEXT_PUBLIC_* vars set for client-side access | ☐ | Check build output for undefined |
| Stripe keys (PUBLISHABLE, SECRET, WEBHOOK) configured | ☐ | Test payment flow |
| API base URLs point to production endpoints | ☐ | Verify https://api.ainative.studio |
| OAuth credentials (GitHub, Google) configured | ☐ | Test OAuth flow |
| Sentry DSN and auth token configured | ☐ | Verify error tracking |
| No secrets in client-side env vars | ☐ | Audit NEXT_PUBLIC_* values |

**Validation Script:** `scripts/validate-env-vars.sh`

**Failure Remediation:**
- Missing NEXTAUTH_SECRET → Generate with `openssl rand -base64 32`
- Wrong DATABASE_URL → Update to PgBouncer port 6432
- Missing OAuth creds → Block social login, show clear error

---

### 1.2 Environment Variable Sync

**CRITICAL: Local, CI, and production must match**

| Check | Status | Validation |
|-------|--------|------------|
| `.env.example` updated with all new variables | ☐ | `git diff .env.example` |
| Railway service env vars match `.env.example` | ☐ | `railway variables --json \| jq` |
| GitHub Actions secrets match `.env.example` | ☐ | Review settings manually |
| No hardcoded values in code (use process.env) | ☐ | `grep -r "sk_live_" src/` (should be empty) |
| Env var documentation updated | ☐ | Check README.md |

**Failure Example:** 2026-02-08 - NEXTAUTH_SECRET added to code but not Railway, causing NO_SECRET error

---

## 2. Build Validation

### 2.1 Dependencies and Imports

**CRITICAL: Missing files cause build failures**

| Check | Status | Validation |
|-------|--------|------------|
| All imports resolve to existing files | ☐ | `npm run build` (zero errors) |
| No dynamic imports without error boundaries | ☐ | `grep -r "import(.*)" src/` |
| TypeScript compilation succeeds | ☐ | `npm run type-check` |
| No missing dependencies in package.json | ☐ | `npm ci` (fresh install) |
| No peer dependency warnings | ☐ | Check `npm install` output |
| Lock file committed (package-lock.json) | ☐ | `git status` |

**Failure Example:** 2026-02-08 - `lib/utils/thumbnail-generator.ts` missing, caused build failure

**Validation:**
```bash
# Fresh build from clean state
rm -rf node_modules .next
npm ci
npm run build
```

---

### 2.2 Build Artifacts

**RECOMMENDED: Verify build output quality**

| Check | Status | Validation |
|-------|--------|------------|
| Build completes in < 10 minutes | ☐ | Time `npm run build` |
| Bundle size within acceptable limits | ☐ | `du -sh .next` (< 500MB) |
| No console errors/warnings in build output | ☐ | Review build logs |
| Source maps generated for debugging | ☐ | Check `.next/**/*.map` |
| Static assets optimized | ☐ | Lighthouse audit |

---

## 3. Security

### 3.1 Secrets Management

**CRITICAL: Leaked secrets compromise security**

| Check | Status | Validation |
|-------|--------|------------|
| No secrets committed to git | ☐ | `git log -S "sk_live_" --all` |
| .env files in .gitignore | ☐ | `git check-ignore .env.local` |
| Server-side env vars not exposed to client | ☐ | Check browser Network tab |
| Secrets rotated if leaked | ☐ | Audit access logs |
| Railway env vars use secure storage | ☐ | Verify Railway UI |

**Validation:**
```bash
# Check for common secret patterns
grep -r "sk_live_\|sk_test_\|api_key\|secret_key" src/ --exclude-dir=node_modules
```

---

### 3.2 Authentication and Authorization

**CRITICAL: Auth failures lock users out**

| Check | Status | Validation |
|-------|--------|------------|
| NextAuth secret configured | ☐ | `echo $NEXTAUTH_SECRET \| wc -c` (>= 32) |
| OAuth callbacks whitelisted | ☐ | GitHub/Google app settings |
| Session cookies use secure flags (httpOnly, sameSite) | ☐ | Browser DevTools |
| CSRF protection enabled | ☐ | Test form submission |
| JWT expiry configured | ☐ | Check authOptions.jwt.maxAge |
| Database session persistence works | ☐ | Test login/logout flow |

---

### 3.3 Input Validation

**CRITICAL: Prevent injection attacks**

| Check | Status | Validation |
|-------|--------|------------|
| All API inputs validated with Zod/Yup | ☐ | Audit API routes |
| SQL queries use parameterized queries | ☐ | Grep for string concatenation |
| File uploads validate type and size | ☐ | Upload malicious file |
| Rate limiting enabled | ☐ | Test API with rapid requests |

---

## 4. Monitoring and Observability

### 4.1 Error Tracking

**CRITICAL: Can't fix what you can't see**

| Check | Status | Validation |
|-------|--------|------------|
| Sentry configured and receiving errors | ☐ | Trigger test error |
| Error boundaries catch React errors | ☐ | Throw error in component |
| Unhandled promise rejections logged | ☐ | Check Sentry for unhandled |
| Error alerts configured | ☐ | Sentry alert rules |
| PII scrubbed from error reports | ☐ | Audit beforeSend hook |

**Test:**
```typescript
// Trigger test error
throw new Error("Production readiness test error");
```

---

### 4.2 Logging

**RECOMMENDED: Structured logging for debugging**

| Check | Status | Validation |
|-------|--------|------------|
| Logs use structured format (JSON) | ☐ | Check Railway logs |
| Log levels appropriate (ERROR, WARN, INFO) | ☐ | Audit console.log usage |
| No secrets logged | ☐ | Grep logs for patterns |
| Request IDs for distributed tracing | ☐ | Check X-Request-ID header |
| Performance logs for slow operations | ☐ | Check database query logs |

---

### 4.3 Health Checks

**CRITICAL: Load balancers need health endpoints**

| Check | Status | Validation |
|-------|--------|------------|
| /health endpoint returns 200 | ☐ | `curl https://www.ainative.studio/health` |
| Health check includes DB connectivity | ☐ | Test with DB down |
| Readiness vs liveness probes | ☐ | Distinguish startup vs running |
| Response time < 500ms | ☐ | Measure latency |

---

### 4.4 Analytics

**RECOMMENDED: Track user behavior**

| Check | Status | Validation |
|-------|--------|------------|
| Google Analytics configured | ☐ | Check GA dashboard |
| Custom events tracked | ☐ | Test critical user flows |
| Conversion tracking enabled | ☐ | Test checkout flow |
| Privacy policy updated | ☐ | Legal review |

---

## 5. Testing

### 5.1 Test Coverage

**CRITICAL: Tests prevent regressions**

| Check | Status | Validation |
|-------|--------|------------|
| Unit tests pass | ☐ | `npm run test` |
| Integration tests pass | ☐ | `npm run test:integration` |
| E2E tests pass | ☐ | `npm run test:e2e` |
| Test coverage >= 80% | ☐ | `npm run test:coverage` |
| Critical paths have E2E tests | ☐ | Auth, checkout, dashboard |

**Mandatory per CLAUDE.md:**
- Coverage >= 80%
- All tests must pass before commit
- No mocking of critical business logic

---

### 5.2 Manual Testing

**CRITICAL: Smoke test production features**

| Check | Status | Validation |
|-------|--------|------------|
| Homepage loads | ☐ | Visit https://www.ainative.studio |
| User can sign up | ☐ | Create test account |
| User can login (email/password) | ☐ | Test credentials flow |
| User can login (OAuth GitHub) | ☐ | Test OAuth flow |
| Dashboard loads after login | ☐ | Navigate to /dashboard |
| Payment flow works | ☐ | Test Stripe checkout |
| API endpoints respond | ☐ | Test /api/health |

---

## 6. Performance

### 6.1 Load Times

**RECOMMENDED: Fast sites retain users**

| Check | Status | Validation |
|-------|--------|------------|
| Lighthouse score > 90 | ☐ | Run Lighthouse audit |
| First Contentful Paint < 1.8s | ☐ | WebPageTest |
| Time to Interactive < 3.8s | ☐ | WebPageTest |
| Largest Contentful Paint < 2.5s | ☐ | WebPageTest |
| Cumulative Layout Shift < 0.1 | ☐ | WebPageTest |

---

### 6.2 Resource Optimization

**RECOMMENDED: Reduce bandwidth costs**

| Check | Status | Validation |
|-------|--------|------------|
| Images optimized (WebP/AVIF) | ☐ | Check Network tab |
| Lazy loading for below-fold images | ☐ | Check loading="lazy" |
| Code splitting enabled | ☐ | Check .next/static chunks |
| Unused dependencies removed | ☐ | `npx depcheck` |
| CDN configured for static assets | ☐ | Check Cache-Control headers |

---

## 7. Capacity Planning

### 7.1 Database

**CRITICAL: Connection pool exhaustion causes outages**

| Check | Status | Validation |
|-------|--------|------------|
| Database uses PgBouncer (port 6432) | ☐ | Verify DATABASE_URL |
| Connection pool sized appropriately | ☐ | 20 connections per instance |
| Query performance profiled | ☐ | Use EXPLAIN ANALYZE |
| Indexes created for frequent queries | ☐ | Check pg_stat_user_indexes |
| Connection leak tests pass | ☐ | Monitor active connections |

**Per CLAUDE.md:**
- ALWAYS use port 6432 (PgBouncer)
- Pool limit: 10 base + 10 overflow = 20
- Check pool: `python3 scripts/check_db_connection_pool.py`

---

### 7.2 Scaling

**RECOMMENDED: Handle traffic spikes**

| Check | Status | Validation |
|-------|--------|------------|
| Horizontal scaling configured | ☐ | Railway autoscaling |
| Load balancer health checks tuned | ☐ | Test failover |
| Static assets cached | ☐ | Check Cache-Control headers |
| Database read replicas configured | ☐ | For read-heavy workloads |

---

## 8. Deployment

### 8.1 Pre-Deployment

**CRITICAL: Validate before pushing to production**

| Check | Status | Validation |
|-------|--------|------------|
| Run pre-deployment validation script | ☐ | `npm run validate:prod` |
| CI/CD pipeline passes | ☐ | GitHub Actions green |
| Smoke tests pass locally | ☐ | `npm run test:smoke` |
| Database migrations tested in staging | ☐ | Dry run migrations |
| Rollback plan documented | ☐ | See runbook |

---

### 8.2 Deployment Process

**CRITICAL: Follow safe deployment practices**

| Check | Status | Validation |
|-------|--------|------------|
| Deploy during low-traffic window | ☐ | Schedule for off-peak |
| Monitor error rates during rollout | ☐ | Watch Sentry dashboard |
| Gradual rollout (10% → 50% → 100%) | ☐ | Railway deployment strategy |
| Health checks pass after deployment | ☐ | `curl /health` |
| Smoke tests pass in production | ☐ | Manual verification |

---

### 8.3 Post-Deployment

**CRITICAL: Verify production health**

| Check | Status | Validation |
|-------|--------|------------|
| Application responds to traffic | ☐ | Visit homepage |
| No error spikes in Sentry | ☐ | Check last 1 hour |
| Database connections stable | ☐ | Monitor connection pool |
| Logs show no critical errors | ☐ | `railway logs` |
| Performance metrics normal | ☐ | Compare to baseline |
| Rollback tested (if possible) | ☐ | Document rollback time |

---

## 9. Incident Response Readiness

### 9.1 Runbooks

**CRITICAL: Reduce MTTR with clear procedures**

| Check | Status | Validation |
|-------|--------|------------|
| Incident response runbook exists | ☐ | docs/operations/INCIDENT_RESPONSE_RUNBOOK.md |
| Rollback procedure documented | ☐ | Tested in staging |
| On-call rotation configured | ☐ | PagerDuty/Opsgenie |
| Contact list up to date | ☐ | Engineering, product, exec |
| Postmortem template ready | ☐ | Blameless culture |

---

### 9.2 Observability

**CRITICAL: Detect issues before users report them**

| Check | Status | Validation |
|-------|--------|------------|
| Alerting configured for critical metrics | ☐ | Error rate, latency, uptime |
| Alert thresholds tuned (not too noisy) | ☐ | Review false positive rate |
| Dashboards for key metrics | ☐ | Grafana/Datadog/Railway |
| Logs aggregated and searchable | ☐ | Railway logs or external |

---

## 10. Documentation

### 10.1 User-Facing

**RECOMMENDED: Help users help themselves**

| Check | Status | Validation |
|-------|--------|------------|
| API documentation up to date | ☐ | docs/api/API_REFERENCE.md |
| Changelog published | ☐ | CHANGELOG.md |
| Known issues documented | ☐ | GitHub issues |
| Status page configured | ☐ | status.ainative.studio |

---

### 10.2 Internal

**CRITICAL: Enable team to debug issues**

| Check | Status | Validation |
|-------|--------|------------|
| Architecture diagram current | ☐ | docs/architecture/ |
| Environment setup guide current | ☐ | README.md |
| Deployment guide current | ☐ | docs/deployment/ |
| Troubleshooting guide current | ☐ | docs/operations/ |

---

## Failure Modes and Mitigations

Based on 2026-02-08 incident, these failure modes MUST be prevented:

### Failure Mode 1: Missing Environment Variables

**Root Cause:** NEXTAUTH_SECRET added to code but not Railway

**Detection:**
- Build fails with "NO_SECRET" error
- Runtime error on first auth request

**Prevention:**
- Run `npm run validate:env` before deploy
- CI step validates env vars against .env.example
- Railway deployment hook checks required vars

**Remediation:**
- Add missing var to Railway service
- Restart service (automatic on var change)
- Verify auth flow works

---

### Failure Mode 2: Missing File Imports

**Root Cause:** Files referenced but not committed to git

**Detection:**
- Build fails with "Cannot find module" error
- TypeScript errors in CI

**Prevention:**
- Run `npm run build` before commit
- CI build step catches missing files
- Pre-commit hook runs type-check

**Remediation:**
- Add missing files
- Commit and push
- Trigger redeploy

---

### Failure Mode 3: Environment Variable Mismatch

**Root Cause:** Different values in local, CI, production

**Detection:**
- Features work locally but fail in production
- OAuth callbacks fail with redirect_uri mismatch

**Prevention:**
- Single source of truth (.env.example)
- Automated sync check in CI
- Railway deployment checklist

**Remediation:**
- Update Railway vars to match .env.example
- Restart service
- Test affected feature

---

## Go/No-Go Decision Framework

### Critical Failures (Block Deployment)

- ANY item marked CRITICAL fails
- Test coverage < 80%
- Security vulnerabilities (HIGH or CRITICAL)
- Health check returns non-200
- Database connection fails
- Missing required environment variables

### Recommended Failures (Track as Tech Debt)

- Lighthouse score < 90
- Bundle size > 500MB
- No load testing
- Missing documentation
- No rollback testing

### Decision Authority

- Engineering Lead: Go/No-Go for technical readiness
- Product Lead: Go/No-Go for feature completeness
- CTO: Final Go/No-Go for production release

---

## Appendix: Related Documents

- [Pre-Deployment Validation Script](../scripts/pre-deployment-validation.sh)
- [Environment Variable Validation](../scripts/validate-env-vars.sh)
- [Incident Response Runbook](INCIDENT_RESPONSE_RUNBOOK.md)
- [SLO/SLI Definitions](SLO_SLI_DEFINITIONS.md)
- [Monitoring Dashboard Specification](MONITORING_DASHBOARD_SPEC.md)
- [Railway Troubleshooting Guide](../deployment/RAILWAY_TROUBLESHOOTING.md)

---

## Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-08 | 1.0 | Initial version after production incident | SRE Team |

---

**IMPORTANT:** This checklist is a living document. Update it after each incident to prevent recurrence.
