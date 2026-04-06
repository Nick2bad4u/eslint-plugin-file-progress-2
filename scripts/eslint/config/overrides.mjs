// @ts-check
/** @typedef {import("eslint").Linter.Config} EslintConfig */

import {
    noSecrets,
    nounsanitized,
    pluginCanonical,
    stylistic,
} from "./shared.mjs";

/** @type {EslintConfig[]} */
export const overrideConfigs = [
    {
        files: ["eslint/config/shared.mjs"],
        name: "ESLint config shared module overrides",
        rules: {
            "no-barrel-files/no-barrel-files": "off",
        },
    },
    // #region 🤖 GitHub Workflows YAML/YML
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: Github Workflows YAML/YML
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/.github/workflows/**/*.{yaml,yml}",
            "config/tools/flatpak-build.yml",
            "**/dependabot.yml",
            "**/.spellcheck.yml",
            "**/.pre-commit-config.yaml",
        ],
        name: "YAML/YML GitHub Workflows - Disables",
        rules: {
            "yml/block-mapping-colon-indicator-newline": "off",
            "yml/no-empty-key": "off",
            "yml/no-empty-mapping-value": "off",
            "yml/sort-keys": "off",
        },
    },
    // #endregion
    // #region 📴 Disables
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: Disables
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/package.json", "**/package-lock.json"],
        name: "JSON: Files - Disables",
        rules: {
            "json/sort-keys": "off",
        },
    },
    {
        files: ["**/.vscode/**"],
        name: "VS Code Files - Disables",
        rules: {
            "jsonc/array-bracket-newline": "off",
        },
    },
    // #endregion
    // #region 📐 @Stylistic Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: @Stylistic Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/**"],
        name: "Global: Stylistic Overrides",
        plugins: {
            "@stylistic": stylistic,
        },
        rules: {
            "@stylistic/curly-newline": "off",
            "@stylistic/exp-jsx-props-style": "off",
            "@stylistic/exp-list-style": "off",
            "@stylistic/jsx-curly-brace-presence": "off",
            "@stylistic/jsx-function-call-newline": "off",
            "@stylistic/jsx-pascal-case": "off",
            "@stylistic/jsx-self-closing-comp": "off",
            "@stylistic/line-comment-position": "off",
            "@stylistic/lines-between-class-members": "off",
            "@stylistic/multiline-comment-style": "off",
            "@stylistic/padding-line-between-statements": "off",
            "@stylistic/spaced-comment": [
                "error",
                "always",
                {
                    exceptions: ["-", "+"],
                },
            ],
        },
    },
    // #endregion
    // #region 🛠️ Global Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: Global Overrides
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Global: Globals",
        plugins: {
            canonical: pluginCanonical,
            "no-secrets": noSecrets,
            "no-unsanitized": nounsanitized,
        },
        rules: {
            "callback-return": "off",
            camelcase: "off",
            "canonical/destructuring-property-newline": "off",
            "canonical/export-specifier-newline": "off",
            "canonical/import-specifier-newline": "off",
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
            "depend/ban-dependencies": "off",
            "dot-notation": "off",
            // Deprecated rules - to be removed in future
            "id-length": "off",
            "max-classes-per-file": "off",
            "max-lines": "off",
            // Sonar quality helpers
            "max-lines-per-function": [
                "error",
                {
                    IIFEs: false,
                    max: 1000,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],
            "max-params": "off",
            "no-console": "off",
            "no-debugger": "error",
            "no-duplicate-imports": [
                "error",
                {
                    allowSeparateTypeImports: true,
                },
            ],
            "no-empty-character-class": "error",
            "no-inline-comments": "off",
            "no-invalid-regexp": "error",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-unexpected-multiline": "error",
            "no-unsanitized/method": "error",
            "no-unsanitized/property": "error",
            "no-useless-backreference": "error",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "prettier/prettier": "off", // Using in Prettier directly for less noise for AI
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sonarjs/different-types-comparison": "off",
        },
    },
    {
        files: [
            "**/*.test.{ts,tsx}",
            "**/*.spec.{ts,tsx}",
            "src/test/**/*.{ts,tsx}",
            "tests/**/*.{ts,tsx}",
        ],
        name: "Tests: relax strict void rules",
        rules: {
            // This rule is extremely noisy in tests (especially property-based
            // tests) where callback return values are often incidental.
            "@typescript-eslint/strict-void-return": "off",
        },
    },
    {
        files: [
            "benchmarks/**/*.{ts,tsx}",
            "scripts/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}",
        ],
        name: "Benchmarks/Scripts: relax strict void rules",
        rules: {
            // Benchmarks frequently return measurement values from callbacks.
            // Scripts commonly use void/Promise-returning callbacks where the
            // return value is intentionally ignored.
            "@typescript-eslint/strict-void-return": "off",
        },
    },
    {
        files: [
            "eslint.config.mjs",
            "eslint/config/**/*.{js,mjs,cjs,ts,mts,cts}",
            "src/**/*.{ts,tsx,mts,cts,js,mjs,cjs}",
        ],
        name: "Source runtime logging policy",
        rules: {
            // Runtime/library code should not emit console output.
            "no-console": "error",
            // Keep explicit in source scope even though this is also configured
            // globally for defense-in-depth.
            "no-debugger": "error",
        },
    },
    // #endregion
];
