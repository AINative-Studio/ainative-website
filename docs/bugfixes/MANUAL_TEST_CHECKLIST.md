# Manual Test Checklist: "All" Category Filter Fix

## Pre-Testing Setup

1. Open browser (Chrome/Firefox recommended)
2. Navigate to: `http://localhost:3000/dashboard/ai-settings`
3. Open DevTools (F12)
4. Open Console tab
5. Clear console (Cmd+K / Ctrl+K)

## Test Execution

### Test 1: Basic "All" Category ✓
**Steps:**
1. Page loads with "All" selected by default
2. Wait for models to load (loading spinner disappears)
3. Count visible model cards

**Expected Results:**
- [ ] All models display (should see multiple model cards)
- [ ] "All" button is highlighted (white background)
- [ ] Console shows: `[AISettings] Filtered results: { category: 'All', filteredCount: X, totalCount: X }`
- [ ] No errors in console

**Actual Results:**
- Models displayed: ___
- Console output: ___
- Errors: ___

---

### Test 2: Switch to "All" from Image Category ✓
**Steps:**
1. Click "Image" category button
2. Verify only image models show (e.g., "Qwen Image Edit")
3. Click "All" button
4. Verify all models reappear

**Expected Results:**
- [ ] Image category shows only image models
- [ ] Clicking "All" shows all models again
- [ ] Model count matches total available
- [ ] No JavaScript errors

**Actual Results:**
- Image models count: ___
- All models count: ___
- Errors: ___

---

### Test 3: Rapid Category Switching ✓
**Steps:**
1. Rapidly click categories in sequence: All → Image → Video → Audio → Coding → All
2. Observe final display

**Expected Results:**
- [ ] Each click updates the model list
- [ ] Final state (All) shows all models
- [ ] No frozen UI
- [ ] Console logs show filter activity for each category

**Actual Results:**
- Final models displayed: ___
- Console activity: ___
- Errors: ___

---

### Test 4: Multiple "All" Button Clicks ✓
**Steps:**
1. Click "All" button 5 times consecutively
2. Then click "Image"
3. Then click "All" again

**Expected Results:**
- [ ] Multiple "All" clicks don't break anything
- [ ] Image filter still works after multiple All clicks
- [ ] Returning to "All" shows all models

**Actual Results:**
- Behavior after multiple All clicks: ___
- Errors: ___

---

### Test 5: Category Sequence then All ✓
**Steps:**
1. Click: Coding → Video → Embedding → Audio (in that order)
2. Verify each category shows appropriate models
3. Click "All"

**Expected Results:**
- [ ] Each category shows correct filtered models
- [ ] "All" at the end shows all models
- [ ] Console logs show correct filter counts for each step

**Actual Results:**
- Coding models: ___
- Video models: ___
- Embedding models: ___
- Audio models: ___
- All models (final): ___
- Errors: ___

---

### Test 6: Page Load with Slow Network ✓
**Steps:**
1. Open DevTools Network tab
2. Set throttling to "Slow 3G"
3. Refresh page (Cmd+R / Ctrl+R)
4. Wait for page to load completely
5. Reset network to "No throttling"

**Expected Results:**
- [ ] Loading spinner appears while loading
- [ ] After load completes, all models appear
- [ ] "All" category is selected
- [ ] Console shows proper loading sequence:
  - `[AISettings] Fetching models...`
  - `[AISettings] Models fetched successfully: X`
  - `[AISettings] Models loaded: { count: X, ... }`

**Actual Results:**
- Loading behavior: ___
- Models displayed after load: ___
- Console output: ___
- Errors: ___

---

### Test 7: Error State and Recovery ✓
**Steps:**
1. Open DevTools Network tab
2. Right-click → "Block request URL"
3. Add pattern: `**/v1/models` and `**/v1/public/**`
4. Refresh page
5. Observe error message
6. Click "Retry" button
7. Remove URL blocking
8. Observe recovery

**Expected Results:**
- [ ] Error message appears: "Failed to load AI models"
- [ ] "Retry" button is visible
- [ ] After unblocking and clicking Retry, models load
- [ ] Console shows retry attempt

**Actual Results:**
- Error displayed correctly: ___
- Retry button works: ___
- Recovery successful: ___
- Console output: ___

---

### Test 8: Empty Category Filter ✓
**Steps:**
1. Click different categories
2. Check if any category shows "No models found"
3. If yes, click "View all models" link
4. Verify it returns to showing all models

**Expected Results:**
- [ ] Empty state message shows correctly if category has no models
- [ ] "View all models" link is present
- [ ] Clicking link shows all models

**Actual Results:**
- Empty categories found: ___
- Link behavior: ___
- Errors: ___

---

### Test 9: Sorting with "All" Category ✓
**Steps:**
1. Ensure "All" is selected
2. Change sort dropdown to "Name"
3. Verify models are alphabetically sorted
4. Change to "Oldest"
5. Verify sort order changes
6. Click a different category (e.g., Image)
7. Click "All" again

**Expected Results:**
- [ ] Sort works correctly with "All" category
- [ ] Switching categories maintains sort selection
- [ ] Returning to "All" still respects sort order

**Actual Results:**
- Name sort: ___
- Oldest sort: ___
- Sort maintained after category switch: ___
- Errors: ___

---

### Test 10: Browser Console Verification ✓
**Steps:**
1. With "All" selected and models loaded
2. Review console output
3. Look for debug logs

**Expected Console Output:**
```
[AISettings] Fetching models from aggregator service...
[AISettings] Models fetched successfully: X
[AISettings] Models loaded: { count: X, isLoading: false, activeCategory: 'All' }
[AISettings] Running filter: { category: 'All', totalModels: X, sortBy: 'newest' }
[AISettings] Filtered results: { category: 'All', filteredCount: X, totalCount: X }
[AISettings] Final sorted results: X
```

**Actual Console Output:**
- [ ] All expected log messages present
- [ ] filteredCount equals totalCount for "All" category
- [ ] No warning or error messages

**Actual Results:**
```
[Paste console output here]
```

---

## Test Summary

**Date Tested:** _______________
**Tester:** _______________
**Environment:**
- Browser: _______________
- OS: _______________
- Device: _______________

**Results:**
- Total Tests: 10
- Passed: ___
- Failed: ___
- Blocked: ___

**Critical Issues Found:**
```
[List any issues discovered]
```

**Overall Status:**
- [ ] PASS - All tests passed, ready for production
- [ ] CONDITIONAL PASS - Minor issues, can deploy with caveats
- [ ] FAIL - Critical issues found, requires fixes

**Notes:**
```
[Additional observations or comments]
```

---

## Debug Tips

### If "All" Shows No Models:

1. Check console for errors
2. Look for: `[AISettings] Filtered results: { category: 'All', filteredCount: 0, totalCount: X }`
3. If totalCount > 0 but filteredCount = 0, the bug is NOT fixed
4. Check network tab for API failures

### If Category Filters Don't Work After Clicking "All":

1. Look for JavaScript errors
2. Check if React is re-rendering (use React DevTools)
3. Look for: `[AISettings] Running filter:` log - should appear on each category click
4. If no filter logs appear, click handler may be broken

### If Models Load Slowly:

1. Check network tab for slow API responses
2. Look for retry attempts in console
3. Verify caching is working (subsequent loads should be fast)

### Console Warnings to Investigate:

- `[matchesCategory] Invalid model or capabilities:` - Data structure issue
- `[matchesCategory] Unknown category:` - Category mapping issue
- `[AISettings] Invalid models data format:` - API response issue
- `[AISettings] No models data available yet` - Loading state issue

---

## Sign-Off

**QA Engineer:** ___________________________ Date: ___________

**Tech Lead:** ___________________________ Date: ___________

**Product Owner:** ___________________________ Date: ___________
