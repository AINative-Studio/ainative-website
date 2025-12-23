# Post-Launch Monitoring Setup

**Issue:** #70 - [Story 8.5] Post-Launch Monitoring
**Priority:** P0 - Critical

## Overview

This document outlines the monitoring setup and alerting configuration for the AINative Studio Next.js application post-launch.

---

## Monitoring Stack

### Recommended Tools

| Category | Tool | Purpose |
|----------|------|---------|
| Error Tracking | Sentry | JavaScript errors, exceptions |
| Performance | Vercel Analytics | Core Web Vitals, page performance |
| Uptime | Better Uptime / UptimeRobot | Availability monitoring |
| Logs | Vercel Logs / LogRocket | Application logs, session replay |
| APM | Datadog / New Relic | Application performance |
| Analytics | PostHog / Google Analytics | User behavior |

---

## Error Tracking (Sentry)

### Setup

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

### Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% on error
});
```

### Alert Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Error spike | > 10 errors/min | P1 | Slack + PagerDuty |
| New error type | First occurrence | P2 | Slack |
| Unhandled rejection | Any | P1 | Slack |
| Performance regression | LCP > 4s | P2 | Slack |

---

## Uptime Monitoring

### Endpoints to Monitor

| Endpoint | Interval | Timeout | Alert After |
|----------|----------|---------|-------------|
| `https://ainative.studio` | 1 min | 10s | 2 failures |
| `https://ainative.studio/api/health` | 1 min | 5s | 2 failures |
| `https://api.ainative.studio/health` | 1 min | 5s | 2 failures |
| `https://ainative.studio/login` | 5 min | 10s | 3 failures |

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: await checkDatabase(),
      api: await checkAPI(),
      cache: await checkCache(),
    },
  };

  const allHealthy = Object.values(health.checks).every(c => c === 'ok');

  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503,
  });
}

async function checkDatabase() {
  // Database connectivity check
  return 'ok';
}

async function checkAPI() {
  // External API check
  return 'ok';
}

async function checkCache() {
  // Cache connectivity check
  return 'ok';
}
```

---

## Performance Monitoring

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB | < 200ms | 200ms - 500ms | > 500ms |
| INP | < 200ms | 200ms - 500ms | > 500ms |

### Vercel Analytics Setup

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Performance Alerts

| Alert | Threshold | Action |
|-------|-----------|--------|
| LCP degradation | > 4s avg over 1 hour | Slack |
| Error rate spike | > 1% over 15 min | Slack + PagerDuty |
| Slow API response | > 2s p95 | Slack |

---

## Log Management

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| ERROR | Exceptions, failures | API errors, crashes |
| WARN | Potential issues | Deprecated usage, retries |
| INFO | Key events | User actions, deployments |
| DEBUG | Debugging | Request details (dev only) |

### Structured Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
};
```

---

## Alerting Configuration

### Severity Levels

| Severity | Response Time | Notification |
|----------|---------------|--------------|
| P0 - Critical | < 15 min | PagerDuty + Slack + Phone |
| P1 - High | < 1 hour | PagerDuty + Slack |
| P2 - Medium | < 4 hours | Slack |
| P3 - Low | < 24 hours | Email |

### Slack Channels

| Channel | Purpose |
|---------|---------|
| #production-alerts | P0/P1 alerts |
| #monitoring | P2/P3 alerts, metrics |
| #deployments | Deployment notifications |

### PagerDuty Escalation

1. **Level 1:** On-call engineer (0-15 min)
2. **Level 2:** Tech lead (15-30 min)
3. **Level 3:** Engineering manager (30-60 min)

---

## Dashboard Setup

### Key Metrics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                    AINative Studio Health                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Uptime: 99.9% │   Errors: 0.02% │   Avg Response: 145ms   │
├─────────────────┴─────────────────┴─────────────────────────┤
│                                                               │
│   Request Volume (24h)              Error Rate (24h)          │
│   ┌─────────────────────┐          ┌─────────────────────┐   │
│   │    ▄▄▄█▄▄▄▄▄▄▄     │          │ ___________________  │   │
│   │   ▄█████████████▄  │          │                      │   │
│   └─────────────────────┘          └─────────────────────┘   │
│                                                               │
│   Core Web Vitals                                             │
│   ┌─────────────┬─────────────┬─────────────┐               │
│   │  LCP: 1.8s  │  FID: 45ms  │  CLS: 0.05  │               │
│   │     ✓       │      ✓      │      ✓      │               │
│   └─────────────┴─────────────┴─────────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Runbooks

### High Error Rate

1. Check Sentry for error details
2. Identify affected endpoints/features
3. Check recent deployments
4. Review logs for patterns
5. If deployment-related → Rollback
6. If external → Contact provider
7. Communicate status updates

### Performance Degradation

1. Check Vercel Analytics for affected pages
2. Review recent code changes
3. Check external service latencies
4. Check database query performance
5. Scale resources if needed
6. Implement caching if applicable

### Service Outage

1. Verify outage scope (partial vs full)
2. Check external dependencies
3. Review Vercel status page
4. Initiate rollback if deployment-related
5. Communicate via status page
6. Post-mortem after resolution

---

## Monthly Review Checklist

- [ ] Review error trends
- [ ] Analyze performance metrics
- [ ] Review alert effectiveness
- [ ] Update thresholds if needed
- [ ] Review on-call incidents
- [ ] Update runbooks
- [ ] Capacity planning review

---

## Monitoring Contacts

| Tool | Admin | Support |
|------|-------|---------|
| Sentry | | support@sentry.io |
| Vercel | | support@vercel.com |
| PagerDuty | | |
| Uptime Monitor | | |

---

## Setup Checklist

- [ ] Sentry configured and verified
- [ ] Uptime monitoring active
- [ ] Vercel Analytics enabled
- [ ] Health check endpoint deployed
- [ ] Slack alerts configured
- [ ] PagerDuty integration active
- [ ] Dashboard created
- [ ] Runbooks documented
- [ ] On-call rotation established
- [ ] Team trained on procedures
