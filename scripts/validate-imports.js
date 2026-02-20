#!/usr/bin/env node

/**
 * Import Validation Script
 * Scans all source files and validates that all imports resolve correctly
 * Prevents "Module not found" errors in production builds
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Track validation results
const results = {
  totalFiles: 0,
  totalImports: 0,
  validImports: 0,
  invalidImports: 0,
  errors: []
};

/**
 * Get all TypeScript/JavaScript files in a directory recursively
 */
function getSourceFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .next, and other build directories
      if (!['node_modules', '.next', '.git', 'dist', 'build', '__tests__', 'coverage'].includes(entry.name)) {
        getSourceFiles(fullPath, files);
      }
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      // Skip test files and stories
      if (!entry.name.includes('.test.') && !entry.name.includes('.spec.') && !entry.name.includes('.stories.')) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Extract import statements from file content
 */
function extractImports(content, filePath) {
  const imports = [];

  // Match ES6 import statements
  const es6ImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;

  // Match dynamic imports
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  // Match require statements
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  let match;

  // Extract ES6 imports
  while ((match = es6ImportRegex.exec(content)) !== null) {
    imports.push({
      type: 'es6',
      path: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }

  // Extract dynamic imports
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push({
      type: 'dynamic',
      path: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }

  // Extract require statements
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push({
      type: 'require',
      path: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }

  return imports;
}

/**
 * Check if import path is external (npm package)
 */
function isExternalImport(importPath) {
  return !importPath.startsWith('.') && !importPath.startsWith('/');
}

/**
 * Resolve import path to absolute file path
 */
function resolveImportPath(importPath, sourceFile) {
  const sourceDir = path.dirname(sourceFile);

  // Handle path aliases (e.g., @/...)
  if (importPath.startsWith('@/')) {
    const relativePath = importPath.substring(2);
    return path.join(PROJECT_ROOT, relativePath);
  }

  // Handle relative imports
  if (importPath.startsWith('.')) {
    return path.join(sourceDir, importPath);
  }

  return null;
}

/**
 * Check if a file exists with any of the possible extensions
 */
function checkFileExists(basePath) {
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json'];
  const checks = [];

  // Check if it's already a complete file path
  for (const ext of extensions) {
    const filePath = basePath + ext;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return { exists: true, path: filePath };
    }
    checks.push(filePath);
  }

  // Check if it's a directory with an index file
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      const indexPath = path.join(basePath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return { exists: true, path: indexPath };
      }
      checks.push(indexPath);
    }
  }

  return { exists: false, checked: checks };
}

/**
 * Validate a single import statement
 */
function validateImport(importData, sourceFile) {
  const { path: importPath, line, type } = importData;

  if (isExternalImport(importPath)) {
    return { valid: true, external: true };
  }

  const resolvedPath = resolveImportPath(importPath, sourceFile);

  if (!resolvedPath) {
    return { valid: true, external: true };
  }

  const fileCheck = checkFileExists(resolvedPath);

  if (!fileCheck.exists) {
    return {
      valid: false,
      error: {
        sourceFile: path.relative(PROJECT_ROOT, sourceFile),
        line,
        type,
        importPath,
        resolvedPath: path.relative(PROJECT_ROOT, resolvedPath),
        checkedPaths: fileCheck.checked.map(p => path.relative(PROJECT_ROOT, p))
      }
    };
  }

  return { valid: true, resolvedPath: fileCheck.path };
}

/**
 * Validate all imports in a file
 */
function validateFile(filePath) {
  results.totalFiles++;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(content, filePath);

    for (const importData of imports) {
      results.totalImports++;

      const validation = validateImport(importData, filePath);

      if (validation.valid) {
        results.validImports++;
      } else {
        results.invalidImports++;
        results.errors.push(validation.error);
      }
    }
  } catch (error) {
    console.error(`${RED}Error processing file${RESET}: ${filePath}`);
    console.error(error.message);
  }
}

/**
 * Main validation function
 */
function main() {
  console.log(`${BLUE}========================================${RESET}`);
  console.log(`${BLUE}  Import Validation${RESET}`);
  console.log(`${BLUE}========================================${RESET}`);
  console.log('');

  console.log(`${YELLOW}Scanning source files...${RESET}`);
  const sourceFiles = getSourceFiles(SRC_DIR);
  console.log(`${GREEN}✓${RESET} Found ${sourceFiles.length} source files`);
  console.log('');

  console.log(`${YELLOW}Validating imports...${RESET}`);
  for (const file of sourceFiles) {
    validateFile(file);
  }

  console.log('');
  console.log(`${BLUE}========================================${RESET}`);
  console.log(`${BLUE}  Validation Results${RESET}`);
  console.log(`${BLUE}========================================${RESET}`);
  console.log(`Total files scanned: ${results.totalFiles}`);
  console.log(`Total imports found: ${results.totalImports}`);
  console.log(`${GREEN}Valid imports: ${results.validImports}${RESET}`);
  console.log(`${RED}Invalid imports: ${results.invalidImports}${RESET}`);
  console.log('');

  if (results.errors.length > 0) {
    console.log(`${RED}❌ Import Resolution Errors:${RESET}`);
    console.log('');

    for (const error of results.errors) {
      console.log(`${RED}✗${RESET} ${error.sourceFile}:${error.line}`);
      console.log(`  Import: ${YELLOW}${error.importPath}${RESET}`);
      console.log(`  Type: ${error.type}`);
      console.log(`  Checked paths:`);
      for (const checkedPath of error.checkedPaths.slice(0, 3)) {
        console.log(`    - ${checkedPath}`);
      }
      console.log('');
    }

    console.log(`${RED}❌ Validation FAILED${RESET}`);
    console.log(`${RED}Fix the import errors above before building${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}✅ All imports resolve correctly${RESET}`);
    process.exit(0);
  }
}

main();
