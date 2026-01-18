# AINative Ignore System

A comprehensive file access control system for AI tools, addressing Gemini CLI issues [#16980](https://github.com/google/gemini-cli/issues/16980) and [#16941](https://github.com/google/gemini-cli/issues/16941).

## Why This Matters

Current AI tools use `.gitignore` to determine file access, but:

- `.gitignore` is for version control, not AI access control
- Projects need separate ignore rules for AI vs git
- Security-sensitive files need special handling
- No fine-grained permission control (read-only, no-access)
- No audit trail of what AI accesses

**Solution:** `.ainativeignore` provides dedicated AI access control with advanced features.

## Features

- **Hierarchical Ignore Files** - `.ainativeignore` > `.aiignore` > `.gitignore`
- **Advanced Pattern Matching** - Glob patterns with special modifiers
- **Permission Levels** - exclude, include, readonly, noai
- **Security Auto-Detection** - Automatically protect sensitive files
- **Audit Logging** - Track what files AI accesses
- **Conditional Rules** - Different rules for dev/prod/test
- **Temporary Rules** - Auto-expiring ignore patterns
- **Visual Editor** - React components for UI management
- **CLI Tools** - Complete command-line interface
- **Migration Tool** - Convert from .gitignore

## Quick Start

### 1. Installation

```bash
npm install @ainative/ignore-file-service
```

Or use with existing project:

```bash
# Already included in AINative Studio
cd /path/to/ainative-studio
```

### 2. Initialize

Create `.ainativeignore` in your project root:

```bash
ainative ignore init --template nextjs
```

Or manually create:

```bash
# .ainativeignore

# Security - never accessible by AI
@secrets
@noai .env
@noai credentials/

# Dependencies
node_modules/

# Build outputs
.next/
dist/

# Read-only
@readonly docs/
@readonly *.sql
```

### 3. Test

```bash
# Test if a file would be ignored
ainative ignore test ".env"

# Scan for security issues
ainative ignore scan
```

## Usage

### Programmatic API

```typescript
import { IgnoreFileService } from '@ainative/ignore-file-service';

// Initialize service
const service = new IgnoreFileService({
  projectRoot: '/path/to/project',
  mode: 'dev',
  enableSecurityDetection: true,
  enableAuditLog: true,
});

await service.initialize();

// Check if file should be ignored
const result = service.checkPath('.env');

if (result.ignored) {
  console.log(`Ignored: ${result.reason}`);
  console.log(`Rule: ${result.rule?.pattern}`);
}

// Get permission level
console.log(`Permission: ${result.permission}`); // 'read', 'write', or 'none'

// Clean up
service.dispose();
```

### CLI Commands

```bash
# Initialize
ainative ignore init --template nextjs

# Add pattern
ainative ignore add "*.log"
ainative ignore add ".env" --type noai --reason "Environment variables"

# Remove pattern
ainative ignore remove "*.log"

# List rules
ainative ignore list
ainative ignore list --type noai

# Test path
ainative ignore test "src/config/.env"

# Scan for sensitive files
ainative ignore scan --auto-add

# Migrate from .gitignore
ainative ignore migrate

# View audit log
ainative ignore audit

# Statistics
ainative ignore stats

# Validate syntax
ainative ignore validate
```

### React Components

```tsx
import { IgnoreRuleEditor, PatternTester } from '@ainative/components/ignore';

function App() {
  return (
    <div>
      <IgnoreRuleEditor projectRoot="/path/to/project" />
      <PatternTester projectRoot="/path/to/project" />
    </div>
  );
}
```

## Pattern Syntax

### Basic Patterns

```bash
*.log              # All .log files
node_modules/      # Directory and contents
**/*.test.js       # Recursive pattern
!important.log     # Negation (include)
```

### Special Patterns

```bash
@secrets           # Auto-detect secrets
@large-files       # Files > 1MB
@binary            # Binary files
@generated         # Auto-generated code
@readonly *.sql    # Read-only access
@noai credentials/ # Never accessible by AI
@temporary *.tmp expire:1h  # Expires after 1 hour
```

### Conditional Rules

```bash
[dev] test-data/   # Only in dev mode
[prod] debug/      # Only in prod mode
[test] fixtures/   # Only in test mode
```

### Inline Comments

```bash
secrets.json      # Contains API keys
*.env             # Environment variables
```

## Examples

### Node.js Project

```bash
# .ainativeignore

@secrets
@noai .env
!.env.example

node_modules/
dist/

*.log
coverage/

.vscode/
.idea/
```

### Security-Focused

```bash
# .ainativeignore

@secrets
@noai credentials/
@noai config/keys/
@noai *.pem

@readonly migrations/
@readonly *.sql

@temporary debug-*.log expire:1h
```

### Full-Stack Application

```bash
# .ainativeignore

# Security
@secrets
@noai .env
@noai backend/config/secrets.yml

# Frontend
node_modules/
.next/
build/

# Backend
@readonly backend/migrations/
[prod] backend/debug/

# Database
@readonly *.sql
@noai database/backups/

# Media
@binary uploads/
@large-files public/videos/
```

## File Priority

Rules are loaded in priority order (highest to lowest):

1. `.ainativeignore` - Project-specific AI rules
2. `.aiignore` - General AI rules
3. `.gitignore` - Git rules (optional fallback)
4. `~/.ainative/ignore` - User global rules
5. Built-in defaults - System defaults

Higher priority rules override lower priority rules.

## Security Features

### Auto-Detection

Automatically detects and protects:

- Environment files (`.env`, `.env.*`)
- Credentials (`credentials.json`, `*.pem`, `*.key`)
- Secrets (files with `secret`, `password`, `token` in name)
- Large files (> 1MB by default)
- Binary files (images, videos, executables)

### Permission Levels

| Type | AI Can Read | AI Can Write | Use Case |
|------|-------------|--------------|----------|
| `exclude` | No | No | Ignored files |
| `include` | Yes | Yes | Explicitly allowed |
| `readonly` | Yes | No | Documentation, migrations |
| `noai` | No | No | Secrets, credentials |

### Audit Logging

Every file access is logged:

```typescript
const log = service.getAuditLog();

for (const entry of log) {
  console.log(
    `${entry.timestamp.toISOString()} - ${entry.action}: ${entry.path}`
  );
}
```

View with CLI:

```bash
ainative ignore audit
ainative ignore audit --action ignore
ainative ignore audit --limit 100
```

## Documentation

- **[User Guide](./USER_GUIDE.md)** - Complete user documentation
- **[Specification](./AINATIVEIGNORE_SPECIFICATION.md)** - Technical specification
- **[API Reference](./API_REFERENCE.md)** - Developer API documentation

## Architecture

### Components

1. **IgnoreFileService** - Core service for pattern matching and access control
2. **IgnoreCli** - Command-line interface
3. **React Components** - Visual UI for rule management
4. **Pattern Matcher** - Glob pattern matching with caching
5. **Security Scanner** - Auto-detect sensitive files
6. **Audit Logger** - Track file access

### Performance

- **Pattern Caching** - Results cached for fast lookups
- **File Watching** - Auto-reload on ignore file changes
- **Early Termination** - High-priority rules stop evaluation
- **Efficient Matching** - Uses `minimatch` for glob patterns

### File Structure

```
lib/
  ignore-file-service.ts    # Core service
  ignore-cli.ts             # CLI interface
  __tests__/
    ignore-file-service.test.ts  # Comprehensive tests

components/
  ignore/
    IgnoreRuleEditor.tsx    # Visual rule editor
    PatternTester.tsx       # Pattern testing UI

docs/
  ignore-system/
    README.md              # This file
    USER_GUIDE.md          # User documentation
    AINATIVEIGNORE_SPECIFICATION.md  # Specification
    API_REFERENCE.md       # API docs

.ainativeignore.example    # Example ignore file
```

## Testing

### Run Tests

```bash
npm test lib/__tests__/ignore-file-service.test.ts
```

### Test Coverage

- Pattern matching (simple, directory, recursive, negation)
- Special patterns (@secrets, @readonly, @noai, @temporary)
- Conditional rules (dev/prod/test modes)
- Priority system (multiple ignore files)
- Security detection (auto-detect sensitive files)
- Audit logging
- Rule management (add, remove, export, import)
- Edge cases (empty files, comments, spaces)
- Performance (caching, large rule sets)

## Migration

### From .gitignore

```bash
# Preview migration
ainative ignore migrate --dry-run

# Execute migration
ainative ignore migrate
```

The migration tool:

1. Reads your `.gitignore`
2. Identifies security-sensitive patterns
3. Converts to `.ainativeignore` format
4. Applies appropriate security levels
5. Generates suggested `.ainativeignore`

## Best Practices

### 1. Security First

Always start with security:

```bash
@secrets
@noai .env
@noai credentials/
```

### 2. Use Templates

Start with a template:

```bash
ainative ignore init --template nextjs
```

### 3. Document Rules

Add comments explaining why:

```bash
secrets.json      # Contains API keys
*.env             # Environment configuration
```

### 4. Test Regularly

Validate and test:

```bash
ainative ignore validate
ainative ignore test ".env"
ainative ignore scan
```

### 5. Review Audit Log

Check what AI is accessing:

```bash
ainative ignore audit
```

## Troubleshooting

### File Still Accessible

```bash
# Test the path
ainative ignore test "path/to/file"

# Check priority
ainative ignore list

# Use @noai for maximum security
echo "@noai path/to/file" >> .ainativeignore
```

### Pattern Not Matching

```bash
# Validate syntax
ainative ignore validate

# Test specific path
ainative ignore test "expected/path"

# Use correct glob syntax:
# * = single level
# ** = recursive
```

### Security Warning

```bash
# Scan for issues
ainative ignore scan

# Auto-add detected files
ainative ignore scan --auto-add
```

## Contributing

See main project CONTRIBUTING.md

## License

MIT License - Copyright (c) 2025 AINative Studio

## Support

- **Issues**: [GitHub Issues](https://github.com/ainative/ainative-studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ainative/ainative-studio/discussions)
- **Discord**: [AINative Community](https://discord.gg/ainative)

## References

- [Gemini CLI Issue #16980](https://github.com/google/gemini-cli/issues/16980) - Stop using .gitignore
- [Gemini CLI Issue #16941](https://github.com/google/gemini-cli/issues/16941) - .geminiignore not honored
- [minimatch](https://github.com/isaacs/minimatch) - Pattern matching library
- [glob patterns](https://en.wikipedia.org/wiki/Glob_(programming)) - Glob syntax reference

## Version

Current version: 1.0.0

Released: 2025-01-18
