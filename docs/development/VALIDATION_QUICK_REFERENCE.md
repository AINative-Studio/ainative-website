# Build Validation Quick Reference

## Quick Commands

```bash
# Validate everything
npm run validate

# Individual validations
npm run validate:env         # Check dev environment
npm run validate:imports     # Check all imports
npm run validate:deps        # Check dependencies & circular deps
npm run validate:build       # Full build validation (pre-push)

# Development workflow
npm run dev                  # Start dev server
npm run build                # Production build
npm run type-check           # TypeScript only
```

## Git Hooks (Automatic)

### Pre-Commit
- Validates imports in staged files
- Checks for debug statements
- Runs import validation

**Bypass:** `git commit --no-verify` (emergency only)

### Pre-Push
- Runs full build validation
- Ensures all imports resolve
- Verifies build succeeds

**Bypass:** `SKIP_VALIDATION=1 git push` (emergency only)

## Common Issues & Fixes

### "Module not found" Error

```bash
# 1. Check what's missing
npm run validate:imports

# 2. Verify file exists
ls -la path/to/file.ts

# 3. Check if tracked by git
git ls-files path/to/file.ts

# 4. Add to git if missing
git add path/to/file.ts
```

### Import Validation Failed

```bash
# See detailed errors
node scripts/validate-imports.js

# Check dependency graph
node scripts/track-dependencies.js

# Export for analysis
node scripts/track-dependencies.js --export
```

### Circular Dependency Detected

```bash
# Show all circular dependencies
npm run validate:deps

# Review dependency graph
node scripts/track-dependencies.js --export
# Then open dependency-graph.json
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

## File Structure

```
scripts/
├── validate-build.sh          # Full build validation
├── validate-imports.js        # Import checker
├── validate-dev-env.sh        # Environment validator
├── track-dependencies.js      # Dependency analyzer
└── webpack-module-validator.js # Webpack plugin

.git/hooks/
├── pre-commit                 # Runs on commit
└── pre-push                   # Runs on push

docs/development/
├── BUILD_VALIDATION_GUIDE.md  # Full documentation
└── VALIDATION_QUICK_REFERENCE.md # This file
```

## Status Codes

| Exit Code | Meaning |
|-----------|---------|
| 0 | All validations passed |
| 1 | Critical error - fix required |
| Non-zero | Check output for details |

## Validation Layers

1. **Webpack Plugin** - Fails fast during build
2. **Import Validator** - Scans all source files
3. **Environment Check** - Validates dev setup
4. **Dependency Tracker** - Analyzes import graph
5. **Build Validator** - Full build test

## When to Run What

| Situation | Command |
|-----------|---------|
| Starting work | `npm run validate:env` |
| Before commit | `npm run validate:imports` |
| Before PR | `npm run validate` |
| Before push | Automatic via hook |
| Troubleshooting | `npm run validate:deps` |
| After refactor | `npm run validate:build` |

## Emergency Bypasses

**Only use in emergencies!**

```bash
# Skip pre-commit hook
git commit --no-verify -m "Emergency fix"

# Skip pre-push hook
SKIP_VALIDATION=1 git push

# Always document why you bypassed validation
```

## Performance

- Import validation: ~500ms
- Dependency tracking: ~1s
- Environment check: ~2s
- Full build: ~30s

## Getting Help

1. Check validation output
2. Review BUILD_VALIDATION_GUIDE.md
3. Run `npm run validate:deps` for graph
4. Check git status: `git status`
5. Verify node_modules: `npm ci`

## CI/CD

Validation automatically runs:
- ✅ Before every push (pre-push hook)
- ✅ During build (webpack plugin)
- ✅ On Railway deployment

No additional CI setup needed - hooks prevent bad code from reaching CI.
