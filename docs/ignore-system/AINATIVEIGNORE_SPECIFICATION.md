# .ainativeignore Specification

## Overview

The `.ainativeignore` file is a configuration file that controls which files and directories AI tools can access in your project. It provides a more powerful and flexible alternative to using `.gitignore` for AI access control.

## Motivation

**Problem:** Current AI tools (Gemini CLI, etc.) use `.gitignore` to determine file access, but:
- `.gitignore` is designed for version control, not AI access control
- Projects need separate ignore rules for AI tools vs git
- Security-sensitive files may need different handling
- Users want fine-grained permission control (read-only, no-access, etc.)

**Solution:** `.ainativeignore` provides dedicated AI access control with:
- Hierarchical ignore file system
- Advanced pattern matching
- Permission-based access control
- Security auto-detection
- Audit logging

## File Priority

Ignore rules are loaded in the following priority order (highest to lowest):

1. `.ainativeignore` - Project-specific AI ignore rules (highest priority)
2. `.aiignore` - General AI ignore rules
3. `.gitignore` - Git ignore rules (optional fallback)
4. `~/.ainative/ignore` - User-level global ignore rules
5. Built-in defaults - System defaults (lowest priority)

Higher priority rules override lower priority rules.

## Syntax

### Basic Patterns

```bash
# Exclude files matching pattern
*.log
node_modules/
dist/**

# Include exceptions (negation with !)
!important.log
!src/config/required.json

# Comments (full line)
# This is a comment

# Inline comments (reason for the rule)
secrets.json      # Contains API keys
*.env             # Environment variables
```

### Special Patterns

`.ainativeignore` supports special patterns prefixed with `@`:

#### @secrets
Auto-detect and block secret/credential files.

```bash
@secrets                    # Apply to all files
@secrets config/            # Apply to config directory
```

Matches patterns like:
- `**/.env*`
- `**/credentials.json`
- `**/*secret*`
- `**/*password*`
- `**/*.pem`

#### @large-files
Exclude files larger than a specified size (default 1MB).

```bash
@large-files                # Exclude all files > 1MB
@large-files uploads/       # Exclude large files in uploads/
```

#### @binary
Exclude binary files.

```bash
@binary                     # Exclude all binary files
@binary assets/             # Exclude binaries in assets/
```

Matches:
- `*.exe`, `*.dll`, `*.so`
- `*.pdf`, `*.doc`, `*.xls`
- `*.jpg`, `*.png`, `*.mp4`

#### @generated
Exclude auto-generated code.

```bash
@generated                  # Exclude all generated files
@generated build/           # Exclude generated files in build/
```

#### @readonly
Allow read-only access (AI can read but not modify).

```bash
@readonly *.sql             # SQL files are read-only
@readonly docs/             # Documentation is read-only
```

#### @noai
Completely block AI access (highest security).

```bash
@noai credentials/          # Never accessible by AI
@noai .env                  # Never accessible by AI
```

#### @temporary
Temporary ignore with auto-expiration.

```bash
@temporary *.tmp expire:1h      # Expires after 1 hour
@temporary debug/ expire:30m    # Expires after 30 minutes
@temporary test-data/ expire:2d # Expires after 2 days
```

Time units: `s` (seconds), `m` (minutes), `h` (hours), `d` (days)

### Conditional Ignores

Apply rules only in specific environments:

```bash
[dev] test-data/            # Only ignore in dev mode
[prod] debug/               # Only ignore in prod mode
[test] fixtures/            # Only ignore in test mode
```

### Permission Levels

Rules can specify different permission levels:

| Type | Description | AI Can Read | AI Can Write |
|------|-------------|-------------|--------------|
| `exclude` | Completely excluded | No | No |
| `include` | Explicitly included | Yes | Yes |
| `readonly` | Read-only access | Yes | No |
| `noai` | Never accessible | No | No |

## Examples

### Basic Node.js Project

```bash
# AINative Ignore File
# Node.js project

# Dependencies
node_modules/
.pnp/

# Build outputs
dist/
build/
.next/

# Environment files (never accessible by AI)
@noai .env          # Environment variables
@noai .env.*
!.env.example       # Example is safe to include

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# IDE
.vscode/
.idea/
```

### Security-Focused Project

```bash
# AINative Ignore File
# Security-focused configuration

# Auto-detect all secrets (high priority)
@secrets

# Credentials (never accessible)
@noai credentials/
@noai config/keys/
@noai *.pem
@noai *.key

# Database files (read-only)
@readonly *.sql
@readonly migrations/

# Configuration (read-only)
@readonly config/production.json

# Temporary debug files (expire after 1 hour)
@temporary debug-*.log expire:1h
```

### Full-Stack Application

```bash
# AINative Ignore File
# Full-stack application

# Backend
[prod] backend/debug/       # Debug only in dev
@noai backend/config/secrets.yml
@readonly backend/migrations/

# Frontend
node_modules/
.next/
build/

# Environment files
@noai .env
@noai .env.local
@noai .env.production
!.env.example

# Database
@readonly *.sql
@noai database/backups/

# Media files (large binaries)
@binary uploads/
@large-files public/videos/

# Documentation (read-only)
@readonly docs/
@readonly README.md

# Temporary files
@temporary *.tmp expire:1h
```

## Migration from .gitignore

To migrate from `.gitignore` to `.ainativeignore`:

```bash
# Using CLI
ainative ignore migrate

# With dry-run
ainative ignore migrate --dry-run

# From custom location
ainative ignore migrate --source /path/to/.gitignore
```

The migration tool will:
1. Read your `.gitignore`
2. Identify security-sensitive patterns
3. Convert to `.ainativeignore` format
4. Apply appropriate security levels (`@noai` for sensitive files)
5. Generate a suggested `.ainativeignore`

## Best Practices

### 1. Start with Security
Always use `@secrets` and `@noai` for sensitive files:

```bash
@secrets
@noai .env
@noai credentials/
```

### 2. Use Read-Only for Data
Protect important data files from modification:

```bash
@readonly *.sql
@readonly migrations/
@readonly docs/
```

### 3. Environment-Specific Rules
Use conditional rules for different environments:

```bash
[dev] test-data/
[prod] debug/
```

### 4. Document Your Rules
Add comments explaining why files are ignored:

```bash
secrets.json      # Contains API keys and passwords
*.env             # Environment-specific configuration
test-data/        # Large test fixtures
```

### 5. Use Temporary Rules for Debugging
Clean up automatically with expiring rules:

```bash
@temporary debug-*.log expire:1h
@temporary temp-data/ expire:2d
```

### 6. Validate Regularly
Check your ignore file for errors:

```bash
ainative ignore validate
```

## CLI Commands

### Initialize
```bash
# Create new .ainativeignore with template
ainative ignore init

# Use specific template
ainative ignore init --template nextjs
```

### Add Pattern
```bash
# Add exclude pattern
ainative ignore add "*.log"

# Add with reason
ainative ignore add "secrets.json" --reason "Contains API keys"

# Add with type
ainative ignore add "*.sql" --type readonly
```

### Remove Pattern
```bash
ainative ignore remove "*.log"
```

### List Rules
```bash
# List all rules
ainative ignore list

# List from specific source
ainative ignore list --source .ainativeignore

# List specific type
ainative ignore list --type noai

# Include built-in rules
ainative ignore list --include-builtin
```

### Test Path
```bash
# Test if path would be ignored
ainative ignore test "src/config/.env"

# Get detailed information
ainative ignore test "secrets.json"
```

### Scan for Sensitive Files
```bash
# Scan for security issues
ainative ignore scan

# Auto-add detected files
ainative ignore scan --auto-add
```

### View Audit Log
```bash
# Show audit log
ainative ignore audit

# Filter by action
ainative ignore audit --action ignore

# Limit results
ainative ignore audit --limit 100
```

### Statistics
```bash
# Show ignore statistics
ainative ignore stats
```

### Validate
```bash
# Validate syntax
ainative ignore validate
```

## Security Features

### Auto-Detection
The system automatically detects:
- Secret files (`.env`, `credentials.json`, etc.)
- Large files (> 1MB by default)
- Binary files
- Sensitive patterns (passwords, tokens, keys)

### Audit Logging
Every file access is logged:
- Timestamp
- File path
- Action (access/ignore/block)
- Matching rule
- Reason

View audit log:
```bash
ainative ignore audit
```

### Permission Levels
Fine-grained control:
- **exclude**: File is ignored
- **include**: File is accessible
- **readonly**: File can be read but not modified
- **noai**: File is never accessible by AI

### Encryption
Sensitive ignore patterns can be encrypted at rest (planned feature).

## Performance

### Caching
- Parsed rules are cached for performance
- File watching for auto-reload
- Up to 10,000 audit log entries

### Pattern Matching
- Uses `minimatch` for glob pattern matching
- Efficient priority-based rule evaluation
- Early termination for high-priority rules

## Troubleshooting

### File Still Accessible
1. Check rule priority: `ainative ignore test "path/to/file"`
2. Verify pattern: `ainative ignore validate`
3. Check mode: ensure conditional rules match current environment
4. Review audit log: `ainative ignore audit`

### Pattern Not Matching
1. Test pattern: `ainative ignore test "path"`
2. Check syntax: `ainative ignore validate`
3. Verify glob syntax: use `**` for recursive, `*` for single level

### Security Concerns
1. Scan for sensitive files: `ainative ignore scan`
2. Use `@noai` for maximum protection
3. Review audit log regularly
4. Keep `.ainativeignore` in version control

## References

- [Gemini CLI Issue #16980](https://github.com/google/gemini-cli/issues/16980) - Stop using .gitignore
- [Gemini CLI Issue #16941](https://github.com/google/gemini-cli/issues/16941) - .geminiignore not honored
- [minimatch documentation](https://github.com/isaacs/minimatch) - Pattern matching
- [glob patterns](https://en.wikipedia.org/wiki/Glob_(programming)) - Glob syntax

## Version

Current specification version: 1.0.0

## License

MIT License - Copyright (c) 2025 AINative Studio
