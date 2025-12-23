# AINative Studio - Deployment Documentation

This directory contains all deployment-related documentation for the AINative Studio Next.js application.

## Documents

| Document | Description | Issue |
|----------|-------------|-------|
| [staging-deployment.md](./staging-deployment.md) | Staging environment setup | #66 |
| [uat-checklist.md](./uat-checklist.md) | User Acceptance Testing procedures | #67 |
| [rollback-plan.md](./rollback-plan.md) | Rollback procedures | #68 |
| [production-deployment.md](./production-deployment.md) | Production deployment guide | #69 |
| [monitoring-setup.md](./monitoring-setup.md) | Post-launch monitoring | #70 |

## Quick Reference

### Deployment Flow

```
1. Local Development
   └── npm run dev (port 3000)

2. Build Verification
   └── npm run build && npm run lint

3. Staging Deployment
   └── Deploy to staging.ainative.studio

4. UAT Testing
   └── Complete checklist in uat-checklist.md

5. Production Deployment
   └── Deploy to ainative.studio

6. Post-Launch
   └── Monitor using monitoring-setup.md
```

### Environment URLs

| Environment | URL | Branch |
|-------------|-----|--------|
| Development | http://localhost:3000 | feature/* |
| Staging | https://staging.ainative.studio | main |
| Production | https://ainative.studio | main (tagged) |

### Emergency Contacts

| Role | Contact |
|------|---------|
| DevOps Lead | devops@ainative.studio |
| On-Call Engineer | oncall@ainative.studio |

## Related Documentation

- [QA Testing Procedures](../qa/README.md)
- [Development Plan](../../.claude/development-plan.md)
