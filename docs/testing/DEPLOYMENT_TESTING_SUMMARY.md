# Deployment Testing - Quick Reference

## TL;DR

Run this before EVERY deployment:

```bash
npm run pre-deploy
```

If confidence score ≥80%, you're good to deploy. Otherwise, fix the errors.

After deployment:

```bash
npm run post-deploy-verify
```

---

## Quick Commands

### Before Deployment
```bash
# Quick pre-deployment check
npm run pre-deploy

# Strict mode (fail on warnings)
npm run pre-deploy:strict

# Run all deployment tests
npm run test:deployment

# Run with coverage
npm run test:deployment:coverage
```

### After Deployment
```bash
# Verify production (default)
npm run post-deploy-verify

# Verify specific environment
npm run post-deploy-verify -- --url https://staging.ainative.studio
```

### Type Checking
```bash
# Run TypeScript type check
npm run type-check
```

---

## What Gets Tested

### Build Validation ✅
- Critical files exist (next.config.ts, lib/utils/*, auth files)
- All imports resolve correctly
- Dependencies are installed
- TypeScript compiles
- No critical security vulnerabilities

### Environment Validation ✅
- All required env vars are set
- Correct format (URLs must be https://, secrets ≥32 chars)
- No test keys in production
- HTTPS enforced in production

### Configuration Validation ✅
- NextAuth has `secret` property
- NextAuth has providers configured
- Next.js uses standalone output
- Security headers configured
- Cookie settings are secure

### Smoke Tests (Post-Deploy) ✅
- Application is reachable
- Pages load correctly
- API endpoints work
- Security headers present
- No stack traces exposed
- Response times acceptable

---

## Deployment Confidence Scores

| Score | Status | Action |
|-------|--------|--------|
| 90-100% | ✅ Excellent | Deploy with confidence |
| 80-89% | ✅ Good | Deploy (minor warnings acceptable) |
| 60-79% | ⚠️ Fair | Fix warnings before deploying |
| 0-59% | ❌ Poor | **DO NOT DEPLOY** - Critical errors |

---

## What Issues Are Prevented

### Missing Files (CRITICAL)
```
✗ lib/utils/thumbnail-generator.ts is missing
✗ lib/utils/slug-generator.ts is missing
```
**Impact:** Build fails, app crashes

### NextAuth Misconfiguration (CRITICAL)
```
✗ NextAuth secret is required
```
**Impact:** Authentication broken, app crashes

### Environment Variables (CRITICAL)
```
✗ NEXTAUTH_SECRET is not set
✗ NEXT_PUBLIC_API_URL must use HTTPS in production
```
**Impact:** Runtime errors, API failures

### Configuration Errors (HIGH)
```
✗ Next.js must use standalone output for Railway
✗ Missing X-Frame-Options security header
```
**Impact:** Deployment fails or security vulnerabilities

---

## CI/CD Integration

### Automated Checks (GitHub Actions)

**Pre-Deployment Validation** (runs on every PR/push):
- Build validation
- Environment validation
- Configuration validation
- Deployment confidence scoring
- Automatic deployment gate (blocks if score < 60%)

**Post-Deployment Verification** (manual trigger):
- Smoke tests
- Full deployment verification
- Health score report

### PR Comments

GitHub Actions automatically comments on PRs with deployment confidence:

```markdown
## ✅ Deployment Confidence Score: 95%

**Status:** READY TO DEPLOY

### Validation Results
- ✅ Passed: 18
- ❌ Failed: 0

### Details
- Build Validation: success
- Environment Validation: success
- Config Validation: success
```

---

## Common Issues & Solutions

### "Missing NEXTAUTH_SECRET"
```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env
echo "NEXTAUTH_SECRET=<generated_secret>" >> .env
```

### "TypeScript compilation errors"
```bash
# See all errors
npm run type-check

# Note: next.config.ts has ignoreBuildErrors: true for gradual migration
```

### "Deployment confidence score too low"
```bash
# Run in verbose mode to see all issues
npm run pre-deploy:strict
```

---

## File Locations

### Test Files
- `__tests__/deployment/build-validation.test.ts`
- `__tests__/deployment/environment-validation.test.ts`
- `__tests__/deployment/config-validation.test.ts`
- `__tests__/deployment/smoke-tests.test.ts`

### Scripts
- `scripts/pre-deployment-check.ts`
- `scripts/post-deployment-verify.ts`

### CI/CD
- `.github/workflows/pre-deployment-validation.yml`
- `.github/workflows/post-deployment-verify.yml`

### Documentation
- `docs/testing/PRE_DEPLOYMENT_TESTING_GUIDE.md` (Full guide)
- `docs/testing/QA_COMPREHENSIVE_REPORT.md` (Complete QA report)
- `docs/testing/DEPLOYMENT_TESTING_SUMMARY.md` (This file)

---

## Support

**Questions?** Check the [full guide](./PRE_DEPLOYMENT_TESTING_GUIDE.md)

**Issues?** Check the [QA report](./QA_COMPREHENSIVE_REPORT.md)

**Need help?** Open an issue with:
1. Output from `npm run pre-deploy`
2. Deployment confidence score
3. Specific error messages
