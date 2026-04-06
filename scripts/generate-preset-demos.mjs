// @ts-check

import { spawn } from "node:child_process";
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
const castsOutputDirectoryPath = path.resolve(
    demosOutputDirectoryPath,
    "casts"
);
const quietPreviewPresetNames = new Set([
    "recommended-ci",
    "recommended-ci-detailed",
    "recommended-summary-only",
    "recommended-tty",
]);
const deterministicCastTimestamp = 1_744_070_400;
const minimumTerminalColumns = 48;
const minimumTerminalRows = 4;
const terminalColumnPadding = 1;
const terminalRowPadding = 0;
const isCheckMode = process.argv.includes("--check");

/* eslint-disable no-unsanitized/method -- Controlled repository-local build output; no user input reaches import(). */
const { fileProgressPresetCatalog, getPresetCatalogEntry } = await import(
    builtCatalogModuleUrl.href
);
const { formatFileProgress, formatGenericProgress, formatSuccessMessage } =
    await import(builtFormattingModuleUrl.href);
const { normalizeSettings } = await import(builtOptionsModuleUrl.href);
const { default: builtPlugin } = await import(builtPluginModuleUrl.href);
/* eslint-enable no-unsanitized/method -- Re-enable after the controlled dynamic imports. */

/** @typedef {Readonly<{ time: number; type: "o"; data: string }>} CastEvent */

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
 * @param {readonly CastEvent[]} castEvents
 *
 * @returns {{ columns: number; rows: number }}
 */
const getTerminalDimensions = (castEvents) => {
    const transcript = stripVTControlCharacters(
        castEvents.map((castEvent) => castEvent.data).join("")
    );
    const normalizedTranscript = transcript.replaceAll("\r\n", "\n");
    const lines = normalizedTranscript.split("\n");
    const widestLineLength = lines.reduce(
        (maximumLength, line) => Math.max(maximumLength, line.length),
        0
    );

    return {
        columns: Math.max(
            minimumTerminalColumns,
            widestLineLength + terminalColumnPadding
        ),
        rows: Math.max(minimumTerminalRows, lines.length + terminalRowPadding),
    };
};

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
 * @param {string} presetName
 *
 * @returns {readonly string[]}
 */
const getDemoFilePaths = (presetName) => {
    if (presetName === "recommended-compact") {
        return [];
    }

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
 * @param {string} presetName
 *
 * @returns {readonly CastEvent[]}
 */
const buildPresetOutputEvents = (presetName) => {
    const presetCatalogEntry = getPresetCatalogEntry(presetName);

    const settings = normalizeSettings(
        getPresetOptions(presetName, presetCatalogEntry.ruleName)
    );
    /** @type {CastEvent[]} */
    const castEvents = [];
    let currentTime = 0;

    if (presetName === "recommended-ci") {
        currentTime += 0.65;
        pushOutputEvent(castEvents, "\r\ndemo> ", currentTime);
        return castEvents;
    }

    if (presetName === "recommended-tty") {
        currentTime += 0.65;
        pushOutputEvent(castEvents, "\r\ndemo> ", currentTime);
        return castEvents;
    }

    if (presetCatalogEntry.ruleName === "summary-only") {
        currentTime += 0.7;
        currentTime = pushMultilineOutput(
            castEvents,
            formatSuccessMessage(settings, {
                durationMs: 11,
                exitCode: 0,
                filesLinted: 12,
            }),
            currentTime,
            0.09
        );
        currentTime += 0.32;
        pushOutputEvent(castEvents, "demo> ", currentTime);
        return castEvents;
    }

    const demoFilePaths = getDemoFilePaths(presetName);

    if (presetCatalogEntry.ruleName === "compact") {
        currentTime += 0.3;
        pushOutputEvent(
            castEvents,
            `${formatGenericProgress(settings)}\r\n`,
            currentTime
        );
    } else {
        for (const demoFilePath of demoFilePaths) {
            currentTime += 0.34;
            currentTime = pushMultilineOutput(
                castEvents,
                formatFileProgress(demoFilePath, settings),
                currentTime,
                0.07
            );
        }
    }

    currentTime += 0.28;
    currentTime = pushMultilineOutput(
        castEvents,
        formatSuccessMessage(settings, {
            durationMs: presetName === "recommended-detailed" ? 9 : 12,
            exitCode: 0,
            filesLinted: 12,
        }),
        currentTime,
        0.09
    );

    currentTime += 0.34;
    pushOutputEvent(castEvents, "demo> ", currentTime);

    return castEvents;
};

/**
 * @param {string} castFilePath
 * @param {string} gifFilePath
 * @param {number} columns
 * @param {number} rows
 * @param {string} presetName
 *
 * @returns {Promise<void>}
 */
const renderGif = async (
    castFilePath,
    gifFilePath,
    columns,
    rows,
    presetName
) => {
    await new Promise((resolvePromise, rejectPromise) => {
        const aggProcess = spawn(
            "agg",
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
                    `agg failed for ${presetName} with exit code ${String(exitCode)}.${stderrText.length > 0 ? `\n${stderrText}` : ""}`
                )
            );
        });
    });
};

/**
 * @param {string} presetName
 * @param {readonly CastEvent[]} outputEvents
 *
 * @returns {{ castContent: string; columns: number; rows: number }}
 */
const createCastDocument = (presetName, outputEvents) => {
    const typedPrompt = createTypedPromptEvents(
        presetName,
        getDemoCommandText(presetName)
    );
    const timeOffset = typedPrompt.lastTime + 0.18;

    /** @type {readonly CastEvent[]} */
    const castEvents = [
        ...typedPrompt.events,
        ...outputEvents.map((outputEvent) => ({
            ...outputEvent,
            time: outputEvent.time + timeOffset,
        })),
    ];
    const { columns, rows } = getTerminalDimensions(castEvents);

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
 * @param {string} presetName
 * @param {readonly CastEvent[]} outputEvents
 *
 * @returns {Promise<void>}
 */
const writeCastAndGif = async (presetName, outputEvents) => {
    const castFilePath = path.resolve(
        castsOutputDirectoryPath,
        `${presetName}.cast`
    );
    const gifFilePath = path.resolve(
        demosOutputDirectoryPath,
        `${presetName}.gif`
    );
    const { castContent, columns, rows } = createCastDocument(
        presetName,
        outputEvents
    );

    await writeFile(castFilePath, castContent, "utf8");
    await renderGif(castFilePath, gifFilePath, columns, rows, presetName);
};

/**
 * @param {string} presetName
 * @param {readonly CastEvent[]} outputEvents
 * @param {string} temporaryDirectoryPath
 *
 * @returns {Promise<void>}
 */
const checkCastAndGif = async (
    presetName,
    outputEvents,
    temporaryDirectoryPath
) => {
    const castFilePath = path.resolve(
        castsOutputDirectoryPath,
        `${presetName}.cast`
    );
    const gifFilePath = path.resolve(
        demosOutputDirectoryPath,
        `${presetName}.gif`
    );
    const temporaryCastFilePath = path.resolve(
        temporaryDirectoryPath,
        `${presetName}.cast`
    );
    const temporaryGifFilePath = path.resolve(
        temporaryDirectoryPath,
        `${presetName}.gif`
    );
    const { castContent, columns, rows } = createCastDocument(
        presetName,
        outputEvents
    );

    await writeFile(temporaryCastFilePath, castContent, "utf8");
    await renderGif(
        temporaryCastFilePath,
        temporaryGifFilePath,
        columns,
        rows,
        presetName
    );

    const castMatches = await fileContentMatches(castFilePath, castContent);
    const gifMatches = await fileContentMatches(
        gifFilePath,
        await readFile(temporaryGifFilePath)
    );

    if (castMatches && gifMatches) {
        return;
    }

    const mismatches = [
        castMatches ? null : `${presetName}.cast`,
        gifMatches ? null : `${presetName}.gif`,
    ].filter(Boolean);

    throw new Error(
        `Preset demo assets are out of date for ${presetName}: ${mismatches.join(", ")}. Run \`npm run docs:demos:presets\` and commit the updated files.`
    );
};

const main = async () => {
    await ensureDirectory(castsOutputDirectoryPath);

    const temporaryDirectoryPath = isCheckMode
        ? await mkdtemp(path.join(os.tmpdir(), "file-progress-demo-check-"))
        : null;

    for (const { name: presetName } of fileProgressPresetCatalog) {
        const outputEvents = buildPresetOutputEvents(presetName);

        if (temporaryDirectoryPath !== null) {
            await checkCastAndGif(
                presetName,
                outputEvents,
                temporaryDirectoryPath
            );
            continue;
        }

        await writeCastAndGif(presetName, outputEvents);
    }
};

await main();
