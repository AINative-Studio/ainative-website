# .ainativeignore Quick Reference Card

## Pattern Syntax Cheat Sheet

### Basic Patterns

```bash
*.log              # All .log files
*.{js,ts}          # Multiple extensions
test/              # Directory
**/*.test.js       # Recursive
!important.log     # Negation (include)
```

### Special Patterns

```bash
@secrets           # Auto-detect secrets
@large-files       # Files > 1MB
@binary            # Binary files
@generated         # Auto-generated code
@readonly *.sql    # Read-only
@noai .env         # Never accessible
@temporary *.tmp expire:1h  # Expires in 1 hour
```

### Conditional

```bash
[dev] test-data/   # Dev only
[prod] debug/      # Prod only
[test] fixtures/   # Test only
```

### Comments

```bash
secrets.json      # Reason for rule
```

## CLI Commands

### Setup

```bash
ainative ignore init                 # Create .ainativeignore
ainative ignore init --template nextjs  # Use template
```

### Manage Rules

```bash
ainative ignore add "*.log"         # Add pattern
ainative ignore add ".env" --type noai  # Add with type
ainative ignore remove "*.log"      # Remove pattern
ainative ignore list                # List all rules
```

### Test & Validate

```bash
ainative ignore test ".env"         # Test path
ainative ignore validate            # Check syntax
ainative ignore scan                # Find sensitive files
ainative ignore scan --auto-add     # Auto-add detected
```

### Audit & Stats

```bash
ainative ignore audit               # View log
ainative ignore stats               # Statistics
```

### Migration

```bash
ainative ignore migrate --dry-run   # Preview
ainative ignore migrate             # Execute
```

## API Usage

### Basic

```typescript
import { IgnoreFileService } from '@ainative/ignore-file-service';

const service = new IgnoreFileService({ projectRoot: '/path' });
await service.initialize();

// Check file
const ignored = service.shouldIgnore('.env');

// Get details
const result = service.checkPath('.env');
console.log(result.ignored, result.reason, result.permission);
```

### Advanced

```typescript
// Add rule
service.addRule('*.log', 'exclude', 'Log files');

// Remove rule
service.removeRule('*.log');

// Validate pattern
const valid = service.validatePattern('*.js');

// Get all rules
const rules = service.getRules();

// Get audit log
const log = service.getAuditLog();

// Scan for sensitive files
const sensitive = service.detectSensitiveFiles('/path');
```

## React Components

### Editor

```tsx
import { IgnoreRuleEditor } from '@ainative/components/ignore';

<IgnoreRuleEditor
  projectRoot="/path"
  onRulesChange={(rules) => console.log(rules)}
/>
```

### Tester

```tsx
import { PatternTester } from '@ainative/components/ignore';

<PatternTester projectRoot="/path" />
```

## Rule Types

| Type | AI Read | AI Write | Use For |
|------|---------|----------|---------|
| `exclude` | ❌ | ❌ | Ignored files |
| `include` | ✅ | ✅ | Force include |
| `readonly` | ✅ | ❌ | Docs, migrations |
| `noai` | ❌ | ❌ | Secrets, credentials |

## File Priority

1. `.ainativeignore` (highest)
2. `.aiignore`
3. `.gitignore`
4. `~/.ainative/ignore`
5. Built-in defaults (lowest)

## Common Patterns

### Security

```bash
@secrets
@noai .env
@noai .env.*
@noai credentials/
@noai *.pem
!.env.example
```

### Build

```bash
node_modules/
.next/
dist/
build/
*.bundle.js
```

### Development

```bash
*.log
coverage/
.vscode/
.idea/
.DS_Store
```

### Read-Only

```bash
@readonly docs/
@readonly *.sql
@readonly README.md
```

### Temporary

```bash
@temporary *.tmp expire:1h
@temporary debug-*.log expire:2h
@temporary temp/ expire:1d
```

## Time Units

- `s` - Seconds
- `m` - Minutes
- `h` - Hours
- `d` - Days

Examples:
```bash
expire:30s    # 30 seconds
expire:5m     # 5 minutes
expire:2h     # 2 hours
expire:1d     # 1 day
```

## Templates

```bash
--template node      # Node.js
--template react     # React
--template nextjs    # Next.js
--template python    # Python
--template go        # Go
--template rust      # Rust
```

## Glob Patterns

| Pattern | Matches |
|---------|---------|
| `*` | Any files/dirs in same level |
| `**` | Recursive (any depth) |
| `?` | Single character |
| `[abc]` | Character class |
| `{a,b}` | Alternatives |
| `!` | Negation |

## Troubleshooting

### File Still Accessible

```bash
ainative ignore test "path/to/file"
ainative ignore list
echo "@noai path/to/file" >> .ainativeignore
```

### Pattern Not Matching

```bash
ainative ignore validate
ainative ignore test "expected/path"
```

### Security Issues

```bash
ainative ignore scan
ainative ignore scan --auto-add
```

## Examples

### Minimal

```bash
# .ainativeignore
@secrets
node_modules/
dist/
*.log
```

### Complete

```bash
# .ainativeignore

# Security
@secrets
@noai .env
!.env.example

# Dependencies
node_modules/

# Build
.next/
dist/

# Read-only
@readonly docs/
@readonly *.sql

# Logs
*.log

# Temporary
@temporary *.tmp expire:1h
```

## Quick Tips

1. **Always start with** `@secrets`
2. **Use** `@noai` **for sensitive files**
3. **Document with comments**
4. **Validate regularly**: `ainative ignore validate`
5. **Scan periodically**: `ainative ignore scan`
6. **Check audit log**: `ainative ignore audit`

## Help

```bash
ainative ignore --help
ainative ignore <command> --help
```

## Documentation

- **README**: `/docs/ignore-system/README.md`
- **User Guide**: `/docs/ignore-system/USER_GUIDE.md`
- **API Reference**: `/docs/ignore-system/API_REFERENCE.md`
- **Specification**: `/docs/ignore-system/AINATIVEIGNORE_SPECIFICATION.md`

## Version

Current: 1.0.0

---

**Print this card for quick reference!**
