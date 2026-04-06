// @ts-check
/** @typedef {import("eslint").Linter.Config} EslintConfig */

import {
    asEslintPlugin,
    asRulesRecord,
    eslintPluginUnicorn,
    globals,
    importX,
    js,
    nodePlugin,
    pluginNoOnly,
    pluginTestingLibrary,
    pluginUnusedImports,
    repositoryRootPath,
    tseslint,
    tseslintParser,
    vitest,
} from "./shared.mjs";

/** @type {EslintConfig[]} */
export const testConfigs = [
    // #region 🧪 Internal Tooling
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: 🧪 Internal Tooling
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["test/**/*.{test,spec}.{ts,tsx}", "test/**/*.{ts,tsx}"],
        name: "ESLint Plugin Tests - internal tooling",
        rules: {
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            canonical: "off",
            "canonical/id-match": "off",
            eqeqeq: "off",
            "filenames/no-relative-paths": "off",
            "func-style": "off",
            "max-statements": "off",
            "n/no-missing-import": "off",
            "n/no-sync": "off",
            "n/no-unpublished-import": "off",
            "no-magic-numbers": "off",
            "no-ternary": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-use-before-define": "off",
            "one-var": "off",
            "sort-imports": "off",
            "unicorn/import-style": "off",
            "unicorn/no-array-callback-reference": "off",
            "unicorn/no-null": "off",
            "unicorn/prefer-at": "off",
            "unicorn/prefer-spread": "off",
            "unicorn/prevent-abbreviations": "off",
        },
    },
    {
        files: ["test/_internal/ruleTester.ts"],
        name: "ESLint Plugin Tests - internal helper filename",
        rules: {
            "unicorn/filename-case": "off",
        },
    },
    // #endregion
    // #region 🧪 Tests
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: 🧪 Tests
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "test/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
            "benchmarks/**/*.{ts,tsx,mts,cts,mjs,js,jsx,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                ...vitest.environments.env.globals,
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                createTypedRuleSelectorAwarePassThrough: "readonly",
                describe: "readonly",
                expect: "readonly",
                it: "readonly",
                NodeJS: "readonly",
                test: "readonly",
                vi: "readonly",
            },
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                project: "./tsconfig.eslint.json",
                sourceType: "module",
                tsconfigRootDir: repositoryRootPath,
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        name: "Tests test/**/*.{spec,test}.*.{TS,TSX,MTS,CTS,MJS,JS,JSX,CJS}",
        plugins:
            /** @type {Record<string, import("eslint").ESLint.Plugin>} */ ({
                "@typescript-eslint": asEslintPlugin(tseslint),
                "import-x": importX,
                n: nodePlugin,
                "no-only-tests": asEslintPlugin(pluginNoOnly),
                "testing-library": pluginTestingLibrary,
                unicorn: eslintPluginUnicorn,
                "unused-imports": pluginUnusedImports,
                vitest: vitest,
            }),
        rules: asRulesRecord({
            ...js.configs.all.rules,
            ...tseslint.configs["recommendedTypeChecked"],
            ...tseslint.configs["recommended"]?.rules,
            ...tseslint.configs["strictTypeChecked"],
            ...tseslint.configs["strict"]?.rules,
            ...tseslint.configs["stylisticTypeChecked"],
            ...tseslint.configs["stylistic"]?.rules,
            ...vitest.configs.all.rules,
            ...eslintPluginUnicorn.configs.all.rules,
            ...pluginTestingLibrary.configs["flat/react"].rules,
            "@jcoreio/implicit-dependencies/no-implicit": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-empty-function": "off", // Empty mocks/stubs are common
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "warn", // Allow explicit types for React components
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-restricted-types": "off", // Tests may need generic Function types
            "@typescript-eslint/no-shadow": "off",
            "@typescript-eslint/no-unsafe-function-type": "off", // Tests may use generic handlers
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-use-before-define": "off", // Allow use before define in tests
            "@typescript-eslint/no-useless-default-assignment": "warn",
            "@typescript-eslint/prefer-destructuring": "off",
            "@typescript-eslint/strict-void-return": "warn",
            "@typescript-eslint/unbound-method": "off",
            camelcase: "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern:
                        "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*|v8.*|c8.*|istanbul.*|nyc.*|codecov.*|coveralls.*|c8-coverage.*|codecov-coverage.*",
                },
            ],
            "class-methods-use-this": "off",
            complexity: "off",
            "default-case": "off",
            "dot-notation": "off",
            eqeqeq: "off", // Allow == and != in tests for flexibility
            "func-name-matching": "off", // Allow function names to not match variable names
            "func-names": "off",
            // Relaxed function rules for backend tests (explicit for clarity)
            "func-style": "off",
            "id-length": "off",
            "init-declarations": "off",
            "max-classes-per-file": "off",
            "max-depth": "off",
            "max-lines": "off",
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 2000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "max-statements": "off",
            "module-interop/no-import-cjs": "off",
            "new-cap": "off", // Allow new-cap for class constructors
            "no-await-in-loop": "off", // Allow await in loops for sequential operations
            "no-barrel-files/no-barrel-files": "off", // Allow barrel files in tests for convenience
            "no-console": "off",
            "no-duplicate-imports": "off", // Allow duplicate imports for test setups
            "no-inline-comments": "off",
            "no-loop-func": "off", // Allow functions in loops for test setups
            "no-magic-numbers": "off",
            "no-new": "off", // Allow new for class constructors
            // No Only Tests
            "no-only-tests/no-only-tests": "error",
            "no-plusplus": "off",
            "no-promise-executor-return": "off", // Allow returning values from promise executors
            "no-redeclare": "off", // Allow redeclaring variables in tests
            "no-shadow": "off",
            "no-ternary": "off",
            "no-throw-literal": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-underscore-dangle": "off",
            "no-use-before-define": "off", // Allow use before define in tests
            "no-useless-assignment": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prefer-destructuring": "off",
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sort-imports": "off",
            "sort-keys": "off",
            "testing-library/await-async-queries": "error",
            "testing-library/consistent-data-testid": [
                "warn",
                {
                    testIdAttribute: ["data-testid"],
                    testIdPattern:
                        "^[a-z]+([A-Z][a-z]+)*(-[a-z]+([A-Z][a-z]+)*)*$", // Kebab-case or camelCase
                },
            ],
            "testing-library/no-await-sync-queries": "error",
            "testing-library/no-debugging-utils": "off",
            "testing-library/no-node-access": "off",
            "testing-library/no-test-id-queries": "warn",
            "testing-library/prefer-explicit-assert": "warn",
            "testing-library/prefer-implicit-assert": "warn",
            "testing-library/prefer-query-matchers": "warn",
            "testing-library/prefer-screen-queries": "warn",
            "testing-library/prefer-user-event": "warn",
            "testing-library/prefer-user-event-setup": "warn",
            "unicorn/consistent-function-scoping": "off", // Tests often use different scoping
            "unicorn/filename-case": "off", // Allow test files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: {
                        fs: { default: false, named: true, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // crypto: disallow default imports, allow named + namespace
                        // (named is most common; namespace is sometimes handy)
                        // ─────────────────────────────────────────────────────────────
                        "node:crypto": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Filesystem: disallow default imports, but allow named + namespace
                        // (named is ergonomic; namespace is useful for vi.spyOn(fs, "..."))
                        // ─────────────────────────────────────────────────────────────
                        "node:fs": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        "node:fs/promises": {
                            default: false,
                            named: true,
                            namespace: true,
                        },
                        // ─────────────────────────────────────────────────────────────
                        // Node “path-like” modules: allow ONLY namespace imports
                        // (prevents `import path from "node:path"` which relies on default interop)
                        // ─────────────────────────────────────────────────────────────
                        "node:path": { default: false, namespace: true },
                        "node:path/posix": { default: false, namespace: true },
                        "node:path/win32": { default: false, namespace: true },
                        // ─────────────────────────────────────────────────────────────
                        // timers/promises: named is the common usage
                        // ─────────────────────────────────────────────────────────────
                        "node:timers/promises": { named: true },
                        // ─────────────────────────────────────────────────────────────
                        // util: keep unicorn’s intent (named only)
                        // ─────────────────────────────────────────────────────────────
                        "node:util": { named: true },
                        path: { default: false, namespace: true }, // Just in case any non-node: path remains
                        util: { named: true },
                    },
                },
            ],
            "unicorn/no-await-expression-member": "off", // Allow await in test expressions
            "unicorn/no-keyword-prefix": [
                "error",
                {
                    checkProperties: false,
                    disallowedPrefixes: [
                        "interface",
                        "type",
                        "enum",
                    ],
                },
            ], // Allow "class" prefix for className and other legitimate uses
            "unicorn/no-null": "off", // Null is common in test setups
            "unicorn/no-unused-properties": "off", // Allow unused properties in test setups
            "unicorn/no-useless-undefined": "off", // Allow undefined in test setups
            "unicorn/prefer-global-this": "off", // Allow globalThis for test setups
            "unicorn/prefer-optional-catch-binding": "off", // Allow optional catch binding for test flexibility
            "unicorn/prevent-abbreviations": "off", // Too many false positives in tests
            "vitest/max-expects": "off",
            // Needs update to not use deprecated alias methods like
            // Replace toThrow() with its canonical name oThrowError()
            "vitest/no-alias-methods": "off",
            "vitest/no-commented-out-tests": "warn",
            "vitest/no-conditional-expect": "warn",
            "vitest/no-disabled-tests": "warn",
            "vitest/no-focused-tests": "warn",
            "vitest/no-identical-title": "warn",
            "vitest/no-import-node-test": "warn",
            "vitest/no-interpolation-in-snapshots": "warn",
            "vitest/no-standalone-expect": "warn",
            "vitest/no-test-prefixes": "warn",
            "vitest/prefer-called-exactly-once-with": "warn",
            "vitest/prefer-called-once": "warn",
            // Conflicts with `prefer-called-once` for `.toHaveBeenCalledTimes(1)`.
            // Keep the more specific once-only rule enabled.
            "vitest/prefer-called-times": "off",
            "vitest/prefer-called-with": "warn",
            "vitest/prefer-comparison-matcher": "warn",
            "vitest/prefer-describe-function-title": "warn",
            "vitest/prefer-expect-assertions": "warn",
            "vitest/prefer-expect-resolves": "warn",
            // Vitest's autofix currently rewrites to `expectTypeOf(...).toBeFunction()`
            // which does not typecheck with the current expect-type typings.
            "vitest/prefer-expect-type-of": "off",
            "vitest/prefer-mock-return-shorthand": "warn",
            "vitest/prefer-spy-on": "warn",
            "vitest/prefer-strict-boolean-matchers": "off",
            "vitest/prefer-strict-equal": "warn",
            "vitest/prefer-to-be": "warn",
            "vitest/prefer-to-be-falsy": "warn",
            "vitest/prefer-to-be-object": "warn",
            "vitest/prefer-to-be-truthy": "warn",
            "vitest/prefer-to-contain": "warn",
            "vitest/prefer-to-have-length": "warn",
            "vitest/prefer-todo": "warn",
            "vitest/prefer-vi-mocked": "warn",
            "vitest/require-hook": "off",
            "vitest/require-mock-type-parameters": "warn",
            "vitest/require-test-timeout": "off",
            "vitest/valid-expect": "warn",
            "vitest/valid-title": "warn",
            "vitest/warn-todo": "warn",
        }),
        settings: {
            "import-x/resolver": {
                node: true,
                project: ["./tsconfig.eslint.json"],
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: true,
            },
            "import/resolver": {
                // You will also need to install and configure the TypeScript resolver
                // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
                typescript: {
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    project: ["./tsconfig.eslint.json"],
                },
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
            vitest: {
                typecheck: true,
            },
        },
    },
    {
        files: ["src/index.ts"],
        name: "Public module boundary overrides",
        rules: {
            "canonical/filename-no-index": "off",
            "canonical/no-barrel-import": "off",
            "canonical/no-re-export": "off",
            "no-barrel-files/no-barrel-files": "off",
        },
    },
    {
        files: ["src/**/*.{ts,tsx,mts,cts}", "test/**/*.{ts,tsx,mts,cts}"],
        name: "Repository TypeScript authoring overrides",
        rules: {
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "tsdoc-require-2/require": "off",
        },
    },
    {
        files: ["test/**/*.{ts,tsx,mts,cts,js,mjs,cjs}"],
        name: "Node test runner overrides",
        rules: {
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "eslint-plugin/test-case-property-ordering": "off",
            "vitest/expect-expect": "off",
            "vitest/no-import-node-test": "off",
            "vitest/prefer-expect-assertions": "off",
            "vitest/prefer-importing-vitest-globals": "off",
            "vitest/require-top-level-describe": "off",
            "vitest/valid-title": "off",
        },
    },
    // #endregion
];
