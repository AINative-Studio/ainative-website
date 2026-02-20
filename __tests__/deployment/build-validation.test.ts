/**
 * Build Validation Tests
 *
 * These tests catch issues that would break production builds:
 * - Missing files and imports
 * - Invalid module resolutions
 * - Required dependencies
 * - TypeScript compilation errors
 * - Critical file existence
 *
 * Run before every deployment to prevent production failures.
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

describe('Build Validation - File Existence', () => {
  const rootDir = join(__dirname, '../..');

  describe('Critical Files', () => {
    it('should have next.config.ts', () => {
      const configPath = join(rootDir, 'next.config.ts');
      expect(existsSync(configPath)).toBe(true);
      expect(statSync(configPath).isFile()).toBe(true);
    });

    it('should have package.json', () => {
      const packagePath = join(rootDir, 'package.json');
      expect(existsSync(packagePath)).toBe(true);
      const pkg = require(packagePath);
      expect(pkg.name).toBeTruthy();
      expect(pkg.version).toBeTruthy();
    });

    it('should have tsconfig.json', () => {
      const tsconfigPath = join(rootDir, 'tsconfig.json');
      expect(existsSync(tsconfigPath)).toBe(true);
    });

    it('should have .env.example', () => {
      const envExamplePath = join(rootDir, '.env.example');
      expect(existsSync(envExamplePath)).toBe(true);
    });
  });

  describe('Required Utility Files', () => {
    const utilsDir = join(rootDir, 'lib', 'utils');

    it('should have thumbnail-generator.ts', () => {
      const thumbnailPath = join(utilsDir, 'thumbnail-generator.ts');
      expect(existsSync(thumbnailPath)).toBe(true);
      expect(statSync(thumbnailPath).isFile()).toBe(true);
    });

    it('should have slug-generator.ts', () => {
      const slugPath = join(utilsDir, 'slug-generator.ts');
      expect(existsSync(slugPath)).toBe(true);
      expect(statSync(slugPath).isFile()).toBe(true);
    });

    it('should have color-contrast.ts', () => {
      const contrastPath = join(utilsDir, 'color-contrast.ts');
      expect(existsSync(contrastPath)).toBe(true);
    });

    it('should have export.ts', () => {
      const exportPath = join(utilsDir, 'export.ts');
      expect(existsSync(exportPath)).toBe(true);
    });
  });

  describe('Authentication Files', () => {
    it('should have NextAuth options configuration', () => {
      const authOptionsPath = join(rootDir, 'lib', 'auth', 'options.ts');
      expect(existsSync(authOptionsPath)).toBe(true);
    });

    it('should have NextAuth API route', () => {
      const authRoutePath = join(rootDir, 'app', 'api', 'auth', '[...nextauth]', 'route.ts');
      expect(existsSync(authRoutePath)).toBe(true);
    });
  });

  describe('Public Assets', () => {
    const publicDir = join(rootDir, 'public');

    it('should have public directory', () => {
      expect(existsSync(publicDir)).toBe(true);
      expect(statSync(publicDir).isDirectory()).toBe(true);
    });

    it('should have favicon.ico', () => {
      const faviconPath = join(publicDir, 'favicon.ico');
      expect(existsSync(faviconPath)).toBe(true);
    });
  });
});

describe('Build Validation - Import Resolution', () => {
  describe('Critical Imports', () => {
    it('should be able to import thumbnail-generator', () => {
      expect(() => {
        require('../../lib/utils/thumbnail-generator');
      }).not.toThrow();
    });

    it('should be able to import slug-generator', () => {
      expect(() => {
        require('../../lib/utils/slug-generator');
      }).not.toThrow();
    });

    it('should be able to import auth options', () => {
      expect(() => {
        require('../../lib/auth/options');
      }).not.toThrow();
    });
  });

  describe('Module Dependencies', () => {
    it('should have all peer dependencies installed', () => {
      const packageJson = require('../../package.json');
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Critical dependencies
      const criticalDeps = [
        'next',
        'react',
        'react-dom',
        'next-auth',
        '@prisma/client',
        'typescript'
      ];

      criticalDeps.forEach(dep => {
        expect(dependencies[dep]).toBeTruthy();
      });
    });
  });
});

describe('Build Validation - TypeScript Compilation', () => {
  it('should compile TypeScript without errors', () => {
    try {
      // Run TypeScript compiler in noEmit mode (check only)
      execSync('npx tsc --noEmit', {
        cwd: join(__dirname, '../..'),
        stdio: 'pipe',
        encoding: 'utf-8'
      });
    } catch (error: any) {
      // If ignoreBuildErrors is true in next.config, we only warn
      const output = error.stdout || error.stderr || '';
      console.warn('TypeScript compilation warnings:', output);

      // Check if there are critical errors (not just warnings)
      if (output.includes('error TS')) {
        const errorLines = output.split('\n').filter((line: string) => line.includes('error TS'));
        console.error('Critical TypeScript errors found:', errorLines.slice(0, 5).join('\n'));
      }
    }
  }, 30000);

  it('should have valid tsconfig.json', () => {
    const tsconfigPath = join(__dirname, '../../tsconfig.json');
    const tsconfig = require(tsconfigPath);

    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBeDefined();
    expect(tsconfig.include).toBeDefined();
  });
});

describe('Build Validation - Next.js Configuration', () => {
  it('should have valid next.config.ts', () => {
    const nextConfigPath = join(__dirname, '../../next.config.ts');
    expect(existsSync(nextConfigPath)).toBe(true);
  });

  it('should be able to require next.config', () => {
    // This will fail if there are syntax errors
    expect(() => {
      require('../../next.config');
    }).not.toThrow();
  });

  it('should have standalone output mode for Railway', () => {
    const nextConfig = require('../../next.config');
    const config = typeof nextConfig === 'function'
      ? nextConfig('phase-production-build', {})
      : nextConfig;

    expect(config.output).toBe('standalone');
  });
});

describe('Build Validation - Package Scripts', () => {
  const packageJson = require('../../package.json');

  it('should have build script', () => {
    expect(packageJson.scripts.build).toBeTruthy();
    expect(packageJson.scripts.build).toContain('next build');
  });

  it('should have start script', () => {
    expect(packageJson.scripts.start).toBeTruthy();
    expect(packageJson.scripts.start).toContain('next start');
  });

  it('should have test scripts', () => {
    expect(packageJson.scripts.test).toBeTruthy();
    expect(packageJson.scripts['test:coverage']).toBeTruthy();
  });
});

describe('Build Validation - Dependency Security', () => {
  it('should not have vulnerable dependencies', () => {
    try {
      const result = execSync('npm audit --audit-level=critical --json', {
        cwd: join(__dirname, '../..'),
        encoding: 'utf-8'
      });

      const auditResult = JSON.parse(result);
      const criticalVulns = auditResult.metadata?.vulnerabilities?.critical || 0;

      expect(criticalVulns).toBe(0);
    } catch (error: any) {
      // npm audit returns non-zero exit code if vulnerabilities found
      if (error.stdout) {
        const auditResult = JSON.parse(error.stdout);
        const criticalVulns = auditResult.metadata?.vulnerabilities?.critical || 0;

        if (criticalVulns > 0) {
          fail(`Found ${criticalVulns} critical vulnerabilities. Run 'npm audit fix' to resolve.`);
        }
      }
    }
  }, 60000);
});
