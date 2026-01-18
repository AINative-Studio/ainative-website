# AINative Ignore System - User Guide

## Quick Start

### 1. Initialize Your Project

Create a `.ainativeignore` file in your project root:

```bash
ainative ignore init
```

Or with a specific template:

```bash
ainative ignore init --template nextjs
```

### 2. Add Ignore Patterns

```bash
# Exclude log files
ainative ignore add "*.log"

# Block sensitive files
ainative ignore add ".env" --type noai --reason "Environment variables"

# Make files read-only
ainative ignore add "*.sql" --type readonly --reason "Database migrations"
```

### 3. Test Your Patterns

```bash
# Test if a file would be ignored
ainative ignore test "src/config/.env.local"
```

### 4. Migrate from .gitignore

If you have an existing `.gitignore`:

```bash
ainative ignore migrate
```

## Common Use Cases

### Protecting Secrets

The most common use case is protecting sensitive files:

```bash
# .ainativeignore

# Auto-detect all secrets
@secrets

# Specific files (never accessible by AI)
@noai .env
@noai .env.local
@noai .env.production
@noai config/credentials.json
@noai config/keys/

# Allow .env.example (safe template)
!.env.example
```

**Why this matters:** AI tools should never have access to API keys, passwords, or other secrets.

### Excluding Build Outputs

Ignore generated files to reduce noise:

```bash
# .ainativeignore

# Build outputs
dist/
build/
.next/
out/

# Dependencies
node_modules/

# Auto-generated files
@generated
```

### Read-Only Access

Allow AI to read but not modify important files:

```bash
# .ainativeignore

# Database migrations (read-only)
@readonly migrations/

# Documentation (read-only)
@readonly docs/
@readonly README.md

# SQL files (read-only)
@readonly *.sql
```

### Environment-Specific Rules

Different rules for dev vs production:

```bash
# .ainativeignore

# Only ignore test data in dev
[dev] test-data/
[dev] fixtures/

# Only ignore debug files in production
[prod] debug/
[prod] *.debug.log
```

### Temporary Files

Auto-cleanup with expiring rules:

```bash
# .ainativeignore

# Temporary debug files (expire after 1 hour)
@temporary debug-*.log expire:1h

# Temporary test data (expire after 2 days)
@temporary temp/ expire:2d
```

## Patterns Reference

### Basic Patterns

| Pattern | Matches | Example |
|---------|---------|---------|
| `*.log` | All `.log` files | `debug.log`, `error.log` |
| `*.{js,ts}` | Files with `.js` or `.ts` | `index.js`, `app.ts` |
| `test/` | `test` directory | `test/file.js` |
| `**/*.test.js` | Recursive `.test.js` files | `src/app.test.js` |
| `!important.log` | Negation (include) | Allow `important.log` |

### Special Patterns

| Pattern | Description |
|---------|-------------|
| `@secrets` | Auto-detect secrets |
| `@large-files` | Files > 1MB |
| `@binary` | Binary files |
| `@generated` | Auto-generated code |
| `@readonly <pattern>` | Read-only access |
| `@noai <pattern>` | Never accessible by AI |
| `@temporary <pattern> expire:1h` | Temporary (1 hour) |

### Conditional Patterns

| Pattern | Description |
|---------|-------------|
| `[dev] test-data/` | Only in dev mode |
| `[prod] debug/` | Only in prod mode |
| `[test] fixtures/` | Only in test mode |

## CLI Reference

### Initialize

```bash
# Create .ainativeignore with default template
ainative ignore init

# Use specific template
ainative ignore init --template node
ainative ignore init --template react
ainative ignore init --template nextjs
ainative ignore init --template python
ainative ignore init --template go
ainative ignore init --template rust

# Force overwrite existing file
ainative ignore init --force
```

### Add Patterns

```bash
# Basic pattern
ainative ignore add "*.log"

# With reason
ainative ignore add "secrets.json" --reason "Contains API keys"

# With type
ainative ignore add "*.sql" --type readonly
ainative ignore add ".env" --type noai

# Types: exclude, include, readonly, noai
```

### Remove Patterns

```bash
# Remove specific pattern
ainative ignore remove "*.log"
```

### List Rules

```bash
# List all rules
ainative ignore list

# List from specific source
ainative ignore list --source .ainativeignore
ainative ignore list --source .gitignore

# List specific type
ainative ignore list --type noai
ainative ignore list --type readonly

# Include built-in rules
ainative ignore list --include-builtin

# JSON output
ainative ignore list --json
```

### Test Paths

```bash
# Test if path would be ignored
ainative ignore test "src/config/.env"

# JSON output
ainative ignore test "secrets.json" --json
```

### Scan for Sensitive Files

```bash
# Scan for security issues
ainative ignore scan

# Auto-add detected files
ainative ignore scan --auto-add
```

### Audit Log

```bash
# Show audit log
ainative ignore audit

# Filter by action
ainative ignore audit --action ignore
ainative ignore audit --action access
ainative ignore audit --action block

# Limit results
ainative ignore audit --limit 50

# JSON output
ainative ignore audit --json
```

### Migrate from .gitignore

```bash
# Migrate from .gitignore
ainative ignore migrate

# Dry run (preview only)
ainative ignore migrate --dry-run

# Custom source
ainative ignore migrate --source /path/to/.gitignore
```

### Statistics

```bash
# Show statistics
ainative ignore stats
```

### Validate

```bash
# Validate syntax
ainative ignore validate
```

## Best Practices

### 1. Security First

Always start with security:

```bash
# .ainativeignore

# Line 1: Auto-detect all secrets
@secrets

# Specific sensitive files
@noai .env
@noai credentials/
@noai config/keys/
```

### 2. Document Your Rules

Add comments explaining why:

```bash
# .ainativeignore

# Environment files - contain API keys and secrets
@noai .env
@noai .env.*

# Database files - sensitive data
@noai *.db
@noai *.sqlite

# Build outputs - auto-generated, no value for AI
dist/
build/
```

### 3. Use Templates

Start with a template for your stack:

```bash
# Node.js/JavaScript
ainative ignore init --template node

# React
ainative ignore init --template react

# Next.js
ainative ignore init --template nextjs
```

Then customize for your needs.

### 4. Test Before Committing

Always validate and test:

```bash
# Validate syntax
ainative ignore validate

# Test important paths
ainative ignore test ".env"
ainative ignore test "src/index.js"

# Scan for security issues
ainative ignore scan
```

### 5. Regular Security Scans

Run periodic security scans:

```bash
# Weekly scan
ainative ignore scan

# Auto-add detected sensitive files
ainative ignore scan --auto-add
```

### 6. Review Audit Log

Check what AI is accessing:

```bash
# Recent activity
ainative ignore audit --limit 100

# Ignored files
ainative ignore audit --action ignore

# Blocked access
ainative ignore audit --action block
```

## Troubleshooting

### File Still Accessible

**Problem:** File should be ignored but AI can still access it.

**Solution:**

1. Test the path:
   ```bash
   ainative ignore test "path/to/file"
   ```

2. Check rule priority:
   ```bash
   ainative ignore list
   ```

3. Use higher priority rule:
   ```bash
   # Add to .ainativeignore (highest priority)
   @noai path/to/file
   ```

### Pattern Not Matching

**Problem:** Pattern doesn't match expected files.

**Solution:**

1. Validate syntax:
   ```bash
   ainative ignore validate
   ```

2. Test specific paths:
   ```bash
   ainative ignore test "expected/path/file.txt"
   ```

3. Use correct glob syntax:
   - `*` - Single level: `*.js` matches `file.js` but not `dir/file.js`
   - `**` - Recursive: `**/*.js` matches all `.js` files at any depth
   - `/` - Directory: `node_modules/` matches directory and contents

### Security Warning

**Problem:** Sensitive files detected.

**Solution:**

1. Scan for issues:
   ```bash
   ainative ignore scan
   ```

2. Review detected files and add to ignore:
   ```bash
   ainative ignore scan --auto-add
   ```

3. Use `@noai` for maximum security:
   ```bash
   @noai credentials/
   @noai *.pem
   @noai config/keys/
   ```

## Integration with AI Tools

### Gemini CLI

The `.ainativeignore` file is designed to work with Gemini CLI and other AI coding tools:

1. Create `.ainativeignore` in your project root
2. Gemini CLI will automatically respect the rules
3. Use `ainative ignore test` to verify paths

### Claude Code

Claude Code also supports `.ainativeignore`:

1. Initialize ignore file: `ainative ignore init`
2. Claude Code will honor ignore rules
3. Use audit log to track access: `ainative ignore audit`

### Custom AI Tools

To integrate with your custom AI tools:

1. Use the `IgnoreFileService` API:
   ```typescript
   import { IgnoreFileService } from '@ainative/ignore-file-service';

   const service = new IgnoreFileService({ projectRoot: '/path/to/project' });
   await service.initialize();

   // Check if file should be ignored
   const result = service.checkPath('src/config/.env');
   if (result.ignored) {
     console.log('File is ignored:', result.reason);
   }
   ```

2. Respect permission levels:
   - `none` - File is blocked
   - `read` - File is read-only
   - `write` - File is fully accessible

## Examples

### Complete Next.js Project

```bash
# .ainativeignore
# Next.js project with security best practices

# Security - never accessible by AI
@secrets
@noai .env
@noai .env.local
@noai .env.production
!.env.example

# Dependencies
node_modules/
.pnp/

# Build outputs
.next/
out/
dist/
build/

# Testing
coverage/
.nyc_output/

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Read-only files
@readonly migrations/
@readonly docs/

# Temporary files
@temporary *.tmp expire:1h
@temporary debug-*.log expire:2h
```

### Python Data Science Project

```bash
# .ainativeignore
# Python data science project

# Virtual environments
venv/
.venv/
env/

# Data files (large)
@large-files data/
@binary *.pkl
@binary *.h5

# Credentials
@noai .env
@noai credentials.json
@noai config/keys/

# Notebooks checkpoints
.ipynb_checkpoints/

# Build outputs
__pycache__/
*.py[cod]
dist/
build/
*.egg-info/

# Read-only
@readonly README.md
@readonly docs/
```

### Full-Stack Application

```bash
# .ainativeignore
# Full-stack application (frontend + backend)

# Security
@secrets
@noai .env
@noai .env.*
@noai backend/config/credentials.yml
!.env.example

# Frontend
node_modules/
.next/
build/
dist/

# Backend
[prod] backend/debug/
@readonly backend/migrations/
@noai backend/config/production.yml

# Database
@readonly *.sql
@noai database/backups/

# Media files
@binary uploads/
@large-files public/videos/

# Documentation
@readonly docs/
@readonly README.md

# Temporary
@temporary *.tmp expire:1h
@temporary temp/ expire:2d
```

## FAQ

**Q: Should I commit `.ainativeignore` to version control?**

A: Yes! `.ainativeignore` should be committed to your repository so all team members and AI tools use the same rules.

**Q: What's the difference between `.ainativeignore` and `.gitignore`?**

A: `.gitignore` controls what Git tracks. `.ainativeignore` controls what AI tools can access. They serve different purposes.

**Q: Can I use both `.gitignore` and `.ainativeignore`?**

A: Yes! `.ainativeignore` takes priority, but you can enable `.gitignore` as a fallback for patterns you haven't explicitly configured.

**Q: What happens if a file matches multiple patterns?**

A: Higher priority rules win. Priority order:
1. `.ainativeignore` (highest)
2. `.aiignore`
3. `.gitignore`
4. Global `~/.ainative/ignore`
5. Built-in defaults (lowest)

**Q: How do I see what files AI is accessing?**

A: Use the audit log:
```bash
ainative ignore audit
```

**Q: Can I encrypt my ignore patterns?**

A: This is a planned feature. For now, don't include sensitive information in the ignore patterns themselves.

## Support

### Documentation
- [Specification](./AINATIVEIGNORE_SPECIFICATION.md) - Complete technical specification
- [API Reference](./API_REFERENCE.md) - Developer API documentation

### Issues
- [Gemini CLI #16980](https://github.com/google/gemini-cli/issues/16980) - Original issue
- [GitHub Issues](https://github.com/ainative/ainative-studio/issues) - Report bugs

### Community
- [Discord](https://discord.gg/ainative) - Get help from community
- [Forum](https://forum.ainative.com) - Discussion and best practices
