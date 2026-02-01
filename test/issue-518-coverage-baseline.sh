#!/bin/bash

# Issue #518: Coverage Baseline Script
# This script runs coverage analysis and identifies files below 85% coverage threshold
# Usage: ./test/issue-518-coverage-baseline.sh

set -e

echo "========================================="
echo "Issue #518: Test Coverage Baseline Report"
echo "========================================="
echo ""
echo "Target: 85%+ coverage for all components and services"
echo "Critical paths: 100% coverage required"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run Jest coverage
echo "Running Jest coverage analysis..."
npm run test:coverage -- --silent --json --outputFile=/tmp/jest-coverage.json 2>&1 | tail -50

# Check if coverage summary exists
if [ ! -f "coverage/coverage-summary.json" ]; then
  echo -e "${RED}ERROR: Coverage report not found. Tests may have failed.${NC}"
  exit 1
fi

echo ""
echo "========================================="
echo "Coverage Analysis Complete"
echo "=========================================
"

# Parse coverage summary and identify gaps
node -e "
const fs = require('fs');
const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
const total = summary.total;

console.log('OVERALL COVERAGE SUMMARY:');
console.log('========================');
console.log('Lines:      ', total.lines.pct.toFixed(2) + '%', '(' + total.lines.covered + '/' + total.lines.total + ')');
console.log('Statements: ', total.statements.pct.toFixed(2) + '%', '(' + total.statements.covered + '/' + total.statements.total + ')');
console.log('Functions:  ', total.functions.pct.toFixed(2) + '%', '(' + total.functions.covered + '/' + total.functions.total + ')');
console.log('Branches:   ', total.branches.pct.toFixed(2) + '%', '(' + total.branches.covered + '/' + total.branches.total + ')');
console.log('');

// Determine overall status
const threshold = 85;
const passing = total.lines.pct >= threshold &&
                total.statements.pct >= threshold &&
                total.functions.pct >= threshold &&
                total.branches.pct >= threshold;

if (passing) {
  console.log('✓ ALL THRESHOLDS MET (>=' + threshold + '%)');
} else {
  console.log('✗ BELOW THRESHOLD (Target: ' + threshold + '%)');
  console.log('');
  if (total.lines.pct < threshold) console.log('  - Lines coverage needs improvement');
  if (total.statements.pct < threshold) console.log('  - Statements coverage needs improvement');
  if (total.functions.pct < threshold) console.log('  - Functions coverage needs improvement');
  if (total.branches.pct < threshold) console.log('  - Branches coverage needs improvement');
}

console.log('');
console.log('FILES BELOW 85% COVERAGE:');
console.log('========================');

// Collect files below threshold
const filesBelowThreshold = [];
for (const [file, metrics] of Object.entries(summary)) {
  if (file === 'total') continue;

  const lines = metrics.lines.pct;
  const statements = metrics.statements.pct;
  const functions = metrics.functions.pct;
  const branches = metrics.branches.pct;

  const minCoverage = Math.min(lines, statements, functions, branches);

  if (minCoverage < threshold || lines < threshold || statements < threshold || functions < threshold || branches < threshold) {
    filesBelowThreshold.push({
      file: file.replace('/Users/aideveloper/ainative-website-nextjs-staging/', ''),
      lines,
      statements,
      functions,
      branches,
      minCoverage
    });
  }
}

// Sort by minimum coverage (worst first)
filesBelowThreshold.sort((a, b) => a.minCoverage - b.minCoverage);

if (filesBelowThreshold.length === 0) {
  console.log('✓ All files meet or exceed 85% coverage threshold!');
} else {
  console.log('Found ' + filesBelowThreshold.length + ' files below threshold:\n');

  // Categorize files
  const services = [];
  const components = [];
  const pages = [];
  const utils = [];

  filesBelowThreshold.forEach(item => {
    if (item.file.includes('/services/')) services.push(item);
    else if (item.file.includes('/components/')) components.push(item);
    else if (item.file.includes('/app/')) pages.push(item);
    else if (item.file.includes('/utils/') || item.file.includes('/lib/')) utils.push(item);
  });

  const printCategory = (title, items) => {
    if (items.length === 0) return;
    console.log(title + ' (' + items.length + ' files):');
    console.log('----------------------------------------');
    items.slice(0, 10).forEach(item => {
      const status = item.minCoverage < 50 ? '🔴' : item.minCoverage < 70 ? '🟡' : '🟠';
      console.log(status + ' ' + item.file);
      console.log('   Lines: ' + item.lines.toFixed(1) + '%  Functions: ' + item.functions.toFixed(1) + '%  Branches: ' + item.branches.toFixed(1) + '%');
    });
    if (items.length > 10) {
      console.log('   ... and ' + (items.length - 10) + ' more');
    }
    console.log('');
  };

  printCategory('CRITICAL SERVICES (PRIORITY 1)', services.filter(s =>
    s.file.includes('earningsService') ||
    s.file.includes('payoutService') ||
    s.file.includes('stripeConnectService') ||
    s.file.includes('authService') ||
    s.file.includes('billingService')
  ));

  printCategory('OTHER SERVICES', services.filter(s =>
    !s.file.includes('earningsService') &&
    !s.file.includes('payoutService') &&
    !s.file.includes('stripeConnectService') &&
    !s.file.includes('authService') &&
    !s.file.includes('billingService')
  ));

  printCategory('COMPONENTS', components);
  printCategory('PAGES', pages);
  printCategory('UTILITIES & LIBS', utils);
}

console.log('');
console.log('NEXT STEPS:');
console.log('===========');
console.log('1. Write tests for critical services (Priority 1)');
console.log('2. Improve component test coverage');
console.log('3. Add integration tests for user flows');
console.log('4. Update jest.config.js with 85% threshold');
console.log('5. Run verification: npm run test:coverage');
console.log('');
"

echo "Coverage report available at: coverage/lcov-report/index.html"
echo ""
