#!/bin/bash
###############################################################################
# Analytics Verification Script for Issue #330
#
# This script verifies all analytics tracking services are properly configured:
# - Google Tag Manager (GTM)
# - Google Analytics 4 (GA4)
# - Chatwoot Live Chat
# - Sentry Error Tracking
# - Vercel Speed Insights
#
# Usage: ./scripts/verify-analytics.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
BASE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
VERIFICATION_URL="$BASE_URL/admin/analytics-verify"

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo ""
echo "================================================================================"
echo -e "${BOLD}Analytics Verification Script for Issue #330${NC}"
echo -e "${CYAN}AINative Studio - Next.js Platform${NC}"
echo "================================================================================"
echo ""

# Function to print test result
print_result() {
    local status=$1
    local service=$2
    local message=$3

    if [ "$status" == "PASS" ]; then
        echo -e "${GREEN}✓${NC} $service: $message"
        ((PASSED++))
    elif [ "$status" == "FAIL" ]; then
        echo -e "${RED}✗${NC} $service: $message"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠${NC} $service: $message"
        ((WARNINGS++))
    fi
}

# Check environment variables
echo "================================================================================"
echo -e "${BOLD}Environment Variables Check${NC}"
echo "================================================================================"
echo ""

if [ -f .env.local ]; then
    print_result "PASS" ".env.local" "File exists"
    source .env.local
else
    print_result "WARN" ".env.local" "File not found (using defaults from .env.example)"
fi

# Check GTM ID
GTM_ID="${NEXT_PUBLIC_GTM_ID:-GTM-MJKQDBGV}"
if [ -n "$NEXT_PUBLIC_GTM_ID" ]; then
    print_result "PASS" "NEXT_PUBLIC_GTM_ID" "Configured: $GTM_ID"
else
    print_result "PASS" "NEXT_PUBLIC_GTM_ID" "Using default: $GTM_ID"
fi

# Check GA4 ID
GA_ID="${NEXT_PUBLIC_GA_ID:-G-ML0XEBPZV2}"
if [ -n "$NEXT_PUBLIC_GA_ID" ]; then
    print_result "PASS" "NEXT_PUBLIC_GA_ID" "Configured: $GA_ID"
else
    print_result "PASS" "NEXT_PUBLIC_GA_ID" "Using default: $GA_ID"
fi

# Check Chatwoot Token
CHATWOOT_TOKEN="${NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN:-XfqwZwqj9pcjyrFe4gsPRCff}"
if [ -n "$NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN" ]; then
    print_result "PASS" "NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN" "Configured: ${CHATWOOT_TOKEN:0:20}..."
else
    print_result "PASS" "NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN" "Using default: ${CHATWOOT_TOKEN:0:20}..."
fi

# Check Chatwoot Base URL
CHATWOOT_URL="${NEXT_PUBLIC_CHATWOOT_BASE_URL:-https://chat.ainative.studio}"
if [ -n "$NEXT_PUBLIC_CHATWOOT_BASE_URL" ]; then
    print_result "PASS" "NEXT_PUBLIC_CHATWOOT_BASE_URL" "Configured: $CHATWOOT_URL"
else
    print_result "PASS" "NEXT_PUBLIC_CHATWOOT_BASE_URL" "Using default: $CHATWOOT_URL"
fi

# Check Sentry DSN (optional)
if [ -n "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    print_result "PASS" "NEXT_PUBLIC_SENTRY_DSN" "Configured"
else
    print_result "WARN" "NEXT_PUBLIC_SENTRY_DSN" "Not configured (optional)"
fi

echo ""

# Check if development server is running
echo "================================================================================"
echo -e "${BOLD}Development Server Check${NC}"
echo "================================================================================"
echo ""

if curl -s --head --max-time 5 "$BASE_URL" > /dev/null 2>&1; then
    print_result "PASS" "Development Server" "Server is running at $BASE_URL"
else
    print_result "FAIL" "Development Server" "Server not reachable at $BASE_URL"
    echo ""
    echo -e "${YELLOW}Please start the development server:${NC}"
    echo -e "${CYAN}  npm run dev${NC}"
    echo ""
    exit 1
fi

echo ""

# Check verification dashboard
echo "================================================================================"
echo -e "${BOLD}Verification Dashboard Check${NC}"
echo "================================================================================"
echo ""

DASHBOARD_RESPONSE=$(curl -s --max-time 10 -w "\n%{http_code}" "$VERIFICATION_URL")
HTTP_CODE=$(echo "$DASHBOARD_RESPONSE" | tail -n1)
DASHBOARD_HTML=$(echo "$DASHBOARD_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
    if echo "$DASHBOARD_HTML" | grep -q "Analytics Verification Dashboard"; then
        print_result "PASS" "Verification Dashboard" "Dashboard is accessible at $VERIFICATION_URL"
    else
        print_result "WARN" "Verification Dashboard" "Dashboard accessible but may be missing content"
    fi
else
    print_result "FAIL" "Verification Dashboard" "Dashboard returned status $HTTP_CODE"
fi

echo ""

# Check analytics scripts in HTML
echo "================================================================================"
echo -e "${BOLD}Analytics Scripts Check${NC}"
echo "================================================================================"
echo ""

HTML_RESPONSE=$(curl -s --max-time 10 "$BASE_URL")

# Check GTM script
if echo "$HTML_RESPONSE" | grep -q "googletagmanager.com/gtm.js"; then
    print_result "PASS" "GTM Script" "GTM script tag found in HTML"
else
    print_result "FAIL" "GTM Script" "GTM script tag not found in HTML"
fi

# Check GA4 script
if echo "$HTML_RESPONSE" | grep -q "googletagmanager.com/gtag/js"; then
    print_result "PASS" "GA4 Script" "GA4 script tag found in HTML"
else
    print_result "FAIL" "GA4 Script" "GA4 script tag not found in HTML"
fi

# Check Chatwoot script
if echo "$HTML_RESPONSE" | grep -q "chatwoot\|chat.ainative.studio"; then
    print_result "PASS" "Chatwoot Script" "Chatwoot script tag found in HTML"
else
    print_result "FAIL" "Chatwoot Script" "Chatwoot script tag not found in HTML"
fi

# Check Speed Insights (embedded in Next.js bundles)
if [ -d "node_modules/@vercel/speed-insights" ]; then
    print_result "PASS" "Speed Insights Package" "Package is installed"
else
    print_result "FAIL" "Speed Insights Package" "Package not found in node_modules"
fi

# Check Sentry (may not be in HTML if DSN not configured)
if [ -n "$NEXT_PUBLIC_SENTRY_DSN" ]; then
    if [ -d "node_modules/@sentry/nextjs" ]; then
        print_result "PASS" "Sentry Package" "Package is installed and DSN configured"
    else
        print_result "FAIL" "Sentry Package" "DSN configured but package not installed"
    fi
else
    print_result "WARN" "Sentry" "DSN not configured (optional)"
fi

echo ""

# Generate final report
echo "================================================================================"
echo -e "${BOLD}Analytics Verification Report${NC}"
echo "================================================================================"
echo ""

TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${CYAN}Total Checks: $TOTAL${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
else
    echo -e "${CYAN}Failed: $FAILED${NC}"
fi
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
else
    echo -e "${CYAN}Warnings: $WARNINGS${NC}"
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All analytics services are properly configured!${NC}"
else
    echo -e "${RED}✗ $FAILED check(s) failed. Please review the errors above.${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found. Optional services may not be configured.${NC}"
fi

echo ""
echo "================================================================================"
echo ""

# Next steps
echo -e "${BOLD}Next Steps:${NC}"
echo -e "${CYAN}1. Visit the verification dashboard:${NC}"
echo -e "   ${BLUE}$VERIFICATION_URL${NC}"
echo -e "${CYAN}2. Use the test buttons to verify each service${NC}"
echo -e "${CYAN}3. Check browser console for analytics events${NC}"
echo -e "${CYAN}4. Verify in respective service dashboards (GTM, GA4, etc.)${NC}"
echo ""

# Exit with error code if any checks failed
if [ $FAILED -gt 0 ]; then
    exit 1
fi

exit 0
