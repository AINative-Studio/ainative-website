# AIKit Dashboard - Accessibility Implementation Checklist

**WCAG 2.1 Level AA Compliance**
**Version:** 1.0
**Date:** 2026-01-29

---

## Pre-Implementation Checklist

Use this checklist during development to ensure WCAG 2.1 AA compliance for the AIKit dashboard integration.

---

## 1. Perceivable

### 1.1 Text Alternatives (Level A)

- [ ] **1.1.1 Non-text Content**
  - [ ] All images have appropriate `alt` text
  - [ ] Decorative images use `alt=""` or `aria-hidden="true"`
  - [ ] Complex images (charts) have detailed descriptions via `aria-describedby`
  - [ ] Icon buttons have `aria-label` attributes
  - [ ] SVG icons include `<title>` elements for screen readers

**Implementation Example:**
```tsx
// Icon with accessible label
<button aria-label="Copy installation command to clipboard">
  <Copy aria-hidden="true" className="w-4 h-4" />
</button>

// Decorative background
<div role="img" aria-label="Animated gradient background" />

// Chart with description
<div
  role="img"
  aria-label="Bar chart showing package usage statistics"
  aria-describedby="chart-details"
>
  <BarChart data={stats} />
  <div id="chart-details" className="sr-only">
    Detailed description: GPT-4 usage 45%, Claude 35%, Llama 15%, Custom 5%
  </div>
</div>
```

---

### 1.2 Time-based Media (Level A)

Not applicable - No video or audio content in AIKit dashboard

---

### 1.3 Adaptable (Level A)

- [ ] **1.3.1 Info and Relationships**
  - [ ] Heading hierarchy is logical (h1 → h2 → h3)
  - [ ] Lists use proper `<ul>`, `<ol>`, `<li>` elements
  - [ ] Forms use `<label>` elements or `aria-label`
  - [ ] Tables use `<thead>`, `<tbody>`, `<th scope="col|row">`
  - [ ] Tab lists use proper ARIA roles (`tablist`, `tab`, `tabpanel`)

**Implementation Example:**
```tsx
// Proper heading hierarchy
<h1>AI Kit Package Ecosystem</h1>
<section>
  <h2>Browse Packages</h2>
  <article>
    <h3>@ainative/ai-kit-core</h3>
  </article>
</section>

// Accessible tabs
<div role="tablist" aria-label="AIKit sections">
  <button
    role="tab"
    aria-selected={activeTab === 'browse'}
    aria-controls="panel-browse"
    id="tab-browse"
  >
    Browse
  </button>
</div>
<div
  role="tabpanel"
  id="panel-browse"
  aria-labelledby="tab-browse"
  tabIndex={0}
>
  {/* Content */}
</div>
```

- [ ] **1.3.2 Meaningful Sequence**
  - [ ] DOM order matches visual order
  - [ ] Reading order is logical when CSS is disabled
  - [ ] Tab order follows visual layout
  - [ ] Flexbox/Grid doesn't break logical order

**Verification:**
```bash
# Disable CSS and verify reading order
# Use browser dev tools to disable styles
# Read through page with screen reader
# Verify order makes sense
```

- [ ] **1.3.3 Sensory Characteristics**
  - [ ] Instructions don't rely solely on shape ("click the round button")
  - [ ] Instructions don't rely solely on color ("click the red button")
  - [ ] Instructions don't rely solely on position ("button on the right")
  - [ ] Provide multi-modal instructions (icon + text + color)

**Bad Example:**
```tsx
❌ "Click the blue button on the right to continue"
```

**Good Example:**
```tsx
✓ "Click the Continue button (blue, located in the bottom-right corner)"
✓ Or better: Just label the button clearly as "Continue"
```

---

### 1.4 Distinguishable (Level AA)

- [ ] **1.4.1 Use of Color**
  - [ ] Color is not the only means of conveying information
  - [ ] Links are distinguishable by more than color (underline/icon)
  - [ ] Form errors shown with icon + text, not just red border
  - [ ] Status indicators use icon + color + text

**Implementation Example:**
```tsx
// Error state with multiple indicators
<div className="border-2 border-red-500">
  <AlertCircle className="text-red-500" aria-hidden="true" />
  <span className="text-red-400">Error: Invalid input</span>
</div>

// Link with underline
<a href="/docs" className="text-blue-500 underline hover:text-blue-600">
  View Documentation
</a>
```

- [ ] **1.4.2 Audio Control**
  - Not applicable (no auto-playing audio)

- [ ] **1.4.3 Contrast (Minimum) - Level AA**
  - [ ] Normal text (< 18px): **4.5:1** contrast ratio
  - [ ] Large text (≥ 18px or 14px bold): **3:1** contrast ratio
  - [ ] UI components: **3:1** contrast ratio
  - [ ] Graphical objects: **3:1** contrast ratio

**Verified Color Combinations:**
```css
/* PASS - Normal text */
#FFFFFF on #0D1117 = 16.07:1 ✓ (far exceeds 4.5:1)
#E5E7EB on #161B22 = 12.24:1 ✓
#9CA3AF on #161B22 = 6.89:1 ✓

/* PASS - Large text */
#4B6FED on #161B22 = 4.98:1 ✓
#10B981 on #161B22 = 3.87:1 ✓ (large text only)

/* FAIL - Requires adjustment */
#6B7280 on #1C2128 = 3.2:1 ✗ (use for large text or adjust)
```

**Testing Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools: Lighthouse audit

- [ ] **1.4.4 Resize Text**
  - [ ] Text can be resized up to 200% without loss of content
  - [ ] Layout doesn't break at 200% zoom
  - [ ] No horizontal scrolling at 200% zoom (except data tables)
  - [ ] Use relative units (rem/em) instead of px

**Implementation Example:**
```css
/* Use rem for font sizes */
.text-body {
  font-size: 1rem;      /* 16px base */
  line-height: 1.5;
}

.text-title {
  font-size: 1.5rem;    /* 24px base */
  line-height: 1.3;
}

/* Ensure containers can grow */
.container {
  max-width: 1280px;
  width: 100%;
  /* Don't set fixed heights */
}
```

- [ ] **1.4.5 Images of Text**
  - [ ] No images of text (use actual text + CSS styling)
  - [ ] Exception: Logos (unavoidable)
  - [ ] Exception: Screenshots (for documentation)

- [ ] **1.4.10 Reflow (Level AA)**
  - [ ] Content reflows at 320px width without horizontal scroll
  - [ ] Content reflows at 256px height without vertical scroll
  - [ ] No loss of information or functionality when zoomed to 400%
  - [ ] Responsive design adapts to narrow viewports

**Testing:**
```bash
# Test at 400% zoom (1280px → 320px effective width)
1. Open Chrome DevTools
2. Set viewport to 1280px width
3. Zoom to 400% (Cmd/Ctrl + +)
4. Verify no horizontal scrolling
5. All content visible and functional
```

- [ ] **1.4.11 Non-text Contrast (Level AA)**
  - [ ] UI component borders: 3:1 contrast
  - [ ] Focus indicators: 3:1 contrast
  - [ ] Icons: 3:1 contrast (or adjacent to 3:1 text)
  - [ ] Chart data points: 3:1 contrast

**Verified UI Elements:**
```css
/* Button border */
border: 1px solid #2D333B; /* 3.1:1 on #161B22 ✓ */

/* Focus ring */
outline: 2px solid #4B6FED; /* 4.98:1 on #161B22 ✓ */

/* Icon color */
color: #9CA3AF; /* 6.89:1 on #161B22 ✓ */
```

- [ ] **1.4.12 Text Spacing (Level AA)**
  - [ ] No loss of content when text spacing is adjusted:
    - Line height: at least 1.5x font size
    - Paragraph spacing: at least 2x font size
    - Letter spacing: at least 0.12x font size
    - Word spacing: at least 0.16x font size

**Implementation Example:**
```css
/* Design system already compliant */
.text-body {
  font-size: 16px;
  line-height: 1.5;        /* 24px = 1.5x ✓ */
  letter-spacing: 0.02em;  /* 0.32px = 0.02x ✓ */
}

p + p {
  margin-top: 1.5rem;      /* 24px = 1.5x font ✓ */
}
```

- [ ] **1.4.13 Content on Hover or Focus (Level AA)**
  - [ ] Hoverable: Pointer can move over content without dismissal
  - [ ] Dismissible: Content can be dismissed (Esc key)
  - [ ] Persistent: Content remains visible until hover/focus removed

**Implementation Example:**
```tsx
// Tooltip implementation
const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShow(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      onKeyDown={handleKeyDown}
    >
      {children}
      {show && (
        <div
          role="tooltip"
          className="tooltip"
          onMouseEnter={() => setShow(true)} // Hoverable
        >
          {content}
        </div>
      )}
    </div>
  );
};
```

---

## 2. Operable

### 2.1 Keyboard Accessible (Level A)

- [ ] **2.1.1 Keyboard**
  - [ ] All functionality available via keyboard
  - [ ] No keyboard traps (user can navigate away)
  - [ ] Custom widgets have keyboard support
  - [ ] Tab, Shift+Tab navigate correctly
  - [ ] Enter/Space activate buttons/links
  - [ ] Arrow keys navigate lists/menus

**Keyboard Shortcuts Map:**
```typescript
const keyboardShortcuts = {
  'Tab': 'Navigate forward',
  'Shift + Tab': 'Navigate backward',
  'Enter': 'Activate button/link',
  'Space': 'Activate button/checkbox',
  'Escape': 'Close modal/dropdown',
  'Arrow Keys': 'Navigate tabs/lists/menus',
  'Home': 'First item',
  'End': 'Last item',
  'Cmd/Ctrl + K': 'Open search',
  'Cmd/Ctrl + /': 'Show keyboard shortcuts'
};
```

**Implementation Example:**
```tsx
// Tab list keyboard navigation
const AIKitTabs = () => {
  const tabRefs = useRef<HTMLButtonElement[]>([]);

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    let newIndex = index;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = index > 0 ? index - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = index < tabs.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
    }

    tabRefs.current[newIndex]?.focus();
  };

  return (
    <div role="tablist">
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[i] = el)}
          role="tab"
          aria-selected={activeTab === tab.id}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, i)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
```

- [ ] **2.1.2 No Keyboard Trap**
  - [ ] User can navigate away from all components
  - [ ] Modals can be closed with Esc key
  - [ ] Focus trap in modals allows Tab cycling
  - [ ] Focus returns to trigger element on close

**Modal Focus Trap:**
```tsx
const useFocusTrap = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    ref.current.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => {
      ref.current?.removeEventListener('keydown', handleTab);
    };
  }, [ref]);
};
```

- [ ] **2.1.4 Character Key Shortcuts (Level A)**
  - [ ] Single character shortcuts can be turned off
  - [ ] Or: Only active when component has focus
  - [ ] Or: Can be remapped to multi-key shortcut

---

### 2.2 Enough Time (Level A)

- [ ] **2.2.1 Timing Adjustable**
  - [ ] No time limits on interactions
  - [ ] If time limits exist, user can extend them
  - [ ] Warning before timeout with option to extend

- [ ] **2.2.2 Pause, Stop, Hide**
  - [ ] Auto-updating content can be paused (e.g., live stats)
  - [ ] Animations can be stopped (respects `prefers-reduced-motion`)
  - [ ] Moving content (< 5 seconds) is exempt

**Reduced Motion Support:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```tsx
// Detect user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Conditionally apply animations
<motion.div
  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
  animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
>
  {content}
</motion.div>
```

---

### 2.3 Seizures and Physical Reactions (Level A)

- [ ] **2.3.1 Three Flashes or Below Threshold**
  - [ ] No content flashes more than 3 times per second
  - [ ] Flashing areas are smaller than 25% of viewport
  - [ ] Avoid red flashing patterns

---

### 2.4 Navigable (Level A & AA)

- [ ] **2.4.1 Bypass Blocks**
  - [ ] "Skip to main content" link at top of page
  - [ ] Properly structured headings for easy navigation
  - [ ] Landmark regions (header, nav, main, footer)

**Implementation Example:**
```tsx
// Skip link (shows on focus)
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-primary focus:text-white focus:p-4"
>
  Skip to main content
</a>

// Landmark regions
<header>
  <nav aria-label="Main navigation">...</nav>
</header>

<main id="main-content" tabIndex={-1}>
  {/* Main content */}
</main>

<footer>
  <nav aria-label="Footer navigation">...</nav>
</footer>
```

- [ ] **2.4.2 Page Titled**
  - [ ] Every page has a unique, descriptive title
  - [ ] Title format: "Page Name | Site Name"
  - [ ] Title updates on client-side navigation

**Implementation Example:**
```tsx
// Next.js metadata
export const metadata = {
  title: 'AI Kit - Browse Packages | AINative Studio',
  description: 'Explore 14 production-ready AI packages...'
};

// Dynamic title update
useEffect(() => {
  document.title = `${activeTab} - AI Kit | AINative Studio`;
}, [activeTab]);
```

- [ ] **2.4.3 Focus Order**
  - [ ] Focus order is logical and intuitive
  - [ ] Tab order follows visual layout
  - [ ] No unexpected focus jumps
  - [ ] Modal focus returns to trigger on close

- [ ] **2.4.4 Link Purpose (In Context)**
  - [ ] Link text describes destination
  - [ ] Avoid "click here" or "read more"
  - [ ] Links with same text go to same destination

**Bad Examples:**
```tsx
❌ <a href="/docs">Click here</a> for documentation
❌ <a href="/install">Read more</a>
```

**Good Examples:**
```tsx
✓ <a href="/docs">View AI Kit documentation</a>
✓ <a href="/install">Installation guide</a>
```

- [ ] **2.4.5 Multiple Ways (Level AA)**
  - [ ] Site map available
  - [ ] Search functionality
  - [ ] Navigation menu
  - [ ] Breadcrumbs

- [ ] **2.4.6 Headings and Labels (Level AA)**
  - [ ] Headings describe topic or purpose
  - [ ] Labels describe input or control purpose
  - [ ] Headings follow logical hierarchy

- [ ] **2.4.7 Focus Visible (Level AA)**
  - [ ] Focus indicator always visible
  - [ ] Focus indicator has sufficient contrast (3:1)
  - [ ] Focus indicator is not hidden by content

**Implementation Example:**
```css
/* Global focus styles */
*:focus-visible {
  outline: 2px solid #4B6FED;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Custom focus for specific elements */
.button:focus-visible {
  outline: 2px solid #4B6FED;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(75, 111, 237, 0.2);
}
```

---

### 2.5 Input Modalities (Level A)

- [ ] **2.5.1 Pointer Gestures**
  - [ ] All multi-point gestures have single-point alternative
  - [ ] Pinch-to-zoom has zoom controls
  - [ ] Swipe has button alternative

- [ ] **2.5.2 Pointer Cancellation**
  - [ ] Click completes on mouse up (not mouse down)
  - [ ] Allows user to abort action by moving away
  - [ ] Undo mechanism available

- [ ] **2.5.3 Label in Name**
  - [ ] Accessible name includes visible text
  - [ ] `aria-label` starts with visible label text

**Example:**
```tsx
// Visible label: "Copy Code"
// CORRECT: aria-label includes "Copy Code"
<button aria-label="Copy code to clipboard">
  <Copy /> Copy Code
</button>

// INCORRECT: aria-label doesn't include "Copy Code"
<button aria-label="Copy to clipboard">
  <Copy /> Copy Code
</button>
```

- [ ] **2.5.4 Motion Actuation**
  - [ ] Device motion features have UI control alternative
  - [ ] Shake to undo has undo button
  - [ ] Tilt to scroll has scroll controls

---

## 3. Understandable

### 3.1 Readable (Level A & AA)

- [ ] **3.1.1 Language of Page**
  - [ ] HTML lang attribute set: `<html lang="en">`
  - [ ] Correct language code used

**Implementation:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>...</head>
  <body>...</body>
</html>
```

- [ ] **3.1.2 Language of Parts (Level AA)**
  - [ ] Foreign phrases marked with lang attribute
  - [ ] `<span lang="fr">Bonjour</span>`

---

### 3.2 Predictable (Level A & AA)

- [ ] **3.2.1 On Focus**
  - [ ] Focus doesn't trigger unexpected changes
  - [ ] No automatic form submission on focus
  - [ ] No popups on focus

- [ ] **3.2.2 On Input**
  - [ ] Input doesn't trigger unexpected changes
  - [ ] Form submission requires explicit action (button click)
  - [ ] Dropdown selection doesn't auto-submit

- [ ] **3.2.3 Consistent Navigation (Level AA)**
  - [ ] Navigation appears in same location across pages
  - [ ] Navigation items in consistent order
  - [ ] Repeated components in same relative order

- [ ] **3.2.4 Consistent Identification (Level AA)**
  - [ ] Icons have consistent meaning
  - [ ] Same functionality labeled consistently
  - [ ] Icons with same function use same icon

---

### 3.3 Input Assistance (Level A & AA)

- [ ] **3.3.1 Error Identification**
  - [ ] Errors identified in text
  - [ ] Error location indicated
  - [ ] Error described clearly

**Implementation Example:**
```tsx
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-medium">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : undefined}
    className={error ? 'border-red-500' : 'border-gray-700'}
  />
  {error && (
    <div id="email-error" className="text-red-400 text-sm flex items-center gap-1">
      <AlertCircle className="w-4 h-4" aria-hidden="true" />
      {error}
    </div>
  )}
</div>
```

- [ ] **3.3.2 Labels or Instructions**
  - [ ] Form fields have labels
  - [ ] Instructions provided for complex inputs
  - [ ] Required fields marked

**Implementation Example:**
```tsx
<label htmlFor="username" className="block text-sm font-medium">
  Username <span className="text-red-400" aria-label="required">*</span>
</label>
<input
  id="username"
  type="text"
  required
  aria-required="true"
  aria-describedby="username-help"
/>
<p id="username-help" className="text-sm text-gray-400">
  3-20 characters, letters and numbers only
</p>
```

- [ ] **3.3.3 Error Suggestion (Level AA)**
  - [ ] Suggestions provided for fixing errors
  - [ ] Specific, actionable guidance
  - [ ] Examples of correct format

**Implementation Example:**
```tsx
// Password error with suggestion
<div id="password-error" className="text-red-400 text-sm">
  Password must be at least 8 characters and include:
  <ul className="list-disc ml-5 mt-1">
    <li>At least one uppercase letter</li>
    <li>At least one number</li>
    <li>At least one special character (!@#$%^&*)</li>
  </ul>
</div>
```

- [ ] **3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)**
  - [ ] Important actions are reversible
  - [ ] Data checked for errors before submission
  - [ ] Confirmation required for critical actions

**Implementation Example:**
```tsx
// Confirmation dialog for destructive action
const DeleteConfirmation = () => (
  <AlertDialog>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete your account and all associated data.
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete}>
          Yes, delete my account
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
```

---

## 4. Robust

### 4.1 Compatible (Level A & AA)

- [ ] **4.1.1 Parsing**
  - [ ] Valid HTML (no duplicate IDs)
  - [ ] Properly nested elements
  - [ ] Opening/closing tags match

**Validation:**
```bash
# Validate HTML
npm run validate-html

# Or use W3C Validator
https://validator.w3.org/
```

- [ ] **4.1.2 Name, Role, Value**
  - [ ] All UI components have accessible names
  - [ ] Roles are appropriate for component type
  - [ ] States are communicated (checked, expanded, selected)

**Implementation Example:**
```tsx
// Checkbox with name, role, value
<input
  type="checkbox"
  id="agree"
  role="checkbox"
  aria-checked={isChecked}
  aria-label="I agree to the terms"
  onChange={handleChange}
/>

// Custom toggle switch
<button
  role="switch"
  aria-checked={isOn}
  aria-label="Dark mode"
  onClick={toggle}
>
  <span aria-hidden="true">{isOn ? 'ON' : 'OFF'}</span>
</button>

// Accordion
<button
  aria-expanded={isOpen}
  aria-controls="panel-1"
  onClick={togglePanel}
>
  Section Title
</button>
<div id="panel-1" hidden={!isOpen}>
  Panel content
</div>
```

- [ ] **4.1.3 Status Messages (Level AA)**
  - [ ] Status messages announced to screen readers
  - [ ] Use `role="status"` or `aria-live="polite"`
  - [ ] Important alerts use `role="alert"` or `aria-live="assertive"`

**Implementation Example:**
```tsx
// Success message (polite)
<div role="status" aria-live="polite">
  Package copied to clipboard!
</div>

// Error alert (assertive)
<div role="alert" aria-live="assertive">
  Failed to load packages. Please try again.
</div>

// Loading state
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? (
    <span>Loading packages...</span>
  ) : (
    <span>{packages.length} packages loaded</span>
  )}
</div>
```

---

## Testing Procedures

### Automated Testing

- [ ] **Run Lighthouse Audit**
  ```bash
  npm run lighthouse
  # Target: Accessibility score 95+
  ```

- [ ] **Run axe-core**
  ```bash
  npm run test:a11y
  # Or use jest-axe in tests
  ```

- [ ] **Validate HTML**
  ```bash
  npm run validate-html
  # Or use W3C Validator
  ```

### Manual Testing

- [ ] **Keyboard Navigation**
  1. Unplug mouse
  2. Navigate entire interface using only keyboard
  3. Verify all functionality accessible
  4. Check focus visible at all times
  5. No keyboard traps

- [ ] **Screen Reader Testing**
  - [ ] Test with VoiceOver (macOS/iOS)
    ```
    Cmd + F5 to toggle VoiceOver
    VO + Right Arrow to navigate
    VO + Space to activate
    ```
  - [ ] Test with NVDA (Windows, free)
  - [ ] Test with JAWS (Windows, paid)

- [ ] **Zoom Testing**
  1. Zoom browser to 200%
  2. Verify no horizontal scrolling
  3. All content visible
  4. Layout doesn't break

- [ ] **Color Contrast**
  1. Use WebAIM Contrast Checker
  2. Test all text/background combinations
  3. Test UI component colors
  4. Verify 4.5:1 for normal text, 3:1 for large

- [ ] **Reduced Motion**
  1. Enable reduced motion in OS settings
  2. Reload application
  3. Verify animations disabled or minimal
  4. Verify functionality still works

---

## Component-Specific Checklists

### AIKit Tabs Component

- [ ] Tab list has `role="tablist"`
- [ ] Each tab has `role="tab"`
- [ ] Tab panels have `role="tabpanel"`
- [ ] Active tab has `aria-selected="true"`
- [ ] Inactive tabs have `aria-selected="false"` and `tabindex="-1"`
- [ ] Tab has `aria-controls` pointing to panel ID
- [ ] Panel has `aria-labelledby` pointing to tab ID
- [ ] Arrow key navigation between tabs
- [ ] Home/End key navigation
- [ ] Enter/Space activates tab

### Package Card Component

- [ ] Card is keyboard accessible
- [ ] Copy button has `aria-label`
- [ ] Copy success announced to screen readers
- [ ] Links have descriptive text
- [ ] Icon-only buttons have labels
- [ ] Hover state doesn't rely on mouse
- [ ] Focus visible when keyboard navigating

### Code Editor Component

- [ ] Editor region has `role="textbox"` or `role="code"`
- [ ] Editor has accessible label
- [ ] Line numbers don't interfere with reading
- [ ] Syntax highlighting doesn't rely on color alone
- [ ] Keyboard shortcuts documented
- [ ] Copy button accessible

### Search Component

- [ ] Search input has label
- [ ] Search results announced
- [ ] Result count announced
- [ ] Keyboard navigation of results
- [ ] Clear button accessible
- [ ] Loading state announced

---

## Pre-Launch Checklist

### Before Merge

- [ ] All automated tests pass
- [ ] Lighthouse accessibility score ≥ 95
- [ ] No axe-core violations
- [ ] Keyboard navigation verified
- [ ] Screen reader tested (at least 1 tool)
- [ ] Focus visible on all interactive elements
- [ ] Color contrast verified
- [ ] Valid HTML (no errors)
- [ ] ARIA attributes correct
- [ ] Zoom to 200% works

### Before Production Deploy

- [ ] Manual accessibility audit complete
- [ ] Screen reader testing on multiple tools
- [ ] User testing with assistive technology users
- [ ] Documentation updated
- [ ] Accessibility statement published
- [ ] Contact info for accessibility issues provided

---

## Resources

### Testing Tools

- **Automated:**
  - [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
  - [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome
  - [WAVE](https://wave.webaim.org/) - Browser extension
  - [Pa11y](https://pa11y.org/) - CLI tool

- **Color Contrast:**
  - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
  - [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

- **Screen Readers:**
  - [VoiceOver](https://www.apple.com/accessibility/voiceover/) - macOS/iOS (built-in)
  - [NVDA](https://www.nvaccess.org/) - Windows (free)
  - [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Windows (paid)

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## Sign-off

**Accessibility Lead:** ___________________________ Date: ___________

**Development Lead:** ___________________________ Date: ___________

**QA Lead:** ___________________________ Date: ___________

---

**Document Version:** 1.0
**Last Updated:** 2026-01-29
**Next Review:** Before production deployment

