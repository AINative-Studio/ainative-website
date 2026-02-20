#!/usr/bin/env ts-node

/**
 * Post-Deployment Verification Script
 *
 * This script validates a deployed application is working correctly.
 * Run this immediately after Railway deployment.
 *
 * Usage:
 *   npm run post-deploy-verify                                    # Test production
 *   npm run post-deploy-verify -- --url https://staging.example.com  # Test specific URL
 *
 * Exit codes:
 *   0 - Deployment is healthy
 *   1 - Critical issues found
 */

import axios, { AxiosInstance } from 'axios';

interface VerificationResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
  severity: 'critical' | 'warning' | 'info';
}

interface VerificationReport {
  url: string;
  timestamp: string;
  results: VerificationResult[];
  score: number;
  passed: number;
  failed: number;
  warnings: number;
  healthy: boolean;
}

class PostDeploymentVerifier {
  private client: AxiosInstance;
  private baseURL: string;
  private results: VerificationResult[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      validateStatus: () => true, // Don't throw on any status
      headers: {
        'User-Agent': 'AINative-PostDeployment-Verifier/1.0'
      }
    });
  }

  /**
   * Add a verification result
   */
  private addResult(
    name: string,
    passed: boolean,
    message: string,
    severity: 'critical' | 'warning' | 'info' = 'critical',
    duration?: number
  ) {
    this.results.push({ name, passed, message, severity, duration });
  }

  /**
   * Test if the application is reachable
   */
  private async testReachability(): Promise<void> {
    console.log('\n🌐 Testing application reachability...');

    const startTime = Date.now();
    try {
      const response = await this.client.get('/');
      const duration = Date.now() - startTime;

      if (response.status === 200) {
        this.addResult(
          'reachability',
          true,
          `✓ Application is reachable (${duration}ms)`,
          'info',
          duration
        );
      } else {
        this.addResult(
          'reachability',
          false,
          `✗ Application returned status ${response.status}`,
          'critical',
          duration
        );
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.addResult(
        'reachability',
        false,
        `✗ Cannot reach application: ${error.message}`,
        'critical',
        duration
      );
    }
  }

  /**
   * Test response time
   */
  private async testResponseTime(): Promise<void> {
    console.log('\n⚡ Testing response time...');

    const startTime = Date.now();
    try {
      const response = await this.client.get('/');
      const duration = Date.now() - startTime;

      if (duration < 3000) {
        this.addResult(
          'response_time',
          true,
          `✓ Fast response time (${duration}ms)`,
          'info',
          duration
        );
      } else if (duration < 5000) {
        this.addResult(
          'response_time',
          true,
          `⚠ Slow response time (${duration}ms)`,
          'warning',
          duration
        );
      } else {
        this.addResult(
          'response_time',
          false,
          `✗ Very slow response time (${duration}ms)`,
          'critical',
          duration
        );
      }
    } catch (error) {
      this.addResult(
        'response_time',
        false,
        '✗ Failed to measure response time',
        'warning'
      );
    }
  }

  /**
   * Test security headers
   */
  private async testSecurityHeaders(): Promise<void> {
    console.log('\n🛡️  Testing security headers...');

    try {
      const response = await this.client.get('/');

      const securityHeaders = [
        { name: 'X-Frame-Options', required: true },
        { name: 'X-Content-Type-Options', required: true },
        { name: 'Strict-Transport-Security', required: this.baseURL.startsWith('https://') },
      ];

      securityHeaders.forEach(({ name, required }) => {
        const headerValue = response.headers[name.toLowerCase()];

        if (headerValue) {
          this.addResult(
            `header_${name}`,
            true,
            `✓ ${name} header is set`,
            'info'
          );
        } else if (required) {
          this.addResult(
            `header_${name}`,
            false,
            `✗ Missing ${name} header`,
            'critical'
          );
        } else {
          this.addResult(
            `header_${name}`,
            false,
            `⚠ Missing optional ${name} header`,
            'warning'
          );
        }
      });

      // Check for X-Powered-By (should not be present)
      if (response.headers['x-powered-by']) {
        this.addResult(
          'header_x_powered_by',
          false,
          '⚠ X-Powered-By header is exposed',
          'warning'
        );
      } else {
        this.addResult(
          'header_x_powered_by',
          true,
          '✓ X-Powered-By header is hidden',
          'info'
        );
      }
    } catch (error) {
      this.addResult(
        'security_headers',
        false,
        '✗ Failed to test security headers',
        'warning'
      );
    }
  }

  /**
   * Test static assets
   */
  private async testStaticAssets(): Promise<void> {
    console.log('\n📦 Testing static assets...');

    const assets = [
      { path: '/favicon.ico', name: 'Favicon' }
    ];

    for (const asset of assets) {
      try {
        const response = await this.client.get(asset.path);

        if (response.status === 200) {
          this.addResult(
            `asset_${asset.name}`,
            true,
            `✓ ${asset.name} is accessible`,
            'info'
          );
        } else {
          this.addResult(
            `asset_${asset.name}`,
            false,
            `⚠ ${asset.name} returned status ${response.status}`,
            'warning'
          );
        }
      } catch (error) {
        this.addResult(
          `asset_${asset.name}`,
          false,
          `⚠ Failed to load ${asset.name}`,
          'warning'
        );
      }
    }
  }

  /**
   * Test authentication endpoints
   */
  private async testAuthEndpoints(): Promise<void> {
    console.log('\n🔒 Testing authentication endpoints...');

    const authEndpoints = [
      { path: '/api/auth/providers', name: 'NextAuth Providers' },
      { path: '/api/auth/csrf', name: 'CSRF Token' }
    ];

    for (const endpoint of authEndpoints) {
      try {
        const response = await this.client.get(endpoint.path);

        if (response.status === 200) {
          this.addResult(
            `auth_${endpoint.name}`,
            true,
            `✓ ${endpoint.name} endpoint is working`,
            'info'
          );
        } else if (response.status === 404) {
          this.addResult(
            `auth_${endpoint.name}`,
            false,
            `⚠ ${endpoint.name} endpoint not found`,
            'warning'
          );
        } else {
          this.addResult(
            `auth_${endpoint.name}`,
            false,
            `✗ ${endpoint.name} endpoint error (status ${response.status})`,
            'critical'
          );
        }
      } catch (error) {
        this.addResult(
          `auth_${endpoint.name}`,
          false,
          `✗ Failed to test ${endpoint.name}`,
          'critical'
        );
      }
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    console.log('\n🚨 Testing error handling...');

    try {
      const response = await this.client.get('/this-page-does-not-exist-12345');

      if (response.status === 404) {
        this.addResult(
          'error_404',
          true,
          '✓ 404 errors are handled correctly',
          'info'
        );

        // Check that stack traces are not exposed
        const bodyStr = typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);

        if (bodyStr.includes('at Object.') || bodyStr.includes('/Users/') || bodyStr.includes('C:\\')) {
          this.addResult(
            'error_stack_trace',
            false,
            '✗ Stack traces are exposed in error responses',
            'critical'
          );
        } else {
          this.addResult(
            'error_stack_trace',
            true,
            '✓ Stack traces are not exposed',
            'info'
          );
        }
      } else {
        this.addResult(
          'error_404',
          false,
          `⚠ Unexpected status for 404: ${response.status}`,
          'warning'
        );
      }
    } catch (error) {
      this.addResult(
        'error_handling',
        false,
        '✗ Failed to test error handling',
        'warning'
      );
    }
  }

  /**
   * Test compression
   */
  private async testCompression(): Promise<void> {
    console.log('\n📦 Testing compression...');

    try {
      const response = await this.client.get('/', {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });

      const contentEncoding = response.headers['content-encoding'];

      if (contentEncoding && ['gzip', 'br', 'deflate'].includes(contentEncoding)) {
        this.addResult(
          'compression',
          true,
          `✓ Compression is enabled (${contentEncoding})`,
          'info'
        );
      } else {
        this.addResult(
          'compression',
          false,
          '⚠ Compression is not enabled',
          'warning'
        );
      }
    } catch (error) {
      this.addResult(
        'compression',
        false,
        '⚠ Failed to test compression',
        'warning'
      );
    }
  }

  /**
   * Run all verification tests
   */
  public async verify(): Promise<VerificationReport> {
    console.log('🚀 Post-Deployment Verification');
    console.log(`🎯 Target: ${this.baseURL}`);
    console.log('================================\n');

    await this.testReachability();
    await this.testResponseTime();
    await this.testSecurityHeaders();
    await this.testStaticAssets();
    await this.testAuthEndpoints();
    await this.testErrorHandling();
    await this.testCompression();

    return this.generateReport();
  }

  /**
   * Generate verification report
   */
  private generateReport(): VerificationReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed && r.severity === 'critical').length;
    const warnings = this.results.filter(r => !r.passed && r.severity === 'warning').length;

    const totalTests = this.results.length;
    const score = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

    const healthy = failed === 0 && score >= 80;

    return {
      url: this.baseURL,
      timestamp: new Date().toISOString(),
      results: this.results,
      score,
      passed,
      failed,
      warnings,
      healthy
    };
  }
}

/**
 * Main execution
 */
async function main() {
  // Get URL from command line or use default
  const args = process.argv.slice(2);
  const urlIndex = args.indexOf('--url');
  const baseURL = urlIndex !== -1 && args[urlIndex + 1]
    ? args[urlIndex + 1]
    : process.env.DEPLOYMENT_URL || 'https://www.ainative.studio';

  const verifier = new PostDeploymentVerifier(baseURL);
  const report = await verifier.verify();

  // Print results
  console.log('\n================================');
  console.log('📊 Verification Results\n');

  report.results.forEach(result => {
    const color = result.passed
      ? '\x1b[32m'
      : (result.severity === 'warning' ? '\x1b[33m' : '\x1b[31m');
    console.log(`${color}${result.message}\x1b[0m`);
  });

  console.log('\n================================');
  console.log(`\n✓ Passed: ${report.passed}`);
  console.log(`✗ Failed: ${report.failed}`);
  console.log(`⚠ Warnings: ${report.warnings}`);
  console.log(`\n📈 Deployment Health Score: ${report.score}%`);
  console.log(`\n🏥 Status: ${report.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}\n`);

  // Write report to file
  const fs = require('fs');
  const reportPath = 'deployment-verification-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to ${reportPath}\n`);

  // Determine exit code
  if (!report.healthy) {
    console.error('❌ Deployment verification FAILED. Critical issues detected.\n');
    process.exit(1);
  }

  if (report.warnings > 0) {
    console.warn(`⚠️  Deployment has ${report.warnings} warnings. Review recommended.\n`);
  } else {
    console.log('✅ Deployment verification PASSED! All systems operational.\n');
  }

  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Post-deployment verification failed:', error);
    process.exit(1);
  });
}

export { PostDeploymentVerifier };
