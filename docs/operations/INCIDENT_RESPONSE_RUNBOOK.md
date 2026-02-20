# Incident Response Runbook

**Service:** AINative Next.js Website (www.ainative.studio)
**Owner:** Engineering Team
**Last Updated:** 2026-02-08
**On-Call Rotation:** [PagerDuty/Opsgenie Link]

---

## Quick Reference

### Emergency Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| On-Call Engineer | PagerDuty | Primary responder |
| Engineering Lead | [Slack: @eng-lead] | Escalate after 15min |
| CTO | [Slack: @cto] | Escalate P0 incidents |
| DevOps/SRE | [Slack: #devops] | Infrastructure issues |

### Critical Links

| Resource | URL |
|----------|-----|
| Production Site | https://www.ainative.studio |
| Health Check | https://www.ainative.studio/health |
| Railway Dashboard | https://railway.app/project/... |
| Sentry Errors | https://sentry.io/organizations/ainative/issues/ |
| GitHub Actions | https://github.com/ainative/ainative-nextjs/actions |
| Status Page | https://status.ainative.studio |

### One-Line Commands

```bash
# Check site health
curl -I https://www.ainative.studio/health

# View Railway logs (last 100 lines)
railway logs --service 410afe5c-7419-408f-91a9-f6b658ea158a | tail -100

# Check database connection pool
python3 scripts/check_db_connection_pool.py

# Rollback to previous deployment
railway rollback --service 410afe5c-7419-408f-91a9-f6b658ea158a

# Trigger redeploy
railway up --service 410afe5c-7419-408f-91a9-f6b658ea158a

# Check environment variables
railway variables --service 410afe5c-7419-408f-91a9-f6b658ea158a
```

---

## Incident Severity Levels

### P0 - Total Outage (Page Immediately)
**User Impact:** All users cannot access core functionality
**Examples:**
- Homepage returns 502/503
- Database completely unavailable
- Authentication fully broken (all users)
- Payment processing down

**Response Time:**
- Acknowledge: < 5 minutes
- Initial Assessment: < 10 minutes
- Resolution Target: < 30 minutes

**Escalation:** Immediately notify Engineering Lead and CTO

---

### P1 - Critical Feature Down (Page Immediately)
**User Impact:** Critical features unavailable for subset of users
**Examples:**
- Dashboard inaccessible
- API endpoints timing out (>50% requests)
- OAuth login broken
- Database connection pool exhausted

**Response Time:**
- Acknowledge: < 5 minutes
- Initial Assessment: < 15 minutes
- Resolution Target: < 2 hours

**Escalation:** Notify Engineering Lead after 15 minutes

---

### P2 - Degraded Performance (Alert, No Page)
**User Impact:** Service works but with significant degradation
**Examples:**
- Slow page loads (p95 > 5s)
- Intermittent errors (< 10% requests)
- High error rate (> 1% 5xx)
- Memory/CPU spike

**Response Time:**
- Acknowledge: < 15 minutes
- Initial Assessment: < 1 hour
- Resolution Target: < 8 hours

**Escalation:** Notify team in Slack #engineering

---

### P3 - Minor Issue (Monitor)
**User Impact:** Limited impact, workaround available
**Examples:**
- UI bugs (non-blocking)
- Analytics not tracking
- Non-critical feature broken
- Documentation outdated

**Response Time:**
- Acknowledge: < 24 hours
- Resolution Target: < 1 week

**Escalation:** Create GitHub issue, address in next sprint

---

## Incident Response Process

### Phase 1: Detection and Triage (0-10 minutes)

1. **Acknowledge Alert**
   - Acknowledge PagerDuty/Opsgenie alert
   - Join `#incident-response` Slack channel
   - Post: "Acknowledged - investigating [incident-name]"

2. **Verify Impact**
   ```bash
   # Check if site is down
   curl -I https://www.ainative.studio

   # Check health endpoint
   curl -s https://www.ainative.studio/health | jq

   # Check error rate in Sentry (last 15 min)
   # Visit: https://sentry.io/organizations/ainative/issues/
   ```

3. **Classify Severity**
   - Determine P0/P1/P2/P3 based on user impact
   - Update incident severity in PagerDuty
   - Escalate if P0 or P1

4. **Assemble Team**
   - P0/P1: Page additional responders
   - Create incident Zoom/Slack huddle
   - Designate incident commander (IC)

### Phase 2: Initial Assessment (10-30 minutes)

1. **Gather Data**
   ```bash
   # Check recent deployments
   gh api repos/ainative/ainative-nextjs/deployments | jq '.[0:5]'

   # View Railway logs (error patterns)
   railway logs --service 410afe5c-7419-408f-91a9-f6b658ea158a | grep -i "error\|exception\|fail"

   # Check database health
   python3 scripts/check_db_connection_pool.py

   # Review Sentry errors (group by error type)
   # Focus on NEW error types or spikes
   ```

2. **Identify Root Cause Hypothesis**
   - Recent deployment? (check last commit)
   - Configuration change? (check Railway env vars)
   - Infrastructure issue? (check Railway status)
   - Dependency failure? (check Stripe, GitHub, database)
   - Traffic spike? (check analytics)

3. **Post Initial Assessment**
   ```
   [Slack #incident-response]
   INITIAL ASSESSMENT - [TIMESTAMP]
   Severity: P1
   Impact: Dashboard returning 500 errors (~30% of users)
   Hypothesis: Recent deployment (commit abc123) introduced undefined env var
   Next Steps: Reviewing logs, preparing rollback
   ETA: 15 minutes
   ```

### Phase 3: Mitigation (30-60 minutes)

1. **Immediate Mitigation (if possible)**

   **Option A: Rollback Deployment**
   ```bash
   # View deployment history
   railway deployments --service 410afe5c-7419-408f-91a9-f6b658ea158a

   # Rollback to last known good deployment
   railway rollback --service 410afe5c-7419-408f-91a9-f6b658ea158a

   # Verify health after rollback
   sleep 30
   curl https://www.ainative.studio/health
   ```

   **Option B: Fix Environment Variables**
   ```bash
   # Add missing variable
   railway variables set MISSING_VAR="value" --service 410afe5c-...

   # Restart service (automatic on var change)
   # Verify health
   curl https://www.ainative.studio/health
   ```

   **Option C: Scale Resources**
   ```bash
   # If database connection exhaustion
   # 1. Kill idle connections (use SQL script)
   # 2. Restart application instances
   # 3. Monitor connection pool usage
   ```

   **Option D: Disable Feature**
   ```bash
   # If specific feature causing issues
   railway variables set FEATURE_FLAG_X=false

   # Deploy with feature disabled
   ```

2. **Verify Mitigation**
   ```bash
   # Check error rate dropped
   # Monitor Sentry dashboard

   # Check latency improved
   # Monitor Railway metrics

   # Test critical user flows
   # - Homepage load
   # - Login (email + OAuth)
   # - Dashboard access
   # - Payment flow
   ```

3. **Post Mitigation Update**
   ```
   [Slack #incident-response]
   MITIGATION APPLIED - [TIMESTAMP]
   Action: Rolled back deployment to commit xyz789
   Status: Error rate dropped from 30% to 0.5%
   Next Steps: Monitor for 15 min, then root cause analysis
   ```

### Phase 4: Monitoring and Resolution (60+ minutes)

1. **Sustained Monitoring**
   - Watch Sentry error rate (should drop to baseline)
   - Monitor Railway metrics (CPU, memory, latency)
   - Check database connection pool (should stabilize)
   - Review user reports (support tickets, Slack)

2. **Declare Incident Resolved**
   - **Criteria:**
     - Error rate < baseline for 15 minutes
     - Latency p95 < SLO threshold
     - No user-reported issues
     - Root cause understood (or safe to defer)

   ```
   [Slack #incident-response]
   INCIDENT RESOLVED - [TIMESTAMP]
   Total Duration: 45 minutes
   Root Cause: Missing NEXTAUTH_SECRET in Railway env vars
   Mitigation: Added env var, restarted service
   Follow-up: Postmortem scheduled for [DATE]
   ```

3. **Close Incident**
   - Mark incident resolved in PagerDuty
   - Update status page
   - Thank responders
   - Schedule postmortem (within 48 hours)

### Phase 5: Postmortem (Within 48 hours)

1. **Blameless Postmortem**
   - **Template:** docs/operations/POSTMORTEM_TEMPLATE.md
   - **Attendees:** Incident responders + stakeholders
   - **Duration:** 1 hour
   - **Output:** Action items with owners and deadlines

2. **Key Questions**
   - What happened? (timeline)
   - Why did it happen? (root cause)
   - How did we detect it? (MTTD)
   - How did we respond? (MTTR)
   - What went well? (kudos)
   - What can we improve? (action items)
   - How do we prevent recurrence? (systemic fixes)

3. **Action Items**
   - Create GitHub issues for each action item
   - Assign owners and deadlines
   - Link to postmortem document
   - Track in project board

---

## Common Incident Scenarios

### Scenario 1: Site Completely Down (502/503)

**Symptoms:**
- Homepage returns 502 Bad Gateway or 503 Service Unavailable
- Health check endpoint fails
- All users affected

**Quick Diagnosis:**
```bash
# Check if Railway service is running
railway status --service 410afe5c-7419-408f-91a9-f6b658ea158a

# Check recent deployments
railway deployments --service 410afe5c-7419-408f-91a9-f6b658ea158a

# View crash logs
railway logs --service 410afe5c-7419-408f-91a9-f6b658ea158a | grep -i "crash\|exit\|killed"
```

**Common Causes:**
1. **Recent deployment crash loop**
   - Mitigation: Rollback deployment
2. **Railway platform issue**
   - Mitigation: Check Railway status, contact support
3. **Database connection failure**
   - Mitigation: Restart service, check DATABASE_URL

**Resolution Steps:**
1. Check Railway service health
2. If recent deployment: Rollback
3. If platform issue: Wait for Railway resolution
4. If database issue: Verify DATABASE_URL, restart service
5. Verify site returns 200 after mitigation

---

### Scenario 2: NextAuth NO_SECRET Error

**Symptoms:**
- Users cannot login
- Error in logs: "NextAuth: NO_SECRET environment variable"
- Sentry shows NextAuth configuration errors

**Quick Diagnosis:**
```bash
# Check if NEXTAUTH_SECRET is set
railway variables --service 410afe5c-... | grep NEXTAUTH_SECRET

# Check application logs for NextAuth errors
railway logs --service 410afe5c-... | grep -i "nextauth\|no_secret"
```

**Root Cause:**
- NEXTAUTH_SECRET environment variable not set in Railway
- Secret changed but not updated in production
- Secret accidentally removed

**Resolution Steps:**
1. Generate new secret:
   ```bash
   openssl rand -base64 32
   ```
2. Set in Railway:
   ```bash
   railway variables set NEXTAUTH_SECRET="<generated_secret>" --service 410afe5c-...
   ```
3. Service restarts automatically
4. Verify auth works:
   ```bash
   curl -I https://www.ainative.studio/api/auth/signin
   ```

**Prevention:**
- Run pre-deployment validation script
- Add NEXTAUTH_SECRET to env var validation
- Alert if secret is missing on startup

**Postmortem Example:** See 2026-02-08 incident

---

### Scenario 3: Missing File Imports (Build Failure)

**Symptoms:**
- Deployment fails during build
- Error: "Cannot find module 'lib/utils/filename'"
- TypeScript compilation errors

**Quick Diagnosis:**
```bash
# Check GitHub Actions build logs
gh run list --workflow=cd-production.yml --limit 5

# View failed build log
gh run view <run-id> --log-failed

# Check for missing files locally
npm run build
```

**Root Cause:**
- File imported but not committed to git
- File deleted but import not removed
- Case sensitivity issue (local vs. production)

**Resolution Steps:**
1. Identify missing file from build error
2. Create missing file or remove import
3. Commit and push changes
4. Trigger redeploy:
   ```bash
   git add lib/utils/missing-file.ts
   git commit -m "Add missing file for build"
   git push
   ```
5. Monitor build in GitHub Actions

**Prevention:**
- Run `npm run build` before committing
- CI validates build before merge
- Pre-commit hook runs type-check

**Postmortem Example:** See 2026-02-08 incident

---

### Scenario 4: Database Connection Pool Exhausted

**Symptoms:**
- Errors: "QueuePool limit of 20 overflow is reached"
- API endpoints timing out
- Slow database queries

**Quick Diagnosis:**
```bash
# Check connection pool status
python3 scripts/check_db_connection_pool.py

# View active connections
# (SQL query via Railway SQL editor or psql)
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
```

**Root Cause:**
- Too many concurrent requests
- Connection leaks (not closing connections)
- Using direct port 5432 instead of PgBouncer 6432

**Resolution Steps:**
1. **Immediate:** Restart application instances
   ```bash
   railway restart --service 410afe5c-...
   ```
2. **Verify DATABASE_URL uses PgBouncer (port 6432)**
   ```bash
   railway variables --service 410afe5c-... | grep DATABASE_URL
   # Should contain :6432/ not :5432/
   ```
3. **Kill idle connections (if needed)**
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
   AND state_change < NOW() - INTERVAL '10 minutes';
   ```
4. **Monitor connection pool for 15 minutes**

**Prevention:**
- ALWAYS use PgBouncer port 6432
- Set connection pool size <= 20
- Implement connection timeout
- Use context managers for DB sessions
- Load test connection pool limits

**Per CLAUDE.md:**
- CRITICAL: DATABASE_URL must use port 6432
- Pool limit: 20 per instance (10 base + 10 overflow)
- Script: `scripts/check_db_connection_pool.py`

---

### Scenario 5: High Error Rate (5xx Spikes)

**Symptoms:**
- Sentry shows spike in 5xx errors
- Error rate > 1% (SLO threshold)
- Users reporting issues

**Quick Diagnosis:**
```bash
# Check Sentry for common error patterns
# Group by error type, sort by frequency

# Check Railway logs for errors
railway logs --service 410afe5c-... | grep -i "error" | tail -50

# Check recent deployments
gh api repos/ainative/ainative-nextjs/deployments | jq '.[0:3]'
```

**Common Causes:**
1. **Recent deployment introduced bug**
2. **Third-party API failure** (Stripe, GitHub, Strapi)
3. **Database query timeout**
4. **Memory/CPU spike**

**Resolution Steps:**
1. **If recent deployment:** Rollback
2. **If third-party API:** Implement circuit breaker, show degraded UI
3. **If database timeout:** Optimize slow queries
4. **If resource spike:** Scale instances, investigate memory leak

**Prevention:**
- Gradual rollout (canary deployments)
- Circuit breakers for external dependencies
- Query performance monitoring
- Memory profiling

---

### Scenario 6: Slow Performance (Latency Spike)

**Symptoms:**
- p95 latency > 3s (SLO threshold)
- Users report slow page loads
- Railway shows high CPU/memory

**Quick Diagnosis:**
```bash
# Check Railway metrics (CPU, memory, latency)
# Via Railway dashboard

# Profile slow endpoints
# Use Sentry Performance or custom APM

# Check database query performance
# pg_stat_statements for slow queries
```

**Common Causes:**
1. **Database query inefficiency** (missing indexes)
2. **N+1 query problem**
3. **Large payload size** (inefficient serialization)
4. **Memory leak** (heap growing)
5. **Cold start** (first request after idle)

**Resolution Steps:**
1. **Identify slow endpoint** (Sentry Performance)
2. **Profile database queries** (EXPLAIN ANALYZE)
3. **Add indexes** for frequent queries
4. **Optimize payload size** (pagination, field selection)
5. **Scale instances** if traffic spike
6. **Investigate memory leak** (heap dump analysis)

**Prevention:**
- Load testing before production
- Database query profiling in CI
- Performance budgets (Lighthouse)
- Memory monitoring and alerts

---

## Rollback Procedures

### Automatic Rollback (Preferred)

**When to Use:**
- Recent deployment caused incident
- Root cause unclear, mitigation urgent
- SLO breach imminent

**Steps:**
```bash
# 1. View recent deployments
railway deployments --service 410afe5c-7419-408f-91a9-f6b658ea158a

# 2. Identify last known good deployment
# (deployment before incident started)

# 3. Rollback
railway rollback --service 410afe5c-7419-408f-91a9-f6b658ea158a

# 4. Wait for rollback to complete (2-5 min)
railway logs --service 410afe5c-... --follow

# 5. Verify health
curl https://www.ainative.studio/health

# 6. Test critical paths
# - Homepage
# - Login
# - Dashboard
```

**Expected Time:** 5-10 minutes

---

### Manual Rollback (Git Revert)

**When to Use:**
- Automatic rollback not available
- Need to rollback multiple commits
- Configuration change (not code deployment)

**Steps:**
```bash
# 1. Identify commit to revert
git log --oneline -10

# 2. Revert commit
git revert <commit-sha> --no-edit

# 3. Push revert
git push origin main

# 4. GitHub Actions auto-deploys revert

# 5. Monitor deployment
gh run watch

# 6. Verify health after deploy
```

**Expected Time:** 10-15 minutes

---

### Configuration Rollback (Environment Variables)

**When to Use:**
- Incident caused by env var change
- Need to revert to previous value

**Steps:**
```bash
# 1. Check current value
railway variables --service 410afe5c-...

# 2. Update to previous value
railway variables set VAR_NAME="old_value" --service 410afe5c-...

# 3. Service restarts automatically

# 4. Verify health
curl https://www.ainative.studio/health
```

**Expected Time:** 2-5 minutes

---

## Communication Templates

### Initial Incident Notification

```
[Slack #incident-response]
🚨 INCIDENT DETECTED 🚨

Severity: P1
Service: www.ainative.studio
Impact: Dashboard returning 500 errors for ~30% of users
Detected: 2026-02-08 15:30 UTC
Responder: @engineer-name

Status: Investigating
Next Update: 15:45 UTC (15 min)

Join incident huddle: [Zoom/Slack link]
```

### Status Update (Every 15-30 min)

```
[Slack #incident-response]
📊 STATUS UPDATE - 15:45 UTC

Severity: P1
Duration: 15 minutes

Current Status: Mitigation in progress
Actions Taken:
- Identified root cause: Missing NEXTAUTH_SECRET env var
- Adding env var to Railway
- Preparing to restart service

Impact: Error rate decreased from 30% to 15%
ETA to Resolution: 10 minutes

Next Update: 16:00 UTC
```

### Resolution Notification

```
[Slack #incident-response]
✅ INCIDENT RESOLVED - 16:00 UTC

Severity: P1
Total Duration: 30 minutes
User Impact: Dashboard errors (peak 30% of users)

Root Cause: NEXTAUTH_SECRET environment variable not set in Railway after recent deployment

Mitigation: Added NEXTAUTH_SECRET to Railway, service restarted

Current Status: ✅ Error rate at baseline (0.3%)
Current Status: ✅ Latency p95 at 800ms (within SLO)

Next Steps:
- Postmortem scheduled for 2026-02-09 10:00 AM
- Action items to prevent recurrence

Thank you to incident responders: @engineer1, @engineer2
```

### Customer Communication (Status Page)

```
[Status Page Update]

**Investigating** - 15:30 UTC
We are investigating reports of errors when accessing the dashboard.
Users may experience 500 errors. Our team is actively investigating.

**Identified** - 15:45 UTC
We have identified the root cause and are implementing a fix.
Impact: ~30% of dashboard requests affected.

**Monitoring** - 16:00 UTC
A fix has been deployed and we are monitoring the situation.
Impact: Error rate returning to normal.

**Resolved** - 16:15 UTC
This incident has been resolved. All systems operational.
We apologize for any inconvenience.
```

---

## Escalation Paths

### When to Escalate

**To Engineering Lead:**
- P0 or P1 incident after 15 minutes
- Uncertainty about mitigation approach
- Need additional resources

**To CTO:**
- P0 incident (total outage)
- Security incident (data breach, leaked secrets)
- Public communication needed

**To Product Lead:**
- Need to disable feature
- User communication required
- Business impact assessment

---

## Post-Incident Checklist

After resolving incident:

- [ ] Update status page (resolved)
- [ ] Post resolution in #incident-response
- [ ] Close PagerDuty incident
- [ ] Thank incident responders
- [ ] Schedule postmortem (within 48 hours)
- [ ] Create GitHub issues for action items
- [ ] Update runbook with learnings
- [ ] Review SLO impact
- [ ] Update monitoring/alerting if needed

---

## Tools and Access

### Required Access

- Railway CLI authenticated
- GitHub CLI authenticated
- Sentry dashboard access
- PagerDuty account
- Slack #incident-response channel
- Production database read access (via Railway)

### Setup Instructions

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Install GitHub CLI
brew install gh

# Authenticate GitHub
gh auth login

# Install jq (JSON parsing)
brew install jq
```

---

## Related Documents

- [Production Readiness Checklist](PRODUCTION_READINESS_CHECKLIST.md)
- [SLO/SLI Definitions](SLO_SLI_DEFINITIONS.md)
- [Monitoring Dashboard Specification](MONITORING_DASHBOARD_SPEC.md)
- [Postmortem Template](POSTMORTEM_TEMPLATE.md)
- [Railway Troubleshooting Guide](../deployment/RAILWAY_TROUBLESHOOTING.md)

---

## Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-08 | 1.0 | Initial runbook after production incident | SRE Team |

---

**Last Tested:** 2026-02-08 (during actual incident)
**Next Drill:** 2026-03-01 (monthly incident response drill)
