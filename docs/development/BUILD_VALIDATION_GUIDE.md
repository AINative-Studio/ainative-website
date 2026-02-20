# Build Validation System

Complete guide to the multi-layered build validation system that prevents missing module errors from reaching production.

## Problem Statement

Previously, the Next.js application experienced build failures in production due to:
- Module files existing locally but not tracked by git
- Missing imports not caught during development
- No validation before git push operations
- Webpack/Turbopack silently ignoring resolution failures in dev mode

**Example failure:**
```
Module not found: Can't resolve './utils/thumbnail-generator'
Module not found: Can't resolve './utils/slug-generator'
```

Files existed locally but weren't committed to git, causing Railway deployment failures.

## Solution Architecture

The build validation system implements **5 layers of protection**:

### Layer 1: Webpack Module Validator Plugin
**File:** `/scripts/webpack-module-validator.js`

Custom webpack plugin that fails fast on module resolution errors.

**Features:**
- Intercepts webpack compilation process
- Detects "Module not found" errors in real-time
- Fails production builds immediately
- Warns in development mode
- Provides detailed error messages with file paths

**Configuration:** Automatically loaded in `next.config.ts`

```typescript
webpack: (config) => {
  const ModuleValidatorPlugin = require('./scripts/webpack-module-validator');
  config.plugins.push(
    new ModuleValidatorPlugin({
      failOnError: process.env.NODE_ENV === 'production',
      logMissingModules: true,
      ignorePatterns: [/node_modules/, /\.next/, /\.git/]
    })
  );
}
```

### Layer 2: Import Validation Script
**File:** `/scripts/validate-imports.js`

Standalone Node.js script that scans all source files and validates import statements.

**Features:**
- Scans all TypeScript/JavaScript files in `/src`
- Extracts ES6 imports, dynamic imports, and require statements
- Resolves relative and path alias imports (@/)
- Checks file existence with proper extensions (.ts, .tsx, .js, .jsx)
- Handles index files in directories
- Reports missing dependencies with line numbers

**Usage:**
```bash
npm run validate:imports
# or
node scripts/validate-imports.js
```

**Output Example:**
```
========================================
  Import Validation
========================================

Scanning source files...
✓ Found 150 source files

Validating imports...

========================================
  Validation Results
========================================
Total files scanned: 150
Total imports found: 847
Valid imports: 845
Invalid imports: 2

❌ Import Resolution Errors:

✗ src/components/BlogCard.tsx:3
  Import: ./utils/thumbnail-generator
  Type: es6
  Checked paths:
    - src/components/utils/thumbnail-generator.ts
    - src/components/utils/thumbnail-generator.tsx
    - src/components/utils/thumbnail-generator/index.ts
```

### Layer 3: Development Environment Validation
**File:** `/scripts/validate-dev-env.sh`

Shell script that validates the entire development environment setup.

**Checks:**
- Node.js version (>= v18)
- npm installation
- git repository status
- Dependencies installation and sync
- TypeScript configuration
- Next.js configuration
- Environment variables
- Port availability (3000)
- Disk space
- Import validation

**Usage:**
```bash
npm run validate:env
# or
bash scripts/validate-dev-env.sh
```

**Run this:**
- After cloning the repository
- After pulling changes
- Before starting work on a new feature
- When troubleshooting build issues

### Layer 4: Dependency Tracking System
**File:** `/scripts/track-dependencies.js`

Advanced dependency graph analyzer that tracks all imports and their relationships.

**Features:**
- Builds complete dependency graph
- Identifies circular dependencies
- Detects unused files
- Lists most imported files
- Tracks external dependencies
- Exports graph to JSON for visualization

**Usage:**
```bash
npm run validate:deps
# or
node scripts/track-dependencies.js

# Export dependency graph
node scripts/track-dependencies.js --export
# Creates: dependency-graph.json
```

**Output:**
```
========================================
  Dependency Analysis Report
========================================

Summary:
  Total files: 150
  External dependencies: 47
  Missing dependencies: 0

✓ No circular dependencies detected
✓ No unused files detected

Most Imported Files:
  42× src/lib/utils.ts
  38× src/components/ui/button.tsx
  27× src/hooks/useAuth.ts
  ...
```

### Layer 5: Build Validation Script
**File:** `/scripts/validate-build.sh`

Comprehensive pre-push validation that runs all checks plus a full build.

**Validation Steps:**
1. Check Node.js and npm versions
2. Validate dependencies are installed
3. Run import validation
4. Run TypeScript type checking
5. Run ESLint
6. Check for uncommitted imported files
7. **Run full Next.js build**
8. Verify git tracked files

**Usage:**
```bash
npm run validate:build
# or
bash scripts/validate-build.sh
```

**When to use:**
- Before git push (automatic via pre-push hook)
- Before creating a pull request
- Before deploying to staging/production
- After major refactoring

## Git Hooks

### Pre-Commit Hook
**File:** `.git/hooks/pre-commit`

Runs automatically before every commit.

**Checks:**
1. Validates imports in staged files
2. Checks for debugging statements (console.log, debugger)
3. Checks for TODO/FIXME comments (non-blocking)
4. Validates file sizes
5. Runs comprehensive import validation

**Bypass (emergency only):**
```bash
git commit --no-verify
```

### Pre-Push Hook
**File:** `.git/hooks/pre-push`

Runs automatically before every push to remote.

**Checks:**
- Executes full build validation script
- Ensures build succeeds before push
- Verifies all imports resolve
- Checks git tracked files

**Bypass (emergency only):**
```bash
SKIP_VALIDATION=1 git push
```

## NPM Scripts

Add these to your workflow:

```json
{
  "scripts": {
    "validate": "npm run validate:env && npm run validate:imports && npm run validate:deps",
    "validate:env": "bash scripts/validate-dev-env.sh",
    "validate:imports": "node scripts/validate-imports.js",
    "validate:deps": "node scripts/track-dependencies.js",
    "validate:build": "bash scripts/validate-build.sh",
    "precommit": "node scripts/validate-imports.js",
    "prepush": "npm run validate:build"
  }
}
```

## Developer Workflow

### Daily Development
```bash
# 1. Start your day
npm run validate:env

# 2. Make changes
# ... edit files ...

# 3. Before committing
npm run validate:imports

# 4. Commit (pre-commit hook runs automatically)
git add .
git commit -m "Add feature"

# 5. Before pushing (pre-push hook runs automatically)
git push
```

### Troubleshooting Build Failures

If you encounter "Module not found" errors:

1. **Run import validation:**
   ```bash
   npm run validate:imports
   ```

2. **Check dependency graph:**
   ```bash
   npm run validate:deps
   ```

3. **Verify file exists:**
   ```bash
   ls -la path/to/missing/file.ts
   ```

4. **Check git status:**
   ```bash
   git status
   git ls-files path/to/missing/file.ts
   ```

5. **Add missing file to git:**
   ```bash
   git add path/to/missing/file.ts
   git commit -m "Add missing file"
   ```

### Before Creating a Pull Request

```bash
# 1. Run full validation
npm run validate

# 2. Run build validation
npm run validate:build

# 3. Check for circular dependencies
npm run validate:deps

# 4. Create PR only if all checks pass
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Validation

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Validate imports
        run: npm run validate:imports

      - name: Validate dependencies
        run: npm run validate:deps

      - name: Build
        run: npm run build
```

### Railway Deployment

The validation runs automatically:
1. Pre-push hook validates before code reaches Railway
2. Railway runs `npm run build` which includes webpack validator
3. Build fails fast if modules are missing

## Configuration

### Customize Webpack Validator

Edit `scripts/webpack-module-validator.js`:

```javascript
new ModuleValidatorPlugin({
  failOnError: true,              // Fail build on errors
  logMissingModules: true,        // Log missing modules
  ignorePatterns: [               // Patterns to ignore
    /node_modules/,
    /\.next/,
    /\.git/,
    /test-fixtures/               // Add custom patterns
  ]
})
```

### Customize Import Validation

Edit `scripts/validate-imports.js`:

```javascript
// Add custom file extensions
const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs'];

// Skip additional directories
if (!['node_modules', '.next', '.git', 'fixtures'].includes(entry.name)) {
  // ...
}
```

## Performance

All validation scripts are optimized for speed:

- **Import validation:** ~500ms for 150 files
- **Dependency tracking:** ~1s for 150 files
- **Environment validation:** ~2s
- **Full build validation:** ~30s (includes Next.js build)

## Best Practices

1. **Run validation before starting work:**
   ```bash
   npm run validate:env
   ```

2. **Run import validation frequently:**
   ```bash
   npm run validate:imports
   ```

3. **Never bypass hooks unless emergency:**
   - Use `--no-verify` only when absolutely necessary
   - Document why you bypassed validation
   - Fix issues immediately after bypass

4. **Monitor dependency graph:**
   ```bash
   npm run validate:deps --export
   # Review dependency-graph.json regularly
   ```

5. **Keep scripts updated:**
   - Update ignore patterns as project evolves
   - Add new file extensions if needed
   - Adjust validation rules based on team needs

## Troubleshooting

### Hook not running
```bash
# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
```

### Import validation false positives
- Check path aliases in `tsconfig.json`
- Verify file extensions are supported
- Check for dynamic imports with variables

### Build validation too slow
- Use `validate:imports` for quick checks
- Run full `validate:build` only before push
- Consider caching in CI/CD

## Summary

This multi-layered approach ensures:
- **Prevention:** Catches issues before commit
- **Detection:** Identifies problems early in development
- **Protection:** Prevents broken code from reaching production
- **Visibility:** Provides clear error messages and reports
- **Performance:** Fast enough for frequent use

The system prevents the class of errors where files exist locally but aren't tracked by git, which caused the original production build failure.
