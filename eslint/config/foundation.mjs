// @ts-check
/** @typedef {import("eslint").Linter.Config} EslintConfig */

import {
    arrayFunc,
    comments,
    copilot,
    createTypeScriptImportResolver,
    css,
    deMorgan,
    eslintPluginJsxA11y,
    eslintReactPlugin,
    etcMisc,
    fileProgressOverridesConfig,
    fileProgressPlugin,
    githubActions,
    gitignore,
    globalIgnores,
    globals,
    immutable,
    importX,
    nitpick,
    noBarrelFiles,
    pluginCasePolice,
    pluginCssModules,
    pluginDocusaurus,
    pluginTsdoc,
    pluginUndefinedCss,
    repositoryRootPath,
    sdl,
    tsdocRequire,
    tseslintParser,
    typefest,
    vite,
    vitest,
    writeGoodComments,
} from "./shared.mjs";

/** @type {EslintConfig[]} */
export const foundationConfigs = [
    globalIgnores([
        "**/CHANGELOG.md",
        ".remarkrc.mjs",
        "test/fixtures/**",
    ]),
    gitignore({
        name: "Global - .gitignore Rules",
        root: true,
        strict: true,
    }),
    // Stylistic.configs.customize({
    //     arrowParens: true,
    //     blockSpacing: true,
    //     braceStyle: "stroustrup",
    //     commaDangle: "always-multiline",
    //     experimental: true,
    //     // The following options are the default values
    //     indent: 4,
    //     jsx: true,
    //     pluginName: "@stylistic",
    //     quoteProps: "as-needed",
    //     quotes: 'double',
    //     semi: true,
    //     severity: "warn",
    //     // ...
    //   }),
    {
        // NOTE: In ESLint flat config, ignore-only entries are safest when
        // placed near the start of the config array.
        // ═══════════════════════════════════════════════════════════════════════════════
        // SECTION: Global Ignore Patterns
        // Add patterns here to ignore files and directories globally
        // ═══════════════════════════════════════════════════════════════════════════════
        ignores: [
            "**/**-instructions.md",
            "**/**.instructions.md",
            "**/**dist**/**",
            "**/.agentic-tools*",
            "**/.cache/**",
            "**/Coverage/**",
            "**/_ZENTASKS*",
            "**/chatproject.md",
            "**/coverage-results.json",
            "**/coverage/**",
            "**/dist-scripts/**",
            "**/dist/**",
            "**/*.css.d.ts",
            "**/*.module.css.d.ts",
            "**/html/**",
            "**/node_modules/**",
            "**/package-lock.json",
            "**/release/**",
            ".devskim.json",
            ".github/ISSUE_TEMPLATE/**",
            ".github/PULL_REQUEST_TEMPLATE/**",
            ".github/chatmodes/**",
            ".github/instructions/**",
            ".github/prompts/**",
            ".stryker-tmp/**",
            "**/CHANGELOG.md",
            "coverage-report.json",
            "config/testing/types/**/*.d.ts",
            "docs/Archive/**",
            "docs/Logger-Error-report.md",
            "docs/Packages/**",
            "docs/Reviews/**",
            "docs/docusaurus/.docusaurus/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/docs/**",
            "docs/docusaurus/static/eslint-inspector/**",
            "docs/docusaurus/static/stylelint-inspector/**",
            "docs/docusaurus/static/*-inspector/**",
            "report/**",
            "reports/**",
            "scripts/devtools-snippets/**",
            "playwright/reports/**",
            "playwright/test-results/**",
            "public/mockServiceWorker.js",
            "temp/**",
            ".temp/**",
        ],
        name: "Global: Ignore Patterns **/**",
    },
    // #endregion
    // #region 🧱 Base Flat Configs
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION:  Base Flat Configs
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        ...importX.flatConfigs.typescript,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Import-X TypeScript (code files only)",
    },
    fileProgressPlugin.configs["recommended-ci"],
    copilot.configs.all,
    sdl.configs.required,
    {
        ...githubActions.configs.all,
        files: [".github/workflows/*.{yml,yaml}"],
        name: "GitHub Actions workflows",
    },
    vite.configs.all,
    {
        ...immutable.configs.all,
        files: ["functional/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Immutable: functional (not used in this repo)",
    },
    {
        ...writeGoodComments.configs.all,
        files: ["src/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Write Good Comments: (not used in this repo)",
        rules: {
            "write-good-comments/inclusive-language-comments": "off",
            "write-good-comments/no-profane-comments": "off",
            "write-good-comments/readability-comments": "off",
            "write-good-comments/spellcheck-comments": "off",
            "write-good-comments/task-comment-format": "off",
            "write-good-comments/write-good-comments": "off",
        },
    },
    fileProgressOverridesConfig,
    {
        ...noBarrelFiles.flat,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "No barrel files (code files only)",
    },
    {
        ...nitpick.configs?.["recommended"],
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Nitpick recommended (code files only)",
    },
    {
        ...comments.recommended,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "ESLint comments recommended (code files only)",
    },
    {
        ...arrayFunc.configs.all,
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Array func all (code files only)",
    },
    deMorgan.configs.recommended,
    ...pluginCasePolice.configs.recommended,
    // ...jsdocPlugin.configs["examples-and-default-expressions"],
    // #endregion
    // #region 🧩 Custom Flat Configs
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION:  Github Config Rules
    // ═══════════════════════════════════════════════════════════════════════════════
    // NOTE:
    // `eslint-plugin-github` rules are written for JS/TS and assume the ESLint
    // rule context supports scope analysis (e.g. `context.getScope`). When
    // ESLint is linting non-JS languages (YAML via `yaml-eslint-parser`, TOML,
    // etc.), that API surface is not available and those rules can crash while
    // trying to bind missing methods.
    //
    // Scope GitHub rules to code files only so they never run on `.yml` like
    // `.codecov.yml`.
    // {
    //     ...github.getFlatConfigs().recommended,
    //     files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
    //     name: "GitHub: recommended (code files only)",
    // },
    // {
    //     ...github.getFlatConfigs().react,
    //     files: ["**/*.{jsx,tsx}"],
    //     name: "GitHub: react (jsx/tsx only)",
    // },
    // ...github.getFlatConfigs().typescript.map(
    //     /**
    //      * @param {EslintConfig} config
    //      */
    //     (config) => ({
    //     ...config,
    //     files: ["**/*.{ts,tsx,cts,mts}"],
    //     name: config.name
    //         ? `GitHub: typescript (${config.name})`
    //         : "GitHub: typescript (ts/tsx only)",
    //     })
    // ),
    // #endregion
    // #region 🧭 Custom Global Rules
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: Custom Global Rules
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        name: "Array conversion: prefer spread",
        rules: {
            // Conflicts with `unicorn/prefer-spread` and can cause circular
            // autofix loops. We prefer spread (`[...iterable]`) for iterables
            // and only reach for Array.from when we specifically need its
            // mapping function or array-like support.
            "array-func/prefer-array-from": "off",
        },
    },
    // #endregion
    // #region 🗣️ Global Language Options
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION:  Global Language Options
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...vitest.environments.env.globals,
                __dirname: "readonly",
                __filename: "readonly",
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                Buffer: "readonly",
                describe: "readonly",
                document: "readonly",
                expect: "readonly",
                global: "readonly",
                globalThis: "readonly",
                it: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly",
                test: "readonly",
                vi: "readonly",
                window: "readonly",
            },
        },
        name: "Global Language Options **/**",
    },
    {
        files: ["**/*.d.{ts,mts,cts}"],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                sourceType: "module",
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        name: "Type Declarations - TypeScript Parser",
    },
    // #endregion
    // #region 📃 TSDoc Setup
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: 📃 TSDoc (tsdoc/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.{ts,mts,cts,tsx}"],
        name: "TSDoc rules (TypeScript files)",
        plugins: {
            tsdoc: pluginTsdoc,
        },
        rules: {
            "tsdoc/syntax": "warn",
        },
    },
    {
        files: ["src/**/*.{ts,mts,cts,tsx}"],
        name: "TSDoc rules (TypeScript files)",
        plugins: {
            "tsdoc-require-2": tsdocRequire,
        },
        rules: {
            "tsdoc-require-2/require": "warn",
            "tsdoc-require-2/require-alpha": "off",
            "tsdoc-require-2/require-beta": "off",
            "tsdoc-require-2/require-decorator": "off",
            "tsdoc-require-2/require-default-value": "off",
            "tsdoc-require-2/require-deprecated": "off",
            "tsdoc-require-2/require-event-property": "off",
            "tsdoc-require-2/require-example": "off",
            "tsdoc-require-2/require-experimental": "off",
            "tsdoc-require-2/require-inherit-doc": "off",
            "tsdoc-require-2/require-internal": "off",
            "tsdoc-require-2/require-label": "off",
            "tsdoc-require-2/require-link": "off",
            "tsdoc-require-2/require-override": "off",
            "tsdoc-require-2/require-package-documentation": "off",
            "tsdoc-require-2/require-param": "off",
            "tsdoc-require-2/require-private-remarks": "off",
            "tsdoc-require-2/require-public": "off",
            "tsdoc-require-2/require-readonly": "off",
            "tsdoc-require-2/require-remarks": "off",
            "tsdoc-require-2/require-returns": "off",
            "tsdoc-require-2/require-sealed": "off",
            "tsdoc-require-2/require-see": "off",
            "tsdoc-require-2/require-throws": "off",
            "tsdoc-require-2/require-type-param": "off",
            "tsdoc-require-2/require-virtual": "off",
        },
    },
    // #endregion
    // #region 🎨 CSS files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: CSS (css/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["**/*.css"],
        ignores: ["docs/**", "**/test/**"],
        language: "css/css",
        languageOptions: {
            tolerant: true,
        },
        name: "CSS - **/*.CSS",
        plugins: {
            css: css,
            "css-modules": pluginCssModules,
            "undefined-css-classes": pluginUndefinedCss,
        },
        rules: {
            ...css.configs.recommended.rules,
            ...pluginUndefinedCss.default?.configs?.recommended?.rules,
            ...pluginCssModules.configs.recommended.rules,
            // CSS Eslint Rules (css/*)
            "css/no-empty-blocks": "error",
            "css/no-invalid-at-rules": "warn",
            "css/no-invalid-properties": "warn",
            "css/prefer-logical-properties": "warn",
            "css/relative-font-units": "warn",
            "css/selector-complexity": "warn",
            "css/use-baseline": "warn",
            "css/use-layers": "off",
            // CSS Classes Rules (undefined-css-classes/*)
            "undefined-css-classes/no-undefined-css-classes": "warn",
        },
    },
    // #endregion
    // #region 🦖 Docusaurus files
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: Docusaurus (docusaurus/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["docs/docusaurus/**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
        ignores: [
            "docs/docusaurus/.docusaurus/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/static/eslint-inspector/**",
        ],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                    jsx: true,
                },
                ecmaVersion: "latest",
                jsDocParsingMode: "all",
                projectService: {
                    allowDefaultProject: [
                        "docs/docusaurus/site-contract.config.mjs",
                        "docs/docusaurus/typedoc.local.config.mjs",
                        "docs/docusaurus/typedoc-plugins/*.mjs",
                        "docs/docusaurus/typedoc-plugins/*.mts",
                    ],
                },
                sourceType: "module",
                tsconfigRootDir: repositoryRootPath,
                warnOnUnsupportedTypeScriptVersion: true,
            },
        },
        name: "Docusaurus Workspace Files",
        plugins: {
            "@docusaurus": pluginDocusaurus,
            "@eslint-react": eslintReactPlugin,
            "jsx-a11y": eslintPluginJsxA11y,
        },
        rules: {
            ...eslintReactPlugin.configs["strict-type-checked"].rules,
            ...eslintPluginJsxA11y.flatConfigs.recommended.rules,
            "@docusaurus/no-html-links": "warn",
            "@docusaurus/no-untranslated-text": "off",
            "@docusaurus/prefer-docusaurus-heading": "warn",
            "@docusaurus/string-literal-i18n-messages": "off",
            // Keep only the @eslint-react rules that are not already covered by
            // the current strict-type-checked preset and still exist after the
            // plugin upgrade.
            "@eslint-react/dom-prefer-namespace-import": "warn",
            "@eslint-react/immutability": "warn",
            "@eslint-react/no-duplicate-key": "warn",
            "@eslint-react/no-implicit-children": "warn",
            "@eslint-react/no-implicit-key": "warn",
            "@eslint-react/no-implicit-ref": "warn",
            "@eslint-react/no-missing-component-display-name": "warn",
            "@eslint-react/no-missing-context-display-name": "warn",
            "@eslint-react/prefer-namespace-import": "warn",
            "@eslint-react/refs": "warn",
            "@eslint-react/x-component-hook-factories": "warn",
            "@eslint-react/x-error-boundaries": "warn",
            "@eslint-react/x-exhaustive-deps": "warn",
            "@eslint-react/x-immutability": "warn",
            "@eslint-react/x-no-access-state-in-setstate": "warn",
            "@eslint-react/x-no-array-index-key": "warn",
            "@eslint-react/x-no-children-count": "warn",
            "@eslint-react/x-no-children-for-each": "warn",
            "@eslint-react/x-no-children-map": "warn",
            "@eslint-react/x-no-children-only": "warn",
            "@eslint-react/x-no-children-to-array": "warn",
            "@eslint-react/x-no-class-component": "warn",
            "@eslint-react/x-no-clone-element": "warn",
            "@eslint-react/x-no-component-will-mount": "warn",
            "@eslint-react/x-no-component-will-receive-props": "warn",
            "@eslint-react/x-no-component-will-update": "warn",
            "@eslint-react/x-no-context-provider": "warn",
            "@eslint-react/x-no-create-ref": "warn",
            "@eslint-react/x-no-direct-mutation-state": "warn",
            "@eslint-react/x-no-duplicate-key": "warn",
            "@eslint-react/x-no-forward-ref": "warn",
            "@eslint-react/x-no-implicit-children": "warn",
            "@eslint-react/x-no-implicit-key": "warn",
            "@eslint-react/x-no-implicit-ref": "warn",
            "@eslint-react/x-no-leaked-conditional-rendering": "warn",
            "@eslint-react/x-no-missing-component-display-name": "warn",
            "@eslint-react/x-no-missing-context-display-name": "warn",
            "@eslint-react/x-no-missing-key": "warn",
            "@eslint-react/x-no-misused-capture-owner-stack": "warn",
            "@eslint-react/x-no-nested-component-definitions": "warn",
            "@eslint-react/x-no-nested-lazy-component-declarations": "warn",
            "@eslint-react/x-no-redundant-should-component-update": "warn",
            "@eslint-react/x-no-set-state-in-component-did-mount": "warn",
            "@eslint-react/x-no-set-state-in-component-did-update": "warn",
            "@eslint-react/x-no-set-state-in-component-will-update": "warn",
            "@eslint-react/x-no-unnecessary-use-callback": "warn",
            "@eslint-react/x-no-unnecessary-use-memo": "warn",
            "@eslint-react/x-no-unnecessary-use-prefix": "warn",
            "@eslint-react/x-no-unsafe-component-will-mount": "warn",
            "@eslint-react/x-no-unsafe-component-will-receive-props": "warn",
            "@eslint-react/x-no-unsafe-component-will-update": "warn",
            "@eslint-react/x-no-unstable-context-value": "warn",
            "@eslint-react/x-no-unstable-default-props": "warn",
            "@eslint-react/x-no-unused-class-component-members": "warn",
            "@eslint-react/x-no-unused-props": "warn",
            "@eslint-react/x-no-unused-state": "warn",
            "@eslint-react/x-no-use-context": "warn",
            "@eslint-react/x-prefer-destructuring-assignment": "warn",
            "@eslint-react/x-prefer-namespace-import": "warn",
            "@eslint-react/x-purity": "warn",
            "@eslint-react/x-refs": "warn",
            "@eslint-react/x-rules-of-hooks": "warn",
            "@eslint-react/x-set-state-in-effect": "warn",
            "@eslint-react/x-set-state-in-render": "warn",
            "@eslint-react/x-unsupported-syntax": "warn",
            "@eslint-react/x-use-memo": "warn",
            "@eslint-react/x-use-state": "warn",
            "jsx-a11y/lang": "warn",
            "jsx-a11y/no-aria-hidden-on-focusable": "warn",
            "jsx-a11y/prefer-tag-over-role": "warn",
        },
        settings: {
            ...eslintReactPlugin.configs["strict-type-checked"]?.settings,
        },
    },
    // #endregion
    // #region ⌨️ Local Plugin Rules
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: ⌨️ File Progress (file-progress/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: ["src/**/*.{ts,tsx,mts,cts}", "test/**/*.{ts,tsx,mts,cts}"],
        name: "File Progress Rules for Source",
        rules: {
            "file-progress/activate": "warn",
        },
    },
    // #endregion
    // #region ⌨ Etc-Misc
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION: ⌨ Etc-Misc (etc-misc/*)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "src/**/*.{ts,tsx,mts,cts}",
            //    "test/**/*.{ts,tsx,mts,cts}"
        ],
        name: "Etc-Misc Rules for Source",
        plugins: {
            "etc-misc": etcMisc,
        },
        rules: {
            // Enable rules as needed or the config:
            // ...etcMisc.configs.recommended.rules
            "etc-misc/class-match-filename": "off",
            "etc-misc/comment-spacing": "off",
            "etc-misc/consistent-empty-lines": "off",
            "etc-misc/consistent-enum-members": "off",
            "etc-misc/consistent-import": "off",
            "etc-misc/consistent-optional-props": "off",
            "etc-misc/consistent-symbol-description": "off",
            "etc-misc/default-case": "off",
            "etc-misc/disallow-import": "off",
            "etc-misc/export-matching-filename-only": "off",
            "etc-misc/match-filename": "off",
            "etc-misc/max-identifier-blocks": "off",
            "etc-misc/no-assign-mutated-array": "off",
            "etc-misc/no-at-sign-import": "off",
            "etc-misc/no-at-sign-internal-import": "off",
            "etc-misc/no-chain-coalescence-mixture": "off",
            "etc-misc/no-const-enum": "off",
            "etc-misc/no-enum": "off",
            "etc-misc/no-expression-empty-lines": "off",
            "etc-misc/no-foreach": "off",
            "etc-misc/no-implicit-any-catch": "off",
            "etc-misc/no-index-import": "off",
            "etc-misc/no-internal": "off",
            "etc-misc/no-internal-modules": "off",
            "etc-misc/no-language-mixing": "off",
            "etc-misc/no-misused-generics": "off",
            "etc-misc/no-negated-conditions": "off",
            "etc-misc/no-nodejs-modules": "off",
            "etc-misc/no-param-reassign": "off",
            "etc-misc/no-sibling-import": "off",
            "etc-misc/no-single-line-comment": "off",
            "etc-misc/no-t": "off",
            "etc-misc/no-underscore-export": "off",
            "etc-misc/no-unnecessary-as-const": "off",
            "etc-misc/no-unnecessary-break": "off",
            "etc-misc/no-unnecessary-initialization": "off",
            "etc-misc/no-unnecessary-template-literal": "off",
            "etc-misc/no-writeonly": "off",
            "etc-misc/object-format": "off",
            "etc-misc/only-export-name": "off",
            "etc-misc/prefer-arrow-function-property": "off",
            "etc-misc/prefer-const-require": "off",
            "etc-misc/prefer-less-than": "off",
            "etc-misc/prefer-only-export": "off",
            "etc-misc/require-syntax": "off",
            "etc-misc/restrict-identifier-characters": "off",
            "etc-misc/sort-array": "off",
            "etc-misc/sort-call-signature": "off",
            "etc-misc/sort-construct-signature": "off",
            "etc-misc/sort-export-specifiers": "off",
            "etc-misc/sort-keys": "off",
            "etc-misc/sort-top-comments": "off",
            "etc-misc/template-literal-format": "off",
            "etc-misc/throw-error": "off",
            "etc-misc/typescript/array-callback-return-type": "off",
            "etc-misc/typescript/consistent-array-type-name": "off",
            "etc-misc/typescript/define-function-in-one-statement": "off",
            "etc-misc/typescript/no-boolean-literal-type": "off",
            "etc-misc/typescript/no-complex-declarator-type": "off",
            "etc-misc/typescript/no-complex-return-type": "off",
            "etc-misc/typescript/no-multi-type-tuples": "off",
            "etc-misc/typescript/no-never": "off",
            "etc-misc/typescript/no-redundant-undefined-const": "off",
            "etc-misc/typescript/no-redundant-undefined-default-parameter":
                "off",
            "etc-misc/typescript/no-redundant-undefined-let": "off",
            "etc-misc/typescript/no-redundant-undefined-optional": "off",
            "etc-misc/typescript/no-redundant-undefined-promise-return-type":
                "off",
            "etc-misc/typescript/no-redundant-undefined-readonly-property":
                "off",
            "etc-misc/typescript/no-redundant-undefined-return-type": "off",
            "etc-misc/typescript/no-redundant-undefined-var": "off",
            "etc-misc/typescript/no-unsafe-object-assign": "off",
            "etc-misc/typescript/no-unsafe-object-assignment": "off",
            "etc-misc/typescript/prefer-array-type-alias": "off",
            "etc-misc/typescript/prefer-class-method": "off",
            "etc-misc/typescript/prefer-enum": "off",
            "etc-misc/typescript/prefer-named-tuple-members": "off",
            "etc-misc/typescript/prefer-readonly-array": "off",
            "etc-misc/typescript/prefer-readonly-array-parameter": "off",
            "etc-misc/typescript/prefer-readonly-index-signature": "off",
            "etc-misc/typescript/prefer-readonly-map": "off",
            "etc-misc/typescript/prefer-readonly-property": "off",
            "etc-misc/typescript/prefer-readonly-record": "off",
            "etc-misc/typescript/prefer-readonly-set": "off",
            "etc-misc/typescript/require-prop-type-annotation": "off",
            "etc-misc/typescript/require-readonly-array-property-type": "off",
            "etc-misc/typescript/require-readonly-array-return-type": "off",
            "etc-misc/typescript/require-readonly-array-type-alias": "off",
            "etc-misc/typescript/require-readonly-map-parameter-type": "off",
            "etc-misc/typescript/require-readonly-map-property-type": "off",
            "etc-misc/typescript/require-readonly-map-return-type": "off",
            "etc-misc/typescript/require-readonly-map-type-alias": "off",
            "etc-misc/typescript/require-readonly-record-parameter-type": "off",
            "etc-misc/typescript/require-readonly-record-property-type": "off",
            "etc-misc/typescript/require-readonly-record-return-type": "off",
            "etc-misc/typescript/require-readonly-record-type-alias": "off",
            "etc-misc/typescript/require-readonly-set-parameter-type": "off",
            "etc-misc/typescript/require-readonly-set-property-type": "off",
            "etc-misc/typescript/require-readonly-set-return-type": "off",
            "etc-misc/typescript/require-readonly-set-type-alias": "off",
            "etc-misc/typescript/require-this-void": "off",
            "etc-misc/underscore-internal": "off",
        },
    },
    // #endregion
    // #region ⚙️ Global Settings
    // ═══════════════════════════════════════════════════════════════════════════════
    // SECTION:  Global Settings
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        name: "Global Settings Options **/**",
        settings: {
            "import-x/resolver": {
                node: true,
                noWarnOnMultipleProjects: true, // Don't warn about multiple projects
            },
            "import-x/resolver-next": [
                createTypeScriptImportResolver({
                    alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`
                    bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)
                    noWarnOnMultipleProjects: true, // Don't warn about multiple projects
                    // Use an array
                    project: [
                        "./tsconfig.eslint.json",
                        "./tsconfig.json",
                        "./tsconfig.build.json",
                    ],
                }),
            ],
        },
    },
    // #endregion
    // #region ⌨️ Typefest
    // SECTION: 🚢 Typefest
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        files: [
            "src/**/*.{ts,tsx,mts,cts}",
            //    "test/**/*.{ts,tsx,mts,cts}"
        ],
        name: "Typefest Rules for Source",
        plugins: {
            typefest: typefest,
        },
        rules: {
            ...typefest.configs.experimental.rules,
        },
    },
    // #endregion
];
