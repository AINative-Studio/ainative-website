# WorkflowProgress Visual Guide

## Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Workflow Progress Card                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ✅────────🔵────────⚪────────⚪────────⚪───────────────────────────────────│
│   1         2       3       4       5       6       7       8       9      10│
│ Models   Repos   Config  Training History  Eval  Benchmark Quality Monitor Docs│
│                                                                               │
│ Overall Progress                                                         10% │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Desktop Layout (lg+)

```
Step 1        Step 2        Step 3        Step 4        Step 5
┌─────┐      ┌─────┐      ┌─────┐      ┌─────┐      ┌─────┐
│  ✅  │──────│  🔵  │──────│  ⚪  │──────│  ⚪  │──────│  ⚪  │─────── ...
└─────┘      └─────┘      └─────┘      └─────┘      └─────┘
Step 1       Step 2       Step 3       Step 4       Step 5
Models       Repos        Config       Training     History

[Completed]  [Current]    [Pending]    [Locked]     [Pending]
Green        Blue         Gray         Gray+Lock    Gray
Clickable    Clickable    Disabled     Disabled     Disabled
```

## Tablet Layout (md-lg)

```
┌─────────────────────────────────────────────────────────┐
│ ← Scroll Horizontally →                                 │
├─────────────────────────────────────────────────────────┤
│  ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐  ...   │
│  │ ✅ │───│ 🔵 │───│ ⚪ │───│ ⚪ │───│ ⚪ │───│ ⚪ │       │
│  └───┘   └───┘   └───┘   └───┘   └───┘   └───┘        │
│    1       2       3       4       5       6            │
│  Models  Repos  Config Training History  Eval          │
└─────────────────────────────────────────────────────────┘
```

## Mobile Layout (<md)

```
┌──────────────────────────────────────┐
│                                      │
│  ✅  Model Management                │
│      Step 1 of 10                    │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  🔵  Repository Management           │
│      Step 2 of 10                    │
│      [Highlighted Background]        │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  ⚪  Training Configuration          │
│      Step 3 of 10                    │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  🔒  Model Training                  │
│      Step 4 of 10                    │
│                                      │
└──────────────────────────────────────┘
```

## Step States Visual Reference

### 1. Completed Step
```
┌─────────────┐
│             │
│     ✅      │  ← Green checkmark icon
│             │
│   Step 1    │  ← Gray text
│   Models    │  ← Gray text
│             │
└─────────────┘
  Green border
  Clickable
  Hover: Scale up
```

### 2. Current Step (Pulsing)
```
┌─────────────┐
│ ╔═════════╗ │  ← Blue highlight background
│ ║         ║ │
│ ║   🔵    ║ │  ← Blue filled circle (pulsing)
│ ║         ║ │     Ring effect around icon
│ ║ Step 2  ║ │  ← Blue bold text
│ ║  Repos  ║ │  ← Blue bold text
│ ║         ║ │
│ ╚═════════╝ │
└─────────────┘
  Blue border
  Clickable
  Animation: scale 1→1.1→1 (2s loop)
```

### 3. Pending Step
```
┌─────────────┐
│             │
│     ⚪      │  ← Gray empty circle
│             │
│   Step 3    │  ← Gray text
│   Config    │  ← Gray text
│             │
└─────────────┘
  Gray border
  Not clickable
  Opacity: 100%
```

### 4. Locked Step
```
┌─────────────┐
│             │
│     🔒      │  ← Lock icon
│             │
│   Step 4    │  ← Gray text
│  Training   │  ← Gray text
│             │
└─────────────┘
  Gray border
  Not clickable
  Opacity: 60%
  Tooltip: Shows prerequisite
```

## Connector Lines

### Between Steps
```
┌────┐      ┌────┐      ┌────┐
│ ✅ │══════│ 🔵 │──────│ ⚪ │
└────┘      └────┘      └────┘
   ↑           ↑           ↑
 Green      Blue-Green   Gray
 100%         50%         0%
```

### Line Animation
```
State Change: Step 2 → Step 3

Before:
✅══════🔵──────⚪──────⚪
       50%

During Animation (0.5s):
✅══════✅══════🔵──────⚪
              50%

After:
✅══════✅══════🔵──────⚪
       100%    50%
```

## Tooltip Display

### Desktop Hover
```
        ┌─────────────────────────────┐
        │ Repository Management       │
        │                             │
        │ Connect and configure       │
        │ your code repositories      │
        └──────────┬──────────────────┘
                   │
        ┌─────────▼──────────┐
        │      🔵            │
        │    Step 2          │
        │     Repos          │
        └────────────────────┘
```

### Locked Step Tooltip
```
        ┌─────────────────────────────┐
        │ Training Configuration      │
        │                             │
        │ Set up training parameters  │
        │ and hyperparameters         │
        │                             │
        │ 🔒 Complete Repository      │
        │    Management first         │
        └──────────┬──────────────────┘
                   │
        ┌─────────▼──────────┐
        │      🔒            │
        │    Step 3          │
        │    Config          │
        └────────────────────┘
```

## Progress Bar

### Visual Structure
```
Overall Progress                                                         30%
┌────────────────────────────────────────────────────────────────────────┐
│████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└────────────────────────────────────────────────────────────────────────┘
← Gradient: Green → Blue                    Gray background →
```

### Percentage Calculation
```javascript
progress = ((currentStep - 1) / totalSteps) * 100

Step 1: (1-1)/10 * 100 = 0%
Step 2: (2-1)/10 * 100 = 10%
Step 3: (3-1)/10 * 100 = 20%
Step 5: (5-1)/10 * 100 = 40%
Step 10: (10-1)/10 * 100 = 90%
```

## Color Palette

### Light Mode
```
Completed Steps:
  - Icon: ✅ (green)
  - Text: #059669 (green-600)
  - Border: #10b981 (green-500)
  - Connector: #10b981 (green-500)

Current Step:
  - Icon: 🔵 (blue filled)
  - Text: #2563eb (blue-600)
  - Border: #3b82f6 (blue-500)
  - Background: #dbeafe (blue-50)
  - Ring: rgba(59, 130, 246, 0.2)
  - Connector: linear-gradient(green-500, blue-500)

Pending Steps:
  - Icon: ⚪ (gray outline)
  - Text: #6b7280 (gray-500)
  - Border: #d1d5db (gray-300)
  - Connector: #d1d5db (gray-300)

Locked Steps:
  - Icon: 🔒 (gray)
  - Text: #6b7280 (gray-500)
  - Border: #d1d5db (gray-300)
  - Background: #e5e7eb (gray-200)
```

### Dark Mode
```
Completed Steps:
  - Text: #34d399 (green-400)
  - Connector: #10b981 (green-500)

Current Step:
  - Text: #60a5fa (blue-400)
  - Background: rgba(30, 58, 138, 0.2) (blue-900/20)

Pending Steps:
  - Text: #9ca3af (gray-400)
  - Border: #4b5563 (gray-600)
  - Connector: #4b5563 (gray-600)

Locked Steps:
  - Text: #9ca3af (gray-400)
  - Background: #374151 (gray-700)
  - Border: #4b5563 (gray-600)
```

## Interactive States

### Hover Effects

#### Completed Step Hover
```
Normal:
┌────┐
│ ✅ │
│  1 │
└────┘

Hover:
┌────┐ ← Scale: 1.1
│ ✅ │ ← Shadow increased
│  1 │ ← Cursor: pointer
└────┘
```

#### Current Step (No Hover Change)
```
Always:
╔════╗
║ 🔵 ║ ← Pulsing animation
║  2 ║ ← Cursor: pointer
╚════╝
```

#### Locked Step Hover
```
Normal:
┌────┐
│ 🔒 │
│  4 │
└────┘

Hover:
┌────┐ ← Shows tooltip
│ 🔒 │ ← Cursor: not-allowed
│  4 │ ← No visual change
└────┘
```

### Focus States (Keyboard Navigation)
```
Tab Focus:
┌─────────────┐
│ ╔═════════╗ │ ← 4px blue outline
│ ║   ✅    ║ │
│ ║  Step 1 ║ │
│ ╚═════════╝ │
└─────────────┘
```

## Animation Timeline

### Initial Load
```
Time: 0s → 0.5s

Hero Section
  ↓ (0.1s delay)
Quick Stats
  ↓ (0.1s delay)
Workflow Progress ← Fades in with Y translation
  ↓ (0.1s delay)
Main Tabs
```

### Step Transition (2 → 3)
```
Time: 0s → 0.5s

Step 2:
- Background highlight: fade out (opacity 1 → 0)
- Icon: filled circle → checkmark
- Ring effect: fade out
- Border: blue → green
- Connector line: 50% → 100%

Step 3:
- Background highlight: fade in (opacity 0 → 1)
- Icon: empty circle → filled circle
- Ring effect: fade in
- Border: gray → blue
- Pulsing animation: start
- Connector line: 0% → 50%

Progress Bar:
- Width: 10% → 20% (smooth transition)
- Gradient: shift right
```

## Accessibility Features

### Screen Reader Announcement
```
Step 1 (Completed):
  "Model Management, Step 1 of 10, Completed.
   Create and manage your quantum neural network models.
   Button, Clickable"

Step 2 (Current):
  "Repository Management, Step 2 of 10, Current step.
   Connect and configure your code repositories.
   Button, Clickable"

Step 3 (Pending):
  "Training Configuration, Step 3 of 10, Pending.
   Set up training parameters and hyperparameters.
   Button, Disabled"

Step 4 (Locked):
  "Model Training, Step 4 of 10, Locked.
   Train your models with quantum-enhanced algorithms.
   Complete Training Configuration first.
   Button, Disabled"
```

### Keyboard Navigation
```
Tab Order:
Step 1 (Completed) → Step 2 (Current) → Step 3 (Skip, disabled)
                                       ↓
                     Step 10 (Skip) ← Step 4 (Skip)

Enter/Space on focused step:
- If completed or current: Trigger onStepClick
- If pending/locked: No action

Arrow Keys (Future Enhancement):
- Right Arrow: Next clickable step
- Left Arrow: Previous clickable step
- Home: First step
- End: Last step
```

## Z-Index Layers
```
Layer 5: Tooltips (z-50)
Layer 4: Focus Outlines (z-40)
Layer 3: Step Icons (z-30)
Layer 2: Connector Lines (z-20)
Layer 1: Background Highlights (z-10)
Layer 0: Card Background (z-0)
```

## Responsive Breakpoints Detailed

### Mobile (<768px)
- Layout: Vertical stack
- Step height: 64px
- Spacing: 12px between steps
- Icons: 32px circles
- Text: Full step names
- Touch target: 48px minimum

### Tablet (768px-1023px)
- Layout: Horizontal scroll
- Container: overflow-x-auto
- Scrollbar: Hidden
- Icons: 40px circles
- Step width: 80px minimum
- Spacing: 16px between steps

### Desktop (1024px+)
- Layout: Horizontal flex
- Container: justify-between
- Icons: 40px circles
- Step width: Flexible (100px avg)
- Spacing: Flex connectors
- All steps visible

## Performance Optimizations

### Animation Performance
```
✅ Uses transform (GPU accelerated)
✅ Uses opacity (GPU accelerated)
❌ Avoids width/height animations (where possible)
✅ Uses will-change for frequently animated elements
✅ Debounced resize handlers
```

### Render Optimization
```javascript
// Memoization opportunities
const steps = useMemo(() =>
  workflowSteps.map(...),
  [currentStep]
);

// Event handlers
const handleStepClick = useCallback((step) => {
  if (step.status === 'completed' || step.status === 'current') {
    onStepClick?.(step.id);
  }
}, [onStepClick]);
```

## Edge Cases Handled

1. **currentStep = 0**: Defaults to step 1
2. **currentStep > 10**: Clamps to step 10
3. **currentStep < 1**: Clamps to step 1
4. **Missing onStepClick**: Component still renders, clicks do nothing
5. **Rapid step changes**: Animations queue properly
6. **Very long step names**: Truncated with ellipsis
7. **Tooltip overflow**: Positioned to stay in viewport
8. **Touch devices**: Tooltips work on tap
9. **Keyboard navigation**: Full support
10. **Dark mode toggle**: Smooth transition

---

This visual guide provides a comprehensive reference for understanding the WorkflowProgress component's appearance, behavior, and implementation details.
