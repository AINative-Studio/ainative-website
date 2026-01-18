# AINative Ignore System - API Reference

## Core Service

### IgnoreFileService

The main service class for managing ignore rules and file access control.

#### Constructor

```typescript
constructor(config?: Partial<IgnoreFileConfig>)
```

**Parameters:**

```typescript
interface IgnoreFileConfig {
  /** Project root directory */
  projectRoot: string;

  /** Current mode (dev/prod/test) */
  mode: IgnoreMode;

  /** Enable security auto-detection */
  enableSecurityDetection: boolean;

  /** Enable audit logging */
  enableAuditLog: boolean;

  /** Maximum file size to consider (bytes) */
  maxFileSize?: number;

  /** Use .gitignore as fallback */
  useGitignoreFallback: boolean;

  /** Global ignore file path */
  globalIgnorePath?: string;
}
```

**Example:**

```typescript
import { IgnoreFileService } from '@ainative/ignore-file-service';

const service = new IgnoreFileService({
  projectRoot: '/path/to/project',
  mode: 'dev',
  enableSecurityDetection: true,
  enableAuditLog: true,
  maxFileSize: 1024 * 1024, // 1MB
});

await service.initialize();
```

#### Methods

##### initialize()

Initialize the service and load all ignore files.

```typescript
async initialize(): Promise<void>
```

**Example:**

```typescript
await service.initialize();
```

##### shouldIgnore()

Check if a file path should be ignored.

```typescript
shouldIgnore(filePath: string): boolean
```

**Parameters:**
- `filePath` - Relative file path to check

**Returns:** `true` if the file should be ignored, `false` otherwise

**Example:**

```typescript
if (service.shouldIgnore('src/config/.env')) {
  console.log('File is ignored');
}
```

##### checkPath()

Get detailed ignore information for a file path.

```typescript
checkPath(filePath: string): IgnoreResult
```

**Parameters:**
- `filePath` - Relative file path to check

**Returns:**

```typescript
interface IgnoreResult {
  /** Whether the path should be ignored */
  ignored: boolean;

  /** The rule that caused the ignore (if any) */
  rule?: IgnoreRule;

  /** Reason for ignoring */
  reason?: string;

  /** Permission level if not ignored */
  permission?: 'read' | 'write' | 'none';
}
```

**Example:**

```typescript
const result = service.checkPath('.env');

if (result.ignored) {
  console.log(`Ignored: ${result.reason}`);
  console.log(`Rule: ${result.rule?.pattern}`);
  console.log(`Source: ${result.rule?.source}`);
}
```

##### getIgnoreReason()

Get the reason why a file path is ignored.

```typescript
getIgnoreReason(filePath: string): string | null
```

**Parameters:**
- `filePath` - Relative file path to check

**Returns:** Reason string if ignored, `null` otherwise

**Example:**

```typescript
const reason = service.getIgnoreReason('.env');
// Returns: "Security-sensitive file"
```

##### listIgnoredPaths()

List all ignored paths in a directory.

```typescript
listIgnoredPaths(directory: string, recursive?: boolean): string[]
```

**Parameters:**
- `directory` - Directory to scan
- `recursive` - Whether to scan recursively (default: `true`)

**Returns:** Array of ignored file paths

**Example:**

```typescript
const ignored = service.listIgnoredPaths('/path/to/project', true);
console.log('Ignored files:', ignored);
```

##### validatePattern()

Validate an ignore pattern.

```typescript
validatePattern(pattern: string): { valid: boolean; error?: string }
```

**Parameters:**
- `pattern` - Glob pattern to validate

**Returns:** Validation result

**Example:**

```typescript
const validation = service.validatePattern('*.log');
if (!validation.valid) {
  console.error('Invalid pattern:', validation.error);
}
```

##### addRule()

Add a new ignore rule dynamically.

```typescript
addRule(pattern: string, type?: IgnoreType, reason?: string): void
```

**Parameters:**
- `pattern` - Glob pattern to match
- `type` - Rule type (default: `'exclude'`)
- `reason` - Human-readable reason

**Example:**

```typescript
service.addRule('*.test.js', 'exclude', 'Test files');
service.addRule('*.sql', 'readonly', 'Database migrations');
service.addRule('.env', 'noai', 'Environment variables');
```

##### removeRule()

Remove an ignore rule.

```typescript
removeRule(pattern: string): boolean
```

**Parameters:**
- `pattern` - Glob pattern to remove

**Returns:** `true` if rule was removed, `false` if not found

**Example:**

```typescript
if (service.removeRule('*.log')) {
  console.log('Rule removed');
}
```

##### getRules()

Get all current rules.

```typescript
getRules(): IgnoreRule[]
```

**Returns:** Array of all ignore rules

**Example:**

```typescript
const rules = service.getRules();
console.log(`Total rules: ${rules.length}`);

for (const rule of rules) {
  console.log(`${rule.pattern} (${rule.type}) - ${rule.source}`);
}
```

##### getAuditLog()

Get the audit log.

```typescript
getAuditLog(): AuditLogEntry[]
```

**Returns:**

```typescript
interface AuditLogEntry {
  timestamp: Date;
  path: string;
  action: 'access' | 'ignore' | 'block';
  rule?: string;
  reason?: string;
}
```

**Example:**

```typescript
const log = service.getAuditLog();

for (const entry of log) {
  console.log(
    `${entry.timestamp.toISOString()} - ${entry.action}: ${entry.path}`
  );
}
```

##### clearAuditLog()

Clear the audit log.

```typescript
clearAuditLog(): void
```

**Example:**

```typescript
service.clearAuditLog();
```

##### exportRules()

Export rules to a file.

```typescript
exportRules(filePath: string, includeBuiltIn?: boolean): void
```

**Parameters:**
- `filePath` - Path to export file
- `includeBuiltIn` - Include built-in rules (default: `false`)

**Example:**

```typescript
service.exportRules('/path/to/export.txt', false);
```

##### importFromGitignore()

Import rules from .gitignore.

```typescript
importFromGitignore(gitignorePath?: string): number
```

**Parameters:**
- `gitignorePath` - Path to .gitignore file (optional)

**Returns:** Number of rules imported

**Example:**

```typescript
const imported = service.importFromGitignore();
console.log(`Imported ${imported} rules from .gitignore`);
```

##### detectSensitiveFiles()

Detect potentially sensitive files in a directory.

```typescript
detectSensitiveFiles(directory: string): string[]
```

**Parameters:**
- `directory` - Directory to scan

**Returns:** Array of sensitive file paths

**Example:**

```typescript
const sensitive = service.detectSensitiveFiles('/path/to/project');

if (sensitive.length > 0) {
  console.warn('Sensitive files detected:');
  sensitive.forEach(file => console.log(`  - ${file}`));
}
```

##### dispose()

Clean up resources and file watchers.

```typescript
dispose(): void
```

**Example:**

```typescript
service.dispose();
```

## Types

### IgnoreType

Type of ignore rule.

```typescript
type IgnoreType = 'include' | 'exclude' | 'readonly' | 'noai';
```

- `include` - File is explicitly included (negation)
- `exclude` - File is excluded (default)
- `readonly` - File is read-only (AI can read but not modify)
- `noai` - File is never accessible by AI (highest security)

### IgnoreMode

Environment mode for conditional rules.

```typescript
type IgnoreMode = 'dev' | 'prod' | 'test' | 'all';
```

### IgnoreRule

Represents a single ignore rule.

```typescript
interface IgnoreRule {
  /** The glob pattern to match */
  pattern: string;

  /** Type of ignore rule */
  type: IgnoreType;

  /** Human-readable reason for this rule */
  reason?: string;

  /** Priority (higher = more important) */
  priority: number;

  /** Source file where this rule was defined */
  source: string;

  /** Mode when this rule applies */
  mode?: IgnoreMode;

  /** Expiration time for temporary rules */
  expiresAt?: Date;

  /** Whether this is a negation rule (!) */
  isNegation: boolean;

  /** Original line from ignore file */
  raw: string;
}
```

## CLI API

### IgnoreCli

Command-line interface for ignore file management.

#### Constructor

```typescript
constructor(options?: CliOptions)
```

**Parameters:**

```typescript
interface CliOptions {
  projectRoot?: string;
  mode?: IgnoreMode;
  verbose?: boolean;
  json?: boolean;
}
```

**Example:**

```typescript
import { IgnoreCli } from '@ainative/ignore-cli';

const cli = new IgnoreCli({
  projectRoot: '/path/to/project',
  mode: 'dev',
  json: false,
});

await cli.initialize();
```

#### Methods

##### add()

Add a new ignore pattern.

```typescript
async add(
  pattern: string,
  options?: {
    type?: IgnoreType;
    reason?: string;
    mode?: IgnoreMode;
  }
): Promise<void>
```

**Example:**

```typescript
await cli.add('*.log');
await cli.add('secrets.json', {
  type: 'noai',
  reason: 'Contains API keys',
});
```

##### remove()

Remove an ignore pattern.

```typescript
async remove(pattern: string): Promise<void>
```

**Example:**

```typescript
await cli.remove('*.log');
```

##### list()

List all ignore patterns.

```typescript
async list(options?: {
  source?: string;
  type?: IgnoreType;
  includeBuiltIn?: boolean;
}): Promise<void>
```

**Example:**

```typescript
await cli.list();
await cli.list({ source: '.ainativeignore' });
await cli.list({ type: 'noai' });
```

##### test()

Test if a path would be ignored.

```typescript
async test(filePath: string): Promise<void>
```

**Example:**

```typescript
await cli.test('src/config/.env');
```

##### init()

Initialize ignore file with template.

```typescript
async init(options?: {
  template?: 'node' | 'python' | 'react' | 'nextjs' | 'go' | 'rust';
  force?: boolean;
}): Promise<void>
```

**Example:**

```typescript
await cli.init({ template: 'nextjs' });
await cli.init({ template: 'node', force: true });
```

##### audit()

Display audit log.

```typescript
async audit(options?: {
  action?: 'access' | 'ignore' | 'block';
  limit?: number;
}): Promise<void>
```

**Example:**

```typescript
await cli.audit();
await cli.audit({ action: 'ignore', limit: 50 });
```

##### migrate()

Migrate from .gitignore to .ainativeignore.

```typescript
async migrate(options?: {
  source?: string;
  dryRun?: boolean;
}): Promise<void>
```

**Example:**

```typescript
await cli.migrate({ dryRun: true });
await cli.migrate({ source: '/custom/.gitignore' });
```

##### scan()

Scan for sensitive files.

```typescript
async scan(options?: {
  autoAdd?: boolean;
}): Promise<void>
```

**Example:**

```typescript
await cli.scan();
await cli.scan({ autoAdd: true });
```

##### stats()

Show statistics.

```typescript
async stats(): Promise<void>
```

**Example:**

```typescript
await cli.stats();
```

##### validate()

Validate ignore file syntax.

```typescript
async validate(): Promise<void>
```

**Example:**

```typescript
await cli.validate();
```

## React Components

### IgnoreRuleEditor

Visual editor for managing ignore rules.

```typescript
interface IgnoreRuleEditorProps {
  projectRoot?: string;
  onRulesChange?: (rules: IgnoreRule[]) => void;
}

function IgnoreRuleEditor(props: IgnoreRuleEditorProps): JSX.Element
```

**Example:**

```tsx
import { IgnoreRuleEditor } from '@ainative/components/ignore';

function App() {
  const handleRulesChange = (rules) => {
    console.log('Rules updated:', rules);
  };

  return (
    <IgnoreRuleEditor
      projectRoot="/path/to/project"
      onRulesChange={handleRulesChange}
    />
  );
}
```

### PatternTester

Test if file paths match ignore patterns.

```typescript
interface PatternTesterProps {
  projectRoot?: string;
}

function PatternTester(props: PatternTesterProps): JSX.Element
```

**Example:**

```tsx
import { PatternTester } from '@ainative/components/ignore';

function App() {
  return <PatternTester projectRoot="/path/to/project" />;
}
```

## Utility Functions

### getIgnoreFileService()

Get or create singleton instance.

```typescript
function getIgnoreFileService(
  config?: Partial<IgnoreFileConfig>
): IgnoreFileService
```

**Example:**

```typescript
import { getIgnoreFileService } from '@ainative/ignore-file-service';

const service = getIgnoreFileService({ projectRoot: '/path' });
```

### resetIgnoreFileService()

Reset singleton instance.

```typescript
function resetIgnoreFileService(): void
```

**Example:**

```typescript
import { resetIgnoreFileService } from '@ainative/ignore-file-service';

resetIgnoreFileService();
```

### createIgnoreCli()

Create and initialize CLI instance.

```typescript
async function createIgnoreCli(options?: CliOptions): Promise<IgnoreCli>
```

**Example:**

```typescript
import { createIgnoreCli } from '@ainative/ignore-cli';

const cli = await createIgnoreCli({ projectRoot: '/path' });
await cli.list();
```

## Error Handling

All methods may throw errors. Always wrap in try-catch:

```typescript
try {
  await service.initialize();
  const result = service.checkPath('.env');
} catch (error) {
  console.error('Error:', error.message);
}
```

## Performance Considerations

### Caching

The service caches pattern matching results for performance:

```typescript
// First call: parses and matches
service.shouldIgnore('test.js'); // ~5ms

// Second call: cached
service.shouldIgnore('test.js'); // ~0.1ms
```

### File Watching

The service watches ignore files for changes:

```typescript
// Automatic reload when .ainativeignore changes
fs.writeFileSync('.ainativeignore', '*.log');
// Service automatically reloads rules
```

### Cleanup

Always dispose of the service when done:

```typescript
const service = new IgnoreFileService({ projectRoot: '/path' });
await service.initialize();

// Use service...

// Clean up
service.dispose();
```

## Advanced Usage

### Custom Security Patterns

```typescript
const service = new IgnoreFileService({
  projectRoot: '/path',
  enableSecurityDetection: true,
});

await service.initialize();

// Add custom security pattern
service.addRule('**/api-keys/**', 'noai', 'API key storage');
service.addRule('**/*password*', 'noai', 'Password files');
```

### Dynamic Rule Updates

```typescript
// Add rule
service.addRule('*.temp', 'exclude', 'Temporary files');

// Test
console.log(service.shouldIgnore('test.temp')); // true

// Remove rule
service.removeRule('*.temp');

// Test again
console.log(service.shouldIgnore('test.temp')); // false
```

### Audit Trail

```typescript
// Enable audit logging
const service = new IgnoreFileService({
  projectRoot: '/path',
  enableAuditLog: true,
});

await service.initialize();

// Check files
service.checkPath('file1.js');
service.checkPath('.env');
service.checkPath('file2.js');

// View audit log
const log = service.getAuditLog();
log.forEach(entry => {
  console.log(
    `${entry.timestamp.toISOString()} - ${entry.action}: ${entry.path}`
  );
});

// Clear log
service.clearAuditLog();
```

### Integration with Build Tools

```typescript
import { IgnoreFileService } from '@ainative/ignore-file-service';

async function buildProject() {
  const service = new IgnoreFileService({ projectRoot: process.cwd() });
  await service.initialize();

  const files = getAllFiles();

  for (const file of files) {
    const result = service.checkPath(file);

    if (result.ignored) {
      console.log(`Skipping: ${file} (${result.reason})`);
      continue;
    }

    if (result.permission === 'read') {
      console.log(`Read-only: ${file}`);
      // Process as read-only
    } else {
      // Process normally
    }
  }

  service.dispose();
}
```

## Version

API Version: 1.0.0

## License

MIT License - Copyright (c) 2025 AINative Studio
