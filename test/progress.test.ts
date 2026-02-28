import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { stripVTControlCharacters } from "node:util";

import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import { ESLint, RuleTester, type Linter } from "eslint";

import plugin from "../src/index.js";
import progressRule, { internals, type NormalizedProgressSettings } from "../src/rules/progress.js";

const tsFiles = ["src/**/*.ts", "test/**/*.ts"];

const tsRecommendedTypeCheckedConfigs = (
    tseslintPlugin.configs["flat/recommended-type-checked"] as unknown as Linter.Config[]
).map((config) => ({
    ...config,
    files: tsFiles,
}));

const stripAnsi = (value: string): string => stripVTControlCharacters(value);

const makeSettings = (
    overrides: Partial<NormalizedProgressSettings> = {},
): NormalizedProgressSettings => ({
    ...internals.defaultSettings,
    ...overrides,
});

type SummaryStats = Parameters<typeof internals.formatSuccessMessage>[1];

const makeStats = (overrides: Partial<SummaryStats> = {}): SummaryStats => ({
    durationMs: 900,
    filesLinted: 3,
    exitCode: 0,
    ...overrides,
});

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
    const cases: { input: unknown; expected: NormalizedProgressSettings }[] = [
        {
            input: undefined,
            expected: makeSettings(),
        },
        {
            input: {
                hide: true,
                hideFileName: false,
                successMessage: "  Done  ",
            },
            expected: makeSettings({
                hide: true,
                successMessage: "Done",
            }),
        },
        {
            input: {
                detailedSuccess: true,
            },
            expected: makeSettings({
                detailedSuccess: true,
            }),
        },
        {
            input: {
                spinnerStyle: "arc",
            },
            expected: makeSettings({
                spinnerStyle: "arc",
            }),
        },
        {
            input: {
                spinnerStyle: "not-a-style",
            },
            expected: makeSettings(),
        },
        {
            input: {
                prefixMark: "»",
                successMark: "✅",
                failureMark: "❌",
            },
            expected: makeSettings({
                prefixMark: "»",
                successMark: "✅",
                failureMark: "❌",
            }),
        },
        {
            input: {
                fileNameOnNewLine: true,
            },
            expected: makeSettings({
                fileNameOnNewLine: true,
            }),
        },
        {
            input: {
                hidePrefix: true,
                hideDirectoryNames: true,
            },
            expected: makeSettings({
                hidePrefix: true,
                hideDirectoryNames: true,
            }),
        },
    ];

    for (const { input, expected } of cases) {
        assert.deepEqual(internals.normalizeSettings(input), expected);
    }
});

test("formatters produce readable summary text", () => {
    assert.match(
        stripAnsi(internals.formatFileProgress("shared/test/utils/typeGuards.debug.test.ts")),
        /shared[\\/]test[\\/]utils[\\/]typeGuards\.debug\.test\.ts/,
    );

    assert.match(internals.formatGenericProgress(), /linting project files/);

    assert.match(
        stripAnsi(
            internals.formatSuccessMessage(
                makeSettings({
                    successMessage: "All good",
                }),
                makeStats(),
            ),
        ),
        /eslint-plugin-file-progress-2:[\s\S]*All good/,
    );

    assert.match(
        internals.formatSuccessMessage(
            makeSettings({
                successMessage: "All good",
                detailedSuccess: true,
            }),
            makeStats({
                durationMs: 1534,
                filesLinted: 5,
            }),
        ),
        /Duration:[\s\S]*Files linted:[\s\S]*Throughput:[\s\S]*Exit code:/,
    );

    assert.match(
        internals.formatSuccessMessage(
            makeSettings({
                successMessage: "All good",
                detailedSuccess: true,
                successMark: "✅",
                failureMark: "❌",
            }),
            makeStats({
                durationMs: 224,
                filesLinted: 5,
            }),
        ),
        /Problems:[\s\S]*0/,
    );

    assert.match(
        internals.formatFailureMessage(
            makeSettings({
                successMessage: "All good",
                detailedSuccess: true,
                successMark: "✅",
                failureMark: "❌",
            }),
            makeStats({
                durationMs: 224,
                filesLinted: 5,
                exitCode: 2,
            }),
        ),
        /Lint failed\.[\s\S]*Throughput:[\s\S]*Exit code:[\s\S]*2[\s\S]*Problems:[\s\S]*detected/,
    );
});

test("formatFileProgress supports newline and directory controls", () => {
    assert.match(
        stripAnsi(
            internals.formatFileProgress(
                "src/rules/progress.ts",
                makeSettings({
                    fileNameOnNewLine: true,
                }),
            ),
        ),
        /linting\s*\n\s*↳\s*src[\\/]rules[\\/]progress\.ts/,
    );

    assert.match(
        stripAnsi(
            internals.formatFileProgress(
                "src/rules/progress.ts",
                makeSettings({
                    hideDirectoryNames: true,
                }),
            ),
        ),
        /linting\s+progress\.ts$/,
    );
});

test("hidePrefix composes with directory and summary settings", () => {
    const prefixHiddenText = stripAnsi(
        internals.formatFileProgress(
            "src/rules/progress.ts",
            makeSettings({
                hidePrefix: true,
                fileNameOnNewLine: true,
            }),
        ),
    );

    assert.match(prefixHiddenText, /^src[\\/]rules[\\/]progress\.ts$/);
    assert.ok(!prefixHiddenText.includes("\n"));

    const prefixAndDirectoriesHiddenText = stripAnsi(
        internals.formatFileProgress(
            "src/rules/progress.ts",
            makeSettings({
                hidePrefix: true,
                hideDirectoryNames: true,
                fileNameOnNewLine: true,
            }),
        ),
    );

    assert.equal(prefixAndDirectoriesHiddenText, "progress.ts");

    const genericWithPrefixHidden = stripAnsi(
        internals.formatGenericProgress(
            makeSettings({
                hideFileName: true,
                hidePrefix: true,
            }),
        ),
    );

    assert.ok(!genericWithPrefixHidden.includes("eslint-plugin-file-progress-2"));

    const successWithPrefixHidden = stripAnsi(
        internals.formatSuccessMessage(
            makeSettings({
                hidePrefix: true,
                successMessage: "All good",
            }),
            makeStats({
                durationMs: 100,
                filesLinted: 1,
            }),
        ),
    );

    assert.ok(!successWithPrefixHidden.includes("eslint-plugin-file-progress-2:"));
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
                filename: "src/file-d.js",
                code: 'const foo = "bar";',
                name: "show filename on a second line",
                settings: {
                    progress: {
                        fileNameOnNewLine: true,
                    },
                },
            },
            {
                filename: "src/file-e.ts",
                code: 'const foo = "bar";',
            },
            {
                filename: "src/nested/file-f.ts",
                code: 'const foo = "bar";',
                name: "hide prefix and keep file names",
                settings: {
                    progress: {
                        hidePrefix: true,
                    },
                },
            },
            {
                filename: "src/deeply/nested/file-g.ts",
                code: 'const foo = "bar";',
                name: "hide directory names only",
                settings: {
                    progress: {
                        hideDirectoryNames: true,
                    },
                },
            },
            {
                filename: "src/deeply/nested/file-h.ts",
                code: 'const foo = "bar";',
                name: "hide prefix and directory names together",
                settings: {
                    progress: {
                        hidePrefix: true,
                        hideDirectoryNames: true,
                        fileNameOnNewLine: true,
                    },
                },
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
