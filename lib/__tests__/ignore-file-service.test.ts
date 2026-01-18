/**
 * Tests for IgnoreFileService
 *
 * Comprehensive test suite for ignore file system
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { IgnoreFileService } from '../ignore-file-service';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('IgnoreFileService', () => {
  let service: IgnoreFileService;
  let testDir: string;

  beforeEach(() => {
    // Create temporary test directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ainative-ignore-test-'));

    // Initialize service
    service = new IgnoreFileService({
      projectRoot: testDir,
      mode: 'dev',
      enableSecurityDetection: true,
      enableAuditLog: true,
      useGitignoreFallback: true,
    });
  });

  afterEach(() => {
    // Clean up
    service.dispose();

    // Remove test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Pattern Matching', () => {
    it('should match simple glob patterns', async () => {
      // Create .ainativeignore
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '*.log\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('test.log')).toBe(true);
      expect(service.shouldIgnore('debug.log')).toBe(true);
      expect(service.shouldIgnore('test.txt')).toBe(false);
    });

    it('should match directory patterns', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        'node_modules/\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('node_modules/package/index.js')).toBe(true);
      expect(service.shouldIgnore('node_modules/react/index.js')).toBe(true);
      expect(service.shouldIgnore('src/index.js')).toBe(false);
    });

    it('should match recursive patterns', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '**/*.test.js\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('test.test.js')).toBe(true);
      expect(service.shouldIgnore('src/test.test.js')).toBe(true);
      expect(service.shouldIgnore('src/components/test.test.js')).toBe(true);
      expect(service.shouldIgnore('src/index.js')).toBe(false);
    });

    it('should handle negation patterns', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '*.log\n!important.log\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('test.log')).toBe(true);
      expect(service.shouldIgnore('debug.log')).toBe(true);
      expect(service.shouldIgnore('important.log')).toBe(false);
    });
  });

  describe('Special Patterns', () => {
    it('should handle @secrets pattern', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '@secrets\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('.env')).toBe(true);
      expect(service.shouldIgnore('.env.local')).toBe(true);
      expect(service.shouldIgnore('credentials.json')).toBe(true);
      expect(service.shouldIgnore('secrets.yml')).toBe(true);
    });

    it('should handle @readonly pattern', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '@readonly *.sql\n',
        'utf-8'
      );

      await service.initialize();

      const result = service.checkPath('database.sql');
      expect(result.ignored).toBe(false);
      expect(result.permission).toBe('read');
    });

    it('should handle @noai pattern', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '@noai credentials/\n',
        'utf-8'
      );

      await service.initialize();

      const result = service.checkPath('credentials/api-keys.json');
      expect(result.ignored).toBe(true);
      expect(result.rule?.type).toBe('noai');
    });

    it('should handle @temporary pattern with expiration', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '@temporary *.tmp expire:1h\n',
        'utf-8'
      );

      await service.initialize();

      const result = service.checkPath('test.tmp');
      expect(result.ignored).toBe(true);
      expect(result.rule?.expiresAt).toBeDefined();
    });
  });

  describe('Conditional Ignores', () => {
    it('should apply dev mode rules', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '[dev] test-data/\n',
        'utf-8'
      );

      // Dev mode
      const devService = new IgnoreFileService({
        projectRoot: testDir,
        mode: 'dev',
      });
      await devService.initialize();

      expect(devService.shouldIgnore('test-data/sample.json')).toBe(true);

      devService.dispose();

      // Prod mode
      const prodService = new IgnoreFileService({
        projectRoot: testDir,
        mode: 'prod',
      });
      await prodService.initialize();

      expect(prodService.shouldIgnore('test-data/sample.json')).toBe(false);

      prodService.dispose();
    });

    it('should apply prod mode rules', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '[prod] debug/\n',
        'utf-8'
      );

      // Prod mode
      const prodService = new IgnoreFileService({
        projectRoot: testDir,
        mode: 'prod',
      });
      await prodService.initialize();

      expect(prodService.shouldIgnore('debug/info.log')).toBe(true);

      prodService.dispose();

      // Dev mode
      const devService = new IgnoreFileService({
        projectRoot: testDir,
        mode: 'dev',
      });
      await devService.initialize();

      expect(devService.shouldIgnore('debug/info.log')).toBe(false);

      devService.dispose();
    });
  });

  describe('Priority System', () => {
    it('should prioritize .ainativeignore over .gitignore', async () => {
      // .gitignore says exclude
      fs.writeFileSync(
        path.join(testDir, '.gitignore'),
        'test.txt\n',
        'utf-8'
      );

      // .ainativeignore says include
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '!test.txt\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('test.txt')).toBe(false);
    });

    it('should prioritize security rules', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '# Allow all\n',
        'utf-8'
      );

      await service.initialize();

      // Security rules should still block sensitive files
      expect(service.shouldIgnore('.env')).toBe(true);
      expect(service.shouldIgnore('credentials.json')).toBe(true);
    });

    it('should handle multiple ignore files', async () => {
      // .gitignore
      fs.writeFileSync(
        path.join(testDir, '.gitignore'),
        '*.log\n',
        'utf-8'
      );

      // .aiignore
      fs.writeFileSync(
        path.join(testDir, '.aiignore'),
        '*.tmp\n',
        'utf-8'
      );

      // .ainativeignore
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '*.cache\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('test.log')).toBe(true);
      expect(service.shouldIgnore('test.tmp')).toBe(true);
      expect(service.shouldIgnore('test.cache')).toBe(true);
    });
  });

  describe('Security Detection', () => {
    it('should auto-detect environment files', async () => {
      await service.initialize();

      expect(service.shouldIgnore('.env')).toBe(true);
      expect(service.shouldIgnore('.env.local')).toBe(true);
      expect(service.shouldIgnore('.env.production')).toBe(true);
      expect(service.shouldIgnore('.env.example')).toBe(false);
    });

    it('should auto-detect credential files', async () => {
      await service.initialize();

      expect(service.shouldIgnore('credentials.json')).toBe(true);
      expect(service.shouldIgnore('credentials.yml')).toBe(true);
      expect(service.shouldIgnore('api-keys.txt')).toBe(false); // Need explicit pattern
    });

    it('should detect sensitive files in subdirectories', async () => {
      await service.initialize();

      expect(service.shouldIgnore('config/.env')).toBe(true);
      expect(service.shouldIgnore('src/config/credentials.json')).toBe(true);
    });

    it('should scan and detect sensitive files', () => {
      // Create test files
      fs.mkdirSync(path.join(testDir, 'config'), { recursive: true });
      fs.writeFileSync(path.join(testDir, '.env'), '', 'utf-8');
      fs.writeFileSync(path.join(testDir, 'config', 'credentials.json'), '', 'utf-8');

      const sensitive = service.detectSensitiveFiles(testDir);

      expect(sensitive).toContain('.env');
      expect(sensitive).toContain('config/credentials.json');
    });
  });

  describe('Audit Logging', () => {
    it('should log file access', async () => {
      await service.initialize();

      service.checkPath('test.js');
      service.checkPath('.env');

      const log = service.getAuditLog();

      expect(log.length).toBeGreaterThan(0);
      expect(log.some(entry => entry.path === 'test.js')).toBe(true);
      expect(log.some(entry => entry.path === '.env')).toBe(true);
    });

    it('should log ignore reasons', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '*.log # Log files\n',
        'utf-8'
      );

      await service.initialize();

      service.checkPath('test.log');

      const log = service.getAuditLog();
      const entry = log.find(e => e.path === 'test.log');

      expect(entry).toBeDefined();
      expect(entry?.action).toBe('ignore');
      expect(entry?.reason).toContain('Log files');
    });

    it('should clear audit log', async () => {
      await service.initialize();

      service.checkPath('test.js');
      expect(service.getAuditLog().length).toBeGreaterThan(0);

      service.clearAuditLog();
      expect(service.getAuditLog().length).toBe(0);
    });
  });

  describe('Rule Management', () => {
    it('should add rules dynamically', async () => {
      await service.initialize();

      service.addRule('*.test.js', 'exclude', 'Test files');

      expect(service.shouldIgnore('example.test.js')).toBe(true);
    });

    it('should remove rules', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '*.log\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('test.log')).toBe(true);

      service.removeRule('*.log');

      expect(service.shouldIgnore('test.log')).toBe(false);
    });

    it('should validate patterns', async () => {
      await service.initialize();

      expect(service.validatePattern('*.js').valid).toBe(true);
      expect(service.validatePattern('**/*.test.js').valid).toBe(true);
      expect(service.validatePattern('node_modules/').valid).toBe(true);
      expect(service.validatePattern('[invalid').valid).toBe(false);
    });

    it('should export rules', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '*.log\n*.tmp\n',
        'utf-8'
      );

      await service.initialize();

      const exportPath = path.join(testDir, 'export.txt');
      service.exportRules(exportPath, false);

      expect(fs.existsSync(exportPath)).toBe(true);

      const content = fs.readFileSync(exportPath, 'utf-8');
      expect(content).toContain('*.log');
      expect(content).toContain('*.tmp');
    });

    it('should import from .gitignore', async () => {
      fs.writeFileSync(
        path.join(testDir, '.gitignore'),
        '*.log\nnode_modules/\n',
        'utf-8'
      );

      await service.initialize();

      const imported = service.importFromGitignore();

      expect(imported).toBe(2);
      expect(service.shouldIgnore('test.log')).toBe(true);
      expect(service.shouldIgnore('node_modules/package/index.js')).toBe(true);
    });
  });

  describe('Inline Comments', () => {
    it('should parse inline comments as reasons', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '*.log # Log files\nsecrets.json # Contains API keys\n',
        'utf-8'
      );

      await service.initialize();

      const logResult = service.checkPath('test.log');
      expect(logResult.reason).toContain('Log files');

      const secretResult = service.checkPath('secrets.json');
      expect(secretResult.reason).toContain('API keys');
    });
  });

  describe('Built-in Defaults', () => {
    it('should ignore node_modules by default', async () => {
      await service.initialize();

      expect(service.shouldIgnore('node_modules/package/index.js')).toBe(true);
    });

    it('should ignore .git by default', async () => {
      await service.initialize();

      expect(service.shouldIgnore('.git/config')).toBe(true);
    });

    it('should ignore build outputs by default', async () => {
      await service.initialize();

      expect(service.shouldIgnore('dist/bundle.js')).toBe(true);
      expect(service.shouldIgnore('build/index.html')).toBe(true);
      expect(service.shouldIgnore('.next/cache/webpack.js')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty ignore file', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '',
        'utf-8'
      );

      await service.initialize();

      // Should still apply built-in rules
      expect(service.shouldIgnore('node_modules/package/index.js')).toBe(true);
    });

    it('should handle comments-only file', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '# Comment 1\n# Comment 2\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.getRules().length).toBeGreaterThan(0); // Built-in rules
    });

    it('should handle patterns with spaces', async () => {
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        '*.log   # Multiple   spaces\n',
        'utf-8'
      );

      await service.initialize();

      expect(service.shouldIgnore('test.log')).toBe(true);
    });

    it('should handle non-existent files', async () => {
      await service.initialize();

      const result = service.checkPath('non-existent.txt');
      expect(result.ignored).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should cache results', async () => {
      await service.initialize();

      // First call
      const start1 = Date.now();
      service.checkPath('test.js');
      const time1 = Date.now() - start1;

      // Second call (cached)
      const start2 = Date.now();
      service.checkPath('test.js');
      const time2 = Date.now() - start2;

      // Cached call should be faster (or at least not significantly slower)
      expect(time2).toBeLessThanOrEqual(time1 * 2);
    });

    it('should handle many rules efficiently', async () => {
      // Create file with 1000 rules
      const patterns = Array.from({ length: 1000 }, (_, i) => `pattern${i}.txt`);
      fs.writeFileSync(
        path.join(testDir, '.ainativeignore'),
        patterns.join('\n'),
        'utf-8'
      );

      const start = Date.now();
      await service.initialize();
      const initTime = Date.now() - start;

      // Initialization should complete in reasonable time
      expect(initTime).toBeLessThan(1000); // < 1 second

      // Checking should be fast
      const checkStart = Date.now();
      service.shouldIgnore('pattern500.txt');
      const checkTime = Date.now() - checkStart;

      expect(checkTime).toBeLessThan(100); // < 100ms
    });
  });
});
