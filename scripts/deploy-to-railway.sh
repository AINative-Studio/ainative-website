#!/usr/bin/env bash
# Deploy to Railway with Validation and Rollback Support
# Usage: ./scripts/deploy-to-railway.sh [staging|production]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Deploy to Railway - ${ENVIRONMENT^^}              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Validate environment argument
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}✗ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Usage: ./scripts/deploy-to-railway.sh [staging|production]${NC}"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway >/dev/null 2>&1; then
    echo -e "${RED}✗ Railway CLI not installed${NC}"
    echo -e "${YELLOW}Install with: npm install -g @railway/cli${NC}"
    exit 1
fi

# Step 1: Pre-deployment validation
echo -e "${YELLOW}[1/6] Running pre-deployment validation...${NC}\n"
bash "$SCRIPT_DIR/pre-deploy-validation.sh" "$ENVIRONMENT"
if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗ Pre-deployment validation failed${NC}"
    exit 1
fi

# Step 2: Git checks
echo -e "\n${YELLOW}[2/6] Checking Git status...${NC}"
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --porcelain | wc -l | xargs)
    if [ "$UNCOMMITTED" -gt 0 ]; then
        echo -e "${YELLOW}⚠ Warning: $UNCOMMITTED uncommitted changes${NC}"
        git status -s

        read -p "Continue deployment with uncommitted changes? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Deployment cancelled${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ Working directory clean${NC}"
    fi

    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo -e "  Current branch: ${BLUE}$CURRENT_BRANCH${NC}"

    if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        echo -e "${YELLOW}⚠ Warning: Not on main branch for production deployment${NC}"
        read -p "Continue deployment from $CURRENT_BRANCH? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Deployment cancelled${NC}"
            exit 1
        fi
    fi
fi

# Step 3: Determine Railway service
echo -e "\n${YELLOW}[3/6] Configuring Railway service...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    RAILWAY_SERVICE="AINative-Website-Production"
    RAILWAY_CONFIG="railway.production.toml"
    EXPECTED_URL="https://ainative.studio"
else
    RAILWAY_SERVICE="AINative-Website-Staging"
    RAILWAY_CONFIG="railway.toml"
    EXPECTED_URL="https://staging.ainative.studio"
fi

echo -e "  Service: ${BLUE}$RAILWAY_SERVICE${NC}"
echo -e "  Config: ${BLUE}$RAILWAY_CONFIG${NC}"

# Step 4: Confirmation for production
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  WARNING: Deploying to PRODUCTION${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}This will deploy to the production environment.${NC}"
    echo -e "${YELLOW}Make sure you have:${NC}"
    echo -e "  - Tested in staging"
    echo -e "  - Reviewed all changes"
    echo -e "  - Notified stakeholders"
    echo ""
    read -p "Proceed with production deployment? (yes/NO) " -r
    if [ "$REPLY" != "yes" ]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

# Step 5: Deploy to Railway
echo -e "\n${YELLOW}[4/6] Deploying to Railway...${NC}\n"

if [ -f "$RAILWAY_CONFIG" ]; then
    railway up --config "$RAILWAY_CONFIG"
else
    echo -e "${YELLOW}⚠ Config file $RAILWAY_CONFIG not found, using default${NC}"
    railway up
fi

DEPLOY_EXIT=$?

if [ $DEPLOY_EXIT -ne 0 ]; then
    echo -e "\n${RED}✗ Railway deployment failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Deployment initiated${NC}"

# Step 6: Health checks
echo -e "\n${YELLOW}[5/6] Waiting for deployment to be ready...${NC}"
sleep 30

echo -e "\n${YELLOW}[6/6] Running health checks...${NC}\n"
bash "$SCRIPT_DIR/health-check.sh" "$EXPECTED_URL" 300

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗ Health check failed${NC}"
    echo -e "${YELLOW}Deployment may have issues. Check Railway logs:${NC}"
    echo -e "  railway logs"
    exit 1
fi

# Step 7: Smoke tests
echo -e "\n${YELLOW}Running smoke tests...${NC}\n"
bash "$SCRIPT_DIR/smoke-tests.sh" "$EXPECTED_URL"

if [ $? -ne 0 ]; then
    echo -e "\n${YELLOW}⚠ Smoke tests failed${NC}"
    echo -e "${YELLOW}Review the failures and decide if rollback is needed${NC}"
else
    echo -e "\n${GREEN}✓ Smoke tests passed${NC}"
fi

# Success summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Deployment Successful!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "Environment: ${BLUE}$ENVIRONMENT${NC}"
echo -e "Service: ${BLUE}$RAILWAY_SERVICE${NC}"
echo -e "URL: ${BLUE}$EXPECTED_URL${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Monitor Railway logs: ${BLUE}railway logs${NC}"
echo -e "  2. Check error tracking in Sentry"
echo -e "  3. Monitor user traffic and metrics"

if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "  4. Tag this release: ${BLUE}git tag v<version>${NC}"
    echo -e "  5. Create GitHub release with changelog"
fi

echo ""
echo -e "${YELLOW}Rollback if needed:${NC}"
echo -e "  ${BLUE}railway rollback${NC}"
echo ""
