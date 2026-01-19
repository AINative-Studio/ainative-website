/**
 * AINative Ignore File Service
 *
 * Implements a sophisticated ignore file system for AI tools, addressing:
 * - Gemini CLI issue #16980: Stop using .gitignore to control file access
 * - Gemini CLI issue #16941: .geminiignore not honored
 *
 * Features:
 * - Hierarchical ignore files (.ainativeignore > .aiignore > .gitignore)
 * - Advanced pattern matching with glob support
 * - Security features (auto-detect secrets, audit logging)
 * - Permission-based access control
 * - Time-based rules with auto-expiration
 * - Conditional ignores (dev/prod modes)
 */

import minimatch from 'minimatch';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createHash } from 'crypto';

export type IgnoreType = 'include' | 'exclude' | 'readonly' | 'noai';
export type IgnoreMode = 'dev' | 'prod' | 'test' | 'all';

export interface IgnoreRule {
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

export interface IgnoreFileConfig {
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

export interface IgnoreResult {
  /** Whether the path should be ignored */
  ignored: boolean;

  /** The rule that caused the ignore (if any) */
  rule?: IgnoreRule;

  /** Reason for ignoring */
  reason?: string;

  /** Permission level if not ignored */
  permission?: 'read' | 'write' | 'none';
}

export interface AuditLogEntry {
  timestamp: Date;
  path: string;
  action: 'access' | 'ignore' | 'block';
  rule?: string;
  reason?: string;
}

/**
 * Built-in default ignore patterns
 */
const DEFAULT_IGNORE_PATTERNS = [
  // Version control
  '.git/**',
  '.svn/**',
  '.hg/**',

  // Dependencies
  'node_modules/**',
  'vendor/**',
  'bower_components/**',

  // Build outputs
  'dist/**',
  'build/**',
  'out/**',
  '.next/**',

  // IDE
  '.idea/**',
  '.vscode/**',
  '*.swp',
  '*.swo',
  '*~',

  // OS
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',

  // Temp files
  '*.tmp',
  '*.temp',
  '*.cache',

  // Large files
  '*.zip',
  '*.tar',
  '*.tar.gz',
  '*.rar',
  '*.7z',
];

/**
 * Patterns for security-sensitive files
 */
const SECURITY_PATTERNS = [
  // Environment files
  '**/.env',
  '**/.env.*',
  '!**/.env.example',

  // Credentials
  '**/credentials.json',
  '**/credentials.yml',
  '**/*secrets*',
  '**/*password*',
  '**/*token*',

  // SSH/SSL
  '**/*.pem',
  '**/*.key',
  '**/*.p12',
  '**/*.pfx',
  '**/.ssh/**',

  // Cloud credentials
  '**/.aws/credentials',
  '**/.gcp/credentials.json',
  '**/google-credentials.json',

  // Database
  '**/*.sqlite',
  '**/*.db',
];

/**
 * Patterns for binary/large files
 */
const BINARY_PATTERNS = [
  '**/*.exe',
  '**/*.dll',
  '**/*.so',
  '**/*.dylib',
  '**/*.bin',
  '**/*.dat',
  '**/*.pdf',
  '**/*.doc',
  '**/*.docx',
  '**/*.xls',
  '**/*.xlsx',
  '**/*.ppt',
  '**/*.pptx',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.png',
  '**/*.gif',
  '**/*.bmp',
  '**/*.ico',
  '**/*.mp4',
  '**/*.mov',
  '**/*.avi',
  '**/*.mp3',
  '**/*.wav',
];

/**
 * Service for managing ignore files and access control
 */
export class IgnoreFileService {
  private config: IgnoreFileConfig;
  private rules: IgnoreRule[] = [];
  private auditLog: AuditLogEntry[] = [];
  private ruleCache: Map<string, IgnoreResult> = new Map();
  private fileWatchers: fs.FSWatcher[] = [];

  constructor(config: Partial<IgnoreFileConfig> = {}) {
    this.config = {
      projectRoot: config.projectRoot || process.cwd(),
      mode: config.mode || 'dev',
      enableSecurityDetection: config.enableSecurityDetection ?? true,
      enableAuditLog: config.enableAuditLog ?? true,
      maxFileSize: config.maxFileSize,
      useGitignoreFallback: config.useGitignoreFallback ?? true,
      globalIgnorePath: config.globalIgnorePath || path.join(os.homedir(), '.ainative', 'ignore'),
    };
  }

  /**
   * Initialize the ignore file service
   */
  async initialize(): Promise<void> {
    // Load ignore files in priority order
    await this.loadIgnoreFiles();

    // Set up file watchers for auto-reload
    this.setupFileWatchers();

    // Clean up expired rules
    this.cleanupExpiredRules();
  }

  /**
   * Load all ignore files in priority order
   */
  private async loadIgnoreFiles(): Promise<void> {
    this.rules = [];

    // Priority 1: .ainativeignore (highest priority)
    await this.loadIgnoreFile('.ainativeignore', 1000);

    // Priority 2: .aiignore
    await this.loadIgnoreFile('.aiignore', 900);

    // Priority 3: .gitignore (fallback)
    if (this.config.useGitignoreFallback) {
      await this.loadIgnoreFile('.gitignore', 800);
    }

    // Priority 4: Global ignore file
    if (this.config.globalIgnorePath) {
      await this.loadGlobalIgnoreFile(700);
    }

    // Priority 5: Built-in defaults (lowest priority)
    this.loadDefaultRules(500);

    // Security patterns (high priority)
    if (this.config.enableSecurityDetection) {
      this.loadSecurityRules(1100);
    }

    // Sort rules by priority (descending)
    this.rules.sort((a, b) => b.priority - a.priority);

    // Clear cache when rules are reloaded
    this.ruleCache.clear();
  }

  /**
   * Load a specific ignore file
   */
  private async loadIgnoreFile(filename: string, basePriority: number): Promise<void> {
    const filePath = path.join(this.config.projectRoot, filename);

    if (!fs.existsSync(filePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      let currentPriority = basePriority;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines and comments (unless inline comments)
        if (!line || line.startsWith('#')) {
          continue;
        }

        const rule = this.parseIgnoreLine(line, filePath, currentPriority);
        if (rule) {
          this.rules.push(rule);
          currentPriority--;
        }
      }
    } catch (error) {
      console.error(`Failed to load ignore file ${filename}:`, error);
    }
  }

  /**
   * Load global ignore file from user home directory
   */
  private async loadGlobalIgnoreFile(basePriority: number): Promise<void> {
    if (!this.config.globalIgnorePath || !fs.existsSync(this.config.globalIgnorePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(this.config.globalIgnorePath, 'utf-8');
      const lines = content.split('\n');

      let currentPriority = basePriority;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }

        const rule = this.parseIgnoreLine(trimmed, this.config.globalIgnorePath, currentPriority);
        if (rule) {
          this.rules.push(rule);
          currentPriority--;
        }
      }
    } catch (error) {
      console.error('Failed to load global ignore file:', error);
    }
  }

  /**
   * Load built-in default ignore patterns
   */
  private loadDefaultRules(basePriority: number): void {
    let currentPriority = basePriority;

    for (const pattern of DEFAULT_IGNORE_PATTERNS) {
      this.rules.push({
        pattern,
        type: 'exclude',
        priority: currentPriority--,
        source: 'built-in',
        isNegation: false,
        raw: pattern,
        reason: 'Built-in default',
      });
    }
  }

  /**
   * Load security-sensitive file patterns
   */
  private loadSecurityRules(basePriority: number): void {
    let currentPriority = basePriority;

    for (const pattern of SECURITY_PATTERNS) {
      const isNegation = pattern.startsWith('!');
      const cleanPattern = isNegation ? pattern.slice(1) : pattern;

      this.rules.push({
        pattern: cleanPattern,
        type: isNegation ? 'include' : 'noai',
        priority: currentPriority--,
        source: 'security',
        isNegation,
        raw: pattern,
        reason: 'Security-sensitive file',
      });
    }
  }

  /**
   * Parse a single line from an ignore file
   */
  private parseIgnoreLine(line: string, source: string, priority: number): IgnoreRule | null {
    let cleanLine = line;
    let reason: string | undefined;
    let mode: IgnoreMode | undefined;
    let expiresAt: Date | undefined;
    let type: IgnoreType = 'exclude';

    // Extract inline comment (reason)
    const commentMatch = line.match(/^([^#]+)\s*#\s*(.+)$/);
    if (commentMatch) {
      cleanLine = commentMatch[1].trim();
      reason = commentMatch[2].trim();
    }

    // Extract mode [dev], [prod], [test]
    const modeMatch = cleanLine.match(/^\[(dev|prod|test)\]\s+(.+)$/);
    if (modeMatch) {
      mode = modeMatch[1] as IgnoreMode;
      cleanLine = modeMatch[2].trim();

      // Skip if mode doesn't match current mode
      if (mode !== this.config.mode && mode !== 'all') {
        return null;
      }
    }

    // Handle negation (!)
    const isNegation = cleanLine.startsWith('!');
    if (isNegation) {
      cleanLine = cleanLine.slice(1).trim();
      type = 'include';
    }

    // Handle special patterns
    if (cleanLine.startsWith('@')) {
      const result = this.parseSpecialPattern(cleanLine, source, priority, reason);
      if (result) {
        return result;
      }
    }

    // Extract expiration time
    const expireMatch = cleanLine.match(/^(.+)\s+expire:(\d+)([smhd])$/);
    if (expireMatch) {
      cleanLine = expireMatch[1].trim();
      const amount = parseInt(expireMatch[2], 10);
      const unit = expireMatch[3];

      const now = new Date();
      switch (unit) {
        case 's':
          expiresAt = new Date(now.getTime() + amount * 1000);
          break;
        case 'm':
          expiresAt = new Date(now.getTime() + amount * 60 * 1000);
          break;
        case 'h':
          expiresAt = new Date(now.getTime() + amount * 60 * 60 * 1000);
          break;
        case 'd':
          expiresAt = new Date(now.getTime() + amount * 24 * 60 * 60 * 1000);
          break;
      }
    }

    return {
      pattern: cleanLine,
      type,
      reason,
      priority,
      source,
      mode,
      expiresAt,
      isNegation,
      raw: line,
    };
  }

  /**
   * Parse special patterns (@secrets, @large-files, etc.)
   */
  private parseSpecialPattern(
    pattern: string,
    source: string,
    priority: number,
    reason?: string
  ): IgnoreRule | null {
    const parts = pattern.split(/\s+/);
    const special = parts[0];
    const targetPattern = parts[1] || '**/*';

    switch (special) {
      case '@secrets':
        return {
          pattern: targetPattern,
          type: 'noai',
          reason: reason || 'Auto-detected secrets',
          priority: priority + 100,
          source,
          isNegation: false,
          raw: pattern,
        };

      case '@large-files':
        return {
          pattern: targetPattern,
          type: 'exclude',
          reason: reason || 'File size > 1MB',
          priority,
          source,
          isNegation: false,
          raw: pattern,
        };

      case '@binary':
        // Add all binary patterns
        return {
          pattern: targetPattern,
          type: 'exclude',
          reason: reason || 'Binary file',
          priority,
          source,
          isNegation: false,
          raw: pattern,
        };

      case '@generated':
        return {
          pattern: targetPattern,
          type: 'exclude',
          reason: reason || 'Auto-generated code',
          priority,
          source,
          isNegation: false,
          raw: pattern,
        };

      case '@readonly':
        return {
          pattern: targetPattern,
          type: 'readonly',
          reason: reason || 'Read-only access',
          priority: priority + 50,
          source,
          isNegation: false,
          raw: pattern,
        };

      case '@noai':
        return {
          pattern: targetPattern,
          type: 'noai',
          reason: reason || 'Never accessible by AI',
          priority: priority + 200,
          source,
          isNegation: false,
          raw: pattern,
        };

      case '@temporary':
        // Parse expiration
        const expireMatch = pattern.match(/expire:(\d+)([smhd])/);
        let expiresAt: Date | undefined;

        if (expireMatch) {
          const amount = parseInt(expireMatch[1], 10);
          const unit = expireMatch[2];
          const now = new Date();

          switch (unit) {
            case 's':
              expiresAt = new Date(now.getTime() + amount * 1000);
              break;
            case 'm':
              expiresAt = new Date(now.getTime() + amount * 60 * 1000);
              break;
            case 'h':
              expiresAt = new Date(now.getTime() + amount * 60 * 60 * 1000);
              break;
            case 'd':
              expiresAt = new Date(now.getTime() + amount * 24 * 60 * 60 * 1000);
              break;
          }
        }

        return {
          pattern: targetPattern,
          type: 'exclude',
          reason: reason || 'Temporary file',
          priority,
          source,
          expiresAt,
          isNegation: false,
          raw: pattern,
        };

      default:
        return null;
    }
  }

  /**
   * Check if a path should be ignored
   */
  shouldIgnore(filePath: string): boolean {
    const result = this.checkPath(filePath);
    return result.ignored;
  }

  /**
   * Get detailed ignore result for a path
   */
  checkPath(filePath: string): IgnoreResult {
    // Normalize path
    const normalizedPath = this.normalizePath(filePath);

    // Check cache
    const cached = this.ruleCache.get(normalizedPath);
    if (cached) {
      return cached;
    }

    // Check against rules in priority order
    let result: IgnoreResult = {
      ignored: false,
      permission: 'write',
    };

    for (const rule of this.rules) {
      // Check if rule has expired
      if (rule.expiresAt && rule.expiresAt < new Date()) {
        continue;
      }

      // Check if pattern matches
      if (this.matchesPattern(normalizedPath, rule.pattern)) {
        switch (rule.type) {
          case 'exclude':
            result = {
              ignored: true,
              rule,
              reason: rule.reason || `Matched pattern: ${rule.pattern}`,
              permission: 'none',
            };
            break;

          case 'include':
            result = {
              ignored: false,
              rule,
              reason: rule.reason || `Explicitly included: ${rule.pattern}`,
              permission: 'write',
            };
            break;

          case 'readonly':
            result = {
              ignored: false,
              rule,
              reason: rule.reason || `Read-only access: ${rule.pattern}`,
              permission: 'read',
            };
            break;

          case 'noai':
            result = {
              ignored: true,
              rule,
              reason: rule.reason || `AI access forbidden: ${rule.pattern}`,
              permission: 'none',
            };
            break;
        }

        // If this is a high-priority rule or noai, stop checking
        if (rule.type === 'noai' || rule.priority > 1000) {
          break;
        }
      }
    }

    // Additional checks for large files and binary files
    if (!result.ignored && fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);

      // Check file size
      if (this.config.maxFileSize && stats.size > this.config.maxFileSize) {
        result = {
          ignored: true,
          reason: `File size (${stats.size} bytes) exceeds maximum (${this.config.maxFileSize} bytes)`,
          permission: 'none',
        };
      }

      // Check if binary
      if (!result.ignored && this.isBinaryFile(filePath)) {
        const matchesBinaryPattern = BINARY_PATTERNS.some(pattern =>
          minimatch(normalizedPath, pattern)
        );

        if (matchesBinaryPattern) {
          result = {
            ignored: true,
            reason: 'Binary file detected',
            permission: 'none',
          };
        }
      }
    }

    // Cache result
    this.ruleCache.set(normalizedPath, result);

    // Audit log
    if (this.config.enableAuditLog) {
      this.logAccess(normalizedPath, result);
    }

    return result;
  }

  /**
   * Get the reason why a path is ignored
   */
  getIgnoreReason(filePath: string): string | null {
    const result = this.checkPath(filePath);
    return result.ignored ? result.reason || null : null;
  }

  /**
   * List all ignored paths in a directory
   */
  listIgnoredPaths(directory: string, recursive = true): string[] {
    const ignoredPaths: string[] = [];

    const scanDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) {
        return;
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.config.projectRoot, fullPath);

        if (this.shouldIgnore(relativePath)) {
          ignoredPaths.push(relativePath);
        } else if (entry.isDirectory() && recursive) {
          scanDirectory(fullPath);
        }
      }
    };

    scanDirectory(directory);
    return ignoredPaths;
  }

  /**
   * Validate an ignore pattern
   */
  validatePattern(pattern: string): { valid: boolean; error?: string } {
    try {
      // Test pattern compilation
      minimatch.makeRe(pattern);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid pattern',
      };
    }
  }

  /**
   * Add a new ignore rule
   */
  addRule(pattern: string, type: IgnoreType = 'exclude', reason?: string): void {
    const validation = this.validatePattern(pattern);
    if (!validation.valid) {
      throw new Error(`Invalid pattern: ${validation.error}`);
    }

    const rule: IgnoreRule = {
      pattern,
      type,
      reason,
      priority: 2000, // High priority for dynamically added rules
      source: 'dynamic',
      isNegation: type === 'include',
      raw: pattern,
    };

    this.rules.unshift(rule);
    this.ruleCache.clear();
  }

  /**
   * Remove an ignore rule
   */
  removeRule(pattern: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(rule => rule.pattern !== pattern);
    this.ruleCache.clear();

    return this.rules.length < initialLength;
  }

  /**
   * Get all current rules
   */
  getRules(): IgnoreRule[] {
    return [...this.rules];
  }

  /**
   * Get audit log
   */
  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Export rules to a file
   */
  exportRules(filePath: string, includeBuiltIn = false): void {
    const rulesToExport = includeBuiltIn
      ? this.rules
      : this.rules.filter(rule => rule.source !== 'built-in');

    const lines: string[] = [
      '# AINative Ignore File',
      '# Generated: ' + new Date().toISOString(),
      '',
    ];

    for (const rule of rulesToExport) {
      if (rule.reason) {
        lines.push(`${rule.pattern} # ${rule.reason}`);
      } else {
        lines.push(rule.pattern);
      }
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  }

  /**
   * Import rules from .gitignore
   */
  importFromGitignore(gitignorePath?: string): number {
    const filePath = gitignorePath || path.join(this.config.projectRoot, '.gitignore');

    if (!fs.existsSync(filePath)) {
      return 0;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let imported = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const rule = this.parseIgnoreLine(trimmed, 'gitignore-import', 1500);
      if (rule) {
        this.rules.push(rule);
        imported++;
      }
    }

    this.ruleCache.clear();
    return imported;
  }

  /**
   * Detect potentially sensitive files in a directory
   */
  detectSensitiveFiles(directory: string): string[] {
    const sensitiveFiles: string[] = [];

    const scanDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) {
        return;
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.config.projectRoot, fullPath);

        // Check against security patterns
        for (const pattern of SECURITY_PATTERNS) {
          const cleanPattern = pattern.startsWith('!') ? pattern.slice(1) : pattern;
          if (minimatch(relativePath, cleanPattern)) {
            sensitiveFiles.push(relativePath);
            break;
          }
        }

        if (entry.isDirectory() && !this.shouldIgnore(relativePath)) {
          scanDirectory(fullPath);
        }
      }
    };

    scanDirectory(directory);
    return sensitiveFiles;
  }

  /**
   * Clean up expired rules
   */
  private cleanupExpiredRules(): void {
    const now = new Date();
    this.rules = this.rules.filter(rule => !rule.expiresAt || rule.expiresAt > now);
    this.ruleCache.clear();
  }

  /**
   * Set up file watchers for auto-reload
   */
  private setupFileWatchers(): void {
    const filesToWatch = [
      '.ainativeignore',
      '.aiignore',
      '.gitignore',
    ];

    for (const filename of filesToWatch) {
      const filePath = path.join(this.config.projectRoot, filename);

      if (fs.existsSync(filePath)) {
        try {
          const watcher = fs.watch(filePath, () => {
            console.log(`Ignore file ${filename} changed, reloading...`);
            this.loadIgnoreFiles();
          });

          this.fileWatchers.push(watcher);
        } catch (error) {
          console.error(`Failed to watch ${filename}:`, error);
        }
      }
    }
  }

  /**
   * Normalize a file path for consistent matching
   */
  private normalizePath(filePath: string): string {
    // Convert to forward slashes
    let normalized = filePath.replace(/\\/g, '/');

    // Remove leading ./
    if (normalized.startsWith('./')) {
      normalized = normalized.slice(2);
    }

    // Remove leading /
    if (normalized.startsWith('/')) {
      normalized = normalized.slice(1);
    }

    return normalized;
  }

  /**
   * Check if a path matches a pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Use minimatch for glob pattern matching
    return minimatch(filePath, pattern, {
      dot: true, // Match dotfiles
      matchBase: true, // Match basename
    });
  }

  /**
   * Check if a file is binary
   */
  private isBinaryFile(filePath: string): boolean {
    try {
      const buffer = Buffer.alloc(512);
      const fd = fs.openSync(filePath, 'r');
      const bytesRead = fs.readSync(fd, buffer, 0, 512, 0);
      fs.closeSync(fd);

      // Check for null bytes (common in binary files)
      for (let i = 0; i < bytesRead; i++) {
        if (buffer[i] === 0) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Log access for audit trail
   */
  private logAccess(filePath: string, result: IgnoreResult): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      path: filePath,
      action: result.ignored ? 'ignore' : 'access',
      rule: result.rule?.pattern,
      reason: result.reason,
    };

    this.auditLog.push(entry);

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    for (const watcher of this.fileWatchers) {
      watcher.close();
    }
    this.fileWatchers = [];
    this.ruleCache.clear();
  }
}

/**
 * Singleton instance for global use
 */
let globalInstance: IgnoreFileService | null = null;

export function getIgnoreFileService(config?: Partial<IgnoreFileConfig>): IgnoreFileService {
  if (!globalInstance) {
    globalInstance = new IgnoreFileService(config);
  }
  return globalInstance;
}

export function resetIgnoreFileService(): void {
  if (globalInstance) {
    globalInstance.dispose();
    globalInstance = null;
  }
}
