# Agent Swarm Setup Wizard - Implementation Guide

**Created:** 2026-01-22
**Component:** `/components/agent-swarm/AgentSwarmWizard.tsx`
**API Spec:** `/docs/api/agent-swarm-wizard-api-spec.md`

---

## Overview

The Agent Swarm Setup Wizard is a beautiful, user-friendly multi-step interface that guides non-technical users through building AI-powered applications. The wizard shell and navigation flow are complete, with placeholder step components ready to be filled with actual implementation.

---

## Features Implemented

### 1. Multi-Step Wizard Layout

The wizard includes 7 steps with a clean, intuitive flow:

1. **Connect GitHub** - GitHub PAT validation and connection
2. **Setup ZeroDB** - API key and project configuration
3. **Upload PRD** - File upload or paste PRD content
4. **Data Model** - Review AI-generated data model
5. **Backlog** - Review AI-generated project backlog
6. **Sprint Plan** - Review AI-generated sprint plan
7. **Launch & Monitor** - Launch agents and monitor real-time progress

### 2. Visual Progress Indicators

- **Progress Bar** - Shows overall completion percentage (top of wizard)
- **Step Indicator** - Circular icons with connector lines showing:
  - Completed steps: Green gradient with checkmark
  - Current step: Highlighted border with colored icon
  - Upcoming steps: Gray with dimmed icon
- **Step Counter** - "Step X of 7" with percentage

### 3. State Management

Comprehensive React state management using hooks:

```typescript
interface WizardState {
  currentStep: number;
  githubData: GitHubData;
  zerodbData: ZeroDBData;
  prdData: PRDData;
  dataModel: DataModelData | null;
  backlog: BacklogData | null;
  sprintPlan: SprintPlanData | null;
  projectId?: string;
}
```

- Tracks current step (0-6)
- Stores data from each step
- Handles step navigation with `handleNext()` and `handleBack()`
- Loading states for async operations

### 4. Beautiful Animations

Using Framer Motion for smooth transitions:

- **Page entrance**: Staggered fade-in animations for each section
- **Step transitions**: Smooth horizontal slide animations
- **Progress bar**: Animated width transitions
- **Connector lines**: Animated fill on step completion
- **Button interactions**: Scale and shadow effects

### 5. Dark Theme Design

Matching the existing AINative Studio aesthetic:

- Background: `bg-[#161B22]` (dark blue-gray)
- Borders: `border-gray-800` with hover effects
- Accent colors: Gradient from primary (`#4B6FED`) to gold (`#FCAE39`)
- Card styling: Rounded corners with subtle shadows
- Typography: Clear hierarchy with proper contrast

### 6. Step-Specific Color Coding

Each step has a unique color for visual identification:

| Step | Icon | Color | Purpose |
|------|------|-------|---------|
| 0 | Github | `#F4B400` (Gold) | Connect GitHub |
| 1 | Database | `#4B6FED` (Blue) | Setup ZeroDB |
| 2 | FileText | `#8A63F4` (Purple) | Upload PRD |
| 3 | Table | `#34A853` (Green) | Data Model |
| 4 | ListChecks | `#EA4335` (Red) | Backlog |
| 5 | Calendar | `#FCAE39` (Amber) | Sprint Plan |
| 6 | Rocket | `#F4B400` (Gold) | Launch |

### 7. Responsive Design

- Mobile-optimized step indicator (hides step titles on small screens)
- Flexible grid layout for step circles
- Touch-friendly button sizes
- Proper spacing and padding for all screen sizes

---

## Architecture

### Component Structure

```
AgentSwarmWizard (Main Container)
├── Header
│   ├── Title with gradient text
│   └── Description
├── Progress Section
│   ├── Step counter
│   └── Progress bar
├── Step Indicator
│   ├── Step circles (with icons)
│   ├── Connector lines
│   └── Step titles
├── Current Step Description
│   ├── Step title
│   └── Step description
├── Step Content Card
│   └── Current step component (animated)
├── Navigation Buttons
│   ├── Back button
│   └── Loading indicator
└── Help Links
    ├── Documentation
    └── Support
```

### Step Component Pattern

Each step component receives standardized props:

```typescript
interface StepProps {
  onNext: (data?: any) => void;    // Proceed to next step
  onBack: () => void;               // Go back to previous step
  data: any;                        // Current wizard state
  isLoading: boolean;               // Loading state
  setIsLoading: (loading: boolean) => void;  // Set loading state
}
```

### Placeholder Step Components

Currently implemented as simple placeholders:

- `ConnectGitHubStep` - GitHub connection UI
- `SetupZeroDBStep` - ZeroDB project setup UI
- `UploadPRDStep` - PRD upload/paste UI
- `ReviewDataModelStep` - Data model review UI
- `ReviewBacklogStep` - Backlog review UI
- `ReviewSprintPlanStep` - Sprint plan review UI
- `LaunchMonitorStep` - Launch and monitoring UI

Each placeholder demonstrates:
- Centered layout with icon
- Clear title and description
- Primary action button with gradient
- Icon + text in button

---

## Next Steps (Implementation)

### Step 0: Connect GitHub

**File to create:** `components/agent-swarm/steps/ConnectGitHubStep.tsx`

**Requirements:**
- GitHub PAT input field
- Token validation on blur
- Display validation errors
- Show connected status with avatar
- Store token securely
- Check for required scopes (`repo`, `workflow`)

**API Endpoints:**
- `POST /api/v1/github-onboarding/pat/validate`
- `POST /api/v1/github-onboarding/pat/store`
- `GET /api/v1/github-onboarding/connection-status`

### Step 1: Setup ZeroDB

**File to create:** `components/agent-swarm/steps/SetupZeroDBStep.tsx`

**Requirements:**
- List existing API keys
- Create new API key (with copy-to-clipboard)
- List existing ZeroDB projects
- Create new project form
- Check project limits (free tier = 1 project max)
- Show upgrade option if limit reached

**API Endpoints:**
- `GET /v1/public/settings/api-keys`
- `POST /v1/public/settings/api-keys`
- `GET /zerodb/v1/projects`
- `POST /zerodb/v1/projects`
- `GET /zerodb/v1/projects/stats/summary`

### Step 2: Upload PRD

**File to create:** `components/agent-swarm/steps/UploadPRDStep.tsx`

**Requirements:**
- File upload (drag & drop)
- Paste PRD text (textarea)
- File validation (PDF, MD, TXT, DOCX, max 10MB)
- Preview uploaded content
- Character/word count
- Clear/reset option

**API Endpoints:**
- `POST /v1/public/agent-swarms/orchestrate`

### Step 3: Review Data Model

**File to create:** `components/agent-swarm/steps/ReviewDataModelStep.tsx`

**Requirements:**
- Display tables with columns
- Show relationships diagram
- Display vector collections
- Display indexes
- Edit capabilities (add/remove fields)
- Approve/regenerate options

**API Endpoints:**
- `POST /admin/projects/{project_id}/ai/generate-data-model`

### Step 4: Review Backlog

**File to create:** `components/agent-swarm/steps/ReviewBacklogStep.tsx`

**Requirements:**
- Display epics with stories
- Show story points
- Display acceptance criteria
- Edit story details
- Reorder priorities
- Approve/regenerate options

**API Endpoints:**
- `POST /admin/projects/{project_id}/ai/generate-backlog`

### Step 5: Review Sprint Plan

**File to create:** `components/agent-swarm/steps/ReviewSprintPlanStep.tsx`

**Requirements:**
- Display sprints with timeline
- Show sprint goals
- Display stories per sprint
- Show velocity utilization
- Edit sprint details
- Approve/regenerate options

**API Endpoints:**
- `POST /admin/projects/{project_id}/ai/generate-sprint-plan`

### Step 6: Launch & Monitor

**File to create:** `components/agent-swarm/steps/LaunchMonitorStep.tsx`

**Requirements:**
- Launch button
- WebSocket connection for real-time updates
- Display active agents with status
- Show progress logs (terminal-style)
- Display stage progression
- Show completion URL and deployment URL
- Handle errors gracefully

**API Endpoints:**
- `GET /admin/projects/{project_id}/status`
- WebSocket: `wss://api.ainative.studio/ws/admin/agent-swarm/{project_id}?token={jwt}`

---

## Integration Points

### With Existing Components

- `AgentSwarmTerminal` - Can be used in Step 6 for real-time logs
- `Card`, `Button`, `Progress`, `Badge` - Already imported from `@/components/ui/`
- `Input`, `Textarea`, `Select` - Use for form fields in steps

### With Services

Create or use existing service files:

```typescript
// lib/github-onboarding-service.ts
export const githubOnboardingService = {
  validatePAT: async (token: string) => { ... },
  storePAT: async (token: string) => { ... },
  getConnectionStatus: async () => { ... },
};

// lib/zerodb-service.ts (already exists - extend it)
export const zerodbService = {
  listProjects: async () => { ... },
  createProject: async (data) => { ... },
  getProjectStats: async () => { ... },
};

// lib/agent-swarm-service.ts (already exists - extend it)
export const agentSwarmService = {
  createProject: async (data) => { ... },
  generateDataModel: async (projectId, prdContent) => { ... },
  generateBacklog: async (projectId, dataModel) => { ... },
  generateSprintPlan: async (projectId, backlog) => { ... },
  getProjectStatus: async (projectId) => { ... },
};
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] All 7 steps render correctly
- [ ] Progress bar updates on each step
- [ ] Step indicator shows correct states (completed, current, upcoming)
- [ ] Back button works (except on first step)
- [ ] Loading states display properly
- [ ] Animations are smooth
- [ ] Mobile responsive (step titles hide on small screens)
- [ ] Color coding is correct for each step
- [ ] Help links are clickable

### Unit Tests (to be written)

Create test file: `__tests__/components/agent-swarm/AgentSwarmWizard.test.tsx`

```typescript
describe('AgentSwarmWizard', () => {
  it('renders initial step correctly', () => { ... });
  it('navigates to next step when onNext is called', () => { ... });
  it('navigates to previous step when onBack is called', () => { ... });
  it('updates progress bar on step change', () => { ... });
  it('stores step data in state', () => { ... });
  it('disables back button on first step', () => { ... });
});
```

---

## Usage Example

```typescript
// app/dashboard/agent-swarm/page.tsx
import AgentSwarmWizard from '@/components/agent-swarm/AgentSwarmWizard';

export default function AgentSwarmPage() {
  return (
    <div className="min-h-screen bg-vite-bg">
      <AgentSwarmWizard />
    </div>
  );
}
```

---

## Key Design Decisions

1. **Placeholder Steps First**: Implemented the wizard shell first to establish the UX flow before diving into complex step logic.

2. **Color Coding**: Each step has a unique color to help users mentally track progress and identify where they are.

3. **Progressive Disclosure**: Only show the current step content to avoid overwhelming users.

4. **State Management Pattern**: Centralized state in the main wizard component, with step components receiving props. This makes state flow predictable.

5. **Animation Strategy**: Subtle entrance animations (fade + slide) that don't distract but add polish.

6. **Mobile-First**: Step titles hide on mobile to prevent crowding, but icons remain visible for navigation.

7. **Loading States**: Explicit loading indicator separate from navigation buttons to show async operations clearly.

---

## Performance Considerations

- **Code Splitting**: Each step component can be lazy-loaded when implemented
- **Animation Performance**: Using GPU-accelerated transforms (translateX, opacity)
- **Memo Optimization**: Consider memoizing step components if they become complex
- **WebSocket Connection**: Only connect in Step 6 (Launch & Monitor)

---

## Accessibility

- **Keyboard Navigation**: Back button is keyboard accessible
- **Focus Management**: Focus moves to new step content on navigation
- **ARIA Labels**: Add to step indicators for screen readers
- **Color Contrast**: All text meets WCAG 2.1 AA standards
- **Screen Reader**: Step progress announced on change

---

## Files Created

1. `/components/agent-swarm/AgentSwarmWizard.tsx` - Main wizard component (764 lines)
2. `/docs/development-guides/agent-swarm-wizard-implementation.md` - This guide

---

## Files to Create (Next Steps)

1. `/components/agent-swarm/steps/ConnectGitHubStep.tsx`
2. `/components/agent-swarm/steps/SetupZeroDBStep.tsx`
3. `/components/agent-swarm/steps/UploadPRDStep.tsx`
4. `/components/agent-swarm/steps/ReviewDataModelStep.tsx`
5. `/components/agent-swarm/steps/ReviewBacklogStep.tsx`
6. `/components/agent-swarm/steps/ReviewSprintPlanStep.tsx`
7. `/components/agent-swarm/steps/LaunchMonitorStep.tsx`
8. `/lib/github-onboarding-service.ts` (if doesn't exist)
9. `/__tests__/components/agent-swarm/AgentSwarmWizard.test.tsx`

---

## Summary

The Agent Swarm Setup Wizard provides a solid foundation for guiding users through the complex process of building applications with AI agents. The wizard shell is complete with:

- Beautiful, modern UI matching the AINative Studio aesthetic
- Smooth animations and transitions
- Clear progress indicators
- Flexible state management
- Placeholder step components ready for implementation

The next phase involves implementing each step component with actual API integrations according to the API specification document.

---

*Built by AINative Dev Team - 2026-01-22*
