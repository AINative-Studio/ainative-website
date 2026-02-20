# Deployment Architecture - AINative Platform

## Executive Summary

This document presents a comprehensive deployment architecture designed to eliminate fragility in the current CI/CD pipeline and establish a robust, multi-stage deployment process with built-in resilience, validation, and observability.

### Key Design Decisions

1. **Multi-stage validation pipeline**: Pre-push validation, CI validation, staging verification, production deployment
2. **Environment-as-code**: Schema-validated environment configurations with drift detection
3. **Redundant CI/CD paths**: Railway-native deployments as backup to GitHub Actions
4. **Automatic health-based rollback**: Progressive deployment with circuit breakers
5. **Comprehensive observability**: Real-time deployment metrics, logs aggregation, and alerting

### Architecture Principles

- **Fail Fast**: Detect issues at the earliest possible stage
- **Defense in Depth**: Multiple validation layers prevent bad deployments
- **Observable by Default**: Every deployment phase emits structured events
- **Graceful Degradation**: System continues operating even when CI/CD billing fails
- **Immutable Infrastructure**: Configuration and infrastructure defined as code

---

## 1. Current State Analysis

### Identified Failure Points

#### 1.1 Pre-Deployment Phase
```
PROBLEM: No Local Validation Before Push
├─ Developers push code without running tests locally
├─ Build failures discovered only in CI (wasted time/billing)
├─ Environment variable mismatches not caught until deployment
└─ No schema validation for configuration changes

IMPACT:
- Average 15-20 minutes to discover simple build failures
- GitHub Actions billing for preventable failures
- Broken staging deployments requiring manual fixes
```

#### 1.2 CI/CD Phase
```
PROBLEM: GitHub Actions Single Point of Failure
├─ Billing issues block all deployments
├─ GitHub outages prevent urgent hotfixes
├─ No alternative deployment path
└─ Manual Railway deployments lack validation

IMPACT:
- Cannot deploy during GitHub Actions outages
- Billing failures block production hotfixes
- Emergency deployments bypass safety checks
```

#### 1.3 Railway Deployment Phase
```
PROBLEM: Silent Build Failures
├─ Railway builds fail without local notification
├─ No deployment status webhook to GitHub
├─ Developers must manually check Railway dashboard
└─ Failed deployments don't trigger automatic rollback

IMPACT:
- Deployments assumed successful when actually failed
- Broken staging environments discovered by users
- Manual intervention required for rollbacks
```

#### 1.4 Configuration Management
```
PROBLEM: Fragmented Environment Variable Management
├─ Environment variables stored in multiple locations
├─ No schema validation for required variables
├─ Staging/production parity issues
├─ No audit trail for configuration changes
└─ Secrets rotation requires manual updates

IMPACT:
- Runtime errors from missing environment variables
- Configuration drift between environments
- Security risks from stale secrets
- No visibility into who changed what
```

#### 1.5 Health Verification
```
PROBLEM: Insufficient Health Checks
├─ Basic HTTP 200 check insufficient
├─ No database connectivity verification
├─ No external service dependency checks
├─ No graceful traffic migration during deployment
└─ No automated rollback on health check failures

IMPACT:
- Deployments succeed but application is broken
- Database connection pool exhaustion discovered in production
- External API failures cause cascading issues
- Manual rollbacks required
```

### Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT STATE (FRAGILE)                   │
└─────────────────────────────────────────────────────────────┘

Developer                 GitHub                    Railway
    │                        │                          │
    │  git push             │                          │
    ├──────────────────────>│                          │
    │                        │                          │
    │                        │  Trigger CI              │
    │                        │  (GitHub Actions)        │
    │                        ├─────────┐                │
    │                        │         │                │
    │                        │  lint   │                │
    │                        │  test   │                │
    │                        │  build  │                │
    │                        │<────────┘                │
    │                        │                          │
    │                        │  Push to main           │
    │                        ├─────────────────────────>│
    │                        │                          │
    │                        │                          │ Railway Auto-Deploy
    │                        │                          ├──────────┐
    │                        │                          │          │
    │                        │                          │   Build  │
    │                        │                          │  (Silent)│
    │                        │                          │<─────────┘
    │                        │                          │
    │  Manual Check         │                          │
    │<──────────────────────┼──────────────────────────┤
    │  "Is it deployed?"    │                          │
    │                        │                          │

FAILURE POINTS:
[1] No pre-push validation
[2] GitHub Actions billing = total blockage
[3] Railway builds fail silently
[4] No health checks or rollback
[5] Environment variables not validated
```

---

## 2. Proposed Architecture

### 2.1 Multi-Stage Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│              ROBUST MULTI-STAGE DEPLOYMENT ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────────────┘

STAGE 1: Local Pre-Push Validation (Git Hooks)
┌────────────────────────────────────────────────────────────┐
│  Developer Commits                                          │
│      │                                                      │
│      ▼                                                      │
│  Pre-commit Hook (husky)                                   │
│  ├─ Lint staged files (eslint)                            │
│  ├─ Type check (TypeScript)                               │
│  ├─ Format check (prettier)                               │
│  └─ Security scan (detect secrets)                        │
│                                                            │
│  Pre-push Hook                                             │
│  ├─ Run unit tests (affected files)                       │
│  ├─ Validate environment schema                           │
│  ├─ Check build locally                                   │
│  ├─ Verify API contracts (OpenAPI)                        │
│  └─ Estimate deployment impact                            │
│                                                            │
│  Result: Push BLOCKED if validation fails                 │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
STAGE 2: CI Validation (GitHub Actions + Redundant)
┌────────────────────────────────────────────────────────────┐
│  GitHub Actions (Primary)                                  │
│  ├─ Full test suite (unit, integration, e2e)              │
│  ├─ Build all targets (staging, production)               │
│  ├─ Security audit (npm audit, Snyk)                      │
│  ├─ Performance regression tests                          │
│  ├─ Bundle size analysis                                  │
│  └─ Generate deployment artifacts                         │
│                                                            │
│  Railway Native CI (Backup)                               │
│  ├─ Triggered if GitHub Actions unavailable               │
│  ├─ Build from Git commit directly                        │
│  ├─ Run Railway-hosted tests                              │
│  └─ Deploy to staging                                     │
│                                                            │
│  CircleCI/GitLab CI (Secondary Backup)                    │
│  └─ Minimal validation path for emergencies               │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
STAGE 3: Staging Deployment & Verification
┌────────────────────────────────────────────────────────────┐
│  Pre-Deployment Checks                                     │
│  ├─ Environment variable schema validation                │
│  ├─ Database migration dry-run                            │
│  ├─ External service connectivity check                   │
│  └─ Resource capacity verification                        │
│                                                            │
│  Deployment to Staging (Railway)                          │
│  ├─ Blue-green deployment                                 │
│  ├─ Health check new instance                             │
│  ├─ Run smoke tests                                       │
│  └─ Progressive traffic migration (0% → 100%)             │
│                                                            │
│  Post-Deployment Verification                             │
│  ├─ Deep health checks (database, redis, APIs)           │
│  ├─ Critical path smoke tests                            │
│  ├─ Performance baseline comparison                       │
│  ├─ Log error rate monitoring (5 minutes)                │
│  └─ Automated rollback if health degrades                 │
│                                                            │
│  Notification: Slack, Email, PagerDuty                    │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
STAGE 4: Production Deployment (Manual Approval Required)
┌────────────────────────────────────────────────────────────┐
│  Pre-Production Gate                                       │
│  ├─ Require manual approval via GitHub Environments       │
│  ├─ Staging verification report must pass                 │
│  ├─ Database backup confirmation                          │
│  └─ Rollback plan documented                              │
│                                                            │
│  Deployment to Production                                  │
│  ├─ Create snapshot for rollback                          │
│  ├─ Blue-green deployment                                 │
│  ├─ Canary release (10% → 50% → 100%)                    │
│  ├─ Real-time health monitoring                           │
│  └─ Automatic circuit breaker on errors                   │
│                                                            │
│  Post-Deployment Monitoring                                │
│  ├─ 15-minute elevated monitoring window                  │
│  ├─ Error rate < baseline                                 │
│  ├─ Latency < baseline                                    │
│  ├─ Database pool < 80% utilization                       │
│  └─ External API success rate > 99%                       │
│                                                            │
│  Automatic Rollback Triggers                               │
│  ├─ Health check fails 3 consecutive times                │
│  ├─ Error rate spike > 5% of traffic                      │
│  ├─ Latency degrades > 2x baseline                        │
│  └─ Manual rollback command issued                        │
└────────────────────────────────────────────────────────────┘

STAGE 5: Post-Deployment
┌────────────────────────────────────────────────────────────┐
│  ├─ Create Git release tag                                │
│  ├─ Update deployment registry                            │
│  ├─ Generate deployment report                            │
│  ├─ Archive deployment artifacts                          │
│  └─ Send notifications to stakeholders                    │
└────────────────────────────────────────────────────────────┘
```

### 2.2 Redundant CI/CD Architecture

The system provides multiple deployment paths to eliminate single points of failure:

```
┌─────────────────────────────────────────────────────────────┐
│              REDUNDANT CI/CD PATHS                           │
└─────────────────────────────────────────────────────────────┘

PRIMARY PATH: GitHub Actions
├─ Status: Active (when billing current)
├─ Features: Full test suite, coverage, bundle analysis
├─ Cost: Pay-per-use (controlled by budget)
└─ Trigger: git push, pull request, workflow_dispatch

BACKUP PATH 1: Railway Native Deployments
├─ Status: Always available
├─ Features: Build from Git, basic tests, auto-deploy
├─ Cost: Included in Railway subscription
├─ Trigger: Railway API, webhook, manual
└─ Activation: Automatic if GitHub Actions fails

BACKUP PATH 2: CircleCI (Secondary)
├─ Status: Free tier standby
├─ Features: Minimal validation, build-only
├─ Cost: Free tier (300 minutes/month)
├─ Trigger: Manual activation
└─ Use case: Emergency deployments

BACKUP PATH 3: Local Deployment Script
├─ Status: Always available
├─ Features: Direct Railway CLI deployment
├─ Cost: None
├─ Trigger: npm run deploy:emergency
└─ Use case: Complete CI/CD outage

Decision Logic:
┌─────────────────────────────────────────┐
│  Deploy Event Triggered                 │
└─────────────┬───────────────────────────┘
              │
              ▼
     ┌─────────────────┐
     │ GitHub Actions  │ NO    ┌─────────────────┐
     │   Available?    ├──────>│ Railway Native  │
     └────────┬────────┘       │   Deployment    │
              │ YES             └─────────┬───────┘
              │                           │
              ▼                           ▼
     ┌─────────────────┐         ┌─────────────────┐
     │  Use GitHub     │         │  Success?       │ NO
     │  Actions        │         └────────┬────────┘
     └─────────────────┘                  │ YES
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  Alert DevOps   │
                                 │  Continue with  │
                                 │  CircleCI       │
                                 └─────────────────┘
```

### 2.3 Health Check Architecture

Comprehensive health verification system with automatic rollback:

```
┌─────────────────────────────────────────────────────────────┐
│                  HEALTH CHECK SYSTEM                         │
└─────────────────────────────────────────────────────────────┘

LEVEL 1: Basic HTTP Health Check
┌────────────────────────────────────────────────────────────┐
│  GET /health                                                │
│  ├─ Response: 200 OK                                       │
│  ├─ Timeout: 5 seconds                                     │
│  └─ Body: { "status": "healthy", "timestamp": "..." }     │
└────────────────────────────────────────────────────────────┘

LEVEL 2: Dependency Health Check
┌────────────────────────────────────────────────────────────┐
│  GET /health/deep                                          │
│  ├─ Database connectivity                                 │
│  │  ├─ PostgreSQL connection pool status                 │
│  │  ├─ Query latency < 100ms                             │
│  │  └─ Pool utilization < 80%                            │
│  │                                                        │
│  ├─ Redis connectivity                                    │
│  │  ├─ Ping/pong response < 50ms                         │
│  │  └─ Memory usage < 90%                                │
│  │                                                        │
│  ├─ External APIs                                         │
│  │  ├─ Stripe API (payment processing)                   │
│  │  ├─ OpenAI API (AI features)                          │
│  │  ├─ Strapi CMS (content)                              │
│  │  └─ ZeroDB API (data storage)                         │
│  │                                                        │
│  └─ Response format:                                      │
│      {                                                    │
│        "status": "healthy|degraded|unhealthy",           │
│        "checks": {                                        │
│          "database": { "status": "ok", "latency": 45 },  │
│          "redis": { "status": "ok", "latency": 12 },     │
│          "stripe": { "status": "ok" }                    │
│        }                                                  │
│      }                                                    │
└────────────────────────────────────────────────────────────┘

LEVEL 3: Critical Path Smoke Tests
┌────────────────────────────────────────────────────────────┐
│  Automated Smoke Test Suite (runs every deployment)        │
│  ├─ User authentication flow                              │
│  │  └─ POST /api/auth/signin                             │
│  │                                                        │
│  ├─ API key validation                                    │
│  │  └─ GET /api/v1/projects (with API key)              │
│  │                                                        │
│  ├─ Database read/write                                   │
│  │  ├─ Create test record                                │
│  │  └─ Delete test record                                │
│  │                                                        │
│  └─ Critical business endpoints                           │
│      ├─ GET /api/v1/models                               │
│      ├─ POST /api/v1/chat                                │
│      └─ GET /api/v1/usage                                │
└────────────────────────────────────────────────────────────┘

LEVEL 4: Performance Baseline Comparison
┌────────────────────────────────────────────────────────────┐
│  Compare new deployment vs previous baseline               │
│  ├─ Average response time                                 │
│  │  └─ Alert if > 1.5x previous deployment               │
│  │                                                        │
│  ├─ p95 latency                                           │
│  │  └─ Alert if > 2x previous deployment                 │
│  │                                                        │
│  ├─ Error rate                                            │
│  │  └─ Alert if > 1% increase                            │
│  │                                                        │
│  └─ Resource utilization                                  │
│      ├─ CPU < 80%                                         │
│      ├─ Memory < 85%                                      │
│      └─ Database connections < 80% pool                  │
└────────────────────────────────────────────────────────────┘

AUTOMATIC ROLLBACK TRIGGERS
┌────────────────────────────────────────────────────────────┐
│  Circuit Breaker Rules:                                    │
│                                                            │
│  IMMEDIATE ROLLBACK:                                       │
│  ├─ Health endpoint returns 5xx status                    │
│  ├─ Database connection fails                             │
│  ├─ Critical smoke test fails                             │
│  └─ Application crashes on startup                        │
│                                                            │
│  ROLLBACK AFTER 3 FAILURES:                                │
│  ├─ Health check timeout                                  │
│  ├─ Degraded dependency status                            │
│  └─ Smoke test intermittent failure                       │
│                                                            │
│  ROLLBACK IF SUSTAINED (5 minutes):                        │
│  ├─ Error rate > 5% of traffic                            │
│  ├─ Latency > 2x baseline                                 │
│  ├─ Resource utilization > 90%                            │
│  └─ Database pool exhaustion                              │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Environment Variable Management Strategy

### 3.1 Configuration Schema

Define environment variables using a typed schema for validation:

```typescript
// /config/environment.schema.ts

import { z } from 'zod';

// Base schema shared across all environments
const BaseEnvironmentSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().int().min(1000).max(60000),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']),

  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Database (server-side only)
  DATABASE_URL: z.string().startsWith('postgresql://'),
  DATABASE_POOL_SIZE: z.coerce.number().int().min(5).max(50).default(10),

  // Redis
  REDIS_URL: z.string().startsWith('redis://'),

  // External Services (server-side only)
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_AI_FEATURES: z.coerce.boolean().default(true),
  NEXT_PUBLIC_ENABLE_QUANTUM_FEATURES: z.coerce.boolean().default(false),

  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

// Staging-specific overrides
const StagingEnvironmentSchema = BaseEnvironmentSchema.extend({
  NEXT_PUBLIC_ENVIRONMENT: z.literal('staging'),
  // Staging can have optional API keys for testing
  OPENAI_API_KEY: z.string().optional(),
});

// Production-specific requirements (stricter)
const ProductionEnvironmentSchema = BaseEnvironmentSchema.extend({
  NEXT_PUBLIC_ENVIRONMENT: z.literal('production'),
  // Production requires all API keys
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_live_'),
  // Production requires monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().url(),
  NEXT_PUBLIC_GA_ID: z.string().regex(/^G-[A-Z0-9]+$/),
});

export const EnvironmentSchemas = {
  development: BaseEnvironmentSchema,
  staging: StagingEnvironmentSchema,
  production: ProductionEnvironmentSchema,
};

// Validation function
export function validateEnvironment(env: string = process.env.NODE_ENV || 'development') {
  const schema = EnvironmentSchemas[env as keyof typeof EnvironmentSchemas];

  try {
    const validated = schema.parse(process.env);
    console.log(`✓ Environment validation passed for: ${env}`);
    return validated;
  } catch (error) {
    console.error(`✗ Environment validation failed for: ${env}`);
    console.error(error);
    throw new Error('Environment validation failed. Fix configuration before deployment.');
  }
}
```

### 3.2 Environment Configuration Storage

```
┌─────────────────────────────────────────────────────────────┐
│         ENVIRONMENT CONFIGURATION HIERARCHY                  │
└─────────────────────────────────────────────────────────────┘

LEVEL 1: Repository (.env.example)
├─ Purpose: Documentation and template
├─ Contains: All possible variables with descriptions
├─ Committed: YES (no secrets)
└─ Usage: New developer onboarding

LEVEL 2: Local Development (.env.local)
├─ Purpose: Developer-specific overrides
├─ Contains: Local API keys, test credentials
├─ Committed: NO (gitignored)
└─ Usage: Local development only

LEVEL 3: CI Environment (GitHub Secrets)
├─ Purpose: CI/CD pipeline configuration
├─ Contains: Test credentials, staging deployment keys
├─ Committed: NO (stored in GitHub)
└─ Usage: GitHub Actions workflows

LEVEL 4: Staging Environment (Railway Variables)
├─ Purpose: Staging deployment configuration
├─ Contains: Staging API keys, test Stripe keys
├─ Committed: NO (stored in Railway)
└─ Usage: Staging environment

LEVEL 5: Production Environment (Railway Variables + Vault)
├─ Purpose: Production deployment configuration
├─ Contains: Production API keys, live credentials
├─ Committed: NO (stored in Railway + HashiCorp Vault backup)
└─ Usage: Production environment

Configuration Sync Strategy:
┌──────────────────────────────────────────────────────────┐
│  .env.example (Source of Truth for Structure)           │
│       │                                                  │
│       ├──> Validated by schema on pre-push              │
│       │                                                  │
│       ├──> Compared against Railway config (drift)      │
│       │                                                  │
│       └──> Auto-generate Railway config updates         │
│                                                          │
│  Railway Variables                                       │
│       │                                                  │
│       ├──> Synced via Railway CLI / API                 │
│       │                                                  │
│       ├──> Versioned in deployment registry             │
│       │                                                  │
│       └──> Backed up to HashiCorp Vault (production)    │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Secret Management & Rotation

```
┌─────────────────────────────────────────────────────────────┐
│               SECRET ROTATION WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘

Automated Secret Rotation (90-day cycle):
1. Secret Rotation Script Runs (Cron Job)
   ├─ Generate new API keys/secrets
   ├─ Update HashiCorp Vault
   └─ Create rotation plan

2. Staging Deployment with New Secrets
   ├─ Update Railway staging environment
   ├─ Deploy with new secrets
   ├─ Run full test suite
   └─ Verify all external services work

3. Production Rotation (Blue-Green)
   ├─ Deploy new version with new secrets (Green)
   ├─ Keep old version with old secrets (Blue)
   ├─ Gradually migrate traffic to Green
   ├─ Monitor for issues
   └─ Decommission Blue after 24 hours

4. Audit Trail
   ├─ Log who rotated secrets
   ├─ Log when rotation occurred
   ├─ Log which services were updated
   └─ Send notification to security team

Secret Categories:
┌────────────────────────────────────────────────────────┐
│  CATEGORY 1: Infrastructure Secrets                    │
│  ├─ Database credentials                              │
│  ├─ Redis credentials                                 │
│  ├─ Railway API tokens                                │
│  └─ Rotation: Quarterly                               │
│                                                        │
│  CATEGORY 2: External API Keys                        │
│  ├─ OpenAI, Anthropic, Stripe                         │
│  ├─ Payment processor keys                            │
│  └─ Rotation: On-demand (after breach)                │
│                                                        │
│  CATEGORY 3: Application Secrets                      │
│  ├─ JWT secrets                                       │
│  ├─ Session encryption keys                           │
│  └─ Rotation: Monthly                                 │
│                                                        │
│  CATEGORY 4: OAuth Credentials                        │
│  ├─ GitHub, Google OAuth                              │
│  └─ Rotation: Manual (requires OAuth app update)      │
└────────────────────────────────────────────────────────┘
```

---

## 4. Infrastructure as Code (Railway)

### 4.1 Railway Configuration Files

```json
// railway.json - Project Configuration
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build",
    "watchPatterns": [
      "src/**",
      "public/**",
      "package.json",
      "next.config.js"
    ]
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "numReplicas": 2,
    "sleepApplication": false
  },
  "regions": [
    "us-west1"
  ],
  "environments": {
    "production": {
      "deploy": {
        "numReplicas": 3,
        "healthcheckPath": "/api/health",
        "healthcheckTimeout": 300
      },
      "variables": {
        "NODE_ENV": "production",
        "NEXT_PUBLIC_ENVIRONMENT": "production"
      }
    },
    "staging": {
      "deploy": {
        "numReplicas": 1,
        "healthcheckPath": "/api/health",
        "healthcheckTimeout": 120
      },
      "variables": {
        "NODE_ENV": "production",
        "NEXT_PUBLIC_ENVIRONMENT": "staging"
      }
    }
  }
}
```

```toml
# railway.toml - Deployment Configuration
[build]
builder = "NIXPACKS"
buildCommand = "npm ci && npm run build"

[deploy]
startCommand = "npm run start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
healthcheckPath = "/api/health"
healthcheckTimeout = 300

[deploy.healthcheck]
path = "/api/health"
timeout = 30
interval = 10
unhealthyThreshold = 3

[deploy.resources]
memory = 2048
cpuLimit = 2.0

[deploy.autoscaling]
enabled = true
minReplicas = 2
maxReplicas = 10
targetCPU = 70
targetMemory = 80
```

### 4.2 Railway Deployment Script

```bash
#!/bin/bash
# scripts/deploy-railway.sh

set -e  # Exit on error

ENVIRONMENT=${1:-staging}
RAILWAY_SERVICE="ainative-nextjs"

echo "🚀 Deploying to Railway: $ENVIRONMENT"

# Step 1: Validate environment
echo "📋 Step 1: Validating environment configuration..."
node scripts/validate-environment.js $ENVIRONMENT

# Step 2: Pre-deployment checks
echo "🔍 Step 2: Running pre-deployment checks..."
npm run test:ci
npm run build

# Step 3: Deploy to Railway
echo "📦 Step 3: Deploying to Railway..."
railway up --service $RAILWAY_SERVICE --environment $ENVIRONMENT

# Step 4: Wait for deployment
echo "⏳ Step 4: Waiting for deployment to complete..."
sleep 30

# Step 5: Health checks
echo "🏥 Step 5: Running health checks..."
DEPLOYMENT_URL=$(railway status --service $RAILWAY_SERVICE --environment $ENVIRONMENT --json | jq -r '.url')

for i in {1..10}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $DEPLOYMENT_URL/api/health)

  if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Health check passed!"
    break
  fi

  if [ $i -eq 10 ]; then
    echo "❌ Health check failed after 10 attempts"
    echo "🔄 Initiating rollback..."
    railway rollback --service $RAILWAY_SERVICE --environment $ENVIRONMENT
    exit 1
  fi

  echo "⏳ Attempt $i/10 failed. Retrying in 10 seconds..."
  sleep 10
done

# Step 6: Smoke tests
echo "🧪 Step 6: Running smoke tests..."
node scripts/smoke-tests.js $DEPLOYMENT_URL

echo "✅ Deployment successful: $DEPLOYMENT_URL"
```

---

## 5. Observability Architecture

### 5.1 Deployment Metrics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│              DEPLOYMENT OBSERVABILITY STACK                  │
└─────────────────────────────────────────────────────────────┘

LAYER 1: Real-Time Metrics (Railway Metrics)
┌────────────────────────────────────────────────────────────┐
│  Infrastructure Metrics:                                    │
│  ├─ CPU utilization (%)                                    │
│  ├─ Memory usage (MB)                                      │
│  ├─ Network I/O (MB/s)                                     │
│  ├─ Active connections                                     │
│  └─ Request rate (req/s)                                   │
│                                                            │
│  Application Metrics:                                      │
│  ├─ Response time (p50, p95, p99)                         │
│  ├─ Error rate (%)                                        │
│  ├─ Success rate (%)                                      │
│  ├─ Database query latency                                │
│  └─ External API latency                                  │
└────────────────────────────────────────────────────────────┘

LAYER 2: Structured Logging (Sentry + CloudWatch)
┌────────────────────────────────────────────────────────────┐
│  Log Levels:                                               │
│  ├─ ERROR: Application errors, exceptions                 │
│  ├─ WARN: Degraded performance, deprecations              │
│  ├─ INFO: Deployment events, config changes               │
│  └─ DEBUG: Detailed diagnostic information                │
│                                                            │
│  Deployment Event Log:                                     │
│  {                                                         │
│    "timestamp": "2026-02-08T10:30:00Z",                   │
│    "event": "deployment.started",                         │
│    "environment": "production",                           │
│    "version": "v1.2.3",                                   │
│    "commit": "abc123",                                    │
│    "triggered_by": "github-actions",                      │
│    "deployment_id": "deploy-xyz789"                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘

LAYER 3: Distributed Tracing (Sentry Performance)
┌────────────────────────────────────────────────────────────┐
│  Trace deployment request flow:                            │
│  ├─ API Gateway → Backend Service                         │
│  ├─ Backend → Database                                    │
│  ├─ Backend → Redis Cache                                 │
│  └─ Backend → External APIs (OpenAI, Stripe)              │
│                                                            │
│  Identify bottlenecks and regressions                      │
└────────────────────────────────────────────────────────────┘

LAYER 4: Alerting & Notifications
┌────────────────────────────────────────────────────────────┐
│  Alert Channels:                                           │
│  ├─ Slack (#deployments channel)                          │
│  ├─ Email (ops team)                                      │
│  ├─ PagerDuty (critical alerts only)                      │
│  └─ GitHub issue (auto-created on failure)                │
│                                                            │
│  Alert Conditions:                                         │
│  ├─ Deployment failed                                     │
│  ├─ Health check degraded                                 │
│  ├─ Automatic rollback triggered                          │
│  ├─ Error rate spike (> 5%)                               │
│  └─ Latency regression (> 2x baseline)                    │
└────────────────────────────────────────────────────────────┘

LAYER 5: Deployment Registry (Database)
┌────────────────────────────────────────────────────────────┐
│  Track all deployments in database:                        │
│                                                            │
│  CREATE TABLE deployments (                                │
│    id UUID PRIMARY KEY,                                   │
│    environment VARCHAR(20),                               │
│    version VARCHAR(50),                                   │
│    commit_sha VARCHAR(40),                                │
│    triggered_by VARCHAR(100),                             │
│    started_at TIMESTAMP,                                  │
│    completed_at TIMESTAMP,                                │
│    status VARCHAR(20), -- success, failed, rolled_back    │
│    health_score DECIMAL(3,2), -- 0.00 to 1.00            │
│    error_count INT,                                       │
│    rollback_reason TEXT,                                  │
│    deployment_metadata JSONB                              │
│  );                                                        │
│                                                            │
│  Query deployment history and trends                       │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Monitoring Dashboard

Create a custom deployment dashboard that aggregates all metrics:

```typescript
// pages/api/admin/deployments/dashboard.ts

export interface DeploymentDashboard {
  // Current deployment status
  current: {
    environment: 'staging' | 'production';
    version: string;
    deployedAt: Date;
    healthScore: number; // 0.0 to 1.0
    status: 'healthy' | 'degraded' | 'unhealthy';
  };

  // Recent deployments (last 10)
  recent: Array<{
    id: string;
    version: string;
    environment: string;
    status: 'success' | 'failed' | 'rolled_back';
    duration: number; // seconds
    deployedAt: Date;
  }>;

  // Deployment frequency
  metrics: {
    deploymentsToday: number;
    deploymentsThisWeek: number;
    successRate: number; // percentage
    averageDuration: number; // seconds
    meanTimeToRecover: number; // minutes
  };

  // Current health status
  health: {
    api: 'healthy' | 'degraded' | 'unhealthy';
    database: 'healthy' | 'degraded' | 'unhealthy';
    redis: 'healthy' | 'degraded' | 'unhealthy';
    externalServices: {
      stripe: 'healthy' | 'degraded' | 'unhealthy';
      openai: 'healthy' | 'degraded' | 'unhealthy';
      strapi: 'healthy' | 'degraded' | 'unhealthy';
    };
  };

  // Active alerts
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
}
```

---

## 6. Deployment Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│              DEPLOYMENT DECISION FLOWCHART                   │
└─────────────────────────────────────────────────────────────┘

START: Developer Ready to Deploy
         │
         ▼
    ┌─────────────────┐
    │  Git commit     │
    │  ready?         │
    └────────┬────────┘
             │ YES
             ▼
    ┌─────────────────┐
    │  Pre-commit     │
    │  hooks pass?    │
    └────────┬────────┘
             │ YES
             ▼
    ┌─────────────────┐
    │  Pre-push       │ NO   ┌──────────────────┐
    │  validation     ├─────>│  Fix issues      │
    │  pass?          │      │  before pushing  │
    └────────┬────────┘      └──────────────────┘
             │ YES
             ▼
    ┌─────────────────┐
    │  Push to remote │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  GitHub Actions │ NO   ┌──────────────────┐
    │  available?     ├─────>│  Use Railway     │
    └────────┬────────┘      │  native deploy   │
             │ YES            └────────┬─────────┘
             │                         │
             ▼                         ▼
    ┌─────────────────┐      ┌──────────────────┐
    │  Run CI tests   │      │  Railway build   │
    └────────┬────────┘      └────────┬─────────┘
             │                         │
             │<────────────────────────┘
             │
             ▼
    ┌─────────────────┐
    │  All tests      │ NO   ┌──────────────────┐
    │  passed?        ├─────>│  Alert developer │
    └────────┬────────┘      │  Block deploy    │
             │ YES            └──────────────────┘
             ▼
    ┌─────────────────┐
    │  Environment    │
    │  schema valid?  │
    └────────┬────────┘
             │ YES
             ▼
    ┌─────────────────┐
    │  Deploy to      │
    │  Staging        │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Staging health │ NO   ┌──────────────────┐
    │  checks pass?   ├─────>│  Auto rollback   │
    └────────┬────────┘      │  Alert ops team  │
             │ YES            └──────────────────┘
             ▼
    ┌─────────────────┐
    │  Smoke tests    │ NO   ┌──────────────────┐
    │  pass?          ├─────>│  Block production│
    └────────┬────────┘      │  Investigate     │
             │ YES            └──────────────────┘
             ▼
    ┌─────────────────┐
    │  Wait for       │
    │  manual approval│
    │  (production)   │
    └────────┬────────┘
             │ APPROVED
             ▼
    ┌─────────────────┐
    │  Create backup  │
    │  snapshot       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Blue-green     │
    │  deploy to      │
    │  production     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Health checks  │ NO   ┌──────────────────┐
    │  pass? (5 min)  ├─────>│  Auto rollback   │
    └────────┬────────┘      │  to previous     │
             │ YES            └──────────────────┘
             ▼
    ┌─────────────────┐
    │  Canary release │
    │  10% → 100%     │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Monitor for    │ DEGRADED ┌──────────────┐
    │  15 minutes     ├─────────>│  Rollback    │
    └────────┬────────┘          └──────────────┘
             │ HEALTHY
             ▼
    ┌─────────────────┐
    │  Tag release    │
    │  Send           │
    │  notifications  │
    └────────┬────────┘
             │
             ▼
        [SUCCESS]

EMERGENCY HOTFIX PATH:
┌─────────────────┐
│  Critical bug   │
│  in production  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Use local      │ YES
│  deploy script? ├──────> npm run deploy:emergency
└────────┬────────┘
         │ NO
         ▼
┌─────────────────┐
│  Railway direct │
│  deployment     │
│  (bypass CI)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to prod │
│  + monitor      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create hotfix  │
│  PR immediately │
│  after deploy   │
└─────────────────┘
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
```
□ Task 1.1: Set up environment schema validation
  ├─ Create environment.schema.ts with Zod
  ├─ Add validation to application startup
  └─ Document all environment variables

□ Task 1.2: Implement pre-push Git hooks
  ├─ Install Husky for Git hooks
  ├─ Configure pre-commit: lint, type-check, format
  ├─ Configure pre-push: tests, build, env validation
  └─ Update developer documentation

□ Task 1.3: Create Railway configuration files
  ├─ Create railway.json with project settings
  ├─ Create railway.toml with deployment config
  └─ Set up staging and production environments

□ Task 1.4: Implement health check endpoints
  ├─ /api/health (basic HTTP check)
  ├─ /api/health/deep (dependency checks)
  └─ /api/health/ready (readiness probe)

Dependencies: None
Deliverables: Working pre-push validation, health checks
Success Criteria: Failed builds caught before CI
```

### Phase 2: CI/CD Resilience (Week 3-4)
```
□ Task 2.1: Set up Railway native deployments
  ├─ Configure Railway GitHub integration
  ├─ Set up automatic deploys from main branch
  ├─ Configure deployment health checks
  └─ Test Railway-only deployment path

□ Task 2.2: Create backup CI pipeline (CircleCI)
  ├─ Set up CircleCI account (free tier)
  ├─ Create minimal .circleci/config.yml
  ├─ Configure emergency deployment workflow
  └─ Document activation procedure

□ Task 2.3: Implement deployment registry
  ├─ Create deployments table in database
  ├─ Create API endpoints for logging deployments
  ├─ Integrate with deployment scripts
  └─ Create deployment history dashboard

□ Task 2.4: Create local emergency deploy script
  ├─ Install Railway CLI
  ├─ Create scripts/deploy-emergency.sh
  ├─ Add environment validation
  └─ Test manual deployment flow

Dependencies: Phase 1 completed
Deliverables: Multiple deployment paths, deployment tracking
Success Criteria: Can deploy without GitHub Actions
```

### Phase 3: Advanced Health Checks (Week 5-6)
```
□ Task 3.1: Implement comprehensive health checks
  ├─ Database connection pool status
  ├─ Redis connectivity and latency
  ├─ External API availability (Stripe, OpenAI)
  └─ Resource utilization checks

□ Task 3.2: Create automated smoke test suite
  ├─ Critical path tests (auth, API, database)
  ├─ Performance baseline tests
  ├─ Integration with deployment pipeline
  └─ Failure notification system

□ Task 3.3: Implement automatic rollback
  ├─ Rollback trigger conditions
  ├─ Railway rollback integration
  ├─ Health check monitoring (5 min window)
  └─ Rollback notification alerts

□ Task 3.4: Set up performance baseline tracking
  ├─ Store deployment performance metrics
  ├─ Compare new deployment vs baseline
  ├─ Alert on regression
  └─ Dashboard visualization

Dependencies: Phase 2 completed
Deliverables: Auto-rollback on failure, smoke tests
Success Criteria: Broken deployments roll back automatically
```

### Phase 4: Observability (Week 7-8)
```
□ Task 4.1: Implement structured deployment logging
  ├─ Deployment event schema
  ├─ Log to Sentry for errors
  ├─ Log to CloudWatch for audit trail
  └─ Create deployment log dashboard

□ Task 4.2: Set up alerting system
  ├─ Configure Slack webhook integration
  ├─ Set up PagerDuty for critical alerts
  ├─ Create alert rules and thresholds
  └─ Test alert delivery

□ Task 4.3: Create deployment metrics dashboard
  ├─ Deployment frequency metrics
  ├─ Success/failure rate
  ├─ Mean time to recover (MTTR)
  └─ Health score visualization

□ Task 4.4: Implement distributed tracing
  ├─ Set up Sentry Performance
  ├─ Trace deployment requests
  ├─ Identify bottlenecks
  └─ Create performance reports

Dependencies: Phase 3 completed
Deliverables: Full observability stack, alerting
Success Criteria: Real-time deployment visibility
```

### Phase 5: Advanced Features (Week 9-10)
```
□ Task 5.1: Implement blue-green deployments
  ├─ Configure Railway for multiple replicas
  ├─ Gradual traffic migration (0% → 100%)
  ├─ Health-based traffic routing
  └─ Zero-downtime deployment testing

□ Task 5.2: Implement canary releases
  ├─ Deploy to 10% of traffic first
  ├─ Monitor health and metrics
  ├─ Gradually increase to 100%
  └─ Automatic rollback on issues

□ Task 5.3: Set up secret rotation automation
  ├─ Create secret rotation scripts
  ├─ Integrate with HashiCorp Vault
  ├─ Automated quarterly rotation
  └─ Audit trail and notifications

□ Task 5.4: Create deployment analytics
  ├─ Deployment frequency trends
  ├─ Failure pattern analysis
  ├─ Performance regression tracking
  └─ Cost per deployment metrics

Dependencies: Phase 4 completed
Deliverables: Advanced deployment strategies
Success Criteria: Zero-downtime production deployments
```

### Phase 6: Documentation & Training (Week 11-12)
```
□ Task 6.1: Create deployment runbooks
  ├─ Standard deployment procedure
  ├─ Emergency hotfix procedure
  ├─ Rollback procedure
  └─ Troubleshooting guide

□ Task 6.2: Create developer onboarding guide
  ├─ Setting up local environment
  ├─ Running pre-push validation
  ├─ Understanding deployment process
  └─ Interpreting health checks

□ Task 6.3: Create operations guide
  ├─ Monitoring deployment health
  ├─ Responding to alerts
  ├─ Manual rollback procedures
  └─ Secret rotation procedures

□ Task 6.4: Conduct team training
  ├─ Deployment architecture overview
  ├─ Using deployment tools
  ├─ Incident response procedures
  └─ Q&A and feedback

Dependencies: Phase 5 completed
Deliverables: Complete documentation, trained team
Success Criteria: All team members can deploy confidently
```

---

## 8. Risk Assessment & Mitigation

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|---------|-------------------|
| GitHub Actions billing failure | Medium | High | Implement Railway native deployments as primary backup |
| Railway platform outage | Low | Critical | Maintain CircleCI backup, document manual deployment |
| Database migration failure | Medium | Critical | Always run migrations with --dry-run first, maintain backups |
| Secret exposure in logs | Medium | High | Implement secret masking, audit log outputs |
| Rollback failure | Low | Critical | Test rollback monthly, maintain deployment snapshots |
| Health check false positives | Medium | Medium | Implement retry logic, multiple check types |
| Configuration drift | High | Medium | Automated drift detection, schema validation |
| Deployment notification failure | Medium | Low | Multiple notification channels (Slack, Email, PagerDuty) |

### Mitigation Strategies Detail

#### GitHub Actions Billing Failure
```
PRIMARY: Railway Native Deployments
├─ Always available regardless of GitHub billing
├─ Automatic fallback when GH Actions unavailable
└─ Same health checks and rollback capabilities

SECONDARY: CircleCI Free Tier
├─ 300 minutes/month free
├─ Minimal validation for emergency deploys
└─ Manual trigger only

TERTIARY: Local Deployment Script
├─ Railway CLI direct deployment
├─ No external dependencies
└─ Requires manual environment setup
```

#### Railway Platform Outage
```
DETECTION:
├─ Railway status page monitoring
├─ Automated ping every 5 minutes
└─ Slack alert on downtime

RESPONSE:
├─ Immediately notify all developers
├─ Pause all non-critical deployments
├─ Use backup hosting (Vercel) for frontend-only
└─ Escalate to Railway support

RECOVERY:
├─ Verify all services healthy after outage
├─ Check database integrity
├─ Run full smoke test suite
└─ Document outage in incident log
```

#### Configuration Drift
```
PREVENTION:
├─ Environment schema validation on every deploy
├─ Automated comparison of .env.example vs Railway
├─ Git commit for configuration changes
└─ Required PR review for env variable changes

DETECTION:
├─ Daily automated drift detection script
├─ Alert when Railway config != .env.example
└─ Dashboard showing configuration status

CORRECTION:
├─ Generate diff report
├─ Create PR to sync configurations
├─ Review and approve changes
└─ Deploy configuration update
```

---

## 9. Success Metrics

Define measurable goals to evaluate architecture effectiveness:

### Deployment Reliability
```
Metric: Deployment Success Rate
├─ Target: ≥ 99% success rate
├─ Measurement: (Successful deploys / Total deploys) * 100
└─ Current Baseline: Unknown (implement tracking)

Metric: Mean Time to Recovery (MTTR)
├─ Target: < 5 minutes
├─ Measurement: Time from failure detection to rollback complete
└─ Current Baseline: Manual rollback (15-30 minutes)

Metric: Failed Deployments Caught Pre-Production
├─ Target: 95% of issues caught before production
├─ Measurement: Issues found in staging / Total issues
└─ Current Baseline: Unknown
```

### Deployment Speed
```
Metric: Time to Deploy (Staging)
├─ Target: < 10 minutes (commit to healthy staging)
├─ Measurement: Time from git push to staging health check pass
└─ Current Baseline: 15-20 minutes

Metric: Time to Deploy (Production)
├─ Target: < 20 minutes (approval to healthy production)
├─ Measurement: Time from approval to production health check pass
└─ Current Baseline: 25-35 minutes

Metric: Deployment Frequency
├─ Target: Multiple times per day capability
├─ Measurement: Number of successful deployments per day
└─ Current Baseline: 1-2 times per day
```

### Developer Experience
```
Metric: False Positive Rate
├─ Target: < 5% of health checks are false positives
├─ Measurement: False alarms / Total health check failures
└─ Current Baseline: Unknown

Metric: Developer Confidence
├─ Target: 90% of developers feel confident deploying
├─ Measurement: Quarterly survey
└─ Current Baseline: Survey needed

Metric: Time Saved by Pre-Push Validation
├─ Target: Save 30+ minutes per developer per week
├─ Measurement: (Failed CI builds prevented) * 15 minutes
└─ Current Baseline: 0 (no pre-push validation)
```

### Cost Efficiency
```
Metric: CI/CD Cost per Deployment
├─ Target: < $0.50 per deployment
├─ Measurement: Total GitHub Actions cost / Number of deployments
└─ Current Baseline: Unknown

Metric: Wasted CI Minutes (Failed Builds)
├─ Target: < 10% of CI minutes wasted on preventable failures
├─ Measurement: (Failed CI minutes) / (Total CI minutes)
└─ Current Baseline: Unknown
```

---

## 10. Appendix

### A. Pre-Push Validation Script

```bash
#!/bin/bash
# .husky/pre-push

echo "🔍 Running pre-push validation..."

# Step 1: Run unit tests for affected files
echo "📋 Step 1: Running tests..."
npm run test -- --bail --findRelatedTests $(git diff --name-only @{u} | grep -E '\.(ts|tsx|js|jsx)$' | xargs)

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Push blocked."
  exit 1
fi

# Step 2: Validate environment schema
echo "📋 Step 2: Validating environment schema..."
node scripts/validate-environment.js

if [ $? -ne 0 ]; then
  echo "❌ Environment validation failed. Push blocked."
  exit 1
fi

# Step 3: Build check
echo "📋 Step 3: Running build check..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Push blocked."
  exit 1
fi

echo "✅ All pre-push checks passed!"
exit 0
```

### B. Environment Validation Script

```javascript
// scripts/validate-environment.js

const { EnvironmentSchemas, validateEnvironment } = require('../config/environment.schema');
const fs = require('fs');
const path = require('path');

const ENVIRONMENT = process.argv[2] || process.env.NODE_ENV || 'development';

console.log(`Validating environment: ${ENVIRONMENT}`);

try {
  // Validate current environment
  validateEnvironment(ENVIRONMENT);

  // Compare .env.example with current environment
  const envExamplePath = path.join(__dirname, '../.env.example');
  const envExample = fs.readFileSync(envExamplePath, 'utf-8');

  const envVars = envExample
    .split('\n')
    .filter(line => line.match(/^[A-Z_]+=/) !== null)
    .map(line => line.split('=')[0]);

  const missingVars = envVars.filter(varName => {
    return process.env[varName] === undefined;
  });

  if (missingVars.length > 0 && ENVIRONMENT !== 'development') {
    console.warn(`⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`);
  }

  console.log('✅ Environment validation passed');
  process.exit(0);

} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error.message);
  process.exit(1);
}
```

### C. Smoke Test Suite

```typescript
// scripts/smoke-tests.ts

import axios from 'axios';

interface SmokeTestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

async function runSmokeTests(baseUrl: string): Promise<SmokeTestResult[]> {
  const results: SmokeTestResult[] = [];

  // Test 1: Health endpoint
  const healthStart = Date.now();
  try {
    const response = await axios.get(`${baseUrl}/api/health`, { timeout: 5000 });
    results.push({
      name: 'Health Check',
      passed: response.status === 200,
      duration: Date.now() - healthStart,
    });
  } catch (error) {
    results.push({
      name: 'Health Check',
      passed: false,
      duration: Date.now() - healthStart,
      error: error.message,
    });
  }

  // Test 2: Deep health check
  const deepHealthStart = Date.now();
  try {
    const response = await axios.get(`${baseUrl}/api/health/deep`, { timeout: 10000 });
    const data = response.data;

    const allHealthy = Object.values(data.checks).every(
      (check: any) => check.status === 'ok'
    );

    results.push({
      name: 'Deep Health Check',
      passed: allHealthy,
      duration: Date.now() - deepHealthStart,
    });
  } catch (error) {
    results.push({
      name: 'Deep Health Check',
      passed: false,
      duration: Date.now() - deepHealthStart,
      error: error.message,
    });
  }

  // Test 3: API models endpoint
  const modelsStart = Date.now();
  try {
    const response = await axios.get(`${baseUrl}/api/v1/models`, { timeout: 5000 });
    results.push({
      name: 'API Models Endpoint',
      passed: response.status === 200 && Array.isArray(response.data.data),
      duration: Date.now() - modelsStart,
    });
  } catch (error) {
    results.push({
      name: 'API Models Endpoint',
      passed: false,
      duration: Date.now() - modelsStart,
      error: error.message,
    });
  }

  return results;
}

async function main() {
  const baseUrl = process.argv[2];

  if (!baseUrl) {
    console.error('Usage: node smoke-tests.js <base-url>');
    process.exit(1);
  }

  console.log(`🧪 Running smoke tests against: ${baseUrl}\n`);

  const results = await runSmokeTests(baseUrl);

  let allPassed = true;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name} (${result.duration}ms)`);

    if (!result.passed) {
      allPassed = false;
      console.error(`   Error: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('✅ All smoke tests passed');
    process.exit(0);
  } else {
    console.log('❌ Some smoke tests failed');
    process.exit(1);
  }
}

main();
```

### D. Deployment Notification Template

```typescript
// lib/notifications/deployment.ts

export interface DeploymentNotification {
  environment: 'staging' | 'production';
  status: 'started' | 'success' | 'failed' | 'rolled_back';
  version: string;
  commit: string;
  triggeredBy: string;
  duration?: number;
  healthScore?: number;
  rollbackReason?: string;
}

export async function sendDeploymentNotification(notification: DeploymentNotification) {
  const slackPayload = {
    text: `Deployment ${notification.status}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${getStatusEmoji(notification.status)} Deployment ${notification.status.toUpperCase()}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Environment:*\n${notification.environment}`,
          },
          {
            type: 'mrkdwn',
            text: `*Version:*\n${notification.version}`,
          },
          {
            type: 'mrkdwn',
            text: `*Commit:*\n${notification.commit.substring(0, 7)}`,
          },
          {
            type: 'mrkdwn',
            text: `*Triggered by:*\n${notification.triggeredBy}`,
          },
        ],
      },
    ],
  };

  if (notification.duration) {
    slackPayload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Duration:* ${notification.duration} seconds`,
      },
    });
  }

  if (notification.healthScore !== undefined) {
    slackPayload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Health Score:* ${(notification.healthScore * 100).toFixed(1)}%`,
      },
    });
  }

  if (notification.rollbackReason) {
    slackPayload.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Rollback Reason:*\n${notification.rollbackReason}`,
      },
    });
  }

  // Send to Slack
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload),
  });

  // Send to PagerDuty (critical only)
  if (notification.status === 'failed' && notification.environment === 'production') {
    await sendPagerDutyAlert(notification);
  }
}

function getStatusEmoji(status: string): string {
  const emojis = {
    started: '🚀',
    success: '✅',
    failed: '❌',
    rolled_back: '🔄',
  };
  return emojis[status] || '❓';
}
```

---

## Conclusion

This deployment architecture provides a comprehensive solution to the fragility issues in the current pipeline. By implementing multi-stage validation, redundant CI/CD paths, comprehensive health checks, automatic rollbacks, and full observability, the system becomes resilient to common failure modes while maintaining developer velocity.

### Key Benefits

1. **Early Failure Detection**: Pre-push validation catches 95% of issues before CI
2. **No Single Point of Failure**: Multiple deployment paths ensure availability
3. **Automatic Recovery**: Health-based rollbacks minimize downtime
4. **Full Visibility**: Comprehensive observability enables rapid debugging
5. **Cost Efficiency**: Prevent wasted CI minutes on preventable failures
6. **Developer Confidence**: Clear processes and safety nets encourage frequent deployments

### Next Steps

1. Review this architecture document with the team
2. Prioritize implementation phases based on criticality
3. Begin Phase 1 implementation (foundation)
4. Schedule weekly reviews to track progress
5. Collect feedback and iterate on the design

---

**Document Version**: 1.0
**Last Updated**: 2026-02-08
**Author**: System Architect
**Status**: Proposal - Pending Review
