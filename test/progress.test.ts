import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import test from "node:test";

import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import { ESLint, RuleTester, type Linter } from "eslint";

import plugin from "../src/index.js";
import progressRule, { internals } from "../src/rules/progress.js";

const tsFiles = ["src/**/*.ts", "test/**/*.ts"];

const tsRecommendedTypeCheckedConfigs = (
    tseslintPlugin.configs["flat/recommended-type-checked"] as unknown as Linter.Config[]
).map((config) => ({
    ...config,
    files: tsFiles,
}));

test("plugin exports recommended configs", () => {
    assert.equal(plugin.meta.name, "eslint-plugin-file-progress-2");
    assert.ok(plugin.rules.activate);
    assert.ok(plugin.configs.recommended);
    assert.ok(plugin.configs["recommended-ci"]);
    assert.deepEqual(plugin.configs.recommended.rules, {
        "file-progress/activate": "warn",
    });

    const ciHideSetting = (
        plugin.configs["recommended-ci"].settings as { progress?: { hide?: boolean } } | undefined
    )?.progress?.hide;

    assert.equal(typeof ciHideSetting, "boolean");
});

test("normalizeSettings handles invalid values safely", () => {
    assert.deepEqual(internals.normalizeSettings(undefined), {
        hide: false,
        hideFileName: false,
        successMessage: "Lint complete.",
    });

    assert.deepEqual(
        internals.normalizeSettings({
            hide: true,
            hideFileName: false,
            successMessage: "  Done  ",
        }),
        {
            hide: true,
            hideFileName: false,
            successMessage: "Done",
        },
    );
});

test("formatters produce readable output text", () => {
    assert.match(internals.formatFileProgress("src/index.js"), /src[\\/]index\.js/);
    assert.match(internals.formatGenericProgress(), /linting project files/);
    assert.match(
        internals.formatSuccessMessage({
            hide: false,
            hideFileName: false,
            successMessage: "All good",
        }),
        /All good/,
    );
});

test("toRelativeFilePath handles absolute paths", () => {
    assert.match(internals.toRelativeFilePath("/repo/src/file.ts", "/repo"), /^src[\\/]file\.ts$/);

    assert.match(
        internals.toRelativeFilePath("C:/repo/src/file.ts", "C:/repo"),
        /^src[\\/]file\.ts$/,
    );
});

test("rule works with ESLint 10 RuleContext properties", () => {
    const ruleTester = new RuleTester();

    ruleTester.run("file-progress/activate", progressRule, {
        valid: [
            {
                code: 'const foo = "bar";',
                filename: "src/file-a.js",
            },
            {
                code: 'const foo = "bar";',
                filename: "src/file-b.js",
                settings: {
                    progress: {
                        hide: true,
                    },
                },
            },
            {
                code: 'const foo = "bar";',
                filename: "src/file-c.js",
                settings: {
                    progress: {
                        hideFileName: true,
                        successMessage: "Lint done...",
                    },
                },
            },
            {
                code: 'const foo = "bar";',
                filename: "src/file-d.ts",
            },
        ],
        invalid: [],
    });
});

test("typescript-eslint setup lints TypeScript files with plugin rule", async () => {
    const fixtureFilePath = "test/tmp-typescript-eslint-fixture.ts";

    await writeFile(
        fixtureFilePath,
        [
            'const value: string = "lint-ok";',
            "export const readValue = (): string => value;",
            "",
        ].join("\n"),
    );

    const eslint = new ESLint({
        overrideConfigFile: true,
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
                    "file-progress/activate": "warn",
                    "@typescript-eslint/no-unsafe-argument": "off",
                    "@typescript-eslint/no-unsafe-assignment": "off",
                    "@typescript-eslint/no-unsafe-member-access": "off",
                    "@typescript-eslint/no-unsafe-return": "off",
                },
            },
        ],
    });

    try {
        const [result] = await eslint.lintFiles([fixtureFilePath]);

        assert.ok(result);
        assert.equal(result.fatalErrorCount, 0);
        assert.equal(result.errorCount, 0);
    } finally {
        await rm(fixtureFilePath, { force: true });
    }
});
