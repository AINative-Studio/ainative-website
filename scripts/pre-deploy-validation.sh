#!/usr/bin/env bash
# Pre-Deployment Validation Script
# Run this before deploying to Railway to catch issues early
# Usage: ./scripts/pre-deploy-validation.sh [environment]
# Example: ./scripts/pre-deploy-validation.sh production

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${1:-staging}

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Pre-Deployment Validation for ${ENVIRONMENT^^}        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

FAILURES=0

# 1. Check Node.js version
echo -e "${YELLOW}[1/12] Checking Node.js version...${NC}"
REQUIRED_NODE_VERSION=20
CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$CURRENT_NODE_VERSION" -ge "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${GREEN}✓ Node.js $(node -v) (required: v${REQUIRED_NODE_VERSION}+)${NC}"
else
    echo -e "${RED}✗ Node.js version too old: v${CURRENT_NODE_VERSION} (required: v${REQUIRED_NODE_VERSION}+)${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 2. Verify package-lock.json is in sync
echo -e "\n${YELLOW}[2/12] Verifying package-lock.json...${NC}"
if [ -f "package-lock.json" ]; then
    npm install --package-lock-only --ignore-scripts 2>/dev/null || true
    if git diff --quiet package-lock.json; then
        echo -e "${GREEN}✓ package-lock.json is in sync${NC}"
    else
        echo -e "${RED}✗ package-lock.json is out of sync - run 'npm install'${NC}"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${RED}✗ package-lock.json not found${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 3. Install dependencies
echo -e "\n${YELLOW}[3/12] Installing dependencies...${NC}"
npm ci --prefer-offline --no-audit 2>&1 | tail -5
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Dependency installation failed${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 4. Validate environment variables
echo -e "\n${YELLOW}[4/12] Validating environment variables...${NC}"
node scripts/validate-env-vars.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Environment variables valid${NC}"
else
    echo -e "${RED}✗ Environment variable validation failed${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 5. Check required env vars for deployment
echo -e "\n${YELLOW}[5/12] Checking required environment variables for ${ENVIRONMENT}...${NC}"
REQUIRED_VARS=("NEXT_PUBLIC_API_URL")

if [ "$ENVIRONMENT" = "production" ]; then
    REQUIRED_VARS+=("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "NEXT_PUBLIC_SENTRY_DSN")
fi

MISSING_VARS=0
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    ENV_FILE=".env"
fi

if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}✗ Missing required variable: $var${NC}"
            MISSING_VARS=$((MISSING_VARS + 1))
        fi
    done

    if [ $MISSING_VARS -eq 0 ]; then
        echo -e "${GREEN}✓ All required variables set${NC}"
    else
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${YELLOW}⚠ No environment file found ($ENV_FILE)${NC}"
fi

# 6. Run TypeScript type checking
echo -e "\n${YELLOW}[6/12] Running TypeScript type check...${NC}"
npm run type-check 2>&1 | tail -10
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
else
    echo -e "${RED}✗ TypeScript errors found${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 7. Run linter
echo -e "\n${YELLOW}[7/12] Running linter...${NC}"
npm run lint 2>&1 | tail -15
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ No linting errors${NC}"
else
    echo -e "${RED}✗ Linting errors found${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 8. Run unit tests
echo -e "\n${YELLOW}[8/12] Running unit tests...${NC}"
npm run test:coverage 2>&1 | tail -20
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ All unit tests passed${NC}"
else
    echo -e "${RED}✗ Unit tests failed${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 9. Build the application
echo -e "\n${YELLOW}[9/12] Building application...${NC}"
npm run build 2>&1 | tail -15
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 10. Check build output size
echo -e "\n${YELLOW}[10/12] Checking build size...${NC}"
if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next | cut -f1)
    echo -e "${GREEN}✓ Build size: $BUILD_SIZE${NC}"

    # Warn if build is too large (>200MB)
    BUILD_SIZE_MB=$(du -sm .next | cut -f1)
    if [ "$BUILD_SIZE_MB" -gt 200 ]; then
        echo -e "${YELLOW}⚠ Build size is large (${BUILD_SIZE_MB}MB). Consider optimization.${NC}"
    fi
else
    echo -e "${RED}✗ Build output (.next) not found${NC}"
    FAILURES=$((FAILURES + 1))
fi

# 11. Security audit
echo -e "\n${YELLOW}[11/12] Running security audit...${NC}"
npm audit --audit-level=high 2>&1 | tail -15
AUDIT_EXIT=$?
if [ $AUDIT_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ No high-severity vulnerabilities${NC}"
else
    echo -e "${YELLOW}⚠ Security vulnerabilities found (check above)${NC}"
    # Don't fail on audit issues, just warn
fi

# 12. Check for uncommitted changes
echo -e "\n${YELLOW}[12/12] Checking git status...${NC}"
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --porcelain | wc -l | xargs)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        echo -e "${GREEN}✓ Working directory clean${NC}"
    else
        echo -e "${YELLOW}⚠ $UNCOMMITTED uncommitted changes${NC}"
        git status -s
    fi

    # Check current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo -e "  Current branch: ${BLUE}$CURRENT_BRANCH${NC}"

    if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        echo -e "${YELLOW}⚠ Not on main branch for production deployment${NC}"
    fi
fi

# Summary
echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Validation Summary                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

if [ $FAILURES -gt 0 ]; then
    echo -e "${RED}✗ $FAILURES validation check(s) failed${NC}"
    echo -e "${YELLOW}Fix the issues above before deploying to $ENVIRONMENT${NC}"
    exit 1
else
    echo -e "${GREEN}✓ All validation checks passed${NC}"
    echo -e "${GREEN}Ready to deploy to $ENVIRONMENT${NC}"

    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "\n${YELLOW}Production Deployment Checklist:${NC}"
        echo -e "  1. Verify Railway environment variables are set"
        echo -e "  2. Create a backup of current production deployment"
        echo -e "  3. Monitor deployment logs during rollout"
        echo -e "  4. Run smoke tests after deployment"
        echo -e "  5. Have rollback plan ready"
    fi

    exit 0
fi
