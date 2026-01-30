# AIKit Dashboard - Component Interaction Flows

**Version:** 1.0
**Date:** 2026-01-29

---

## Overview

This document visualizes the interaction flows between components in the AIKit dashboard integration, showing state management, event handling, and data flow patterns.

---

## 1. Tab Navigation Flow

### User Journey: Browse Packages

```
┌─────────────────────────────────────────────────────────────────┐
│ User Interaction Flow                                           │
└─────────────────────────────────────────────────────────────────┘

Step 1: User clicks "Browse" tab
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ TabsList Component                                              │
│  - Captures click event                                         │
│  - Updates aria-selected                                        │
│  - Sets activeTab state                                         │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ TabsContent Component (AnimatePresence)                         │
│  - Exit animation on previous tab (fadeOut, 300ms)              │
│  - Entry animation on new tab (fadeIn, 300ms)                   │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ BrowsePackagesTab Component                                     │
│  - Mounts with Suspense boundary                                │
│  - Shows TabContentSkeleton while loading                       │
│  - Fetches package data (React Query)                           │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Data Fetch Complete                                             │
│  - Skeleton fades out (200ms)                                   │
│  - PackageGrid fades in with stagger (100ms per item)           │
│  - Screen reader announces: "14 packages loaded"                │
└─────────────────────────────────────────────────────────────────┘
```

### State Management

```typescript
// Tab state hierarchy
interface TabState {
  activeTab: 'browse' | 'showcase' | 'playground' | 'docs';
  previousTab: string | null;
  isTransitioning: boolean;
  tabHistory: string[];
}

// State transitions
const transitions = {
  CLICK_TAB: (state, payload) => ({
    ...state,
    previousTab: state.activeTab,
    activeTab: payload.tab,
    isTransitioning: true,
    tabHistory: [...state.tabHistory, payload.tab]
  }),

  TRANSITION_COMPLETE: (state) => ({
    ...state,
    isTransitioning: false
  }),

  KEYBOARD_NAVIGATE: (state, payload) => ({
    ...state,
    activeTab: getNextTab(state.activeTab, payload.direction)
  })
};
```

---

## 2. Package Filtering Flow

### User Journey: Filter by Category

```
Step 1: User clicks "Framework" filter button
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CategoryFilter Component                                        │
│  - Updates selectedCategory state                               │
│  - Triggers filterPackages()                                    │
│  - Updates URL query params (?category=framework)               │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ PackageGrid Component                                           │
│  - Detects category change (useEffect dependency)               │
│  - Exit animation on current cards (stagger fadeOut)            │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Filter Logic                                                    │
│  const filtered = packages.filter(                              │
│    pkg => selectedCategory === 'All' ||                         │
│          pkg.category === selectedCategory                      │
│  );                                                              │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Render Filtered Results                                         │
│  - Entry animation on filtered cards (stagger fadeIn)           │
│  - Update count: "Showing 4 of 14 packages"                     │
│  - Screen reader announces: "Filtered to 4 Framework packages"  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Communication

```typescript
// Parent-child data flow
┌──────────────────────────┐
│  BrowsePackagesTab       │
│  (Container)             │
│                          │
│  State:                  │
│  - packages[]            │
│  - selectedCategory      │
│  - searchQuery           │
└────────┬─────────────────┘
         │
         ├── Props: { categories, onCategoryChange }
         ↓
┌──────────────────────────┐
│  CategoryFilter          │
│  (Presentation)          │
│                          │
│  Emits:                  │
│  - onCategoryChange()    │
└──────────────────────────┘
         │
         ├── Props: { packages, category, searchQuery }
         ↓
┌──────────────────────────┐
│  PackageGrid             │
│  (List Container)        │
│                          │
│  Renders:                │
│  - PackageCard[]         │
└────────┬─────────────────┘
         │
         ├── Props: { package, onCopy, onViewDocs }
         ↓
┌──────────────────────────┐
│  PackageCard             │
│  (Item)                  │
│                          │
│  Emits:                  │
│  - onCopy()              │
│  - onViewDocs()          │
└──────────────────────────┘
```

---

## 3. Copy-to-Clipboard Flow

### User Journey: Copy Install Command

```
Step 1: User clicks copy button on PackageCard
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CopyButton Component                                            │
│  - Prevents default click behavior                              │
│  - Reads install command from data attribute                    │
│  - Calls navigator.clipboard.writeText()                        │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Success Handler                                                 │
│  - Sets copied state to true                                    │
│  - Updates button icon (Copy → Check)                           │
│  - Adds green background flash animation                        │
│  - Shows success toast: "Copied to clipboard!"                  │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Animation Sequence                                              │
│  1. Icon scale-in animation (300ms, spring)                     │
│  2. Background color transition (2000ms, ease-out)              │
│     rgba(16, 185, 129, 0.2) → transparent                       │
│  3. Icon reverts after 2s timeout                               │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Reset State                                                     │
│  - setTimeout(() => setCopied(false), 2000)                     │
│  - Icon changes back (Check → Copy)                             │
│  - Ready for next interaction                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Error Handling

```
If clipboard API fails (e.g., not secure context)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Fallback Strategy                                               │
│  1. Try legacy execCommand('copy')                              │
│  2. If that fails, show manual copy dialog                      │
│  3. Display error toast with fallback options                   │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Manual Copy Dialog                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Copy Install Command                                    │   │
│  │                                                         │   │
│  │ [npm install @ainative/ai-kit-core]  [Select All]      │   │
│  │                                                         │   │
│  │ Please copy this command manually                      │   │
│  │                                                         │   │
│  │ [Close]                                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Interactive Showcase Flow

### User Journey: Run Live Demo

```
Step 1: User switches to "Showcase" tab
  ↓
Step 2: User selects "Chat UI" demo from selector
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ InteractiveShowcaseTab Component                                │
│  - Sets activeDemoId: 'chat-ui'                                 │
│  - Loads demo template from registry                            │
│  - Initializes demo state                                       │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Split Layout Renders                                            │
│  Left: CodePreview (syntax highlighted)                         │
│  Right: LivePreview (interactive component)                     │
└─────────────────────────────────────────────────────────────────┘
  ↓
Step 3: User types message in chat input
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ ChatDemo Component                                              │
│  - Updates input state (controlled component)                   │
│  - Validates input (max length, non-empty)                      │
│  - Enables/disables Send button                                 │
└─────────────────────────────────────────────────────────────────┘
  ↓
Step 4: User clicks "Send" button
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Message Send Handler                                            │
│  1. Adds user message to messages array                         │
│  2. Clears input field                                          │
│  3. Shows "AI is typing..." indicator                           │
│  4. Scrolls to bottom of message list                           │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Simulated AI Response                                           │
│  - Waits 1000ms (simulates API call)                            │
│  - Generates demo response                                      │
│  - Adds AI message to array                                     │
│  - Hides typing indicator                                       │
│  - Auto-scrolls to new message                                  │
└─────────────────────────────────────────────────────────────────┘
  ↓
Step 5: User adjusts temperature slider in config panel
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ ConfigPanel Component                                           │
│  - Updates config.temperature state (debounced 500ms)           │
│  - Displays current value: "0.7"                                │
│  - Updates CodePreview with new config                          │
└─────────────────────────────────────────────────────────────────┘
```

### State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Showcase State Management                                       │
└─────────────────────────────────────────────────────────────────┘

Global State (Context/Store)
├── activeDemoId: string
├── demoRegistry: DemoTemplate[]
└── sharedConfig: ConfigState

Demo-Specific State (Component)
├── messages: Message[]
├── input: string
├── isProcessing: boolean
└── localConfig: ConfigState

Derived State (Computed)
├── canSend: boolean (input.length > 0 && !isProcessing)
├── messageCount: number (messages.length)
└── estimatedTokens: number (calculateTokens(messages))

Side Effects (useEffect)
├── Auto-scroll on new message
├── Sync config with URL params
├── Persist demo state to localStorage
└── Track analytics events
```

---

## 5. Code Playground Flow

### User Journey: Edit and Run Code

```
Step 1: User switches to "Playground" tab
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ CodePlaygroundTab Component                                     │
│  - Initializes Monaco Editor                                    │
│  - Loads default template                                       │
│  - Sets up TypeScript language server                           │
└─────────────────────────────────────────────────────────────────┘
  ↓
Step 2: User edits code in Monaco Editor
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Monaco Editor Events                                            │
│  - onDidChangeModelContent (debounced 1000ms)                   │
│  - Runs TypeScript validation                                   │
│  - Shows inline errors/warnings                                 │
│  - Auto-saves to localStorage                                   │
└─────────────────────────────────────────────────────────────────┘
  ↓
Step 3: User clicks "Run" button
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Code Execution Pipeline                                         │
│  1. Extract code from editor                                    │
│  2. Transpile TypeScript to JavaScript (Babel)                  │
│  3. Create sandboxed iframe/Web Worker                          │
│  4. Inject code into sandbox                                    │
│  5. Capture console output                                      │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Preview Pane Update                                             │
│  - Shows loading spinner (100ms minimum)                        │
│  - Renders component in iframe                                  │
│  - Updates console panel with logs                              │
│  - Displays performance metrics                                 │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Error Handling                                                  │
│  If execution fails:                                            │
│  - Display error overlay with stack trace                       │
│  - Highlight error line in editor                               │
│  - Show suggested fixes (if available)                          │
│  - Log error to console panel                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Message Passing (Editor ↔ Preview)

```typescript
// Editor Window → Preview IFrame
interface ExecutionMessage {
  type: 'EXECUTE';
  code: string;
  timestamp: number;
}

// Preview IFrame → Editor Window
interface ResultMessage {
  type: 'RESULT' | 'ERROR' | 'CONSOLE';
  payload: {
    output?: any;
    error?: Error;
    logs?: ConsoleLog[];
  };
  timestamp: number;
}

// Lifecycle
Editor → Preview: { type: 'EXECUTE', code: '...' }
Preview → Editor: { type: 'CONSOLE', payload: { logs: [...] } }
Preview → Editor: { type: 'RESULT', payload: { output: <Component /> } }

// Error case
Editor → Preview: { type: 'EXECUTE', code: 'invalid syntax' }
Preview → Editor: { type: 'ERROR', payload: { error: SyntaxError } }
```

---

## 6. Search and Filter Flow

### User Journey: Search Documentation

```
Step 1: User types in search input (docs tab)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ SearchBar Component                                             │
│  - Captures input onChange (debounced 300ms)                    │
│  - Updates searchQuery state                                    │
│  - Shows/hides clear button                                     │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Search Processing                                               │
│  1. Tokenize query: "react hooks" → ["react", "hooks"]         │
│  2. Fuzzy match against doc index                              │
│  3. Rank results by relevance score                             │
│  4. Group by category                                           │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Results Display                                                 │
│  - Hide navigation sidebar (mobile)                             │
│  - Show results count: "12 results for 'react hooks'"          │
│  - Render result cards with highlighted matches                │
│  - Display "Load more" if > 10 results                          │
└─────────────────────────────────────────────────────────────────┘
  ↓
Step 2: User clicks on search result
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Result Click Handler                                            │
│  - Navigates to doc page                                        │
│  - Scrolls to matching section                                  │
│  - Highlights matching text (yellow background)                 │
│  - Updates URL with hash (#section-id)                          │
│  - Closes search (mobile)                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Search Algorithm

```typescript
// Fuzzy search implementation
interface SearchIndex {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  tokenized: string[];
}

function fuzzySearch(query: string, index: SearchIndex[]): SearchResult[] {
  const queryTokens = tokenize(query.toLowerCase());

  return index
    .map(doc => ({
      ...doc,
      score: calculateRelevanceScore(queryTokens, doc)
    }))
    .filter(doc => doc.score > 0.3) // Threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 50); // Max results
}

function calculateRelevanceScore(
  queryTokens: string[],
  doc: SearchIndex
): number {
  let score = 0;

  // Exact title match: +10
  if (doc.title.toLowerCase().includes(queryTokens.join(' '))) {
    score += 10;
  }

  // Token matches in title: +5 each
  queryTokens.forEach(token => {
    if (doc.title.toLowerCase().includes(token)) score += 5;
  });

  // Token matches in content: +1 each
  queryTokens.forEach(token => {
    const matches = doc.content.toLowerCase().match(new RegExp(token, 'g'));
    if (matches) score += matches.length;
  });

  // Tag matches: +3 each
  queryTokens.forEach(token => {
    if (doc.tags.some(tag => tag.includes(token))) score += 3;
  });

  return score;
}
```

---

## 7. Responsive Layout Transitions

### Breakpoint Change Flow

```
Window resize event triggered
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ ResizeObserver / useMediaQuery Hook                             │
│  - Detects breakpoint change                                    │
│  - Updates isMobile/isTablet/isDesktop state                    │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Layout Recalculation                                            │
│                                                                 │
│  Mobile (< 768px):                                              │
│  - Stack columns vertically                                     │
│  - Collapse sidebar                                             │
│  - Enable bottom sheet for filters                              │
│  - Show mobile tab scroll                                       │
│                                                                 │
│  Tablet (768px - 1023px):                                       │
│  - 2-column grid                                                │
│  - Collapsible sidebar                                          │
│  - Hybrid touch/mouse                                           │
│                                                                 │
│  Desktop (≥ 1024px):                                            │
│  - 3-column grid                                                │
│  - Fixed sidebar                                                │
│  - Full keyboard nav                                            │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Component Re-renders                                            │
│  - CSS Grid updates (transition: 300ms)                         │
│  - Card sizes adjust smoothly                                   │
│  - Text reflows without jank                                    │
│  - Images lazy-load at new sizes                                │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile-Specific Gestures

```
Swipe Gesture Flow (Mobile Tabs)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Touch Event Handlers                                            │
│  - onTouchStart: Record start position                          │
│  - onTouchMove: Track distance and direction                    │
│  - onTouchEnd: Determine if swipe threshold met                 │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Swipe Validation                                                │
│  - Distance > 50px                                              │
│  - Horizontal movement > vertical movement                      │
│  - Velocity > 0.3px/ms                                          │
│  - Time < 300ms                                                 │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Tab Switch Animation                                            │
│  - Swipe right: Previous tab (slide-in-right animation)         │
│  - Swipe left: Next tab (slide-in-left animation)               │
│  - Spring animation (stiffness: 400, damping: 25)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Error Recovery Flows

### Network Failure Recovery

```
API request fails (network error)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Error Boundary / Query Error Handler                            │
│  - Catches error in React Query                                 │
│  - Increments retry count (max 3)                               │
│  - Sets error state                                             │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Display Error UI                                                │
│  - Shows ErrorAlert component                                   │
│  - Displays error message                                       │
│  - Provides "Retry" button                                      │
│  - Logs error to monitoring service                             │
└─────────────────────────────────────────────────────────────────┘
  ↓
User clicks "Retry"
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Retry Logic                                                     │
│  1. Clear error state                                           │
│  2. Show loading skeleton                                       │
│  3. Re-trigger API call                                         │
│  4. Exponential backoff: 1s, 2s, 4s                             │
└─────────────────────────────────────────────────────────────────┘
  ↓
If retry succeeds:
  → Normal data flow resumes
  → Success toast: "Data loaded successfully"

If all retries fail:
  → Show persistent error state
  → Offer alternative actions (contact support, view cached data)
```

### Component Error Recovery

```
React component throws error
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ ErrorBoundary (componentDidCatch)                               │
│  - Catches error and error info                                 │
│  - Prevents app crash                                           │
│  - Logs to error tracking (Sentry)                              │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Fallback UI Render                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Something went wrong                                    │   │
│  │                                                         │   │
│  │ We encountered an error loading this component.        │   │
│  │                                                         │   │
│  │ [Try Again] [Report Issue]                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
  ↓
User clicks "Try Again"
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Reset Error Boundary                                            │
│  - this.setState({ hasError: false })                           │
│  - Component re-mounts                                          │
│  - Attempts normal render                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Performance Optimization Flows

### Lazy Loading Flow

```
User scrolls near bottom of package grid
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ IntersectionObserver                                            │
│  - Detects sentinel element entering viewport                   │
│  - Threshold: 200px before bottom                               │
│  - Triggers loadMore callback                                   │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Load More Handler                                               │
│  - Checks if more data available                                │
│  - Increments page number                                       │
│  - Fetches next batch (10 items)                                │
│  - Shows loading spinner at bottom                              │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Data Append                                                     │
│  - Merges new items with existing                               │
│  - Animates new items in (stagger)                              │
│  - Removes loading spinner                                      │
│  - Updates "Showing X of Y" count                               │
└─────────────────────────────────────────────────────────────────┘
```

### Code Splitting Flow

```
Initial page load
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Main Bundle Loads                                               │
│  - Core React/Next.js (~50KB gzipped)                           │
│  - Dashboard shell components                                   │
│  - Critical CSS                                                 │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Route-Based Code Splitting                                      │
│  - AIKit tab: Lazy import with Suspense                         │
│  - Monaco Editor: Loaded only in Playground tab                 │
│  - Syntax highlighter: Loaded on-demand                         │
└─────────────────────────────────────────────────────────────────┘
  ↓
User switches to Playground tab
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Dynamic Import                                                  │
│  const MonacoEditor = lazy(() =>                                │
│    import('@monaco-editor/react')                               │
│  );                                                              │
│                                                                 │
│  - Shows loading fallback                                       │
│  - Downloads Monaco bundle (~500KB)                             │
│  - Initializes editor                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Analytics Event Flow

### User Interaction Tracking

```
User performs tracked action (e.g., copy install command)
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Event Emission                                                  │
│  trackEvent({                                                   │
│    category: 'AIKit',                                           │
│    action: 'copy_install_command',                              │
│    label: '@ainative/ai-kit-core',                              │
│    value: 1                                                     │
│  });                                                             │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Event Queue                                                     │
│  - Adds event to buffer                                         │
│  - Batches events (send every 5s or 10 events)                  │
│  - Includes session metadata                                    │
└─────────────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────────────┐
│ Analytics Service                                               │
│  - Sends batch to Google Analytics 4                            │
│  - Sends to internal analytics API                              │
│  - Handles network failures gracefully                          │
└─────────────────────────────────────────────────────────────────┘
```

### Key Events to Track

```typescript
const analyticsEvents = {
  // Tab interactions
  TAB_VIEW: 'tab_view',
  TAB_SWITCH: 'tab_switch',

  // Package interactions
  PACKAGE_VIEW: 'package_view',
  PACKAGE_COPY_INSTALL: 'package_copy_install',
  PACKAGE_VIEW_DOCS: 'package_view_docs',
  PACKAGE_VIEW_NPM: 'package_view_npm',

  // Filter interactions
  FILTER_CATEGORY: 'filter_category',
  SEARCH_QUERY: 'search_query',
  SEARCH_RESULT_CLICK: 'search_result_click',

  // Showcase interactions
  DEMO_RUN: 'demo_run',
  DEMO_RESET: 'demo_reset',
  CONFIG_CHANGE: 'config_change',

  // Playground interactions
  CODE_EDIT: 'code_edit',
  CODE_RUN: 'code_run',
  CODE_ERROR: 'code_error',
  CODE_SHARE: 'code_share',

  // Errors
  ERROR_DISPLAYED: 'error_displayed',
  ERROR_RETRY: 'error_retry'
};
```

---

## Appendix: Component State Diagrams

### PackageCard State Machine

```
┌──────────────┐
│   Initial    │
│   (Idle)     │
└──────┬───────┘
       │
       ├─ onMouseEnter ────→ ┌───────────┐
       │                     │  Hovering │
       │                     └─────┬─────┘
       │                           │
       │                           ├─ onMouseLeave ───→ Back to Idle
       │                           │
       │                           └─ onClick (Copy) ─→ ┌──────────┐
       │                                                │ Copying  │
       │                                                └────┬─────┘
       │                                                     │
       │                                                     ├─ onSuccess ─→ ┌─────────┐
       │                                                     │                │ Copied  │
       │                                                     │                └────┬────┘
       │                                                     │                     │
       │                                                     │                     └─ timeout(2s) → Back to Idle
       │                                                     │
       │                                                     └─ onError ───→ ┌─────────┐
       │                                                                     │  Error  │
       │                                                                     └────┬────┘
       │                                                                          │
       │                                                                          └─ timeout(3s) → Back to Idle
```

### Tab Navigation State Machine

```
┌─────────────┐
│  Browse     │◄─────┐
│  (Active)   │      │
└──────┬──────┘      │
       │             │
       ├─ clickShowcase ─→ ┌──────────────┐
       │                   │ Transitioning│
       │                   └──────┬───────┘
       │                          │
       │                          └─ onTransitionEnd ─→ ┌──────────────┐
       │                                                 │  Showcase    │
       │                                                 │  (Active)    │
       │                                                 └──────┬───────┘
       │                                                        │
       │                                                        ├─ clickPlayground ─→ ...
       │                                                        │
       │                                                        └─ clickBrowse ──────→ Loop back
```

---

## Document Metadata

**Created:** 2026-01-29
**Last Updated:** 2026-01-29
**Version:** 1.0
**Author:** Frontend UX Architect
**Status:** Complete

**Related Documents:**
- `aikit-dashboard-ux-specifications.md` - Main UX specifications
- `accessibility-checklist.md` - WCAG compliance guidelines
- `component-api-reference.md` - Component prop types and APIs

---

## Next Steps

1. **Implementation Planning**
   - Break down flows into development tickets
   - Assign complexity estimates
   - Identify dependencies

2. **Prototyping**
   - Build interactive prototype in Figma
   - Test user flows with stakeholders
   - Validate interaction patterns

3. **Development**
   - Implement components following flows
   - Add comprehensive error handling
   - Integrate analytics tracking

4. **Testing**
   - Unit test state transitions
   - Integration test complete flows
   - E2E test critical user journeys

