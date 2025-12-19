#!/bin/bash
# Story #49: Modal/Dialog Components Migration Tests
# Tests for modal/dialog components with accessibility and portal rendering
# Part of Sprint 2 - Component Migration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# Test helper function
test_pass() {
    echo -e "${GREEN}PASS${NC}: $1"
    ((PASS_COUNT++))
}

test_fail() {
    echo -e "${RED}FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

test_skip() {
    echo -e "${YELLOW}SKIP${NC}: $1"
}

echo "==========================================="
echo "Story #49: Modal/Dialog Components Migration Tests"
echo "==========================================="
echo ""

# ====================
# DEPENDENCY TESTS
# ====================
echo "--- Dependency Tests ---"

# Test 1: Radix Dialog is installed
if grep -q '"@radix-ui/react-dialog"' "package.json" 2>/dev/null; then
    test_pass "Radix UI Dialog is installed in package.json"
else
    test_fail "Radix UI Dialog not found in package.json"
fi

# Test 2: Check Radix Dialog version
DIALOG_VERSION=$(grep '"@radix-ui/react-dialog"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
if [ -n "$DIALOG_VERSION" ]; then
    test_pass "Radix Dialog version: $DIALOG_VERSION"
else
    test_fail "Could not determine Radix Dialog version"
fi

# ====================
# FILE STRUCTURE TESTS
# ====================
echo ""
echo "--- File Structure Tests ---"

# Test 3: Dialog component exists
if [ -f "components/ui/dialog.tsx" ]; then
    test_pass "Dialog component exists at components/ui/dialog.tsx"
else
    test_fail "Dialog component not found"
fi

# ====================
# CLIENT DIRECTIVE TESTS
# ====================
echo ""
echo "--- Client Directive Tests ---"

# Test 4: Dialog component has 'use client' directive
if grep -qE "^['\"]use client['\"]" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog component has 'use client' directive"
else
    test_fail "Dialog component missing 'use client' directive"
fi

# Test 5: CreditRefillsClient has 'use client' (uses dialog)
if grep -qE "^['\"]use client['\"]" "app/refills/CreditRefillsClient.tsx" 2>/dev/null; then
    test_pass "CreditRefillsClient has 'use client' directive"
else
    test_fail "CreditRefillsClient missing 'use client' directive"
fi

# Test 6: TeamSettingsClient has 'use client' (uses dialog)
if grep -qE "^['\"]use client['\"]" "app/team/TeamSettingsClient.tsx" 2>/dev/null; then
    test_pass "TeamSettingsClient has 'use client' directive"
else
    test_fail "TeamSettingsClient missing 'use client' directive"
fi

# ====================
# RADIX PRIMITIVE TESTS
# ====================
echo ""
echo "--- Radix Primitive Tests ---"

# Test 7: Dialog imports from Radix
if grep -q "@radix-ui/react-dialog" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog imports from @radix-ui/react-dialog"
else
    test_fail "Dialog not importing from Radix"
fi

# Test 8: DialogPrimitive used
if grep -q "DialogPrimitive" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogPrimitive used for base components"
else
    test_fail "DialogPrimitive not used"
fi

# ====================
# DIALOG COMPONENT EXPORTS
# ====================
echo ""
echo "--- Dialog Component Export Tests ---"

# Test 9: Dialog root exported (shadcn uses const + export block pattern)
if grep -q "const Dialog" "components/ui/dialog.tsx" 2>/dev/null && grep -q "export {" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog component exported"
else
    test_fail "Dialog not exported"
fi

# Test 10: DialogTrigger exported
if grep -q "DialogTrigger" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogTrigger component available"
else
    test_fail "DialogTrigger not found"
fi

# Test 11: DialogContent exported
if grep -q "DialogContent" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogContent component available"
else
    test_fail "DialogContent not found"
fi

# Test 12: DialogHeader exported
if grep -q "DialogHeader" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogHeader component available"
else
    test_fail "DialogHeader not found"
fi

# Test 13: DialogFooter exported
if grep -q "DialogFooter" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogFooter component available"
else
    test_fail "DialogFooter not found"
fi

# Test 14: DialogTitle exported
if grep -q "DialogTitle" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogTitle component available"
else
    test_fail "DialogTitle not found"
fi

# Test 15: DialogDescription exported
if grep -q "DialogDescription" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogDescription component available"
else
    test_fail "DialogDescription not found"
fi

# Test 16: DialogClose exported
if grep -q "DialogClose" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogClose component available"
else
    test_fail "DialogClose not found"
fi

# ====================
# PORTAL RENDERING TESTS
# ====================
echo ""
echo "--- Portal Rendering Tests ---"

# Test 17: DialogPortal used for overlay rendering
if grep -q "DialogPortal" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogPortal used for portal rendering"
else
    test_fail "DialogPortal not used"
fi

# Test 18: DialogOverlay used for backdrop
if grep -q "DialogOverlay" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "DialogOverlay used for backdrop rendering"
else
    test_fail "DialogOverlay not found"
fi

# ====================
# ACCESSIBILITY TESTS
# ====================
echo ""
echo "--- Accessibility Tests ---"

# Test 19: Close button has sr-only label
if grep -q 'sr-only' "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog close button has screen reader label"
else
    test_fail "Dialog missing screen reader label for close"
fi

# Test 20: Focus ring styles present
if grep -q "focus:.*ring" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Focus ring styles present for accessibility"
else
    test_fail "Focus ring styles missing"
fi

# Test 21: Uses forwardRef for ref forwarding
if grep -q "React.forwardRef" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog components use forwardRef"
else
    test_fail "Dialog components not using forwardRef"
fi

# Test 22: Components have displayName
DISPLAY_NAME_COUNT=$(grep -c "displayName" "components/ui/dialog.tsx" 2>/dev/null || echo "0")
if [ "$DISPLAY_NAME_COUNT" -ge 4 ]; then
    test_pass "Dialog components have displayName ($DISPLAY_NAME_COUNT)"
else
    test_fail "Not enough displayName definitions, found $DISPLAY_NAME_COUNT"
fi

# ====================
# ANIMATION TESTS
# ====================
echo ""
echo "--- Animation Tests ---"

# Test 23: Entry animation (animate-in)
if grep -q "animate-in" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog has entry animations (animate-in)"
else
    test_fail "Dialog missing entry animations"
fi

# Test 24: Exit animation (animate-out)
if grep -q "animate-out" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog has exit animations (animate-out)"
else
    test_fail "Dialog missing exit animations"
fi

# Test 25: Fade animations
if grep -q "fade-in\|fade-out" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog has fade animations"
else
    test_fail "Dialog missing fade animations"
fi

# Test 26: Zoom animations
if grep -q "zoom-in\|zoom-out" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog has zoom animations"
else
    test_fail "Dialog missing zoom animations"
fi

# Test 27: Slide animations
if grep -q "slide-in\|slide-out" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog has slide animations"
else
    test_fail "Dialog missing slide animations"
fi

# ====================
# STYLING TESTS
# ====================
echo ""
echo "--- Styling Tests ---"

# Test 28: Uses cn() utility
if grep -q "cn(" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog uses cn() utility for className merging"
else
    test_fail "Dialog not using cn() utility"
fi

# Test 29: Dialog content centered
if grep -q "translate-x-\[-50%\].*translate-y-\[-50%\]" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog content is centered (translate -50%)"
else
    test_fail "Dialog content centering missing"
fi

# Test 30: Overlay has dark backdrop
if grep -q "bg-black" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog overlay has dark backdrop"
else
    test_fail "Dialog overlay missing dark backdrop"
fi

# Test 31: z-50 for proper stacking
if grep -q "z-50" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog uses z-50 for proper stacking"
else
    test_fail "Dialog missing z-index for stacking"
fi

# ====================
# CLOSE BUTTON TESTS
# ====================
echo ""
echo "--- Close Button Tests ---"

# Test 32: X icon for close button
if grep -q 'X' "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Close button uses X icon"
else
    test_fail "Close button missing X icon"
fi

# Test 33: Close button positioned top-right
if grep -q "right-4.*top-4\|top-4.*right-4" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Close button positioned top-right"
else
    test_fail "Close button positioning incorrect"
fi

# Test 34: Close button imports lucide-react
if grep -qE "from ['\"]lucide-react['\"]" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Close button uses lucide-react icon"
else
    test_fail "lucide-react not imported for close icon"
fi

# ====================
# USAGE IN PAGES TESTS
# ====================
echo ""
echo "--- Dialog Usage in Pages Tests ---"

# Test 35: CreditRefillsClient imports Dialog
if grep -q "import.*Dialog.*from '@/components/ui/dialog'" "app/refills/CreditRefillsClient.tsx" 2>/dev/null; then
    test_pass "CreditRefillsClient imports Dialog components"
else
    test_fail "CreditRefillsClient not importing Dialog"
fi

# Test 36: CreditRefillsClient uses DialogContent
if grep -q "<DialogContent" "app/refills/CreditRefillsClient.tsx" 2>/dev/null; then
    test_pass "CreditRefillsClient uses DialogContent"
else
    test_fail "CreditRefillsClient not using DialogContent"
fi

# Test 37: TeamSettingsClient imports Dialog
if grep -qE "from ['\"]@/components/ui/dialog['\"]" "app/team/TeamSettingsClient.tsx" 2>/dev/null; then
    test_pass "TeamSettingsClient imports Dialog components"
else
    test_fail "TeamSettingsClient not importing Dialog"
fi

# Test 38: Dialog state management (open/setOpen pattern)
if grep -q "setShow\|setOpen\|showPaymentModal" "app/refills/CreditRefillsClient.tsx" 2>/dev/null; then
    test_pass "Dialog uses state management for open/close"
else
    test_fail "Dialog state management not found"
fi

# ====================
# RESPONSIVE TESTS
# ====================
echo ""
echo "--- Responsive Design Tests ---"

# Test 39: Responsive width (max-w-lg)
if grep -q "max-w-lg" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog has max-width for responsive design"
else
    test_fail "Dialog missing max-width constraint"
fi

# Test 40: SM breakpoint styles
if grep -q "sm:rounded\|sm:flex\|sm:justify\|sm:text" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog has SM breakpoint styles"
else
    test_fail "Dialog missing SM breakpoint styles"
fi

# ====================
# TYPESCRIPT TESTS
# ====================
echo ""
echo "--- TypeScript Tests ---"

# Test 41: React.ComponentPropsWithoutRef used
if grep -q "React.ComponentPropsWithoutRef" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog uses React.ComponentPropsWithoutRef for props"
else
    test_fail "Dialog not using React.ComponentPropsWithoutRef"
fi

# Test 42: React.ElementRef used
if grep -q "React.ElementRef" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog uses React.ElementRef for refs"
else
    test_fail "Dialog not using React.ElementRef"
fi

# Test 43: HTMLAttributes used
if grep -q "React.HTMLAttributes" "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog uses React.HTMLAttributes"
else
    test_fail "Dialog not using React.HTMLAttributes"
fi

# ====================
# DATA-STATE TESTS
# ====================
echo ""
echo "--- Data State Tests ---"

# Test 44: data-[state=open] styling
if grep -q 'data-\[state=open\]' "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog uses data-[state=open] for open state styling"
else
    test_fail "Dialog missing data-[state=open] styling"
fi

# Test 45: data-[state=closed] styling
if grep -q 'data-\[state=closed\]' "components/ui/dialog.tsx" 2>/dev/null; then
    test_pass "Dialog uses data-[state=closed] for closed state styling"
else
    test_fail "Dialog missing data-[state=closed] styling"
fi

# ====================
# BUILD VERIFICATION TEST
# ====================
echo ""
echo "--- Build Verification Test ---"

# Test 46: Project builds successfully
echo "Running build verification..."
if npm run build > /tmp/build_output.txt 2>&1; then
    test_pass "Project builds successfully with dialog components"
else
    test_fail "Project build failed"
    echo "Build output (last 20 lines):"
    tail -20 /tmp/build_output.txt
fi

# ====================
# SUMMARY
# ====================
echo ""
echo "==========================================="
echo "Test Summary"
echo "==========================================="
echo -e "Passed: ${GREEN}${PASS_COUNT}${NC}"
echo -e "Failed: ${RED}${FAIL_COUNT}${NC}"
echo ""

TOTAL=$((PASS_COUNT + FAIL_COUNT))
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All $TOTAL tests passed!${NC}"
    exit 0
else
    echo -e "${RED}$FAIL_COUNT of $TOTAL tests failed${NC}"
    exit 1
fi
