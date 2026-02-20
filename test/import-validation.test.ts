/**
 * Import Validation Test Suite
 *
 * Prevents deployment failures caused by missing files not committed to git.
 * This test validates that:
 * 1. All imported files exist in the git repository
 * 2. All import paths are resolvable
 * 3. No dangling file references exist
 *
 * Background:
 * Files lib/utils/thumbnail-generator.ts and lib/utils/slug-generator.ts
 * existed locally but weren't committed to git, causing production build failures.
 * The following files imported these missing files:
 * - lib/model-aggregator-service.ts:8
 * - lib/model-aggregator.ts:8
 *
 * This test suite prevents similar issues in the future.
 */

import { describe, it, expect } from '@jest/globals';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Configuration for import validation
 */
const CONFIG = {
  // Directories to scan for imports
  scanDirs: ['lib', 'components', 'app', 'services', 'utils'],

  // File extensions to check
  extensions: ['.ts', '.tsx', '.js', '.jsx'],

  // Patterns to exclude from scanning
  excludePatterns: [
    'node_modules',
    '.next',
    'coverage',
    'dist',
    'build',
    '__tests__',
    '.test.',
    '.spec.',
  ],

  // External packages that don't need validation
  externalPackages: [
    'react',
    'next',
    'axios',
    '@radix-ui',
    '@tanstack',
    'lucide-react',
    'zod',
    'clsx',
    'tailwind-merge',
  ],
};

/**
 * Execute git command and return output
 */
function gitCommand(command: string): string {
  try {
    return execSync(`git ${command}`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    throw new Error(`Git command failed: ${command}\n${error}`);
  }
}

/**
 * Get all files tracked by git
 */
function getGitTrackedFiles(): Set<string> {
  const output = gitCommand('ls-files');
  const files = output.split('\n').filter((f) => f.trim() !== '');
  return new Set(files);
}

/**
 * Check if file is tracked in git
 */
function isFileTrackedInGit(filePath: string, gitFiles: Set<string>): boolean {
  // Normalize path for comparison
  const normalizedPath = filePath.replace(/^\.?\//, '');
  return gitFiles.has(normalizedPath);
}

/**
 * Extract import statements from file content
 */
function extractImports(content: string): string[] {
  const imports: string[] = [];

  // Match ES6 import statements
  // import { x } from 'module'
  // import x from 'module'
  // import * as x from 'module'
  const es6ImportRegex = /import\s+(?:{[^}]*}|[\w*]+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = es6ImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Match dynamic imports
  // import('module')
  const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // Match require statements
  // require('module')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Resolve import path to actual file path
 */
function resolveImportPath(
  importPath: string,
  sourceFilePath: string
): string | null {
  // Skip external packages
  if (
    !importPath.startsWith('.') &&
    !importPath.startsWith('@/') &&
    !importPath.startsWith('/')
  ) {
    return null; // External package
  }

  // Resolve @/ alias to root
  if (importPath.startsWith('@/')) {
    importPath = importPath.replace('@/', '');
  }

  // Resolve relative paths
  if (importPath.startsWith('.')) {
    const sourceDir = path.dirname(sourceFilePath);
    importPath = path.join(sourceDir, importPath);
  }

  // Normalize path
  importPath = path.normalize(importPath);

  // Try with different extensions
  const possiblePaths = [
    importPath,
    `${importPath}.ts`,
    `${importPath}.tsx`,
    `${importPath}.js`,
    `${importPath}.jsx`,
    `${importPath}/index.ts`,
    `${importPath}/index.tsx`,
    `${importPath}/index.js`,
    `${importPath}/index.jsx`,
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(process.cwd(), p))) {
      return p;
    }
  }

  return importPath; // Return original if not resolved
}

/**
 * Check if import path is external package
 */
function isExternalPackage(importPath: string): boolean {
  if (importPath.startsWith('.') || importPath.startsWith('@/')) {
    return false;
  }

  return CONFIG.externalPackages.some((pkg) => importPath.startsWith(pkg));
}

/**
 * Get all source files to validate
 */
function getSourceFiles(): string[] {
  const files: string[] = [];

  for (const dir of CONFIG.scanDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) continue;

    const dirFiles = walkDirectory(dirPath);
    files.push(...dirFiles);
  }

  return files.filter(
    (file) =>
      CONFIG.extensions.some((ext) => file.endsWith(ext)) &&
      !CONFIG.excludePatterns.some((pattern) => file.includes(pattern))
  );
}

/**
 * Recursively walk directory and collect files
 */
function walkDirectory(dir: string): string[] {
  const files: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip excluded patterns
    if (CONFIG.excludePatterns.some((pattern) => fullPath.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...walkDirectory(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Validate imports in a single file
 */
function validateFileImports(
  filePath: string,
  gitFiles: Set<string>
): Array<{ file: string; import: string; resolved: string | null }> {
  const issues: Array<{
    file: string;
    import: string;
    resolved: string | null;
  }> = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = extractImports(content);

    for (const importPath of imports) {
      // Skip external packages
      if (isExternalPackage(importPath)) {
        continue;
      }

      // Resolve import to file path
      const resolvedPath = resolveImportPath(
        importPath,
        filePath.replace(process.cwd() + '/', '')
      );

      if (!resolvedPath) {
        continue; // External package
      }

      // Check if resolved file exists in git
      if (!isFileTrackedInGit(resolvedPath, gitFiles)) {
        // Check if file exists locally but not in git
        const localExists = fs.existsSync(
          path.join(process.cwd(), resolvedPath)
        );

        if (localExists) {
          issues.push({
            file: filePath.replace(process.cwd() + '/', ''),
            import: importPath,
            resolved: resolvedPath,
          });
        }
      }
    }
  } catch (error) {
    // Skip files that can't be read
  }

  return issues;
}

describe('Import Validation - Missing Files in Git', () => {
  let gitFiles: Set<string>;

  beforeAll(() => {
    gitFiles = getGitTrackedFiles();
  });

  it('should have git repository initialized', () => {
    expect(() => gitCommand('status')).not.toThrow();
  });

  it('should have tracked files in git', () => {
    expect(gitFiles.size).toBeGreaterThan(0);
  });

  describe('Critical Files - Previously Missing', () => {
    it('should have lib/utils/thumbnail-generator.ts in git', () => {
      expect(gitFiles.has('lib/utils/thumbnail-generator.ts')).toBe(true);
    });

    it('should have lib/utils/slug-generator.ts in git', () => {
      expect(gitFiles.has('lib/utils/slug-generator.ts')).toBe(true);
    });

    it('should have lib/model-aggregator-service.ts in git', () => {
      expect(
        gitFiles.has('lib/model-aggregator-service.ts') ||
          gitFiles.has('lib/model-aggregator.ts')
      ).toBe(true);
    });
  });

  describe('All Imports Must Be Tracked', () => {
    it('should have all imported files committed to git', () => {
      const sourceFiles = getSourceFiles();
      const allIssues: Array<{
        file: string;
        import: string;
        resolved: string | null;
      }> = [];

      for (const file of sourceFiles) {
        const issues = validateFileImports(file, gitFiles);
        allIssues.push(...issues);
      }

      if (allIssues.length > 0) {
        const errorMessage = [
          '\n❌ Found imports to files that exist locally but are NOT committed to git:',
          '',
          ...allIssues.map(
            (issue) =>
              `  📄 ${issue.file}\n     imports: "${issue.import}"\n     resolves to: ${issue.resolved}\n     ⚠️  File exists locally but is NOT in git!`
          ),
          '',
          '💡 Fix: Run "git add <file>" to commit these files before deployment.',
          '',
        ].join('\n');

        expect(allIssues).toEqual([]);
        throw new Error(errorMessage);
      }

      expect(allIssues).toEqual([]);
    });
  });

  describe('Import Path Resolution', () => {
    it('should resolve @/ alias imports correctly', () => {
      const testPath = '@/lib/utils/thumbnail-generator';
      const resolved = resolveImportPath(testPath, 'app/test.tsx');
      expect(resolved).toBeDefined();
      expect(resolved).toContain('lib/utils/thumbnail-generator');
    });

    it('should resolve relative imports correctly', () => {
      const testPath = './utils/thumbnail-generator';
      const resolved = resolveImportPath(testPath, 'lib/model-aggregator.ts');
      expect(resolved).toBeDefined();
    });

    it('should skip external packages', () => {
      const resolved = resolveImportPath('react', 'app/test.tsx');
      expect(resolved).toBeNull();
    });
  });

  describe('File Existence Checks', () => {
    it('lib/utils/thumbnail-generator.ts should exist in filesystem', () => {
      const exists = fs.existsSync(
        path.join(process.cwd(), 'lib/utils/thumbnail-generator.ts')
      );
      expect(exists).toBe(true);
    });

    it('lib/utils/slug-generator.ts should exist in filesystem', () => {
      const exists = fs.existsSync(
        path.join(process.cwd(), 'lib/utils/slug-generator.ts')
      );
      expect(exists).toBe(true);
    });

    it('should verify model-aggregator imports are resolvable', () => {
      const aggregatorPath = fs.existsSync(
        path.join(process.cwd(), 'lib/model-aggregator-service.ts')
      )
        ? 'lib/model-aggregator-service.ts'
        : 'lib/model-aggregator.ts';

      const content = fs.readFileSync(
        path.join(process.cwd(), aggregatorPath),
        'utf-8'
      );
      const imports = extractImports(content);

      const utilsImports = imports.filter((imp) =>
        imp.includes('thumbnail-generator')
      );
      expect(utilsImports.length).toBeGreaterThan(0);
    });
  });

  describe('Import Extraction', () => {
    it('should extract ES6 named imports', () => {
      const code = "import { getThumbnailUrl } from './utils/thumbnail-generator';";
      const imports = extractImports(code);
      expect(imports).toContain('./utils/thumbnail-generator');
    });

    it('should extract ES6 default imports', () => {
      const code = "import React from 'react';";
      const imports = extractImports(code);
      expect(imports).toContain('react');
    });

    it('should extract dynamic imports', () => {
      const code = "const module = import('./dynamic-module');";
      const imports = extractImports(code);
      expect(imports).toContain('./dynamic-module');
    });

    it('should extract require statements', () => {
      const code = "const fs = require('fs');";
      const imports = extractImports(code);
      expect(imports).toContain('fs');
    });

    it('should handle multiple imports in one file', () => {
      const code = `
        import React from 'react';
        import { useState } from 'react';
        import { getThumbnailUrl } from './utils';
        const fs = require('fs');
      `;
      const imports = extractImports(code);
      expect(imports.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('External Package Detection', () => {
    it('should identify react as external', () => {
      expect(isExternalPackage('react')).toBe(true);
    });

    it('should identify @radix-ui as external', () => {
      expect(isExternalPackage('@radix-ui/react-dialog')).toBe(true);
    });

    it('should identify relative imports as internal', () => {
      expect(isExternalPackage('./utils/helper')).toBe(false);
    });

    it('should identify @/ alias as internal', () => {
      expect(isExternalPackage('@/lib/utils')).toBe(false);
    });
  });
});

describe('Import Validation - Production Safety', () => {
  it('should prevent deployment with uncommitted imports', () => {
    const gitFiles = getGitTrackedFiles();
    const criticalFiles = [
      'lib/utils/thumbnail-generator.ts',
      'lib/utils/slug-generator.ts',
    ];

    const missingFiles = criticalFiles.filter(
      (file) => !gitFiles.has(file)
    );

    if (missingFiles.length > 0) {
      throw new Error(
        `❌ DEPLOYMENT BLOCKED: Critical files not in git:\n${missingFiles.map((f) => `  - ${f}`).join('\n')}`
      );
    }

    expect(missingFiles).toEqual([]);
  });

  it('should validate all lib/ files are tracked', () => {
    const gitFiles = getGitTrackedFiles();
    const libFiles = walkDirectory(path.join(process.cwd(), 'lib')).filter(
      (f) =>
        CONFIG.extensions.some((ext) => f.endsWith(ext)) &&
        !CONFIG.excludePatterns.some((pattern) => f.includes(pattern))
    );

    const untrackedFiles = libFiles.filter((file) => {
      const relativePath = file.replace(process.cwd() + '/', '');
      return !gitFiles.has(relativePath);
    });

    if (untrackedFiles.length > 0) {
      console.warn(
        '⚠️  Warning: Found untracked files in lib/:\n',
        untrackedFiles.map((f) => `  - ${f.replace(process.cwd() + '/', '')}`).join('\n')
      );
    }

    // This is a warning, not a failure, as new files might be in development
    expect(untrackedFiles.length).toBeLessThan(10);
  });
});
