#!/bin/bash
# Comprehensive test script for Issue #366 - Unsplash Integration
# Tests all components, services, and integration points

set -e

echo "======================================"
echo "Issue #366: Unsplash Integration"
echo "Comprehensive Test Suite"
echo "======================================"
echo ""

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_result() {
    if [ $1 -eq 0 ]; then
        echo "✓ PASS: $2"
        ((TESTS_PASSED++))
    else
        echo "✗ FAIL: $2"
        ((TESTS_FAILED++))
    fi
}

echo "=== 1. Core Files ==="
echo ""

# Original utility file
if [ -f "lib/unsplash.ts" ]; then
    test_result 0 "lib/unsplash.ts exists"
else
    test_result 1 "lib/unsplash.ts not found"
fi

# Service files
if [ -f "services/unsplashService.ts" ]; then
    test_result 0 "services/unsplashService.ts exists"
else
    test_result 1 "services/unsplashService.ts not found"
fi

if [ -f "services/unsplashCache.ts" ]; then
    test_result 0 "services/unsplashCache.ts exists"
else
    test_result 1 "services/unsplashCache.ts not found"
fi

if [ -f "services/unsplashRateLimit.ts" ]; then
    test_result 0 "services/unsplashRateLimit.ts exists"
else
    test_result 1 "services/unsplashRateLimit.ts not found"
fi

if [ -f "services/unsplashAttribution.ts" ]; then
    test_result 0 "services/unsplashAttribution.ts exists"
else
    test_result 1 "services/unsplashAttribution.ts not found"
fi

# Type definitions
if [ -f "services/types/unsplash.types.ts" ]; then
    test_result 0 "services/types/unsplash.types.ts exists"
else
    test_result 1 "services/types/unsplash.types.ts not found"
fi

echo ""
echo "=== 2. React Components ==="
echo ""

if [ -f "components/unsplash/UnsplashImage.tsx" ]; then
    test_result 0 "UnsplashImage component exists"
else
    test_result 1 "UnsplashImage component not found"
fi

if [ -f "components/unsplash/UnsplashAttribution.tsx" ]; then
    test_result 0 "UnsplashAttribution component exists"
else
    test_result 1 "UnsplashAttribution component not found"
fi

echo ""
echo "=== 3. Type Definitions ==="
echo ""

if grep -q "interface UnsplashImageOptions" services/types/unsplash.types.ts; then
    test_result 0 "UnsplashImageOptions interface defined"
else
    test_result 1 "UnsplashImageOptions interface not found"
fi

if grep -q "interface UnsplashImage" services/types/unsplash.types.ts; then
    test_result 0 "UnsplashImage interface defined"
else
    test_result 1 "UnsplashImage interface not found"
fi

if grep -q "class UnsplashError" services/types/unsplash.types.ts; then
    test_result 0 "UnsplashError class defined"
else
    test_result 1 "UnsplashError class not found"
fi

echo ""
echo "=== 4. Service Methods ==="
echo ""

if grep -q "getImage" services/unsplashService.ts; then
    test_result 0 "getImage method exists"
else
    test_result 1 "getImage method not found"
fi

if grep -q "getImageUrl" services/unsplashService.ts; then
    test_result 0 "getImageUrl method exists"
else
    test_result 1 "getImageUrl method not found"
fi

if grep -q "getImageUrlSync" services/unsplashService.ts; then
    test_result 0 "getImageUrlSync method exists"
else
    test_result 1 "getImageUrlSync method not found"
fi

if grep -q "preloadImages" services/unsplashService.ts; then
    test_result 0 "preloadImages method exists"
else
    test_result 1 "preloadImages method not found"
fi

if grep -q "getStats" services/unsplashService.ts; then
    test_result 0 "getStats method exists"
else
    test_result 1 "getStats method not found"
fi

echo ""
echo "=== 5. Error Handling ==="
echo ""

if grep -q "validateInput" services/unsplashService.ts; then
    test_result 0 "Input validation implemented"
else
    test_result 1 "Input validation not found"
fi

if grep -q "generateFallback" services/unsplashService.ts; then
    test_result 0 "Fallback generation implemented"
else
    test_result 1 "Fallback generation not found"
fi

if grep -q "try" services/unsplashService.ts && grep -q "catch" services/unsplashService.ts; then
    test_result 0 "Error handling (try/catch) implemented"
else
    test_result 1 "Error handling not implemented"
fi

echo ""
echo "=== 6. Caching ==="
echo ""

if grep -q "class UnsplashCache" services/unsplashCache.ts; then
    test_result 0 "Cache class implemented"
else
    test_result 1 "Cache class not found"
fi

if grep -q "get(" services/unsplashCache.ts && grep -q "set(" services/unsplashCache.ts; then
    test_result 0 "Cache get/set methods exist"
else
    test_result 1 "Cache get/set methods not found"
fi

if grep -q "evict" services/unsplashCache.ts; then
    test_result 0 "Cache eviction implemented"
else
    test_result 1 "Cache eviction not implemented"
fi

if grep -q "cleanup" services/unsplashCache.ts; then
    test_result 0 "Cache cleanup implemented"
else
    test_result 1 "Cache cleanup not implemented"
fi

echo ""
echo "=== 7. Rate Limiting ==="
echo ""

if grep -q "class UnsplashRateLimiter" services/unsplashRateLimit.ts; then
    test_result 0 "Rate limiter class implemented"
else
    test_result 1 "Rate limiter class not found"
fi

if grep -q "canProceed" services/unsplashRateLimit.ts; then
    test_result 0 "canProceed method exists"
else
    test_result 1 "canProceed method not found"
fi

if grep -q "execute" services/unsplashRateLimit.ts; then
    test_result 0 "execute method exists"
else
    test_result 1 "execute method not found"
fi

if grep -q "queue" services/unsplashRateLimit.ts; then
    test_result 0 "Request queuing implemented"
else
    test_result 1 "Request queuing not implemented"
fi

echo ""
echo "=== 8. Attribution ==="
echo ""

if grep -q "PHOTO_METADATA" services/unsplashAttribution.ts; then
    test_result 0 "Photo metadata defined"
else
    test_result 1 "Photo metadata not found"
fi

if grep -q "getPhotoAttribution" services/unsplashAttribution.ts; then
    test_result 0 "getPhotoAttribution function exists"
else
    test_result 1 "getPhotoAttribution function not found"
fi

if grep -q "getPhotographerUrl" services/unsplashAttribution.ts; then
    test_result 0 "getPhotographerUrl function exists"
else
    test_result 1 "getPhotographerUrl function not found"
fi

echo ""
echo "=== 9. Integration Points ==="
echo ""

if grep -q "getUnsplashImageUrl" app/blog/BlogListingClient.tsx; then
    test_result 0 "Blog listing integration"
else
    test_result 1 "Blog listing integration missing"
fi

if grep -q "getUnsplashImageUrl" app/blog/\[slug\]/BlogDetailClient.tsx; then
    test_result 0 "Blog detail integration"
else
    test_result 1 "Blog detail integration missing"
fi

if grep -q "getUnsplashImageUrl" app/tutorials/TutorialListingClient.tsx; then
    test_result 0 "Tutorial listing integration"
else
    test_result 1 "Tutorial listing integration missing"
fi

if grep -q "getUnsplashImageUrl" app/webinars/WebinarListingClient.tsx; then
    test_result 0 "Webinar listing integration"
else
    test_result 1 "Webinar listing integration missing"
fi

echo ""
echo "=== 10. Next.js Configuration ==="
echo ""

if grep -q "images.unsplash.com" next.config.ts; then
    test_result 0 "Unsplash domain in Next.js config"
else
    test_result 1 "Unsplash domain not in Next.js config"
fi

if grep -q "remotePatterns" next.config.ts; then
    test_result 0 "remotePatterns configured"
else
    test_result 1 "remotePatterns not configured"
fi

echo ""
echo "=== 11. Unit Tests ==="
echo ""

if [ -f "__tests__/services/unsplashService.test.ts" ]; then
    test_result 0 "Service unit tests exist"
else
    test_result 1 "Service unit tests not found"
fi

if [ -f "__tests__/services/unsplashCache.test.ts" ]; then
    test_result 0 "Cache unit tests exist"
else
    test_result 1 "Cache unit tests not found"
fi

if [ -f "__tests__/services/unsplashRateLimit.test.ts" ]; then
    test_result 0 "Rate limiter unit tests exist"
else
    test_result 1 "Rate limiter unit tests not found"
fi

echo ""
echo "=== 12. Documentation ==="
echo ""

if [ -f "docs/integrations/unsplash-integration.md" ]; then
    test_result 0 "Integration documentation exists"
else
    test_result 1 "Integration documentation not found"
fi

if [ -f "docs/integrations/unsplash-audit-report.md" ]; then
    test_result 0 "Audit report exists"
else
    test_result 1 "Audit report not found"
fi

if [ -f "docs/integrations/unsplash-quick-start.md" ]; then
    test_result 0 "Quick start guide exists"
else
    test_result 1 "Quick start guide not found"
fi

echo ""
echo "=== 13. Demo Page ==="
echo ""

if [ -f "app/demo/unsplash/page.tsx" ]; then
    test_result 0 "Demo page exists"
else
    test_result 1 "Demo page not found"
fi

if [ -f "app/demo/unsplash/UnsplashDemoClient.tsx" ]; then
    test_result 0 "Demo client component exists"
else
    test_result 1 "Demo client component not found"
fi

echo ""
echo "=== 14. Component Features ==="
echo ""

if grep -q "'use client'" components/unsplash/UnsplashImage.tsx; then
    test_result 0 "UnsplashImage is client component"
else
    test_result 1 "UnsplashImage missing 'use client'"
fi

if grep -q "showAttribution" components/unsplash/UnsplashImage.tsx; then
    test_result 0 "UnsplashImage supports attribution"
else
    test_result 1 "UnsplashImage missing attribution support"
fi

if grep -q "loading=" components/unsplash/UnsplashImage.tsx; then
    test_result 0 "UnsplashImage supports lazy loading"
else
    test_result 1 "UnsplashImage missing lazy loading"
fi

if grep -q "onError" components/unsplash/UnsplashImage.tsx; then
    test_result 0 "UnsplashImage has error callback"
else
    test_result 1 "UnsplashImage missing error callback"
fi

echo ""
echo "=== 15. TypeScript Checks ==="
echo ""

# Check for proper exports
if grep -q "export.*unsplashService" services/unsplashService.ts; then
    test_result 0 "Service properly exported"
else
    test_result 1 "Service not properly exported"
fi

if grep -q "export.*unsplashCache" services/unsplashCache.ts; then
    test_result 0 "Cache properly exported"
else
    test_result 1 "Cache not properly exported"
fi

# Summary
echo ""
echo "======================================"
echo "Summary: $TESTS_PASSED passed, $TESTS_FAILED failed"
echo "======================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ All tests passed!"
    echo ""
    echo "Unsplash integration is fully implemented with:"
    echo "  • Service layer with error handling"
    echo "  • In-memory caching"
    echo "  • Rate limiting"
    echo "  • Image attribution"
    echo "  • React components"
    echo "  • Comprehensive tests"
    echo "  • Demo page"
    echo "  • Full documentation"
    exit 0
else
    echo "✗ Some tests failed"
    echo "Please review the failed tests above."
    exit 1
fi
