# Issue #559: Fix Video Service - Non-Existent /v1/video Endpoints

## Problem Summary

The `lib/video-service.ts` was calling non-existent `/v1/video/*` endpoints that don't exist in the backend. The backend implements multimodal video **generation** endpoints, not video processing/library CRUD endpoints.

## Root Cause

- Video service was designed as a video processing/library system with upload, library, and processing endpoints
- Backend actually implements video **generation** APIs (text-to-video, image-to-video, CogVideoX)
- Endpoint mismatch between frontend expectations and backend implementation

## Solution Implemented

### 1. Complete Rewrite of `lib/video-service.ts`

**Removed (Non-Existent Endpoints):**
- `POST /v1/video/upload` - Video upload
- `GET /v1/video/{id}` - Get video details
- `POST /v1/video/{id}/process` - Process video
- `GET /v1/video/{id}/status` - Processing status
- `GET /v1/video/library` - Video library
- `DELETE /v1/video/{id}` - Delete video
- `POST /v1/video/batch-process` - Batch processing
- `GET /v1/video/{id}/analytics` - Video analytics

**Added (Correct Multimodal Endpoints):**
- `POST /v1/multimodal/video/i2v` - Image-to-Video generation
  - Providers: `seedance` (520 credits), `wan22` (400 credits), `sora2` (800 credits)
  - Returns base64-encoded MP4 video

- `POST /v1/multimodal/video/t2v` - Text-to-Video generation
  - Cost: 1000 credits (~$0.50)
  - Model: Wan 2.6
  - Returns base64-encoded MP4 video

- `POST /v1/multimodal/video/cogvideox` - CogVideoX generation
  - Cost: 800 credits (~$0.40)
  - Model: CogVideoX-2B
  - Configurable frames (17, 33, 49), guidance scale, inference steps

- `GET /v1/multimodal/usage` - Usage history
  - Free endpoint
  - Supports pagination and filtering by endpoint type

- `GET /v1/multimodal/usage/{usage_id}` - Get specific usage record
  - Free endpoint
  - Returns detailed generation record

- `GET /v1/multimodal/health` - Health check
  - No authentication required
  - Returns service status and available endpoints

### 2. New TypeScript Types

```typescript
// Request Types
interface ImageToVideoRequest {
  image_url: string;
  motion_prompt?: string;
  provider?: 'seedance' | 'wan22' | 'sora2';
}

interface TextToVideoRequest {
  prompt: string;
  duration?: number;
}

interface CogVideoXRequest {
  prompt: string;
  num_frames?: 17 | 33 | 49;
  guidance_scale?: number;
  num_inference_steps?: number;
}

// Response Types
interface VideoGenerationResponse {
  video_base64: string;
  format: string;
  fps: number;
  duration_s: number;
  usage_id: string;
  credits_used: number;
  credits_remaining: number;
}

interface MultimodalUsageRecord {
  id: string;
  endpoint_type: 'video_i2v' | 'video_t2v' | 'video_cogvideox' | 'tts' | 'image';
  model_used: string;
  credits_used: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}
```

### 3. Helper Functions

Added helper functions for browser-side video handling:
- `downloadVideoFromBase64(base64Data: string, filename: string)` - Download generated video
- `createVideoElementFromBase64(base64Data: string)` - Create video element for preview

### 4. Comprehensive Tests

- 16 passing tests covering all API methods
- 2 skipped tests for browser-only DOM functionality
- Tests verify correct endpoint calls, request/response handling, and error handling
- All tests use proper mocking with jest

## API Endpoint Reference

| Old Endpoint (Broken) | New Endpoint (Correct) | Cost | Model |
|---|---|---|---|
| `POST /v1/video/upload` | `POST /v1/multimodal/video/i2v` | 400-800 credits | SeeDance/Wan22/Sora2 |
| `GET /v1/video/library` | `GET /v1/multimodal/usage` | Free | N/A |
| `GET /v1/video/{id}` | `GET /v1/multimodal/usage/{usage_id}` | Free | N/A |
| N/A | `POST /v1/multimodal/video/t2v` | 1000 credits | Wan 2.6 |
| N/A | `POST /v1/multimodal/video/cogvideox` | 800 credits | CogVideoX-2B |
| N/A | `GET /v1/multimodal/health` | Free | N/A |

## Usage Examples

### Image-to-Video Generation

```typescript
import videoService from '@/lib/video-service';

const result = await videoService.generateImageToVideo({
  image_url: 'https://example.com/image.jpg',
  motion_prompt: 'Camera slowly zooms in',
  provider: 'seedance', // or 'wan22', 'sora2'
});

// Download the generated video
videoService.downloadVideoFromBase64(result.video_base64, 'my-video.mp4');
```

### Text-to-Video Generation

```typescript
const result = await videoService.generateTextToVideo({
  prompt: 'A serene ocean wave crashing on a beach at golden hour',
  duration: 5,
});

console.log(`Video generated! Credits used: ${result.credits_used}`);
```

### CogVideoX Generation

```typescript
const result = await videoService.generateCogVideoX({
  prompt: 'A cat walking through a busy Tokyo street at night',
  num_frames: 49,
  guidance_scale: 6.0,
  num_inference_steps: 50,
});
```

### Get Usage History

```typescript
const history = await videoService.getUsageHistory({
  skip: 0,
  limit: 20,
  endpoint_type: 'video_cogvideox',
});

console.log(`Total videos generated: ${history.total}`);
```

## Files Modified

1. `/Users/aideveloper/core/AINative-website-nextjs/lib/video-service.ts` - Complete rewrite
2. `/Users/aideveloper/core/AINative-website-nextjs/lib/__tests__/video-service.test.ts` - Updated tests

## Testing

```bash
# Run video service tests
npx jest lib/__tests__/video-service.test.ts

# Results:
# ✓ 16 tests passed
# ⊘ 2 tests skipped (browser-only functionality)
```

## Next Steps (Future Work)

### VideoProcessingClient UI Realignment

The `app/dashboard/video/VideoProcessingClient.tsx` currently implements a video library/processing UI, but should be realigned to a video **generation** workflow:

**Current UI (Incorrect):**
- Upload video files
- Video library with status tracking
- Processing options (resolution, format, codec)
- Batch processing

**Required UI (Correct):**
- **Text-to-Video tab** - Enter prompt, generate video
- **Image-to-Video tab** - Upload image, enter motion prompt, select provider
- **CogVideoX tab** - Advanced options (frames, guidance scale, inference steps)
- **Generation History tab** - Show usage history from `/v1/multimodal/usage`
- **Download/Preview** - Display generated videos, download button

This UI realignment is deferred as it requires significant UX changes and should be implemented with design review.

## Documentation Updated

- ✅ Backend API reference: `/Users/aideveloper/core/docs/api/MULTIMODAL_API.md`
- ✅ This fix document: `docs/bugfixes/ISSUE_559_VIDEO_SERVICE_FIX.md`

## References

- Issue: #559
- Backend Documentation: `/Users/aideveloper/core/docs/api/MULTIMODAL_API.md`
- Model Aggregator: `/Users/aideveloper/core/AINative-website-nextjs/lib/model-aggregator-service.ts` (lines 460-597 show correct video endpoints)

## Resolution

✅ **All non-existent /v1/video endpoints removed**
✅ **Correct /v1/multimodal/video endpoints implemented**
✅ **TypeScript types added for all request/response formats**
✅ **Comprehensive test coverage (16/18 tests passing)**
✅ **Helper functions for browser-side video handling**
✅ **Error handling with proper logging**

Status: **RESOLVED** - Service now calls correct backend endpoints.
