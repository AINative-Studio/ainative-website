# Preview Components

This directory contains preview components for displaying AI model outputs in the playground.

## Components

### TextPreview
Displays plain text results with optional Markdown rendering.

```tsx
import { TextPreview } from './preview';

const result: TextResult = {
  type: 'text',
  output: 'The capital of France is Paris.',
  latency_ms: 234,
  tokens_used: 15,
  cost_credits: 1,
  model_category: 'All',
};

<TextPreview result={result} onCopy={() => console.log('Copied!')} />
```

**Features:**
- Plain text display with whitespace preservation
- Auto-detect Markdown syntax
- Toggle between plain and Markdown rendering
- Copy to clipboard
- Metadata display (latency, tokens, cost)

### CodePreview
Displays code with syntax highlighting and line numbers.

```tsx
import { CodePreview } from './preview';

const result: CodeResult = {
  type: 'code',
  output: 'def hello():\n    print("Hello, World!")',
  language: 'python',
  latency_ms: 567,
  tokens_used: 23,
  cost_credits: 2,
  model_category: 'Coding',
};

<CodePreview result={result} onCopy={() => console.log('Copied!')} />
```

**Features:**
- Syntax highlighting (30+ languages supported)
- Auto-detect language if not provided
- Line numbers
- Language badge
- Copy to clipboard
- Metadata display (latency, tokens, cost)
- Custom scrollbars

### ImagePreview
Displays image generation results with download capability.

```tsx
import { ImagePreview } from './preview';

const result: ImageResult = {
  type: 'image',
  url: 'https://cdn.ainative.studio/outputs/abc123.png',
  width: 2048,
  height: 2048,
  format: 'png',
  alt_text: 'A serene mountain landscape',
  model_category: 'Image',
};

<ImagePreview result={result} />
```

### VideoPreview
Displays video generation results with player controls.

```tsx
import { VideoPreview } from './preview';

const result: VideoResult = {
  type: 'video',
  url: 'https://cdn.ainative.studio/outputs/video.mp4',
  duration_seconds: 5.2,
  thumbnail_url: 'https://cdn.ainative.studio/outputs/thumb.jpg',
  model_category: 'Video',
};

<VideoPreview result={result} />
```

### AudioPreview
Displays audio results with waveform and playback controls.

```tsx
import { AudioPreview } from './preview';

const result: AudioResult = {
  type: 'audio',
  url: 'https://cdn.ainative.studio/outputs/audio.mp3',
  duration_seconds: 12.8,
  transcript: 'Transcribed text here...',
  model_category: 'Audio',
};

<AudioPreview result={result} />
```

### EmbeddingPreview
Displays vector embeddings with visualization and export.

```tsx
import { EmbeddingPreview } from './preview';

const result: EmbeddingResult = {
  type: 'embedding',
  embeddings: [[0.123, -0.456, 0.789, ...]],
  dimensions: 1024,
  input_texts: ['Text to embed'],
  model_category: 'Embedding',
};

<EmbeddingPreview result={result} />
```

### PreviewContainer
Wrapper component that provides consistent styling and actions.

```tsx
import { PreviewContainer } from './preview';

<PreviewContainer
  result={result}
  showDownload={true}
  showCopy={true}
  onDownload={() => {}}
  customActions={<Button>Custom Action</Button>}
>
  {/* Your preview content */}
</PreviewContainer>
```

### PreviewSelector
Router component that selects the appropriate preview based on result type.

```tsx
import { PreviewSelector } from './preview';

<PreviewSelector
  result={result}
  onDownload={() => {}}
  onCopy={() => {}}
/>
```

## Usage in ModelPlayground

```tsx
import { PreviewSelector } from './components/preview';

// In your ModelPlayground component
{result && (
  <PreviewSelector
    result={result}
    onDownload={() => handleDownload(result)}
    onCopy={() => handleCopy(result)}
  />
)}
```

## Type Safety

All components use TypeScript discriminated unions from `types.preview.ts`:

```typescript
type PlaygroundResult =
  | TextResult
  | CodeResult
  | ImageResult
  | VideoResult
  | AudioResult
  | EmbeddingResult;
```

This ensures type-safe switching and exhaustiveness checking.

## Styling

All components use:
- Dark mode compatible styling
- Consistent spacing and borders
- Responsive design
- Custom scrollbars
- Accessible color contrasts

## Dependencies

- `react-syntax-highlighter@16.1.0` - Code highlighting
- `react-markdown@10.1.0` - Markdown rendering
- `lucide-react` - Icons
- `recharts` - Embedding visualization

## Testing

Tests are located in `__tests__/preview.test.tsx`. Run with:

```bash
npm test preview.test.tsx
```

## Related

- Issue #546 - Add example prompts to model playground pages
- `/app/dashboard/ai-settings/[slug]/types.preview.ts` - Type definitions
- `/components/tutorial/CodeSnippet.tsx` - Original code snippet component
