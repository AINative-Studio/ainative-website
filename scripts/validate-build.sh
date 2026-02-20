#!/bin/bash

# Build Validation Script
# Runs comprehensive checks before git push to prevent build failures
# MUST pass before any code is pushed to remote

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Next.js Build Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to log check results
log_check() {
    local status=$1
    local message=$2
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    if [ "$status" = "pass" ]; then
        echo -e "${GREEN}✓${NC} $message"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    elif [ "$status" = "fail" ]; then
        echo -e "${RED}✗${NC} $message"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    elif [ "$status" = "warn" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
    else
        echo -e "${BLUE}ℹ${NC} $message"
    fi
}

# Function to check if file exists
check_file_exists() {
    local file=$1
    if [ -f "$file" ]; then
        return 0
    else
        return 1
    fi
}

# 1. Check Node.js and npm versions
echo -e "${YELLOW}[1/8] Checking Node.js and npm versions...${NC}"
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
log_check "info" "Node.js version: $NODE_VERSION"
log_check "info" "npm version: $NPM_VERSION"

# Check minimum Node.js version (v18+)
NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -ge 18 ]; then
    log_check "pass" "Node.js version meets minimum requirement (v18+)"
else
    log_check "fail" "Node.js version must be v18 or higher (current: $NODE_VERSION)"
fi
echo ""

# 2. Validate all dependencies are installed
echo -e "${YELLOW}[2/8] Validating dependencies...${NC}"
cd "$PROJECT_ROOT"

if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    log_check "pass" "node_modules directory exists"

    # Check if package-lock.json is in sync
    npm ls --depth=0 > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        log_check "pass" "Dependencies are in sync with package-lock.json"
    else
        log_check "fail" "Dependencies are out of sync. Run 'npm install'"
    fi
else
    log_check "fail" "node_modules or package-lock.json missing. Run 'npm install'"
fi
echo ""

# 3. Validate all imports resolve correctly
echo -e "${YELLOW}[3/8] Validating import statements...${NC}"

# Run the import validation script
if node "$SCRIPT_DIR/validate-imports.js"; then
    log_check "pass" "All imports resolve correctly"
else
    log_check "fail" "Some imports cannot be resolved"
fi
echo ""

# 4. TypeScript type checking
echo -e "${YELLOW}[4/8] Running TypeScript type checking...${NC}"

# Check if tsconfig.json exists
if check_file_exists "$PROJECT_ROOT/tsconfig.json"; then
    log_check "pass" "tsconfig.json found"

    # Run tsc with --noEmit to check types without building
    if npx tsc --noEmit; then
        log_check "pass" "TypeScript type checking passed"
    else
        log_check "warn" "TypeScript type checking has warnings (non-blocking due to ignoreBuildErrors)"
    fi
else
    log_check "fail" "tsconfig.json not found"
fi
echo ""

# 5. ESLint validation
echo -e "${YELLOW}[5/8] Running ESLint...${NC}"

if npm run lint > /dev/null 2>&1; then
    log_check "pass" "ESLint validation passed"
else
    log_check "warn" "ESLint has warnings/errors (non-blocking)"
fi
echo ""

# 6. Check for uncommitted files that are imported
echo -e "${YELLOW}[6/8] Checking for uncommitted imported files...${NC}"

# Get list of all uncommitted files
UNSTAGED_FILES=$(git ls-files --others --exclude-standard 2>/dev/null || true)
MODIFIED_FILES=$(git diff --name-only 2>/dev/null || true)
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || true)

ALL_UNCOMMITTED="$UNSTAGED_FILES"$'\n'"$MODIFIED_FILES"$'\n'"$STAGED_FILES"

if [ -z "$ALL_UNCOMMITTED" ]; then
    log_check "pass" "No uncommitted files"
else
    # Check if any uncommitted files are imported
    UNCOMMITTED_IMPORTED=false

    while IFS= read -r file; do
        if [ -n "$file" ] && [[ "$file" == src/* ]]; then
            # Check if this file is imported anywhere
            filename=$(basename "$file" | sed 's/\.[^.]*$//')
            if grep -r "from.*['\"].*/$filename['\"]" "$PROJECT_ROOT/src" > /dev/null 2>&1; then
                log_check "fail" "Uncommitted file is imported: $file"
                UNCOMMITTED_IMPORTED=true
            fi
        fi
    done <<< "$ALL_UNCOMMITTED"

    if [ "$UNCOMMITTED_IMPORTED" = false ]; then
        log_check "pass" "No uncommitted imported files found"
    fi
fi
echo ""

# 7. Dry-run Next.js build
echo -e "${YELLOW}[7/8] Running Next.js build validation...${NC}"

# Create a temporary directory for build output
BUILD_DIR="$PROJECT_ROOT/.next-validate"
rm -rf "$BUILD_DIR"

# Run Next.js build
export NEXT_BUILD_DIR="$BUILD_DIR"

if npm run build 2>&1 | tee /tmp/nextjs-build.log; then
    log_check "pass" "Next.js build completed successfully"

    # Check for specific warning patterns
    if grep -q "Module not found" /tmp/nextjs-build.log; then
        log_check "fail" "Build contains 'Module not found' errors"
        grep "Module not found" /tmp/nextjs-build.log | head -5
    else
        log_check "pass" "No 'Module not found' errors detected"
    fi

    # Clean up build directory
    rm -rf "$BUILD_DIR"
else
    log_check "fail" "Next.js build failed"
    echo -e "${RED}Build output:${NC}"
    tail -50 /tmp/nextjs-build.log
fi
echo ""

# 8. Check git tracked files
echo -e "${YELLOW}[8/8] Verifying git tracked files...${NC}"

# Check if all source files are tracked
UNTRACKED_SRC_FILES=$(git ls-files --others --exclude-standard src/ 2>/dev/null | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$UNTRACKED_SRC_FILES" ]; then
    log_check "pass" "All source files are tracked by git"
else
    log_check "fail" "Untracked source files detected:"
    echo "$UNTRACKED_SRC_FILES"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Validation Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}❌ Build validation FAILED${NC}"
    echo -e "${RED}Please fix the issues above before pushing${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Build validation PASSED${NC}"
    echo -e "${GREEN}Safe to push to remote${NC}"
    exit 0
fi
