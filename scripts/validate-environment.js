#!/usr/bin/env node
/**
 * Railway Environment Validation Script
 * Validates environment variables before deployment
 * Called by Railway pre-deploy hook
 */

const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'staging';
const PROJECT_ROOT = process.cwd();

console.log(`Validating environment for: ${environment}`);

// Required environment variables by environment
const REQUIRED_VARS = {
    staging: [
        'NEXT_PUBLIC_API_URL',
        'NODE_ENV'
    ],
    production: [
        'NEXT_PUBLIC_API_URL',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_SENTRY_DSN',
        'NODE_ENV'
    ]
};

const requiredVars = REQUIRED_VARS[environment] || REQUIRED_VARS.staging;
let missingVars = [];

// Check each required variable
for (const varName of requiredVars) {
    if (!process.env[varName]) {
        missingVars.push(varName);
    }
}

if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    for (const varName of missingVars) {
        console.error(`  - ${varName}`);
    }
    console.error('\nSet these variables in Railway dashboard before deploying');
    process.exit(1);
}

console.log('✅ All required environment variables are set');

// Validate NODE_ENV
if (process.env.NODE_ENV !== 'production') {
    console.warn(`⚠️  Warning: NODE_ENV is ${process.env.NODE_ENV}, should be "production" for Railway`);
}

process.exit(0);
