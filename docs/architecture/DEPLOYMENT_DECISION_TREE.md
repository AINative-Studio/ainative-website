# Deployment Decision Tree & Flowcharts

This document provides visual decision trees and flowcharts for the deployment process. Use these diagrams to understand the deployment workflow and make decisions at each stage.

---

## 1. Main Deployment Decision Tree

```
                         START: Code Change Ready
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Is this a hotfix   │
                         │  for production?    │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    │                                │
                   YES                              NO
                    │                                │
                    ▼                                ▼
         ┌─────────────────────┐        ┌─────────────────────┐
         │  EMERGENCY HOTFIX   │        │  STANDARD DEPLOY    │
         │  PROCESS (Fast)     │        │  PROCESS (Full)     │
         └──────────┬──────────┘        └──────────┬──────────┘
                    │                                │
                    │                                ▼
                    │                    ┌─────────────────────┐
                    │                    │  Pre-commit hooks   │
                    │                    │  pass?              │
                    │                    └──────────┬──────────┘
                    │                               │
                    │                       ┌───────┴────────┐
                    │                       │                │
                    │                      YES              NO
                    │                       │                │
                    │                       │                ▼
                    │                       │     ┌──────────────────┐
                    │                       │     │  Fix lint/format │
                    │                       │     │  issues          │
                    │                       │     └──────────────────┘
                    │                       │
                    │                       ▼
                    │           ┌─────────────────────┐
                    │           │  Pre-push validation│
                    │           │  pass?              │
                    │           └──────────┬──────────┘
                    │                      │
                    │              ┌───────┴────────┐
                    │              │                │
                    │             YES              NO
                    │              │                │
                    │              │                ▼
                    │              │     ┌──────────────────┐
                    │              │     │  Fix tests/build │
                    │              │     │  BLOCKED         │
                    │              │     └──────────────────┘
                    │              │
                    │              ▼
                    │   ┌─────────────────────┐
                    │   │  Push to GitHub     │
                    │   └──────────┬──────────┘
                    │              │
                    │              ▼
                    │   ┌─────────────────────┐
                    │   │  GitHub Actions     │ NO  ┌──────────────────┐
                    │   │  available?         ├────>│  Use Railway     │
                    │   └──────────┬──────────┘     │  Native Deploy   │
                    │              │                └────────┬─────────┘
                    │             YES                        │
                    │              │                         │
                    │              ▼                         │
                    │   ┌─────────────────────┐             │
                    │   │  Run full CI suite  │             │
                    │   │  (lint, test, build)│             │
                    │   └──────────┬──────────┘             │
                    │              │                         │
                    │              ├─────────────────────────┘
                    │              │
                    │              ▼
                    │   ┌─────────────────────┐
                    │   │  All CI checks      │ NO  ┌──────────────────┐
                    │   │  passed?            ├────>│  Alert developer │
                    │   └──────────┬──────────┘     │  Block deploy    │
                    │              │ YES             └──────────────────┘
                    │              │
                    └──────────────┤
                                   │
                                   ▼
                       ┌─────────────────────┐
                       │  Environment schema │
                       │  validation pass?   │
                       └──────────┬──────────┘
                                  │
                          ┌───────┴────────┐
                          │                │
                         YES              NO
                          │                │
                          │                ▼
                          │     ┌──────────────────┐
                          │     │  Fix env config  │
                          │     │  Block deploy    │
                          │     └──────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │  Deploy to STAGING  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Staging health     │ NO  ┌──────────────────┐
              │  checks pass?       ├────>│  Auto rollback   │
              │  (retry 3x)         │     │  Alert ops       │
              └──────────┬──────────┘     └──────────────────┘
                         │ YES
                         │
                         ▼
              ┌─────────────────────┐
              │  Run smoke tests    │
              │  on staging         │
              └──────────┬──────────┘
                         │
                 ┌───────┴────────┐
                 │                │
                YES              NO
                 │                │
                 │                ▼
                 │     ┌──────────────────┐
                 │     │  Investigate     │
                 │     │  Block production│
                 │     └──────────────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │  Is this emergency  │
      │  hotfix?            │
      └──────────┬──────────┘
                 │
         ┌───────┴────────┐
         │                │
        YES              NO
         │                │
         │                ▼
         │     ┌──────────────────┐
         │     │  Wait for manual │
         │     │  approval        │
         │     │  (GitHub Env)    │
         │     └────────┬─────────┘
         │              │
         │              │ APPROVED
         └──────────────┤
                        │
                        ▼
            ┌─────────────────────┐
            │  Create backup      │
            │  snapshot           │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Deploy to          │
            │  PRODUCTION         │
            │  (Blue-Green)       │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Health checks pass?│ NO  ┌──────────────────┐
            │  (15 min monitor)   ├────>│  Auto rollback   │
            └──────────┬──────────┘     │  to backup       │
                       │ YES             └──────────────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Canary release     │
            │  10% → 50% → 100%   │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Performance        │ DEGRADED ┌─────────────┐
            │  baseline OK?       ├─────────>│  Rollback   │
            └──────────┬──────────┘          └─────────────┘
                       │ OK
                       │
                       ▼
            ┌─────────────────────┐
            │  Tag release        │
            │  Send notifications │
            │  Update registry    │
            └──────────┬──────────┘
                       │
                       ▼
                   [SUCCESS]
```

---

## 2. Health Check Decision Flow

```
                    DEPLOYMENT COMPLETED
                            │
                            ▼
                ┌─────────────────────┐
                │  Wait 30 seconds    │
                │  for startup        │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
       ┌───────┤  GET /api/health    │
       │       └──────────┬──────────┘
       │                  │
       │          ┌───────┴────────┐
       │          │                │
       │      200 OK           Non-200
       │          │                │
       │          │                ▼
       │          │    ┌──────────────────────┐
       │          │    │  Retry count < 3?    │
       │          │    └────────┬─────────────┘
       │          │             │
       │          │     ┌───────┴────────┐
       │          │     │                │
       │          │    YES              NO
       │          │     │                │
       │          │     │                ▼
       │          │     │    ┌─────────────────┐
       │          │     │    │  IMMEDIATE      │
       │          │     │    │  ROLLBACK       │
       │          │     │    └─────────────────┘
       │          │     │
       │          │     │  Wait 10 seconds
       │          │     │
       │          │     └────────┐
       │          │              │
       └──────────┴──────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  GET /api/health/   │
        │  deep               │
        └──────────┬──────────┘
                   │
           ┌───────┴────────┐
           │                │
       All OK         Any Degraded
           │                │
           │                ▼
           │    ┌──────────────────────┐
           │    │  Critical service?   │
           │    └────────┬─────────────┘
           │             │
           │     ┌───────┴────────┐
           │     │                │
           │    YES              NO
           │     │                │
           │     │                ▼
           │     │    ┌─────────────────┐
           │     │    │  Log warning    │
           │     │    │  Continue       │
           │     │    └─────────────────┘
           │     │
           │     ▼
           │  ┌─────────────────┐
           │  │  ROLLBACK       │
           │  └─────────────────┘
           │
           ▼
   ┌─────────────────────┐
   │  Run smoke tests    │
   │  (5 critical paths) │
   └──────────┬──────────┘
              │
      ┌───────┴────────┐
      │                │
   All Pass       Any Fail
      │                │
      │                ▼
      │    ┌──────────────────────┐
      │    │  Retry failed test   │
      │    │  once                │
      │    └────────┬─────────────┘
      │             │
      │     ┌───────┴────────┐
      │     │                │
      │   Pass            Fail
      │     │                │
      │     │                ▼
      │     │    ┌─────────────────┐
      │     │    │  ROLLBACK       │
      │     │    └─────────────────┘
      │     │
      └─────┘
           │
           ▼
   ┌─────────────────────┐
   │  Monitor for 15 min │
   │  - Error rate       │
   │  - Latency          │
   │  - Resource usage   │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────────┐
   │  Metrics vs baseline    │
   └──────────┬──────────────┘
              │
      ┌───────┴────────┐
      │                │
  Within SLA      Degraded
      │                │
      │                ▼
      │    ┌──────────────────────┐
      │    │  Sustained > 5 min?  │
      │    └────────┬─────────────┘
      │             │
      │     ┌───────┴────────┐
      │     │                │
      │    YES              NO
      │     │                │
      │     │                ▼
      │     │    ┌─────────────────┐
      │     │    │  Log warning    │
      │     │    │  Continue       │
      │     │    └─────────────────┘
      │     │
      │     ▼
      │  ┌─────────────────┐
      │  │  ROLLBACK       │
      │  └─────────────────┘
      │
      ▼
  [HEALTHY]
  Continue to
  canary release
```

---

## 3. CI/CD Path Selection

```
                    PUSH TO GITHUB
                           │
                           ▼
               ┌─────────────────────┐
               │  Is GitHub Actions  │
               │  available?         │
               └──────────┬──────────┘
                          │
                  ┌───────┴────────┐
                  │                │
                 YES              NO
                  │                │
                  │                ▼
                  │    ┌──────────────────────┐
                  │    │  Check last           │
                  │    │  successful build     │
                  │    └────────┬─────────────┘
                  │             │
                  │     ┌───────┴────────┐
                  │     │                │
                  │  < 24 hrs        > 24 hrs
                  │     │                │
                  │     │                ▼
                  │     │    ┌─────────────────┐
                  │     │    │  Railway native │
                  │     │    │  deployment     │
                  │     │    └────────┬────────┘
                  │     │             │
                  │     │             ▼
                  │     │    ┌─────────────────┐
                  │     │    │  Success?       │
                  │     │    └────────┬────────┘
                  │     │             │
                  │     │     ┌───────┴────────┐
                  │     │     │                │
                  │     │    YES              NO
                  │     │     │                │
                  │     │     │                ▼
                  │     │     │    ┌─────────────────┐
                  │     │     │    │  CircleCI       │
                  │     │     │    │  backup path    │
                  │     │     │    └─────────────────┘
                  │     │     │
                  │     └─────┤
                  │           │
                  └───────────┤
                              │
                              ▼
                  ┌─────────────────────┐
                  │  PRIMARY CI PATH:   │
                  │  GitHub Actions     │
                  │  ├─ Lint            │
                  │  ├─ Type check      │
                  │  ├─ Unit tests      │
                  │  ├─ Integration     │
                  │  ├─ E2E tests       │
                  │  ├─ Build           │
                  │  └─ Bundle analysis │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  All checks pass?   │
                  └──────────┬──────────┘
                             │
                     ┌───────┴────────┐
                     │                │
                    YES              NO
                     │                │
                     │                ▼
                     │    ┌─────────────────┐
                     │    │  Notify         │
                     │    │  developer      │
                     │    │  Block deploy   │
                     │    └─────────────────┘
                     │
                     ▼
              [PROCEED TO STAGING]
```

---

## 4. Emergency Hotfix Fast Path

```
         CRITICAL BUG IN PRODUCTION
                    │
                    ▼
        ┌─────────────────────┐
        │  Assess severity    │
        └──────────┬──────────┘
                   │
           ┌───────┴────────┐
           │                │
      P0 Critical      P1 High
           │                │
           │                ▼
           │    ┌─────────────────┐
           │    │  Use standard   │
           │    │  deployment     │
           │    └─────────────────┘
           │
           ▼
   ┌─────────────────────┐
   │  Create hotfix      │
   │  branch from main   │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │  Make minimal fix   │
   │  (single change)    │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │  Run tests locally  │
   └──────────┬──────────┘
              │
      ┌───────┴────────┐
      │                │
    Pass            Fail
      │                │
      │                ▼
      │    ┌─────────────────┐
      │    │  Fix and retry  │
      │    └────────┬────────┘
      │             │
      └─────────────┘
              │
              ▼
   ┌─────────────────────┐
   │  Deployment option? │
   └──────────┬──────────┘
              │
      ┌───────┴────────────────┐
      │                        │
  Via Railway              Via GitHub
      │                        │
      ▼                        ▼
┌──────────────┐    ┌──────────────────┐
│ Railway CLI  │    │  Push to GitHub  │
│ deployment   │    │  Wait for CI     │
│ (fastest)    │    │  (safer)         │
└──────┬───────┘    └────────┬─────────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
      ┌─────────────────────┐
      │  Skip staging?      │
      │  (emergency only)   │
      └──────────┬──────────┘
                 │
         ┌───────┴────────┐
         │                │
        YES              NO
         │                │
         │                ▼
         │    ┌─────────────────┐
         │    │  Deploy staging │
         │    │  Quick verify   │
         │    └────────┬────────┘
         │             │
         └─────────────┘
                  │
                  ▼
      ┌─────────────────────┐
      │  Deploy PRODUCTION  │
      │  (direct)           │
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │  Monitor closely    │
      │  15 minutes         │
      └──────────┬──────────┘
                 │
         ┌───────┴────────┐
         │                │
    Stable          Issues
         │                │
         │                ▼
         │    ┌─────────────────┐
         │    │  Rollback       │
         │    │  immediately    │
         │    └─────────────────┘
         │
         ▼
   ┌─────────────────────┐
   │  Create proper PR   │
   │  with full tests    │
   │  (post-hotfix)      │
   └─────────────────────┘
```

---

## 5. Rollback Decision Matrix

```
TRIGGER EVENT OCCURS
        │
        ▼
┌────────────────────────────────────────┐
│  ROLLBACK TRIGGER ASSESSMENT           │
│                                        │
│  Health Check Failures                 │
│  ├─ 3 consecutive fails    → IMMEDIATE │
│  ├─ 5/10 fails             → IMMEDIATE │
│  └─ Timeout                → RETRY 3x  │
│                                        │
│  Error Rate                            │
│  ├─ > 5% of traffic        → IMMEDIATE │
│  ├─ > 10% of requests      → IMMEDIATE │
│  └─ Spike > 50 errors/min  → WAIT 2min │
│                                        │
│  Performance                           │
│  ├─ p95 > 3x baseline      → IMMEDIATE │
│  ├─ p95 > 2x baseline      → WAIT 5min │
│  └─ Avg > 1.5x baseline    → WAIT 10min│
│                                        │
│  Resource Utilization                  │
│  ├─ CPU > 95%              → WAIT 5min │
│  ├─ Memory > 95%           → IMMEDIATE │
│  ├─ DB pool > 95%          → IMMEDIATE │
│  └─ Disk > 95%             → IMMEDIATE │
│                                        │
│  Database                              │
│  ├─ Connection failed      → IMMEDIATE │
│  ├─ Query timeout          → WAIT 2min │
│  └─ Slow queries           → WAIT 10min│
│                                        │
│  External Services                     │
│  ├─ Critical API down      → IMMEDIATE │
│  ├─ Non-critical API down  → WAIT 5min │
│  └─ Degraded response      → WAIT 10min│
│                                        │
│  Manual Trigger                        │
│  └─ Ops team command       → IMMEDIATE │
└────────────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  IMMEDIATE?    │
        └────────┬───────┘
                 │
         ┌───────┴────────┐
         │                │
        YES              NO
         │                │
         │                ▼
         │    ┌─────────────────┐
         │    │  Wait specified │
         │    │  time           │
         │    └────────┬────────┘
         │             │
         │             ▼
         │    ┌─────────────────┐
         │    │  Re-check       │ Still bad
         │    │  condition      ├──────────┐
         │    └────────┬────────┘          │
         │             │                   │
         │        Resolved                 │
         │             │                   │
         │             ▼                   │
         │    ┌─────────────────┐          │
         │    │  Log warning    │          │
         │    │  Continue       │          │
         │    └─────────────────┘          │
         │                                 │
         └─────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────┐
              │  INITIATE       │
              │  ROLLBACK       │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Log rollback   │
              │  event          │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Stop new       │
              │  deployments    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Switch traffic │
              │  to previous    │
              │  version        │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Wait 30 sec    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Health check   │
              │  previous       │
              └────────┬────────┘
                       │
               ┌───────┴────────┐
               │                │
           Healthy          Unhealthy
               │                │
               │                ▼
               │    ┌─────────────────┐
               │    │  CRITICAL       │
               │    │  Both versions  │
               │    │  broken!        │
               │    │  Page ops team  │
               │    └─────────────────┘
               │
               ▼
        ┌─────────────────┐
        │  Notify team    │
        │  Create incident│
        │  Update status  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Post-rollback  │
        │  investigation  │
        └─────────────────┘
```

---

## 6. Configuration Drift Detection

```
        SCHEDULED CHECK (Daily 3am)
                  │
                  ▼
      ┌─────────────────────┐
      │  Read .env.example  │
      │  from repository    │
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │  Fetch Railway      │
      │  environment vars   │
      │  via API            │
      └──────────┬──────────┘
                 │
                 ▼
      ┌─────────────────────┐
      │  Compare variables  │
      └──────────┬──────────┘
                 │
         ┌───────┴────────┐
         │                │
    No drift         Drift detected
         │                │
         │                ▼
         │    ┌─────────────────────┐
         │    │  Categorize drift   │
         │    └──────────┬──────────┘
         │               │
         │       ┌───────┴────────┬────────────┐
         │       │                │            │
         │    Missing          Extra      Different
         │       │                │            │
         │       ▼                ▼            ▼
         │  ┌─────────┐      ┌─────────┐  ┌─────────┐
         │  │ Vars in │      │ Vars in │  │ Value   │
         │  │ example │      │ Railway │  │ changed │
         │  │ not in  │      │ not in  │  │ in one  │
         │  │ Railway │      │ example │  │ place   │
         │  └────┬────┘      └────┬────┘  └────┬────┘
         │       │                │            │
         │       └────────┬───────┴────────────┘
         │                │
         │                ▼
         │    ┌─────────────────────┐
         │    │  Generate drift     │
         │    │  report             │
         │    └──────────┬──────────┘
         │               │
         │               ▼
         │    ┌─────────────────────┐
         │    │  Severity?          │
         │    └──────────┬──────────┘
         │               │
         │       ┌───────┴────────┐
         │       │                │
         │    Critical         Warning
         │       │                │
         │       │                ▼
         │       │    ┌─────────────────┐
         │       │    │  Send Slack     │
         │       │    │  notification   │
         │       │    └─────────────────┘
         │       │
         │       ▼
         │  ┌─────────────────────┐
         │  │  Create GitHub      │
         │  │  issue              │
         │  │  Auto-assign DevOps │
         │  └──────────┬──────────┘
         │             │
         │             ▼
         │  ┌─────────────────────┐
         │  │  Generate PR to     │
         │  │  sync configs       │
         │  └─────────────────────┘
         │
         └────────────┐
                      │
                      ▼
          ┌─────────────────────┐
          │  Log check          │
          │  completion         │
          └─────────────────────┘
```

---

## 7. Quick Reference: When to Use Each Path

| Scenario | Deployment Path | Approval Required | Tests Run | Time Estimate |
|----------|----------------|-------------------|-----------|---------------|
| Feature development | Standard (GitHub Actions → Staging → Production) | Yes (manual) | Full suite | 30-45 min |
| Bug fix (non-critical) | Standard (GitHub Actions → Staging → Production) | Yes (manual) | Full suite | 30-45 min |
| P0 Production outage | Emergency hotfix (Railway CLI → Production) | No (deploy first) | Minimal | 5-10 min |
| P1 Critical bug | Emergency hotfix (GitHub Actions → Production) | Yes (expedited) | Core tests | 15-20 min |
| Configuration change | Standard (GitHub Actions → Staging → Production) | Yes (manual) | Full suite | 30-45 min |
| Dependency update | Standard (GitHub Actions → Staging → Production) | Yes (manual) | Full suite | 30-45 min |
| GitHub Actions outage | Railway native → Staging → Production | Yes (manual) | Railway tests | 20-30 min |
| Complete CI/CD outage | Local Railway CLI → Production | Yes (verbal) | None | 5 min |

---

## 8. Monitoring Thresholds Reference

```
┌─────────────────────────────────────────────────────────────┐
│                  HEALTH CHECK THRESHOLDS                     │
└─────────────────────────────────────────────────────────────┘

Response Time (ms)
├─ Healthy:    < 200ms (p95)
├─ Warning:    200-500ms (p95)
├─ Degraded:   500-1000ms (p95)
└─ Critical:   > 1000ms (p95)

Error Rate (%)
├─ Healthy:    < 0.1%
├─ Warning:    0.1-1%
├─ Degraded:   1-5%
└─ Critical:   > 5%

Database Connections
├─ Healthy:    < 60% pool
├─ Warning:    60-80% pool
├─ Degraded:   80-90% pool
└─ Critical:   > 90% pool

Memory Usage
├─ Healthy:    < 70%
├─ Warning:    70-85%
├─ Degraded:   85-95%
└─ Critical:   > 95%

CPU Usage
├─ Healthy:    < 60%
├─ Warning:    60-80%
├─ Degraded:   80-90%
└─ Critical:   > 90%

External API Latency
├─ Healthy:    < 500ms
├─ Warning:    500-2000ms
├─ Degraded:   2000-5000ms
└─ Critical:   > 5000ms or timeout
```

---

This decision tree document should be used in conjunction with the main deployment architecture document for a complete understanding of the deployment process.

**Document Version**: 1.0
**Last Updated**: 2026-02-08
**Related Documents**:
- `/docs/architecture/DEPLOYMENT_ARCHITECTURE.md`
- `/docs/architecture/DEPLOYMENT_IMPLEMENTATION_PLAN.md`
