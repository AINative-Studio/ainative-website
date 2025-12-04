#!/bin/bash
# Issue #5 Acceptance Criteria Tests
# TDD RED Phase: These tests should FAIL initially, then PASS after implementation

NEXTJS_DIR="/home/quaid/Documents/Projects/ainative-studio/src/ainative-nextjs"
TEST_RESULTS=()
PASS_COUNT=0
FAIL_COUNT=0

# Helper function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo -n "Testing: $test_name... "
    if eval "$test_command" > /dev/null 2>&1; then
        echo "✅ PASS"
        TEST_RESULTS+=("PASS: $test_name")
        ((PASS_COUNT++))
    else
        echo "❌ FAIL"
        TEST_RESULTS+=("FAIL: $test_name")
        ((FAIL_COUNT++))
    fi
}

echo "=========================================="
echo "Issue #5: Configure Tailwind CSS"
echo "Acceptance Criteria Tests"
echo "=========================================="
echo ""

# AC1: Tailwind CSS installed (already v4 from create-next-app)
run_test "Tailwind CSS installed" "grep -q 'tailwindcss' '$NEXTJS_DIR/package.json'"

# AC2: tailwindcss-animate plugin installed
run_test "tailwindcss-animate plugin installed" "grep -q 'tailwindcss-animate' '$NEXTJS_DIR/package.json'"

# AC3: Custom theme colors in globals.css (AINative brand colors)
run_test "Primary color defined (#4B6FED)" "grep -q '4B6FED\\|4b6fed' '$NEXTJS_DIR/app/globals.css'"
run_test "Secondary color defined (#338585)" "grep -q '338585' '$NEXTJS_DIR/app/globals.css'"
run_test "Accent color defined (#FCAE39)" "grep -q 'FCAE39\\|fcae39' '$NEXTJS_DIR/app/globals.css'"

# AC4: CSS variables for shadcn/ui compatibility
run_test "CSS variable --background defined" "grep -q '\-\-background' '$NEXTJS_DIR/app/globals.css'"
run_test "CSS variable --foreground defined" "grep -q '\-\-foreground' '$NEXTJS_DIR/app/globals.css'"
run_test "CSS variable --primary defined" "grep -q '\-\-primary' '$NEXTJS_DIR/app/globals.css'"
run_test "CSS variable --card defined" "grep -q '\-\-card' '$NEXTJS_DIR/app/globals.css'"
run_test "CSS variable --muted defined" "grep -q '\-\-muted' '$NEXTJS_DIR/app/globals.css'"
run_test "CSS variable --radius defined" "grep -q '\-\-radius' '$NEXTJS_DIR/app/globals.css'"

# AC5: Dark mode CSS variables
run_test "Dark mode variables defined (.dark class)" "grep -q '\\.dark' '$NEXTJS_DIR/app/globals.css'"

# AC6: Custom animations migrated
run_test "Custom keyframes defined (spin-slow or accordion)" "grep -E 'keyframes|@keyframes' '$NEXTJS_DIR/app/globals.css'"

# AC7: Build succeeds with new configuration
run_test "npm run build succeeds" "cd '$NEXTJS_DIR' && npm run build"

# AC8: Scrollbar-hide utility
run_test "Scrollbar-hide utility defined" "grep -q 'scrollbar-hide' '$NEXTJS_DIR/app/globals.css'"

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

for result in "${TEST_RESULTS[@]}"; do
    echo "  $result"
done

echo ""
if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 All tests passed! Issue #5 acceptance criteria met."
    exit 0
else
    echo "⚠️  $FAIL_COUNT test(s) failed. Implementation needed."
    exit 1
fi
