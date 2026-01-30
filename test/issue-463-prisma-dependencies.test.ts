/**
 * Test: Verify Prisma dependencies are correctly installed
 * Issue: #463 - Missing Prisma dependencies
 *
 * This test ensures:
 * 1. @prisma/client is installed
 * 2. @next-auth/prisma-adapter is installed
 * 3. prisma CLI is installed as dev dependency
 * 4. Prisma client can be imported
 * 5. PrismaAdapter can be imported
 * 6. Prisma schema exists
 * 7. Generated Prisma client exists
 */

import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '..');

describe('Issue #463: Prisma Dependencies', () => {
  describe('Package.json Dependencies', () => {
    test('should have @prisma/client in dependencies', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
      );

      expect(packageJson.dependencies).toHaveProperty('@prisma/client');
      expect(packageJson.dependencies['@prisma/client']).toMatch(/^\^5\./);
    });

    test('should have @next-auth/prisma-adapter in dependencies', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
      );

      expect(packageJson.dependencies).toHaveProperty('@next-auth/prisma-adapter');
      expect(packageJson.dependencies['@next-auth/prisma-adapter']).toMatch(/^\^1\./);
    });

    test('should have prisma CLI in devDependencies', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
      );

      expect(packageJson.devDependencies).toHaveProperty('prisma');
      expect(packageJson.devDependencies['prisma']).toMatch(/^\^5\./);
    });
  });

  describe('Module Resolution', () => {
    test('should be able to import @prisma/client', () => {
      expect(() => {
        require('@prisma/client');
      }).not.toThrow();
    });

    test('should be able to import @next-auth/prisma-adapter', () => {
      expect(() => {
        require('@next-auth/prisma-adapter');
      }).not.toThrow();
    });

    test('should export PrismaClient from @prisma/client', () => {
      const { PrismaClient } = require('@prisma/client');
      expect(PrismaClient).toBeDefined();
      expect(typeof PrismaClient).toBe('function');
    });

    test('should export PrismaAdapter from @next-auth/prisma-adapter', () => {
      const { PrismaAdapter } = require('@next-auth/prisma-adapter');
      expect(PrismaAdapter).toBeDefined();
      expect(typeof PrismaAdapter).toBe('function');
    });
  });

  describe('Prisma Schema and Generated Client', () => {
    test('should have prisma schema file', () => {
      const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
      expect(fs.existsSync(schemaPath)).toBe(true);

      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      expect(schemaContent).toContain('generator client');
      expect(schemaContent).toContain('datasource db');
    });

    test('should have generated Prisma client', () => {
      const generatedClientPath = path.join(
        projectRoot,
        'node_modules',
        '@prisma',
        'client'
      );
      expect(fs.existsSync(generatedClientPath)).toBe(true);
    });

    test('should have Prisma client index file', () => {
      const clientIndexPath = path.join(
        projectRoot,
        'node_modules',
        '@prisma',
        'client',
        'index.js'
      );
      expect(fs.existsSync(clientIndexPath)).toBe(true);
    });
  });

  describe('NextAuth Schema Models', () => {
    test('should define required NextAuth models in schema', () => {
      const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      // Check for required NextAuth models
      expect(schemaContent).toContain('model Account');
      expect(schemaContent).toContain('model Session');
      expect(schemaContent).toContain('model User');
      expect(schemaContent).toContain('model VerificationToken');
    });

    test('should have User model with role field', () => {
      const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      expect(schemaContent).toContain('role');
      expect(schemaContent).toContain('String');
      expect(schemaContent).toContain('@default("user")');
    });
  });

  describe('Integration with Auth Options', () => {
    test('should import PrismaAdapter in auth options', () => {
      const authOptionsPath = path.join(projectRoot, 'lib', 'auth', 'options.ts');
      const authOptionsContent = fs.readFileSync(authOptionsPath, 'utf-8');

      expect(authOptionsContent).toContain("from '@next-auth/prisma-adapter'");
      expect(authOptionsContent).toContain('PrismaAdapter');
    });

    test('should import prisma client in auth options', () => {
      const authOptionsPath = path.join(projectRoot, 'lib', 'auth', 'options.ts');
      const authOptionsContent = fs.readFileSync(authOptionsPath, 'utf-8');

      expect(authOptionsContent).toContain("from '@/lib/prisma'");
      expect(authOptionsContent).toContain('prisma');
    });

    test('should use PrismaAdapter in authOptions', () => {
      const authOptionsPath = path.join(projectRoot, 'lib', 'auth', 'options.ts');
      const authOptionsContent = fs.readFileSync(authOptionsPath, 'utf-8');

      expect(authOptionsContent).toContain('adapter: PrismaAdapter(prisma)');
    });
  });

  describe('Prisma Client Singleton', () => {
    test('should have prisma.ts file', () => {
      const prismaClientPath = path.join(projectRoot, 'lib', 'prisma.ts');
      expect(fs.existsSync(prismaClientPath)).toBe(true);
    });

    test('should import PrismaClient in lib/prisma.ts', () => {
      const prismaClientPath = path.join(projectRoot, 'lib', 'prisma.ts');
      const prismaContent = fs.readFileSync(prismaClientPath, 'utf-8');

      expect(prismaContent).toContain("from '@prisma/client'");
      expect(prismaContent).toContain('PrismaClient');
    });

    test('should export prisma singleton', () => {
      const prismaClientPath = path.join(projectRoot, 'lib', 'prisma.ts');
      const prismaContent = fs.readFileSync(prismaClientPath, 'utf-8');

      expect(prismaContent).toContain('export const prisma');
      expect(prismaContent).toContain('new PrismaClient');
    });

    test('should implement development hot-reload protection', () => {
      const prismaClientPath = path.join(projectRoot, 'lib', 'prisma.ts');
      const prismaContent = fs.readFileSync(prismaClientPath, 'utf-8');

      expect(prismaContent).toContain('globalForPrisma');
      expect(prismaContent).toContain('globalThis');
    });
  });

  describe('Version Compatibility', () => {
    test('should use compatible Prisma versions', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
      );

      const prismaClientVersion = packageJson.dependencies['@prisma/client'];
      const prismaCliVersion = packageJson.devDependencies['prisma'];

      // Extract major and minor versions
      const clientMajorMinor = prismaClientVersion.replace(/^\^/, '').split('.').slice(0, 2).join('.');
      const cliMajorMinor = prismaCliVersion.replace(/^\^/, '').split('.').slice(0, 2).join('.');

      // Versions should match in major and minor
      expect(clientMajorMinor).toBe(cliMajorMinor);
    });

    test('should be compatible with next-auth adapter', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
      );

      const prismaClientVersion = packageJson.dependencies['@prisma/client'];
      const majorVersion = parseInt(prismaClientVersion.replace(/^\^/, '').split('.')[0]);

      // next-auth prisma adapter supports Prisma 3+
      expect(majorVersion).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Build Verification', () => {
    test('should not have missing dependency errors', () => {
      // Check package-lock.json exists
      const packageLockPath = path.join(projectRoot, 'package-lock.json');
      expect(fs.existsSync(packageLockPath)).toBe(true);
    });

    test('should have all node_modules installed', () => {
      const nodeModulesPath = path.join(projectRoot, 'node_modules');
      expect(fs.existsSync(nodeModulesPath)).toBe(true);

      const prismaClientPath = path.join(nodeModulesPath, '@prisma', 'client');
      const prismaAdapterPath = path.join(nodeModulesPath, '@next-auth', 'prisma-adapter');

      expect(fs.existsSync(prismaClientPath)).toBe(true);
      expect(fs.existsSync(prismaAdapterPath)).toBe(true);
    });
  });
});
