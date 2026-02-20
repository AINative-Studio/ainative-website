# Deployment Quick Reference Card

**Print this and keep it handy!**

---

## When to Use Each Deployment Path

| Situation | Use This Path | Command | Time |
|-----------|--------------|---------|------|
| Standard feature | GitHub Actions → Staging → Production | `git push` | 30-45 min |
| Bug fix (non-critical) | GitHub Actions → Staging → Production | `git push` | 30-45 min |
| P0 production outage | Emergency CLI → Production | `./scripts/deploy-emergency.sh production` | 5-10 min |
| GitHub Actions down | Railway Native → Staging | Push to GitHub, Railway auto-deploys | 20-30 min |
| Complete CI/CD outage | Local CLI → Production | `railway up --service production` | 5 min |

---

## Pre-Deployment Checklist

```bash
# Before pushing code, verify:
□ npm run lint              # Code style
□ npm run type-check        # TypeScript
□ npm run test              # Unit tests
□ npm run build             # Build passes
□ npm run validate:env      # Environment vars
```

**Git hooks will run these automatically on commit/push!**

---

## Health Check URLs

```bash
# Basic health check
curl https://your-app.railway.app/api/health

# Deep health check (all dependencies)
curl https://your-app.railway.app/api/health/deep

# Expected response
{
  "status": "healthy",
  "timestamp": "2026-02-08T10:00:00Z",
  "checks": {
    "database": { "status": "ok", "latency": 45 },
    "redis": { "status": "ok", "latency": 12 }
  }
}
```

---

## Deployment Status Dashboard

**URL**: `https://ainative.studio/admin/deployments`

**What You See**:
- Current deployment status (all environments)
- Recent deployment history
- Health scores
- Active alerts

**When to Check**:
- After pushing code
- During production deployments
- When investigating issues

---

## Emergency Procedures

### Rollback to Previous Version

```bash
# Automatic rollback (if health checks fail)
# System does this automatically!

# Manual rollback (if needed)
./scripts/rollback.sh production

# Or via Railway CLI
railway rollback --service production
```

### Emergency Hotfix (P0 Incident)

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Make MINIMAL fix (one change only)
# ... edit code ...

# 3. Test locally
npm run test
npm run build

# 4. Deploy immediately (bypasses normal CI)
./scripts/deploy-emergency.sh production

# 5. IMPORTANT: Create proper PR immediately after
git push origin hotfix/critical-bug
# Open PR, run full CI, merge to main
```

---

## Monitoring Thresholds

### Response Time
- ✅ Healthy: < 200ms (p95)
- ⚠️ Warning: 200-500ms
- 🔴 Critical: > 500ms

### Error Rate
- ✅ Healthy: < 0.1%
- ⚠️ Warning: 0.1-1%
- 🔴 Critical: > 1%

### Database Pool
- ✅ Healthy: < 60% used
- ⚠️ Warning: 60-80%
- 🔴 Critical: > 80%

---

## Common Commands

```bash
# Validate environment
npm run validate:env
npm run validate:env:staging
npm run validate:env:production

# Run smoke tests
./scripts/run-smoke-tests.sh https://staging-url.railway.app

# Deploy to staging (manual)
railway up --service staging

# Deploy to production (manual)
railway up --service production

# View logs
railway logs --service production

# Check Railway status
railway status --service production
```

---

## Alert Severity Levels

### 🔴 CRITICAL (PagerDuty + Slack + Email)
- Deployment failed
- Automatic rollback triggered
- Database connection lost
- Memory exhaustion

**Action**: Respond immediately

### ⚠️ WARNING (Slack + Email)
- Health check degraded
- Performance regression
- Error rate spike

**Action**: Investigate within 30 minutes

### ℹ️ INFO (Slack only)
- Deployment succeeded
- Configuration drift detected
- Scheduled maintenance

**Action**: Acknowledge, no immediate action needed

---

## Who to Contact

| Issue | Contact | Channel |
|-------|---------|---------|
| Deployment failing | DevOps Team | #devops |
| Health checks failing | On-call engineer | PagerDuty |
| Environment variables | DevOps Team | #devops |
| Railway outage | Railway Support | support@railway.com |
| GitHub Actions down | Wait 30min, use Railway | - |
| Emergency (after hours) | On-call rotation | PagerDuty |

---

## Deployment Decision Tree (Simplified)

```
Is it urgent?
├─ YES → P0 incident?
│  ├─ YES → Use emergency deployment path
│  └─ NO → Use standard path (fast-tracked)
└─ NO → Use standard deployment path

Standard path:
├─ git commit (pre-commit hooks run)
├─ git push (pre-push validation runs)
├─ GitHub Actions (or Railway backup)
├─ Deploy to staging
├─ Automatic health checks
├─ Wait for approval
└─ Deploy to production

Emergency path:
├─ Make minimal fix
├─ Test locally
├─ Deploy directly to production
└─ Create proper PR immediately after
```

---

## Rollback Triggers (Automatic)

System will **automatically rollback** if:

- ❌ Health check fails 3 times in a row
- ❌ Error rate > 5% of traffic (sustained 2 min)
- ❌ Latency > 3x baseline (sustained 5 min)
- ❌ Database connection fails
- ❌ Memory > 95%
- ❌ Critical smoke test fails

**You don't need to do anything - the system handles it!**

You'll get a Slack notification explaining why.

---

## Tips for Successful Deployments

### Before Deployment
1. ✅ Run tests locally first
2. ✅ Verify environment variables
3. ✅ Check staging is healthy
4. ✅ Review deployment checklist
5. ✅ Notify team in #deployments

### During Deployment
1. 👀 Watch deployment dashboard
2. 👀 Monitor Slack for alerts
3. 👀 Keep Railway logs open
4. ⏱️ Give it 15 minutes to settle
5. 🚫 Don't deploy multiple things at once

### After Deployment
1. ✅ Verify health checks pass
2. ✅ Run smoke tests manually
3. ✅ Check key user journeys
4. ✅ Monitor for 15 minutes
5. ✅ Update deployment log

---

## Environment Variables

### Development (.env.local)
```bash
# Copy from .env.example
cp .env.example .env.local
# Edit with your local values
```

### Staging/Production (Railway)
```bash
# View variables
railway variables --service production

# Set variable
railway variables set KEY=value --service production

# Delete variable
railway variables delete KEY --service production
```

**⚠️ NEVER commit .env.local to Git!**

---

## Useful URLs

- **Documentation**: `/docs/architecture/README.md`
- **Full Architecture**: `/docs/architecture/DEPLOYMENT_ARCHITECTURE.md`
- **Decision Trees**: `/docs/architecture/DEPLOYMENT_DECISION_TREE.md`
- **Runbooks**: `/docs/runbooks/` (available after Phase 6)
- **Deployment Dashboard**: `https://ainative.studio/admin/deployments`
- **Railway Dashboard**: `https://railway.app/dashboard`
- **GitHub Actions**: `https://github.com/your-org/your-repo/actions`

---

## Quick Troubleshooting

### "Deployment is taking forever"

1. Check GitHub Actions status: `https://www.githubstatus.com/`
2. Check Railway status: `https://railway.app/status`
3. Check deployment dashboard for errors
4. View logs: `railway logs --service production`

### "Health checks failing"

1. Check deep health: `curl https://app/api/health/deep`
2. Identify which dependency is failing
3. Check that service's status page
4. If critical, rollback: `./scripts/rollback.sh production`

### "Environment variable missing"

1. Validate schema: `npm run validate:env:production`
2. Check Railway: `railway variables --service production`
3. Set missing var: `railway variables set KEY=value`
4. Redeploy: `railway up --service production`

### "Pre-push validation failing"

1. Check error message (it will tell you what failed)
2. Fix the issue locally
3. Run validation manually: `npm run validate:env`
4. Try push again: `git push`
5. Still failing? Bypass once: `git push --no-verify` (use sparingly!)

---

## Performance Baselines

**Current Production Baselines** (as of 2026-02-08):

| Metric | Baseline | Target |
|--------|----------|--------|
| p95 Response Time | 180ms | < 200ms |
| Error Rate | 0.05% | < 0.1% |
| Database Latency | 35ms | < 50ms |
| Redis Latency | 8ms | < 15ms |
| CPU Usage | 45% | < 70% |
| Memory Usage | 60% | < 80% |

**These are updated monthly based on actual performance.**

---

## Keyboard Shortcuts (Dashboard)

- `d` - View deployment details
- `r` - Refresh dashboard
- `h` - View health checks
- `l` - View logs
- `m` - View metrics
- `?` - Show help

---

**Last Updated**: 2026-02-08
**Version**: 1.0
**Print Date**: ___________

**Keep this card handy during deployments!**
