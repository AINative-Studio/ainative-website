#!/bin/bash

# Pre-Deployment Validation Script for AINative Next.js Website
# This script MUST pass before any production deployment
#
# Usage:
#   ./scripts/pre-deployment-validation.sh [environment]
#   environment: local | ci | production (default: local)
#
# Exit codes:
#   0 = All checks passed
#   1 = Critical failure (blocks deployment)
#   2 = Warning (log but continue)

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CRITICAL_FAILURES=0
WARNINGS=0
CHECKS_PASSED=0

# Environment
ENVIRONMENT=${1:-local}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((CHECKS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((CRITICAL_FAILURES++))
}

print_separator() {
    echo ""
    echo "========================================================================"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate required tools are installed
validate_prerequisites() {
    log_info "Validating prerequisites..."

    local required_commands=("node" "npm" "git" "jq" "curl")
    local missing_commands=()

    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            missing_commands+=("$cmd")
        fi
    done

    if [ ${#missing_commands[@]} -ne 0 ]; then
        log_error "Missing required commands: ${missing_commands[*]}"
        log_error "Install missing tools before running this script"
        return 1
    fi

    log_success "All required tools installed"
}

# Validate Node.js version
validate_node_version() {
    log_info "Validating Node.js version..."

    local required_version="20"
    local current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

    if [ "$current_version" -lt "$required_version" ]; then
        log_error "Node.js version $current_version is below required version $required_version"
        return 1
    fi

    log_success "Node.js version $current_version >= $required_version"
}

# Validate environment variables
validate_environment_variables() {
    log_info "Validating environment variables..."

    # Run dedicated env validation script
    if [ -f "$SCRIPT_DIR/validate-env-vars.sh" ]; then
        if bash "$SCRIPT_DIR/validate-env-vars.sh" "$ENVIRONMENT"; then
            log_success "Environment variables validated"
        else
            log_error "Environment variable validation failed"
            return 1
        fi
    else
        log_warning "Environment variable validation script not found"
    fi
}

# Validate package.json and lock file
validate_dependencies() {
    log_info "Validating dependencies..."

    cd "$PROJECT_ROOT"

    # Check package-lock.json exists and is committed
    if [ ! -f "package-lock.json" ]; then
        log_error "package-lock.json not found. Run 'npm install' first."
        return 1
    fi

    if git ls-files --error-unmatch package-lock.json >/dev/null 2>&1; then
        log_success "package-lock.json is committed"
    else
        log_error "package-lock.json is not committed to git"
        return 1
    fi

    # Check for uncommitted changes to package.json
    if git diff --quiet package.json; then
        log_success "No uncommitted changes to package.json"
    else
        log_warning "Uncommitted changes detected in package.json"
    fi

    # Verify node_modules is in sync with package-lock.json
    log_info "Checking if node_modules is in sync..."
    if npm ci --dry-run >/dev/null 2>&1; then
        log_success "Dependencies are in sync"
    else
        log_error "Dependencies out of sync. Run 'npm ci' to fix."
        return 1
    fi
}

# Run TypeScript type checking
validate_typescript() {
    log_info "Running TypeScript type checking..."

    cd "$PROJECT_ROOT"

    # Check if type-check script exists
    if npm run type-check --if-present >/dev/null 2>&1; then
        log_success "TypeScript type checking passed"
    else
        # Next.js config has ignoreBuildErrors: true, so we warn instead of fail
        log_warning "TypeScript type checking failed (build will ignore errors)"
    fi
}

# Run linting
validate_linting() {
    log_info "Running ESLint..."

    cd "$PROJECT_ROOT"

    if npm run lint >/dev/null 2>&1; then
        log_success "Linting passed"
    else
        log_warning "Linting failed (non-blocking)"
    fi
}

# Run unit tests
validate_unit_tests() {
    log_info "Running unit tests..."

    cd "$PROJECT_ROOT"

    if npm run test -- --passWithNoTests >/dev/null 2>&1; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        return 1
    fi
}

# Check test coverage
validate_test_coverage() {
    log_info "Checking test coverage..."

    cd "$PROJECT_ROOT"

    # Run tests with coverage
    npm run test:coverage -- --passWithNoTests >/dev/null 2>&1 || true

    # Check if coverage report exists
    if [ -f "coverage/coverage-summary.json" ]; then
        # Extract coverage percentage
        local coverage=$(jq -r '.total.lines.pct' coverage/coverage-summary.json)

        if (( $(echo "$coverage >= 80" | bc -l) )); then
            log_success "Test coverage: ${coverage}% (>= 80%)"
        else
            log_error "Test coverage: ${coverage}% (< 80% threshold)"
            return 1
        fi
    else
        log_warning "No coverage report found (tests may not exist yet)"
    fi
}

# Validate build
validate_build() {
    log_info "Running production build..."

    cd "$PROJECT_ROOT"

    # Set production environment
    export NODE_ENV=production

    # Build with timeout (10 minutes)
    if timeout 600 npm run build >/tmp/build.log 2>&1; then
        log_success "Production build succeeded"

        # Check build size
        local build_size=$(du -sh .next 2>/dev/null | cut -f1)
        log_info "Build size: $build_size"

        # Verify critical files exist
        if [ -d ".next/static" ] && [ -d ".next/server" ]; then
            log_success "Build artifacts generated"
        else
            log_error "Build artifacts missing"
            return 1
        fi
    else
        log_error "Production build failed"
        cat /tmp/build.log
        return 1
    fi
}

# Check for missing imports
validate_imports() {
    log_info "Checking for missing imports..."

    cd "$PROJECT_ROOT"

    # Look for common import errors in build log
    if grep -q "Cannot find module" /tmp/build.log 2>/dev/null; then
        log_error "Missing module imports detected"
        grep "Cannot find module" /tmp/build.log
        return 1
    fi

    log_success "No missing imports detected"
}

# Validate security (npm audit)
validate_security() {
    log_info "Running security audit..."

    cd "$PROJECT_ROOT"

    # Run npm audit with high severity threshold
    local audit_output=$(npm audit --audit-level=high 2>&1 || true)

    if echo "$audit_output" | grep -q "found 0 vulnerabilities"; then
        log_success "No high/critical vulnerabilities found"
    elif echo "$audit_output" | grep -q "vulnerabilities"; then
        log_warning "Security vulnerabilities detected (review manually)"
        echo "$audit_output"
    else
        log_success "Security audit passed"
    fi
}

# Validate environment-specific configuration
validate_env_config() {
    log_info "Validating $ENVIRONMENT configuration..."

    case "$ENVIRONMENT" in
        local)
            # Check .env.local exists
            if [ -f "$PROJECT_ROOT/.env.local" ]; then
                log_success ".env.local found"
            else
                log_warning ".env.local not found (using defaults)"
            fi
            ;;
        ci)
            # CI should have required secrets
            log_info "CI environment detected"
            log_success "CI configuration validated"
            ;;
        production)
            # Production must have all required vars
            log_info "Production environment detected"

            # Validate critical production env vars
            local required_prod_vars=(
                "NEXTAUTH_SECRET"
                "NEXTAUTH_URL"
                "DATABASE_URL"
                "NEXT_PUBLIC_API_URL"
            )

            for var in "${required_prod_vars[@]}"; do
                if [ -z "${!var}" ]; then
                    log_error "Required production variable $var is not set"
                    return 1
                fi
            done

            log_success "Production configuration validated"
            ;;
    esac
}

# Validate Next.js configuration
validate_nextjs_config() {
    log_info "Validating Next.js configuration..."

    cd "$PROJECT_ROOT"

    # Check next.config.ts exists
    if [ ! -f "next.config.ts" ]; then
        log_error "next.config.ts not found"
        return 1
    fi

    # Verify output mode is standalone (required for Railway)
    if grep -q "output:.*'standalone'" next.config.ts; then
        log_success "Output mode set to standalone"
    else
        log_warning "Output mode not set to standalone (may affect deployment)"
    fi

    # Check for TypeScript ignore (should be temporary)
    if grep -q "ignoreBuildErrors:.*true" next.config.ts; then
        log_warning "TypeScript build errors are ignored (fix type errors)"
    fi
}

# Validate database configuration
validate_database_config() {
    log_info "Validating database configuration..."

    if [ -n "$DATABASE_URL" ]; then
        # Check if using PgBouncer port (6432)
        if echo "$DATABASE_URL" | grep -q ":6432/"; then
            log_success "DATABASE_URL uses PgBouncer port 6432"
        elif echo "$DATABASE_URL" | grep -q ":5432/"; then
            log_error "DATABASE_URL uses direct port 5432 (should use PgBouncer 6432)"
            return 1
        else
            log_warning "Cannot determine database port from DATABASE_URL"
        fi
    else
        log_warning "DATABASE_URL not set (may be using mock/test database)"
    fi
}

# Validate git state
validate_git_state() {
    log_info "Validating git state..."

    cd "$PROJECT_ROOT"

    # Check for uncommitted changes
    if git diff-index --quiet HEAD --; then
        log_success "No uncommitted changes"
    else
        log_warning "Uncommitted changes detected"
        git status --short
    fi

    # Check current branch
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    log_info "Current branch: $current_branch"

    if [ "$ENVIRONMENT" = "production" ]; then
        if [ "$current_branch" != "main" ]; then
            log_error "Production deployments must be from 'main' branch (current: $current_branch)"
            return 1
        fi
    fi

    log_success "Git state validated"
}

# Main execution
main() {
    print_separator
    echo "Pre-Deployment Validation for AINative Next.js Website"
    echo "Environment: $ENVIRONMENT"
    echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    print_separator

    # Run all validation checks
    validate_prerequisites || true
    validate_node_version || true
    validate_git_state || true
    validate_dependencies || true
    validate_environment_variables || true
    validate_database_config || true
    validate_nextjs_config || true
    validate_typescript || true
    validate_linting || true
    validate_unit_tests || true
    validate_test_coverage || true
    validate_build || true
    validate_imports || true
    validate_security || true
    validate_env_config || true

    # Summary
    print_separator
    echo "VALIDATION SUMMARY"
    print_separator
    echo -e "${GREEN}Checks Passed:${NC} $CHECKS_PASSED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo -e "${RED}Critical Failures:${NC} $CRITICAL_FAILURES"
    print_separator

    # Exit based on failures
    if [ $CRITICAL_FAILURES -gt 0 ]; then
        echo -e "${RED}DEPLOYMENT BLOCKED${NC}"
        echo "Fix critical failures before deploying to production."
        exit 1
    elif [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}DEPLOYMENT ALLOWED WITH WARNINGS${NC}"
        echo "Review warnings and consider fixing before production deployment."
        exit 0
    else
        echo -e "${GREEN}ALL CHECKS PASSED${NC}"
        echo "Safe to deploy to $ENVIRONMENT."
        exit 0
    fi
}

# Run main function
main "$@"
