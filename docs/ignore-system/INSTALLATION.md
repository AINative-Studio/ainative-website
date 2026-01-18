# Installation Guide

## Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

## Step 1: Install Dependencies

```bash
cd /Users/aideveloper/ainative-website-nextjs-staging
npm install minimatch
npm install --save-dev @types/minimatch @types/node
```

## Step 2: Verify Installation

```bash
# Check if files are in place
ls -la lib/ignore-file-service.ts
ls -la lib/ignore-cli.ts
ls -la components/ignore/
ls -la docs/ignore-system/
```

## Step 3: Run Tests

```bash
npm test lib/__tests__/ignore-file-service.test.ts
```

## Step 4: Try CLI

```bash
# Create example ignore file
cp .ainativeignore.example .ainativeignore

# Validate syntax
node -e "
const { createIgnoreCli } = require('./lib/ignore-cli');
(async () => {
  const cli = await createIgnoreCli();
  await cli.validate();
})();
"
```

## Step 5: Test API

```bash
node -e "
const { IgnoreFileService } = require('./lib/ignore-file-service');
(async () => {
  const service = new IgnoreFileService({ projectRoot: process.cwd() });
  await service.initialize();
  console.log('Initialized with', service.getRules().length, 'rules');
  console.log('.env ignored?', service.shouldIgnore('.env'));
})();
"
```

## Optional: Add to package.json

Add CLI commands to your package.json:

```json
{
  "scripts": {
    "ignore:init": "node -e \"require('./lib/ignore-cli').createIgnoreCli().then(cli => cli.init())\"",
    "ignore:validate": "node -e \"require('./lib/ignore-cli').createIgnoreCli().then(cli => cli.validate())\"",
    "ignore:scan": "node -e \"require('./lib/ignore-cli').createIgnoreCli().then(cli => cli.scan())\"",
    "ignore:audit": "node -e \"require('./lib/ignore-cli').createIgnoreCli().then(cli => cli.audit())\""
  }
}
```

Then use:

```bash
npm run ignore:init
npm run ignore:validate
npm run ignore:scan
npm run ignore:audit
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors, ensure you have the types installed:

```bash
npm install --save-dev @types/minimatch @types/node
```

### Module Not Found

Ensure the files are in the correct locations:

```bash
tree lib components/ignore docs/ignore-system
```

### Pattern Matching Issues

Verify minimatch is installed:

```bash
npm list minimatch
```

## Next Steps

1. Read the User Guide: `docs/ignore-system/USER_GUIDE.md`
2. Copy example file: `cp .ainativeignore.example .ainativeignore`
3. Customize for your project
4. Run validation: `npm run ignore:validate`
5. Scan for security issues: `npm run ignore:scan`

## Support

See documentation in `docs/ignore-system/` for complete guides.
