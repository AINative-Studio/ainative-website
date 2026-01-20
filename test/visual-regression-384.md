# Visual Regression Test Checklist - Issue #384

## Test Pages

Test the following pages for proper full-width section rendering:

### 1. Home Page (/)
- [ ] Hero section background spans full width
- [ ] Hero content stays within container (max-width: 1280px)
- [ ] Value proposition section has proper padding
- [ ] CTA section background spans full width
- [ ] No horizontal scroll at any breakpoint

### 2. Agent Swarm (/agent-swarm)
- [ ] Hero section spans full width
- [ ] Alternating section backgrounds render correctly
- [ ] All 6 sections have consistent spacing
- [ ] Gradient backgrounds don't overflow
- [ ] Content properly contained within sections

### 3. Enterprise (/enterprise)
- [ ] Full page background spans correctly
- [ ] All sections maintain proper spacing
- [ ] Cards and content align properly

### 4. Pricing (/pricing)
- [ ] Pricing grid background spans full width
- [ ] Cards properly contained
- [ ] Responsive behavior works at all breakpoints

### 5. ZeroDB Product Page (/products/zerodb)
- [ ] Hero section with gradient renders properly
- [ ] Full-width background effects work
- [ ] Content stays within container

---

## Breakpoint Testing

Test each page at these breakpoints:

### Mobile (375px)
- [ ] No horizontal scroll
- [ ] Padding: 48px (sm), 64px (md), 80px (lg), 96px (xl)
- [ ] Content readable and properly spaced
- [ ] Backgrounds span edge to edge

### Tablet (768px)
- [ ] Padding scales up: 64px (sm), 80px (md), 96px (lg), 128px (xl)
- [ ] Layout transitions smoothly
- [ ] No layout breaks or overlaps

### Desktop (1024px+)
- [ ] Padding at max: 80px (sm), 96px (md), 128px (lg), 160px (xl)
- [ ] Content centered with proper margins
- [ ] Full-width backgrounds work correctly

### Ultrawide (1440px+)
- [ ] Content stays within max-width (1280px)
- [ ] Backgrounds still span full width
- [ ] No awkward spacing or gaps

---

## Browser Testing

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Visual Checks

### Backgrounds
- [ ] Gradients render smoothly
- [ ] No visible seams or breaks
- [ ] Colors match design system (#0D1117, #161B22, #4B6FED, #8A63F5)
- [ ] Opacity/transparency effects work

### Spacing
- [ ] Consistent vertical rhythm between sections
- [ ] No awkward gaps or overlaps
- [ ] Proper breathing room for content
- [ ] Cards/components properly spaced

### Typography
- [ ] Headings remain readable at all sizes
- [ ] Body text maintains proper line length
- [ ] No text overflow or truncation

### Interactive Elements
- [ ] Buttons properly sized and spaced
- [ ] Hover states work correctly
- [ ] Click targets adequate on mobile

---

## Performance Checks

- [ ] No layout shift (CLS) during page load
- [ ] Smooth scrolling behavior
- [ ] No janky animations
- [ ] Backgrounds don't cause reflow

---

## Accessibility Checks

- [ ] Sufficient color contrast (WCAG AA)
- [ ] Keyboard navigation works
- [ ] Screen reader can navigate sections
- [ ] Focus indicators visible

---

## Screenshots to Capture

Capture these views for each page:

1. **Full page** (desktop 1920x1080)
2. **Hero section** (close-up)
3. **Tablet view** (768px)
4. **Mobile view** (375px)

Save to: `/test/screenshots/issue-384/`

---

## Known Issues to Watch For

- [ ] Horizontal scroll on mobile
- [ ] Background not spanning full width
- [ ] Content overflowing container
- [ ] Inconsistent spacing between sections
- [ ] Gradient artifacts or banding

---

## Test Commands

```bash
# Start dev server
npm run dev

# Run in multiple viewports (use browser DevTools)
# Mobile: 375px × 667px
# Tablet: 768px × 1024px
# Desktop: 1920px × 1080px

# Check for layout issues
npm run lint
npm run type-check
```

---

## Approval Criteria

All checks must pass:
- ✅ No horizontal scroll at any breakpoint
- ✅ Backgrounds span full width
- ✅ Content properly contained
- ✅ Consistent spacing across pages
- ✅ No visual regressions from original design
- ✅ Performance metrics unchanged

---

**Test Date**: __________
**Tested By**: __________
**Status**: ⬜ Pass  ⬜ Fail  ⬜ Needs Revision
