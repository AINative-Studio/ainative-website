# AIKit Dashboard - Critical Bugs & Action Items

**Date:** 2026-01-29
**Status:** 🔴 BLOCKS PRODUCTION
**Estimated Fix Time:** 1-2 days

---

## CRITICAL BUGS (Must Fix)

### BUG-001: Missing OG Image
- **File:** `/public/og-ai-kit.jpg`
- **Impact:** Social sharing broken
- **Time:** 1-2 hours
- **Action:**
  1. Design 1200x630px OG image
  2. Save as `/public/og-ai-kit.jpg`
  3. Optimize to <100KB
  4. Test on Twitter, Facebook, LinkedIn

### BUG-002: Test Infrastructure Broken
- **File:** Multiple test files
- **Impact:** Cannot run tests, CI/CD fails
- **Time:** 2-4 hours
- **Action:**
  1. Update `jest.config.js` transformIgnorePatterns
  2. Fix ESM module handling for `msw`, `until-async`
  3. Verify all tests pass
  4. Update test documentation

### BUG-003: Copy Buttons Missing ARIA Labels
- **File:** `/app/ai-kit/AIKitClient.tsx` (line 539)
- **Impact:** WCAG violation, screen readers broken
- **Time:** 30 minutes
- **Action:**
  ```typescript
  <button
    aria-label={copiedPackage === pkg.name
      ? `Copied ${pkg.name} install command`
      : `Copy ${pkg.name} install command to clipboard`}
    onClick={...}
  >
  ```

---

## HIGH PRIORITY BUGS (Should Fix)

### BUG-004: No Clipboard Error Handling
- **File:** `/app/ai-kit/AIKitClient.tsx` (line 261)
- **Impact:** Silent failures, poor UX
- **Time:** 1 hour
- **Action:** Add try/catch and user feedback

### BUG-005: No Clipboard Fallback
- **File:** `/app/ai-kit/AIKitClient.tsx` (line 261)
- **Impact:** Older browsers cannot copy
- **Time:** 1 hour
- **Action:** Implement `document.execCommand('copy')` fallback

### BUG-006: Decorative Icons Missing aria-hidden
- **File:** `/app/ai-kit/AIKitClient.tsx` (multiple locations)
- **Impact:** Screen readers announce decorative elements
- **Time:** 15 minutes
- **Action:** Add `aria-hidden="true"` to all decorative icons

### BUG-007: Code Blocks Missing Language Label
- **File:** `/app/ai-kit/AIKitClient.tsx` (lines 630-676)
- **Impact:** Screen readers don't announce code language
- **Time:** 15 minutes
- **Action:** Add `aria-label="React example code"` etc.

---

## QUICK FIXES (Copy/Paste Ready)

### Fix 1: Add ARIA Label to Copy Button

**Location:** Line 539 in `/app/ai-kit/AIKitClient.tsx`

**Replace:**
```typescript
<button
  onClick={() => copyToClipboard(`npm install ${pkg.name}`, pkg.name)}
  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#1C2128] border border-[#2D333B] hover:border-[#4B6FED]/40 transition-all"
>
```

**With:**
```typescript
<button
  onClick={() => copyToClipboard(`npm install ${pkg.name}`, pkg.name)}
  aria-label={copiedPackage === pkg.name
    ? `Copied ${pkg.name} install command`
    : `Copy ${pkg.name} install command to clipboard`}
  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#1C2128] border border-[#2D333B] hover:border-[#4B6FED]/40 transition-all"
>
```

### Fix 2: Add Error Handling to Clipboard Function

**Location:** Line 261 in `/app/ai-kit/AIKitClient.tsx`

**Replace:**
```typescript
const copyToClipboard = (text: string, packageName: string) => {
  navigator.clipboard.writeText(text);
  setCopiedPackage(packageName);
  setTimeout(() => setCopiedPackage(null), 2000);
};
```

**With:**
```typescript
const copyToClipboard = async (text: string, packageName: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedPackage(packageName);
    setTimeout(() => setCopiedPackage(null), 2000);
  } catch (error) {
    // Fallback for older browsers or permission denial
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        setCopiedPackage(packageName);
        setTimeout(() => setCopiedPackage(null), 2000);
      } else {
        console.error('Failed to copy to clipboard');
        // TODO: Show error toast to user
      }
    } catch (fallbackError) {
      console.error('Clipboard not supported', fallbackError);
      // TODO: Show error toast to user
    }
  }
};
```

### Fix 3: Add aria-hidden to Decorative Icons

**Location:** Line 506 in `/app/ai-kit/AIKitClient.tsx`

**Find all instances of:**
```typescript
<pkg.icon className="h-5 w-5 text-white" />
```

**Replace with:**
```typescript
<pkg.icon className="h-5 w-5 text-white" aria-hidden="true" />
```

**Also apply to:**
- Line 438: `<feature.icon className="h-6 w-6 text-[#4B6FED]" />`
- Add to all Lucide icons that are decorative

### Fix 4: Add Language Labels to Code Blocks

**Location:** Lines 630-676 in `/app/ai-kit/AIKitClient.tsx`

**React Tab:**
```typescript
<pre
  className="bg-vite-bg rounded-lg p-4 overflow-x-auto border border-[#2D333B]"
  aria-label="React code example"
>
```

**Vue Tab:**
```typescript
<pre
  className="bg-vite-bg rounded-lg p-4 overflow-x-auto border border-[#2D333B]"
  aria-label="Vue code example"
>
```

**CLI Tab:**
```typescript
<pre
  className="bg-vite-bg rounded-lg p-4 overflow-x-auto border border-[#2D333B]"
  aria-label="CLI commands example"
>
```

---

## VERIFICATION CHECKLIST

After fixes are applied, verify:

- [ ] OG image loads correctly at `/public/og-ai-kit.jpg`
- [ ] Share URL on Twitter/Facebook - image displays
- [ ] Run `npm run type-check` - no errors
- [ ] Run `npm test` - all tests pass
- [ ] Test with VoiceOver (macOS): Copy buttons have labels
- [ ] Test with VoiceOver: Code blocks announce language
- [ ] Test clipboard on old Safari (<13.1): Fallback works
- [ ] Test clipboard permission denial: Error feedback shown
- [ ] Run Lighthouse audit - Accessibility score 90+
- [ ] Run axe DevTools - No critical violations

---

## TESTING COMMANDS

```bash
# Type check
npm run type-check

# Run tests
npm test app/ai-kit

# Lint
npm run lint

# Build verification
npm run build

# Lighthouse audit
npx lighthouse http://localhost:3000/ai-kit --view

# Accessibility audit with axe
npm install -g @axe-core/cli
axe http://localhost:3000/ai-kit
```

---

## POST-FIX ACTIONS

1. **Update Tests**
   - Add test for clipboard fallback
   - Add test for ARIA labels
   - Verify accessibility compliance

2. **Document Changes**
   - Update CHANGELOG
   - Update component documentation
   - Add accessibility notes

3. **Monitor in Production**
   - Track clipboard failures
   - Monitor OG image load times
   - Check social share analytics

---

## ESTIMATED TIMELINE

| Task | Time | Priority |
|------|------|----------|
| Create OG image | 1-2h | CRITICAL |
| Fix accessibility (BUG-003, 006, 007) | 1h | CRITICAL |
| Add clipboard error handling (BUG-004, 005) | 2h | HIGH |
| Fix test infrastructure (BUG-002) | 2-4h | CRITICAL |
| QA verification | 2-3h | CRITICAL |
| **TOTAL** | **8-12h** | - |

**Recommended Approach:**
1. Day 1 Morning: Fix BUG-003, 006, 007 (quick wins)
2. Day 1 Afternoon: Create OG image + clipboard fixes
3. Day 2 Morning: Fix test infrastructure
4. Day 2 Afternoon: Full QA verification and sign-off

---

**Status:** Ready for development team to implement fixes.
**Next Step:** Assign to developer and track in issue tracker.
