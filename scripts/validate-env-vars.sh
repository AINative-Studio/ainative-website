#!/bin/bash

# Environment Variable Validation Script
# Ensures all required env vars are present before deployment
# Refs: Production NextAuth Outage (Feb 8, 2026)

set -e

echo "🔍 Validating environment variables..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Define critical environment variables
CRITICAL_VARS=(
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "DATABASE_URL"
)

# Define required environment variables
REQUIRED_VARS=(
  "NEXT_PUBLIC_API_URL"
  "GITHUB_CLIENT_ID"
  "GITHUB_CLIENT_SECRET"
)

# Function to check if variable is set
check_var() {
  local var_name=$1
  local is_critical=$2

  if [ -z "${!var_name}" ]; then
    if [ "$is_critical" = "true" ]; then
      echo -e "${RED}✗ CRITICAL: $var_name is not set${NC}"
      return 1
    else
      echo -e "${YELLOW}⚠ WARNING: $var_name is not set${NC}"
      return 2
    fi
  else
    echo -e "${GREEN}✓ $var_name is set${NC}"
    return 0
  fi
}

# Check if we're in production
IS_PRODUCTION=false
if [ "$NODE_ENV" = "production" ] || [ "$RAILWAY_ENVIRONMENT" = "production" ]; then
  IS_PRODUCTION=true
  echo "Environment: PRODUCTION"
else
  echo "Environment: DEVELOPMENT/STAGING"
fi

# Validation counters
CRITICAL_MISSING=0
REQUIRED_MISSING=0

# Check critical variables
echo -e "\n${YELLOW}Checking critical variables...${NC}"
for var in "${CRITICAL_VARS[@]}"; do
  if ! check_var "$var" "true"; then
    CRITICAL_MISSING=$((CRITICAL_MISSING + 1))
  fi
done

# Check required variables
echo -e "\n${YELLOW}Checking required variables...${NC}"
for var in "${REQUIRED_VARS[@]}"; do
  if ! check_var "$var" "false"; then
    REQUIRED_MISSING=$((REQUIRED_MISSING + 1))
  fi
done

# Extract variables from codebase and compare
echo -e "\n${YELLOW}Scanning codebase for process.env usage...${NC}"
CODE_VARS=$(grep -rh "process\.env\." app/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | \
  sed 's/.*process\.env\.\([A-Z_][A-Z0-9_]*\).*/\1/' | \
  sort -u)

UNDOCUMENTED=0
for var in $CODE_VARS; do
  # Check if variable is in .env.example
  if [ -f ".env.example" ]; then
    if ! grep -q "^${var}=" .env.example; then
      echo -e "${YELLOW}⚠ $var used in code but not in .env.example${NC}"
      UNDOCUMENTED=$((UNDOCUMENTED + 1))
    fi
  fi
done

# Final summary
echo -e "\n${YELLOW}=== VALIDATION SUMMARY ===${NC}"
echo "Critical variables missing: $CRITICAL_MISSING"
echo "Required variables missing: $REQUIRED_MISSING"
echo "Undocumented variables: $UNDOCUMENTED"

# Exit codes
if [ $CRITICAL_MISSING -gt 0 ]; then
  echo -e "\n${RED}❌ VALIDATION FAILED: Critical environment variables are missing${NC}"
  echo "Set the missing variables before deploying to production."
  exit 1
elif [ "$IS_PRODUCTION" = "true" ] && [ $REQUIRED_MISSING -gt 0 ]; then
  echo -e "\n${RED}❌ VALIDATION FAILED: Required variables missing in production${NC}"
  exit 1
elif [ $UNDOCUMENTED -gt 0 ]; then
  echo -e "\n${YELLOW}⚠ WARNING: Some variables are undocumented${NC}"
  echo "Update .env.example to document all environment variables."
  exit 0
else
  echo -e "\n${GREEN}✅ VALIDATION PASSED: All environment variables are properly configured${NC}"
  exit 0
fi
