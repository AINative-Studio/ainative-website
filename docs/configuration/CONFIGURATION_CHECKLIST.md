# Configuration Validation Checklist

## Pre-Deployment Checklist

Use this checklist before deploying to any environment.

### Environment Variables

#### Critical Configuration
- [ ] `NODE_ENV` is set correctly (`development`, `production`, or `test`)
- [ ] `NEXTAUTH_SECRET` is configured (minimum 32 characters)
- [ ] `NEXTAUTH_URL` is configured with correct domain
- [ ] `DATABASE_URL` is configured with valid PostgreSQL connection string

#### NextAuth Configuration
- [ ] `NEXTAUTH_SECRET` is at least 32 characters long
- [ ] `NEXTAUTH_SECRET` is unique per environment
- [ ] `NEXTAUTH_URL` uses HTTPS in production
- [ ] `NEXTAUTH_URL` does not contain localhost in production
- [ ] GitHub OAuth credentials are configured
- [ ] GitHub OAuth credentials are not empty strings

#### Database Configuration
- [ ] `DATABASE_URL` uses `postgresql://` or `postgres://` protocol
- [ ] Database connection string includes username
- [ ] Database connection string includes password
- [ ] Database connection string includes host
- [ ] Database connection string includes database name
- [ ] Using PgBouncer port (6432) in production (Railway)
- [ ] SSL configuration present in production (`?sslmode=require`)
- [ ] Connection pool size is appropriate (`DATABASE_POOL_SIZE`)

#### API Configuration
- [ ] `NEXT_PUBLIC_API_BASE_URL` is configured
- [ ] API URL uses HTTPS in production
- [ ] API timeout is reasonable (default: 15000ms)

#### Payment Configuration (If Using Stripe)
- [ ] `STRIPE_SECRET_KEY` is configured
- [ ] `STRIPE_SECRET_KEY` starts with `sk_`
- [ ] `STRIPE_WEBHOOK_SECRET` is configured
- [ ] `STRIPE_WEBHOOK_SECRET` starts with `whsec_`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is configured
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_`
- [ ] Using live keys in production (`sk_live_`, `pk_live_`)
- [ ] Using test keys in development (`sk_test_`, `pk_test_`)

#### External Services (Optional)
- [ ] `OPENAI_API_KEY` configured if using OpenAI
- [ ] `ANTHROPIC_API_KEY` configured if using Anthropic Claude
- [ ] `ZERODB_API_KEY` configured if using ZeroDB
- [ ] `REDIS_URL` configured if using Redis
- [ ] `LUMA_API_KEY` configured if using Luma Events

#### Analytics (Optional)
- [ ] `NEXT_PUBLIC_GA_ID` configured if using Google Analytics
- [ ] `NEXT_PUBLIC_GTM_ID` configured if using Google Tag Manager
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` configured if using Meta Pixel
- [ ] `NEXT_PUBLIC_SENTRY_DSN` configured if using Sentry
- [ ] `SENTRY_AUTH_TOKEN` configured for source map uploads

### Code Configuration

#### NextAuth Setup
- [ ] `authOptions` object is properly configured
- [ ] At least one provider is configured
- [ ] Session strategy matches infrastructure (database vs JWT)
- [ ] Database adapter is configured if using database sessions
- [ ] Cookie settings are appropriate for environment
- [ ] `useSecureCookies` is true in production
- [ ] Custom pages are configured (sign in, error, etc.)
- [ ] Callbacks are implemented correctly
- [ ] Events are configured for audit logging

#### Prisma Setup
- [ ] `schema.prisma` file exists and is valid
- [ ] Prisma Client is generated (`npx prisma generate`)
- [ ] Database schema is synchronized
- [ ] Migrations are applied (if using migrations)
- [ ] Connection pool is configured appropriately
- [ ] Logging is configured correctly for environment

#### Middleware Setup
- [ ] Protected routes are defined
- [ ] Auth routes are defined
- [ ] Middleware matcher is configured correctly
- [ ] Cookie name matches auth configuration

### Testing

#### Automated Tests
- [ ] All configuration tests pass
- [ ] Environment validation tests pass
- [ ] NextAuth validation tests pass
- [ ] Prisma validation tests pass
- [ ] Test coverage >= 80%

#### Manual Validation
- [ ] Run `npm run validate:config` successfully
- [ ] Review all validation warnings
- [ ] Test authentication flow in target environment
- [ ] Test database connectivity
- [ ] Test external API integrations
- [ ] Test payment processing (if applicable)

### Security

#### Secrets Management
- [ ] No secrets in code
- [ ] No secrets in version control
- [ ] Secrets stored in secure environment variable system
- [ ] Different secrets for each environment
- [ ] Secrets rotated regularly
- [ ] Access to secrets is restricted

#### Cookie Security
- [ ] Secure cookies enabled in production
- [ ] HttpOnly flag enabled
- [ ] SameSite attribute configured
- [ ] Cookie domain configured correctly for subdomains
- [ ] CSRF protection enabled

#### Database Security
- [ ] Database password is strong (16+ characters)
- [ ] SSL/TLS enabled for database connections
- [ ] Database access restricted by IP/network
- [ ] Connection pooling configured
- [ ] Sensitive data encrypted at rest

### Production-Specific

#### Infrastructure
- [ ] Application deployed to production environment
- [ ] Database is production instance (not development)
- [ ] Load balancer/CDN configured
- [ ] DNS records configured
- [ ] SSL certificate installed and valid
- [ ] Monitoring and alerting configured

#### Performance
- [ ] Database connection pool sized appropriately
- [ ] Using PgBouncer for connection pooling
- [ ] API timeouts configured
- [ ] Caching configured (if applicable)
- [ ] Static assets cached with appropriate headers

#### Monitoring
- [ ] Application logs are collected
- [ ] Error tracking is configured (Sentry)
- [ ] Performance monitoring is enabled
- [ ] Database query performance is monitored
- [ ] Alerts configured for critical errors

### Post-Deployment

#### Verification
- [ ] Application is accessible at configured URL
- [ ] Health check endpoint responds correctly
- [ ] Authentication flow works end-to-end
- [ ] Database queries execute successfully
- [ ] External API calls work
- [ ] Payment processing works (if applicable)
- [ ] Analytics are tracking correctly

#### Monitoring
- [ ] Check application logs for errors
- [ ] Check database connection pool status
- [ ] Monitor API response times
- [ ] Monitor error rates
- [ ] Review security logs

## Quick Reference Commands

### Generate NextAuth Secret
```bash
openssl rand -base64 32
```

### Validate Configuration
```bash
npm run validate:config
```

### Run Configuration Tests
```bash
npm test -- __tests__/lib/config/
```

### Check Database Connection
```bash
npx prisma db pull --preview-feature
```

### Generate Prisma Client
```bash
npx prisma generate
```

### View Prisma Studio
```bash
npx prisma studio
```

### Check Environment Variables
```bash
# In your application
node -e "console.log(process.env)"

# Or use validation script
npm run validate:config
```

## Environment-Specific Checklists

### Development Environment

**Must Have:**
- [ ] `NEXTAUTH_SECRET` (can be any 32+ char string)
- [ ] `NEXTAUTH_URL=http://localhost:3000`
- [ ] `DATABASE_URL` (can be local PostgreSQL)
- [ ] GitHub OAuth app (development credentials)

**Should Have:**
- [ ] Test Stripe keys
- [ ] Development API endpoints
- [ ] Debug logging enabled

**Can Skip:**
- Analytics services
- Production monitoring
- SSL certificates

### Staging Environment

**Must Have:**
- [ ] All development requirements
- [ ] Unique `NEXTAUTH_SECRET` (different from dev)
- [ ] Staging-specific `NEXTAUTH_URL`
- [ ] Staging database (separate from production)
- [ ] Test payment processor keys

**Should Have:**
- [ ] Monitoring and logging
- [ ] Error tracking
- [ ] Performance monitoring

**Can Skip:**
- Production API keys
- Live payment processing
- Production analytics

### Production Environment

**Must Have:**
- [ ] Strong `NEXTAUTH_SECRET` (32+ chars, generated securely)
- [ ] Production `NEXTAUTH_URL` with HTTPS
- [ ] Production database with SSL
- [ ] PgBouncer connection pooling (Railway)
- [ ] Production GitHub OAuth app
- [ ] Live Stripe keys (if applicable)
- [ ] SSL certificate

**Should Have:**
- [ ] All monitoring services
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Analytics (GA, GTM, etc.)
- [ ] Security headers
- [ ] Rate limiting

**Must Not Have:**
- Test/development API keys
- Localhost URLs
- Debug logging to console
- Development secrets

## Troubleshooting

### Configuration Fails Validation

**Symptom:** `npm run validate:config` exits with errors

**Steps:**
1. Read error messages carefully
2. Check corresponding environment variable
3. Verify format matches requirements
4. Regenerate if necessary (e.g., secrets)
5. Re-run validation

### Application Fails to Start

**Symptom:** Application crashes on startup with configuration error

**Steps:**
1. Check startup logs for specific error
2. Verify all required environment variables are set
3. Verify environment variables are loaded (check .env file path)
4. Run validation script: `npm run validate:config`
5. Fix reported issues
6. Restart application

### Authentication Not Working

**Symptom:** Users cannot sign in

**Steps:**
1. Verify `NEXTAUTH_SECRET` is set
2. Verify `NEXTAUTH_URL` matches actual application URL
3. Verify OAuth credentials are correct
4. Check database connectivity
5. Review NextAuth debug logs
6. Test OAuth callback URL accessibility

### Database Connection Issues

**Symptom:** Database queries fail

**Steps:**
1. Verify `DATABASE_URL` is correct
2. Test database connectivity independently
3. Check connection pool status
4. Verify SSL configuration
5. Check firewall rules
6. Review database logs

## Additional Resources

- [Configuration Validation Guide](./CONFIGURATION_VALIDATION_GUIDE.md)
- [NextAuth Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Railway Troubleshooting](../deployment/RAILWAY_TROUBLESHOOTING.md)

## Updates

Last Updated: 2026-02-08

**Version:** 1.0.0

**Next Review:** 2026-03-08 (or when configuration changes)
