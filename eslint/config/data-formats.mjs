// @ts-check
/** @typedef {import("eslint").Linter.Config} EslintConfig */

import {
    asRulesRecord,
    eslintPluginJsonc,
    eslintPluginToml,
    eslintPluginYml,
    html,
    htmlParser,
    json,
    jsonSchemaValidatorPlugins,
    jsonSchemaValidatorRules,
    jsoncEslintParser,
    markdown,
    noSecrets,
    nodeDependencies,
    packageJson,
    tomlEslintParser,
    yamlEslintParser,
} from "./shared.mjs";

/** @type {EslintConfig[]} */
export const dataFormatConfigs = [
    // #region 📦 Package.json Linting
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: Package.json Linting
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/package.json"],
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        name: "Package - **/Package.json",
        plugins: {
            json: json,
            "node-dependencies": nodeDependencies,
            "package-json": packageJson,
        },
        rules: {
            ...json.configs.recommended.rules,
            // NOTE: Keeping node-dependencies scoped to package.json avoids perf + parser issues.
            "node-dependencies/absolute-version": [
                "error",
                "never", // Or always
            ],
            // Can be noisy depending on how transitive deps declare engines.
            "node-dependencies/compat-engines": "off",
            "node-dependencies/no-deprecated": [
                "error",
                {
                    allows: ["prettier-plugin-packagejson"],
                    devDependencies: true,
                },
            ],
            "node-dependencies/no-dupe-deps": "error",
            "node-dependencies/no-restricted-deps": "off",
            "node-dependencies/prefer-caret-range-version": "error",
            "node-dependencies/prefer-tilde-range-version": "off",
            // This rule is currently not viable for most ecosystems (many packages
            // do not publish provenance metadata consistently).
            "node-dependencies/require-provenance-deps": "off",
            "node-dependencies/valid-semver": "error",
            // Package.json Plugin Rules (package-json/*)
            "package-json/bin-name-casing": "warn",
            "package-json/exports-subpaths-style": "warn",
            "package-json/no-empty-fields": "warn",
            "package-json/no-redundant-files": "warn",
            "package-json/no-redundant-publishConfig": "warn",
            "package-json/order-properties": "warn",
            "package-json/repository-shorthand": "warn",
            "package-json/require-attribution": "warn",
            "package-json/require-author": "warn",
            // Not a CLI package.
            "package-json/require-bin": "off",
            "package-json/require-bugs": "warn",
            "package-json/require-bundleDependencies": "off",
            // Optional metadata for this repository.
            "package-json/require-contributors": "warn",
            "package-json/require-cpu": "off",
            "package-json/require-dependencies": "warn",
            "package-json/require-description": "warn",
            "package-json/require-devDependencies": "warn",
            // Optional and currently uncommon metadata field.
            "package-json/require-devEngines": "warn",
            // Legacy npm field, not needed for this plugin package.
            "package-json/require-directories": "off",
            "package-json/require-engines": "warn",
            "package-json/require-exports": [
                "error",
                {
                    ignorePrivate: true,
                },
            ],
            "package-json/require-files": "warn",
            // Optional for this project.
            "package-json/require-funding": "off",
            "package-json/require-homepage": "warn",
            "package-json/require-keywords": "warn",
            "package-json/require-license": "warn",
            "package-json/require-main": "warn",
            // Not a manpage-distributed package.
            "package-json/require-man": "off",
            "package-json/require-module": "off",
            "package-json/require-name": "warn",
            "package-json/require-optionalDependencies": "off",
            "package-json/require-os": "off",
            "package-json/require-packageManager": "warn",
            "package-json/require-peerDependencies": "warn",
            "package-json/require-private": "warn",
            "package-json/require-publishConfig": "warn",
            "package-json/require-repository": "error",
            "package-json/require-scripts": "warn",
            "package-json/require-sideEffects": "warn",
            "package-json/require-type": [
                "error",
                {
                    ignorePrivate: true,
                },
            ],
            "package-json/require-types": [
                "error",
                {
                    ignorePrivate: true,
                },
            ],
            "package-json/require-version": "warn",
            "package-json/restrict-dependency-ranges": "warn",
            "package-json/restrict-private-properties": "warn",
            // This repo intentionally uses stable camelCase script names.
            "package-json/scripts-name-casing": "warn",
            "package-json/sort-collections": [
                "warn",
                [
                    "config",
                    "dependencies",
                    "devDependencies",
                    "exports",
                    "optionalDependencies",
                    // "overrides",
                    "peerDependencies",
                    "peerDependenciesMeta",
                    "scripts",
                ],
            ],
            "package-json/specify-peers-locally": "warn",
            "package-json/unique-dependencies": "warn",
            "package-json/valid-author": "warn",
            "package-json/valid-bin": "warn",
            "package-json/valid-bugs": "warn",
            "package-json/valid-bundleDependencies": "warn",
            "package-json/valid-config": "warn",
            "package-json/valid-contributors": "warn",
            "package-json/valid-cpu": "warn",
            "package-json/valid-dependencies": "warn",
            "package-json/valid-description": "warn",
            "package-json/valid-devDependencies": "warn",
            "package-json/valid-devEngines": "warn",
            "package-json/valid-directories": "warn",
            "package-json/valid-engines": "warn",
            "package-json/valid-exports": "warn",
            "package-json/valid-files": "warn",
            "package-json/valid-funding": "warn",
            "package-json/valid-homepage": "warn",
            "package-json/valid-keywords": "warn",
            "package-json/valid-license": "warn",
            "package-json/valid-main": "warn",
            "package-json/valid-man": "warn",
            "package-json/valid-module": "warn",
            "package-json/valid-name": "warn",
            "package-json/valid-optionalDependencies": "warn",
            "package-json/valid-os": "warn",
            // Deprecated upstream rule; retained as explicit off until removed.
            "package-json/valid-package-definition": "off",
            "package-json/valid-packageManager": "warn",
            "package-json/valid-peerDependencies": "warn",
            "package-json/valid-private": "warn",
            "package-json/valid-publishConfig": "warn",
            "package-json/valid-repository": "warn",
            "package-json/valid-repository-directory": "warn",
            "package-json/valid-scripts": "warn",
            "package-json/valid-sideEffects": "warn",
            "package-json/valid-type": "warn",
            "package-json/valid-version": "warn",
            "package-json/valid-workspaces": "warn",
        },
    },
    {
        files: ["docs/docusaurus/package.json"],
        name: "Package - docs docusaurus private override",
        rules: {
            "package-json/restrict-private-properties": "off",
        },
    },
    // #endregion
    // #region 📝 Markdown files (with Remark linting)
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: Markdown (md/*, markdown/*, markup/*, atom/*, rss/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{md,markup,atom,rss,markdown}"],
        ignores: [
            "**/docs/packages/**",
            "**/docs/TSDoc/**",
            "**/.github/agents/**",
        ],
        language: "markdown/gfm",
        name: "MD - **/*.{MD,MARKUP,ATOM,RSS,MARKDOWN} (with Remark)",
        plugins: {
            markdown: markdown,
        },
        rules: {
            "markdown/fenced-code-language": "warn",
            "markdown/fenced-code-meta": ["warn", "never"],
            "markdown/heading-increment": "warn",
            "markdown/no-bare-urls": "warn",
            "markdown/no-duplicate-definitions": "warn",
            "markdown/no-duplicate-headings": "warn",
            "markdown/no-empty-definitions": "warn",
            "markdown/no-empty-images": "warn",
            "markdown/no-empty-links": "warn",
            "markdown/no-html": "off",
            "markdown/no-invalid-label-refs": "warn",
            "markdown/no-missing-atx-heading-space": "warn",
            "markdown/no-missing-label-refs": "warn",
            "markdown/no-missing-link-fragments": "warn",
            "markdown/no-multiple-h1": "warn",
            "markdown/no-reference-like-urls": "warn",
            "markdown/no-reversed-media-syntax": "warn",
            "markdown/no-space-in-emphasis": "warn",
            "markdown/no-unused-definitions": "warn",
            "markdown/require-alt-text": "warn",
            "markdown/table-column-count": "warn",
        },
    },
    // #endregion
    // #region 🧾 YAML/YML files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: YAML/YML files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{yaml,yml}"],
        ignores: [],
        language: "yml/yaml",
        languageOptions: {
            parser: yamlEslintParser,
            // Options used with yaml-eslint-parser.
            parserOptions: {
                defaultYAMLVersion: "1.2",
            },
        },
        name: "YAML/YML - **/*.{YAML,YML}",
        plugins: {
            ...jsonSchemaValidatorPlugins,
            yml: eslintPluginYml,
        },
        rules: asRulesRecord({
            ...jsonSchemaValidatorRules,
            "yml/block-mapping": "warn",
            "yml/block-mapping-colon-indicator-newline": "error",
            "yml/block-mapping-question-indicator-newline": "error",
            "yml/block-sequence": "warn",
            "yml/block-sequence-hyphen-indicator-newline": "error",
            "yml/file-extension": "off",
            "yml/flow-mapping-curly-newline": "error",
            "yml/flow-mapping-curly-spacing": "error",
            "yml/flow-sequence-bracket-newline": "error",
            "yml/flow-sequence-bracket-spacing": "error",
            "yml/indent": "off",
            "yml/key-name-casing": "off",
            "yml/key-spacing": "error",
            "yml/no-empty-document": "error",
            "yml/no-empty-key": "error",
            "yml/no-empty-mapping-value": "error",
            "yml/no-empty-sequence-entry": "error",
            "yml/no-irregular-whitespace": "error",
            "yml/no-multiple-empty-lines": "error",
            "yml/no-tab-indent": "error",
            "yml/no-trailing-zeros": "error",
            "yml/plain-scalar": "off",
            "yml/quotes": "error",
            "yml/require-string-key": "error",
            // Re-enabled: eslint-plugin-yml v2.0.1 fixes the diff-sequences
            // import crash (TypeError: diff is not a function).
            "yml/sort-keys": "error",
            "yml/sort-sequence-values": "off",
            "yml/spaced-comment": "warn",
            "yml/vue-custom-block/no-parsing-error": "warn",
        }),
    },
    // #endregion
    // #region 🌐 HTML files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: HTML files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{html,htm,xhtml}"],
        ignores: ["report/**"],
        languageOptions: {
            parser: htmlParser,
        },
        name: "HTML - **/*.{HTML,HTM,XHTML}",
        plugins: {
            html: html,
        },
        rules: {
            ...html.configs.recommended.rules,
            "html/class-spacing": "warn",
            "html/css-no-empty-blocks": "warn",
            "html/head-order": "warn",
            "html/id-naming-convention": "warn",
            "html/indent": "error",
            "html/lowercase": "warn",
            "html/max-element-depth": "warn",
            "html/no-abstract-roles": "warn",
            "html/no-accesskey-attrs": "warn",
            "html/no-aria-hidden-body": "warn",
            "html/no-aria-hidden-on-focusable": "warn",
            "html/no-duplicate-class": "warn",
            "html/no-empty-headings": "warn",
            "html/no-extra-spacing-attrs": [
                "error",
                { enforceBeforeSelfClose: true },
            ],
            "html/no-extra-spacing-text": "warn",
            "html/no-heading-inside-button": "warn",
            "html/no-ineffective-attrs": "warn",
            // HTML Eslint Plugin Rules (html/*)
            "html/no-inline-styles": "warn",
            "html/no-invalid-attr-value": "warn",
            "html/no-invalid-entity": "warn",
            "html/no-invalid-role": "warn",
            "html/no-multiple-empty-lines": "warn",
            "html/no-nested-interactive": "warn",
            "html/no-non-scalable-viewport": "warn",
            "html/no-positive-tabindex": "warn",
            "html/no-redundant-role": "warn",
            "html/no-restricted-attr-values": "warn",
            "html/no-restricted-attrs": "warn",
            "html/no-restricted-tags": "warn",
            "html/no-script-style-type": "warn",
            "html/no-skip-heading-levels": "warn",
            "html/no-target-blank": "warn",
            "html/no-trailing-spaces": "warn",
            "html/no-whitespace-only-children": "warn",
            "html/prefer-https": "warn",
            "html/require-attrs": "warn",
            "html/require-button-type": "warn",
            "html/require-closing-tags": "off",
            "html/require-details-summary": "warn",
            "html/require-explicit-size": "warn",
            "html/require-form-method": "warn",
            "html/require-frame-title": "warn",
            "html/require-input-label": "warn",
            "html/require-meta-charset": "warn",
            "html/require-meta-description": "warn",
            "html/require-meta-viewport": "warn",
            "html/require-open-graph-protocol": "warn",
            "html/sort-attrs": "warn",
        },
    },
    // #endregion
    // #region 🧾 JSONC/JSON files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: JSONC (jsonc/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.jsonc", ".vscode/*.json"],
        ignores: [],
        name: "JSONC - **/*.JSONC",
        // ═══════════════════════════════════════════════════════════════════════════════
        // Plugin Config for eslint-plugin-jsonc to enable Prettier formatting
        // ═══════════════════════════════════════════════════════════════════════════════
        ...eslintPluginJsonc.configs["flat/prettier"][0],
        language: "json/jsonc",
        languageOptions: {
            parser: jsoncEslintParser,
            parserOptions: { jsonSyntax: "JSON" },
        },
        plugins: {
            json: json,
            jsonc: eslintPluginJsonc,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: {
            ...json.configs.recommended.rules,
            "jsonc/array-bracket-newline": "warn",
            "jsonc/array-bracket-spacing": "warn",
            "jsonc/array-element-newline": "off", // Handled by Prettier
            "jsonc/auto": "warn",
            "jsonc/comma-dangle": "warn",
            "jsonc/comma-style": "warn",
            "jsonc/indent": "off", // Handled by Prettier
            "jsonc/key-name-casing": "off",
            "jsonc/key-spacing": "warn",
            "jsonc/no-bigint-literals": "warn",
            "jsonc/no-binary-expression": "warn",
            "jsonc/no-binary-numeric-literals": "warn",
            "jsonc/no-comments": "warn",
            "jsonc/no-dupe-keys": "warn",
            "jsonc/no-escape-sequence-in-identifier": "warn",
            "jsonc/no-floating-decimal": "warn",
            "jsonc/no-hexadecimal-numeric-literals": "warn",
            "jsonc/no-infinity": "warn",
            "jsonc/no-irregular-whitespace": "warn",
            "jsonc/no-multi-str": "warn",
            "jsonc/no-nan": "warn",
            "jsonc/no-number-props": "warn",
            "jsonc/no-numeric-separators": "warn",
            "jsonc/no-octal": "warn",
            "jsonc/no-octal-escape": "warn",
            "jsonc/no-octal-numeric-literals": "warn",
            "jsonc/no-parenthesized": "warn",
            "jsonc/no-plus-sign": "warn",
            "jsonc/no-regexp-literals": "warn",
            "jsonc/no-sparse-arrays": "warn",
            "jsonc/no-template-literals": "warn",
            "jsonc/no-undefined-value": "warn",
            "jsonc/no-unicode-codepoint-escapes": "warn",
            "jsonc/no-useless-escape": "warn",
            "jsonc/object-curly-newline": "warn",
            "jsonc/object-curly-spacing": "warn",
            "jsonc/object-property-newline": "warn",
            "jsonc/quote-props": "warn",
            "jsonc/quotes": "warn",
            "jsonc/sort-array-values": [
                "error",
                {
                    order: { type: "asc" },
                    pathPattern: "^files$", // Hits the files property
                },
                {
                    order: [
                        "eslint",
                        "eslintplugin",
                        "eslint-plugin",
                        {
                            // Fallback order
                            order: { type: "asc" },
                        },
                    ],
                    pathPattern: "^keywords$", // Hits the keywords property
                },
            ],
            "jsonc/sort-keys": [
                "error",
                // For example, a definition for package.json
                {
                    order: [
                        "name",
                        "version",
                        "private",
                        "publishConfig",
                        // ...
                    ],
                    pathPattern: "^$", // Hits the root properties
                },
                {
                    order: { type: "asc" },
                    pathPattern:
                        "^(?:dev|peer|optional|bundled)?[Dd]ependencies$",
                },
                // ...
            ],
            "jsonc/space-unary-ops": "warn",
            "jsonc/valid-json-number": "warn",
            "jsonc/vue-custom-block/no-parsing-error": "warn",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        },
    },
    // #endregion
    // #region 🧾 JSON files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: JSON (json/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.json"],
        // Package.json has a dedicated config block above that uses jsonc-eslint-parser
        // (needed for some package.json-specific tooling rules).
        ignores: ["**/package.json"],
        language: "json/json",
        name: "JSON - **/*.JSON",
        plugins: {
            json: json,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: asRulesRecord({
            ...json.configs.recommended.rules,
            ...jsonSchemaValidatorRules,
            "json/sort-keys": ["warn"],
            "json/top-level-interop": "warn",
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        }),
    },
    // #endregion
    // #region 🧾 JSON5 files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: JSON5 (json5/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.json5"],
        language: "json/json5",
        name: "JSON5 - **/*.JSON5",
        plugins: {
            json: json,
            ...jsonSchemaValidatorPlugins,
            "no-secrets": noSecrets,
        },
        rules: asRulesRecord({
            ...json.configs.recommended.rules,
            ...jsonSchemaValidatorRules,
            "no-secrets/no-pattern-match": "off",
            "no-secrets/no-secrets": [
                "error",
                {
                    tolerance: 5,
                },
            ],
        }),
    },
    // #endregion
    // #region 🧾 TOML files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: TOML (toml/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.toml"],
        ignores: ["lychee.toml"],
        languageOptions: {
            parser: tomlEslintParser,
            parserOptions: { tomlVersion: "1.0.0" },
        },
        name: "TOML - **/*.TOML",
        plugins: { toml: eslintPluginToml },
        rules: {
            // TOML Eslint Plugin Rules (toml/*)
            "toml/array-bracket-newline": "warn",
            "toml/array-bracket-spacing": "warn",
            "toml/array-element-newline": "warn",
            "toml/comma-style": "warn",
            "toml/indent": "off",
            "toml/inline-table-curly-newline": "warn",
            "toml/inline-table-curly-spacing": "warn",
            "toml/inline-table-key-value-newline": "warn",
            "toml/key-spacing": "off",
            "toml/keys-order": "warn",
            "toml/no-mixed-type-in-array": "warn",
            "toml/no-non-decimal-integer": "warn",
            "toml/no-space-dots": "warn",
            "toml/no-unreadable-number-separator": "warn",
            "toml/padding-line-between-pairs": "warn",
            "toml/padding-line-between-tables": "warn",
            "toml/precision-of-fractional-seconds": "warn",
            "toml/precision-of-integer": "warn",
            "toml/quoted-keys": "warn",
            "toml/spaced-comment": "warn",
            "toml/table-bracket-spacing": "warn",
            "toml/tables-order": "warn",
            "toml/vue-custom-block/no-parsing-error": "warn",
        },
    },
    // #endregion
];
