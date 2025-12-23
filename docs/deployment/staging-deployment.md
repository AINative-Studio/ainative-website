# Staging Deployment Guide

**Issue:** #66 - [Story 8.1] Deploy to Staging Environment
**Priority:** P0 - Critical

## Overview

Deploy the AINative Studio Next.js application to the staging environment for UAT review.

## Prerequisites

- [ ] Access to Vercel dashboard (or chosen hosting provider)
- [ ] Environment variables documented
- [ ] DNS access for staging.ainative.studio
- [ ] All tests passing locally (`npm test`)
- [ ] Build succeeds locally (`npm run build`)

## Environment Variables

### Required Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://staging-api.ainative.studio
NEXT_PUBLIC_APP_URL=https://staging.ainative.studio

# Authentication
NEXTAUTH_URL=https://staging.ainative.studio
NEXTAUTH_SECRET=<generate-secure-secret>

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Feature Flags (Staging)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

## Deployment Steps

### Step 1: Vercel Setup (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to staging (preview)
vercel --prod --env staging
```

### Step 2: Alternative - Railway Setup

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Step 3: Configure Custom Domain

1. Add `staging.ainative.studio` in hosting dashboard
2. Update DNS records:
   ```
   Type: CNAME
   Name: staging
   Value: cname.vercel-dns.com (or provider equivalent)
   ```
3. Wait for DNS propagation (up to 24 hours)
4. Verify HTTPS certificate is provisioned

### Step 4: Verify Deployment

```bash
# Health check
curl -I https://staging.ainative.studio

# Verify all pages load
curl -s https://staging.ainative.studio | grep -o '<title>.*</title>'
```

## Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Login/signup flows functional
- [ ] API connections working
- [ ] Images and assets loading
- [ ] Responsive design working
- [ ] No console errors
- [ ] Performance acceptable (< 3s LCP)

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading

1. Verify variables are set in hosting dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding new variables

### DNS Issues

```bash
# Check DNS propagation
dig staging.ainative.studio

# Verify CNAME record
nslookup staging.ainative.studio
```

## Rollback

If staging deployment fails, see [rollback-plan.md](./rollback-plan.md).

## Next Steps

After successful staging deployment:
1. Share staging URL with stakeholders
2. Begin UAT testing (see [uat-checklist.md](./uat-checklist.md))
3. Collect feedback and iterate

## Sign-off

| Task | Completed | Date | Verified By |
|------|-----------|------|-------------|
| Environment provisioned | [ ] | | |
| Variables configured | [ ] | | |
| App deployed | [ ] | | |
| Custom domain | [ ] | | |
| HTTPS enabled | [ ] | | |
| Team notified | [ ] | | |
