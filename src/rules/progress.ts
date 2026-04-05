import type { Rule } from "eslint";
import type { UnknownRecord } from "type-fest";

import { createSpinner, type Spinner } from "nanospinner";
import path from "node:path";
import pc from "picocolors";
import { arrayAt, arrayJoin, isEmpty, keyIn, stringSplit } from "ts-extras";

import type { ProgressSettings, SpinnerStyle } from "../types.js";

export interface NormalizedProgressSettings {
    detailedSuccess: boolean;
    failureMark: string;
    fileNameOnNewLine: boolean;
    hide: boolean;
    hideDirectoryNames: boolean;
    hideFileName: boolean;
    hidePrefix: boolean;
    prefixMark: string;
    spinnerStyle: SpinnerStyle;
    successMark: string;
    successMessage: string;
}

export interface ProgressInternals {
    defaultSettings: Readonly<NormalizedProgressSettings>;
    formatDuration: (durationMs: number) => string;
    formatFailureMessage: (
        settings: NormalizedProgressSettings,
        stats: LintSummaryStats
    ) => string;
    formatFileProgress: (
        relativeFilePath: string,
        settings?: NormalizedProgressSettings
    ) => string;
    formatGenericProgress: (settings?: NormalizedProgressSettings) => string;
    formatSuccessMessage: (
        settings: NormalizedProgressSettings,
        stats: LintSummaryStats
    ) => string;
    formatThroughput: (durationMs: number, filesLinted: number) => string;
    normalizeSettings: (raw: unknown) => NormalizedProgressSettings;
    resolveSpinnerStyle: (rawStyle: unknown) => SpinnerStyle;
    toRelativeFilePath: (filename: string, cwd: string) => string;
}

interface LintSummaryStats {
    durationMs: number;
    exitCode: number;
    filesLinted: number;
}

const spinnerPresets = {
    arc: {
        frames: [
            "◜",
            "◠",
            "◝",
            "◞",
            "◡",
            "◟",
        ],
        interval: 90,
    },
    bounce: {
        frames: [
            "▖",
            "▘",
            "▝",
            "▗",
        ],
        interval: 120,
    },
    clock: {
        frames: [
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
        interval: 120,
    },
    dots: {
        frames: [
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
        interval: 80,
    },
    line: {
        frames: [
            "|",
            "/",
            "-",
            "\\",
        ],
        interval: 90,
    },
} satisfies Record<SpinnerStyle, { frames: string[]; interval: number }>;

const isSpinnerStyle = (value: string): value is SpinnerStyle =>
    keyIn(spinnerPresets, value);

const defaultSettings: Readonly<NormalizedProgressSettings> = Object.freeze({
    detailedSuccess: false,
    failureMark: "✖",
    fileNameOnNewLine: false,
    hide: false,
    hideDirectoryNames: false,
    hideFileName: false,
    hidePrefix: false,
    prefixMark: "•",
    spinnerStyle: "dots",
    successMark: "✔",
    successMessage: "Lint complete.",
});

const formatPluginPrefix = (settings: NormalizedProgressSettings): string =>
    `${pc.bold(pc.cyan("eslint-plugin-file-progress-2"))} ${pc.dim(settings.prefixMark)}`;

const formatSummaryLabel = (settings: NormalizedProgressSettings): string => {
    if (settings.hidePrefix) {
        return "";
    }

    return `${pc.bold(pc.cyan("eslint-plugin-file-progress-2"))}${pc.dim(":")}`;
};

let isExitHandlerBound = false;
let initialReportDone = false;
let lastVisibleSettings: NormalizedProgressSettings = { ...defaultSettings };
let lintStartedAt = 0;
let lintedFileCount = 0;
let activeSpinnerStyle: SpinnerStyle = defaultSettings.spinnerStyle;
let spinner: Spinner = createSpinner("", {
    ...spinnerPresets[activeSpinnerStyle],
    color: "cyan",
});

type ProgressSettingKey = keyof ProgressSettings;

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

const getBooleanSetting = (
    rawSettings: UnknownRecord,
    settingKey: ProgressSettingKey
): boolean =>
    keyIn(rawSettings, settingKey) && rawSettings[settingKey] === true;

const getStringSetting = (
    rawSettings: UnknownRecord,
    settingKey: ProgressSettingKey
): string | undefined => {
    if (!keyIn(rawSettings, settingKey)) {
        return undefined;
    }

    const settingValue = rawSettings[settingKey];

    return typeof settingValue === "string" ? settingValue : undefined;
};

const getProgressSetting = (
    settings: Rule.RuleContext["settings"]
): unknown => {
    if (!isRecord(settings) || !keyIn(settings, "progress")) {
        return undefined;
    }

    return settings["progress"];
};

const resolveMark = (rawMark: unknown, fallbackMark: string): string => {
    if (typeof rawMark !== "string") {
        return fallbackMark;
    }

    const trimmedMark = rawMark.trim();

    return trimmedMark.length > 0 ? trimmedMark : fallbackMark;
};

const resolveSpinnerStyle = (rawStyle: unknown): SpinnerStyle => {
    if (typeof rawStyle !== "string") {
        return defaultSettings.spinnerStyle;
    }

    return isSpinnerStyle(rawStyle) ? rawStyle : defaultSettings.spinnerStyle;
};

const ensureSpinnerStyle = (spinnerStyle: SpinnerStyle): void => {
    if (spinnerStyle === activeSpinnerStyle) {
        return;
    }

    if (spinner.isSpinning()) {
        spinner.stop({ update: false });
    }

    activeSpinnerStyle = spinnerStyle;
    spinner = createSpinner("", {
        ...spinnerPresets[activeSpinnerStyle],
        color: "cyan",
    });
};

const normalizeSettings = (raw: unknown): NormalizedProgressSettings => {
    if (!isRecord(raw)) {
        return { ...defaultSettings };
    }

    const hide = getBooleanSetting(raw, "hide");
    const hideFileName = getBooleanSetting(raw, "hideFileName");
    const hidePrefix = getBooleanSetting(raw, "hidePrefix");
    const hideDirectoryNames = getBooleanSetting(raw, "hideDirectoryNames");
    const fileNameOnNewLine = getBooleanSetting(raw, "fileNameOnNewLine");
    const detailedSuccess = getBooleanSetting(raw, "detailedSuccess");
    const spinnerStyle = resolveSpinnerStyle(
        getStringSetting(raw, "spinnerStyle")
    );
    const prefixMark = resolveMark(
        getStringSetting(raw, "prefixMark"),
        defaultSettings.prefixMark
    );
    const successMark = resolveMark(
        getStringSetting(raw, "successMark"),
        defaultSettings.successMark
    );
    const failureMark = resolveMark(
        getStringSetting(raw, "failureMark"),
        defaultSettings.failureMark
    );
    const rawSuccessMessage = getStringSetting(raw, "successMessage");
    const successMessage =
        typeof rawSuccessMessage === "string" &&
        rawSuccessMessage.trim().length > 0
            ? rawSuccessMessage.trim()
            : defaultSettings.successMessage;

    return {
        detailedSuccess,
        failureMark,
        fileNameOnNewLine,
        hide,
        hideDirectoryNames,
        hideFileName,
        hidePrefix,
        prefixMark,
        spinnerStyle,
        successMark,
        successMessage,
    };
};

const toRelativeFilePath = (filename: string, cwd: string): string => {
    if (!filename || filename === "<input>") {
        return filename || "<input>";
    }

    const isWindowsAbsolutePath = path.win32.isAbsolute(filename);
    const isNativeAbsolutePath = path.isAbsolute(filename);

    if (!isNativeAbsolutePath && !isWindowsAbsolutePath) {
        return filename;
    }

    const effectiveCwd = cwd || process.cwd();
    const relativePath = isWindowsAbsolutePath
        ? path.win32.relative(effectiveCwd, filename)
        : path.relative(effectiveCwd, filename);

    if (relativePath.length === 0) {
        return isWindowsAbsolutePath
            ? path.win32.basename(filename)
            : path.basename(filename);
    }

    return relativePath;
};

const formatFileSegment = (fileSegment: string): string => {
    const extensionIndex = fileSegment.lastIndexOf(".");

    return extensionIndex > 0
        ? `${pc.bold(pc.green(fileSegment.slice(0, extensionIndex)))}${pc.green(fileSegment.slice(extensionIndex))}`
        : pc.bold(pc.green(fileSegment));
};

const formatPathSegments = (
    relativeFilePath: string,
    hideDirectoryNames = false
): string => {
    const directoryColorizers = [
        pc.magenta,
        pc.blue,
        pc.yellow,
        pc.green,
        pc.cyan,
    ] as const;
    const normalizedRelativeFilePath = relativeFilePath.replaceAll("\\", "/");
    const separator = relativeFilePath.includes("\\") ? "\\" : "/";
    const segments = stringSplit(normalizedRelativeFilePath, "/").filter(
        (segment: string) => segment.length > 0
    );

    if (isEmpty(segments)) {
        return pc.bold(pc.green(relativeFilePath));
    }

    const fileSegment = arrayAt(segments, -1) ?? "";
    const formattedFile = formatFileSegment(fileSegment);

    if (hideDirectoryNames) {
        return formattedFile;
    }

    const directorySegments = segments.slice(0, -1);

    const formattedDirectories = directorySegments.map(
        (segment: string, index: number) => {
            const colorizer =
                directoryColorizers[index % directoryColorizers.length] ??
                pc.cyan;
            return pc.bold(colorizer(segment));
        }
    );

    if (isEmpty(directorySegments)) {
        return formattedFile;
    }

    return `${arrayJoin(formattedDirectories, pc.dim(separator))}${pc.dim(separator)}${formattedFile}`;
};

const formatFileProgress = (
    relativeFilePath: string,
    settings: NormalizedProgressSettings = defaultSettings
): string => {
    const formattedPath = formatPathSegments(
        relativeFilePath,
        settings.hideDirectoryNames
    );

    if (settings.hidePrefix) {
        return formattedPath;
    }

    const lintingPrefix = `${formatPluginPrefix(settings)} ${pc.dim("linting")}`;

    if (!settings.fileNameOnNewLine) {
        return `${lintingPrefix} ${formattedPath}`;
    }

    return `${lintingPrefix}\n${pc.dim("  ↳")} ${formattedPath}`;
};

const formatGenericProgress = (
    settings: NormalizedProgressSettings = defaultSettings
): string => {
    if (settings.hidePrefix) {
        return pc.dim("linting project files...");
    }

    return `${formatPluginPrefix(settings)} ${pc.dim("linting project files...")}`;
};

const formatDuration = (durationMs: number): string => {
    if (durationMs < 1000) {
        return `${durationMs}ms`;
    }

    return `${(durationMs / 1000).toFixed(2)}s`;
};

const formatThroughput = (durationMs: number, filesLinted: number): string => {
    if (filesLinted <= 0) {
        return "0.00 files/s";
    }

    if (durationMs <= 0) {
        return `${filesLinted.toFixed(2)} files/s`;
    }

    return `${(filesLinted / (durationMs / 1000)).toFixed(2)} files/s`;
};

const formatSuccessMessage = (
    settings: NormalizedProgressSettings,
    stats: LintSummaryStats
): string => {
    const summaryLabel = formatSummaryLabel(settings);
    const resultText = `${pc.bold(pc.green(settings.successMark))} ${pc.green(settings.successMessage)}`;
    const title =
        summaryLabel.length > 0 ? `${summaryLabel} ${resultText}` : resultText;

    if (!settings.detailedSuccess) {
        return title;
    }

    return arrayJoin(
        [
            title,
            `${pc.dim("  Duration:")} ${pc.yellow(formatDuration(stats.durationMs))}`,
            `${pc.dim("  Files linted:")} ${pc.yellow(String(stats.filesLinted))}`,
            `${pc.dim("  Throughput:")} ${pc.yellow(formatThroughput(stats.durationMs, stats.filesLinted))}`,
            `${pc.dim("  Exit code:")} ${pc.green(String(stats.exitCode))}`,
            `${pc.dim("  Problems:")} ${pc.green("0")}`,
        ],
        "\n"
    );
};

const formatFailureMessage = (
    settings: NormalizedProgressSettings,
    stats: LintSummaryStats
): string => {
    const summaryLabel = formatSummaryLabel(settings);
    const resultText = `${pc.bold(pc.red(settings.failureMark))} ${pc.red("Lint failed.")}`;
    const title =
        summaryLabel.length > 0 ? `${summaryLabel} ${resultText}` : resultText;

    if (!settings.detailedSuccess) {
        return title;
    }

    return arrayJoin(
        [
            title,
            `${pc.dim("  Duration:")} ${pc.yellow(formatDuration(stats.durationMs))}`,
            `${pc.dim("  Files linted:")} ${pc.yellow(String(stats.filesLinted))}`,
            `${pc.dim("  Throughput:")} ${pc.yellow(formatThroughput(stats.durationMs, stats.filesLinted))}`,
            `${pc.dim("  Exit code:")} ${pc.red(String(stats.exitCode))}`,
            `${pc.dim("  Problems:")} ${pc.yellow("detected")}`,
        ],
        "\n"
    );
};

const bindExitHandler = (): void => {
    if (isExitHandlerBound) {
        return;
    }

    process.once("exit", (exitCode) => {
        if (!lastVisibleSettings.hide) {
            const now = Date.now();
            const durationMs =
                lintStartedAt > 0 ? Math.max(0, now - lintStartedAt) : 0;
            const summaryStats: LintSummaryStats = {
                durationMs,
                exitCode,
                filesLinted: lintedFileCount,
            };

            if (exitCode === 0) {
                spinner.success({
                    mark: lastVisibleSettings.hidePrefix
                        ? ""
                        : lastVisibleSettings.prefixMark,
                    text: formatSuccessMessage(
                        lastVisibleSettings,
                        summaryStats
                    ),
                });
            } else {
                spinner.error({
                    mark: lastVisibleSettings.hidePrefix
                        ? ""
                        : lastVisibleSettings.prefixMark,
                    text: formatFailureMessage(
                        lastVisibleSettings,
                        summaryStats
                    ),
                });
            }
        }
    });

    isExitHandlerBound = true;
};

const create = (context: Rule.RuleContext): Rule.RuleListener => {
    if (lintStartedAt === 0) {
        lintStartedAt = Date.now();
    }
    lintedFileCount += 1;

    const settings = normalizeSettings(getProgressSetting(context.settings));

    bindExitHandler();

    if (settings.hide) {
        return {};
    }

    ensureSpinnerStyle(settings.spinnerStyle);

    lastVisibleSettings = settings;

    if (settings.hideFileName) {
        if (!initialReportDone) {
            spinner.update({ text: formatGenericProgress(settings) });
            initialReportDone = true;
        }
    } else {
        const relativeFilePath = toRelativeFilePath(
            context.filename,
            context.cwd
        );
        spinner.update({
            text: formatFileProgress(relativeFilePath, settings),
        });
    }

    spinner.spin();

    return {};
};

const progressRule: Rule.RuleModule = {
    create,
    meta: {
        deprecated: false,
        docs: {
            description: "enforce displaying lint progress in CLI output.",
            frozen: false,
            recommended: true,
            url: "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2#readme",
        },
        messages: {
            status: "Display lint progress in CLI output.",
        },
        schema: [],
        type: "suggestion",
    },
};

export const internals: ProgressInternals = {
    defaultSettings,
    formatDuration,
    formatFailureMessage,
    formatFileProgress,
    formatGenericProgress,
    formatSuccessMessage,
    formatThroughput,
    normalizeSettings,
    resolveSpinnerStyle,
    toRelativeFilePath,
};

export default progressRule;
