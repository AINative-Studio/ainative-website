#!/bin/bash

# Test script for Issue #216 - Settings Page Migration
# This script verifies the Settings page migration from Vite SPA to Next.js

set -e

echo "===== Testing Issue #216: Settings Page Migration ====="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
test_file() {
  local file=$1
  local description=$2

  TESTS_RUN=$((TESTS_RUN + 1))

  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $description exists"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $description is missing"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Helper function to check file content
test_content() {
  local file=$1
  local pattern=$2
  local description=$3

  TESTS_RUN=$((TESTS_RUN + 1))

  if grep -q "$pattern" "$file"; then
    echo -e "${GREEN}✓${NC} $description"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Helper function to check file does NOT contain pattern
test_no_content() {
  local file=$1
  local pattern=$2
  local description=$3

  TESTS_RUN=$((TESTS_RUN + 1))

  if ! grep -q "$pattern" "$file"; then
    echo -e "${GREEN}✓${NC} $description"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $description"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

echo "1. File Structure Tests"
echo "----------------------"

# Test file existence
test_file "app/settings/page.tsx" "Server component (page.tsx)"
test_file "app/settings/SettingsClient.tsx" "Client component (SettingsClient.tsx)"
test_file "app/settings/layout.tsx" "Layout file (layout.tsx)"

echo ""
echo "2. Server Component Tests (page.tsx)"
echo "-------------------------------------"

# Test server component structure
test_content "app/settings/page.tsx" "export const metadata" "Exports metadata for SEO"
test_content "app/settings/page.tsx" "import SettingsClient" "Imports SettingsClient component"
test_no_content "app/settings/page.tsx" "'use client'" "Does NOT have 'use client' directive"
test_content "app/settings/page.tsx" "Settings | AINative Studio" "Has correct page title"

echo ""
echo "3. Client Component Tests (SettingsClient.tsx)"
echo "-----------------------------------------------"

# Test client component structure
test_content "app/settings/SettingsClient.tsx" "'use client'" "Has 'use client' directive at top"
test_content "app/settings/SettingsClient.tsx" "userSettingsService" "Imports userSettingsService"
test_content "app/settings/SettingsClient.tsx" "from '@/services/userSettingsService'" "Uses correct service import path"
test_content "app/settings/SettingsClient.tsx" "framer-motion" "Uses framer-motion for animations"
test_no_content "app/settings/SettingsClient.tsx" "react-router-dom" "Does NOT import react-router-dom"
test_no_content "app/settings/SettingsClient.tsx" "react-helmet" "Does NOT import react-helmet"

echo ""
echo "4. Layout Tests"
echo "---------------"

# Test layout file
test_content "app/settings/layout.tsx" "DashboardLayout" "Uses DashboardLayout"
test_content "app/settings/layout.tsx" "import DashboardLayout from '@/components/layout/DashboardLayout'" "Imports DashboardLayout correctly"

echo ""
echo "5. Component Implementation Tests"
echo "----------------------------------"

# Test key features
test_content "app/settings/SettingsClient.tsx" "NotificationPreference" "Has NotificationPreference interface"
test_content "app/settings/SettingsClient.tsx" "CommunicationSettings" "Has CommunicationSettings interface"
test_content "app/settings/SettingsClient.tsx" "UserProfile" "Has UserProfile interface"
test_content "app/settings/SettingsClient.tsx" "saveProfile" "Has saveProfile function"
test_content "app/settings/SettingsClient.tsx" "saveNotifications" "Has saveNotifications function"
test_content "app/settings/SettingsClient.tsx" "saveCommunication" "Has saveCommunication function"
test_content "app/settings/SettingsClient.tsx" "Danger Zone" "Has Danger Zone section"
test_content "app/settings/SettingsClient.tsx" "Delete your account" "Has delete account button"

echo ""
echo "6. UI Component Tests"
echo "---------------------"

# Test UI component usage
test_content "app/settings/SettingsClient.tsx" "@/components/ui/button" "Imports Button component"
test_content "app/settings/SettingsClient.tsx" "@/components/ui/switch" "Imports Switch component"
test_content "app/settings/SettingsClient.tsx" "@/components/ui/input" "Imports Input component"
test_content "app/settings/SettingsClient.tsx" "lucide-react" "Uses lucide-react icons"
test_content "app/settings/SettingsClient.tsx" "toast" "Uses toast notifications"

echo ""
echo "===== Test Summary ====="
echo "Tests Run:    $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
fi
