# AI Model Thumbnail Strategy

**Status**: Active Implementation Guide
**Last Updated**: 2026-02-06
**Purpose**: Define thumbnail image specifications and strategy for all AI models in the registry

---

## Overview

The AI Model Registry displays 15 models across 5 categories. Each model card requires a thumbnail image showing example output to help users quickly understand model capabilities.

---

## Image Specifications

### Technical Requirements

| Specification | Value | Reasoning |
|--------------|-------|-----------|
| **Dimensions** | 640x360 (16:9) | Standard video aspect ratio, responsive friendly |
| **Format** | WebP with JPG fallback | WebP: 25-35% smaller, JPG: Universal compatibility |
| **Quality** | 80% | Balance between quality and file size |
| **Max File Size** | 50KB per image | Fast page load, mobile-friendly |
| **Color Space** | sRGB | Web standard, consistent across devices |
| **Lazy Loading** | Yes | Load images only when visible in viewport |

### Responsive Breakpoints

```typescript
// Thumbnail sizing across breakpoints
mobile: 100% width (max 640px)
tablet: 50% width (max 640px)
desktop: 33.33% width (max 640px)
xl: 25% width (max 640px)
```

---

## Naming Conventions

### File Naming Pattern

```
{provider}-{model-slug}-{type}.{ext}

Examples:
openai-gpt-4-chat.webp
alibaba-wan22-i2v-demo.webp
qwen-image-edit-sample.webp
```

### URL Structure

```
https://image.ainative.studio/thumbnails/{category}/{filename}

Examples:
https://image.ainative.studio/thumbnails/chat/openai-gpt-4-chat.webp
https://image.ainative.studio/thumbnails/video/alibaba-wan22-i2v-demo.webp
https://image.ainative.studio/thumbnails/image/qwen-image-edit-sample.webp
```

---

## Storage Location

### Primary Storage: S3-Compatible Object Storage

**Provider**: ZeroDB File Storage (S3-compatible)

**Bucket Structure**:
```
ainative-thumbnails/
├── chat/
│   ├── openai-gpt-4-chat.webp
│   ├── openai-gpt-35-turbo-chat.webp
│   └── anthropic-claude-35-sonnet-chat.webp
├── image/
│   └── qwen-image-edit-sample.webp
├── video/
│   ├── alibaba-wan22-i2v-demo.webp
│   ├── seedance-i2v-demo.webp
│   ├── sora2-i2v-demo.webp
│   ├── text-to-video-demo.webp
│   └── cogvideox-2b-demo.webp
├── audio/
│   ├── whisper-transcription-waveform.webp
│   ├── whisper-translation-waveform.webp
│   └── openai-tts-waveform.webp
└── embedding/
    ├── bge-small-en-v15-visualization.webp
    ├── bge-base-en-v15-visualization.webp
    └── bge-large-en-v15-visualization.webp
```

**Access Pattern**: Public read, authenticated write

**CDN**: Use CloudFlare CDN for global distribution and caching

---

## Fallback Strategy

### Three-Tier Fallback System

1. **Primary**: Real thumbnail image from S3
2. **Secondary**: Provider-branded gradient placeholder (SVG data URL)
3. **Tertiary**: Generic category gradient (SVG data URL)

### Implementation Flow

```typescript
function getThumbnailUrl(model: UnifiedAIModel): string {
  // 1. Try model's thumbnail_url
  if (model.thumbnail_url) {
    return model.thumbnail_url;
  }

  // 2. Generate provider-branded gradient placeholder
  if (model.provider) {
    return generateProviderGradient(model.provider);
  }

  // 3. Generate category gradient placeholder
  return generateCategoryGradient(model.category);
}
```

---

## Thumbnail Content Guidelines

### Chat Models (3 models)

**Content Type**: Screenshot of example conversation or code output

**Requirements**:
- Show representative conversation snippet
- Highlight model's key capability (reasoning, coding, vision)
- Use clean, readable font rendering
- Include subtle branding (OpenAI green, Anthropic orange, etc.)

**Example Content**:
- **GPT-4**: Code generation example or complex reasoning output
- **GPT-3.5 Turbo**: Quick Q&A or simple task completion
- **Claude 3.5 Sonnet**: Long-form analysis or document processing

---

### Image Models (1 model)

**Content Type**: Example AI-generated image

**Requirements**:
- High-quality, visually appealing image
- Demonstrates model's artistic capability
- Safe for work, professional context
- No text overlays (let the image speak)

**Example Content**:
- **Qwen Image Edit**: Artistic landscape, portrait, or abstract art showcasing style transfer

---

### Video Models (5 models)

**Content Type**: First frame or animated GIF/WebP from generated video

**Requirements**:
- First frame should be visually interesting
- For animated thumbnails: 2-3 second loop, max 100KB
- Show motion/transformation clearly
- Cinematic composition for premium models (Sora2)

**Example Content**:
- **Alibaba Wan 2.2 I2V**: Static first frame from sample video (origami boat, etc.)
- **Seedance I2V**: First frame showing clear subject
- **Sora2 I2V**: Cinematic first frame emphasizing quality
- **Text-to-Video**: First frame from text-generated scene
- **CogVideoX**: First frame from generated sequence

**Alternative**: Use static poster frame instead of animated GIF for performance

---

### Audio Models (3 models)

**Content Type**: Waveform visualization or microphone icon with branding

**Requirements**:
- Abstract waveform visualization (not actual audio data)
- Clean, modern design
- Provider colors (OpenAI teal/green)
- Icon overlay (microphone, speaker, translation symbol)

**Example Content**:
- **Whisper Transcription**: Waveform with microphone icon
- **Whisper Translation**: Waveform with translation/globe icon
- **Text-to-Speech**: Waveform with speaker icon

---

### Embedding Models (3 models)

**Content Type**: Vector visualization or semantic search diagram

**Requirements**:
- Abstract representation of embeddings
- Show dimension count visually (dots, nodes, etc.)
- Use BAAI branding colors
- Differentiate by speed (small=fast, large=slow)

**Example Content**:
- **bge-small-en-v1.5**: Smaller dot cluster (384 dimensions)
- **bge-base-en-v1.5**: Medium dot cluster (768 dimensions)
- **bge-large-en-v1.5**: Larger dot cluster (1024 dimensions)

---

## Provider Brand Colors

Use for gradient placeholders when real thumbnails are unavailable:

```typescript
const PROVIDER_COLORS = {
  OpenAI: {
    primary: '#10A37F',    // Teal green
    secondary: '#1A7F64',
    gradient: 'linear-gradient(135deg, #10A37F 0%, #1A7F64 100%)'
  },
  Anthropic: {
    primary: '#D97757',    // Orange
    secondary: '#C4613D',
    gradient: 'linear-gradient(135deg, #D97757 0%, #C4613D 100%)'
  },
  Alibaba: {
    primary: '#FF6A00',    // Orange
    secondary: '#FF8C00',
    gradient: 'linear-gradient(135deg, #FF6A00 0%, #FF8C00 100%)'
  },
  Qwen: {
    primary: '#722ED1',    // Purple
    secondary: '#531DAB',
    gradient: 'linear-gradient(135deg, #722ED1 0%, #531DAB 100%)'
  },
  Seedance: {
    primary: '#52C41A',    // Green
    secondary: '#389E0D',
    gradient: 'linear-gradient(135deg, #52C41A 0%, #389E0D 100%)'
  },
  Sora: {
    primary: '#1890FF',    // Blue
    secondary: '#096DD9',
    gradient: 'linear-gradient(135deg, #1890FF 0%, #096DD9 100%)'
  },
  CogVideo: {
    primary: '#FA541C',    // Red-orange
    secondary: '#D4380D',
    gradient: 'linear-gradient(135deg, #FA541C 0%, #D4380D 100%)'
  },
  BAAI: {
    primary: '#13C2C2',    // Cyan
    secondary: '#08979C',
    gradient: 'linear-gradient(135deg, #13C2C2 0%, #08979C 100%)'
  },
  Generic: {
    primary: '#8C8C8C',    // Gray
    secondary: '#595959',
    gradient: 'linear-gradient(135deg, #8C8C8C 0%, #595959 100%)'
  }
};
```

---

## Category Gradient Colors

Fallback when provider is unknown:

```typescript
const CATEGORY_COLORS = {
  Coding: {
    gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
  },
  Image: {
    gradient: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)'
  },
  Video: {
    gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)'
  },
  Audio: {
    gradient: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)'
  },
  Embedding: {
    gradient: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)'
  }
};
```

---

## Placeholder SVG Template

### Provider-Branded Placeholder

```typescript
function generateProviderPlaceholder(provider: string, initials: string): string {
  const colors = PROVIDER_COLORS[provider] || PROVIDER_COLORS.Generic;

  const svg = `
    <svg width="640" height="360" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#grad)"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="72"
        font-weight="bold"
        fill="white"
        fill-opacity="0.3"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
```

---

## Image Optimization Process

### Before Upload

1. **Resize**: Scale to 640x360 exactly (no upscaling)
2. **Compress**: Use 80% quality for WebP and JPG
3. **Strip Metadata**: Remove EXIF data to reduce file size
4. **Convert**: Generate both WebP and JPG versions

### Recommended Tools

```bash
# Using ImageMagick
convert input.jpg -resize 640x360^ -gravity center -extent 640x360 \
  -quality 80 -strip output.jpg

# Using cwebp (WebP encoder)
cwebp -q 80 -resize 640 360 input.jpg -o output.webp

# Batch conversion script available at:
# scripts/optimize-thumbnails.sh
```

---

## Performance Optimization

### Lazy Loading Implementation

```typescript
<img
  src={thumbnailUrl}
  alt={model.name}
  loading="lazy"
  width={640}
  height={360}
  className="aspect-video object-cover"
/>
```

### Picture Element with Fallback

```typescript
<picture>
  <source srcSet={thumbnailUrl.replace('.jpg', '.webp')} type="image/webp" />
  <source srcSet={thumbnailUrl} type="image/jpeg" />
  <img
    src={thumbnailUrl}
    alt={model.name}
    loading="lazy"
    width={640}
    height={360}
  />
</picture>
```

### Responsive Images

```typescript
<img
  src={thumbnailUrl}
  srcSet={`
    ${thumbnailUrl} 640w,
    ${thumbnailUrl.replace('.jpg', '-480.jpg')} 480w,
    ${thumbnailUrl.replace('.jpg', '-320.jpg')} 320w
  `}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt={model.name}
  loading="lazy"
/>
```

---

## Accessibility Requirements

### Alt Text Guidelines

**Format**: `{Model Name} - {Brief Description}`

**Examples**:
- `GPT-4 - Example of code generation and reasoning capabilities`
- `Alibaba Wan 2.2 - Sample image-to-video generation result`
- `Qwen Image Edit - AI-generated artistic landscape`

### ARIA Attributes

```typescript
<img
  src={thumbnailUrl}
  alt={`${model.name} - ${model.description}`}
  role="img"
  aria-label={`Thumbnail for ${model.name} AI model`}
/>
```

---

## Upload Process

### Using ZeroDB File Storage API

```typescript
// Upload thumbnail to ZeroDB S3-compatible storage
async function uploadThumbnail(
  file: File,
  category: string,
  filename: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `https://api.ainative.studio/v1/storage/upload?path=thumbnails/${category}/${filename}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    }
  );

  const { url } = await response.json();
  return url;
}
```

### Batch Upload Script

Location: `scripts/upload-thumbnails.sh`

```bash
#!/bin/bash
# Upload all thumbnails to ZeroDB storage
# Usage: ./scripts/upload-thumbnails.sh

THUMBNAIL_DIR="assets/thumbnails"
API_ENDPOINT="https://api.ainative.studio/v1/storage/upload"

for category in chat image video audio embedding; do
  echo "Uploading ${category} thumbnails..."
  for file in ${THUMBNAIL_DIR}/${category}/*; do
    filename=$(basename "$file")
    curl -X POST "${API_ENDPOINT}?path=thumbnails/${category}/${filename}" \
      -H "Authorization: Bearer ${AINATIVE_API_KEY}" \
      -F "file=@${file}"
  done
done
```

---

## Testing Checklist

### Visual Testing

- [ ] All thumbnails load correctly on model browse page
- [ ] Fallback gradients display when thumbnail URL fails
- [ ] Images maintain aspect ratio across all breakpoints
- [ ] Lazy loading works (images load when scrolling)
- [ ] WebP images load in supported browsers
- [ ] JPG fallback works in Safari/older browsers

### Performance Testing

- [ ] All thumbnails under 50KB file size
- [ ] Page load time < 3 seconds with all thumbnails
- [ ] Lighthouse performance score > 90
- [ ] No layout shift (CLS) when images load
- [ ] Images optimized for mobile data usage

### Accessibility Testing

- [ ] Alt text present and descriptive
- [ ] Screen reader announces image purpose correctly
- [ ] Keyboard navigation doesn't break
- [ ] High contrast mode doesn't hide images

---

## Monitoring and Maintenance

### Image Load Monitoring

Track thumbnail load success rate:

```typescript
function trackThumbnailLoad(modelId: string, success: boolean) {
  analytics.track('thumbnail_load', {
    model_id: modelId,
    success,
    timestamp: new Date().toISOString()
  });
}
```

### Quarterly Review

- Review thumbnail effectiveness (click-through rates)
- Update thumbnails if model output quality improves
- Add new thumbnails for new models
- Optimize file sizes if bandwidth usage is high

---

## Future Enhancements

### Video Thumbnails

- Use animated WebP for video models (looping 2-3 second clips)
- Implement hover-to-play functionality
- Generate video thumbnails automatically from model output

### Dynamic Thumbnails

- Generate thumbnails on-demand from recent model outputs
- Personalized thumbnails based on user's previous generations
- A/B testing different thumbnail styles

### AI-Generated Thumbnails

- Use image models to generate consistent thumbnail style
- Batch generate thumbnails for new models automatically
- Maintain consistent visual brand across all thumbnails

---

## Resources

### Tools

- [ImageMagick](https://imagemagick.org/) - Image processing
- [cwebp](https://developers.google.com/speed/webp/docs/cwebp) - WebP encoder
- [Squoosh](https://squoosh.app/) - Online image optimizer
- [TinyPNG](https://tinypng.com/) - PNG/JPG compression

### Image Sources

- [Unsplash](https://unsplash.com/) - Free stock photos (placeholder images)
- [Pexels](https://www.pexels.com/) - Free stock photos and videos
- Actual model outputs from AINative platform (preferred)

### Documentation

- ZeroDB File Storage API: `docs/api/ZERODB_FILE_STORAGE_GUIDE.md`
- AI Model Registry System: `docs/ai-models/AI_MODEL_REGISTRY_SYSTEM.md`
- Thumbnail Implementation Plan: `docs/ai-models/THUMBNAIL_IMPLEMENTATION_PLAN.md`

---

**END OF STRATEGY DOCUMENT**

This document defines the complete thumbnail strategy for the AI Model Registry. Implementation details are in the separate implementation plan document.
