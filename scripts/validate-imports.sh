#!/bin/bash
#
# Import Validation Script
#
# Validates that all imported files exist in git before committing.
# This prevents production build failures caused by missing files.
#
# Background:
# Files lib/utils/thumbnail-generator.ts and lib/utils/slug-generator.ts
# existed locally but weren't committed to git, causing production failures.
#
# Usage:
#   ./scripts/validate-imports.sh
#
# Exit Codes:
#   0 - All imports valid
#   1 - Found uncommitted imports
#   2 - Git repository not found
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🔍 Validating imports..."
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    exit 2
fi

# Run the import validation test
echo "Running import validation test suite..."
echo ""

if npm test -- test/import-validation.test.ts --passWithNoTests 2>&1 | tee /tmp/import-validation.log; then
    echo ""
    echo -e "${GREEN}✅ All imports are valid and committed to git${NC}"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Import validation failed!${NC}"
    echo ""
    echo "Please review the errors above and ensure all imported files are committed to git."
    echo ""
    echo "Common fixes:"
    echo "  1. Run 'git add <missing-file>' to stage the file"
    echo "  2. Run 'git commit' to commit the file"
    echo "  3. Re-run this script to validate"
    echo ""
    exit 1
fi
