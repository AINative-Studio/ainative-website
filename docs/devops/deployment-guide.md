# Deployment Guide

## Overview

AINative Studio Next.js application is deployed using Railway with automated CI/CD pipelines. This guide covers deployment procedures for staging and production environments.

## Deployment Environments

### Staging
- **URL**: https://staging.ainative.studio
- **Auto-deploy**: Yes (on push to main)
- **Purpose**: Pre-production testing and validation
- **Railway Service**: staging-ainative-nextjs

### Production
- **URL**: https://ainative.studio
- **Auto-deploy**: No (manual trigger required)
- **Purpose**: Live production environment
- **Railway Service**: production-ainative-nextjs

## Pre-Deployment Checklist

### For All Deployments
- [ ] All tests passing locally (`npm run test:all`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] PR merged to main branch
- [ ] Release notes prepared
- [ ] Database migrations tested (if applicable)

### For Production Deployments Only
- [ ] Tested in staging environment
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] Rollback plan documented
- [ ] Team notified of deployment window
- [ ] Database backup verified
- [ ] Monitoring alerts configured
- [ ] On-call engineer identified

## Staging Deployment

### Automatic Deployment (Recommended)

Staging automatically deploys when code is pushed to the `main` branch.

```bash
# Merge PR to main
git checkout main
git pull origin main

# Automatic deployment will trigger via GitHub Actions
# Monitor deployment at: https://github.com/ainative/ainative-website-nextjs-staging/actions
```

### Manual Deployment

If automatic deployment fails or manual deployment is needed:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to staging project
railway link

# Deploy to staging
railway up --service staging-ainative-nextjs

# Monitor deployment
railway logs --service staging-ainative-nextjs
```

### Verification Steps

1. **Health Check**
   ```bash
   curl https://staging.ainative.studio/api/health
   ```

2. **Smoke Tests**
   - Visit https://staging.ainative.studio
   - Test user authentication flow
   - Verify API key generation
   - Test payment integration
   - Check dashboard functionality

3. **E2E Tests**
   ```bash
   npm run test:e2e -- --base-url=https://staging.ainative.studio
   ```

## Production Deployment

### Prerequisites

1. **Version Tag**: Create a version tag for the deployment
   ```bash
   git tag -a v1.2.3 -m "Release version 1.2.3"
   git push origin v1.2.3
   ```

2. **Approval**: Get approval from team lead or product manager

3. **Communication**: Notify team in #deployments Slack channel

### Deployment Process

1. **Trigger Production Deployment**

   Go to GitHub Actions → Deploy to Production workflow → Run workflow

   - Select the version tag to deploy
   - Click "Run workflow"

2. **Monitor Deployment**

   Watch the GitHub Actions workflow:
   - Pre-deployment checks
   - Build verification
   - Deployment to Railway
   - Health checks
   - Smoke tests

3. **Verify Deployment**

   ```bash
   # Health check
   curl https://ainative.studio/api/health

   # Test critical paths
   curl https://ainative.studio
   curl https://ainative.studio/api/status
   ```

4. **Post-Deployment Monitoring**

   Monitor for 30 minutes after deployment:
   - Check Sentry for errors
   - Monitor Railway metrics (CPU, memory, response times)
   - Watch Slack alerts
   - Review user activity logs

## Rollback Procedures

### Automatic Rollback

If health checks fail during deployment, automatic rollback is triggered.

### Manual Rollback

If issues are discovered after deployment:

1. **Quick Rollback via Railway**
   ```bash
   railway rollback --service production-ainative-nextjs
   ```

2. **Rollback via GitHub Actions**
   - Go to Deploy to Production workflow
   - Select previous successful version
   - Run workflow with previous version tag

3. **Verify Rollback**
   ```bash
   curl https://ainative.studio/api/health
   ```

4. **Notify Team**
   Post in #deployments Slack channel with rollback details

### Rollback Decision Criteria

Rollback immediately if:
- Critical functionality is broken
- Site is down or returning 5xx errors
- Data corruption detected
- Security vulnerability introduced
- Performance degradation > 50%

## Environment Variables

### Required Environment Variables

#### Staging
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api-staging.ainative.studio
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://staging.ainative.studio
```

#### Production
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.ainative.studio
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://ainative.studio
```

### Managing Environment Variables

#### Via Railway Dashboard
1. Go to Railway project
2. Select service (staging or production)
3. Click "Variables" tab
4. Add/edit variables
5. Click "Deploy" to apply changes

#### Via Railway CLI
```bash
# Set variable
railway variables set KEY=value --service production-ainative-nextjs

# Get variable
railway variables get KEY --service production-ainative-nextjs

# List all variables
railway variables --service production-ainative-nextjs
```

## Database Migrations

### Running Migrations in Staging

```bash
# SSH into Railway container
railway run --service staging-ainative-nextjs

# Run migrations
npm run db:migrate

# Verify migrations
npm run db:status
```

### Running Migrations in Production

1. **Create Database Backup**
   ```bash
   railway backup create --service production-ainative-nextjs
   ```

2. **Test Migration in Staging**
   ```bash
   railway run --service staging-ainative-nextjs npm run db:migrate
   ```

3. **Run Migration in Production**
   ```bash
   railway run --service production-ainative-nextjs npm run db:migrate
   ```

4. **Verify Migration**
   ```bash
   railway run --service production-ainative-nextjs npm run db:status
   ```

## Monitoring and Alerts

### Health Checks

The application exposes health check endpoints:

- `/api/health` - Application health status
- `/api/status` - Detailed status information

### Monitoring Tools

1. **Railway Metrics**
   - CPU usage
   - Memory usage
   - Request rate
   - Response time
   - Error rate

2. **Sentry**
   - Error tracking
   - Performance monitoring
   - Release tracking
   - User impact analysis

3. **Vercel Analytics** (if using Vercel)
   - Page views
   - Unique visitors
   - Core Web Vitals
   - User experience metrics

### Alert Thresholds

Configure alerts for:
- Error rate > 1%
- Response time > 2 seconds (p95)
- CPU usage > 80%
- Memory usage > 85%
- Deployment failures
- Health check failures

## Troubleshooting

### Deployment Failed

1. Check GitHub Actions logs for error messages
2. Verify environment variables are set correctly
3. Check Railway logs: `railway logs --service [service-name]`
4. Verify build succeeds locally: `npm run build`
5. Check for breaking changes in dependencies

### Application Not Responding

1. Check Railway service status
2. Review application logs: `railway logs --service [service-name]`
3. Check database connectivity
4. Verify environment variables
5. Restart service: `railway restart --service [service-name]`

### High Error Rate

1. Check Sentry for error details
2. Review recent deployments
3. Check for API changes or third-party service issues
4. Monitor database performance
5. Consider rollback if errors are critical

### Performance Issues

1. Check Railway metrics (CPU, memory, response time)
2. Review Lighthouse CI reports
3. Check for slow database queries
4. Verify CDN configuration
5. Review bundle size: `npm run build:analyze`

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build:analyze

# Check for duplicate dependencies
npx depcheck

# Update dependencies
npm update
```

### Caching Strategy

- Static assets: 1 year cache
- API responses: Configured per endpoint
- CDN: CloudFlare caching rules
- Database: Redis cache for frequently accessed data

### Image Optimization

- Use Next.js Image component
- Configure image domains in next.config.ts
- Set appropriate image sizes and formats
- Enable lazy loading

## Security

### Security Checklist

- [ ] All secrets stored in environment variables
- [ ] HTTPS enforced for all connections
- [ ] Security headers configured in next.config.ts
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection protection via ORM
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Dependency vulnerabilities scanned

### Security Scanning

```bash
# Run npm audit
npm audit

# Run Snyk scan
npx snyk test

# Check for outdated dependencies
npm outdated
```

## Disaster Recovery

### Database Backup

Automated daily backups via Railway:
- Retention: 30 days
- Location: Railway backup storage
- Restoration time: < 1 hour

### Manual Backup

```bash
railway backup create --service production-ainative-nextjs
```

### Restoration Procedure

1. Stop production service
2. Restore database from backup
3. Verify data integrity
4. Restart production service
5. Run health checks
6. Monitor for issues

## Contact Information

### On-Call Rotation

- Primary: Check #on-call channel in Slack
- Secondary: Check team calendar
- Escalation: Contact CTO

### Support Channels

- **Slack**: #deployments, #engineering
- **Email**: engineering@ainative.studio
- **Phone**: Emergency contact list in team wiki

## Appendix

### Railway CLI Commands

```bash
# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Restart service
railway restart

# Rollback
railway rollback

# Run command in container
railway run [command]

# List services
railway service list

# Variables
railway variables
railway variables set KEY=value
railway variables get KEY
```

### Useful Scripts

```bash
# Full local verification
npm run verify

# Run all tests
npm run test:all

# Performance test
npm run perf:test

# Generate performance report
npm run perf:report
```
