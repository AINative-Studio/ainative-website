# Audio Category Filter - Debugging Guide

## Problem Statement
TTS Model, Whisper Translation, and Whisper Transcription models don't appear when clicking the "Audio" category filter in `/dashboard/ai-settings`.

## Code Verification Status: ✅ ALL CORRECT

**Test Results:** 39/39 tests PASS
- Category filtering logic: ✅ CORRECT
- Model capabilities: ✅ CORRECT
- Category mapping: ✅ CORRECT
- Integration flow: ✅ CORRECT

## Debugging Steps

### Step 1: Verify Models are Loaded

Open browser console on `/dashboard/ai-settings` and run:

```javascript
// Get all models from the page
const models = window.__NEXT_DATA__?.props?.pageProps?.models;
console.log('Total models:', models?.length);

// Or if using React Query, check the cache
console.log('React Query Cache:', window.queryClient?.getQueryCache());
```

**Expected:** Should see models array with audio models included.

### Step 2: Check Audio Models Specifically

```javascript
// Filter for audio models
const audioModels = models?.filter(m =>
  m.capabilities?.some(cap =>
    ['audio', 'transcription', 'translation', 'text-to-speech'].includes(cap)
  )
);

console.log('Audio models found:', audioModels?.length);
console.log('Audio model names:', audioModels?.map(m => m.name));
```

**Expected Output:**
```
Audio models found: 3
Audio model names: ["Whisper", "Whisper Translation", "TTS Model"]
```

### Step 3: Test Category Filter Function

```javascript
// Test the matchesCategory function
const CATEGORY_MAP = {
  Audio: ['audio', 'speech', 'transcription', 'translation', 'audio-generation', 'text-to-speech']
};

function matchesCategory(model, category) {
  if (category === 'All') return true;
  const targetCaps = CATEGORY_MAP[category] || [];
  return model.capabilities.some(cap =>
    targetCaps.some(target => cap.toLowerCase().includes(target.toLowerCase()))
  );
}

// Test with an audio model
const whisper = audioModels?.find(m => m.name === 'Whisper');
console.log('Whisper matches Audio?', matchesCategory(whisper, 'Audio'));
console.log('Whisper capabilities:', whisper?.capabilities);
```

**Expected:** Should return `true`

### Step 4: Check for JavaScript Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when clicking "Audio" filter
4. Check Network tab for failed API requests

### Step 5: Verify API Response

```javascript
// Manually call the model aggregation service
fetch('/api/ai-models')
  .then(r => r.json())
  .then(data => {
    const audio = data.models.filter(m => m.category === 'Audio');
    console.log('Audio models from API:', audio.length);
    console.log(audio.map(m => ({name: m.name, capabilities: m.capabilities})));
  });
```

### Step 6: Clear Caches

If everything above looks correct but audio models still don't appear:

**Browser Cache:**
```bash
# Chrome/Edge
Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)

# Firefox
Ctrl+Shift+Delete

# Or just hard refresh:
Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
```

**Next.js Build Cache:**
```bash
cd /Users/aideveloper/core/AINative-website-nextjs
rm -rf .next node_modules/.cache
npm run dev
```

**React Query Cache:**
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 7: Verify Environment

Check if you're running the latest code:

```bash
cd /Users/aideveloper/core/AINative-website-nextjs
git status
git log -1
```

**Expected:** Should show latest commits

### Step 8: Run Tests Locally

```bash
cd /Users/aideveloper/core/AINative-website-nextjs

# Run all audio category tests
npm test -- __tests__/app/dashboard/ai-settings/

# Expected: All 39 tests pass
```

## Common Issues & Solutions

### Issue 1: Stale JavaScript Bundle
**Symptom:** Old code is cached in browser
**Solution:** Hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Issue 2: Build Artifacts
**Symptom:** `.next/` folder contains old build
**Solution:** `rm -rf .next && npm run dev`

### Issue 3: Hot Module Reload (HMR) Issue
**Symptom:** Changes not reflected in dev mode
**Solution:** Restart dev server

### Issue 4: Wrong Model Aggregator File
**Symptom:** Using old `model-aggregator.ts` instead of `model-aggregator-service.ts`
**Solution:** Verify imports:
```typescript
import { modelAggregatorService } from '@/lib/model-aggregator-service';
// NOT: import { modelAggregatorService } from '@/lib/model-aggregator';
```

### Issue 5: React Query Stale Data
**Symptom:** Component using cached data
**Solution:**
```javascript
// Force refetch
queryClient.invalidateQueries(['ai-models-aggregated']);
```

## Verification Commands

### Run Full Test Suite
```bash
npm test -- __tests__/app/dashboard/ai-settings/ --verbose
```

### Check Model Aggregator Service
```bash
cat /Users/aideveloper/core/AINative-website-nextjs/lib/model-aggregator-service.ts | grep -A 10 "getAudioModels"
```

### Verify AISettingsClient
```bash
cat /Users/aideveloper/core/AINative-website-nextjs/app/dashboard/ai-settings/AISettingsClient.tsx | grep -A 6 "CATEGORY_MAP"
```

## Expected Behavior

When clicking "Audio" category:
1. `activeCategory` state changes to `'Audio'`
2. `filteredAndSorted` useMemo re-computes
3. Filter function `matchesCategory(model, 'Audio')` is called for each model
4. Exactly 3 audio models should match:
   - Whisper (capabilities: audio, transcription, speech-to-text)
   - Whisper Translation (capabilities: audio, translation)
   - TTS Model (capabilities: audio-generation, text-to-speech, speech)
5. Models are rendered in the grid

## Debug Output

Add console.logs to AISettingsClient.tsx for debugging:

```typescript
const filteredAndSorted = useMemo(() => {
  console.log('[DEBUG] Active category:', activeCategory);
  console.log('[DEBUG] Total models:', models.length);

  let result = models.filter(m => {
    const matches = matchesCategory(m, activeCategory);
    if (activeCategory === 'Audio') {
      console.log(`[DEBUG] ${m.name} matches Audio?`, matches, m.capabilities);
    }
    return matches;
  });

  console.log('[DEBUG] Filtered models:', result.length);
  return result;
}, [models, activeCategory, sortBy]);
```

## Still Having Issues?

If after all debugging steps the issue persists:

1. **Check browser console for errors**
2. **Verify you're on `/dashboard/ai-settings` (not a different page)**
3. **Ensure you're logged in (if authentication is required)**
4. **Try a different browser**
5. **Check if the issue occurs in incognito/private mode**

## Contact Support

If issue persists after all debugging steps, provide:
- Browser and version
- Console errors (screenshot)
- Network tab output
- Output from verification commands above

## References

- Test Suite: `/Users/aideveloper/core/AINative-website-nextjs/__tests__/app/dashboard/ai-settings/`
- Model Service: `/Users/aideveloper/core/AINative-website-nextjs/lib/model-aggregator-service.ts`
- AI Settings Client: `/Users/aideveloper/core/AINative-website-nextjs/app/dashboard/ai-settings/AISettingsClient.tsx`
- Fix Documentation: `/Users/aideveloper/core/AINative-website-nextjs/docs/fixes/AUDIO_CATEGORY_FILTER_FIX.md`
