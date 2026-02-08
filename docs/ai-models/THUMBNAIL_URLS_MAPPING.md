# AI Model Thumbnail URLs - Complete Mapping

**Status**: Implementation Reference
**Last Updated**: 2026-02-06
**Purpose**: Quick reference for all model thumbnail URLs

---

## Overview

This document provides a complete mapping of all 15 AI models to their thumbnail URLs. Use this as a reference when adding real thumbnail images.

---

## Current Status Summary

| Category | Total Models | With Real Thumbnails | With Placeholders |
|----------|--------------|---------------------|-------------------|
| Chat | 3 | 0 | 3 |
| Image | 1 | 0 | 1 |
| Video | 5 | 1 (Wan 2.2) | 4 |
| Audio | 3 | 0 | 3 |
| Embedding | 3 | 0 | 3 |
| **TOTAL** | **15** | **1** | **14** |

---

## Chat Models (3)

### 1. GPT-4

**Model ID**: `gpt-4`
**Provider**: OpenAI
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'OpenAI', category: 'Coding' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/chat/openai-gpt-4-chat.webp
```

**Thumbnail Content**: Screenshot of GPT-4 generating complex code with explanation

---

### 2. GPT-3.5 Turbo

**Model ID**: `gpt-3.5-turbo`
**Provider**: OpenAI
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'OpenAI', category: 'Coding' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/chat/openai-gpt-35-turbo-chat.webp
```

**Thumbnail Content**: Screenshot of GPT-3.5 answering a simple question

---

### 3. Claude 3.5 Sonnet

**Model ID**: `claude-3-5-sonnet-20241022`
**Provider**: Anthropic
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'Anthropic', category: 'Coding' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/chat/anthropic-claude-35-sonnet-chat.webp
```

**Thumbnail Content**: Screenshot of Claude analyzing a document or writing long-form content

---

## Image Models (1)

### 4. Qwen Image Edit

**Model ID**: `qwen-image-edit`
**Provider**: Qwen
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'Qwen', category: 'Image' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/image/qwen-image-edit-sample.webp
```

**Thumbnail Content**: High-quality AI-generated image (landscape, portrait, or abstract art)

---

## Video Models (5)

### 5. Alibaba Wan 2.2 I2V 720p

**Model ID**: `wan22-i2v`
**Provider**: Alibaba
**Current Status**: REAL THUMBNAIL (Existing asset)

**Real URL** (Current):
```
https://image.ainative.studio/asset/alibaba/wan-2i2v720.png
```

**Thumbnail Content**: First frame from sample video (origami boat scene)

**NOTE**: This is the only model with a real thumbnail already. Keep this URL.

---

### 6. Seedance I2V

**Model ID**: `seedance-i2v`
**Provider**: Seedance
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'Seedance', category: 'Video' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/video/seedance-i2v-demo.webp
```

**Thumbnail Content**: First frame from sample i2v generation

---

### 7. Sora2 I2V

**Model ID**: `sora2-i2v`
**Provider**: Sora
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'Sora', category: 'Video' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/video/sora2-i2v-demo.webp
```

**Thumbnail Content**: Cinematic first frame emphasizing premium quality

---

### 8. Text-to-Video Model

**Model ID**: `t2v`
**Provider**: Generic T2V
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'Generic T2V', category: 'Video' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/video/text-to-video-demo.webp
```

**Thumbnail Content**: First frame from text-generated scene

---

### 9. CogVideoX-2B

**Model ID**: `cogvideox`
**Provider**: CogVideo
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'CogVideo', category: 'Video' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/video/cogvideox-2b-demo.webp
```

**Thumbnail Content**: First frame from generated video sequence

---

## Audio Models (3)

### 10. Whisper Transcription

**Model ID**: `whisper-transcription`
**Provider**: OpenAI
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'OpenAI', category: 'Audio' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/audio/whisper-transcription-waveform.webp
```

**Thumbnail Content**: Waveform visualization with microphone icon overlay

---

### 11. Whisper Translation

**Model ID**: `whisper-translation`
**Provider**: OpenAI
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'OpenAI', category: 'Audio' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/audio/whisper-translation-waveform.webp
```

**Thumbnail Content**: Waveform visualization with translation/globe icon overlay

---

### 12. Text-to-Speech (TTS)

**Model ID**: `tts`
**Provider**: OpenAI
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'OpenAI', category: 'Audio' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/audio/openai-tts-waveform.webp
```

**Thumbnail Content**: Waveform visualization with speaker icon overlay

---

## Embedding Models (3)

### 13. bge-small-en-v1.5

**Model ID**: `BAAI/bge-small-en-v1.5`
**Provider**: BAAI
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'BAAI', category: 'Embedding' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/embedding/bge-small-en-v15-visualization.webp
```

**Thumbnail Content**: Vector visualization (384 dimensions - smaller dot cluster)

---

### 14. bge-base-en-v1.5

**Model ID**: `BAAI/bge-base-en-v1.5`
**Provider**: BAAI
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'BAAI', category: 'Embedding' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/embedding/bge-base-en-v15-visualization.webp
```

**Thumbnail Content**: Vector visualization (768 dimensions - medium dot cluster)

---

### 15. bge-large-en-v1.5

**Model ID**: `BAAI/bge-large-en-v1.5`
**Provider**: BAAI
**Current Status**: Placeholder (Provider-branded gradient)

**Placeholder URL** (Current):
```
getThumbnailUrl({ provider: 'BAAI', category: 'Embedding' })
```

**Planned Real URL**:
```
https://image.ainative.studio/thumbnails/embedding/bge-large-en-v15-visualization.webp
```

**Thumbnail Content**: Vector visualization (1024 dimensions - larger dot cluster)

---

## Implementation Checklist

### Phase 1: Immediate (COMPLETED)

- [x] Create thumbnail generator utility (`lib/utils/thumbnail-generator.ts`)
- [x] Update model aggregator to use placeholders
- [x] All models have thumbnail_url field populated

### Phase 2: Create Real Thumbnails (TODO)

#### Chat Models
- [ ] Create GPT-4 thumbnail (screenshot of code generation)
- [ ] Create GPT-3.5 Turbo thumbnail (screenshot of Q&A)
- [ ] Create Claude 3.5 Sonnet thumbnail (screenshot of analysis)

#### Image Models
- [ ] Create Qwen Image Edit thumbnail (AI-generated sample image)

#### Video Models
- [ ] Keep Alibaba Wan 2.2 existing thumbnail
- [ ] Create Seedance I2V thumbnail (extract first frame)
- [ ] Create Sora2 I2V thumbnail (extract first frame)
- [ ] Create Text-to-Video thumbnail (extract first frame)
- [ ] Create CogVideoX-2B thumbnail (extract first frame)

#### Audio Models
- [ ] Create Whisper Transcription waveform visualization
- [ ] Create Whisper Translation waveform visualization
- [ ] Create TTS waveform visualization

#### Embedding Models
- [ ] Create bge-small-en-v1.5 vector visualization
- [ ] Create bge-base-en-v1.5 vector visualization
- [ ] Create bge-large-en-v1.5 vector visualization

### Phase 3: Optimize and Upload (TODO)

- [ ] Optimize all thumbnails to 640x360, <50KB
- [ ] Generate WebP and JPG versions
- [ ] Upload to ZeroDB storage
- [ ] Update model aggregator with real URLs
- [ ] Test in staging environment

### Phase 4: Deploy and Monitor (TODO)

- [ ] Deploy to production
- [ ] Monitor thumbnail load success rate
- [ ] Check page performance metrics
- [ ] Verify all images load correctly

---

## Quick Update Guide

When adding a real thumbnail for a model:

1. **Create/Source Thumbnail**
   - Follow specifications in `docs/ai-models/THUMBNAIL_STRATEGY.md`
   - Ensure 640x360 dimensions
   - Keep file size under 50KB

2. **Optimize Thumbnail**
   ```bash
   ./scripts/optimize-thumbnails.sh input_image.jpg output_dir/
   ```

3. **Upload to Storage**
   ```bash
   export AINATIVE_API_KEY="your_api_key"
   ./scripts/upload-thumbnails.sh
   ```

4. **Update Model Aggregator**
   - Open `/Users/aideveloper/core/AINative-website-nextjs/lib/model-aggregator.ts`
   - Replace placeholder with real URL:
   ```typescript
   // FROM:
   thumbnail_url: getThumbnailUrl({
     provider: 'OpenAI',
     category: 'Audio',
   }),

   // TO:
   thumbnail_url: 'https://image.ainative.studio/thumbnails/audio/whisper-transcription-waveform.webp',
   ```

5. **Test and Deploy**
   - Test locally
   - Deploy to staging
   - Verify image loads
   - Deploy to production

---

## Useful Commands

```bash
# Optimize thumbnails
./scripts/optimize-thumbnails.sh ./raw-thumbnails ./optimized-thumbnails

# Upload thumbnails
export AINATIVE_API_KEY="your_key"
./scripts/upload-thumbnails.sh

# Check file sizes
du -sh optimized-thumbnails/*

# Test placeholder generation
node -e "const { getThumbnailUrl } = require('./lib/utils/thumbnail-generator'); console.log(getThumbnailUrl({ provider: 'OpenAI', category: 'Audio' }))"
```

---

## Related Documentation

- Thumbnail Strategy: `docs/ai-models/THUMBNAIL_STRATEGY.md`
- Implementation Plan: `docs/ai-models/THUMBNAIL_IMPLEMENTATION_PLAN.md`
- AI Model Registry System: `docs/ai-models/AI_MODEL_REGISTRY_SYSTEM.md`
- Model Aggregator Service: `lib/model-aggregator.ts`
- Thumbnail Generator Utility: `lib/utils/thumbnail-generator.ts`

---

**END OF MAPPING DOCUMENT**

This document provides a complete reference for all model thumbnail URLs. Update this document as real thumbnails are added.
