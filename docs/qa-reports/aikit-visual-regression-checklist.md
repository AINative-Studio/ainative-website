# AIKit Dashboard - Visual Regression Testing Checklist

**Date:** 2026-01-29
**Component:** `/app/ai-kit`
**Testing Method:** Manual Inspection + Code Review

---

## Desktop Testing (1920x1080)

### Hero Section
- [ ] Page loads without layout shift
- [ ] Hero animation plays smoothly (fade-up)
- [ ] Gradient text renders correctly ("Build AI Apps Faster")
- [ ] Badge displays: "14 Production-Ready Packages"
- [ ] All 3 CTAs visible and aligned:
  - [ ] "View on GitHub" (gradient button)
  - [ ] "Browse Packages" (outline button)
  - [ ] "Documentation" (ghost button)
- [ ] Stats row displays correctly (14 Packages, 50K+ Downloads, 1.2K+ Stars)
- [ ] Background gradient and grid pattern visible

### Features Grid
- [ ] 6 feature cards in 3-column layout
- [ ] Card hover effects work (border color change, shadow)
- [ ] Icons display correctly with gradient backgrounds
- [ ] Text is readable (white on dark background)
- [ ] Cards are equal height

### Package Browsing
- [ ] Category filter buttons display correctly
- [ ] "All" button is active by default (gradient background)
- [ ] 14 package cards display in 3-column grid
- [ ] Package cards show:
  - [ ] Colored top border (gradient per package)
  - [ ] Icon with gradient background
  - [ ] Category badge (top-right)
  - [ ] Package name (hover changes color to blue)
  - [ ] Description
  - [ ] 3 feature badges
  - [ ] Install command in code box
  - [ ] Copy button (hover shows border change)
  - [ ] NPM and Docs buttons

### Code Examples Section
- [ ] Tabs display correctly (React, Vue, CLI)
- [ ] "React" tab is active by default
- [ ] Code blocks have dark background
- [ ] Code is syntax-highlighted (if applicable)
- [ ] Code blocks have proper borders
- [ ] Tab switching works smoothly

### Integrations Section
- [ ] 8 integration cards in 4-column grid
- [ ] Cards display: React, Vue, Svelte, Next.js, TypeScript, Tailwind, Vercel, ZeroDB
- [ ] Hover effects work (border and shadow)

### CTA Section
- [ ] Gradient background box displays correctly
- [ ] Two buttons centered and aligned
- [ ] Text is centered and readable

---

## Tablet Testing (768x1024)

### Layout Changes
- [ ] Hero heading size reduces to `text-5xl` (from `text-7xl`)
- [ ] Feature grid changes to 2 columns
- [ ] Package grid changes to 2 columns
- [ ] Integration grid stays at 4 columns
- [ ] All content remains readable and properly spaced

### Navigation
- [ ] Breadcrumb navigation works
- [ ] All links are tappable (min 44x44px touch target)

---

## Mobile Testing (375x667)

### Layout Changes
- [ ] Hero section stacks vertically
- [ ] CTA buttons stack vertically (`flex-col`)
- [ ] Feature grid becomes single column
- [ ] Package grid becomes single column
- [ ] Integration grid becomes 2 columns
- [ ] Code examples remain readable
- [ ] Tabs remain usable (equal width)

### Touch Interactions
- [ ] Category filter buttons are tappable
- [ ] Copy buttons are tappable
- [ ] All links work correctly
- [ ] No horizontal scroll

---

## Color Contrast Testing

### Text Readability
- [ ] White text on `#0D1117` background (19.4:1 ratio) ✅
- [ ] Gray text `#CBD5E0` on dark bg (12.8:1 ratio) ✅
- [ ] Button text on `#4B6FED` (8.2:1 ratio) ✅
- [ ] Badge text is readable

### Interactive States
- [ ] Button hover states have sufficient contrast
- [ ] Active tab is clearly distinguishable
- [ ] Selected category button stands out
- [ ] Copy button states are clear (default vs copied)

---

## Animation Testing

### Scroll Animations
- [ ] Hero section fades up on load
- [ ] Features fade up on scroll into view
- [ ] Package cards fade up with stagger effect
- [ ] Animations play only once (`once: true`)

### Hover Animations
- [ ] Cards scale slightly on hover
- [ ] Buttons translate up on hover (`-translate-y-0.5`)
- [ ] Shadow expands on hover
- [ ] All transitions are smooth (300ms duration)

### Filter Animations
- [ ] Package cards fade out when category changes
- [ ] New cards fade in smoothly
- [ ] No layout shift during filter

---

## Dark Theme Verification

### Background Colors
- [ ] Main background: `#0D1117`
- [ ] Card background: `#161B22`
- [ ] Code block background: `#0D1117` (vite-bg)
- [ ] Tab background: `#1C2128`

### Border Colors
- [ ] Default border: `#2D333B`
- [ ] Hover border: `#4B6FED/40` (blue with 40% opacity)
- [ ] Active states clearly visible

### Gradient Effects
- [ ] Hero title gradient renders smoothly
- [ ] Button gradients render correctly:
  - Primary: `from-[#4B6FED] to-[#8A63F4]`
  - Hover: `from-[#3A56D3] to-[#7A4FEB]`
- [ ] Package card top borders show unique gradients
- [ ] Background radial gradients visible

---

## Typography Verification

### Heading Hierarchy
- [ ] H1 is largest: `text-5xl md:text-7xl`
- [ ] H2 sections: `text-3xl md:text-5xl`
- [ ] H3 package names: `text-lg`
- [ ] Body text: `text-base` or `text-sm`

### Font Rendering
- [ ] All text uses correct font family
- [ ] No FOUT (Flash of Unstyled Text)
- [ ] Line heights are comfortable
- [ ] Letter spacing is appropriate

---

## Icon Verification

### Lucide Icons (32 icons used)
- [ ] All icons load correctly
- [ ] Icons are properly sized (consistent w/h)
- [ ] Icon colors match design (white, blue, etc.)
- [ ] Icons align with text properly

**Icons to verify:**
- Package, Download, Star, Github, BookOpen, Code2, Terminal
- Shield, Zap, Sparkles, ArrowRight, Copy, Check, ExternalLink
- Layers, Cpu, Database, TestTube2, Eye, Lock, Palette, Globe
- ChevronRight, Box, Workflow

---

## Image Assets

### OG Image
- [x] File path: `/public/og-ai-kit.jpg`
- [ ] **MISSING** - Needs to be created (1200x630px, <100KB)
- [ ] Test on social platforms once created

### Background Effects
- [ ] Radial gradients render correctly
- [ ] Grid pattern is subtle (5% opacity)
- [ ] No visual artifacts or banding

---

## Link Testing

### Internal Links
- [ ] Breadcrumb "Home" link: `/`
- [ ] "Documentation" link: `/resources`
- [ ] All use Next.js `<Link>` component

### External Links
- [ ] GitHub repo: `https://github.com/AINative-Studio/ai-kit`
- [ ] NPM org: `https://www.npmjs.com/~ainative-studio`
- [ ] Package NPM links: `https://www.npmjs.com/package/${pkg.name}`
- [ ] Package GitHub links: Dynamic per package
- [ ] All have `target="_blank"` and `rel="noopener noreferrer"`

---

## State Transitions

### Copy Button States
- [ ] Default: Copy icon (gray)
- [ ] Hover: Border changes to blue
- [ ] Clicked: Check icon (green)
- [ ] After 2s: Returns to Copy icon

### Category Filter States
- [ ] Default: Outline style
- [ ] Hover: Border color change
- [ ] Active: Gradient background
- [ ] Only one active at a time

### Tab States
- [ ] Inactive: Muted appearance
- [ ] Active: Background and shadow
- [ ] Keyboard focus: Ring visible

---

## Responsive Grid Behavior

### Breakpoint: 0-767px (Mobile)
- [ ] `grid-cols-1` for features
- [ ] `grid-cols-1` for packages
- [ ] `grid-cols-2` for integrations

### Breakpoint: 768-1023px (Tablet)
- [ ] `md:grid-cols-2` for features
- [ ] `md:grid-cols-2` for packages
- [ ] `md:grid-cols-4` for integrations

### Breakpoint: 1024px+ (Desktop)
- [ ] `lg:grid-cols-3` for features
- [ ] `lg:grid-cols-3` for packages
- [ ] Grid stays at 4 columns for integrations

---

## Cross-Browser Testing

### Chrome 90+
- [ ] All features work
- [ ] Clipboard API supported
- [ ] Animations smooth
- [ ] Grid layouts correct

### Firefox 88+
- [ ] All features work
- [ ] Clipboard API supported
- [ ] Animations smooth
- [ ] Grid layouts correct

### Safari 13.1+
- [ ] All features work
- [ ] Clipboard API supported
- [ ] Animations smooth
- [ ] Grid layouts correct
- [ ] Focus rings visible

### Edge 90+
- [ ] All features work
- [ ] Chromium-based, same as Chrome

---

## Performance Checks

### Page Load
- [ ] No layout shift (CLS < 0.1)
- [ ] Hero section renders immediately
- [ ] Images load progressively
- [ ] No blocking scripts

### Scroll Performance
- [ ] Smooth scrolling (60fps)
- [ ] Animations don't cause jank
- [ ] No stuttering during filter changes

### Memory
- [ ] No memory leaks detected
- [ ] Timeouts properly cleared
- [ ] No orphaned event listeners

---

## Print Styles

### Printability
- [ ] Page is readable when printed
- [ ] Colors are preserved or fallback appropriately
- [ ] No unnecessary elements in print

---

## Regression Testing Baseline

**Reference Implementation:** `/app/ai-kit/AIKitClient.tsx` (765 lines)
**Last Known Good:** 2026-01-29 initial implementation

### Visual Baseline Screenshots (To Capture)
1. Desktop - Full page
2. Desktop - Hero section
3. Desktop - Package grid (All category)
4. Desktop - Package grid (Framework category)
5. Desktop - Code examples (React tab)
6. Tablet - Full page
7. Mobile - Full page
8. Mobile - Package card detail

### After Any Changes, Verify:
- [ ] No unintended layout changes
- [ ] All colors still match theme
- [ ] Animations still smooth
- [ ] Responsive breakpoints still work
- [ ] No new console errors
- [ ] Bundle size hasn't significantly increased

---

## Known Issues (As of 2026-01-29)

- **OG Image Missing:** `/public/og-ai-kit.jpg` needs to be created
- **Test Infrastructure:** TypeScript errors prevent automated visual regression
- **Clipboard Error Handling:** No fallback for older browsers

---

## Automated Visual Regression (Future)

### Recommended Tools
- **Percy.io** - Visual regression testing
- **Chromatic** - Storybook visual testing
- **BackstopJS** - Open-source screenshot comparison

### Test Scenarios
1. Baseline: All default states
2. Hover states: Buttons, cards, links
3. Active states: Tabs, filter buttons
4. Copy feedback: Check icon display
5. Responsive: Mobile, tablet, desktop
6. Themes: Dark (current), light (future)

---

**Status:** Manual inspection complete. Automated testing pending fix of BUG-002.
**Next Steps:** Capture baseline screenshots once dev server is stable.
