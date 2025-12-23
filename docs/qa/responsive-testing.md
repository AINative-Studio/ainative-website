# Responsive Design Testing Guide

**Issue:** #193 - Document Manual QA Testing Procedures

## Overview

This document outlines testing procedures for ensuring the AINative Studio application is responsive across all device sizes.

---

## Viewport Breakpoints

| Breakpoint | Width | Devices |
|------------|-------|---------|
| xs | < 640px | Small phones |
| sm | 640px - 767px | Large phones |
| md | 768px - 1023px | Tablets |
| lg | 1024px - 1279px | Small laptops |
| xl | 1280px - 1535px | Desktops |
| 2xl | ≥ 1536px | Large displays |

### Common Device Sizes

| Device | Width × Height | Pixel Ratio |
|--------|----------------|-------------|
| iPhone SE | 375 × 667 | 2x |
| iPhone 14 | 390 × 844 | 3x |
| iPhone 14 Pro Max | 430 × 932 | 3x |
| iPad | 768 × 1024 | 2x |
| iPad Pro | 1024 × 1366 | 2x |
| MacBook Air | 1440 × 900 | 2x |
| Desktop | 1920 × 1080 | 1x |
| 4K Display | 3840 × 2160 | 1x |

---

## Testing Methods

### 1. Chrome DevTools Device Mode

**How to access:**
1. Open DevTools (F12 or Cmd+Option+I)
2. Click device toolbar icon (or Cmd+Shift+M)
3. Select device or enter custom dimensions

**Features:**
- Preset device profiles
- Custom dimensions
- Network throttling
- Touch simulation

### 2. Firefox Responsive Design Mode

**How to access:**
1. Open DevTools (F12)
2. Click Responsive Design Mode icon
3. Select device or custom size

### 3. Real Device Testing

For critical flows, test on actual devices:
- iPhone (iOS Safari)
- Android phone (Chrome)
- iPad (Safari)
- Android tablet (Chrome)

### 4. BrowserStack/Sauce Labs

For comprehensive device coverage:
- Multiple iOS/Android versions
- Different screen sizes
- Various browsers

---

## Testing Checklist

### Mobile (320px - 480px)

#### Layout

| Check | Expected | Pass |
|-------|----------|------|
| No horizontal scroll | Content fits width | [ ] |
| Touch targets | Min 44×44px | [ ] |
| Font size readable | Min 16px body | [ ] |
| Spacing adequate | No cramped elements | [ ] |

#### Navigation

| Check | Expected | Pass |
|-------|----------|------|
| Hamburger menu | Menu icon visible | [ ] |
| Menu opens/closes | Smooth animation | [ ] |
| Menu items tappable | Easy to tap | [ ] |
| Logo visible | Fits header | [ ] |

#### Content

| Check | Expected | Pass |
|-------|----------|------|
| Images responsive | Scale to fit | [ ] |
| Tables scroll | Horizontal scroll if needed | [ ] |
| Forms usable | Labels visible, inputs full-width | [ ] |
| Cards stack | Single column | [ ] |

### Tablet (481px - 768px)

#### Layout

| Check | Expected | Pass |
|-------|----------|------|
| 2-column where appropriate | Cards side-by-side | [ ] |
| Navigation visible or hamburger | Depends on space | [ ] |
| Sidebar collapsible | Dashboard sidebar | [ ] |

#### Content

| Check | Expected | Pass |
|-------|----------|------|
| Images scale well | Not too large/small | [ ] |
| Tables fit or scroll | Readable | [ ] |
| Charts responsive | Resize properly | [ ] |

### Desktop (769px+)

#### Layout

| Check | Expected | Pass |
|-------|----------|------|
| Full navigation | All items visible | [ ] |
| Multi-column layouts | 3+ columns as designed | [ ] |
| Sidebar visible | Dashboard sidebar | [ ] |
| Max content width | Content centered if constrained | [ ] |

---

## Page-Specific Testing

### Homepage (`/`)

| Element | Mobile | Tablet | Desktop | Pass |
|---------|--------|--------|---------|------|
| Hero section | Full width, stacked | 2 columns | Full layout | [ ] |
| Features grid | 1 column | 2 columns | 3 columns | [ ] |
| Testimonials | Single card | 2 cards | 3 cards | [ ] |
| Footer | Stacked | 2 columns | 4 columns | [ ] |

### Login (`/login`)

| Element | Mobile | Tablet | Desktop | Pass |
|---------|--------|--------|---------|------|
| Form container | Full width | Centered box | Centered box | [ ] |
| Input fields | Full width | Fixed width | Fixed width | [ ] |
| Social buttons | Stacked | Side by side | Side by side | [ ] |

### Dashboard (`/dashboard`)

| Element | Mobile | Tablet | Desktop | Pass |
|---------|--------|--------|---------|------|
| Sidebar | Hidden (hamburger) | Collapsible | Visible | [ ] |
| Stats cards | 1 column | 2 columns | 4 columns | [ ] |
| Charts | Full width | Full width | Side by side | [ ] |
| Tables | Scroll horizontal | Scroll/fit | Full width | [ ] |

### Pricing (`/pricing`)

| Element | Mobile | Tablet | Desktop | Pass |
|---------|--------|--------|---------|------|
| Plan cards | 1 column | 2 columns | 3 columns | [ ] |
| Toggle | Full width | Centered | Centered | [ ] |
| Feature table | Scroll | Scroll/fit | Full width | [ ] |

---

## Common Issues & Solutions

### 1. Horizontal Overflow

**Symptoms:**
- Horizontal scrollbar appears
- Content cut off

**Check:**
```css
/* Find overflow */
* {
  outline: 1px solid red;
}
```

**Solutions:**
```css
/* Prevent overflow */
img, video, iframe {
  max-width: 100%;
  height: auto;
}

/* Handle long text */
.text-container {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

### 2. Touch Target Size

**Symptoms:**
- Hard to tap buttons/links
- Accidental taps

**Solutions:**
```css
/* Minimum touch target */
.button, .link {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}
```

### 3. Text Too Small

**Symptoms:**
- Hard to read on mobile
- Users zoom in

**Solutions:**
```css
/* Base font size */
html {
  font-size: 16px;
}

/* Prevent zoom on input focus (iOS) */
input, select, textarea {
  font-size: 16px;
}
```

### 4. Fixed Elements

**Symptoms:**
- Header/footer covers content
- Modal doesn't scroll

**Solutions:**
```css
/* Account for fixed header */
main {
  padding-top: 64px; /* header height */
}

/* Scrollable modal */
.modal {
  max-height: 90vh;
  overflow-y: auto;
}
```

### 5. Images Not Scaling

**Symptoms:**
- Images overflow container
- Images pixelated

**Solutions:**
```tsx
// Use Next.js Image
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={800}
  className="w-full h-auto"
/>
```

---

## Responsive Testing Script

```typescript
// cypress/e2e/responsive.cy.ts
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

describe('Responsive Testing', () => {
  viewports.forEach(({ name, width, height }) => {
    context(`${name} (${width}x${height})`, () => {
      beforeEach(() => {
        cy.viewport(width, height);
      });

      it('Homepage renders correctly', () => {
        cy.visit('/');
        cy.get('main').should('be.visible');
        cy.get('nav').should('be.visible');
        // No horizontal scroll
        cy.document().then((doc) => {
          expect(doc.body.scrollWidth).to.be.lte(width);
        });
      });

      it('Navigation works', () => {
        cy.visit('/');
        if (width < 768) {
          cy.get('[data-testid="mobile-menu-button"]').click();
          cy.get('[data-testid="mobile-menu"]').should('be.visible');
        } else {
          cy.get('nav a').should('be.visible');
        }
      });
    });
  });
});
```

---

## Orientation Testing

### Portrait vs Landscape

| Page | Portrait | Landscape | Pass |
|------|----------|-----------|------|
| Homepage | [ ] | [ ] | [ ] |
| Login | [ ] | [ ] | [ ] |
| Dashboard | [ ] | [ ] | [ ] |
| Modals | [ ] | [ ] | [ ] |

**Test:**
1. Open in portrait
2. Rotate to landscape
3. Check layout adjusts
4. No content lost
5. Navigation still works

---

## Testing Log

| Date | Tester | Devices Tested | Issues Found | Pass |
|------|--------|----------------|--------------|------|
| | | | | |
| | | | | |

---

## Quick Reference Card

```
RESPONSIVE TESTING QUICK CHECK

□ Mobile (375px)
  - Hamburger menu works
  - Forms are usable
  - No horizontal scroll
  - Text is readable

□ Tablet (768px)
  - Layout adapts
  - Sidebar collapsible
  - Touch targets adequate

□ Desktop (1440px)
  - Full navigation
  - Multi-column layouts
  - Images crisp

□ All Sizes
  - Images scale
  - Modals fit
  - No cut-off content
```
