# Monitoring Dashboard Specification

**Service:** AINative Next.js Website (www.ainative.studio)
**Platform:** Railway + Sentry + Custom Monitoring
**Last Updated:** 2026-02-08
**Owner:** SRE Team

---

## Overview

This document specifies the monitoring dashboards, alerts, and observability requirements for the AINative Next.js website. These dashboards enable proactive detection of issues before they impact users.

**Monitoring Philosophy:**
- **Observe user experience, not just system metrics**
- **Alert on symptoms (user impact), not causes (system state)**
- **Minimize alert fatigue with tuned thresholds**
- **Enable quick root cause analysis with correlated data**

---

## Dashboard 1: Production Health (Primary)

**Purpose:** Real-time overview of production health for on-call engineers
**Refresh:** 30 seconds
**Audience:** Engineering team, on-call responders

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCTION HEALTH - www.ainative.studio                    │
│  Last Updated: 2026-02-08 15:30:45 UTC                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────────┐
│  Availability    │  Error Rate      │  Latency (p95)       │
│                  │                  │                      │
│   99.95%  ✅     │   0.3%   ✅      │   850ms   ✅         │
│  (SLO: 99.9%)    │  (SLO: <1%)      │  (SLO: <1500ms)      │
│                  │                  │                      │
│  24h: 99.92%     │  24h: 0.4%       │  24h p95: 920ms      │
│  7d:  99.88%     │  7d:  0.5%       │  7d  p95: 880ms      │
└──────────────────┴──────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Error Budget (28-day rolling)                              │
│  ██████████████████░░░░  73% remaining                      │
│  Consumed: 27% | Remaining: 73% | Days left: 15             │
│  Burn rate: 1.2x (normal)                                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────────┐
│  Active Users    │  Request Rate    │  Database Health     │
│   1,240          │   850 req/min    │   ✅ Healthy         │
│   (+12% vs 1h)   │   (avg: 720)     │   Pool: 8/20 (40%)   │
└──────────────────┴──────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Active Incidents                                           │
│  ✅ No active incidents                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Recent Deployments                                         │
│  • 15:10 UTC - Deploy #124 (commit abc123) - ✅ Success     │
│  • 12:30 UTC - Deploy #123 (commit def456) - ✅ Success     │
│  • 09:15 UTC - Deploy #122 (commit ghi789) - ✅ Success     │
└─────────────────────────────────────────────────────────────┘
```

### Metrics

| Metric | Query | Visualization | Alert Threshold |
|--------|-------|---------------|-----------------|
| **Availability (5min)** | `(success_requests / total_requests) * 100` | Gauge | < 99.9% for 5min |
| **Error Rate (5min)** | `(5xx_requests / total_requests) * 100` | Gauge + Trend | > 1% for 5min |
| **Latency p95 (5min)** | `histogram_quantile(0.95, request_duration)` | Gauge + Trend | > 1500ms for 5min |
| **Error Budget** | `(1 - (errors_28d / total_28d)) vs SLO` | Progress Bar | < 25% remaining |
| **Active Users** | `unique_sessions_last_5min` | Counter | N/A |
| **Request Rate** | `rate(http_requests_total[1m])` | Line Chart | N/A |
| **DB Connection Pool** | `active_connections / max_connections` | Gauge | > 80% (16/20) |

### Data Sources
- **Railway Metrics:** Request rate, latency, error count
- **Application Logs:** Structured JSON logs
- **Sentry:** Error tracking and grouping
- **PostgreSQL:** Connection pool stats via `pg_stat_activity`

---

## Dashboard 2: Error Analysis

**Purpose:** Deep dive into errors for debugging
**Refresh:** 1 minute
**Audience:** On-call engineers, debugging team

### Panels

**Panel 1: Error Rate by Endpoint**
- Visualization: Heatmap (endpoint x time)
- Metric: `5xx_count per endpoint per 5min`
- Goal: Identify problematic endpoints

**Panel 2: Error Types**
- Visualization: Pie chart
- Metric: `error_count by error_type`
- Examples: NextAuth errors, DB errors, API errors

**Panel 3: Error Timeline**
- Visualization: Stacked area chart
- Metric: `error_count over time by severity`
- Stack: Critical (5xx), Warning (4xx selected), Info

**Panel 4: Top Errors (Last Hour)**
- Visualization: Table
- Columns: Error message, Count, First seen, Last seen, Users affected
- Link: Direct link to Sentry issue

**Panel 5: Error Rate vs Deployment**
- Visualization: Overlay chart
- Metric: Error rate + deployment markers
- Goal: Correlate errors with deployments

### Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High 5xx Rate | > 1% for 5 min | P1 | Page on-call |
| NextAuth NO_SECRET | Any occurrence | P0 | Page on-call + auto-rollback |
| Database Connection Pool | > 90% for 5 min | P1 | Page on-call |
| New Error Type Spike | New error type with >100 occurrences in 5min | P2 | Slack alert |

---

## Dashboard 3: Performance Monitoring

**Purpose:** Track latency and performance degradation
**Refresh:** 1 minute
**Audience:** Engineering team

### Panels

**Panel 1: Latency Percentiles**
- Visualization: Multi-line chart
- Metrics: p50, p95, p99 over time
- Goal: Detect latency spikes

**Panel 2: Slow Endpoints (p95 > 2s)**
- Visualization: Table
- Columns: Endpoint, p95 latency, Request count, Trend
- Goal: Identify optimization targets

**Panel 3: Database Query Performance**
- Visualization: Histogram
- Metric: Query duration distribution
- Goal: Identify slow queries

**Panel 4: Frontend Performance (Core Web Vitals)**
- Visualization: Gauge cluster
- Metrics: LCP, FID, CLS
- Goal: Track user-perceived performance

**Panel 5: Time to First Byte (TTFB)**
- Visualization: Line chart
- Metric: Server response time
- Goal: Detect backend slowness

### Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Latency p95 Spike | > 3s for 5 min | P2 | Slack alert |
| Slow Database Queries | Query > 1s | P3 | Log for review |
| Core Web Vitals Degradation | LCP > 2.5s for 1 hour | P3 | Create GitHub issue |

---

## Dashboard 4: Infrastructure Health

**Purpose:** Monitor system resources and capacity
**Refresh:** 30 seconds
**Audience:** DevOps, SRE

### Panels

**Panel 1: Railway Instance Metrics**
- Visualization: Multi-gauge
- Metrics: CPU %, Memory %, Disk I/O
- Goal: Detect resource exhaustion

**Panel 2: Database Health**
- Visualization: Multi-line chart
- Metrics: Connection count, Query rate, Cache hit ratio
- Goal: Monitor database performance

**Panel 3: Connection Pool Usage**
- Visualization: Stacked area chart
- Metric: Active connections vs Available connections
- Goal: Prevent connection pool exhaustion

**Panel 4: Network Throughput**
- Visualization: Line chart
- Metric: Inbound/Outbound bandwidth
- Goal: Detect traffic anomalies

**Panel 5: Deployment History**
- Visualization: Timeline
- Events: Deployments, rollbacks, configuration changes
- Goal: Correlate incidents with changes

### Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High CPU Usage | > 85% for 10 min | P2 | Slack alert |
| High Memory Usage | > 90% for 5 min | P1 | Page on-call |
| Connection Pool Near Limit | > 18/20 connections | P1 | Page on-call |
| Disk I/O Saturation | > 90% for 5 min | P2 | Investigate |

---

## Dashboard 5: Business Metrics

**Purpose:** Track user-facing metrics and conversions
**Refresh:** 5 minutes
**Audience:** Product, Engineering, Leadership

### Panels

**Panel 1: User Signups**
- Visualization: Line chart
- Metric: New user registrations per hour
- Goal: Track growth

**Panel 2: Authentication Success Rate**
- Visualization: Gauge
- Metric: `(successful_logins / total_login_attempts) * 100`
- Goal: Detect auth issues

**Panel 3: Payment Conversion Rate**
- Visualization: Funnel
- Stages: Checkout initiated → Payment submitted → Payment succeeded
- Goal: Track payment flow health

**Panel 4: Active Sessions**
- Visualization: Area chart
- Metric: Concurrent active sessions
- Goal: Track user engagement

**Panel 5: Feature Usage**
- Visualization: Heatmap
- Metric: Feature interactions per user
- Goal: Understand product usage

### Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Auth Success Rate Drop | < 95% for 15 min | P1 | Page on-call |
| Payment Failure Spike | > 5% for 5 min | P1 | Page on-call + Notify product |
| Zero Signups | 0 signups in 2 hours during business hours | P2 | Investigate |

---

## Dashboard 6: Security Monitoring

**Purpose:** Detect security threats and anomalies
**Refresh:** 1 minute
**Audience:** Security team, SRE

### Panels

**Panel 1: Failed Authentication Attempts**
- Visualization: Heatmap (IP x time)
- Metric: Failed login attempts per IP
- Goal: Detect brute force attacks

**Panel 2: Rate Limiting Triggers**
- Visualization: Table
- Columns: IP, Endpoint, Rate limit hits, Last occurrence
- Goal: Identify abusive clients

**Panel 3: Suspicious Activity**
- Visualization: Event log
- Events: SQL injection attempts, XSS attempts, Path traversal
- Goal: Detect attack attempts

**Panel 4: API Key Usage**
- Visualization: Line chart
- Metric: API calls per key
- Goal: Detect compromised keys

**Panel 5: CVE Dashboard**
- Visualization: Table
- Columns: CVE ID, Severity, Package, Status
- Goal: Track vulnerability remediation

### Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Brute Force Attack | > 50 failed logins from same IP in 5 min | P1 | Auto-block IP |
| SQL Injection Attempt | Any detected pattern | P0 | Page security team |
| New Critical CVE | CVSS >= 9.0 | P1 | Page security team |

---

## Alerting Strategy

### Alert Routing

**PagerDuty (P0/P1):**
- Total outage (availability < 99%)
- Critical errors (NextAuth NO_SECRET, DB unavailable)
- Security incidents (SQL injection, brute force)

**Slack #engineering (P2):**
- Performance degradation (latency spike)
- High error rate (> 1% but < 5%)
- Resource warnings (CPU > 80%)

**GitHub Issues (P3):**
- Technical debt (slow queries)
- Feature requests from monitoring insights
- Documentation gaps

### Alert Tuning

**Prevent Alert Fatigue:**
- Use rate limiting on alerts (max 1 page per 15 min for same issue)
- Implement alert deduplication
- Set intelligent thresholds based on historical data
- Auto-resolve alerts when condition clears

**Alert Quality Metrics:**
- Target: < 5% false positive rate
- Goal: > 95% of pages require action
- Review: Monthly alert retrospective

---

## Implementation Guide

### Railway Integration

**Railway provides:**
- Request rate, latency, error count
- CPU, memory, disk metrics
- Deployment events

**Access:**
1. Navigate to Railway dashboard
2. Select service: `410afe5c-7419-408f-91a9-f6b658ea158a`
3. Click "Metrics" tab

**Export to External Monitoring:**
```bash
# Railway doesn't support metric export yet
# Use Railway API to poll metrics programmatically
```

### Sentry Integration

**Sentry provides:**
- Error tracking and grouping
- Performance monitoring (APM)
- Release tracking

**Setup:**
```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,

  // Performance monitoring
  profilesSampleRate: 1.0,

  // Error filtering
  beforeSend(event, hint) {
    // Filter out non-actionable errors
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      return null; // User had bad network, not our fault
    }
    return event;
  },
});
```

**Dashboards:**
- Issues dashboard: https://sentry.io/organizations/ainative/issues/
- Performance: https://sentry.io/organizations/ainative/performance/
- Releases: https://sentry.io/organizations/ainative/releases/

### Custom Application Metrics

**Instrument critical paths:**

```typescript
// middleware.ts - Log all requests
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;

  // Log to structured logging
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    duration_ms: duration,
    user_agent: request.headers.get('user-agent'),
  }));

  return response;
}
```

### Database Monitoring

**Connection Pool:**
```python
# scripts/check_db_connection_pool.py
import os
import psycopg2
from urllib.parse import urlparse

def check_pool():
    db_url = os.environ.get('DATABASE_URL')
    parsed = urlparse(db_url)

    conn = psycopg2.connect(
        database=parsed.path[1:],
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port
    )

    cursor = conn.cursor()
    cursor.execute("""
        SELECT count(*) as active,
               (SELECT setting::int FROM pg_settings WHERE name='max_connections') as max
        FROM pg_stat_activity
        WHERE state = 'active';
    """)

    active, max_conn = cursor.fetchone()
    usage_pct = (active / max_conn) * 100

    print(f"Connection Pool: {active}/{max_conn} ({usage_pct:.1f}%)")

    if usage_pct > 80:
        print("WARNING: Connection pool usage high!")

    conn.close()

if __name__ == '__main__':
    check_pool()
```

### Alert Configuration (PagerDuty)

**Create Service:**
1. Navigate to PagerDuty → Services
2. Create service: "AINative Next.js Production"
3. Set escalation policy:
   - Level 1: On-call engineer (5 min)
   - Level 2: Engineering lead (15 min)
   - Level 3: CTO (30 min)

**Integration:**
```bash
# Install PagerDuty CLI
npm install -g @pagerduty/cli

# Trigger test alert
pdcli event trigger \
  --routing-key=$PAGERDUTY_ROUTING_KEY \
  --payload-summary="Test alert" \
  --payload-severity=info \
  --payload-source="monitoring-test"
```

**Webhook from Sentry:**
1. Sentry → Settings → Integrations → PagerDuty
2. Authorize PagerDuty
3. Configure alert rules:
   - Condition: Error count > 100 in 5 min
   - Action: Create PagerDuty incident

---

## Runbook Integration

**Link dashboards to runbooks:**
- Each alert should have a direct link to relevant runbook section
- Example: "Database Connection Pool > 80%" → Link to "Scenario 4: Database Connection Pool Exhausted" in INCIDENT_RESPONSE_RUNBOOK.md

**Dashboard Annotations:**
- Mark incidents on timeline
- Link to postmortem documents
- Track action item completion

---

## Maintenance

### Dashboard Review Schedule

**Weekly (Monday mornings):**
- Review alert noise (false positives)
- Adjust thresholds if needed
- Verify all integrations working

**Monthly:**
- SLO compliance review
- Dashboard optimization (remove unused panels)
- Alert retrospective

**Quarterly:**
- Complete dashboard refresh
- Align with business metrics changes
- Update documentation

---

## Related Documents

- [SLO/SLI Definitions](SLO_SLI_DEFINITIONS.md)
- [Incident Response Runbook](INCIDENT_RESPONSE_RUNBOOK.md)
- [Production Readiness Checklist](PRODUCTION_READINESS_CHECKLIST.md)
- [Railway Troubleshooting Guide](../deployment/RAILWAY_TROUBLESHOOTING.md)

---

## Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-08 | 1.0 | Initial dashboard specification | SRE Team |

---

**Next Review:** 2026-03-01 (Monthly)
