# Pre-Deployment Testing Guide

This guide explains the comprehensive pre-deployment testing infrastructure designed to prevent production failures.

## Overview

The pre-deployment testing system catches issues **before** they reach production through:

1. **Build Validation Tests** - Catch missing files and broken imports
2. **Environment Variable Validation** - Ensure all required env vars are configured
3. **Configuration Validation** - Validate NextAuth, Next.js, and app configs
4. **Automated Smoke Tests** - Test deployed application functionality
5. **Deployment Confidence Scoring** - Quantify deployment readiness

## Quick Start

### Run All Pre-Deployment Tests Locally

```bash
# Run all deployment tests
npm run test:deployment

# Run with coverage
npm run test:deployment:coverage

# Run pre-deployment check script
npm run pre-deploy

# Run in strict mode (fail on warnings)
npm run pre-deploy:strict
```

### Run Individual Test Suites

```bash
# Build validation (missing files, imports)
npm test -- __tests__/deployment/build-validation.test.ts

# Environment variable validation
npm test -- __tests__/deployment/environment-validation.test.ts

# Configuration validation (NextAuth, Next.js)
npm test -- __tests__/deployment/config-validation.test.ts

# Smoke tests (requires running app)
SMOKE_TEST_URL=http://localhost:3000 npm test -- __tests__/deployment/smoke-tests.test.ts
```

## Test Suites

### 1. Build Validation Tests

**File:** `__tests__/deployment/build-validation.test.ts`

**What it catches:**
- Missing critical files (next.config.ts, lib/utils/thumbnail-generator.ts, etc.)
- Broken import paths
- Missing dependencies
- TypeScript compilation errors
- Invalid Next.js configuration
- Security vulnerabilities in dependencies

**Example failures prevented:**
```
✗ lib/utils/thumbnail-generator.ts is missing
✗ Cannot import slug-generator module
✗ Missing 'next-auth' dependency
✗ TypeScript compilation failed with 15 errors
```

**When to run:**
- Before every commit
- In CI pipeline on every PR
- Before production deployment

### 2. Environment Variable Validation

**File:** `__tests__/deployment/environment-validation.test.ts`

**What it catches:**
- Missing required environment variables
- Invalid format (URLs, secrets, API keys)
- Short/weak secrets
- HTTP URLs in production (should be HTTPS)
- Test API keys in production
- Exposed server-side variables

**Example failures prevented:**
```
✗ NEXTAUTH_SECRET is not set
✗ NEXTAUTH_SECRET has invalid format (too short)
✗ NEXT_PUBLIC_API_URL must use HTTPS in production
⚠ Using Stripe test key in production
```

**Environment variables validated:**
- `NEXT_PUBLIC_API_URL` - Must be valid HTTPS URL
- `NEXTAUTH_SECRET` - Min 32 characters
- `NEXTAUTH_URL` - Must be valid URL
- `DATABASE_URL` - Must be PostgreSQL URL
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**When to run:**
- Before deployment to any environment
- When changing .env files
- In CI pipeline with production secrets

### 3. Configuration Validation

**File:** `__tests__/deployment/config-validation.test.ts`

**What it catches:**
- NextAuth missing `secret` property (CRITICAL - causes crashes)
- Missing authentication providers
- Invalid session configuration
- Missing security headers in Next.js config
- Wrong output mode for Railway
- Missing CSRF protection
- Insecure cookie settings

**Example failures prevented:**
```
✗ NextAuth secret is required
✗ Missing JWT and session callbacks
✗ Next.js must use standalone output for Railway
✗ Missing X-Frame-Options header
✗ httpOnly cookies not enabled
```

**Configurations validated:**

**NextAuth:**
- `secret` property is set
- Providers are configured
- Session strategy is correct
- Callbacks (jwt, session) exist
- Security headers configured
- CSRF protection enabled

**Next.js:**
- `output: 'standalone'` for Railway
- `reactStrictMode: true`
- `poweredByHeader: false`
- Security headers configured
- Image optimization configured

**When to run:**
- After changing auth configuration
- After changing Next.js config
- Before production deployment
- In CI pipeline

### 4. Smoke Tests

**File:** `__tests__/deployment/smoke-tests.test.ts`

**What it tests:**
- Application is reachable
- Homepage loads successfully
- Static assets (favicon, etc.) load
- API endpoints respond
- Authentication endpoints work
- Error pages render correctly
- Security headers are present
- Response times are acceptable
- No stack traces exposed

**Example failures detected:**
```
✗ Homepage returned status 502
✗ Missing X-Frame-Options header
✗ Stack traces exposed in error responses
✗ Average response time 5000ms (too slow)
```

**When to run:**
- After deployment to staging/production
- During deployment verification
- After infrastructure changes
- Manual health checks

**Usage:**
```bash
# Test local development
SMOKE_TEST_URL=http://localhost:3000 npm test -- __tests__/deployment/smoke-tests.test.ts

# Test staging
SMOKE_TEST_URL=https://staging.ainative.studio npm test -- __tests__/deployment/smoke-tests.test.ts

# Test production
SMOKE_TEST_URL=https://www.ainative.studio npm test -- __tests__/deployment/smoke-tests.test.ts
```

## Deployment Scripts

### Pre-Deployment Check Script

**File:** `scripts/pre-deployment-check.ts`

Comprehensive validation script that runs all checks and provides a deployment confidence score.

**Usage:**
```bash
# Normal mode (fail on critical errors only)
npm run pre-deploy

# Strict mode (fail on warnings too)
npm run pre-deploy:strict
```

**Exit codes:**
- `0` - All checks passed, safe to deploy
- `1` - Critical errors found, do NOT deploy
- `2` - Warnings found (strict mode only)

**Example output:**
```
🚀 Pre-Deployment Validation
================================

📁 Checking critical files...
✓ next.config.ts exists
✓ lib/auth/options.ts exists
✓ lib/utils/thumbnail-generator.ts exists

🔐 Validating environment variables...
✓ NEXT_PUBLIC_API_URL is valid
✓ NEXTAUTH_SECRET is valid
⚠ Sentry error monitoring not configured

⚙️  Validating Next.js configuration...
✓ Has standalone output mode
✓ Has React strict mode

📊 Validation Summary
✓ Passed: 15
✗ Failed: 0
⚠ Warnings: 1

📈 Deployment Confidence Score: 95%

✅ All pre-deployment checks passed! Safe to deploy.
```

### Post-Deployment Verification Script

**File:** `scripts/post-deployment-verify.ts`

Verifies a deployed application is working correctly.

**Usage:**
```bash
# Verify production (default)
npm run post-deploy-verify

# Verify specific URL
npm run post-deploy-verify -- --url https://staging.ainative.studio
```

**What it checks:**
- Application reachability
- Response times
- Security headers
- Static asset loading
- Authentication endpoints
- Error handling
- Compression enabled
- No stack traces exposed

**Exit codes:**
- `0` - Deployment is healthy
- `1` - Critical issues found

**Example output:**
```
🚀 Post-Deployment Verification
🎯 Target: https://www.ainative.studio
================================

🌐 Testing application reachability...
✓ Application is reachable (234ms)

⚡ Testing response time...
✓ Fast response time (234ms)

🛡️  Testing security headers...
✓ X-Frame-Options header is set
✓ Strict-Transport-Security header is set

📊 Verification Results
✓ Passed: 12
✗ Failed: 0
⚠ Warnings: 1

📈 Deployment Health Score: 95%
🏥 Status: ✅ HEALTHY

✅ Deployment verification PASSED!
```

## CI/CD Integration

### GitHub Actions Workflows

Two workflows are provided for automated testing:

#### 1. Pre-Deployment Validation

**File:** `.github/workflows/pre-deployment-validation.yml`

**Triggers:**
- Pull requests to `main`
- Pushes to `main`
- Manual workflow dispatch

**Jobs:**
1. **Build Validation** - Runs build validation tests
2. **Environment Validation** - Validates env vars with production secrets
3. **Config Validation** - Validates configurations
4. **Pre-Deployment Check** - Runs full pre-deployment check script
5. **Deployment Confidence Score** - Calculates and reports confidence score
6. **Deployment Gate** - Blocks deployment if score < 60%

**PR Comments:**
The workflow automatically comments on PRs with the deployment confidence score:

```markdown
## ✅ Deployment Confidence Score: 95%

**Status:** READY TO DEPLOY

### Validation Results
- ✅ Passed: 15
- ❌ Failed: 0

### Details
- Build Validation: success
- Environment Validation: success
- Config Validation: success
- Pre-Deployment Check: success
```

#### 2. Post-Deployment Verification

**File:** `.github/workflows/post-deployment-verify.yml`

**Triggers:**
- Manual workflow dispatch (after deployment)

**Jobs:**
1. **Smoke Tests** - Runs smoke tests against deployed URL
2. **Post-Deployment Verification** - Runs full verification script
3. **Notify Deployment Status** - Creates summary and notifications

**Usage:**
```bash
# Via GitHub Actions UI
Actions -> Post-Deployment Verification -> Run workflow
  - deployment_url: https://www.ainative.studio
  - environment: production
```

## Deployment Confidence Scoring

The deployment confidence score is calculated based on:

1. **Build Validation** (25 points)
   - All critical files exist
   - All imports resolve
   - TypeScript compiles
   - No critical vulnerabilities

2. **Environment Validation** (25 points)
   - All required env vars set
   - Correct format/pattern
   - HTTPS in production
   - No test keys in production

3. **Configuration Validation** (25 points)
   - NextAuth properly configured
   - Next.js properly configured
   - Security settings correct

4. **Pre-Deployment Checks** (25 points)
   - All validation scripts pass
   - No critical warnings

**Score Interpretation:**
- **90-100%** - ✅ Excellent - Safe to deploy
- **80-89%** - ✅ Good - Safe to deploy
- **60-79%** - ⚠️ Fair - Deploy with caution
- **0-59%** - ❌ Poor - Do NOT deploy

## Best Practices

### Before Every Deployment

1. **Run pre-deployment check locally:**
   ```bash
   npm run pre-deploy:strict
   ```

2. **Review the confidence score** - Should be ≥80%

3. **Fix all critical errors** before proceeding

4. **Address warnings** if possible

### After Every Deployment

1. **Run post-deployment verification:**
   ```bash
   npm run post-deploy-verify
   ```

2. **Verify health score** - Should be ≥80%

3. **Monitor for 5-10 minutes** for errors

4. **Check error tracking** (Sentry) for issues

### In CI/CD Pipeline

1. **Block deployment if confidence < 80%**

2. **Require manual approval for 60-79%**

3. **Auto-verify after deployment**

4. **Alert on verification failures**

## Common Issues and Solutions

### Issue: "Missing NEXTAUTH_SECRET"

**Cause:** Environment variable not set or not loaded

**Solution:**
```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET=your_generated_secret_here
```

### Issue: "TypeScript compilation errors"

**Cause:** Type errors in code

**Solution:**
```bash
# Run type check to see errors
npm run type-check

# Fix errors or update tsconfig
# Note: next.config.ts has ignoreBuildErrors: true for gradual migration
```

### Issue: "Stack traces exposed in production"

**Cause:** Error handling not catching exceptions

**Solution:**
- Wrap API routes in try-catch
- Use error boundaries in React components
- Set `NODE_ENV=production`

### Issue: "Slow response times"

**Cause:** Performance issues, database queries, external APIs

**Solution:**
- Profile with Next.js build analyzer
- Optimize images
- Add caching
- Use CDN for static assets

## Integration with Existing CI

The new pre-deployment validation workflow is **additive** and doesn't replace existing CI:

**Existing CI** (`ci.yml`):
- Linting
- Type checking
- Unit tests
- E2E tests
- Build

**New Pre-Deployment Validation** (`pre-deployment-validation.yml`):
- Build validation
- Environment validation
- Configuration validation
- Deployment confidence scoring
- Deployment gates

**Relationship:**
```
┌─────────────────┐
│   Code Change   │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│   Standard CI   │                  │  Pre-Deploy     │
│  - Lint         │                  │  Validation     │
│  - Type Check   │                  │  - Build Valid  │
│  - Unit Tests   │                  │  - Env Valid    │
│  - E2E Tests    │                  │  - Config Valid │
│  - Build        │                  │  - Confidence   │
└────────┬────────┘                  └────────┬────────┘
         │                                     │
         └─────────────────┬───────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Deployment Gate │
                  │  (Score ≥ 80%)  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │     Deploy      │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Post-Deploy    │
                  │  Verification   │
                  └─────────────────┘
```

## Test Coverage Requirements

All deployment test suites must maintain ≥80% coverage:

```bash
# Check coverage
npm run test:deployment:coverage

# Coverage report
File                              | % Stmts | % Branch | % Funcs | % Lines
----------------------------------|---------|----------|---------|--------
build-validation.test.ts          |   95.2  |   89.4   |   100   |   94.8
environment-validation.test.ts    |   92.1  |   87.5   |   100   |   91.9
config-validation.test.ts         |   88.7  |   82.3   |   97.2  |   88.5
smoke-tests.test.ts              |   85.4  |   79.1   |   93.8  |   85.2
----------------------------------|---------|----------|---------|--------
Total                            |   90.4  |   84.6   |   97.8  |   90.1
```

## Maintenance

### Adding New Validation Tests

1. Create test file in `__tests__/deployment/`
2. Follow existing patterns
3. Add to `test:deployment` script
4. Update this documentation
5. Add to CI workflow if needed

### Updating Environment Variables

When adding new required env vars:

1. Add to `ENV_REGISTRY` in `environment-validation.test.ts`
2. Add to `.env.example`
3. Document in this guide
4. Update CI workflow secrets

### Updating Configuration Checks

When changing configs (NextAuth, Next.js):

1. Update validation tests in `config-validation.test.ts`
2. Update pre-deployment check script
3. Test locally before committing

## References

- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Next.js Configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction)
- [Railway Deployment](https://docs.railway.app/deploy/deployments)
- [Jest Testing](https://jestjs.io/docs/getting-started)

## Support

If you encounter issues with the deployment testing:

1. Check this documentation first
2. Review test output for specific errors
3. Check GitHub Actions logs
4. Open an issue with deployment test logs
