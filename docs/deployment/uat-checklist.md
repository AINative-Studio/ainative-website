# User Acceptance Testing (UAT) Checklist

**Issue:** #67 - [Story 8.2] Perform UAT
**Priority:** P0 - Critical

## Overview

This document outlines the UAT procedures for the AINative Studio Next.js application before production deployment.

## Test Environment

- **URL:** https://staging.ainative.studio
- **Browser:** Chrome (latest), Firefox (latest), Safari (latest)
- **Devices:** Desktop, Tablet, Mobile

## UAT Sign-off Requirements

- All critical paths must pass
- No P0/P1 bugs remaining
- Performance meets targets
- Accessibility standards met
- Stakeholder approval obtained

---

## 1. Public Pages Testing

### 1.1 Homepage (`/`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Page loads | Hero section visible | [ ] | |
| Navigation | All nav links work | [ ] | |
| Hero CTA | Links to signup | [ ] | |
| Features section | All features display | [ ] | |
| Testimonials | Carousel works | [ ] | |
| Footer | All links work | [ ] | |
| Mobile layout | Responsive design | [ ] | |

### 1.2 Pricing Page (`/pricing`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Page loads | All plans visible | [ ] | |
| Toggle monthly/annual | Prices update | [ ] | |
| Free tier CTA | Links to signup | [ ] | |
| Pro tier CTA | Links to checkout | [ ] | |
| Enterprise CTA | Opens contact form | [ ] | |
| Feature comparison | Table displays correctly | [ ] | |

### 1.3 AI Kit Page (`/ai-kit`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Page loads | Product info visible | [ ] | |
| Feature list | All features shown | [ ] | |
| Code examples | Syntax highlighting | [ ] | |
| CTA buttons | Work correctly | [ ] | |

### 1.4 ZeroDB Page (`/zerodb`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Page loads | Product info visible | [ ] | |
| Feature list | All features shown | [ ] | |
| Documentation links | Navigate correctly | [ ] | |
| Demo section | Interactive elements work | [ ] | |

### 1.5 Blog (`/blog`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Listing page | Posts display | [ ] | |
| Pagination | Works correctly | [ ] | |
| Post detail | Full content loads | [ ] | |
| Share buttons | Function correctly | [ ] | |

---

## 2. Authentication Testing

### 2.1 Login (`/login`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Page loads | Form displays | [ ] | |
| Valid credentials | Successful login | [ ] | |
| Invalid credentials | Error message shown | [ ] | |
| Password visibility | Toggle works | [ ] | |
| Forgot password | Link works | [ ] | |
| OAuth buttons | Redirect correctly | [ ] | |

### 2.2 Signup (`/signup`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Page loads | Form displays | [ ] | |
| Valid signup | Account created | [ ] | |
| Validation errors | Display correctly | [ ] | |
| Terms checkbox | Required | [ ] | |
| Email verification | Sent successfully | [ ] | |

### 2.3 Password Reset

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Request reset | Email sent | [ ] | |
| Reset link | Works correctly | [ ] | |
| New password | Validates properly | [ ] | |
| Login after reset | Successful | [ ] | |

---

## 3. Dashboard Testing

### 3.1 Main Dashboard (`/dashboard`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Page loads | Stats visible | [ ] | |
| Quick actions | All buttons work | [ ] | |
| Recent activity | Displays correctly | [ ] | |
| Navigation sidebar | All links work | [ ] | |

### 3.2 Agents (`/dashboard/agents`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| List agents | Displays correctly | [ ] | |
| Create agent | Form works | [ ] | |
| Edit agent | Updates saved | [ ] | |
| Delete agent | Confirmation works | [ ] | |
| Run agent | Executes correctly | [ ] | |

### 3.3 Organizations (`/dashboard/organizations`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| List orgs | Displays correctly | [ ] | |
| Create org | Form works | [ ] | |
| Org details | All tabs work | [ ] | |
| Member management | CRUD operations | [ ] | |

### 3.4 Teams (`/dashboard/teams`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| List teams | Displays correctly | [ ] | |
| Create team | Form works | [ ] | |
| Team details | All info shown | [ ] | |
| Member management | Works correctly | [ ] | |

### 3.5 AI Settings (`/dashboard/ai-settings`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Provider list | All providers shown | [ ] | |
| Configure provider | Settings save | [ ] | |
| Model selection | Works correctly | [ ] | |
| API key management | Secure handling | [ ] | |

### 3.6 Sessions (`/dashboard/sessions`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Session list | Displays correctly | [ ] | |
| Session details | Full info shown | [ ] | |
| Memory browser | Search works | [ ] | |
| Delete session | Confirmation works | [ ] | |

### 3.7 ZeroDB (`/dashboard/zerodb`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Namespace list | Displays correctly | [ ] | |
| Create namespace | Form works | [ ] | |
| Query builder | Executes queries | [ ] | |
| Vector browser | Displays vectors | [ ] | |
| Import/Export | Functions work | [ ] | |

### 3.8 Webhooks (`/dashboard/webhooks`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Webhook list | Displays correctly | [ ] | |
| Create webhook | Form works | [ ] | |
| Edit webhook | Updates saved | [ ] | |
| Delete webhook | Confirmation works | [ ] | |
| Test webhook | Sends test payload | [ ] | |

### 3.9 Email (`/dashboard/email`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Email templates | List displays | [ ] | |
| Create template | Form works | [ ] | |
| Preview template | Renders correctly | [ ] | |
| Send test email | Delivers | [ ] | |

---

## 4. Admin Testing

### 4.1 Admin Dashboard (`/admin`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Access control | Admin only | [ ] | |
| System stats | Displays correctly | [ ] | |
| Quick actions | All work | [ ] | |

### 4.2 User Management (`/admin/users`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| User list | Pagination works | [ ] | |
| Search users | Filters correctly | [ ] | |
| Edit user | Changes save | [ ] | |
| Suspend user | Works correctly | [ ] | |

### 4.3 Audit Logs (`/admin/audit`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| Log list | Displays correctly | [ ] | |
| Filter by date | Works correctly | [ ] | |
| Filter by action | Works correctly | [ ] | |
| Export logs | Downloads file | [ ] | |

### 4.4 Monitoring (`/admin/monitoring`)

| Test Case | Expected Result | Pass | Notes |
|-----------|-----------------|------|-------|
| System metrics | Display correctly | [ ] | |
| Charts render | No errors | [ ] | |
| Real-time updates | Work correctly | [ ] | |

---

## 5. Performance Testing

| Metric | Target | Actual | Pass |
|--------|--------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | | [ ] |
| FID (First Input Delay) | < 100ms | | [ ] |
| CLS (Cumulative Layout Shift) | < 0.1 | | [ ] |
| TTI (Time to Interactive) | < 3.8s | | [ ] |
| Total Bundle Size | < 500KB | | [ ] |

### Performance Testing Tools

```bash
# Lighthouse CI
npx lighthouse https://staging.ainative.studio --view

# WebPageTest
# Run at: https://www.webpagetest.org/
```

---

## 6. Accessibility Testing

| Test | Tool | Pass | Notes |
|------|------|------|-------|
| Color contrast | axe DevTools | [ ] | |
| Keyboard navigation | Manual | [ ] | |
| Screen reader | NVDA/VoiceOver | [ ] | |
| Focus indicators | Manual | [ ] | |
| Alt text | axe DevTools | [ ] | |
| ARIA labels | axe DevTools | [ ] | |

---

## 7. Browser Compatibility

| Browser | Version | Pass | Notes |
|---------|---------|------|-------|
| Chrome | Latest | [ ] | |
| Firefox | Latest | [ ] | |
| Safari | Latest | [ ] | |
| Edge | Latest | [ ] | |
| Chrome Mobile | Latest | [ ] | |
| Safari iOS | Latest | [ ] | |

---

## UAT Sign-off

### Stakeholder Approvals

| Stakeholder | Role | Approved | Date | Signature |
|-------------|------|----------|------|-----------|
| | Product Owner | [ ] | | |
| | Tech Lead | [ ] | | |
| | QA Lead | [ ] | | |
| | Design Lead | [ ] | | |

### Final Checklist

- [ ] All critical paths tested
- [ ] No P0 bugs remaining
- [ ] No P1 bugs remaining (or documented exceptions)
- [ ] Performance targets met
- [ ] Accessibility standards met
- [ ] All stakeholders approved

### UAT Completion Date: _______________

### Notes/Exceptions:

---

## Next Steps

After UAT approval:
1. Review [rollback-plan.md](./rollback-plan.md)
2. Schedule production deployment window
3. Proceed to [production-deployment.md](./production-deployment.md)
