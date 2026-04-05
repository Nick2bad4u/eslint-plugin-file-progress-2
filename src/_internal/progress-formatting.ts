import path from "node:path";
import pc from "picocolors";
import { arrayAt, arrayJoin, isEmpty, stringSplit } from "ts-extras";

import type { NormalizedProgressSettings } from "./progress-options.js";

export interface LintSummaryStats {
    readonly durationMs: number;
    readonly exitCode: number;
    readonly filesLinted: number;
}

const formatPluginPrefix = (settings: NormalizedProgressSettings): string =>
    `${pc.bold(pc.cyan("eslint-plugin-file-progress-2"))} ${pc.dim(settings.prefixMark)}`;

const formatSummaryLabel = (settings: NormalizedProgressSettings): string => {
    if (settings.hidePrefix) {
        return "";
    }

    return `${pc.bold(pc.cyan("eslint-plugin-file-progress-2"))}${pc.dim(":")}`;
};

export const toRelativeFilePath = (filename: string, cwd: string): string => {
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
    pathFormat: NormalizedProgressSettings["pathFormat"]
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

    if (pathFormat === "basename") {
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

export const formatFileProgress = (
    relativeFilePath: string,
    settings: NormalizedProgressSettings
): string => {
    const formattedPath = formatPathSegments(
        relativeFilePath,
        settings.pathFormat
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

export const formatGenericProgress = (
    settings: NormalizedProgressSettings
): string => {
    if (settings.hidePrefix) {
        return pc.dim("linting project files...");
    }

    return `${formatPluginPrefix(settings)} ${pc.dim("linting project files...")}`;
};

export const formatDuration = (durationMs: number): string => {
    if (durationMs < 1000) {
        return `${durationMs}ms`;
    }

    return `${(durationMs / 1000).toFixed(2)}s`;
};

export const formatThroughput = (
    durationMs: number,
    filesLinted: number
): string => {
    if (filesLinted <= 0) {
        return "0.00 files/s";
    }

    if (durationMs <= 0) {
        return `${filesLinted.toFixed(2)} files/s`;
    }

    return `${(filesLinted / (durationMs / 1000)).toFixed(2)} files/s`;
};

export const formatSuccessMessage = (
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

export const formatFailureMessage = (
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
