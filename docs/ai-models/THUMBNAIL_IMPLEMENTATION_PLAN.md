# AI Model Thumbnail Implementation Plan

**Status**: Ready for Execution
**Last Updated**: 2026-02-06
**Reference**: `docs/ai-models/THUMBNAIL_STRATEGY.md`

---

## Overview

This document provides a step-by-step implementation plan for adding thumbnail images to all 15 AI models in the registry. The plan is designed to be executed in phases, with immediate placeholder implementation followed by gradual real image uploads.

---

## Phase 1: Immediate Implementation (Code Changes)

### 1.1 Create Thumbnail Generator Utility

**File**: `/Users/aideveloper/core/AINative-website-nextjs/lib/utils/thumbnail-generator.ts`

**Status**: COMPLETED (see file below)

**Purpose**: Generate SVG data URL placeholders for models without real thumbnails

**Features**:
- Provider-branded gradient placeholders
- Category-based fallback gradients
- Provider initials overlay
- Consistent 640x360 aspect ratio

---

### 1.2 Update Model Aggregator Service

**Files to Update**:
- `/Users/aideveloper/core/AINative-website-nextjs/lib/model-aggregator.ts`
- `/Users/aideveloper/core/AINative-website-nextjs/lib/model-aggregator-service.ts`

**Changes**:
1. Import thumbnail generator utility
2. Add thumbnail URLs to all hardcoded models
3. Use placeholder generator for models without real thumbnails
4. Ensure thumbnail_url field is populated for all models

**Implementation Pattern**:
```typescript
import { getThumbnailUrl } from './utils/thumbnail-generator';

// For models with real thumbnails
thumbnail_url: 'https://image.ainative.studio/thumbnails/video/alibaba-wan22-i2v-demo.webp',

// For models without real thumbnails (use placeholder)
thumbnail_url: getThumbnailUrl({
  provider: 'OpenAI',
  category: 'Audio'
}),
```

---

### 1.3 Update Model Card Component

**File**: Find and update the model card component (likely in `/Users/aideveloper/core/AINative-website-nextjs/src/components/*` or `/Users/aideveloper/core/AINative-website-nextjs/components/*`)

**Changes**:
1. Ensure thumbnail image is displayed
2. Add lazy loading attribute
3. Add proper alt text
4. Handle image load errors with fallback
5. Add aspect-video class for consistent sizing

**Example Implementation**:
```typescript
<div className="relative h-36 overflow-hidden rounded-t-lg bg-gray-100">
  <img
    src={model.thumbnail_url}
    alt={`${model.name} - ${model.description}`}
    loading="lazy"
    width={640}
    height={360}
    className="w-full h-full object-cover"
    onError={(e) => {
      // Fallback to gradient placeholder if image fails to load
      e.currentTarget.src = getThumbnailUrl({
        provider: model.provider,
        category: model.category
      });
    }}
  />
  {model.is_default && (
    <div className="absolute top-2 right-2">
      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
    </div>
  )}
</div>
```

---

## Phase 2: Thumbnail URL Mapping

### 2.1 Chat Models (3 models)

| Model | Provider | Thumbnail URL | Status |
|-------|----------|--------------|--------|
| GPT-4 | OpenAI | `https://image.ainative.studio/thumbnails/chat/openai-gpt-4-chat.webp` | Placeholder |
| GPT-3.5 Turbo | OpenAI | `https://image.ainative.studio/thumbnails/chat/openai-gpt-35-turbo-chat.webp` | Placeholder |
| Claude 3.5 Sonnet | Anthropic | `https://image.ainative.studio/thumbnails/chat/anthropic-claude-35-sonnet-chat.webp` | Placeholder |

**Placeholder Implementation**:
```typescript
// Use placeholder generator temporarily
thumbnail_url: getThumbnailUrl({
  provider: 'OpenAI',
  category: 'Coding',
  initials: 'GPT4'
}),
```

---

### 2.2 Image Models (1 model)

| Model | Provider | Thumbnail URL | Status |
|-------|----------|--------------|--------|
| Qwen Image Edit | Qwen | `https://image.ainative.studio/thumbnails/image/qwen-image-edit-sample.webp` | Placeholder |

**Temporary Placeholder**:
```typescript
thumbnail_url: getThumbnailUrl({
  provider: 'Qwen',
  category: 'Image',
  initials: 'QE'
}),
```

---

### 2.3 Video Models (5 models)

| Model | Provider | Thumbnail URL | Status |
|-------|----------|--------------|--------|
| Alibaba Wan 2.2 I2V | Alibaba | `https://image.ainative.studio/asset/alibaba/wan-2i2v720.png` | EXISTING |
| Seedance I2V | Seedance | `https://image.ainative.studio/thumbnails/video/seedance-i2v-demo.webp` | Placeholder |
| Sora2 I2V | Sora | `https://image.ainative.studio/thumbnails/video/sora2-i2v-demo.webp` | Placeholder |
| Text-to-Video | Generic | `https://image.ainative.studio/thumbnails/video/text-to-video-demo.webp` | Placeholder |
| CogVideoX-2B | CogVideo | `https://image.ainative.studio/thumbnails/video/cogvideox-2b-demo.webp` | Placeholder |

**Note**: Alibaba Wan 2.2 already has a thumbnail URL in the spec. Keep it.

---

### 2.4 Audio Models (3 models)

| Model | Provider | Thumbnail URL | Status |
|-------|----------|--------------|--------|
| Whisper Transcription | OpenAI | `https://image.ainative.studio/thumbnails/audio/whisper-transcription-waveform.webp` | Placeholder |
| Whisper Translation | OpenAI | `https://image.ainative.studio/thumbnails/audio/whisper-translation-waveform.webp` | Placeholder |
| Text-to-Speech | OpenAI | `https://image.ainative.studio/thumbnails/audio/openai-tts-waveform.webp` | Placeholder |

**Placeholder Implementation**:
```typescript
thumbnail_url: getThumbnailUrl({
  provider: 'OpenAI',
  category: 'Audio',
  initials: 'W'
}),
```

---

### 2.5 Embedding Models (3 models)

| Model | Provider | Thumbnail URL | Status |
|-------|----------|--------------|--------|
| bge-small-en-v1.5 | BAAI | `https://image.ainative.studio/thumbnails/embedding/bge-small-en-v15-visualization.webp` | Placeholder |
| bge-base-en-v1.5 | BAAI | `https://image.ainative.studio/thumbnails/embedding/bge-base-en-v15-visualization.webp` | Placeholder |
| bge-large-en-v1.5 | BAAI | `https://image.ainative.studio/thumbnails/embedding/bge-large-en-v15-visualization.webp` | Placeholder |

**Placeholder Implementation**:
```typescript
thumbnail_url: getThumbnailUrl({
  provider: 'BAAI',
  category: 'Embedding',
  initials: 'BGE'
}),
```

---

## Phase 3: Real Thumbnail Creation

### 3.1 Sourcing Thumbnail Images

#### Chat Models - Screenshot Approach

**Tools Needed**:
- Browser with OpenAI/Anthropic playground access
- Screenshot tool (macOS: Cmd+Shift+4)
- Image editor (Figma, Photoshop, or free alternatives)

**Process**:
1. Generate example output from each model
2. Take clean screenshot of output
3. Crop to interesting portion
4. Resize to 640x360
5. Save as high-quality JPG/PNG
6. Optimize using ImageMagick/Squoosh

**Example Prompts**:
- **GPT-4**: "Write a Python function to calculate Fibonacci sequence with memoization and explain the time complexity"
- **GPT-3.5**: "What are 3 tips for better time management?"
- **Claude 3.5 Sonnet**: "Analyze this code and suggest improvements: [paste code snippet]"

---

#### Image Models - Use Model Output

**Process**:
1. Use Qwen Image Edit model via AINative platform
2. Generate high-quality sample image with prompt: "A serene mountain landscape at sunset, digital art, vibrant colors, 4k quality"
3. Download result
4. Use as thumbnail directly (already correct size)
5. Optimize if needed

**Alternative**: Use Unsplash/Pexels stock image as placeholder until real model output is available

---

#### Video Models - Extract First Frame

**Tools Needed**:
- ffmpeg (video processing)
- Video player with frame export

**Process**:
1. Generate sample video using each model
2. Extract first frame using ffmpeg:
   ```bash
   ffmpeg -i video.mp4 -vframes 1 -vf scale=640:360 thumbnail.jpg
   ```
3. Optimize extracted frame
4. Upload to storage

**Example Prompts**:
- **Alibaba Wan 2.2**: Use existing thumbnail (already in spec)
- **Seedance**: "A cat walking in a garden, smooth motion"
- **Sora2**: "Cinematic shot of waves crashing on beach at golden hour"
- **Text-to-Video**: "A futuristic city with flying cars"
- **CogVideoX**: "A flower blooming in timelapse"

---

#### Audio Models - Create Waveform Visualization

**Tools Needed**:
- Figma, Sketch, or SVG editor
- Audio waveform generator (free online tools available)

**Process**:
1. Create 640x360 canvas
2. Add provider gradient background (OpenAI green)
3. Add abstract waveform visualization (not real audio data)
4. Add icon overlay (microphone, speaker, translation)
5. Export as PNG/JPG
6. Convert to WebP

**Design Template**:
```
┌─────────────────────────────────────┐
│                                     │
│     [Gradient Background]           │
│                                     │
│     ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿           │
│     [Waveform visualization]        │
│     ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿           │
│                                     │
│            [Icon]                   │
│                                     │
└─────────────────────────────────────┘
```

---

#### Embedding Models - Create Vector Visualization

**Tools Needed**:
- Figma, Sketch, or data visualization library
- D3.js or Python matplotlib (for programmatic generation)

**Process**:
1. Create 640x360 canvas
2. Add BAAI brand gradient background
3. Generate random dot cluster representing vector space
4. Vary cluster size/density based on model dimensions:
   - Small model: Fewer, larger dots (384 dimensions)
   - Base model: Medium dots (768 dimensions)
   - Large model: Many, smaller dots (1024 dimensions)
5. Add subtle label: "384D", "768D", "1024D"
6. Export and optimize

**Python Script (Optional)**:
```python
import matplotlib.pyplot as plt
import numpy as np

def generate_embedding_thumbnail(dimensions, output_file):
    fig, ax = plt.subplots(figsize=(6.4, 3.6), dpi=100)

    # Generate random points in 2D space representing embeddings
    num_points = min(dimensions, 500)
    x = np.random.randn(num_points)
    y = np.random.randn(num_points)

    # Create scatter plot
    ax.scatter(x, y, alpha=0.5, s=20, c='#13C2C2')
    ax.set_xlim(-3, 3)
    ax.set_ylim(-3, 3)
    ax.axis('off')

    # Add gradient background
    ax.set_facecolor('#08979C')

    # Add dimension label
    ax.text(0.95, 0.05, f'{dimensions}D', transform=ax.transAxes,
            fontsize=24, color='white', alpha=0.3,
            ha='right', va='bottom', weight='bold')

    plt.tight_layout()
    plt.savefig(output_file, dpi=100, bbox_inches='tight',
                pad_inches=0, facecolor='#08979C')
    plt.close()

# Generate thumbnails
generate_embedding_thumbnail(384, 'bge-small-en-v15.png')
generate_embedding_thumbnail(768, 'bge-base-en-v15.png')
generate_embedding_thumbnail(1024, 'bge-large-en-v15.png')
```

---

### 3.2 Image Optimization

**Batch Optimization Script**: `scripts/optimize-thumbnails.sh`

```bash
#!/bin/bash
# Optimize all thumbnails for web delivery
# Usage: ./scripts/optimize-thumbnails.sh <input_dir> <output_dir>

INPUT_DIR="${1:-./thumbnails/raw}"
OUTPUT_DIR="${2:-./thumbnails/optimized}"

mkdir -p "$OUTPUT_DIR"

for img in "$INPUT_DIR"/*.{jpg,png,jpeg}; do
  if [ -f "$img" ]; then
    filename=$(basename "$img")
    name="${filename%.*}"

    echo "Optimizing $filename..."

    # Generate JPG (80% quality, 640x360)
    convert "$img" \
      -resize 640x360^ \
      -gravity center \
      -extent 640x360 \
      -quality 80 \
      -strip \
      "$OUTPUT_DIR/${name}.jpg"

    # Generate WebP (80% quality, 640x360)
    cwebp -q 80 \
      -resize 640 360 \
      "$img" \
      -o "$OUTPUT_DIR/${name}.webp"

    # Check file sizes
    jpg_size=$(stat -f%z "$OUTPUT_DIR/${name}.jpg")
    webp_size=$(stat -f%z "$OUTPUT_DIR/${name}.webp")

    echo "  JPG: ${jpg_size} bytes"
    echo "  WebP: ${webp_size} bytes"

    # Warn if over 50KB
    if [ $jpg_size -gt 51200 ]; then
      echo "  WARNING: JPG exceeds 50KB limit!"
    fi
  fi
done

echo "Optimization complete!"
```

**Make script executable**:
```bash
chmod +x scripts/optimize-thumbnails.sh
```

---

### 3.3 Upload to Storage

**Upload Script**: `scripts/upload-thumbnails.sh`

```bash
#!/bin/bash
# Upload optimized thumbnails to ZeroDB storage
# Usage: ./scripts/upload-thumbnails.sh

# Requires AINATIVE_API_KEY environment variable
if [ -z "$AINATIVE_API_KEY" ]; then
  echo "Error: AINATIVE_API_KEY environment variable not set"
  exit 1
fi

THUMBNAIL_DIR="./thumbnails/optimized"
API_ENDPOINT="https://api.ainative.studio/v1/storage/upload"

# Upload by category
for category in chat image video audio embedding; do
  echo "Uploading ${category} thumbnails..."

  for file in ${THUMBNAIL_DIR}/${category}/*.{jpg,webp}; do
    if [ -f "$file" ]; then
      filename=$(basename "$file")

      echo "  Uploading ${filename}..."

      response=$(curl -s -X POST \
        "${API_ENDPOINT}?path=thumbnails/${category}/${filename}" \
        -H "Authorization: Bearer ${AINATIVE_API_KEY}" \
        -F "file=@${file}")

      # Extract URL from response
      url=$(echo "$response" | jq -r '.url')

      if [ "$url" != "null" ]; then
        echo "  ✓ Uploaded: $url"
      else
        echo "  ✗ Failed: $response"
      fi
    fi
  done
done

echo "Upload complete!"
```

**Make script executable**:
```bash
chmod +x scripts/upload-thumbnails.sh
```

---

## Phase 4: Testing and Validation

### 4.1 Visual Testing

**Checklist**:
- [ ] Navigate to `/dashboard/ai-settings`
- [ ] Verify all 15 models display cards
- [ ] Check that each card shows a thumbnail (placeholder or real)
- [ ] Verify aspect ratio is consistent (16:9)
- [ ] Test on multiple screen sizes (mobile, tablet, desktop)
- [ ] Verify lazy loading (images load when scrolling)
- [ ] Check that default models show star icon

**Test Browsers**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

### 4.2 Performance Testing

**Tools**: Lighthouse, WebPageTest

**Metrics to Check**:
- [ ] Page load time < 3 seconds
- [ ] Lighthouse Performance score > 90
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Total image size < 500KB for all thumbnails

**Commands**:
```bash
# Run Lighthouse
lighthouse https://ainative.studio/dashboard/ai-settings \
  --only-categories=performance \
  --output=json \
  --output-path=./lighthouse-report.json

# Check image sizes
du -sh thumbnails/optimized/*
```

---

### 4.3 Accessibility Testing

**Checklist**:
- [ ] All images have descriptive alt text
- [ ] Images don't disappear in high contrast mode
- [ ] Screen reader announces image purpose correctly
- [ ] Keyboard navigation doesn't break on images
- [ ] Focus indicators visible when tabbing through cards

**Tools**:
- Screen reader (VoiceOver on macOS, NVDA on Windows)
- Axe DevTools browser extension
- Lighthouse accessibility audit

---

### 4.4 Fallback Testing

**Test Scenarios**:

1. **Missing Thumbnail URL**:
   - Remove thumbnail_url from one model
   - Verify placeholder gradient displays
   - Verify provider initials show correctly

2. **Image Load Failure**:
   - Use invalid thumbnail URL (e.g., 404 error)
   - Verify onError handler triggers
   - Verify fallback to gradient placeholder

3. **Slow Network**:
   - Throttle network to 3G in DevTools
   - Verify lazy loading works
   - Verify placeholders show while loading

**Commands**:
```bash
# Test with DevTools network throttling
# Open Chrome DevTools > Network tab > Throttling > Slow 3G
```

---

## Phase 5: Rollout Strategy

### 5.1 Immediate Release (Placeholders)

**Timeline**: Day 1

**Actions**:
1. Deploy thumbnail generator utility
2. Update model aggregator with placeholder URLs
3. Update model card component to display thumbnails
4. Test on staging environment
5. Deploy to production

**Expected Result**: All 15 models show gradient placeholder thumbnails

---

### 5.2 Gradual Real Image Uploads

**Timeline**: Week 1-2

**Priority Order**:
1. Video models (highest visibility)
2. Image models
3. Chat models
4. Audio models
5. Embedding models

**Process per Model**:
1. Create/source thumbnail image
2. Optimize image (scripts/optimize-thumbnails.sh)
3. Upload to storage (scripts/upload-thumbnails.sh)
4. Update model aggregator with real URL
5. Test in staging
6. Deploy to production
7. Verify image loads correctly

---

### 5.3 Monitoring Post-Rollout

**Metrics to Track**:
- Thumbnail load success rate
- Page load time before/after
- User click-through rate on model cards
- Error rate for image loading

**Dashboard**:
```typescript
// Analytics tracking
analytics.track('model_card_view', {
  model_id: model.id,
  thumbnail_type: model.thumbnail_url.includes('data:') ? 'placeholder' : 'real',
  load_time_ms: loadTime
});

analytics.track('model_card_click', {
  model_id: model.id,
  thumbnail_type: model.thumbnail_url.includes('data:') ? 'placeholder' : 'real'
});
```

---

## Phase 6: Documentation and Handoff

### 6.1 Documentation to Create/Update

- [x] Thumbnail Strategy Document (`docs/ai-models/THUMBNAIL_STRATEGY.md`)
- [x] Thumbnail Implementation Plan (`docs/ai-models/THUMBNAIL_IMPLEMENTATION_PLAN.md`)
- [ ] Update AI Model Registry System doc with thumbnail requirements
- [ ] Add thumbnail guidelines to design system
- [ ] Create thumbnail creation guide for new models

---

### 6.2 Handoff Checklist

**For Future Model Additions**:
1. Generate or source thumbnail image (640x360)
2. Optimize using `scripts/optimize-thumbnails.sh`
3. Upload using `scripts/upload-thumbnails.sh`
4. Add thumbnail_url to model definition
5. Test in staging
6. Deploy to production

**Template for New Models**:
```typescript
{
  id: 'new-model-id',
  slug: 'new-model-slug',
  name: 'New Model Name',
  provider: 'Provider Name',
  category: 'Category',
  capabilities: ['capability1', 'capability2'],
  description: 'Model description',

  // Add thumbnail URL here (real or placeholder)
  thumbnail_url: 'https://image.ainative.studio/thumbnails/category/filename.webp',
  // OR use placeholder:
  // thumbnail_url: getThumbnailUrl({
  //   provider: 'Provider Name',
  //   category: 'Category',
  //   initials: 'NM'
  // }),

  endpoint: '/v1/endpoint',
  method: 'POST',
  // ... other fields
}
```

---

## Success Criteria

### Definition of Done

- [ ] All 15 models have thumbnail_url populated
- [ ] Placeholder generator utility is implemented and tested
- [ ] Model aggregator service includes thumbnail URLs for all models
- [ ] Model card component displays thumbnails correctly
- [ ] Lazy loading works for all thumbnails
- [ ] Fallback to gradients works when URLs fail
- [ ] All thumbnails load in < 1 second on 4G connection
- [ ] Page load time < 3 seconds with all thumbnails
- [ ] Lighthouse Performance score > 90
- [ ] Accessibility audit passes (no errors)
- [ ] Documentation is complete and accurate
- [ ] Scripts for optimization and upload are tested and working

---

## Risk Mitigation

### Potential Issues and Solutions

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large file sizes slow page load | High | Enforce 50KB limit, use WebP, lazy loading |
| Image URLs become invalid | Medium | Implement fallback to gradient placeholders |
| Inconsistent aspect ratios | Low | Enforce 640x360 in optimization script |
| Missing thumbnails for new models | Low | Document clear process, provide template |
| Storage costs increase | Low | Monitor usage, optimize file sizes |
| CDN not caching images | Medium | Configure CloudFlare CDN properly |

---

## Future Improvements

### Post-Launch Enhancements

1. **Animated Thumbnails**:
   - Use animated WebP for video models
   - Implement hover-to-play functionality
   - Keep file size under 100KB

2. **Dynamic Thumbnails**:
   - Generate thumbnails from recent model outputs
   - Rotate thumbnails to show variety
   - Personalize based on user's previous generations

3. **Automated Thumbnail Generation**:
   - Build service to automatically generate thumbnails
   - Use AI image models for consistent style
   - Schedule regular thumbnail updates

4. **A/B Testing**:
   - Test different thumbnail styles
   - Measure click-through rates
   - Optimize based on user engagement

---

## Resources and References

### Internal Documentation
- AI Model Registry System: `docs/ai-models/AI_MODEL_REGISTRY_SYSTEM.md`
- Thumbnail Strategy: `docs/ai-models/THUMBNAIL_STRATEGY.md`
- ZeroDB File Storage API: `docs/api/ZERODB_FILE_STORAGE_GUIDE.md`

### External Tools
- ImageMagick: https://imagemagick.org/
- cwebp: https://developers.google.com/speed/webp/docs/cwebp
- Squoosh: https://squoosh.app/
- TinyPNG: https://tinypng.com/

### Design Resources
- Unsplash: https://unsplash.com/ (placeholder images)
- Pexels: https://www.pexels.com/ (stock media)
- Figma: https://figma.com/ (design tool)

---

## Contact and Support

For questions or issues with thumbnail implementation:
- Review this document first
- Check `docs/ai-models/THUMBNAIL_STRATEGY.md`
- Consult AI Model Registry System documentation
- Ask in #frontend or #design channels

---

**END OF IMPLEMENTATION PLAN**

This plan provides a complete roadmap for implementing thumbnails for all AI models. Execute phases sequentially for best results.
