#!/bin/bash

# Performance Monitoring Setup Verification Test
# Tests all components of Issue #369 implementation

set -e  # Exit on error

PROJECT_ROOT="/Users/aideveloper/ainative-website-nextjs-staging"
PASS="\033[0;32m✓\033[0m"
FAIL="\033[0;31m✗\033[0m"
INFO="\033[0;36mℹ\033[0m"

echo "=================================================="
echo "Performance Monitoring Setup Verification (Issue #369)"
echo "=================================================="
echo ""

# Test 1: Package Dependencies
echo "Test 1: Verifying package dependencies..."
if grep -q '"web-vitals"' "$PROJECT_ROOT/package.json" && \
   grep -q '"@lhci/cli"' "$PROJECT_ROOT/package.json" && \
   grep -q '"lighthouse"' "$PROJECT_ROOT/package.json" && \
   grep -q '"webpack-bundle-analyzer"' "$PROJECT_ROOT/package.json"; then
    echo -e "$PASS Package dependencies installed"
else
    echo -e "$FAIL Missing required dependencies"
    exit 1
fi
echo ""

# Test 2: Configuration Files
echo "Test 2: Verifying configuration files..."
files=(
    "lighthouserc.js"
    "performance-budget.json"
)

for file in "${files[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo -e "$PASS $file exists"
    else
        echo -e "$FAIL $file missing"
        exit 1
    fi
done
echo ""

# Test 3: Lighthouse CI Configuration
echo "Test 3: Validating Lighthouse CI configuration..."
if grep -q "largest-contentful-paint" "$PROJECT_ROOT/lighthouserc.js" && \
   grep -q "cumulative-layout-shift" "$PROJECT_ROOT/lighthouserc.js" && \
   grep -q "first-contentful-paint" "$PROJECT_ROOT/lighthouserc.js"; then
    echo -e "$PASS Lighthouse CI configured with Core Web Vitals"
else
    echo -e "$FAIL Lighthouse CI missing Core Web Vitals metrics"
    exit 1
fi
echo ""

# Test 4: Performance Budget
echo "Test 4: Validating performance budget configuration..."
if grep -q "largest-contentful-paint" "$PROJECT_ROOT/performance-budget.json" && \
   grep -q "cumulative-layout-shift" "$PROJECT_ROOT/performance-budget.json" && \
   grep -q "resourceSizes" "$PROJECT_ROOT/performance-budget.json"; then
    echo -e "$PASS Performance budget configured"
else
    echo -e "$FAIL Performance budget missing required metrics"
    exit 1
fi
echo ""

# Test 5: Performance Utilities
echo "Test 5: Verifying performance utilities..."
if [ -f "$PROJECT_ROOT/lib/performance/web-vitals.ts" ]; then
    if grep -q "export function getRating" "$PROJECT_ROOT/lib/performance/web-vitals.ts" && \
       grep -q "export.*function sendToAnalytics" "$PROJECT_ROOT/lib/performance/web-vitals.ts" && \
       grep -q "export function formatMetric" "$PROJECT_ROOT/lib/performance/web-vitals.ts"; then
        echo -e "$PASS Performance utilities implemented"
    else
        echo -e "$FAIL Performance utilities incomplete"
        exit 1
    fi
else
    echo -e "$FAIL lib/performance/web-vitals.ts missing"
    exit 1
fi
echo ""

# Test 6: Web Vitals Monitor Component
echo "Test 6: Verifying Web Vitals Monitor component..."
if [ -f "$PROJECT_ROOT/components/analytics/WebVitalsMonitor.tsx" ]; then
    if grep -q "onCLS" "$PROJECT_ROOT/components/analytics/WebVitalsMonitor.tsx" && \
       grep -q "onLCP" "$PROJECT_ROOT/components/analytics/WebVitalsMonitor.tsx" && \
       grep -q "onINP" "$PROJECT_ROOT/components/analytics/WebVitalsMonitor.tsx"; then
        echo -e "$PASS Web Vitals Monitor component implemented"
    else
        echo -e "$FAIL Web Vitals Monitor missing required metrics"
        exit 1
    fi
else
    echo -e "$FAIL components/analytics/WebVitalsMonitor.tsx missing"
    exit 1
fi
echo ""

# Test 7: Root Layout Integration
echo "Test 7: Verifying root layout integration..."
if grep -q "WebVitalsMonitor" "$PROJECT_ROOT/app/layout.tsx"; then
    echo -e "$PASS WebVitalsMonitor integrated in root layout"
else
    echo -e "$FAIL WebVitalsMonitor not found in root layout"
    exit 1
fi
echo ""

# Test 8: Next.js Configuration
echo "Test 8: Verifying Next.js configuration..."
if grep -q "BundleAnalyzerPlugin" "$PROJECT_ROOT/next.config.ts" && \
   grep -q "optimizePackageImports" "$PROJECT_ROOT/next.config.ts"; then
    echo -e "$PASS Next.js configured for performance optimization"
else
    echo -e "$FAIL Next.js configuration incomplete"
    exit 1
fi
echo ""

# Test 9: NPM Scripts
echo "Test 9: Verifying NPM scripts..."
scripts=(
    "lighthouse"
    "lighthouse:ci"
    "perf:test"
    "perf:report"
    "build:analyze"
)

for script in "${scripts[@]}"; do
    if grep -q "\"$script\"" "$PROJECT_ROOT/package.json"; then
        echo -e "$PASS Script '$script' exists"
    else
        echo -e "$FAIL Script '$script' missing"
        exit 1
    fi
done
echo ""

# Test 10: GitHub Actions Workflow
echo "Test 10: Verifying GitHub Actions workflow..."
if [ -f "$PROJECT_ROOT/.github/workflows/lighthouse.yml" ]; then
    if grep -q "treosh/lighthouse-ci-action" "$PROJECT_ROOT/.github/workflows/lighthouse.yml" && \
       grep -q "budgetPath" "$PROJECT_ROOT/.github/workflows/lighthouse.yml"; then
        echo -e "$PASS Lighthouse CI workflow configured"
    else
        echo -e "$FAIL Lighthouse CI workflow incomplete"
        exit 1
    fi
else
    echo -e "$FAIL .github/workflows/lighthouse.yml missing"
    exit 1
fi
echo ""

# Test 11: Performance Report Script
echo "Test 11: Verifying performance report script..."
if [ -f "$PROJECT_ROOT/scripts/performance-report.js" ]; then
    if grep -q "generateReport" "$PROJECT_ROOT/scripts/performance-report.js" && \
       grep -q "Core Web Vitals" "$PROJECT_ROOT/scripts/performance-report.js"; then
        echo -e "$PASS Performance report script implemented"
    else
        echo -e "$FAIL Performance report script incomplete"
        exit 1
    fi
else
    echo -e "$FAIL scripts/performance-report.js missing"
    exit 1
fi
echo ""

# Test 12: Documentation
echo "Test 12: Verifying documentation..."
if [ -f "$PROJECT_ROOT/docs/performance-monitoring.md" ]; then
    if grep -q "Core Web Vitals" "$PROJECT_ROOT/docs/performance-monitoring.md" && \
       grep -q "Performance Budgets" "$PROJECT_ROOT/docs/performance-monitoring.md" && \
       grep -q "Lighthouse CI" "$PROJECT_ROOT/docs/performance-monitoring.md"; then
        echo -e "$PASS Performance monitoring documentation complete"
    else
        echo -e "$FAIL Documentation incomplete"
        exit 1
    fi
else
    echo -e "$FAIL docs/performance-monitoring.md missing"
    exit 1
fi
echo ""

# Test 13: Gitignore Entries
echo "Test 13: Verifying gitignore entries..."
if grep -q ".lighthouseci/" "$PROJECT_ROOT/.gitignore" && \
   grep -q "analyze/" "$PROJECT_ROOT/.gitignore"; then
    echo -e "$PASS Performance artifacts in .gitignore"
else
    echo -e "$FAIL Missing gitignore entries"
    exit 1
fi
echo ""

# Test 14: Vercel Analytics Integration
echo "Test 14: Verifying Vercel Analytics integration..."
if grep -q "@vercel/speed-insights" "$PROJECT_ROOT/package.json" && \
   grep -q "SpeedInsights" "$PROJECT_ROOT/app/layout.tsx"; then
    echo -e "$PASS Vercel Analytics integrated"
else
    echo -e "$FAIL Vercel Analytics not properly integrated"
    exit 1
fi
echo ""

# Summary
echo "=================================================="
echo -e "$PASS All tests passed! Performance monitoring is properly configured."
echo "=================================================="
echo ""
echo -e "$INFO Next steps:"
echo "  1. Run 'npm run build' to verify production build"
echo "  2. Run 'npm run build:analyze' to analyze bundle size"
echo "  3. Run 'npm run lighthouse' to test Lighthouse CI locally"
echo "  4. Deploy to Vercel to enable real user monitoring"
echo ""
echo "For more information, see: docs/performance-monitoring.md"
echo ""
