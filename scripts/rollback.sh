#!/usr/bin/env bash
# Emergency Rollback Script
# Quickly rollback Railway deployment to previous working version
# Usage: ./scripts/rollback.sh [staging|production]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${RED}╔════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║         EMERGENCY ROLLBACK - ${ENVIRONMENT^^}              ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}✗ Invalid environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}Usage: ./scripts/rollback.sh [staging|production]${NC}"
    exit 1
fi

# Check Railway CLI
if ! command -v railway >/dev/null 2>&1; then
    echo -e "${RED}✗ Railway CLI not installed${NC}"
    echo -e "${YELLOW}Install with: npm install -g @railway/cli${NC}"
    exit 1
fi

# Confirmation
echo -e "${YELLOW}This will rollback the ${ENVIRONMENT} deployment to the previous version${NC}"
echo ""
read -p "Are you sure you want to rollback? (yes/NO) " -r
if [ "$REPLY" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/5] Listing recent deployments...${NC}\n"
railway deployments --limit 5

echo ""
read -p "Enter deployment ID to rollback to (or press Enter to rollback to previous): " DEPLOYMENT_ID

# Perform rollback
echo -e "\n${YELLOW}[2/5] Initiating rollback...${NC}\n"

if [ -n "$DEPLOYMENT_ID" ]; then
    railway rollback --deployment "$DEPLOYMENT_ID"
else
    railway rollback
fi

ROLLBACK_EXIT=$?

if [ $ROLLBACK_EXIT -ne 0 ]; then
    echo -e "\n${RED}✗ Rollback failed${NC}"
    echo -e "${YELLOW}Check Railway dashboard for manual rollback${NC}"
    exit 1
fi

echo -e "\n${GREEN}✓ Rollback initiated${NC}"

# Wait for rollback to complete
echo -e "\n${YELLOW}[3/5] Waiting for rollback to complete...${NC}"
sleep 30

# Determine URL
if [ "$ENVIRONMENT" = "production" ]; then
    TARGET_URL="https://ainative.studio"
else
    TARGET_URL="https://staging.ainative.studio"
fi

# Health check
echo -e "\n${YELLOW}[4/5] Running health checks...${NC}\n"
bash "$SCRIPT_DIR/health-check.sh" "$TARGET_URL" 300

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗ Health check failed after rollback${NC}"
    echo -e "${YELLOW}Manual intervention required${NC}"
    echo -e "${YELLOW}Check Railway logs: railway logs${NC}"
    exit 1
fi

# Smoke tests
echo -e "\n${YELLOW}[5/5] Running smoke tests...${NC}\n"
bash "$SCRIPT_DIR/smoke-tests.sh" "$TARGET_URL"

if [ $? -ne 0 ]; then
    echo -e "\n${YELLOW}⚠ Some smoke tests failed${NC}"
    echo -e "${YELLOW}Review the failures above${NC}"
else
    echo -e "\n${GREEN}✓ Smoke tests passed${NC}"
fi

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Rollback Complete                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "Environment: ${BLUE}$ENVIRONMENT${NC}"
echo -e "URL: ${BLUE}$TARGET_URL${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Monitor Railway logs: ${BLUE}railway logs${NC}"
echo -e "  2. Identify root cause of original issue"
echo -e "  3. Fix locally and test in staging"
echo -e "  4. Deploy fix when ready"
echo ""
echo -e "${YELLOW}To investigate the issue:${NC}"
echo -e "  ${BLUE}railway logs --limit 500${NC}"
echo ""
