# Rollback Plan

**Issue:** #68 - [Story 8.3] Create Rollback Plan
**Priority:** P0 - Critical

## Overview

This document outlines the procedures for rolling back the AINative Studio Next.js application in case of deployment failures or critical issues.

## Rollback Triggers

Initiate rollback when any of these occur:

### P0 - Immediate Rollback (< 5 minutes)
- [ ] Site completely down (500 errors)
- [ ] Authentication system broken
- [ ] Payment processing broken
- [ ] Data loss or corruption
- [ ] Security vulnerability discovered

### P1 - Urgent Rollback (< 30 minutes)
- [ ] Critical feature broken
- [ ] Performance degradation > 50%
- [ ] Major UI/UX issues
- [ ] API integration failures

### P2 - Planned Rollback (< 2 hours)
- [ ] Multiple minor issues
- [ ] Stakeholder request
- [ ] Unexpected behavior in production

---

## Rollback Procedures

### Method 1: Vercel Instant Rollback (Recommended)

**Time to recover:** < 2 minutes

```bash
# Option A: Via Vercel Dashboard
1. Go to https://vercel.com/[team]/[project]/deployments
2. Find the last known good deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

# Option B: Via Vercel CLI
vercel rollback [deployment-url]

# Example:
vercel rollback ainative-abc123.vercel.app
```

### Method 2: Git-Based Rollback

**Time to recover:** 5-10 minutes

```bash
# 1. Identify the last good commit
git log --oneline -10

# 2. Create a revert commit
git revert HEAD

# 3. Push to trigger deployment
git push origin main

# Alternative: Reset to specific commit (use with caution)
git reset --hard [commit-hash]
git push --force origin main
```

### Method 3: Environment Variable Disable

**Time to recover:** < 5 minutes

For feature-specific issues, disable via environment variables:

```bash
# In Vercel Dashboard or CLI:
vercel env add NEXT_PUBLIC_FEATURE_FLAG_[FEATURE] false

# Trigger redeploy
vercel --prod
```

---

## Rollback Verification

After rollback, verify:

```bash
# 1. Health check
curl -I https://ainative.studio
# Expected: HTTP/2 200

# 2. Homepage loads
curl -s https://ainative.studio | grep -o '<title>.*</title>'

# 3. API health
curl https://api.ainative.studio/health

# 4. Run smoke tests
npm run test:smoke
```

### Verification Checklist

- [ ] Homepage loads (< 3s)
- [ ] Login works
- [ ] Dashboard accessible
- [ ] API responding
- [ ] No console errors
- [ ] Payment flow works (if applicable)

---

## Communication Plan

### During Rollback

1. **Status Page Update**
   ```
   [Investigating] We're aware of issues and investigating.
   ```

2. **Slack Notification**
   ```
   @channel Production rollback in progress. ETA: X minutes.
   ```

3. **Email (if extended)**
   - Send to affected users if downtime > 15 minutes

### After Rollback

1. **Status Page Update**
   ```
   [Resolved] Services have been restored. We're investigating the root cause.
   ```

2. **Internal Post-Mortem**
   - Schedule within 24 hours
   - Document in incident log

---

## Rollback Decision Tree

```
Issue Detected
    │
    ▼
Is site completely down?
    │
    ├── YES → Immediate Rollback (P0)
    │         └── Vercel Instant Rollback
    │
    └── NO → Is critical feature broken?
              │
              ├── YES → Urgent Rollback (P1)
              │         └── Assess: Rollback vs Hotfix
              │
              └── NO → Can wait for hotfix?
                        │
                        ├── YES → Deploy hotfix
                        │
                        └── NO → Planned Rollback (P2)
```

---

## Pre-Rollback Checklist

Before initiating rollback:

- [ ] Confirm issue is deployment-related (not external)
- [ ] Document current state (screenshots, logs)
- [ ] Notify stakeholders
- [ ] Identify rollback target (last known good)
- [ ] Prepare verification steps

---

## Rollback Runbook

### Step-by-Step Procedure

| Step | Action | Owner | Time |
|------|--------|-------|------|
| 1 | Detect issue | Monitoring | - |
| 2 | Assess severity | On-call | 2 min |
| 3 | Decision to rollback | Tech Lead | 1 min |
| 4 | Notify stakeholders | On-call | 1 min |
| 5 | Execute rollback | DevOps | 2-5 min |
| 6 | Verify rollback | QA | 5 min |
| 7 | Update status page | On-call | 1 min |
| 8 | Post-mortem scheduled | Tech Lead | - |

### Total Expected Time: 12-15 minutes

---

## Previous Deployments Reference

Keep track of last 5 known good deployments:

| Date | Commit | Deployment URL | Notes |
|------|--------|----------------|-------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call Engineer | | |
| Tech Lead | | |
| DevOps Lead | | |
| Product Owner | | |

---

## Post-Rollback Actions

1. **Immediate**
   - [ ] Verify services restored
   - [ ] Update status page
   - [ ] Notify stakeholders

2. **Within 24 hours**
   - [ ] Conduct post-mortem
   - [ ] Document root cause
   - [ ] Create fix tickets
   - [ ] Update runbooks if needed

3. **Before Next Deployment**
   - [ ] Root cause fixed
   - [ ] Additional tests added
   - [ ] Deployment verified in staging
