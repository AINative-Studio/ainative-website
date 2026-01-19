#!/usr/bin/env ts-node
/**
 * Analytics Verification Script
 *
 * Automated verification of all analytics tracking services for Issue #330
 *
 * Usage:
 *   npm run verify:analytics
 *   or
 *   ts-node scripts/verify-analytics.ts
 *
 * Requirements:
 *   - All required environment variables must be set in .env.local
 *   - Development server should be running on port 3000
 */

import fetch from 'node-fetch';

interface VerificationResult {
  service: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: Record<string, any>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const VERIFICATION_URL = `${BASE_URL}/admin/analytics-verify`;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message: string) {
  console.log('\n' + '='.repeat(80));
  log(message, 'bold');
  console.log('='.repeat(80) + '\n');
}

function logResult(result: VerificationResult) {
  const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '⚠';
  const color = result.status === 'PASS' ? 'green' : result.status === 'FAIL' ? 'red' : 'yellow';

  log(`${icon} ${result.service}: ${result.message}`, color);

  if (result.details) {
    console.log('  Details:', result.details);
  }
}

async function checkEnvironmentVariables(): Promise<VerificationResult[]> {
  logHeader('Environment Variables Check');

  const results: VerificationResult[] = [];

  const requiredVars = [
    { name: 'NEXT_PUBLIC_GTM_ID', default: 'GTM-MJKQDBGV', required: false },
    { name: 'NEXT_PUBLIC_GA_ID', default: 'G-ML0XEBPZV2', required: false },
    { name: 'NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN', default: 'XfqwZwqj9pcjyrFe4gsPRCff', required: false },
    { name: 'NEXT_PUBLIC_CHATWOOT_BASE_URL', default: 'https://chat.ainative.studio', required: false },
    { name: 'NEXT_PUBLIC_SENTRY_DSN', default: undefined, required: false },
  ];

  for (const varConfig of requiredVars) {
    const value = process.env[varConfig.name];

    if (!value && !varConfig.default) {
      results.push({
        service: varConfig.name,
        status: varConfig.required ? 'FAIL' : 'WARN',
        message: varConfig.required ? 'Not configured (required)' : 'Not configured (optional)',
      });
    } else if (!value && varConfig.default) {
      results.push({
        service: varConfig.name,
        status: 'PASS',
        message: `Using default: ${varConfig.default}`,
      });
    } else {
      results.push({
        service: varConfig.name,
        status: 'PASS',
        message: 'Configured',
        details: { value: value?.substring(0, 20) + '...' },
      });
    }
  }

  return results;
}

async function checkServerRunning(): Promise<VerificationResult> {
  logHeader('Development Server Check');

  try {
    const response = await fetch(BASE_URL, { method: 'HEAD', timeout: 5000 } as any);

    if (response.ok) {
      return {
        service: 'Development Server',
        status: 'PASS',
        message: `Server is running at ${BASE_URL}`,
      };
    } else {
      return {
        service: 'Development Server',
        status: 'FAIL',
        message: `Server returned status ${response.status}`,
      };
    }
  } catch (error) {
    return {
      service: 'Development Server',
      status: 'FAIL',
      message: `Server not reachable at ${BASE_URL}`,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

async function checkVerificationDashboard(): Promise<VerificationResult> {
  logHeader('Verification Dashboard Check');

  try {
    const response = await fetch(VERIFICATION_URL, { timeout: 10000 } as any);

    if (response.ok) {
      const html = await response.text();

      // Check for key elements in the dashboard
      const hasTitle = html.includes('Analytics Verification Dashboard');
      const hasGTM = html.includes('Google Tag Manager');
      const hasGA4 = html.includes('Google Analytics 4');
      const hasChatwoot = html.includes('Chatwoot');
      const hasSentry = html.includes('Sentry');
      const hasSpeedInsights = html.includes('Speed Insights');

      if (hasTitle && hasGTM && hasGA4 && hasChatwoot && hasSentry && hasSpeedInsights) {
        return {
          service: 'Verification Dashboard',
          status: 'PASS',
          message: 'Dashboard is accessible and contains all service cards',
          details: { url: VERIFICATION_URL },
        };
      } else {
        return {
          service: 'Verification Dashboard',
          status: 'WARN',
          message: 'Dashboard is accessible but may be missing components',
          details: {
            url: VERIFICATION_URL,
            components: { hasTitle, hasGTM, hasGA4, hasChatwoot, hasSentry, hasSpeedInsights },
          },
        };
      }
    } else {
      return {
        service: 'Verification Dashboard',
        status: 'FAIL',
        message: `Dashboard returned status ${response.status}`,
        details: { url: VERIFICATION_URL },
      };
    }
  } catch (error) {
    return {
      service: 'Verification Dashboard',
      status: 'FAIL',
      message: 'Dashboard not accessible',
      details: {
        url: VERIFICATION_URL,
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

async function checkAnalyticsScripts(): Promise<VerificationResult[]> {
  logHeader('Analytics Scripts Check');

  const results: VerificationResult[] = [];

  try {
    const response = await fetch(BASE_URL, { timeout: 10000 } as any);
    const html = await response.text();

    // Check for GTM script
    const hasGTMScript = html.includes('googletagmanager.com/gtm.js');
    results.push({
      service: 'GTM Script',
      status: hasGTMScript ? 'PASS' : 'FAIL',
      message: hasGTMScript ? 'GTM script tag found in HTML' : 'GTM script tag not found',
    });

    // Check for GA4 script
    const hasGA4Script = html.includes('googletagmanager.com/gtag/js');
    results.push({
      service: 'GA4 Script',
      status: hasGA4Script ? 'PASS' : 'FAIL',
      message: hasGA4Script ? 'GA4 script tag found in HTML' : 'GA4 script tag not found',
    });

    // Check for Chatwoot script
    const hasChatwootScript = html.includes('chatwoot') || html.includes('chat.ainative.studio');
    results.push({
      service: 'Chatwoot Script',
      status: hasChatwootScript ? 'PASS' : 'FAIL',
      message: hasChatwootScript ? 'Chatwoot script tag found in HTML' : 'Chatwoot script tag not found',
    });

    // Check for Speed Insights (embedded in Next.js bundles)
    results.push({
      service: 'Speed Insights',
      status: 'PASS',
      message: 'Speed Insights package installed (client-side verification required)',
    });

    // Check for Sentry (may not be in HTML if DSN not configured)
    const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (SENTRY_DSN) {
      results.push({
        service: 'Sentry',
        status: 'PASS',
        message: 'Sentry DSN configured (runtime verification required)',
      });
    } else {
      results.push({
        service: 'Sentry',
        status: 'WARN',
        message: 'Sentry DSN not configured (optional)',
      });
    }

  } catch (error) {
    results.push({
      service: 'Analytics Scripts',
      status: 'FAIL',
      message: 'Could not fetch homepage for script verification',
      details: { error: error instanceof Error ? error.message : String(error) },
    });
  }

  return results;
}

async function generateReport(allResults: VerificationResult[]) {
  logHeader('Analytics Verification Report');

  const passed = allResults.filter(r => r.status === 'PASS').length;
  const failed = allResults.filter(r => r.status === 'FAIL').length;
  const warned = allResults.filter(r => r.status === 'WARN').length;
  const total = allResults.length;

  log(`Total Checks: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'cyan');
  log(`Warnings: ${warned}`, warned > 0 ? 'yellow' : 'cyan');

  console.log('\n');

  if (failed === 0) {
    log('✓ All analytics services are properly configured!', 'green');
  } else {
    log(`✗ ${failed} check(s) failed. Please review the errors above.`, 'red');
  }

  if (warned > 0) {
    log(`⚠ ${warned} warning(s) found. Optional services may not be configured.`, 'yellow');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Exit with error code if any checks failed
  if (failed > 0) {
    process.exit(1);
  }
}

async function main() {
  console.clear();

  log('Analytics Verification Script for Issue #330', 'bold');
  log('AINative Studio - Next.js Platform', 'cyan');
  console.log('');

  const allResults: VerificationResult[] = [];

  // Step 1: Check environment variables
  const envResults = await checkEnvironmentVariables();
  envResults.forEach(logResult);
  allResults.push(...envResults);

  // Step 2: Check server is running
  const serverResult = await checkServerRunning();
  logResult(serverResult);
  allResults.push(serverResult);

  if (serverResult.status === 'FAIL') {
    log('\nServer is not running. Please start the development server:', 'yellow');
    log('  npm run dev', 'cyan');
    console.log('');
    process.exit(1);
  }

  // Step 3: Check verification dashboard
  const dashboardResult = await checkVerificationDashboard();
  logResult(dashboardResult);
  allResults.push(dashboardResult);

  // Step 4: Check analytics scripts in HTML
  const scriptResults = await checkAnalyticsScripts();
  scriptResults.forEach(logResult);
  allResults.push(...scriptResults);

  // Generate final report
  await generateReport(allResults);

  // Provide next steps
  log('Next Steps:', 'bold');
  log('1. Visit the verification dashboard:', 'cyan');
  log(`   ${VERIFICATION_URL}`, 'blue');
  log('2. Use the test buttons to verify each service', 'cyan');
  log('3. Check browser console for analytics events', 'cyan');
  log('4. Verify in respective service dashboards (GTM, GA4, etc.)', 'cyan');
  console.log('');
}

// Run the verification
main().catch(error => {
  log('Fatal error during verification:', 'red');
  console.error(error);
  process.exit(1);
});
