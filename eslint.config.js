import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules", "public", "src/components/ui"]),

  // Base JS + TypeScript strict rules
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React rules
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with React 17+ new JSX transform
      "react/prop-types": "off", // TypeScript handles prop types
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // JSX Accessibility rules
  {
    files: ["**/*.{ts,tsx}"],
    ...jsxA11y.flatConfigs.recommended,
  },

  // Import order enforcement
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",
    },
  },

  // General code quality rules
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Unused vars: error, but ignore _-prefixed names (intentionally unused)
      "no-unused-vars": "off", // disabled in favour of the TS-aware version below
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Console: warn only (allow during development, catch in CI)
      "no-console": "warn",
      // Prefer interface over type for object shapes
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    },
  },

  // Kebab-case filename enforcement for all source files
  {
    files: ["src/**/*.{ts,tsx,js}"],
    plugins: { unicorn },
    rules: {
      "unicorn/filename-case": ["error", { case: "kebabCase" }],
    },
  },

  // Relaxed rules for shadcn/ui generated components (vendor-like files)
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-conversion": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "react-refresh/only-export-components": "off",
    },
  },

  // Relaxed rules for react-hook-form field arrays - commonly use index in template literals
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/restrict-template-expressions": "off",
    },
  },

  // Config files (JS, CJS, MJS) - no TypeScript type-checking
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
]);
