#!/bin/bash

###############################################################################
# Playwright E2E Test Execution Script
# Run comprehensive E2E tests for AIKit Dashboard
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
E2E_DIR="$PROJECT_ROOT/e2e"
RESULTS_DIR="$PROJECT_ROOT/test-results"
SCREENSHOTS_DIR="$E2E_DIR/screenshots"

# Parse arguments
TEST_TYPE="${1:-all}"
BROWSER="${2:-chromium}"
HEADED="${3:-false}"

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}  Playwright E2E Test Suite - AIKit Dashboard Integration${NC}"
echo -e "${BLUE}==================================================================${NC}"
echo ""

# Create necessary directories
mkdir -p "$RESULTS_DIR"
mkdir -p "$SCREENSHOTS_DIR"

# Function to run tests
run_tests() {
    local test_pattern=$1
    local browser=$2
    local headed=$3

    echo -e "${YELLOW}Running tests: ${test_pattern}${NC}"
    echo -e "${YELLOW}Browser: ${browser}${NC}"
    echo -e "${YELLOW}Headed mode: ${headed}${NC}"
    echo ""

    if [ "$headed" = "true" ]; then
        npx playwright test "$test_pattern" --project="$browser" --headed
    else
        npx playwright test "$test_pattern" --project="$browser"
    fi
}

# Function to run specific test suite
run_suite() {
    case "$1" in
        "navigation")
            echo -e "${GREEN}Running Dashboard Navigation Tests...${NC}"
            run_tests "e2e/tests/dashboard-navigation.spec.ts" "$BROWSER" "$HEADED"
            ;;
        "components")
            echo -e "${GREEN}Running Component Interaction Tests...${NC}"
            run_tests "e2e/tests/component-interactions.spec.ts" "$BROWSER" "$HEADED"
            ;;
        "responsive")
            echo -e "${GREEN}Running Responsive Design Tests...${NC}"
            run_tests "e2e/tests/responsive-design.spec.ts" "$BROWSER" "$HEADED"
            ;;
        "visual")
            echo -e "${GREEN}Running Visual Testing...${NC}"
            run_tests "e2e/tests/visual-testing.spec.ts" "$BROWSER" "$HEADED"
            ;;
        "accessibility" | "a11y")
            echo -e "${GREEN}Running Accessibility Tests...${NC}"
            run_tests "e2e/tests/accessibility.spec.ts" "$BROWSER" "$HEADED"
            ;;
        "all")
            echo -e "${GREEN}Running All Tests...${NC}"
            run_tests "e2e/tests/**/*.spec.ts" "$BROWSER" "$HEADED"
            ;;
        *)
            echo -e "${RED}Unknown test type: $1${NC}"
            echo ""
            echo "Usage: $0 [test-type] [browser] [headed]"
            echo ""
            echo "Test types:"
            echo "  navigation    - Dashboard navigation tests"
            echo "  components    - Component interaction tests"
            echo "  responsive    - Responsive design tests"
            echo "  visual        - Visual testing and screenshots"
            echo "  accessibility - Accessibility and WCAG tests"
            echo "  all          - All tests (default)"
            echo ""
            echo "Browsers: chromium (default), firefox, webkit, mobile, tablet, desktop"
            echo "Headed: true (show browser), false (headless - default)"
            exit 1
            ;;
    esac
}

# Check if dev server is running
check_dev_server() {
    echo -e "${YELLOW}Checking if dev server is running...${NC}"

    if ! curl -s http://localhost:3000 > /dev/null; then
        echo -e "${RED}Dev server is not running on port 3000${NC}"
        echo -e "${YELLOW}Starting dev server...${NC}"

        # Start dev server in background
        npm run dev > /dev/null 2>&1 &
        DEV_SERVER_PID=$!

        # Wait for server to start
        echo -e "${YELLOW}Waiting for dev server to start...${NC}"
        for i in {1..30}; do
            if curl -s http://localhost:3000 > /dev/null; then
                echo -e "${GREEN}Dev server is ready!${NC}"
                return 0
            fi
            sleep 1
        done

        echo -e "${RED}Failed to start dev server${NC}"
        exit 1
    else
        echo -e "${GREEN}Dev server is already running${NC}"
    fi
}

# Main execution
main() {
    cd "$PROJECT_ROOT"

    # Install dependencies if needed
    if [ ! -d "node_modules/@playwright" ]; then
        echo -e "${YELLOW}Installing Playwright...${NC}"
        npm install --save-dev @playwright/test
        npx playwright install
    fi

    # Check dev server
    check_dev_server

    # Run tests
    run_suite "$TEST_TYPE"

    # Generate report
    echo ""
    echo -e "${GREEN}Tests completed!${NC}"
    echo -e "${YELLOW}Generating HTML report...${NC}"
    npx playwright show-report
}

# Cleanup on exit
cleanup() {
    if [ -n "$DEV_SERVER_PID" ]; then
        echo -e "${YELLOW}Stopping dev server...${NC}"
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Run main function
main