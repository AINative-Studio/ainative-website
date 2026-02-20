#!/bin/bash

# Development Environment Validation Script
# Validates local development environment before starting work
# Run this when setting up the project or after pulling changes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Development Environment Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Track validation status
CRITICAL_ERRORS=0
WARNINGS=0

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
    CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Check Node.js version
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')

    if [ "$NODE_MAJOR" -ge 18 ]; then
        log_success "Node.js $NODE_VERSION (>= v18)"
    else
        log_error "Node.js version must be >= v18 (current: $NODE_VERSION)"
    fi
else
    log_error "Node.js not found. Install from https://nodejs.org"
fi
echo ""

# 2. Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    log_success "npm $NPM_VERSION"
else
    log_error "npm not found"
fi
echo ""

# 3. Check git
echo -e "${YELLOW}Checking git...${NC}"
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    log_success "$GIT_VERSION"

    # Check if we're in a git repository
    if git rev-parse --git-dir > /dev/null 2>&1; then
        log_success "Git repository detected"

        # Check for uncommitted changes
        if [ -n "$(git status --porcelain)" ]; then
            log_warning "Uncommitted changes detected"
        else
            log_success "Working directory clean"
        fi
    else
        log_error "Not a git repository"
    fi
else
    log_error "git not found"
fi
echo ""

# 4. Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
cd "$PROJECT_ROOT"

if [ -f "package.json" ]; then
    log_success "package.json found"

    if [ -d "node_modules" ]; then
        log_success "node_modules exists"

        # Check if dependencies are up to date
        if [ -f "package-lock.json" ]; then
            npm ls --depth=0 > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                log_success "Dependencies in sync"
            else
                log_warning "Dependencies out of sync - run 'npm install'"
            fi
        fi
    else
        log_error "node_modules missing - run 'npm install'"
    fi
else
    log_error "package.json not found"
fi
echo ""

# 5. Check TypeScript configuration
echo -e "${YELLOW}Checking TypeScript...${NC}"
if [ -f "tsconfig.json" ]; then
    log_success "tsconfig.json found"

    if command -v npx &> /dev/null; then
        if npx tsc --version > /dev/null 2>&1; then
            TSC_VERSION=$(npx tsc --version)
            log_success "TypeScript compiler: $TSC_VERSION"
        fi
    fi
else
    log_error "tsconfig.json not found"
fi
echo ""

# 6. Check Next.js configuration
echo -e "${YELLOW}Checking Next.js...${NC}"
if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    log_success "Next.js config found"

    # Check for .next directory
    if [ -d ".next" ]; then
        log_info ".next directory exists (previous build)"
    else
        log_info "No previous build found (.next missing)"
    fi
else
    log_error "Next.js config not found"
fi
echo ""

# 7. Check environment variables
echo -e "${YELLOW}Checking environment...${NC}"
if [ -f ".env.local" ] || [ -f ".env" ]; then
    log_success "Environment file found"
else
    log_warning "No .env.local or .env file found"
    log_info "Create .env.local for local environment variables"
fi
echo ""

# 8. Check port availability
echo -e "${YELLOW}Checking port availability...${NC}"
DEFAULT_PORT=3000

if lsof -Pi :$DEFAULT_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_warning "Port $DEFAULT_PORT is already in use"
    PROCESS=$(lsof -Pi :$DEFAULT_PORT -sTCP:LISTEN -t)
    log_info "Process using port: $PROCESS"
else
    log_success "Port $DEFAULT_PORT is available"
fi
echo ""

# 9. Check disk space
echo -e "${YELLOW}Checking disk space...${NC}"
DISK_USAGE=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log_error "Low disk space: ${DISK_USAGE}% used"
elif [ "$DISK_USAGE" -gt 80 ]; then
    log_warning "Disk space getting low: ${DISK_USAGE}% used"
else
    log_success "Disk space OK: ${DISK_USAGE}% used"
fi
echo ""

# 10. Validate imports
echo -e "${YELLOW}Validating imports...${NC}"
if [ -f "$SCRIPT_DIR/validate-imports.js" ]; then
    if node "$SCRIPT_DIR/validate-imports.js" > /dev/null 2>&1; then
        log_success "All imports resolve correctly"
    else
        log_error "Import validation failed"
        log_info "Run: node scripts/validate-imports.js"
    fi
else
    log_warning "Import validation script not found"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $CRITICAL_ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ Environment is ready for development${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "  npm run dev    - Start development server"
        echo "  npm run build  - Build for production"
        echo "  npm run test   - Run tests"
    else
        echo -e "${YELLOW}⚠ Environment has $WARNINGS warning(s)${NC}"
        echo -e "${YELLOW}You can proceed, but consider fixing warnings${NC}"
    fi
else
    echo -e "${RED}❌ Environment has $CRITICAL_ERRORS critical error(s)${NC}"
    echo -e "${RED}Fix the errors above before proceeding${NC}"
fi

exit $CRITICAL_ERRORS
