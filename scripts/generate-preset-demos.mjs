// @ts-check

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";

const repositoryRootPath = path.resolve(
    fileURLToPath(new URL("..", import.meta.url))
);
const builtCatalogModuleUrl = new URL(
    "../dist/_internal/plugin-catalog.js",
    import.meta.url
);
const builtFormattingModuleUrl = new URL(
    "../dist/_internal/progress-formatting.js",
    import.meta.url
);
const builtOptionsModuleUrl = new URL(
    "../dist/_internal/progress-options.js",
    import.meta.url
);
const builtPluginModuleUrl = new URL("../dist/index.js", import.meta.url);
const demosOutputDirectoryPath = path.resolve(
    repositoryRootPath,
    "docs",
    "docusaurus",
    "static",
    "demos",
    "presets"
);
const optionDemosOutputDirectoryPath = path.resolve(
    repositoryRootPath,
    "docs",
    "docusaurus",
    "static",
    "demos",
    "options"
);
const castsOutputDirectoryPath = path.resolve(
    demosOutputDirectoryPath,
    "casts"
);
const optionCastsOutputDirectoryPath = path.resolve(
    optionDemosOutputDirectoryPath,
    "casts"
);
const quietPreviewPresetNames = new Set([
    "recommended-ci",
    "recommended-ci-detailed",
    "recommended-summary-only",
    "recommended-tty",
]);
const deterministicCastTimestamp = 1_744_070_400;
const fixedTerminalColumns = 96;
const fixedTerminalRows = 11;
const spinnerFrameColorStart = "\u001b[36m";
const spinnerFrameColorEnd = "\u001b[39m";
const spinnerFramesByStyle = {
    arc: [
        "◜",
        "◠",
        "◝",
        "◞",
        "◡",
        "◟",
    ],
    bounce: [
        "▖",
        "▘",
        "▝",
        "▗",
    ],
    clock: [
        "🕛",
        "🕐",
        "🕑",
        "🕒",
        "🕓",
        "🕔",
        "🕕",
        "🕖",
        "🕗",
        "🕘",
        "🕙",
        "🕚",
    ],
    dots: [
        "⠋",
        "⠙",
        "⠹",
        "⠸",
        "⠼",
        "⠴",
        "⠦",
        "⠧",
        "⠇",
        "⠏",
    ],
    line: [
        "|",
        "/",
        "-",
        "\\",
    ],
};
const isCheckMode = process.argv.includes("--check");
const demoTargetArgumentPrefix = "--target=";
const requestedDemoTargetArgument = process.argv
    .find((argument) => argument.startsWith(demoTargetArgumentPrefix))
    ?.slice(demoTargetArgumentPrefix.length)
    .toLowerCase();
const requestedDemoTarget =
    requestedDemoTargetArgument === "options" ||
    requestedDemoTargetArgument === "all"
        ? requestedDemoTargetArgument
        : "presets";
const configuredAggBinary = globalThis.process.env["AGG_BIN"]?.trim();
const aggBinary =
    typeof configuredAggBinary === "string" && configuredAggBinary.length > 0
        ? configuredAggBinary
        : "agg";

/* eslint-disable no-unsanitized/method -- Controlled repository-local build output; no user input reaches import(). */
const { fileProgressPresetCatalog, getPresetCatalogEntry } = await import(
    builtCatalogModuleUrl.href
);
const {
    formatFailureMessage,
    formatFileProgress,
    formatGenericProgress,
    formatSuccessMessage,
} = await import(builtFormattingModuleUrl.href);
const { normalizeSettings } = await import(builtOptionsModuleUrl.href);
const { default: builtPlugin } = await import(builtPluginModuleUrl.href);
/* eslint-enable no-unsanitized/method -- Re-enable after the controlled dynamic imports. */

/** @typedef {Readonly<{ time: number; type: "o"; data: string }>} CastEvent */

/**
 * @typedef {Readonly<{ available: true; binary: string }>
 *     | Readonly<{ available: false; binary: string; reason: string }>} GifRendererAvailability
 */

/**
 * @returns {GifRendererAvailability}
 */
const resolveGifRendererAvailability = () => {
    const probeResult = spawnSync(aggBinary, ["--version"], {
        cwd: repositoryRootPath,
        stdio: [
            "ignore",
            "pipe",
            "pipe",
        ],
    });
    const probeError = /** @type {NodeJS.ErrnoException | undefined} */ (
        probeResult.error
    );

    if (probeError === undefined) {
        return {
            available: true,
            binary: aggBinary,
        };
    }

    if (probeError.code === "ENOENT") {
        return {
            available: false,
            binary: aggBinary,
            reason: `${aggBinary} is not available on PATH`,
        };
    }

    throw probeError;
};

const gifRendererAvailability = resolveGifRendererAvailability();
let hasLoggedSkippedGifVerification = false;

const logSkippedGifVerification = () => {
    if (gifRendererAvailability.available) {
        return;
    }

    if (hasLoggedSkippedGifVerification) {
        return;
    }

    hasLoggedSkippedGifVerification = true;
    process.stderr.write(
        `[generate-preset-demos] ${gifRendererAvailability.reason}. Skipping GIF binary verification in --check mode and validating cast files plus checked-in GIF presence only.\n`
    );
};

/**
 * @param {string} data
 *
 * @returns {string}
 */
const normalizeLineEndings = (data) =>
    data.replaceAll("\r\n", "\n").replaceAll("\n", "\r\n");

/**
 * @param {CastEvent[]} castEvents
 * @param {string} data
 * @param {number} time
 */
const pushOutputEvent = (castEvents, data, time) => {
    if (data.length === 0) {
        return;
    }

    castEvents.push({
        data: normalizeLineEndings(data),
        time,
        type: "o",
    });
};

/**
 * @param {import("../src/types.js").SpinnerStyle} spinnerStyle
 * @param {number} iteration
 *
 * @returns {string}
 */
const getSpinnerFrame = (spinnerStyle, iteration) => {
    const frames =
        spinnerFramesByStyle[spinnerStyle] ?? spinnerFramesByStyle.dots;

    return frames.at(iteration % frames.length) ?? "⠋";
};

/**
 * @param {import("../src/types.js").SpinnerStyle} spinnerStyle
 * @param {number} iteration
 *
 * @returns {string}
 */
const createSpinnerPrefix = (spinnerStyle, iteration) =>
    `${spinnerFrameColorStart}${getSpinnerFrame(spinnerStyle, iteration)}${spinnerFrameColorEnd} `;

/**
 * @param {number} renderedLineCount
 *
 * @returns {string}
 */
const createSpinnerClearSequence = (renderedLineCount) => {
    let clearSequence = "\u001b[1G";

    for (let index = 0; index < renderedLineCount; index += 1) {
        if (index > 0) {
            clearSequence += "\u001b[1A";
        }

        clearSequence += "\u001b[2K\u001b[1G";
    }

    return clearSequence;
};

/**
 * @param {string} text
 *
 * @returns {number}
 */
const getRenderedLineCount = (text) => {
    const strippedText = stripVTControlCharacters(text);

    return Math.max(1, strippedText.split("\n").length);
};

/**
 * @param {string} progressText
 * @param {import("../src/types.js").SpinnerStyle} spinnerStyle
 * @param {number} iteration
 * @param {number} previousRenderedLineCount
 *
 * @returns {{ renderedLineCount: number; text: string }}
 */
const createLiveUpdateText = (
    progressText,
    spinnerStyle,
    iteration,
    previousRenderedLineCount
) => {
    const spinnerPrefix = createSpinnerPrefix(spinnerStyle, iteration);
    const renderedText = `${spinnerPrefix}${progressText}`;

    return {
        renderedLineCount: getRenderedLineCount(renderedText),
        text: `${createSpinnerClearSequence(previousRenderedLineCount)}${renderedText}`,
    };
};

/**
 * @returns {{ columns: number; rows: number }}
 */
const getTerminalDimensions = () => ({
    columns: fixedTerminalColumns,
    rows: fixedTerminalRows,
});

/**
 * @param {string} presetName
 * @param {string} ruleName
 *
 * @returns {Record<string, unknown>}
 */
const getPresetOptions = (presetName, ruleName) => {
    const presetConfig = builtPlugin.configs[presetName];
    const ruleEntry = presetConfig.rules?.[`file-progress/${ruleName}`];

    if (!Array.isArray(ruleEntry)) {
        return {};
    }

    const optionObject = ruleEntry[1];

    return typeof optionObject === "object" && optionObject !== null
        ? optionObject
        : {};
};

/**
 * @param {string} directoryPath
 *
 * @returns {Promise<void>}
 */
const ensureDirectory = async (directoryPath) => {
    await mkdir(directoryPath, { recursive: true });
};

/**
 * @param {string} presetName
 * @param {string} commandText
 *
 * @returns {{ events: CastEvent[]; lastTime: number }}
 */
const createTypedPromptEvents = (presetName, commandText) => {
    /** @type {CastEvent[]} */
    const castEvents = [];
    const promptText = "demo> ";
    const prefilledCommandPrefix = commandText.startsWith("CI=true npx eslint ")
        ? "CI=true npx eslint "
        : commandText.startsWith("npx eslint ")
          ? "npx eslint "
          : commandText.startsWith("CI=true ")
            ? "CI=true npx "
            : "npx ";
    const typedCommandRemainder = commandText.startsWith(prefilledCommandPrefix)
        ? commandText.slice(prefilledCommandPrefix.length)
        : commandText;
    let currentTime = 0;

    if (quietPreviewPresetNames.has(presetName)) {
        pushOutputEvent(
            castEvents,
            `${promptText}${commandText}\r\n`,
            currentTime
        );

        return {
            events: castEvents,
            lastTime: currentTime,
        };
    }

    pushOutputEvent(
        castEvents,
        `${promptText}${prefilledCommandPrefix}`,
        currentTime
    );

    for (const character of typedCommandRemainder) {
        currentTime += character === " " ? 0.02 : 0.035;
        pushOutputEvent(castEvents, character, currentTime);
    }

    currentTime += 0.08;
    pushOutputEvent(castEvents, "\r\n", currentTime);

    return {
        events: castEvents,
        lastTime: currentTime,
    };
};

/**
 * @returns {readonly string[]}
 */
const getDemoFilePaths = () => {
    return [
        "src/core/file-01.js",
        "src/packages/beta/file-07.js",
        "src/packages/gamma/nested/file-10.js",
    ];
};

/**
 * @param {string} presetName
 *
 * @returns {string}
 */
const getDemoCommandText = (presetName) => {
    if (presetName === "recommended-ci") {
        return "CI=true npx eslint src --config eslint.config.mjs";
    }

    if (presetName === "recommended-ci-detailed") {
        return "CI=true npx eslint src --config eslint.config.mjs";
    }

    if (presetName === "recommended-tty") {
        return "npx eslint src --config eslint.config.mjs 2>&1 | cat";
    }

    return "npx eslint src --config eslint.config.mjs";
};

/**
 * @type {readonly Readonly<{
 *     name: string;
 *     settings: Record<string, unknown>;
 *     summaryExitCode?: 0 | 1;
 * }>[]}
 */
const optionDemoCatalog = [
    {
        name: "detailed-success",
        settings: {
            detailedSuccess: true,
        },
    },
    {
        name: "failure-mark",
        settings: {
            failureMark: "‼",
        },
        summaryExitCode: 1,
    },
    {
        name: "file-name-on-new-line",
        settings: {
            fileNameOnNewLine: true,
        },
    },
    {
        name: "hide",
        settings: {
            hide: true,
        },
    },
    {
        name: "hide-directory-names",
        settings: {
            hideDirectoryNames: true,
        },
    },
    {
        name: "hide-file-name",
        settings: {
            hideFileName: true,
        },
    },
    {
        name: "hide-prefix",
        settings: {
            hidePrefix: true,
        },
    },
    {
        name: "mode-compact",
        settings: {
            mode: "compact",
        },
    },
    {
        name: "mode-summary-only",
        settings: {
            mode: "summary-only",
        },
    },
    {
        name: "min-files-before-show",
        settings: {
            minFilesBeforeShow: 3,
        },
    },
    {
        name: "output-stream-stdout",
        settings: {
            outputStream: "stdout",
        },
    },
    {
        name: "path-format-basename",
        settings: {
            pathFormat: "basename",
        },
    },
    {
        name: "prefix-mark",
        settings: {
            prefixMark: "→",
        },
    },
    {
        name: "show-summary-when-hidden",
        settings: {
            hide: true,
            showSummaryWhenHidden: true,
        },
    },
    {
        name: "spinner-style-line",
        settings: {
            spinnerStyle: "line",
        },
    },
    {
        name: "success-mark",
        settings: {
            successMark: "✅",
        },
    },
    {
        name: "custom-success-message",
        settings: {
            successMessage: "Lint finished with no issues.",
        },
    },
    {
        name: "throttle-ms",
        settings: {
            throttleMs: 250,
        },
    },
    {
        name: "tty-only",
        settings: {
            ttyOnly: true,
        },
    },
    {
        name: "hide-live-show-summary",
        settings: {
            hide: true,
            showSummaryWhenHidden: true,
        },
    },
];

/**
 * @param {import("../src/_internal/progress-options.js").NormalizedProgressSettings} settings
 * @param {number} lintedFileCount
 *
 * @returns {boolean}
 */
const isOutputHiddenAtFileCount = (settings, lintedFileCount) => {
    if (settings.hide) {
        return true;
    }

    return lintedFileCount < settings.minFilesBeforeShow;
};

/**
 * @param {import("../src/_internal/progress-options.js").NormalizedProgressSettings} settings
 * @param {number} lintedFileCount
 * @param {import("../src/types.js").ProgressMode} effectiveMode
 *
 * @returns {boolean}
 */
const shouldRenderLiveOutput = (settings, lintedFileCount, effectiveMode) =>
    effectiveMode !== "summary-only" &&
    !isOutputHiddenAtFileCount(settings, lintedFileCount);

/**
 * @param {import("../src/_internal/progress-options.js").NormalizedProgressSettings} settings
 * @param {number} lintedFileCount
 *
 * @returns {boolean}
 */
const shouldRenderSummary = (settings, lintedFileCount) =>
    !isOutputHiddenAtFileCount(settings, lintedFileCount) ||
    settings.showSummaryWhenHidden;

/**
 * @param {CastEvent[]} castEvents
 * @param {string} text
 * @param {number} startTime
 * @param {number} lineDelay
 *
 * @returns {number}
 */
const pushMultilineOutput = (castEvents, text, startTime, lineDelay) => {
    const lines = text.split("\n");
    let currentTime = startTime;

    for (const [index, line] of lines.entries()) {
        if (index > 0) {
            currentTime += lineDelay;
        }

        pushOutputEvent(castEvents, `${line}\r\n`, currentTime);
    }

    return currentTime;
};

/**
 * @param {import("../src/_internal/progress-options.js").NormalizedProgressSettings} settings
 * @param {{
 *     quiet?: boolean;
 *     summaryExitCode?: 0 | 1;
 *     summaryDurationMs?: number;
 * }} [options]
 *
 * @returns {readonly CastEvent[]}
 */
const buildOutputEventsFromSettings = (settings, options = {}) => {
    const effectiveMode = settings.mode ?? "file";
    const summaryExitCode = options.summaryExitCode ?? 0;
    const summaryDurationMs = options.summaryDurationMs ?? 12;

    /** @type {CastEvent[]} */
    const castEvents = [];
    let currentTime = 0;

    if (options.quiet) {
        currentTime += 0.65;
        pushOutputEvent(castEvents, "\r\ndemo> ", currentTime);
        return castEvents;
    }

    const demoFilePaths = getDemoFilePaths();
    let liveUpdateIteration = 0;
    let previousLiveRenderedLineCount = 0;

    for (const [index, demoFilePath] of demoFilePaths.entries()) {
        const lintedFileCount = index + 1;

        if (!shouldRenderLiveOutput(settings, lintedFileCount, effectiveMode)) {
            continue;
        }

        currentTime += 0.34;

        const shouldUseGenericLiveMode =
            effectiveMode === "compact" || settings.hideFileName;
        const progressText = shouldUseGenericLiveMode
            ? formatGenericProgress(settings)
            : formatFileProgress(demoFilePath, settings);

        const liveUpdate = createLiveUpdateText(
            progressText,
            settings.spinnerStyle,
            liveUpdateIteration,
            previousLiveRenderedLineCount
        );

        pushOutputEvent(castEvents, liveUpdate.text, currentTime);
        previousLiveRenderedLineCount = liveUpdate.renderedLineCount;
        liveUpdateIteration += 1;
    }

    if (shouldRenderSummary(settings, demoFilePaths.length)) {
        currentTime += 0.28;

        if (previousLiveRenderedLineCount > 0) {
            pushOutputEvent(
                castEvents,
                createSpinnerClearSequence(previousLiveRenderedLineCount),
                currentTime
            );
        }

        currentTime += 0.01;
        const summaryMessage =
            summaryExitCode === 0
                ? formatSuccessMessage(settings, {
                      durationMs: summaryDurationMs,
                      exitCode: summaryExitCode,
                      filesLinted: 12,
                  })
                : formatFailureMessage(settings, {
                      durationMs: summaryDurationMs,
                      exitCode: summaryExitCode,
                      filesLinted: 12,
                  });

        currentTime = pushMultilineOutput(
            castEvents,
            summaryMessage,
            currentTime,
            0.09
        );
    }

    currentTime += 0.34;
    pushOutputEvent(castEvents, "demo> ", currentTime);

    return castEvents;
};

/**
 * @param {string} presetName
 *
 * @returns {readonly CastEvent[]}
 */
const buildPresetOutputEvents = (presetName) => {
    const presetCatalogEntry = getPresetCatalogEntry(presetName);

    const settings = normalizeSettings(
        getPresetOptions(presetName, presetCatalogEntry.ruleName)
    );
    return buildOutputEventsFromSettings(settings, {
        quiet: quietPreviewPresetNames.has(presetName),
        summaryDurationMs: presetName === "recommended-detailed" ? 9 : 12,
    });
};

/**
 * @param {Record<string, unknown>} rawOptionSettings
 * @param {0 | 1 | undefined} summaryExitCode
 *
 * @returns {readonly CastEvent[]}
 */
const buildOptionOutputEvents = (rawOptionSettings, summaryExitCode) =>
    buildOutputEventsFromSettings(normalizeSettings(rawOptionSettings), {
        summaryExitCode,
    });

/**
 * @param {string} castFilePath
 * @param {string} gifFilePath
 * @param {number} columns
 * @param {number} rows
 * @param {string} demoName
 * @param {string} regenerateCommand
 *
 * @returns {Promise<void>}
 */
const renderGif = async (
    castFilePath,
    gifFilePath,
    columns,
    rows,
    demoName,
    regenerateCommand
) => {
    if (!gifRendererAvailability.available) {
        throw new Error(
            `Unable to render demo GIFs because ${gifRendererAvailability.reason}. Install agg or set AGG_BIN to the agg executable, then rerun \`${regenerateCommand}\`.`
        );
    }

    await new Promise((resolvePromise, rejectPromise) => {
        const aggProcess = spawn(
            gifRendererAvailability.binary,
            [
                castFilePath,
                gifFilePath,
                "--cols",
                String(columns),
                "--rows",
                String(rows),
                "--font-size",
                "18",
                "--idle-time-limit",
                "0.7",
                "--last-frame-duration",
                "1.1",
                "--speed",
                "1",
                "--theme",
                "github-dark",
            ],
            {
                cwd: repositoryRootPath,
                stdio: [
                    "ignore",
                    "pipe",
                    "pipe",
                ],
            }
        );

        let stderrText = "";

        aggProcess.stderr.on("data", (chunk) => {
            stderrText += chunk.toString("utf8");
        });
        aggProcess.on("error", rejectPromise);
        aggProcess.on("close", (exitCode) => {
            if (exitCode === 0 && existsSync(gifFilePath)) {
                resolvePromise(undefined);
                return;
            }

            rejectPromise(
                new Error(
                    `agg failed for ${demoName} with exit code ${String(exitCode)}.${stderrText.length > 0 ? `\n${stderrText}` : ""}`
                )
            );
        });
    });
};

/**
 * @param {string} demoName
 * @param {string} commandText
 * @param {readonly CastEvent[]} outputEvents
 *
 * @returns {{ castContent: string; columns: number; rows: number }}
 */
const createCastDocument = (demoName, commandText, outputEvents) => {
    const typedPrompt = createTypedPromptEvents(demoName, commandText);
    const timeOffset = typedPrompt.lastTime + 0.18;

    /** @type {readonly CastEvent[]} */
    const castEvents = [
        ...typedPrompt.events,
        ...outputEvents.map((outputEvent) => ({
            ...outputEvent,
            time: outputEvent.time + timeOffset,
        })),
    ];
    const { columns, rows } = getTerminalDimensions();

    const castHeader = {
        env: {
            SHELL: "demo",
            TERM: "xterm-256color",
        },
        timestamp: deterministicCastTimestamp,
        version: 2,
        width: columns,
        height: rows,
    };

    return {
        castContent: [
            JSON.stringify(castHeader),
            ...castEvents.map((castEvent) =>
                JSON.stringify([
                    castEvent.time,
                    castEvent.type,
                    castEvent.data,
                ])
            ),
            "",
        ].join("\n"),
        columns,
        rows,
    };
};

/**
 * @param {string} actualFilePath
 * @param {Uint8Array | string} expectedContent
 *
 * @returns {Promise<boolean>}
 */
const fileContentMatches = async (actualFilePath, expectedContent) => {
    if (!existsSync(actualFilePath)) {
        return false;
    }

    const actualContent = await readFile(actualFilePath);
    const expectedBuffer =
        typeof expectedContent === "string"
            ? Buffer.from(expectedContent, "utf8")
            : Buffer.from(expectedContent);

    return actualContent.equals(expectedBuffer);
};

/**
 * @param {Readonly<{
 *     castDirectoryPath: string;
 *     commandText: string;
 *     demoDirectoryPath: string;
 *     demoName: string;
 *     outputEvents: readonly CastEvent[];
 *     regenerateCommand: string;
 * }>} input
 *
 * @returns {Promise<void>}
 */
const writeCastAndGif = async (input) => {
    const {
        castDirectoryPath,
        commandText,
        demoDirectoryPath,
        demoName,
        outputEvents,
        regenerateCommand,
    } = input;
    const castFilePath = path.resolve(castDirectoryPath, `${demoName}.cast`);
    const gifFilePath = path.resolve(demoDirectoryPath, `${demoName}.gif`);
    const { castContent, columns, rows } = createCastDocument(
        demoName,
        commandText,
        outputEvents
    );

    await writeFile(castFilePath, castContent, "utf8");
    await renderGif(
        castFilePath,
        gifFilePath,
        columns,
        rows,
        demoName,
        regenerateCommand
    );
};

/**
 * @param {Readonly<{
 *     castDirectoryPath: string;
 *     commandText: string;
 *     demoDirectoryPath: string;
 *     demoKindLabel: string;
 *     demoName: string;
 *     outputEvents: readonly CastEvent[];
 *     regenerateCommand: string;
 *     temporaryDirectoryPath: string;
 * }>} input
 *
 * @returns {Promise<void>}
 */
const checkCastAndGif = async (input) => {
    const {
        castDirectoryPath,
        commandText,
        demoDirectoryPath,
        demoKindLabel,
        demoName,
        outputEvents,
        regenerateCommand,
        temporaryDirectoryPath,
    } = input;

    const castFilePath = path.resolve(castDirectoryPath, `${demoName}.cast`);
    const gifFilePath = path.resolve(demoDirectoryPath, `${demoName}.gif`);
    const temporaryCastFilePath = path.resolve(
        temporaryDirectoryPath,
        `${demoKindLabel}-${demoName}.cast`
    );
    const temporaryGifFilePath = path.resolve(
        temporaryDirectoryPath,
        `${demoKindLabel}-${demoName}.gif`
    );
    const { castContent, columns, rows } = createCastDocument(
        demoName,
        commandText,
        outputEvents
    );

    await writeFile(temporaryCastFilePath, castContent, "utf8");

    const castMatches = await fileContentMatches(castFilePath, castContent);

    if (!gifRendererAvailability.available) {
        logSkippedGifVerification();

        if (castMatches && existsSync(gifFilePath)) {
            return;
        }

        const mismatches = [
            castMatches ? null : `${demoName}.cast`,
            existsSync(gifFilePath) ? null : `${demoName}.gif`,
        ].filter(Boolean);

        throw new Error(
            `${demoKindLabel} demo assets are out of date for ${demoName}: ${mismatches.join(", ")}. GIF binary verification was skipped because ${gifRendererAvailability.reason}. Run \`${regenerateCommand}\` on a machine with agg available and commit the updated assets.`
        );
    }

    await renderGif(
        temporaryCastFilePath,
        temporaryGifFilePath,
        columns,
        rows,
        demoName,
        regenerateCommand
    );
    const gifMatches = await fileContentMatches(
        gifFilePath,
        await readFile(temporaryGifFilePath)
    );

    if (castMatches && gifMatches) {
        return;
    }

    const mismatches = [
        castMatches ? null : `${demoName}.cast`,
        gifMatches ? null : `${demoName}.gif`,
    ].filter(Boolean);

    throw new Error(
        `${demoKindLabel} demo assets are out of date for ${demoName}: ${mismatches.join(", ")}. Run \`${regenerateCommand}\` and commit the updated files.`
    );
};

/**
 * @returns {readonly Readonly<{
 *     castDirectoryPath: string;
 *     commandText: string;
 *     demoDirectoryPath: string;
 *     demoKindLabel: string;
 *     demoName: string;
 *     outputEvents: readonly CastEvent[];
 *     regenerateCommand: string;
 * }>[]}
 */
const collectDemoWorkItems = () => {
    const presetWorkItems = fileProgressPresetCatalog.map(
        /** @param {{ name: string }} presetCatalogEntry */ (
            presetCatalogEntry
        ) => {
            const name = presetCatalogEntry.name;

            return {
                castDirectoryPath: castsOutputDirectoryPath,
                commandText: getDemoCommandText(name),
                demoDirectoryPath: demosOutputDirectoryPath,
                demoKindLabel: "Preset",
                demoName: name,
                outputEvents: buildPresetOutputEvents(name),
                regenerateCommand: "npm run docs:demos:presets",
            };
        }
    );

    const optionWorkItems = optionDemoCatalog.map(
        /** @param {{
    name: string;
    settings: Record<string, unknown>;
    summaryExitCode?: 0 | 1;
}} optionDemo */ (optionDemo) => ({
            castDirectoryPath: optionCastsOutputDirectoryPath,
            commandText: "npx eslint src --config eslint.config.mjs",
            demoDirectoryPath: optionDemosOutputDirectoryPath,
            demoKindLabel: "Option",
            demoName: optionDemo.name,
            outputEvents: buildOptionOutputEvents(
                optionDemo.settings,
                optionDemo.summaryExitCode
            ),
            regenerateCommand: "npm run docs:demos:options",
        })
    );

    if (requestedDemoTarget === "all") {
        return [...presetWorkItems, ...optionWorkItems];
    }

    if (requestedDemoTarget === "options") {
        return optionWorkItems;
    }

    return presetWorkItems;
};

const main = async () => {
    if (requestedDemoTarget === "presets" || requestedDemoTarget === "all") {
        await ensureDirectory(castsOutputDirectoryPath);
    }

    if (requestedDemoTarget === "options" || requestedDemoTarget === "all") {
        await ensureDirectory(optionCastsOutputDirectoryPath);
    }

    const temporaryDirectoryPath = isCheckMode
        ? await mkdtemp(path.join(os.tmpdir(), "file-progress-demo-check-"))
        : null;

    for (const workItem of collectDemoWorkItems()) {
        if (temporaryDirectoryPath !== null) {
            await checkCastAndGif({
                ...workItem,
                temporaryDirectoryPath,
            });
            continue;
        }

        await writeCastAndGif(workItem);
    }
};

await main();
