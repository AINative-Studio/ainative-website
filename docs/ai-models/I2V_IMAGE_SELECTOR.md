# I2V Image Selector Component

**CRITICAL**: This document describes the ImageSelector component for Image-to-Video (I2V) models. DO NOT modify this component without updating this documentation.

## Component Location

```
app/dashboard/ai-settings/[slug]/components/ImageSelector.tsx
```

## Purpose

Provides two ways for users to select source images for I2V video generation:
1. **Unsplash Gallery**: Curated stock images from Unsplash
2. **Upload Image**: Custom image URL input

## Features

### Unsplash Gallery Tab
- 6 curated stock images with labels:
  - Laptop and coffee (id: 0)
  - Startup office (id: 1)
  - Data visualization (id: 2)
  - Modern workspace (id: 3)
  - Technology (id: 4)
  - Business meeting (id: 5)
- 3-column grid layout
- Visual selection with green checkmark
- Hover effects with labels
- Uses `getUnsplashImageUrl()` from `lib/unsplash.ts`

### Upload Image Tab
- URL input field with icon
- Load button to confirm selection
- Image preview with error handling
- Clear button to reset

## Usage

```tsx
<ImageSelector
  onImageSelect={(url) => updateField('image_url', url)}
  currentImageUrl={formState.image_url}
/>
```

## Integration with ModelPlayground

The ImageSelector is conditionally rendered for I2V video models:

```tsx
{model.category === 'Video' && model.endpoint.includes('i2v') && (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-300">Source Image</label>
    <ImageSelector
      onImageSelect={(url) => updateField('image_url', url)}
      currentImageUrl={formState.image_url}
    />
    {formState.image_url && (
      <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
        <Check className="w-4 h-4 text-green-400" />
        <p className="text-xs text-green-400">Image selected and ready</p>
      </div>
    )}
  </div>
)}
```

## Backend Field Naming (CRITICAL)

**Different I2V providers use different field names for the image parameter:**

| Provider | Field Name | Location |
|----------|------------|----------|
| Wan 2.2 | `image_url` | `runpod_service.py:209` |
| Seedance | `image` | `runpod_service.py:229` |
| Sora2 | `image` | `runpod_service.py:240` |

**Backend file**: `src/backend/app/services/runpod_service.py`

### Wan 2.2 Payload
```python
payload = {
    "input": {
        "image_url": image_url,  # Wan 2.2 uses 'image_url'
        "motion_prompt": motion_prompt,
        # ...
    }
}
```

### Seedance Payload
```python
payload = {
    "input": {
        "image": image_url,  # Seedance uses 'image', not 'image_url'
        "prompt": motion_prompt,
        # ...
    }
}
```

### Sora2 Payload
```python
payload = {
    "input": {
        "image": image_url,  # Sora2 uses 'image', not 'image_url'
        "prompt": motion_prompt,
        # ...
    }
}
```

## Common Errors

### Error: "Missing or invalid 'image'"
**Cause**: Using `image_url` when the provider expects `image`
**Fix**: Change the field name in the backend payload to match the provider's API spec

### Error: ImageSelector not showing
**Cause 1**: Missing `image_url` field in `formState` initialization
**Fix**: Add `image_url: ''` to ModelPlayground.tsx formState

**Cause 2**: Condition not matching
**Fix**: Verify `model.category === 'Video' && model.endpoint.includes('i2v')`

## Testing Checklist

Before committing changes to ImageSelector or I2V models:

- [ ] Test all 3 I2V models: Wan 2.2, Seedance, Sora2
- [ ] Verify Unsplash Gallery tab loads images
- [ ] Verify Upload Image tab accepts custom URLs
- [ ] Verify green checkmark shows when image selected
- [ ] Test actual video generation with both Unsplash and custom URLs
- [ ] Check backend logs for correct field names
- [ ] Verify 200 status (not 400 Bad Request)

## Related Files

- Frontend: `app/dashboard/ai-settings/[slug]/components/ImageSelector.tsx`
- Frontend: `app/dashboard/ai-settings/[slug]/components/ModelPlayground.tsx`
- Frontend: `lib/unsplash.ts`
- Backend: `src/backend/app/services/runpod_service.py`
- Backend: `src/backend/app/services/multimodal_service.py`

## Maintenance Notes

**Last Updated**: 2026-02-08
**Issue**: #1095
**Changes**:
- Created Unsplash Gallery with curated stock images
- Fixed Seedance to use `image` instead of `image_url`
- Added documentation to prevent future breakage

**DO NOT**:
- Remove the Unsplash Gallery tab
- Change field names without checking backend API specs
- Modify without testing all 3 I2V models
