import type { Rule } from "eslint";

import { describe, expect, it } from "vitest";

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
    options?: Readonly<Record<string, unknown>>,
    settings?: Readonly<Record<string, unknown>>,
    filename = "src/runtime-case.ts"
): Rule.RuleContext =>
    ({
        cwd: "/repo",
        filename,
        options: options === undefined ? [] : [options],
        settings: settings ?? {},
    }) as unknown as Rule.RuleContext;

describe("progress runtime internals", () => {
    it("normalizeSettings handles invalid values safely", () => {
        expect.hasAssertions();

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
                    failureMark: "Γ¥î",
                    prefixMark: "┬╗",
                    successMark: "Γ£à",
                }),
                input: {
                    failureMark: "Γ¥î",
                    prefixMark: "┬╗",
                    successMark: "Γ£à",
                },
            },
            {
                expected: makeSettings({
                    fileNameOnNewLine: true,
                    minFilesBeforeShow: 5,
                    mode: "compact",
                    outputStream: "stdout",
                    showSummaryWhenHidden: true,
                    throttleMs: 125,
                    ttyOnly: true,
                }),
                input: {
                    fileNameOnNewLine: true,
                    minFilesBeforeShow: 5,
                    mode: "compact",
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
                    mode: "not-a-mode",
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

    it("mergeProgressSettings lets rule options override deprecated settings", () => {
        expect.hasAssertions();

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
                successMark: "Γ£à",
            },
            {
                successMark: undefined,
            }
        );

        expect(
            internals.normalizeSettings(mergedWithUndefinedValues)
        ).toStrictEqual(
            makeSettings({
                successMark: "Γ£à",
            })
        );
    });

    it("formatters produce readable summary text", () => {
        expect.hasAssertions();

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
                    failureMark: "Γ¥î",
                    successMark: "Γ£à",
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

    it("formatFileProgress supports newline and basename path formatting", () => {
        expect.hasAssertions();

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
        ).toContain("linting\n  ↳ src/rules/progress.ts");

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

    it("hidePrefix composes with summary and path formatting", () => {
        expect.hasAssertions();

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

    it("toRelativeFilePath handles absolute paths and edge branches", () => {
        expect.hasAssertions();

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
        expect(
            normalizePathSeparators(
                internals.toRelativeFilePath("C:/repo", "C:/repo")
            )
        ).toBe("repo");
        expect(internals.toRelativeFilePath("src/relative.ts", "/repo")).toBe(
            "src/relative.ts"
        );
    });

    it("createProgressRule fills in optional factory defaults", () => {
        expect.hasAssertions();

        const customRule = createProgressRule({
            description: "Custom progress rule.",
            liveMode: "summary-only",
            url: "https://example.invalid/custom-progress-rule",
        });

        expect(customRule.defaultOptions).toStrictEqual([{}]);
        expect(customRule.meta.docs.recommended).toBeFalsy();
        expect(customRule.meta.messages.status).toBe("Custom progress rule.");
        expect(customRule.create(makeContext())).toStrictEqual({});
    });

    it("formatting helpers cover generic file-only and throughput edge cases", () => {
        expect.hasAssertions();

        expect(
            stripAnsi(
                internals.formatFileProgress("progress.ts", makeSettings())
            )
        ).toMatch(/linting\s+progress\.ts$/v);

        expect(
            normalizePathSeparators(
                internals.toRelativeFilePath("/repo", "/repo")
            )
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
        ).toBe("✖ Lint failed.");
    });

    it("controller delays live output until minFilesBeforeShow", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

        controller.handleLintFile({
            context: makeContext(
                {
                    minFilesBeforeShow: 3,
                },
                undefined,
                "src/runtime-case-1.ts"
            ),
            liveMode: "file",
        });
        controller.handleLintFile({
            context: makeContext(
                {
                    minFilesBeforeShow: 3,
                },
                undefined,
                "src/runtime-case-2.ts"
            ),
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

    it("controller throttles repeated file updates", () => {
        expect.hasAssertions();

        let currentTime = 0;
        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            now: () => currentTime,
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

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

    it("controller shows the final summary when live output is hidden", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

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

    it("controller skips the final summary when output stays hidden", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

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

    it("controller stops an active spinner when summary output is suppressed", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

        controller.handleLintFile({
            context: makeContext(
                undefined,
                undefined,
                "src/runtime-visible.ts"
            ),
            liveMode: "file",
        });

        controller.handleLintFile({
            context: makeContext(
                {
                    hide: true,
                },
                undefined,
                "src/runtime-hidden.ts"
            ),
            liveMode: "file",
        });

        controller.handleExit(0);

        expect(
            spinnerRecord.events.some((event) => event.method === "stop")
        ).toBeTruthy();
        expect(
            spinnerRecord.events.some((event) => event.method === "success")
        ).toBeFalsy();
    });

    it("controller summary-only mode suppresses live output but still reports success", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

        controller.handleLintFile({
            context: makeContext(
                {
                    mode: "summary-only",
                    showSummaryWhenHidden: true,
                },
                undefined,
                "src/summary-only.ts"
            ),
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

    it("controller mode compact switches activate to generic live output", () => {
        expect.hasAssertions();

        const stdout = createMockWriteStream({
            fd: 1,
            isTTY: true,
        });
        const mockProcess = createMockProcess({
            stdout,
        });
        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: mockProcess,
            spinnerFactory,
        });

        controller.handleLintFile({
            context: makeContext(
                {
                    mode: "compact",
                    outputStream: "stdout",
                    spinnerStyle: "arc",
                },
                undefined,
                "src/runtime-shared-rule.ts"
            ),
            liveMode: "file",
        });

        expect(controller.getState().lintedFileCount).toBe(1);

        const spinnerRecord = getLatestSpinnerRecord({ created });
        const updateTexts = spinnerRecord.events
            .filter((event) => event.method === "update")
            .flatMap((event) => {
                if (
                    typeof event.payload !== "object" ||
                    event.payload === null ||
                    !("text" in event.payload) ||
                    typeof event.payload.text !== "string"
                ) {
                    return [];
                }

                return [normalizePathSeparators(stripAnsi(event.payload.text))];
            });

        expect(spinnerRecord.options?.stream).toBe(stdout);
        expect(
            updateTexts.some((text) => text.includes("linting project files"))
        ).toBeTruthy();
        expect(
            updateTexts.some((text) =>
                text.includes("src/runtime-shared-rule.ts")
            )
        ).toBeFalsy();
    });

    it("controller emits an error summary for non-zero exit codes", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

        controller.handleLintFile({
            context: makeContext(undefined, undefined, "src/runtime-error.ts"),
            liveMode: "file",
        });
        controller.handleExit(2);

        expect(
            spinnerRecord.events.some((event) => event.method === "error")
        ).toBeTruthy();
    });

    it("controller honors hidePrefix in success and failure summaries", () => {
        expect.hasAssertions();

        const successFactory = createMockSpinnerFactory();
        const successController = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory: successFactory.spinnerFactory,
        });
        const successSpinnerRecord = getLatestSpinnerRecord({
            created: successFactory.created,
        });

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
        const errorSpinnerRecord = getLatestSpinnerRecord({
            created: errorFactory.created,
        });

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

    it("controller handles zero-start timestamps and ignores non-number exit events", () => {
        expect.hasAssertions();

        const mockProcess = createMockProcess();
        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            now: () => 0,
            process: mockProcess,
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

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

    it("controller ignores exit when no files were linted", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

        controller.handleExit(0);

        expect(spinnerRecord.events).toHaveLength(0);
    });

    it("controller reset restores a clean state", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

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

    it("controller reset does not stop a spinner that never started", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

        controller.reset();

        expect(
            spinnerRecord.events.some((event) => event.method === "stop")
        ).toBeFalsy();
    });

    it("controller reuses the spinner when style and stream do not change", () => {
        expect.hasAssertions();

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

    it("controller recreates the spinner when style or stream changes", () => {
        expect.hasAssertions();

        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: createMockProcess(),
            spinnerFactory,
        });
        const firstSpinnerRecord = getLatestSpinnerRecord({ created });

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

    it("controller exit handler can be exercised through the process exit event", () => {
        expect.hasAssertions();

        const mockProcess = createMockProcess();
        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: mockProcess,
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

        controller.handleLintFile({
            context: makeContext(
                undefined,
                undefined,
                "src/runtime-exit-event.ts"
            ),
            liveMode: "file",
        });
        mockProcess.emitExit(0);

        expect(
            spinnerRecord.events.some((event) => event.method === "success")
        ).toBeTruthy();
    });

    it("controller finalizes on beforeExit and does not double-report on exit", () => {
        expect.hasAssertions();

        const mockProcess = createMockProcess();
        const { created, spinnerFactory } = createMockSpinnerFactory();
        const controller = internals.createProgressController({
            process: mockProcess,
            spinnerFactory,
        });
        const spinnerRecord = getLatestSpinnerRecord({ created });

        controller.handleLintFile({
            context: makeContext(
                undefined,
                undefined,
                "src/runtime-before-exit.ts"
            ),
            liveMode: "file",
        });

        mockProcess.emitBeforeExit(0);
        mockProcess.emitExit(0);

        const successEvents = spinnerRecord.events.filter(
            (event) => event.method === "success"
        );

        expect(successEvents).toHaveLength(1);
    });

    it("controller honors ttyOnly and outputStream when selecting the spinner stream", () => {
        expect.hasAssertions();

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

        const spinnerRecord = getLatestSpinnerRecord({ created });

        expect(spinnerRecord.options?.stream).toBe(stdout);
        expect(
            spinnerRecord.events.some((event) => event.method === "success")
        ).toBeTruthy();
    });
});
