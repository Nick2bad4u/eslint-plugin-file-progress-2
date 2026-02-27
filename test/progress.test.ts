import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { stripVTControlCharacters } from "node:util";

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

const stripAnsi = (value: string): string => stripVTControlCharacters(value);

test("plugin exports recommended configs", () => {
    assert.equal(plugin.meta.name, "eslint-plugin-file-progress-2");
    assert.ok(plugin.rules.activate);
    assert.ok(plugin.configs.recommended);
    assert.ok(plugin.configs["recommended-ci"]);
    assert.ok(plugin.configs["recommended-detailed"]);
    assert.deepEqual(plugin.configs.recommended.rules, {
        "file-progress/activate": "warn",
    });

    const ciHideSetting = (
        plugin.configs["recommended-ci"].settings as { progress?: { hide?: boolean } } | undefined
    )?.progress?.hide;

    const detailedSetting = (
        plugin.configs["recommended-detailed"].settings as
            | { progress?: { detailedSuccess?: boolean } }
            | undefined
    )?.progress?.detailedSuccess;

    assert.equal(typeof ciHideSetting, "boolean");
    assert.equal(detailedSetting, true);
});

test("normalizeSettings handles invalid values safely", () => {
    assert.deepEqual(internals.normalizeSettings(undefined), {
        hide: false,
        hideFileName: false,
        successMessage: "Lint complete.",
        detailedSuccess: false,
        spinnerStyle: "dots",
        prefixMark: "•",
        successMark: "✔",
        failureMark: "✖",
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
            detailedSuccess: false,
            spinnerStyle: "dots",
            prefixMark: "•",
            successMark: "✔",
            failureMark: "✖",
        },
    );

    assert.deepEqual(
        internals.normalizeSettings({
            detailedSuccess: true,
        }),
        {
            hide: false,
            hideFileName: false,
            successMessage: "Lint complete.",
            detailedSuccess: true,
            spinnerStyle: "dots",
            prefixMark: "•",
            successMark: "✔",
            failureMark: "✖",
        },
    );

    assert.deepEqual(
        internals.normalizeSettings({
            spinnerStyle: "arc",
        }),
        {
            hide: false,
            hideFileName: false,
            successMessage: "Lint complete.",
            detailedSuccess: false,
            spinnerStyle: "arc",
            prefixMark: "•",
            successMark: "✔",
            failureMark: "✖",
        },
    );

    assert.deepEqual(
        internals.normalizeSettings({
            spinnerStyle: "not-a-style",
        }),
        {
            hide: false,
            hideFileName: false,
            successMessage: "Lint complete.",
            detailedSuccess: false,
            spinnerStyle: "dots",
            prefixMark: "•",
            successMark: "✔",
            failureMark: "✖",
        },
    );

    assert.deepEqual(
        internals.normalizeSettings({
            prefixMark: "»",
            successMark: "✅",
            failureMark: "❌",
        }),
        {
            hide: false,
            hideFileName: false,
            successMessage: "Lint complete.",
            detailedSuccess: false,
            spinnerStyle: "dots",
            prefixMark: "»",
            successMark: "✅",
            failureMark: "❌",
        },
    );
});

test("formatters produce readable output text", () => {
    assert.match(
        stripAnsi(internals.formatFileProgress("shared/test/utils/typeGuards.debug.test.ts")),
        /shared[\\/]test[\\/]utils[\\/]typeGuards\.debug\.test\.ts/,
    );
    assert.match(internals.formatGenericProgress(), /linting project files/);
    assert.match(
        stripAnsi(
            internals.formatSuccessMessage(
                {
                    hide: false,
                    hideFileName: false,
                    successMessage: "All good",
                    detailedSuccess: false,
                    spinnerStyle: "dots",
                    prefixMark: "•",
                    successMark: "✔",
                    failureMark: "✖",
                },
                {
                    durationMs: 900,
                    filesLinted: 3,
                    exitCode: 0,
                },
            ),
        ),
        /eslint-plugin-file-progress-2:[\s\S]*All good/,
    );

    assert.match(
        internals.formatSuccessMessage(
            {
                hide: false,
                hideFileName: false,
                successMessage: "All good",
                detailedSuccess: true,
                spinnerStyle: "dots",
                prefixMark: "•",
                successMark: "✔",
                failureMark: "✖",
            },
            {
                durationMs: 1534,
                filesLinted: 5,
                exitCode: 0,
            },
        ),
        /Duration:[\s\S]*Files linted:[\s\S]*Throughput:[\s\S]*Exit code:/,
    );

    assert.match(
        internals.formatSuccessMessage(
            {
                hide: false,
                hideFileName: false,
                successMessage: "All good",
                detailedSuccess: true,
                spinnerStyle: "dots",
                prefixMark: "•",
                successMark: "✅",
                failureMark: "❌",
            },
            {
                durationMs: 224,
                filesLinted: 5,
                exitCode: 0,
            },
        ),
        /Problems:[\s\S]*0/,
    );

    assert.match(
        internals.formatFailureMessage(
            {
                hide: false,
                hideFileName: false,
                successMessage: "All good",
                detailedSuccess: true,
                spinnerStyle: "dots",
                prefixMark: "•",
                successMark: "✅",
                failureMark: "❌",
            },
            {
                durationMs: 224,
                filesLinted: 5,
                exitCode: 2,
            },
        ),
        /Lint failed\.[\s\S]*Throughput:[\s\S]*Exit code:[\s\S]*2[\s\S]*Problems:[\s\S]*detected/,
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
                filename: "src/file-a.js",
                code: 'const foo = "bar";',
            },
            {
                filename: "src/file-b.js",
                code: 'const foo = "bar";',
                name: "hidden progress setting",
                settings: {
                    progress: {
                        hide: true,
                    },
                },
            },
            {
                filename: "src/file-c.js",
                code: 'const foo = "bar";',
                name: "hide filename with custom success message",
                settings: {
                    progress: {
                        hideFileName: true,
                        successMessage: "Lint done...",
                    },
                },
            },
            {
                filename: "src/file-d.ts",
                code: 'const foo = "bar";',
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
