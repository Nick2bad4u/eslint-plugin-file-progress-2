// @ts-check
/** @typedef {import("eslint").Linter.Config} EslintConfig */
/** @typedef {import("eslint").ESLint.Plugin} EslintPlugin */
/** @typedef {import("eslint").Linter.RulesRecord} EslintRulesRecord */
/** @typedef {import("../../../src/types.js").FileProgressPlugin} FileProgressPlugin */

/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- Intentional file-wide module-boundary exception for shared config re-exports. */
/* eslint-disable canonical/no-re-export, perfectionist/sort-named-exports, unicorn/prefer-export-from -- This shared module intentionally centralizes re-exported config dependencies for the modular ESLint config. */

import stylistic from "@stylistic/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import vite from "@typpi/eslint-plugin-vite";
import vitest from "@vitest/eslint-plugin";
import gitignore from "eslint-config-flat-gitignore";
import eslintConfigPrettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { existsSync } from "node:fs";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import arrayFunc from "eslint-plugin-array-func";
import pluginCanonical from "eslint-plugin-canonical";
import pluginCasePolice from "eslint-plugin-case-police";
import eslintPluginCommentLength from "eslint-plugin-comment-length";
import copilot from "eslint-plugin-copilot";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import * as pluginCssModules from "eslint-plugin-css-modules";
import deMorgan from "eslint-plugin-de-morgan";
import depend from "eslint-plugin-depend";
import eslintPluginEslintPlugin from "eslint-plugin-eslint-plugin";
import etcMisc from "eslint-plugin-etc-misc";
import githubActions from "eslint-plugin-github-actions-2";
import immutable from "eslint-plugin-immutable-2";
import { importX } from "eslint-plugin-import-x";
import jsdocPlugin from "eslint-plugin-jsdoc";
import eslintPluginJsonc from "eslint-plugin-jsonc";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import listeners from "eslint-plugin-listeners";
import eslintPluginMath from "eslint-plugin-math";
import moduleInterop from "eslint-plugin-module-interop";
import nodePlugin from "eslint-plugin-n";
import nitpick from "eslint-plugin-nitpick";
import noBarrelFiles from "eslint-plugin-no-barrel-files";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import * as pluginNFDAR from "eslint-plugin-no-function-declare-after-return";
import pluginRegexLook from "eslint-plugin-no-lookahead-lookbehind-regexp";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import pluginNoOnly from "eslint-plugin-no-only-tests";
import noSecrets from "eslint-plugin-no-secrets";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import nounsanitized from "eslint-plugin-no-unsanitized";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import eslintPluginNoUseExtendNative from "eslint-plugin-no-use-extend-native";
import nodeDependencies from "eslint-plugin-node-dependencies";
import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import pluginPrettier from "eslint-plugin-prettier";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import pluginPromise from "eslint-plugin-promise";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import pluginRedos from "eslint-plugin-redos";
import pluginRegexp from "eslint-plugin-regexp";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import * as pluginJSDoc from "eslint-plugin-require-jsdoc";
import sdl from "eslint-plugin-sdl-2";
import pluginSecurity from "eslint-plugin-security";
import sonarjs, { configs as sonarjsConfigs } from "eslint-plugin-sonarjs";
import pluginTestingLibrary from "eslint-plugin-testing-library";
import eslintPluginToml from "eslint-plugin-toml";
import pluginTsdoc from "eslint-plugin-tsdoc";
import tsdocRequire from "eslint-plugin-tsdoc-require-2";
import typefest from "eslint-plugin-typefest";
// @ts-expect-error -- Package does not currently ship TypeScript declarations.
import pluginUndefinedCss from "eslint-plugin-undefined-css-classes";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import writeGoodComments from "eslint-plugin-write-good-comments-2";
import eslintPluginYml from "eslint-plugin-yml";
import globals from "globals";
import * as jsoncEslintParser from "jsonc-eslint-parser";
import { createRequire } from "node:module";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as tomlEslintParser from "toml-eslint-parser";
import * as yamlEslintParser from "yaml-eslint-parser";

/**
 * @remarks
 * Dogfood the built local plugin during repository lint runs.
 *
 * `prelint` runs `npm run build` before ESLint loads this file, so the local
 * build is available at `./dist/index.js`.
 */

const builtFileProgressPluginUrl = new URL(
    "../../dist/index.js",
    import.meta.url
);
const builtFileProgressPluginPath = fileURLToPath(builtFileProgressPluginUrl);

if (!existsSync(builtFileProgressPluginPath)) {
    throw new Error(
        `Missing built local plugin at ${builtFileProgressPluginPath}. Run \"npm run build\" before loading the shared ESLint config.`
    );
}

// eslint-disable-next-line no-unsanitized/method -- Controlled repository-local file URL; no user input reaches import().
const { default: fileProgressPluginModule } = await import(
    builtFileProgressPluginUrl.href
);

export const fileProgressPlugin = /** @type {FileProgressPlugin} */ (
    fileProgressPluginModule
);

/** @type {EslintConfig} */
export const fileProgressRecommendedCiConfig =
    fileProgressPlugin.configs["recommended-ci"];

// NOTE: eslint-plugin-json-schema-validator may attempt to fetch remote schemas
// at lint time. That makes linting flaky/offline-hostile.
// Keep it opt-in via ENABLE_JSON_SCHEMA_VALIDATION=1.
const enableJsonSchemaValidation =
    globalThis.process.env["ENABLE_JSON_SCHEMA_VALIDATION"] === "1";

const jsonSchemaValidatorPackageName = "eslint-plugin-json-schema-validator";

let eslintPluginJsonSchemaValidator = undefined;

/**
 * @param {unknown} value
 *
 * @returns {EslintPlugin}
 */
export function asEslintPlugin(value) {
    return /** @type {EslintPlugin} */ (value);
}

/**
 * @param {unknown} value
 *
 * @returns {EslintRulesRecord}
 */
export function asRulesRecord(value) {
    return /** @type {EslintRulesRecord} */ (value);
}

if (enableJsonSchemaValidation) {
    eslintPluginJsonSchemaValidator =
        // eslint-disable-next-line no-unsanitized/method -- Controlled package name constant; no user input reaches dynamic import.
        (await import(jsonSchemaValidatorPackageName)).default;
}

/** @type {Record<string, EslintPlugin>} */
export const jsonSchemaValidatorPlugins = enableJsonSchemaValidation
    ? {
          "json-schema-validator": asEslintPlugin(
              eslintPluginJsonSchemaValidator
          ),
      }
    : {};

/** @type {EslintRulesRecord} */
export const jsonSchemaValidatorRules = enableJsonSchemaValidation
    ? { "json-schema-validator/no-invalid": "error" }
    : {};

const require = createRequire(import.meta.url);
export const repositoryRootPath = fileURLToPath(
    new URL("../../", import.meta.url)
);
const processEnvironment = globalThis.process.env;

/**
 * Controls eslint-plugin-file-progress behavior.
 *
 * @remarks
 * The file-progress rule is great for interactive CLI runs, but it produces
 * extremely large logs when output is redirected to a file.
 *
 * Supported values:
 *
 * - (unset) / "on": enable progress and show file names
 * - "nofile": enable progress but hide file names
 * - "off" / "0" / "false": disable progress
 */
const eslintProgressMode = (
    processEnvironment["ESLINT_PROGRESS"] ?? "on"
).toLowerCase();

const isCi = (processEnvironment["CI"] ?? "").toLowerCase() === "true";
const disableProgress =
    eslintProgressMode === "off" ||
    eslintProgressMode === "0" ||
    eslintProgressMode === "false";
const hideProgressFilenames = eslintProgressMode === "nofile";

/** @type {EslintConfig} */
export const fileProgressOverridesConfig = {
    name: "CLI: file progress overrides",
    rules: {
        // The preset already auto-hides on CI, but we also support explicit
        // local toggles.
        "file-progress/activate": disableProgress
            ? 0
            : [
                  "warn",
                  {
                      detailedSuccess: false,
                      failureMark: "✖",
                      fileNameOnNewLine: true,
                      hide: isCi || disableProgress,
                      hideFileName: hideProgressFilenames,
                      hidePrefix: false,
                      outputStream: "stderr",
                      pathFormat: "relative",
                      prefixMark: "•",
                      spinnerStyle: "dots",
                      successMark: "✔",
                      successMessage: "Linting complete!",
                  },
              ],
    },
};

const configuredRecheckJar = processEnvironment["RECHECK_JAR"];

if (
    typeof configuredRecheckJar !== "string" ||
    configuredRecheckJar.length === 0
) {
    const resolvedRecheckJarPath = (() => {
        try {
            return require.resolve("recheck-jar/recheck.jar");
        } catch {
            globalThis.process.stderr.write(
                '[eslint.config] Unable to resolve "recheck-jar/recheck.jar". eslint-plugin-redos will rely on its internal resolution logic.\n'
            );
            return undefined;
        }
    })();

    if (
        typeof resolvedRecheckJarPath === "string" &&
        resolvedRecheckJarPath.length > 0
    ) {
        processEnvironment["RECHECK_JAR"] = path.normalize(
            resolvedRecheckJarPath
        );
    }
}

export const capitalizedCommentsIgnorePattern =
    "pragma|ignored|import|prettier|eslint|tslint|copyright|license|eslint-disable|@ts-.*|jsx-a11y.*|@eslint.*|global|jsx|jsdoc|prettier|istanbul|jcoreio|metamask|microsoft|no-unsafe-optional-chaining|no-unnecessary-type-assertion|no-non-null-asserted-optional-chain|no-non-null-asserted-nullish-coalescing|@typescript-eslint.*|@docusaurus.*|@react.*|boundaries.*|depend.*|deprecation.*|etc.*|ex.*|functional.*|import-x.*|import-zod.*|jsx-a11y.*|loadable-imports.*|math.*|n.*|neverthrow.*|no-constructor-bind.*|no-explicit-type-exports.*|no-function-declare-after-return.*|no-lookahead-lookbehind-regexp.*|no-secrets.*|no-unary-plus.*|no-unawaited-dot-catch-throw.*|no-unsanitized.*|no-use-extend-native.*|observers.*|prefer-arrow.*|perfectionist.*|prettier.*|promise.*|react.*|react-hooks.*|react-hooks-addons.*|redos.*|regexp.*|require-jsdoc.*|safe-jsx.*|security.*|sonarjs.*|sort-class-members.*|sort-destructure-keys.*|sort-keys-fix.*|sql-template.*|ssr-friendly.*|styled-components-a11y.*|switch-case.*|total-functions.*|tsdoc.*|unicorn.*|unused-imports.*|usememo-recommendations.*|validate-jsx-nesting.*|write-good-comments.*|xss.*|v8.*|c8.*|istanbul.*|nyc.*|codecov.*|coveralls.*|c8-coverage.*|codecov-coverage.*";

export const nodeImportStyleStyles = {
    fs: { default: false, named: true, namespace: true },
    "node:crypto": {
        default: false,
        named: true,
        namespace: true,
    },
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
    "node:path": { default: false, namespace: true },
    "node:path/posix": { default: false, namespace: true },
    "node:path/win32": { default: false, namespace: true },
    "node:timers/promises": { named: true },
    "node:util": { named: true },
    path: { default: false, namespace: true },
    util: { named: true },
};

export {
    arrayFunc,
    copilot,
    createTypeScriptImportResolver,
    deMorgan,
    depend,
    etcMisc,
    eslintConfigPrettier,
    eslintPluginCommentLength,
    eslintPluginEslintPlugin,
    eslintPluginJsonc,
    eslintPluginJsxA11y,
    eslintPluginMath,
    eslintPluginNoUseExtendNative,
    eslintPluginToml,
    eslintPluginUnicorn,
    eslintPluginYml,
    gitignore,
    githubActions,
    globals,
    immutable,
    importX,
    jsdocPlugin,
    jsoncEslintParser,
    listeners,
    moduleInterop,
    nitpick,
    noBarrelFiles,
    noSecrets,
    nodeDependencies,
    nodePlugin,
    nounsanitized,
    packageJson,
    perfectionist,
    pluginCanonical,
    pluginCasePolice,
    pluginCssModules,
    pluginJSDoc,
    pluginNFDAR,
    pluginNoOnly,
    pluginPrettier,
    pluginPromise,
    pluginRedos,
    pluginRegexLook,
    pluginRegexp,
    pluginSecurity,
    pluginTestingLibrary,
    pluginTsdoc,
    pluginUndefinedCss,
    pluginUnusedImports,
    sdl,
    sonarjs,
    sonarjsConfigs,
    stylistic,
    tomlEslintParser,
    tsdocRequire,
    tseslint,
    tseslintParser,
    typefest,
    vite,
    vitest,
    writeGoodComments,
    yamlEslintParser,
};

export { default as pluginDocusaurus } from "@docusaurus/eslint-plugin";
export { default as comments } from "@eslint-community/eslint-plugin-eslint-comments/configs";
export { default as eslintReactPlugin } from "@eslint-react/eslint-plugin";
export { globalIgnores } from "@eslint/config-helpers";
export { default as css } from "@eslint/css";
export { default as js } from "@eslint/js";
export { default as json } from "@eslint/json";
export { default as markdown } from "@eslint/markdown";
export { default as html } from "@html-eslint/eslint-plugin";
export * as htmlParser from "@html-eslint/parser";
