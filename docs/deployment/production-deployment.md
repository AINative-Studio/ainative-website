# Production Deployment Guide

**Issue:** #69 - [Story 8.4] Production Deployment
**Priority:** P0 - Critical

## Overview

This document outlines the procedures for deploying the AINative Studio Next.js application to production.

## Prerequisites

Before production deployment:

- [ ] UAT completed and signed off ([uat-checklist.md](./uat-checklist.md))
- [ ] Rollback plan reviewed ([rollback-plan.md](./rollback-plan.md))
- [ ] All P0/P1 bugs resolved
- [ ] Performance targets met
- [ ] Security scan passed
- [ ] Stakeholder approval obtained

---

## Deployment Window

### Recommended Times
- **Primary:** Tuesday-Thursday, 10:00 AM - 2:00 PM UTC
- **Avoid:** Fridays, weekends, holidays
- **Avoid:** Peak traffic hours (varies by region)

### Deployment Duration
- **Expected:** 5-10 minutes
- **Rollback buffer:** 30 minutes post-deployment monitoring

---

## Environment Variables (Production)

### Required Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.ainative.studio
NEXT_PUBLIC_APP_URL=https://ainative.studio

# Authentication
NEXTAUTH_URL=https://ainative.studio
NEXTAUTH_SECRET=<production-secret>

# Stripe (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# Error Tracking
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Feature Flags (Production)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
```

### Variable Verification

```bash
# Verify all required variables are set
vercel env ls --environment=production
```

---

## Pre-Deployment Checklist

### 1. Code Verification

```bash
# Pull latest main
git checkout main
git pull origin main

# Verify build
npm run build

# Run all tests
npm test

# Run linter
npm run lint
```

### 2. Database Migrations (if applicable)

```bash
# Backup current state
# Run migrations
# Verify data integrity
```

### 3. Stakeholder Notification

```
Subject: Production Deployment - AINative Studio

Team,

We are proceeding with production deployment.

Start Time: [TIME]
Expected Duration: 10 minutes
Rollback Window: 30 minutes

Please report any issues to #production-alerts.

Thanks,
[Your Name]
```

---

## Deployment Steps

### Step 1: Create Production Tag

```bash
# Create release tag
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

### Step 2: Deploy to Production

#### Option A: Vercel (Recommended)

```bash
# Deploy to production
vercel --prod

# Or via dashboard:
# 1. Go to Vercel Dashboard
# 2. Select project
# 3. Click "Deploy" on main branch
# 4. Select "Production"
```

#### Option B: Manual Deploy

```bash
# Build for production
npm run build

# Deploy (provider-specific)
# Example for Vercel:
vercel deploy --prod
```

### Step 3: DNS Verification

```bash
# Verify DNS resolution
dig ainative.studio

# Verify HTTPS
curl -I https://ainative.studio
```

### Step 4: Smoke Tests

```bash
# Automated smoke tests
npm run test:smoke:prod

# Manual verification
# - Homepage loads
# - Login works
# - Dashboard accessible
# - API responsive
```

---

## Post-Deployment Verification

### Immediate Checks (0-5 minutes)

| Check | Command/Action | Expected | Status |
|-------|----------------|----------|--------|
| HTTP Status | `curl -I https://ainative.studio` | 200 | [ ] |
| Homepage | Load in browser | Renders | [ ] |
| API Health | `curl https://api.ainative.studio/health` | OK | [ ] |
| Login | Test login flow | Success | [ ] |
| Dashboard | Access dashboard | Loads | [ ] |

### Performance Checks (5-15 minutes)

| Metric | Tool | Target | Actual | Status |
|--------|------|--------|--------|--------|
| LCP | Lighthouse | < 2.5s | | [ ] |
| FID | Lighthouse | < 100ms | | [ ] |
| CLS | Lighthouse | < 0.1 | | [ ] |
| Error Rate | Sentry | < 0.1% | | [ ] |

### Monitoring Checks (15-30 minutes)

- [ ] Error tracking (Sentry) - no new errors
- [ ] Performance metrics stable
- [ ] API response times normal
- [ ] Database connections stable
- [ ] CDN caching working

---

## Rollback Trigger Points

If any of these occur, initiate rollback:

- [ ] Error rate > 1%
- [ ] Response time > 5s (avg)
- [ ] Critical feature broken
- [ ] Security alert triggered
- [ ] Data integrity issue

See [rollback-plan.md](./rollback-plan.md) for procedures.

---

## Post-Deployment Communication

### Success Notification

```
Subject: Production Deployment Complete - AINative Studio

Team,

Production deployment completed successfully.

Version: v1.0.0
Time: [COMPLETION_TIME]
Status: All systems operational

Monitoring continues for the next 30 minutes.

Thanks,
[Your Name]
```

### Issue Notification (if needed)

```
Subject: [ALERT] Production Issue - AINative Studio

Team,

We've detected an issue post-deployment.

Issue: [DESCRIPTION]
Impact: [IMPACT]
Action: [ROLLBACK/HOTFIX]

Updates to follow.

Thanks,
[Your Name]
```

---

## Deployment Log

| Field | Value |
|-------|-------|
| Date | |
| Version | |
| Commit Hash | |
| Deployed By | |
| Start Time | |
| End Time | |
| Status | |
| Notes | |

---

## Sign-off

| Role | Name | Approved | Time |
|------|------|----------|------|
| DevOps | | [ ] | |
| Tech Lead | | [ ] | |
| QA Lead | | [ ] | |
| Product Owner | | [ ] | |

---

## Next Steps

After successful production deployment:

1. Continue monitoring for 24-48 hours
2. Review [monitoring-setup.md](./monitoring-setup.md)
3. Schedule post-deployment review
4. Update documentation as needed
