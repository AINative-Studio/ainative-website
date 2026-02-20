#!/usr/bin/env node
/**
 * Configuration Validation Script
 *
 * Validates all application configuration before deployment or startup.
 * Run this script in CI/CD pipeline to catch configuration issues early.
 *
 * Usage:
 *   npm run validate:config
 *   node scripts/validate-config.ts
 */

import { printEnvStatus, validateProductionRequirements } from '../lib/config/env.validation';
import { NextAuthConfigValidator } from '../lib/config/nextauth.validation';
import { authOptions } from '../lib/auth/options';

async function main() {
  console.log('🔍 Starting Configuration Validation\n');
  console.log('='.repeat(60));

  try {
    // 1. Validate environment variables
    console.log('\n📋 Step 1: Environment Variables');
    console.log('-'.repeat(60));
    printEnvStatus();

    // 2. Check production requirements
    if (process.env.NODE_ENV === 'production') {
      console.log('\n🏭 Step 2: Production Requirements');
      console.log('-'.repeat(60));

      const warnings = validateProductionRequirements();
      if (warnings.length > 0) {
        console.log('⚠️  Production Warnings:');
        warnings.forEach((warning) => console.log(`  ${warning}`));

        const criticalWarnings = warnings.filter((w) => w.includes('CRITICAL'));
        if (criticalWarnings.length > 0) {
          console.error('\n❌ CRITICAL issues found. Cannot proceed with production deployment.');
          process.exit(1);
        }
      } else {
        console.log('✅ All production requirements met');
      }
    }

    // 3. Validate NextAuth configuration
    console.log('\n🔐 Step 3: NextAuth Configuration');
    console.log('-'.repeat(60));
    NextAuthConfigValidator.validateConfig(authOptions);

    // 4. Validate Prisma configuration
    console.log('\n🗄️  Step 4: Database Configuration');
    console.log('-'.repeat(60));
    if (process.env.DATABASE_URL) {
      console.log('✓ DATABASE_URL is configured');

      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
        console.log('✓ PostgreSQL database detected');
      } else {
        console.warn('⚠️  Non-PostgreSQL database detected. Some features may not work.');
      }

      // Check for PgBouncer port (from CLAUDE.md requirements)
      if (dbUrl.includes(':6432')) {
        console.log('✓ Using PgBouncer port (6432)');
      } else if (dbUrl.includes(':5432')) {
        console.warn('⚠️  Using direct PostgreSQL port (5432). Consider using PgBouncer (6432) for connection pooling.');
      }
    } else {
      console.error('✗ DATABASE_URL is not configured');
      process.exit(1);
    }

    // 5. Validate API configuration
    console.log('\n🌐 Step 5: API Configuration');
    console.log('-'.repeat(60));
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (apiUrl) {
      console.log(`✓ API Base URL: ${apiUrl}`);

      if (process.env.NODE_ENV === 'production' && !apiUrl.startsWith('https://')) {
        console.warn('⚠️  Production API URL should use HTTPS');
      }
    } else {
      console.warn('⚠️  NEXT_PUBLIC_API_BASE_URL not configured, using default');
    }

    // 6. Validate Stripe configuration
    console.log('\n💳 Step 6: Payment Configuration (Optional)');
    console.log('-'.repeat(60));
    if (process.env.STRIPE_SECRET_KEY) {
      const isTestKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
      const isLiveKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_');

      if (isTestKey) {
        console.log('✓ Stripe TEST mode configured');
      } else if (isLiveKey) {
        console.log('✓ Stripe LIVE mode configured');

        if (process.env.NODE_ENV !== 'production') {
          console.warn('⚠️  Using Stripe LIVE keys in non-production environment!');
        }
      } else {
        console.error('✗ Invalid Stripe secret key format');
        process.exit(1);
      }
    } else {
      console.log('ℹ️  Stripe not configured (optional)');
    }

    // 7. Validate analytics configuration
    console.log('\n📊 Step 7: Analytics Configuration (Optional)');
    console.log('-'.repeat(60));
    const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';
    console.log(`${analyticsEnabled ? '✓' : 'ℹ️'} Analytics: ${analyticsEnabled ? 'Enabled' : 'Disabled'}`);

    if (analyticsEnabled) {
      const services = [
        { name: 'Google Analytics', key: 'NEXT_PUBLIC_GA_ID' },
        { name: 'Google Tag Manager', key: 'NEXT_PUBLIC_GTM_ID' },
        { name: 'Meta Pixel', key: 'NEXT_PUBLIC_META_PIXEL_ID' },
        { name: 'Sentry', key: 'NEXT_PUBLIC_SENTRY_DSN' },
      ];

      services.forEach(({ name, key }) => {
        const configured = !!process.env[key];
        console.log(`  ${configured ? '✓' : '-'} ${name}: ${configured ? 'Configured' : 'Not configured'}`);
      });
    }

    // 8. Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Configuration validation completed successfully!');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Configuration validation failed!');
    console.error('='.repeat(60));

    if (error instanceof Error) {
      console.error(`\nError: ${error.message}\n`);
    } else {
      console.error('\nUnknown error occurred\n');
    }

    process.exit(1);
  }
}

// Run validation
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
