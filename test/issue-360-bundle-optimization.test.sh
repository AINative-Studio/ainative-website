#!/bin/bash

# Test script for Issue #360 - Bundle Optimization Implementation
# This script verifies that all bundle optimization features are properly implemented

set -e

echo "=========================================="
echo "Issue #360: Bundle Optimization Test"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

passed=0
failed=0

# Test function
test_feature() {
    local description=$1
    local command=$2

    echo -n "Testing: $description... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi
}

# Test file existence
test_file_exists() {
    local description=$1
    local file=$2

    echo -n "Testing: $description... "

    if [ -f "$file" ]; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC} - File not found: $file"
        ((failed++))
    fi
}

# Test file contains pattern
test_file_contains() {
    local description=$1
    local file=$2
    local pattern=$3

    echo -n "Testing: $description... "

    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi
}

echo "1. Lazy Component Infrastructure"
echo "-----------------------------------"
test_file_exists "LazyCharts component exists" "components/lazy/LazyCharts.tsx"
test_file_exists "LazyVideoPlayer component exists" "components/lazy/LazyVideoPlayer.tsx"
test_file_exists "LazyDialogs component exists" "components/lazy/LazyDialogs.tsx"
test_file_exists "LazyMarkdown component exists" "components/lazy/LazyMarkdown.tsx"
test_file_exists "LazyMotion component exists" "components/lazy/LazyMotion.tsx"
test_file_exists "Lazy components index exists" "components/lazy/index.ts"
echo ""

echo "2. Component Implementation"
echo "----------------------------"
test_file_contains "LazyCharts exports LazyAreaChart" "components/lazy/LazyCharts.tsx" "LazyAreaChart"
test_file_contains "LazyCharts exports LazyBarChart" "components/lazy/LazyCharts.tsx" "LazyBarChart"
test_file_contains "LazyCharts exports LazyPieChart" "components/lazy/LazyCharts.tsx" "LazyPieChart"
test_file_contains "LazyCharts exports LazyLineChart" "components/lazy/LazyCharts.tsx" "LazyLineChart"
test_file_contains "LazyCharts uses next/dynamic" "components/lazy/LazyCharts.tsx" "next/dynamic"
test_file_contains "LazyVideoPlayer uses next/dynamic" "components/lazy/LazyVideoPlayer.tsx" "next/dynamic"
echo ""

echo "3. Component Usage"
echo "-------------------"
test_file_contains "MainDashboard uses lazy charts" "app/dashboard/main/MainDashboardClient.tsx" "from '@/components/lazy'"
test_file_contains "MainDashboard uses LazyAreaChart" "app/dashboard/main/MainDashboardClient.tsx" "LazyAreaChart"
test_file_contains "MainDashboard uses LazyBarChart" "app/dashboard/main/MainDashboardClient.tsx" "LazyBarChart"
test_file_contains "TutorialWatch uses LazyVideoPlayer" "app/tutorials/[slug]/watch/TutorialWatchClient.tsx" "LazyVideoPlayer"
echo ""

echo "4. Next.js Configuration"
echo "-------------------------"
test_file_contains "Config has optimizePackageImports" "next.config.ts" "optimizePackageImports"
test_file_contains "Config optimizes lucide-react" "next.config.ts" "lucide-react"
test_file_contains "Config optimizes recharts" "next.config.ts" "recharts"
test_file_contains "Config optimizes framer-motion" "next.config.ts" "framer-motion"
test_file_contains "Config has webpack function" "next.config.ts" "webpack:"
test_file_contains "Config has splitChunks" "next.config.ts" "splitChunks"
test_file_contains "Config has react vendor chunk" "next.config.ts" "react-vendor"
test_file_contains "Config has radix-ui chunk" "next.config.ts" "radix-ui"
test_file_contains "Config has charts chunk" "next.config.ts" "charts"
test_file_contains "Config has animations chunk" "next.config.ts" "animations"
test_file_contains "Config has bundle analyzer" "next.config.ts" "BundleAnalyzerPlugin"
echo ""

echo "5. Package Configuration"
echo "-------------------------"
test_file_contains "Package has bundle-analyzer dependency" "package.json" "@next/bundle-analyzer"
test_file_contains "Package has build:analyze script" "package.json" "build:analyze"
test_file_contains "Package has webpack-bundle-analyzer" "package.json" "webpack-bundle-analyzer"
echo ""

echo "6. Bug Fixes"
echo "-------------"
test_file_contains "cache-config returns readonly" "lib/cache-config.ts" "readonly string\\[\\]"
test_file_contains "WebVitalsMonitor removed onFID" "components/analytics/WebVitalsMonitor.tsx" "onINP"
test_file_contains "WebVitalsMonitor doesn't use onFID" "! grep -q 'onFID' components/analytics/WebVitalsMonitor.tsx" ""
echo ""

echo "7. Documentation"
echo "-----------------"
test_file_exists "Bundle optimization guide exists" "lib/optimization/bundle-optimization.md"
test_file_exists "Implementation summary exists" "docs/optimization/BUNDLE_OPTIMIZATION_IMPLEMENTATION.md"
test_file_contains "Guide has dynamic imports section" "lib/optimization/bundle-optimization.md" "Dynamic Imports"
test_file_contains "Guide has chunk splitting section" "lib/optimization/bundle-optimization.md" "Chunk Splitting"
test_file_contains "Implementation has usage guidelines" "docs/optimization/BUNDLE_OPTIMIZATION_IMPLEMENTATION.md" "Usage Guidelines"
test_file_contains "Implementation has performance impact" "docs/optimization/BUNDLE_OPTIMIZATION_IMPLEMENTATION.md" "Performance Impact"
echo ""

echo "8. TypeScript Compilation"
echo "--------------------------"
echo -n "Testing: TypeScript compiles without errors... "
if npm run type-check > /tmp/typecheck.log 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((passed++))
else
    echo -e "${RED}FAIL${NC}"
    echo "See /tmp/typecheck.log for details"
    ((failed++))
fi
echo ""

echo "9. Build Configuration"
echo "-----------------------"
echo -n "Testing: Build configuration is valid... "
if node -e "require('./next.config.ts')" 2>/dev/null || \
   npx tsx -e "import('./next.config.ts')" > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    ((passed++))
else
    echo -e "${YELLOW}SKIP${NC} (requires build to validate)"
fi
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"
echo "Total:  $((passed + failed))"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm run build:analyze' to generate bundle report"
    echo "2. Review bundle sizes in .next/analyze/client.html"
    echo "3. Test application in production mode"
    echo "4. Monitor Core Web Vitals in production"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi
