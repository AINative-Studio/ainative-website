# Preview Components Implementation Guide

This guide provides component skeletons and step-by-step implementation instructions for the preview component system.

**Related Documents:**
- Architecture: `/docs/architecture/PREVIEW_COMPONENTS_ARCHITECTURE.md`
- Type Definitions: `/app/dashboard/ai-settings/[slug]/types.preview.ts`
- Issue: #546

---

## Component Skeletons

### 1. PreviewSelector.tsx

**Location:** `/app/dashboard/ai-settings/[slug]/components/preview/PreviewSelector.tsx`

```typescript
'use client';

import {
  PlaygroundResult,
  PreviewSelectorProps,
  isTextResult,
  isCodeResult,
  isImageResult,
  isVideoResult,
  isAudioResult,
  isEmbeddingResult,
} from '../../types.preview';
import TextPreview from './TextPreview';
import CodePreview from './CodePreview';
import ImagePreview from './ImagePreview';
import VideoPreview from './VideoPreview';
import AudioPreview from './AudioPreview';
import EmbeddingPreview from './EmbeddingPreview';

/**
 * Preview Selector Component
 *
 * Routes to the appropriate preview component based on result type.
 * Uses TypeScript discriminated unions for type safety.
 */
export default function PreviewSelector({
  result,
  onDownload,
  onCopy,
}: PreviewSelectorProps) {
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
      return (
        <div className="p-6 text-center text-red-400">
          Unknown result type
        </div>
      );
  }
}
```

---

### 2. PreviewContainer.tsx

**Location:** `/app/dashboard/ai-settings/[slug]/components/preview/PreviewContainer.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PreviewContainerProps } from '../../types.preview';

/**
 * Preview Container Component
 *
 * Reusable wrapper for all preview components providing:
 * - Metadata display (latency, tokens, cost)
 * - Common actions (download, copy)
 * - Consistent styling
 */
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
    // Copy logic will be handled by individual preview components
    // This is a placeholder for the UI state
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
              className="gap-1.5 text-xs"
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
              className="gap-1.5 text-xs"
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

### 3. TextPreview.tsx

**Location:** `/app/dashboard/ai-settings/[slug]/components/preview/TextPreview.tsx`

```typescript
'use client';

import { TextPreviewProps } from '../../types.preview';
import PreviewContainer from './PreviewContainer';

/**
 * Text Preview Component
 *
 * Displays plain text or markdown-formatted text results.
 */
export default function TextPreview({ result, onCopy }: TextPreviewProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(result.output);
    onCopy?.();
  };

  return (
    <PreviewContainer result={result} showCopy onCopy={handleCopy}>
      <div className="p-5">
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
          {result.output}
        </p>
      </div>
    </PreviewContainer>
  );
}
```

---

### 4. CodePreview.tsx

**Location:** `/app/dashboard/ai-settings/[slug]/components/preview/CodePreview.tsx`

```typescript
'use client';

import { LazySyntaxHighlighter } from '@/components/lazy/LazyMarkdown';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodePreviewProps } from '../../types.preview';
import PreviewContainer from './PreviewContainer';

/**
 * Code Preview Component
 *
 * Displays syntax-highlighted code with copy functionality.
 */
export default function CodePreview({ result, onCopy }: CodePreviewProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(result.output);
    onCopy?.();
  };

  return (
    <PreviewContainer result={result} showCopy onCopy={handleCopy}>
      <div className="relative">
        {/* Language Badge */}
        <span className="absolute top-3 right-3 text-xs text-gray-400 bg-black/30 px-2 py-1 rounded z-10">
          {result.language || 'text'}
        </span>

        {/* Code Block */}
        <LazySyntaxHighlighter
          language={result.language || 'text'}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: 'transparent',
            fontSize: '0.875rem',
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

### 5. ImagePreview.tsx

**Location:** `/app/dashboard/ai-settings/[slug]/components/preview/ImagePreview.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagePreviewProps } from '../../types.preview';
import PreviewContainer from './PreviewContainer';

/**
 * Image Preview Component
 *
 * Displays images with zoom/pan controls and download functionality.
 */
export default function ImagePreview({ result, onDownload }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1));

  const handleDownload = () => {
    // Create temporary anchor to download image
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `image.${result.format || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload?.();
  };

  const customActions = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        disabled={zoom <= 1}
        className="gap-1.5 text-xs"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </Button>
      <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        disabled={zoom >= 4}
        className="gap-1.5 text-xs"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </Button>
    </>
  );

  return (
    <PreviewContainer
      result={result}
      showDownload
      onDownload={handleDownload}
      customActions={customActions}
    >
      <div className="p-5 flex items-center justify-center min-h-[400px] overflow-auto">
        {!imageLoaded && !imageError && (
          <div className="text-sm text-gray-400">Loading image...</div>
        )}

        {imageError && (
          <div className="text-sm text-red-400">Failed to load image</div>
        )}

        <img
          src={result.url}
          alt={result.alt_text || 'Generated image'}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease',
            maxWidth: '100%',
            height: 'auto',
            cursor: zoom > 1 ? 'move' : 'default',
          }}
          className={imageLoaded && !imageError ? 'block' : 'hidden'}
        />
      </div>

      {/* Image Info */}
      {imageLoaded && result.width && result.height && (
        <div className="px-5 pb-3 text-xs text-gray-500">
          {result.width} × {result.height} • {result.format?.toUpperCase() || 'PNG'}
        </div>
      )}
    </PreviewContainer>
  );
}
```

---

### 6. VideoPreview.tsx

**Location:** `/app/dashboard/ai-settings/[slug]/components/preview/VideoPreview.tsx`

```typescript
'use client';

import { useRef, useState } from 'react';
import { VideoPreviewProps } from '../../types.preview';
import PreviewContainer from './PreviewContainer';

/**
 * Video Preview Component
 *
 * Displays video results with HTML5 video player.
 */
export default function VideoPreview({ result, onDownload }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `video.${result.format || 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload?.();
  };

  return (
    <PreviewContainer
      result={result}
      showDownload
      onDownload={handleDownload}
    >
      <div className="flex items-center justify-center bg-black min-h-[400px]">
        {videoError ? (
          <div className="text-red-400 text-sm">
            Failed to load video. Your browser may not support this format.
          </div>
        ) : (
          <video
            ref={videoRef}
            src={result.url}
            poster={result.thumbnail_url}
            controls
            onError={() => setVideoError(true)}
            className="w-full max-h-[600px]"
            style={{ maxWidth: '100%' }}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Video Info */}
      {!videoError && (
        <div className="px-5 py-3 text-xs text-gray-500 border-t border-white/10">
          {result.duration_seconds && (
            <span>{result.duration_seconds.toFixed(1)}s</span>
          )}
          {result.width && result.height && (
            <span className="ml-3">
              {result.width} × {result.height}
            </span>
          )}
          {result.format && (
            <span className="ml-3">{result.format.toUpperCase()}</span>
          )}
        </div>
      )}
    </PreviewContainer>
  );
}
```

---

### 7. AudioPreview.tsx

**Location:** `/app/dashboard/ai-settings/[slug]/components/preview/AudioPreview.tsx`

```typescript
'use client';

import { useRef, useState } from 'react';
import { AudioPreviewProps } from '../../types.preview';
import PreviewContainer from './PreviewContainer';

/**
 * Audio Preview Component
 *
 * Displays audio results with HTML5 audio player.
 * For Whisper transcription, also shows transcript text.
 */
export default function AudioPreview({ result, onDownload }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioError, setAudioError] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `audio.${result.format || 'mp3'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload?.();
  };

  return (
    <PreviewContainer
      result={result}
      showDownload
      onDownload={handleDownload}
    >
      <div className="p-5 space-y-4">
        {/* Audio Player */}
        <div className="flex items-center justify-center">
          {audioError ? (
            <div className="text-red-400 text-sm">
              Failed to load audio. Your browser may not support this format.
            </div>
          ) : (
            <audio
              ref={audioRef}
              src={result.url}
              controls
              onError={() => setAudioError(true)}
              className="w-full"
            >
              Your browser does not support the audio tag.
            </audio>
          )}
        </div>

        {/* Transcript (for Whisper) */}
        {result.transcript && (
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Transcript</h4>
            <p className="text-sm text-gray-200 leading-relaxed">
              {result.transcript}
            </p>
          </div>
        )}

        {/* Audio Info */}
        <div className="text-xs text-gray-500 flex items-center gap-3">
          {result.duration_seconds && (
            <span>{result.duration_seconds.toFixed(1)}s</span>
          )}
          {result.format && (
            <span>{result.format.toUpperCase()}</span>
          )}
        </div>
      </div>
    </PreviewContainer>
  );
}
```

---

### 8. EmbeddingPreview.tsx

**Location:** `/app/dashboard/ai-settings/[slug]/components/preview/EmbeddingPreview.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmbeddingPreviewProps } from '../../types.preview';
import PreviewContainer from './PreviewContainer';

/**
 * Embedding Preview Component
 *
 * Displays vector embeddings with metadata and expandable JSON view.
 */
export default function EmbeddingPreview({ result, onCopy }: EmbeddingPreviewProps) {
  const [showFullJSON, setShowFullJSON] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result.embeddings, null, 2));
    onCopy?.();
  };

  return (
    <PreviewContainer result={result} showCopy onCopy={handleCopy}>
      <div className="p-5 space-y-4">
        {/* Embedding Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Vectors:</span>
            <span className="ml-2 text-white">{result.embeddings.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Dimensions:</span>
            <span className="ml-2 text-white">{result.dimensions}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400">Normalized:</span>
            <span className="ml-2 text-white">
              {result.normalized ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Input Texts */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Input Texts</h4>
          <ul className="space-y-1">
            {result.input_texts.map((text, idx) => (
              <li key={idx} className="text-sm text-gray-200">
                {idx + 1}. {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Vector Preview */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Vector Preview</h4>
          <div className="bg-black/30 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
            [{result.embeddings[0]?.slice(0, 10).map(v => v.toFixed(4)).join(', ')}
            {result.dimensions > 10 ? ` ... (${result.dimensions - 10} more)` : ''}]
          </div>
        </div>

        {/* Toggle Full JSON */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullJSON(!showFullJSON)}
            className="gap-1.5 text-xs w-full"
          >
            {showFullJSON ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Hide Full JSON
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show Full JSON
              </>
            )}
          </Button>

          {showFullJSON && (
            <pre className="mt-3 bg-black/30 rounded p-3 text-xs text-gray-300 overflow-x-auto max-h-96">
              {JSON.stringify(result.embeddings, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </PreviewContainer>
  );
}
```

---

## Integration with ModelPlayground

Update `/app/dashboard/ai-settings/[slug]/components/ModelPlayground.tsx`:

```typescript
// Add import at top
import PreviewSelector from './preview/PreviewSelector';
import { transformToPlaygroundResult, PlaygroundResult } from '../types.preview';
import { ErrorBoundary } from 'react-error-boundary';

// Change result state type
const [result, setResult] = useState<PlaygroundResult | null>(null);

// Update mutation
const runInference = useMutation({
  mutationFn: async (input: PlaygroundFormState) => {
    const response = await fetch(`https://api.ainative.studio${model.endpoint}`, {
      method: model.method,
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform API response to typed PlaygroundResult
    return transformToPlaygroundResult(data, model.category);
  },
  onSuccess: (data) => {
    setStatus('complete');
    setResult(data);
  },
  onError: (error: Error) => {
    setStatus('error');
    setResult({
      type: 'text',
      output: error.message,
      error: error.message,
      model_category: model.category,
    });
  },
});

// Replace result display section (lines 337-392) with:
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
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <p className="text-red-400 mb-2">Failed to display preview</p>
          <p className="text-sm text-gray-500">Please try again</p>
        </div>
      }
    >
      {resultView === 'preview' ? (
        <PreviewSelector
          result={result}
          onDownload={() => console.log('Download clicked')}
          onCopy={() => console.log('Copy clicked')}
        />
      ) : (
        // JSON view
        <div className="p-5 relative bg-white/[0.02] border border-white/10 rounded-xl">
          <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </ErrorBoundary>
  )}
</div>
```

---

## Testing Checklist

### Unit Tests
- [ ] PreviewSelector routes correctly based on result type
- [ ] Each preview component renders with mock data
- [ ] Copy functionality works
- [ ] Download functionality works
- [ ] Error states display correctly
- [ ] Type guards work correctly

### Integration Tests
- [ ] ModelPlayground transforms API responses correctly
- [ ] Preview components integrate with ModelPlayground
- [ ] Error boundaries catch render errors
- [ ] Loading states transition properly

### E2E Tests
- [ ] Video player controls work
- [ ] Audio player controls work
- [ ] Image zoom in/out works
- [ ] Code syntax highlighting renders
- [ ] Download buttons trigger downloads
- [ ] Copy buttons copy to clipboard

---

## Development Order

1. **Foundation** (Day 1)
   - Create `types.preview.ts` ✓ (already done)
   - Create `PreviewContainer.tsx`
   - Create `PreviewSelector.tsx`

2. **Simple Previews** (Day 2)
   - `TextPreview.tsx`
   - `EmbeddingPreview.tsx`

3. **Code Preview** (Day 3)
   - `CodePreview.tsx` (uses existing syntax highlighter)

4. **Image Preview** (Day 4)
   - `ImagePreview.tsx`
   - Add zoom/pan functionality

5. **Media Previews** (Day 5-6)
   - `VideoPreview.tsx`
   - `AudioPreview.tsx`

6. **Integration** (Day 7)
   - Update `ModelPlayground.tsx`
   - Add `transformToPlaygroundResult`
   - Error boundaries

7. **Polish** (Day 8-9)
   - Mobile responsiveness
   - Accessibility
   - Performance optimization
   - Testing

---

## Common Issues & Solutions

### Issue: Syntax highlighter not loading
**Solution:** Ensure `react-syntax-highlighter` is imported from lazy component:
```typescript
import { LazySyntaxHighlighter } from '@/components/lazy/LazyMarkdown';
```

### Issue: Video not playing
**Solution:** Check browser codec support, provide fallback message:
```typescript
<video onError={() => setVideoError(true)}>
  Your browser does not support this video format.
</video>
```

### Issue: Type errors on PlaygroundResult
**Solution:** Ensure using discriminated union type narrowing:
```typescript
if (result.type === 'video') {
  // TypeScript knows result is VideoResult here
  console.log(result.url);
}
```

---

## Next Steps

After implementing preview components:
1. Add example prompts to each model (Issue #546 Phase 1)
2. Implement "Run" buttons for example prompts
3. Add streaming support for text/code results
4. Enhance with waveform visualization for audio
5. Add video player enhancements (playback speed, quality selection)
