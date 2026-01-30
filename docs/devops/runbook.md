# DevOps Runbook

## Quick Reference

### Emergency Contacts
- **Primary On-Call**: Check #on-call Slack channel
- **Engineering Lead**: Check team directory
- **CTO**: Emergency escalation only

### Critical URLs
- **Production**: https://ainative.studio
- **Staging**: https://staging.ainative.studio
- **Railway Dashboard**: https://railway.app
- **GitHub Actions**: https://github.com/ainative/ainative-website-nextjs-staging/actions
- **Sentry**: https://sentry.io/organizations/ainative

### Quick Commands
```bash
# Health check
curl https://ainative.studio/api/health

# View logs
railway logs --service production-ainative-nextjs

# Rollback deployment
railway rollback --service production-ainative-nextjs

# Restart service
railway restart --service production-ainative-nextjs
```

## Common Incidents

### Site Down (5xx Errors)

**Severity**: P0 (Critical)
**Response Time**: Immediate

#### Symptoms
- Users cannot access the site
- Health check returns 5xx errors
- Monitoring alerts firing

#### Diagnosis
```bash
# Check health endpoint
curl -I https://ainative.studio/api/health

# Check Railway status
railway status --service production-ainative-nextjs

# View recent logs
railway logs --service production-ainative-nextjs --tail 100

# Check Sentry for errors
# Visit: https://sentry.io/organizations/ainative
```

#### Resolution Steps

1. **Immediate Response**
   ```bash
   # Check if it's a deployment issue
   railway logs --service production-ainative-nextjs | grep "ERROR"

   # If recent deployment, rollback immediately
   railway rollback --service production-ainative-nextjs
   ```

2. **If Rollback Doesn't Help**
   ```bash
   # Restart the service
   railway restart --service production-ainative-nextjs

   # Wait 30 seconds and verify
   sleep 30
   curl https://ainative.studio/api/health
   ```

3. **Check External Dependencies**
   - Database connectivity
   - API endpoints
   - Third-party services (Stripe, Auth providers)

4. **Post-Resolution**
   - Document root cause
   - Create post-mortem
   - Update monitoring alerts
   - Notify stakeholders

### High Error Rate

**Severity**: P1 (High)
**Response Time**: < 15 minutes

#### Symptoms
- Error rate > 1%
- Sentry alerts firing
- User complaints

#### Diagnosis
```bash
# Check Sentry dashboard for error patterns
# Look for:
# - Common error messages
# - Affected endpoints
# - Error frequency
# - User impact

# Check logs for errors
railway logs --service production-ainative-nextjs | grep "ERROR" | tail -50

# Check recent deployments
railway deployments --service production-ainative-nextjs
```

#### Resolution Steps

1. **Identify Error Pattern**
   - Single endpoint affected → API issue
   - All endpoints affected → Infrastructure issue
   - Specific user actions → Application bug

2. **Quick Fixes**
   ```bash
   # If related to recent deployment
   railway rollback --service production-ainative-nextjs

   # If cache related
   # Clear CDN cache (CloudFlare dashboard)

   # If database related
   # Check connection pool, restart if needed
   ```

3. **Temporary Mitigation**
   - Enable feature flag to disable problematic feature
   - Add rate limiting if load-related
   - Scale up resources if capacity issue

4. **Follow-up**
   - Create bug ticket
   - Deploy fix to staging
   - Test thoroughly
   - Deploy fix to production

### Slow Performance

**Severity**: P2 (Medium)
**Response Time**: < 30 minutes

#### Symptoms
- Response time > 2 seconds (p95)
- Users reporting slow page loads
- Performance alerts firing

#### Diagnosis
```bash
# Check Railway metrics
# CPU usage
# Memory usage
# Response times

# Run Lighthouse audit
npm run lighthouse:ci

# Check bundle size
npm run build:analyze

# Review database queries
# Check for N+1 queries, missing indexes
```

#### Resolution Steps

1. **Immediate Mitigation**
   ```bash
   # Scale up resources (Railway dashboard)
   # - Increase memory allocation
   # - Add more instances

   # Enable aggressive caching
   # - Update CDN rules
   # - Enable Redis caching
   ```

2. **Performance Analysis**
   - Check for slow database queries
   - Review API response times
   - Analyze bundle size
   - Check for memory leaks

3. **Optimization**
   - Implement database query optimization
   - Add database indexes
   - Reduce bundle size
   - Implement code splitting
   - Add resource caching

4. **Verification**
   ```bash
   npm run perf:test
   ```

### Database Connection Issues

**Severity**: P0 (Critical)
**Response Time**: Immediate

#### Symptoms
- "Connection pool exhausted" errors
- "Too many clients" errors
- Database timeout errors

#### Diagnosis
```bash
# Check database status
railway run --service production-ainative-nextjs -- npm run db:status

# Check connection pool
railway logs --service production-ainative-nextjs | grep "pool"

# Check active connections
railway run --service production-ainative-nextjs -- psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

#### Resolution Steps

1. **Immediate Response**
   ```bash
   # Restart application to reset connections
   railway restart --service production-ainative-nextjs

   # Verify recovery
   curl https://ainative.studio/api/health
   ```

2. **Check Connection Pool Configuration**
   - Review max connections limit
   - Check for connection leaks
   - Verify proper connection closing

3. **Scale Database**
   - Increase connection limit in Railway dashboard
   - Consider upgrading database plan

4. **Code Review**
   - Check for missing connection cleanup
   - Review transaction handling
   - Implement connection pooling best practices

### Deployment Failure

**Severity**: P2 (Medium)
**Response Time**: < 30 minutes

#### Symptoms
- GitHub Actions workflow fails
- Deployment doesn't complete
- Build errors

#### Diagnosis
```bash
# Check GitHub Actions logs
# Visit: https://github.com/ainative/ainative-website-nextjs-staging/actions

# Try building locally
npm ci
npm run build

# Check for TypeScript errors
npm run type-check

# Check for lint errors
npm run lint
```

#### Resolution Steps

1. **Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm ci
   npm run build
   ```

2. **Environment Variables**
   - Verify all required env vars are set in Railway
   - Check for typos in variable names
   - Ensure secrets are not expired

3. **Dependency Issues**
   ```bash
   # Check for breaking changes
   npm outdated

   # Check for security vulnerabilities
   npm audit

   # Update problematic dependencies
   npm update [package-name]
   ```

4. **Retry Deployment**
   - Fix identified issues
   - Commit changes
   - Trigger new deployment

### SSL/Certificate Issues

**Severity**: P1 (High)
**Response Time**: < 15 minutes

#### Symptoms
- HTTPS not working
- Certificate expired warnings
- Mixed content errors

#### Diagnosis
```bash
# Check certificate status
curl -vI https://ainative.studio 2>&1 | grep -i "expire"

# Check SSL Labs
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=ainative.studio
```

#### Resolution Steps

1. **Railway Certificate Renewal**
   - Railway auto-renews Let's Encrypt certificates
   - Check Railway dashboard for certificate status
   - Force renewal if needed

2. **DNS Configuration**
   - Verify DNS records point to Railway
   - Check for DNS propagation issues
   - Update DNS if needed

3. **Force HTTPS**
   - Verify HTTPS redirect is enabled
   - Check next.config.ts headers configuration

### Memory Leak

**Severity**: P1 (High)
**Response Time**: < 15 minutes

#### Symptoms
- Memory usage continuously increasing
- Out of memory errors
- Service restarts frequently

#### Diagnosis
```bash
# Monitor memory usage
railway logs --service production-ainative-nextjs | grep "memory"

# Check Railway metrics dashboard
# Look for steadily increasing memory usage

# Take heap snapshot (if needed)
railway run --service production-ainative-nextjs -- node --inspect
```

#### Resolution Steps

1. **Immediate Mitigation**
   ```bash
   # Restart service to free memory
   railway restart --service production-ainative-nextjs

   # Increase memory allocation temporarily
   # Railway dashboard → Service → Settings → Memory
   ```

2. **Identify Leak**
   - Review recent code changes
   - Check for unclosed connections
   - Look for circular references
   - Review event listeners

3. **Fix Leak**
   - Add proper cleanup in useEffect
   - Implement connection pooling
   - Remove circular references
   - Unsubscribe from events

4. **Deploy Fix**
   ```bash
   # Test in staging first
   git checkout staging
   # ... apply fix ...
   git push origin staging

   # After verification, deploy to production
   ```

## Maintenance Procedures

### Scheduled Maintenance

#### Before Maintenance
1. Announce maintenance window (24 hours notice)
2. Post in #announcements Slack channel
3. Update status page
4. Prepare rollback plan

#### During Maintenance
```bash
# Enable maintenance mode (if available)
railway variables set MAINTENANCE_MODE=true --service production-ainative-nextjs

# Perform maintenance tasks
# - Database migrations
# - Index rebuilds
# - Cache clearing
# - etc.

# Disable maintenance mode
railway variables set MAINTENANCE_MODE=false --service production-ainative-nextjs

# Verify service
curl https://ainative.studio/api/health
```

#### After Maintenance
1. Run smoke tests
2. Monitor error rates
3. Check performance metrics
4. Update status page
5. Post completion in Slack

### Database Maintenance

#### Backup Verification
```bash
# Create backup
railway backup create --service production-ainative-nextjs

# List backups
railway backup list --service production-ainative-nextjs

# Test restore (in staging)
railway backup restore [backup-id] --service staging-ainative-nextjs
```

#### Index Maintenance
```bash
# Connect to database
railway run --service production-ainative-nextjs -- psql $DATABASE_URL

# Check for missing indexes
SELECT schemaname, tablename, indexname, tablespace, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

# Rebuild indexes
REINDEX TABLE table_name;

# Analyze tables
ANALYZE VERBOSE;
```

### Dependency Updates

#### Security Updates
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Manual fixes for critical issues
npm update [package-name]

# Test thoroughly
npm run test:all
npm run build
```

#### Regular Updates (Monthly)
```bash
# Check for outdated packages
npm outdated

# Update minor versions
npm update

# Update major versions (carefully)
npm install [package-name]@latest

# Test thoroughly
npm run test:all
npm run build

# Deploy to staging first
```

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Application Metrics**
   - Request rate (requests/second)
   - Response time (p50, p95, p99)
   - Error rate (%)
   - Availability (%)

2. **Infrastructure Metrics**
   - CPU usage (%)
   - Memory usage (%)
   - Disk usage (%)
   - Network I/O

3. **Business Metrics**
   - User registrations
   - API key generations
   - Subscription conversions
   - Payment transactions

### Alert Configuration

#### Critical Alerts (P0)
- Site down (5xx errors)
- Database unavailable
- SSL certificate expiring (< 7 days)
- Memory > 95%

#### High Priority Alerts (P1)
- Error rate > 1%
- Response time > 2s (p95)
- CPU > 80%
- Memory > 85%

#### Medium Priority Alerts (P2)
- Error rate > 0.5%
- Response time > 1s (p95)
- Disk usage > 80%

## Post-Incident Review

### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

## Incident Summary
- **Date**: YYYY-MM-DD
- **Duration**: X hours
- **Severity**: P0/P1/P2
- **Impact**: X users affected

## Timeline
- HH:MM - Incident detected
- HH:MM - On-call engineer notified
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Root Cause
Detailed explanation of what caused the incident.

## Resolution
Steps taken to resolve the incident.

## Action Items
- [ ] Fix XYZ (Assigned to: Name, Due: Date)
- [ ] Improve monitoring for ABC (Assigned to: Name, Due: Date)
- [ ] Update runbook (Assigned to: Name, Due: Date)

## Lessons Learned
What we learned and how we can prevent similar incidents.
```

## Appendix

### Useful Commands Reference

```bash
# Railway CLI
railway login
railway link
railway status
railway logs
railway restart
railway rollback
railway backup create
railway variables

# npm Scripts
npm run dev
npm run build
npm run test
npm run test:all
npm run verify
npm run lint
npm run type-check

# Health Checks
curl https://ainative.studio/api/health
curl https://staging.ainative.studio/api/health

# Database
railway run --service production-ainative-nextjs -- psql $DATABASE_URL
railway run --service production-ainative-nextjs -- npm run db:migrate
railway run --service production-ainative-nextjs -- npm run db:status
```

### Escalation Matrix

| Severity | Response Time | Escalation Path |
|----------|--------------|-----------------|
| P0 - Critical | Immediate | On-call → Eng Lead → CTO |
| P1 - High | < 15 min | On-call → Eng Lead |
| P2 - Medium | < 30 min | On-call → Team |
| P3 - Low | < 2 hours | Regular work queue |
