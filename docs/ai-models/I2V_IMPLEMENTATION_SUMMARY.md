# I2V Image Selector Implementation Summary

**Date**: 2026-02-08
**Issue**: #1095 - AI Models Phase 0: Preview Data Foundation
**Branch**: main

## What Was Done

### Problem
- ImageSelector component for I2V models only had URL input
- No quick way to select stock images for testing
- Seedance I2V was returning 400 Bad Request errors
- Backend was using wrong field name for Seedance API

### Solution

#### 1. Frontend Changes (Commit: 18be058)

**ImageSelector.tsx** - Complete rewrite with two-tab interface:
- **Unsplash Gallery Tab**:
  - 6 curated stock images with labels
  - 3-column grid layout
  - Visual selection with green checkmarks
  - Uses `getUnsplashImageUrl()` from `lib/unsplash.ts`

- **Upload Image Tab**:
  - Custom URL input (preserved from original)
  - Image preview with error handling
  - Clear button to reset

**ModelPlayground.tsx** - Fixed missing field:
- Added `image_url: ''` to formState initialization (line 135)
- Added debug logging for I2V model detection
- This field is REQUIRED for I2V models to work

#### 2. Backend Changes (Commit: 4f9348f2)

**runpod_service.py** - Fixed field name for Seedance:
- Line 229: Changed `"image_url": image_url` to `"image": image_url`
- Added inline comment explaining the difference
- Seedance API expects `image` field, NOT `image_url`

#### 3. Documentation

**I2V_IMAGE_SELECTOR.md** - Comprehensive documentation:
- Component location and features
- Backend field naming differences (CRITICAL)
- Testing checklist
- Common errors and fixes

## Critical Information to Remember

### Backend Field Naming (MUST KNOW)

Different I2V providers use **different field names** for the image parameter:

| Provider | Field Name | Location | Status |
|----------|------------|----------|--------|
| Wan 2.2 | `image_url` | `runpod_service.py:212` | ✅ Correct |
| Seedance | `image` | `runpod_service.py:229` | ✅ Fixed |
| Sora2 | `image` | `runpod_service.py:240` | ✅ Correct |

**WARNING**: Using wrong field name = 400 Bad Request error

### Files Modified

**Frontend** (`AINative-website-nextjs` repo):
```
app/dashboard/ai-settings/[slug]/components/ImageSelector.tsx
app/dashboard/ai-settings/[slug]/components/ModelPlayground.tsx
docs/ai-models/I2V_IMAGE_SELECTOR.md (NEW)
```

**Backend** (`core` repo):
```
src/backend/app/services/runpod_service.py
```

### How to Test

1. Visit any I2V model page:
   - http://localhost:3000/dashboard/ai-settings/alibaba-wan-22-i2v-720p
   - http://localhost:3000/dashboard/ai-settings/seedance-i2v
   - http://localhost:3000/dashboard/ai-settings/sora2-i2v

2. Check Unsplash Gallery tab:
   - Should see 6 stock images in 3-column grid
   - Click any image to select
   - Green checkmark should appear
   - "Image selected and ready" message should show

3. Test video generation:
   - Select a stock image OR enter custom URL
   - Enter motion prompt (e.g., "slow zoom in, gentle camera movement")
   - Click "Run"
   - Should get 200 response, not 400

4. Verify backend logs:
   - Should see correct field name in payload
   - No "Missing or invalid 'image'" errors

### Media Caching Feature

**STATUS**: ✅ Already implemented (commit e844af0)

The media caching feature is ACTIVE for all Audio, Image, and Video models:
- Automatically loads cached media on page visit
- Saves generated media to localStorage
- Key format: `playground_media_${model.id}`
- Prevents unnecessary API calls = cost savings

**How it works**:
1. Visit model page → Checks localStorage → Loads cached result
2. Generate new media → Saves to localStorage automatically
3. Refresh page → Cached media loads instantly

**Console logs to watch for**:
- `✅ Loaded saved audio/image/video from localStorage` (on load)
- `💾 Saved user-generated audio/image/video to localStorage` (after generation)

## Commits

**Frontend**:
```
commit 18be058
Add Unsplash Gallery to ImageSelector for I2V models

- Added two-tab interface (Unsplash Gallery + Upload Image)
- 6 curated stock images with visual selection
- Fixed missing image_url field in formState
- Created comprehensive documentation
```

**Backend**:
```
commit 4f9348f2
Fix Seedance I2V backend field name from image_url to image

- Changed line 229: "image_url" → "image"
- Added inline comment explaining field naming difference
- Fixes 400 Bad Request errors for Seedance I2V
```

## Deployment Status

- ✅ Frontend pushed to `AINative-website-nextjs-staging` main branch
- ✅ Backend pushed to `core` main branch
- ⏳ Railway auto-deploys on push (check deployment status)

## Future Maintenance

**DO NOT**:
- Remove Unsplash Gallery tab without user approval
- Change backend field names without checking API specs
- Modify ImageSelector without testing ALL 3 I2V models

**ALWAYS**:
- Test all 3 I2V models when changing ImageSelector
- Verify backend field names match provider API specs
- Check console logs for localStorage caching
- Update I2V_IMAGE_SELECTOR.md if making changes

## Related Documentation

- `docs/ai-models/I2V_IMAGE_SELECTOR.md` - Component documentation
- `lib/unsplash.ts` - Unsplash CDN URL generator
- `src/backend/app/services/runpod_service.py` - Backend I2V logic
- `app/dashboard/ai-settings/[slug]/components/ModelPlayground.tsx` - Playground component

---

**Last Updated**: 2026-02-08
**Maintained By**: Claude (via user requests)
**Status**: ✅ Production ready
