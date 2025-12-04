#!/bin/bash
# Issue #6 Acceptance Criteria Tests
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
echo "Issue #6: Set Up shadcn/ui Components"
echo "Acceptance Criteria Tests"
echo "=========================================="
echo ""

# AC1: components.json exists
run_test "components.json exists" "[ -f '$NEXTJS_DIR/components.json' ]"

# AC2: components/ui directory exists
run_test "components/ui directory exists" "[ -d '$NEXTJS_DIR/components/ui' ]"

# AC3: lib/utils.ts exists (cn function)
run_test "lib/utils.ts exists with cn function" "[ -f '$NEXTJS_DIR/lib/utils.ts' ] && grep -q 'cn' '$NEXTJS_DIR/lib/utils.ts'"

# AC4: Core dependencies installed
run_test "class-variance-authority installed" "grep -q 'class-variance-authority' '$NEXTJS_DIR/package.json'"
run_test "clsx installed" "grep -q 'clsx' '$NEXTJS_DIR/package.json'"
run_test "tailwind-merge installed" "grep -q 'tailwind-merge' '$NEXTJS_DIR/package.json'"

# AC5: At least 3 core components installed (button, card, dialog)
run_test "Button component exists" "[ -f '$NEXTJS_DIR/components/ui/button.tsx' ]"
run_test "Card component exists" "[ -f '$NEXTJS_DIR/components/ui/card.tsx' ]"
run_test "Dialog component exists" "[ -f '$NEXTJS_DIR/components/ui/dialog.tsx' ]"

# AC6: Radix UI dependencies installed
run_test "@radix-ui/react-dialog installed" "grep -q '@radix-ui/react-dialog' '$NEXTJS_DIR/package.json'"
run_test "@radix-ui/react-slot installed" "grep -q '@radix-ui/react-slot' '$NEXTJS_DIR/package.json'"

# AC7: lucide-react icons installed
run_test "lucide-react installed" "grep -q 'lucide-react' '$NEXTJS_DIR/package.json'"

# AC8: Build succeeds with shadcn components
run_test "npm run build succeeds" "cd '$NEXTJS_DIR' && npm run build"

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
    echo "🎉 All tests passed! Issue #6 acceptance criteria met."
    exit 0
else
    echo "⚠️  $FAIL_COUNT test(s) failed. Implementation needed."
    exit 1
fi
