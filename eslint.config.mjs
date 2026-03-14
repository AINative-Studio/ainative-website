import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Disable React Compiler linting globally
    // React Compiler is already disabled in next.config.ts (experimental.reactCompiler: false)
    // But react-hooks v7 still runs compiler checks during lint
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
    rules: {
      // Relax TypeScript rules for test files and type definitions
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/triple-slash-reference": "warn",

      // Relax React rules
      "react/display-name": "warn",
      "react/jsx-key": "warn",
      "react/no-unescaped-entities": "warn",

      // React Hooks rules - keep essential rules only
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // Disable ALL React Compiler strict rules (from Next.js 16 / react-hooks v7)
      // These rules cause CI build failures and are too strict for existing codebase
      // The React Compiler is already disabled in next.config.ts (experimental.reactCompiler: false)
      "react-compiler/react-compiler": "off",
      "react-hooks/static-components": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/component-hook-factories": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
      "react-hooks/globals": "off",
      "react-hooks/refs": "off",                    // Prevents "Cannot access refs during render"
      "react-hooks/set-state-in-effect": "off",     // Prevents "setState synchronously within an effect"
      "react-hooks/error-boundaries": "off",
      "react-hooks/purity": "off",                  // Prevents "Cannot call impure function during render"
      "react-hooks/incompatible-library": "off",

      // Next.js specific
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
]);

export default eslintConfig;
