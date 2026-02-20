#!/bin/bash
#
# Pre-Commit Import Check
#
# Git pre-commit hook that validates all imports before allowing commits.
# Prevents commits that would cause production build failures.
#
# Installation:
#   ln -s ../../scripts/pre-commit-import-check.sh .git/hooks/pre-commit
#   chmod +x scripts/pre-commit-import-check.sh
#
# Or manually copy to .git/hooks/pre-commit
#
# This hook will:
# 1. Check all staged files for new imports
# 2. Validate that imported files exist in git
# 3. Block commit if validation fails
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🔒 Pre-Commit: Validating imports...${NC}"
echo ""

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}✅ No source files staged, skipping import validation${NC}"
    exit 0
fi

echo "Checking staged files:"
echo "$STAGED_FILES" | sed 's/^/  - /'
echo ""

# Function to extract imports from file
extract_imports() {
    local file=$1

    # Extract ES6 imports and require statements
    grep -oE "import .* from ['\"]([^'\"]+)['\"]" "$file" 2>/dev/null | \
        sed -E "s/import .* from ['\"]([^'\"]+)['\"]/\1/" || true

    grep -oE "require\(['\"]([^'\"]+)['\"]\)" "$file" 2>/dev/null | \
        sed -E "s/require\(['\"]([^'\"]+)['\"]\)/\1/" || true
}

# Function to resolve import path
resolve_import() {
    local import_path=$1
    local source_file=$2

    # Skip external packages
    if [[ ! "$import_path" =~ ^[./] ]] && [[ ! "$import_path" =~ ^@/ ]]; then
        return 0
    fi

    # Resolve @/ alias
    if [[ "$import_path" =~ ^@/ ]]; then
        import_path="${import_path#@/}"
    fi

    # Resolve relative path
    if [[ "$import_path" =~ ^\./ ]]; then
        local dir=$(dirname "$source_file")
        import_path="$dir/${import_path#./}"
    fi

    # Normalize path
    import_path=$(echo "$import_path" | sed 's#/\+#/#g')

    # Try different extensions
    for ext in "" ".ts" ".tsx" ".js" ".jsx" "/index.ts" "/index.tsx" "/index.js" "/index.jsx"; do
        local full_path="${import_path}${ext}"

        # Check if file is tracked in git
        if git ls-files --error-unmatch "$full_path" >/dev/null 2>&1; then
            return 0
        fi

        # Check if file exists locally but not in git
        if [ -f "$full_path" ]; then
            echo -e "${RED}❌ Found import to uncommitted file:${NC}"
            echo -e "   File: ${YELLOW}$source_file${NC}"
            echo -e "   Import: ${YELLOW}$import_path${NC}"
            echo -e "   Resolved: ${RED}$full_path${NC}"
            echo -e "   ${YELLOW}⚠️  File exists locally but is NOT committed to git!${NC}"
            echo ""
            return 1
        fi
    done

    return 0
}

# Validate imports in staged files
VALIDATION_FAILED=0

for file in $STAGED_FILES; do
    if [ ! -f "$file" ]; then
        continue
    fi

    # Extract imports from file
    imports=$(extract_imports "$file")

    if [ -z "$imports" ]; then
        continue
    fi

    # Validate each import
    while IFS= read -r import; do
        if [ -n "$import" ]; then
            if ! resolve_import "$import" "$file"; then
                VALIDATION_FAILED=1
            fi
        fi
    done <<< "$imports"
done

# Check result
if [ $VALIDATION_FAILED -eq 1 ]; then
    echo ""
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo -e "${RED}❌ COMMIT BLOCKED: Import validation failed${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Found imports to files that exist locally but are NOT committed to git."
    echo ""
    echo "To fix:"
    echo "  1. Run 'git add <missing-file>' to stage the file"
    echo "  2. Retry your commit"
    echo ""
    echo "To skip this check (NOT recommended):"
    echo "  git commit --no-verify"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ All imports validated successfully${NC}"
echo ""
exit 0
