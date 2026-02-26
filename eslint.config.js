import path from "node:path";
import { fileURLToPath } from "node:url";

import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import pegasus from "eslint-config-pegasus";
import eslintPlugin from "eslint-plugin-eslint-plugin";
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
