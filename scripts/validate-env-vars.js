#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 * Validates that all environment variables used in code are documented
 * Prevents deployment failures due to missing environment configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const ENV_EXAMPLE_FILE = path.join(PROJECT_ROOT, '.env.example');
const ENV_PRODUCTION_EXAMPLE = path.join(PROJECT_ROOT, '.env.production.example');

// Environment variable patterns to detect in code
const ENV_VAR_PATTERNS = [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z_][A-Z0-9_]*)["']\]/g,
];

// Get staged files
function getStagedFiles() {
    try {
        const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
            encoding: 'utf-8',
            cwd: PROJECT_ROOT
        });
        return output.trim().split('\n').filter(Boolean);
    } catch (error) {
        return [];
    }
}

// Load documented environment variables
function loadDocumentedEnvVars() {
    const documented = new Set();

    const envFiles = [ENV_EXAMPLE_FILE, ENV_PRODUCTION_EXAMPLE];

    for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
            const content = fs.readFileSync(envFile, 'utf-8');
            const lines = content.split('\n');

            for (const line of lines) {
                const trimmed = line.trim();
                // Match: VAR_NAME=value or # VAR_NAME
                const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
                if (match) {
                    documented.add(match[1]);
                }
            }
        }
    }

    return documented;
}

// Extract environment variables from file
function extractEnvVars(filePath) {
    const fullPath = path.resolve(PROJECT_ROOT, filePath);

    if (!fs.existsSync(fullPath)) {
        return new Set();
    }

    // Only check JS/TS files
    if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) {
        return new Set();
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const envVars = new Set();

    for (const pattern of ENV_VAR_PATTERNS) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const varName = match[1];
            // Skip common false positives
            if (varName !== 'NODE_ENV' && varName !== 'VERCEL' && varName !== 'CI') {
                envVars.add(varName);
            }
        }
    }

    return envVars;
}

// Main validation
function main() {
    console.log('Validating environment variables...\n');

    const stagedFiles = getStagedFiles();

    if (stagedFiles.length === 0) {
        console.log('No staged files to validate');
        return 0;
    }

    const documentedVars = loadDocumentedEnvVars();

    if (documentedVars.size === 0) {
        console.warn('Warning: No .env.example file found');
        return 0;
    }

    console.log(`Found ${documentedVars.size} documented environment variables`);

    const undocumentedVars = new Map(); // var -> [files using it]

    for (const file of stagedFiles) {
        const envVars = extractEnvVars(file);

        for (const varName of envVars) {
            if (!documentedVars.has(varName)) {
                if (!undocumentedVars.has(varName)) {
                    undocumentedVars.set(varName, []);
                }
                undocumentedVars.get(varName).push(file);
            }
        }
    }

    if (undocumentedVars.size > 0) {
        console.error('\nUndocumented environment variables found:\n');

        for (const [varName, files] of undocumentedVars.entries()) {
            console.error(`  ${varName}`);
            for (const file of files) {
                console.error(`    - ${file}`);
            }
        }

        console.error('\nAdd these variables to .env.example and .env.production.example');
        return 1;
    }

    console.log('All environment variables are documented');
    return 0;
}

process.exit(main());
