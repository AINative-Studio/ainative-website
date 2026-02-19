# Preview Components Architecture - Issue #546

## Executive Summary

This document outlines the architecture for displaying AI model results (video, audio, image, code, text) in the ModelPlayground preview section. The design follows a modular, type-safe approach with separate components for each media type while sharing common patterns for error handling, loading states, and user interactions.

**Key Decisions:**
- **Separate components** per media type (not a single polymorphic component)
- **Lazy loading** for heavy dependencies (video players, syntax highlighters)
- **Type-safe discriminated union** for result types
- **Reusable preview wrapper** for common UI patterns (download, copy, metadata display)
- **Progressive enhancement** with graceful degradation

---

## Current State Analysis

### ModelPlayground.tsx (Lines 286-393)

**Current Preview Section:**
- Basic text/JSON display only
- No media-specific rendering (video, audio, image)
- No syntax highlighting for code
- Minimal error states
- Download button present but generic

**Current Data Flow:**
```typescript
PlaygroundResult {
  output: string | object;  // Generic - no type discrimination
  latency_ms?: number;
  tokens_used?: number;
  cost_credits?: number;
  media_url?: string;       // Unused currently
  error?: string;
}
```

**Issues:**
1. No way to determine media type from `PlaygroundResult`
2. `output` is too generic (string | object)
3. Missing infrastructure for video/audio/image preview
4. No code syntax highlighting
5. No streaming support for large responses

---

## Proposed Architecture

### 1. Type System Enhancement

#### Enhanced Result Types (add to `/app/dashboard/ai-settings/[slug]/types.ts`)

```typescript
/**
 * Media type discriminator based on model category
 */
export type MediaType = 'text' | 'code' | 'image' | 'video' | 'audio' | 'embedding';

/**
 * Base result interface with common fields
 */
interface BasePlaygroundResult {
  latency_ms?: number;
  tokens_used?: number;
  cost_credits?: number;
  error?: string;
  model_category: ModelCategory; // From UnifiedAIModel
}

/**
 * Text result (chat models, general text)
 */
export interface TextResult extends BasePlaygroundResult {
  type: 'text';
  output: string;
  streaming?: boolean;
}

/**
 * Code result (coding models like NousCoder, Claude, GPT-4)
 */
export interface CodeResult extends BasePlaygroundResult {
  type: 'code';
  output: string;
  language?: string; // auto-detected or specified
  highlighted_html?: string; // pre-rendered HTML (optional optimization)
}

/**
 * Image result (Qwen, DALL-E, Stable Diffusion)
 */
export interface ImageResult extends BasePlaygroundResult {
  type: 'image';
  url: string;
  width?: number;
  height?: number;
  format?: string; // 'png', 'jpg', 'webp'
  alt_text?: string;
}

/**
 * Video result (Sora, CogVideo, Wan 2.2, Seedance)
 */
export interface VideoResult extends BasePlaygroundResult {
  type: 'video';
  url: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  format?: string; // 'mp4', 'webm'
  thumbnail_url?: string;
  supports_streaming?: boolean;
}

/**
 * Audio result (TTS, Whisper)
 */
export interface AudioResult extends BasePlaygroundResult {
  type: 'audio';
  url: string;
  duration_seconds?: number;
  format?: string; // 'mp3', 'wav', 'opus'
  waveform_data?: number[]; // Optional: for visualization
  transcript?: string; // For Whisper transcription results
}

/**
 * Embedding result (BGE models)
 */
export interface EmbeddingResult extends BasePlaygroundResult {
  type: 'embedding';
  embeddings: number[][];
  dimensions: number;
  normalized?: boolean;
  input_texts: string[];
}

/**
 * Discriminated union of all result types
 */
export type PlaygroundResult =
  | TextResult
  | CodeResult
  | ImageResult
  | VideoResult
  | AudioResult
  | EmbeddingResult;
```

---

### 2. Component Architecture

#### A. Component Structure

```
app/dashboard/ai-settings/[slug]/components/
├── preview/
│   ├── PreviewContainer.tsx       # Wrapper with download, metadata, tabs
│   ├── TextPreview.tsx            # Text display with copy
│   ├── CodePreview.tsx            # Syntax-highlighted code
│   ├── ImagePreview.tsx           # Image viewer with zoom/pan
│   ├── VideoPreview.tsx           # HTML5 video player
│   ├── AudioPreview.tsx           # HTML5 audio player
│   ├── EmbeddingPreview.tsx       # Vector visualization
│   └── PreviewSelector.tsx        # Routes to correct preview component
```

#### B. PreviewSelector Component (Main Router)

**Responsibility:** Route the correct preview component based on result type

```typescript
// File: app/dashboard/ai-settings/[slug]/components/preview/PreviewSelector.tsx

import { PlaygroundResult } from '../../types';
import TextPreview from './TextPreview';
import CodePreview from './CodePreview';
import ImagePreview from './ImagePreview';
import VideoPreview from './VideoPreview';
import AudioPreview from './AudioPreview';
import EmbeddingPreview from './EmbeddingPreview';

interface PreviewSelectorProps {
  result: PlaygroundResult;
  onDownload?: () => void;
  onCopy?: () => void;
}

export default function PreviewSelector({ result, onDownload, onCopy }: PreviewSelectorProps) {
  // Type-safe switch using discriminated union
  switch (result.type) {
    case 'text':
      return <TextPreview result={result} onCopy={onCopy} />;
    case 'code':
      return <CodePreview result={result} onCopy={onCopy} />;
    case 'image':
      return <ImagePreview result={result} onDownload={onDownload} />;
    case 'video':
      return <VideoPreview result={result} onDownload={onDownload} />;
    case 'audio':
      return <AudioPreview result={result} onDownload={onDownload} />;
    case 'embedding':
      return <EmbeddingPreview result={result} onCopy={onCopy} />;
    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = result;
      return null;
  }
}
```

---

#### C. PreviewContainer Component (Reusable Wrapper)

**Responsibility:** Common UI elements (metadata, download, copy, tabs)

```typescript
// File: app/dashboard/ai-settings/[slug]/components/preview/PreviewContainer.tsx

import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlaygroundResult } from '../../types';

interface PreviewContainerProps {
  result: PlaygroundResult;
  children: React.ReactNode;
  showDownload?: boolean;
  showCopy?: boolean;
  onDownload?: () => void;
  customActions?: React.ReactNode;
}

export default function PreviewContainer({
  result,
  children,
  showDownload = false,
  showCopy = false,
  onDownload,
  customActions,
}: PreviewContainerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Implementation varies by media type
    navigator.clipboard.writeText(/* ... */);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Metadata Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {result.latency_ms !== undefined && (
            <span>Latency: {result.latency_ms}ms</span>
          )}
          {result.tokens_used && <span>Tokens: {result.tokens_used}</span>}
          {result.cost_credits && <span>Cost: {result.cost_credits} credits</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {customActions}
          {showCopy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          )}
          {showDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
```

---

#### D. Individual Preview Components

##### D1. VideoPreview Component

**Responsibility:** Display video results with HTML5 player

**Dependencies:**
- HTML5 `<video>` element
- Optional: `hls.js` (already in package.json) for HLS streaming

**Features:**
- Play/pause controls
- Volume control
- Fullscreen support
- Thumbnail poster
- Download button
- Loading states
- Error handling (codec not supported, etc.)

**Interface:**
```typescript
interface VideoPreviewProps {
  result: VideoResult;
  onDownload?: () => void;
}
```

**Implementation Notes:**
- Use HTML5 video element with controls
- Add `poster` attribute for thumbnail
- Handle common video formats: mp4, webm
- Graceful degradation for unsupported formats
- Consider lazy loading the video (only load when visible)

---

##### D2. AudioPreview Component

**Responsibility:** Display audio results with HTML5 player

**Dependencies:**
- HTML5 `<audio>` element
- Optional: Waveform visualization library (e.g., wavesurfer.js - would need to add)

**Features:**
- Play/pause controls
- Volume control
- Progress bar
- Timestamp display
- Download button
- Optional: Waveform visualization
- For Whisper: Display transcript alongside audio

**Interface:**
```typescript
interface AudioPreviewProps {
  result: AudioResult;
  onDownload?: () => void;
}
```

**Implementation Notes:**
- Use HTML5 audio element with custom controls for better styling
- If `waveform_data` exists, render visualization
- If `transcript` exists (Whisper), show text below player
- Handle common audio formats: mp3, wav, opus

---

##### D3. ImagePreview Component

**Responsibility:** Display image results with zoom/pan

**Dependencies:**
- Native `<img>` element
- Optional: Image zoom library (could use CSS transform + state)

**Features:**
- Full-resolution display
- Zoom in/out controls
- Pan on click-and-drag (when zoomed)
- Download button
- Lightbox mode (optional)
- Loading skeleton
- Error state (broken image)

**Interface:**
```typescript
interface ImagePreviewProps {
  result: ImageResult;
  onDownload?: () => void;
}
```

**Implementation Notes:**
- Start at fit-to-container size
- Zoom buttons: 1x, 2x, 4x
- Use CSS `transform: scale()` for zoom
- Show dimensions and format in metadata
- Lazy load image with placeholder

---

##### D4. CodePreview Component

**Responsibility:** Display code with syntax highlighting

**Dependencies:**
- `react-syntax-highlighter` (already in package.json)
- Use existing `LazySyntaxHighlighter` from `/components/lazy/LazyMarkdown.tsx`

**Features:**
- Syntax highlighting based on detected language
- Copy to clipboard button
- Line numbers
- Language badge
- Theme: match dark mode UI

**Interface:**
```typescript
interface CodePreviewProps {
  result: CodeResult;
  onCopy?: () => void;
}
```

**Implementation Notes:**
- Reuse `LazySyntaxHighlighter` component
- Auto-detect language if not provided (simple heuristics)
- Use `Prism` theme: `vscDarkPlus` or `oneDark`
- Copy button copies raw code (not HTML)
- Show language name in top-right corner

**Example:**
```typescript
import { LazySyntaxHighlighter } from '@/components/lazy/LazyMarkdown';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodePreview({ result, onCopy }: CodePreviewProps) {
  return (
    <PreviewContainer result={result} showCopy onCopy={onCopy}>
      <div className="relative">
        <span className="absolute top-3 right-3 text-xs text-gray-400 bg-black/30 px-2 py-1 rounded">
          {result.language || 'text'}
        </span>
        <LazySyntaxHighlighter
          language={result.language || 'text'}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: 'transparent',
          }}
        >
          {result.output}
        </LazySyntaxHighlighter>
      </div>
    </PreviewContainer>
  );
}
```

---

##### D5. TextPreview Component

**Responsibility:** Display plain text/chat results

**Features:**
- Formatted text display
- Copy to clipboard
- Markdown rendering for structured text (optional)
- Streaming support (future)

**Interface:**
```typescript
interface TextPreviewProps {
  result: TextResult;
  onCopy?: () => void;
}
```

**Implementation Notes:**
- Use `whitespace-pre-wrap` for line breaks
- If text contains markdown, optionally render with `LazyReactMarkdown`
- Copy button copies plain text
- For streaming results, show cursor/loading indicator

---

##### D6. EmbeddingPreview Component

**Responsibility:** Display vector embeddings (technical users only)

**Features:**
- Show vector dimensions
- Display first N values
- Copy full JSON
- Optional: Vector similarity visualization (future enhancement)

**Interface:**
```typescript
interface EmbeddingPreviewProps {
  result: EmbeddingResult;
  onCopy?: () => void;
}
```

**Implementation Notes:**
- Show dimensions prominently
- Display first 5-10 values with "..." truncation
- Provide "Show full JSON" toggle
- Copy button copies full JSON of embeddings

---

### 3. Integration with ModelPlayground

#### Changes to ModelPlayground.tsx

**Before (lines 337-392):**
```typescript
<div className="min-h-[400px] bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
  {/* Basic text/JSON display */}
</div>
```

**After:**
```typescript
import PreviewSelector from './preview/PreviewSelector';

// ... inside return statement ...

<div className="min-h-[400px]">
  {status === 'idle' && (
    <div className="flex items-center justify-center h-[400px] text-gray-500 text-sm">
      Run a prompt to see results here
    </div>
  )}

  {status === 'running' && (
    <div className="flex items-center justify-center h-[400px]">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-400">Running inference...</p>
      </div>
    </div>
  )}

  {(status === 'complete' || status === 'error') && result && (
    <PreviewSelector
      result={result}
      onDownload={handleDownload}
      onCopy={() => handleCopy(result.output)}
    />
  )}
</div>
```

#### Result Type Transformation

**API Response → PlaygroundResult:**

The `runInference` mutation needs to transform API responses into typed `PlaygroundResult`:

```typescript
const runInference = useMutation({
  mutationFn: async (input: PlaygroundFormState) => {
    const response = await fetch(`https://api.ainative.studio${model.endpoint}`, {
      method: model.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    // Transform API response to PlaygroundResult based on model category
    return transformToPlaygroundResult(data, model.category);
  },
  // ... rest of mutation config
});
```

**Transformer function:**
```typescript
function transformToPlaygroundResult(
  apiResponse: unknown,
  modelCategory: ModelCategory
): PlaygroundResult {
  const base = {
    latency_ms: apiResponse.latency_ms,
    tokens_used: apiResponse.tokens_used,
    cost_credits: apiResponse.cost_credits,
    model_category: modelCategory,
  };

  switch (modelCategory) {
    case 'Video':
      return {
        ...base,
        type: 'video',
        url: apiResponse.video_url,
        duration_seconds: apiResponse.duration,
        width: apiResponse.width,
        height: apiResponse.height,
      };
    case 'Audio':
      return {
        ...base,
        type: 'audio',
        url: apiResponse.audio_url,
        duration_seconds: apiResponse.duration,
        transcript: apiResponse.transcript, // For Whisper
      };
    case 'Image':
      return {
        ...base,
        type: 'image',
        url: apiResponse.image_url,
        width: apiResponse.width,
        height: apiResponse.height,
      };
    case 'Coding':
      return {
        ...base,
        type: 'code',
        output: apiResponse.code || apiResponse.output,
        language: apiResponse.language || detectLanguage(apiResponse.code),
      };
    case 'Embedding':
      return {
        ...base,
        type: 'embedding',
        embeddings: apiResponse.embeddings,
        dimensions: apiResponse.embeddings[0]?.length || 0,
        input_texts: apiResponse.input_texts,
      };
    default: // Text models
      return {
        ...base,
        type: 'text',
        output: apiResponse.output || apiResponse.text,
      };
  }
}
```

---

### 4. Error Handling Strategy

#### Error Boundary

Wrap preview components in error boundary to catch rendering errors:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function PreviewErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-6 text-center">
      <p className="text-red-400 mb-2">Failed to display preview</p>
      <p className="text-sm text-gray-500">{error.message}</p>
    </div>
  );
}

// In ModelPlayground:
<ErrorBoundary FallbackComponent={PreviewErrorFallback}>
  <PreviewSelector result={result} />
</ErrorBoundary>
```

#### Individual Component Error States

Each preview component handles its own errors:

**VideoPreview:**
- Codec not supported
- Network error loading video
- File corrupted

**AudioPreview:**
- Audio format not supported
- Playback failed

**ImagePreview:**
- Image failed to load (404, network error)
- Corrupted image file

**CodePreview:**
- Syntax highlighting failed (fallback to plain text)

---

### 5. Performance Considerations

#### Lazy Loading

**Heavy dependencies loaded on-demand:**
- `react-syntax-highlighter` (already lazy-loaded)
- Video player enhancements (HLS.js)
- Potential waveform library (future)

**Code splitting:**
```typescript
// Lazy load preview components
const VideoPreview = dynamic(() => import('./preview/VideoPreview'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});
```

#### Image Optimization

- Use Next.js `Image` component for thumbnails
- Lazy load full-resolution images
- Placeholder while loading

#### Video Optimization

- Start loading only when user scrolls into view (Intersection Observer)
- Use `preload="metadata"` for faster poster/duration display
- Streaming support for long videos (HLS)

---

### 6. Accessibility

**All preview components must:**
- Provide keyboard navigation
- Include proper ARIA labels
- Support screen readers
- Have focus indicators
- Maintain color contrast ratios

**Video/Audio:**
- Native controls are keyboard accessible
- Add captions/subtitles support (future)

**Image:**
- Alt text from API response
- Zoom controls keyboard accessible

**Code:**
- Syntax highlighting doesn't break screen readers
- Copy button has descriptive label

---

### 7. Mobile Responsiveness

**Video/Audio:**
- Use native mobile players on iOS/Android
- Fullscreen works on mobile

**Image:**
- Pinch-to-zoom on touch devices
- Pan gestures

**Code:**
- Horizontal scroll for long lines
- Copy button always visible

**Text:**
- Readable font size on mobile
- Proper line breaks

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. Update type definitions in `types.ts`
2. Create `PreviewContainer` component
3. Create `PreviewSelector` component
4. Update `ModelPlayground.tsx` integration
5. Implement `transformToPlaygroundResult` utility

### Phase 2: Core Previews (Week 2)
6. Implement `TextPreview` component
7. Implement `CodePreview` component (reuse existing syntax highlighter)
8. Implement `ImagePreview` component
9. Add error boundaries and loading states

### Phase 3: Media Previews (Week 3)
10. Implement `VideoPreview` component
11. Implement `AudioPreview` component
12. Implement `EmbeddingPreview` component
13. Add download functionality for all media types

### Phase 4: Polish (Week 4)
14. Add lazy loading for heavy components
15. Mobile responsiveness testing
16. Accessibility audit and fixes
17. Performance optimization
18. Error handling edge cases

---

## Technology Stack

### Existing Dependencies (No New Installs Needed)
- **Syntax Highlighting:** `react-syntax-highlighter` v16.1.0
- **Video Streaming:** `hls.js` v1.6.15 (already installed)
- **Error Boundaries:** `react-error-boundary` v6.0.0
- **UI Components:** Radix UI (comprehensive suite)
- **Styling:** Tailwind CSS + existing UI components

### Future Enhancements (Optional)
- **Waveform Visualization:** wavesurfer.js (for AudioPreview)
- **Image Zoom:** react-medium-image-zoom or custom implementation
- **Vector Visualization:** D3.js or Recharts (for EmbeddingPreview)

---

## Risk Assessment

### Technical Risks

**1. Video Codec Compatibility**
- **Risk:** User's browser doesn't support video format
- **Mitigation:** Detect codec support, show fallback message, provide download link
- **Priority:** Medium

**2. Large Media Files**
- **Risk:** Slow loading, high bandwidth usage
- **Mitigation:** Streaming support (HLS), progressive loading, CDN usage
- **Priority:** High

**3. Mobile Performance**
- **Risk:** Large videos/images crash on low-memory devices
- **Mitigation:** Resolution detection, quality selection, lazy loading
- **Priority:** Medium

**4. API Response Variability**
- **Risk:** Different AI providers return different response formats
- **Mitigation:** Robust transformation layer, schema validation, error handling
- **Priority:** High

### UX Risks

**1. Loading Delays**
- **Risk:** Users frustrated by slow media loading
- **Mitigation:** Skeleton loaders, progress indicators, instant feedback
- **Priority:** Medium

**2. Accessibility**
- **Risk:** Media players not accessible to all users
- **Mitigation:** Native controls, keyboard support, ARIA labels, captions
- **Priority:** High

---

## Success Metrics

### Functional Criteria
- All media types render correctly in preview section
- Download functionality works for all media types
- Copy functionality works for text/code/JSON
- Error states display helpful messages
- Loading states provide visual feedback

### Performance Criteria
- Preview components lazy-load heavy dependencies
- Images load with progressive enhancement
- Video starts playing within 2 seconds (on good connection)
- Code syntax highlighting completes in <500ms

### Accessibility Criteria
- All interactive elements keyboard accessible
- Screen reader compatible
- WCAG 2.1 AA color contrast ratios
- Focus indicators visible

### Quality Criteria
- 80%+ test coverage for preview components
- No console errors in production
- Works on Chrome, Firefox, Safari (desktop + mobile)
- Responsive on screens 320px-4K

---

## File Structure Summary

```
/Users/aideveloper/core/AINative-website-nextjs/
├── app/dashboard/ai-settings/[slug]/
│   ├── components/
│   │   ├── ModelPlayground.tsx                 # MODIFIED
│   │   └── preview/
│   │       ├── PreviewContainer.tsx            # NEW
│   │       ├── PreviewSelector.tsx             # NEW
│   │       ├── TextPreview.tsx                 # NEW
│   │       ├── CodePreview.tsx                 # NEW
│   │       ├── ImagePreview.tsx                # NEW
│   │       ├── VideoPreview.tsx                # NEW
│   │       ├── AudioPreview.tsx                # NEW
│   │       └── EmbeddingPreview.tsx            # NEW
│   ├── types.ts                                 # MODIFIED (add new result types)
│   └── utils/
│       └── transformPlaygroundResult.ts         # NEW (type transformer)
└── docs/architecture/
    └── PREVIEW_COMPONENTS_ARCHITECTURE.md      # THIS FILE

```

---

## Next Steps

1. **Review this architecture** with team/stakeholders
2. **Create GitHub issue** with checklist from this document
3. **Break down into subtasks** for parallel development
4. **Assign owners** to each preview component
5. **Set up testing strategy** (unit tests, integration tests, E2E)
6. **Begin Phase 1** implementation

---

## Appendix: TypeScript Interfaces

### Complete Type Definitions

See Section 1 (Type System Enhancement) for full interface definitions.

### API Response Examples

**Video Model Response:**
```json
{
  "video_url": "https://cdn.ainative.studio/outputs/abc123.mp4",
  "thumbnail_url": "https://cdn.ainative.studio/outputs/abc123_thumb.jpg",
  "duration": 5.2,
  "width": 1280,
  "height": 720,
  "latency_ms": 4523,
  "cost_credits": 50
}
```

**Audio Model Response (TTS):**
```json
{
  "audio_url": "https://cdn.ainative.studio/outputs/xyz456.mp3",
  "duration": 12.8,
  "format": "mp3",
  "latency_ms": 1234,
  "cost_credits": 5
}
```

**Code Model Response:**
```json
{
  "output": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "language": "python",
  "tokens_used": 45,
  "latency_ms": 876,
  "cost_credits": 2
}
```

---

## References

- **Issue #546:** https://github.com/AINative-Studio/ainative-website-nextjs-staging/issues/546
- **ModelPlayground:** `/app/dashboard/ai-settings/[slug]/components/ModelPlayground.tsx`
- **Existing Types:** `/app/dashboard/ai-settings/[slug]/types.ts`
- **Syntax Highlighter:** `/components/lazy/LazyMarkdown.tsx`
- **UI Components:** `/components/ui/`

---

**Document Version:** 1.0
**Last Updated:** 2026-02-07
**Author:** System Architect Agent
**Status:** Ready for Review
