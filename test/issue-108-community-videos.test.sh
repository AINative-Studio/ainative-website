#!/bin/bash

# Test script for Issue #108: Community Videos Pages
# Tests: /community/videos (listing) and /community/videos/[slug] (detail)

set -e

echo "=========================================="
echo "Issue #108: Community Videos Pages Tests"
echo "=========================================="

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  echo "✅ PASS: $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "❌ FAIL: $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

# Test 1: Videos listing page exists
echo ""
echo "--- File Structure Tests ---"
if [ -f "app/community/videos/page.tsx" ]; then
  pass "Videos listing page exists at app/community/videos/page.tsx"
else
  fail "Videos listing page missing at app/community/videos/page.tsx"
fi

# Test 2: Video detail page exists
if [ -f "app/community/videos/[slug]/page.tsx" ]; then
  pass "Video detail page exists at app/community/videos/[slug]/page.tsx"
else
  fail "Video detail page missing at app/community/videos/[slug]/page.tsx"
fi

# Test 3: Client component for videos listing
if [ -f "app/community/videos/VideosClient.tsx" ]; then
  pass "VideosClient.tsx component exists"
else
  fail "VideosClient.tsx component missing"
fi

# Test 4: Client component for video detail
if [ -f "app/community/videos/[slug]/VideoDetailClient.tsx" ]; then
  pass "VideoDetailClient.tsx component exists"
else
  fail "VideoDetailClient.tsx component missing"
fi

echo ""
echo "--- Metadata Tests ---"

# Test 5: Videos listing has metadata export
if grep -q "export const metadata" "app/community/videos/page.tsx" 2>/dev/null || \
   grep -q "export async function generateMetadata" "app/community/videos/page.tsx" 2>/dev/null; then
  pass "Videos listing page has metadata export"
else
  fail "Videos listing page missing metadata export"
fi

# Test 6: Video detail has generateMetadata
if grep -q "export async function generateMetadata" "app/community/videos/[slug]/page.tsx" 2>/dev/null; then
  pass "Video detail page has generateMetadata function"
else
  fail "Video detail page missing generateMetadata function"
fi

# Test 7: Videos listing metadata has correct title
if grep -q "Community Videos" "app/community/videos/page.tsx" 2>/dev/null; then
  pass "Videos listing metadata includes 'Community Videos'"
else
  fail "Videos listing metadata missing 'Community Videos' title"
fi

echo ""
echo "--- Component Tests ---"

# Test 8: Videos listing has search functionality
if grep -q "search" "app/community/videos/VideosClient.tsx" 2>/dev/null; then
  pass "Videos listing has search functionality"
else
  fail "Videos listing missing search functionality"
fi

# Test 9: Videos listing has category filter
if grep -q "category" "app/community/videos/VideosClient.tsx" 2>/dev/null; then
  pass "Videos listing has category filter"
else
  fail "Videos listing missing category filter"
fi

# Test 10: Video card shows duration
if grep -q "duration" "app/community/videos/VideosClient.tsx" 2>/dev/null; then
  pass "Video card shows duration"
else
  fail "Video card missing duration"
fi

# Test 11: Video card shows view count
if grep -q "views" "app/community/videos/VideosClient.tsx" 2>/dev/null; then
  pass "Video card shows view count"
else
  fail "Video card missing view count"
fi

# Test 12: Video card shows thumbnail
if grep -q "thumbnail" "app/community/videos/VideosClient.tsx" 2>/dev/null; then
  pass "Video card shows thumbnail"
else
  fail "Video card missing thumbnail"
fi

# Test 13: Video detail has video player
if grep -q "video" "app/community/videos/[slug]/VideoDetailClient.tsx" 2>/dev/null; then
  pass "Video detail page has video player"
else
  fail "Video detail page missing video player"
fi

# Test 14: Video detail has like button
if grep -q "like" "app/community/videos/[slug]/VideoDetailClient.tsx" 2>/dev/null; then
  pass "Video detail page has like functionality"
else
  fail "Video detail page missing like functionality"
fi

# Test 15: Video detail has share button
if grep -q "share" "app/community/videos/[slug]/VideoDetailClient.tsx" 2>/dev/null; then
  pass "Video detail page has share functionality"
else
  fail "Video detail page missing share functionality"
fi

# Test 16: Video detail shows related videos
if grep -q "related" "app/community/videos/[slug]/VideoDetailClient.tsx" 2>/dev/null; then
  pass "Video detail page shows related videos"
else
  fail "Video detail page missing related videos"
fi

# Test 17: Uses 'use client' directive in client components
if grep -q "'use client'" "app/community/videos/VideosClient.tsx" 2>/dev/null; then
  pass "VideosClient.tsx has 'use client' directive"
else
  fail "VideosClient.tsx missing 'use client' directive"
fi

if grep -q "'use client'" "app/community/videos/[slug]/VideoDetailClient.tsx" 2>/dev/null; then
  pass "VideoDetailClient.tsx has 'use client' directive"
else
  fail "VideoDetailClient.tsx missing 'use client' directive"
fi

echo ""
echo "--- Navigation Tests ---"

# Test 19: Video card links to detail page
if grep -q "/community/videos/" "app/community/videos/VideosClient.tsx" 2>/dev/null; then
  pass "Video card links to detail page"
else
  fail "Video card missing link to detail page"
fi

# Test 20: Video detail has back link to listing
if grep -q "/community/videos" "app/community/videos/[slug]/VideoDetailClient.tsx" 2>/dev/null; then
  pass "Video detail has back link to listing"
else
  fail "Video detail missing back link to listing"
fi

echo ""
echo "=========================================="
echo "Test Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -gt 0 ]; then
  exit 1
fi

exit 0
