import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { ESLint, type Linter } from "eslint";
import { rm, writeFile } from "node:fs/promises";
import { stripVTControlCharacters } from "node:util";
import { expect, test } from "vitest";

import {
    internals,
    type NormalizedProgressSettings,
} from "../src/_internal/progress-runtime.js";
import plugin from "../src/index.js";
import compactRule from "../src/rules/compact.js";
import progressRule from "../src/rules/progress.js";
import summaryOnlyRule from "../src/rules/summary-only.js";

RuleTester.setDefaultConfig({
    languageOptions: {
        parser: tsParser,
    },
});

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

const sharedValidCases = [
    {
        code: 'const foo = "bar";',
        filename: "src/file-a.js",
    },
    {
        code: 'const foo = "bar";',
        filename: "src/file-e.ts",
    },
] as const;

const ruleTester = new RuleTester();

ruleTester.run("activate", progressRule, {
    invalid: [],
    valid: [
        ...sharedValidCases,
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

ruleTester.run("compact", compactRule, {
    invalid: [],
    valid: [...sharedValidCases],
});

ruleTester.run("summary-only", summaryOnlyRule, {
    invalid: [],
    valid: [...sharedValidCases],
});

test("plugin exports recommended configs", () => {
    expect(plugin.meta.name).toBe("eslint-plugin-file-progress-2");
    expect(plugin.rules.activate).toBeDefined();
    expect(plugin.rules.compact).toBeDefined();
    expect(plugin.rules["summary-only"]).toBeDefined();
    expect(plugin.configs.recommended).toBeDefined();
    expect(plugin.configs["recommended-ci"]).toBeDefined();
    expect(plugin.configs["recommended-detailed"]).toBeDefined();
    expect(plugin.configs.recommended.rules).toStrictEqual({
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

    expect(typeof ciHideSetting).toBe("boolean");
    expect(detailedSetting).toBeTruthy();
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
        expect(internals.normalizeSettings(input)).toStrictEqual(expected);
    }
});

test("formatters produce readable summary text", () => {
    expect(
        normalizePathSeparators(
            stripAnsi(
                internals.formatFileProgress(
                    "shared/test/utils/typeGuards.debug.test.ts"
                )
            )
        )
    ).toMatch(/shared\/test\/utils\/typeGuards\.debug\.test\.ts/v);

    expect(internals.formatGenericProgress()).toMatch(/linting project files/v);

    expect(
        stripAnsi(
            internals.formatSuccessMessage(
                makeSettings({
                    successMessage: "All good",
                }),
                makeStats()
            )
        )
    ).toMatch(/eslint-plugin-file-progress-2:[\s\S]*All good/v);

    expect(
        internals.formatSuccessMessage(
            makeSettings({
                detailedSuccess: true,
                successMessage: "All good",
            }),
            makeStats({
                durationMs: 1534,
                filesLinted: 5,
            })
        )
    ).toMatch(
        /Duration:[\s\S]*Files linted:[\s\S]*Throughput:[\s\S]*Exit code:/v
    );

    expect(
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
        )
    ).toMatch(/Problems:[\s\S]*0/v);

    expect(
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
        )
    ).toMatch(
        /Lint failed\.[\s\S]*Throughput:[\s\S]*Exit code:[^2]*2[\s\S]*Problems:[\s\S]*detected/v
    );
});

test("formatFileProgress supports newline and directory controls", () => {
    expect(
        normalizePathSeparators(
            stripAnsi(
                internals.formatFileProgress(
                    "src/rules/progress.ts",
                    makeSettings({
                        fileNameOnNewLine: true,
                    })
                )
            )
        )
    ).toMatch(/linting[\t ]*\n[\t ]*↳[\t ]*src\/rules\/progress\.ts/v);

    expect(
        stripAnsi(
            internals.formatFileProgress(
                "src/rules/progress.ts",
                makeSettings({
                    hideDirectoryNames: true,
                })
            )
        )
    ).toMatch(/linting\s+progress\.ts$/v);
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

    expect(normalizePathSeparators(prefixHiddenText)).toMatch(
        /^src\/rules\/progress\.ts$/v
    );
    expect(prefixHiddenText).not.toContain("\n");

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

    expect(prefixAndDirectoriesHiddenText).toBe("progress.ts");

    const genericWithPrefixHidden = stripAnsi(
        internals.formatGenericProgress(
            makeSettings({
                hideFileName: true,
                hidePrefix: true,
            })
        )
    );

    expect(genericWithPrefixHidden).not.toContain(
        "eslint-plugin-file-progress-2"
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

    expect(successWithPrefixHidden).not.toContain(
        "eslint-plugin-file-progress-2:"
    );
});

test("toRelativeFilePath handles absolute paths", () => {
    expect(
        normalizePathSeparators(
            internals.toRelativeFilePath("/repo/src/file.ts", "/repo")
        )
    ).toMatch(/^src\/file\.ts$/v);

    expect(
        normalizePathSeparators(
            internals.toRelativeFilePath("C:/repo/src/file.ts", "C:/repo")
        )
    ).toMatch(/^src\/file\.ts$/v);
});

test("helper internals handle fallback and edge branches", () => {
    expect(
        internals.normalizeSettings({
            failureMark: "   ",
            prefixMark: "   ",
            successMark: "   ",
        })
    ).toStrictEqual(makeSettings());

    expect(internals.toRelativeFilePath("", "")).toBe("<input>");
    expect(internals.toRelativeFilePath("<input>", "")).toBe("<input>");
    expect(
        normalizePathSeparators(internals.toRelativeFilePath("C:/repo", ""))
    ).toMatch(/repo$/v);

    expect(
        stripAnsi(
            internals.formatFileProgress(
                "////",
                makeSettings({
                    hidePrefix: true,
                })
            )
        )
    ).toBe("////");

    expect(internals.formatThroughput(100, 0)).toBe("0.00 files/s");
    expect(internals.formatThroughput(0, 2)).toBe("2.00 files/s");
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
            throw new Error("Expected ESLint to return a single lint result.");
        }

        expect(result.fatalErrorCount).toBe(0);
        expect(result.errorCount).toBe(0);
    } finally {
        await rm(fixtureFilePath, { force: true });
    }
});

test("runtime create path covers spinner and hide branches", () => {
    const makeContext = (
        settings: Record<string, unknown>,
        filename = "src/runtime-case.ts"
    ) => ({
        cwd: process.cwd(),
        filename,
        settings: {
            progress: settings,
        },
    });

    expect(progressRule.create(makeContext({ hide: true }))).toStrictEqual({});

    expect(
        progressRule.create(
            makeContext({
                hideFileName: true,
                spinnerStyle: "arc",
            })
        )
    ).toStrictEqual({});

    expect(
        progressRule.create(
            makeContext({
                hideFileName: true,
                spinnerStyle: "line",
            })
        )
    ).toStrictEqual({});

    expect(
        stripAnsi(
            internals.formatFileProgress(
                "progress",
                makeSettings({
                    hidePrefix: true,
                })
            )
        )
    ).toBe("progress");

    expect(
        stripAnsi(
            internals.formatSuccessMessage(
                makeSettings({
                    hidePrefix: true,
                }),
                makeStats()
            )
        )
    ).toMatch(/^✔\s+Lint complete\.$/v);
});
