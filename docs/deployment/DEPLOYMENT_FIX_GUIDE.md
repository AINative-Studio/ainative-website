# Deployment Fix Guide - Railway Setup

**Date**: 2026-02-08
**Issue**: Site not deploying - GitHub Actions workflows failing
**Root Cause**: Missing Railway secrets in GitHub repository

## Problem Summary

After analyzing the deployment configuration, the site is **not deploying** because:

1. ✅ GitHub Actions workflows are configured correctly
2. ✅ Local build works (`npm run build` succeeds)
3. ❌ **Railway secrets are NOT configured** in GitHub
4. ❌ All workflows failing because of missing `RAILWAY_TOKEN` and service IDs

## Deployment Architecture

**Platform**: Railway (NOT Vercel)

- **Staging**: Auto-deploys on push to `main` branch
- **Production**: Manual deploy via GitHub Actions with version tag

## Required GitHub Secrets

You must configure these secrets in GitHub repo settings:

### Railway Configuration
```
RAILWAY_TOKEN=<your-railway-api-token>
RAILWAY_STAGING_SERVICE_ID=<staging-service-id>
RAILWAY_PRODUCTION_SERVICE_ID=<production-service-id>
```

### API URLs
```
STAGING_API_URL=https://api-staging.ainative.studio
PRODUCTION_API_URL=https://api.ainative.studio
```

### Stripe Keys
```
# Staging (Test Mode)
STAGING_STRIPE_PUBLISHABLE_KEY=pk_test_...
STAGING_STRIPE_SECRET_KEY=sk_test_...

# Production (Live Mode)
PRODUCTION_STRIPE_PUBLISHABLE_KEY=pk_live_...
PRODUCTION_STRIPE_SECRET_KEY=sk_live_...
```

### Sentry (Optional but recommended)
```
STAGING_SENTRY_DSN=https://...@sentry.io/...
PRODUCTION_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-token
```

### Slack Notifications (Optional)
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## Step-by-Step Fix

### Step 1: Get Railway API Token

1. Go to https://railway.app/account/tokens
2. Click "Create New Token"
3. Name it "GitHub Actions Deploy"
4. Copy the token (you won't see it again!)

### Step 2: Get Railway Service IDs

```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# List your projects
railway list

# Link to your project
railway link

# Get service IDs
railway service list

# Copy the service IDs for:
# - staging-ainative-nextjs (staging)
# - production-ainative-nextjs (production)
```

### Step 3: Add Secrets to GitHub

#### Option A: Via GitHub Web UI

1. Go to: https://github.com/AINative-Studio/ainative-website/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret one by one from the list above

#### Option B: Via GitHub CLI

```bash
# Add Railway secrets
gh secret set RAILWAY_TOKEN --body="<your-railway-token>"
gh secret set RAILWAY_STAGING_SERVICE_ID --body="<staging-service-id>"
gh secret set RAILWAY_PRODUCTION_SERVICE_ID --body="<production-service-id>"

# Add API URLs
gh secret set STAGING_API_URL --body="https://api-staging.ainative.studio"
gh secret set PRODUCTION_API_URL --body="https://api.ainative.studio"

# Add Stripe keys (replace with actual keys)
gh secret set STAGING_STRIPE_PUBLISHABLE_KEY --body="pk_test_..."
gh secret set PRODUCTION_STRIPE_PUBLISHABLE_KEY --body="pk_live_..."

# Add Sentry (optional)
gh secret set STAGING_SENTRY_DSN --body="https://...@sentry.io/..."
gh secret set PRODUCTION_SENTRY_DSN --body="https://...@sentry.io/..."
```

### Step 4: Verify Secrets

```bash
# List all secrets (won't show values, just names)
gh secret list
```

Expected output:
```
RAILWAY_TOKEN                        Updated 2026-02-08
RAILWAY_STAGING_SERVICE_ID           Updated 2026-02-08
RAILWAY_PRODUCTION_SERVICE_ID        Updated 2026-02-08
STAGING_API_URL                      Updated 2026-02-08
PRODUCTION_API_URL                   Updated 2026-02-08
STAGING_STRIPE_PUBLISHABLE_KEY       Updated 2026-02-08
PRODUCTION_STRIPE_PUBLISHABLE_KEY    Updated 2026-02-08
# ... and more
```

### Step 5: Trigger Deployment

#### For Staging (Auto-deploy)

Just push to main branch:
```bash
git push origin main
```

Monitor deployment:
```bash
gh run watch
```

#### For Production (Manual)

1. Create a version tag:
```bash
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

2. Go to GitHub Actions:
   - https://github.com/AINative-Studio/ainative-website/actions/workflows/cd-production.yml
   - Click "Run workflow"
   - Enter version: `1.0.0`
   - Click "Run workflow"

### Step 6: Verify Deployment

```bash
# Check staging
curl -I https://staging.ainative.studio

# Check staging API
curl https://staging.ainative.studio/api/health

# Check production (after prod deployment)
curl -I https://ainative.studio
curl https://ainative.studio/api/health
```

## Troubleshooting

### Deployment Still Failing?

1. **Check GitHub Actions logs**:
   ```bash
   gh run list --limit 1
   gh run view <run-id> --log-failed
   ```

2. **Verify Railway service is running**:
   ```bash
   railway status --service staging-ainative-nextjs
   ```

3. **Check Railway logs**:
   ```bash
   railway logs --service staging-ainative-nextjs
   ```

### Build Errors?

If you see build errors in GitHub Actions:

1. **Test build locally first**:
   ```bash
   npm run build
   ```

2. **Check environment variables**:
   - Make sure all required env vars are in GitHub secrets
   - Verify they match what's in `.env.example`

3. **Check for missing dependencies**:
   ```bash
   npm ci  # Clean install
   npm run build
   ```

### Railway Connection Issues?

If Railway deployment fails:

1. **Verify Railway token is valid**:
   ```bash
   railway whoami
   ```

2. **Re-link project**:
   ```bash
   railway link
   ```

3. **Check service IDs are correct**:
   ```bash
   railway service list
   ```

## Current Status

- ✅ Code pushed to GitHub: `dea6cd5`
- ✅ Local build working
- ❌ Deployment failing (missing secrets)
- ⏳ Awaiting Railway secrets configuration

## Next Steps After Fix

Once secrets are configured and deployment succeeds:

1. ✅ Verify staging URL loads: https://staging.ainative.studio
2. ✅ Test all functionality on staging
3. ✅ Monitor for errors in Sentry
4. ✅ Check Railway metrics (CPU, memory)
5. ✅ When ready, deploy to production using manual workflow

## Related Documentation

- `docs/deployment/deployment-guide.md` - Full deployment guide
- `docs/deployment/production-deployment.md` - Production deployment checklist
- `docs/deployment/staging-deployment.md` - Staging deployment guide
- `.github/workflows/cd-staging.yml` - Staging CD workflow
- `.github/workflows/cd-production.yml` - Production CD workflow

---

**Last Updated**: 2026-02-08
**Status**: 🔴 Deployment blocked - awaiting Railway secrets
**Action Required**: Configure GitHub secrets (see Step 3)
