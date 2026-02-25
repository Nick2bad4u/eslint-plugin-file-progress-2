import path from "node:path";
import { fileURLToPath } from "node:url";

import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import pegasus from "eslint-config-pegasus";
import eslintPlugin from "eslint-plugin-eslint-plugin";

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
    eslintPlugin.configs.recommended,
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
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
        },
    },
];
