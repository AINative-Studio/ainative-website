#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes Next.js build output and generates comprehensive bundle report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const THRESHOLDS = {
  // Size thresholds in KB
  totalJSSize: 500,
  firstLoadJS: 300,
  routeSize: 50,
  sharedChunk: 100,
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, COLORS.cyan);
  log(`  ${title}`, COLORS.bright + COLORS.cyan);
  log(`${'='.repeat(60)}`, COLORS.cyan);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getBuildStats() {
  const buildManifestPath = path.join(process.cwd(), '.next/build-manifest.json');
  const pagesManifestPath = path.join(process.cwd(), '.next/server/pages-manifest.json');

  if (!fs.existsSync(buildManifestPath)) {
    log('Build manifest not found. Run "npm run build" first.', COLORS.red);
    process.exit(1);
  }

  const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
  const pagesManifest = fs.existsSync(pagesManifestPath)
    ? JSON.parse(fs.readFileSync(pagesManifestPath, 'utf8'))
    : {};

  return { buildManifest, pagesManifest };
}

function analyzeChunks() {
  logSection('Analyzing JavaScript Chunks');

  const staticDir = path.join(process.cwd(), '.next/static/chunks');
  if (!fs.existsSync(staticDir)) {
    log('Static chunks directory not found.', COLORS.yellow);
    return;
  }

  const chunks = [];
  const files = fs.readdirSync(staticDir);

  files.forEach((file) => {
    if (file.endsWith('.js')) {
      const filePath = path.join(staticDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;

      chunks.push({
        name: file,
        size: stats.size,
        sizeKB: sizeKB.toFixed(2),
      });
    }
  });

  // Sort by size descending
  chunks.sort((a, b) => b.size - a.size);

  // Display top 10 largest chunks
  log('\nTop 10 Largest JavaScript Chunks:', COLORS.bright);
  chunks.slice(0, 10).forEach((chunk, index) => {
    const warning = parseFloat(chunk.sizeKB) > THRESHOLDS.routeSize ? ' ⚠️' : '';
    log(`${index + 1}. ${chunk.name}: ${chunk.sizeKB} KB${warning}`);
  });

  // Total JS size
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const totalSizeKB = totalSize / 1024;
  const totalWarning = totalSizeKB > THRESHOLDS.totalJSSize ? ' ⚠️  EXCEEDS THRESHOLD' : ' ✓';

  log(
    `\nTotal JavaScript Size: ${totalSizeKB.toFixed(2)} KB${totalWarning}`,
    totalSizeKB > THRESHOLDS.totalJSSize ? COLORS.red : COLORS.green
  );

  return { chunks, totalSize };
}

function analyzePages() {
  logSection('Analyzing Page Sizes');

  const pagesDir = path.join(process.cwd(), '.next/server/pages');
  if (!fs.existsSync(pagesDir)) {
    log('Pages directory not found.', COLORS.yellow);
    return;
  }

  const pages = [];

  function scanDirectory(dir, basePath = '') {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        scanDirectory(filePath, path.join(basePath, file));
      } else if (file.endsWith('.js') || file.endsWith('.html')) {
        const pagePath = path.join(basePath, file);
        const sizeKB = stats.size / 1024;

        pages.push({
          path: pagePath,
          size: stats.size,
          sizeKB: sizeKB.toFixed(2),
        });
      }
    });
  }

  scanDirectory(pagesDir);

  // Sort by size descending
  pages.sort((a, b) => b.size - a.size);

  log('\nTop 10 Largest Pages:', COLORS.bright);
  pages.slice(0, 10).forEach((page, index) => {
    const warning = parseFloat(page.sizeKB) > THRESHOLDS.routeSize ? ' ⚠️' : '';
    log(`${index + 1}. ${page.path}: ${page.sizeKB} KB${warning}`);
  });

  return pages;
}

function analyzeDuplicates() {
  logSection('Checking for Duplicate Dependencies');

  try {
    log('Running dependency check...', COLORS.cyan);
    const output = execSync('npx depcheck --json', { encoding: 'utf8' });
    const result = JSON.parse(output);

    if (result.dependencies && result.dependencies.length > 0) {
      log('\nUnused Dependencies:', COLORS.yellow);
      result.dependencies.forEach((dep) => {
        log(`  - ${dep}`, COLORS.yellow);
      });
    } else {
      log('\n✓ No unused dependencies found', COLORS.green);
    }

    if (result.devDependencies && result.devDependencies.length > 0) {
      log('\nUnused Dev Dependencies:', COLORS.yellow);
      result.devDependencies.forEach((dep) => {
        log(`  - ${dep}`, COLORS.yellow);
      });
    }
  } catch (error) {
    log('Could not run dependency check. Install depcheck: npm install -g depcheck', COLORS.red);
  }
}

function generateRecommendations(stats) {
  logSection('Optimization Recommendations');

  const recommendations = [];

  if (stats.totalSize && stats.totalSize / 1024 > THRESHOLDS.totalJSSize) {
    recommendations.push({
      priority: 'HIGH',
      issue: 'Total bundle size exceeds threshold',
      solution: 'Consider code splitting, lazy loading, and removing unused dependencies',
    });
  }

  if (stats.chunks) {
    const largeChunks = stats.chunks.filter(
      (chunk) => parseFloat(chunk.sizeKB) > THRESHOLDS.sharedChunk
    );
    if (largeChunks.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: `${largeChunks.length} chunks exceed ${THRESHOLDS.sharedChunk}KB`,
        solution: 'Review large chunks and split into smaller modules',
      });
    }
  }

  recommendations.push({
    priority: 'INFO',
    issue: 'General optimization',
    solution: 'Enable tree shaking, minimize dependencies, use dynamic imports',
  });

  if (recommendations.length === 0) {
    log('✓ No critical issues found!', COLORS.green);
  } else {
    recommendations.forEach((rec) => {
      const color =
        rec.priority === 'HIGH' ? COLORS.red : rec.priority === 'MEDIUM' ? COLORS.yellow : COLORS.blue;

      log(`\n[${rec.priority}] ${rec.issue}`, color);
      log(`  → ${rec.solution}`, COLORS.reset);
    });
  }
}

function generateReport(stats) {
  logSection('Generating Bundle Report');

  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, `bundle-analysis-${Date.now()}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalJSSize: stats.totalSize ? formatBytes(stats.totalSize) : 'N/A',
      totalChunks: stats.chunks ? stats.chunks.length : 0,
      totalPages: stats.pages ? stats.pages.length : 0,
    },
    chunks: stats.chunks || [],
    pages: stats.pages || [],
    thresholds: THRESHOLDS,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n✓ Report saved to: ${reportPath}`, COLORS.green);
}

// Main execution
function main() {
  log('\n🔍  Starting Bundle Analysis...', COLORS.bright + COLORS.cyan);

  const stats = {};

  // Analyze chunks
  const chunkAnalysis = analyzeChunks();
  if (chunkAnalysis) {
    stats.chunks = chunkAnalysis.chunks;
    stats.totalSize = chunkAnalysis.totalSize;
  }

  // Analyze pages
  const pagesAnalysis = analyzePages();
  if (pagesAnalysis) {
    stats.pages = pagesAnalysis;
  }

  // Check duplicates
  analyzeDuplicates();

  // Generate recommendations
  generateRecommendations(stats);

  // Generate report
  generateReport(stats);

  logSection('Bundle Analysis Complete');
  log(
    '\nFor detailed visualization, run: npm run build:analyze\n',
    COLORS.bright + COLORS.blue
  );
}

main();
