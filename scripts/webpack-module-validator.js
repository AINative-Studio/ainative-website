/**
 * Webpack Module Validator Plugin
 * Fails fast when modules cannot be resolved
 * Prevents "Module not found" errors from reaching production
 */

class ModuleValidatorPlugin {
  constructor(options = {}) {
    this.options = {
      failOnError: true,
      logMissingModules: true,
      ignorePatterns: [
        /node_modules/,
        /\.next/,
        /\.git/
      ],
      ...options
    };

    this.missingModules = new Set();
    this.resolutionErrors = [];
  }

  apply(compiler) {
    const pluginName = 'ModuleValidatorPlugin';

    // Hook into the compilation process
    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      // Track module resolution failures
      compilation.hooks.failedModule.tap(pluginName, (module) => {
        const error = module.error;

        if (error && error.message) {
          // Check if it's a module resolution error
          if (error.message.includes('Module not found') ||
              error.message.includes("Can't resolve")) {

            // Extract the module path
            const match = error.message.match(/Can't resolve '([^']+)'/);
            const modulePath = match ? match[1] : 'unknown';

            // Skip if it matches ignore patterns
            const shouldIgnore = this.options.ignorePatterns.some(
              pattern => pattern.test(modulePath)
            );

            if (!shouldIgnore) {
              this.missingModules.add(modulePath);

              this.resolutionErrors.push({
                module: modulePath,
                error: error.message,
                file: module.userRequest || 'unknown',
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      });

      // Hook into the seal phase (before optimization)
      compilation.hooks.seal.tap(pluginName, () => {
        if (this.missingModules.size > 0) {
          const errorMessage = this.formatErrorMessage();

          if (this.options.logMissingModules) {
            console.error('\n' + errorMessage + '\n');
          }

          if (this.options.failOnError) {
            compilation.errors.push(new Error(errorMessage));
          } else {
            compilation.warnings.push(new Error(errorMessage));
          }
        }
      });
    });

    // Hook into the done phase to report final results
    compiler.hooks.done.tap(pluginName, (stats) => {
      if (this.missingModules.size > 0) {
        console.error('\n===========================================');
        console.error('MODULE VALIDATION FAILED');
        console.error('===========================================');
        console.error(`Found ${this.missingModules.size} missing module(s)`);
        console.error('');

        // Log each error
        this.resolutionErrors.forEach((error, index) => {
          console.error(`[${index + 1}] ${error.module}`);
          console.error(`    File: ${error.file}`);
          console.error(`    Error: ${error.error}`);
          console.error('');
        });

        console.error('===========================================');
        console.error('ACTION REQUIRED:');
        console.error('1. Create the missing files');
        console.error('2. Fix the import paths');
        console.error('3. Add files to git if not tracked');
        console.error('===========================================\n');

        // Clear for next compilation
        this.missingModules.clear();
        this.resolutionErrors = [];
      }
    });
  }

  formatErrorMessage() {
    const modules = Array.from(this.missingModules);
    let message = '\n';
    message += '╔═════════════════════════════════════════════════════════════╗\n';
    message += '║                MODULE RESOLUTION FAILURE                    ║\n';
    message += '╚═════════════════════════════════════════════════════════════╝\n';
    message += '\n';
    message += `❌ Cannot resolve ${modules.length} module(s):\n\n`;

    this.resolutionErrors.forEach((error, index) => {
      message += `  ${index + 1}. ${error.module}\n`;
      message += `     → Imported in: ${error.file}\n`;
      message += '\n';
    });

    message += '\n';
    message += '💡 Possible solutions:\n';
    message += '   • Create the missing file(s)\n';
    message += '   • Fix the import path(s)\n';
    message += '   • Ensure file(s) are tracked by git\n';
    message += '   • Run: npm run validate:imports\n';
    message += '\n';

    return message;
  }
}

module.exports = ModuleValidatorPlugin;
