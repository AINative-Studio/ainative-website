/**
 * CLI Commands for AINative Ignore File Management
 *
 * Provides command-line interface for managing ignore rules:
 * - ainative ignore add <pattern>
 * - ainative ignore remove <pattern>
 * - ainative ignore list
 * - ainative ignore test <path>
 * - ainative ignore init
 * - ainative ignore audit
 * - ainative ignore migrate
 */

import { IgnoreFileService, IgnoreType, IgnoreMode } from './ignore-file-service';
import * as fs from 'fs';
import * as path from 'path';

export interface CliOptions {
  projectRoot?: string;
  mode?: IgnoreMode;
  verbose?: boolean;
  json?: boolean;
}

export class IgnoreCli {
  private service: IgnoreFileService;
  private options: CliOptions;

  constructor(options: CliOptions = {}) {
    this.options = options;
    this.service = new IgnoreFileService({
      projectRoot: options.projectRoot,
      mode: options.mode,
    });
  }

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  /**
   * Add a new ignore pattern
   *
   * Usage:
   *   ainative ignore add "*.log"
   *   ainative ignore add "secrets.json" --reason "Contains API keys"
   *   ainative ignore add "*.tmp" --type readonly
   */
  async add(
    pattern: string,
    options: {
      type?: IgnoreType;
      reason?: string;
      mode?: IgnoreMode;
    } = {}
  ): Promise<void> {
    const type = options.type || 'exclude';
    const reason = options.reason;

    // Validate pattern
    const validation = this.service.validatePattern(pattern);
    if (!validation.valid) {
      this.error(`Invalid pattern: ${validation.error}`);
      return;
    }

    // Add rule
    this.service.addRule(pattern, type, reason);

    // Write to .ainativeignore
    await this.appendToIgnoreFile(pattern, type, reason);

    this.success(`Added ignore pattern: ${pattern}`);
    if (reason) {
      this.info(`Reason: ${reason}`);
    }
  }

  /**
   * Remove an ignore pattern
   *
   * Usage:
   *   ainative ignore remove "*.log"
   */
  async remove(pattern: string): Promise<void> {
    const removed = this.service.removeRule(pattern);

    if (removed) {
      // Remove from .ainativeignore
      await this.removeFromIgnoreFile(pattern);
      this.success(`Removed ignore pattern: ${pattern}`);
    } else {
      this.warn(`Pattern not found: ${pattern}`);
    }
  }

  /**
   * List all ignore patterns
   *
   * Usage:
   *   ainative ignore list
   *   ainative ignore list --source .ainativeignore
   *   ainative ignore list --type exclude
   */
  async list(options: {
    source?: string;
    type?: IgnoreType;
    includeBuiltIn?: boolean;
  } = {}): Promise<void> {
    const rules = this.service.getRules();

    // Filter by source
    let filtered = rules;
    if (options.source) {
      filtered = filtered.filter(rule => rule.source === options.source);
    }

    // Filter by type
    if (options.type) {
      filtered = filtered.filter(rule => rule.type === options.type);
    }

    // Filter out built-in
    if (!options.includeBuiltIn) {
      filtered = filtered.filter(rule => rule.source !== 'built-in');
    }

    if (this.options.json) {
      console.log(JSON.stringify(filtered, null, 2));
      return;
    }

    this.info(`Total ignore rules: ${filtered.length}\n`);

    // Group by source
    const bySource = new Map<string, typeof filtered>();
    for (const rule of filtered) {
      const existing = bySource.get(rule.source) || [];
      existing.push(rule);
      bySource.set(rule.source, existing);
    }

    // Display by source
    for (const [source, sourceRules] of bySource) {
      console.log(`\n${this.bold(source.toUpperCase())} (${sourceRules.length} rules):`);
      console.log('─'.repeat(60));

      for (const rule of sourceRules) {
        const typeLabel = this.colorizeType(rule.type);
        const pattern = this.colorize(rule.pattern, 'cyan');

        console.log(`  ${typeLabel} ${pattern}`);

        if (rule.reason) {
          console.log(`    ${this.colorize(`↳ ${rule.reason}`, 'gray')}`);
        }

        if (rule.expiresAt) {
          console.log(`    ${this.colorize(`↳ Expires: ${rule.expiresAt.toISOString()}`, 'yellow')}`);
        }
      }
    }

    console.log('');
  }

  /**
   * Test if a path would be ignored
   *
   * Usage:
   *   ainative ignore test "src/secrets.json"
   *   ainative ignore test "**/*.log"
   */
  async test(filePath: string): Promise<void> {
    const result = this.service.checkPath(filePath);

    if (this.options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log(`\nTesting: ${this.colorize(filePath, 'cyan')}\n`);

    if (result.ignored) {
      console.log(`${this.colorize('✗ IGNORED', 'red')}`);
      console.log(`Reason: ${result.reason}`);

      if (result.rule) {
        console.log(`Pattern: ${result.rule.pattern}`);
        console.log(`Source: ${result.rule.source}`);
        console.log(`Type: ${this.colorizeType(result.rule.type)}`);
      }
    } else {
      console.log(`${this.colorize('✓ ALLOWED', 'green')}`);
      console.log(`Permission: ${result.permission}`);

      if (result.rule) {
        console.log(`Matched: ${result.rule.pattern}`);
        console.log(`Source: ${result.rule.source}`);
      }
    }

    console.log('');
  }

  /**
   * Initialize ignore file with templates
   *
   * Usage:
   *   ainative ignore init
   *   ainative ignore init --template node
   *   ainative ignore init --template python
   */
  async init(options: {
    template?: 'node' | 'python' | 'react' | 'nextjs' | 'go' | 'rust';
    force?: boolean;
  } = {}): Promise<void> {
    const ignoreFilePath = path.join(
      this.options.projectRoot || process.cwd(),
      '.ainativeignore'
    );

    // Check if file already exists
    if (fs.existsSync(ignoreFilePath) && !options.force) {
      this.warn('.ainativeignore already exists. Use --force to overwrite.');
      return;
    }

    // Generate template content
    const content = this.generateTemplate(options.template || 'node');

    // Write file
    fs.writeFileSync(ignoreFilePath, content, 'utf-8');

    this.success(`Created .ainativeignore with ${options.template || 'node'} template`);
    this.info(`Edit the file to customize ignore patterns for your project.`);
  }

  /**
   * Display audit log
   *
   * Usage:
   *   ainative ignore audit
   *   ainative ignore audit --action ignore
   *   ainative ignore audit --limit 100
   */
  async audit(options: {
    action?: 'access' | 'ignore' | 'block';
    limit?: number;
  } = {}): Promise<void> {
    const log = this.service.getAuditLog();

    let filtered = log;
    if (options.action) {
      filtered = filtered.filter(entry => entry.action === options.action);
    }

    // Apply limit
    const limit = options.limit || 100;
    const displayed = filtered.slice(-limit);

    if (this.options.json) {
      console.log(JSON.stringify(displayed, null, 2));
      return;
    }

    this.info(`Audit Log (showing last ${displayed.length} of ${filtered.length} entries)\n`);

    for (const entry of displayed) {
      const timestamp = entry.timestamp.toISOString();
      const action = this.colorizeAction(entry.action);
      const path = this.colorize(entry.path, 'cyan');

      console.log(`${timestamp} ${action} ${path}`);

      if (entry.rule) {
        console.log(`  Pattern: ${entry.rule}`);
      }

      if (entry.reason) {
        console.log(`  Reason: ${entry.reason}`);
      }

      console.log('');
    }
  }

  /**
   * Migrate from .gitignore to .ainativeignore
   *
   * Usage:
   *   ainative ignore migrate
   *   ainative ignore migrate --source /path/to/.gitignore
   *   ainative ignore migrate --dry-run
   */
  async migrate(options: {
    source?: string;
    dryRun?: boolean;
  } = {}): Promise<void> {
    const gitignorePath = options.source || path.join(
      this.options.projectRoot || process.cwd(),
      '.gitignore'
    );

    if (!fs.existsSync(gitignorePath)) {
      this.error('.gitignore not found');
      return;
    }

    this.info('Migrating from .gitignore to .ainativeignore...\n');

    // Read .gitignore
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    const lines = content.split('\n');

    const suggestions: string[] = [];
    const securityPatterns: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Check if it's a security-sensitive pattern
      const isSecurity = this.isSecurityPattern(trimmed);

      if (isSecurity) {
        securityPatterns.push(trimmed);
      } else {
        suggestions.push(trimmed);
      }
    }

    // Display suggestions
    console.log(this.bold('SUGGESTED PATTERNS:'));
    console.log('─'.repeat(60));
    for (const pattern of suggestions) {
      console.log(`  ${pattern}`);
    }

    console.log(`\n${this.bold('SECURITY PATTERNS (will use @noai):')}`);
    console.log('─'.repeat(60));
    for (const pattern of securityPatterns) {
      console.log(`  ${this.colorize(pattern, 'red')} ${this.colorize('(@noai)', 'yellow')}`);
    }

    console.log('');

    if (options.dryRun) {
      this.info('Dry run complete. No files were modified.');
      return;
    }

    // Create .ainativeignore
    const ainativeIgnorePath = path.join(
      this.options.projectRoot || process.cwd(),
      '.ainativeignore'
    );

    const ainativeContent = this.generateMigrationContent(suggestions, securityPatterns);
    fs.writeFileSync(ainativeIgnorePath, ainativeContent, 'utf-8');

    this.success(`Migration complete! Created .ainativeignore with ${suggestions.length + securityPatterns.length} patterns.`);
    this.info('Review the file and adjust as needed.');
  }

  /**
   * Scan for sensitive files
   *
   * Usage:
   *   ainative ignore scan
   *   ainative ignore scan --auto-add
   */
  async scan(options: {
    autoAdd?: boolean;
  } = {}): Promise<void> {
    this.info('Scanning for sensitive files...\n');

    const projectRoot = this.options.projectRoot || process.cwd();
    const sensitiveFiles = this.service.detectSensitiveFiles(projectRoot);

    if (sensitiveFiles.length === 0) {
      this.success('No sensitive files detected.');
      return;
    }

    this.warn(`Found ${sensitiveFiles.length} potentially sensitive files:\n`);

    for (const file of sensitiveFiles) {
      console.log(`  ${this.colorize('⚠', 'yellow')} ${file}`);
    }

    console.log('');

    if (options.autoAdd) {
      this.info('Adding patterns to .ainativeignore...');

      // Extract unique patterns
      const patterns = new Set<string>();
      for (const file of sensitiveFiles) {
        // Add the specific file
        patterns.add(file);
      }

      // Write to .ainativeignore
      for (const pattern of patterns) {
        await this.appendToIgnoreFile(pattern, 'noai', 'Auto-detected sensitive file');
      }

      this.success(`Added ${patterns.size} patterns to .ainativeignore`);
    } else {
      this.info('Run with --auto-add to automatically add these patterns to .ainativeignore');
    }
  }

  /**
   * Show statistics
   *
   * Usage:
   *   ainative ignore stats
   */
  async stats(): Promise<void> {
    const rules = this.service.getRules();

    // Count by source
    const bySource = new Map<string, number>();
    for (const rule of rules) {
      bySource.set(rule.source, (bySource.get(rule.source) || 0) + 1);
    }

    // Count by type
    const byType = new Map<IgnoreType, number>();
    for (const rule of rules) {
      byType.set(rule.type, (byType.get(rule.type) || 0) + 1);
    }

    console.log('\n' + this.bold('IGNORE STATISTICS'));
    console.log('═'.repeat(60));

    console.log(`\nTotal Rules: ${this.colorize(rules.length.toString(), 'cyan')}`);

    console.log(`\n${this.bold('By Source:')}`);
    for (const [source, count] of bySource) {
      console.log(`  ${source.padEnd(20)} ${count}`);
    }

    console.log(`\n${this.bold('By Type:')}`);
    for (const [type, count] of byType) {
      console.log(`  ${type.padEnd(20)} ${count}`);
    }

    // Audit log stats
    const auditLog = this.service.getAuditLog();
    console.log(`\n${this.bold('Audit Log:')}`);
    console.log(`  Total Entries: ${auditLog.length}`);

    const recentIgnores = auditLog.filter(e => e.action === 'ignore').slice(-10);
    if (recentIgnores.length > 0) {
      console.log(`\n${this.bold('Recently Ignored:')}`);
      for (const entry of recentIgnores) {
        console.log(`  ${entry.path}`);
      }
    }

    console.log('');
  }

  /**
   * Validate ignore file syntax
   *
   * Usage:
   *   ainative ignore validate
   */
  async validate(): Promise<void> {
    const ignoreFilePath = path.join(
      this.options.projectRoot || process.cwd(),
      '.ainativeignore'
    );

    if (!fs.existsSync(ignoreFilePath)) {
      this.warn('.ainativeignore not found');
      return;
    }

    const content = fs.readFileSync(ignoreFilePath, 'utf-8');
    const lines = content.split('\n');

    let errors = 0;
    let warnings = 0;

    console.log('\n' + this.bold('VALIDATING .ainativeignore'));
    console.log('═'.repeat(60) + '\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        continue;
      }

      // Extract pattern
      let pattern = line;
      const commentMatch = line.match(/^([^#]+)\s*#/);
      if (commentMatch) {
        pattern = commentMatch[1].trim();
      }

      // Remove mode prefix
      const modeMatch = pattern.match(/^\[(dev|prod|test)\]\s+(.+)$/);
      if (modeMatch) {
        pattern = modeMatch[2].trim();
      }

      // Remove negation
      if (pattern.startsWith('!')) {
        pattern = pattern.slice(1).trim();
      }

      // Remove special patterns
      if (pattern.startsWith('@')) {
        continue; // Special patterns are always valid
      }

      // Validate pattern
      const validation = this.service.validatePattern(pattern);
      if (!validation.valid) {
        console.log(`${this.colorize('✗', 'red')} Line ${lineNumber}: ${line}`);
        console.log(`  ${this.colorize(`Error: ${validation.error}`, 'red')}\n`);
        errors++;
      }
    }

    if (errors === 0 && warnings === 0) {
      this.success('Validation passed! No errors or warnings found.');
    } else {
      console.log(`\n${this.bold('SUMMARY:')}`);
      console.log(`  Errors: ${this.colorize(errors.toString(), errors > 0 ? 'red' : 'green')}`);
      console.log(`  Warnings: ${this.colorize(warnings.toString(), warnings > 0 ? 'yellow' : 'green')}`);
    }

    console.log('');
  }

  // Helper methods

  private async appendToIgnoreFile(pattern: string, type: IgnoreType, reason?: string): Promise<void> {
    const ignoreFilePath = path.join(
      this.options.projectRoot || process.cwd(),
      '.ainativeignore'
    );

    let line = pattern;

    // Add special prefix for non-standard types
    if (type === 'readonly') {
      line = `@readonly ${pattern}`;
    } else if (type === 'noai') {
      line = `@noai ${pattern}`;
    }

    // Add reason as comment
    if (reason) {
      line += ` # ${reason}`;
    }

    line += '\n';

    // Append to file
    fs.appendFileSync(ignoreFilePath, line, 'utf-8');
  }

  private async removeFromIgnoreFile(pattern: string): Promise<void> {
    const ignoreFilePath = path.join(
      this.options.projectRoot || process.cwd(),
      '.ainativeignore'
    );

    if (!fs.existsSync(ignoreFilePath)) {
      return;
    }

    const content = fs.readFileSync(ignoreFilePath, 'utf-8');
    const lines = content.split('\n');

    const filtered = lines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.includes(pattern);
    });

    fs.writeFileSync(ignoreFilePath, filtered.join('\n'), 'utf-8');
  }

  private generateTemplate(template: string): string {
    const templates: Record<string, string> = {
      node: `# AINative Ignore File
# Generated for Node.js/JavaScript project

# Dependencies
node_modules/
.pnp
.pnp.*

# Build outputs
dist/
build/
.next/
out/

# Environment files
@noai .env          # Environment variables
@noai .env.*        # Environment files
!.env.example       # Example is safe to include

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# Testing
coverage/
.nyc_output/

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Temporary files
@temporary *.tmp expire:1h
`,

      react: `# AINative Ignore File
# Generated for React project

# Dependencies
node_modules/

# Build outputs
build/
dist/

# Environment files
@noai .env          # Environment variables
@noai .env.local
!.env.example

# Testing
coverage/

# IDE
.vscode/
.idea/
`,

      nextjs: `# AINative Ignore File
# Generated for Next.js project

# Dependencies
node_modules/
.pnp/

# Build outputs
.next/
out/
dist/

# Environment files
@noai .env          # Environment variables
@noai .env.local
@noai .env.production
!.env.example

# Testing
coverage/
.nyc_output/

# Logs
*.log

# IDE
.vscode/
.idea/
`,

      python: `# AINative Ignore File
# Generated for Python project

# Virtual environments
venv/
env/
.venv/

# Build outputs
__pycache__/
*.py[cod]
*$py.class
dist/
build/
*.egg-info/

# Environment files
@noai .env          # Environment variables
@noai .env.*
!.env.example

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
`,

      go: `# AINative Ignore File
# Generated for Go project

# Build outputs
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binaries
*.test

# Environment files
@noai .env          # Environment variables
!.env.example

# IDE
.vscode/
.idea/

# OS
.DS_Store
`,

      rust: `# AINative Ignore File
# Generated for Rust project

# Build outputs
target/
Cargo.lock

# Environment files
@noai .env          # Environment variables
!.env.example

# IDE
.vscode/
.idea/

# OS
.DS_Store
`,
    };

    return templates[template] || templates.node;
  }

  private generateMigrationContent(patterns: string[], securityPatterns: string[]): string {
    const lines = [
      '# AINative Ignore File',
      '# Migrated from .gitignore',
      '# Generated: ' + new Date().toISOString(),
      '',
      '# Standard patterns',
    ];

    for (const pattern of patterns) {
      lines.push(pattern);
    }

    lines.push('');
    lines.push('# Security-sensitive patterns');

    for (const pattern of securityPatterns) {
      lines.push(`@noai ${pattern} # Security-sensitive`);
    }

    return lines.join('\n') + '\n';
  }

  private isSecurityPattern(pattern: string): boolean {
    const securityKeywords = [
      'secret',
      'credential',
      'password',
      'token',
      'key',
      '.env',
      '.pem',
      'private',
      'auth',
    ];

    const lower = pattern.toLowerCase();
    return securityKeywords.some(keyword => lower.includes(keyword));
  }

  private colorize(text: string, color: 'red' | 'green' | 'yellow' | 'cyan' | 'gray'): string {
    if (this.options.json) {
      return text;
    }

    const colors: Record<string, string> = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m',
      reset: '\x1b[0m',
    };

    return `${colors[color]}${text}${colors.reset}`;
  }

  private bold(text: string): string {
    if (this.options.json) {
      return text;
    }
    return `\x1b[1m${text}\x1b[0m`;
  }

  private colorizeType(type: IgnoreType): string {
    switch (type) {
      case 'exclude':
        return this.colorize('[EXCLUDE]', 'red');
      case 'include':
        return this.colorize('[INCLUDE]', 'green');
      case 'readonly':
        return this.colorize('[READONLY]', 'yellow');
      case 'noai':
        return this.colorize('[NO AI]', 'red');
    }
  }

  private colorizeAction(action: string): string {
    switch (action) {
      case 'access':
        return this.colorize('[ACCESS]', 'green');
      case 'ignore':
        return this.colorize('[IGNORE]', 'yellow');
      case 'block':
        return this.colorize('[BLOCK]', 'red');
      default:
        return `[${action}]`;
    }
  }

  private success(message: string): void {
    if (!this.options.json) {
      console.log(`${this.colorize('✓', 'green')} ${message}`);
    }
  }

  private info(message: string): void {
    if (!this.options.json) {
      console.log(`${this.colorize('ℹ', 'cyan')} ${message}`);
    }
  }

  private warn(message: string): void {
    if (!this.options.json) {
      console.log(`${this.colorize('⚠', 'yellow')} ${message}`);
    }
  }

  private error(message: string): void {
    if (!this.options.json) {
      console.error(`${this.colorize('✗', 'red')} ${message}`);
    }
  }
}

// Export a factory function for easy use
export async function createIgnoreCli(options?: CliOptions): Promise<IgnoreCli> {
  const cli = new IgnoreCli(options);
  await cli.initialize();
  return cli;
}
