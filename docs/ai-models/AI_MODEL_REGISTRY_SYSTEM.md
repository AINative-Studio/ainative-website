# AI Model Registry System - Complete Specification

**Status**: Active Feature Specification
**Last Updated**: 2026-02-06
**Priority**: MUST REFERENCE for AI Models feature implementation

---

## Table of Contents

1. [System Overview](#system-overview)
2. [User Experience Flow](#user-experience-flow)
3. [All Available Models](#all-available-models)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Data Structures](#data-structures)
6. [Implementation Requirements](#implementation-requirements)
7. [Model Detail Page Specifications](#model-detail-page-specifications)

---

## System Overview

The AI Model Registry displays ALL available AI models across different capabilities:
- Chat/Text Completion
- Image Generation
- Video Generation (Text-to-Video, Image-to-Video)
- Audio Processing (Transcription, Translation, TTS)
- Embeddings

**Key Principle**: Models are aggregated from multiple backend API endpoints and displayed in a unified gallery view.

---

## User Experience Flow

### Screen 1: AI Models Browse Page

**Route**: `/dashboard/ai-settings`

**Layout Components**:

1. **Category Filter Tabs** (Horizontal)
   - `All` (default)
   - `Image`
   - `Video`
   - `Audio`
   - `Coding`
   - `Embedding`

2. **Top Right Controls**
   - "Learn more" link → `https://docs.ainative.studio/models`
   - "Newest" sort dropdown (options: Newest, Oldest, Name)

3. **Model Cards Grid**
   - Responsive: 1 col (mobile) → 2 col (tablet) → 3 col (desktop) → 4 col (xl)
   - First card: "Looking for another model?" CTA (dashed border)
   - Remaining cards: Actual models

**Model Card Structure**:
```
┌─────────────────────────────┐
│  [Thumbnail Image/Video]    │ ← Real example output (h-36)
│  ⭐ (if default model)      │
├─────────────────────────────┤
│  Model Name                 │ ← e.g., "Alibaba Wan 2.2 12V 720p"
│  Description text...        │ ← What the model does
│                             │
│  [capability-tag]           │ ← e.g., "image-to-video"
│  Cost: 5s $0.30, 8s $0.48  │ ← Pricing info
└─────────────────────────────┘
```

**Interaction**:
- Click card → Navigate to `/dashboard/ai-settings/[model-slug]`

---

### Screen 2: Model Detail Page

**Route**: `/dashboard/ai-settings/[model-slug]`

**Top Navigation Tabs**:
```
┌─────────────┬──────────┬──────────┐
│ Playground  │   API    │  Readme  │
└─────────────┴──────────┴──────────┘
```

---

#### Tab 1: Playground

**Purpose**: Interactive model testing UI

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│  Model Name                                          │
│  Description                                         │
│  [Playground] [API] [Readme]                        │
├────────────────────────┬─────────────────────────────┤
│  Input Section         │   Result Section            │
│                        │                             │
│  Prompt                │   [Preview/Video/Image]     │
│  [text area]           │                             │
│                        │   Download button           │
│  Negative prompt       │   JSON response             │
│  [text area]           │                             │
│                        │                             │
│  Duration              │                             │
│  [5s] [8s] [10s]       │                             │
│                        │                             │
│  Image                 │                             │
│  [Upload zone]         │                             │
│                        │                             │
│  Additional settings   │                             │
│  [expandable]          │                             │
│                        │                             │
│  [Reset] [Run]         │                             │
├────────────────────────┴─────────────────────────────┤
│  Pricing: 5s $0.30, 8s $0.48, 10s $0.60, 15s $0.70  │
└──────────────────────────────────────────────────────┘
```

**Key Features**:
- Left side: Input controls (model-specific parameters)
- Right side: Result preview (video player, image viewer, text output)
- Bottom: Pricing information
- "Request logs" link for debugging

---

#### Tab 2: API

**Purpose**: Show integration code for developers

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│  Model Name                                          │
│  Description                                         │
│  [Playground] [API] [Readme]                        │
├──────────────────────────────────────────────────────┤
│  [Create an API Key]                                 │
│                                                      │
│  ┌──────┬────────────┐                              │
│  │ Curl │ Post /Run  │                              │
│  └──────┴────────────┘                              │
│                                                      │
│  curl -X POST https://api.ainative.studio/v1/...    │
│    -H 'Content-Type: application/json'              │
│    -H 'Authorization: Bearer YOUR_API_KEY'          │
│    -d '{                                            │
│      "input": {                                     │
│        "prompt": "...",                             │
│        "image": "https://..."                       │
│      },                                             │
│      "num_inference_steps": 40,                     │
│      "guidance": 5,                                 │
│      ...                                            │
│    }'                                               │
│                                                      │
│  [Copy] ← Button to copy entire command            │
└──────────────────────────────────────────────────────┘
```

**Key Features**:
- "Create an API Key" button (top, for users without API keys)
- Code format toggle: Curl / Post /Run
- Complete API request with:
  - Model-specific endpoint path
  - Required headers (Content-Type, Authorization)
  - Full request body with all parameters
  - Example values
- Copy button for easy integration

---

#### Tab 3: Readme

**Purpose**: Model documentation

**Content**:
- Model description
- Technical details
- Use cases
- Best practices
- Limitations
- Pricing details

---

## All Available Models

### 1. Chat Completion Models

**API Endpoint**: `GET /v1/models`

**Provider: OpenAI**
- **GPT-4**
  - ID: `gpt-4`
  - Capabilities: `text-generation`, `reasoning`, `code`, `vision`
  - Use case: Advanced reasoning, complex tasks

- **GPT-3.5 Turbo**
  - ID: `gpt-3.5-turbo`
  - Capabilities: `text-generation`, `code`
  - Use case: Fast conversations, simple tasks

**Provider: Anthropic**
- **Claude 3.5 Sonnet**
  - ID: `claude-3-5-sonnet-20241022`
  - Capabilities: `text-generation`, `reasoning`, `code`, `vision`
  - Use case: Long context, detailed analysis

---

### 2. Image Generation Models

**API Endpoint**: `POST /v1/multimodal/image`

**Provider: Qwen**
- **Qwen Image Edit**
  - Capabilities: `image-generation`, `text-to-image`
  - Cost: 50 credits (~$0.025 per image)
  - Features:
    - High-quality image generation
    - LoRA style transfer support
    - Resolutions: 512x512 to 2048x2048
    - Generation time: ~10 seconds
  - Parameters:
    - `prompt`: Image description (max 2000 chars)
    - `width`: 512-2048px (default: 1024)
    - `height`: 512-2048px (default: 1024)
    - `style`: Optional LoRA style

---

### 3. Video Generation Models

#### 3.1 Image-to-Video (i2v)

**API Endpoint**: `POST /v1/multimodal/video/i2v`

**Provider: Alibaba**
- **Wan 2.2 (wan22)** ⭐ RECOMMENDED
  - Capabilities: `image-to-video`, `video-generation`
  - Cost: 400 credits (~$0.20)
  - Duration: 5 seconds
  - Resolution: 1280x720
  - Quality: Best
  - Endpoint: `/v1/wan-2-2-i2v-720/run`
  - Parameters:
    - `image_url`: Source image URL
    - `motion_prompt`: Motion description
    - `provider`: "wan22"

**Provider: Seedance**
- **Seedance i2v**
  - Capabilities: `image-to-video`, `video-generation`
  - Cost: 520 credits (~$0.26)
  - Duration: 5 seconds
  - Resolution: 1280x720
  - Parameters:
    - `image_url`: Source image URL
    - `motion_prompt`: Motion description
    - `provider`: "seedance"

**Provider: Sora**
- **Sora2** (Premium)
  - Capabilities: `image-to-video`, `video-generation`
  - Cost: 800 credits (~$0.40)
  - Duration: 4 seconds
  - Quality: Cinematic
  - Parameters:
    - `image_url`: Source image URL
    - `motion_prompt`: Motion description
    - `provider`: "sora2"

---

#### 3.2 Text-to-Video (t2v)

**API Endpoint**: `POST /v1/multimodal/video/t2v`

**Provider: Generic T2V**
- **Text-to-Video Model** (Premium tier)
  - Capabilities: `text-to-video`, `video-generation`
  - Cost: 1000 credits (~$0.50)
  - Duration: 1-10 seconds (configurable)
  - Resolution: 1280x720 HD
  - Generation time: ~90 seconds
  - Parameters:
    - `prompt`: Video description (max 1000 chars)
    - `duration`: 1-10 seconds (default: 5)

---

#### 3.3 CogVideoX

**API Endpoint**: `POST /v1/multimodal/video/cogvideox`

**Provider: CogVideo**
- **CogVideoX-2B**
  - Capabilities: `text-to-video`, `video-generation`
  - Cost: 800 credits (~$0.40)
  - Frames: 17, 33, or 49 frames
  - FPS: 8
  - Format: MP4
  - Generation time: ~120 seconds
  - Parameters:
    - `prompt`: Video description
    - `num_frames`: 17/33/49
    - `guidance_scale`: Control prompt adherence
    - `inference_steps`: Quality control

---

### 4. Audio Models

**API Endpoints**: `/v1/audio/*`

#### 4.1 Speech-to-Text (Transcription)

**Endpoint**: `POST /v1/audio/transcriptions`

**Provider: OpenAI**
- **Whisper**
  - Capabilities: `audio`, `transcription`, `speech-to-text`
  - Languages: 99+ languages
  - Use case: Convert audio/video to text

---

#### 4.2 Audio Translation

**Endpoint**: `POST /v1/audio/translations`

**Provider: OpenAI**
- **Whisper Translation**
  - Capabilities: `audio`, `translation`
  - Use case: Translate any language audio to English text

---

#### 4.3 Text-to-Speech (TTS)

**Endpoint**: `POST /v1/audio/speech`

**Provider: OpenAI**
- **TTS Model**
  - Capabilities: `audio-generation`, `text-to-speech`
  - Voices: Multiple voice options
  - Use case: Generate natural-sounding speech from text

---

### 5. Embedding Models

**API Endpoint**: `GET /v1/public/embeddings/models`

**Provider: BAAI**
- **bge-small-en-v1.5** (Default) ⭐
  - ID: `BAAI/bge-small-en-v1.5`
  - Capabilities: `embedding`, `semantic-search`
  - Dimensions: 384
  - Speed: Fast
  - Use case: Lightweight semantic search

- **bge-base-en-v1.5**
  - Dimensions: 768
  - Speed: Medium
  - Use case: Balanced performance

- **bge-large-en-v1.5**
  - Dimensions: 1024
  - Speed: Slow
  - Use case: Highest quality embeddings

---

## API Endpoints Reference

### Model Aggregation Strategy

To populate the AI Models browse page, aggregate from these endpoints:

```typescript
// 1. Chat completion models
GET /v1/models
Response: { data: [{ id, object, created, owned_by, available }] }

// 2. Embedding models
GET /v1/public/embeddings/models
Response: [{ id, dimensions, description, speed, loaded }]

// 3. Image generation (single model, hardcoded)
POST /v1/multimodal/image
Model: Qwen Image Edit

// 4. Video generation i2v (3 providers)
POST /v1/multimodal/video/i2v
Providers: wan22, seedance, sora2

// 5. Video generation t2v
POST /v1/multimodal/video/t2v

// 6. Video generation CogVideoX
POST /v1/multimodal/video/cogvideox

// 7. Audio models (hardcoded - 3 endpoints)
POST /v1/audio/transcriptions
POST /v1/audio/translations
POST /v1/audio/speech
```

---

## Data Structures

### Unified Model Interface

```typescript
interface UnifiedAIModel {
  // Identification
  id: string;                    // Unique identifier
  slug: string;                  // URL-friendly identifier
  name: string;                  // Display name

  // Categorization
  provider: string;              // OpenAI, Anthropic, Qwen, etc.
  category: ModelCategory;       // Image, Video, Audio, Coding, Embedding
  capabilities: string[];        // ['text-generation', 'reasoning', etc.]

  // Display
  thumbnail_url?: string;        // Preview image/video URL
  description: string;           // What the model does

  // Pricing
  pricing?: {
    credits: number;             // Cost in credits
    usd: number;                 // Approximate USD cost
    unit?: string;               // "per image", "per 5s video", etc.
  };

  // Technical Details
  endpoint: string;              // API endpoint path
  method: 'GET' | 'POST';        // HTTP method
  parameters?: ModelParameter[]; // Available parameters

  // Metadata
  is_default?: boolean;          // Default model in category
  is_premium?: boolean;          // Requires premium tier
  speed?: string;                // Fast, Medium, Slow
  quality?: string;              // Standard, High, Cinematic

  // API Integration
  example_request?: string;      // Example curl command
  example_response?: string;     // Example response JSON

  // Documentation
  readme?: string;               // Markdown documentation
}

type ModelCategory = 'All' | 'Image' | 'Video' | 'Audio' | 'Coding' | 'Embedding';

interface ModelParameter {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
  min?: number;
  max?: number;
  options?: any[];
}
```

---

### Example Model Data

#### Chat Completion Model
```json
{
  "id": "gpt-4",
  "slug": "gpt-4",
  "name": "GPT-4",
  "provider": "OpenAI",
  "category": "Coding",
  "capabilities": ["text-generation", "reasoning", "code", "vision"],
  "description": "OpenAI's most capable model for complex reasoning and coding tasks",
  "endpoint": "/v1/chat/completions",
  "method": "POST",
  "is_default": false,
  "parameters": [
    {
      "name": "messages",
      "type": "array",
      "required": true,
      "description": "Conversation history"
    },
    {
      "name": "temperature",
      "type": "number",
      "required": false,
      "default": 1,
      "min": 0,
      "max": 2,
      "description": "Sampling temperature"
    }
  ]
}
```

#### Video Model (i2v)
```json
{
  "id": "wan22-i2v",
  "slug": "alibaba-wan-22-i2v-720p",
  "name": "Alibaba Wan 2.2 I2V 720p",
  "provider": "Alibaba",
  "category": "Video",
  "capabilities": ["image-to-video", "video-generation"],
  "description": "Wan 2.2 is an open-source AI video generation model that utilizes a diffusion transformer architecture and a novel 3D spatio-temporal VAE for image-to-video generation",
  "thumbnail_url": "https://image.ainative.studio/asset/alibaba/wan-2i2v720.png",
  "pricing": {
    "credits": 400,
    "usd": 0.20,
    "unit": "per 5s video"
  },
  "endpoint": "/v1/wan-2-2-i2v-720/run",
  "method": "POST",
  "is_default": true,
  "speed": "Fast",
  "quality": "High",
  "parameters": [
    {
      "name": "image",
      "type": "string",
      "required": true,
      "description": "Source image URL"
    },
    {
      "name": "prompt",
      "type": "string",
      "required": true,
      "description": "Motion description"
    },
    {
      "name": "duration",
      "type": "integer",
      "required": false,
      "default": 8,
      "options": [5, 8, 10, 15],
      "description": "Video duration in seconds"
    },
    {
      "name": "num_inference_steps",
      "type": "integer",
      "required": false,
      "default": 40,
      "min": 1,
      "max": 100,
      "description": "Quality control"
    },
    {
      "name": "guidance",
      "type": "number",
      "required": false,
      "default": 5,
      "description": "How closely to follow prompt"
    }
  ],
  "example_request": "curl -X POST https://api.ainative.studio/v1/wan-2-2-i2v-720/run \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -d '{\n    \"input\": {\n      \"prompt\": \"cinematic shot: slow-tracking camera glides parallel to a giant white origami boat...\",\n      \"image\": \"https://image.ainative.studio/asset/alibaba/wan-2i2v720.png\"\n    },\n    \"num_inference_steps\": 40,\n    \"guidance\": 5,\n    \"size\": \"1280*720\",\n    \"duration\": 8\n  }'"
}
```

---

## Implementation Requirements

### Frontend Components

1. **AISettingsClient.tsx** (Browse Page)
   - Aggregate models from multiple endpoints
   - Category filtering
   - Sorting functionality
   - Responsive card grid
   - Click handler → Navigate to detail page

2. **ModelDetailClient.tsx** (Detail Page)
   - Three tabs: Playground, API, Readme
   - Tab state management
   - Model-specific UI rendering

3. **ModelPlayground.tsx** (Playground Tab)
   - Dynamic form based on model parameters
   - Result preview component (video/image/text)
   - API call handler
   - Pricing display

4. **ModelAPI.tsx** (API Tab)
   - Code generation (curl/Post format)
   - Copy to clipboard
   - API key management link
   - Syntax highlighting

5. **ModelReadme.tsx** (Readme Tab)
   - Markdown renderer
   - Model documentation

### Service Layer

1. **lib/ai-registry-service.ts**
   - Update to aggregate from all endpoints
   - Transform responses to UnifiedAIModel format
   - Cache management

2. **lib/model-aggregator.ts** (NEW)
   - Fetch from all model endpoints
   - Normalize data structures
   - Add hardcoded models (audio, image gen)

### Routing

```
/dashboard/ai-settings
  - Browse page (card grid)

/dashboard/ai-settings/[slug]
  - Model detail page
  - Default tab: Playground

  Query params:
  - ?tab=playground (default)
  - ?tab=api
  - ?tab=readme
```

### Data Flow

```
User → Browse Page
  ↓
  Load models from aggregator service
  ↓
  Display cards with:
    - Thumbnail
    - Name, description
    - Capability tags
    - Pricing
  ↓
  User clicks card
  ↓
Model Detail Page
  ↓
  Load full model data
  ↓
  Render tab content:
    - Playground: Interactive UI
    - API: Integration code
    - Readme: Documentation
```

---

## Model Detail Page Specifications

### URL Structure

Each model has a unique slug-based URL:

```
/dashboard/ai-settings/gpt-4
/dashboard/ai-settings/alibaba-wan-22-i2v-720p
/dashboard/ai-settings/qwen-image-edit
/dashboard/ai-settings/whisper-transcription
/dashboard/ai-settings/bge-small-en-v1-5
```

### Tab Behavior

- Default tab: Playground
- Shareable URLs with tab query param
- Browser back/forward navigation support
- Tab state persists on refresh

### Playground Tab Requirements

**For Video Models:**
- Image upload zone
- Prompt text area
- Negative prompt text area
- Duration selector (5s, 8s, 10s, 15s buttons)
- Advanced settings (collapsible):
  - num_inference_steps (slider)
  - guidance (slider)
  - flow_shift (slider)
  - seed (input)
  - enable_prompt_optimization (checkbox)
  - enable_safety_checker (checkbox)
- Result: Video player with controls
- Download button
- JSON response viewer

**For Image Models:**
- Prompt text area
- Width/Height inputs (or preset buttons)
- Style selector (optional)
- Result: Image preview
- Download button

**For Chat Models:**
- Message history area
- Input text box
- Temperature/top_p/max_tokens controls
- Result: Streaming text response

**For Audio Models:**
- File upload (for transcription/translation)
- Text input (for TTS)
- Language selector
- Voice selector (for TTS)
- Result: Audio player or text output

**For Embedding Models:**
- Text input (or array of texts)
- Normalize option
- Result: JSON array of vectors

### API Tab Requirements

**Components:**
1. "Create an API Key" button (links to `/dashboard/developer-settings`)
2. Code format toggle (Curl / Post)
3. Syntax-highlighted code block
4. Copy button

**Curl Format:**
```bash
curl -X POST https://api.ainative.studio/v1/{endpoint} \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -d '{
    "param1": "value1",
    "param2": "value2"
  }'
```

**Post /Run Format:**
```
POST /v1/{endpoint}
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "param1": "value1",
  "param2": "value2"
}
```

### Readme Tab Requirements

- Markdown content
- Sections:
  - Overview
  - Features
  - Parameters
  - Examples
  - Use cases
  - Pricing
  - Rate limits
  - Best practices

---

## Critical Notes

1. **Model thumbnails MUST be real example outputs**, not gradient placeholders
2. **Each model type requires different playground UI** - no one-size-fits-all
3. **API integration code must be model-specific** with actual endpoints
4. **Pricing must be accurate** and update from backend when possible
5. **Category filters must work correctly** based on capabilities
6. **Default models** should be marked with star icon
7. **Rate limits** must be displayed where applicable
8. **Premium tier models** should be clearly marked

---

## Success Criteria

- [ ] All models from all endpoints display in browse page
- [ ] Category filters work correctly
- [ ] Sorting works (Newest, Oldest, Name)
- [ ] Model cards show real thumbnails (not gradients)
- [ ] Clicking card navigates to detail page
- [ ] Playground tab works for all model types
- [ ] API tab shows correct integration code
- [ ] Readme tab displays documentation
- [ ] API key creation link works
- [ ] Copy button works
- [ ] Pricing displays correctly
- [ ] Default models marked with star
- [ ] Empty state shows when no models match filter

---

## Next Steps

1. **Phase 1**: Update model aggregation service
2. **Phase 2**: Implement browse page with real model data
3. **Phase 3**: Create model detail page routing
4. **Phase 4**: Build Playground tab for each model type
5. **Phase 5**: Build API tab with code generation
6. **Phase 6**: Build Readme tab
7. **Phase 7**: Add model thumbnails
8. **Phase 8**: Testing and refinement

---

**END OF SPECIFICATION**

This document is the definitive reference for the AI Model Registry feature. Any questions or clarifications should reference this document first.
