# Accessibility Testing Guide

**Issue:** #193 - Document Manual QA Testing Procedures

## Overview

This document outlines accessibility testing procedures to ensure WCAG 2.1 AA compliance for the AINative Studio application.

---

## Testing Tools

### Automated Tools

| Tool | Purpose | URL |
|------|---------|-----|
| axe DevTools | Browser extension | [axe](https://www.deque.com/axe/devtools/) |
| WAVE | Web accessibility evaluator | [wave.webaim.org](https://wave.webaim.org/) |
| Lighthouse | Accessibility audit | Built into Chrome DevTools |
| Pa11y | CLI accessibility testing | [pa11y.org](https://pa11y.org/) |

### Manual Testing Tools

| Tool | Purpose |
|------|---------|
| Screen Reader | NVDA (Windows), VoiceOver (Mac) |
| Color Contrast Checker | WebAIM Contrast Checker |
| Keyboard Navigation | Manual testing |

---

## WCAG 2.1 AA Checklist

### 1. Perceivable

#### 1.1 Text Alternatives

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| All images have alt text | Inspect images | [ ] |
| Decorative images use `alt=""` | Inspect code | [ ] |
| Complex images have descriptions | Review content | [ ] |
| Icons have accessible labels | Screen reader test | [ ] |

**Test Script:**
```javascript
// Run in console to find images without alt
document.querySelectorAll('img:not([alt])').forEach(img => {
  console.log('Missing alt:', img.src);
});
```

#### 1.2 Media Alternatives

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| Videos have captions | Review videos | [ ] |
| Audio has transcripts | Review audio | [ ] |
| Media controls are accessible | Keyboard test | [ ] |

#### 1.3 Adaptable Content

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| Content readable at 200% zoom | Browser zoom | [ ] |
| Semantic HTML used | Inspect markup | [ ] |
| Reading order logical | Screen reader | [ ] |
| Tables have headers | Inspect tables | [ ] |

#### 1.4 Distinguishable

| Requirement | Test Method | Minimum | Pass |
|-------------|-------------|---------|------|
| Text contrast ratio | Contrast checker | 4.5:1 | [ ] |
| Large text contrast | Contrast checker | 3:1 | [ ] |
| Non-text contrast | Contrast checker | 3:1 | [ ] |
| Text resizable to 200% | Browser zoom | No loss | [ ] |

### 2. Operable

#### 2.1 Keyboard Accessible

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| All functions via keyboard | Tab through page | [ ] |
| No keyboard traps | Navigate modals | [ ] |
| Skip links work | Tab → Enter | [ ] |
| Focus order logical | Tab through page | [ ] |

**Keyboard Testing Script:**
```
1. Start at browser address bar
2. Press Tab to enter page
3. Continue Tab through all interactive elements
4. Verify focus visible on each element
5. Press Enter/Space to activate buttons
6. Press Escape to close modals
7. Use Arrow keys in menus/dropdowns
```

#### 2.2 Focus Indicators

| Element | Focus Visible | Pass |
|---------|---------------|------|
| Buttons | Ring/outline visible | [ ] |
| Links | Underline/color change | [ ] |
| Form inputs | Border/outline visible | [ ] |
| Menu items | Highlighted | [ ] |
| Cards/tiles | Border/shadow | [ ] |

#### 2.3 Time-based Content

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| Session timeout warning | Wait/trigger | [ ] |
| Ability to extend session | Verify dialog | [ ] |
| Auto-playing media pause | Verify controls | [ ] |

#### 2.4 Navigation

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| Skip navigation link | Tab first element | [ ] |
| Page titles descriptive | Check `<title>` | [ ] |
| Headings hierarchy | Inspect headings | [ ] |
| Multiple ways to find content | Nav + search | [ ] |

### 3. Understandable

#### 3.1 Readable

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| Language declared | Check `<html lang>` | [ ] |
| Language changes marked | Check `lang` attributes | [ ] |
| Abbreviations explained | Hover/expand | [ ] |

#### 3.2 Predictable

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| Consistent navigation | Check all pages | [ ] |
| Consistent identification | Same icons/labels | [ ] |
| No unexpected changes | Interact with elements | [ ] |

#### 3.3 Input Assistance

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| Error identification | Submit invalid form | [ ] |
| Labels/instructions | Review forms | [ ] |
| Error suggestions | Submit invalid form | [ ] |
| Error prevention | Test critical actions | [ ] |

### 4. Robust

#### 4.1 Compatible

| Requirement | Test Method | Pass |
|-------------|-------------|------|
| Valid HTML | W3C Validator | [ ] |
| ARIA used correctly | axe DevTools | [ ] |
| Name, role, value | Screen reader test | [ ] |

---

## Screen Reader Testing

### VoiceOver (Mac)

**Setup:**
```
System Preferences → Accessibility → VoiceOver → Enable
Shortcut: Cmd + F5
```

**Common Commands:**
| Action | Keys |
|--------|------|
| Next item | VO + Right Arrow |
| Previous item | VO + Left Arrow |
| Interact with item | VO + Shift + Down Arrow |
| Stop interacting | VO + Shift + Up Arrow |
| Read all | VO + A |
| Rotor (navigate by type) | VO + U |

### NVDA (Windows)

**Setup:**
Download from [nvaccess.org](https://www.nvaccess.org/)

**Common Commands:**
| Action | Keys |
|--------|------|
| Next item | Tab or Down Arrow |
| Previous item | Shift + Tab or Up Arrow |
| Activate | Enter or Space |
| Read all | NVDA + Down Arrow |
| List headings | NVDA + F7 |
| List landmarks | D |

### Testing Checklist

| Page | Headings | Landmarks | Links | Forms | Pass |
|------|----------|-----------|-------|-------|------|
| Homepage | [ ] | [ ] | [ ] | N/A | [ ] |
| Login | [ ] | [ ] | [ ] | [ ] | [ ] |
| Dashboard | [ ] | [ ] | [ ] | [ ] | [ ] |
| Settings | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## Color Contrast Testing

### Requirements

| Text Type | Size | Minimum Ratio |
|-----------|------|---------------|
| Normal text | < 18pt | 4.5:1 |
| Large text | ≥ 18pt or 14pt bold | 3:1 |
| UI components | N/A | 3:1 |
| Graphical objects | N/A | 3:1 |

### Testing Tools

1. **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
2. **Chrome DevTools:** Inspect element → Styles → Color picker shows ratio
3. **axe DevTools:** Automatic detection

### Common Problem Areas

| Element | Check | Pass |
|---------|-------|------|
| Placeholder text | Light gray on white | [ ] |
| Disabled buttons | Low contrast text | [ ] |
| Links in body text | Distinguishable from text | [ ] |
| Error messages | Red on white | [ ] |
| Success messages | Green on white | [ ] |
| Chart labels | Against chart colors | [ ] |

---

## Automated Testing Integration

### Pa11y CLI

```bash
# Install
npm install -g pa11y

# Test single page
pa11y https://staging.ainative.studio

# Test multiple pages
pa11y https://staging.ainative.studio/login
pa11y https://staging.ainative.studio/dashboard
```

### axe-core with Jest

```typescript
// __tests__/accessibility.test.ts
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import HomePage from '@/app/page';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Homepage has no accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Lighthouse CI

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Check
on: [push, pull_request]
jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            https://staging.ainative.studio/
            https://staging.ainative.studio/login
          configPath: ./lighthouserc.json
```

---

## Remediation Priority

| Severity | Impact | Fix Timeline |
|----------|--------|--------------|
| Critical | Prevents access | Before release |
| Serious | Major barrier | Within sprint |
| Moderate | Some difficulty | Next sprint |
| Minor | Inconvenience | Backlog |

---

## Common Issues & Fixes

### Missing Alt Text

```tsx
// Bad
<img src="/hero.jpg" />

// Good
<img src="/hero.jpg" alt="AI-powered development platform illustration" />

// Decorative
<img src="/decoration.svg" alt="" role="presentation" />
```

### Poor Focus Indication

```css
/* Bad - removes focus */
:focus {
  outline: none;
}

/* Good - custom focus */
:focus-visible {
  outline: 2px solid #4F46E5;
  outline-offset: 2px;
}
```

### Missing Form Labels

```tsx
// Bad
<input type="email" placeholder="Email" />

// Good
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="name@example.com" />
```

### Color-Only Information

```tsx
// Bad - relies only on color
<span className="text-red-500">Error</span>

// Good - includes icon/text
<span className="text-red-500">
  <ErrorIcon /> Error: Invalid email
</span>
```

---

## Testing Log

| Date | Tester | Tool | Pages Tested | Issues Found | Pass |
|------|--------|------|--------------|--------------|------|
| | | | | | |
| | | | | | |
