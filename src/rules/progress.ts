import path from "node:path";
import type { Rule } from "eslint";
import { createSpinner, type Spinner } from "nanospinner";
import pc from "picocolors";

import type { ProgressSettings, SpinnerStyle } from "../types.js";

export interface NormalizedProgressSettings {
    hide: boolean;
    hideFileName: boolean;
    successMessage: string;
    detailedSuccess: boolean;
    spinnerStyle: SpinnerStyle;
    prefixMark: string;
    successMark: string;
    failureMark: string;
}

interface LintSummaryStats {
    durationMs: number;
    filesLinted: number;
    exitCode: number;
}

export interface ProgressInternals {
    defaultSettings: Readonly<NormalizedProgressSettings>;
    normalizeSettings: (raw: unknown) => NormalizedProgressSettings;
    resolveSpinnerStyle: (rawStyle: unknown) => SpinnerStyle;
    toRelativeFilePath: (filename: string, cwd: string) => string;
    formatDuration: (durationMs: number) => string;
    formatThroughput: (durationMs: number, filesLinted: number) => string;
    formatFileProgress: (relativeFilePath: string, settings?: NormalizedProgressSettings) => string;
    formatGenericProgress: (settings?: NormalizedProgressSettings) => string;
    formatSuccessMessage: (settings: NormalizedProgressSettings, stats: LintSummaryStats) => string;
    formatFailureMessage: (settings: NormalizedProgressSettings, stats: LintSummaryStats) => string;
}

const spinnerPresets: Record<SpinnerStyle, { frames: string[]; interval: number }> = {
    line: {
        frames: ["|", "/", "-", "\\"],
        interval: 90,
    },
    dots: {
        frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
        interval: 80,
    },
    arc: {
        frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
        interval: 90,
    },
    bounce: {
        frames: ["▖", "▘", "▝", "▗"],
        interval: 120,
    },
    clock: {
        frames: ["🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚"],
        interval: 120,
    },
};

const defaultSettings: Readonly<NormalizedProgressSettings> = Object.freeze({
    hide: false,
    hideFileName: false,
    successMessage: "Lint complete.",
    detailedSuccess: false,
    spinnerStyle: "dots",
    prefixMark: "•",
    successMark: "✔",
    failureMark: "✖",
});

const formatPluginPrefix = (settings: NormalizedProgressSettings): string =>
    `${pc.bold(pc.cyan("eslint-plugin-file-progress-2"))} ${pc.dim(settings.prefixMark)}`;

const formatSummaryLabel = (): string =>
    `${pc.bold(pc.cyan("eslint-plugin-file-progress-2"))}${pc.dim(":")}`;

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

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

    return rawStyle in spinnerPresets ? (rawStyle as SpinnerStyle) : defaultSettings.spinnerStyle;
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

    const typedRaw = raw as ProgressSettings;

    const hide = typedRaw.hide === true;
    const hideFileName = typedRaw.hideFileName === true;
    const detailedSuccess = typedRaw.detailedSuccess === true;
    const spinnerStyle = resolveSpinnerStyle(typedRaw.spinnerStyle);
    const prefixMark = resolveMark(typedRaw.prefixMark, defaultSettings.prefixMark);
    const successMark = resolveMark(typedRaw.successMark, defaultSettings.successMark);
    const failureMark = resolveMark(typedRaw.failureMark, defaultSettings.failureMark);
    const successMessage =
        typeof typedRaw.successMessage === "string" && typedRaw.successMessage.trim().length > 0
            ? typedRaw.successMessage.trim()
            : defaultSettings.successMessage;

    return {
        hide,
        hideFileName,
        successMessage,
        detailedSuccess,
        spinnerStyle,
        prefixMark,
        successMark,
        failureMark,
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
        return isWindowsAbsolutePath ? path.win32.basename(filename) : path.basename(filename);
    }

    return relativePath;
};

const formatPathSegments = (relativeFilePath: string): string => {
    const directoryColorizers = [pc.magenta, pc.blue, pc.yellow, pc.green, pc.cyan] as const;
    const separator = relativeFilePath.includes("\\") ? "\\" : "/";
    const segments = relativeFilePath.split(/[/\\]+/).filter((segment) => segment.length > 0);

    if (segments.length === 0) {
        return pc.bold(pc.green(relativeFilePath));
    }

    const fileSegment = segments.at(-1) ?? "";
    const directorySegments = segments.slice(0, -1);

    const formattedDirectories = directorySegments
        .map((segment, index) => {
            const colorizer = directoryColorizers[index % directoryColorizers.length] ?? pc.cyan;
            return pc.bold(colorizer(segment));
        })
        .join(pc.dim(separator));

    const extensionIndex = fileSegment.lastIndexOf(".");
    const formattedFile =
        extensionIndex > 0
            ? `${pc.bold(pc.green(fileSegment.slice(0, extensionIndex)))}${pc.green(fileSegment.slice(extensionIndex))}`
            : pc.bold(pc.green(fileSegment));

    if (directorySegments.length === 0) {
        return formattedFile;
    }

    return `${formattedDirectories}${pc.dim(separator)}${formattedFile}`;
};

const formatFileProgress = (
    relativeFilePath: string,
    settings: NormalizedProgressSettings = defaultSettings,
): string =>
    `${formatPluginPrefix(settings)} ${pc.dim("linting")} ${formatPathSegments(relativeFilePath)}`;

const formatGenericProgress = (settings: NormalizedProgressSettings = defaultSettings): string =>
    `${formatPluginPrefix(settings)} ${pc.dim("linting project files...")}`;

const formatDuration = (durationMs: number): string => {
    if (durationMs < 1_000) {
        return `${durationMs}ms`;
    }

    return `${(durationMs / 1_000).toFixed(2)}s`;
};

const formatThroughput = (durationMs: number, filesLinted: number): string => {
    if (filesLinted <= 0) {
        return "0.00 files/s";
    }

    if (durationMs <= 0) {
        return `${filesLinted.toFixed(2)} files/s`;
    }

    return `${(filesLinted / (durationMs / 1_000)).toFixed(2)} files/s`;
};

const formatSuccessMessage = (
    settings: NormalizedProgressSettings,
    stats: LintSummaryStats,
): string => {
    const title = `${formatSummaryLabel()} ${pc.bold(pc.green(settings.successMark))} ${pc.green(settings.successMessage)}`;

    if (!settings.detailedSuccess) {
        return title;
    }

    return [
        title,
        `${pc.dim("  Duration:")} ${pc.yellow(formatDuration(stats.durationMs))}`,
        `${pc.dim("  Files linted:")} ${pc.yellow(String(stats.filesLinted))}`,
        `${pc.dim("  Throughput:")} ${pc.yellow(formatThroughput(stats.durationMs, stats.filesLinted))}`,
        `${pc.dim("  Exit code:")} ${pc.green(String(stats.exitCode))}`,
        `${pc.dim("  Problems:")} ${pc.green("0")}`,
    ].join("\n");
};

const formatFailureMessage = (
    settings: NormalizedProgressSettings,
    stats: LintSummaryStats,
): string => {
    const title = `${formatSummaryLabel()} ${pc.bold(pc.red(settings.failureMark))} ${pc.red("Lint failed.")}`;

    if (!settings.detailedSuccess) {
        return title;
    }

    return [
        title,
        `${pc.dim("  Duration:")} ${pc.yellow(formatDuration(stats.durationMs))}`,
        `${pc.dim("  Files linted:")} ${pc.yellow(String(stats.filesLinted))}`,
        `${pc.dim("  Throughput:")} ${pc.yellow(formatThroughput(stats.durationMs, stats.filesLinted))}`,
        `${pc.dim("  Exit code:")} ${pc.red(String(stats.exitCode))}`,
        `${pc.dim("  Problems:")} ${pc.yellow("1+")}`,
    ].join("\n");
};

const bindExitHandler = (): void => {
    if (isExitHandlerBound) {
        return;
    }

    process.once("exit", (exitCode) => {
        if (lastVisibleSettings.hide !== true) {
            const now = Date.now();
            const durationMs = lintStartedAt > 0 ? Math.max(0, now - lintStartedAt) : 0;
            const summaryStats: LintSummaryStats = {
                durationMs,
                filesLinted: lintedFileCount,
                exitCode,
            };

            if (exitCode === 0) {
                spinner.success({
                    mark: lastVisibleSettings.prefixMark,
                    text: formatSuccessMessage(lastVisibleSettings, summaryStats),
                });
            } else {
                spinner.error({
                    mark: lastVisibleSettings.prefixMark,
                    text: formatFailureMessage(lastVisibleSettings, summaryStats),
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

    const settings = normalizeSettings(
        (context.settings as { progress?: unknown } | undefined)?.progress,
    );

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
        const relativeFilePath = toRelativeFilePath(context.filename, context.cwd);
        spinner.update({ text: formatFileProgress(relativeFilePath, settings) });
    }

    spinner.spin();

    return {};
};

const progressRule: Rule.RuleModule = {
    meta: {
        type: "suggestion",
        docs: {
            description: "enforce displaying lint progress in CLI output.",
            recommended: true,
            url: "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2#readme",
        },
        schema: [],
        messages: {
            status: "Display lint progress in CLI output.",
        },
    },
    create,
};

export const internals: ProgressInternals = {
    defaultSettings,
    normalizeSettings,
    resolveSpinnerStyle,
    toRelativeFilePath,
    formatDuration,
    formatThroughput,
    formatFileProgress,
    formatGenericProgress,
    formatSuccessMessage,
    formatFailureMessage,
};

export default progressRule;
