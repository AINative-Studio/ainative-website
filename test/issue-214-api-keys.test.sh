#!/bin/bash

# Test script for Issue #214: API Keys Page Migration
# Verifies the migration from Vite SPA to Next.js App Router

set -e

echo "Testing Issue #214: API Keys Page Migration"
echo "=========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to check if file exists
check_file_exists() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Helper function to check file content
check_file_contains() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} $1 contains: $2"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing: $2"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Helper function to check file does NOT contain
check_file_not_contains() {
    if ! grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} $1 correctly excludes: $2"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 should not contain: $2"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo ""
echo "1. Checking file structure..."
echo "------------------------------"

check_file_exists "app/dashboard/api-keys/page.tsx"
check_file_exists "app/dashboard/api-keys/ApiKeysClient.tsx"

echo ""
echo "2. Checking server component (page.tsx)..."
echo "-------------------------------------------"

PAGE_FILE="app/dashboard/api-keys/page.tsx"
check_file_contains "$PAGE_FILE" "Metadata"
check_file_contains "$PAGE_FILE" "export const metadata"
check_file_contains "$PAGE_FILE" "ApiKeysClient"
check_file_not_contains "$PAGE_FILE" "'use client'"

echo ""
echo "3. Checking client component (ApiKeysClient.tsx)..."
echo "---------------------------------------------------"

CLIENT_FILE="app/dashboard/api-keys/ApiKeysClient.tsx"
check_file_contains "$CLIENT_FILE" "'use client'"
check_file_contains "$CLIENT_FILE" "apiKeyService"
check_file_contains "$CLIENT_FILE" "@/services/apiKeyService"

echo ""
echo "4. Checking for forbidden imports..."
echo "------------------------------------"

check_file_not_contains "$CLIENT_FILE" "react-router-dom"
check_file_not_contains "$CLIENT_FILE" "react-helmet-async"
check_file_not_contains "$CLIENT_FILE" "from 'react-router-dom'"

echo ""
echo "5. Checking API key functionality..."
echo "------------------------------------"

check_file_contains "$CLIENT_FILE" "listApiKeys"
check_file_contains "$CLIENT_FILE" "createApiKey"
check_file_contains "$CLIENT_FILE" "regenerateApiKey"
check_file_contains "$CLIENT_FILE" "deleteApiKey"
check_file_contains "$CLIENT_FILE" "copyToClipboard"

echo ""
echo "6. Checking UI components..."
echo "----------------------------"

check_file_contains "$CLIENT_FILE" "Card"
check_file_contains "$CLIENT_FILE" "Button"
check_file_contains "$CLIENT_FILE" "Input"
check_file_contains "$CLIENT_FILE" "Alert"
check_file_contains "$CLIENT_FILE" "Dialog"

echo ""
echo "7. Checking masked key display..."
echo "---------------------------------"

check_file_contains "$CLIENT_FILE" "substring(0, 8)"
check_file_contains "$CLIENT_FILE" "••••••••••••"

echo ""
echo "8. Checking security best practices section..."
echo "----------------------------------------------"

check_file_contains "$CLIENT_FILE" "API Key Security"
check_file_contains "$CLIENT_FILE" "Never share your API keys"
check_file_contains "$CLIENT_FILE" "environment variables"

echo ""
echo "=========================================="
echo "Test Results:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "=========================================="

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
