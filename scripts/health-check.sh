#!/usr/bin/env bash
# Health Check Script
# Verifies deployment health and availability
# Usage: ./scripts/health-check.sh [url] [timeout]
# Example: ./scripts/health-check.sh https://ainative.studio 300

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TARGET_URL=${1:-"https://ainative.studio"}
TIMEOUT_SECONDS=${2:-300}
CHECK_INTERVAL=5
MAX_ATTEMPTS=$((TIMEOUT_SECONDS / CHECK_INTERVAL))

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Deployment Health Check             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Target URL: ${BLUE}$TARGET_URL${NC}"
echo -e "Timeout: ${YELLOW}${TIMEOUT_SECONDS}s${NC}"
echo -e "Check interval: ${YELLOW}${CHECK_INTERVAL}s${NC}"
echo ""

# Health check endpoints to test
HEALTH_ENDPOINTS=(
    "/api/health"
    "/api/v1/health"
    "/"
)

ATTEMPT=0
SUCCESS=false

# Main health check loop
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    ELAPSED=$((ATTEMPT * CHECK_INTERVAL))

    echo -e "${YELLOW}[Attempt $ATTEMPT/$MAX_ATTEMPTS - ${ELAPSED}s elapsed]${NC}"

    # Try each health endpoint
    for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
        FULL_URL="${TARGET_URL}${endpoint}"

        echo -n "  Checking ${FULL_URL}... "

        # Make the HTTP request with timeout
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --connect-timeout 5 "$FULL_URL" 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
            echo -e "${GREEN}✓ HTTP $HTTP_CODE${NC}"
            SUCCESS=true
            break 2
        else
            echo -e "${RED}✗ HTTP $HTTP_CODE${NC}"
        fi
    done

    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo -e "  Waiting ${CHECK_INTERVAL}s before retry...\n"
        sleep $CHECK_INTERVAL
    fi
done

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Health Check Result              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$SUCCESS" = true ]; then
    echo -e "${GREEN}✓ Health check PASSED${NC}"
    echo -e "${GREEN}  Deployment is healthy and responding${NC}"
    echo -e "  Time elapsed: ${ELAPSED}s"
    exit 0
else
    echo -e "${RED}✗ Health check FAILED${NC}"
    echo -e "${RED}  Deployment not responding after ${TIMEOUT_SECONDS}s${NC}"
    echo -e "${YELLOW}  Recommended actions:${NC}"
    echo -e "  1. Check Railway deployment logs"
    echo -e "  2. Verify environment variables"
    echo -e "  3. Check for build errors"
    echo -e "  4. Consider rollback"
    exit 1
fi
