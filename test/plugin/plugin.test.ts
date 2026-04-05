import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import { ESLint, type Linter } from "eslint";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { expect, test } from "vitest";

import plugin from "../../src/index.js";

const tsFiles = ["src/**/*.ts", "test/**/*.ts"];

const tsRecommendedTypeCheckedConfigs = (
    tseslintPlugin.configs[
        "flat/recommended-type-checked"
    ] as unknown as Linter.Config[]
).map((config) => ({
    ...config,
    files: tsFiles,
}));

const require = createRequire(import.meta.url);
const builtPluginEsmUrl = pathToFileURL(
    require.resolve("../../dist/index.js")
).href;

test("plugin exports the expanded preset surface", () => {
    expect(plugin.meta.name).toBe("eslint-plugin-file-progress-2");
    expect(plugin.meta.namespace).toBe("file-progress");
    expect(plugin.rules.activate).toBeDefined();
    expect(plugin.rules.compact).toBeDefined();
    expect(plugin.rules["summary-only"]).toBeDefined();
    expect(plugin.configs.recommended).toBeDefined();
    expect(plugin.configs["recommended-ci"]).toBeDefined();
    expect(plugin.configs["recommended-ci-detailed"]).toBeDefined();
    expect(plugin.configs["recommended-compact"]).toBeDefined();
    expect(plugin.configs["recommended-detailed"]).toBeDefined();
    expect(plugin.configs["recommended-summary-only"]).toBeDefined();
    expect(plugin.configs["recommended-tty"]).toBeDefined();
    expect(plugin.configs.recommended.rules).toStrictEqual({
        "file-progress/activate": "warn",
    });

    const recommendedCiRuleEntry = (
        plugin.configs["recommended-ci"].rules as
            | Record<string, unknown>
            | undefined
    )?.["file-progress/activate"];
    const recommendedCiDetailedRuleEntry = (
        plugin.configs["recommended-ci-detailed"].rules as
            | Record<string, unknown>
            | undefined
    )?.["file-progress/activate"];
    const recommendedCompactRuleEntry = (
        plugin.configs["recommended-compact"].rules as
            | Record<string, unknown>
            | undefined
    )?.["file-progress/compact"];
    const recommendedSummaryOnlyRuleEntry = (
        plugin.configs["recommended-summary-only"].rules as
            | Record<string, unknown>
            | undefined
    )?.["file-progress/summary-only"];

    expect(recommendedCompactRuleEntry).toBe("warn");
    expect(recommendedSummaryOnlyRuleEntry).toBe("warn");
    expect(recommendedCiRuleEntry).toStrictEqual([
        "warn",
        {
            hide: expect.any(Boolean),
        },
    ]);
    expect(recommendedCiDetailedRuleEntry).toStrictEqual([
        "warn",
        {
            detailedSuccess: true,
            hide: expect.any(Boolean),
            showSummaryWhenHidden: expect.any(Boolean),
        },
    ]);
});

test("built package entrypoints expose the same plugin contract", async () => {
    // eslint-disable-next-line no-unsanitized/method -- Controlled repository-local dist entry URL; no user input reaches import().
    const esmModule = (await import(builtPluginEsmUrl)) as {
        default: typeof plugin;
    };
    const cjsModule = require("../../dist/index.cjs") as typeof plugin;

    expect(esmModule.default.meta).toStrictEqual(plugin.meta);
    expect(Object.keys(esmModule.default.rules)).toStrictEqual(
        Object.keys(plugin.rules)
    );
    expect(Object.keys(esmModule.default.configs)).toStrictEqual(
        Object.keys(plugin.configs)
    );

    expect(cjsModule.meta).toStrictEqual(plugin.meta);
    expect(Object.keys(cjsModule.rules)).toStrictEqual(
        Object.keys(plugin.rules)
    );
    expect(Object.keys(cjsModule.configs)).toStrictEqual(
        Object.keys(plugin.configs)
    );
});

test("typescript-eslint setup lints TypeScript files with the plugin rule", async () => {
    const fixtureDirectoryPath = "temp/test-file-progress-plugin";
    const fixtureFilePath = `${fixtureDirectoryPath}/tmp-typescript-eslint-fixture.ts`;

    await mkdir(fixtureDirectoryPath, { recursive: true });
    await writeFile(
        fixtureFilePath,
        [
            'const value: string = "lint-ok";',
            "export const readValue = (): string => value;",
            "",
        ].join("\n")
    );

    const eslint = new ESLint({
        overrideConfig: [
            ...tsRecommendedTypeCheckedConfigs,
            {
                files: tsFiles,
                languageOptions: {
                    parserOptions: {
                        projectService: true,
                        tsconfigRootDir: process.cwd(),
                    },
                },
            },
            {
                files: tsFiles,
                plugins: {
                    "file-progress": plugin,
                },
                rules: {
                    "@typescript-eslint/no-unsafe-argument": "off",
                    "@typescript-eslint/no-unsafe-assignment": "off",
                    "@typescript-eslint/no-unsafe-member-access": "off",
                    "@typescript-eslint/no-unsafe-return": "off",
                    "file-progress/activate": [
                        "warn",
                        {
                            outputStream: "stdout",
                            throttleMs: 25,
                        },
                    ],
                },
            },
        ],
        overrideConfigFile: true,
    });

    try {
        const [result] = await eslint.lintFiles([fixtureFilePath]);

        if (result === undefined) {
            throw new Error("Expected ESLint to return a single lint result.");
        }

        expect(result.fatalErrorCount).toBe(0);
        expect(result.errorCount).toBe(0);
    } finally {
        await rm(fixtureFilePath, { force: true });
    }
});
