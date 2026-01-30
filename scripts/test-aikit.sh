#!/bin/bash

###############################################################################
# AIKit Component Test Suite Execution Script
#
# Purpose: Execute comprehensive TDD test suite for AIKit components
# Coverage Target: 80%+ (Mandatory)
#
# Usage:
#   ./scripts/test-aikit.sh                    # Run all tests
#   ./scripts/test-aikit.sh --unit             # Run unit tests only
#   ./scripts/test-aikit.sh --integration      # Run integration tests only
#   ./scripts/test-aikit.sh --e2e              # Run E2E tests only
#   ./scripts/test-aikit.sh --coverage         # Run with coverage report
#   ./scripts/test-aikit.sh --watch            # Run in watch mode
#   ./scripts/test-aikit.sh --ci               # Run in CI mode
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
COVERAGE_THRESHOLD=80
UNIT_TEST_PATTERN="components/ui/__tests__/aikit-*.test.tsx"
INTEGRATION_TEST_PATTERN="app/ai-kit/__tests__/*.test.tsx"
E2E_TEST_PATTERN="e2e/aikit-dashboard.spec.ts"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if dependencies are installed
check_dependencies() {
    print_header "Checking Dependencies"

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm."
        exit 1
    fi

    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Running npm install..."
        npm install
    fi

    print_success "Dependencies OK"
    echo ""
}

# Run unit tests
run_unit_tests() {
    print_header "Running AIKit Unit Tests"
    print_info "Testing individual components..."
    echo ""

    if [ "$WATCH_MODE" = true ]; then
        npm run test:watch -- "$UNIT_TEST_PATTERN"
    elif [ "$COVERAGE_MODE" = true ]; then
        npm run test:coverage -- "$UNIT_TEST_PATTERN"
    else
        npm test -- "$UNIT_TEST_PATTERN"
    fi

    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit 1
    fi
    echo ""
}

# Run integration tests
run_integration_tests() {
    print_header "Running AIKit Integration Tests"
    print_info "Testing component integration..."
    echo ""

    if [ "$WATCH_MODE" = true ]; then
        npm run test:watch -- "$INTEGRATION_TEST_PATTERN"
    elif [ "$COVERAGE_MODE" = true ]; then
        npm run test:coverage -- "$INTEGRATION_TEST_PATTERN"
    else
        npm test -- "$INTEGRATION_TEST_PATTERN"
    fi

    if [ $? -eq 0 ]; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        exit 1
    fi
    echo ""
}

# Run E2E tests
run_e2e_tests() {
    print_header "Running AIKit E2E Tests"
    print_info "Testing full user workflows..."
    echo ""

    # Check if server is running
    if ! curl -s http://localhost:3000 > /dev/null; then
        print_warning "Development server not running on port 3000"
        print_info "Starting development server..."

        # Start dev server in background
        npm run dev &
        DEV_SERVER_PID=$!

        # Wait for server to be ready
        print_info "Waiting for server to start..."
        sleep 5

        # Check if server is ready
        max_attempts=30
        attempt=0
        while ! curl -s http://localhost:3000 > /dev/null; do
            if [ $attempt -ge $max_attempts ]; then
                print_error "Server failed to start"
                kill $DEV_SERVER_PID 2>/dev/null || true
                exit 1
            fi
            sleep 1
            attempt=$((attempt + 1))
        done

        print_success "Server started"
        STARTED_SERVER=true
    fi

    # Run E2E tests
    npm run test:e2e -- "$E2E_TEST_PATTERN"

    if [ $? -eq 0 ]; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"

        if [ "$STARTED_SERVER" = true ]; then
            kill $DEV_SERVER_PID 2>/dev/null || true
        fi

        exit 1
    fi

    # Stop dev server if we started it
    if [ "$STARTED_SERVER" = true ]; then
        print_info "Stopping development server..."
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi

    echo ""
}

# Generate coverage report
generate_coverage_report() {
    print_header "Generating Coverage Report"

    npm run test:coverage

    if [ $? -eq 0 ]; then
        print_success "Coverage report generated"

        # Check coverage threshold
        if [ -f "coverage/coverage-summary.json" ]; then
            # Extract coverage percentages (requires jq)
            if command -v jq &> /dev/null; then
                LINES_COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
                STATEMENTS_COVERAGE=$(jq '.total.statements.pct' coverage/coverage-summary.json)
                FUNCTIONS_COVERAGE=$(jq '.total.functions.pct' coverage/coverage-summary.json)
                BRANCHES_COVERAGE=$(jq '.total.branches.pct' coverage/coverage-summary.json)

                echo ""
                print_info "Coverage Summary:"
                echo "  Lines:      ${LINES_COVERAGE}%"
                echo "  Statements: ${STATEMENTS_COVERAGE}%"
                echo "  Functions:  ${FUNCTIONS_COVERAGE}%"
                echo "  Branches:   ${BRANCHES_COVERAGE}%"
                echo ""

                # Check if meets threshold
                if (( $(echo "$LINES_COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
                    print_error "Coverage below ${COVERAGE_THRESHOLD}% threshold!"
                    print_error "Current: ${LINES_COVERAGE}%, Required: ${COVERAGE_THRESHOLD}%"
                    exit 1
                else
                    print_success "Coverage meets ${COVERAGE_THRESHOLD}% threshold"
                fi
            else
                print_warning "jq not installed. Cannot parse coverage summary."
                print_info "Install jq to see detailed coverage metrics"
            fi
        fi

        print_info "Open coverage/lcov-report/index.html to view detailed report"
    else
        print_error "Coverage generation failed"
        exit 1
    fi
    echo ""
}

# Main execution
main() {
    # Parse command line arguments
    UNIT_ONLY=false
    INTEGRATION_ONLY=false
    E2E_ONLY=false
    COVERAGE_MODE=false
    WATCH_MODE=false
    CI_MODE=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --unit)
                UNIT_ONLY=true
                shift
                ;;
            --integration)
                INTEGRATION_ONLY=true
                shift
                ;;
            --e2e)
                E2E_ONLY=true
                shift
                ;;
            --coverage)
                COVERAGE_MODE=true
                shift
                ;;
            --watch)
                WATCH_MODE=true
                shift
                ;;
            --ci)
                CI_MODE=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Usage: $0 [--unit] [--integration] [--e2e] [--coverage] [--watch] [--ci]"
                exit 1
                ;;
        esac
    done

    # Display banner
    echo ""
    print_header "AIKit TDD Test Suite"
    echo -e "${BLUE}Coverage Target: ${COVERAGE_THRESHOLD}%+${NC}"
    echo -e "${BLUE}Test-Driven Development${NC}"
    echo ""

    # Check dependencies
    check_dependencies

    # Determine which tests to run
    if [ "$UNIT_ONLY" = true ]; then
        run_unit_tests
    elif [ "$INTEGRATION_ONLY" = true ]; then
        run_integration_tests
    elif [ "$E2E_ONLY" = true ]; then
        run_e2e_tests
    elif [ "$COVERAGE_MODE" = true ]; then
        generate_coverage_report
    else
        # Run all tests
        run_unit_tests
        run_integration_tests

        if [ "$CI_MODE" = true ]; then
            run_e2e_tests
        else
            print_warning "Skipping E2E tests (use --e2e to run)"
            print_info "E2E tests require dev server and take longer to run"
        fi

        generate_coverage_report
    fi

    # Final summary
    print_header "Test Suite Complete"
    print_success "All tests passed successfully!"
    echo ""
}

# Run main function
main "$@"
