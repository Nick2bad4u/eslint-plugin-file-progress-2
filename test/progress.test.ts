import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import { ESLint, type Linter, RuleTester } from "eslint";
import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import { stripVTControlCharacters } from "node:util";
import { test } from "vitest";

import plugin from "../src/index.js";
import progressRule, {
    internals,
    type NormalizedProgressSettings,
} from "../src/rules/progress.js";

const tsFiles = ["src/**/*.ts", "test/**/*.ts"];

const tsRecommendedTypeCheckedConfigs = (
    tseslintPlugin.configs[
        "flat/recommended-type-checked"
    ] as unknown as Linter.Config[]
).map((config) => ({
    ...config,
    files: tsFiles,
}));

const stripAnsi = (value: string): string => stripVTControlCharacters(value);
const normalizePathSeparators = (value: string): string =>
    value.replaceAll("\\", "/");

const makeSettings = (
    overrides: Partial<NormalizedProgressSettings> = {}
): NormalizedProgressSettings => ({
    ...internals.defaultSettings,
    ...overrides,
});

type SummaryStats = Parameters<typeof internals.formatSuccessMessage>[1];

const makeStats = (overrides: Partial<SummaryStats> = {}): SummaryStats => ({
    durationMs: 900,
    exitCode: 0,
    filesLinted: 3,
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
        plugin.configs["recommended-ci"].settings as
            | undefined
            | { progress?: { hide?: boolean } }
    )?.progress?.hide;

    const detailedSetting = (
        plugin.configs["recommended-detailed"].settings as
            | undefined
            | { progress?: { detailedSuccess?: boolean } }
    )?.progress?.detailedSuccess;

    assert.equal(typeof ciHideSetting, "boolean");
    assert.equal(detailedSetting, true);
});

test("normalizeSettings handles invalid values safely", () => {
    const cases: { expected: NormalizedProgressSettings; input: unknown }[] = [
        {
            expected: makeSettings(),
            input: undefined,
        },
        {
            expected: makeSettings({
                hide: true,
                successMessage: "Done",
            }),
            input: {
                hide: true,
                hideFileName: false,
                successMessage: "  Done  ",
            },
        },
        {
            expected: makeSettings({
                detailedSuccess: true,
            }),
            input: {
                detailedSuccess: true,
            },
        },
        {
            expected: makeSettings({
                spinnerStyle: "arc",
            }),
            input: {
                spinnerStyle: "arc",
            },
        },
        {
            expected: makeSettings(),
            input: {
                spinnerStyle: "not-a-style",
            },
        },
        {
            expected: makeSettings({
                failureMark: "❌",
                prefixMark: "»",
                successMark: "✅",
            }),
            input: {
                failureMark: "❌",
                prefixMark: "»",
                successMark: "✅",
            },
        },
        {
            expected: makeSettings({
                fileNameOnNewLine: true,
            }),
            input: {
                fileNameOnNewLine: true,
            },
        },
        {
            expected: makeSettings({
                hideDirectoryNames: true,
                hidePrefix: true,
            }),
            input: {
                hideDirectoryNames: true,
                hidePrefix: true,
            },
        },
    ];

    for (const { expected, input } of cases) {
        assert.deepEqual(internals.normalizeSettings(input), expected);
    }
});

test("formatters produce readable summary text", () => {
    assert.match(
        normalizePathSeparators(
            stripAnsi(
                internals.formatFileProgress(
                    "shared/test/utils/typeGuards.debug.test.ts"
                )
            )
        ),
        /shared\/test\/utils\/typeGuards\.debug\.test\.ts/v
    );

    assert.match(internals.formatGenericProgress(), /linting project files/v);

    assert.match(
        stripAnsi(
            internals.formatSuccessMessage(
                makeSettings({
                    successMessage: "All good",
                }),
                makeStats()
            )
        ),
        /eslint-plugin-file-progress-2:[\s\S]*All good/v
    );

    assert.match(
        internals.formatSuccessMessage(
            makeSettings({
                detailedSuccess: true,
                successMessage: "All good",
            }),
            makeStats({
                durationMs: 1534,
                filesLinted: 5,
            })
        ),
        /Duration:[\s\S]*Files linted:[\s\S]*Throughput:[\s\S]*Exit code:/v
    );

    assert.match(
        internals.formatSuccessMessage(
            makeSettings({
                detailedSuccess: true,
                failureMark: "❌",
                successMark: "✅",
                successMessage: "All good",
            }),
            makeStats({
                durationMs: 224,
                filesLinted: 5,
            })
        ),
        /Problems:[\s\S]*0/v
    );

    assert.match(
        internals.formatFailureMessage(
            makeSettings({
                detailedSuccess: true,
                failureMark: "❌",
                successMark: "✅",
                successMessage: "All good",
            }),
            makeStats({
                durationMs: 224,
                exitCode: 2,
                filesLinted: 5,
            })
        ),
        /Lint failed\.[\s\S]*Throughput:[\s\S]*Exit code:[^2]*2[\s\S]*Problems:[\s\S]*detected/v
    );
});

test("formatFileProgress supports newline and directory controls", () => {
    assert.match(
        normalizePathSeparators(
            stripAnsi(
                internals.formatFileProgress(
                    "src/rules/progress.ts",
                    makeSettings({
                        fileNameOnNewLine: true,
                    })
                )
            )
        ),
        /linting[\t ]*\n[\t ]*↳[\t ]*src\/rules\/progress\.ts/v
    );

    assert.match(
        stripAnsi(
            internals.formatFileProgress(
                "src/rules/progress.ts",
                makeSettings({
                    hideDirectoryNames: true,
                })
            )
        ),
        /linting\s+progress\.ts$/v
    );
});

test("hidePrefix composes with directory and summary settings", () => {
    const prefixHiddenText = stripAnsi(
        internals.formatFileProgress(
            "src/rules/progress.ts",
            makeSettings({
                fileNameOnNewLine: true,
                hidePrefix: true,
            })
        )
    );

    assert.match(
        normalizePathSeparators(prefixHiddenText),
        /^src\/rules\/progress\.ts$/v
    );
    assert.ok(!prefixHiddenText.includes("\n"));

    const prefixAndDirectoriesHiddenText = stripAnsi(
        internals.formatFileProgress(
            "src/rules/progress.ts",
            makeSettings({
                fileNameOnNewLine: true,
                hideDirectoryNames: true,
                hidePrefix: true,
            })
        )
    );

    assert.equal(prefixAndDirectoriesHiddenText, "progress.ts");

    const genericWithPrefixHidden = stripAnsi(
        internals.formatGenericProgress(
            makeSettings({
                hideFileName: true,
                hidePrefix: true,
            })
        )
    );

    assert.ok(
        !genericWithPrefixHidden.includes("eslint-plugin-file-progress-2")
    );

    const successWithPrefixHidden = stripAnsi(
        internals.formatSuccessMessage(
            makeSettings({
                hidePrefix: true,
                successMessage: "All good",
            }),
            makeStats({
                durationMs: 100,
                filesLinted: 1,
            })
        )
    );

    assert.ok(
        !successWithPrefixHidden.includes("eslint-plugin-file-progress-2:")
    );
});

test("toRelativeFilePath handles absolute paths", () => {
    assert.match(
        normalizePathSeparators(
            internals.toRelativeFilePath("/repo/src/file.ts", "/repo")
        ),
        /^src\/file\.ts$/v
    );

    assert.match(
        normalizePathSeparators(
            internals.toRelativeFilePath("C:/repo/src/file.ts", "C:/repo")
        ),
        /^src\/file\.ts$/v
    );
});

test("rule works with ESLint 10 RuleContext properties", () => {
    const ruleTester = new RuleTester();

    ruleTester.run("file-progress/activate", progressRule, {
        invalid: [],
        valid: [
            {
                code: 'const foo = "bar";',
                filename: "src/file-a.js",
            },
            {
                code: 'const foo = "bar";',
                filename: "src/file-b.js",
                name: "hidden progress setting",
                settings: {
                    progress: {
                        hide: true,
                    },
                },
            },
            {
                code: 'const foo = "bar";',
                filename: "src/file-c.js",
                name: "hide filename with custom success message",
                settings: {
                    progress: {
                        hideFileName: true,
                        successMessage: "Lint done...",
                    },
                },
            },
            {
                code: 'const foo = "bar";',
                filename: "src/file-d.js",
                name: "show filename on a second line",
                settings: {
                    progress: {
                        fileNameOnNewLine: true,
                    },
                },
            },
            {
                code: 'const foo = "bar";',
                filename: "src/file-e.ts",
            },
            {
                code: 'const foo = "bar";',
                filename: "src/nested/file-f.ts",
                name: "hide prefix and keep file names",
                settings: {
                    progress: {
                        hidePrefix: true,
                    },
                },
            },
            {
                code: 'const foo = "bar";',
                filename: "src/deeply/nested/file-g.ts",
                name: "hide directory names only",
                settings: {
                    progress: {
                        hideDirectoryNames: true,
                    },
                },
            },
            {
                code: 'const foo = "bar";',
                filename: "src/deeply/nested/file-h.ts",
                name: "hide prefix and directory names together",
                settings: {
                    progress: {
                        fileNameOnNewLine: true,
                        hideDirectoryNames: true,
                        hidePrefix: true,
                    },
                },
            },
        ],
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
                    "file-progress/activate": "warn",
                },
            },
        ],
        overrideConfigFile: true,
    });

    try {
        const [result] = await eslint.lintFiles([fixtureFilePath]);

        if (result === undefined) {
            assert.fail("Expected ESLint to return a single lint result.");
        }

        assert.equal(result.fatalErrorCount, 0);
        assert.equal(result.errorCount, 0);
    } finally {
        await rm(fixtureFilePath, { force: true });
    }
});
