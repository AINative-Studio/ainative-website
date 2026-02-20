# Configuration Validation Guide

## Overview

This guide explains the comprehensive configuration validation system implemented to prevent production failures due to misconfigured environment variables and application settings.

## Background

The system was created in response to Issue: NextAuth production failure due to missing `NEXTAUTH_SECRET` configuration. The original error:

```
[next-auth][error][NO_SECRET] Please define a `secret` in production
```

This validation system ensures all required configuration is validated at build/startup time, not runtime.

## Architecture

### Components

1. **Environment Variable Validation** (`lib/config/env.validation.ts`)
   - Validates all environment variables using Zod schemas
   - Provides type-safe configuration objects
   - Generates helpful error messages

2. **NextAuth Validation** (`lib/config/nextauth.validation.ts`)
   - Validates NextAuth-specific configuration
   - Checks providers, session strategy, cookies, JWT settings
   - Production-specific validation rules

3. **Prisma Validation** (`lib/config/prisma.validation.ts`)
   - Validates database connection strings
   - Checks connection pool configuration
   - Railway/PgBouncer-specific validations

4. **Validation Script** (`scripts/validate-config.ts`)
   - Comprehensive pre-deployment validation
   - Runs all validators
   - Exits with error code on failure

## Required Environment Variables

### Critical (Application Will Not Start Without These)

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=<min-32-chars>  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=<app-url>          # e.g., https://www.ainative.studio

# Database Configuration
DATABASE_URL=postgresql://...   # PostgreSQL connection string

# OAuth Providers (if GitHub provider is enabled)
GITHUB_CLIENT_ID=<client-id>
GITHUB_CLIENT_SECRET=<secret>
```

### Important (Application May Run But Features Will Fail)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.ainative.studio

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Optional (Feature-Specific)

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://...

# External Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ZERODB_API_KEY=...
```

## Validation Rules

### NextAuth Configuration

#### Secret Validation
- **Rule**: Must be at least 32 characters
- **Production**: Must be explicitly set (not generated)
- **Error Message**: "NEXTAUTH_SECRET must be at least 32 characters long"
- **Fix**: Run `openssl rand -base64 32`

#### URL Validation
- **Rule**: Must be valid URL format
- **Production**: Must use HTTPS
- **Production**: Cannot be localhost
- **Error Message**: "NEXTAUTH_URL must use HTTPS in production"

#### Provider Validation
- **Rule**: At least one provider required
- **GitHub Provider**: CLIENT_ID and CLIENT_SECRET required
- **Error Message**: "GitHub provider is configured but GITHUB_CLIENT_ID is not set"
- **Warning**: Empty string fallbacks (`?? ''`) will now throw errors immediately

#### Session Strategy Validation
- **Database Strategy**: Requires DATABASE_URL and adapter
- **JWT Strategy**: Requires NEXTAUTH_SECRET
- **Error Message**: "Session strategy is set to 'database' but DATABASE_URL is not configured"

#### Cookie Configuration
- **Production**: Must use secure cookies
- **Production**: Session cookies should use `__Secure-` prefix
- **Production**: CSRF cookies should use `__Host-` prefix
- **Always**: httpOnly flag recommended

### Database Configuration

#### Connection String Validation
- **Protocol**: Must be `postgresql://` or `postgres://`
- **Components**: Username, host, database name required
- **Warning**: Missing password
- **Production**: SSL recommended

#### Railway-Specific Requirements
- **Port 6432**: PgBouncer for connection pooling (recommended)
- **Port 5432**: Direct PostgreSQL (not recommended for production)
- **Warning**: "Using port 5432. Consider using PgBouncer (6432)"

#### Connection Pool
- **Range**: 1-100 connections
- **Production Minimum**: 5 connections recommended
- **Warning**: Pool size > 100 may exhaust database limits

### API Configuration

#### Stripe Keys
- **Secret Key**: Must start with `sk_test_` or `sk_live_`
- **Publishable Key**: Must start with `pk_test_` or `pk_live_`
- **Webhook Secret**: Must start with `whsec_`
- **Warning**: Live keys in non-production environment

#### AI API Keys
- **OpenAI**: Must start with `sk-`
- **Anthropic**: Must start with `sk-ant-`

## Usage

### 1. During Development

Environment variables are validated when the configuration files are loaded:

```typescript
import { authOptions } from '@/lib/auth/options';
// If NEXTAUTH_SECRET is missing, app crashes with clear error
```

### 2. In CI/CD Pipeline

Add validation step to your CI/CD pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Validate Configuration
  run: npm run validate:config
  env:
    # All required environment variables from secrets
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    # ... other secrets
```

### 3. Pre-Deployment

Run validation script manually:

```bash
npm run validate:config
```

This will:
- Validate all environment variables
- Check production requirements
- Validate NextAuth configuration
- Validate database configuration
- Validate API configurations
- Print comprehensive summary

### 4. In Tests

Use validation utilities in tests:

```typescript
import { validateEnv } from '@/lib/config/env.validation';

describe('Configuration', () => {
  it('should have valid environment', () => {
    const result = validateEnv();
    expect(result.success).toBe(true);
  });
});
```

## Error Messages & Fixes

### Common Errors

#### 1. Missing NEXTAUTH_SECRET

**Error:**
```
NEXTAUTH_SECRET is not configured.
```

**Fix:**
```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=<generated-secret>
```

#### 2. Invalid DATABASE_URL

**Error:**
```
DATABASE_URL must use postgresql:// protocol
```

**Fix:**
```bash
# Correct format
DATABASE_URL=postgresql://username:password@host:port/database

# Railway example (use PgBouncer port)
DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:6432/railway
```

#### 3. Empty Provider Credentials

**Error:**
```
GitHub OAuth credentials cannot be empty strings.
```

**Fix:**
```bash
# Remove the provider or set valid credentials
GITHUB_CLIENT_ID=your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_client_secret

# Or remove GitHub provider from providers array
```

#### 4. Production HTTPS Requirement

**Error:**
```
NEXTAUTH_URL must use HTTPS in production
```

**Fix:**
```bash
# Use HTTPS URL in production
NEXTAUTH_URL=https://www.ainative.studio

# Development can use HTTP
NEXTAUTH_URL=http://localhost:3000
```

## Testing

### Unit Tests

Run configuration validation tests:

```bash
# All tests
npm test

# Configuration tests only
npm test -- __tests__/lib/config/

# Specific test file
npm test -- __tests__/lib/config/env.validation.test.ts
```

### Integration Testing

Test configuration with actual environment:

```bash
# Create test environment
cp .env.example .env.test

# Set test values
# Edit .env.test

# Run with test environment
NODE_ENV=test npm run validate:config
```

## Production Checklist

Before deploying to production, verify:

- [ ] `NEXTAUTH_SECRET` is set (min 32 characters)
- [ ] `NEXTAUTH_SECRET` is different from development
- [ ] `NEXTAUTH_URL` uses HTTPS
- [ ] `NEXTAUTH_URL` is production domain (not localhost)
- [ ] `DATABASE_URL` is configured
- [ ] `DATABASE_URL` uses port 6432 (PgBouncer)
- [ ] `DATABASE_URL` includes SSL configuration
- [ ] GitHub OAuth credentials are for production app
- [ ] Stripe keys are live keys (not test)
- [ ] All API keys are production keys
- [ ] Run `npm run validate:config` successfully
- [ ] Review validation warnings
- [ ] All tests pass

## Monitoring

### Startup Validation

Configuration is validated at application startup. Check logs for:

```
🔍 Validating NextAuth configuration...
✅ NextAuth configuration is valid

🗄️  Validating Prisma configuration...
✓ Using PgBouncer port (6432)
✅ Prisma configuration is valid
```

### Production Warnings

Watch for warnings in production logs:

```
⚠️  Production Warnings:
  WARNING: GitHub OAuth credentials not set. GitHub login will not work.
  WARNING: Stripe is not configured. Payment features will not work.
```

Address warnings before they cause user-facing failures.

## Best Practices

### 1. Fail Fast
- Validate configuration at startup, not runtime
- Throw clear errors immediately
- Never use silent fallbacks for critical config

### 2. Clear Error Messages
- Include the problem
- Include the fix
- Include examples

**Bad:**
```
Configuration error
```

**Good:**
```
NEXTAUTH_SECRET must be at least 32 characters long.
Current length: 16.
Generate a secure secret with: openssl rand -base64 32
```

### 3. Environment-Specific Validation
- Development: Allow HTTP, localhost
- Production: Require HTTPS, domain names
- Test: Allow mock credentials

### 4. Layered Validation
1. Type validation (Zod schemas)
2. Format validation (prefixes, lengths)
3. Relationship validation (database strategy requires adapter)
4. Environment validation (production requirements)

### 5. Documentation
- Document all required variables
- Provide generation commands
- Link to provider setup guides

## Troubleshooting

### Validation Script Fails

**Problem:** `npm run validate:config` fails but app starts

**Solution:**
- Check if script uses different env file
- Ensure script imports same configuration
- Verify script has access to process.env

### False Positives

**Problem:** Validation fails for valid configuration

**Solution:**
- Check validation rules in respective validator
- Submit issue with configuration details
- Consider environment-specific rules

### Missing Validation

**Problem:** App fails with misconfiguration not caught by validators

**Solution:**
1. Identify the missing validation
2. Add validation rule to appropriate validator
3. Add test case
4. Submit PR with fix

## Related Documentation

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Configuration](https://www.prisma.io/docs)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)
- [Railway Deployment Guide](../../deployment/RAILWAY_TROUBLESHOOTING.md)

## Migration Guide

### Migrating Existing Projects

If you have an existing Next.js project without validation:

1. **Install Dependencies**
   ```bash
   npm install zod
   ```

2. **Copy Validation Files**
   ```bash
   cp lib/config/*.ts your-project/lib/config/
   ```

3. **Update NextAuth Configuration**
   ```typescript
   // Add validation at top of lib/auth/options.ts
   if (!process.env.NEXTAUTH_SECRET) {
     throw new Error('NEXTAUTH_SECRET is not configured...');
   }
   ```

4. **Add Validation Script**
   ```bash
   cp scripts/validate-config.ts your-project/scripts/
   ```

5. **Update package.json**
   ```json
   {
     "scripts": {
       "validate:config": "tsx scripts/validate-config.ts"
     }
   }
   ```

6. **Run Validation**
   ```bash
   npm run validate:config
   ```

7. **Fix All Errors**
   - Address each validation error
   - Update .env files
   - Re-run validation

8. **Add to CI/CD**
   ```yaml
   - run: npm run validate:config
   ```

## Support

### Getting Help

- **Configuration Issues**: Check this guide first
- **Validation Errors**: See "Error Messages & Fixes" section
- **Feature Requests**: Submit issue on GitHub
- **Security Concerns**: Email security@ainative.studio

### Contributing

Improvements to validation system:

1. Identify validation gap
2. Add validation rule + test
3. Update documentation
4. Submit PR

## Changelog

### 2026-02-08 - Initial Implementation
- Created comprehensive validation system
- Fixed NextAuth secret misconfiguration issue
- Added environment variable validation
- Added NextAuth configuration validation
- Added Prisma configuration validation
- Created validation tests (>80% coverage)
- Created validation script
- Created this documentation

## References

- [Original Issue: NextAuth Misconfiguration](#)
- [Zod Documentation](https://zod.dev)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Railway Best Practices](https://docs.railway.app/guides/best-practices)
