# Agent Swarm Setup Wizard - Step Components

This directory contains the first three step components for the Agent Swarm Setup Wizard.

## Components

### 1. GitHubConnectionStep

Handles GitHub Personal Access Token (PAT) validation and storage.

**Props:**
- `onComplete: (status: GitHubConnectionStatus) => void` - Called when GitHub is successfully connected
- `initialStatus?: GitHubConnectionStatus` - Optional initial connection status

**Features:**
- Checks existing GitHub connection status
- Validates PAT tokens with required scopes (repo, workflow)
- Shows validation results including username, avatar, and available scopes
- Stores validated PAT for future use
- Displays connected user information with avatar
- Clear error messaging for invalid tokens or missing scopes

### 2. ZeroDBSetupStep

Manages ZeroDB API key and project selection/creation.

**Props:**
- `onComplete: (data: { apiKey: string; project: ZeroDBProject }) => void` - Called when both API key and project are selected

**Features:**
- Lists existing ZeroDB API keys with usage statistics
- Creates new API keys with secure display (shown only once)
- Lists existing ZeroDB projects with tier and status
- Creates new projects with name and description
- Enforces tier limits (free tier: 1 project)
- Provides upgrade prompts when project limit is reached
- Shows project usage statistics (vectors, tables, events)

### 3. PRDUploadStep

Handles Product Requirements Document upload or paste.

**Props:**
- `onComplete: (prdContent: string) => void` - Called when PRD content is ready

**Features:**
- **Upload Tab:**
  - Drag & drop file upload zone
  - Supports PDF, MD, TXT, DOCX files (max 10MB)
  - File validation with clear error messages
  - Shows uploaded file info (name, size)
  - Content preview with show/hide toggle

- **Paste Tab:**
  - Large textarea for pasting content
  - Real-time word/character/line count
  - Markdown preview toggle
  - Clear content button

- Both methods populate the same PRD content state
- Continue button enabled when content is not empty

## Usage Example

```tsx
'use client';

import { useState } from 'react';
import {
  GitHubConnectionStep,
  ZeroDBSetupStep,
  PRDUploadStep,
} from '@/components/agent-swarm/wizard-steps';

export default function AgentSwarmWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [githubStatus, setGithubStatus] = useState(null);
  const [zerodbConfig, setZerodbConfig] = useState(null);
  const [prdContent, setPrdContent] = useState(null);

  return (
    <div className="min-h-screen bg-[#0D1117] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center ${
                step === currentStep
                  ? 'text-[#4B6FED]'
                  : step < currentStep
                  ? 'text-green-400'
                  : 'text-gray-600'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === currentStep
                    ? 'bg-[#4B6FED] text-white'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className="w-16 h-1 bg-gray-800 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <GitHubConnectionStep
            onComplete={(status) => {
              setGithubStatus(status);
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <ZeroDBSetupStep
            onComplete={(config) => {
              setZerodbConfig(config);
              setCurrentStep(3);
            }}
          />
        )}

        {currentStep === 3 && (
          <PRDUploadStep
            onComplete={(content) => {
              setPrdContent(content);
              // Proceed to next step (Step 4: Review Data Model)
              console.log('PRD uploaded:', content);
            }}
          />
        )}

        {/* Back Button (optional) */}
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="mt-4 text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Previous Step
          </button>
        )}
      </div>
    </div>
  );
}
```

## API Endpoints Used

### GitHubConnectionStep
- `GET /api/v1/github-onboarding/connection-status` - Check connection status
- `POST /api/v1/github-onboarding/pat/validate` - Validate GitHub PAT
- `POST /api/v1/github-onboarding/pat/store` - Store validated PAT

### ZeroDBSetupStep
- `GET /v1/public/settings/api-keys` - List API keys
- `POST /v1/public/settings/api-keys` - Create new API key
- `GET /zerodb/v1/projects` - List ZeroDB projects
- `GET /zerodb/v1/projects/stats/summary` - Get project statistics
- `POST /zerodb/v1/projects` - Create new project

### PRDUploadStep
- No API calls (client-side only)
- Content is passed to parent component via `onComplete` callback

## Styling

All components use the dark theme styling matching the Agent Swarm design:
- Background: `bg-[#161B22]`
- Borders: `border-[#2D333B]`
- Primary color: `#4B6FED` (blue)
- Secondary color: `#8A63F4` (purple)
- Accent colors: Green for success, Red for errors, Yellow for warnings

## TypeScript Interfaces

See the API specification at: `/docs/api/agent-swarm-wizard-api-spec.md`

Key interfaces used:
- `GitHubConnectionStatus`
- `GitHubPATValidation`
- `ZeroDBProject`
- `APIKey`
- `ProjectStats`

## Next Steps

After these three components, the wizard should continue with:
1. Step 4: Review Data Model (AI-generated)
2. Step 5: Review Backlog (AI-generated)
3. Step 6: Review Sprint Plan (AI-generated)
4. Step 7: Launch & Monitor Agents (WebSocket real-time)
5. Step 8: View Results (GitHub repo + deployment)
