#!/usr/bin/env bash
# Local CI Pipeline - GitHub Actions Alternative
# Runs all CI checks locally without requiring GitHub Actions billing
# Usage: ./scripts/local-ci.sh [--skip-e2e] [--skip-build]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
SKIP_E2E=false
SKIP_BUILD=false

for arg in "$@"; do
    case $arg in
        --skip-e2e)
            SKIP_E2E=true
            ;;
        --skip-build)
            SKIP_BUILD=true
            ;;
    esac
done

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Local CI Pipeline                    ║${NC}"
echo -e "${BLUE}║       (GitHub Actions Alternative)             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

START_TIME=$(date +%s)
FAILURES=0

# Track job status
declare -A JOB_STATUS
declare -A JOB_TIME

run_job() {
    local job_name=$1
    local job_command=$2

    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Job: $job_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    JOB_START=$(date +%s)

    if eval "$job_command"; then
        JOB_END=$(date +%s)
        JOB_DURATION=$((JOB_END - JOB_START))
        JOB_STATUS[$job_name]="passed"
        JOB_TIME[$job_name]=$JOB_DURATION
        echo -e "\n${GREEN}✓ $job_name completed in ${JOB_DURATION}s${NC}"
        return 0
    else
        JOB_END=$(date +%s)
        JOB_DURATION=$((JOB_END - JOB_START))
        JOB_STATUS[$job_name]="failed"
        JOB_TIME[$job_name]=$JOB_DURATION
        echo -e "\n${RED}✗ $job_name failed after ${JOB_DURATION}s${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

# Job 1: Lint
run_job "Lint" "npm run lint"

# Job 2: Type Check
run_job "Type Check" "npm run type-check"

# Job 3: Unit Tests
run_job "Unit Tests" "npm run test:coverage"

# Job 4: Integration Tests
if [ -f "package.json" ] && grep -q "test:integration" package.json; then
    run_job "Integration Tests" "npm run test:integration:coverage" || true
else
    echo -e "\n${YELLOW}⚠ Integration tests script not found, skipping${NC}"
    JOB_STATUS["Integration Tests"]="skipped"
fi

# Job 5: E2E Tests (optional)
if [ "$SKIP_E2E" = false ]; then
    if command -v playwright >/dev/null 2>&1 || [ -d "node_modules/@playwright/test" ]; then
        run_job "E2E Tests" "npm run test:e2e"
    else
        echo -e "\n${YELLOW}⚠ Playwright not installed, skipping E2E tests${NC}"
        echo -e "${YELLOW}  Install with: npm install -D @playwright/test${NC}"
        JOB_STATUS["E2E Tests"]="skipped"
    fi
else
    echo -e "\n${YELLOW}⚠ E2E tests skipped (--skip-e2e flag)${NC}"
    JOB_STATUS["E2E Tests"]="skipped"
fi

# Job 6: Build
if [ "$SKIP_BUILD" = false ]; then
    run_job "Build" "npm run build"
else
    echo -e "\n${YELLOW}⚠ Build skipped (--skip-build flag)${NC}"
    JOB_STATUS["Build"]="skipped"
fi

# Job 7: Security Audit
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Job: Security Audit${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

JOB_START=$(date +%s)
if npm audit --audit-level=high; then
    JOB_END=$(date +%s)
    JOB_DURATION=$((JOB_END - JOB_START))
    JOB_STATUS["Security Audit"]="passed"
    JOB_TIME["Security Audit"]=$JOB_DURATION
    echo -e "\n${GREEN}✓ Security Audit completed in ${JOB_DURATION}s${NC}"
else
    JOB_END=$(date +%s)
    JOB_DURATION=$((JOB_END - JOB_START))
    JOB_STATUS["Security Audit"]="warning"
    JOB_TIME["Security Audit"]=$JOB_DURATION
    echo -e "\n${YELLOW}⚠ Security vulnerabilities found (non-blocking)${NC}"
fi

# Calculate total time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# Print Summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              CI Pipeline Summary               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

for job in "Lint" "Type Check" "Unit Tests" "Integration Tests" "E2E Tests" "Build" "Security Audit"; do
    status=${JOB_STATUS[$job]:-"not run"}
    duration=${JOB_TIME[$job]:-0}

    case $status in
        "passed")
            echo -e "  ${GREEN}✓${NC} $job (${duration}s)"
            ;;
        "failed")
            echo -e "  ${RED}✗${NC} $job (${duration}s)"
            ;;
        "warning")
            echo -e "  ${YELLOW}⚠${NC} $job (${duration}s)"
            ;;
        "skipped")
            echo -e "  ${YELLOW}⊘${NC} $job (skipped)"
            ;;
        *)
            echo -e "  ${YELLOW}?${NC} $job (not run)"
            ;;
    esac
done

echo -e "\n${BLUE}Total time: ${TOTAL_TIME}s${NC}\n"

# Exit with appropriate code
if [ $FAILURES -gt 0 ]; then
    echo -e "${RED}✗ CI Pipeline FAILED with $FAILURES failure(s)${NC}"
    echo -e "${YELLOW}Fix the issues above before pushing to production${NC}"
    exit 1
else
    echo -e "${GREEN}✓ All CI checks PASSED${NC}"
    echo -e "${GREEN}Ready to push to repository${NC}"
    exit 0
fi
