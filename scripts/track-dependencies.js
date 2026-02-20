#!/usr/bin/env node

/**
 * Dependency Tracking System
 * Builds a dependency graph of all imports in the codebase
 * Identifies:
 * - Circular dependencies
 * - Unused files
 * - Missing dependencies
 * - Import patterns
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

class DependencyTracker {
  constructor() {
    this.dependencyGraph = new Map(); // file -> [dependencies]
    this.reverseDependencyGraph = new Map(); // file -> [dependents]
    this.allFiles = new Set();
    this.externalDependencies = new Set();
    this.missingDependencies = new Set();
  }

  /**
   * Get all source files
   */
  getSourceFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', 'dist', 'build', '__tests__', 'coverage'].includes(entry.name)) {
          this.getSourceFiles(fullPath, files);
        }
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
        this.allFiles.add(fullPath);
      }
    }

    return files;
  }

  /**
   * Extract imports from file
   */
  extractImports(content) {
    const imports = [];
    const patterns = [
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g,
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
    }

    return imports;
  }

  /**
   * Resolve import path
   */
  resolveImport(importPath, sourceFile) {
    // External dependency
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return { type: 'external', path: importPath };
    }

    const sourceDir = path.dirname(sourceFile);

    // Handle path aliases
    if (importPath.startsWith('@/')) {
      const relativePath = importPath.substring(2);
      return { type: 'internal', path: path.join(PROJECT_ROOT, relativePath) };
    }

    // Relative imports
    if (importPath.startsWith('.')) {
      return { type: 'internal', path: path.join(sourceDir, importPath) };
    }

    return { type: 'unknown', path: importPath };
  }

  /**
   * Check if resolved path exists
   */
  checkFileExists(basePath) {
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json'];

    for (const ext of extensions) {
      const filePath = basePath + ext;
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return filePath;
      }
    }

    // Check for index files
    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        const indexPath = path.join(basePath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          return indexPath;
        }
      }
    }

    return null;
  }

  /**
   * Build dependency graph
   */
  buildGraph() {
    console.log(`${BLUE}Building dependency graph...${RESET}`);

    const files = this.getSourceFiles(SRC_DIR);
    console.log(`${GREEN}✓${RESET} Found ${files.length} source files\n`);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const imports = this.extractImports(content);

      const dependencies = [];

      for (const importPath of imports) {
        const resolved = this.resolveImport(importPath, file);

        if (resolved.type === 'external') {
          this.externalDependencies.add(resolved.path);
        } else if (resolved.type === 'internal') {
          const resolvedFile = this.checkFileExists(resolved.path);

          if (resolvedFile) {
            dependencies.push(resolvedFile);

            // Build reverse dependency graph
            if (!this.reverseDependencyGraph.has(resolvedFile)) {
              this.reverseDependencyGraph.set(resolvedFile, []);
            }
            this.reverseDependencyGraph.get(resolvedFile).push(file);
          } else {
            this.missingDependencies.add({
              file: path.relative(PROJECT_ROOT, file),
              import: importPath,
              resolved: path.relative(PROJECT_ROOT, resolved.path)
            });
          }
        }
      }

      this.dependencyGraph.set(file, dependencies);
    }

    console.log(`${GREEN}✓${RESET} Dependency graph built\n`);
  }

  /**
   * Find circular dependencies
   */
  findCircularDependencies() {
    const circles = [];
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        circles.push(path.slice(cycleStart).concat(node));
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const dependencies = this.dependencyGraph.get(node) || [];
      for (const dep of dependencies) {
        dfs(dep, [...path]);
      }

      recursionStack.delete(node);
    };

    for (const file of this.allFiles) {
      if (!visited.has(file)) {
        dfs(file);
      }
    }

    return circles;
  }

  /**
   * Find unused files
   */
  findUnusedFiles() {
    const unused = [];

    for (const file of this.allFiles) {
      const dependents = this.reverseDependencyGraph.get(file);

      // Check if it's an entry point (pages, app routes, etc.)
      const relativePath = path.relative(PROJECT_ROOT, file);
      const isEntryPoint = relativePath.match(/\/(pages|app)\//);

      if (!dependents && !isEntryPoint) {
        unused.push(file);
      }
    }

    return unused;
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log(`${CYAN}========================================${RESET}`);
    console.log(`${CYAN}  Dependency Analysis Report${RESET}`);
    console.log(`${CYAN}========================================${RESET}`);
    console.log('');

    // Summary
    console.log(`${BLUE}Summary:${RESET}`);
    console.log(`  Total files: ${this.allFiles.size}`);
    console.log(`  External dependencies: ${this.externalDependencies.size}`);
    console.log(`  Missing dependencies: ${this.missingDependencies.size}`);
    console.log('');

    // Missing dependencies
    if (this.missingDependencies.size > 0) {
      console.log(`${RED}Missing Dependencies (${this.missingDependencies.size}):${RESET}`);
      for (const missing of this.missingDependencies) {
        console.log(`  ${RED}✗${RESET} ${missing.file}`);
        console.log(`    Import: ${YELLOW}${missing.import}${RESET}`);
        console.log(`    Resolved: ${missing.resolved}`);
      }
      console.log('');
    }

    // Circular dependencies
    const circles = this.findCircularDependencies();
    if (circles.length > 0) {
      console.log(`${YELLOW}Circular Dependencies (${circles.length}):${RESET}`);
      for (const circle of circles) {
        console.log(`  ${YELLOW}⚠${RESET} Cycle detected:`);
        for (const file of circle) {
          console.log(`    → ${path.relative(PROJECT_ROOT, file)}`);
        }
        console.log('');
      }
    } else {
      console.log(`${GREEN}✓${RESET} No circular dependencies detected`);
      console.log('');
    }

    // Unused files
    const unused = this.findUnusedFiles();
    if (unused.length > 0) {
      console.log(`${YELLOW}Potentially Unused Files (${unused.length}):${RESET}`);
      for (const file of unused) {
        console.log(`  ${YELLOW}⚠${RESET} ${path.relative(PROJECT_ROOT, file)}`);
      }
      console.log('');
    } else {
      console.log(`${GREEN}✓${RESET} No unused files detected`);
      console.log('');
    }

    // External dependencies
    if (this.externalDependencies.size > 0) {
      console.log(`${BLUE}External Dependencies (top 10):${RESET}`);
      const sorted = Array.from(this.externalDependencies).slice(0, 10);
      for (const dep of sorted) {
        console.log(`  • ${dep}`);
      }
      console.log('');
    }

    // Most imported files
    const mostImported = Array.from(this.reverseDependencyGraph.entries())
      .map(([file, dependents]) => ({ file, count: dependents.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (mostImported.length > 0) {
      console.log(`${BLUE}Most Imported Files:${RESET}`);
      for (const { file, count } of mostImported) {
        console.log(`  ${count}× ${path.relative(PROJECT_ROOT, file)}`);
      }
      console.log('');
    }

    // Final status
    console.log(`${CYAN}========================================${RESET}`);
    if (this.missingDependencies.size === 0) {
      console.log(`${GREEN}✅ All dependencies resolved correctly${RESET}`);
      return 0;
    } else {
      console.log(`${RED}❌ Found ${this.missingDependencies.size} missing dependencies${RESET}`);
      return 1;
    }
  }

  /**
   * Export dependency graph to JSON
   */
  exportGraph(outputPath) {
    const graphData = {
      files: Array.from(this.allFiles).map(f => path.relative(PROJECT_ROOT, f)),
      dependencies: {},
      reverseDependencies: {},
      externalDependencies: Array.from(this.externalDependencies),
      missingDependencies: Array.from(this.missingDependencies),
    };

    for (const [file, deps] of this.dependencyGraph.entries()) {
      const relativeFile = path.relative(PROJECT_ROOT, file);
      graphData.dependencies[relativeFile] = deps.map(d => path.relative(PROJECT_ROOT, d));
    }

    for (const [file, deps] of this.reverseDependencyGraph.entries()) {
      const relativeFile = path.relative(PROJECT_ROOT, file);
      graphData.reverseDependencies[relativeFile] = deps.map(d => path.relative(PROJECT_ROOT, d));
    }

    fs.writeFileSync(outputPath, JSON.stringify(graphData, null, 2));
    console.log(`${GREEN}✓${RESET} Dependency graph exported to ${outputPath}`);
  }
}

// Main execution
function main() {
  console.log(`${BLUE}========================================${RESET}`);
  console.log(`${BLUE}  Dependency Tracker${RESET}`);
  console.log(`${BLUE}========================================${RESET}`);
  console.log('');

  const tracker = new DependencyTracker();
  tracker.buildGraph();
  const exitCode = tracker.generateReport();

  // Export graph if requested
  if (process.argv.includes('--export')) {
    const outputPath = path.join(PROJECT_ROOT, 'dependency-graph.json');
    tracker.exportGraph(outputPath);
  }

  process.exit(exitCode);
}

main();
