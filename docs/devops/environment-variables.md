# Environment Variables Configuration

## Overview

This document describes all environment variables used in the AINative Studio Next.js application. Environment variables are used to configure the application for different environments (development, staging, production) without changing code.

## Security Best Practices

### CRITICAL RULES

1. **NEVER commit secrets to git**
   - Never commit `.env.local`, `.env.production`, or `.env.staging`
   - Only commit `.env.example` with placeholder values

2. **Use secure secret generation**
   ```bash
   # Generate secure random secrets
   openssl rand -base64 32
   openssl rand -hex 32
   ```

3. **Separate public and private variables**
   - Public: `NEXT_PUBLIC_*` (exposed to browser)
   - Private: All others (server-side only)

4. **Rotate secrets regularly**
   - Database passwords: Every 90 days
   - API keys: Every 180 days
   - JWT secrets: Every 90 days

5. **Use environment-specific values**
   - Different API keys for staging and production
   - Different Stripe keys (test vs live)
   - Different database URLs

## Environment Setup

### Local Development

```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
nano .env.local

# Never commit this file!
echo ".env.local" >> .gitignore
```

### Staging Environment

Configure in Railway Dashboard:
1. Go to Railway project
2. Select "staging-ainative-nextjs" service
3. Click "Variables" tab
4. Add variables from "Staging Configuration" section below

### Production Environment

Configure in Railway Dashboard:
1. Go to Railway project
2. Select "production-ainative-nextjs" service
3. Click "Variables" tab
4. Add variables from "Production Configuration" section below

## Required Variables

These variables MUST be set for the application to run.

### Application Configuration

#### `NODE_ENV`
- **Type**: String
- **Required**: Yes
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Description**: Node environment mode
- **Example**: `NODE_ENV=production`

#### `NEXT_PUBLIC_APP_URL`
- **Type**: String (URL)
- **Required**: Yes
- **Public**: Yes
- **Example**:
  - Development: `http://localhost:3000`
  - Staging: `https://staging.ainative.studio`
  - Production: `https://ainative.studio`

### API Configuration

#### `NEXT_PUBLIC_API_URL`
- **Type**: String (URL)
- **Required**: Yes
- **Public**: Yes
- **Description**: Backend API base URL
- **Example**:
  - Development: `http://localhost:8000`
  - Staging: `https://api-staging.ainative.studio`
  - Production: `https://api.ainative.studio`

#### `API_TIMEOUT`
- **Type**: Number (milliseconds)
- **Required**: No
- **Default**: `30000` (30 seconds)
- **Example**: `API_TIMEOUT=30000`

### Authentication (NextAuth.js)

#### `NEXTAUTH_URL`
- **Type**: String (URL)
- **Required**: Yes
- **Description**: Application URL for OAuth callbacks
- **Example**:
  - Development: `http://localhost:3000`
  - Staging: `https://staging.ainative.studio`
  - Production: `https://ainative.studio`

#### `NEXTAUTH_SECRET`
- **Type**: String
- **Required**: Yes
- **Security**: CRITICAL - Keep secret!
- **Generation**: `openssl rand -base64 32`
- **Min Length**: 32 characters
- **Example**: `NEXTAUTH_SECRET=abc123...xyz789`

### Database (PostgreSQL)

#### `DATABASE_URL`
- **Type**: String (Connection URL)
- **Required**: Yes
- **Security**: CRITICAL - Keep secret!
- **Format**: `postgresql://user:password@host:port/database`
- **Example**: `DATABASE_URL=postgresql://user:pass@localhost:5432/ainative`

#### `DIRECT_URL`
- **Type**: String (Connection URL)
- **Required**: No (for connection pooling)
- **Description**: Direct database connection (bypasses pooler)
- **Example**: Same format as DATABASE_URL

### Stripe Payment Integration

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Type**: String
- **Required**: Yes (for payments)
- **Public**: Yes
- **Example**:
  - Test: `pk_test_51234567890abcdef...`
  - Live: `pk_live_51234567890abcdef...`

#### `STRIPE_SECRET_KEY`
- **Type**: String
- **Required**: Yes (for payments)
- **Security**: CRITICAL - Keep secret!
- **Example**:
  - Test: `sk_test_51234567890abcdef...`
  - Live: `sk_live_51234567890abcdef...`

#### `STRIPE_WEBHOOK_SECRET`
- **Type**: String
- **Required**: Yes (for webhooks)
- **Security**: CRITICAL - Keep secret!
- **Example**: `whsec_1234567890abcdef...`

### Error Tracking (Sentry)

#### `NEXT_PUBLIC_SENTRY_DSN`
- **Type**: String (URL)
- **Required**: No (recommended for production)
- **Public**: Yes
- **Example**: `https://abc123@o123456.ingest.sentry.io/7890123`

#### `SENTRY_AUTH_TOKEN`
- **Type**: String
- **Required**: No (for source maps upload)
- **Security**: Keep secret!
- **Example**: `sntrys_abc123...xyz789`

## Optional Variables

These variables enhance functionality but are not required.

### OAuth Providers

#### Google OAuth
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### GitHub OAuth
```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Analytics

#### `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Type**: String
- **Required**: No
- **Public**: Yes
- **Example**: `G-XXXXXXXXXX`

#### `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`
- **Type**: String
- **Required**: No
- **Public**: Yes
- **Example**: `your-vercel-analytics-id`

### Email Service

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@ainative.studio
```

### Redis Cache

```bash
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=your-redis-token
```

### Feature Flags

```bash
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### Rate Limiting

```bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### File Upload (AWS S3)

```bash
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
AWS_S3_BUCKET=ainative-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

## Environment-Specific Configuration

### Development Configuration

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-dev-secret-min-32-chars

# Use test Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Optional: Connect to development database
DATABASE_URL=postgresql://user:pass@localhost:5432/ainative_dev

# Enable debug features
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
NEXT_PUBLIC_MOCK_API=false
```

### Staging Configuration

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.ainative.studio
NEXT_PUBLIC_API_URL=https://api-staging.ainative.studio
NEXTAUTH_URL=https://staging.ainative.studio
NEXTAUTH_SECRET=your-staging-secret-min-32-chars

# Use test Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_staging_...

# Staging database
DATABASE_URL=postgresql://...@staging-db:5432/ainative_staging

# Enable Sentry for staging
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=staging

# Disable beta features
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

### Production Configuration

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ainative.studio
NEXT_PUBLIC_API_URL=https://api.ainative.studio
NEXTAUTH_URL=https://ainative.studio
NEXTAUTH_SECRET=your-production-secret-min-32-chars

# Use LIVE Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_production_...

# Production database
DATABASE_URL=postgresql://...@production-db:5432/ainative_production

# Enable Sentry for production
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1

# Enable analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Disable debug features
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
NEXT_PUBLIC_MOCK_API=false
```

## Managing Secrets

### Railway Dashboard

1. Navigate to project
2. Select service (staging or production)
3. Click "Variables" tab
4. Add/edit variables
5. Click "Deploy" to apply changes

### Railway CLI

```bash
# Set a variable
railway variables set KEY=value --service production-ainative-nextjs

# Get a variable
railway variables get KEY --service production-ainative-nextjs

# List all variables
railway variables --service production-ainative-nextjs

# Delete a variable
railway variables delete KEY --service production-ainative-nextjs
```

### GitHub Secrets

For CI/CD workflows, add secrets to GitHub:

1. Go to repository Settings
2. Click "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add secret name and value
5. Save

Required GitHub secrets:
- `RAILWAY_TOKEN`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `SENTRY_AUTH_TOKEN`
- `SLACK_WEBHOOK_URL`

## Validation

### Environment Variable Validation

The application validates required environment variables on startup using Zod schema validation in `lib/env.ts`.

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_API_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  // ... more validations
});

export const env = envSchema.parse(process.env);
```

### Manual Validation

```bash
# Check if all required variables are set
npm run verify:env

# This will fail if required variables are missing
```

## Troubleshooting

### Missing Environment Variables

**Error**: "Environment variable XXX is not defined"

**Solution**:
```bash
# Check current variables
railway variables --service production-ainative-nextjs

# Add missing variable
railway variables set XXX=value --service production-ainative-nextjs

# Redeploy
railway up --service production-ainative-nextjs
```

### Invalid Environment Variable Format

**Error**: "Invalid URL format for XXX"

**Solution**:
- Check for typos in URLs
- Ensure URLs include protocol (http:// or https://)
- Remove trailing slashes
- Verify credentials in connection strings

### Environment Variables Not Loading

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Restart dev server
npm run dev
```

### Secret Rotation

When rotating secrets:

1. **Generate new secret**
   ```bash
   openssl rand -base64 32
   ```

2. **Update in Railway**
   ```bash
   railway variables set KEY=new-value --service production-ainative-nextjs
   ```

3. **Update in GitHub Secrets**
   - Go to repository settings
   - Update secret value

4. **Update documentation**
   - Update password manager
   - Notify team

5. **Monitor for issues**
   - Check error logs
   - Verify authentication works
   - Test payment processing

## Security Checklist

- [ ] All secrets use strong random generation
- [ ] Production secrets differ from staging
- [ ] No secrets committed to git
- [ ] Secrets stored in Railway/GitHub Secrets
- [ ] Team access limited to necessary personnel
- [ ] Secrets rotated according to schedule
- [ ] Audit logs reviewed regularly
- [ ] Backup of critical secrets in password manager

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Stripe API Keys](https://stripe.com/docs/keys)
