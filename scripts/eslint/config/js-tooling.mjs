// @ts-check
/** @typedef {import("eslint").Linter.Config} EslintConfig */

import {
    asEslintPlugin,
    asRulesRecord,
    capitalizedCommentsIgnorePattern,
    depend,
    eslintPluginMath,
    eslintPluginUnicorn,
    globals,
    importX,
    js,
    jsdocPlugin,
    nodeImportStyleStyles,
    nodePlugin,
    nounsanitized,
    perfectionist,
    pluginPrettier,
    pluginPromise,
    pluginRedos,
    pluginRegexp,
    pluginSecurity,
    pluginUnusedImports,
    sonarjs,
    sonarjsConfigs,
    tseslint,
} from "./shared.mjs";

/** @type {EslintConfig[]} */
export const jsToolingConfigs = [
    // #region 📚 JS JsDoc
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: JS JsDoc
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["scripts/**/*.{js,cjs,mjs}"],
        languageOptions: {
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
            },
        },
        name: "JS JSDoc - **/*.{JS,CJS,MJS}",
        plugins: {
            jsdoc: jsdocPlugin,
        },
        rules: {
            // Start from upstream defaults for JS so new recommended rules are
            // picked up automatically when eslint-plugin-jsdoc updates.
            ...jsdocPlugin.configs["flat/recommended"].rules,
            "jsdoc/check-access": "warn", // Recommended
            "jsdoc/check-alignment": "warn", // Recommended
            "jsdoc/check-indentation": "off",
            "jsdoc/check-line-alignment": "off",
            "jsdoc/check-param-names": "warn", // Recommended
            "jsdoc/check-property-names": "warn", // Recommended
            "jsdoc/check-syntax": "warn",
            "jsdoc/check-tag-names": "off", // Recommended
            "jsdoc/check-template-names": "warn",
            "jsdoc/check-types": "warn", // Recommended
            "jsdoc/check-values": "warn", // Recommended
            "jsdoc/convert-to-jsdoc-comments": "warn",
            "jsdoc/empty-tags": "warn", // Recommended
            "jsdoc/escape-inline-tags": "warn", // Recommended for TS configs
            "jsdoc/implements-on-classes": "warn", // Recommended
            "jsdoc/imports-as-dependencies": "warn",
            "jsdoc/informative-docs": "off",
            "jsdoc/lines-before-block": "warn",
            "jsdoc/match-description": "off",
            "jsdoc/match-name": "off",
            "jsdoc/multiline-blocks": "warn", // Recommended
            "jsdoc/no-bad-blocks": "warn",
            "jsdoc/no-blank-block-descriptions": "warn",
            "jsdoc/no-blank-blocks": "off",
            "jsdoc/no-defaults": "warn", // Recommended
            "jsdoc/no-missing-syntax": "off",
            "jsdoc/no-multi-asterisks": "warn", // Recommended
            "jsdoc/no-restricted-syntax": "off",
            "jsdoc/no-types": "off", // Recommended for TS configs
            "jsdoc/no-undefined-types": "off", // Too noisy for tooling scripts
            "jsdoc/prefer-import-tag": "off",
            "jsdoc/reject-any-type": "off",
            "jsdoc/reject-function-type": "off",
            "jsdoc/require-asterisk-prefix": "warn",
            "jsdoc/require-description": "off",
            "jsdoc/require-description-complete-sentence": "off",
            "jsdoc/require-example": "off",
            "jsdoc/require-file-overview": "off",
            "jsdoc/require-hyphen-before-param-description": "warn",
            "jsdoc/require-jsdoc": "warn", // Recommended
            "jsdoc/require-next-description": "warn",
            "jsdoc/require-next-type": "warn", // Recommended
            "jsdoc/require-param": "off", // Too noisy for tooling scripts
            "jsdoc/require-param-description": "off", // Too noisy for tooling scripts
            "jsdoc/require-param-name": "warn", // Recommended
            "jsdoc/require-param-type": "off",
            "jsdoc/require-property": "warn", // Recommended
            "jsdoc/require-property-description": "warn", // Recommended
            "jsdoc/require-property-name": "warn", // Recommended
            "jsdoc/require-property-type": "warn", // Recommended in non-TS configs
            "jsdoc/require-rejects": "off", // Too noisy for tooling scripts
            "jsdoc/require-returns": "off", // Too noisy for tooling scripts
            "jsdoc/require-returns-check": "warn", // Recommended
            "jsdoc/require-returns-description": "off", // Too noisy for tooling scripts
            "jsdoc/require-returns-type": "off",
            "jsdoc/require-tags": "off",
            "jsdoc/require-template": "warn",
            "jsdoc/require-template-description": "warn",
            "jsdoc/require-throws": "off",
            "jsdoc/require-throws-description": "warn",
            "jsdoc/require-throws-type": "off",
            "jsdoc/require-yields": "warn", // Recommended
            "jsdoc/require-yields-check": "warn", // Recommended
            "jsdoc/require-yields-description": "warn",
            "jsdoc/require-yields-type": "warn", // Recommended
            "jsdoc/sort-tags": "off",
            "jsdoc/tag-lines": "off", // Recommended
            "jsdoc/text-escaping": [
                "warn",
                {
                    escapeHTML: true,
                },
            ],
            "jsdoc/ts-method-signature-style": "warn",
            "jsdoc/ts-no-empty-object-type": "warn",
            "jsdoc/ts-no-unnecessary-template-expression": "warn",
            "jsdoc/ts-prefer-function-type": "warn",
            "jsdoc/type-formatting": [
                "off",
                {
                    enableFixer: false,
                    objectFieldIndent: "  ",
                },
            ],
            "jsdoc/valid-types": "off", // Tooling scripts frequently use TS-style imports/types
            // "jsdoc/check-examples": "warn", // Deprecated and not for ESLint >= 8
            // "jsdoc/rejct-any-type": "warn", // broken
        },
        settings: {
            jsdoc: {
                // JS files in this repo use classic JSDoc.
                mode: "jsdoc",
            },
        },
    },
    // #endregion
    // #region 🧾 JS/MJS Configuration files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: JS/MJS Configuration files
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "**/*.config.{js,mjs,cts,cjs}",
            "**/*.config.**.*.{js,mjs,cts,cjs}",
            "eslint.config.mjs",
            "eslint/config/**/*.{js,mjs,cts,cjs}",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
            },
        },
        name: "JS/MJS Config - **/*.config.{JS,MJS,CTS,CJS}",
        plugins:
            /** @type {Record<string, import("eslint").ESLint.Plugin>} */ ({
                "@typescript-eslint": asEslintPlugin(tseslint),
                // Css: css,
                depend: asEslintPlugin(depend),
                "import-x": importX,
                js: js,
                math: asEslintPlugin(eslintPluginMath),
                n: nodePlugin,
                "no-unsanitized": asEslintPlugin(nounsanitized),
                perfectionist: perfectionist,
                prettier: asEslintPlugin(pluginPrettier),
                promise: asEslintPlugin(pluginPromise),
                redos: asEslintPlugin(pluginRedos),
                regexp: asEslintPlugin(pluginRegexp),
                security: pluginSecurity,
                sonarjs: asEslintPlugin(sonarjs),
                unicorn: eslintPluginUnicorn,
                "unused-imports": pluginUnusedImports,
            }),
        rules: asRulesRecord({
            ...js.configs.all.rules,
            ...pluginRegexp.configs.all.rules,
            ...importX.flatConfigs.recommended.rules,
            ...importX.flatConfigs.electron.rules,
            ...importX.flatConfigs.typescript.rules,
            ...pluginPromise.configs["flat/recommended"].rules,
            ...eslintPluginUnicorn.configs.all.rules,
            ...sonarjsConfigs.recommended.rules,
            ...perfectionist.configs["recommended-natural"].rules,
            ...pluginRedos.configs.recommended?.rules,
            ...pluginSecurity.configs.recommended.rules,
            ...nodePlugin.configs["flat/recommended"].rules,
            ...eslintPluginMath.configs.recommended.rules,

            camelcase: "off",
            "capitalized-comments": [
                "error",
                "always",
                {
                    ignoreConsecutiveComments: true,
                    ignoreInlineComments: true,
                    ignorePattern: capitalizedCommentsIgnorePattern,
                },
            ],
            "class-methods-use-this": "off",
            "dot-notation": "off",
            "func-style": "off",
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
            "max-statements": "off",
            "no-console": "off",
            "no-inline-comments": "off",
            "no-magic-numbers": "off",
            "no-plusplus": "off",
            "no-ternary": "off",
            "no-undef-init": "off",
            "no-undefined": "off",
            "no-void": "off",
            "object-shorthand": "off",
            "one-var": "off",
            "perfectionist/sort-arrays": [
                "off",
                {
                    customGroups: [],
                    fallbackSort: { type: "unsorted" },
                    groups: ["literal"],
                    ignoreCase: true,
                    newlinesBetween: "ignore",
                    newlinesInside: "ignore",
                    order: "asc",
                    partitionByNewLine: false,
                    specialCharacters: "keep",
                    type: "natural",
                    useConfigurationIf: {
                        matchesAstSelector: "TSAsExpression > ArrayExpression",
                    },
                },
            ],
            "prefer-arrow-callback": [
                "warn",
                { allowNamedFunctions: true, allowUnboundThis: true },
            ],
            "require-await": "off",
            "require-unicode-regexp": "off",
            "sonarjs/arguments-usage": "warn",
            "sonarjs/array-constructor": "warn",
            "sonarjs/aws-iam-all-resources-accessible": "warn",
            "sonarjs/cognitive-complexity": ["warn", 30],
            "sonarjs/comment-regex": "warn",
            "sonarjs/declarations-in-global-scope": "off",
            "sonarjs/elseif-without-else": "off",
            "sonarjs/for-in": "warn",
            "sonarjs/nested-control-flow": "off",
            "sonarjs/no-built-in-override": "warn",
            "sonarjs/no-collapsible-if": "warn",
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-for-in-iterable": "warn",
            "sonarjs/no-function-declaration-in-block": "warn",
            "sonarjs/no-implicit-dependencies": "warn",
            "sonarjs/no-inconsistent-returns": "warn",
            "sonarjs/no-incorrect-string-concat": "warn",
            "sonarjs/no-nested-incdec": "warn",
            "sonarjs/no-nested-switch": "warn",
            "sonarjs/no-reference-error": "warn",
            "sonarjs/no-require-or-define": "warn",
            "sonarjs/no-return-type-any": "warn",
            "sonarjs/no-sonar-comments": "error",
            "sonarjs/no-undefined-assignment": "off",
            "sonarjs/no-unused-function-argument": "warn",
            "sonarjs/non-number-in-arithmetic-expression": "warn",
            "sonarjs/operation-returning-nan": "warn",
            "sonarjs/prefer-immediate-return": "warn",
            "sonarjs/shorthand-property-grouping": "off",
            "sonarjs/strings-comparison": "warn",
            "sonarjs/too-many-break-or-continue-in-loop": "warn",
            "sort-imports": "off",
            "sort-keys": "off",
            "unicorn/consistent-function-scoping": "off", // Configs often use different scoping
            "unicorn/filename-case": "off", // Allow config files to have any case
            "unicorn/import-style": [
                "error",
                {
                    styles: nodeImportStyleStyles,
                },
            ],
            "unicorn/no-await-expression-member": "off", // Allow await in config expressions
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
            "unicorn/no-null": "off", // Null is common in config setups
            "unicorn/no-unused-properties": "off", // Allow unused properties in config setups
            "unicorn/no-useless-undefined": "off", // Allow undefined in config setups
            "unicorn/prevent-abbreviations": "off", // Too many false positives in configs
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": "error",
        }),
        settings: {
            "import-x/resolver": {
                node: true,
            },
            n: {
                allowModules: [
                    "electron",
                    "node",
                    "electron-devtools-installer",
                ],
            },
        },
    },
    // #endregion
];
