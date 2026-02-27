import path from "node:path";
import { fileURLToPath } from "node:url";

import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import pegasus from "eslint-config-pegasus";
import eslintPlugin from "eslint-plugin-eslint-plugin";
// @ts-expect-error -- Dogfooded from dist folder so typecheck freaks out sometimes
import progressPlugin from "./dist/index.js";

const tsFiles = ["src/**/*.ts", "test/**/*.ts"];
const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

const typeScriptPluginConfigs = /** @type {import('eslint').Linter.Config[]} */ (
    tseslintPlugin.configs["flat/recommended-type-checked"]
).map((config) => ({
    ...config,
    files: tsFiles,
}));

export default [
    {
        ignores: ["dist/**"],
    },
    {
        name: "file-progress/dogfood",
        plugins: {
            "file-progress": progressPlugin,
        },
        rules: {
            "file-progress/activate": "warn",
        },
        settings: {
            progress: {
                hide: false, // hide progress output (useful in CI)
                hideFileName: false, // show generic "Linting..." instead of file names
                successMessage: "Lint done...",
                fileNameOnNewLine: true, // place filename on a second line under the linting prefix
                detailedSuccess: true, // show multi-line final summary (duration, file count, exit code)
                spinnerStyle: "bounce", // line | dots | arc | bounce | clock
                successMark: "✔", // custom mark used for success completion
                failureMark: "✖", // custom mark used for failure completion
            },
        },
    },
    eslintPlugin.configs["all-type-checked"],
    pegasus.configs.default,
    pegasus.configs.node,
    ...typeScriptPluginConfigs,
    {
        files: tsFiles,
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir,
            },
        },
    },
    {
        files: ["test/**/*.ts"],
        rules: {
            ...tseslintPlugin.configs.recommendedTypeChecked,
            ...tseslintPlugin.configs.recommended.rules,
            ...tseslintPlugin.configs.strictTypeChecked,
            ...tseslintPlugin.configs.strict.rules,
            ...tseslintPlugin.configs.stylisticTypeChecked,
            ...tseslintPlugin.configs.stylistic.rules,
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
        },
    },
    {
        files: ["src/**/*.ts"],
        rules: {
            ...tseslintPlugin.configs.recommendedTypeChecked,
            ...tseslintPlugin.configs.recommended.rules,
            ...tseslintPlugin.configs.strictTypeChecked,
            ...tseslintPlugin.configs.strict.rules,
            ...tseslintPlugin.configs.stylisticTypeChecked,
            ...tseslintPlugin.configs.stylistic.rules,
        },
    },
];
