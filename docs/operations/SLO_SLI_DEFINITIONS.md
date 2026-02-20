# Service Level Objectives (SLOs) and Service Level Indicators (SLIs)

**Service:** AINative Next.js Website (www.ainative.studio)
**Owner:** Engineering Team
**Last Updated:** 2026-02-08
**Review Cycle:** Quarterly

---

## Executive Summary

This document defines the reliability targets (SLOs) and measurement metrics (SLIs) for the AINative Next.js website. These targets balance user experience expectations with engineering velocity and operational costs.

**Error Budget Philosophy:**
- We use error budgets to balance reliability vs. feature velocity
- 100% uptime is not the goal - some failure is acceptable
- Exceeding error budget triggers deployment freeze and reliability work
- Meeting SLOs enables aggressive feature shipping

---

## 1. Availability SLO

### Definition
**User Experience:** Can users access the website and complete critical user journeys?

### SLI Measurement
```
availability_sli = (successful_requests / total_requests) * 100
```

**Measurement Window:** 28-day rolling window

**Data Source:** Railway application metrics, health check endpoints

**Query Example:**
```promql
sum(rate(http_requests_total{status=~"2.."}[28d]))
/
sum(rate(http_requests_total[28d]))
```

### SLO Targets

| Severity | SLO Target | Error Budget | Alert Threshold |
|----------|------------|--------------|-----------------|
| Critical Paths (auth, dashboard) | 99.9% | 0.1% (43 min/month) | 50% budget consumed |
| General Pages | 99.5% | 0.5% (3.6 hrs/month) | 75% budget consumed |
| Admin Features | 99.0% | 1.0% (7.2 hrs/month) | 90% budget consumed |

**Critical Paths:**
- `/` (homepage)
- `/api/health`
- `/api/auth/*` (authentication)
- `/dashboard` (user dashboard)
- `/api/stripe/checkout` (payment flow)

**Exclusions:**
- 4xx client errors (except 429 rate limiting)
- Planned maintenance windows (announced 7 days prior)
- Dependency failures beyond our control (GitHub OAuth, Stripe API)

### Error Budget Calculation

```
monthly_requests = ~10M requests/month
error_budget_99.9 = 10M * 0.001 = 10,000 failed requests
```

**Burn Rate Alerting:**

| Burn Rate | Time to Exhaust Budget | Action Required |
|-----------|------------------------|-----------------|
| 1x | 28 days | Normal operations |
| 2x | 14 days | Investigation |
| 10x | 2.8 days | Page on-call |
| 100x | 6.7 hours | Incident response |

---

## 2. Latency SLO

### Definition
**User Experience:** How fast do pages and API requests respond?

### SLI Measurement

```
latency_sli = (requests_under_threshold / total_requests) * 100
```

**Percentiles:**
- P50 (median): Typical user experience
- P95: Worst case for most users
- P99: Worst case for power users

**Data Source:** Railway metrics, Sentry Performance, custom middleware

### SLO Targets

| Endpoint Type | P50 Target | P95 Target | P99 Target |
|---------------|------------|------------|------------|
| Static Pages (SSG) | < 500ms | < 1000ms | < 2000ms |
| Dynamic Pages (SSR) | < 800ms | < 1500ms | < 3000ms |
| API Endpoints (auth, data) | < 300ms | < 800ms | < 1500ms |
| Database Queries | < 100ms | < 300ms | < 500ms |

**Exclusions:**
- Cold starts (first request after idle period)
- Slow client networks (measured server-side only)
- Third-party API calls (Stripe, GitHub OAuth)

### Measurement Window
- Real-time: 5-minute sliding window
- SLO compliance: 28-day rolling window

### Error Budget
- **Target:** 95% of requests meet latency SLO
- **Error Budget:** 5% can exceed thresholds
- **Alert:** Trigger when 10% of requests exceed thresholds

---

## 3. Error Rate SLO

### Definition
**User Experience:** How often do users encounter errors?

### SLI Measurement

```
error_rate_sli = (error_responses / total_requests) * 100
```

**Error Classification:**
- **5xx errors:** Server-side failures (our fault)
- **4xx errors (selected):** Rate limiting (429), auth failures (401/403)
- **Client errors:** Excluded (400, 404 from user mistakes)

**Data Source:** Application logs, Sentry error tracking, Railway metrics

### SLO Targets

| Error Type | SLO Target | Error Budget | Alert Threshold |
|------------|------------|--------------|-----------------|
| 5xx Server Errors | < 0.1% | 0.1% (10k errors/month) | > 0.05% (5 min) |
| Auth Failures (401/403) | < 1% | 1% (100k errors/month) | > 0.5% (5 min) |
| Rate Limiting (429) | < 0.5% | 0.5% (50k errors/month) | > 0.25% (5 min) |

**Specific Error Scenarios:**

| Scenario | Target | Detection |
|----------|--------|-----------|
| NextAuth NO_SECRET error | 0% | Sentry alert on error type |
| Database connection exhaustion | < 0.01% | Monitor connection pool usage |
| Missing file imports (build) | 0% | CI build validation |
| Undefined environment variables | 0% | Pre-deployment validation |

### Measurement Window
- Real-time: 5-minute sliding window
- SLO compliance: 28-day rolling window

---

## 4. Build and Deployment SLO

### Definition
**Developer Experience:** How reliably can we ship changes to production?

### SLI Measurement

```
deployment_success_rate = (successful_deployments / total_deployments) * 100
```

**Data Source:** GitHub Actions, Railway deployment logs

### SLO Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build Success Rate | > 95% | CI pipeline pass rate |
| Deployment Success Rate | > 98% | Railway deployment success |
| Build Time (p95) | < 10 minutes | GitHub Actions duration |
| Deployment Time (p95) | < 5 minutes | Railway redeploy duration |
| Rollback Time (p99) | < 10 minutes | Emergency rollback |

**Critical Deployment Validations:**
- All tests pass (>=80% coverage)
- Type checking passes
- Environment variables validated
- No missing file imports
- Security audit passes (no HIGH/CRITICAL vulns)

### Error Budget
- **Failed builds allowed:** 5% of CI runs
- **Failed deployments allowed:** 2% of Railway deploys

**Alerting:**
- 2 consecutive build failures → Notify team
- Deployment failure → Page on-call
- Rollback required → Incident response

---

## 5. Database Performance SLO

### Definition
**System Health:** Database query performance and connection pool health

### SLI Measurement

```
db_query_latency_sli = (queries_under_threshold / total_queries) * 100
db_connection_health = 1 - (active_connections / max_connections)
```

**Data Source:** PostgreSQL pg_stat_statements, PgBouncer metrics, Railway database monitoring

### SLO Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Query Latency (p95) | < 300ms | > 500ms |
| Connection Pool Usage | < 80% (16/20) | > 90% (18/20) |
| Connection Checkout Time | < 50ms | > 100ms |
| Database CPU Usage | < 70% | > 85% |
| Database Memory Usage | < 80% | > 90% |

**Critical Constraints (per CLAUDE.md):**
- **MUST** use PgBouncer port 6432 (not direct 5432)
- Connection pool limit: 20 per instance (10 base + 10 overflow)
- Query timeout: 30 seconds
- Idle connection timeout: 10 minutes

### Error Scenarios

| Error | Target | Detection |
|-------|--------|-----------|
| "QueuePool limit reached" | 0% | Log parsing + Sentry |
| Connection timeout | < 0.1% | Database logs |
| Deadlocks | < 0.01% | pg_stat_database |
| Long-running queries (>30s) | < 1% | pg_stat_activity |

---

## 6. Security SLO

### Definition
**System Security:** Protection against vulnerabilities and attacks

### SLI Measurement

```
security_posture = (passed_security_checks / total_security_checks) * 100
```

**Data Source:** npm audit, Snyk scans, OWASP ZAP, manual pentests

### SLO Targets

| Metric | Target | Frequency |
|--------|--------|-----------|
| Critical CVEs | 0 | Continuous |
| High CVEs | < 5 | Weekly scan |
| Secrets in codebase | 0 | Pre-commit hook |
| Failed auth attempts | < 5% | Real-time monitoring |
| OWASP Top 10 compliance | 100% | Quarterly audit |

**Security Incidents:**
- Leaked API key → Immediate rotation + incident
- Exposed PII → Data breach protocol
- SQL injection attempt → Block IP + review

### Error Budget
- **Zero tolerance:** Critical CVEs, leaked secrets, PII exposure
- **Remediation SLA:** HIGH vulns patched within 7 days

---

## 7. User Experience SLO

### Definition
**Frontend Performance:** Core Web Vitals and user-perceived performance

### SLI Measurement

**Data Source:** Lighthouse CI, Web Vitals API, Vercel Speed Insights

**Core Web Vitals:**

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| Largest Contentful Paint (LCP) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| First Input Delay (FID) | < 100ms | 100ms - 300ms | > 300ms |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.1 - 0.25 | > 0.25 |

### SLO Targets

| Metric | Target (75th percentile) | Alert Threshold |
|--------|--------------------------|-----------------|
| LCP | < 2.5s | > 3.0s |
| FID | < 100ms | > 150ms |
| CLS | < 0.1 | > 0.15 |
| Lighthouse Score | > 90 | < 85 |
| Time to Interactive (TTI) | < 3.8s | > 5.0s |

**Measurement:**
- Lighthouse CI on every PR
- Real User Monitoring (RUM) in production
- Synthetic monitoring (hourly)

---

## 8. Incident Response SLO

### Definition
**Operational Excellence:** How quickly can we detect and resolve incidents?

### SLI Measurement

```
mttr = time_incident_resolved - time_incident_detected
mttd = time_incident_detected - time_incident_started
```

**Data Source:** PagerDuty, incident postmortems, Sentry alerts

### SLO Targets

| Severity | MTTD (Mean Time to Detect) | MTTR (Mean Time to Resolve) |
|----------|----------------------------|------------------------------|
| P0 (Total outage) | < 5 minutes | < 30 minutes |
| P1 (Critical feature down) | < 15 minutes | < 2 hours |
| P2 (Degraded performance) | < 1 hour | < 8 hours |
| P3 (Minor issue) | < 24 hours | < 1 week |

**Incident Classifications:**

**P0 - Total Outage:**
- Homepage down (non-200 response)
- Auth completely broken (all users affected)
- Payment processing unavailable

**P1 - Critical Feature Down:**
- Dashboard inaccessible
- API endpoints timing out
- Database connection pool exhausted

**P2 - Degraded Performance:**
- Slow page loads (p95 > 5s)
- Intermittent auth failures (< 10% users)
- High error rate (> 1% 5xx)

**P3 - Minor Issue:**
- UI bugs (non-blocking)
- Analytics not tracking
- Documentation outdated

### On-Call Expectations
- Acknowledge alert within 5 minutes
- Join incident channel within 10 minutes
- Post initial assessment within 15 minutes
- Provide hourly updates during active incident
- Postmortem within 48 hours of resolution

---

## Error Budget Policy

### When Error Budget is Healthy (> 50%)
- **Feature velocity:** HIGH
- **Release frequency:** Multiple times per day
- **Testing rigor:** Standard CI/CD
- **Action:** Ship features aggressively

### When Error Budget is at Risk (25-50%)
- **Feature velocity:** MEDIUM
- **Release frequency:** Daily
- **Testing rigor:** Enhanced testing
- **Action:** Focus on reliability improvements

### When Error Budget is Exhausted (< 25%)
- **Feature velocity:** LOW
- **Release frequency:** Weekly (critical fixes only)
- **Testing rigor:** Manual QA + extended soak time
- **Action:** **DEPLOYMENT FREEZE** until SLOs recovered
  - All hands on reliability work
  - Root cause analysis for all incidents
  - Infrastructure hardening
  - Monitoring improvements

### Error Budget Reset
- **Frequency:** Monthly (aligns with 28-day window)
- **Process:** Automatic on 1st of each month
- **Review:** Engineering retrospective on previous month

---

## Monitoring and Alerting

### Alert Routing

| SLO Violation | Severity | Notification |
|---------------|----------|--------------|
| Availability < 99.9% (5 min) | P1 | PagerDuty → On-call engineer |
| Error rate > 1% (5 min) | P1 | PagerDuty → On-call engineer |
| Latency p95 > 3s (5 min) | P2 | Slack → #engineering |
| Error budget < 25% | P1 | Slack → #engineering + Email → Leadership |
| Build failure (2 consecutive) | P2 | Slack → #engineering |
| Security CVE (CRITICAL) | P0 | PagerDuty → Security team + CTO |

### Dashboard Requirements

**Primary Dashboard (Grafana/Railway):**
- Current availability (24h, 7d, 28d)
- Error budget burn rate
- Latency percentiles (p50, p95, p99)
- Error rate by type (5xx, 4xx, rate limit)
- Active incidents and TTR
- Deployment frequency and success rate

**Secondary Dashboards:**
- Database performance (connection pool, query latency)
- Frontend performance (Core Web Vitals)
- Security posture (CVEs, failed auth attempts)
- Cost metrics (Railway usage, API costs)

---

## SLO Review Process

### Quarterly Review (Required)
- **When:** First week of each quarter
- **Who:** Engineering lead, Product lead, SRE team
- **Agenda:**
  1. Review SLO achievement vs. targets
  2. Analyze error budget consumption patterns
  3. Identify systemic reliability issues
  4. Adjust SLO targets based on business needs
  5. Update monitoring and alerting

### Monthly Check-in (Recommended)
- **When:** First Monday of each month
- **Who:** Engineering team all-hands
- **Agenda:**
  1. Error budget status
  2. Notable incidents and learnings
  3. Upcoming reliability work

### Post-Incident Review (Always)
- **When:** Within 48 hours of incident resolution
- **Who:** Incident responders + affected teams
- **Agenda:**
  1. Blameless postmortem
  2. SLO impact assessment
  3. Action items to prevent recurrence
  4. Update runbooks and monitoring

---

## Appendix A: Measurement Queries

### Availability SLI (Prometheus)
```promql
# 28-day availability
sum(rate(http_requests_total{status=~"2..|3.."}[28d]))
/
sum(rate(http_requests_total[28d]))
```

### Latency SLI (Prometheus)
```promql
# p95 latency over 5 minutes
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket[5m])
)
```

### Error Rate SLI (Prometheus)
```promql
# 5xx error rate over 5 minutes
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

### Database Connection Pool Usage (PostgreSQL)
```sql
SELECT
  count(*) AS active_connections,
  max_val AS max_connections,
  round((count(*) / max_val::numeric) * 100, 2) AS usage_percent
FROM pg_stat_activity
CROSS JOIN pg_settings
WHERE name = 'max_connections';
```

---

## Appendix B: Related Documents

- [Production Readiness Checklist](PRODUCTION_READINESS_CHECKLIST.md)
- [Incident Response Runbook](INCIDENT_RESPONSE_RUNBOOK.md)
- [Monitoring Dashboard Specification](MONITORING_DASHBOARD_SPEC.md)
- [Postmortem Template](POSTMORTEM_TEMPLATE.md)
- [On-Call Handbook](ONCALL_HANDBOOK.md)

---

## Change History

| Date | Version | Changes | Approved By |
|------|---------|---------|-------------|
| 2026-02-08 | 1.0 | Initial SLO/SLI definitions after production incident | Engineering Lead |

---

**Next Review Date:** 2026-05-01 (Quarterly)
