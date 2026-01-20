/**
 * Performance Report Generator
 *
 * Generates comprehensive performance reports from Lighthouse CI results.
 * Usage: node scripts/performance-report.js
 */

const fs = require('fs');
const path = require('path');

const LIGHTHOUSE_DIR = path.join(process.cwd(), '.lighthouseci');
const MANIFEST_PATH = path.join(LIGHTHOUSE_DIR, 'manifest.json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function getScoreColor(score) {
  if (score >= 0.9) return 'green';
  if (score >= 0.5) return 'yellow';
  return 'red';
}

function formatScore(score) {
  const percentage = Math.round(score * 100);
  const color = getScoreColor(score);
  return colorize(`${percentage}`, color);
}

function generateReport() {
  console.log(colorize('\n=== Performance Report ===\n', 'bright'));

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(colorize('Error: Lighthouse CI manifest not found.', 'red'));
    console.log('Run "npm run lighthouse" first to generate reports.\n');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  if (!manifest || manifest.length === 0) {
    console.error(colorize('Error: No reports found in manifest.', 'red'));
    process.exit(1);
  }

  // Overall statistics
  let totalPerformance = 0;
  let totalAccessibility = 0;
  let totalBestPractices = 0;
  let totalSEO = 0;

  console.log(colorize('Page-by-Page Results:', 'cyan'));
  console.log('━'.repeat(80));

  manifest.forEach((report, index) => {
    const url = report.url || 'Unknown URL';
    const summary = report.summary || {};

    const performance = summary.performance || 0;
    const accessibility = summary.accessibility || 0;
    const bestPractices = summary['best-practices'] || 0;
    const seo = summary.seo || 0;

    totalPerformance += performance;
    totalAccessibility += accessibility;
    totalBestPractices += bestPractices;
    totalSEO += seo;

    console.log(`\n${colorize(`${index + 1}. ${url}`, 'bright')}`);
    console.log(`  Performance:     ${formatScore(performance)}`);
    console.log(`  Accessibility:   ${formatScore(accessibility)}`);
    console.log(`  Best Practices:  ${formatScore(bestPractices)}`);
    console.log(`  SEO:             ${formatScore(seo)}`);
  });

  console.log('\n' + '━'.repeat(80));
  console.log(colorize('Overall Averages:', 'cyan'));
  console.log('━'.repeat(80));

  const count = manifest.length;
  const avgPerformance = totalPerformance / count;
  const avgAccessibility = totalAccessibility / count;
  const avgBestPractices = totalBestPractices / count;
  const avgSEO = totalSEO / count;

  console.log(`  Performance:     ${formatScore(avgPerformance)}`);
  console.log(`  Accessibility:   ${formatScore(avgAccessibility)}`);
  console.log(`  Best Practices:  ${formatScore(avgBestPractices)}`);
  console.log(`  SEO:             ${formatScore(avgSEO)}`);

  console.log('\n' + '━'.repeat(80));

  // Core Web Vitals Summary
  console.log(colorize('\nCore Web Vitals:', 'cyan'));
  console.log('━'.repeat(80));

  manifest.forEach((report, index) => {
    const url = report.url || 'Unknown URL';
    const reportPath = path.join(LIGHTHOUSE_DIR, report.jsonPath);

    if (fs.existsSync(reportPath)) {
      const fullReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const audits = fullReport.audits || {};

      console.log(`\n${colorize(`${index + 1}. ${url}`, 'bright')}`);

      // LCP
      const lcp = audits['largest-contentful-paint'];
      if (lcp) {
        const lcpValue = lcp.numericValue / 1000;
        const lcpColor = lcpValue <= 2.5 ? 'green' : lcpValue <= 4.0 ? 'yellow' : 'red';
        console.log(`  LCP: ${colorize(`${lcpValue.toFixed(2)}s`, lcpColor)}`);
      }

      // FCP
      const fcp = audits['first-contentful-paint'];
      if (fcp) {
        const fcpValue = fcp.numericValue / 1000;
        const fcpColor = fcpValue <= 1.8 ? 'green' : fcpValue <= 3.0 ? 'yellow' : 'red';
        console.log(`  FCP: ${colorize(`${fcpValue.toFixed(2)}s`, fcpColor)}`);
      }

      // TBT
      const tbt = audits['total-blocking-time'];
      if (tbt) {
        const tbtValue = tbt.numericValue;
        const tbtColor = tbtValue <= 200 ? 'green' : tbtValue <= 600 ? 'yellow' : 'red';
        console.log(`  TBT: ${colorize(`${tbtValue.toFixed(0)}ms`, tbtColor)}`);
      }

      // CLS
      const cls = audits['cumulative-layout-shift'];
      if (cls) {
        const clsValue = cls.numericValue;
        const clsColor = clsValue <= 0.1 ? 'green' : clsValue <= 0.25 ? 'yellow' : 'red';
        console.log(`  CLS: ${colorize(`${clsValue.toFixed(3)}`, clsColor)}`);
      }

      // Speed Index
      const si = audits['speed-index'];
      if (si) {
        const siValue = si.numericValue / 1000;
        const siColor = siValue <= 3.4 ? 'green' : siValue <= 5.8 ? 'yellow' : 'red';
        console.log(`  Speed Index: ${colorize(`${siValue.toFixed(2)}s`, siColor)}`);
      }
    }
  });

  console.log('\n' + '━'.repeat(80));
  console.log(colorize('\nReport complete!', 'green'));
  console.log(`Full reports available at: ${LIGHTHOUSE_DIR}\n`);
}

// Run the report
try {
  generateReport();
} catch (error) {
  console.error(colorize(`\nError generating report: ${error.message}`, 'red'));
  process.exit(1);
}
