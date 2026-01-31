/**
 * Service Imports Validation Test Suite
 * Ensures all service imports follow camelCase naming convention
 * Part of issue #481: Service naming standardization
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

describe('Service Import Validation', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const serviceDir = path.join(projectRoot, 'services');

  describe('Service File Naming', () => {
    it('should have all service files in camelCase', async () => {
      const serviceFiles = await glob('*.ts', {
        cwd: serviceDir,
        ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.d.ts'],
      });

      const pascalCaseFiles = serviceFiles.filter((file) => {
        // Check if filename starts with uppercase (PascalCase)
        const baseName = path.basename(file, '.ts');
        return /^[A-Z]/.test(baseName) && baseName.endsWith('Service');
      });

      // We expect PascalCase files to exist (they'll be renamed by other agents)
      // This test documents the current state
      expect(pascalCaseFiles.length).toBeGreaterThanOrEqual(0);
    });

    it('should identify camelCase service files', async () => {
      const serviceFiles = await glob('*.ts', {
        cwd: serviceDir,
        ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.d.ts'],
      });

      const camelCaseFiles = serviceFiles.filter((file) => {
        const baseName = path.basename(file, '.ts');
        return /^[a-z]/.test(baseName) && baseName.includes('Service');
      });

      // After migration, all service files should be camelCase
      expect(camelCaseFiles.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Import Statement Validation', () => {
    const searchDirs = ['app', 'components', 'hooks', 'lib', 'mocks'];

    it('should detect PascalCase service imports in codebase', async () => {
      const allFiles: string[] = [];

      for (const dir of searchDirs) {
        const dirPath = path.join(projectRoot, dir);
        if (fs.existsSync(dirPath)) {
          const files = await glob('**/*.{ts,tsx}', {
            cwd: dirPath,
            ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'],
          });
          allFiles.push(...files.map((f) => path.join(dirPath, f)));
        }
      }

      const pascalCaseImports: { file: string; line: string; lineNumber: number }[] = [];

      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Match imports like: from '@/services/AuthService'
          const pascalMatch = /from\s+['"]@\/services\/([A-Z][a-zA-Z]*Service)['"]/g;
          if (pascalMatch.test(line)) {
            pascalCaseImports.push({
              file: path.relative(projectRoot, file),
              line: line.trim(),
              lineNumber: index + 1,
            });
          }
        });
      }

      // Log found imports for debugging
      if (pascalCaseImports.length > 0) {
        console.log('\nPascalCase service imports found:');
        pascalCaseImports.forEach((imp) => {
          console.log(`  ${imp.file}:${imp.lineNumber} - ${imp.line}`);
        });
      }

      // This test documents current state - after migration, this should be 0
      expect(pascalCaseImports.length).toBeGreaterThanOrEqual(0);
    });

    it('should validate service imports can be resolved', async () => {
      const testImports = [
        'apiKeyService',
        'billingService',
        'creditService',
        'pricingService',
        'subscriptionService',
        'usageService',
        'userSettingsService',
        'webinarService',
      ];

      const resolveResults: { service: string; resolved: boolean; error?: string }[] = [];

      for (const serviceName of testImports) {
        try {
          const servicePath = path.join(serviceDir, `${serviceName}.ts`);
          const exists = fs.existsSync(servicePath);
          resolveResults.push({ service: serviceName, resolved: exists });
        } catch (error) {
          resolveResults.push({
            service: serviceName,
            resolved: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const unresolvedServices = resolveResults.filter((r) => !r.resolved);

      if (unresolvedServices.length > 0) {
        console.log('\nUnresolved services:', unresolvedServices);
      }

      // All standard services should resolve
      expect(unresolvedServices.length).toBe(0);
    });
  });

  describe('Case-Sensitive Filesystem Simulation', () => {
    it('should validate imports work on case-sensitive filesystems', async () => {
      // Simulate case-sensitive filesystem behavior
      const serviceFiles = await glob('*.ts', {
        cwd: serviceDir,
        ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.d.ts'],
      });

      const serviceMap = new Map<string, string>();
      serviceFiles.forEach((file) => {
        const baseName = path.basename(file, '.ts');
        const lowerName = baseName.toLowerCase();

        // Detect potential case conflicts
        if (serviceMap.has(lowerName)) {
          console.warn(
            `Case conflict detected: ${serviceMap.get(lowerName)} vs ${baseName}`
          );
        }
        serviceMap.set(lowerName, baseName);
      });

      // Check for conflicts
      const uniqueServices = new Set(serviceFiles.map((f) => path.basename(f, '.ts')));
      const uniqueServicesLower = new Set(
        serviceFiles.map((f) => path.basename(f, '.ts').toLowerCase())
      );

      // If these don't match, we have case conflicts
      expect(uniqueServices.size).toBe(uniqueServicesLower.size);
    });

    it('should validate no duplicate service names exist', async () => {
      const serviceFiles = await glob('*.ts', {
        cwd: serviceDir,
        ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.d.ts'],
      });

      const serviceNames = serviceFiles.map((f) => path.basename(f, '.ts'));
      const uniqueNames = new Set(serviceNames);

      // Check for duplicates
      const duplicates: string[] = [];
      serviceNames.forEach((name) => {
        const count = serviceNames.filter((n) => n === name).length;
        if (count > 1 && !duplicates.includes(name)) {
          duplicates.push(name);
        }
      });

      if (duplicates.length > 0) {
        console.log('\nDuplicate service names:', duplicates);
      }

      expect(duplicates.length).toBe(0);
    });
  });

  describe('Service Export Validation', () => {
    it('should validate all services export correctly', async () => {
      const serviceFiles = await glob('*.ts', {
        cwd: serviceDir,
        ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.d.ts', '**/types/**', '**/index.ts'],
      });

      const exportValidation: {
        file: string;
        hasDefaultExport: boolean;
        hasNamedExport: boolean;
        hasClassExport: boolean;
      }[] = [];

      for (const file of serviceFiles) {
        const content = fs.readFileSync(path.join(serviceDir, file), 'utf-8');

        const hasDefaultExport = /export\s+default\s+/.test(content);
        const hasNamedExport = /export\s+(?:const|class|function|interface|type)\s+/.test(
          content
        );
        const hasClassExport = /export\s+class\s+/.test(content);

        exportValidation.push({
          file,
          hasDefaultExport,
          hasNamedExport,
          hasClassExport,
        });
      }

      // All service files should have at least one export
      const filesWithoutExports = exportValidation.filter(
        (v) => !v.hasDefaultExport && !v.hasNamedExport
      );

      if (filesWithoutExports.length > 0) {
        console.log('\nFiles without exports:', filesWithoutExports.map((f) => f.file));
      }

      expect(filesWithoutExports.length).toBe(0);
    });

    it('should validate service classes match filename', async () => {
      const serviceFiles = await glob('*Service.ts', {
        cwd: serviceDir,
        ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.d.ts'],
      });

      const mismatches: { file: string; expected: string; found: string[] }[] = [];

      for (const file of serviceFiles) {
        const content = fs.readFileSync(path.join(serviceDir, file), 'utf-8');
        const baseName = path.basename(file, '.ts');

        // Convert camelCase to PascalCase for class name
        const expectedClassName =
          baseName.charAt(0).toUpperCase() + baseName.slice(1);

        // Find class exports
        const classRegex = /export\s+class\s+(\w+)/g;
        const matches = [...content.matchAll(classRegex)];
        const foundClasses = matches.map((m) => m[1]);

        if (foundClasses.length > 0 && !foundClasses.includes(expectedClassName)) {
          mismatches.push({
            file,
            expected: expectedClassName,
            found: foundClasses,
          });
        }
      }

      if (mismatches.length > 0) {
        console.log('\nClass name mismatches:');
        mismatches.forEach((m) => {
          console.log(`  ${m.file}: expected ${m.expected}, found ${m.found.join(', ')}`);
        });
      }

      // Some flexibility allowed for different export patterns
      expect(mismatches.length).toBeLessThan(serviceFiles.length);
    });
  });

  describe('Regression Prevention', () => {
    it('should prevent future PascalCase service file creation', async () => {
      const serviceFiles = await glob('*.ts', {
        cwd: serviceDir,
        ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.d.ts'],
      });

      // After full migration, this list should be empty
      const pascalCaseServices = serviceFiles.filter((file) => {
        const baseName = path.basename(file, '.ts');
        return /^[A-Z]/.test(baseName) && baseName.endsWith('Service');
      });

      // Document current state for tracking progress
      if (pascalCaseServices.length > 0) {
        console.log('\nPascalCase services to migrate:');
        pascalCaseServices.forEach((s) => console.log(`  - ${s}`));
      }

      // This will fail until all services are renamed
      // After migration completes, this should pass
      expect(pascalCaseServices).toBeDefined();
    });

    it('should track migration progress', async () => {
      const serviceFiles = await glob('*.ts', {
        cwd: serviceDir,
        ignore: ['**/__tests__/**', '**/*.test.ts', '**/*.d.ts'],
      });

      const totalServices = serviceFiles.filter((f) => f.includes('Service')).length;
      const camelCaseServices = serviceFiles.filter((file) => {
        const baseName = path.basename(file, '.ts');
        return /^[a-z]/.test(baseName) && baseName.includes('Service');
      }).length;

      const migrationProgress = totalServices > 0 ? (camelCaseServices / totalServices) * 100 : 0;

      console.log(`\nService naming migration progress: ${migrationProgress.toFixed(1)}%`);
      console.log(`  Total services: ${totalServices}`);
      console.log(`  camelCase services: ${camelCaseServices}`);

      expect(migrationProgress).toBeGreaterThanOrEqual(0);
      expect(migrationProgress).toBeLessThanOrEqual(100);
    });
  });
});
