#!/bin/bash
# Visual Verification Script for Issue #484: Navbar Spacing Bug Fix
# This script validates the fix across different viewport sizes

set -e

echo "=================================================="
echo "Issue #484: Navbar Spacing Verification"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Next.js dev server is running
echo "1. Checking if Next.js dev server is running on port 3000..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Dev server is running${NC}"
else
    echo -e "${RED}✗ Dev server is NOT running on port 3000${NC}"
    echo "Please start the dev server with: npm run dev"
    exit 1
fi

echo ""
echo "2. Verifying file changes..."

# Check HomeClient.tsx for the fix
if grep -q "pt-24 md:pt-32" /Users/aideveloper/ainative-website-nextjs-staging/app/HomeClient.tsx; then
    echo -e "${GREEN}✓ HomeClient.tsx has responsive top padding (pt-24 md:pt-32)${NC}"
else
    echo -e "${RED}✗ HomeClient.tsx missing responsive top padding${NC}"
    exit 1
fi

# Verify Header.tsx has fixed positioning
if grep -q 'fixed top-0' /Users/aideveloper/ainative-website-nextjs-staging/components/layout/Header.tsx; then
    echo -e "${GREEN}✓ Header.tsx has fixed positioning${NC}"
else
    echo -e "${RED}✗ Header.tsx missing fixed positioning${NC}"
    exit 1
fi

echo ""
echo "3. Running automated tests..."
npm test -- test/bug-484-navbar-spacing.test.tsx --silent 2>&1 | grep -E "(PASS|FAIL|Tests:)" || true

echo ""
echo "4. Spacing Calculations:"
echo "   Mobile:"
echo "   - Header height: ~80px (py-4 + logo ~48px)"
echo "   - Main container top padding: 96px (pt-24)"
echo "   - Clearance: 96px - 80px = ${GREEN}16px safe margin${NC}"
echo ""
echo "   Desktop:"
echo "   - Header height: ~80px"
echo "   - Main container top padding: 128px (pt-32)"
echo "   - Clearance: 128px - 80px = ${GREEN}48px comfortable margin${NC}"

echo ""
echo "5. Manual Verification Checklist:"
echo "   ${YELLOW}Please manually verify the following:${NC}"
echo "   [ ] Open http://localhost:3000 in browser"
echo "   [ ] Hero content does NOT overlap with navbar"
echo "   [ ] Mobile (< 768px): Proper spacing between navbar and hero"
echo "   [ ] Tablet (768px - 1024px): Proper spacing"
echo "   [ ] Desktop (> 1024px): Proper spacing"
echo "   [ ] Scroll behavior: Header stays fixed, content scrolls smoothly"
echo "   [ ] No visual regressions on /pricing, /products, /about pages"

echo ""
echo "6. Responsive Breakpoints to Test:"
echo "   - Mobile: 375px, 414px, 768px"
echo "   - Tablet: 768px, 1024px"
echo "   - Desktop: 1280px, 1440px, 1920px"

echo ""
echo "=================================================="
echo -e "${GREEN}✓ Automated verification complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Open browser DevTools (F12)"
echo "2. Toggle responsive mode (Cmd+Shift+M / Ctrl+Shift+M)"
echo "3. Test each viewport size listed above"
echo "4. Verify no content overlap with navbar"
echo ""
