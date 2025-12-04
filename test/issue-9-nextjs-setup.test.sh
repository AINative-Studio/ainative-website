#!/bin/bash
# Issue #9 Acceptance Criteria Tests
# TDD RED Phase: These tests should FAIL initially, then PASS after implementation

# Don't exit on first failure - we want to run all tests
# set -e

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
echo "Issue #9: Create Next.js 16 Project"
echo "Acceptance Criteria Tests"
echo "=========================================="
echo ""

# AC1: Next.js 16 project created
run_test "Next.js project directory exists" "[ -d '$NEXTJS_DIR' ]"

# AC2: App Router enabled (app directory exists, no pages directory)
run_test "App Router enabled (app/ directory exists)" "[ -d '$NEXTJS_DIR/app' ]"
run_test "Pages Router not used (no pages/ directory)" "[ ! -d '$NEXTJS_DIR/pages' ]"

# AC3: TypeScript configured
run_test "TypeScript config exists (tsconfig.json)" "[ -f '$NEXTJS_DIR/tsconfig.json' ]"
run_test "TypeScript in dependencies" "grep -q 'typescript' '$NEXTJS_DIR/package.json'"

# AC4: ESLint configured
run_test "ESLint config exists" "[ -f '$NEXTJS_DIR/.eslintrc.json' ] || [ -f '$NEXTJS_DIR/eslint.config.mjs' ]"
run_test "ESLint in devDependencies" "grep -q 'eslint' '$NEXTJS_DIR/package.json'"

# AC5: Next.js 16.x version (current stable as of Dec 2025)
run_test "Next.js 16.x installed" "grep -E '\"next\".*\"\\^?16\\.' '$NEXTJS_DIR/package.json'"

# AC6: Project builds without errors
run_test "npm run build succeeds" "cd '$NEXTJS_DIR' && npm run build"

# AC7: Package.json has correct scripts
run_test "dev script exists" "grep -q '\"dev\"' '$NEXTJS_DIR/package.json'"
run_test "build script exists" "grep -q '\"build\"' '$NEXTJS_DIR/package.json'"
run_test "start script exists" "grep -q '\"start\"' '$NEXTJS_DIR/package.json'"

# AC8: Import alias configured
run_test "Import alias @/* configured" "grep -q '@/\\*' '$NEXTJS_DIR/tsconfig.json'"

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
    echo "🎉 All tests passed! Issue #9 acceptance criteria met."
    exit 0
else
    echo "⚠️  $FAIL_COUNT test(s) failed. Implementation needed."
    exit 1
fi
