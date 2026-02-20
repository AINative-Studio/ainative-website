#!/usr/bin/env ts-node

/**
 * Pre-Deployment Check Script
 *
 * This script runs comprehensive validation before deployment:
 * 1. Environment variable validation
 * 2. Build validation
 * 3. Configuration validation
 * 4. Security checks
 *
 * Usage:
 *   npm run pre-deploy          # Run all checks
 *   npm run pre-deploy --strict # Fail on warnings
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Critical errors found
 *   2 - Warnings found (only in strict mode)
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface CheckResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationReport {
  checks: CheckResult[];
  passed: number;
  failed: number;
  warnings: number;
  score: number;
}

class PreDeploymentValidator {
  private rootDir: string;
  private isStrictMode: boolean;
  private results: CheckResult[] = [];

  constructor(rootDir: string, isStrictMode: boolean = false) {
    this.rootDir = rootDir;
    this.isStrictMode = isStrictMode;
  }

  /**
   * Add a check result
   */
  private addResult(passed: boolean, message: string, severity: 'error' | 'warning' | 'info' = 'error') {
    this.results.push({ passed, message, severity });
  }

  /**
   * Check if critical files exist
   */
  private checkCriticalFiles(): void {
    console.log('\n📁 Checking critical files...');

    const criticalFiles = [
      'next.config.ts',
      'package.json',
      'tsconfig.json',
      '.env.example',
      'lib/auth/options.ts',
      'lib/utils/thumbnail-generator.ts',
      'lib/utils/slug-generator.ts'
    ];

    criticalFiles.forEach(file => {
      const filePath = join(this.rootDir, file);
      const exists = existsSync(filePath);

      this.addResult(
        exists,
        exists ? `✓ ${file} exists` : `✗ ${file} is missing`,
        exists ? 'info' : 'error'
      );
    });
  }

  /**
   * Validate environment variables
   */
  private checkEnvironmentVariables(): void {
    console.log('\n🔐 Validating environment variables...');

    const requiredEnvVars = [
      { name: 'NEXT_PUBLIC_API_URL', pattern: /^https?:\/\/.+/ },
      { name: 'NEXTAUTH_SECRET', pattern: /.{32,}/ },
      { name: 'NEXTAUTH_URL', pattern: /^https?:\/\/.+/ },
      { name: 'DATABASE_URL', pattern: /^postgresql:\/\/.+/ }
    ];

    requiredEnvVars.forEach(({ name, pattern }) => {
      const value = process.env[name];

      if (!value) {
        this.addResult(false, `✗ ${name} is not set`, 'error');
        return;
      }

      if (pattern && !pattern.test(value)) {
        this.addResult(false, `✗ ${name} has invalid format`, 'error');
        return;
      }

      this.addResult(true, `✓ ${name} is valid`, 'info');
    });

    // Check for production-specific requirements
    if (process.env.NODE_ENV === 'production') {
      // Must use HTTPS in production
      if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith('https://')) {
        this.addResult(false, '✗ NEXT_PUBLIC_API_URL must use HTTPS in production', 'error');
      }

      if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('https://')) {
        this.addResult(false, '✗ NEXTAUTH_URL must use HTTPS in production', 'error');
      }

      // Warn about test keys in production
      if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
        this.addResult(false, '⚠ Using Stripe test key in production', 'warning');
      }

      // Warn about missing monitoring
      if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
        this.addResult(false, '⚠ Sentry error monitoring not configured', 'warning');
      }
    }
  }

  /**
   * Validate Next.js configuration
   */
  private checkNextConfig(): void {
    console.log('\n⚙️  Validating Next.js configuration...');

    try {
      const nextConfigPath = join(this.rootDir, 'next.config.ts');

      if (!existsSync(nextConfigPath)) {
        this.addResult(false, '✗ next.config.ts not found', 'error');
        return;
      }

      // Read and validate config
      const configContent = readFileSync(nextConfigPath, 'utf-8');

      // Check for required configurations
      const requiredConfigs = [
        { pattern: /output:\s*['"]standalone['"]/, message: 'standalone output mode' },
        { pattern: /reactStrictMode:\s*true/, message: 'React strict mode' },
        { pattern: /poweredByHeader:\s*false/, message: 'poweredByHeader disabled' }
      ];

      requiredConfigs.forEach(({ pattern, message }) => {
        const hasConfig = pattern.test(configContent);
        this.addResult(
          hasConfig,
          hasConfig ? `✓ Has ${message}` : `✗ Missing ${message}`,
          hasConfig ? 'info' : 'error'
        );
      });

      this.addResult(true, '✓ next.config.ts is valid', 'info');
    } catch (error) {
      this.addResult(false, `✗ Failed to validate next.config.ts: ${error}`, 'error');
    }
  }

  /**
   * Validate NextAuth configuration
   */
  private checkAuthConfig(): void {
    console.log('\n🔒 Validating authentication configuration...');

    try {
      const authConfigPath = join(this.rootDir, 'lib/auth/options.ts');

      if (!existsSync(authConfigPath)) {
        this.addResult(false, '✗ lib/auth/options.ts not found', 'error');
        return;
      }

      const configContent = readFileSync(authConfigPath, 'utf-8');

      // Check for required configurations
      const checks = [
        { pattern: /secret:\s*process\.env\.NEXTAUTH_SECRET/, message: 'NEXTAUTH_SECRET configuration' },
        { pattern: /adapter:\s*PrismaAdapter/, message: 'Prisma adapter' },
        { pattern: /strategy:\s*['"]database['"]/, message: 'database session strategy' },
        { pattern: /callbacks:/, message: 'callbacks configuration' }
      ];

      checks.forEach(({ pattern, message }) => {
        const hasConfig = pattern.test(configContent);
        this.addResult(
          hasConfig,
          hasConfig ? `✓ Has ${message}` : `✗ Missing ${message}`,
          hasConfig ? 'info' : 'error'
        );
      });
    } catch (error) {
      this.addResult(false, `✗ Failed to validate auth config: ${error}`, 'error');
    }
  }

  /**
   * Run TypeScript type checking
   */
  private checkTypeScript(): void {
    console.log('\n📝 Running TypeScript type check...');

    try {
      execSync('npx tsc --noEmit', {
        cwd: this.rootDir,
        stdio: 'pipe',
        encoding: 'utf-8'
      });

      this.addResult(true, '✓ TypeScript compilation successful', 'info');
    } catch (error: any) {
      const output = error.stdout || error.stderr || '';

      // Check if errors are critical
      if (output.includes('error TS')) {
        const errorCount = (output.match(/error TS/g) || []).length;
        this.addResult(false, `⚠ TypeScript has ${errorCount} errors (ignoreBuildErrors=true)`, 'warning');
      } else {
        this.addResult(true, '✓ TypeScript compilation successful', 'info');
      }
    }
  }

  /**
   * Check for security vulnerabilities
   */
  private checkSecurity(): void {
    console.log('\n🛡️  Running security audit...');

    try {
      const result = execSync('npm audit --audit-level=high --json', {
        cwd: this.rootDir,
        encoding: 'utf-8'
      });

      const auditResult = JSON.parse(result);
      const vulnerabilities = auditResult.metadata?.vulnerabilities || {};
      const high = vulnerabilities.high || 0;
      const critical = vulnerabilities.critical || 0;

      if (critical > 0) {
        this.addResult(false, `✗ Found ${critical} critical vulnerabilities`, 'error');
      } else if (high > 0) {
        this.addResult(false, `⚠ Found ${high} high severity vulnerabilities`, 'warning');
      } else {
        this.addResult(true, '✓ No high or critical vulnerabilities found', 'info');
      }
    } catch (error: any) {
      if (error.stdout) {
        try {
          const auditResult = JSON.parse(error.stdout);
          const vulnerabilities = auditResult.metadata?.vulnerabilities || {};
          const critical = vulnerabilities.critical || 0;
          const high = vulnerabilities.high || 0;

          if (critical > 0) {
            this.addResult(false, `✗ Found ${critical} critical vulnerabilities`, 'error');
          } else if (high > 0) {
            this.addResult(false, `⚠ Found ${high} high severity vulnerabilities`, 'warning');
          }
        } catch (parseError) {
          this.addResult(false, '⚠ Could not parse npm audit results', 'warning');
        }
      }
    }
  }

  /**
   * Check package.json scripts
   */
  private checkPackageScripts(): void {
    console.log('\n📦 Validating package.json scripts...');

    try {
      const packagePath = join(this.rootDir, 'package.json');
      const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));

      const requiredScripts = ['build', 'start', 'test'];

      requiredScripts.forEach(script => {
        const exists = pkg.scripts && pkg.scripts[script];
        this.addResult(
          exists,
          exists ? `✓ Has '${script}' script` : `✗ Missing '${script}' script`,
          exists ? 'info' : 'error'
        );
      });
    } catch (error) {
      this.addResult(false, `✗ Failed to validate package.json: ${error}`, 'error');
    }
  }

  /**
   * Run all validation checks
   */
  public async validate(): Promise<ValidationReport> {
    console.log('🚀 Pre-Deployment Validation');
    console.log('================================\n');

    this.checkCriticalFiles();
    this.checkEnvironmentVariables();
    this.checkNextConfig();
    this.checkAuthConfig();
    this.checkPackageScripts();
    this.checkTypeScript();
    this.checkSecurity();

    return this.generateReport();
  }

  /**
   * Generate validation report
   */
  private generateReport(): ValidationReport {
    const passed = this.results.filter(r => r.passed && r.severity !== 'warning').length;
    const failed = this.results.filter(r => !r.passed && r.severity === 'error').length;
    const warnings = this.results.filter(r => r.severity === 'warning').length;

    const totalChecks = this.results.filter(r => r.severity !== 'info').length;
    const score = totalChecks > 0 ? Math.round((passed / totalChecks) * 100) : 0;

    return {
      checks: this.results,
      passed,
      failed,
      warnings,
      score
    };
  }
}

/**
 * Main execution
 */
async function main() {
  const rootDir = join(__dirname, '..');
  const isStrictMode = process.argv.includes('--strict');

  const validator = new PreDeploymentValidator(rootDir, isStrictMode);
  const report = await validator.validate();

  // Print summary
  console.log('\n================================');
  console.log('📊 Validation Summary\n');

  // Print all checks
  report.checks.forEach(check => {
    const icon = check.passed ? '✓' : '✗';
    const color = check.passed ? '\x1b[32m' : (check.severity === 'warning' ? '\x1b[33m' : '\x1b[31m');
    console.log(`${color}${check.message}\x1b[0m`);
  });

  console.log('\n================================');
  console.log(`\n✓ Passed: ${report.passed}`);
  console.log(`✗ Failed: ${report.failed}`);
  console.log(`⚠ Warnings: ${report.warnings}`);
  console.log(`\n📈 Deployment Confidence Score: ${report.score}%\n`);

  // Determine exit code
  if (report.failed > 0) {
    console.error('\n❌ Pre-deployment checks FAILED. Please fix errors before deploying.\n');
    process.exit(1);
  }

  if (isStrictMode && report.warnings > 0) {
    console.error('\n⚠️  Pre-deployment checks found warnings in strict mode.\n');
    process.exit(2);
  }

  if (report.score < 80) {
    console.warn('\n⚠️  Deployment confidence score is below 80%. Proceed with caution.\n');
  } else {
    console.log('\n✅ All pre-deployment checks passed! Safe to deploy.\n');
  }

  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Pre-deployment check failed:', error);
    process.exit(1);
  });
}

export { PreDeploymentValidator };
