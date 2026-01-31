#!/bin/bash

###############################################################################
# Service Import Verification Script
# Part of issue #481: Service naming standardization
#
# This script verifies that all service imports use camelCase naming convention
# and that no PascalCase service imports remain in the codebase.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Results array
declare -a FAILURES=()

###############################################################################
# Helper Functions
###############################################################################

print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED_CHECKS++))
  ((TOTAL_CHECKS++))
}

print_failure() {
  echo -e "${RED}✗${NC} $1"
  FAILURES+=("$1")
  ((FAILED_CHECKS++))
  ((TOTAL_CHECKS++))
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

###############################################################################
# Check Functions
###############################################################################

check_pascalcase_imports() {
  print_header "Checking for PascalCase Service Imports"

  # Search for PascalCase service imports in app, components, hooks, lib
  DIRS_TO_CHECK=("app" "components" "hooks" "lib" "mocks")
  FOUND_IMPORTS=()

  for dir in "${DIRS_TO_CHECK[@]}"; do
    if [ -d "$dir" ]; then
      # Search for patterns like: from '@/services/AuthService'
      while IFS= read -r line; do
        FOUND_IMPORTS+=("$line")
      done < <(grep -rn "from '@/services/[A-Z][a-zA-Z]*Service'" "$dir" 2>/dev/null || true)
    fi
  done

  if [ ${#FOUND_IMPORTS[@]} -eq 0 ]; then
    print_success "No PascalCase service imports found"
  else
    print_failure "Found ${#FOUND_IMPORTS[@]} PascalCase service imports"
    echo ""
    print_info "PascalCase imports that need updating:"
    for import in "${FOUND_IMPORTS[@]}"; do
      echo "  $import"
    done
    echo ""
    return 1
  fi
}

check_service_file_naming() {
  print_header "Checking Service File Naming Convention"

  # Find all PascalCase service files
  PASCALCASE_FILES=()

  while IFS= read -r file; do
    basename=$(basename "$file" .ts)
    # Check if it starts with uppercase and ends with Service
    if [[ "$basename" =~ ^[A-Z].*Service$ ]]; then
      PASCALCASE_FILES+=("$file")
    fi
  done < <(find services -maxdepth 1 -name "*Service.ts" -not -path "*/\__tests__/*" 2>/dev/null || true)

  if [ ${#PASCALCASE_FILES[@]} -eq 0 ]; then
    print_success "All service files use camelCase naming"
  else
    print_warning "Found ${#PASCALCASE_FILES[@]} PascalCase service files (will be migrated)"
    echo ""
    print_info "PascalCase files:"
    for file in "${PASCALCASE_FILES[@]}"; do
      echo "  $file"
    done
    echo ""
    # This is a warning, not a failure, as migration is in progress
  fi
}

check_service_imports_exist() {
  print_header "Checking Service Import Resolution"

  # Standard services that should exist
  STANDARD_SERVICES=(
    "apiKeyService"
    "billingService"
    "creditService"
    "pricingService"
    "subscriptionService"
    "usageService"
    "userSettingsService"
  )

  MISSING_SERVICES=()

  for service in "${STANDARD_SERVICES[@]}"; do
    if [ ! -f "services/${service}.ts" ]; then
      MISSING_SERVICES+=("$service")
    fi
  done

  if [ ${#MISSING_SERVICES[@]} -eq 0 ]; then
    print_success "All standard service files exist"
  else
    print_failure "Missing ${#MISSING_SERVICES[@]} standard service files"
    echo ""
    print_info "Missing services:"
    for service in "${MISSING_SERVICES[@]}"; do
      echo "  services/${service}.ts"
    done
    echo ""
    return 1
  fi
}

check_duplicate_services() {
  print_header "Checking for Duplicate Service Names"

  # Find potential duplicates (case-insensitive)
  DUPLICATES=()

  declare -A seen_services

  while IFS= read -r file; do
    basename=$(basename "$file" .ts)
    lowercase=$(echo "$basename" | tr '[:upper:]' '[:lower:]')

    if [ -n "${seen_services[$lowercase]}" ]; then
      DUPLICATES+=("Duplicate: ${seen_services[$lowercase]} vs $basename")
    else
      seen_services[$lowercase]="$basename"
    fi
  done < <(find services -maxdepth 1 -name "*.ts" -not -path "*/\__tests__/*" -not -name "*.d.ts" 2>/dev/null || true)

  if [ ${#DUPLICATES[@]} -eq 0 ]; then
    print_success "No duplicate service names found"
  else
    print_failure "Found ${#DUPLICATES[@]} potential duplicate services"
    echo ""
    print_info "Duplicates:"
    for dup in "${DUPLICATES[@]}"; do
      echo "  $dup"
    done
    echo ""
    return 1
  fi
}

check_test_imports() {
  print_header "Checking Test File Imports"

  # Check that test files use correct imports
  INCORRECT_TEST_IMPORTS=()

  while IFS= read -r line; do
    INCORRECT_TEST_IMPORTS+=("$line")
  done < <(grep -rn "from '\.\.\/[A-Z][a-zA-Z]*Service'" services/__tests__ 2>/dev/null || true)

  if [ ${#INCORRECT_TEST_IMPORTS[@]} -eq 0 ]; then
    print_success "All test imports use correct casing"
  else
    print_failure "Found ${#INCORRECT_TEST_IMPORTS[@]} incorrect test imports"
    echo ""
    print_info "Incorrect test imports:"
    for import in "${INCORRECT_TEST_IMPORTS[@]}"; do
      echo "  $import"
    done
    echo ""
    return 1
  fi
}

generate_report() {
  print_header "Service Import Verification Report"

  echo "Total Checks: $TOTAL_CHECKS"
  echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
  echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
  echo ""

  if [ $FAILED_CHECKS -eq 0 ]; then
    print_success "All service import checks passed!"
    echo ""
    echo -e "${GREEN}✓ Service naming standardization is complete${NC}"
    return 0
  else
    print_failure "Some checks failed"
    echo ""
    echo -e "${RED}Failures:${NC}"
    for failure in "${FAILURES[@]}"; do
      echo -e "  ${RED}✗${NC} $failure"
    done
    echo ""
    echo -e "${YELLOW}Please fix the issues above before proceeding${NC}"
    return 1
  fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
  print_header "Service Import Verification Script"
  print_info "Checking for PascalCase service imports..."
  echo ""

  # Run all checks
  check_pascalcase_imports || true
  check_service_file_naming || true
  check_service_imports_exist || true
  check_duplicate_services || true
  check_test_imports || true

  # Generate final report
  generate_report
}

# Run main function
main

# Exit with appropriate code
if [ $FAILED_CHECKS -eq 0 ]; then
  exit 0
else
  exit 1
fi
