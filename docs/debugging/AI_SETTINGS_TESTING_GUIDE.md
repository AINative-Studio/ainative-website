# AI Settings Testing Guide

## Quick Testing Steps

### 1. Browser Console Testing (5 minutes)

**What to do:**
1. Open the AI Settings page in your browser:
   ```
   http://localhost:3000/dashboard/ai-settings
   ```
   (or http://localhost:3001 if 3000 is in use)

2. Open Chrome/Firefox DevTools (F12 or Cmd+Option+I on Mac)

3. Go to the **Console** tab

4. Look for these log messages:
   ```
   [AISettings] Fetching models from aggregator service...
   [ModelAggregator] Starting model aggregation...
   [ModelAggregator] Coding models (hardcoded): 1
   [ModelAggregator] Image models (hardcoded): 1
   [ModelAggregator] Video models (hardcoded): 5
   [ModelAggregator] Audio models (hardcoded): 3
   [ModelAggregator] Total models aggregated: 10
   [AISettings] Models fetched successfully: { count: 10, ... }
   ```

**What to report:**
- Screenshot of the console output
- Total model count shown
- Any errors in red

### 2. React Query DevTools (2 minutes)

**What to do:**
1. On the same page, look for a flower icon in the bottom-right corner
   (React Query DevTools)

2. Click it to open the dev tools

3. Look for a query named `ai-models-aggregated`

4. Check its status:
   - **green** = success
   - **yellow** = loading
   - **red** = error

5. Click on the query to see the data

**What to report:**
- Query status (success/loading/error)
- Data count if successful
- Error message if failed

### 3. Network Tab (3 minutes)

**What to do:**
1. Go to DevTools **Network** tab

2. Filter by **Fetch/XHR**

3. Look for requests to:
   - `/v1/models`
   - `/v1/public/embeddings/models`

4. Click on each request and check:
   - Status code (200, 401, etc.)
   - Response body

**What to report:**
- Which API calls are made
- Their status codes
- Whether they succeed or fail

### 4. Visual Verification (1 minute)

**What to check:**
- [ ] Do you see model cards on the page?
- [ ] How many model cards are displayed?
- [ ] Are the category tabs showing?
- [ ] Does clicking a category filter work?

**What to report:**
- Screenshot of the page
- Number of visible models
- Whether filters work

## Expected Results

### Scenario 1: Not Authenticated
- **Console**: Should show 10 models aggregated
- **UI**: Should display 10 model cards
- **API Calls**: May fail with 401 (this is OK)
- **Models**: Should include:
  - 1x Coding model (NousCoder)
  - 1x Image model (Qwen Image Edit)
  - 5x Video models (Wan 2.2, Seedance, Sora2, Text-to-Video, CogVideoX)
  - 3x Audio models (Whisper, Whisper Translation, TTS)

### Scenario 2: Authenticated
- **Console**: Should show 14+ models aggregated
- **UI**: Should display 14+ model cards
- **API Calls**: Should succeed with 200
- **Models**: Same as above + models from backend

## Common Issues and Solutions

### Issue: Console shows "0 models"
- **Check**: Is `aggregateAllModels()` being called?
- **Check**: Any JavaScript errors above the log?
- **Check**: Is the component actually mounting?

### Issue: API calls fail with 401
- **This is expected** when not authenticated
- Hardcoded models should still appear
- If they don't, there's a bug in the hardcoded model logic

### Issue: Page stuck on loading
- **Check**: React Query DevTools - is query in "loading" state?
- **Check**: Console - any timeout errors?
- **Check**: Network tab - are requests hanging?

### Issue: No logs appearing
- **Check**: Is the page actually loading?
- **Check**: Are you on the correct tab (Console, not Network)?
- **Check**: Clear console and refresh page

## Quick Verification Script

Run this in the browser console after the page loads:

```javascript
// Check if models are loaded in React Query cache
const queryClient = window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.queryClient;
if (queryClient) {
  const query = queryClient.getQueryData(['ai-models-aggregated']);
  console.log('Models in cache:', query);
  console.log('Model count:', Array.isArray(query) ? query.length : 'Not an array');
} else {
  console.log('React Query not found');
}
```

## Reporting Template

Copy this template when reporting results:

```
## Browser Console Output
[Paste screenshot or text output here]

## React Query Status
- Query Name: ai-models-aggregated
- Status: [success/loading/error]
- Data Count: [number or "null"]
- Error: [if any]

## Network Requests
- /v1/models: [status code] [success/fail]
- /v1/public/embeddings/models: [status code] [success/fail]

## Visual Result
- Models displayed: [number]
- Screenshot: [attach]

## Any Errors
[Paste any red error messages from console]
```

## Next Steps After Testing

### If models load correctly (10+):
✅ Bug is fixed!
✅ Proceed to test category filtering
✅ Test sort functionality

### If models still show 0:
1. Check browser console for our logging
2. Verify React Query is actually running the query
3. Check for JavaScript errors blocking execution
4. Look at network requests for clues

### If some models load but not all:
1. Check which categories are missing
2. Look for errors related to those specific models
3. Check if `getThumbnailUrl` is throwing errors

## Need Help?

If you're stuck, provide:
1. Full console output (screenshot)
2. React Query DevTools screenshot
3. Network tab screenshot
4. Visual screenshot of the page
5. Any error messages

This will help diagnose the issue quickly.
