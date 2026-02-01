#!/bin/bash

# Verify layout consistency across dashboard pages
# This script checks that all dashboard-style pages have consistent sidebar implementation

echo "=== Dashboard Layout Consistency Verification ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Array of pages to check
declare -a pages=(
  "/dashboard"
  "/dashboard/main"
  "/dashboard/api-keys"
  "/dashboard/usage"
  "/dashboard/mcp-hosting"
  "/dashboard/zerodb"
  "/dashboard/api-sandbox"
  "/dashboard/load-testing"
  "/dashboard/qnn"
  "/developer-tools"
  "/developer-settings"
)

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${RED}Error: Dev server is not running on port 3000${NC}"
  echo "Please start the dev server with: npm run dev"
  exit 1
fi

echo "Checking ${#pages[@]} dashboard pages for consistent sidebar implementation..."
echo ""

pass_count=0
fail_count=0
skip_count=0

for page in "${pages[@]}"; do
  echo -n "Checking $page ... "

  # Fetch the page
  response=$(curl -s "http://localhost:3000$page")

  # Check for dashboard-layout
  if echo "$response" | grep -q "dashboard-layout"; then
    # Check for desktop-sidebar
    if echo "$response" | grep -q "desktop-sidebar"; then
      # Check for navigation role
      if echo "$response" | grep -q 'role="navigation"'; then
        echo -e "${GREEN}PASS${NC} (has layout, sidebar, and navigation)"
        ((pass_count++))
      else
        echo -e "${YELLOW}WARN${NC} (has layout and sidebar, but missing navigation role)"
        ((pass_count++))
      fi
    else
      echo -e "${RED}FAIL${NC} (has layout but missing sidebar)"
      ((fail_count++))
    fi
  else
    # Check if this is a 404 or requires auth
    if echo "$response" | grep -q "404\|not found\|login"; then
      echo -e "${YELLOW}SKIP${NC} (page not accessible - may require auth)"
      ((skip_count++))
    else
      echo -e "${RED}FAIL${NC} (missing dashboard-layout)"
      ((fail_count++))
    fi
  fi
done

echo ""
echo "=== Summary ==="
echo -e "Passed:  ${GREEN}$pass_count${NC}"
echo -e "Failed:  ${RED}$fail_count${NC}"
echo -e "Skipped: ${YELLOW}$skip_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}All accessible dashboard pages have consistent sidebar implementation!${NC}"
  exit 0
else
  echo -e "${RED}Some pages are missing proper sidebar implementation.${NC}"
  exit 1
fi
