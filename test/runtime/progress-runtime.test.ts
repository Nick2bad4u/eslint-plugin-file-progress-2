import type { Rule } from "eslint";

import { expect, test } from "vitest";

import {
    createProgressRule,
    internals,
} from "../../src/_internal/progress-runtime.js";
import {
    createMockProcess,
    createMockSpinnerFactory,
    createMockWriteStream,
    getLatestSpinnerRecord,
    makeSettings,
    makeStats,
    normalizePathSeparators,
    stripAnsi,
} from "../_internal/progress-test-helpers.js";

const makeContext = (
    options?: Record<string, unknown>,
    settings?: Record<string, unknown>,
    filename = "src/runtime-case.ts"
): Rule.RuleContext =>
    ({
        cwd: "/repo",
        filename,
        options: options === undefined ? [] : [options],
        settings: settings ?? {},
    }) as unknown as Rule.RuleContext;

test("normalizeSettings handles invalid values safely", () => {
    const cases: {
        readonly expected: ReturnType<typeof makeSettings>;
        readonly input: unknown;
    }[] = [
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
                minFilesBeforeShow: 5,
                outputStream: "stdout",
                showSummaryWhenHidden: true,
                throttleMs: 125,
                ttyOnly: true,
            }),
            input: {
                fileNameOnNewLine: true,
                minFilesBeforeShow: 5,
                outputStream: "stdout",
                showSummaryWhenHidden: true,
                throttleMs: 125,
                ttyOnly: true,
            },
        },
        {
            expected: makeSettings({
                pathFormat: "basename",
            }),
            input: {
                hideDirectoryNames: true,
            },
        },
        {
            expected: makeSettings(),
            input: {
                minFilesBeforeShow: -1,
                throttleMs: 12.5,
            },
        },
        {
            expected: makeSettings(),
            input: {
                outputStream: "invalid-stream",
                prefixMark: "   ",
                successMessage: 42,
            },
        },
    ];

    for (const { expected, input } of cases) {
        expect(internals.normalizeSettings(input)).toStrictEqual(expected);
    }
});

test("mergeProgressSettings lets rule options override deprecated settings", () => {
    const mergedSettings = internals.mergeProgressSettings(
        {
            hidePrefix: true,
            outputStream: "stderr",
            pathFormat: "basename",
        },
        {
            hidePrefix: false,
            outputStream: "stdout",
            pathFormat: "relative",
        }
    );

    expect(internals.normalizeSettings(mergedSettings)).toStrictEqual(
        makeSettings({
            outputStream: "stdout",
        })
    );

    const mergedWithUndefinedValues = internals.mergeProgressSettings(
        {
            successMark: "✅",
        },
        {
            successMark: undefined,
        }
    );

    expect(
        internals.normalizeSettings(mergedWithUndefinedValues)
    ).toStrictEqual(
        makeSettings({
            successMark: "✅",
        })
    );
});

test("formatters produce readable summary text", () => {
    expect(
        normalizePathSeparators(
            stripAnsi(
                internals.formatFileProgress(
                    "shared/test/utils/typeGuards.debug.test.ts",
                    makeSettings()
                )
            )
        )
    ).toMatch(/shared\/test\/utils\/typeGuards\.debug\.test\.ts/v);

    expect(internals.formatGenericProgress(makeSettings())).toMatch(
        /linting project files/v
    );

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

test("formatFileProgress supports newline and basename path formatting", () => {
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
                    pathFormat: "basename",
                })
            )
        )
    ).toMatch(/linting\s+progress\.ts$/v);
});

test("hidePrefix composes with summary and path formatting", () => {
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

    const basenameOnlyText = stripAnsi(
        internals.formatFileProgress(
            "src/rules/progress.ts",
            makeSettings({
                hidePrefix: true,
                pathFormat: "basename",
            })
        )
    );

    expect(basenameOnlyText).toBe("progress.ts");

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

test("toRelativeFilePath handles absolute paths and edge branches", () => {
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

    expect(internals.toRelativeFilePath("", "")).toBe("<input>");
    expect(internals.toRelativeFilePath("<input>", "")).toBe("<input>");
    expect(
        normalizePathSeparators(internals.toRelativeFilePath("C:/repo", ""))
    ).toMatch(/repo$/v);
    expect(internals.toRelativeFilePath("src/relative.ts", "/repo")).toBe(
        "src/relative.ts"
    );
});

test("createProgressRule fills in optional factory defaults", () => {
    const customRule = createProgressRule({
        description: "Custom progress rule.",
        liveMode: "summary-only",
        ruleId: "activate",
        url: "https://example.invalid/custom-progress-rule",
    });

    expect(customRule.defaultOptions).toStrictEqual([{}]);
    expect(customRule.meta.docs.recommended).toBeFalsy();
    expect(customRule.meta.messages.status).toBe("Custom progress rule.");
    expect(customRule.create(makeContext())).toStrictEqual({});
});

test("formatting helpers cover generic file-only and throughput edge cases", () => {
    expect(
        stripAnsi(internals.formatFileProgress("progress.ts", makeSettings()))
    ).toMatch(/linting\s+progress\.ts$/v);

    expect(
        normalizePathSeparators(internals.toRelativeFilePath("/repo", "/repo"))
    ).toBe("repo");

    expect(
        stripAnsi(
            internals.formatFileProgress(
                "/",
                makeSettings({
                    hidePrefix: true,
                })
            )
        )
    ).toBe("/");

    expect(
        stripAnsi(
            internals.formatFileProgress(
                "README",
                makeSettings({
                    hidePrefix: true,
                })
            )
        )
    ).toBe("README");

    expect(
        stripAnsi(
            internals.formatFileProgress(
                String.raw`src\rules\progress.ts`,
                makeSettings({
                    hidePrefix: true,
                })
            )
        )
    ).toMatch(/\\/v);

    expect(internals.formatDuration(12)).toBe("12ms");
    expect(internals.formatDuration(1200)).toBe("1.20s");
    expect(internals.formatThroughput(100, 0)).toBe("0.00 files/s");
    expect(internals.formatThroughput(0, 2)).toBe("2.00 files/s");

    expect(
        stripAnsi(
            internals.formatFailureMessage(
                makeSettings({
                    hidePrefix: true,
                }),
                makeStats({
                    exitCode: 1,
                })
            )
        )
    ).toMatch(/^✖ Lint failed\.$/v);
});

test("controller delays live output until minFilesBeforeShow", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext({
            minFilesBeforeShow: 3,
        }),
        liveMode: "file",
    });
    controller.handleLintFile({
        context: makeContext({
            minFilesBeforeShow: 3,
        }),
        liveMode: "file",
    });

    expect(
        spinnerRecord.events.filter((event) => event.method === "update")
    ).toHaveLength(0);

    controller.handleLintFile({
        context: makeContext(
            {
                minFilesBeforeShow: 3,
            },
            undefined,
            "src/runtime-case-3.ts"
        ),
        liveMode: "file",
    });

    expect(
        spinnerRecord.events.filter((event) => event.method === "update")
    ).toHaveLength(1);
});

test("controller throttles repeated file updates", () => {
    let currentTime = 0;
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        now: () => currentTime,
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext(
            {
                throttleMs: 100,
            },
            undefined,
            "src/runtime-case-1.ts"
        ),
        liveMode: "file",
    });
    currentTime = 50;
    controller.handleLintFile({
        context: makeContext(
            {
                throttleMs: 100,
            },
            undefined,
            "src/runtime-case-2.ts"
        ),
        liveMode: "file",
    });
    currentTime = 150;
    controller.handleLintFile({
        context: makeContext(
            {
                throttleMs: 100,
            },
            undefined,
            "src/runtime-case-3.ts"
        ),
        liveMode: "file",
    });

    expect(
        spinnerRecord.events.filter((event) => event.method === "update")
    ).toHaveLength(2);
});

test("controller shows the final summary when live output is hidden", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext({
            hide: true,
            showSummaryWhenHidden: true,
        }),
        liveMode: "file",
    });
    controller.handleExit(0);

    expect(
        spinnerRecord.events.some((event) => event.method === "update")
    ).toBeFalsy();
    expect(
        spinnerRecord.events.some((event) => event.method === "success")
    ).toBeTruthy();
});

test("controller skips the final summary when output stays hidden", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext({
            hide: true,
        }),
        liveMode: "file",
    });
    controller.handleExit(0);

    expect(
        spinnerRecord.events.some((event) => event.method === "success")
    ).toBeFalsy();
    expect(
        spinnerRecord.events.some((event) => event.method === "error")
    ).toBeFalsy();
});

test("controller summary-only mode suppresses live output but still reports success", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext(undefined, undefined, "src/summary-only.ts"),
        liveMode: "summary-only",
    });
    controller.handleExit(0);

    expect(
        spinnerRecord.events.some((event) => event.method === "update")
    ).toBeFalsy();
    expect(
        spinnerRecord.events.some((event) => event.method === "success")
    ).toBeTruthy();
});

test("controller emits an error summary for non-zero exit codes", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext(undefined, undefined, "src/runtime-error.ts"),
        liveMode: "file",
    });
    controller.handleExit(2);

    expect(
        spinnerRecord.events.some((event) => event.method === "error")
    ).toBeTruthy();
});

test("controller honors hidePrefix in success and failure summaries", () => {
    const successFactory = createMockSpinnerFactory();
    const successController = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory: successFactory.spinnerFactory,
    });
    const successSpinnerRecord = getLatestSpinnerRecord(successFactory.created);

    successController.handleLintFile({
        context: makeContext({
            hidePrefix: true,
        }),
        liveMode: "file",
    });
    successController.handleExit(0);

    const successEvent = successSpinnerRecord.events.find(
        (event) => event.method === "success"
    );

    expect(successEvent).toBeDefined();
    expect(successEvent?.payload).toMatchObject({
        mark: "",
    });

    const errorFactory = createMockSpinnerFactory();
    const errorController = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory: errorFactory.spinnerFactory,
    });
    const errorSpinnerRecord = getLatestSpinnerRecord(errorFactory.created);

    errorController.handleLintFile({
        context: makeContext({
            hidePrefix: true,
        }),
        liveMode: "file",
    });
    errorController.handleExit(2);

    const errorEvent = errorSpinnerRecord.events.find(
        (event) => event.method === "error"
    );

    expect(errorEvent).toBeDefined();
    expect(errorEvent?.payload).toMatchObject({
        mark: "",
    });
});

test("controller handles zero-start timestamps and ignores non-number exit events", () => {
    const mockProcess = createMockProcess();
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        now: () => 0,
        process: mockProcess,
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext(
            {
                detailedSuccess: true,
            },
            undefined,
            "src/runtime-zero-time.ts"
        ),
        liveMode: "file",
    });
    mockProcess.emitExit(undefined as unknown as number);

    expect(
        spinnerRecord.events.some((event) => event.method === "success")
    ).toBeFalsy();

    controller.handleExit(0);

    const successEvent = spinnerRecord.events.find(
        (event) => event.method === "success"
    );

    expect(successEvent).toBeDefined();
    expect(successEvent?.payload).toMatchObject({
        text: expect.stringContaining("0ms"),
    });
});

test("controller ignores exit when no files were linted", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleExit(0);

    expect(spinnerRecord.events).toHaveLength(0);
});

test("controller reset restores a clean state", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext(undefined, undefined, "src/runtime-reset.ts"),
        liveMode: "file",
    });
    controller.reset();

    expect(
        spinnerRecord.events.some((event) => event.method === "stop")
    ).toBeTruthy();
    expect(controller.getState().lintedFileCount).toBe(0);
    expect(controller.getState().initialLiveReportDone).toBeFalsy();
});

test("controller reset does not stop a spinner that never started", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.reset();

    expect(
        spinnerRecord.events.some((event) => event.method === "stop")
    ).toBeFalsy();
});

test("controller reuses the spinner when style and stream do not change", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });

    controller.handleLintFile({
        context: makeContext(
            {
                outputStream: "stderr",
                spinnerStyle: "dots",
            },
            undefined,
            "src/runtime-a.ts"
        ),
        liveMode: "file",
    });
    controller.handleLintFile({
        context: makeContext(
            {
                outputStream: "stderr",
                spinnerStyle: "dots",
            },
            undefined,
            "src/runtime-b.ts"
        ),
        liveMode: "file",
    });

    expect(created).toHaveLength(1);
});

test("controller recreates the spinner when style or stream changes", () => {
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: createMockProcess(),
        spinnerFactory,
    });
    const firstSpinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext(
            {
                outputStream: "stderr",
                spinnerStyle: "dots",
            },
            undefined,
            "src/runtime-a.ts"
        ),
        liveMode: "file",
    });
    controller.handleLintFile({
        context: makeContext(
            {
                outputStream: "stdout",
                spinnerStyle: "arc",
            },
            undefined,
            "src/runtime-b.ts"
        ),
        liveMode: "file",
    });

    expect(created.length).toBeGreaterThan(1);
    expect(
        firstSpinnerRecord.events.some((event) => event.method === "stop")
    ).toBeTruthy();
});

test("controller exit handler can be exercised through the process exit event", () => {
    const mockProcess = createMockProcess();
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: mockProcess,
        spinnerFactory,
    });
    const spinnerRecord = getLatestSpinnerRecord(created);

    controller.handleLintFile({
        context: makeContext(undefined, undefined, "src/runtime-exit-event.ts"),
        liveMode: "file",
    });
    mockProcess.emitExit(0);

    expect(
        spinnerRecord.events.some((event) => event.method === "success")
    ).toBeTruthy();
});

test("controller honors ttyOnly and outputStream when selecting the spinner stream", () => {
    const stdout = createMockWriteStream({
        fd: 1,
        isTTY: false,
    });
    const stderr = createMockWriteStream({
        fd: 2,
        isTTY: true,
    });
    const mockProcess = createMockProcess({
        stderr,
        stdout,
    });
    const { created, spinnerFactory } = createMockSpinnerFactory();
    const controller = internals.createProgressController({
        process: mockProcess,
        spinnerFactory,
    });

    controller.handleLintFile({
        context: makeContext({
            outputStream: "stdout",
            showSummaryWhenHidden: true,
            ttyOnly: true,
        }),
        liveMode: "file",
    });
    controller.handleExit(0);

    const spinnerRecord = getLatestSpinnerRecord(created);

    expect(spinnerRecord.options?.stream).toBe(stdout);
    expect(
        spinnerRecord.events.some((event) => event.method === "success")
    ).toBeTruthy();
});
