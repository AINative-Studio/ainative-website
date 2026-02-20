# Deployment Safety Guide

**Purpose:** Ensure zero-defect deployments by following comprehensive validation procedures.

**Context:** Created after Production NextAuth Outage (Feb 8, 2026) - see `docs/incidents/2026-02-08-nextauth-production-outage.md`

---

## Quick Reference

| Check | Command | Expected Result |
|-------|---------|-----------------|
| **Import Validation** | See below | No missing files |
| **Environment Variables** | `./scripts/validate-env-vars.sh` | ✅ VALIDATION PASSED |
| **TypeScript** | `npx tsc --noEmit` | No errors |
| **Build** | `npm run build` | Build succeeds |
| **Tests** | `npm test` | All tests pass |
| **Production Health** | `curl -I https://www.ainative.studio/` | HTTP 200 |

---

## Pre-Deployment Checklist

### 1. Code Quality Gates

```bash
# Run all checks in sequence
npx tsc --noEmit && \
npm run lint && \
npm run test:coverage -- --passWithNoTests && \
npm run build && \
./scripts/validate-env-vars.sh

# If all succeed, you'll see:
# ✅ TypeScript validation passed
# ✅ Lint check passed
# ✅ Tests passed with >80% coverage
# ✅ Build succeeded
# ✅ VALIDATION PASSED: All environment variables are properly configured
```

### 2. Import Validation

```bash
# Check for missing imported files
grep -rh "^import.*from ['\"]@/" app/ lib/ --include="*.ts" --include="*.tsx" | \
  sed "s/.*from ['\"]@\/\([^'\"]*\)['\"].*/\1/" | \
  sort -u | while read path; do
    if [[ ! -f "${path}.ts" && ! -f "${path}.tsx" && ! -f "${path}/index.ts" && ! -f "${path}/index.tsx" ]]; then
      echo "❌ Missing: $path"
    fi
  done

# Expected: No output (all imports valid)
```

### 3. Git Status Validation

```bash
# Check for uncommitted changes in critical paths
git status --short | grep -E "(lib/auth/|lib/utils/|app/api/|\.env\.example|package\.json)"

# Expected: No output (all critical files committed)
```

### 4. Environment Variables

```bash
# Run comprehensive validation
./scripts/validate-env-vars.sh

# Expected output:
# ✅ VALIDATION PASSED: All environment variables are properly configured
```

---

## Automated Protection Layers

### Layer 1: Pre-Commit Hook (`.husky/pre-commit`)

Runs automatically on every commit:

1. ✅ Import validation - catches missing files
2. ✅ TypeScript compilation - catches type errors
3. ✅ Lint check - enforces code style
4. ✅ Test suite - ensures coverage ≥80%
5. ✅ Build verification - ensures code compiles

**If any check fails, commit is blocked.**

### Layer 2: Pre-Push Validation

Run manually before pushing:

```bash
npx tsc --noEmit && npm run build && ./scripts/validate-env-vars.sh
```

### Layer 3: CI/CD Pipeline (GitHub Actions)

When operational, runs on every PR:

1. Install dependencies
2. Import validation
3. Environment variable validation
4. Lint check
5. Type checking
6. Unit tests with coverage
7. Build verification
8. Smoke tests

**See:** `.claude/commands/ci-cd-compliance.md`

---

## Critical File Checklist

Before deploying changes to these files, extra validation is required:

| File/Directory | Risk Level | Validation Required |
|----------------|------------|---------------------|
| `lib/auth/options.ts` | CRITICAL | Manual review + env var check |
| `lib/utils/*` | HIGH | Import validation |
| `app/api/**/*` | HIGH | Build verification |
| `.env.example` | MEDIUM | Document all new variables |
| `package.json` | MEDIUM | Dependency audit |

---

## Railway Deployment Procedure

### Pre-Deployment

1. **Verify all checks pass**
   ```bash
   npm run build && ./scripts/validate-env-vars.sh
   ```

2. **Check Railway environment variables**
   - Go to Railway dashboard → Service settings → Variables
   - Verify all variables from `.env.example` are set
   - Critical variables:
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL`
     - `DATABASE_URL`
     - `NEXT_PUBLIC_API_URL`

3. **Review recent commits**
   ```bash
   git log --oneline -5
   ```

4. **Check for uncommitted critical files**
   ```bash
   git status --short
   ```

### Deployment

1. **Push to main branch**
   ```bash
   git push origin main
   ```

2. **Monitor Railway build logs**
   - Watch for errors in build output
   - Verify no "Module not found" errors
   - Verify no environment variable errors

3. **Wait for deployment to complete**
   - Railway will show "Deployed" status
   - Build typically takes 2-3 minutes

### Post-Deployment Validation

1. **Health check**
   ```bash
   curl -I https://www.ainative.studio/
   # Expected: HTTP/2 200
   ```

2. **API health check**
   ```bash
   curl -I https://www.ainative.studio/api/health
   # Expected: HTTP/2 200
   ```

3. **NextAuth check**
   ```bash
   curl -I https://www.ainative.studio/api/auth/session
   # Expected: HTTP/2 200
   ```

4. **Visual verification**
   - Open https://www.ainative.studio/ in browser
   - Verify homepage loads correctly
   - Check navigation works
   - Test authentication flow (if applicable)

---

## Failure Scenarios and Fixes

### Scenario 1: Build Fails with "Module not found"

**Symptom:**
```
Module not found: Can't resolve '@/lib/utils/some-file'
```

**Root Cause:** File not committed to git

**Fix:**
```bash
# Add missing file
git add lib/utils/some-file.ts
git commit -m "Add missing utility file"
git push origin main
```

**Prevention:** Pre-commit hook now validates all imports

---

### Scenario 2: Runtime Error - "Missing secret in NextAuth"

**Symptom:**
```
[NextAuth][error] Missing secret in configuration
```

**Root Cause:** `NEXTAUTH_SECRET` not set in Railway or code

**Fix:**

1. **Code fix** (if missing in `lib/auth/options.ts`):
   ```typescript
   export const authOptions: NextAuthOptions = {
     secret: process.env.NEXTAUTH_SECRET, // ADD THIS
     // ...
   }
   ```

2. **Railway env var fix**:
   - Go to Railway dashboard
   - Service settings → Variables
   - Add: `NEXTAUTH_SECRET=<generate-random-32-char-string>`

**Prevention:** `validate-env-vars.sh` checks for required variables

---

### Scenario 3: Environment Variables Not Documented

**Symptom:**
```
⚠ NEXT_PUBLIC_NEW_VAR used in code but not in .env.example
```

**Root Cause:** New variable added without documentation

**Fix:**
```bash
# Add to .env.example
echo "NEXT_PUBLIC_NEW_VAR=your-value-here" >> .env.example
git add .env.example
git commit -m "Document new environment variable"
```

**Prevention:** `validate-env-vars.sh` scans code and compares to `.env.example`

---

## Emergency Rollback

If production is broken:

1. **Immediate revert**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Check Railway logs**
   ```bash
   # If Railway CLI installed
   railway logs --service 410afe5c-7419-408f-91a9-f6b658ea158a
   ```

3. **Verify rollback succeeded**
   ```bash
   curl -I https://www.ainative.studio/
   # Should return HTTP 200
   ```

4. **Fix root cause in new branch**
   ```bash
   git checkout -b bug/fix-deployment-issue
   # Make fixes
   # Test thoroughly
   # Create PR
   ```

---

## Validation Commands Reference

### Quick Pre-Push Validation
```bash
npx tsc --noEmit && npm run build && ./scripts/validate-env-vars.sh
```

### Full Deployment Readiness Check
```bash
# See: .claude/commands/deployment-readiness.md
# Or run: /deployment-readiness
```

### Import Validation Only
```bash
grep -rh "^import.*from ['\"]@/" app/ lib/ --include="*.ts" --include="*.tsx" | \
  sed "s/.*from ['\"]@\/\([^'\"]*\)['\"].*/\1/" | sort -u | while read path; do
    [[ ! -f "${path}.ts" && ! -f "${path}.tsx" && ! -f "${path}/index.ts" ]] && echo "Missing: $path"
  done
```

### Environment Variable Validation Only
```bash
./scripts/validate-env-vars.sh
```

---

## Related Documentation

- **Incident Post-Mortem:** `docs/incidents/2026-02-08-nextauth-production-outage.md`
- **Deployment Readiness:** `.claude/commands/deployment-readiness.md`
- **CI/CD Compliance:** `.claude/commands/ci-cd-compliance.md`
- **Git Workflow:** `.claude/commands/git-workflow.md`

---

## Contact and Escalation

If deployment fails and you cannot resolve:

1. Check incident post-mortem for similar issues
2. Review Railway logs for error details
3. Check environment variables in Railway dashboard
4. Verify all files are committed to git
5. Escalate to DevOps/SRE team if needed

**Remember:** The goal is ZERO production failures. When in doubt, validate twice, deploy once.
