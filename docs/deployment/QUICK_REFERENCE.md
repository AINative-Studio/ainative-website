# Deployment Pipeline - Quick Reference Card

## Emergency Commands

```bash
# Production is down - emergency rollback
./scripts/rollback.sh production

# Check if production is healthy
./scripts/health-check.sh https://ainative.studio 60
./scripts/smoke-tests.sh https://ainative.studio

# View Railway logs
railway logs --tail 200
```

---

## Daily Development Workflow

```bash
# 1. Make changes
# 2. Commit (pre-commit hook runs automatically)
git add .
git commit -m "Add feature"

# 3. Before pushing - run local CI
./scripts/local-ci.sh --skip-e2e

# 4. Push to trigger staging deployment
git push origin main
```

---

## Deployment Commands

### Staging

```bash
# Automatic on push to main
git push origin main

# OR manual deployment
./scripts/deploy-to-railway.sh staging
```

### Production

```bash
# Production deployment (manual only)
./scripts/deploy-to-railway.sh production
```

---

## Validation Commands

```bash
# Pre-deployment validation
./scripts/pre-deploy-validation.sh production

# Validate imports
node scripts/validate-imports.js

# Validate environment variables
node scripts/validate-env-vars.js

# Full local CI pipeline
./scripts/local-ci.sh
```

---

## Health Check Commands

```bash
# Staging health check
./scripts/health-check.sh https://staging.ainative.studio 300

# Production health check
./scripts/health-check.sh https://ainative.studio 600

# Run smoke tests
./scripts/smoke-tests.sh https://ainative.studio
```

---

## Rollback Commands

```bash
# Emergency rollback to previous deployment
./scripts/rollback.sh production

# List recent deployments
railway deployments --limit 10

# Rollback to specific deployment
railway rollback --deployment <deployment-id>
```

---

## Railway Commands

```bash
# View logs
railway logs --tail 100

# View environment variables
railway variables

# Set environment variable
railway variables set VAR_NAME=value

# View deployment status
railway status

# View metrics
railway metrics

# Restart service
railway restart
```

---

## Script Locations

All scripts are in: `/Users/aideveloper/core/AINative-website-nextjs/scripts/`

| Script | Purpose |
|--------|---------|
| `local-ci.sh` | Local CI pipeline (GitHub Actions alternative) |
| `pre-deploy-validation.sh` | Pre-deployment checks |
| `deploy-to-railway.sh` | Automated deployment |
| `health-check.sh` | Health check verification |
| `smoke-tests.sh` | Post-deployment smoke tests |
| `rollback.sh` | Emergency rollback |
| `validate-imports.js` | Import validation |
| `validate-env-vars.js` | Environment variable validation |

---

## Pre-Commit Hook

**Location:** `.git/hooks/pre-commit`

**Runs automatically on commit:**
- Import validation
- Environment variable validation
- Secret detection
- TypeScript type check
- ESLint

**Bypass (emergency only):**
```bash
git commit --no-verify
```

---

## Common Issues

### Build Fails - Missing Dependencies

```bash
npm ci
npm run build
git add package-lock.json
git commit -m "Update dependencies"
```

### Health Check Fails

```bash
# Check Railway logs
railway logs --tail 100

# Check environment variables
railway variables

# Restart service
railway restart
```

### Import Errors

```bash
# Validate imports
node scripts/validate-imports.js

# Fix imports and re-commit
```

---

## Environment URLs

- **Staging:** https://staging.ainative.studio
- **Production:** https://ainative.studio

---

## Railway Services

- **Staging:** `AINative-Website-Staging`
- **Production:** `AINative-Website-Production`

---

## Required Environment Variables

### Staging
- `NEXT_PUBLIC_API_URL`
- `NODE_ENV`

### Production
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NODE_ENV`

---

## Typical Timings

- **Pre-commit hook:** 30-60 seconds
- **Local CI (no E2E):** 3-5 minutes
- **Local CI (with E2E):** 8-12 minutes
- **Pre-deployment validation:** 5-8 minutes
- **Health check:** 30-300 seconds
- **Smoke tests:** 30-60 seconds
- **Emergency rollback:** 2-5 minutes

---

## Success Criteria

- ✅ Pre-commit hook passes
- ✅ Local CI passes
- ✅ Pre-deployment validation passes
- ✅ Health checks pass
- ✅ Smoke tests pass
- ✅ No errors in Railway logs

---

## Documentation

- **Deployment Runbook:** `docs/deployment/DEPLOYMENT_RUNBOOK.md`
- **Implementation Guide:** `docs/deployment/DEPLOYMENT_PIPELINE_IMPLEMENTATION.md`
- **This Quick Reference:** `docs/deployment/QUICK_REFERENCE.md`

---

**Print this page and keep it handy for quick reference!**
