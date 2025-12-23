# QA Testing Checklist

**Issue:** #193 - Document Manual QA Testing Procedures

## Overview

This document provides a comprehensive testing checklist for critical user flows in the AINative Studio application.

---

## 1. Authentication Flows

### 1.1 User Registration

| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Navigate to `/signup` | Signup form displays | [ ] |
| 2 | Leave fields empty, click submit | Validation errors shown | [ ] |
| 3 | Enter invalid email format | Email validation error | [ ] |
| 4 | Enter password < 8 chars | Password validation error | [ ] |
| 5 | Enter valid details, submit | Account created | [ ] |
| 6 | Check email | Verification email received | [ ] |
| 7 | Click verification link | Email verified | [ ] |
| 8 | Login with new account | Successful login | [ ] |

### 1.2 User Login

| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Navigate to `/login` | Login form displays | [ ] |
| 2 | Enter invalid credentials | Error message shown | [ ] |
| 3 | Enter valid credentials | Redirected to dashboard | [ ] |
| 4 | Check "Remember me" | Session persists | [ ] |
| 5 | Click "Forgot password" | Reset form displays | [ ] |

### 1.3 Password Reset

| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Navigate to forgot password | Form displays | [ ] |
| 2 | Enter registered email | Success message shown | [ ] |
| 3 | Check email | Reset link received | [ ] |
| 4 | Click reset link | Reset form displays | [ ] |
| 5 | Enter new password | Password updated | [ ] |
| 6 | Login with new password | Successful login | [ ] |

### 1.4 OAuth Login

| Provider | Test | Pass |
|----------|------|------|
| Google | Click → Authorize → Redirect | [ ] |
| GitHub | Click → Authorize → Redirect | [ ] |

---

## 2. Navigation Testing

### 2.1 Public Pages

| Page | URL | Elements to Verify | Pass |
|------|-----|-------------------|------|
| Homepage | `/` | Hero, features, CTA | [ ] |
| Pricing | `/pricing` | Plans, toggle, CTAs | [ ] |
| AI Kit | `/ai-kit` | Product info, features | [ ] |
| ZeroDB | `/zerodb` | Product info, demo | [ ] |
| Blog | `/blog` | Post listing, pagination | [ ] |
| About | `/about` | Team, mission | [ ] |
| Contact | `/contact` | Form, info | [ ] |

### 2.2 Dashboard Navigation

| Section | URL | Elements to Verify | Pass |
|---------|-----|-------------------|------|
| Main | `/dashboard` | Stats, quick actions | [ ] |
| Agents | `/dashboard/agents` | List, CRUD | [ ] |
| Organizations | `/dashboard/organizations` | List, details | [ ] |
| Teams | `/dashboard/teams` | List, members | [ ] |
| AI Settings | `/dashboard/ai-settings` | Providers, config | [ ] |
| Sessions | `/dashboard/sessions` | List, memory | [ ] |
| ZeroDB | `/dashboard/zerodb` | Namespaces, query | [ ] |
| Webhooks | `/dashboard/webhooks` | List, CRUD | [ ] |
| Email | `/dashboard/email` | Templates, send | [ ] |

### 2.3 Admin Navigation

| Section | URL | Access Control | Pass |
|---------|-----|----------------|------|
| Admin Dashboard | `/admin` | Admin only | [ ] |
| Users | `/admin/users` | Admin only | [ ] |
| Audit Logs | `/admin/audit` | Admin only | [ ] |
| Monitoring | `/admin/monitoring` | Admin only | [ ] |

---

## 3. Form Testing

### 3.1 General Form Tests

For each form, verify:

- [ ] Required field validation
- [ ] Field format validation (email, URL, etc.)
- [ ] Character limit enforcement
- [ ] Error message clarity
- [ ] Submit button disabled during processing
- [ ] Success feedback displayed
- [ ] Form reset after successful submission

### 3.2 Specific Forms

| Form | Location | Special Validations |
|------|----------|-------------------|
| Signup | `/signup` | Email uniqueness |
| Login | `/login` | Rate limiting |
| Create Agent | `/dashboard/agents` | Name uniqueness |
| Create Webhook | `/dashboard/webhooks` | URL format |
| Email Template | `/dashboard/email` | Template syntax |

---

## 4. CRUD Operations Testing

### 4.1 Agents

| Operation | Steps | Expected | Pass |
|-----------|-------|----------|------|
| Create | Fill form → Submit | Agent appears in list | [ ] |
| Read | Click agent | Details displayed | [ ] |
| Update | Edit → Save | Changes persisted | [ ] |
| Delete | Click delete → Confirm | Agent removed | [ ] |

### 4.2 Webhooks

| Operation | Steps | Expected | Pass |
|-----------|-------|----------|------|
| Create | Fill form → Submit | Webhook appears in list | [ ] |
| Read | Click webhook | Details displayed | [ ] |
| Update | Edit → Save | Changes persisted | [ ] |
| Delete | Click delete → Confirm | Webhook removed | [ ] |
| Test | Click test → Verify | Test payload sent | [ ] |

### 4.3 Organizations

| Operation | Steps | Expected | Pass |
|-----------|-------|----------|------|
| Create | Fill form → Submit | Org appears in list | [ ] |
| View details | Click org | All tabs work | [ ] |
| Add member | Invite → Accept | Member added | [ ] |
| Remove member | Remove → Confirm | Member removed | [ ] |

---

## 5. Error Handling Testing

### 5.1 Network Errors

| Scenario | Test Method | Expected | Pass |
|----------|-------------|----------|------|
| API timeout | Throttle network | Loading → Error message | [ ] |
| API down | Block API requests | Graceful error display | [ ] |
| Intermittent | Flaky connection | Retry or error | [ ] |

### 5.2 User Errors

| Scenario | Test Method | Expected | Pass |
|----------|-------------|----------|------|
| 404 page | Visit `/nonexistent` | Custom 404 page | [ ] |
| 500 error | Trigger server error | Custom error page | [ ] |
| Session expired | Wait/clear session | Redirect to login | [ ] |

---

## 6. State Management Testing

### 6.1 Session Persistence

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Refresh page | Login → Refresh | Stay logged in | [ ] |
| New tab | Login → Open new tab | Session shared | [ ] |
| Close/reopen | Login → Close → Reopen | Stay logged in | [ ] |
| Logout | Click logout | Session cleared | [ ] |

### 6.2 Data Persistence

| Test | Steps | Expected | Pass |
|------|-------|----------|------|
| Form draft | Fill form → Navigate away → Return | Data preserved | [ ] |
| Filter state | Apply filters → Navigate → Return | Filters preserved | [ ] |
| Sort state | Sort table → Navigate → Return | Sort preserved | [ ] |

---

## 7. Integration Testing

### 7.1 Payment Flow (Stripe)

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Select Pro plan | Redirect to checkout | [ ] |
| 2 | Enter test card | Card accepted | [ ] |
| 3 | Complete payment | Success page shown | [ ] |
| 4 | Check account | Subscription active | [ ] |
| 5 | Cancel subscription | Cancellation flow | [ ] |

Test Cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### 7.2 Email Integration

| Test | Expected | Pass |
|------|----------|------|
| Welcome email | Sent on signup | [ ] |
| Password reset | Sent on request | [ ] |
| Notification email | Sent on trigger | [ ] |

---

## 8. Security Testing

### 8.1 Authentication

| Test | Method | Expected | Pass |
|------|--------|----------|------|
| Brute force | 5+ failed logins | Account locked/CAPTCHA | [ ] |
| Session hijacking | Copy session cookie | Session invalid | [ ] |
| CSRF | Submit without token | Request rejected | [ ] |

### 8.2 Authorization

| Test | Method | Expected | Pass |
|------|--------|----------|------|
| Access admin (non-admin) | Direct URL | Access denied | [ ] |
| Access other user data | Modify ID in URL | Access denied | [ ] |
| API without auth | Call API directly | 401 Unauthorized | [ ] |

### 8.3 Input Validation

| Test | Input | Expected | Pass |
|------|-------|----------|------|
| XSS | `<script>alert(1)</script>` | Escaped/rejected | [ ] |
| SQL Injection | `' OR '1'='1` | Escaped/rejected | [ ] |
| Path traversal | `../../../etc/passwd` | Rejected | [ ] |

---

## 9. Test Execution Log

| Date | Tester | Environment | Results | Notes |
|------|--------|-------------|---------|-------|
| | | | | |
| | | | | |
| | | | | |

---

## 10. Bug Reporting Template

```markdown
## Bug Report

**Title:** [Brief description]

**Environment:**
- URL:
- Browser:
- Device:

**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**

**Actual Result:**

**Screenshots/Videos:**

**Severity:** P0 / P1 / P2 / P3

**Additional Notes:**
```
